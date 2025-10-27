import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import GoogleSearchConsole from './lib/google-search-console.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

class ArticlePerformanceTracker {
  private searchConsole: GoogleSearchConsole;

  constructor() {
    this.searchConsole = new GoogleSearchConsole();
  }

  async trackAllArticles(days: number = 30) {
    console.log('📊 Tracking Article Performance');
    console.log('==========================================\n');

    try {
      // Get all articles from database
      const result = await pool.query(
        'SELECT slug, title, primary_keyword FROM articles ORDER BY created_at DESC'
      );

      const articles = result.rows;
      console.log(`Found ${articles.length} articles to track\n`);

      for (const article of articles) {
        console.log(`\n📈 Tracking: ${article.title}`);
        console.log(`   Slug: ${article.slug}`);

        try {
          // Get performance data from Search Console
          const performance = await this.searchConsole.getArticlePerformance(article.slug, days);

          if (!performance) {
            console.log('   ⚠️  No Search Console data available yet');
            console.log('   📝 This is normal for new articles. Check back in 1-2 weeks.\n');
            continue;
          }

          console.log(`\n   ✅ Performance Data (Last ${days} days):`);
          console.log(`   - Impressions: ${performance.totalImpressions.toLocaleString()}`);
          console.log(`   - Clicks: ${performance.totalClicks}`);
          console.log(`   - CTR: ${(performance.ctr * 100).toFixed(2)}%`);
          console.log(`   - Avg Position: ${performance.averagePosition.toFixed(1)}`);

          if (performance.topQueries.length > 0) {
            console.log(`\n   🔍 Top Performing Queries:`);
            performance.topQueries.slice(0, 5).forEach((query, i) => {
              console.log(`   ${i + 1}. "${query.query}" - ${query.clicks} clicks, position ${query.position.toFixed(1)}`);
            });
          }

          // Save to database
          await this.savePerformanceData(article.slug, performance);
          console.log(`   ✅ Performance data saved to database`);

        } catch (error) {
          console.error(`   ❌ Error tracking article:`, error);
        }
      }

      console.log('\n✅ Performance tracking complete!\n');

    } catch (error) {
      console.error('❌ Error in performance tracking:', error);
    } finally {
      await pool.end();
    }
  }

  async trackSpecificArticle(slug: string, days: number = 30) {
    console.log(`📊 Tracking Performance: ${slug}`);
    console.log('==========================================\n');

    try {
      const performance = await this.searchConsole.getArticlePerformance(slug, days);

      if (!performance) {
        console.log('⚠️  No Search Console data available for this article yet.');
        console.log('📝 New articles typically take 1-2 weeks to appear in Search Console.\n');
        return;
      }

      console.log(`📈 Performance (Last ${days} days):`);
      console.log(`   Impressions: ${performance.totalImpressions.toLocaleString()}`);
      console.log(`   Clicks: ${performance.totalClicks}`);
      console.log(`   CTR: ${(performance.ctr * 100).toFixed(2)}%`);
      console.log(`   Avg Position: ${performance.averagePosition.toFixed(1)}`);

      if (performance.topQueries.length > 0) {
        console.log(`\n🔍 Top Queries:`);
        performance.topQueries.forEach((query, i) => {
          console.log(`   ${i + 1}. "${query.query}"`);
          console.log(`      - Clicks: ${query.clicks}`);
          console.log(`      - Impressions: ${query.impressions}`);
          console.log(`      - Position: ${query.position.toFixed(1)}`);
        });
      }

      // Save to database
      await this.savePerformanceData(slug, performance);
      console.log('\n✅ Performance data saved!');

    } catch (error) {
      console.error('❌ Error:', error);
    } finally {
      await pool.end();
    }
  }

  async getTrendingKeywords(days: number = 7) {
    console.log('🚀 Identifying Trending Keywords');
    console.log('==========================================\n');

    try {
      const trending = await this.searchConsole.getTrendingKeywords(days);

      if (trending.queries.length === 0) {
        console.log('No trending keywords found yet.\n');
        return;
      }

      console.log(`📈 Top Trending Keywords (${days} days):\n`);
      trending.queries.forEach((query, i) => {
        console.log(`${i + 1}. "${query.query}"`);
        console.log(`   - Clicks: ${query.clicks} (Growth: ${(query as any).growth.toFixed(1)}%)`);
        console.log(`   - Position: ${query.position.toFixed(1)}`);
        console.log('');
      });

      console.log('💡 Use these trending keywords in your next articles!');

    } catch (error) {
      console.error('❌ Error:', error);
    } finally {
      await pool.end();
    }
  }

  private async savePerformanceData(slug: string, performance: any) {
    try {
      await pool.query(
        `INSERT INTO article_performance (slug, date, impressions, clicks, ctr, avg_position, top_queries, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         ON CONFLICT (slug, date) 
         DO UPDATE SET 
           impressions = EXCLUDED.impressions,
           clicks = EXCLUDED.clicks,
           ctr = EXCLUDED.ctr,
           avg_position = EXCLUDED.avg_position,
           top_queries = EXCLUDED.top_queries,
           updated_at = NOW()`,
        [
          slug,
          new Date().toISOString().split('T')[0],
          performance.totalImpressions,
          performance.totalClicks,
          performance.ctr,
          performance.averagePosition,
          JSON.stringify(performance.topQueries)
        ]
      );
    } catch (error) {
      // Table might not exist yet, that's ok
      console.warn('⚠️  Could not save to database (table may not exist):', error);
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const days = parseInt(args[1]) || 30;

  const tracker = new ArticlePerformanceTracker();

  switch (command) {
    case 'all':
      await tracker.trackAllArticles(days);
      break;
    case 'article':
      const slug = args[1];
      if (!slug) {
        console.error('❌ Please provide article slug: npm run track article <slug>');
        process.exit(1);
      }
      await tracker.trackSpecificArticle(slug, days);
      break;
    case 'trending':
      await tracker.getTrendingKeywords(parseInt(args[1]) || 7);
      break;
    default:
      console.log('📊 Article Performance Tracker');
      console.log('==========================================\n');
      console.log('Usage:');
      console.log('  npx tsx track-article-performance.ts all [days]       - Track all articles');
      console.log('  npx tsx track-article-performance.ts article <slug>   - Track specific article');
      console.log('  npx tsx track-article-performance.ts trending [days]  - Get trending keywords\n');
  }
}

main().catch(console.error);
