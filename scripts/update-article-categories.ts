import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Category mapping from current categories to standardized framework names
const categoryMapping = {
  'Compliance': 'SOC 2', // Default compliance articles to SOC 2
  'SOC 2': 'SOC 2',
  'ISO 27001': 'ISO 27001',
  'HIPAA': 'HIPAA',
  'PCI DSS': 'PCI DSS',
  'GDPR': 'GDPR',
  'FedRAMP': 'FedRAMP',
  'CMMC': 'CMMC',
  'NIST CSF': 'NIST CSF',
  'HITRUST': 'HITRUST'
};

// Topic to category mapping based on the generated articles
const topicToCategoryMapping = {
  'SOC 2 Compliance Checklist 2025': 'SOC 2',
  'SOC 2 vs ISO 27001 comparison': 'SOC 2',
  'ISO 27001 implementation guide': 'ISO 27001',
  'HIPAA compliance for healthtech startups': 'HIPAA',
  'PCI DSS compliance guide': 'PCI DSS',
  'GDPR compliance checklist for US companies': 'GDPR',
  'CMMC compliance guide for defense contractors': 'CMMC',
  'FedRAMP authorization process guide': 'FedRAMP',
  'NIST cybersecurity framework implementation': 'NIST CSF',
  'Compliance automation tools comparison': 'SOC 2' // This is a general compliance topic, default to SOC 2
};

async function updateArticleCategories() {
  console.log('🔄 Updating article categories to standardized framework names...');
  const client = await pool.connect();
  
  try {
    // First, let's see what categories currently exist
    const currentCategories = await client.query('SELECT DISTINCT category FROM articles ORDER BY category');
    console.log('📊 Current categories in database:');
    currentCategories.rows.forEach(row => {
      console.log(`   - ${row.category}`);
    });

    // Update articles based on their titles/slugs to match the correct framework
    const articles = await client.query('SELECT id, title, slug, category FROM articles ORDER BY title');
    console.log(`\n📝 Found ${articles.rows.length} articles to update`);

    let updatedCount = 0;
    for (const article of articles.rows) {
      let newCategory = article.category;
      
      // Try to map based on title first
      for (const [topic, category] of Object.entries(topicToCategoryMapping)) {
        if (article.title.toLowerCase().includes(topic.toLowerCase())) {
          newCategory = category;
          break;
        }
      }
      
      // If no specific mapping found, use the general category mapping
      if (newCategory === article.category) {
        newCategory = categoryMapping[article.category as keyof typeof categoryMapping] || article.category;
      }

      // Only update if the category actually changed
      if (newCategory !== article.category) {
        await client.query(
          'UPDATE articles SET category = $1 WHERE id = $2',
          [newCategory, article.id]
        );
        console.log(`✅ Updated: "${article.title}"`);
        console.log(`   ${article.category} → ${newCategory}`);
        updatedCount++;
      } else {
        console.log(`⏭️  Skipped: "${article.title}" (already correct: ${article.category})`);
      }
    }

    console.log(`\n🎉 Category update completed!`);
    console.log(`📊 Articles updated: ${updatedCount}`);
    console.log(`📊 Articles unchanged: ${articles.rows.length - updatedCount}`);

    // Show final category distribution
    const finalCategories = await client.query('SELECT category, COUNT(*) as count FROM articles GROUP BY category ORDER BY count DESC');
    console.log('\n📊 Final category distribution:');
    finalCategories.rows.forEach(row => {
      console.log(`   - ${row.category}: ${row.count} articles`);
    });

  } catch (error) {
    console.error('❌ Error updating article categories:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

updateArticleCategories();
