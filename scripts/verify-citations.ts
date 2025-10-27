import GeminiClient from './lib/gemini-client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

interface Citation {
  text: string;
  url: string;
  source: string;
  credibility?: number;
  status?: 'verified' | 'needs_replacement' | 'broken';
  replacement?: string;
}

interface VerificationResult {
  verifiedCitations: Citation[];
  summary: string;
  totalCitations: number;
  verifiedCount: number;
  brokenCount: number;
  lowCredibilityCount: number;
}

class CitationVerifier {
  private gemini: GeminiClient;

  constructor() {
    this.gemini = new GeminiClient();
  }

  async verifyCitations(citations: Citation[]): Promise<VerificationResult> {
    console.log(`🔍 Verifying ${citations.length} citations...`);
    
    try {
      const verificationResult = await this.gemini.verifyCitations(citations);
      const verification = JSON.parse(verificationResult);
      
      // Enhance with URL checking
      const enhancedCitations = await this.checkUrls(verification.verifiedCitations || citations);
      
      const result: VerificationResult = {
        verifiedCitations: enhancedCitations,
        summary: verification.summary || 'Citation verification completed',
        totalCitations: citations.length,
        verifiedCount: enhancedCitations.filter(c => c.status === 'verified').length,
        brokenCount: enhancedCitations.filter(c => c.status === 'broken').length,
        lowCredibilityCount: enhancedCitations.filter(c => (c.credibility || 0) < 5).length
      };
      
      console.log(`✅ Verified: ${result.verifiedCount}/${result.totalCitations}`);
      console.log(`❌ Broken: ${result.brokenCount}`);
      console.log(`⚠️ Low credibility: ${result.lowCredibilityCount}`);
      
      return result;
    } catch (error) {
      console.error('❌ Error verifying citations:', error);
      throw error;
    }
  }

  private async checkUrls(citations: Citation[]): Promise<Citation[]> {
    const enhancedCitations: Citation[] = [];
    
    for (const citation of citations) {
      try {
        const isAccessible = await this.checkUrlAccessibility(citation.url);
        const domainAuthority = this.calculateDomainAuthority(citation.url);
        
        enhancedCitations.push({
          ...citation,
          status: isAccessible ? 'verified' : 'broken',
          credibility: citation.credibility || domainAuthority
        });
      } catch (error) {
        enhancedCitations.push({
          ...citation,
          status: 'broken',
          credibility: 0
        });
      }
    }
    
    return enhancedCitations;
  }

