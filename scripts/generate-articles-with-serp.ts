import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import GeminiClient from './lib/gemini-client.js';
import SerpResearch from './lib/serp-research.js';
import EnhancedKeywordResearch from './lib/enhanced-keyword-research.js';
import RedditInsights from './lib/reddit-insights.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Strategy phases based on 10K_TRAFFIC_STRATEGY.md
const STRATEGY_PHASES = {
  PHASE_1: {
    name: 'Foundation (Months 1-3)',
    targetTraffic: 2000,
    articles: [1, 2, 3, 4, 5], // Priority 1-5: SOC 2 foundational articles
    tier: 'Tier 1',
    description: 'Focus on Tier 1 keywords (high volume, high intent)'
  },
  PHASE_2: {
    name: 'Expansion (Months 4-6)',
    targetTraffic: 4000,
    articles: [6, 7, 8, 9, 10], // Priority 6-10: Additional SOC 2 and ISO 27001
    tier: 'Tier 2',
    description: 'Target Tier 2 keywords and long-tail variations'
  },
  PHASE_3: {
    name: 'Scale (Months 7-9)',
    targetTraffic: 7000,
    articles: [11, 12, 13, 14, 15, 16], // Priority 11-16: HIPAA, PCI DSS, GDPR
    tier: 'Tier 3',
    description: 'Industry-specific and comparison articles'
  },
  PHASE_4: {
    name: 'Domination (Months 10-12)',
    targetTraffic: 10000,
    articles: [17, 18, 19, 20, 21], // Priority 17-21: Advanced/Niche topics
    tier: 'Tier 4',
    description: 'High-difficulty, high-value keywords'
  }
};

// Load high-value topics
function loadTopicsFromConfig(): any[] {
  const configPath = path.resolve(__dirname, '../config/high-value-topics.json');
  const configData = readFileSync(configPath, 'utf-8');
  const config = JSON.parse(configData);
  return config.highValueTopics;
}

// Get articles for a specific phase
function getArticlesForPhase(phase: keyof typeof STRATEGY_PHASES) {
  const topics = loadTopicsFromConfig();
  const phaseConfig = STRATEGY_PHASES[phase];
  
  return phaseConfig.articles.map(priority => {
    const topic = topics.find((t: any) => t.priority === priority);
    if (!topic) return null;
    
    return {
      priority: topic.priority,
      topic: topic.topic,
      category: topic.primaryKeyword.split(' ')[0], // Extract category from keyword
      primaryKeyword: topic.primaryKeyword,
      secondaryKeywords: topic.secondaryKeywords,
      searchVolume: topic.searchVolume,
      competitionLevel: topic.competitionLevel,
      buyerIntent: topic.buyerIntent,
      expectedTraffic: topic.expectedTraffic,
      competitorUrls: topic.competitorUrls,
      phase: phaseConfig.name,
      tier: phaseConfig.tier
    };
  }).filter(Boolean);
}

class EnhancedArticleGenerator {
  private gemini: GeminiClient;
  private serp: SerpResearch;
  private keywordResearch: EnhancedKeywordResearch;
  private reddit: RedditInsights;

  constructor() {
    this.gemini = new GeminiClient();
    this.serp = new SerpResearch();
    this.keywordResearch = new EnhancedKeywordResearch();
    this.reddit = new RedditInsights();
  }

