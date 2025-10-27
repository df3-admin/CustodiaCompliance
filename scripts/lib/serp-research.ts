import axios from 'axios';
import GeminiClient from './gemini-client.js';

export interface SERPData {
  keyword: string;
  searchVolume: number;
  competition: 'low' | 'medium' | 'high';
  cpc: number;
  relatedKeywords: string[];
  questions: string[];
  topCompetitors: CompetitorData[];
  featuredSnippet?: FeaturedSnippet;
}

export interface CompetitorData {
  url: string;
  title: string;
  position: number;
  domain: string;
  snippet: string;
}

export interface FeaturedSnippet {
  type: 'paragraph' | 'list' | 'table';
  content: string;
  source: string;
  url: string;
}

export class SerpResearch {
  private apiKey: string;
  private gemini: GeminiClient;

  constructor() {
    this.apiKey = process.env.SERPAPI_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ SERPAPI_KEY not found - using Gemini fallback');
    }
    this.gemini = new GeminiClient();
  }

  async getKeywordData(keyword: string, location: string = 'United States'): Promise<SERPData> {
    // Try SerpAPI first if available
    if (this.apiKey) {
      try {
        return await this.getSerpAPIData(keyword, location);
      } catch (error) {
        console.warn('⚠️ SerpAPI failed, using Gemini fallback');
        // Fall through to Gemini
      }
    }

    // Use Gemini as fallback
    return await this.getGeminiFallbackData(keyword);
  }

  private async getSerpAPIData(keyword: string, location: string): Promise<SERPData> {
    console.log(`🔍 Fetching SERP data for: ${keyword}`);

    // Get Google Search results
    const searchResults = await this.searchKeyword(keyword, location);
    
    // Get keyword metrics
    const metrics = await this.getKeywordMetrics(keyword);
    
    // Get related questions
    const questions = await this.getRelatedQuestions(keyword);
    
    // Get related keywords
    const relatedKeywords = await this.getRelatedKeywords(keyword);

    const serpData: SERPData = {
      keyword,
      searchVolume: metrics.searchVolume,
      competition: metrics.competition,
      cpc: metrics.cpc,
      relatedKeywords,
      questions,
      topCompetitors: searchResults.results,
      featuredSnippet: searchResults.featuredSnippet
    };

    console.log(`✅ SERP data retrieved:`);
    console.log(`   - Search Volume: ${metrics.searchVolume.toLocaleString()}`);
    console.log(`   - Competition: ${metrics.competition}`);
    console.log(`   - Competitors found: ${searchResults.results.length}`);
    console.log(`   - Questions found: ${questions.length}`);

    return serpData;
  }

  private async getGeminiFallbackData(keyword: string): Promise<SERPData> {
    console.log(`🔍 Using Gemini to research: ${keyword}`);
    
    const prompt = `
Research the keyword "${keyword}" for SEO and content strategy.

Provide JSON with:
{
  "searchVolume": number (estimate 1k-100k based on keyword),
  "competition": "low" | "medium" | "high",
  "cpc": number (estimate $5-25 for compliance keywords),
  "relatedKeywords": ["keyword 1", "keyword 2", ...],
  "questions": ["question 1", "question 2", ...]
}

Focus on:
- SOC 2, compliance, security frameworks
- Realistic estimates based on keyword difficulty
- Buyer intent keywords (cost, tools, pricing, consultant)
- Related compliance topics

Output only valid JSON, no markdown formatting.
`;

    try {
      const response = await this.gemini.generateContent(prompt, { temperature: 0.3 });
      const data = JSON.parse(response);
      
      return {
        keyword,
        searchVolume: data.searchVolume || 5000,
        competition: data.competition || 'medium',
        cpc: data.cpc || 10,
        relatedKeywords: data.relatedKeywords || this.generateDefaultKeywords(keyword),
        questions: data.questions || this.generateDefaultQuestions(keyword),
        topCompetitors: [],
        featuredSnippet: undefined
      };
    } catch (error) {
      console.error('❌ Gemini fallback failed, using hardcoded data');
      return this.getFallbackData(keyword);
    }
  }

  private generateDefaultKeywords(keyword: string): string[] {
    return [
      `${keyword} checklist`,
      `${keyword} cost`,
      `${keyword} timeline`,
      `${keyword} requirements`,
      `${keyword} implementation`
    ];
  }

  private generateDefaultQuestions(keyword: string): string[] {
    return [
      `What is ${keyword}?`,
      `How much does ${keyword} cost?`,
      `How long does ${keyword} take?`
    ];
  }

  private async searchKeyword(keyword: string, location: string) {
    const response = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine: 'google',
        q: keyword,
        api_key: this.apiKey,
        location: location,
        num: 10,
        hl: 'en',
        gl: 'us'
      }
    });

    const results: CompetitorData[] = (response.data.organic_results || [])
      .slice(0, 10)
      .map((result: any, index: number) => ({
        url: result.link,
        title: result.title,
        position: index + 1,
        domain: new URL(result.link).hostname,
        snippet: result.snippet
      }));

    let featuredSnippet: FeaturedSnippet | undefined;
    if (response.data.answer_box) {
      featuredSnippet = {
        type: 'paragraph',
        content: response.data.answer_box.snippet || '',
        source: response.data.answer_box.link || '',
        url: response.data.answer_box.link || ''
      };
    } else if (response.data.featured_snippet) {
      featuredSnippet = {
        type: 'paragraph',
        content: response.data.featured_snippet.snippet || '',
        source: response.data.featured_snippet.link || '',
        url: response.data.featured_snippet.link || ''
      };
    }

    return { results, featuredSnippet };
  }

  private async getKeywordMetrics(keyword: string) {
    // SerpAPI doesn't have a direct keyword metrics endpoint in the free tier
    // So we'll estimate based on search results position data
    const response = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine: 'google',
        q: keyword,
        api_key: this.apiKey,
        num: 10
      }
    });

    const resultCount = response.data.search_information?.total_results || 0;
    
    // Estimate search volume based on result count
    let searchVolume = 1000; // Default fallback
    if (resultCount > 1000000000) searchVolume = 100000;
    else if (resultCount > 100000000) searchVolume = 50000;
    else if (resultCount > 10000000) searchVolume = 10000;
    else if (resultCount > 1000000) searchVolume = 5000;
    else if (resultCount > 100000) searchVolume = 1000;

    // Estimate competition
    let competition: 'low' | 'medium' | 'high' = 'medium';
    if (resultCount > 500000000) competition = 'high';
    else if (resultCount < 50000000) competition = 'low';

    // Estimate CPC (Cost Per Click) in USD
    const cpc = keyword.includes('cost') || keyword.includes('price') ? 15 : 5;

    return { searchVolume, competition, cpc };
  }

  private async getRelatedQuestions(keyword: string): Promise<string[]> {
    try {
      const response = await axios.get('https://serpapi.com/search.json', {
        params: {
          engine: 'google',
          q: keyword,
          api_key: this.apiKey,
          num: 1
        }
      });

      const questions = response.data.related_questions || [];
      return questions.map((q: any) => q.question).slice(0, 10);
    } catch (error) {
      console.warn('⚠️ Could not fetch related questions');
      return [];
    }
  }

  private async getRelatedKeywords(keyword: string): Promise<string[]> {
    try {
      const response = await axios.get('https://serpapi.com/search.json', {
        params: {
          engine: 'google',
          q: keyword,
          api_key: this.apiKey,
          num: 1
        }
      });

      const relatedKeywords = response.data.related_queries || [];
      return relatedKeywords
        .map((q: any) => q.query)
        .filter(Boolean)
        .slice(0, 10);
    } catch (error) {
      console.warn('⚠️ Could not fetch related keywords');
      return [];
    }
  }

  async analyzeCompetitorContent(url: string): Promise<any> {
    console.log(`📊 Analyzing competitor: ${url}`);
    
    if (!this.apiKey) {
      return this.getDefaultCompetitorAnalysis(url);
    }

    try {
      // Try to get the URL's ranking position for related keywords
      const response = await axios.get('https://serpapi.com/search.json', {
        params: {
          engine: 'google',
          q: `site:${new URL(url).hostname}`,
          api_key: this.apiKey,
          num: 10
        }
      });

      const results = response.data.organic_results || [];
      const ranking = results.findIndex((r: any) => r.link === url) + 1;

      return {
        url,
        domain: new URL(url).hostname,
        hasRanking: ranking > 0,
        topPosition: ranking,
        estimatedTraffic: ranking > 0 && ranking <= 3 ? 500 : 50
      };
    } catch (error) {
      console.warn('⚠️ Could not analyze competitor');
      return this.getDefaultCompetitorAnalysis(url);
    }
  }

  private getDefaultCompetitorAnalysis(url: string) {
    return {
      url,
      domain: new URL(url).hostname,
      hasRanking: false,
      topPosition: 0,
      estimatedTraffic: 50
    };
  }

  private getFallbackData(keyword: string): SERPData {
    console.log('⚠️ Using fallback SERP data (no API key)');
    return {
      keyword,
      searchVolume: 5000,
      competition: 'medium',
      cpc: 5,
      relatedKeywords: [
        `${keyword} checklist`,
        `${keyword} cost`,
        `${keyword} timeline`,
        `${keyword} requirements`,
        `${keyword} implementation`
      ],
      questions: [
        `What is ${keyword}?`,
        `How much does ${keyword} cost?`,
        `How long does ${keyword} take?`
      ],
      topCompetitors: []
    };
  }

  async getTrendingTopics(category: string): Promise<string[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      // Search for trending topics in the category
      const response = await axios.get('https://serpapi.com/search.json', {
        params: {
          engine: 'google',
          q: `trending ${category} 2025`,
          api_key: this.apiKey,
          num: 10
        }
      });

      const results = response.data.organic_results || [];
      return results.slice(0, 10).map((r: any) => r.title);
    } catch (error) {
      console.warn('⚠️ Could not fetch trending topics');
      return [];
    }
  }
}

export default SerpResearch;
