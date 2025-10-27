import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import GeminiClient from './lib/gemini-client.js';
import EnhancedKeywordResearch from './lib/enhanced-keyword-research.js';
import SerpResearch from './lib/serp-research.js';
import RedditInsights from './lib/reddit-insights.js';
import GoogleSearchConsole from './lib/google-search-console.js';
import EATOptimizer from './lib/eat-optimizer.js';
import FeaturedSnippetOptimizer from './lib/featured-snippet-optimizer.js';
import ContentQualityAnalyzer from './lib/content-quality-analyzer.js';
import CompetitorAnalyzer from './lib/competitor-analyzer.js';
import EnhancedPromptEngineer from './lib/enhanced-prompt-engineer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Phase configuration based on GROWTH_STRATEGY_100K_VIEWS.md
const PHASE_CONFIG = {
  FOUNDATION: {
    goal: "10,000 monthly views",
    timeline: "Months 1-3",
    targetArticles: 40,
    focus: ["SOC 2", "HIPAA", "PCI DSS", "ISO 27001", "GDPR", "NIST", "CMMC"],
    articleTypes: ["Ultimate guides", "Step-by-step tutorials", "Comparison charts", "Free templates", "Case studies"]
  },
  EXPANSION: {
    goal: "35,000 monthly views",
    timeline: "Months 4-6",
    targetArticles: 30,
    focus: ["Comparison content", "Industry-specific", "FAQ content"],
    articleTypes: ["vs comparisons", "Industry-specific guides", "FAQ content"]
  },
  SCALE: {
    goal: "70,000 monthly views",
    timeline: "Months 7-9",
    targetArticles: 20,
    focus: ["Advanced topics", "Research pieces", "Expert content"],
    articleTypes: ["Multi-compliance frameworks", "Integration guides", "Expert interviews"]
  },
  DOMINATION: {
    goal: "100,000 monthly views",
    timeline: "Months 10-12",
    targetArticles: 40,
    focus: ["Content refresh", "Niche topics", "Quick wins"],
    articleTypes: ["Niche industry angles", "Quick start guides", "Free resources"]
  }
};

class PhaseArticleGenerator {
  private gemini: GeminiClient;
  private keywordResearch: EnhancedKeywordResearch;
  private serpResearch: SerpResearch;
  private reddit: RedditInsights;
  private searchConsole: GoogleSearchConsole;
  private eatOptimizer: EATOptimizer;
  private snippetOptimizer: FeaturedSnippetOptimizer;
  private qualityAnalyzer: ContentQualityAnalyzer;
  private competitorAnalyzer: CompetitorAnalyzer;
  private promptEngineer: EnhancedPromptEngineer;

  constructor() {
    this.gemini = new GeminiClient();
    this.keywordResearch = new EnhancedKeywordResearch();
    this.serpResearch = new SerpResearch();
    this.reddit = new RedditInsights();
    this.searchConsole = new GoogleSearchConsole();
    this.eatOptimizer = new EATOptimizer();
    this.snippetOptimizer = new FeaturedSnippetOptimizer();
    this.qualityAnalyzer = new ContentQualityAnalyzer();
    this.competitorAnalyzer = new CompetitorAnalyzer();
    this.promptEngineer = new EnhancedPromptEngineer();
  }

