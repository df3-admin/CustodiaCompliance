import GeminiClient from './lib/gemini-client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

interface ResearchData {
  topic: string;
  statistics: Array<{
    fact: string;
    value: string;
    source: string;
    url: string;
    date: string;
    context: string;
  }>;
  trends: Array<{
    trend: string;
    description: string;
    source: string;
    url: string;
    date: string;
  }>;
  expertQuotes: Array<{
    quote: string;
    author: string;
    company: string;
    source: string;
    url: string;
    date: string;
  }>;
  caseStudies: Array<{
    title: string;
    description: string;
    source: string;
    url: string;
    date: string;
  }>;
  costBreakdowns: Array<{
    companySize: string;
    cost: string;
    timeline: string;
    source: string;
    url: string;
    date: string;
  }>;
  tools: Array<{
    name: string;
    category: string;
    pricing: string;
    pros: string[];
    cons: string[];
    bestFor: string;
    source: string;
    url: string;
    date: string;
  }>;
}

class TopicResearcher {
  private gemini: GeminiClient;
  private authoritativeSources: any;

  constructor() {
    this.gemini = new GeminiClient();
    this.loadAuthoritativeSources();
  }

  private loadAuthoritativeSources(): void {
    try {
      this.authoritativeSources = JSON.parse(
        fs.readFileSync('config/authoritative-sources.json', 'utf-8')
      );
    } catch (error) {
      console.error('❌ Error loading authoritative sources:', error);
      this.authoritativeSources = {};
    }
  }

  async researchTopic(topic: string): Promise<ResearchData> {
    console.log(`🔬 Researching topic: ${topic}`);
    
    try {
      const researchResult = await this.gemini.researchTopic(topic);
      
      // Parse the JSON response
      const research = JSON.parse(researchResult);
      
      // Validate and enhance the research data
      const enhancedResearch = await this.enhanceResearchData(research);
      
      // Save to file
      const filename = `${topic.toLowerCase().replace(/\s+/g, '-')}-research.json`;
      const filepath = path.join('data', 'research', filename);
      
      fs.writeFileSync(filepath, JSON.stringify(enhancedResearch, null, 2));
      
      console.log(`✅ Research saved to: ${filepath}`);
      console.log(`📊 Found ${enhancedResearch.statistics?.length || 0} statistics`);
      console.log(`💬 Found ${enhancedResearch.expertQuotes?.length || 0} expert quotes`);
      console.log(`🔧 Found ${enhancedResearch.tools?.length || 0} tools`);
      
      return enhancedResearch;
    } catch (error) {
      console.error('❌ Error researching topic:', error);
      throw error;
    }
  }

  private async enhanceResearchData(research: any): Promise<ResearchData> {
    // Add authoritative sources based on topic
    const topicLower = research.topic?.toLowerCase() || '';
    
    if (topicLower.includes('soc 2') || topicLower.includes('soc2')) {
      this.addAuthoritativeSources(research, 'soc2');
    } else if (topicLower.includes('iso 27001') || topicLower.includes('iso27001')) {
      this.addAuthoritativeSources(research, 'iso27001');
    } else if (topicLower.includes('hipaa')) {
      this.addAuthoritativeSources(research, 'hipaa');
    } else if (topicLower.includes('pci')) {
      this.addAuthoritativeSources(research, 'pci');
    } else if (topicLower.includes('gdpr')) {
      this.addAuthoritativeSources(research, 'gdpr');
    } else if (topicLower.includes('cmmc')) {
      this.addAuthoritativeSources(research, 'cmmc');
    } else if (topicLower.includes('fedramp')) {
      this.addAuthoritativeSources(research, 'fedramp');
    }

    // Ensure all required fields exist
    return {
      topic: research.topic || '',
      statistics: research.statistics || [],
      trends: research.trends || [],
      expertQuotes: research.expertQuotes || [],
      caseStudies: research.caseStudies || [],
      costBreakdowns: research.costBreakdowns || [],
      tools: research.tools || []
    };
  }

  private addAuthoritativeSources(research: any, framework: string): void {
    const sources = this.authoritativeSources.compliance?.[framework] || [];
    
    // Add framework-specific sources to statistics if not already present
    sources.forEach((source: string) => {
      const existingSource = research.statistics?.find((stat: any) => 
        stat.source?.toLowerCase().includes('aicpa') || 
        stat.source?.toLowerCase().includes('nist') ||
        stat.source?.toLowerCase().includes('iso') ||
        stat.source?.toLowerCase().includes('hhs')
      );
      
      if (!existingSource && research.statistics) {
        research.statistics.push({
          fact: `${framework.toUpperCase()} official framework documentation`,
          value: 'Official',
          source: framework.toUpperCase(),
          url: source,
          date: '2024-01-01',
          context: 'Official framework documentation'
        });
      }
    });
  }

