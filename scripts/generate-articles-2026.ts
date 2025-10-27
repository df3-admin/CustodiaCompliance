import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Core libraries
import CacheManager from './lib/cache-manager.js';
import RateLimiter from './lib/rate-limiter.js';
import ParallelProcessor from './lib/parallel-processor.js';
import ProgressTracker from './lib/progress-tracker.js';
import TopicManager from './lib/topic-manager.js';

// Existing libraries
import GeminiClient from './lib/gemini-client.js';
import EnhancedKeywordResearch from './lib/enhanced-keyword-research.js';
import CompetitorAnalyzer from './lib/competitor-analyzer.js';
import RedditInsights from './lib/reddit-insights.js';
import SerpResearch from './lib/serp-research.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// CLI argument parsing
interface CLIOptions {
  count?: number;
  priority?: string;
  category?: string;
  topics?: string;
  topicsFile?: string;
  resume?: string;
}

function parseCLIArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {};

  args.forEach(arg => {
    if (arg.startsWith('--count=')) {
      options.count = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--priority=')) {
      options.priority = arg.split('=')[1];
    } else if (arg.startsWith('--category=')) {
      options.category = arg.split('=')[1];
    } else if (arg.startsWith('--topics=')) {
      options.topics = arg.split('=')[1];
    } else if (arg.startsWith('--topics-file=')) {
      options.topicsFile = arg.split('=')[1];
    } else if (arg.startsWith('--resume=')) {
      options.resume = arg.split('=')[1];
    }
  });

  return options;
}

class OptimizedArticleGenerator2026 {
  private pool: Pool;
  private cache: CacheManager;
  private rateLimiter: RateLimiter;
  private parallelProcessor: ParallelProcessor;
  private progress: ProgressTracker;
  private topicManager: TopicManager;
  
  // Existing services
  private gemini: GeminiClient;
  private keywordResearch: EnhancedKeywordResearch;
  private competitorAnalyzer: CompetitorAnalyzer;
  private reddit: RedditInsights;
  private serp: SerpResearch;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // Initialize new components
    this.cache = new CacheManager();
    this.rateLimiter = new RateLimiter();
    this.parallelProcessor = new ParallelProcessor(3);
    this.progress = new ProgressTracker();
    this.topicManager = new TopicManager();

