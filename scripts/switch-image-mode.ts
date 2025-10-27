import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Image mappings for different modes
const IMAGE_MAPPINGS = {
  custom: (slug: string) => `/images/blog/${slug}-2025.jpg`,
  unsplash: (slug: string) => {
    const imageMap: { [key: string]: string } = {
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
    return imageMap[slug] || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop&crop=center';
  }
};

async function switchImageMode(mode: 'custom' | 'unsplash') {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    const client = await pool.connect();
    
    console.log(`🖼️ Switching to ${mode} images...`);
    console.log('='.repeat(50));
    
    // Get all articles
    const articlesResult = await client.query(`
      SELECT id, title, slug, image 
      FROM articles 
      ORDER BY published_date DESC
    `);
    
    console.log(`📊 Found ${articlesResult.rows.length} articles to update`);
    console.log('');
    
    let updatedCount = 0;
    
    for (const article of articlesResult.rows) {
      const newImagePath = IMAGE_MAPPINGS[mode](article.slug);
      
      try {
        // Update the image path for this article
        const result = await client.query(
          'UPDATE articles SET image = $1 WHERE id = $2',
          [newImagePath, article.id]
        );
        
        if (result.rowCount && result.rowCount > 0) {
          console.log(`✅ Updated: ${article.title}`);
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
    
    console.log(`🎉 Successfully switched to ${mode} images!`);
    console.log(`📊 Total articles updated: ${updatedCount}`);
    
    if (mode === 'custom') {
      console.log('');
      console.log('📁 Custom images should be placed in: public/images/blog/');
      console.log('🖼️ Recommended image size: 800x400px');
      console.log('📝 Naming convention: {slug}-2025.jpg');
    }
    
  } catch (error) {
    console.error('❌ Error switching image mode:', error);
  }
}

// Get command line argument
const mode = process.argv[2] as 'custom' | 'unsplash';

if (!mode || !['custom', 'unsplash'].includes(mode)) {
  console.log('🖼️ Image Mode Switcher');
  console.log('='.repeat(30));
  console.log('');
  console.log('Usage:');
  console.log('  npx tsx scripts/switch-image-mode.ts custom');
  console.log('  npx tsx scripts/switch-image-mode.ts unsplash');
  console.log('');
  console.log('Modes:');
  console.log('  custom   - Use local images from public/images/blog/');
  console.log('  unsplash - Use hosted images from Unsplash');
  console.log('');
  process.exit(1);
}

switchImageMode(mode);
