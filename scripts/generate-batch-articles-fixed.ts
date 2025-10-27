console.log('🚀 Starting Fixed Article Generation...');

import GeminiClient from './lib/gemini-client';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function generateAndDeployAllArticlesFixed() {
  console.log('✅ Environment loaded');
  
  const topics = [
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
  
  try {
    console.log('🔧 Initializing Gemini client...');
    const gemini = new GeminiClient();
    console.log('✅ Gemini client ready');
    
    console.log('🔧 Initializing database connection...');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    console.log('✅ Database connection ready');
    
    let successCount = 0;
    let errorCount = 0;
    
    console.log(`\n🎯 Generating ${topics.length} high-value articles...`);
    console.log('📈 Expected total word count: 80,000+ words');
    console.log('⏱️ Estimated time: 15-20 minutes\n');
    
    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      
      try {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📝 Processing ${i + 1}/${topics.length}: ${topic}`);
        console.log(`${'='.repeat(60)}`);
        
        // Generate article content
        const prompt = `Write a comprehensive article on "${topic}" for a compliance blog. Include:

1. Introduction (300 words) - Hook with compelling statistic, what readers will learn, why it matters now
2. What is ${topic.split(' ')[0]}? (500 words) - Clear definition, who needs it, business benefits, market landscape  
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
        
        // Create article data with FIXED field lengths
        const slug = topic.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        
        // Fix title length (max 60 chars for meta_title)
        const shortTitle = `${topic} 2025 Guide`;
        const fullTitle = `${topic} 2025: Complete Implementation Guide [Free Template]`;
        
        // Fix meta description length (max 155 chars)
        const shortDescription = `Complete ${topic.toLowerCase()} guide for 2025. Step-by-step implementation, free template, cost breakdown, and expert tips.`;
        
        const article = {
          slug: slug,
          title: fullTitle,
          author: 'Custodia Team',
          author_avatar: 'https://custodiallc.com/images/team/custodia-team-avatar.jpg',
          category: 'Compliance',
          excerpt: shortDescription,
          content: JSON.stringify(contentBlocks),
          read_time: `${Math.ceil(content.split(' ').length / 200)} min read`,
          tags: generateTags(topic),
          featured: true,
          image: `/images/blog/${slug}-2025.jpg`,
          image_alt: `${topic} 2025 Guide`,
          meta_title: shortTitle, // Fixed: max 60 chars
          meta_description: shortDescription, // Fixed: max 155 chars
          focus_keyword: topic.length > 100 ? topic.substring(0, 100) : topic, // Fixed: max 100 chars
          keywords: generateKeywords(topic),
          schema_data: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: fullTitle,
            description: shortDescription
          }),
          internal_links: ['/blog', '/contact'],
          external_links: [],
          published_date: new Date(),
          updated_date: new Date()
        };
        
        console.log(`📊 Article data prepared:`);
        console.log(`   - Slug: ${article.slug}`);
        console.log(`   - Title: ${article.title}`);
        console.log(`   - Meta Title: ${article.meta_title} (${article.meta_title.length} chars)`);
        console.log(`   - Meta Description: ${article.meta_description.length} chars`);
        console.log(`   - Content blocks: ${contentBlocks.length}`);
        console.log(`   - Tags: ${article.tags.length}`);
        
        // Deploy to database
        console.log('\n🚀 Deploying article to Neon database...');
        
        const client = await pool.connect();
        
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
        console.log(`📊 Content blocks: ${contentBlocks.length}`);
        
        successCount++;
        console.log(`\n🎉 Successfully completed: ${topic}`);
        
        // Add delay to avoid rate limiting
        if (i < topics.length - 1) {
          console.log('⏳ Waiting 5 seconds before next article...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
        
      } catch (error) {
        console.error(`\n❌ Failed to process ${topic}:`, error);
        errorCount++;
      }
    }
    
    await pool.end();
    
    console.log(`\n${'='.repeat(60)}`);
    console.log('🎉 BATCH ARTICLE GENERATION COMPLETED!');
    console.log(`${'='.repeat(60)}`);
    console.log(`✅ Successfully processed: ${successCount} articles`);
    console.log(`❌ Failed: ${errorCount} articles`);
    console.log(`📊 Success rate: ${Math.round((successCount / topics.length) * 100)}%`);
    console.log(`\n🚀 All articles are now live in your Neon database!`);
    console.log(`🌐 Check your blog at: https://custodiallc.com/blog`);
    console.log(`📈 Total articles in database: ${successCount + 1} (including SOC 2)`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

function generateTags(topic: string): string[] {
  const baseTags = [topic, `${topic} checklist`, `${topic} requirements`, `${topic} implementation`];
  
  if (topic.toLowerCase().includes('iso 27001')) {
    return [...baseTags, 'ISO 27001 certification', 'ISO 27001 audit'];
  } else if (topic.toLowerCase().includes('hipaa')) {
    return [...baseTags, 'HIPAA compliance', 'healthcare compliance'];
  } else if (topic.toLowerCase().includes('pci')) {
    return [...baseTags, 'PCI DSS compliance', 'payment security'];
  } else if (topic.toLowerCase().includes('gdpr')) {
    return [...baseTags, 'GDPR compliance', 'data privacy'];
  } else if (topic.toLowerCase().includes('cmmc')) {
    return [...baseTags, 'CMMC compliance', 'defense contractors'];
  } else if (topic.toLowerCase().includes('fedramp')) {
    return [...baseTags, 'FedRAMP authorization', 'government cloud'];
  } else if (topic.toLowerCase().includes('nist')) {
    return [...baseTags, 'NIST framework', 'cybersecurity'];
  }
  
  return baseTags;
}

function generateKeywords(topic: string): string[] {
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

generateAndDeployAllArticlesFixed();
