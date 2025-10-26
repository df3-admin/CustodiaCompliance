# Database Setup for Custodia Blog

This directory contains the database schema and setup instructions for the Custodia Blog application using Neon PostgreSQL.

## Quick Setup

1. **Create a Neon Database**
   - Go to [neon.tech](https://neon.tech)
   - Create a new project
   - Copy the connection string

2. **Set Environment Variables**
   ```bash
   # Copy .env.example to .env
   cp .env.example .env
   
   # Add your Neon database URL
   DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

3. **Run the Schema**
   - Connect to your Neon database using any PostgreSQL client
   - Run the contents of `schema.sql` to create the tables

## Database Schema

### Articles Table
The main table for blog articles with the following structure:

- `id` - UUID primary key
- `slug` - Unique URL slug for the article
- `title` - Article title
- `author` - Author name
- `published_date` - Publication timestamp
- `updated_date` - Last update timestamp
- `image` - Article featured image path
- `image_alt` - Alt text for the image
- `category` - Article category
- `tags` - Array of tags
- `excerpt` - Article excerpt/summary
- `content` - Full article content (JSON format)
- `read_time` - Estimated reading time
- `seo` - SEO metadata (JSON)
- `related_articles` - Array of related article IDs

## Content Format

Articles use a structured JSON format for content that supports:

- Paragraphs
- Headings (H1-H4)
- Lists
- Callouts (info, warning, success, error)
- CTAs (call-to-action blocks)
- Quotes
- Tables
- Statistics
- Charts
- Step-by-step guides
- Tool recommendations

## Sample Data

To add sample articles, you can use the following format:

```sql
INSERT INTO articles (slug, title, author, category, excerpt, content, read_time, tags) VALUES
('sample-article', 'Sample Article Title', 'Author Name', 'Category', 'Article excerpt...', '{"type": "paragraph", "content": "Article content..."}', '5 min read', ARRAY['tag1', 'tag2']);
```

## Migration Notes

- The schema includes automatic `updated_at` triggers
- All timestamps use `TIMESTAMP WITH TIME ZONE`
- Indexes are optimized for common queries (slug, category, published_date)
- JSON fields use PostgreSQL's native JSONB for better performance

## Troubleshooting

### Common Issues

1. **Connection Errors**
   - Verify your DATABASE_URL is correct
   - Check that your Neon project is active
   - Ensure SSL mode is set to `require`

2. **Permission Errors**
   - Make sure your database user has CREATE TABLE permissions
   - Verify the database exists and is accessible

3. **Schema Errors**
   - Run the schema in order (extensions first, then tables, then indexes)
   - Check for any existing conflicting tables

### Support

For database-related issues:
- Check Neon documentation: https://neon.tech/docs
- Review PostgreSQL documentation for specific SQL syntax
- Contact support if you encounter Neon-specific issues
