import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import GeminiClient from './lib/gemini-client.js';
import EnhancedKeywordResearch, { KeywordOpportunity } from './lib/enhanced-keyword-research.js';
import EATOptimizer, { EATOptimization } from './lib/eat-optimizer.js';
import FeaturedSnippetOptimizer, { SnippetOptimization } from './lib/featured-snippet-optimizer.js';
import ContentQualityAnalyzer, { QualityAnalysis } from './lib/content-quality-analyzer.js';
import CompetitorAnalyzer, { CompetitiveGapAnalysis } from './lib/competitor-analyzer.js';
import EnhancedPromptEngineer from './lib/enhanced-prompt-engineer.js';
import SEOPerformanceTracker from './lib/seo-performance-tracker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Enhanced Multi-Compliance Article Generator Configuration
// Organized by GROWTH_STRATEGY_100K_VIEWS.md phases
const enhancedArticles = [
  // ============================================================
  // PHASE 1: FOUNDATION (Months 1-3) - 40 articles total
  // Priority 1: Ultra-High Volume (20 articles)
  // ============================================================
  
  // SOC 2 (10 articles)
  {
    topic: "SOC 2 Type II Audit Preparation: Complete 90-Day Checklist [2025]",
    category: "SOC 2",
    primaryKeyword: "SOC 2 Type II audit preparation",
    secondaryKeywords: ["SOC 2 audit preparation", "SOC 2 Type II checklist", "SOC 2 audit timeline", "SOC 2 audit steps", "SOC 2 audit requirements"],
    searchVolume: "8,000+",
    expectedTraffic: "5,000-8,000/month",
    priority: 1,
    phase: "FOUNDATION",
    competitorUrls: [
      "https://www.splunk.com/en_us/blog/learn/soc-2-compliance-checklist.html",
      "https://drata.com/grc-central/soc-2/compliance-checklist",
      "https://auditboard.com/blog/soc-2-compliance-checklist"
    ],
    opportunityAnalysis: {
      competitionScore: 75,
      opportunityScore: 85,
      difficultyScore: 70,
      commercialValue: 90,
      featuredSnippetOpportunity: true
    }
  },
  {
    topic: "SOC 2 Cost Breakdown: Complete Pricing Guide for 2025",
    category: "SOC 2",
    primaryKeyword: "SOC 2 cost",
    secondaryKeywords: ["SOC 2 pricing", "SOC 2 audit cost", "SOC 2 implementation cost", "SOC 2 Type II cost", "SOC 2 compliance cost"],
    searchVolume: "12,000+",
    expectedTraffic: "8,000-12,000/month",
    priority: 1,
    phase: "FOUNDATION",
    competitorUrls: [
      "https://www.vanta.com/resources/soc-2-cost",
      "https://www.secureframe.com/blog/soc-2-cost",
      "https://www.drata.com/grc-central/soc-2/soc-2-cost"
    ],
    opportunityAnalysis: {
      competitionScore: 80,
      opportunityScore: 90,
      difficultyScore: 75,
      commercialValue: 95,
      featuredSnippetOpportunity: true
    }
  },
  {
    topic: "SOC 2 Controls List: Complete Implementation Guide [Free Template]",
    category: "SOC 2",
    primaryKeyword: "SOC 2 controls",
    secondaryKeywords: ["SOC 2 Trust Service Criteria", "SOC 2 control requirements", "SOC 2 control implementation", "SOC 2 control testing", "SOC 2 control documentation"],
    searchVolume: "6,000+",
    expectedTraffic: "4,000-6,000/month",
    priority: 1,
    phase: "FOUNDATION",
    competitorUrls: [
      "https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/aicpasoc2report.html",
      "https://www.soc2.com/soc-2-controls"
    ],
    opportunityAnalysis: {
      competitionScore: 70,
      opportunityScore: 80,
      difficultyScore: 65,
      commercialValue: 85,
      featuredSnippetOpportunity: true
    }
  },
  {
    topic: "SOC 2 vs ISO 27001: Complete Comparison Guide [2025]",
    category: "SOC 2",
    primaryKeyword: "SOC 2 vs ISO 27001",
    secondaryKeywords: ["SOC 2 vs ISO 27001 comparison", "SOC 2 vs ISO 27001 differences", "SOC 2 vs ISO 27001 cost", "SOC 2 vs ISO 27001 requirements"],
    searchVolume: "7,000+",
    expectedTraffic: "5,000-7,000/month",
    priority: 1,
    phase: "FOUNDATION",
    competitorUrls: [
      "https://www.vanta.com/resources/soc-2-vs-iso-27001",
      "https://www.secureframe.com/blog/soc-2-vs-iso-27001"
    ],
    opportunityAnalysis: {
      competitionScore: 75,
      opportunityScore: 85,
      difficultyScore: 70,
      commercialValue: 90,
      featuredSnippetOpportunity: true
    }
  },
  {
    topic: "SOC 2 Timeline: Complete Implementation Roadmap [2025]",
    category: "SOC 2",
    primaryKeyword: "SOC 2 timeline",
    secondaryKeywords: ["SOC 2 implementation timeline", "SOC 2 audit timeline", "SOC 2 Type II timeline", "SOC 2 preparation timeline"],
    searchVolume: "7,000+",
    expectedTraffic: "5,000-7,000/month",
    priority: 1,
    phase: "FOUNDATION",
    competitorUrls: [
      "https://www.vanta.com/resources/soc-2-timeline",
      "https://www.secureframe.com/blog/soc-2-timeline"
    ],
    opportunityAnalysis: {
      competitionScore: 70,
      opportunityScore: 80,
      difficultyScore: 65,
      commercialValue: 85,
      featuredSnippetOpportunity: true
    }
  },
  {
    topic: "SOC 2 for Startups: Complete Guide to Affordable Compliance [2025]",
    category: "SOC 2",
    primaryKeyword: "SOC 2 for startups",
    secondaryKeywords: ["SOC 2 startup guide", "SOC 2 for small companies", "SOC 2 for SaaS startups", "SOC 2 startup cost"],
    searchVolume: "5,000+",
    expectedTraffic: "3,000-5,000/month",
    priority: 1,
    phase: "FOUNDATION",
    competitorUrls: [
      "https://www.vanta.com/resources/soc-2-for-startups",
      "https://www.secureframe.com/blog/soc-2-for-startups"
    ],
    opportunityAnalysis: {
      competitionScore: 60,
      opportunityScore: 85,
      difficultyScore: 55,
      commercialValue: 90,
      featuredSnippetOpportunity: true
    }
  },
  {
    topic: "SOC 2 Type I vs Type II: Complete Comparison Guide [2025]",
    category: "SOC 2",
    primaryKeyword: "SOC 2 Type I vs Type II",
    secondaryKeywords: ["SOC 2 Type I vs Type II differences", "SOC 2 Type I vs Type II cost", "SOC 2 Type I vs Type II timeline"],
    searchVolume: "8,000+",
    expectedTraffic: "5,000-8,000/month",
    priority: 1,
    phase: "FOUNDATION",
    competitorUrls: [
      "https://www.vanta.com/resources/soc-2-type-i-vs-type-ii",
      "https://www.secureframe.com/blog/soc-2-type-i-vs-type-ii"
    ],
    opportunityAnalysis: {
      competitionScore: 70,
      opportunityScore: 85,
      difficultyScore: 65,
      commercialValue: 90,
      featuredSnippetOpportunity: true
    }
  },
  {
    topic: "SOC 2 Common Failures: Top 10 Audit Mistakes & How to Avoid Them",
    category: "SOC 2",
    primaryKeyword: "SOC 2 audit failures",
    secondaryKeywords: ["SOC 2 common mistakes", "SOC 2 audit mistakes", "SOC 2 compliance failures"],
    searchVolume: "4,000+",
    expectedTraffic: "2,500-4,000/month",
    priority: 1,
    phase: "FOUNDATION",
    competitorUrls: [
      "https://www.vanta.com/resources/soc-2-common-mistakes",
      "https://www.secureframe.com/blog/soc-2-mistakes"
    ],
    opportunityAnalysis: {
      competitionScore: 65,
      opportunityScore: 80,
      difficultyScore: 60,
      commercialValue: 85,
      featuredSnippetOpportunity: true
    }
  },
  {
    topic: "SOC 2 Automation Tools: Complete Comparison Guide [2025]",
    category: "SOC 2",
    primaryKeyword: "SOC 2 automation tools",
    secondaryKeywords: ["SOC 2 compliance software", "SOC 2 automation platforms", "SOC 2 compliance tools"],
    searchVolume: "3,000+",
    expectedTraffic: "2,000-3,000/month",
    priority: 1,
    phase: "FOUNDATION",
    competitorUrls: [
      "https://www.drata.com/",
      "https://www.vanta.com/",
      "https://www.secureframe.com/"
    ],
    opportunityAnalysis: {
      competitionScore: 70,
      opportunityScore: 75,
      difficultyScore: 65,
      commercialValue: 80,
      featuredSnippetOpportunity: true
    }
  },
  {
    topic: "SOC 2 for SaaS Companies: Complete Implementation Guide [2025]",
    category: "SOC 2",
    primaryKeyword: "SOC 2 SaaS compliance",
    secondaryKeywords: ["SOC 2 SaaS", "SOC 2 software companies", "SOC 2 cloud services"],
    searchVolume: "2,000+",
    expectedTraffic: "1,500-2,500/month",
    priority: 1,
    phase: "FOUNDATION",
    competitorUrls: [
      "https://www.vanta.com/resources/soc-2-saas",
      "https://www.secureframe.com/blog/soc-2-saas"
    ],
    opportunityAnalysis: {
      competitionScore: 55,
      opportunityScore: 80,
      difficultyScore: 50,
      commercialValue: 85,
      featuredSnippetOpportunity: true
    }
  },

  // HIPAA (8 articles)
  {
    topic: "HIPAA Compliance Checklist: Complete Guide for 2025",
    category: "HIPAA",
    primaryKeyword: "HIPAA compliance checklist",
    secondaryKeywords: ["HIPAA requirements", "HIPAA compliance guide", "HIPAA rules", "HIPAA security rule"],
    searchVolume: "9,000+",
    expectedTraffic: "6,000-9,000/month",
    priority: 1,
    phase: "FOUNDATION",
    competitorUrls: [
      "https://www.hhs.gov/hipaa/index.html",
      "https://www.hipaaguide.net/",
      "https://compliancy-group.com/"
    ],
    opportunityAnalysis: {
      competitionScore: 80,
      opportunityScore: 90,
      difficultyScore: 75,
      commercialValue: 95,
      featuredSnippetOpportunity: true
    }
  },
  {
    topic: "HIPAA Violation Penalties: Complete Guide & Examples [2025]",
    category: "HIPAA",
    primaryKeyword: "HIPAA violation penalties",
    secondaryKeywords: ["HIPAA fines", "HIPAA penalties", "HIPAA violations", "HIPAA enforcement"],
    searchVolume: "12,000+",
    expectedTraffic: "8,000-12,000/month",
    priority: 1,
    phase: "FOUNDATION",
    competitorUrls: [
      "https://www.hhs.gov/hipaa/for-professionals/compliance-enforcement/",
      "https://www.hipaaguide.net/hipaa-fines/"
    ],
    opportunityAnalysis: {
      competitionScore: 80,
      opportunityScore: 90,
      difficultyScore: 75,
      commercialValue: 95,
      featuredSnippetOpportunity: true
    }
  },
  {
    topic: "HIPAA vs HITECH: Complete Comparison Guide [2025]",
    category: "HIPAA",
    primaryKeyword: "HIPAA vs HITECH",
    secondaryKeywords: ["HIPAA vs HITECH comparison", "HIPAA vs HITECH differences", "HITECH Act compliance"],
    searchVolume: "6,000+",
    expectedTraffic: "4,000-6,000/month",
    priority: 1,
    phase: "FOUNDATION",
    competitorUrls: [
      "https://www.hhs.gov/hipaa/",
      "https://www.hitechanswers.net/"
    ],
    opportunityAnalysis: {
      competitionScore: 70,
      opportunityScore: 85,
      difficultyScore: 65,
      commercialValue: 90,
      featuredSnippetOpportunity: true
    }
  },
  {
    topic: "HIPAA Business Associate Agreement: Complete Guide [2025]",
    category: "HIPAA",
    primaryKeyword: "HIPAA business associate agreement",
    secondaryKeywords: ["HIPAA BAA", "HIPAA business associate", "HIPAA contracts", "HIPAA agreements"],
    searchVolume: "5,000+",
    expectedTraffic: "3,500-5,000/month",
    priority: 1,
    phase: "FOUNDATION",
    competitorUrls: [
      "https://www.hhs.gov/hipaa/for-professionals/covered-entities/",
      "https://www.hipaaguide.net/"
    ],
    opportunityAnalysis: {
      competitionScore: 70,
      opportunityScore: 85,
      difficultyScore: 65,
      commercialValue: 90,
      featuredSnippetOpportunity: true
    }
  },
  {
    topic: "HIPAA for Healthcare Providers: Complete Implementation Guide [2025]",
    category: "HIPAA",
    primaryKeyword: "HIPAA for healthcare providers",
    secondaryKeywords: ["HIPAA for doctors", "HIPAA for hospitals", "HIPAA provider compliance", "HIPAA medical practices"],
    searchVolume: "4,000+",
    expectedTraffic: "2,500-4,000/month",
    priority: 1,
    phase: "FOUNDATION",
    competitorUrls: [
      "https://www.hipaaguide.net/",
      "https://compliancy-group.com/"
    ],
    opportunityAnalysis: {
      competitionScore: 65,
      opportunityScore: 85,
      difficultyScore: 60,
      commercialValue: 90,
      featuredSnippetOpportunity: true
    }
  },
  {
    topic: "HIPAA Security Rule: Complete Compliance Guide [2025]",
    category: "HIPAA",
    primaryKeyword: "HIPAA security rule",
    secondaryKeywords: ["HIPAA security requirements", "HIPAA technical safeguards", "HIPAA physical safeguards"],
    searchVolume: "3,000+",
    expectedTraffic: "2,000-3,500/month",
    priority: 1,
    phase: "FOUNDATION",
    competitorUrls: [
      "https://www.hhs.gov/hipaa/for-professionals/security/",
      "https://www.hipaaguide.net/"
    ],
    opportunityAnalysis: {
      competitionScore: 70,
      opportunityScore: 80,
      difficultyScore: 65,
      commercialValue: 85,
      featuredSnippetOpportunity: true
    }
  },
  {
    topic: "HIPAA Privacy Rule: Complete Guide [2025]",
    category: "HIPAA",
    primaryKeyword: "HIPAA privacy rule",
    secondaryKeywords: ["HIPAA privacy requirements", "HIPAA patient rights", "HIPAA privacy standards"],
    searchVolume: "3,500+",
    expectedTraffic: "2,500-3,500/month",
    priority: 1,
    phase: "FOUNDATION",
    competitorUrls: [
      "https://www.hhs.gov/hipaa/for-professionals/privacy/",
      "https://www.hipaaguide.net/"
    ],
    opportunityAnalysis: {
      competitionScore: 70,
      opportunityScore: 80,
      difficultyScore: 65,
      commercialValue: 85,
      featuredSnippetOpportunity: true
    }
  },
  {
    topic: "HIPAA Risk Assessment: Complete Guide [Free Template]",
    category: "HIPAA",
    primaryKeyword: "HIPAA risk assessment",
    secondaryKeywords: ["HIPAA security risk analysis", "HIPAA risk analysis", "HIPAA assessment template"],
    searchVolume: "2,500+",
    expectedTraffic: "1,800-3,000/month",
    priority: 1,
    phase: "FOUNDATION",
    competitorUrls: [
      "https://www.hhs.gov/hipaa/for-professionals/security/",
      "https://www.hipaaguide.net/"
    ],
    opportunityAnalysis: {
      competitionScore: 60,
      opportunityScore: 80,
      difficultyScore: 55,
      commercialValue: 85,
      featuredSnippetOpportunity: true
    }
  },

  // PCI DSS (2 priority 1 articles - limited to top tier)
  {
    topic: "PCI DSS Compliance Requirements: Complete Guide for 2025",
    category: "PCI DSS",
    primaryKeyword: "PCI DSS compliance requirements",
    secondaryKeywords: ["PCI DSS requirements", "PCI DSS compliance", "PCI DSS standards", "PCI DSS level 1"],
    searchVolume: "14,000+",
    expectedTraffic: "10,000-14,000/month",
    priority: 1,
    phase: "FOUNDATION",
    competitorUrls: [
      "https://www.pcisecuritystandards.org/",
      "https://blog.controlscan.com/",
      "https://www.trustwave.com/"
    ],
    opportunityAnalysis: {
      competitionScore: 85,
      opportunityScore: 90,
      difficultyScore: 80,
      commercialValue: 95,
      featuredSnippetOpportunity: true
    }
  },
  {
    topic: "PCI DSS vs SOC 2: Complete Comparison Guide [2025]",
    category: "PCI DSS",
    primaryKeyword: "PCI DSS vs SOC 2",
    secondaryKeywords: ["PCI DSS vs SOC 2 comparison", "PCI DSS vs SOC 2 differences", "payment security compliance"],
    searchVolume: "7,000+",
    expectedTraffic: "5,000-7,000/month",
    priority: 1,
    phase: "FOUNDATION",
    competitorUrls: [
      "https://www.pcisecuritystandards.org/",
      "https://www.vanta.com/"
    ],
    opportunityAnalysis: {
      competitionScore: 75,
      opportunityScore: 85,
      difficultyScore: 70,
      commercialValue: 90,
      featuredSnippetOpportunity: true
    }
  }
];

