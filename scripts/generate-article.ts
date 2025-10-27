import GeminiClient from './lib/gemini-client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { ArticleContent } from '../src/types/article';

dotenv.config({ path: '.env.local' });

interface GeneratedArticle {
  slug: string;
  title: string;
  author: string;
  authorAvatar?: string;
  category: string;
  excerpt: string;
  content: ArticleContent[];
  readTime: string;
  tags: string[];
  featured: boolean;
  image: string;
  imageAlt: string;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  keywords?: string[];
  schema?: any;
  internalLinks?: string[];
  externalLinks?: string[];
}

class ArticleGenerator {
  private gemini: GeminiClient;

  constructor() {
    this.gemini = new GeminiClient();
  }

  async generateArticle(topic: string, researchData?: any, competitorAnalysis?: any): Promise<GeneratedArticle> {
    console.log(`✍️ Generating article for: ${topic}`);
    
    try {
      // Load research data if not provided
      if (!researchData) {
        const researchFile = path.join('data', 'research', `${topic.toLowerCase().replace(/\s+/g, '-')}-research.json`);
        if (fs.existsSync(researchFile)) {
          researchData = JSON.parse(fs.readFileSync(researchFile, 'utf-8'));
        }
      }

      // Load competitor analysis if not provided
      if (!competitorAnalysis) {
        const analysisFile = path.join('data', 'competitors', `${topic.toLowerCase().replace(/\s+/g, '-')}-analysis.json`);
        if (fs.existsSync(analysisFile)) {
          competitorAnalysis = JSON.parse(fs.readFileSync(analysisFile, 'utf-8'));
        }
      }

      // Generate the article content
      const articleContent = await this.gemini.generateArticle(topic, researchData, competitorAnalysis);
      
      // Parse the content blocks
      const contentBlocks = this.parseContentBlocks(articleContent);
      
      // Create the article object
      const article = this.createArticleObject(topic, contentBlocks, researchData);
      
      // Humanize the content
      const humanizedArticle = await this.humanizeArticle(article);
      
      // Save to file
      const filename = `${topic.toLowerCase().replace(/\s+/g, '-')}-article.json`;
      const filepath = path.join('data', 'articles', filename);
      
      fs.writeFileSync(filepath, JSON.stringify(humanizedArticle, null, 2));
      
      console.log(`✅ Article saved to: ${filepath}`);
      console.log(`📝 Content blocks: ${humanizedArticle.content.length}`);
      console.log(`📊 Word count: ~${this.estimateWordCount(humanizedArticle.content)}`);
      
      return humanizedArticle;
    } catch (error) {
      console.error('❌ Error generating article:', error);
      throw error;
    }
  }

  private parseContentBlocks(content: string): ArticleContent[] {
    try {
      // Try to parse as JSON first
      if (content.trim().startsWith('[')) {
        return JSON.parse(content);
      }
      
      // If not JSON, parse as markdown-like content
      return this.parseMarkdownContent(content);
    } catch (error) {
      console.error('❌ Error parsing content blocks:', error);
      // Fallback to basic parsing
      return this.parseBasicContent(content);
    }
  }

  private parseMarkdownContent(content: string): ArticleContent[] {
    const blocks: ArticleContent[] = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('#')) {
        // Heading
        const level = line.match(/^#+/)?.[0].length || 2;
        const text = line.replace(/^#+\s*/, '');
        blocks.push({
          type: 'heading',
          level: Math.min(level, 4),
          content: text
        });
      } else if (line.startsWith('-') || line.startsWith('*')) {
        // List item
        const items = [line.replace(/^[-*]\s*/, '')];
        let j = i + 1;
        while (j < lines.length && (lines[j].startsWith('-') || lines[j].startsWith('*'))) {
          items.push(lines[j].replace(/^[-*]\s*/, ''));
          j++;
        }
        blocks.push({
          type: 'list',
          items: items
        });
        i = j - 1;
      } else if (line.length > 0) {
        // Paragraph
        blocks.push({
          type: 'paragraph',
          content: line
        });
      }
    }
    
    return blocks;
  }

