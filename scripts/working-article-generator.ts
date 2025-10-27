import GeminiClient from './lib/gemini-client';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

class WorkingArticleGenerator {
  private gemini: GeminiClient;
  private pool: Pool;

  constructor() {
    this.gemini = new GeminiClient();
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async generateSingleArticle(topic: string) {
    console.log(`\n🚀 Generating article: ${topic}`);
    
    try {
      // Generate article content
      const prompt = `Write a comprehensive article on "${topic}" for a compliance blog. Include:

1. Introduction (300 words) - Hook with compelling statistic, what readers will learn, why it matters now
2. What is ${topic}? (500 words) - Clear definition, who needs it, business benefits, market landscape  
3. Requirements/Framework (800 words) - Detailed breakdown, examples, implementation considerations
4. Implementation Checklist (1,200 words) - 20+ actionable items, step-by-step process, technical details
5. Costs & Timeline (600 words) - Breakdown by company size, hidden costs, ROI analysis
6. Common Mistakes (500 words) - Top 10 pitfalls, how to avoid them
7. FAQ (1,000 words) - 15-20 comprehensive questions
8. Conclusion (300 words) - Key takeaways, next steps

REQUIREMENTS:
- 8,000+ words total
- Natural, conversational tone with contractions
- Include specific examples and real-world scenarios
- Add practical implementation details
- Use industry jargon appropriately
- Include citations like [Source](URL) for statistics
- Vary sentence length and use rhetorical questions
- Write like a human expert, not AI

Make it comprehensive and authoritative.`;

      console.log('📝 Generating content with Gemini AI...');
      const content = await this.gemini.generateContent(prompt, { temperature: 0.7 });
      
      console.log(`✅ Content generated: ${content.length} characters`);
      console.log(`📊 Word count: ${content.split(' ').length} words`);
      
      // Parse content into structured blocks
      const contentBlocks = this.parseContent(content);
      
      // Create article data
      const article = {
        slug: topic.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        title: `${topic} 2025: Complete Implementation Guide [Free Template]`,
        author: 'Custodia Team',
        author_avatar: 'https://custodiallc.com/images/team/custodia-team-avatar.jpg',
        category: 'Compliance',
        excerpt: `Complete ${topic.toLowerCase()} guide for 2025. Step-by-step implementation, free downloadable template, cost breakdown, and expert tips. Get compliance-ready fast.`,
        content: JSON.stringify(contentBlocks),
        read_time: `${Math.ceil(content.split(' ').length / 200)} min read`,
        tags: this.generateTags(topic),
        featured: true,
        image: `/images/blog/${topic.toLowerCase().replace(/\s+/g, '-')}-2025.jpg`,
        image_alt: `${topic} 2025 Guide`,
        meta_title: `${topic} 2025: Complete Guide`,
        meta_description: `Complete ${topic.toLowerCase()} guide for 2025. Step-by-step implementation, free template, cost breakdown, and expert tips. Get compliance-ready fast.`,
        focus_keyword: topic,
        keywords: this.generateKeywords(topic),
        schema_data: JSON.stringify(this.generateSchema(topic)),
        internal_links: JSON.stringify(['/blog', '/contact']),
        external_links: JSON.stringify(this.extractExternalLinks(content)),
        published_date: new Date(),
        updated_date: new Date()
      };
      
      console.log(`📊 Article data prepared:`);
      console.log(`   - Slug: ${article.slug}`);
      console.log(`   - Title: ${article.title}`);
      console.log(`   - Content blocks: ${contentBlocks.length}`);
      console.log(`   - Tags: ${article.tags.length}`);
      
      return article;
      
    } catch (error) {
      console.error(`❌ Error generating article for ${topic}:`, error);
      throw error;
    }
  }

  private parseContent(content: string): any[] {
    const blocks: any[] = [];
    const sections = content.split(/\n(?=\d+\.)/);
    
    sections.forEach(section => {
      const lines = section.trim().split('\n');
      if (lines.length === 0) return;
      
      // Extract section title
      const titleMatch = lines[0].match(/^\d+\.\s*(.+)/);
      if (titleMatch) {
        blocks.push({
          type: 'heading',
          level: 2,
          content: titleMatch[1]
        });
      }
      
      // Add content as paragraphs
      const contentLines = lines.slice(1).filter(line => line.trim().length > 0);
      contentLines.forEach(line => {
        if (line.trim().length > 0) {
          blocks.push({
            type: 'paragraph',
            content: line.trim()
          });
        }
      });
    });
    
    return blocks;
  }

  private generateTags(topic: string): string[] {
    const baseTags = [topic, `${topic} checklist`, `${topic} requirements`, `${topic} implementation`];
    
    if (topic.toLowerCase().includes('soc 2')) {
      return [...baseTags, 'SOC 2 Type II', 'SOC 2 audit', 'SOC 2 compliance'];
    } else if (topic.toLowerCase().includes('iso 27001')) {
      return [...baseTags, 'ISO 27001 certification', 'ISO 27001 audit'];
    } else if (topic.toLowerCase().includes('hipaa')) {
      return [...baseTags, 'HIPAA compliance', 'healthcare compliance'];
    }
    
    return baseTags;
  }

  private generateKeywords(topic: string): string[] {
    return [
      topic,
      `${topic} checklist`,
      `${topic} requirements`,
      `${topic} implementation`,
      `${topic} guide`,
      `${topic} cost`,
      `${topic} timeline`,
      `${topic} tools`
    ];
  }

  private generateSchema(topic: string): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: `${topic} 2025: Complete Implementation Guide`,
      description: `Complete ${topic.toLowerCase()} implementation guide`
    };
  }

  private extractExternalLinks(content: string): string[] {
    const linkMatches = content.match(/\[([^\]]+)\]\(([^)]+)\)/g);
    if (!linkMatches) return [];
    
    const links: string[] = [];
    linkMatches.forEach(match => {
      const urlMatch = match.match(/\(([^)]+)\)/);
      if (urlMatch && urlMatch[1].startsWith('http')) {
        links.push(urlMatch[1]);
      }
    });
    
    return [...new Set(links)];
  }

  async deployArticle(article: any) {
    console.log(`\n🚀 Deploying article to Neon database...`);
    
    try {
      const client = await this.pool.connect();
      
      // Delete existing article if it exists
      await client.query('DELETE FROM articles WHERE slug = $1', [article.slug]);
      console.log('✅ Deleted existing article');
      
      // Insert new article
      const result = await client.query(
        `INSERT INTO articles (
          slug, title, author, author_avatar, category, excerpt, content, read_time, tags, featured, image, image_alt,
          meta_title, meta_description, focus_keyword, keywords, schema_data, internal_links, external_links,
          published_date, updated_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        RETURNING id`,
        [
          article.slug, article.title, article.author, article.author_avatar, article.category,
          article.excerpt, article.content, article.read_time, article.tags, article.featured,
          article.image, article.image_alt, article.meta_title, article.meta_description,
          article.focus_keyword, article.keywords, article.schema_data, article.internal_links,
          article.external_links, article.published_date, article.updated_date
        ]
      );
      
      client.release();
      
      console.log(`✅ Article deployed successfully!`);
      console.log(`📝 Article ID: ${result.rows[0].id}`);
      console.log(`🎯 Focus keyword: ${article.focus_keyword}`);
      console.log(`📊 Content blocks: ${JSON.parse(article.content).length}`);
      
    } catch (error) {
      console.error('❌ Error deploying article:', error);
      throw error;
    }
  }

  async generateAndDeployAll() {
    console.log('🚀 Starting comprehensive article generation and deployment...\n');
    
    const topics = [
      'SOC 2 compliance checklist',
      'ISO 27001 implementation guide', 
      'HIPAA compliance for healthtech startups',
      'PCI DSS compliance guide',
      'GDPR compliance checklist for US companies',
      'CMMC compliance guide for defense contractors',
      'FedRAMP authorization process guide',
      'NIST cybersecurity framework implementation',
      'SOC 2 vs ISO 27001 comparison',
      'Compliance automation tools comparison'
    ];
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const topic of topics) {
      try {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📝 Processing ${successCount + errorCount + 1}/${topics.length}: ${topic}`);
        console.log(`${'='.repeat(60)}`);
        
        // Generate article
        const article = await this.generateSingleArticle(topic);
        
        // Deploy to database
        await this.deployArticle(article);
        
        successCount++;
        console.log(`\n🎉 Successfully completed: ${topic}`);
        
        // Add delay to avoid rate limiting
        console.log('⏳ Waiting 5 seconds before next article...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
      } catch (error) {
        console.error(`\n❌ Failed to process ${topic}:`, error);
        errorCount++;
      }
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log('🎉 ARTICLE GENERATION AND DEPLOYMENT COMPLETED!');
    console.log(`${'='.repeat(60)}`);
    console.log(`✅ Successfully processed: ${successCount} articles`);
    console.log(`❌ Failed: ${errorCount} articles`);
    console.log(`📊 Success rate: ${Math.round((successCount / topics.length) * 100)}%`);
    console.log(`\n🚀 All articles are now live in your Neon database!`);
    console.log(`🌐 Check your blog at: https://custodiallc.com/blog`);
    
    await this.pool.end();
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const generator = new WorkingArticleGenerator();

  if (args.length === 0) {
    console.log('Usage:');
    console.log('  npx tsx scripts/working-article-generator.ts [topic]');
    console.log('  npx tsx scripts/working-article-generator.ts --all');
    return;
  }

  if (args[0] === '--all') {
    await generator.generateAndDeployAll();
  } else {
    const topic = args.join(' ');
    const article = await generator.generateSingleArticle(topic);
    await generator.deployArticle(article);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default WorkingArticleGenerator;
