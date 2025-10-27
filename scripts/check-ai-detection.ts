import GeminiClient from './lib/gemini-client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

interface AIDetectionResult {
  aiDetectionScore: number;
  analysis: {
    sentenceVariation: 'good' | 'needs_improvement';
    naturalLanguage: 'good' | 'needs_improvement';
    personalVoice: 'good' | 'needs_improvement';
    specificDetails: 'good' | 'needs_improvement';
    transitions: 'good' | 'needs_improvement';
    contractions: 'good' | 'needs_improvement';
    conversationalElements: 'good' | 'needs_improvement';
    expertInsights: 'good' | 'needs_improvement';
    variedStarters: 'good' | 'needs_improvement';
    humanIndicators: 'good' | 'needs_improvement';
  };
  improvements: string[];
  overallAssessment: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface ContentMetrics {
  sentenceLengthVariation: number;
  averageSentenceLength: number;
  contractionCount: number;
  rhetoricalQuestions: number;
  personalPronouns: number;
  specificNumbers: number;
  transitionalPhrases: number;
  variedStarters: number;
}

class AIDetectionChecker {
  private gemini: GeminiClient;

  constructor() {
    this.gemini = new GeminiClient();
  }

  async checkAIDetection(content: string): Promise<AIDetectionResult> {
    console.log('🤖 Analyzing content for AI detection risk...');
    
    try {
      // Calculate content metrics
      const metrics = this.calculateContentMetrics(content);
      
      // Use Gemini for AI detection analysis
      const analysisResult = await this.gemini.checkAIDetection(content);
      const analysis = JSON.parse(analysisResult);
      
      // Enhance with calculated metrics
      const enhancedAnalysis: AIDetectionResult = {
        aiDetectionScore: analysis.aiDetectionScore || this.calculateRiskScore(metrics),
        analysis: {
          sentenceVariation: metrics.sentenceLengthVariation > 0.3 ? 'good' : 'needs_improvement',
          naturalLanguage: analysis.analysis?.naturalLanguage || 'good',
          personalVoice: analysis.analysis?.personalVoice || 'good',
          specificDetails: analysis.analysis?.specificDetails || 'good',
          transitions: analysis.analysis?.transitions || 'good',
          contractions: metrics.contractionCount > 5 ? 'good' : 'needs_improvement',
          conversationalElements: metrics.rhetoricalQuestions > 2 ? 'good' : 'needs_improvement',
          expertInsights: analysis.analysis?.expertInsights || 'good',
          variedStarters: metrics.variedStarters > 0.7 ? 'good' : 'needs_improvement',
          humanIndicators: metrics.personalPronouns > 3 ? 'good' : 'needs_improvement'
        },
        improvements: analysis.improvements || this.generateImprovements(metrics),
        overallAssessment: analysis.overallAssessment || this.generateAssessment(metrics),
        riskLevel: this.determineRiskLevel(analysis.aiDetectionScore || this.calculateRiskScore(metrics))
      };
      
      console.log(`🎯 AI Detection Score: ${enhancedAnalysis.aiDetectionScore}/10`);
      console.log(`⚠️ Risk Level: ${enhancedAnalysis.riskLevel.toUpperCase()}`);
      console.log(`📊 Improvements needed: ${enhancedAnalysis.improvements.length}`);
      
      return enhancedAnalysis;
    } catch (error) {
      console.error('❌ Error checking AI detection:', error);
      throw error;
    }
  }

  private calculateContentMetrics(content: string): ContentMetrics {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/);
    
    // Calculate sentence length variation
    const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
    const averageLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const variance = sentenceLengths.reduce((sum, length) => sum + Math.pow(length - averageLength, 2), 0) / sentenceLengths.length;
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = standardDeviation / averageLength;
    
