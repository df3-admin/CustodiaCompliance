import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function fixImagePaths() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    const client = await pool.connect();
    
    console.log('🖼️ Fixing image paths in database...');
    console.log('='.repeat(60));
    
    // Get all articles with their current image paths
    const articlesResult = await client.query(`
      SELECT id, title, slug, image 
      FROM articles 
      WHERE image IS NOT NULL AND image != ''
      ORDER BY published_date DESC
    `);
    
    console.log(`📊 Found ${articlesResult.rows.length} articles with images to fix`);
    console.log('');
    
    let updatedCount = 0;
    
    for (const article of articlesResult.rows) {
      let newImagePath = article.image;
      
      // Fix different path formats
      if (article.image.startsWith('public/images/blog/')) {
        // Remove 'public/' prefix
        newImagePath = article.image.substring(7);
        console.log(`✅ Fixed public/ prefix: ${article.image} → ${newImagePath}`);
      } else if (article.image.startsWith('/images/blog/')) {
        // Remove leading slash
        newImagePath = article.image.substring(1);
        console.log(`✅ Fixed leading slash: ${article.image} → ${newImagePath}`);
      } else if (article.image.startsWith('images/blog/')) {
        // Already correct format
        console.log(`✅ Already correct: ${article.image}`);
        continue;
      } else {
        console.log(`⚠️ Unknown format: ${article.image}`);
        continue;
      }
      
      try {
        // Update the image path in the database
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
    
    client.release();
    await pool.end();
    
    console.log('🎉 Image path fix completed!');
    console.log(`📊 Total articles updated: ${updatedCount}`);
    console.log('');
    console.log('🌐 Images will now work with URLs like:');
    console.log('   https://fullstack-473115.web.app/images/blog/{slug}-2025.png');
    console.log('');
    console.log('📝 Example URLs:');
    console.log('   https://fullstack-473115.web.app/images/blog/soc-2-compliance-checklist-2025.png');
    console.log('   https://fullstack-473115.web.app/images/blog/hipaa-compliance-checklist-complete-guide-2025.png');
    
  } catch (error) {
    console.error('❌ Error fixing image paths:', error);
  }
}

fixImagePaths();