class EnhancedArticleGenerator {
  private gemini: GeminiClient;
  private keywordResearch: EnhancedKeywordResearch;
  private eatOptimizer: EATOptimizer;
  private snippetOptimizer: FeaturedSnippetOptimizer;
  private qualityAnalyzer: ContentQualityAnalyzer;
  private competitorAnalyzer: CompetitorAnalyzer;
  private promptEngineer: EnhancedPromptEngineer;
  private performanceTracker: SEOPerformanceTracker;

  constructor() {
    this.gemini = new GeminiClient();
    this.keywordResearch = new EnhancedKeywordResearch();
    this.eatOptimizer = new EATOptimizer();
    this.snippetOptimizer = new FeaturedSnippetOptimizer();
    this.qualityAnalyzer = new ContentQualityAnalyzer();
    this.competitorAnalyzer = new CompetitorAnalyzer();
    this.promptEngineer = new EnhancedPromptEngineer();
    this.performanceTracker = new SEOPerformanceTracker();
  }

  async generateEnhancedArticles(filterPhase?: string, filterCategory?: string) {
    // Filter articles based on phase and category
    let articlesToGenerate = enhancedArticles;
    
    if (filterPhase) {
      articlesToGenerate = articlesToGenerate.filter(a => a.phase === filterPhase);
      console.log(`🚀 Starting Enhanced Article Generation - Phase: ${filterPhase}`);
    } else if (filterCategory) {
      articlesToGenerate = articlesToGenerate.filter(a => a.category === filterCategory);
      console.log(`🚀 Starting Enhanced Article Generation - Category: ${filterCategory}`);
    } else {
      console.log('🚀 Starting Enhanced Multi-Compliance Article Generation Campaign...');
    }
    
    console.log(`📊 Target: ${articlesToGenerate.length} high-impact articles with advanced optimization`);
    console.log(`⏱️ Estimated Time: ${articlesToGenerate.length * 5}-${articlesToGenerate.length * 8} minutes\n`);

    const client = await pool.connect();

    try {
      let successCount = 0;
      let failCount = 0;
      const performanceData: Array<{
        articleId: number;
        keyword: string;
        performance: any;
      }> = [];

      for (let i = 0; i < articlesToGenerate.length; i++) {
        const article = articlesToGenerate[i];
        console.log(`\n============================================================`);
        console.log(`📝 Processing ${i + 1}/${articlesToGenerate.length}: ${article.topic}`);
        console.log(`📂 Category: ${article.category} | Priority: Tier ${article.priority}`);
        console.log(`🎯 Expected Traffic: ${article.expectedTraffic}`);
        console.log(`🔍 Primary Keyword: ${article.primaryKeyword} (${article.searchVolume} searches/month)`);
        console.log(`📊 Opportunity Score: ${article.opportunityAnalysis.opportunityScore}/100`);
        console.log(`============================================================`);

        try {
          // Step 1: Advanced Keyword Research & Opportunity Analysis
          console.log('🔍 Step 1: Advanced keyword research and opportunity analysis...');
          const keywordOpportunity = await this.keywordResearch.analyzeKeywordOpportunity(
            article.primaryKeyword,
            article.competitorUrls,
            article.category
          );

          // Step 2: Deep Competitor Analysis & Gap Identification
          console.log('📊 Step 2: Deep competitor analysis and gap identification...');
          const { competitors, gapAnalysis } = await this.competitorAnalyzer.analyzeCompetitors(
            article.competitorUrls,
            article.primaryKeyword,
            article.topic
          );

          // Step 3: E-E-A-T Optimization Analysis
          console.log('🎯 Step 3: E-E-A-T optimization analysis...');
          const eatOptimization = await this.eatOptimizer.optimizeEAT(
            '', // Will be filled after content generation
            article.topic,
            article.category
          );

          // Step 4: Featured Snippet Optimization Analysis
          console.log('📋 Step 4: Featured snippet optimization analysis...');
          const snippetOptimization = await this.snippetOptimizer.optimizeForFeaturedSnippets(
            '', // Will be filled after content generation
            article.primaryKeyword,
            article.topic
          );

          // Step 5: Content Quality Analysis Setup
          console.log('📊 Step 5: Content quality analysis setup...');
          const qualityAnalysis = await this.qualityAnalyzer.analyzeContentQuality(
            '', // Will be filled after content generation
            article.topic,
            article.primaryKeyword
          );

          // Step 6: Enhanced Prompt Engineering
          console.log('🎯 Step 6: Enhanced prompt engineering...');
          const enhancedPrompt = await this.promptEngineer.generateOptimizedPrompt({
            keywordOpportunity,
            eatOptimization,
            snippetOptimization,
            qualityAnalysis,
            gapAnalysis,
            topic: article.topic,
            category: article.category
          });

          // Step 7: Generate Optimized Content
          console.log('🤖 Step 7: Generating optimized content with Gemini AI...');
          const content = await this.gemini.generateContent(enhancedPrompt, { temperature: 0.7 });
          console.log(`✅ Content generated: ${content.length} characters`);

          // Step 8: Post-Generation Analysis & Optimization
          console.log('🔍 Step 8: Post-generation analysis and optimization...');
          
          // Re-analyze with actual content
          const finalEATOptimization = await this.eatOptimizer.optimizeEAT(content, article.topic, article.category);
          const finalSnippetOptimization = await this.snippetOptimizer.optimizeForFeaturedSnippets(content, article.primaryKeyword, article.topic);
          const finalQualityAnalysis = await this.qualityAnalyzer.analyzeContentQuality(content, article.topic, article.primaryKeyword);

          // Step 9: Parse Content into Structured Blocks
          console.log('📊 Step 9: Parsing content into structured blocks...');
          const contentBlocks = this.parseContentToBlocks(content);
          console.log(`📊 Parsed into ${contentBlocks.length} content blocks`);

          // Step 10: Generate Enhanced Article Metadata
          console.log('📝 Step 10: Generating enhanced article metadata...');
          const slug = article.topic.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();

          const articleData = {
            slug: slug,
            title: article.topic,
            author: 'Custodia Team',
            authorAvatar: '/images/authors/custodia-team.jpg',
            category: article.category,
            excerpt: this.generateExcerpt(content, article.primaryKeyword),
            readTime: this.calculateReadTime(content),
            tags: this.generateTags(article.primaryKeyword, article.secondaryKeywords),
            featured: article.priority <= 2,
            image: `/images/blog/${slug}-2025.png`,
            imageAlt: article.topic,
            // Enhanced SEO fields
            metaTitle: article.topic.length > 60 ? article.topic.substring(0, 60) : article.topic,
            metaDescription: this.generateMetaDescription(content, article.primaryKeyword),
            focusKeyword: article.primaryKeyword,
            keywords: article.secondaryKeywords,
            schema: this.generateSchema(article),
            internalLinks: [],
            externalLinks: [],
            content: contentBlocks,
            // Advanced optimization data
            optimizationData: {
              keywordOpportunity,
              eatOptimization: finalEATOptimization,
              snippetOptimization: finalSnippetOptimization,
              qualityAnalysis: finalQualityAnalysis,
              gapAnalysis,
              competitorAnalysis: competitors
            }
          };

          console.log(`📊 Enhanced article data prepared:`);
          console.log(`   - Slug: ${articleData.slug}`);
          console.log(`   - Title: ${articleData.title}`);
          console.log(`   - Meta Title: ${articleData.metaTitle} (${articleData.metaTitle.length} chars)`);
          console.log(`   - Meta Description: ${articleData.metaDescription.length} chars`);
          console.log(`   - Content blocks: ${articleData.content.length}`);
          console.log(`   - E-E-A-T Score: ${finalEATOptimization.score}/100`);
          console.log(`   - Snippet Score: ${finalSnippetOptimization.optimizationScore}/100`);
          console.log(`   - Quality Score: ${finalQualityAnalysis.overallScore}/100`);

          // Step 11: Deploy to Database
          console.log('\n🚀 Step 11: Deploying enhanced article to Neon database...');
          await client.query('DELETE FROM articles WHERE slug = $1', [articleData.slug]);
          
          const insertResult = await client.query(
            `INSERT INTO articles (
              slug, title, author, author_avatar, image, image_alt, category, tags,
              excerpt, content, read_time, featured, seo, related_articles,
              meta_title, meta_description, focus_keyword, keywords, schema_data, internal_links, external_links
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
            RETURNING id`,
            [
              articleData.slug, articleData.title, articleData.author, articleData.authorAvatar,
              articleData.image, articleData.imageAlt, articleData.category, articleData.tags,
              articleData.excerpt, JSON.stringify(articleData.content), articleData.readTime,
              articleData.featured, JSON.stringify(articleData.optimizationData), [], 
              articleData.metaTitle, articleData.metaDescription,
              articleData.focusKeyword, articleData.keywords, JSON.stringify(articleData.schema),
              articleData.internalLinks, articleData.externalLinks
            ]
          );

          console.log(`✅ Enhanced article deployed successfully!`);
          console.log(`📝 Article ID: ${insertResult.rows[0].id}`);
          console.log(`🎯 Focus keyword: ${articleData.focusKeyword}`);
          console.log(`📊 Content blocks: ${articleData.content.length}`);
          console.log(`🏆 Optimization scores:`);
          console.log(`   - E-E-A-T: ${finalEATOptimization.score}/100`);
          console.log(`   - Featured Snippets: ${finalSnippetOptimization.optimizationScore}/100`);
          console.log(`   - Content Quality: ${finalQualityAnalysis.overallScore}/100`);

          // Step 12: Performance Tracking Setup
          console.log('📊 Step 12: Setting up performance tracking...');
          const performanceAnalysis = await this.performanceTracker.trackPerformance(
            insertResult.rows[0].id.toString(),
            article.primaryKeyword,
            `https://custodiacompliance.com/blog/${slug}`
          );

          performanceData.push({
            articleId: insertResult.rows[0].id,
            keyword: article.primaryKeyword,
            performance: performanceAnalysis
          });

          successCount++;
          console.log(`\n🎉 Successfully completed: ${article.topic}`);
          console.log(`📈 Performance Score: ${performanceAnalysis.overallScore}/100`);

          // Wait between articles to avoid rate limiting
          if (i < articlesToGenerate.length - 1) {
            console.log('⏳ Waiting 5 seconds before next article...');
            await new Promise(resolve => setTimeout(resolve, 5000));
          }

        } catch (error) {
          console.error(`❌ Error generating enhanced article for ${article.topic}:`, error);
          failCount++;
        }
      }

      // Final Summary
      console.log(`\n============================================================`);
      console.log(`🎉 ENHANCED ARTICLE GENERATION CAMPAIGN COMPLETED!`);
      console.log(`============================================================`);
      console.log(`✅ Successfully processed: ${successCount} enhanced articles`);
      console.log(`❌ Failed: ${failCount} articles`);
      console.log(`📊 Success rate: ${Math.round((successCount / articlesToGenerate.length) * 100)}%`);
      console.log(`\n🚀 All enhanced articles are now live in your Neon database!`);
      console.log(`🌐 Check your blog at: https://custodiacompliance.com/blog`);
      
      if (performanceData.length > 0) {
        const avgPerformance = performanceData.reduce((sum, p) => sum + p.performance.overallScore, 0) / performanceData.length;
        console.log(`\n🏆 Average Optimization Score: ${Math.round(avgPerformance)}/100`);
      }

      console.log(`\n🎉 ENHANCED ARTICLE GENERATION COMPLETE!`);
      console.log(`📈 All articles optimized for #1 rankings with advanced SEO techniques`);

    } catch (error) {
      console.error('❌ Error in enhanced article generation campaign:', error);
    } finally {
      client.release();
      await pool.end();
    }
  }

