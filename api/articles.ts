import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Transform database row to match Article interface
function transformArticle(row: any) {
  const baseUrl = process.env.NEXT_PUBLIC_BLOG_URL || 'https://custodiacompliance.com';
  const imagePath = row.image || '';
  
  // Handle different image path formats
  let correctedImagePath = imagePath;
  
  if (imagePath) {
    // Remove 'public/' prefix if it exists
    if (imagePath.startsWith('public/')) {
      correctedImagePath = imagePath.substring(7);
    }
    // Remove leading slash if it exists
    else if (imagePath.startsWith('/')) {
      correctedImagePath = imagePath.substring(1);
    }
  }

  return {
    ...row,
    image: row.image ? `${baseUrl}/${correctedImagePath}` : '',
    readTime: row.read_time || '10 min read', // Transform read_time to readTime
    featured: row.featured || false,
    authorAvatar: row.author_avatar,
    // Parse content if it's a string
    content: typeof row.content === 'string' ? JSON.parse(row.content) : row.content,
    // Enhanced SEO fields
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    focusKeyword: row.focus_keyword,
    keywords: row.keywords || [],
    schema: row.schema_data,
    internalLinks: row.internal_links || [],
    externalLinks: row.external_links || [],
  };
}

export default async function (req: VercelRequest, res: VercelResponse) {
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: 'DATABASE_URL environment variable is not set.' });
  }

  try {
    switch (req.method) {
      case 'GET':
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
        break;

      case 'POST':
        // Create new article
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
              relatedArticles,
              // Enhanced SEO fields
              metaTitle,
              metaDescription,
              focusKeyword,
              keywords,
              schema,
              internalLinks,
              externalLinks
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
                excerpt, content, read_time, featured, seo, related_articles,
                meta_title, meta_description, focus_keyword, keywords, schema_data, internal_links, external_links
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
              RETURNING *`,
              [
                newSlug, title, author, authorAvatar, image, imageAlt, category,
                tags || [], excerpt, JSON.stringify(content), readTime || '10 min read',
                featured || false, seo ? JSON.stringify(seo) : null, relatedArticles || [],
                metaTitle, metaDescription, focusKeyword, keywords || [], schema ? JSON.stringify(schema) : null,
                internalLinks || [], externalLinks || []
              ]
            );

        res.status(201).json(transformArticle(insertResult.rows[0]));
        break;

      case 'PUT':
        // Update existing article
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
              relatedArticles: updateRelatedArticles,
              // Enhanced SEO fields
              metaTitle: updateMetaTitle,
              metaDescription: updateMetaDescription,
              focusKeyword: updateFocusKeyword,
              keywords: updateKeywords,
              schema: updateSchema,
              internalLinks: updateInternalLinks,
              externalLinks: updateExternalLinks
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
                featured = $12, seo = $13, related_articles = $14,
                meta_title = $15, meta_description = $16, focus_keyword = $17, keywords = $18,
                schema_data = $19, internal_links = $20, external_links = $21
              WHERE id = $22
              RETURNING *`,
              [
                updateSlug, updateTitle, updateAuthor, updateAuthorAvatar, updateImage, updateImageAlt,
                updateCategory, updateTags || [], updateExcerpt, JSON.stringify(updateContent),
                updateReadTime, updateFeatured, updateSeo ? JSON.stringify(updateSeo) : null,
                updateRelatedArticles || [], updateMetaTitle, updateMetaDescription, updateFocusKeyword,
                updateKeywords || [], updateSchema ? JSON.stringify(updateSchema) : null,
                updateInternalLinks || [], updateExternalLinks || [], id
              ]
            );

        if (updateResult.rows.length === 0) {
          return res.status(404).json({ error: 'Article not found.' });
        }

        res.status(200).json(transformArticle(updateResult.rows[0]));
        break;

      case 'DELETE':
        // Delete article
        const { id: deleteId } = req.body;

        if (!deleteId) {
          return res.status(400).json({ error: 'Article ID is required for deletion.' });
        }

        const deleteResult = await pool.query('DELETE FROM articles WHERE id = $1 RETURNING *', [deleteId]);

        if (deleteResult.rows.length === 0) {
          return res.status(404).json({ error: 'Article not found.' });
        }

        res.status(200).json({ message: 'Article deleted successfully.', article: transformArticle(deleteResult.rows[0]) });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error: any) {
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'An internal server error occurred.',
      details: error.message 
    });
  }
}
