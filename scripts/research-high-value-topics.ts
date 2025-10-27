import { SerpResearch } from './lib/serp-research.js';
import { RedditInsights } from './lib/reddit-insights.js';
import CacheManager from './lib/cache-manager.js';
import RateLimiter from './lib/rate-limiter.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

interface ResearchedTopic {
  topic: string;
  primaryKeyword: string;
  searchVolume: number;
  cpc: number;
  competition: 'low' | 'medium' | 'high';
  competitionScore: number;
  buyerIntent: number; // 1-10 scale
  adRevenueScore: number; // 0-10
  leadGenScore: number; // 0-10
  revenueScore: number; // Combined score 0-10
  redditInterest: number; // Discussion volume
  secondaryKeywords: string[];
  questions: string[];
  category: string;
  industry?: string;
}

class TopicResearcher {
  private serp: SerpResearch;
  private reddit: RedditInsights;
  private cache: CacheManager;
  private rateLimiter: RateLimiter;
  private researchedTopics: ResearchedTopic[] = [];

  // Seed keywords to research
  private seedKeywords = {
    soc2: [
      // Temporarily reduced to focus on other frameworks
      'SOC 2 compliance',
      'SOC 2 Type I vs Type II',
      'SOC 2 cost',
      'SOC 2 for startups',
      'SOC 2 vs ISO 27001'
    ],
    frameworks: [
      // ISO 27001
      'ISO 27001 implementation',
      'ISO 27001 certification',
      'ISO 27001 cost',
      'ISO 27001 checklist',
      'ISO 27001 controls',
      'ISO 27001 risk assessment',
      'ISO 27001 audit',
      'ISO 27001 requirements',
      'ISO 27001 certification process',
      'ISO 27001 for small business',
      'ISO 27001 Statement of Applicability',
      'ISO 27001 internal audit',
      'ISO 27001 management review',
      
      // HIPAA
      'HIPAA compliance',
      'HIPAA compliance for startups',
      'HIPAA checklist',
      'HIPAA requirements',
      'HIPAA Security Rule',
      'HIPAA Privacy Rule',
      'HIPAA compliance cost',
      'HIPAA audit',
      'HIPAA Business Associate Agreement',
      'HIPAA Risk Assessment',
      'HIPAA encryption requirements',
      'HIPAA for healthcare providers',
      'HIPAA for cloud providers',
      'HIPAA violations and penalties',
      
      // PCI DSS
      'PCI DSS compliance',
      'PCI DSS SAQ',
      'PCI DSS requirements',
      'PCI DSS checklist',
      'PCI DSS compliance levels',
      'PCI DSS Self-Assessment Questionnaire',
      'PCI DSS for e-commerce',
      'PCI DSS for payment processors',
      'PCI DSS cardholder data environment',
      'PCI DSS vulnerability scanning',
      'PCI DSS penetration testing',
      'PCI DSS merchant levels',
      
      // GDPR
      'GDPR compliance',
      'GDPR for US companies',
      'GDPR requirements',
      'GDPR checklist',
      'GDPR data processing agreement',
      'GDPR Data Protection Officer',
      'GDPR consent management',
      'GDPR data breach notification',
      'GDPR privacy policy',
      'GDPR Data Subject Access Request',
      'GDPR for cloud providers',
      'GDPR fines and penalties',
      'GDPR data mapping',
      'GDPR legitimate interests',
      
      // FedRAMP
      'FedRAMP authorization',
      'FedRAMP compliance',
      'FedRAMP requirements',
      'FedRAMP audit',
      'FedRAMP for cloud providers',
      'FedRAMP authorization process',
      'FedRAMP high baseline',
      'FedRAMP moderate baseline',
      'FedRAMP continuous monitoring',
      'FedRAMP for SaaS providers',
      
      // CMMC
      'CMMC compliance',
      'CMMC certification',
      'CMMC levels',
      'CMMC 2.0',
      'CMMC requirements',
      'CMMC assessment',
      'CMMC for defense contractors',
      'CMMC Level 1',
      'CMMC Level 2',
      'CMMC Level 3',
      'CMMC self-assessment',
      
      // NIST
      'NIST cybersecurity framework',
      'NIST CSF implementation',
      'NIST 800-53',
      'NIST controls',
      'NIST risk management framework',
      'NIST cybersecurity framework functions',
      'NIST CSF assessment',
      'NIST for small business',
      'NIST SP 800-171',
      'NIST CSF maturity levels',
      
      // HITRUST
      'HITRUST certification',
      'HITRUST CSF',
      'HITRUST compliance',
      'HITRUST requirements',
      'HITRUST for healthcare organizations',
      'HITRUST self-assessment',
      'HITRUST validated assessment',
      'HITRUST CSF controls',
      'HITRUST vs HIPAA',
      'HITRUST certification cost'
    ],
    tools: [
      'compliance software',
      'GRC tools',
      'security compliance platform',
      'HIPAA compliance software',
      'ISO 27001 compliance software',
      'GDPR compliance tools',
      'risk management software',
      'audit management software',
      'vendor risk management software',
      'security assessment tools',
      'data privacy software',
      'BCDR software',
      'incident response software'
    ],
    specific: [
      // These will be researched for multiple frameworks
      'access control requirements',
      'encryption requirements',
      'vulnerability management',
      'incident response plan',
      'business continuity plan',
      'disaster recovery plan',
      'risk assessment methodology',
      'security awareness training',
      'vendor risk assessment',
      'data breach response',
      'compliance audit checklist',
      'penetration testing requirements'
    ]
  };

