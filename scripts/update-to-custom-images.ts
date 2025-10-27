import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function updateToCustomImages() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    const client = await pool.connect();
    
    console.log('🖼️ Updating articles to use custom image paths...');
    console.log('='.repeat(60));
    
    // Get all articles first to see what we're working with
    const articlesResult = await client.query(`
      SELECT id, title, slug, image 
      FROM articles 
      ORDER BY published_date DESC
    `);
    
    console.log(`📊 Found ${articlesResult.rows.length} articles to update`);
    console.log('');
    
    let updatedCount = 0;
    
    for (const article of articlesResult.rows) {
      const customImagePath = `/images/blog/${article.slug}-2025.jpg`;
      
      try {
        // Update the image path for this article
        const result = await client.query(
          'UPDATE articles SET image = $1 WHERE id = $2',
          [customImagePath, article.id]
        );
        
        if (result.rowCount && result.rowCount > 0) {
          console.log(`✅ Updated: ${article.title}`);
          console.log(`   Slug: ${article.slug}`);
          console.log(`   New Image: ${customImagePath}`);
          console.log('');
          updatedCount++;
        }
      } catch (error) {
        console.error(`❌ Error updating ${article.slug}:`, error);
      }
    }
    
    client.release();
    await pool.end();
    
    console.log('🎉 Custom image paths update completed!');
    console.log(`📊 Total articles updated: ${updatedCount}`);
    console.log('');
    console.log('📁 Image folder structure created:');
    console.log('   public/images/blog/');
    console.log('');
    console.log('🖼️ To add custom images:');
    console.log('   1. Add your images to public/images/blog/');
    console.log('   2. Name them: {slug}-2025.jpg');
    console.log('   3. Recommended size: 800x400px');
    console.log('');
    console.log('📝 Example filenames:');
    console.log('   - soc-2-compliance-checklist-2025.jpg');
    console.log('   - iso-27001-implementation-guide-2025.jpg');
    console.log('   - hipaa-compliance-for-healthtech-startups-2025.jpg');
    console.log('');
    console.log('🌐 Images will be served from: https://your-domain.com/images/blog/');
    
  } catch (error) {
    console.error('❌ Error updating images:', error);
  }
}

updateToCustomImages();