  async generateArticle(articleConfig: any) {
    console.log(`\n🚀 Generating article: ${articleConfig.topic}`);
    console.log(`🎯 Primary keyword: ${articleConfig.primaryKeyword}\n`);

    try {
      // Step 1: Get real SERP data from SerpAPI
      console.log('📊 Step 1: Gathering real SERP data...');
      const serpData = await this.serp.getKeywordData(articleConfig.primaryKeyword);
      
      console.log(`   ✅ Search Volume: ${serpData.searchVolume.toLocaleString()}/month`);
      console.log(`   ✅ Competition: ${serpData.competition}`);
      console.log(`   ✅ Competitors found: ${serpData.topCompetitors.length}`);
      console.log(`   ✅ Related questions: ${serpData.questions.length}`);
      
      // Step 2: Analyze keyword opportunity
      console.log('\n🔍 Step 2: Analyzing keyword opportunity...');
      const keywordOpportunity = await this.keywordResearch.analyzeKeywordOpportunity(
        articleConfig.primaryKeyword,
        articleConfig.competitorUrls,
        articleConfig.category
      );
      
      console.log(`   ✅ Opportunity Score: ${keywordOpportunity.opportunityScore}/100`);
      console.log(`   ✅ Difficulty Score: ${keywordOpportunity.difficultyScore}/100`);
      
      // Step 3: Get Reddit insights (REAL user questions!)
      console.log('\n💬 Step 3: Gathering Reddit community insights...');
      const redditInsights = await this.reddit.getTopicInsights(articleConfig.primaryKeyword);
      
      console.log(`   ✅ Reddit questions found: ${redditInsights.questions.length}`);
      console.log(`   ✅ Pain points identified: ${redditInsights.painPoints.length}`);
      console.log(`   ✅ Solution requests: ${redditInsights.solutionRequests.length}`);
      
      // Step 4: Generate enhanced prompt with REAL DATA from both APIs
      console.log('\n✍️ Step 4: Generating article content with all insights...');
      const enhancedPrompt = this.buildEnhancedPrompt(articleConfig, serpData, keywordOpportunity, redditInsights);
      
      const content = await this.gemini.generateContent(enhancedPrompt, { 
        temperature: 0.8,
        maxTokens: 16384 
      });
      
      console.log(`   ✅ Content generated: ${content.length} characters`);
      
      // Step 4: Parse and structure content
      const contentBlocks = this.parseContentToBlocks(content);
      
      // Step 5: Generate metadata
      const slug = articleConfig.topic.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      const articleData = {
        slug,
        title: articleConfig.topic,
        author: 'Custodia Team',
        authorAvatar: '/images/authors/custodia-team.jpg',
        category: articleConfig.category,
        excerpt: this.generateExcerpt(content, articleConfig.primaryKeyword),
        readTime: this.calculateReadTime(content),
        tags: this.generateTags(articleConfig.primaryKeyword, articleConfig.secondaryKeywords),
        featured: true,
        image: `/images/blog/${slug}.png`,
        imageAlt: articleConfig.topic,
        metaTitle: articleConfig.topic.length > 60 ? articleConfig.topic.substring(0, 60) : articleConfig.topic,
        metaDescription: this.generateMetaDescription(content, articleConfig.primaryKeyword),
        focusKeyword: articleConfig.primaryKeyword,
        keywords: [...articleConfig.secondaryKeywords, ...serpData.relatedKeywords.slice(0, 5)],
        schema: this.generateSchema(articleConfig, serpData),
        internalLinks: [],
        externalLinks: serpData.topCompetitors.map(c => c.url).slice(0, 10),
        content: contentBlocks
      };
      
      console.log(`\n📊 Article Summary:`);
      console.log(`   - Word Count: ${content.split(' ').length} words`);
      console.log(`   - Content Blocks: ${contentBlocks.length}`);
      console.log(`   - Google Questions Addressed: ${serpData.questions.length}`);
      console.log(`   - Reddit Questions Addressed: ${redditInsights.questions.length}`);
      console.log(`   - Pain Points Solved: ${redditInsights.painPoints.length}`);
      console.log(`   - Related Keywords: ${serpData.relatedKeywords.length}`);
      
      return articleData;
      
    } catch (error) {
      console.error(`❌ Error generating article:`, error);
      throw error;
    }
  }

  private buildEnhancedPrompt(articleConfig: any, serpData: any, keywordOpportunity: any, redditInsights: any): string {
    return `You are a senior compliance consultant with 15+ years of experience. Write a comprehensive article targeting "${articleConfig.primaryKeyword}".

=== SEO DATA FROM GOOGLE (SerpAPI) ===
- Search Volume: ${serpData.searchVolume.toLocaleString()} searches/month
- Competition Level: ${serpData.competition}
- Related Questions: ${serpData.questions.slice(0, 10).map((q: string) => `"${q}"`).join(', ')}
- Related Keywords: ${serpData.relatedKeywords.slice(0, 10).join(', ')}

TOP COMPETITORS (actual ranking pages):
${serpData.topCompetitors.slice(0, 5).map((c: any, i: number) => `${i+1}. ${c.title} (${c.domain})`).join('\n')}

${serpData.featuredSnippet ? `CURRENT FEATURED SNIPPET:
${serpData.featuredSnippet.content}

Our goal: Create superior content that replaces this featured snippet.\n` : ''}

=== REAL USER INSIGHTS FROM REDDIT COMMUNITIES ===
REAL Questions People Ask (not just Google searches):
${redditInsights.questions.slice(0, 10).map((q: any, i: number) => `${i+1}. ${q.question} (${q.upvotes} upvotes, ${q.comments} comments from r/${q.subreddit})`).join('\n')}

PAIN POINTS Identified from Discussions:
${redditInsights.painPoints.slice(0, 5).map((pp: string, i: number) => `${i+1}. ${pp}`).join('\n')}

SOLUTION REQUESTS (What People Need Help With):
${redditInsights.solutionRequests.slice(0, 5).map((sr: string, i: number) => `${i+1}. ${sr}`).join('\n')}

=== CONTENT REQUIREMENTS ===

1. HOOK INTRODUCTION (400 words)
   - Start with a real pain point from Reddit: ${redditInsights.painPoints[0]}
   - Use surprising statistic or insight
   - Clear value proposition

2. COMPREHENSIVE BODY (10,000+ words)
   - Address ALL Reddit questions: ${redditInsights.questions.slice(0, 8).map((q: any) => q.question).join(', ')}
   - Answer ALL Google questions: ${serpData.questions.slice(0, 5).join(', ')}
   - Include real examples and case studies
   - Address competitor gaps
   - Solve pain points from Reddit: ${redditInsights.painPoints.slice(0, 3).join(', ')}
   - Use related keywords naturally

3. PRACTICAL TROUBLESHOOTING SECTION (1,500 words)
   - Address common issues from Reddit pain points
   - Real-world solutions from community discussions
   - Step-by-step fixes for top 5 problems

4. FAQ SECTION (2,000 words)
   - Answer all Reddit questions with practical solutions
   - Answer all Google questions for SEO
   - Optimize for featured snippet opportunities
   - Use schema markup format

5. CONCLUSION (300 words)
   - Key takeaways
   - Clear call-to-action

TONE & STYLE:
- Expert but approachable
- Use first-person experience ("I've seen", "In my experience")
- Practical and actionable (address real Reddit struggles)
- Conversational where appropriate
- Reference real community pain points

OUTPUT: Markdown format with proper heading hierarchy (##, ###).`;
  }