    // Count contractions
    const contractionPattern = /\b(?:don't|can't|won't|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't|doesn't|didn't|wouldn't|couldn't|shouldn't|it's|that's|there's|here's|what's|who's|where's|when's|why's|how's)\b/gi;
    const contractions = content.match(contractionPattern) || [];
    
    // Count rhetorical questions
    const rhetoricalQuestions = content.match(/\?/g) || [];
    
    // Count personal pronouns
    const personalPronouns = content.match(/\b(?:I|me|my|mine|myself|we|us|our|ours|ourselves|you|your|yours|yourself|yourselves)\b/gi) || [];
    
    // Count specific numbers
    const specificNumbers = content.match(/\b\d+(?:\.\d+)?(?:%|\$|million|billion|thousand|k|M|B)\b/g) || [];
    
    // Count transitional phrases
    const transitionalPhrases = content.match(/\b(?:however|moreover|furthermore|additionally|consequently|therefore|meanwhile|subsequently|nevertheless|nonetheless|in contrast|on the other hand|for instance|for example|specifically|particularly|especially|notably|importantly|interestingly|surprisingly|unfortunately|fortunately)\b/gi) || [];
    
    // Count varied sentence starters
    const sentenceStarters = sentences.map(s => s.trim().split(' ')[0].toLowerCase());
    const uniqueStarters = new Set(sentenceStarters);
    const starterVariation = uniqueStarters.size / sentenceStarters.length;
    
    return {
      sentenceLengthVariation: coefficientOfVariation,
      averageSentenceLength: averageLength,
      contractionCount: contractions.length,
      rhetoricalQuestions: rhetoricalQuestions.length,
      personalPronouns: personalPronouns.length,
      specificNumbers: specificNumbers.length,
      transitionalPhrases: transitionalPhrases.length,
      variedStarters: starterVariation
    };
  }

  private calculateRiskScore(metrics: ContentMetrics): number {
    let score = 0;
    
    // Sentence variation (lower is better)
    if (metrics.sentenceLengthVariation < 0.2) score += 3;
    else if (metrics.sentenceLengthVariation < 0.3) score += 2;
    else if (metrics.sentenceLengthVariation < 0.4) score += 1;
    
    // Contractions (more is better)
    if (metrics.contractionCount < 2) score += 3;
    else if (metrics.contractionCount < 5) score += 2;
    else if (metrics.contractionCount < 10) score += 1;
    
    // Rhetorical questions (more is better)
    if (metrics.rhetoricalQuestions < 1) score += 2;
    else if (metrics.rhetoricalQuestions < 3) score += 1;
    
    // Personal pronouns (more is better)
    if (metrics.personalPronouns < 2) score += 2;
    else if (metrics.personalPronouns < 5) score += 1;
    
    // Specific numbers (more is better)
    if (metrics.specificNumbers < 3) score += 1;
    
    // Transitional phrases (more is better)
    if (metrics.transitionalPhrases < 3) score += 1;
    
    // Varied starters (higher is better)
    if (metrics.variedStarters < 0.5) score += 2;
    else if (metrics.variedStarters < 0.7) score += 1;
    
    return Math.min(score, 10);
  }

  private generateImprovements(metrics: ContentMetrics): string[] {
    const improvements: string[] = [];
    
    if (metrics.sentenceLengthVariation < 0.3) {
      improvements.push('Vary sentence length more (mix short, medium, and long sentences)');
    }
    
    if (metrics.contractionCount < 5) {
      improvements.push('Add more contractions (don\'t, can\'t, it\'s, etc.)');
    }
    
    if (metrics.rhetoricalQuestions < 2) {
      improvements.push('Add rhetorical questions to engage readers');
    }
    
    if (metrics.personalPronouns < 3) {
      improvements.push('Include more personal pronouns and first-person insights');
    }
    
    if (metrics.specificNumbers < 3) {
      improvements.push('Add more specific numbers, statistics, and data points');
    }
    
    if (metrics.transitionalPhrases < 3) {
      improvements.push('Use more transitional phrases between ideas');
    }
    
    if (metrics.variedStarters < 0.7) {
      improvements.push('Vary sentence starters to avoid repetitive patterns');
    }
    
    return improvements;
  }

  private generateAssessment(metrics: ContentMetrics): string {
    const score = this.calculateRiskScore(metrics);
    
    if (score <= 2) {
      return 'Content appears very human-like with good variation and natural language patterns.';
    } else if (score <= 4) {
      return 'Content is mostly human-like but could benefit from more natural variation.';
    } else if (score <= 6) {
      return 'Content shows some AI-like patterns and needs improvement for better humanization.';
    } else {
      return 'Content shows strong AI-like patterns and requires significant humanization.';
    }
  }

