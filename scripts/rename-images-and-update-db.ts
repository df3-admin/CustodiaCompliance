import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

// Article slugs in order (matching your articles)
const ARTICLE_SLUGS = [
  'soc-2-compliance-checklist',
  'iso-27001-implementation-guide', 
  'hipaa-compliance-for-healthtech-startups',
  'pci-dss-compliance-guide',
  'gdpr-compliance-checklist-for-us-companies',
  'cmmc-compliance-guide-for-defense-contractors',
  'fedramp-authorization-process-guide',
  'nist-cybersecurity-framework-implementation',
  'soc-2-vs-iso-27001-comparison',
  'compliance-automation-tools-comparison'
];

async function renameImagesAndUpdateDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    const client = await pool.connect();
    
    console.log('🖼️ Renaming images and updating database...');
    console.log('='.repeat(60));
    
    const blogDir = path.join(process.cwd(), 'public', 'images', 'blog');
    
    // Check if images exist
    const imageFiles = fs.readdirSync(blogDir).filter(file => file.startsWith('image_') && file.endsWith('.png'));
    console.log(`📊 Found ${imageFiles.length} images to process`);
    console.log(`📊 Need to map to ${ARTICLE_SLUGS.length} articles`);
    console.log('');
    
    let renamedCount = 0;
    let updatedCount = 0;
    
    // Rename images to match article slugs
    for (let i = 0; i < Math.min(imageFiles.length, ARTICLE_SLUGS.length); i++) {
      const oldName = imageFiles[i];
      const slug = ARTICLE_SLUGS[i];
      const newName = `${slug}-2025.png`;
      
      try {
        const oldPath = path.join(blogDir, oldName);
        const newPath = path.join(blogDir, newName);
        
        // Rename the file
        fs.renameSync(oldPath, newPath);
        console.log(`✅ Renamed: ${oldName} → ${newName}`);
        renamedCount++;
        
      } catch (error) {
        console.error(`❌ Error renaming ${oldName}:`, error);
      }
    }
    
    console.log('');
    console.log('🗄️ Updating database with new image URLs...');
    console.log('');
    
    // Update database with new image URLs
    for (let i = 0; i < ARTICLE_SLUGS.length; i++) {
      const slug = ARTICLE_SLUGS[i];
      const imageUrl = `/images/blog/${slug}-2025.png`;
      
      try {
        const result = await client.query(
          'UPDATE articles SET image = $1 WHERE slug = $2',
          [imageUrl, slug]
        );
        
        if (result.rowCount && result.rowCount > 0) {
          console.log(`✅ Updated database: ${slug}`);
          console.log(`   Image URL: ${imageUrl}`);
          updatedCount++;
        } else {
          console.log(`⚠️ No article found with slug: ${slug}`);
        }
      } catch (error) {
        console.error(`❌ Error updating ${slug}:`, error);
      }
    }
    
    client.release();
    await pool.end();
    
    console.log('');
    console.log('🎉 Image processing completed!');
    console.log(`📊 Images renamed: ${renamedCount}`);
    console.log(`📊 Database records updated: ${updatedCount}`);
    console.log('');
    console.log('🌐 Image URLs will work on:');
    console.log('   Local: http://localhost:5173/images/blog/{slug}-2025.png');
    console.log('   Production: https://custodiacompliance.com/images/blog/{slug}-2025.png');
    console.log('');
    console.log('📝 Example URLs:');
    console.log('   https://custodiacompliance.com/images/blog/soc-2-compliance-checklist-2025.png');
    console.log('   https://custodiacompliance.com/images/blog/iso-27001-implementation-guide-2025.png');
    
  } catch (error) {
    console.error('❌ Error processing images:', error);
  }
}

renameImagesAndUpdateDatabase();
