-- Custodia Blog Database Schema
-- This schema is designed for Neon PostgreSQL database
-- Simplified version focusing on blog functionality

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Articles table for blog posts
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(255) NOT NULL,
    author_avatar VARCHAR(500),
    published_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    image VARCHAR(500),
    image_alt VARCHAR(500),
    category VARCHAR(100),
    tags TEXT[],
    excerpt TEXT,
    content JSONB NOT NULL,
    read_time VARCHAR(50),
        featured BOOLEAN DEFAULT false,
        seo JSONB,
        related_articles UUID[],
        -- Enhanced SEO fields
        meta_title VARCHAR(60),
        meta_description VARCHAR(155),
        focus_keyword VARCHAR(100),
        keywords TEXT[],
        schema_data JSONB,
        internal_links TEXT[],
        external_links TEXT[]
);

-- Create indexes for articles table
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published_date ON articles(published_date);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_tags ON articles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_articles_seo ON articles USING GIN(seo);
CREATE INDEX IF NOT EXISTS idx_articles_related_articles ON articles USING GIN(related_articles);

-- Create updated_date trigger function
CREATE OR REPLACE FUNCTION update_updated_date_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_date = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_date trigger to articles table
CREATE TRIGGER update_articles_updated_date BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();

-- Sample data for testing (optional)
-- INSERT INTO articles (slug, title, author, category, excerpt, content, read_time, tags) VALUES
-- ('soc2-compliance-guide-2025', 'SOC 2 Compliance Guide 2025: Complete Implementation Checklist', 'Custodia Team', 'Compliance', 'Everything you need to know about SOC 2 compliance in 2025, including implementation steps, costs, and best practices.', '{"type": "paragraph", "content": "SOC 2 compliance is essential for software companies..."}', '15 min read', ARRAY['SOC 2', 'Compliance', 'Security']);
