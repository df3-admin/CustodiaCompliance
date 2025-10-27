import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Use placeholder images from a reliable service
const PLACEHOLDER_IMAGES = {
  'soc-2-compliance-checklist': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop&crop=center',
  'iso-27001-implementation-guide': 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop&crop=center',
  'hipaa-compliance-for-healthtech-startups': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=400&fit=crop&crop=center',
  'pci-dss-compliance-guide': 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop&crop=center',
  'gdpr-compliance-checklist-for-us-companies': 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=400&fit=crop&crop=center',
  'cmmc-compliance-guide-for-defense-contractors': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=400&fit=crop&crop=center',
  'fedramp-authorization-process-guide': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop&crop=center',
  'nist-cybersecurity-framework-implementation': 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop&crop=center',
  'soc-2-vs-iso-27001-comparison': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop&crop=center',
  'compliance-automation-tools-comparison': 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop&crop=center'
};

async function updateArticleImages() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    const client = await pool.connect();
    
    console.log('🖼️ Updating article images to use hosted URLs...');
    console.log('='.repeat(60));
    
    let updatedCount = 0;
    
    for (const [slug, imageUrl] of Object.entries(PLACEHOLDER_IMAGES)) {
      try {
        // Update the image URL for this article
        const result = await client.query(
          'UPDATE articles SET image = $1 WHERE slug = $2',
          [imageUrl, slug]
        );
        
        if (result.rowCount && result.rowCount > 0) {
          console.log(`✅ Updated ${slug}: ${imageUrl}`);
          updatedCount++;
        } else {
          console.log(`⚠️ No article found with slug: ${slug}`);
        }
      } catch (error) {
        console.error(`❌ Error updating ${slug}:`, error);
      }
    }
    
    // Also update any remaining articles with a generic compliance image
    const remainingResult = await client.query(
      `UPDATE articles 
       SET image = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop&crop=center'
       WHERE image LIKE '/images/blog/%'`
    );
    
    if (remainingResult.rowCount && remainingResult.rowCount > 0) {
      console.log(`✅ Updated ${remainingResult.rowCount} additional articles with generic image`);
      updatedCount += remainingResult.rowCount;
    }
    
    client.release();
    await pool.end();
    
    console.log('\n🎉 Image update completed!');
    console.log(`📊 Total articles updated: ${updatedCount}`);
    console.log('🌐 All images now use hosted URLs from Unsplash');
    console.log('🔗 Images will display properly on your blog');
    
  } catch (error) {
    console.error('❌ Error updating images:', error);
  }
}

updateArticleImages();
