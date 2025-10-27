import GeminiClient from './lib/gemini-client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

interface SEOAnalysis {
  seoScore: number;
  analysis: {
    keywordPlacement: 'good' | 'needs_improvement';
    keywordDensity: string;
    lsiKeywords: string[];
    internalLinks: string[];
    externalLinks: 'good' | 'needs_improvement';
    metaDescription: string;
    schemaMarkup: string;
    contentDepth: 'comprehensive' | 'needs_expansion';
    headingStructure: 'good' | 'needs_improvement';
    ctaPlacement: 'good' | 'needs_improvement';
  };
  improvements: string[];
  recommendations: string[];
}

interface SEOOptimization {
  title: string;
  metaDescription: string;
  headings: Array<{
    level: number;
    text: string;
    optimized: string;
  }>;
  internalLinks: string[];
  schemaMarkup: any;
}

class SEOOptimizer {
  private gemini: GeminiClient;

  constructor() {
    this.gemini = new GeminiClient();
  }

  async optimizeSEO(article: any, keyword: string): Promise<SEOAnalysis> {
    console.log(`🔍 Optimizing SEO for keyword: ${keyword}`);
    
    try {
      const analysisResult = await this.gemini.seoAudit(article, keyword);
      const analysis = JSON.parse(analysisResult);
      
      // Enhance with calculated metrics
      const enhancedAnalysis: SEOAnalysis = {
        seoScore: analysis.seoScore || this.calculateSEOScore(article, keyword),
        analysis: {
          keywordPlacement: this.checkKeywordPlacement(article, keyword),
          keywordDensity: this.calculateKeywordDensity(article, keyword),
          lsiKeywords: analysis.analysis?.lsiKeywords || this.generateLSIKeywords(keyword),
          internalLinks: analysis.analysis?.internalLinks || this.suggestInternalLinks(article),
          externalLinks: this.checkExternalLinks(article),
          metaDescription: analysis.analysis?.metaDescription || this.generateMetaDescription(article, keyword),
          schemaMarkup: analysis.analysis?.schemaMarkup || 'Article, HowTo, FAQPage',
          contentDepth: this.assessContentDepth(article),
          headingStructure: this.checkHeadingStructure(article),
          ctaPlacement: this.checkCTAPlacement(article)
        },
        improvements: analysis.improvements || this.generateImprovements(article, keyword),
        recommendations: analysis.recommendations || this.generateRecommendations(article, keyword)
      };
      
      console.log(`🎯 SEO Score: ${enhancedAnalysis.seoScore}/100`);
      console.log(`📊 Keyword Density: ${enhancedAnalysis.analysis.keywordDensity}`);
      console.log(`🔗 Internal Links: ${enhancedAnalysis.analysis.internalLinks.length}`);
      console.log(`📝 Improvements: ${enhancedAnalysis.improvements.length}`);
      
      return enhancedAnalysis;
    } catch (error) {
      console.error('❌ Error optimizing SEO:', error);
      throw error;
    }
  }

  private calculateSEOScore(article: any, keyword: string): number {
    let score = 0;
    
    // Title optimization (20 points)
    if (article.title && article.title.toLowerCase().includes(keyword.toLowerCase())) {
      score += 20;
    }
    
    // Meta description (15 points)
    if (article.metaDescription && article.metaDescription.length >= 120 && article.metaDescription.length <= 160) {
      score += 15;
    }
    
    // Keyword density (15 points)
    const density = this.calculateKeywordDensity(article, keyword);
    const densityValue = parseFloat(density.replace('%', ''));
    if (densityValue >= 1 && densityValue <= 2) {
      score += 15;
    } else if (densityValue >= 0.5 && densityValue <= 3) {
      score += 10;
    }
    
    // Content length (10 points)
    const wordCount = this.estimateWordCount(article.content);
    if (wordCount >= 2000) {
      score += 10;
    } else if (wordCount >= 1000) {
      score += 5;
    }
    
    // Heading structure (10 points)
    if (this.checkHeadingStructure(article) === 'good') {
      score += 10;
    } else {
      score += 5;
    }
    
    // Internal links (10 points)
    const internalLinks = this.suggestInternalLinks(article);
    if (internalLinks.length >= 3) {
      score += 10;
    } else if (internalLinks.length >= 1) {
      score += 5;
    }
    
    // External links (10 points)
    if (this.checkExternalLinks(article) === 'good') {
      score += 10;
    } else {
      score += 5;
    }
    
    // Schema markup (10 points)
    if (article.schema) {
      score += 10;
    }
    
    return Math.min(score, 100);
  }

