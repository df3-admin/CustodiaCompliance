import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function checkArticleImages() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    const client = await pool.connect();
    
    // Get all articles with their image paths
    const result = await client.query(`
      SELECT id, title, slug, image, image_alt 
      FROM articles 
      ORDER BY published_date DESC
    `);
    
    console.log('📊 Current articles in database:');
    console.log('='.repeat(80));
    
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.title}`);
      console.log(`   Slug: ${row.slug}`);
      console.log(`   Image: ${row.image}`);
      console.log(`   Alt: ${row.image_alt}`);
      console.log('');
    });
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error checking articles:', error);
  }
}

checkArticleImages();
