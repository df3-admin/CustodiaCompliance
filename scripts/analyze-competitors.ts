import GeminiClient from './lib/gemini-client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

interface CompetitorAnalysis {
  keyword: string;
  analysis: {
    commonTopics: string[];
    uniqueTopics: Record<string, string[]>;
    contentGaps: string[];
    averageWordCount: number;
    contentDepth: string;
    externalSources: Array<{
      source: string;
      url: string;
      frequency: number;
    }>;
    rankingFactors: string[];
    improvementOpportunities: string[];
  };
  competitors: Array<{
    url: string;
    title: string;
    wordCount: number;
    strengths: string[];
    weaknesses: string[];
    uniqueAngles: string[];
  }>;
}

class CompetitorAnalyzer {
  private gemini: GeminiClient;

  constructor() {
    this.gemini = new GeminiClient();
  }

  async analyzeCompetitors(keyword: string, competitorUrls?: string[]): Promise<CompetitorAnalysis> {
    console.log(`🔍 Analyzing competitors for: ${keyword}`);
    
    // If no URLs provided, use default competitors from config
    if (!competitorUrls) {
      const topicsConfig = JSON.parse(fs.readFileSync('config/high-value-topics.json', 'utf-8'));
      const topic = topicsConfig.highValueTopics.find((t: any) => t.primaryKeyword === keyword);
      competitorUrls = topic?.competitorUrls || [];
    }

    if (competitorUrls.length === 0) {
      throw new Error(`No competitor URLs found for keyword: ${keyword}`);
    }

    try {
      const analysisResult = await this.gemini.analyzeCompetitors(keyword, competitorUrls);
      
      // Parse the JSON response
      const analysis = JSON.parse(analysisResult);
      
      // Save to file
      const filename = `${keyword.toLowerCase().replace(/\s+/g, '-')}-analysis.json`;
      const filepath = path.join('data', 'competitors', filename);
      
      fs.writeFileSync(filepath, JSON.stringify(analysis, null, 2));
      
      console.log(`✅ Competitor analysis saved to: ${filepath}`);
      console.log(`📊 Found ${analysis.competitors?.length || 0} competitors`);
      console.log(`🎯 Identified ${analysis.analysis?.contentGaps?.length || 0} content gaps`);
      
      return analysis;
    } catch (error) {
      console.error('❌ Error analyzing competitors:', error);
      throw error;
    }
  }

  async analyzeAllTopics(): Promise<void> {
    console.log('🚀 Starting comprehensive competitor analysis...');
    
    const topicsConfig = JSON.parse(fs.readFileSync('config/high-value-topics.json', 'utf-8'));
    
    for (const topic of topicsConfig.highValueTopics) {
      try {
        console.log(`\n📝 Analyzing: ${topic.topic}`);
        await this.analyzeCompetitors(topic.primaryKeyword, topic.competitorUrls);
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ Failed to analyze ${topic.topic}:`, error);
      }
    }
    
    console.log('\n✅ All competitor analyses completed!');
  }

  async generateCompetitorReport(): Promise<void> {
    console.log('📊 Generating competitor analysis report...');
    
    const competitorsDir = path.join('data', 'competitors');
    const files = fs.readdirSync(competitorsDir).filter(f => f.endsWith('-analysis.json'));
    
    const report = {
      generatedAt: new Date().toISOString(),
      totalTopics: files.length,
      summary: {
        averageWordCount: 0,
        commonGaps: [] as string[],
        topRankingFactors: [] as string[],
        mostCitedSources: [] as string[]
      },
      topics: [] as any[]
    };

    let totalWordCount = 0;
    const allGaps: string[] = [];
    const allRankingFactors: string[] = [];
    const allSources: string[] = [];

    for (const file of files) {
      try {
        const analysis = JSON.parse(fs.readFileSync(path.join(competitorsDir, file), 'utf-8'));
        
        report.topics.push({
          keyword: analysis.keyword,
          competitorCount: analysis.competitors?.length || 0,
          averageWordCount: analysis.analysis?.averageWordCount || 0,
          contentGaps: analysis.analysis?.contentGaps || [],
          rankingFactors: analysis.analysis?.rankingFactors || []
        });

        totalWordCount += analysis.analysis?.averageWordCount || 0;
        allGaps.push(...(analysis.analysis?.contentGaps || []));
        allRankingFactors.push(...(analysis.analysis?.rankingFactors || []));
        
        // Extract sources
        if (analysis.analysis?.externalSources) {
          analysis.analysis.externalSources.forEach((source: any) => {
            for (let i = 0; i < source.frequency; i++) {
              allSources.push(source.source);
            }
          });
        }
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error);
      }
    }

    // Calculate summary statistics
    report.summary.averageWordCount = Math.round(totalWordCount / files.length);
    
    // Find most common gaps
    const gapCounts = allGaps.reduce((acc, gap) => {
      acc[gap] = (acc[gap] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    report.summary.commonGaps = Object.entries(gapCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([gap]) => gap);

    // Find most common ranking factors
    const factorCounts = allRankingFactors.reduce((acc, factor) => {
      acc[factor] = (acc[factor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    report.summary.topRankingFactors = Object.entries(factorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([factor]) => factor);

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
    const reportPath = path.join('data', 'competitors', 'analysis-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`✅ Competitor analysis report saved to: ${reportPath}`);
    console.log(`📊 Analyzed ${report.totalTopics} topics`);
    console.log(`📝 Average word count: ${report.summary.averageWordCount}`);
    console.log(`🎯 Top content gaps: ${report.summary.commonGaps.slice(0, 3).join(', ')}`);
    console.log(`🏆 Top ranking factors: ${report.summary.topRankingFactors.slice(0, 3).join(', ')}`);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const analyzer = new CompetitorAnalyzer();

  if (args.length === 0) {
    console.log('Usage:');
    console.log('  npx tsx scripts/analyze-competitors.ts [keyword]');
    console.log('  npx tsx scripts/analyze-competitors.ts --all');
    console.log('  npx tsx scripts/analyze-competitors.ts --report');
    return;
  }

  if (args[0] === '--all') {
    await analyzer.analyzeAllTopics();
  } else if (args[0] === '--report') {
    await analyzer.generateCompetitorReport();
  } else {
    const keyword = args.join(' ');
    await analyzer.analyzeCompetitors(keyword);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default CompetitorAnalyzer;
