import GeminiClient from './lib/gemini-client';
import CompetitorAnalyzer from './analyze-competitors';
import TopicResearcher from './research-topic';
import ArticleGenerator from './generate-article';
import CitationVerifier from './verify-citations';
import AIDetectionChecker from './check-ai-detection';
import SEOOptimizer from './seo-check';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

interface BatchGenerationConfig {
  topics: string[];
  parallelProcessing: boolean;
  maxConcurrent: number;
  delayBetweenRequests: number;
  skipExisting: boolean;
  qualityChecks: boolean;
}

interface GenerationProgress {
  topic: string;
  status: 'pending' | 'analyzing' | 'researching' | 'generating' | 'humanizing' | 'verifying' | 'optimizing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  results?: {
    competitorAnalysis?: any;
    research?: any;
    article?: any;
    citations?: any;
    aiDetection?: any;
    seo?: any;
  };
}

class BatchArticleGenerator {
  private gemini: GeminiClient;
  private competitorAnalyzer: CompetitorAnalyzer;
  private researcher: TopicResearcher;
  private generator: ArticleGenerator;
  private citationVerifier: CitationVerifier;
  private aiChecker: AIDetectionChecker;
  private seoOptimizer: SEOOptimizer;
  private progress: Map<string, GenerationProgress> = new Map();

  constructor() {
    this.gemini = new GeminiClient();
    this.competitorAnalyzer = new CompetitorAnalyzer();
    this.researcher = new TopicResearcher();
    this.generator = new ArticleGenerator();
    this.citationVerifier = new CitationVerifier();
    this.aiChecker = new AIDetectionChecker();
    this.seoOptimizer = new SEOOptimizer();
  }

  async generateAllArticles(config: BatchGenerationConfig): Promise<void> {
    console.log('🚀 Starting batch article generation...');
    console.log(`📝 Topics: ${config.topics.length}`);
    console.log(`⚡ Parallel processing: ${config.parallelProcessing}`);
    console.log(`🔍 Quality checks: ${config.qualityChecks}`);
    
    // Initialize progress tracking
    config.topics.forEach(topic => {
      this.progress.set(topic, {
        topic,
        status: 'pending',
        progress: 0
      });
    });
    
    if (config.parallelProcessing) {
      await this.generateArticlesParallel(config);
    } else {
      await this.generateArticlesSequential(config);
    }
    
    // Generate final report
    await this.generateFinalReport();
    
    console.log('\n✅ Batch article generation completed!');
  }

  private async generateArticlesParallel(config: BatchGenerationConfig): Promise<void> {
    const batches = this.createBatches(config.topics, config.maxConcurrent);
    
    for (const batch of batches) {
      const promises = batch.map(topic => this.generateSingleArticle(topic, config));
      await Promise.allSettled(promises);
      
      // Delay between batches
      if (config.delayBetweenRequests > 0) {
        await new Promise(resolve => setTimeout(resolve, config.delayBetweenRequests));
      }
    }
  }

  private async generateArticlesSequential(config: BatchGenerationConfig): Promise<void> {
    for (const topic of config.topics) {
      await this.generateSingleArticle(topic, config);
      
      // Delay between articles
      if (config.delayBetweenRequests > 0) {
        await new Promise(resolve => setTimeout(resolve, config.delayBetweenRequests));
      }
    }
  }

  private async generateSingleArticle(topic: string, config: BatchGenerationConfig): Promise<void> {
    const progress = this.progress.get(topic)!;
    
    try {
      console.log(`\n📝 Processing: ${topic}`);
      
      // Check if article already exists
      if (config.skipExisting) {
        const articleFile = path.join('data', 'articles', `${topic.toLowerCase().replace(/\s+/g, '-')}-article.json`);
        if (fs.existsSync(articleFile)) {
          console.log(`⏭️ Skipping existing article: ${topic}`);
          progress.status = 'completed';
          progress.progress = 100;
          return;
        }
      }
      
      // Step 1: Competitor Analysis
      progress.status = 'analyzing';
      progress.progress = 10;
      console.log(`🔍 Analyzing competitors for: ${topic}`);
      
      const competitorAnalysis = await this.competitorAnalyzer.analyzeCompetitors(topic);
      progress.results = { ...progress.results, competitorAnalysis };
      progress.progress = 20;
      
      // Step 2: Research
      progress.status = 'researching';
      progress.progress = 30;
      console.log(`🔬 Researching topic: ${topic}`);
      
      const research = await this.researcher.researchTopic(topic);
      progress.results = { ...progress.results, research };
      progress.progress = 40;
      
      // Step 3: Generate Article
      progress.status = 'generating';
      progress.progress = 50;
      console.log(`✍️ Generating article: ${topic}`);
      
      const article = await this.generator.generateArticle(topic, research, competitorAnalysis);
      progress.results = { ...progress.results, article };
      progress.progress = 60;
      
      if (config.qualityChecks) {
        // Step 4: Humanize Content
        progress.status = 'humanizing';
        progress.progress = 65;
        console.log(`🎨 Humanizing content: ${topic}`);
        
        const humanizedContent = await this.gemini.humanizeContent(JSON.stringify(article.content));
        article.content = JSON.parse(humanizedContent);
        progress.progress = 70;
        
        // Step 5: Verify Citations
        progress.status = 'verifying';
        progress.progress = 75;
        console.log(`🔍 Verifying citations: ${topic}`);
        
        const citations = await this.citationVerifier.verifyArticleCitations(
          path.join('data', 'articles', `${topic.toLowerCase().replace(/\s+/g, '-')}-article.json`)
        );
        progress.results = { ...progress.results, citations };
        progress.progress = 80;
        
        // Step 6: Check AI Detection
        progress.status = 'optimizing';
        progress.progress = 85;
        console.log(`🤖 Checking AI detection: ${topic}`);
        
        const aiDetection = await this.aiChecker.checkArticleAIDetection(
          path.join('data', 'articles', `${topic.toLowerCase().replace(/\s+/g, '-')}-article.json`)
        );
        progress.results = { ...progress.results, aiDetection };
        progress.progress = 90;
        
        // Step 7: SEO Optimization
        console.log(`🔍 Optimizing SEO: ${topic}`);
        
        const seo = await this.seoOptimizer.optimizeArticle(
          path.join('data', 'articles', `${topic.toLowerCase().replace(/\s+/g, '-')}-article.json`),
          topic
        );
        progress.results = { ...progress.results, seo };
        progress.progress = 95;
      }
      
      // Step 8: Deploy to Database
      console.log(`🚀 Deploying to database: ${topic}`);
      await this.generator.deployArticleToDatabase(article);
      
      progress.status = 'completed';
      progress.progress = 100;
      
      console.log(`✅ Completed: ${topic}`);
      
    } catch (error) {
      console.error(`❌ Failed to generate article for ${topic}:`, error);
      progress.status = 'failed';
      progress.error = error instanceof Error ? error.message : 'Unknown error';
    }
  }