  // Helper functions
  private parseContentToBlocks(content: string) {
    const blocks: any[] = [];
    const lines = content.split('\n').filter(line => line.trim());
    
    let currentBlock: any | null = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('# ')) {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = {
          type: 'heading',
          level: 1,
          content: trimmedLine.substring(2)
        };
      } else if (trimmedLine.startsWith('## ')) {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = {
          type: 'heading',
          level: 2,
          content: trimmedLine.substring(3)
        };
      } else if (trimmedLine.startsWith('### ')) {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = {
          type: 'heading',
          level: 3,
          content: trimmedLine.substring(4)
        };
      } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        if (currentBlock && currentBlock.type === 'list') {
          currentBlock.items.push(trimmedLine.substring(2));
        } else {
          if (currentBlock) blocks.push(currentBlock);
          currentBlock = {
            type: 'list',
            items: [trimmedLine.substring(2)]
          };
        }
      } else if (trimmedLine.length > 0) {
        if (currentBlock && currentBlock.type === 'paragraph') {
          currentBlock.content += ' ' + trimmedLine;
        } else {
          if (currentBlock) blocks.push(currentBlock);
          currentBlock = {
            type: 'paragraph',
            content: trimmedLine
          };
        }
      }
    }
    
    if (currentBlock) blocks.push(currentBlock);
    return blocks;
  }

  private generateExcerpt(content: string, primaryKeyword: string): string {
    const sentences = content.split('.').slice(0, 3);
    let excerpt = sentences.join('.') + '.';
    
    if (!excerpt.toLowerCase().includes(primaryKeyword.toLowerCase())) {
      excerpt = `Complete guide to ${primaryKeyword}. ${excerpt}`;
    }
    
    return excerpt.substring(0, 200);
  }

  private calculateReadTime(content: string): string {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  }

  private generateTags(primaryKeyword: string, secondaryKeywords: string[]): string[] {
    const baseTags = ['SOC 2', 'Compliance', 'Security', 'Audit'];
    const keywordTags = [primaryKeyword, ...secondaryKeywords.slice(0, 4)];
    return [...new Set([...baseTags, ...keywordTags])];
  }

  private generateMetaDescription(content: string, primaryKeyword: string): string {
    const sentences = content.split('.').slice(0, 2);
    let description = sentences.join('.') + '.';
    
    if (!description.toLowerCase().includes(primaryKeyword.toLowerCase())) {
      description = `Complete guide to ${primaryKeyword}. ${description}`;
    }
    
    return description.substring(0, 155);
  }

  private generateSchema(article: any) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.topic,
      description: `Complete guide to ${article.primaryKeyword}`,
      author: {
        '@type': 'Organization',
        name: 'Custodia Team'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Custodia, LLC'
      },
      keywords: article.secondaryKeywords.join(', '),
      about: {
        '@type': 'Thing',
        name: article.primaryKeyword
      }
    };
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const phaseArg = args.find(arg => arg.startsWith('--phase='));
  const categoryArg = args.find(arg => arg.startsWith('--category='));
  const allArg = args.includes('--all');

  const generator = new EnhancedArticleGenerator();

  console.log('🚀 Enhanced Article Generator');
  console.log('📊 Multi-Compliance Content Strategy');
  console.log('==========================================\n');

  if (phaseArg) {
    const phase = phaseArg.split('=')[1];
    console.log(`🎯 Running Phase: ${phase}\n`);
    await generator.generateEnhancedArticles(phase);
  } else if (categoryArg) {
    const category = categoryArg.split('=')[1];
    console.log(`🎯 Running Category: ${category}\n`);
    await generator.generateEnhancedArticles(undefined, category);
  } else if (allArg) {
    console.log(`🎯 Running ALL articles\n`);
    await generator.generateEnhancedArticles();
  } else {
    console.log('📚 Usage:');
    console.log('  npx tsx scripts/generate-enhanced-20-articles.ts --phase=FOUNDATION');
    console.log('  npx tsx scripts/generate-enhanced-20-articles.ts --category=SOC 2');
    console.log('  npx tsx scripts/generate-enhanced-20-articles.ts --all');
    console.log('\n📋 Available Phases: FOUNDATION, EXPANSION, SCALE, DOMINATION');
    console.log('📋 Available Categories: SOC 2, HIPAA, PCI DSS, ISO 27001, GDPR, NIST, CMMC\n');
  }
}

main().catch(console.error);