  private checkKeywordPlacement(article: any, keyword: string): 'good' | 'needs_improvement' {
    const keywordLower = keyword.toLowerCase();
    let score = 0;
    
    // Title
    if (article.title && article.title.toLowerCase().includes(keywordLower)) {
      score += 1;
    }
    
    // First paragraph
    if (article.content && article.content[0] && article.content[0].content) {
      if (article.content[0].content.toLowerCase().includes(keywordLower)) {
        score += 1;
      }
    }
    
    // Headings
    const headings = article.content.filter((block: any) => block.type === 'heading');
    const headingMatches = headings.filter((heading: any) => 
      heading.content && heading.content.toLowerCase().includes(keywordLower)
    );
    
    if (headingMatches.length > 0) {
      score += 1;
    }
    
    return score >= 2 ? 'good' : 'needs_improvement';
  }

  private calculateKeywordDensity(article: any, keyword: string): string {
    const content = this.extractAllContent(article);
    const words = content.toLowerCase().split(/\s+/);
    const keywordWords = keyword.toLowerCase().split(/\s+/);
    
    let keywordCount = 0;
    for (let i = 0; i <= words.length - keywordWords.length; i++) {
      const phrase = words.slice(i, i + keywordWords.length).join(' ');
      if (phrase === keyword.toLowerCase()) {
        keywordCount++;
      }
    }
    
    const density = (keywordCount / words.length) * 100;
    return `${density.toFixed(2)}%`;
  }

  private generateLSIKeywords(keyword: string): string[] {
    const lsiKeywords: string[] = [];
    
    if (keyword.toLowerCase().includes('soc 2')) {
      lsiKeywords.push('SOC 2 Type II', 'SOC 2 audit', 'SOC 2 compliance', 'SOC 2 certification', 'SOC 2 requirements');
    } else if (keyword.toLowerCase().includes('iso 27001')) {
      lsiKeywords.push('ISO 27001 certification', 'ISO 27001 audit', 'ISO 27001 compliance', 'ISO 27001 requirements');
    } else if (keyword.toLowerCase().includes('hipaa')) {
      lsiKeywords.push('HIPAA compliance', 'HIPAA requirements', 'healthcare compliance', 'healthcare data security');
    }
    
    // Add generic LSI keywords
    lsiKeywords.push('compliance checklist', 'implementation guide', 'audit preparation', 'certification process');
    
    return lsiKeywords;
  }

  private suggestInternalLinks(article: any): string[] {
    const links: string[] = [];
    
    // Add common internal links
    links.push('/contact', '/blog', '/services');
    
    // Add topic-specific links
    const topic = article.focusKeyword?.toLowerCase() || '';
    
    if (topic.includes('soc 2')) {
      links.push('/blog/iso27001-implementation-guide', '/blog/hipaa-compliance-for-healthtech');
    } else if (topic.includes('iso 27001')) {
      links.push('/blog/soc2-compliance-checklist-2025', '/blog/hipaa-compliance-for-healthtech');
    } else if (topic.includes('hipaa')) {
      links.push('/blog/soc2-compliance-checklist-2025', '/blog/iso27001-implementation-guide');
    }
    
    return links;
  }

  private checkExternalLinks(article: any): 'good' | 'needs_improvement' {
    const externalLinks = article.externalLinks || [];
    
    if (externalLinks.length >= 5) {
      return 'good';
    } else if (externalLinks.length >= 2) {
      return 'needs_improvement';
    } else {
      return 'needs_improvement';
    }
  }

  private generateMetaDescription(article: any, keyword: string): string {
    const baseDescription = article.excerpt || article.metaDescription || '';
    
    if (baseDescription.length >= 120 && baseDescription.length <= 160) {
      return baseDescription;
    }
    
    // Generate optimized meta description
    const optimized = `${keyword} guide for 2025. Complete implementation checklist, cost breakdown, timeline, and expert tips. Get compliance-ready fast.`;
    
    return optimized.length <= 160 ? optimized : optimized.substring(0, 157) + '...';
  }