  private parseContentToBlocks(content: string) {
    const blocks: any[] = [];
    const lines = content.split('\n').filter(line => line.trim());
    
    let currentBlock: any = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('## ')) {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = {
          type: 'heading',
          level: 2,
          content: trimmedLine.substring(3)
        };
      } else if (trimmedLine.startsWith('### ')) {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = {
          type: 'heading',
          level: 3,
          content: trimmedLine.substring(4)
        };
      } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        if (currentBlock && currentBlock.type === 'list') {
          currentBlock.items.push(trimmedLine.substring(2));
        } else {
          if (currentBlock) blocks.push(currentBlock);
          currentBlock = {
            type: 'list',
            items: [trimmedLine.substring(2)]
          };
        }
      } else if (trimmedLine.length > 0) {
        if (currentBlock && currentBlock.type === 'paragraph') {
          currentBlock.content += ' ' + trimmedLine;
        } else {
          if (currentBlock) blocks.push(currentBlock);
          currentBlock = {
            type: 'paragraph',
            content: trimmedLine
          };
        }
      }
    }
    
    if (currentBlock) blocks.push(currentBlock);
    return blocks;
  }

  private generateExcerpt(content: string, primaryKeyword: string): string {
    const sentences = content.split('.').slice(0, 3);
    let excerpt = sentences.join('.') + '.';
    
    if (!excerpt.toLowerCase().includes(primaryKeyword.toLowerCase())) {
      excerpt = `Complete guide to ${primaryKeyword}. ${excerpt}`;
    }
    
    return excerpt.substring(0, 200);
  }

  private calculateReadTime(content: string): string {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  }

  private generateTags(primaryKeyword: string, secondaryKeywords: string[]): string[] {
    const baseTags = ['Compliance', 'Security', 'Audit'];
    const keywordTags = [primaryKeyword, ...secondaryKeywords.slice(0, 4)];
    return [...new Set([...baseTags, ...keywordTags])];
  }

  private generateMetaDescription(content: string, primaryKeyword: string): string {
    const sentences = content.split('.').slice(0, 2);
    let description = sentences.join('.') + '.';
    
    if (!description.toLowerCase().includes(primaryKeyword.toLowerCase())) {
      description = `Complete guide to ${primaryKeyword}. ${description}`;
    }
    
    return description.substring(0, 155);
  }

  private generateSchema(articleConfig: any, serpData: any) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: articleConfig.topic,
      description: `Complete guide to ${articleConfig.primaryKeyword}`,
      author: {
        '@type': 'Organization',
        name: 'Custodia Team'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Custodia, LLC'
      },
      keywords: serpData.relatedKeywords.slice(0, 10).join(', ')
    };
  }

  async deployArticle(articleData: any) {
    const client = await pool.connect();

    try {
      await client.query('DELETE FROM articles WHERE slug = $1', [articleData.slug]);
      
      const insertResult = await client.query(
        `INSERT INTO articles (
          slug, title, author, author_avatar, image, image_alt, category, tags,
          excerpt, content, read_time, featured, seo, related_articles,
          meta_title, meta_description, focus_keyword, keywords, schema_data, internal_links, external_links
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        RETURNING id`,
        [
          articleData.slug, articleData.title, articleData.author, articleData.authorAvatar,
          articleData.image, articleData.imageAlt, articleData.category, articleData.tags,
          articleData.excerpt, JSON.stringify(articleData.content), articleData.readTime,
          articleData.featured, null, [], articleData.metaTitle, articleData.metaDescription,
          articleData.focusKeyword, articleData.keywords, JSON.stringify(articleData.schema),
          articleData.internalLinks, articleData.externalLinks
        ]
      );

      console.log(`\n✅ Article deployed! ID: ${insertResult.rows[0].id}`);
      return insertResult.rows[0].id;
    } finally {
      client.release();
    }
  }
}

