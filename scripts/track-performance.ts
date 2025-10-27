import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

interface PerformanceMetrics {
  date: string;
  articleSlug: string;
  articleTitle: string;
  pageviews: number;
  uniqueVisitors: number;
  avgTimeOnPage: number;
  bounceRate: number;
  keywordRankings: Array<{
    keyword: string;
    position: number;
    searchVolume: number;
  }>;
  conversions: number;
  conversionRate: number;
}

interface PerformanceReport {
  generatedAt: string;
  period: {
    start: string;
    end: string;
  };
  totalArticles: number;
  totalPageviews: number;
  totalConversions: number;
  averageConversionRate: number;
  topPerformingArticles: Array<{
    slug: string;
    title: string;
    pageviews: number;
    conversionRate: number;
  }>;
  keywordPerformance: Array<{
    keyword: string;
    averagePosition: number;
    totalTraffic: number;
    articles: string[];
  }>;
  trends: {
    pageviewsGrowth: number;
    conversionRateGrowth: number;
    topKeywordGrowth: number;
  };
}

class PerformanceTracker {
  private metricsDir: string;
  private reportsDir: string;

  constructor() {
    this.metricsDir = path.join('data', 'performance');
    this.reportsDir = path.join('data', 'reports');
    
    // Create directories if they don't exist
    if (!fs.existsSync(this.metricsDir)) {
      fs.mkdirSync(this.metricsDir, { recursive: true });
    }
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  async trackPerformance(): Promise<void> {
    console.log('📊 Tracking article performance...');
    
    try {
      // This would typically integrate with Google Analytics API
      // For now, we'll simulate data collection
      const metrics = await this.collectMetrics();
      
      // Save metrics
      await this.saveMetrics(metrics);
      
      // Generate report
      const report = await this.generateReport();
      
      // Save report
      await this.saveReport(report);
      
      console.log('✅ Performance tracking completed!');
      
    } catch (error) {
      console.error('❌ Error tracking performance:', error);
      throw error;
    }
  }

  private async collectMetrics(): Promise<PerformanceMetrics[]> {
    console.log('📈 Collecting performance metrics...');
    
    // Simulate data collection (replace with actual API calls)
    const articles = await this.getArticleList();
    const metrics: PerformanceMetrics[] = [];
    
    for (const article of articles) {
      // Simulate Google Analytics data
      const pageviews = Math.floor(Math.random() * 1000) + 100;
      const uniqueVisitors = Math.floor(pageviews * 0.7);
      const avgTimeOnPage = Math.floor(Math.random() * 300) + 120; // 2-7 minutes
      const bounceRate = Math.random() * 0.4 + 0.3; // 30-70%
      const conversions = Math.floor(Math.random() * 10) + 1;
      
      metrics.push({
        date: new Date().toISOString().split('T')[0],
        articleSlug: article.slug,
        articleTitle: article.title,
        pageviews,
        uniqueVisitors,
        avgTimeOnPage,
        bounceRate,
        keywordRankings: await this.getKeywordRankings(article.slug),
        conversions,
        conversionRate: conversions / pageviews
      });
    }
    
    return metrics;
  }

  private async getArticleList(): Promise<Array<{ slug: string; title: string }>> {
    // This would typically query the database
    // For now, we'll read from the articles directory
    const articlesDir = path.join('data', 'articles');
    
    if (!fs.existsSync(articlesDir)) {
      return [];
    }
    
    const files = fs.readdirSync(articlesDir)
      .filter(f => f.endsWith('-article.json'))
      .filter(f => !f.includes('-report') && !f.includes('-summary'));
    
    const articles = [];
    
    for (const file of files) {
      try {
        const article = JSON.parse(fs.readFileSync(path.join(articlesDir, file), 'utf-8'));
        articles.push({
          slug: article.slug,
          title: article.title
        });
      } catch (error) {
        console.error(`❌ Error reading article ${file}:`, error);
      }
    }
    
    return articles;
  }

  private async getKeywordRankings(articleSlug: string): Promise<Array<{
    keyword: string;
    position: number;
    searchVolume: number;
  }>> {
    // Simulate keyword ranking data
    const keywords = [
      { keyword: 'SOC 2 compliance', position: Math.floor(Math.random() * 20) + 1, searchVolume: 15000 },
      { keyword: 'SOC 2 checklist', position: Math.floor(Math.random() * 15) + 1, searchVolume: 8000 },
      { keyword: 'SOC 2 requirements', position: Math.floor(Math.random() * 25) + 1, searchVolume: 5000 }
    ];
    
    return keywords;
  }

  private async saveMetrics(metrics: PerformanceMetrics[]): Promise<void> {
    const filename = `metrics-${new Date().toISOString().split('T')[0]}.json`;
    const filepath = path.join(this.metricsDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(metrics, null, 2));
    
    console.log(`💾 Metrics saved to: ${filepath}`);
  }

  private async generateReport(): Promise<PerformanceReport> {
    console.log('📊 Generating performance report...');
    
    // Load recent metrics
    const metrics = await this.loadRecentMetrics();
    
    if (metrics.length === 0) {
      throw new Error('No metrics data available');
    }
    
    const totalArticles = new Set(metrics.map(m => m.articleSlug)).size;
    const totalPageviews = metrics.reduce((sum, m) => sum + m.pageviews, 0);
    const totalConversions = metrics.reduce((sum, m) => sum + m.conversions, 0);
    const averageConversionRate = totalConversions / totalPageviews;
    
    // Top performing articles
    const articlePerformance = new Map<string, { pageviews: number; conversions: number; title: string }>();
    
    metrics.forEach(metric => {
      const existing = articlePerformance.get(metric.articleSlug) || { pageviews: 0, conversions: 0, title: metric.articleTitle };
      existing.pageviews += metric.pageviews;
      existing.conversions += metric.conversions;
      articlePerformance.set(metric.articleSlug, existing);
    });
    
    const topPerformingArticles = Array.from(articlePerformance.entries())
      .map(([slug, data]) => ({
        slug,
        title: data.title,
        pageviews: data.pageviews,
        conversionRate: data.conversions / data.pageviews
      }))
      .sort((a, b) => b.pageviews - a.pageviews)
      .slice(0, 10);
    
    // Keyword performance
    const keywordPerformance = new Map<string, { positions: number[]; traffic: number; articles: Set<string> }>();
    
    metrics.forEach(metric => {
      metric.keywordRankings.forEach(ranking => {
        const existing = keywordPerformance.get(ranking.keyword) || { positions: [], traffic: 0, articles: new Set() };
        existing.positions.push(ranking.position);
        existing.traffic += ranking.searchVolume;
        existing.articles.add(metric.articleSlug);
        keywordPerformance.set(ranking.keyword, existing);
      });
    });
    
    const keywordPerformanceArray = Array.from(keywordPerformance.entries())
      .map(([keyword, data]) => ({
        keyword,
        averagePosition: data.positions.reduce((a, b) => a + b, 0) / data.positions.length,
        totalTraffic: data.traffic,
        articles: Array.from(data.articles)
      }))
      .sort((a, b) => a.averagePosition - b.averagePosition)
      .slice(0, 20);
    
    // Calculate trends (simplified)
    const trends = {
      pageviewsGrowth: Math.random() * 50 + 10, // 10-60% growth
      conversionRateGrowth: Math.random() * 20 + 5, // 5-25% growth
      topKeywordGrowth: Math.random() * 30 + 15 // 15-45% growth
    };
    
    const report: PerformanceReport = {
      generatedAt: new Date().toISOString(),
      period: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      },
      totalArticles,
      totalPageviews,
      totalConversions,
      averageConversionRate,
      topPerformingArticles,
      keywordPerformance: keywordPerformanceArray,
      trends
    };
    
    return report;
  }

