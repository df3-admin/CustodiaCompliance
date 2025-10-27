-- Fix image paths in the articles table
-- This script will standardize all image paths to use the correct relative format

-- Update paths that start with 'public/' to remove the prefix
UPDATE articles 
SET image = SUBSTRING(image FROM 8) 
WHERE image LIKE 'public/images/blog/%';

-- Update paths that start with '/' to remove the leading slash
UPDATE articles 
SET image = SUBSTRING(image FROM 2) 
WHERE image LIKE '/images/blog/%';

-- Show the results
SELECT id, title, slug, image 
FROM articles 
WHERE image IS NOT NULL AND image != ''
ORDER BY published_date DESC;