    // Initialize existing services
    this.gemini = new GeminiClient();
    this.keywordResearch = new EnhancedKeywordResearch();
    this.competitorAnalyzer = new CompetitorAnalyzer();
    this.reddit = new RedditInsights();
    this.serp = new SerpResearch();
  }

  async generate(options: CLIOptions) {
    console.log('🚀 Optimized Article Generator 2026');
    console.log('=====================================\n');

    try {
      // Cleanup old cache entries on startup
      console.log('🧹 Cleaning up expired cache...');
      const cleaned = this.cache.cleanup();
      console.log(`✅ Cleaned ${cleaned} expired cache entries\n`);

      // Load topics based on options
      let topics = await this.loadTopics(options);
      
      if (topics.length === 0) {
        console.log('❌ No topics to generate. Exiting.');
        return;
      }

      console.log(`📊 Loaded ${topics.length} topics for processing\n`);

      // Create or resume batch
      let batchId: string;
      if (options.resume) {
        batchId = options.resume;
        console.log(`🔄 Resuming batch: ${batchId}\n`);
        
        const pending = this.progress.getPendingArticles(batchId);
        topics = topics.filter(t => pending.some(p => p.id === t.id));
        console.log(`📝 Resuming ${topics.length} pending articles\n`);
      } else {
        batchId = this.progress.createBatch(
          topics.map(t => ({ id: t.id, topic: t.topic })),
          options
        );
        console.log(`📦 Created batch: ${batchId}\n`);
      }

      // Process articles
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < topics.length; i++) {
        const topic = topics[i];
        
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📝 Processing ${i + 1}/${topics.length}: ${topic.topic}`);
        console.log(`${'='.repeat(60)}`);

        this.progress.updateArticle(batchId, topic.id, 'processing');

        try {
          await this.generateArticle(topic, batchId);
          this.progress.updateArticle(batchId, topic.id, 'completed');
          successCount++;
        } catch (error: any) {
          this.progress.updateArticle(batchId, topic.id, 'failed', error.message);
          failCount++;
          console.error(`❌ Failed: ${error.message}`);
        }

        // Print progress
        const stats = this.progress.getStats(batchId);
        if (stats) {
          console.log(`\n📊 Progress: ${stats.completionPercentage}% (${stats.completed}/${stats.total})`);
        }
      }

      // Final summary
      console.log(`\n${'='.repeat(60)}`);
      console.log('🎉 BATCH COMPLETED');
      console.log(`${'='.repeat(60)}`);
      console.log(`✅ Successful: ${successCount}`);
      console.log(`❌ Failed: ${failCount}`);
      console.log(`📦 Batch ID: ${batchId}`);
      
      const finalStats = this.progress.getStats(batchId);
      if (finalStats) {
        console.log(`📊 Final stats:`);
        console.log(`   - Completed: ${finalStats.completed}/${finalStats.total}`);
        console.log(`   - Failed: ${finalStats.failed}`);
        console.log(`   - Completion: ${finalStats.completionPercentage}%`);
      }

      // Cache stats
      const cacheStats = this.cache.stats();
      console.log(`\n💾 Cache stats:`);
      console.log(`   - Total entries: ${cacheStats.total}`);
      console.log(`   - Size: ${(cacheStats.size / 1024).toFixed(2)} KB`);

    } catch (error) {
      console.error('❌ Fatal error:', error);
    } finally {
      await this.pool.end();
    }
  }

  private async loadTopics(options: CLIOptions): Promise<any[]> {
    let topics: any[] = [];

    // Load from config, CLI, or file
    if (options.topics) {
      topics = this.topicManager.loadFromCLI(options.topics);
    } else if (options.topicsFile) {
      topics = this.topicManager.loadFromFile(options.topicsFile);
    } else {
      topics = this.topicManager.loadFromConfig();
    }

    // Apply filters
    const filters: any = {};
    if (options.priority) filters.priority = options.priority;
    if (options.category) filters.category = options.category;
    if (options.count) filters.maxCount = options.count;

    topics = this.topicManager.filterTopics(topics, filters);

    return topics;
  }

  private async generateArticle(topic: any, batchId: string) {
    console.log('🔍 Step 1: Research and analysis...');

    // Parallel research (with caching and rate limiting)
    const researchResults = await this.parallelProcessor.executeParallel([
      {
        id: 'serp',
        fn: () => this.rateLimiter.execute('serpapi', async () => {
          const cacheKey = `serp-${topic.primaryKeyword}`;
          const cached = this.cache.get('serp', cacheKey);
          if (cached) return cached;

          const result = await this.serp.getKeywordData(topic.primaryKeyword);
          this.cache.set('serp', cacheKey, result, 24 * 60 * 60 * 1000); // 24h
          return result;
        }),
        priority: 1
      },
      {
        id: 'reddit',
        fn: () => this.rateLimiter.execute('reddit', async () => {
          const cacheKey = `reddit-${topic.primaryKeyword}`;
          const cached = this.cache.get('reddit', cacheKey);
          if (cached) return cached;

          const result = await this.reddit.getTopicInsights(topic.primaryKeyword);
          this.cache.set('reddit', cacheKey, result, 12 * 60 * 60 * 1000); // 12h
          return result;
        }),
        priority: 1
      }
    ], true);

    const serpData = researchResults.find(r => r.id === 'serp')?.data;
    const redditData = researchResults.find(r => r.id === 'reddit')?.data;

    console.log('✅ Research complete');

    // Generate content section by section
    console.log('\n🤖 Step 2: Generating content (multi-part)...');
    
    const sections = await this.generateArticleSections(topic, serpData, redditData);
    const content = sections.join('\n\n');
    
    console.log(`✅ Content generated: ${content.length} characters (${sections.length} sections)`);

    // Parse and structure content
    console.log('\n📊 Step 3: Processing and saving...');
    const articleData = this.parseArticle(topic, content);

    // Save to database
    const client = await this.pool.connect();
    try {
      // Check if article exists
      await client.query('DELETE FROM articles WHERE slug = $1', [articleData.slug]);

      const result = await client.query(
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
          articleData.featured, JSON.stringify({}), [],
          articleData.metaTitle, articleData.metaDescription,
          articleData.focusKeyword, articleData.keywords, JSON.stringify(articleData.schema),
          articleData.internalLinks, articleData.externalLinks
        ]
      );

      const articleId = result.rows[0].id;
      console.log(`✅ Article saved with ID: ${articleId}`);
      
      this.progress.updateArticle(batchId, topic.id, 'completed', undefined, articleId);

    } finally {
      client.release();
    }
  }

  private async generateArticleSections(topic: any, serpData: any, redditData: any): Promise<string[]> {
    const sections: string[] = [];
    
    // Define all article sections
    const sectionDefinitions = [
      { 
        name: 'Introduction',
        prompt: `Write an engaging introduction (350 words) for an article about "${topic.topic}". Include: compelling hook, what readers will learn, why it matters. Primary keyword: ${topic.primaryKeyword}. Use natural, conversational tone.`
      },
      {
        name: 'What Is',
        prompt: `Write the "What is ${topic.primaryKeyword}?" section (750 words) covering: foundation, definition, business value, why it's important. Include specific examples and real-world scenarios.`
      },
      {
        name: 'Key Requirements',
        prompt: `Write the "Key Requirements & Components" section (1,000 words) with a deep dive into requirements with examples. Be comprehensive and practical.`
      },
      {
        name: 'Implementation Guide',
        prompt: `Write a "Step-by-Step Implementation Guide" (2,500 words) with a complete walkthrough including examples, best practices, and actionable steps.`
      },
      {
        name: 'Costs Timeline',
        prompt: `Write a "Costs, Timeline & Resources" section (900 words) covering practical planning and budgeting information.`
      },
      {
        name: 'Common Mistakes',
        prompt: `Write a "Common Mistakes to Avoid" section (700 words) covering top pitfalls and solutions.`
      },
      {
        name: 'Best Practices',
        prompt: `Write a "Best Practices & Tools" section (900 words) with recommendations and resources.`
      },
      {
        name: 'FAQ',
        prompt: `Write an "FAQ Section" (900 words) with 12-15 comprehensive questions and detailed answers about ${topic.primaryKeyword}.`
      },
      {
        name: 'Conclusion',
        prompt: `Write a comprehensive Conclusion (500 words) that MUST include: summary of key takeaways, clear next steps for readers, final motivational closing, and a call to action. CRITICAL: This must be a complete, finished conclusion.`
      }
    ];

    console.log(`📝 Generating ${sectionDefinitions.length} sections...`);

    // Generate each section sequentially (to maintain flow)
    for (let i = 0; i < sectionDefinitions.length; i++) {
      const section = sectionDefinitions[i];
      console.log(`   ${i + 1}/${sectionDefinitions.length}: ${section.name}...`);

      try {
        const content = await this.rateLimiter.execute('gemini', async () => {
          return await this.gemini.generateContent(section.prompt, { temperature: 0.7 });
        });

        sections.push(`## ${section.name}\n\n${content.trim()}`);
        console.log(`   ✅ ${section.name} complete (${content.length} chars)`);
      } catch (error: any) {
        console.error(`   ❌ Failed to generate ${section.name}: ${error.message}`);
        // Add placeholder to maintain structure
        sections.push(`## ${section.name}\n\n[Content generation failed]`);
      }

      // Small delay between sections to be nice to the API
      if (i < sectionDefinitions.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return sections;
  }

  private buildPrompt(topic: any, serpData: any, redditData: any): string {
    return `Write a comprehensive, expert-level article on "${topic.topic}" that will rank #1 on Google.

REQUIREMENTS:
- Total length: 8,000-10,000 words (aim for 9,000 words maximum)
- Natural, conversational tone (like an expert consultant writing)
- Use contractions, varied sentence structure, personal insights
- Include specific examples and real-world scenarios
- Add practical implementation details
- Use industry jargon appropriately
- CRITICAL: Article must be COMPLETE and end with a comprehensive conclusion section

TOPIC DETAILS:
- Primary keyword: ${topic.primaryKeyword}
- Secondary keywords: ${topic.secondaryKeywords.join(', ')}
- Category: ${topic.category || 'Compliance'}

RESEARCH DATA:
${serpData ? `SERP Data: ${JSON.stringify(serpData, null, 2)}` : ''}
${redditData ? `Reddit Insights: ${JSON.stringify(redditData.questions || [], null, 2)}` : ''}

STRUCTURE (8,000-9,000 words total):
1. Introduction (350 words) - Compelling hook, what readers will learn, why it matters
2. What is ${topic.primaryKeyword}? (750 words) - Foundation, definition, business value
3. Key Requirements & Components (1,000 words) - Deep dive into requirements with examples
4. Step-by-Step Implementation Guide (2,500 words) - Complete walkthrough with examples
5. Costs, Timeline & Resources (900 words) - Practical planning and budgeting
6. Common Mistakes to Avoid (700 words) - Top pitfalls and solutions
7. Best Practices & Tools (900 words) - Recommendations and resources
8. FAQ Section (900 words) - 12-15 comprehensive questions
9. Conclusion (500 words) - MUST INCLUDE: 
   - Summary of key takeaways
   - Clear next steps for readers
   - Final motivational closing
   - Call to action

OUTPUT FORMAT:
- Provide as plain markdown with # ## ### headings
- Use standard markdown formatting throughout
- Include [citation](url) links for statistics and external sources
- CRITICAL: The article MUST end with the Conclusion section - do not cut it off mid-sentence

Remember: This article must be COMPLETE. Write the full conclusion section, summarizing all key points and providing clear next steps for the reader.
`;
  }

  private getCategory(topic: any): string {
    const text = `${topic.topic} ${topic.primaryKeyword}`.toLowerCase();
    
    // Detect framework from topic content
    if (text.includes('soc 2') || text.includes('soc2')) {
      return 'SOC 2';
    } else if (text.includes('hipaa')) {
      return 'HIPAA';
    } else if (text.includes('iso 27001') || text.includes('iso27001')) {
      return 'ISO 27001';
    } else if (text.includes('pci dss') || text.includes('pci-dss')) {
      return 'PCI DSS';
    } else if (text.includes('gdpr')) {
      return 'GDPR';
    } else if (text.includes('nist')) {
      return 'NIST';
    } else if (text.includes('cmmc')) {
      return 'CMMC';
    } else if (text.includes('fedramp')) {
      return 'FedRAMP';
    } else if (text.includes('hitrust')) {
      return 'HITRUST';
    }
    
    // Fallback to provided category or default
    return topic.category || 'Compliance';
  }

  private parseArticle(topic: any, content: string): any {
    const slug = topic.topic.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Truncate meta fields to database limits
    const metaDescription = content.split('.').slice(0, 2).join('.') + '.';
    const truncatedMetaDesc = metaDescription.length > 155 
      ? metaDescription.substring(0, 152) + '...'
      : metaDescription;

    const category = this.getCategory(topic);

    return {
      slug,
      title: topic.topic,
      author: 'Custodia Team',
      authorAvatar: '/images/authors/custodia-team.jpg',
      category: category,
      excerpt: content.split('.').slice(0, 2).join('.') + '.',
      readTime: `${Math.ceil(content.split(' ').length / 200)} min read`,
      tags: [topic.primaryKeyword, ...(topic.secondaryKeywords || []).slice(0, 4)],
      featured: topic.priority <= 3,
      image: `/public/images/blog/image_7.png`,
      imageAlt: topic.topic,
      metaTitle: topic.topic.length > 60 ? topic.topic.substring(0, 57) + '...' : topic.topic,
      metaDescription: truncatedMetaDesc,
      focusKeyword: topic.primaryKeyword,
      keywords: topic.secondaryKeywords || [],
      schema: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: topic.topic,
        description: `Complete guide to ${topic.primaryKeyword}`
      },
      content: this.parseContentBlocks(content),
      internalLinks: [],
      externalLinks: []
    };
  }

  private parseContentBlocks(content: string): any[] {
    const blocks: any[] = [];
    const lines = content.split('\n');

    let currentBlock: any = null;

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed) continue;

      // Headers
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
      // Lists
      else if (trimmed.match(/^[-*]\s/)) {
        if (currentBlock?.type === 'list') {
          currentBlock.items.push(trimmed.substring(2));
        } else {
          if (currentBlock) blocks.push(currentBlock);
          currentBlock = { type: 'list', items: [trimmed.substring(2)] };
        }
      }
      // Paragraphs
      else {
        if (currentBlock?.type === 'paragraph') {
          currentBlock.content += ' ' + trimmed;
        } else {
          if (currentBlock) blocks.push(currentBlock);
          currentBlock = { type: 'paragraph', content: trimmed };
        }
      }
    }

    // CRITICAL: Ensure the last block is always added
    if (currentBlock) {
      blocks.push(currentBlock);
    }

    console.log(`📊 Parsed ${blocks.length} content blocks from ${lines.length} lines`);
    
    // Verify conclusion exists
    const hasConclusion = blocks.some(block => 
      block.type === 'heading' && 
      block.content && 
      block.content.toLowerCase().includes('conclusion')
    );
    
    if (!hasConclusion) {
      console.warn('⚠️  Warning: Article does not appear to have a conclusion heading');
    } else {
      console.log('✅ Article includes conclusion section');
    }

    return blocks;
  }
}

// Main execution
async function main() {
  const options = parseCLIArgs();

  // Show help if no options
  if (Object.keys(options).length === 0) {
    console.log('📚 Optimized Article Generator 2026\n');
    console.log('Usage:');
    console.log('  npm run generate-2026 -- --count=5');
    console.log('  npm run generate-2026 -- --count=10 --priority=1-5');
    console.log('  npm run generate-2026 -- --category="SOC 2" --count=3');
    console.log('  npm run generate-2026 -- --topics="Topic 1,Topic 2"');
    console.log('  npm run generate-2026 -- --resume=batch-20250127-143052');
    console.log('\nOptions:');
    console.log('  --count=N          : Number of articles to generate');
    console.log('  --priority=N-M     : Filter by priority range (e.g., 1-5)');
    console.log('  --category=NAME    : Filter by category');
    console.log('  --topics=LIST      : Generate specific topics (comma-separated)');
    console.log('  --topics-file=PATH : Load topics from JSON file');
    console.log('  --resume=BATCH-ID  : Resume failed batch\n');
    return;
  }

  const generator = new OptimizedArticleGenerator2026();
  await generator.generate(options);
}

main().catch(console.error);
