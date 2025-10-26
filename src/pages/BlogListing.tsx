import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardDescription, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Calendar, Clock, User, ArrowRight, BookOpen, TrendingUp, Star, ExternalLink } from 'lucide-react';
import { Article } from '../types/article';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';


// Mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

const BlogListing = () => {
  const [blogPosts, setBlogPosts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery] = useState("");
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'relevant' | 'readTime' | 'trending'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  const isMobile = useIsMobile();

  // Fetch articles from the API
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/articles');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Article[] = await response.json();
        // Convert date strings to Date objects for consistent sorting
        const articlesWithDateObjects = data.map(article => ({
          ...article,
          published_date: new Date(article.published_date)
        }));
        setBlogPosts(articlesWithDateObjects);
      } catch (e: any) {
        setError(e.message);
        console.error("Failed to fetch articles:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  // Categories logic
  const categories = [
    { name: "All", count: blogPosts.length },
    ...Array.from(new Set(blogPosts.map(post => post.category)))
      .map(category => ({
        name: category,
        count: blogPosts.filter(post => post.category === category).length,
      })),
  ];

  // Search function
  const searchPosts = (posts: Article[], query: string) => {
    if (!query.trim()) return posts;

    const searchTerms = query.toLowerCase().split(' ');
    return posts.filter(post => {
      const searchText = `${post.title} ${post.excerpt} ${post.author} ${post.category}`.toLowerCase();
      return searchTerms.every(term => searchText.includes(term));
    });
  };

  // Filter posts based on selected category and search query
  let filteredPosts = selectedCategory === "All"
    ? blogPosts
    : blogPosts.filter(post => post.category === selectedCategory);

  // Apply search filter
  filteredPosts = searchPosts(filteredPosts, searchQuery);

  // Get trending articles (high-priority, comprehensive content)
  const getTrendingScore = (post: Article) => {
    let score = 0;
    // Articles with 'featured' flag get bonus points
    if (post.featured) score += 50;
    // Longer articles (more comprehensive) get higher scores
    const wordCount = Array.isArray(post.content) ? post.content.reduce((count: number, block: any) => {
      if (block.type === 'paragraph' && block.content) {
        return count + block.content.split(' ').length;
      }
      return count;
    }, 0) : 0;
    score += Math.min(wordCount / 100, 50); // Cap at 50 points for word count
    return score;
  };

  // Sort posts based on selected sort option
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.published_date).getTime() - new Date(b.published_date).getTime();
      case 'relevant':
        // Simple relevance scoring based on search query
        if (searchQuery) {
          const aScore = searchPosts([a], searchQuery).length;
          const bScore = searchPosts([b], searchQuery).length;
          return bScore - aScore;
        }
        return new Date(b.published_date).getTime() - new Date(a.published_date).getTime();
      case 'readTime':
        // Assuming readTime is a string like "5 min read"
        return parseInt(a.readTime) - parseInt(b.readTime);
      case 'trending':
        return getTrendingScore(b) - getTrendingScore(a);
      case 'newest':
      default:
        return new Date(b.published_date).getTime() - new Date(a.published_date).getTime();
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = sortedPosts.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navigation />
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse"></div>
              <div className="h-10 bg-gray-300 w-2/3 mx-auto mb-6 rounded animate-pulse"></div>
              <div className="h-6 bg-gray-400 w-1/2 mx-auto mb-8 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {[...Array(postsPerPage)].map((_, i) => (
                <Card key={i} className="group hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm border-blue-100 animate-pulse">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3">
                      <div className="aspect-video md:aspect-square relative overflow-hidden bg-gray-200"></div>
                    </div>
                    <div className="md:w-2/3 p-6">
                      <div className="h-4 bg-gray-300 w-3/4 mb-3 rounded"></div>
                      <div className="h-4 bg-gray-300 w-1/2 mb-4 rounded"></div>
                      <div className="h-4 bg-gray-200 w-full mb-2 rounded"></div>
                      <div className="h-4 bg-gray-200 w-5/6 rounded"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-16 flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 bg-gray-100 rounded-lg animate-pulse"></div>
            </div>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Articles</h2>
          <p className="text-gray-700">{error}</p>
          <p className="text-gray-700 mt-2">Please try refreshing the page or contact support if the issue persists.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced SEO with Helmet */}
      <Helmet>
        <title>Compliance Blog 2025: Expert Insights & Best Practices | Custodia</title>
        <meta name="description" content="Stay updated with the latest compliance trends, best practices, and expert insights. Read our comprehensive guides on SOC 2, HIPAA, ISO 27001, and more compliance frameworks." />
        <meta name="keywords" content="compliance blog 2025, SOC 2 blog, HIPAA blog, ISO 27001 blog, compliance best practices, compliance insights, GRC blog, cybersecurity blog, compliance articles, compliance guides" />
        <link rel="canonical" href="https://custodiallc.com/blog" />

        {/* Open Graph Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Compliance Blog 2025: Expert Insights & Best Practices" />
        <meta property="og:description" content="Stay updated with the latest compliance trends, best practices, and expert insights. Read our comprehensive guides on SOC 2, HIPAA, ISO 27001, and more." />
        <meta property="og:url" content="https://custodiallc.com/blog" />
        <meta property="og:image" content="https://custodiallc.com/custodia-logo.jpg" />
        <meta property="og:site_name" content="Custodia, LLC" />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Compliance Blog 2025: Expert Insights & Best Practices" />
        <meta name="twitter:description" content="Stay updated with the latest compliance trends, best practices, and expert insights." />
        <meta name="twitter:image" content="https://custodiallc.com/custodia-logo.jpg" />
        <meta name="twitter:site" content="@custodia_llc" />

        <meta name="robots" content="index, follow" />
        <meta name="author" content="Custodia Team" />
      </Helmet>
      
      {/* Navigation Header */}
      <Navigation />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Results Summary */}
        {searchQuery && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Search Results for "{searchQuery}"
            </h3>
            <p className="text-blue-700">
              Found {sortedPosts.length} article{sortedPosts.length !== 1 ? 's' : ''}
              {selectedCategory !== "All" && ` in ${selectedCategory}`}
            </p>
          </div>
        )}

        {/* Category Tabs - Responsive Design */}
        <div className="mb-8">
          {isMobile ? (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="categories">
                <AccordionTrigger className="flex justify-between items-center px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm text-lg font-semibold text-gray-800 hover:bg-gray-50 transition-colors">
                  Filter Categories
                </AccordionTrigger>
                <AccordionContent className="pt-4 px-2">
                  <div className="flex flex-wrap justify-center gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category.name}
                        variant={selectedCategory === category.name ? "default" : "outline"}
                        onClick={() => setSelectedCategory(category.name)}
                        className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          selectedCategory === category.name ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <span className="truncate">{category.name}</span>
                        <span className={`inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                          selectedCategory === category.name ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {category.count}
                        </span>
                      </Button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : (
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
              <div className="flex justify-center">
                <TabsList className="inline-flex items-center bg-white shadow-sm border border-gray-200 p-1 rounded-full gap-0.5 max-w-full overflow-x-auto scrollbar-hide">
                  {categories.map((category) => (
                    <TabsTrigger
                      key={category.name}
                      value={category.name}
                      className="relative flex items-center gap-1.5 whitespace-nowrap px-2 sm:px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200"
                    >
                      <span className="truncate max-w-[80px] sm:max-w-none">{category.name}</span>
                      <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                        {category.count}
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </Tabs>
          )}
        </div>

        {/* Sort Options */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="trending">Trending</option>
              <option value="relevant">Most Relevant</option>
              <option value="readTime">Reading Time</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Showing {sortedPosts.length} article{sortedPosts.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Articles List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentPosts.length > 0 ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {selectedCategory === "All" ? "All Articles" : `${selectedCategory} Articles`}
                </h2>
                <div className="space-y-6">
                  {currentPosts.map((post) => {
                    // Calculate word count for content depth indicator
                    const wordCount = Array.isArray(post.content) ? post.content.reduce((count: number, block: any) => {
                      if (block.type === 'paragraph' && block.content) {
                        return count + block.content.split(' ').length;
                      }
                      return count;
                    }, 0) : 0;

                    // Check if this is a comprehensive article (high-priority)
                    const isComprehensive = post.category === "Compliance" && wordCount > 1500;
                    const isFeatured = post.featured;

                    return (
                      <Card key={post.id} className={`group hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm border-blue-100 ${isComprehensive ? 'ring-2 ring-blue-200' : ''}`}>
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/3">
                            <Link to={`/blog/${post.slug}`} className="block">
                              <div className="aspect-video md:aspect-square relative overflow-hidden cursor-pointer">
                                <img
                                  src={post.image}
                                  alt={post.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                <div className="absolute top-3 left-3 flex flex-col gap-2">
                                  <Badge className="bg-blue-600 text-white text-xs">
                                    {post.category}
                                  </Badge>
                                  {isComprehensive && (
                                    <Badge className="bg-green-600 text-white text-xs flex items-center gap-1">
                                      <Star className="w-3 h-3" />
                                      Comprehensive
                                    </Badge>
                                  )}
                                  {isFeatured && (
                                    <Badge className="bg-purple-600 text-white text-xs flex items-center gap-1">
                                      <TrendingUp className="w-3 h-3" />
                                      Featured
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </Link>
                          </div>
                          <div className="md:w-2/3 p-6">
                            <Link to={`/blog/${post.slug}`}>
                              <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-3 cursor-pointer hover:underline">
                                <ReactMarkdown>{post.title}</ReactMarkdown>
                              </CardTitle>
                            </Link>
                            <CardDescription className="text-gray-600 mb-4 line-clamp-3">
                              <ReactMarkdown>{post.excerpt}</ReactMarkdown>
                            </CardDescription>

                            {/* Content indicators */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {Array.isArray(post.content) && post.content.some((block: any) => block.type === 'stats') && (
                                <Badge variant="outline" className="text-xs">
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  Statistics
                                </Badge>
                              )}
                              {Array.isArray(post.content) && post.content.some((block: any) => block.type === 'table') && (
                                <Badge variant="outline" className="text-xs">
                                  <ExternalLink className="w-3 h-3 mr-1" />
                                  Data Tables
                                </Badge>
                              )}
                              {Array.isArray(post.content) && post.content.some((block: any) => block.type === 'steps') && (
                                <Badge variant="outline" className="text-xs">
                                  <BookOpen className="w-3 h-3 mr-1" />
                                  Step-by-Step
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  <span>{post.author}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{new Date(post.published_date).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{post.readTime}</span>
                              </div>
                            </div>
                            <Link to={`/blog/${post.slug}`}>
                              <Button variant="outline" className="group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors">
                                Read More
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2"
                    >
                      Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1 min-w-[40px] ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              /* No Results Message */
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No articles found</h3>
                <p className="text-gray-600">No articles available in the {selectedCategory} category.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-16 flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
              {/* Placeholder for future sidebar content */}
              <div className="text-center text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">Sidebar content can be added here</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BlogListing;