  private assessContentDepth(article: any): 'comprehensive' | 'needs_expansion' {
    const wordCount = this.estimateWordCount(article.content);
    
    if (wordCount >= 5000) {
      return 'comprehensive';
    } else if (wordCount >= 2000) {
      return 'needs_expansion';
    } else {
      return 'needs_expansion';
    }
  }

  private checkHeadingStructure(article: any): 'good' | 'needs_improvement' {
    const headings = article.content.filter((block: any) => block.type === 'heading');
    
    if (headings.length < 5) {
      return 'needs_improvement';
    }
    
    // Check for proper hierarchy
    const h1Count = headings.filter((h: any) => h.level === 1).length;
    const h2Count = headings.filter((h: any) => h.level === 2).length;
    
    if (h1Count === 1 && h2Count >= 3) {
      return 'good';
    } else {
      return 'needs_improvement';
    }
  }

  private checkCTAPlacement(article: any): 'good' | 'needs_improvement' {
    const ctas = article.content.filter((block: any) => block.type === 'cta');
    
    return ctas.length >= 2 ? 'good' : 'needs_improvement';
  }

  private generateImprovements(article: any, keyword: string): string[] {
    const improvements: string[] = [];
    
    // Title optimization
    if (!article.title.toLowerCase().includes(keyword.toLowerCase())) {
      improvements.push(`Include "${keyword}" in the title`);
    }
    
    // Meta description optimization
    if (!article.metaDescription || article.metaDescription.length < 120) {
      improvements.push('Optimize meta description (120-160 characters)');
    }
    
    // Keyword density
    const density = this.calculateKeywordDensity(article, keyword);
    const densityValue = parseFloat(density.replace('%', ''));
    if (densityValue < 1) {
      improvements.push(`Increase keyword density (current: ${density}, target: 1-2%)`);
    } else if (densityValue > 3) {
      improvements.push(`Reduce keyword density (current: ${density}, target: 1-2%)`);
    }
    
    // Content length
    const wordCount = this.estimateWordCount(article.content);
    if (wordCount < 2000) {
      improvements.push(`Expand content (current: ${wordCount} words, target: 2000+)`);
    }
    
    // Internal links
    const internalLinks = this.suggestInternalLinks(article);
    if (internalLinks.length < 3) {
      improvements.push('Add more internal links (target: 3+)');
    }
    
    // External links
    const externalLinks = article.externalLinks || [];
    if (externalLinks.length < 5) {
      improvements.push('Add more external links (target: 5+)');
    }
    
    // CTAs
    const ctas = article.content.filter((block: any) => block.type === 'cta');
    if (ctas.length < 2) {
      improvements.push('Add more call-to-action blocks (target: 2+)');
    }
    
    return improvements;
  }

  private generateRecommendations(article: any, keyword: string): string[] {
    const recommendations: string[] = [];
    
    recommendations.push('Add FAQ section with common questions');
    recommendations.push('Include comparison table with competitors');
    recommendations.push('Add step-by-step implementation guide');
    recommendations.push('Include cost calculator or pricing information');
    recommendations.push('Add downloadable checklist or template');
    recommendations.push('Include case studies or success stories');
    recommendations.push('Add video content or visual aids');
    recommendations.push('Create related articles for internal linking');
    
    return recommendations;
  }

  private extractAllContent(article: any): string {
    return article.content.map((block: any) => {
      if (block.content) return block.content;
      if (block.items) return block.items.join(' ');
      return '';
    }).join(' ');
  }

  private estimateWordCount(content: any[]): number {
    return content.reduce((count, block) => {
      if (block.content) {
        return count + block.content.split(' ').length;
      }
      if (block.items) {
        return count + block.items.join(' ').split(' ').length;
      }
      return count;
    }, 0);
  }

  async optimizeArticle(articlePath: string, keyword: string): Promise<SEOAnalysis> {
    console.log(`📄 Optimizing SEO for article: ${articlePath}`);
    
    try {
      const article = JSON.parse(fs.readFileSync(articlePath, 'utf-8'));
      
      const analysis = await this.optimizeSEO(article, keyword);
      
      // Save SEO report
      const reportPath = articlePath.replace('.json', '-seo-report.json');
      fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));
      
