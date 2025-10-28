import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Clock, ArrowRight, BookOpen, Star, ExternalLink, Shield, CheckCircle } from 'lucide-react';
import { Article } from '../types/article';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import ComplianceChat from '../components/ComplianceChat';

interface CategoryLandingProps {
  category: string;
}

const CategoryLanding = ({ category }: CategoryLandingProps) => {
  const [blogPosts, setBlogPosts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'relevant' | 'readTime' | 'trending'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  // Category-specific information
  const categoryInfo = {
    'SOC 2': {
      title: 'SOC 2 Compliance',
      description: 'Comprehensive SOC 2 compliance guidance for SaaS companies and service providers. Get audit-ready with expert insights on Type I and Type II requirements.',
      icon: Shield,
      color: 'blue',
      benefits: [
        'Trust Service Criteria guidance',
        'Audit preparation strategies',
        'Control implementation best practices',
        'Cost and timeline optimization'
      ],
      ctaTitle: 'Get SOC 2 Ready',
      ctaDescription: 'Let our experts help you achieve SOC 2 compliance efficiently and cost-effectively.'
    },
    'ISO 27001': {
      title: 'ISO 27001 Certification',
      description: 'International standard for information security management systems. Comprehensive guidance for achieving ISO 27001 certification.',
      icon: CheckCircle,
      color: 'green',
      benefits: [
        'ISMS implementation roadmap',
        '114 control requirements',
        'Certification process guidance',
        'Risk management strategies'
      ],
      ctaTitle: 'Start ISO 27001 Journey',
      ctaDescription: 'Our certified experts will guide you through every step of ISO 27001 implementation.'
    },
    'HIPAA': {
      title: 'HIPAA Compliance',
      description: 'Healthcare compliance guidance for protecting patient health information. Essential for healthcare providers and healthtech companies.',
      icon: Shield,
      color: 'purple',
      benefits: [
        'Privacy Rule compliance',
        'Security Rule implementation',
        'Breach notification procedures',
        'Business Associate agreements'
      ],
      ctaTitle: 'Ensure HIPAA Compliance',
      ctaDescription: 'Protect patient data and avoid costly violations with our HIPAA expertise.'
    },
    'PCI DSS': {
      title: 'PCI DSS Compliance',
      description: 'Payment card industry security standards for organizations handling credit card data. Essential for e-commerce and payment processing.',
      icon: Shield,
      color: 'orange',
      benefits: [
        '12 PCI DSS requirements',
        'Self-Assessment Questionnaire (SAQ)',
        'Compliance level determination',
        'Security control implementation'
      ],
      ctaTitle: 'Secure Payment Processing',
      ctaDescription: 'Achieve PCI DSS compliance and protect your customers\' payment data.'
    },
    'GDPR': {
      title: 'GDPR Compliance',
      description: 'EU General Data Protection Regulation compliance for US companies processing EU residents\' personal data.',
      icon: Shield,
      color: 'indigo',
      benefits: [
        'Data mapping and inventory',
        'Consent management systems',
        'Breach notification procedures',
        'Privacy by design principles'
      ],
      ctaTitle: 'GDPR Compliance Support',
      ctaDescription: 'Navigate GDPR requirements and avoid costly fines with expert guidance.'
    },
    'FedRAMP': {
      title: 'FedRAMP Authorization',
      description: 'Federal Risk and Authorization Management Program for cloud service providers targeting government contracts.',
      icon: Shield,
      color: 'red',
      benefits: [
        'Authorization process guidance',
        'Security control implementation',
        'Continuous monitoring setup',
        'Government contract readiness'
      ],
      ctaTitle: 'Get FedRAMP Ready',
      ctaDescription: 'Unlock government cloud opportunities with FedRAMP authorization.'
    },
    'CMMC': {
      title: 'CMMC Compliance',
      description: 'Cybersecurity Maturity Model Certification for defense contractors handling controlled unclassified information.',
      icon: Shield,
      color: 'gray',
      benefits: [
        'Maturity level assessment',
        'NIST 800-171 implementation',
        'Certification process guidance',
        'Defense contract compliance'
      ],
      ctaTitle: 'CMMC Certification Support',
      ctaDescription: 'Secure defense contracts with CMMC compliance expertise.'
    },
    'NIST CSF': {
      title: 'NIST Cybersecurity Framework',
      description: 'National Institute of Standards and Technology Cybersecurity Framework implementation for comprehensive security management.',
      icon: Shield,
      color: 'teal',
      benefits: [
        'Framework implementation roadmap',
        'Risk assessment methodologies',
        'Security control mapping',
        'Continuous improvement processes'
      ],
      ctaTitle: 'Implement NIST CSF',
      ctaDescription: 'Strengthen your cybersecurity posture with NIST Framework implementation.'
    },
    'HITRUST': {
      title: 'HITRUST Certification',
      description: 'Health Information Trust Alliance certification for healthcare organizations requiring comprehensive security and privacy controls.',
      icon: Shield,
      color: 'pink',
      benefits: [
        'Comprehensive control framework',
        'Healthcare-specific requirements',
        'Certification process guidance',
        'Risk management integration'
      ],
      ctaTitle: 'HITRUST Certification',
      ctaDescription: 'Achieve healthcare industry gold standard with HITRUST certification.'
    }
  };

  const info = categoryInfo[category as keyof typeof categoryInfo] || {
    title: category,
    description: `Comprehensive guidance and resources for ${category} compliance.`,
    icon: Shield,
    color: 'blue',
    benefits: ['Expert guidance', 'Best practices', 'Implementation support', 'Compliance assurance'],
    ctaTitle: 'Get Expert Help',
    ctaDescription: 'Let our compliance experts help you achieve your goals.'
  };

  const IconComponent = info.icon;

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
        // Filter articles by category
        const categoryArticles = data.filter(article => article.category === category);
        // Convert date strings to Date objects for consistent sorting
        const articlesWithDateObjects = categoryArticles.map(article => ({
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
  }, [category]);

  // Sort posts based on selected criteria
  const sortedPosts = [...blogPosts].sort((a, b) => {
    const aDate = new Date(a.published_date);
    const bDate = new Date(b.published_date);
    
    switch (sortBy) {
      case 'newest':
        return bDate.getTime() - aDate.getTime();
      case 'oldest':
        return aDate.getTime() - bDate.getTime();
      case 'readTime':
        const aTime = parseInt(a.readTime.replace(/\D/g, '')) || 0;
        const bTime = parseInt(b.readTime.replace(/\D/g, '')) || 0;
        return bTime - aTime;
      case 'trending':
        // For now, use featured status as trending indicator
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = sortedPosts.slice(startIndex, startIndex + postsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse"></div>
            <div className="h-8 bg-gray-300 w-1/3 mx-auto mb-6 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 w-1/2 mx-auto rounded animate-pulse"></div>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Error Loading Articles</h1>
          <p className="text-lg text-gray-700 mb-6">{error}</p>
          <Link to="/blog">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
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
      <Helmet>
        <title>{info.title} Compliance Resources | Custodia, LLC</title>
        <meta name="description" content={info.description} />
        <meta name="keywords" content={`${category}, compliance, security, audit, certification, implementation`} />
        <link rel="canonical" href={`https://fullstack-473115.web.app/compliance/${category.toLowerCase().replace(/\s+/g, '-')}`} />
        
        {/* Open Graph Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${info.title} Compliance Resources`} />
        <meta property="og:description" content={info.description} />
        <meta property="og:url" content={`https://fullstack-473115.web.app/compliance/${category.toLowerCase().replace(/\s+/g, '-')}`} />
        <meta property="og:image" content="https://fullstack-473115.web.app/assets/custodia logo transparent.png" />
        <meta property="og:site_name" content="Custodia, LLC" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${info.title} Compliance Resources`} />
        <meta name="twitter:description" content={info.description} />
        <meta name="twitter:image" content="https://fullstack-473115.web.app/assets/custodia logo transparent.png" />
        
        <meta name="robots" content="index, follow" />
      </Helmet>

      <Navigation />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <IconComponent className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              {info.title} Resources
            </h1>
            <p className="text-lg sm:text-xl text-gray-100 mb-6 sm:mb-8 max-w-3xl mx-auto">
              {info.description}
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {info.benefits.map((benefit, index) => (
                <Badge key={index} className="bg-white/20 text-white border-white/30">
                  {benefit}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Articles List */}
          <div className="lg:col-span-3">
            {/* Sort Options */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <h2 className="text-2xl font-bold text-gray-900">
                  {category} Articles ({sortedPosts.length})
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="readTime">Read Time</option>
                  <option value="trending">Trending</option>
                </select>
              </div>
            </div>

            {/* Articles Grid */}
            {paginatedPosts.length > 0 ? (
              <div className="space-y-8">
                {paginatedPosts.map((post) => (
                  <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 bg-white border-blue-100">
                    <Link to={`/blog/${post.slug}`} className="block">
                      <div className="aspect-video relative cursor-pointer overflow-hidden">
                        <img 
                          src={post.image} 
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                        <Badge className="absolute top-4 left-4 bg-blue-600 text-white">
                          {post.category}
                        </Badge>
                        {post.featured && (
                          <Badge className="absolute top-4 right-4 bg-purple-600 text-white">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                    </Link>
                    <CardHeader>
                      <Link to={`/blog/${post.slug}`}>
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-3 cursor-pointer hover:underline">
                          <ReactMarkdown 
                            components={{
                              p: ({ children }) => <span>{children}</span>
                            }}
                          >
                            {post.title}
                          </ReactMarkdown>
                        </h3>
                      </Link>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-end text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                      <Link to={`/blog/${post.slug}`}>
                        <Button className="w-full group-hover:bg-blue-600 group-hover:text-white transition-colors min-h-[44px] px-4 py-2">
                          Read Article
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
                <p className="text-gray-600 mb-6">We're working on adding more {category} content. Check back soon!</p>
                <Link to="/blog">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    View All Articles
                  </Button>
                </Link>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => handlePageChange(page)}
                      className="w-10"
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-16 space-y-6">
              {/* CTA Section */}
              <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{info.ctaTitle}</h3>
                  <p className="text-gray-600 mb-6">{info.ctaDescription}</p>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white min-h-[44px] px-4 py-3"
                    onClick={() => window.open('https://custodiallc.com/contact', '_blank')}
                  >
                    Get Expert Help
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* AI Compliance Chat */}
              <ComplianceChat />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CategoryLanding;
