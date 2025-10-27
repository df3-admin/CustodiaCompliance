import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

interface DeploymentConfig {
  articlesDir: string;
  batchSize: number;
  skipExisting: boolean;
  generateSitemap: boolean;
  submitToGoogle: boolean;
}

class ArticleDeployer {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async deployAllArticles(config: DeploymentConfig): Promise<void> {
    console.log('🚀 Starting article deployment...');
    console.log(`📁 Articles directory: ${config.articlesDir}`);
    console.log(`📦 Batch size: ${config.batchSize}`);
    
    try {
      const client = await this.pool.connect();
      
      // Get list of article files
      const articleFiles = fs.readdirSync(config.articlesDir)
        .filter(f => f.endsWith('-article.json'))
        .filter(f => !f.includes('-report') && !f.includes('-summary'));
      
      console.log(`📝 Found ${articleFiles.length} articles to deploy`);
      
      let deployedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;
      
      for (const file of articleFiles) {
        try {
          const articlePath = path.join(config.articlesDir, file);
          const article = JSON.parse(fs.readFileSync(articlePath, 'utf-8'));
          
          console.log(`\n📄 Deploying: ${article.title}`);
          
          // Check if article already exists
          if (config.skipExisting) {
            const existingArticle = await client.query(
              'SELECT id FROM articles WHERE slug = $1',
              [article.slug]
            );
            
            if (existingArticle.rows.length > 0) {
              console.log(`⏭️ Skipping existing article: ${article.slug}`);
              skippedCount++;
              continue;
            }
          }
          
          // Deploy article
          await this.deploySingleArticle(client, article);
          deployedCount++;
          
          console.log(`✅ Deployed: ${article.title}`);
          
        } catch (error) {
          console.error(`❌ Failed to deploy ${file}:`, error);
          errorCount++;
        }
      }
      
      client.release();
      
      console.log('\n✅ Deployment completed!');
      console.log(`📊 Deployed: ${deployedCount}`);
      console.log(`⏭️ Skipped: ${skippedCount}`);
      console.log(`❌ Errors: ${errorCount}`);
      
      // Generate sitemap
      if (config.generateSitemap) {
        await this.generateSitemap();
      }
      
      // Submit to Google
      if (config.submitToGoogle) {
        await this.submitToGoogle();
      }
      
    } catch (error) {
      console.error('❌ Deployment failed:', error);
      throw error;
    } finally {
      await this.pool.end();
    }
  }

  private async deploySingleArticle(client: any, article: any): Promise<void> {
    // Delete existing article if it exists
    await client.query('DELETE FROM articles WHERE slug = $1', [article.slug]);
    
    // Insert new article
    const result = await client.query(
      `INSERT INTO articles (
        slug, title, author, author_avatar, category, excerpt, content, read_time, tags, featured, image, image_alt,
        meta_title, meta_description, focus_keyword, keywords, schema_data, internal_links, external_links,
        published_date, updated_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING id`,
      [
        article.slug,
        article.title,
        article.author,
        article.authorAvatar,
        article.category,
        article.excerpt,
        JSON.stringify(article.content),
        article.readTime,
        article.tags,
        article.featured,
        article.image,
        article.imageAlt,
        article.metaTitle,
        article.metaDescription,
        article.focusKeyword,
        article.keywords,
        JSON.stringify(article.schema),
        article.internalLinks,
        article.externalLinks,
        new Date(),
        new Date()
      ]
    );
    
    console.log(`📝 Article ID: ${result.rows[0].id}`);
  }