  private async checkUrlAccessibility(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        timeout: 5000 
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private calculateDomainAuthority(url: string): number {
    try {
      const domain = new URL(url).hostname.toLowerCase();
      
      // Government and official sources
      if (domain.includes('.gov') || domain.includes('.edu')) {
        return 10;
      }
      
      // Industry research firms
      if (domain.includes('gartner.com') || 
          domain.includes('forrester.com') || 
          domain.includes('mckinsey.com') ||
          domain.includes('deloitte.com') ||
          domain.includes('pwc.com')) {
        return 9;
      }
      
      // Official frameworks
      if (domain.includes('aicpa.org') || 
          domain.includes('iso.org') || 
          domain.includes('nist.gov') ||
          domain.includes('hhs.gov') ||
          domain.includes('pcisecuritystandards.org')) {
        return 10;
      }
      
      // Industry publications
      if (domain.includes('csoonline.com') || 
          domain.includes('darkreading.com') || 
          domain.includes('securitymagazine.com') ||
          domain.includes('complianceweek.com')) {
        return 8;
      }
      
      // Academic and research
      if (domain.includes('.edu') || 
          domain.includes('research') || 
          domain.includes('study')) {
        return 8;
      }
      
      // News and media
      if (domain.includes('reuters.com') || 
          domain.includes('bloomberg.com') || 
          domain.includes('wsj.com') ||
          domain.includes('ft.com')) {
        return 7;
      }
      
      // General websites
      return 5;
    } catch (error) {
      return 3;
    }
  }

  async verifyArticleCitations(articlePath: string): Promise<VerificationResult> {
    console.log(`📄 Verifying citations in article: ${articlePath}`);
    
    try {
      const article = JSON.parse(fs.readFileSync(articlePath, 'utf-8'));
      
      // Extract citations from content
      const citations = this.extractCitationsFromContent(article.content);
      
      if (citations.length === 0) {
        console.log('⚠️ No citations found in article');
        return {
          verifiedCitations: [],
          summary: 'No citations found',
          totalCitations: 0,
          verifiedCount: 0,
          brokenCount: 0,
          lowCredibilityCount: 0
        };
      }
      
      const result = await this.verifyCitations(citations);
      
      // Save verification report
      const reportPath = articlePath.replace('.json', '-citation-report.json');
      fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));
      
      console.log(`✅ Citation report saved to: ${reportPath}`);
      
      return result;
    } catch (error) {
      console.error('❌ Error verifying article citations:', error);
      throw error;
    }
  }

  private extractCitationsFromContent(content: any[]): Citation[] {
    const citations: Citation[] = [];
    
    content.forEach(block => {
      if (block.content) {
        const linkMatches = block.content.match(/\[([^\]]+)\]\(([^)]+)\)/g);
        if (linkMatches) {
          linkMatches.forEach(match => {
            const textMatch = match.match(/\[([^\]]+)\]/);
            const urlMatch = match.match(/\(([^)]+)\)/);
            
            if (textMatch && urlMatch) {
              citations.push({
                text: textMatch[1],
                url: urlMatch[1],
                source: this.extractSourceFromUrl(urlMatch[1])
              });
            }
          });
        }
      }
    });
    
    return citations;
  }

  private extractSourceFromUrl(url: string): string {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return 'Unknown';
    }
  }

  async verifyAllArticles(): Promise<void> {
    console.log('🚀 Starting comprehensive citation verification...');
    
    const articlesDir = path.join('data', 'articles');
    const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('-article.json'));
    
    const summary = {
      generatedAt: new Date().toISOString(),
      totalArticles: files.length,
      totalCitations: 0,
      verifiedCitations: 0,
      brokenCitations: 0,
      lowCredibilityCitations: 0,
      articles: [] as any[]
    };
    
    for (const file of files) {
      try {
        console.log(`\n📄 Verifying: ${file}`);
        const result = await this.verifyArticleCitations(path.join(articlesDir, file));
        
        summary.totalCitations += result.totalCitations;
        summary.verifiedCitations += result.verifiedCount;
        summary.brokenCitations += result.brokenCount;
        summary.lowCredibilityCitations += result.lowCredibilityCount;
        
        summary.articles.push({
          file,
          totalCitations: result.totalCitations,
          verifiedCount: result.verifiedCount,
          brokenCount: result.brokenCount,
          lowCredibilityCount: result.lowCredibilityCount
        });
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Failed to verify ${file}:`, error);
      }
    }
    
    // Save summary report
    const summaryPath = path.join('data', 'articles', 'citation-verification-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log('\n✅ Citation verification completed!');
    console.log(`📊 Total articles: ${summary.totalArticles}`);
    console.log(`🔗 Total citations: ${summary.totalCitations}`);
    console.log(`✅ Verified: ${summary.verifiedCitations}`);
    console.log(`❌ Broken: ${summary.brokenCitations}`);
    console.log(`⚠️ Low credibility: ${summary.lowCredibilityCitations}`);
    console.log(`📈 Verification rate: ${Math.round((summary.verifiedCitations / summary.totalCitations) * 100)}%`);
  }

  async suggestReplacements(brokenCitations: Citation[]): Promise<Citation[]> {
    console.log(`🔧 Suggesting replacements for ${brokenCitations.length} broken citations...`);
    
    const suggestions: Citation[] = [];
    
    for (const citation of brokenCitations) {
      try {
        // Use Gemini to suggest better sources
        const suggestionPrompt = `
Find a better, more authoritative source for this information:
Original: ${citation.text}
Original URL: ${citation.url}

Provide:
1. A more credible source URL
2. The source name
3. Why it's better than the original

Format as JSON:
{
  "replacementUrl": "https://...",
  "replacementSource": "Source Name",
  "reason": "Why this is better"
}
`;

        const suggestionResult = await this.gemini.generateContent(suggestionPrompt, { temperature: 0.3 });
        const suggestion = JSON.parse(suggestionResult);
        
        suggestions.push({
          ...citation,
          replacement: suggestion.replacementUrl,
          source: suggestion.replacementSource
        });
      } catch (error) {
        console.error(`❌ Error suggesting replacement for ${citation.url}:`, error);
      }
    }
    
    return suggestions;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const verifier = new CitationVerifier();

  if (args.length === 0) {
    console.log('Usage:');
    console.log('  npx tsx scripts/verify-citations.ts [article-path]');
    console.log('  npx tsx scripts/verify-citations.ts --all');
    return;
  }

  if (args[0] === '--all') {
    await verifier.verifyAllArticles();
  } else {
    const articlePath = args[0];
    await verifier.verifyArticleCitations(articlePath);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default CitationVerifier;
