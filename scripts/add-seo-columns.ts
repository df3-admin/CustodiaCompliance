import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addSEOColumns() {
  console.log('Connecting to database...');
  const client = await pool.connect();
  try {
    console.log('Adding SEO columns to articles table...');
    
    // Add new SEO columns
    const alterQueries = [
      'ALTER TABLE articles ADD COLUMN IF NOT EXISTS meta_title VARCHAR(60)',
      'ALTER TABLE articles ADD COLUMN IF NOT EXISTS meta_description VARCHAR(155)',
      'ALTER TABLE articles ADD COLUMN IF NOT EXISTS focus_keyword VARCHAR(100)',
      'ALTER TABLE articles ADD COLUMN IF NOT EXISTS keywords TEXT[]',
      'ALTER TABLE articles ADD COLUMN IF NOT EXISTS schema_data JSONB',
      'ALTER TABLE articles ADD COLUMN IF NOT EXISTS internal_links TEXT[]',
      'ALTER TABLE articles ADD COLUMN IF NOT EXISTS external_links TEXT[]'
    ];
    
    for (const query of alterQueries) {
      await client.query(query);
      console.log(`✅ Executed: ${query}`);
    }
    
    console.log('✅ Successfully added all SEO columns to articles table!');
    
  } catch (error) {
    console.error('❌ Error adding SEO columns:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

addSEOColumns();
