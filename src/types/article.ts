export interface Article {
  id: string;
  slug: string;
  tags: string[];
  title: string;
  excerpt: string;
  author: string;
  authorAvatar?: string;
  published_date: string | Date;
  updated_date?: string | Date;
  readTime: string;
  category: string;
  featured: boolean;
  image: string;
  content: ArticleContent[];
  relatedArticles?: string[];
  // SEO fields
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords: string[];
    slug?: string;
  };
  // Enhanced SEO fields
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  keywords?: string[];
  schema?: any; // JSON-LD structured data
  internalLinks?: string[];
  externalLinks?: string[];
}

export interface ArticleContent {
  type: 'paragraph' | 'heading' | 'list' | 'callout' | 'cta' | 'quote' | 'table' | 'stats' | 'chart' | 'steps' | 'toolRecommendation';
  content?: string;
  level?: number;
  items?: string[];
  variant?: 'info' | 'warning' | 'success' | 'error' | 'tip' | 'pro-tip' | 'note';
  ctaType?: 'package-builder' | 'consultation' | 'contact' | 'trial';
  author?: string;
  columns?: string[];
  rows?: string[][];
  stats?: StatItem[];
  chartType?: 'comparison' | 'timeline' | 'cost';
  chartData?: any;
  steps?: StepItem[];
  tools?: ToolRecommendation[];
  title?: string;
  intro?: string;
  cta_title?: string;
  cta_button_text?: string;
  cta_button_url?: string;
}

export interface StatItem {
  label: string;
  value: string;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface StepItem {
  number?: number;
  title: string;
  description: string;
  duration?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface ToolRecommendation {
  name: string;
  description: string;
  category: string;
  pricing: string;
  features: string[];
  pros: string[];
  cons: string[];
  bestFor: string;
  affiliateUrl?: string;
  image?: string;
}
