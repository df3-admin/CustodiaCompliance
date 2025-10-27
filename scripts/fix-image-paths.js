// Simple script to fix image paths in database
// Run with: node fix-image-paths.js

const { Pool } = require('pg');

// You'll need to set your DATABASE_URL environment variable
// or replace this with your actual connection string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fixImagePaths() {
  try {
    const client = await pool.connect();
    
    console.log('🖼️ Fixing image paths in database...');
    console.log('='.repeat(60));
    
    // Get all articles with images
    const articlesResult = await client.query(`
      SELECT id, title, slug, image 
      FROM articles 
      WHERE image IS NOT NULL AND image != ''
      ORDER BY published_date DESC
    `);
    
    console.log(`📊 Found ${articlesResult.rows.length} articles with images`);
    console.log('');
    
    let updatedCount = 0;
    
    for (const article of articlesResult.rows) {
      let newImagePath = article.image;
      let needsUpdate = false;
      
      // Fix different path formats
      if (article.image.startsWith('public/images/blog/')) {
        newImagePath = article.image.substring(7); // Remove 'public/'
        needsUpdate = true;
        console.log(`✅ Fixed public/ prefix: ${article.image} → ${newImagePath}`);
      } else if (article.image.startsWith('/images/blog/')) {
        newImagePath = article.image.substring(1); // Remove leading slash
        needsUpdate = true;
        console.log(`✅ Fixed leading slash: ${article.image} → ${newImagePath}`);
      } else if (article.image.startsWith('images/blog/')) {
        console.log(`✅ Already correct: ${article.image}`);
        continue;
      } else {
        console.log(`⚠️ Unknown format: ${article.image}`);
        continue;
      }
      
      if (needsUpdate) {
        try {
          const result = await client.query(
            'UPDATE articles SET image = $1 WHERE id = $2',
            [newImagePath, article.id]
          );
          
          if (result.rowCount && result.rowCount > 0) {
            console.log(`✅ Updated: ${article.title}`);
            console.log(`   Slug: ${article.slug}`);
            console.log(`   New Image: ${newImagePath}`);
            console.log('');
            updatedCount++;
          }
        } catch (error) {
          console.error(`❌ Error updating ${article.slug}:`, error);
        }
      }
    }
    
    client.release();
    await pool.end();
    
    console.log('🎉 Image path fix completed!');
    console.log(`📊 Total articles updated: ${updatedCount}`);
    console.log('');
    console.log('🌐 Images will now work with URLs like:');
    console.log('   https://fullstack-473115.web.app/images/blog/{slug}-2025.png');
    
  } catch (error) {
    console.error('❌ Error fixing image paths:', error);
    process.exit(1);
  }
}

fixImagePaths();
