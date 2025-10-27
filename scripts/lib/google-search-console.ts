import { google } from 'googleapis';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface SearchConsoleData {
  query: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  date: string;
}

export interface PagePerformance {
  page: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
}

export interface TopQueries {
  queries: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
}

export class GoogleSearchConsole {
  private auth: any;
  private siteUrl: string;

  constructor() {
    this.siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL || 'https://custodiacompliance.com';
    
    // Try to use service account credentials
    const credentialsPath = path.resolve(__dirname, '../../credentials.json');
    
    if (fs.existsSync(credentialsPath)) {
      try {
        this.auth = new google.auth.GoogleAuth({
          keyFile: credentialsPath,
          scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
        });
        console.log('✅ Using service account credentials');
      } catch (error) {
        console.warn('⚠️ Could not load service account credentials, using fallback');
        this.auth = null;
      }
    } else {
      console.warn('⚠️ credentials.json not found, using fallback data');
      this.auth = null;
    }
  }

  /**
   * Get performance data for a specific date range
   */
  async getPerformanceData(startDate: string, endDate: string, dimensions: string[] = ['query', 'page']) {
    if (!this.auth) {
      console.warn('⚠️ Not authenticated - using fallback data');
      return this.getFallbackData();
    }

    try {
      const searchConsole = google.searchconsole('v1');
      const authClient = await this.auth.getClient();
      
      const response = await searchConsole.urlSearchAnalytics.search({
        auth: authClient,
        siteUrl: this.siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions,
          rowLimit: 25000
        }
      });

      return response.data;
    } catch (error) {
      console.warn('⚠️ Error fetching Search Console data:', error);
      return this.getFallbackData();
    }
  }

  /**
   * Get top performing queries
   */
  async getTopQueries(days: number = 30, limit: number = 100): Promise<TopQueries> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const data = await this.getPerformanceData(startDate, endDate, ['query']);

    return {
      queries: data.rows?.slice(0, limit).map((row: any) => ({
        query: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position
      })) || []
    };
  }

  /**
   * Get page performance for specific URLs
   */
  async getPagePerformance(pages: string[], days: number = 30): Promise<PagePerformance[]> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const data = await this.getPerformanceData(startDate, endDate, ['page']);

    const allPages = data.rows?.map((row: any) => ({
      page: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position
    })) || [];

    // Filter for specific pages
    return allPages.filter((page: PagePerformance) => 
      pages.some(url => page.page.includes(url))
    );
  }

  /**
   * Track specific keyword performance
   */
  async trackKeyword(keyword: string, days: number = 30): Promise<SearchConsoleData | null> {
    const topQueries = await this.getTopQueries(days, 1000);
    const keywordData = topQueries.queries.find(q => 
      q.query.toLowerCase().includes(keyword.toLowerCase())
    );

    return keywordData ? {
      query: keywordData.query,
      impressions: keywordData.impressions,
      clicks: keywordData.clicks,
      ctr: keywordData.ctr,
      position: keywordData.position,
      date: new Date().toISOString()
    } : null;
  }

  /**
   * Get ranking data for a specific article
   */
  async getArticlePerformance(articleSlug: string, days: number = 30): Promise<{
    url: string;
    totalClicks: number;
    totalImpressions: number;
    averagePosition: number;
    ctr: number;
    topQueries: Array<{
      query: string;
      clicks: number;
      impressions: number;
      position: number;
    }>;
  } | null> {
    const pageData = await this.getPagePerformance([`/blog/${articleSlug}`], days);
    
    if (pageData.length === 0) {
      console.log(`📊 No Search Console data found for article: ${articleSlug}`);
      return null;
    }

    const page = pageData[0];
    
    // Get detailed query data for this page
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const queryData = await this.getPerformanceData(startDate, endDate, ['query', 'page']);
    
    const queries = queryData.rows
      ?.filter((row: any) => row.keys[1] === page.page)
      ?.map((row: any) => ({
        query: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        position: row.position
      }))
      ?.sort((a: any, b: any) => b.clicks - a.clicks)
      ?.slice(0, 10) || [];

    return {
      url: page.page,
      totalClicks: page.clicks,
      totalImpressions: page.impressions,
      averagePosition: page.position,
      ctr: page.ctr,
      topQueries: queries
    };
  }

  /**
   * Get trending keywords (rising queries)
   */
  async getTrendingKeywords(days: number = 7): Promise<TopQueries> {
    // Compare last 7 days vs previous 7 days
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const previousStartDate = new Date(Date.now() - days * 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const current = await this.getTopQueries(days, 1000);
    const previous = await this.getPerformanceData(previousStartDate, startDate, ['query']);

    const previousMap = new Map(
      previous.rows?.map((row: any) => [row.keys[0], row.clicks]) || []
    );

    // Find trending keywords (significant increase in clicks)
    const trending = current.queries
      .map(query => {
        const prevClicks = previousMap.get(query.query) || 0;
        const growth = prevClicks > 0 ? ((query.clicks - prevClicks) / prevClicks) * 100 : 0;
        return { ...query, growth };
      })
      .filter(query => query.growth > 50) // 50%+ growth
      .sort((a, b) => b.growth - a.growth)
      .slice(0, 20);

    return { queries: trending };
  }

  private getFallbackData() {
    console.log('📊 Using fallback Search Console data');
    return {
      rows: [],
      responseAggregationType: 'byProperty'
    };
  }
}

export default GoogleSearchConsole;