  constructor() {
    this.serp = new SerpResearch();
    this.reddit = new RedditInsights();
    this.cache = new CacheManager('scripts/.cache');
    this.rateLimiter = new RateLimiter();
  }

  async researchAllTopics(): Promise<ResearchedTopic[]> {
    console.log('🔍 Starting comprehensive topic research...\n');

    const allKeywords = [
      ...this.seedKeywords.soc2,
      ...this.seedKeywords.frameworks,
      ...this.seedKeywords.tools,
      ...this.seedKeywords.specific
    ];

    console.log(`📊 Researching ${allKeywords.length} keywords...\n`);

    for (let i = 0; i < allKeywords.length; i++) {
      const keyword = allKeywords[i];
      console.log(`[${i + 1}/${allKeywords.length}] Researching: ${keyword}`);

      try {
        const topic = await this.researchTopic(keyword);
        if (topic) {
          this.researchedTopics.push(topic);
        }
      } catch (error: any) {
        console.error(`❌ Failed to research ${keyword}:`, error.message);
      }

      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Sort by revenue score
    this.researchedTopics.sort((a, b) => b.revenueScore - a.revenueScore);

    console.log(`\n✅ Research complete: ${this.researchedTopics.length} topics analyzed\n`);

    return this.researchedTopics;
  }

  private async researchTopic(keyword: string): Promise<ResearchedTopic | null> {
    const cacheKey = `topic-${keyword}`;
    const cached = this.cache.get<ResearchedTopic>('topics', cacheKey);
    if (cached) return cached;

    // Get SERP data
    const serpData = await this.rateLimiter.execute('serpapi', async () => {
      return await this.serp.getKeywordData(keyword);
    });

    // Get Reddit data
    const redditData = await this.rateLimiter.execute('reddit', async () => {
      return await this.reddit.getTopicInsights(keyword);
    });

    // Calculate scores
    const topic = this.calculateTopicScores(keyword, serpData, redditData);

    // Cache for 24 hours
    this.cache.set('topics', cacheKey, topic, 24 * 60 * 60 * 1000);

    return topic;
  }

  private calculateTopicScores(
    keyword: string,
    serpData: any,
    redditData: any
  ): ResearchedTopic {
    const searchVolume = serpData.searchVolume || 0;
    const cpc = serpData.cpc || 0;
    const competition = serpData.competition || 'medium';

    // Competition score (lower is better)
    const competitionScore = competition === 'low' ? 30 : competition === 'medium' ? 60 : 80;

    // Buyer intent score (1-10)
    const buyerIntent = this.calculateBuyerIntent(keyword, serpData.questions);

    // Ad revenue score (0-10)
    // Formula: (search volume × CPC × 0.7) / 10000
    const adRevenuePotential = searchVolume * cpc * 0.7;
    const adRevenueScore = Math.min(10, adRevenuePotential / 10000);

    // Lead gen score (0-10)
    // Based on buyer intent keywords and question volume
    const questionCount = serpData.questions?.length || 0;
    const redditInterest = redditData.questions?.length || 0;
    const leadGenScore = Math.min(10, (buyerIntent * 0.6) + (questionCount > 5 ? 2 : 0) + (redditInterest > 10 ? 2 : 0));

    // Combined revenue score (weighted: 30% ad revenue, 70% lead gen)
    const revenueScore = (adRevenueScore * 0.3) + (leadGenScore * 0.7);

    return {
      topic: this.generateTopicTitle(keyword),
      primaryKeyword: keyword,
      searchVolume,
      cpc,
      competition,
      competitionScore,
      buyerIntent,
      adRevenueScore,
      leadGenScore,
      revenueScore,
      redditInterest,
      secondaryKeywords: serpData.relatedKeywords?.slice(0, 6) || [],
      questions: serpData.questions?.slice(0, 10) || [],
      category: this.categorizeKeyword(keyword),
      industry: this.detectIndustry(keyword)
    };
  }

  private calculateBuyerIntent(keyword: string, questions: string[]): number {
    const buyerIntentKeywords = [
      'cost', 'price', 'pricing', 'how much',
      'tool', 'software', 'platform', 'vendor',
      'consultant', 'service', 'help',
      'gap assessment', 'readiness', 'preparation',
      'buy', 'purchase', 'license'
    ];

    const keywordLower = keyword.toLowerCase();
    const questionsText = questions?.join(' ').toLowerCase() || '';

    let score = 5; // Base score

    // Check keyword itself
    if (buyerIntentKeywords.some(kw => keywordLower.includes(kw))) {
      score += 3;
    }

    // Check questions
    const buyerIntentQuestions = questions?.filter(q => 
      buyerIntentKeywords.some(kw => q.toLowerCase().includes(kw))
    ).length || 0;

    score += Math.min(2, buyerIntentQuestions / 2);

    return Math.min(10, score);
  }

  private categorizeKeyword(keyword: string): string {
    const kw = keyword.toLowerCase();
    
    if (kw.includes('soc 2') || kw.includes('soc2')) return 'SOC 2';
    if (kw.includes('iso 27001') || kw.includes('iso27001')) return 'ISO 27001';
    if (kw.includes('hipaa')) return 'HIPAA';
    if (kw.includes('pci dss') || kw.includes('pci-dss')) return 'PCI DSS';
    if (kw.includes('gdpr')) return 'GDPR';
    if (kw.includes('fedramp')) return 'FedRAMP';
    if (kw.includes('cmmc')) return 'CMMC';
    if (kw.includes('nist')) return 'NIST CSF';
    if (kw.includes('hitrust')) return 'HITRUST';
    if (kw.includes('tool') || kw.includes('software') || kw.includes('automation')) return 'Tools';
    
    return 'Compliance';
  }

  private detectIndustry(keyword: string): string | undefined {
    const kw = keyword.toLowerCase();
    
    if (kw.includes('healthcare') || kw.includes('health')) return 'Healthcare';
    if (kw.includes('fintech') || kw.includes('finance') || kw.includes('financial')) return 'Fintech';
    if (kw.includes('saas') || kw.includes('software')) return 'SaaS';
    if (kw.includes('startup') || kw.includes('startups')) return 'Startups';
    if (kw.includes('enterprise')) return 'Enterprise';
    
    return undefined;
  }

  private generateTopicTitle(keyword: string): string {
    // Convert keyword to title case
    const words = keyword.split(' ');
    const titleCase = words.map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');

    // Add year for SEO
    return `${titleCase} Guide 2025`;
  }

  async generateReport(outputPath: string = 'scripts/output/topic-research-report.json'): Promise<void> {
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const report = {
      generatedAt: new Date().toISOString(),
      totalTopics: this.researchedTopics.length,
      topics: this.researchedTopics,
      summary: {
        averageRevenueScore: this.getAverage(this.researchedTopics.map(t => t.revenueScore)),
        averageSearchVolume: this.getAverage(this.researchedTopics.map(t => t.searchVolume)),
        averageCPC: this.getAverage(this.researchedTopics.map(t => t.cpc)),
        topCategories: this.getTopCategories(),
        topIndustries: this.getTopIndustries()
      }
    };

    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`📄 Report saved to: ${outputPath}`);
  }