  async researchAllTopics(): Promise<void> {
    console.log('🚀 Starting comprehensive topic research...');
    
    const topicsConfig = JSON.parse(fs.readFileSync('config/high-value-topics.json', 'utf-8'));
    
    for (const topic of topicsConfig.highValueTopics) {
      try {
        console.log(`\n📝 Researching: ${topic.topic}`);
        await this.researchTopic(topic.primaryKeyword);
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error) {
        console.error(`❌ Failed to research ${topic.topic}:`, error);
      }
    }
    
    console.log('\n✅ All topic research completed!');
  }

  async verifyCitations(research: ResearchData): Promise<ResearchData> {
    console.log('🔍 Verifying citations...');
    
    const citations = [
      ...research.statistics,
      ...research.trends,
      ...research.expertQuotes,
      ...research.caseStudies,
      ...research.costBreakdowns,
      ...research.tools
    ];

    try {
      const verificationResult = await this.gemini.verifyCitations(citations);
      const verification = JSON.parse(verificationResult);
      
      console.log(`✅ Verified ${verification.verifiedCitations?.length || 0} citations`);
      console.log(`📊 Citation quality: ${verification.summary || 'Good'}`);
      
      // Update research with verified citations
      // This would integrate the verification results back into the research data
      
      return research;
    } catch (error) {
      console.error('❌ Error verifying citations:', error);
      return research;
    }
  }

  async generateResearchReport(): Promise<void> {
    console.log('📊 Generating research report...');
    
    const researchDir = path.join('data', 'research');
    const files = fs.readdirSync(researchDir).filter(f => f.endsWith('-research.json'));
    
    const report = {
      generatedAt: new Date().toISOString(),
      totalTopics: files.length,
      summary: {
        totalStatistics: 0,
        totalExpertQuotes: 0,
        totalTools: 0,
        mostCitedSources: [] as string[],
        averageCitationsPerTopic: 0
      },
      topics: [] as any[]
    };

    const allSources: string[] = [];
    let totalCitations = 0;

    for (const file of files) {
      try {
        const research = JSON.parse(fs.readFileSync(path.join(researchDir, file), 'utf-8'));
        
        const topicStats = {
          topic: research.topic,
          statistics: research.statistics?.length || 0,
          expertQuotes: research.expertQuotes?.length || 0,
          tools: research.tools?.length || 0,
          totalCitations: (research.statistics?.length || 0) + 
                         (research.trends?.length || 0) + 
                         (research.expertQuotes?.length || 0) + 
                         (research.caseStudies?.length || 0) + 
                         (research.costBreakdowns?.length || 0) + 
                         (research.tools?.length || 0)
        };

        report.topics.push(topicStats);
        
        report.summary.totalStatistics += research.statistics?.length || 0;
        report.summary.totalExpertQuotes += research.expertQuotes?.length || 0;
        report.summary.totalTools += research.tools?.length || 0;
        totalCitations += topicStats.totalCitations;
        
        // Collect all sources
        [
          ...(research.statistics || []),
          ...(research.trends || []),
          ...(research.expertQuotes || []),
          ...(research.caseStudies || []),
          ...(research.costBreakdowns || []),
          ...(research.tools || [])
        ].forEach((item: any) => {
          if (item.source) {
            allSources.push(item.source);
          }
        });
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error);
      }
    }

    // Calculate summary statistics
    report.summary.averageCitationsPerTopic = Math.round(totalCitations / files.length);
    
    // Find most cited sources
    const sourceCounts = allSources.reduce((acc, source) => {
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    report.summary.mostCitedSources = Object.entries(sourceCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([source]) => source);

    // Save report
    const reportPath = path.join('data', 'research', 'research-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`✅ Research report saved to: ${reportPath}`);
    console.log(`📊 Researched ${report.totalTopics} topics`);
    console.log(`📈 Total statistics: ${report.summary.totalStatistics}`);
    console.log(`💬 Total expert quotes: ${report.summary.totalExpertQuotes}`);
    console.log(`🔧 Total tools: ${report.summary.totalTools}`);
    console.log(`📚 Average citations per topic: ${report.summary.averageCitationsPerTopic}`);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const researcher = new TopicResearcher();

  if (args.length === 0) {
    console.log('Usage:');
    console.log('  npx tsx scripts/research-topic.ts [topic]');
    console.log('  npx tsx scripts/research-topic.ts --all');
    console.log('  npx tsx scripts/research-topic.ts --report');
    return;
  }

  if (args[0] === '--all') {
    await researcher.researchAllTopics();
  } else if (args[0] === '--report') {
    await researcher.generateResearchReport();
  } else {
    const topic = args.join(' ');
    await researcher.researchTopic(topic);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default TopicResearcher;