      console.log(`✅ SEO report saved to: ${reportPath}`);
      
      return analysis;
    } catch (error) {
      console.error('❌ Error optimizing article SEO:', error);
      throw error;
    }
  }

  async optimizeAllArticles(): Promise<void> {
    console.log('🚀 Starting comprehensive SEO optimization...');
    
    const articlesDir = path.join('data', 'articles');
    const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('-article.json'));
    
    const summary = {
      generatedAt: new Date().toISOString(),
      totalArticles: files.length,
      averageScore: 0,
      highScoreCount: 0,
      mediumScoreCount: 0,
      lowScoreCount: 0,
      articles: [] as any[]
    };
    
    let totalScore = 0;
    
    for (const file of files) {
      try {
        console.log(`\n📄 Optimizing: ${file}`);
        
        const article = JSON.parse(fs.readFileSync(path.join(articlesDir, file), 'utf-8'));
        const keyword = article.focusKeyword || article.title.split(':')[0];
        
        const analysis = await this.optimizeSEO(article, keyword);
        
        totalScore += analysis.seoScore;
        
        if (analysis.seoScore >= 80) summary.highScoreCount++;
        else if (analysis.seoScore >= 60) summary.mediumScoreCount++;
        else summary.lowScoreCount++;
        
        summary.articles.push({
          file,
          keyword,
          score: analysis.seoScore,
          improvements: analysis.improvements.length,
          recommendations: analysis.recommendations.length
        });
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Failed to optimize ${file}:`, error);
      }
    }
    
    summary.averageScore = Math.round((totalScore / files.length) * 10) / 10;
    
    // Save summary report
    const summaryPath = path.join('data', 'articles', 'seo-optimization-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log('\n✅ SEO optimization completed!');
    console.log(`📊 Total articles: ${summary.totalArticles}`);
    console.log(`🎯 Average score: ${summary.averageScore}/100`);
    console.log(`🟢 High score (80+): ${summary.highScoreCount}`);
    console.log(`🟡 Medium score (60-79): ${summary.mediumScoreCount}`);
    console.log(`🔴 Low score (<60): ${summary.lowScoreCount}`);
  }

  async generateOptimizedArticle(article: any, keyword: string): Promise<any> {
    console.log(`🎨 Generating SEO-optimized version...`);
    
    const analysis = await this.optimizeSEO(article, keyword);
    
    // Apply optimizations
    const optimizedArticle = { ...article };
    
    // Optimize title
    if (analysis.analysis.keywordPlacement === 'needs_improvement') {
      optimizedArticle.title = `${keyword} 2025: Complete Implementation Guide [Free Template]`;
    }
    
    // Optimize meta description
    optimizedArticle.metaDescription = analysis.analysis.metaDescription;
    
    // Add internal links
    optimizedArticle.internalLinks = analysis.analysis.internalLinks;
    
    // Generate schema markup
    optimizedArticle.schema = this.generateSchemaMarkup(article, keyword);
    
    return optimizedArticle;
  }

  private generateSchemaMarkup(article: any, keyword: string): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: article.title,
      description: article.metaDescription,
      step: [
        {
          '@type': 'HowToStep',
          name: 'Pre-Implementation Phase',
          text: 'Planning and scoping your compliance project'
        },
        {
          '@type': 'HowToStep',
          name: 'Implementation Phase',
          text: 'Building and documenting compliance controls'
        },
        {
          '@type': 'HowToStep',
          name: 'Audit Phase',
          text: 'Testing and validating your compliance program'
        }
      ]
    };
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const optimizer = new SEOOptimizer();

  if (args.length === 0) {
    console.log('Usage:');
    console.log('  npx tsx scripts/seo-check.ts [article-path] [keyword]');
    console.log('  npx tsx scripts/seo-check.ts --all');
    return;
  }

  if (args[0] === '--all') {
    await optimizer.optimizeAllArticles();
  } else {
    const articlePath = args[0];
    const keyword = args[1] || 'compliance guide';
    await optimizer.optimizeArticle(articlePath, keyword);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default SEOOptimizer;
