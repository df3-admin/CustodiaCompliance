import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const sampleArticles = [
  {
    slug: 'soc2-compliance-guide-2025',
    title: 'SOC 2 Compliance Guide 2025: Complete Implementation Checklist',
    author: 'Custodia Team',
    category: 'Compliance',
    excerpt: 'Everything you need to know about SOC 2 compliance in 2025, including implementation steps, costs, and best practices.',
    tags: ['SOC 2', 'Compliance', 'Security'],
    content: [
      { type: 'paragraph', content: 'SOC 2 compliance is essential for software companies that handle customer data. This guide covers everything you need to implement SOC 2 Type II successfully.' },
      { type: 'heading', level: 2, content: 'What is SOC 2?' },
      { type: 'paragraph', content: 'SOC 2 (Service Organization Control 2) is an auditing framework that ensures service providers securely manage your data to protect the interests of your organization and the privacy of their clients.' },
      { type: 'heading', level: 2, content: 'Key Requirements' },
      { type: 'list', items: ['Security control implementation', 'Availability and monitoring', 'Processing integrity', 'Confidentiality practices', 'Privacy protections'] },
      { type: 'callout', variant: 'info', content: 'On average, SOC 2 Type II certification takes 6-12 months and costs between $15,000-$100,000 depending on company size and complexity.' },
      { type: 'cta', title: 'Get Expert SOC 2 Help', content: 'Let our experts handle your SOC 2 compliance journey', ctaType: 'consultation' },
    ],
    featured: true,
  },
  {
    slug: 'iso-27001-implementation-basics',
    title: 'ISO 27001 Implementation: A Strategic Guide for Tech Companies',
    author: 'Custodia Team',
    category: 'Compliance',
    excerpt: 'Learn how to implement ISO 27001 information security management system and achieve certification efficiently.',
    tags: ['ISO 27001', 'Security', 'Management Systems'],
    content: [
      { type: 'paragraph', content: 'ISO 27001 is the international standard for information security management systems (ISMS). This comprehensive guide walks you through implementation from start to finish.' },
      { type: 'heading', level: 2, content: 'ISO 27001 Overview' },
      { type: 'paragraph', content: 'ISO 27001 provides a framework for organizations to establish, implement, maintain, and continually improve an information security management system.' },
      { type: 'quote', content: 'Information security is not just about technology—it\'s about people, processes, and systems working together.', author: 'ISO 27001 Framework' },
      { type: 'heading', level: 2, content: 'Implementation Steps' },
      { type: 'list', items: ['Define scope and objectives', 'Conduct risk assessment', 'Select and implement controls', 'Establish monitoring procedures', 'Prepare for certification audit'] },
      { type: 'callout', variant: 'success', content: 'Most tech companies complete ISO 27001 certification within 12-18 months with proper guidance.' },
      { type: 'cta', title: 'Start Your ISO 27001 Journey', content: 'Get expert guidance on your certification path', ctaType: 'consultation' },
    ],
    featured: false,
  },
  {
    slug: 'hipaa-compliance-for-healthtech',
    title: 'HIPAA Compliance Guide for Healthtech Startups',
    author: 'Custodia Team',
    category: 'Compliance',
    excerpt: 'Essential guide for healthtech companies on achieving and maintaining HIPAA compliance.',
    tags: ['HIPAA', 'Healthcare', 'Compliance'],
    content: [
      { type: 'paragraph', content: 'If your healthtech company handles protected health information (PHI), HIPAA compliance isn\'t optional—it\'s a legal requirement.' },
      { type: 'heading', level: 2, content: 'Understanding HIPAA Requirements' },
      { type: 'paragraph', content: 'HIPAA (Health Insurance Portability and Accountability Act) requires covered entities and their business associates to implement safeguards to protect health information.' },
      { type: 'heading', level: 2, content: 'Administrative Safeguards' },
      { type: 'list', items: ['Designate a Privacy Officer', 'Implement workforce security procedures', 'Establish access management policies', 'Conduct regular security training'] },
      { type: 'heading', level: 2, content: 'Physical Safeguards' },
      { type: 'list', items: ['Control facility access', 'Implement workstation controls', 'Establish device and media controls'] },
      { type: 'callout', variant: 'warning', content: 'HIPAA violations can result in penalties up to $1.9 million per year for each violation category.' },
      { type: 'cta', title: 'Ensure HIPAA Compliance', content: 'Protect your healthtech company with expert compliance services', ctaType: 'consultation' },
    ],
    featured: false,
  },
];

async function seedDatabase() {
  try {
    console.log('Connecting to database...');
    
    // Check if articles already exist
    const result = await pool.query('SELECT COUNT(*) FROM articles');
    const count = parseInt(result.rows[0].count);
    
    if (count > 0) {
      console.log(`⚠️  Database already has ${count} articles. Skipping seed.`);
      return;
    }
    
    console.log('Inserting sample articles...');
    
    for (const article of sampleArticles) {
      await pool.query(
        `INSERT INTO articles (
          slug, title, author, category, tags, excerpt, content, read_time, featured
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          article.slug,
          article.title,
          article.author,
          article.category,
          article.tags,
          article.excerpt,
          JSON.stringify(article.content),
          '15 min read',
          article.featured,
        ]
      );
      console.log(`✅ Inserted: ${article.title}`);
    }
    
    console.log('\n✅ Database seeded successfully!');
    console.log(`📝 Added ${sampleArticles.length} sample articles.`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDatabase();
