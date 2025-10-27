import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import GeminiClient from './lib/gemini-client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// CLI argument parsing
interface CLIOptions {
  count?: number;
  slug?: string;
  dryRun?: boolean;
  articleId?: string;
}

function parseCLIArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {};

  args.forEach(arg => {
    if (arg.startsWith('--count=')) {
      options.count = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--slug=')) {
      options.slug = arg.split('=')[1];
    } else if (arg.startsWith('--article-id=')) {
      options.articleId = arg.split('=')[1];
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    }
  });

  return options;
}

class BlogImageGenerator {
  private pool: Pool;
  private gemini: GeminiClient;
  private blogImageDir: string;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    this.gemini = new GeminiClient();
    this.blogImageDir = path.resolve(__dirname, '../public/images/blog');
    
    // Ensure blog images directory exists
    if (!fs.existsSync(this.blogImageDir)) {
      fs.mkdirSync(this.blogImageDir, { recursive: true });
    }
  }

  async generateImages(options: CLIOptions) {
    console.log('🎨 Blog Image Generator (Hugging Face / Replicate)');
    console.log('================================================\n');

    try {
      // Get articles that need new images
      const articles = await this.getArticlesNeedingImages(options);
      
      if (articles.length === 0) {
        console.log('✅ No articles found that need new images.');
        return;
      }

      console.log(`📊 Found ${articles.length} articles needing new images\n`);

      if (options.dryRun) {
        console.log('🔍 DRY RUN - Articles that would be processed:');
        articles.forEach((article, index) => {
          console.log(`   ${index + 1}. ${article.title} (${article.slug})`);
        });
        console.log('\nRun without --dry-run to generate images.');
        return;
      }

      // Process articles
      let successCount = 0;
      let failCount = 0;
      let nextImageNumber = this.getNextImageNumber();

      for (let i = 0; i < articles.length; i++) {
        const article = articles[i];
        
        console.log(`\n${'='.repeat(60)}`);
        console.log(`🎨 Processing ${i + 1}/${articles.length}: ${article.title}`);
        console.log(`📸 Image number: ${nextImageNumber}`);
        console.log(`${'='.repeat(60)}`);

        try {
          await this.generateImageForArticle(article, nextImageNumber);
          nextImageNumber++;
          successCount++;
          console.log(`✅ Successfully generated image for: ${article.title}`);
        } catch (error: any) {
          failCount++;
          console.error(`❌ Failed to generate image for ${article.title}: ${error.message}`);
        }

        // Small delay to be nice to the API
        if (i < articles.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Final summary
      console.log(`\n${'='.repeat(60)}`);
      console.log('🎉 IMAGE GENERATION COMPLETED');
      console.log(`${'='.repeat(60)}`);
      console.log(`✅ Successful: ${successCount}`);
      console.log(`❌ Failed: ${failCount}`);

    } catch (error) {
      console.error('❌ Fatal error:', error);
    } finally {
      await this.pool.end();
    }
  }

  private async getArticlesNeedingImages(options: CLIOptions): Promise<any[]> {
    const client = await this.pool.connect();
    
    try {
      let query = `
        SELECT id, slug, title, image 
        FROM articles 
        WHERE image IS NULL OR image = '' OR NOT (image ~ 'public/images/blog/image_[0-9]+\.svg')
      `;
      const params: any[] = [];

      // Add specific filters if provided
      if (options.slug) {
        query += ' AND slug = $1';
        params.push(options.slug);
      } else if (options.articleId) {
        query += ' AND id = $1';
        params.push(options.articleId);
      }

      query += ' ORDER BY published_date DESC';

      if (options.count) {
        query += ` LIMIT $${params.length + 1}`;
        params.push(options.count);
      }

      const result = await client.query(query, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  private getNextImageNumber(): number {
    const files = fs.readdirSync(this.blogImageDir);
    const imageNumbers = files
      .filter(f => f.match(/^image_\d+\.svg$/))
      .map(f => parseInt(f.match(/\d+/)?.[0] || '0'));
    
    return imageNumbers.length > 0 ? Math.max(...imageNumbers) + 1 : 1;
  }

  private async generateImageForArticle(article: any, imageNumber: number) {
    console.log('🤖 Generating placeholder image...');
    
    // Create a simple placeholder image using canvas or basic image generation
    const imageData = await this.generatePlaceholderImage(article.title);
    
    // Save image to file system
    const imagePath = await this.saveImage(imageData, imageNumber);
    
    // Update database with new image path
    await this.updateArticleImage(article.id, imagePath);
    
    console.log(`💾 Image saved: ${imagePath}`);
  }

  private async generatePlaceholderImage(title: string): Promise<string> {
    // Create a simple SVG-based placeholder image
    const svg = `
      <svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#20B2AA;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#4682B4;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="800" height="400" fill="url(#grad1)"/>
        <rect x="50" y="50" width="700" height="300" fill="none" stroke="#ffffff" stroke-width="3" rx="20"/>
        <circle cx="200" cy="150" r="40" fill="#ffffff" opacity="0.8"/>
        <rect x="300" y="120" width="200" height="60" fill="#ffffff" opacity="0.8" rx="10"/>
        <rect x="300" y="200" width="150" height="40" fill="#ffffff" opacity="0.6" rx="5"/>
        <rect x="500" y="200" width="150" height="40" fill="#ffffff" opacity="0.6" rx="5"/>
        <rect x="300" y="260" width="350" height="30" fill="#ffffff" opacity="0.4" rx="5"/>
      </svg>
    `;
    
    // Convert SVG to base64
    return Buffer.from(svg).toString('base64');
  }

  private buildImagePrompt(title: string): string {
    return `professional concept illustration for ${title}, clean line art, isometric perspective, minimalist design, compliance security theme, shields documents checklists locks gears network diagrams, teal and grey color palette, modern professional style, NO TEXT, NO WORDS, NO LETTERS, clean background, high quality, detailed, corporate style`;
  }

  private async saveImage(imageData: any, imageNumber: number): Promise<string> {
    const filename = `image_${imageNumber}.svg`;
    const filepath = path.join(this.blogImageDir, filename);
    
    // Convert base64 data to buffer and save
    const imageBuffer = Buffer.from(imageData, 'base64');
    fs.writeFileSync(filepath, imageBuffer);
    
    return `public/images/blog/${filename}`; // No leading slash
  }

  private async updateArticleImage(articleId: string, imagePath: string): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query(
        'UPDATE articles SET image = $1 WHERE id = $2',
        [imagePath, articleId]
      );
      console.log(`📝 Database updated for article ID: ${articleId}`);
    } finally {
      client.release();
    }
  }
}

// Main execution
async function main() {
  const options = parseCLIArgs();

  // Show help if no options
  if (Object.keys(options).length === 0) {
    console.log('🎨 Blog Image Generator\n');
    console.log('Usage:');
    console.log('  npm run generate-images -- --count=5');
    console.log('  npm run generate-images -- --slug=soc-2-compliance-checklist');
    console.log('  npm run generate-images -- --article-id=123e4567-e89b-12d3-a456-426614174000');
    console.log('  npm run generate-images -- --dry-run');
    console.log('\nOptions:');
    console.log('  --count=N          : Number of images to generate');
    console.log('  --slug=SLUG        : Generate for specific article slug');
    console.log('  --article-id=ID    : Generate for specific article ID');
    console.log('  --dry-run          : Show what would be generated without executing\n');
    return;
  }

  const generator = new BlogImageGenerator();
  await generator.generateImages(options);
}

main().catch(console.error);
