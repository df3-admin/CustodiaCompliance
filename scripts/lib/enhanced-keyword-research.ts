import GeminiClient from './gemini-client.js';
import SerpResearch from './serp-research.js';

export interface KeywordOpportunity {
  primaryKeyword: string;
  searchVolume: number;
  competitionScore: number; // 0-100 (lower = easier to rank)
  opportunityScore: number; // Calculated based on volume/competition ratio
  competitorAnalysis: {
    topCompetitors: string[];
    contentGaps: string[];
    weakPoints: string[];
    averageWordCount: number;
    averageReadabilityScore: number;
  };
  searchIntent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  featuredSnippetOpportunity: boolean;
  longTailVariations: string[];
  difficultyScore: number; // 0-100 (lower = easier)
  commercialValue: number; // 0-100 (higher = more valuable)
  trendDirection: 'rising' | 'stable' | 'declining';
  seasonalPattern?: string;
}

export interface CompetitorAnalysis {
  url: string;
  title: string;
  wordCount: number;
  structureAnalysis: string[];
  missingTopics: string[];
  weakSections: string[];
  technicalSEO: {
    pageSpeed: number;
    mobileScore: number;
    schemaMarkup: string[];
    internalLinking: number;
    externalLinking: number;
  };
  contentGaps: {
    topicsNotCovered: string[];
    depthOpportunities: string[];
    formatOpportunities: string[];
  };
  authoritySignals: {
    domainAuthority: number;
    backlinks: number;
    socialShares: number;
  };
}

export interface ContentGapAnalysis {
  missingTopics: string[];
  depthOpportunities: string[];
  formatOpportunities: string[];
  keywordOpportunities: string[];
  userIntentGaps: string[];
}

export class EnhancedKeywordResearch {
  private gemini: GeminiClient;
  private serp: SerpResearch;

  constructor() {
    this.gemini = new GeminiClient();
    this.serp = new SerpResearch();
  }

  async analyzeKeywordOpportunity(
    keyword: string,
    competitorUrls: string[],
    category: string
  ): Promise<KeywordOpportunity> {
    console.log(`🔍 Analyzing keyword opportunity: ${keyword}`);

    try {
      // Get real SERP data from SerpAPI
      const serpData = await this.serp.getKeywordData(keyword);
      console.log(`✅ SERP data: ${serpData.searchVolume} searches, ${serpData.competition} competition`);
      
      // Analyze competitors and identify gaps
      const competitorAnalysis = await this.analyzeCompetitors(competitorUrls, keyword);
      
      // Determine search intent
      const searchIntent = await this.determineSearchIntent(keyword);
      
      // Calculate opportunity score with real data
      const opportunityScore = this.calculateOpportunityScore(
        competitorAnalysis,
        searchIntent
      );

      // Use real related keywords from SerpAPI
      const longTailVariations = serpData.relatedKeywords.length > 0 
        ? serpData.relatedKeywords 
        : await this.generateLongTailVariations(keyword, category);

      // Check featured snippet opportunity based on real SERP data
      const featuredSnippetOpportunity = serpData.featuredSnippet !== undefined;

      // Analyze trends
      const trendDirection = await this.analyzeTrendDirection(keyword);

      const opportunity: KeywordOpportunity = {
        primaryKeyword: keyword,
        searchVolume: serpData.searchVolume, // Real search volume from SerpAPI
        competitionScore: this.calculateCompetitionScore(competitorAnalysis),
        opportunityScore,
        competitorAnalysis: {
          topCompetitors: competitorUrls,
          contentGaps: competitorAnalysis.contentGaps.topicsNotCovered,
          weakPoints: competitorAnalysis.contentGaps.depthOpportunities,
          averageWordCount: competitorAnalysis.wordCount,
          averageReadabilityScore: 75 // Placeholder - would need actual analysis
        },
        searchIntent,
        featuredSnippetOpportunity,
        longTailVariations,
        difficultyScore: this.calculateDifficultyScore(competitorAnalysis),
        commercialValue: this.calculateCommercialValue(keyword, searchIntent),
        trendDirection
      };

      console.log(`✅ Keyword analysis complete:`);
      console.log(`   - Opportunity Score: ${opportunityScore}/100`);
      console.log(`   - Competition Score: ${opportunity.competitionScore}/100`);
      console.log(`   - Difficulty Score: ${opportunity.difficultyScore}/100`);
      console.log(`   - Commercial Value: ${opportunity.commercialValue}/100`);
      console.log(`   - Featured Snippet Opportunity: ${featuredSnippetOpportunity}`);

      return opportunity;
    } catch (error) {
      console.error('❌ Error analyzing keyword opportunity:', error);
      throw error;
    }
  }