  async generateSitemap(): Promise<void> {
    console.log('🗺️ Generating sitemap...');
    
    try {
      const client = await this.pool.connect();
      
      // Get all published articles
      const result = await client.query(`
        SELECT slug, updated_date 
        FROM articles 
        WHERE published_date IS NOT NULL 
        ORDER BY published_date DESC
      `);
      
      const baseUrl = process.env.NEXT_PUBLIC_BLOG_URL || 'https://custodiallc.com';
      
      // Generate sitemap XML
      let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
      sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
      
      // Add homepage
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}</loc>\n`;
      sitemap += '    <lastmod>' + new Date().toISOString().split('T')[0] + '</lastmod>\n';
      sitemap += '    <changefreq>daily</changefreq>\n';
      sitemap += '    <priority>1.0</priority>\n';
      sitemap += '  </url>\n';
      
      // Add blog listing page
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}/blog</loc>\n`;
      sitemap += '    <lastmod>' + new Date().toISOString().split('T')[0] + '</lastmod>\n';
      sitemap += '    <changefreq>daily</changefreq>\n';
      sitemap += '    <priority>0.8</priority>\n';
      sitemap += '  </url>\n';
      
      // Add articles
      result.rows.forEach(row => {
        sitemap += '  <url>\n';
        sitemap += `    <loc>${baseUrl}/blog/${row.slug}</loc>\n`;
        sitemap += '    <lastmod>' + new Date(row.updated_date).toISOString().split('T')[0] + '</lastmod>\n';
        sitemap += '    <changefreq>weekly</changefreq>\n';
        sitemap += '    <priority>0.6</priority>\n';
        sitemap += '  </url>\n';
      });
      
      sitemap += '</urlset>';
      
      // Save sitemap
      fs.writeFileSync('public/sitemap.xml', sitemap);
      
      client.release();
      
      console.log(`✅ Sitemap generated: public/sitemap.xml`);
      console.log(`📊 URLs: ${result.rows.length + 2}`);
      
    } catch (error) {
      console.error('❌ Error generating sitemap:', error);
    }
  }

  async submitToGoogle(): Promise<void> {
    console.log('🔍 Submitting sitemap to Google Search Console...');
    
    // This would typically use the Google Search Console API
    // For now, we'll just log the sitemap URL
    const baseUrl = process.env.NEXT_PUBLIC_BLOG_URL || 'https://custodiallc.com';
    const sitemapUrl = `${baseUrl}/sitemap.xml`;
    
    console.log(`📝 Sitemap URL: ${sitemapUrl}`);
    console.log('📋 Manual submission required:');
    console.log('1. Go to Google Search Console');
    console.log('2. Add property if not already added');
    console.log('3. Submit sitemap URL');
    console.log('4. Request indexing for important pages');
  }

  async deploySpecificArticle(articlePath: string): Promise<void> {
    console.log(`📄 Deploying specific article: ${articlePath}`);
    
    try {
      const article = JSON.parse(fs.readFileSync(articlePath, 'utf-8'));
      const client = await this.pool.connect();
      
      await this.deploySingleArticle(client, article);
      
      client.release();
      
      console.log(`✅ Deployed: ${article.title}`);
      
    } catch (error) {
      console.error('❌ Error deploying article:', error);
      throw error;
    } finally {
      await this.pool.end();
    }
  }

  async updateExistingArticle(articlePath: string): Promise<void> {
    console.log(`📝 Updating existing article: ${articlePath}`);
    
    try {
      const article = JSON.parse(fs.readFileSync(articlePath, 'utf-8'));
      const client = await this.pool.connect();
      
      // Update existing article
      await client.query(
        `UPDATE articles SET
          title = $2, author = $3, author_avatar = $4, category = $5, excerpt = $6, 
          content = $7, read_time = $8, tags = $9, featured = $10, image = $11, image_alt = $12,
          meta_title = $13, meta_description = $14, focus_keyword = $15, keywords = $16, 
          schema_data = $17, internal_links = $18, external_links = $19, updated_date = $20
        WHERE slug = $1`,
        [
          article.slug,
          article.title,
          article.author,
          article.authorAvatar,
          article.category,
          article.excerpt,
          JSON.stringify(article.content),
          article.readTime,
          article.tags,
          article.featured,
          article.image,
          article.imageAlt,
          article.metaTitle,
          article.metaDescription,
          article.focusKeyword,
          article.keywords,
          JSON.stringify(article.schema),
          article.internalLinks,
          article.externalLinks,
          new Date()
        ]
      );
      
      client.release();
      
      console.log(`✅ Updated: ${article.title}`);
      
    } catch (error) {
      console.error('❌ Error updating article:', error);
      throw error;
    } finally {
      await this.pool.end();
    }
  }

  async getDeploymentStatus(): Promise<void> {
    console.log('📊 Checking deployment status...');
    
    try {
      const client = await this.pool.connect();
      
      // Get article count
      const countResult = await client.query('SELECT COUNT(*) as count FROM articles');
      const totalArticles = countResult.rows[0].count;
      
      // Get recent articles
      const recentResult = await client.query(`
        SELECT title, slug, published_date, updated_date 
        FROM articles 
        ORDER BY updated_date DESC 
        LIMIT 10
      `);
      
      client.release();
      
      console.log(`📝 Total articles in database: ${totalArticles}`);
      console.log('\n📄 Recent articles:');
      recentResult.rows.forEach(row => {
        console.log(`  - ${row.title} (${row.slug})`);
        console.log(`    Updated: ${new Date(row.updated_date).toLocaleDateString()}`);
      });
      
    } catch (error) {
      console.error('❌ Error checking deployment status:', error);
    } finally {
      await this.pool.end();
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const deployer = new ArticleDeployer();

  if (args.length === 0) {
    console.log('Usage:');
    console.log('  npx tsx scripts/deploy-articles.ts --all');
    console.log('  npx tsx scripts/deploy-articles.ts [article-path]');
    console.log('  npx tsx scripts/deploy-articles.ts --update [article-path]');
    console.log('  npx tsx scripts/deploy-articles.ts --status');
    return;
  }

  if (args[0] === '--all') {
    const config: DeploymentConfig = {
      articlesDir: 'data/articles',
      batchSize: 5,
      skipExisting: true,
      generateSitemap: true,
      submitToGoogle: true
    };
    await deployer.deployAllArticles(config);
  } else if (args[0] === '--update' && args[1]) {
    await deployer.updateExistingArticle(args[1]);
  } else if (args[0] === '--status') {
    await deployer.getDeploymentStatus();
  } else {
    await deployer.deploySpecificArticle(args[0]);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default ArticleDeployer;