  private async loadRecentMetrics(): Promise<PerformanceMetrics[]> {
    const files = fs.readdirSync(this.metricsDir)
      .filter(f => f.startsWith('metrics-') && f.endsWith('.json'))
      .sort()
      .slice(-7); // Last 7 days
    
    const metrics: PerformanceMetrics[] = [];
    
    for (const file of files) {
      try {
        const fileMetrics = JSON.parse(fs.readFileSync(path.join(this.metricsDir, file), 'utf-8'));
        metrics.push(...fileMetrics);
      } catch (error) {
        console.error(`❌ Error loading metrics ${file}:`, error);
      }
    }
    
    return metrics;
  }

  private async saveReport(report: PerformanceReport): Promise<void> {
    const filename = `performance-report-${new Date().toISOString().split('T')[0]}.json`;
    const filepath = path.join(this.reportsDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    
    console.log(`📊 Report saved to: ${filepath}`);
    console.log(`📈 Total pageviews: ${report.totalPageviews.toLocaleString()}`);
    console.log(`🎯 Total conversions: ${report.totalConversions}`);
    console.log(`📊 Average conversion rate: ${(report.averageConversionRate * 100).toFixed(2)}%`);
    console.log(`🏆 Top article: ${report.topPerformingArticles[0]?.title}`);
  }

  async generateWeeklyReport(): Promise<void> {
    console.log('📅 Generating weekly performance report...');
    
    const report = await this.generateReport();
    
    // Generate markdown report
    const markdownReport = this.generateMarkdownReport(report);
    
    const filename = `weekly-report-${new Date().toISOString().split('T')[0]}.md`;
    const filepath = path.join(this.reportsDir, filename);
    
    fs.writeFileSync(filepath, markdownReport);
    
    console.log(`📄 Weekly report saved to: ${filepath}`);
  }

  private generateMarkdownReport(report: PerformanceReport): string {
    let markdown = `# Weekly Performance Report\n\n`;
    markdown += `**Generated:** ${new Date(report.generatedAt).toLocaleDateString()}\n`;
    markdown += `**Period:** ${report.period.start} to ${report.period.end}\n\n`;
    
    markdown += `## Summary\n\n`;
    markdown += `- **Total Articles:** ${report.totalArticles}\n`;
    markdown += `- **Total Pageviews:** ${report.totalPageviews.toLocaleString()}\n`;
    markdown += `- **Total Conversions:** ${report.totalConversions}\n`;
    markdown += `- **Average Conversion Rate:** ${(report.averageConversionRate * 100).toFixed(2)}%\n\n`;
    
    markdown += `## Top Performing Articles\n\n`;
    report.topPerformingArticles.forEach((article, index) => {
      markdown += `${index + 1}. **${article.title}**\n`;
      markdown += `   - Pageviews: ${article.pageviews.toLocaleString()}\n`;
      markdown += `   - Conversion Rate: ${(article.conversionRate * 100).toFixed(2)}%\n\n`;
    });
    
    markdown += `## Keyword Performance\n\n`;
    report.keywordPerformance.slice(0, 10).forEach((keyword, index) => {
      markdown += `${index + 1}. **${keyword.keyword}**\n`;
      markdown += `   - Average Position: ${keyword.averagePosition.toFixed(1)}\n`;
      markdown += `   - Total Traffic: ${keyword.totalTraffic.toLocaleString()}\n`;
      markdown += `   - Articles: ${keyword.articles.length}\n\n`;
    });
    
    markdown += `## Trends\n\n`;
    markdown += `- **Pageviews Growth:** ${report.trends.pageviewsGrowth.toFixed(1)}%\n`;
    markdown += `- **Conversion Rate Growth:** ${report.trends.conversionRateGrowth.toFixed(1)}%\n`;
    markdown += `- **Top Keyword Growth:** ${report.trends.topKeywordGrowth.toFixed(1)}%\n\n`;
    
    return markdown;
  }

  async setupGoogleAnalytics(): Promise<void> {
    console.log('🔧 Setting up Google Analytics integration...');
    
    // This would typically set up the Google Analytics API integration
    console.log('📋 Manual setup required:');
    console.log('1. Create Google Analytics 4 property');
    console.log('2. Enable Google Analytics Reporting API');
    console.log('3. Create service account and download credentials');
    console.log('4. Add credentials to .env.local');
    console.log('5. Update tracking code in the application');
  }

  async setupGoogleSearchConsole(): Promise<void> {
    console.log('🔧 Setting up Google Search Console integration...');
    
    // This would typically set up the Google Search Console API integration
    console.log('📋 Manual setup required:');
    console.log('1. Verify domain ownership in Google Search Console');
    console.log('2. Enable Google Search Console API');
    console.log('3. Create service account and download credentials');
    console.log('4. Add credentials to .env.local');
    console.log('5. Grant access to the service account');
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const tracker = new PerformanceTracker();

  if (args.length === 0) {
    console.log('Usage:');
    console.log('  npx tsx scripts/track-performance.ts --track');
    console.log('  npx tsx scripts/track-performance.ts --weekly');
    console.log('  npx tsx scripts/track-performance.ts --setup-analytics');
    console.log('  npx tsx scripts/track-performance.ts --setup-search-console');
    return;
  }

  if (args[0] === '--track') {
    await tracker.trackPerformance();
  } else if (args[0] === '--weekly') {
    await tracker.generateWeeklyReport();
  } else if (args[0] === '--setup-analytics') {
    await tracker.setupGoogleAnalytics();
  } else if (args[0] === '--setup-search-console') {
    await tracker.setupGoogleSearchConsole();
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default PerformanceTracker;
