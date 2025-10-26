import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Transform database row to match Article interface
function transformArticle(row: any) {
  const baseUrl = process.env.NEXT_PUBLIC_BLOG_URL || 'https://your-blog-domain.com';
  const imagePath = row.image || '';
  // Correctly remove leading slash if it exists
  const correctedImagePath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;

  return {
    ...row,
    image: row.image ? `${baseUrl}/${correctedImagePath}` : '',
    readTime: row.read_time || '10 min read', // Transform read_time to readTime
    featured: false, // Default value
    authorAvatar: undefined, // Optional field
  };
}

export default async function (req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const { slug } = req.query;
      let result;

      if (!process.env.DATABASE_URL) {
        return res.status(500).json({ error: 'DATABASE_URL environment variable is not set.' });
      }

      if (slug) {
        // Fetch single article by slug
        result = await pool.query('SELECT * FROM articles WHERE slug = $1', [slug]);
        if (result.rows.length > 0) {
          res.status(200).json(transformArticle(result.rows[0]));
        } else {
          res.status(404).json({ error: `Article with slug '${slug}' not found.` });
        }
      } else {
        // Fetch all articles
        result = await pool.query('SELECT * FROM articles ORDER BY published_date DESC');
        res.status(200).json(result.rows.map(transformArticle));
      }
    } catch (error: any) {
      console.error('Database error:', error);
      res.status(500).json({ 
        error: 'An internal server error occurred.',
        details: error.message 
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
