import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testDatabaseConnection() {
  console.log('🧪 Testing Neon Database Connection...\n');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment variables');
    return;
  }
  
  console.log('✅ DATABASE_URL found');
  
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    console.log('✅ Pool created successfully');
    
    const client = await pool.connect();
    console.log('✅ Database connection established');
    
    // Test query
    const result = await client.query('SELECT COUNT(*) as count FROM articles');
    console.log(`✅ Query successful - Articles in database: ${result.rows[0].count}`);
    
    // Test insert
    const testArticle = {
      slug: 'test-article-' + Date.now(),
      title: 'Test Article',
      author: 'Test Author',
      category: 'Test',
      excerpt: 'Test excerpt',
      content: JSON.stringify([{ type: 'paragraph', content: 'Test content' }]),
      read_time: '5 min read',
      tags: ['test'],
      featured: false,
      image: '/test.jpg',
      image_alt: 'Test image',
      published_date: new Date(),
      updated_date: new Date()
    };
    
    const insertResult = await client.query(
      `INSERT INTO articles (slug, title, author, category, excerpt, content, read_time, tags, featured, image, image_alt, published_date, updated_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING id`,
      [
        testArticle.slug, testArticle.title, testArticle.author, testArticle.category,
        testArticle.excerpt, testArticle.content, testArticle.read_time, testArticle.tags,
        testArticle.featured, testArticle.image, testArticle.image_alt,
        testArticle.published_date, testArticle.updated_date
      ]
    );
    
    console.log(`✅ Test article inserted with ID: ${insertResult.rows[0].id}`);
    
    // Clean up test article
    await client.query('DELETE FROM articles WHERE slug = $1', [testArticle.slug]);
    console.log('✅ Test article cleaned up');
    
    client.release();
    await pool.end();
    
    console.log('\n🎉 Database connection test successful!');
    console.log('✅ Ready to deploy articles to Neon database');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

testDatabaseConnection();
