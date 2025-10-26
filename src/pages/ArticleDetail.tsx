import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Calendar, Clock, User, ArrowLeft, ArrowRight, Shield, CheckCircle, AlertTriangle, Info, ExternalLink, Quote, ServerCrash } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Article, ArticleContent } from '../types/article';


const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_BLOG_URL || 'https://your-blog-domain.com';

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      setError(null);
      setErrorDetails(null);
      try {
        const response = await fetch(`/api/articles?slug=${slug}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          setErrorDetails(errorData?.details || `HTTP error! status: ${response.status}`);
          if (response.status === 404) {
            throw new Error("Article not found.");
          }
          throw new Error("Failed to fetch article data from the server.");
        }
        
        const data: Article = await response.json();
        
        // Ensure data and content exist before parsing
        if (!data || !data.content) {
            throw new Error("Received invalid article data from the server.");
        }

        // Parse the content JSON string back into an array of ArticleContent
        let parsedContent: ArticleContent[] = [];
        if (typeof data.content === 'string') {
            try {
                parsedContent = JSON.parse(data.content);
            } catch (e) {
                console.error('Failed to parse article content:', e);
                throw new Error("Article content is malformed and could not be displayed.");
            }
        } else if (Array.isArray(data.content)) {
            parsedContent = data.content;
        }

        // Ensure parsedContent is always an array
        if (!Array.isArray(parsedContent)) {
            throw new Error("Article content is not in a valid format.");
        }
        
        setArticle({ ...data, content: parsedContent });

        // Fetch all articles to find related ones
        const allArticlesResponse = await fetch('/api/articles');
        if (!allArticlesResponse.ok) {
          console.error(`Failed to fetch all articles for related links: ${allArticlesResponse.status}`);
        } else {
            const allArticles: Article[] = await allArticlesResponse.json();
    
            // Filter for related articles based on the `relatedArticles` array in the fetched article
            if (data.relatedArticles && data.relatedArticles.length > 0) {
              const filteredRelated = allArticles.filter(art => data.relatedArticles?.includes(art.id));
              setRelatedArticles(filteredRelated);
            } else {
              setRelatedArticles([]);
            }
        }

      } catch (e: any) {
        setError(e.message);
        console.error("Failed to fetch or process article:", e);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  // Scroll to top when component mounts or slug changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Company data for articles
  const getCompanyData = () => {
    return {
      name: 'Custodia',
      credentials: ['GRC Experts', 'Compliance Specialists'],
      bio: 'Your complete GRC department for software companies. We help businesses achieve enterprise readiness through SOC 2, ISO 27001, HIPAA, PCI DSS, and other compliance frameworks with expert guidance and fixed pricing.',
      expertise: ['SOC 2', 'ISO 27001', 'HIPAA', 'PCI DSS', 'FedRAMP', 'CMMC', 'GDPR', 'HITRUST'],
      articlesCount: 24,
      experience: 'Enterprise-grade compliance solutions'
    };
  };

  const renderContent = (content: ArticleContent, index: number) => {
    switch (content.type) {
      case 'paragraph':
        return (
          <p key={index} className="text-gray-700 leading-relaxed mb-6 text-lg">
            <ReactMarkdown>{content.content}</ReactMarkdown>
          </p>
        );
      
      case 'heading':
        const HeadingTag = `h${content.level || 2}` as keyof JSX.IntrinsicElements;
        const headingClasses = {
          1: 'text-4xl font-bold text-gray-900 mb-8 mt-12',
          2: 'text-3xl font-bold text-gray-900 mb-6 mt-10',
          3: 'text-2xl font-semibold text-gray-900 mb-4 mt-8',
          4: 'text-xl font-semibold text-gray-900 mb-3 mt-6'
        };
        return (
          <HeadingTag key={index} className={headingClasses[content.level as keyof typeof headingClasses] || headingClasses[2]}>
            <ReactMarkdown>{content.content}</ReactMarkdown>
          </HeadingTag>
        );
      
      case 'list':
        return (
          <div key={index} className="mb-6">
            {content.content && (
              <h4 className="text-lg font-semibold text-gray-900 mb-3"><ReactMarkdown>{content.content}</ReactMarkdown></h4>
            )}
            <div className="space-y-3 text-gray-700">
              {Array.isArray(content.items) && content.items.map((item, itemIndex) => {
                if (!item) return null;
                return (
                  <div key={itemIndex} className="text-lg leading-relaxed">
                    <ReactMarkdown unwrapDisallowed={true}>{item}</ReactMarkdown>
                  </div>
                );
              })}
            </div>
          </div>
        );
      
      case 'callout':
        const calloutVariants = {
          info: 'bg-blue-50 border-blue-200 text-blue-800',
          warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          success: 'bg-green-50 border-green-200 text-green-800',
          error: 'bg-red-50 border-red-200 text-red-800'
        };
        const calloutIcons = {
          info: Info,
          warning: AlertTriangle,
          success: CheckCircle,
          error: AlertTriangle
        };
        const Icon = calloutIcons[content.variant || 'info'];
        
        return (
          <div key={index} className={`border-l-4 p-6 mb-8 rounded-r-lg ${calloutVariants[content.variant || 'info']}`}>
            <div className="flex items-start gap-3">
              <Icon className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <p className="text-lg font-medium"><ReactMarkdown>{content.content}</ReactMarkdown></p>
            </div>
          </div>
        );
      
      case 'cta':
        const ctaVariants = {
          'package-builder': {
            title: 'Build Your Compliance Package',
            description: 'Get a custom quote in under 2 minutes',
            buttonText: 'Start Building',
            icon: Shield,
            action: () => {
              window.open('https://custodiallc.com/contact', '_blank');
            }
          },
          'consultation': {
            title: 'Book a Free Strategy Call',
            description: '15-minute consultation with our compliance experts',
            buttonText: 'Schedule Call',
            icon: CheckCircle,
            action: () => {
              window.open('https://custodiallc.com/contact', '_blank');
            }
          },
          'contact': {
            title: 'Get Expert Help',
            description: 'Speak with our compliance team today',
            buttonText: 'Contact Us',
            icon: ExternalLink,
            action: () => {
              window.open('https://custodiallc.com/contact', '_blank');
            }
          },
          'trial': {
            title: 'Start Your Free Trial',
            description: '15-day free trial with full access to our team',
            buttonText: 'Start Free Trial',
            icon: Shield,
            action: () => {
              window.open('https://custodiallc.com/contact', '_blank');
            }
          }
        };
        
        const ctaConfig = ctaVariants[content.ctaType || 'contact'];
        if (!ctaConfig) {
          return null;
        }
        const CtaIcon = ctaConfig.icon;
        
        return (
          <Card key={index} className="bg-gradient-to-br from-blue-50 to-white border-blue-200 mb-8">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CtaIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2"><ReactMarkdown>{ctaConfig.title}</ReactMarkdown></h3>
              <p className="text-gray-600 mb-6 text-lg"><ReactMarkdown>{ctaConfig.description}</ReactMarkdown></p>
              <Button 
                onClick={ctaConfig.action}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              >
                <ReactMarkdown>{ctaConfig.buttonText}</ReactMarkdown>
              </Button>
            </CardContent>
          </Card>
        );
      
      case 'quote':
        return (
          <div key={index} className="border-l-4 border-blue-500 bg-blue-50 p-6 mb-8 rounded-r-lg">
            <div className="flex items-start gap-3">
              <Quote className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <blockquote className="text-lg italic text-gray-800 mb-2">
                  <ReactMarkdown>{content.content}</ReactMarkdown>
                </blockquote>
                {content.author && (
                  <cite className="text-sm text-gray-600 font-medium">
                    — <ReactMarkdown>{content.author}</ReactMarkdown>
                  </cite>
                )}
              </div>
            </div>
          </div>
        );
      
      case 'table':
        return (
          <div key={index} className="mb-8">
            {content.content && (
              <h4 className="text-xl font-semibold text-gray-900 mb-4"><ReactMarkdown>{content.content}</ReactMarkdown></h4>
            )}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {Array.isArray(content.columns) && content.columns.map((column, colIndex) => (
                      <th key={colIndex} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        <ReactMarkdown>{column}</ReactMarkdown>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Array.isArray(content.rows) && content.rows.map((row, rowIndex) => {
                    if (!Array.isArray(row)) return null;
                    return (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        {Array.isArray(row) && row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <ReactMarkdown>{cell}</ReactMarkdown>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case 'steps':
        return (
          <div key={index} className="mb-8">
            {content.content && (
              <h4 className="text-xl font-semibold text-gray-900 mb-6"><ReactMarkdown>{content.content}</ReactMarkdown></h4>
            )}
            <div className="space-y-6">
              {Array.isArray(content.steps) && content.steps.map((step, stepIndex) => {
                if (!step) return null;
                return (
                  <div key={stepIndex} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                        {step.number || stepIndex + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h5 className="text-lg font-semibold text-gray-900 mb-2"><ReactMarkdown>{step.title || 'Step'}</ReactMarkdown></h5>
                      <p className="text-gray-700 mb-3"><ReactMarkdown>{step.description || ''}</ReactMarkdown></p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        {step.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <ReactMarkdown>{step.duration}</ReactMarkdown>
                          </span>
                        )}
                        {step.difficulty && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            step.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                            step.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            <ReactMarkdown>{step.difficulty}</ReactMarkdown>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navigation />
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse"></div>
              <div className="h-10 bg-gray-300 w-2/3 mx-auto mb-6 rounded animate-pulse"></div>
              <div className="h-6 bg-gray-400 w-1/2 mx-auto mb-8 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-8 lg:p-12 animate-pulse">
            <div className="h-8 bg-gray-300 w-3/4 mb-6 rounded"></div>
            <div className="h-4 bg-gray-200 w-full mb-4 rounded"></div>
            <div className="h-4 bg-gray-200 w-5/6 mb-4 rounded"></div>
            <div className="h-4 bg-gray-200 w-full mb-4 rounded"></div>
            <div className="h-4 bg-gray-200 w-2/3 mb-6 rounded"></div>
            <div className="h-4 bg-gray-300 w-1/2 mb-4 rounded"></div>
            <div className="h-4 bg-gray-200 w-full mb-4 rounded"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <ServerCrash className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h1 className="text-4xl font-bold text-red-600 mb-4">Error Loading Article</h1>
          <p className="text-lg text-gray-700 mb-6">{error}</p>
          {errorDetails && (
            <div className="bg-red-50 text-red-800 p-4 rounded-lg text-left text-sm mb-8">
              <p className="font-semibold mb-2">Technical Details:</p>
              <code className="break-words">{errorDetails}</code>
            </div>
          )}
          <Link to="/blog">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-lg text-gray-600 mb-8">The article you're looking for could not be loaded.</p>
          <Link to="/blog">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced SEO with Helmet */}
      <Helmet>
        <title>{article.seo?.metaTitle || article.title}</title>
        <meta name="description" content={article.seo?.metaDescription || article.excerpt} />
        <meta name="keywords" content={article.seo?.keywords?.join(', ') || ''} />
        <link rel="canonical" href={`${baseUrl}/blog/${article.slug}`} />
        
        {/* Open Graph Tags */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:url" content={`${baseUrl}/blog/${article.slug}`} />
        <meta property="og:image" content={`${baseUrl}/${article.image}`} />
        <meta property="og:site_name" content="Custodia, LLC" />
        <meta property="article:author" content={article.author} />
        <meta property="article:published_time" content={new Date(article.published_date).toISOString()} />
        <meta property="article:section" content={article.category} />
        <meta property="article:modified_time" content={article.updated_date ? new Date(article.updated_date).toISOString() : new Date(article.published_date).toISOString()} />
        <meta property="article:tag" content={Array.isArray(article.tags) ? article.tags.join(', ') : ''} />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.excerpt} />
        <meta name="twitter:image" content={`${baseUrl}/${article.image}`} />
        <meta name="twitter:site" content="@custodia_llc" />
        
        <meta name="robots" content="index, follow" />
        <meta name="author" content={article.author} />
      </Helmet>
      
      <Navigation />
      
      {/* Back to Blog */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
        </div>
      </div>

      {/* Article Header */}
      <div 
        className="relative bg-cover bg-center bg-no-repeat border-b border-gray-200"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${article.image})`
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-8">
            <Badge className="bg-blue-600 text-white mb-4">
              {article.category}
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
              {article.title}
            </h1>
            <p className="text-xl text-gray-100 mb-8 max-w-3xl mx-auto drop-shadow-md">
              {article.excerpt}
            </p>
          </div>
          
          {/* Article Meta */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-gray-200">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span className="font-medium">{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{new Date(article.published_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{article.readTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-8 lg:p-12">
              {Array.isArray(article.content) ? (
                article.content.map((content, index) => renderContent(content, index))
              ) : (
                <div className="text-red-600 font-semibold">
                  Error: Article content could not be displayed. It may be malformed.
                </div>
              )}
            </div>
            
            {/* Company Card */}
            <div className="mt-12">
              <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{getCompanyData().name}</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {getCompanyData().credentials.map((cred, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {cred}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-gray-700 mb-4">{getCompanyData().bio}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {getCompanyData().expertise.map((exp, index) => (
                          <Badge key={index} className="bg-blue-100 text-blue-800 text-xs">
                            {exp}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>{getCompanyData().articlesCount}+ articles published</p>
                        <p>{getCompanyData().experience}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Sidebar - Desktop Only */}
          <div className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-16 flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
              {/* Placeholder for future sidebar content */}
              <div className="text-center text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">Sidebar content can be added here</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Array.isArray(relatedArticles) && relatedArticles.map((relatedArticle) => (
                <Card key={relatedArticle.id} className="group hover:shadow-lg transition-all duration-300 bg-white border-blue-100">
                  <Link to={`/blog/${relatedArticle.slug}`} className="block">
                    <div className="aspect-video relative cursor-pointer overflow-hidden">
                      <img 
                        src={relatedArticle.image} 
                        alt={relatedArticle.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                      <Badge className="absolute top-4 left-4 bg-blue-600 text-white">
                        {relatedArticle.category}
                      </Badge>
                    </div>
                  </Link>
                  <CardHeader>
                    <Link to={`/blog/${relatedArticle.slug}`}>
                      <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 cursor-pointer hover:underline">
                        {relatedArticle.title}
                      </CardTitle>
                    </Link>
                    <CardDescription className="line-clamp-3">
                      {relatedArticle.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{relatedArticle.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(relatedArticle.published_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{relatedArticle.readTime}</span>
                      </div>
                    </div>
                    <Link to={`/blog/${relatedArticle.slug}`}>
                      <Button className="w-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        Read Article
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ArticleDetail;