  private determineRiskLevel(score: number): 'low' | 'medium' | 'high' {
    if (score <= 3) return 'low';
    else if (score <= 6) return 'medium';
    else return 'high';
  }

  async checkArticleAIDetection(articlePath: string): Promise<AIDetectionResult> {
    console.log(`📄 Checking AI detection for article: ${articlePath}`);
    
    try {
      const article = JSON.parse(fs.readFileSync(articlePath, 'utf-8'));
      
      // Combine all content into a single string
      const content = article.content.map((block: any) => {
        if (block.content) return block.content;
        if (block.items) return block.items.join(' ');
        return '';
      }).join(' ');
      
      const result = await this.checkAIDetection(content);
      
      // Save detection report
      const reportPath = articlePath.replace('.json', '-ai-detection-report.json');
      fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));
      
      console.log(`✅ AI detection report saved to: ${reportPath}`);
      
      return result;
    } catch (error) {
      console.error('❌ Error checking article AI detection:', error);
      throw error;
    }
  }

  async checkAllArticles(): Promise<void> {
    console.log('🚀 Starting comprehensive AI detection analysis...');
    
    const articlesDir = path.join('data', 'articles');
    const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('-article.json'));
    
    const summary = {
      generatedAt: new Date().toISOString(),
      totalArticles: files.length,
      averageScore: 0,
      lowRiskCount: 0,
      mediumRiskCount: 0,
      highRiskCount: 0,
      articles: [] as any[]
    };
    
    let totalScore = 0;
    
    for (const file of files) {
      try {
        console.log(`\n📄 Analyzing: ${file}`);
        const result = await this.checkArticleAIDetection(path.join(articlesDir, file));
        
        totalScore += result.aiDetectionScore;
        
        if (result.riskLevel === 'low') summary.lowRiskCount++;
        else if (result.riskLevel === 'medium') summary.mediumRiskCount++;
        else summary.highRiskCount++;
        
        summary.articles.push({
          file,
          score: result.aiDetectionScore,
          riskLevel: result.riskLevel,
          improvements: result.improvements.length
        });
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Failed to analyze ${file}:`, error);
      }
    }
    
    summary.averageScore = Math.round((totalScore / files.length) * 10) / 10;
    
    // Save summary report
    const summaryPath = path.join('data', 'articles', 'ai-detection-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log('\n✅ AI detection analysis completed!');
    console.log(`📊 Total articles: ${summary.totalArticles}`);
    console.log(`🎯 Average score: ${summary.averageScore}/10`);
    console.log(`🟢 Low risk: ${summary.lowRiskCount}`);
    console.log(`🟡 Medium risk: ${summary.mediumRiskCount}`);
    console.log(`🔴 High risk: ${summary.highRiskCount}`);
  }

  async humanizeContent(content: string): Promise<string> {
    console.log('🎨 Humanizing content to reduce AI detection...');
    
    try {
      const humanizedContent = await this.gemini.humanizeContent(content);
      
      // Re-check AI detection after humanization
      const newResult = await this.checkAIDetection(humanizedContent);
      
      console.log(`🎯 New AI Detection Score: ${newResult.aiDetectionScore}/10`);
      console.log(`📈 Risk Level: ${newResult.riskLevel.toUpperCase()}`);
      
      return humanizedContent;
    } catch (error) {
      console.error('❌ Error humanizing content:', error);
      return content;
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const checker = new AIDetectionChecker();

  if (args.length === 0) {
    console.log('Usage:');
    console.log('  npx tsx scripts/check-ai-detection.ts [content-string]');
    console.log('  npx tsx scripts/check-ai-detection.ts [article-path]');
    console.log('  npx tsx scripts/check-ai-detection.ts --all');
    return;
  }

  if (args[0] === '--all') {
    await checker.checkAllArticles();
  } else if (args[0].endsWith('.json')) {
    // Article file path
    await checker.checkArticleAIDetection(args[0]);
  } else {
    // Content string
    const content = args.join(' ');
    await checker.checkAIDetection(content);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default AIDetectionChecker;
