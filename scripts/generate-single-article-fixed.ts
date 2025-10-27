console.log('🚀 Starting Article Generation...');

import GeminiClient from './lib/gemini-client';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function generateAndDeployArticles() {
  console.log('✅ Environment loaded');
  
  try {
    console.log('🔧 Initializing Gemini client...');
    const gemini = new GeminiClient();
    console.log('✅ Gemini client ready');
    
    console.log('🔧 Initializing database connection...');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    console.log('✅ Database connection ready');
    
    // Generate first article
    console.log('\n📝 Generating SOC 2 compliance checklist article...');
    
    const prompt = `Write a comprehensive article on "SOC 2 compliance checklist" for a compliance blog. Include:

1. Introduction (300 words) - Hook with compelling statistic, what readers will learn, why it matters now
2. What is SOC 2? (500 words) - Clear definition, who needs it, business benefits, market landscape  
3. SOC 2 Requirements (800 words) - Detailed breakdown, examples, implementation considerations
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

    console.log('🤖 Calling Gemini AI...');
    const content = await gemini.generateContent(prompt, { temperature: 0.7 });
    console.log(`✅ Content generated: ${content.length} characters`);
    console.log(`📊 Word count: ${content.split(' ').length} words`);
    
    // Parse content into structured blocks
    const contentBlocks = [];
    const sections = content.split(/\n(?=\d+\.)/);
    
    sections.forEach(section => {
      const lines = section.trim().split('\n');
      if (lines.length === 0) return;
      
      // Extract section title
      const titleMatch = lines[0].match(/^\d+\.\s*(.+)/);
      if (titleMatch) {
        contentBlocks.push({
          type: 'heading',
          level: 2,
          content: titleMatch[1]
        });
      }
      
      // Add content as paragraphs
      const contentLines = lines.slice(1).filter(line => line.trim().length > 0);
      contentLines.forEach(line => {
        if (line.trim().length > 0) {
          contentBlocks.push({
            type: 'paragraph',
            content: line.trim()
          });
        }
      });
    });
    
    console.log(`📊 Parsed into ${contentBlocks.length} content blocks`);
    
    // Create article data with proper array formatting
    const article = {
      slug: 'soc-2-compliance-checklist',
      title: 'SOC 2 Compliance Checklist 2025: Complete Implementation Guide [Free Template]',
      author: 'Custodia Team',
      author_avatar: 'https://custodiallc.com/images/team/custodia-team-avatar.jpg',
      category: 'Compliance',
      excerpt: 'Complete SOC 2 compliance checklist guide for 2025. Step-by-step implementation, free downloadable template, cost breakdown, and expert tips. Get compliance-ready fast.',
      content: JSON.stringify(contentBlocks),
      read_time: `${Math.ceil(content.split(' ').length / 200)} min read`,
      tags: ['SOC 2 compliance checklist', 'SOC 2 checklist', 'SOC 2 requirements', 'SOC 2 implementation', 'SOC 2 Type II', 'SOC 2 audit', 'SOC 2 compliance'],
      featured: true,
      image: '/images/blog/soc-2-compliance-checklist-2025.jpg',
      image_alt: 'SOC 2 Compliance Checklist 2025 Guide',
      meta_title: 'SOC 2 Compliance Checklist 2025: Complete Guide',
      meta_description: 'Complete SOC 2 compliance checklist guide for 2025. Step-by-step implementation, free template, cost breakdown, and expert tips. Get compliance-ready fast.',
      focus_keyword: 'SOC 2 compliance checklist',
      keywords: ['SOC 2 compliance checklist', 'SOC 2 checklist', 'SOC 2 requirements', 'SOC 2 implementation', 'SOC 2 guide', 'SOC 2 cost', 'SOC 2 timeline', 'SOC 2 tools'],
      schema_data: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'SOC 2 Compliance Checklist 2025: Complete Implementation Guide',
        description: 'Complete SOC 2 compliance checklist implementation guide'
      }),
      internal_links: ['/blog', '/contact'], // Direct array, not JSON string
      external_links: [], // Direct array, not JSON string
      published_date: new Date(),
      updated_date: new Date()
    };
    
    console.log(`📊 Article data prepared:`);
    console.log(`   - Slug: ${article.slug}`);
    console.log(`   - Title: ${article.title}`);
    console.log(`   - Content blocks: ${contentBlocks.length}`);
    console.log(`   - Tags: ${article.tags.length}`);
    
    // Deploy to database
    console.log('\n🚀 Deploying article to Neon database...');
    
    const client = await pool.connect();
    console.log('✅ Database client connected');
    
    // Delete existing article if it exists
    await client.query('DELETE FROM articles WHERE slug = $1', [article.slug]);
    console.log('✅ Deleted existing article');
    
    // Insert new article with proper array handling
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
    console.log(`📊 Content blocks: ${contentBlocks.length}`);
    
    await pool.end();
    
    console.log('\n🎉 SUCCESS! Article generated and deployed to Neon database!');
    console.log('🌐 Check your blog at: https://custodiallc.com/blog');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

generateAndDeployArticles();