  private createBatches(items: string[], batchSize: number): string[][] {
    const batches: string[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private async generateFinalReport(): Promise<void> {
    console.log('📊 Generating final report...');
    
    const report = {
      generatedAt: new Date().toISOString(),
      totalTopics: this.progress.size,
      completed: Array.from(this.progress.values()).filter(p => p.status === 'completed').length,
      failed: Array.from(this.progress.values()).filter(p => p.status === 'failed').length,
      topics: Array.from(this.progress.values()).map(p => ({
        topic: p.topic,
        status: p.status,
        progress: p.progress,
        error: p.error,
        hasCompetitorAnalysis: !!p.results?.competitorAnalysis,
        hasResearch: !!p.results?.research,
        hasArticle: !!p.results?.article,
        hasCitations: !!p.results?.citations,
        hasAIDetection: !!p.results?.aiDetection,
        hasSEO: !!p.results?.seo
      }))
    };
    
    const reportPath = path.join('data', 'articles', 'batch-generation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`✅ Final report saved to: ${reportPath}`);
    console.log(`📊 Completed: ${report.completed}/${report.totalTopics}`);
    console.log(`❌ Failed: ${report.failed}/${report.totalTopics}`);
    console.log(`📈 Success rate: ${Math.round((report.completed / report.totalTopics) * 100)}%`);
  }

  async generateFromConfig(): Promise<void> {
    console.log('📋 Loading configuration...');
    
    const topicsConfig = JSON.parse(fs.readFileSync('config/high-value-topics.json', 'utf-8'));
    const topics = topicsConfig.highValueTopics.map((t: any) => t.primaryKeyword);
    
    const config: BatchGenerationConfig = {
      topics,
      parallelProcessing: true,
      maxConcurrent: 2, // Limit to avoid rate limiting
      delayBetweenRequests: 5000, // 5 seconds between requests
      skipExisting: true,
      qualityChecks: true
    };
    
    await this.generateAllArticles(config);
  }

  async generateSpecificTopics(topics: string[]): Promise<void> {
    const config: BatchGenerationConfig = {
      topics,
      parallelProcessing: false,
      maxConcurrent: 1,
      delayBetweenRequests: 3000,
      skipExisting: false,
      qualityChecks: true
    };
    
    await this.generateAllArticles(config);
  }

  getProgress(): Map<string, GenerationProgress> {
    return this.progress;
  }

  async monitorProgress(): Promise<void> {
    console.log('📊 Monitoring generation progress...');
    
    const interval = setInterval(() => {
      const completed = Array.from(this.progress.values()).filter(p => p.status === 'completed').length;
      const failed = Array.from(this.progress.values()).filter(p => p.status === 'failed').length;
      const total = this.progress.size;
      
      console.log(`📈 Progress: ${completed + failed}/${total} (${completed} completed, ${failed} failed)`);
      
      if (completed + failed === total) {
        clearInterval(interval);
        console.log('✅ All articles processed!');
      }
    }, 30000); // Check every 30 seconds
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const batchGenerator = new BatchArticleGenerator();

  if (args.length === 0) {
    console.log('Usage:');
    console.log('  npx tsx scripts/generate-all-articles.ts --all');
    console.log('  npx tsx scripts/generate-all-articles.ts [topic1] [topic2] ...');
    console.log('  npx tsx scripts/generate-all-articles.ts --monitor');
    return;
  }

  if (args[0] === '--all') {
    await batchGenerator.generateFromConfig();
  } else if (args[0] === '--monitor') {
    await batchGenerator.monitorProgress();
  } else {
    const topics = args;
    await batchGenerator.generateSpecificTopics(topics);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default BatchArticleGenerator;
