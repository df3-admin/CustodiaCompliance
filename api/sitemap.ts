import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!process.env.DATABASE_URL) {
    return res.status(500).send('DATABASE_URL not configured');
  }

  try {
    // Fetch all published articles from database
    const result = await pool.query(
      'SELECT slug, category, updated_date FROM articles ORDER BY published_date DESC'
    );

    const articles = result.rows;
    const baseUrl = 'https://fullstack-473115.web.app';

    // Build XML sitemap
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Homepage
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/</loc>\n`;
    xml += '    <lastmod>' + new Date().toISOString().split('T')[0] + '</lastmod>\n';
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>1.0</priority>\n';
    xml += '  </url>\n';

    // Blog listing page
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/blog</loc>\n`;
    xml += '    <lastmod>' + new Date().toISOString().split('T')[0] + '</lastmod>\n';
    xml += '    <changefreq>daily</changefreq>\n';
    xml += '    <priority>0.9</priority>\n';
    xml += '  </url>\n';

    // Category landing pages
    const categories = ['SOC 2', 'ISO 27001', 'HIPAA', 'PCI DSS', 'GDPR', 'FedRAMP', 'CMMC', 'NIST CSF', 'HITRUST'];
    categories.forEach(category => {
      const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/compliance/${categorySlug === 'nist-csf' ? 'nist-csf' : categorySlug}</loc>\n`;
      xml += '    <lastmod>' + new Date().toISOString().split('T')[0] + '</lastmod>\n';
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
    });

    // Article pages
    articles.forEach((article: any) => {
      const lastmod = article.updated_date 
        ? new Date(article.updated_date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/blog/${article.slug}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    });

    xml += '</urlset>';

    // Set XML content type and cache headers
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.status(200).send(xml);

  } catch (error: any) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
}