  private async analyzeCompetitors(urls: string[], keyword: string): Promise<CompetitorAnalysis> {
    console.log(`📊 Analyzing ${urls.length} competitors for keyword: ${keyword}`);

    const prompt = `
    Analyze these competitor URLs for "${keyword}":
    ${urls.join(', ')}
    
    Provide a JSON response with this exact structure:
    {
      "urls": [
        {
          "url": "example.com",
          "title": "Page Title",
          "wordCount": 2500,
          "structureAnalysis": ["good headings", "missing FAQ"],
          "missingTopics": ["cost breakdown", "timeline"],
          "weakSections": ["implementation guide"],
          "technicalSEO": {
            "pageSpeed": 85,
            "mobileScore": 90,
            "schemaMarkup": ["Article"],
            "internalLinking": 5,
            "externalLinking": 3
          },
          "contentGaps": {
            "topicsNotCovered": ["specific examples"],
            "depthOpportunities": ["step-by-step guide"],
            "formatOpportunities": ["interactive checklist"]
          },
          "authoritySignals": {
            "domainAuthority": 75,
            "backlinks": 1000,
            "socialShares": 50
          }
        }
      ]
    }
    
    IMPORTANT: Return ONLY valid JSON, no additional text or explanation.
    `;

    const analysis = await this.gemini.generateContent(prompt, { temperature: 0.3 });
    
    try {
      // Try to extract JSON from the response (sometimes wrapped in markdown)
      let jsonContent = analysis;
      
      // Check if response is wrapped in markdown code blocks
      const codeBlockMatch = analysis.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonContent = codeBlockMatch[1].trim();
      }
      
      // Try to parse the JSON
      const parsed = JSON.parse(jsonContent);
      
      // Extract the first competitor analysis or use overall gaps
      if (parsed.urls && parsed.urls.length > 0) {
        return parsed.urls[0];
      } else if (parsed.overallGaps) {
        // If we only have overall gaps, create a competitor analysis from that
        return {
          url: urls[0],
          title: 'Competitor Analysis',
          wordCount: 3500,
          structureAnalysis: [],
          missingTopics: parsed.overallGaps.missingTopics || [],
          weakSections: parsed.overallGaps.depthOpportunities || [],
          technicalSEO: {
            pageSpeed: 75,
            mobileScore: 80,
            schemaMarkup: ['Article'],
            internalLinking: 5,
            externalLinking: 3
          },
          contentGaps: {
            topicsNotCovered: parsed.overallGaps.missingTopics || [],
            depthOpportunities: parsed.overallGaps.depthOpportunities || [],
            formatOpportunities: parsed.overallGaps.formatOpportunities || []
          },
          authoritySignals: {
            domainAuthority: 60,
            backlinks: 1000,
            socialShares: 25
          }
        };
      }
      
      return this.getDefaultCompetitorAnalysis(urls[0]);
    } catch (error) {
      console.warn('⚠️ Could not parse competitor analysis, using defaults:', error);
      return this.getDefaultCompetitorAnalysis(urls[0]);
    }
  }

  private async determineSearchIntent(keyword: string): Promise<'informational' | 'commercial' | 'transactional' | 'navigational'> {
    const prompt = `
    Determine the search intent for the keyword "${keyword}".
    
    Classify as one of:
    - informational: User wants to learn/understand something
    - commercial: User is researching before buying
    - transactional: User wants to take action/buy
    - navigational: User wants to find a specific site
    
    Consider the keyword context and typical user behavior.
    
    Respond with just the intent type.
    `;

    const intent = await this.gemini.generateContent(prompt, { temperature: 0.1 });
    const cleanIntent = intent.toLowerCase().trim();
    
    if (cleanIntent.includes('commercial')) return 'commercial';
    if (cleanIntent.includes('transactional')) return 'transactional';
    if (cleanIntent.includes('navigational')) return 'navigational';
    return 'informational';
  }

  private calculateOpportunityScore(
    competitorAnalysis: CompetitorAnalysis,
    searchIntent: string
  ): number {
    let score = 100;

    // Handle undefined competitor analysis
    if (!competitorAnalysis) {
      return 75; // Default score when no competitor data
    }

    // Reduce score based on competition
    if (competitorAnalysis.authoritySignals?.domainAuthority > 80) score -= 20;
    if (competitorAnalysis.authoritySignals?.backlinks > 5000) score -= 15;
    if (competitorAnalysis.wordCount > 5000) score -= 10;

    // Increase score based on gaps
    if (competitorAnalysis.contentGaps?.topicsNotCovered?.length > 3) score += 15;
    if (competitorAnalysis.contentGaps?.depthOpportunities?.length > 2) score += 10;
    if (competitorAnalysis.contentGaps?.formatOpportunities?.length > 1) score += 5;

    // Adjust based on search intent
    if (searchIntent === 'commercial') score += 10;
    if (searchIntent === 'transactional') score += 15;

    return Math.max(0, Math.min(100, score));
  }

  private async generateLongTailVariations(keyword: string, category: string): Promise<string[]> {
    const prompt = `
    Generate 10 long-tail keyword variations for "${keyword}" in the ${category} category.
    
    Focus on:
    - Specific implementation questions
    - Cost-related queries
    - Timeline questions
    - Comparison queries
    - Problem-solving queries
    
    Make them natural and searchable.
    
    Output as a JSON array of strings.
    `;

    const variations = await this.gemini.generateContent(prompt, { temperature: 0.7 });
    
    try {
      return JSON.parse(variations);
    } catch (error) {
      return [
        `${keyword} checklist`,
        `${keyword} cost breakdown`,
        `${keyword} implementation guide`,
        `${keyword} timeline`,
        `${keyword} requirements`,
        `${keyword} best practices`,
        `${keyword} common mistakes`,
        `${keyword} tools comparison`,
        `${keyword} for startups`,
        `${keyword} compliance guide`
      ];
    }
  }

  private async checkFeaturedSnippetOpportunity(keyword: string): Promise<boolean> {
    const prompt = `
    Does the keyword "${keyword}" have good potential for featured snippets?
    
    Consider:
    - Is it a question format?
    - Does it seek definitions or explanations?
    - Is it asking for lists or steps?
    - Is it a comparison query?
    
    Respond with "yes" or "no" and brief reasoning.
    `;

    const response = await this.gemini.generateContent(prompt, { temperature: 0.1 });
    return response.toLowerCase().includes('yes');
  }

  private async analyzeTrendDirection(keyword: string): Promise<'rising' | 'stable' | 'declining'> {
    // This would typically use Google Trends API or similar
    // For now, we'll use AI to estimate based on keyword characteristics
    const prompt = `
    Analyze if the keyword "${keyword}" is trending upward, stable, or declining.
    
    Consider:
    - Industry growth trends
    - Regulatory changes
    - Technology adoption
    - Market demand
    
    Respond with "rising", "stable", or "declining".
    `;

    const trend = await this.gemini.generateContent(prompt, { temperature: 0.1 });
    const cleanTrend = trend.toLowerCase().trim();
    
    if (cleanTrend.includes('rising')) return 'rising';
    if (cleanTrend.includes('declining')) return 'declining';
    return 'stable';
  }

  private async estimateSearchVolume(keyword: string): Promise<number> {
    // This would typically use Google Keyword Planner API or similar
    // For now, we'll estimate based on keyword characteristics
    const prompt = `
    Estimate the monthly search volume for "${keyword}".
    
    Consider:
    - Industry size
    - Keyword specificity
    - Business relevance
    - Compliance requirements
    
    Respond with just a number (e.g., 5000).
    `;

    const volume = await this.gemini.generateContent(prompt, { temperature: 0.1 });
    const parsed = parseInt(volume.replace(/\D/g, ''));
    return parsed || 1000;
  }

  private calculateCompetitionScore(competitorAnalysis: CompetitorAnalysis): number {
    let score = 0;

    // Higher domain authority = higher competition
    if (competitorAnalysis.authoritySignals.domainAuthority > 80) score += 30;
    else if (competitorAnalysis.authoritySignals.domainAuthority > 60) score += 20;
    else if (competitorAnalysis.authoritySignals.domainAuthority > 40) score += 10;

    // More backlinks = higher competition
    if (competitorAnalysis.authoritySignals.backlinks > 10000) score += 25;
    else if (competitorAnalysis.authoritySignals.backlinks > 5000) score += 15;
    else if (competitorAnalysis.authoritySignals.backlinks > 1000) score += 10;

    // More comprehensive content = higher competition
    if (competitorAnalysis.wordCount > 8000) score += 20;
    else if (competitorAnalysis.wordCount > 5000) score += 15;
    else if (competitorAnalysis.wordCount > 3000) score += 10;

    return Math.min(100, score);
  }

  private calculateDifficultyScore(competitorAnalysis: CompetitorAnalysis): number {
    let score = 0;

    // Technical SEO factors
    if (competitorAnalysis.technicalSEO.pageSpeed > 90) score += 10;
    if (competitorAnalysis.technicalSEO.mobileScore > 90) score += 10;
    if (competitorAnalysis.technicalSEO.schemaMarkup.length > 2) score += 10;

    // Content quality factors
    if (competitorAnalysis.wordCount > 5000) score += 15;
    if (competitorAnalysis.contentGaps.topicsNotCovered.length < 2) score += 10;

    // Authority factors
    if (competitorAnalysis.authoritySignals.domainAuthority > 70) score += 20;
    if (competitorAnalysis.authoritySignals.backlinks > 5000) score += 15;

    return Math.min(100, score);
  }

  private calculateCommercialValue(keyword: string, searchIntent: string): number {
    let value = 50; // Base value

    // Intent-based adjustments
    if (searchIntent === 'transactional') value += 30;
    if (searchIntent === 'commercial') value += 20;
    if (searchIntent === 'informational') value += 10;

    // Keyword-based adjustments
    if (keyword.includes('cost') || keyword.includes('price')) value += 15;
    if (keyword.includes('implementation') || keyword.includes('guide')) value += 10;
    if (keyword.includes('compliance') || keyword.includes('audit')) value += 15;

    return Math.min(100, value);
  }

  private getDefaultCompetitorAnalysis(url: string): CompetitorAnalysis {
    return {
      url,
      title: 'Competitor Page',
      wordCount: 3000,
      structureAnalysis: ['basic structure'],
      missingTopics: [],
      weakSections: ['FAQ section'],
      technicalSEO: {
        pageSpeed: 75,
        mobileScore: 80,
        schemaMarkup: ['Article'],
        internalLinking: 5,
        externalLinking: 3
      },
      contentGaps: {
        topicsNotCovered: ['detailed implementation', 'cost breakdown', 'advanced topics'],
        depthOpportunities: ['step-by-step guides'],
        formatOpportunities: ['interactive content']
      },
      authoritySignals: {
        domainAuthority: 60,
        backlinks: 1000,
        socialShares: 25
      }
    };
  }

  async generateContentGapAnalysis(
    keyword: string,
    competitorUrls: string[]
  ): Promise<ContentGapAnalysis> {
    console.log(`🔍 Generating content gap analysis for: ${keyword}`);

    const prompt = `
    Analyze content gaps for the keyword "${keyword}" by examining these competitor URLs:
    ${competitorUrls.join(', ')}
    
    Identify:
    1. Topics that are missing or poorly covered
    2. Areas where content lacks depth
    3. Format opportunities (checklists, tools, comparisons)
    4. Related keywords not being targeted
    5. User intent gaps (what users want but aren't getting)
    
    Output as JSON:
    {
      "missingTopics": ["topic1", "topic2"],
      "depthOpportunities": ["area1", "area2"],
      "formatOpportunities": ["format1", "format2"],
      "keywordOpportunities": ["keyword1", "keyword2"],
      "userIntentGaps": ["intent1", "intent2"]
    }
    `;

    const analysis = await this.gemini.generateContent(prompt, { temperature: 0.3 });
    
    try {
      return JSON.parse(analysis);
    } catch (error) {
      console.warn('⚠️ Could not parse gap analysis, using defaults');
      return {
        missingTopics: ['cost breakdown', 'timeline', 'common mistakes'],
        depthOpportunities: ['implementation guide', 'troubleshooting'],
        formatOpportunities: ['interactive checklist', 'comparison tool'],
        keywordOpportunities: [`${keyword} cost`, `${keyword} timeline`],
        userIntentGaps: ['practical implementation', 'real-world examples']
      };
    }
  }
}

export default EnhancedKeywordResearch;