  async generateTestArticle(phase: string, articleType?: 'niche' | 'quick-win') {
    console.log(`\n🚀 TESTING PHASE-BASED ARTICLE GENERATOR`);
    console.log(`📊 Phase: ${phase}`);
    console.log(`🎯 Target: ${PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG]?.goal}`);
    console.log(`⏱️ Timeline: ${PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG]?.timeline}\n`);

    const client = await pool.connect();

    try {
      // Step 1: Research existing articles in Neon DB
      console.log('📊 Step 1: Researching existing articles in Neon database...');
      const existingArticles = await client.query('SELECT slug, title, category, tags FROM articles ORDER BY published_date DESC LIMIT 50');
      console.log(`✅ Found ${existingArticles.rows.length} existing articles`);

      // Group by category
      const categoryCount = existingArticles.rows.reduce((acc: any, article) => {
        acc[article.category] = (acc[article.category] || 0) + 1;
        return acc;
      }, {});
      console.log(`📈 Category breakdown:`, categoryCount);

      // Step 2: Identify content gaps using Gemini AI
      console.log('\n🔍 Step 2: Identifying content gaps using AI analysis...');
      const gapPrompt = `Analyze these existing articles and suggest ONE high-value article to create:

Existing Articles:
${existingArticles.rows.map((a, i) => `${i + 1}. ${a.title} (${a.category})`).join('\n')}

Phase: ${phase}
Focus: ${PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG]?.focus.join(', ')}
Article Types: ${PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG]?.articleTypes.join(', ')}

${articleType === 'niche' ? 'Priority: Niche industry-specific topics with high commercial value' : ''}
${articleType === 'quick-win' ? 'Priority: Quick wins with high search volume and easy rankings' : ''}

Suggest ONE high-value article that:
1. Fills a content gap
2. Has high search volume (5,000+)
3. Low-medium competition
4. High commercial intent
5. Aligns with phase ${phase} goals

Respond in this exact JSON format:
{
  "topic": "Exact article title",
  "category": "SOC 2/HIPAA/PCI DSS/etc",
  "primaryKeyword": "main keyword",
  "secondaryKeywords": ["keyword1", "keyword2"],
  "searchVolume": "X,XXX",
  "reasoning": "why this article is valuable"
}`;

      const gapAnalysis = await this.gemini.generateContent(gapPrompt, { temperature: 0.7 });
      
      // Parse JSON from Gemini response
      let articleIdea;
      try {
        const jsonMatch = gapAnalysis.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          articleIdea = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (error) {
        // Fallback to default article
        articleIdea = {
          topic: "SOC 2 Compliance Checklist: Complete Guide for 2025",
          category: "SOC 2",
          primaryKeyword: "SOC 2 compliance checklist",
          secondaryKeywords: ["SOC 2 requirements", "SOC 2 audit", "SOC 2 certification"],
          searchVolume: "8,000+",
          reasoning: "High-volume, evergreen content with commercial intent"
        };
        console.log('⚠️ Using fallback article idea');
      }

      console.log('✅ Article idea identified:');
      console.log(`   Topic: ${articleIdea.topic}`);
      console.log(`   Category: ${articleIdea.category}`);
      console.log(`   Keyword: ${articleIdea.primaryKeyword}`);
      console.log(`   Search Volume: ${articleIdea.searchVolume}`);

      // Step 3: Get real SERP data
      console.log('\n🔍 Step 3: Getting real SERP data from Google...');
      const serpData = await this.serpResearch.getKeywordData(articleIdea.primaryKeyword);
      console.log(`✅ Search volume: ${serpData.searchVolume.toLocaleString()}/month`);
      console.log(`✅ Competition: ${serpData.competition}`);
      console.log(`✅ Top competitors: ${serpData.topCompetitors.length}`);

      // Step 4: Get Reddit insights
      console.log('\n💬 Step 4: Getting Reddit community insights...');
      const redditInsights = await this.reddit.getTopicInsights(articleIdea.primaryKeyword);
      console.log(`✅ Questions found: ${redditInsights.questions.length}`);
      console.log(`✅ Pain points: ${redditInsights.painPoints.length}`);

      // Step 5: Competitor analysis (using real SERP results)
      console.log('\n📊 Step 5: Analyzing competitor content gaps from Google results...');
      const competitorUrls = serpData.topCompetitors.slice(0, 3).map((c: any) => c.url);
      console.log(`🔍 Analyzing top ${competitorUrls.length} competitors from Google SERP:`);
      competitorUrls.forEach((url: string, i: number) => {
        console.log(`   ${i + 1}. ${url}`);
      });
      
      const { gapAnalysis: competitorGaps } = await this.competitorAnalyzer.analyzeCompetitors(
        competitorUrls,
        articleIdea.primaryKeyword,
        articleIdea.topic
      );

      // Step 6: Build enhanced prompt with all data
      console.log('\n✍️ Step 6: Generating optimized content...');
      const enhancedPrompt = this.buildEnhancedPrompt(
        articleIdea,
        serpData,
        redditInsights,
        competitorGaps
      );

      const content = await this.gemini.generateContent(enhancedPrompt, {
        temperature: 0.8,
        maxTokens: 16384
      });
      console.log(`✅ Content generated: ${content.length} characters`);

      // Step 7: Optimize content
      console.log('\n🎯 Step 7: Optimizing content with advanced SEO...');
      const eatOptimization = await this.eatOptimizer.optimizeEAT(content, articleIdea.topic, articleIdea.category);
      const snippetOptimization = await this.snippetOptimizer.optimizeForFeaturedSnippets(content, articleIdea.primaryKeyword, articleIdea.topic);
      const qualityAnalysis = await this.qualityAnalyzer.analyzeContentQuality(content, articleIdea.topic, articleIdea.primaryKeyword);

      console.log(`✅ E-E-A-T Score: ${eatOptimization.score}/100`);
      console.log(`✅ Snippet Score: ${snippetOptimization.optimizationScore}/100`);
      console.log(`✅ Quality Score: ${qualityAnalysis.overallScore}/100`);

      // Step 8: Parse and prepare for DB
      console.log('\n📊 Step 8: Preparing article for database...');
      const contentBlocks = this.parseContentToBlocks(content);
      const slug = this.generateSlug(articleIdea.topic);
      const articleData = {
        slug,
        title: articleIdea.topic,
        author: 'Custodia Team',
        authorAvatar: '/images/authors/custodia-team.jpg',
        category: articleIdea.category,
        excerpt: this.generateExcerpt(content, articleIdea.primaryKeyword),
        readTime: this.calculateReadTime(content),
        tags: this.generateTags(articleIdea.category, articleIdea.primaryKeyword, articleIdea.secondaryKeywords),
        featured: true,
        image: `/images/blog/${slug}-2025.png`,
        imageAlt: articleIdea.topic,
        metaTitle: articleIdea.topic.length > 60 ? articleIdea.topic.substring(0, 60) : articleIdea.topic,
        metaDescription: this.generateMetaDescription(content, articleIdea.primaryKeyword),
        focusKeyword: articleIdea.primaryKeyword,
        keywords: articleIdea.secondaryKeywords,
        schema: this.generateSchema(articleIdea),
        internalLinks: [],
        externalLinks: [],
        content: contentBlocks
      };

      // Step 9: Deploy to Neon DB
      console.log('\n🚀 Step 9: Deploying to Neon database...');
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
          articleData.featured, JSON.stringify({ 
            optimization: { eatOptimization, snippetOptimization, qualityAnalysis },
            serpData, redditInsights, competitorGaps 
          }), [],
          articleData.metaTitle, articleData.metaDescription,
          articleData.focusKeyword, articleData.keywords, JSON.stringify(articleData.schema),
          articleData.internalLinks, articleData.externalLinks
        ]
      );

      console.log(`\n✅ TEST ARTICLE SUCCESSFULLY PUBLISHED!`);
      console.log(`📝 Article ID: ${insertResult.rows[0].id}`);
      console.log(`🌐 URL: https://custodiacompliance.com/blog/${articleData.slug}`);
      console.log(`📊 Length: ${content.length} characters, ${contentBlocks.length} blocks`);
      console.log(`🏆 Overall Score: ${Math.round((eatOptimization.score + snippetOptimization.optimizationScore + qualityAnalysis.overallScore) / 3)}/100`);
      console.log(`\n🎉 Test complete! Ready to generate full batch of articles.`);

    } catch (error) {
      console.error('❌ Error in test article generation:', error);
    } finally {
      client.release();
      await pool.end();
    }
  }

  private buildEnhancedPrompt(articleIdea: any, serpData: any, redditInsights: any, competitorGaps: any): string {
    return `Write a comprehensive, authoritative article about "${articleIdea.topic}" targeting "${articleIdea.primaryKeyword}".

=== KEYWORD & SEO DATA ===
Primary Keyword: ${articleIdea.primaryKeyword}
Search Volume: ${serpData.searchVolume.toLocaleString()}/month
Competition: ${serpData.competition}

=== SEARCH INTENT & QUESTIONS ===
Google Questions:
${serpData.questions.slice(0, 5).map((q: string, i: number) => `${i+1}. ${q}`).join('\n')}

Reddit Questions:
${redditInsights.questions.slice(0, 5).map((q: any, i: number) => `${i+1}. ${q.question}`).join('\n')}

Pain Points:
${redditInsights.painPoints.slice(0, 3).map((pp: string, i: number) => `${i+1}. ${pp}`).join('\n')}

=== COMPETITOR GAPS TO FILL ===
${competitorGaps.overallGaps?.missingTopics?.slice(0, 5).map((t: string, i: number) => `${i+1}. ${t}`).join('\n') || 'None identified'}

=== CONTENT REQUIREMENTS ===
1. Title: Start with "# ${articleIdea.topic}"
2. Introduction: Explain what this topic is and why it matters
3. Main Content: Use "## " for H2 headings and "### " for H3 subheadings
4. Cover all questions from Google and Reddit above
5. Include practical examples and actionable advice
6. Add a "## Frequently Asked Questions" section at the end
7. Target length: 5,000-8,000 words

=== FORMATTING RULES ===
- Start headings with ## (not #) for main sections
- Use ### for subsections
- Use numbered lists (1., 2., 3.)
- Use bullet points (- ) for unordered lists
- One paragraph per line
- No bold or italic markdown
- Clear, professional tone

OUTPUT ONLY the article content in proper markdown format.`;
  }

  // Helper functions
  private parseContentToBlocks(content: string): any[] {
    const blocks: any[] = [];
    const lines = content.split('\n').filter(line => line.trim());
    let currentBlock: any | null = null;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Headings
      if (trimmed.startsWith('# ')) {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = { type: 'heading', level: 1, content: trimmed.substring(2) };
      } else if (trimmed.startsWith('## ')) {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = { type: 'heading', level: 2, content: trimmed.substring(3) };
      } else if (trimmed.startsWith('### ')) {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = { type: 'heading', level: 3, content: trimmed.substring(4) };
      }
      // Numbered lists (1., 2., 3., etc.)
      else if (/^\d+\.\s/.test(trimmed)) {
        if (currentBlock && currentBlock.type === 'list' && currentBlock.ordered) {
          currentBlock.items.push(trimmed.replace(/^\d+\.\s/, ''));
        } else {
          if (currentBlock) blocks.push(currentBlock);
          currentBlock = { type: 'list', ordered: true, items: [trimmed.replace(/^\d+\.\s/, '')] };
        }
      }
      // Bullet lists
      else if (trimmed.startsWith('- ')) {
        if (currentBlock && currentBlock.type === 'list' && !currentBlock.ordered) {
          currentBlock.items.push(trimmed.substring(2));
        } else {
          if (currentBlock) blocks.push(currentBlock);
          currentBlock = { type: 'list', ordered: false, items: [trimmed.substring(2)] };
        }
      }
      // Paragraphs
      else if (trimmed.length > 0) {
        if (currentBlock && currentBlock.type === 'paragraph') {
          currentBlock.content += ' ' + trimmed;
        } else {
          if (currentBlock) blocks.push(currentBlock);
          currentBlock = { type: 'paragraph', content: trimmed };
        }
      }
    }
    if (currentBlock) blocks.push(currentBlock);
    return blocks;
  }

  private generateSlug(topic: string): string {
    return topic.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private generateExcerpt(content: string, keyword: string): string {
    const sentences = content.split('.').slice(0, 2);
    let excerpt = sentences.join('.') + '.';
    if (!excerpt.toLowerCase().includes(keyword.toLowerCase())) {
      excerpt = `Complete guide to ${keyword}. ${excerpt}`;
    }
    return excerpt.substring(0, 200);
  }

  private calculateReadTime(content: string): string {
    const words = content.split(' ').length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  }

  private generateTags(category: string, primaryKeyword: string, secondaryKeywords: string[]): string[] {
    const baseTags = [category, 'Compliance', 'Security'];
    const keywordTags = [primaryKeyword, ...secondaryKeywords.slice(0, 3)];
    return [...new Set([...baseTags, ...keywordTags])];
  }

  private generateMetaDescription(content: string, keyword: string): string {
    const sentences = content.split('.').slice(0, 2);
    let desc = sentences.join('.') + '.';
    if (!desc.toLowerCase().includes(keyword.toLowerCase())) {
      desc = `Complete guide to ${keyword}. ${desc}`;
    }
    return desc.substring(0, 155);
  }

  private generateSchema(articleIdea: any): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: articleIdea.topic,
      description: `Complete guide to ${articleIdea.primaryKeyword}`,
      author: { '@type': 'Organization', name: 'Custodia Team' },
      publisher: { '@type': 'Organization', name: 'Custodia, LLC' }
    };
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  const phaseArg = args.find(arg => arg.startsWith('--phase='));
  const typeArg = args.find(arg => arg.startsWith('--type='));

  if (!phaseArg) {
    console.log('📚 Usage: npx tsx scripts/test-phase-article-generator.ts --phase=FOUNDATION [--type=niche|quick-win]');
    console.log('\n📋 Available Phases: FOUNDATION, EXPANSION, SCALE, DOMINATION');
    console.log('📋 Article Types: niche, quick-win');
    process.exit(1);
  }

  const phase = phaseArg.split('=')[1];
  const articleType = typeArg ? typeArg.split('=')[1] as 'niche' | 'quick-win' : undefined;

  const generator = new PhaseArticleGenerator();
  await generator.generateTestArticle(phase, articleType);
}

main().catch(console.error);
