import axios from 'axios';

export interface RedditInsight {
  question: string;
  subreddit: string;
  upvotes: number;
  comments: number;
  url: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface RedditTopic {
  topic: string;
  questions: RedditInsight[];
  painPoints: string[];
  solutionRequests: string[];
  popularThreads: number;
}

export class RedditInsights {
  private userAgent: string;

  constructor() {
    this.userAgent = 'CustodiaCompliance-Bot/1.0';
  }

  async searchReddit(keyword: string, limit: number = 25): Promise<RedditInsight[]> {
    try {
      console.log(`🔍 Searching Reddit for: ${keyword}`);
      
      // Use Reddit's JSON API (no auth required)
      const response = await axios.get('https://www.reddit.com/search.json', {
        params: {
          q: keyword,
          limit: limit,
          sort: 'relevance',
          t: 'all' // All time
        },
        headers: {
          'User-Agent': this.userAgent
        }
      });

      const posts = response.data.data.children || [];
      
      const insights: RedditInsight[] = posts
        .map((post: any) => {
          const data = post.data;
          return {
            question: data.title,
            subreddit: data.subreddit,
            upvotes: data.ups || 0,
            comments: data.num_comments || 0,
            url: `https://reddit.com${data.permalink}`,
            sentiment: this.analyzeSentiment(data.title + ' ' + (data.selftext || ''))
          };
        })
        .filter((insight: RedditInsight) => 
          insight.upvotes > 0 || insight.comments > 2 // Only meaningful discussion
        );

      console.log(`✅ Found ${insights.length} relevant Reddit discussions`);
      return insights;
    } catch (error) {
      console.error('❌ Error searching Reddit:', error);
      return [];
    }
  }

  async getTopicInsights(keyword: string): Promise<RedditTopic> {
    const questions = await this.searchReddit(keyword, 30);
    
    // Extract pain points from post titles
    const painPoints = questions
      .filter(q => q.question.toLowerCase().includes('problem') || 
                   q.question.toLowerCase().includes('issue') ||
                   q.question.toLowerCase().includes('difficulty') ||
                   q.question.toLowerCase().includes('struggle'))
      .map(q => q.question)
      .slice(0, 10);

    // Extract solution requests
    const solutionRequests = questions
      .filter(q => q.question.toLowerCase().includes('help') || 
                   q.question.toLowerCase().includes('how to') ||
                   q.question.toLowerCase().includes('guide') ||
                   q.question.toLowerCase().includes('recommendation'))
      .map(q => q.question)
      .slice(0, 10);

    return {
      topic: keyword,
      questions: questions.slice(0, 20),
      painPoints,
      solutionRequests,
      popularThreads: questions.length
    };
  }

  async getSubredditTopPosts(subreddit: string, limit: number = 25): Promise<RedditInsight[]> {
    try {
      const response = await axios.get(`https://www.reddit.com/r/${subreddit}/top.json`, {
        params: {
          limit: limit,
          t: 'month' // Last month's top posts
        },
        headers: {
          'User-Agent': this.userAgent
        }
      });

      const posts = response.data.data.children || [];
      
      return posts.map((post: any) => {
        const data = post.data;
        return {
          question: data.title,
          subreddit: data.subreddit,
          upvotes: data.ups || 0,
          comments: data.num_comments || 0,
          url: `https://reddit.com${data.permalink}`,
          sentiment: this.analyzeSentiment(data.title)
        };
      });
    } catch (error) {
      console.error(`❌ Error fetching from r/${subreddit}:`, error);
      return [];
    }
  }

  async searchComplianceQuestions(): Promise<RedditInsight[]> {
    const keywords = [
      'SOC 2',
      'compliance audit',
      'HIPAA compliance',
      'security compliance',
      'certification'
    ];

    const allInsights: RedditInsight[] = [];
    
    for (const keyword of keywords) {
      const insights = await this.searchReddit(keyword, 10);
      allInsights.push(...insights);
      // Be nice to Reddit's API
      await this.delay(1000);
    }

    // Sort by upvotes + comments
    return allInsights
      .sort((a, b) => (b.upvotes + b.comments) - (a.upvotes + a.comments))
      .slice(0, 25);
  }

  extractPopularQuestions(keyword: string): string[] {
    // This would be filled with real data from Reddit search
    // For now, return common patterns based on the keyword
    return [
      `How do I get ${keyword}?`,
      `What does ${keyword} cost?`,
      `How long does ${keyword} take?`,
      `Do I need ${keyword}?`,
      `What's the difference between ${keyword} and...?`
    ];
  }

  private analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const lowerText = text.toLowerCase();
    const negativeWords = ['problem', 'issue', 'failed', 'difficult', 'struggling', 'help'];
    const positiveWords = ['solved', 'success', 'easy', 'great', 'helped', 'works'];
    
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    
    if (negativeCount > positiveCount) return 'negative';
    if (positiveCount > negativeCount) return 'positive';
    return 'neutral';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get trending compliance topics from relevant subreddits
  async getTrendingComplianceTopics(): Promise<RedditTopic[]> {
    const subreddits = [
      'cybersecurity',
      'sysadmin',
      'ISO27001',
      'compliance',
      'infosec'
    ];

    const topics: RedditTopic[] = [];

    for (const subreddit of subreddits) {
      try {
        const posts = await this.getSubredditTopPosts(subreddit, 10);
        
        if (posts.length > 0) {
          topics.push({
            topic: subreddit,
            questions: posts,
            painPoints: posts
              .filter(p => p.sentiment === 'negative')
              .map(p => p.question)
              .slice(0, 5),
            solutionRequests: posts
              .filter(p => p.comments > 5)
              .map(p => p.question)
              .slice(0, 5),
            popularThreads: posts.length
          });
        }
        
        await this.delay(1000); // Rate limiting
      } catch (error) {
        console.warn(`⚠️ Could not fetch from r/${subreddit}`);
      }
    }

    return topics;
  }
}

export default RedditInsights;