  private parseBasicContent(content: string): ArticleContent[] {
    // Basic fallback parsing
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    
    return paragraphs.map(paragraph => {
      const trimmed = paragraph.trim();
      
      if (trimmed.startsWith('#')) {
        const level = trimmed.match(/^#+/)?.[0].length || 2;
        const text = trimmed.replace(/^#+\s*/, '');
        return {
          type: 'heading',
          level: Math.min(level, 4),
          content: text
        };
      } else {
        return {
          type: 'paragraph',
          content: trimmed
        };
      }
    });
  }

  private createArticleObject(topic: string, content: ArticleContent[], researchData?: any): GeneratedArticle {
    const slug = topic.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const title = `${topic} 2025: Complete Implementation Guide [Free Template]`;
    
    // Extract external links from content
    const externalLinks: string[] = [];
    content.forEach(block => {
      if (block.content) {
        const linkMatches = block.content.match(/\[([^\]]+)\]\(([^)]+)\)/g);
        if (linkMatches) {
          linkMatches.forEach(match => {
            const urlMatch = match.match(/\(([^)]+)\)/);
            if (urlMatch && urlMatch[1].startsWith('http')) {
              externalLinks.push(urlMatch[1]);
            }
          });
        }
      }
    });

    // Generate keywords based on topic
    const keywords = this.generateKeywords(topic);

