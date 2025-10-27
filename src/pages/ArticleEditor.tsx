import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import ContentBlockEditor, { ContentBlock } from '../components/admin/ContentBlockEditor';
import { Article } from '../types/article';

const ArticleEditor = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isNew = slug === 'new';

  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    author: 'Custodia Team',
    authorAvatar: '',
    image: '',
    imageAlt: '',
    category: 'Compliance',
    tags: [] as string[],
    excerpt: '',
    content: [] as ContentBlock[],
    readTime: '10 min read',
    featured: false,
    seo: {
      keywords: [] as string[],
    },
    relatedArticles: [] as string[],
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isNew && slug) {
      fetchArticle(slug);
    }
  }, [slug, isNew]);

  const fetchArticle = async (articleSlug: string) => {
    try {
      const response = await fetch(`/api/articles?slug=${articleSlug}`);
      if (response.ok) {
        const article: Article = await response.json();
        setFormData({
          slug: article.slug,
          title: article.title,
          author: article.author,
          authorAvatar: article.authorAvatar || '',
          image: article.image,
          imageAlt: '',
          category: article.category,
          tags: article.tags,
          excerpt: article.excerpt,
          content: article.content as ContentBlock[],
          readTime: article.readTime,
          featured: article.featured,
          seo: article.seo || { keywords: [] },
          relatedArticles: article.relatedArticles || [],
        });
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      setError('Failed to load article');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        ...formData,
        tags: formData.tags.filter(Boolean),
      };

      let response: Response;
      if (isNew) {
        response = await fetch('/api/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        const existingArticle = await fetch(`/api/articles?slug=${formData.slug}`).then(r => r.json()).catch(() => null);
        if (existingArticle && existingArticle.id) {
          response = await fetch('/api/articles', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload, id: existingArticle.id }),
          });
        } else {
          setError('Article not found');
          return;
        }
      }

      if (response.ok) {
        navigate('/admin');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save article');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      setError('Failed to save article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/admin')}>
            ← Back to Articles
          </Button>
        </div>

        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-6">{isNew ? 'New Article' : 'Edit Article'}</h1>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
                <Input
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="article-slug-url"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <Input
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Compliance"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <Input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Article Title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
              <Input
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief article description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Author *</label>
                <Input
                  required
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Custodia Team"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Read Time</label>
                <Input
                  value={formData.readTime}
                  onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                  placeholder="10 min read"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
              <Input
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
              <Input
                value={formData.tags.join(', ')}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                placeholder="SOC 2, Compliance, Security"
              />
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                />
                <span className="text-sm font-medium text-gray-700">Featured Article</span>
              </label>
            </div>

            <div className="border-t pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-4">Content Blocks *</label>
              <ContentBlockEditor
                blocks={formData.content}
                onChange={(blocks) => setFormData({ ...formData, content: blocks })}
              />
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => navigate('/admin')}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : isNew ? 'Create Article' : 'Update Article'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ArticleEditor;