// Run the generator
async function main() {
  const args = process.argv.slice(2);
  const phaseArg = args.find(arg => arg.startsWith('--phase='));
  const articleArg = args.find(arg => arg.startsWith('--article='));
  const allPhases = args.includes('--all');

  console.log('🚀 ENHANCED ARTICLE GENERATOR');
  console.log('Gemini AI + SerpAPI + Reddit Insights');
  console.log('10K Traffic Strategy Implementation');
  console.log('==========================================\n');

  const generator = new EnhancedArticleGenerator();

  // Determine which phases/articles to generate
  let phasesToProcess: string[] = [];
  
  if (allPhases || args.length === 0) {
    // Generate all phases
    phasesToProcess = Object.keys(STRATEGY_PHASES);
    console.log('📋 Generating ALL articles for 10K Traffic Strategy\n');
  } else if (phaseArg) {
    // Generate specific phase
    const phaseName = phaseArg.split('=')[1];
    const phaseKey = Object.keys(STRATEGY_PHASES).find(
      key => STRATEGY_PHASES[key as keyof typeof STRATEGY_PHASES].name.toLowerCase().includes(phaseName.toLowerCase())
    );
    if (phaseKey) {
      phasesToProcess = [phaseKey];
      console.log(`📋 Generating articles for: ${STRATEGY_PHASES[phaseKey as keyof typeof STRATEGY_PHASES].name}\n`);
    } else {
      console.error(`❌ Phase not found: ${phaseName}`);
      process.exit(1);
    }
  } else if (articleArg) {
    // Generate specific article
    const articlePriority = parseInt(articleArg.split('=')[1]);
    const topic = loadTopicsFromConfig().find((t: any) => t.priority === articlePriority);
    if (!topic) {
      console.error(`❌ Article not found: ${articlePriority}`);
      process.exit(1);
    }
    
    console.log(`📝 Generating single article: ${topic.topic}\n`);
    try {
      const articleData = await generator.generateArticle({
        topic: topic.topic,
        category: topic.primaryKeyword.split(' ')[0],
        primaryKeyword: topic.primaryKeyword,
        secondaryKeywords: topic.secondaryKeywords,
        competitorUrls: topic.competitorUrls
      });
      await generator.deployArticle(articleData);
      console.log(`\n🎉 Successfully generated and deployed: ${topic.topic}`);
      console.log(`🌐 View at: https://custodiacompliance.com/blog/${articleData.slug}\n`);
    } catch (error) {
      console.error(`❌ Failed to generate article:`, error);
    }
    await pool.end();
    return;
  }

  // Generate articles for selected phases
  for (const phaseKey of phasesToProcess) {
    const phase = STRATEGY_PHASES[phaseKey as keyof typeof STRATEGY_PHASES];
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📊 ${phase.name}`);
    console.log(`🎯 Target Traffic: ${phase.targetTraffic} monthly visitors`);
    console.log(`📈 Tier: ${phase.tier}`);
    console.log(`📝 ${phase.description}`);
    console.log(`${'='.repeat(50)}\n`);

    const articlesForPhase = getArticlesForPhase(phaseKey as keyof typeof STRATEGY_PHASES);
    
    if (articlesForPhase.length === 0) {
      console.log('No articles found for this phase.');
      continue;
    }

    console.log(`Generating ${articlesForPhase.length} articles...\n`);

    for (const article of articlesForPhase) {
      if (!article) continue;
      
      try {
        const articleData = await generator.generateArticle(article);
        await generator.deployArticle(articleData);
        
        console.log(`\n✅ Successfully generated and deployed: ${article.topic}`);
        console.log(`   Expected Traffic: ${article.expectedTraffic}/month`);
        console.log(`   URL: https://custodiacompliance.com/blog/${articleData.slug}\n`);
        
        // Small delay to avoid API rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ Failed to generate article:`, error);
      }
    }

    console.log(`\n✅ Phase Complete: ${phase.name}`);
    console.log(`   Articles Generated: ${articlesForPhase.length}/${articlesForPhase.length}`);
    console.log(`   Expected Traffic: ${phase.targetTraffic} monthly visitors\n`);
  }

  console.log('\n🎉 Article Generation Complete!');
  console.log('📊 Check your database and website for the new articles.\n');
  
  await pool.end();
}

main().catch(console.error);