    return {
      slug,
      title,
      author: 'Custodia Team',
      authorAvatar: 'https://custodiallc.com/images/team/custodia-team-avatar.jpg',
      category: 'Compliance',
      excerpt: `Complete ${topic.toLowerCase()} guide for 2025. Step-by-step implementation, free downloadable template, cost breakdown, and expert tips. Get compliance-ready fast.`,
      content,
      readTime: this.calculateReadTime(content),
      tags: keywords.slice(0, 6),
      featured: true,
      image: `/images/blog/${slug}-2025.jpg`,
      imageAlt: `${topic} 2025 Guide`,
      metaTitle: `${topic} 2025: Complete Guide`,
      metaDescription: `Complete ${topic.toLowerCase()} guide for 2025. Step-by-step implementation, free template, cost breakdown, and expert tips. Get compliance-ready fast.`,
      focusKeyword: topic,
      keywords,
      schema: this.generateSchema(topic, title),
      internalLinks: this.generateInternalLinks(topic),
      externalLinks: [...new Set(externalLinks)] // Remove duplicates
    };
  }

  private generateKeywords(topic: string): string[] {
    const baseKeywords = [
      topic,
      `${topic} checklist`,
      `${topic} requirements`,
      `${topic} implementation`,
      `${topic} guide`,
      `${topic} cost`,
      `${topic} timeline`,
      `${topic} tools`
    ];

    // Add topic-specific keywords
    if (topic.toLowerCase().includes('soc 2')) {
      baseKeywords.push('SOC 2 Type II', 'SOC 2 audit', 'SOC 2 compliance', 'SOC 2 certification');
    } else if (topic.toLowerCase().includes('iso 27001')) {
      baseKeywords.push('ISO 27001 certification', 'ISO 27001 audit', 'ISO 27001 compliance');
    } else if (topic.toLowerCase().includes('hipaa')) {
      baseKeywords.push('HIPAA compliance', 'HIPAA requirements', 'healthcare compliance');
    }

    return baseKeywords;
  }

  private generateSchema(topic: string, title: string): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: title,
      description: `Complete ${topic.toLowerCase()} implementation guide`,
      step: [
        {
          '@type': 'HowToStep',
          name: 'Pre-Implementation Phase',
          text: 'Planning and scoping your compliance project'
        },
        {
          '@type': 'HowToStep',
          name: 'Implementation Phase',
          text: 'Building and documenting compliance controls'
        },
        {
          '@type': 'HowToStep',
          name: 'Audit Phase',
          text: 'Testing and validating your compliance program'
        }
      ]
    };
  }

  private generateInternalLinks(topic: string): string[] {
    const links = ['/blog', '/contact'];
    
    // Add topic-specific internal links
    if (topic.toLowerCase().includes('soc 2')) {
      links.push('/blog/iso27001-implementation-guide', '/blog/hipaa-compliance-for-healthtech');
    } else if (topic.toLowerCase().includes('iso 27001')) {
      links.push('/blog/soc2-compliance-checklist-2025', '/blog/hipaa-compliance-for-healthtech');
    } else if (topic.toLowerCase().includes('hipaa')) {
      links.push('/blog/soc2-compliance-checklist-2025', '/blog/iso27001-implementation-guide');
    }

    return links;
  }

  private calculateReadTime(content: ArticleContent[]): string {
    const wordCount = this.estimateWordCount(content);
    const minutes = Math.ceil(wordCount / 200); // Average reading speed
    return `${minutes} min read`;
  }

  private estimateWordCount(content: ArticleContent[]): number {
    return content.reduce((count, block) => {
      if (block.content) {
        return count + block.content.split(' ').length;
      }
      if (block.items) {
        return count + block.items.join(' ').split(' ').length;
      }
      return count;
    }, 0);
  }

  private async humanizeArticle(article: GeneratedArticle): Promise<GeneratedArticle> {
    console.log('🎨 Humanizing article content...');
    
    try {
      // Humanize each content block
      const humanizedContent: ArticleContent[] = [];
      
      for (const block of article.content) {
        if (block.type === 'paragraph' && block.content) {
          const humanizedText = await this.gemini.humanizeContent(block.content);
          humanizedContent.push({
            ...block,
            content: humanizedText
          });
        } else {
          humanizedContent.push(block);
        }
      }
      
      return {
        ...article,
        content: humanizedContent
      };
    } catch (error) {
      console.error('❌ Error humanizing article:', error);
      return article; // Return original if humanization fails
    }
  }

  async generateAllArticles(): Promise<void> {
    console.log('🚀 Starting comprehensive article generation...');
    
    const topicsConfig = JSON.parse(fs.readFileSync('config/high-value-topics.json', 'utf-8'));
    
    for (const topic of topicsConfig.highValueTopics) {
      try {
        console.log(`\n📝 Generating: ${topic.topic}`);
        await this.generateArticle(topic.primaryKeyword);
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.error(`❌ Failed to generate ${topic.topic}:`, error);
      }
    }
    
    console.log('\n✅ All articles generated!');
  }

  async deployArticleToDatabase(article: GeneratedArticle): Promise<void> {
    console.log(`🚀 Deploying article to database: ${article.title}`);
    
    try {
      // Create database update script
      const scriptContent = this.generateDatabaseScript(article);
      
      const filename = `update-${article.slug}-article.ts`;
      const filepath = path.join('scripts', filename);
      
      fs.writeFileSync(filepath, scriptContent);
      
      console.log(`✅ Database script created: ${filepath}`);
      console.log(`📝 Run: npx tsx ${filepath}`);
    } catch (error) {
      console.error('❌ Error creating database script:', error);
      throw error;
    }
  }

  private generateDatabaseScript(article: GeneratedArticle): string {
    return `import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const article = ${JSON.stringify(article, null, 2)};

async function deployArticle() {
  console.log('Connecting to database...');
  const client = await pool.connect();
  try {
    console.log('Deploying article to database...');
    
    // Delete existing article if it exists
    await client.query('DELETE FROM articles WHERE slug = $1', [article.slug]);
    console.log('✅ Deleted existing article');
    
    // Insert new article
    await client.query(
      \`INSERT INTO articles (
        slug, title, author, author_avatar, category, excerpt, content, read_time, tags, featured, image, image_alt,
        meta_title, meta_description, focus_keyword, keywords, schema_data, internal_links, external_links
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING id\`,
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
        article.externalLinks
      ]
    );
    
    console.log('✅ Article deployed successfully!');
    console.log(\`📝 Article: \${article.title}\`);
    console.log(\`📊 Content blocks: \${article.content.length}\`);
    console.log(\`🎯 Focus keyword: \${article.focusKeyword}\`);
    
  } catch (error) {
    console.error('❌ Error deploying article:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

deployArticle();`;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const generator = new ArticleGenerator();

  if (args.length === 0) {
    console.log('Usage:');
    console.log('  npx tsx scripts/generate-article.ts [topic]');
    console.log('  npx tsx scripts/generate-article.ts --all');
    return;
  }

  if (args[0] === '--all') {
    await generator.generateAllArticles();
  } else {
    const topic = args.join(' ');
    const article = await generator.generateArticle(topic);
    await generator.deployArticleToDatabase(article);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default ArticleGenerator;