  private getAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }

  private getTopCategories(): { [key: string]: number } {
    const categories: { [key: string]: number } = {};
    this.researchedTopics.forEach(topic => {
      categories[topic.category] = (categories[topic.category] || 0) + 1;
    });
    return categories;
  }

  private getTopIndustries(): { [key: string]: number } {
    const industries: { [key: string]: number } = {};
    this.researchedTopics.forEach(topic => {
      if (topic.industry) {
        industries[topic.industry] = (industries[topic.industry] || 0) + 1;
      }
    });
    return industries;
  }

  async updateHighValueTopics(outputPath: string = 'config/high-value-topics.json'): Promise<void> {
    console.log('📝 Updating high-value-topics.json...\n');

    // Load existing topics
    const existingContent = fs.readFileSync(outputPath, 'utf-8');
    const existing = JSON.parse(existingContent);
    const existingTopics = existing.highValueTopics || [];

    // Convert researched topics to config format
    const newTopics = this.researchedTopics.map((topic, index) => ({
      priority: existingTopics.length + index + 1,
      topic: topic.topic,
      primaryKeyword: topic.primaryKeyword,
      secondaryKeywords: topic.secondaryKeywords,
      searchVolume: `${topic.searchVolume.toLocaleString()}+`,
      cpc: `$${topic.cpc.toFixed(2)}`,
      competitionLevel: topic.competition,
      competitionScore: topic.competitionScore,
      buyerIntent: this.buyerIntentToString(topic.buyerIntent),
      expectedTraffic: this.estimateTraffic(topic.searchVolume, topic.competitionScore),
      adRevenuePotential: `$${Math.round(topic.searchVolume * topic.cpc * 0.7 / 1000)}/month`,
      leadGenPotential: topic.leadGenScore >= 7 ? 'high' : topic.leadGenScore >= 5 ? 'medium' : 'low',
      revenueScore: parseFloat(topic.revenueScore.toFixed(1)),
      category: topic.category,
      industry: topic.industry,
      whyOpportunity: this.generateWhyOpportunity(topic),
      competitorUrls: [] // Will be filled by generator
    }));

    // Combine existing and new topics
    const allTopics = [...existingTopics, ...newTopics];

    // Update config
    const updatedConfig = {
      ...existing,
      highValueTopics: allTopics,
      totalExpectedTraffic: this.calculateTotalTraffic(allTopics),
      totalExpectedAdRevenue: this.calculateTotalAdRevenue(allTopics),
      totalResearchDate: new Date().toISOString()
    };

    // Backup original
    const backupPath = outputPath.replace('.json', `.backup.${Date.now()}.json`);
    fs.writeFileSync(backupPath, existingContent);
    console.log(`💾 Backup created: ${backupPath}`);

    // Write updated config
    fs.writeFileSync(outputPath, JSON.stringify(updatedConfig, null, 2));
    console.log(`✅ Updated ${newTopics.length} new topics to ${outputPath}`);
    console.log(`📊 Total topics: ${allTopics.length}`);
  }

  private buyerIntentToString(score: number): string {
    if (score >= 8) return 'very high';
    if (score >= 6) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
  }

  private estimateTraffic(searchVolume: number, competitionScore: number): string {
    // Assume 3-5% CTR at position 5-10
    const ctr = 0.04;
    const estimatedMonthly = Math.round(searchVolume * ctr);
    return `${estimatedMonthly}-${Math.round(estimatedMonthly * 1.5)}/month`;
  }

  private generateWhyOpportunity(topic: ResearchedTopic): string {
    const reasons: string[] = [];

    if (topic.searchVolume > 5000) {
      reasons.push('high search volume');
    }
    if (topic.cpc > 5) {
      reasons.push('high CPC');
    }
    if (topic.competition === 'low') {
      reasons.push('low competition');
    }
    if (topic.buyerIntent >= 7) {
      reasons.push('strong buyer intent');
    }
    if (topic.redditInterest > 20) {
      reasons.push('active community discussion');
    }

    return reasons.length > 0 
      ? reasons.join(', ') + `, revenue score: ${topic.revenueScore.toFixed(1)}/10`
      : 'Emerging opportunity';
  }

  private calculateTotalTraffic(topics: any[]): string {
    const total = topics.reduce((sum, t) => {
      const range = t.expectedTraffic || '0-0';
      const avg = range.split('-').map(v => parseInt(v)).reduce((a, b) => a + b) / 2;
      return sum + avg;
    }, 0);
    return `${Math.round(total).toLocaleString()}/month`;
  }

  private calculateTotalAdRevenue(topics: any[]): string {
    const total = topics.reduce((sum, t) => {
      const adRev = t.adRevenuePotential?.match(/\$(\d+)/)?.[1];
      return sum + (parseInt(adRev || '0'));
    }, 0);
    return `$${Math.round(total).toLocaleString()}/month`;
  }
}

// Main execution
async function main() {
  const researcher = new TopicResearcher();

  console.log('🚀 High-Value Topic Research Tool\n');
  console.log('================================\n');

  // Research all topics
  await researcher.researchAllTopics();

  // Generate report
  await researcher.generateReport();

  // Update high-value-topics.json
  await researcher.updateHighValueTopics();

  console.log('\n✅ Topic research complete!');
  console.log('\nNext steps:');
  console.log('1. Review scripts/output/topic-research-report.json');
  console.log('2. Review updated config/high-value-topics.json');
  console.log('3. Generate articles: npm run generate-2026 -- --count=50');
}

main().catch(console.error);
