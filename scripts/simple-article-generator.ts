import GeminiClient from './lib/gemini-client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config({ path: '.env.local' });

interface ArticleData {
  slug: string;
  title: string;
  author: string;
  authorAvatar?: string;
  category: string;
  excerpt: string;
  content: any[];
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

class SimpleArticleGenerator {
  private gemini: GeminiClient;
  private pool: Pool;

  constructor() {
    this.gemini = new GeminiClient();
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async generateArticle(topic: string): Promise<ArticleData> {
    console.log(`✍️ Generating article for: ${topic}`);
    
    try {
      // Generate comprehensive article content
      const prompt = `Write a comprehensive, expert-level article on "${topic}" that will rank #1 on Google.

REQUIREMENTS:
- 8,000-10,000 words
- Natural, conversational tone (like an expert consultant writing)
- Use contractions, varied sentence structure, personal insights
- Include specific examples and real-world scenarios
- Add practical implementation details
- Use industry jargon appropriately

STRUCTURE (follow exactly):
1. Introduction (300 words)
   - Hook with compelling statistic
   - What readers will learn
   - Why this matters now

2. What is ${topic}? (500 words)
   - Clear definition
   - Who needs it and why
   - Business benefits
   - Current market landscape

3. Comparison Section (600 words)
   - Detailed comparison (Type I vs Type II, etc.)
   - When to choose each
   - Cost and timeline differences

4. Core Framework/Requirements (800 words)
   - Detailed breakdown
   - Examples for each component
   - Implementation considerations

5. Pre-Implementation Checklist (1,200 words)
   - 15-20 actionable items
   - Scoping and planning steps
   - Resource requirements

6. Implementation Checklist (1,500 words)
   - 25-30 actionable items
   - Step-by-step process
   - Technical details

7. Testing/Audit Phase (1,000 words)
   - Evidence collection
   - Common issues
   - Remediation strategies

8. Tools Comparison (800 words)
   - 5-7 tools with features, pricing, pros/cons
   - Include Custodia positioning

9. Costs & Timeline (600 words)
   - Breakdown by company size
   - Hidden costs
   - ROI analysis

10. Common Mistakes (500 words)
    - Top 10 pitfalls
    - How to avoid them

11. How Custodia Helps (400 words)
    - Unique value proposition
    - Fixed pricing
    - Success metrics

12. FAQ (1,000 words)
    - 15-20 comprehensive questions

13. Conclusion (300 words)
    - Key takeaways
    - Next steps

CITATION REQUIREMENTS:
- Include [SOURCE](URL) inline for every statistic
- Use format: "According to [Gartner's 2024 report](https://...), 85% of enterprises..."
- Cite 10-15 authoritative external sources
- Link to official framework documentation

HUMANIZATION:
- Vary sentence length (8-35 words)
- Use rhetorical questions
- Include personal insights from compliance experience
- Add transitional phrases
- Use specific examples with details
- Write like a human expert, not AI
- Add contractions (don't, can't, it's)
- Include conversational phrases

OUTPUT FORMAT:
Provide as structured content with clear section headings and detailed content for each section.`;

      const content = await this.gemini.generateContent(prompt, { temperature: 0.7 });
      
      // Parse content into structured format
      const contentBlocks = this.parseContentToBlocks(content);
      
      // Create article object
      const article: ArticleData = {
        slug: topic.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        title: `${topic} 2025: Complete Implementation Guide [Free Template]`,
        author: 'Custodia Team',
        authorAvatar: 'https://custodiallc.com/images/team/custodia-team-avatar.jpg',
        category: 'Compliance',
        excerpt: `Complete ${topic.toLowerCase()} guide for 2025. Step-by-step implementation, free downloadable template, cost breakdown, and expert tips. Get compliance-ready fast.`,
        content: contentBlocks,
        readTime: this.calculateReadTime(contentBlocks),
        tags: this.generateTags(topic),
        featured: true,
        image: `/images/blog/${topic.toLowerCase().replace(/\s+/g, '-')}-2025.jpg`,
        imageAlt: `${topic} 2025 Guide`,
        metaTitle: `${topic} 2025: Complete Guide`,
        metaDescription: `Complete ${topic.toLowerCase()} guide for 2025. Step-by-step implementation, free template, cost breakdown, and expert tips. Get compliance-ready fast.`,
        focusKeyword: topic,
        keywords: this.generateKeywords(topic),
        schema: this.generateSchema(topic),
        internalLinks: ['/blog', '/contact'],
        externalLinks: this.extractExternalLinks(content)
      };
      
      console.log(`✅ Article generated successfully`);
      console.log(`📊 Content blocks: ${contentBlocks.length}`);
      console.log(`📝 Word count: ~${this.estimateWordCount(contentBlocks)}`);
      
      return article;
      
    } catch (error) {
      console.error('❌ Error generating article:', error);
      throw error;
    }
  }

  private parseContentToBlocks(content: string): any[] {
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

  private calculateReadTime(blocks: any[]): string {
    const wordCount = this.estimateWordCount(blocks);
    const minutes = Math.ceil(wordCount / 200);
    return `${minutes} min read`;
  }

  private estimateWordCount(blocks: any[]): number {
    return blocks.reduce((count, block) => {
      if (block.content) {
        return count + block.content.split(' ').length;
      }
      return count;
    }, 0);
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
    
    return [...new Set(links)]; // Remove duplicates
  }

  async deployToDatabase(article: ArticleData): Promise<void> {
    console.log(`🚀 Deploying article to database: ${article.title}`);
    
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
      
      client.release();
      
      console.log(`✅ Article deployed successfully!`);
      console.log(`📝 Article ID: ${result.rows[0].id}`);
      console.log(`🎯 Focus keyword: ${article.focusKeyword}`);
      console.log(`📊 Content blocks: ${article.content.length}`);
      
    } catch (error) {
      console.error('❌ Error deploying article:', error);
      throw error;
    }
  }

  async generateAndDeployAll(): Promise<void> {
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
        console.log(`\n📝 Processing: ${topic}`);
        
        // Generate article
        const article = await this.generateArticle(topic);
        
        // Deploy to database
        await this.deployToDatabase(article);
        
        successCount++;
        console.log(`✅ Completed: ${topic}`);
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 3000));
        
      } catch (error) {
        console.error(`❌ Failed to process ${topic}:`, error);
        errorCount++;
      }
    }
    
    console.log('\n🎉 Article generation and deployment completed!');
    console.log(`✅ Successfully processed: ${successCount} articles`);
    console.log(`❌ Failed: ${errorCount} articles`);
    console.log(`📊 Success rate: ${Math.round((successCount / topics.length) * 100)}%`);
    
    await this.pool.end();
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const generator = new SimpleArticleGenerator();

  if (args.length === 0) {
    console.log('Usage:');
    console.log('  npx tsx scripts/simple-article-generator.ts [topic]');
    console.log('  npx tsx scripts/simple-article-generator.ts --all');
    return;
  }

  if (args[0] === '--all') {
    await generator.generateAndDeployAll();
  } else {
    const topic = args.join(' ');
    const article = await generator.generateArticle(topic);
    await generator.deployToDatabase(article);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default SimpleArticleGenerator;
