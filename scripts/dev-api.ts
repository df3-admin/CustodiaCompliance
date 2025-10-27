import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Transform database row to match Article interface
function transformArticle(row: any) {
  const baseUrl = process.env.NEXT_PUBLIC_BLOG_URL || 'http://localhost:5173';
  const imagePath = row.image || '';
  const correctedImagePath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;

  return {
    ...row,
    image: row.image ? `${baseUrl}/${correctedImagePath}` : '',
    readTime: row.read_time || '10 min read',
    featured: row.featured || false,
    authorAvatar: row.author_avatar,
    content: typeof row.content === 'string' ? JSON.parse(row.content) : row.content,
  };
}

// API Routes
app.get('/api/articles', async (req, res) => {
  try {
    const { slug } = req.query;
    let result;

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
});

app.post('/api/articles', async (req, res) => {
  try {
    const { 
      slug: newSlug, 
      title, 
      author, 
      authorAvatar,
      image, 
      imageAlt,
      category, 
      tags, 
      excerpt, 
      content, 
      readTime,
      featured,
      seo, 
      relatedArticles 
    } = req.body;

    // Validation
    if (!newSlug || !title || !author || !content) {
      return res.status(400).json({ error: 'Missing required fields: slug, title, author, and content are required.' });
    }

    // Check if slug already exists
    const existingArticle = await pool.query('SELECT id FROM articles WHERE slug = $1', [newSlug]);
    if (existingArticle.rows.length > 0) {
      return res.status(409).json({ error: 'An article with this slug already exists.' });
    }

    const insertResult = await pool.query(
      `INSERT INTO articles (
        slug, title, author, author_avatar, image, image_alt, category, tags, 
        excerpt, content, read_time, featured, seo, related_articles
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        newSlug, title, author, authorAvatar, image, imageAlt, category, 
        tags || [], excerpt, JSON.stringify(content), readTime || '10 min read',
        featured || false, seo ? JSON.stringify(seo) : null, relatedArticles || []
      ]
    );

    res.status(201).json(transformArticle(insertResult.rows[0]));
  } catch (error: any) {
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'An internal server error occurred.',
      details: error.message 
    });
  }
});

app.put('/api/articles', async (req, res) => {
  try {
    const { 
      id,
      slug: updateSlug,
      title: updateTitle,
      author: updateAuthor,
      authorAvatar: updateAuthorAvatar,
      image: updateImage,
      imageAlt: updateImageAlt,
      category: updateCategory,
      tags: updateTags,
      excerpt: updateExcerpt,
      content: updateContent,
      readTime: updateReadTime,
      featured: updateFeatured,
      seo: updateSeo,
      relatedArticles: updateRelatedArticles
    } = req.body;

    if (!id || !updateSlug || !updateTitle || !updateAuthor) {
      return res.status(400).json({ error: 'Missing required fields: id, slug, title, and author are required.' });
    }

    // Check if slug is taken by another article
    const slugCheck = await pool.query('SELECT id FROM articles WHERE slug = $1 AND id != $2', [updateSlug, id]);
    if (slugCheck.rows.length > 0) {
      return res.status(409).json({ error: 'An article with this slug already exists.' });
    }

    const updateResult = await pool.query(
      `UPDATE articles SET 
        slug = $1, title = $2, author = $3, author_avatar = $4, image = $5, image_alt = $6,
        category = $7, tags = $8, excerpt = $9, content = $10, read_time = $11,
        featured = $12, seo = $13, related_articles = $14
      WHERE id = $15
      RETURNING *`,
      [
        updateSlug, updateTitle, updateAuthor, updateAuthorAvatar, updateImage, updateImageAlt,
        updateCategory, updateTags || [], updateExcerpt, JSON.stringify(updateContent),
        updateReadTime, updateFeatured, updateSeo ? JSON.stringify(updateSeo) : null,
        updateRelatedArticles || [], id
      ]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    res.status(200).json(transformArticle(updateResult.rows[0]));
  } catch (error: any) {
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'An internal server error occurred.',
      details: error.message 
    });
  }
});

app.delete('/api/articles', async (req, res) => {
  try {
    const { id: deleteId } = req.body;

    if (!deleteId) {
      return res.status(400).json({ error: 'Article ID is required for deletion.' });
    }

    const deleteResult = await pool.query('DELETE FROM articles WHERE id = $1 RETURNING *', [deleteId]);

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    res.status(200).json({ message: 'Article deleted successfully.', article: transformArticle(deleteResult.rows[0]) });
  } catch (error: any) {
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'An internal server error occurred.',
      details: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`🚀 Development API server running on http://localhost:${port}`);
  console.log(`📝 Articles API: http://localhost:${port}/api/articles`);
});
