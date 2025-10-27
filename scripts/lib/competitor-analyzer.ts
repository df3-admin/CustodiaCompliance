import GeminiClient from './gemini-client.js';

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
  contentQuality: {
    readabilityScore: number;
    engagementSignals: number;
    expertiseLevel: 'basic' | 'intermediate' | 'expert';
    practicalValue: number;
  };
}

export interface CompetitiveGapAnalysis {
  overallGaps: {
    missingTopics: string[];
    depthOpportunities: string[];
    formatOpportunities: string[];
    keywordOpportunities: string[];
    userIntentGaps: string[];
  };
  competitiveAdvantages: string[];
  contentStrategy: string[];
  differentiationPoints: string[];
}

export class CompetitorAnalyzer {
  private gemini: GeminiClient;

  constructor() {
    this.gemini = new GeminiClient();
  }

  async analyzeCompetitors(
    competitorUrls: string[],
    keyword: string,
    topic: string
  ): Promise<{
    competitors: CompetitorAnalysis[];
    gapAnalysis: CompetitiveGapAnalysis;
  }> {
    console.log(`🔍 Analyzing ${competitorUrls.length} competitors for: ${keyword}`);

    try {
      // Analyze individual competitors
      const competitors = await Promise.all(
        competitorUrls.map(url => this.analyzeIndividualCompetitor(url, keyword, topic))
      );

      // Perform gap analysis
      const gapAnalysis = await this.performGapAnalysis(competitors, keyword, topic);

      console.log(`✅ Competitor analysis complete:`);
      console.log(`   - Competitors analyzed: ${competitors.length}`);
      console.log(`   - Content gaps identified: ${gapAnalysis.overallGaps.missingTopics.length}`);
      console.log(`   - Competitive advantages: ${gapAnalysis.competitiveAdvantages.length}`);
      console.log(`   - Differentiation points: ${gapAnalysis.differentiationPoints.length}`);

      return { competitors, gapAnalysis };
    } catch (error) {
      console.error('❌ Error analyzing competitors:', error);
      throw error;
    }
  }

  private async analyzeIndividualCompetitor(
    url: string,
    keyword: string,
    topic: string
  ): Promise<CompetitorAnalysis> {
    console.log(`📊 Analyzing competitor: ${url}`);

    const prompt = `
    Analyze this competitor URL for the keyword "${keyword}" about "${topic}":
    
    URL: ${url}
    
    Provide comprehensive analysis including:
    
    CONTENT ANALYSIS:
    - Title and main heading
    - Estimated word count
    - Content structure and organization
    - Topics covered vs missing
    - Weak sections or areas lacking depth
    
    TECHNICAL SEO:
    - Page speed (estimate 0-100)
    - Mobile optimization (estimate 0-100)
    - Schema markup used
    - Internal linking count
    - External linking count
    
    CONTENT GAPS:
    - Topics not covered
    - Areas lacking depth
    - Format opportunities (checklists, tools, etc.)
    
    AUTHORITY SIGNALS:
    - Domain authority (estimate 0-100)
    - Backlink count (estimate)
    - Social shares (estimate)
    
    CONTENT QUALITY:
    - Readability score (estimate 0-100)
    - Engagement signals (estimate 0-100)
    - Expertise level (basic/intermediate/expert)
    - Practical value (estimate 0-100)
    
    Output as JSON:
    {
      "url": "${url}",
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
      },
      "contentQuality": {
        "readabilityScore": 80,
        "engagementSignals": 70,
        "expertiseLevel": "intermediate",
        "practicalValue": 75
      }
    }
    `;

    const analysis = await this.gemini.generateContent(prompt, { temperature: 0.3 });
    
    try {
      // Try to extract JSON from markdown code blocks or plain text
      let jsonStr = analysis.trim();
      
      // Check if wrapped in markdown code blocks
      const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1].trim();
      }
      
      // Try to find JSON object boundaries
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
      
      return JSON.parse(jsonStr);
    } catch (error) {
      console.warn(`⚠️ Could not parse analysis for ${url}, using defaults`);
      return this.getDefaultCompetitorAnalysis(url);
    }
  }

  private async performGapAnalysis(
    competitors: CompetitorAnalysis[],
    keyword: string,
    topic: string
  ): Promise<CompetitiveGapAnalysis> {
    const prompt = `
    Perform competitive gap analysis for "${topic}" targeting "${keyword}".
    
    Competitor data:
    ${competitors.map(c => `
    - ${c.url}: ${c.wordCount || 'unknown'} words, ${c.contentQuality?.expertiseLevel || 'intermediate'} level
      Missing: ${(c.missingTopics || []).join(', ') || 'none identified'}
      Weak: ${(c.weakSections || []).join(', ') || 'none identified'}
    `).join('\n')}
    
    Identify:
    
    OVERALL GAPS:
    - Topics missing across most competitors
    - Areas where all competitors lack depth
    - Format opportunities not being used
    - Related keywords not being targeted
    - User intent gaps not being addressed
    
    COMPETITIVE ADVANTAGES:
    - Areas where we can outperform competitors
    - Unique value propositions we can offer
    - Content formats we can excel at
    
    CONTENT STRATEGY:
    - How to differentiate our content
    - What to focus on that competitors miss
    - How to provide superior value
    
    DIFFERENTIATION POINTS:
    - Specific ways to stand out
    - Unique angles or approaches
    - Proprietary insights we can offer
    
    Output as JSON:
    {
      "overallGaps": {
        "missingTopics": ["topic1", "topic2"],
        "depthOpportunities": ["area1", "area2"],
        "formatOpportunities": ["format1", "format2"],
        "keywordOpportunities": ["keyword1", "keyword2"],
        "userIntentGaps": ["intent1", "intent2"]
      },
      "competitiveAdvantages": ["advantage1", "advantage2"],
      "contentStrategy": ["strategy1", "strategy2"],
      "differentiationPoints": ["point1", "point2"]
    }
    `;

    const analysis = await this.gemini.generateContent(prompt, { temperature: 0.3 });
    
    try {
      // Try to extract JSON from markdown code blocks or plain text
      let jsonStr = analysis.trim();
      
      // Check if wrapped in markdown code blocks
      const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1].trim();
      }
      
      // Try to find JSON object boundaries
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
      
      return JSON.parse(jsonStr);
    } catch (error) {
      console.warn('⚠️ Could not parse gap analysis, using defaults');
      return this.getDefaultGapAnalysis();
    }
  }

  private getDefaultCompetitorAnalysis(url: string): CompetitorAnalysis {
    return {
      url,
      title: 'Competitor Page',
      wordCount: 3000,
      structureAnalysis: ['basic structure'],
      missingTopics: ['detailed implementation', 'cost breakdown'],
      weakSections: ['FAQ section'],
      technicalSEO: {
        pageSpeed: 75,
        mobileScore: 80,
        schemaMarkup: ['Article'],
        internalLinking: 5,
        externalLinking: 3
      },
      contentGaps: {
        topicsNotCovered: ['advanced topics'],
        depthOpportunities: ['step-by-step guides'],
        formatOpportunities: ['interactive content']
      },
      authoritySignals: {
        domainAuthority: 60,
        backlinks: 1000,
        socialShares: 25
      },
      contentQuality: {
        readabilityScore: 75,
        engagementSignals: 70,
        expertiseLevel: 'intermediate',
        practicalValue: 70
      }
    };
  }

  private getDefaultGapAnalysis(): CompetitiveGapAnalysis {
    return {
      overallGaps: {
        missingTopics: ['cost breakdown', 'timeline', 'common mistakes'],
        depthOpportunities: ['implementation guide', 'troubleshooting'],
        formatOpportunities: ['interactive checklist', 'comparison tool'],
        keywordOpportunities: ['cost', 'timeline', 'implementation'],
        userIntentGaps: ['practical implementation', 'real-world examples']
      },
      competitiveAdvantages: [
        'Veteran-owned expertise',
        'Fixed pricing transparency',
        'Comprehensive implementation support',
        'Industry-specific insights'
      ],
      contentStrategy: [
        'Focus on practical implementation',
        'Provide transparent cost information',
        'Include real-world case studies',
        'Offer downloadable resources'
      ],
      differentiationPoints: [
        'Proprietary compliance methodology',
        'Client success stories',
        'Industry-specific expertise',
        'Transparent pricing model'
      ]
    };
  }

  async generateCompetitiveContentStrategy(
    topic: string,
    keyword: string,
    gapAnalysis: CompetitiveGapAnalysis
  ): Promise<string> {
    console.log(`🎯 Generating competitive content strategy for: ${topic}`);

    const prompt = `
    Create a competitive content strategy for "${topic}" targeting "${keyword}" based on this gap analysis:
    
    GAP ANALYSIS:
    Missing Topics: ${gapAnalysis.overallGaps.missingTopics.join(', ')}
    Depth Opportunities: ${gapAnalysis.overallGaps.depthOpportunities.join(', ')}
    Format Opportunities: ${gapAnalysis.overallGaps.formatOpportunities.join(', ')}
    Keyword Opportunities: ${gapAnalysis.overallGaps.keywordOpportunities.join(', ')}
    User Intent Gaps: ${gapAnalysis.overallGaps.userIntentGaps.join(', ')}
    
    COMPETITIVE ADVANTAGES:
    ${gapAnalysis.competitiveAdvantages.join(', ')}
    
    DIFFERENTIATION POINTS:
    ${gapAnalysis.differentiationPoints.join(', ')}
    
    Create a comprehensive content strategy that:
    1. Addresses all identified gaps
    2. Leverages competitive advantages
    3. Differentiates from competitors
    4. Provides superior value
    5. Targets multiple keyword opportunities
    
    Focus on creating content that will outperform competitors and capture market share.
    
    Output as detailed strategy with specific recommendations.
    `;

    const strategy = await this.gemini.generateContent(prompt, { temperature: 0.7 });
    
    console.log(`✅ Competitive content strategy generated: ${strategy.length} characters`);
    return strategy;
  }

  async generateCompetitiveContent(
    topic: string,
    keyword: string,
    gapAnalysis: CompetitiveGapAnalysis,
    competitorData: CompetitorAnalysis[]
  ): Promise<string> {
    console.log(`🎯 Generating competitive content for: ${topic}`);

    const prompt = `
    Create competitive content for "${topic}" targeting "${keyword}" that outperforms competitors.
    
    COMPETITOR ANALYSIS:
    ${competitorData.map(c => `
    - ${c.url}: ${c.wordCount} words, ${c.contentQuality.expertiseLevel} level
      Missing: ${c.missingTopics.join(', ')}
      Weak: ${c.weakSections.join(', ')}
    `).join('\n')}
    
    GAP ANALYSIS:
    Missing Topics: ${gapAnalysis.overallGaps.missingTopics.join(', ')}
    Depth Opportunities: ${gapAnalysis.overallGaps.depthOpportunities.join(', ')}
    Format Opportunities: ${gapAnalysis.overallGaps.formatOpportunities.join(', ')}
    
    COMPETITIVE ADVANTAGES TO LEVERAGE:
    ${gapAnalysis.competitiveAdvantages.join(', ')}
    
    DIFFERENTIATION POINTS:
    ${gapAnalysis.differentiationPoints.join(', ')}
    
    CONTENT REQUIREMENTS:
    
    SUPERIOR COVERAGE:
    - Address all topics competitors miss
    - Provide deeper depth in weak areas
    - Use better content formats
    - Include practical implementation details
    
    COMPETITIVE DIFFERENTIATION:
    - Leverage veteran-owned expertise
    - Provide transparent cost information
    - Include real client case studies
    - Offer proprietary methodologies
    
    VALUE PROPOSITION:
    - More comprehensive than competitors
    - More practical and actionable
    - More authoritative and trustworthy
    - More user-friendly and engaging
    
    STRUCTURE:
    1. Introduction highlighting competitive advantages
    2. Comprehensive topic coverage (addressing gaps)
    3. Detailed implementation guide (deeper than competitors)
    4. Cost breakdown (transparent and detailed)
    5. Timeline and process (more detailed than competitors)
    6. Case study (real client example)
    7. Tools comparison (more comprehensive)
    8. FAQ (addressing competitor gaps)
    9. Conclusion with clear differentiation
    
    TONE: Expert, authoritative, transparent, helpful
    LENGTH: 10,000-15,000 words (longer than competitors)
    STYLE: Comprehensive, practical, differentiated
    
    Focus on creating content that clearly outperforms competitors and captures market share.
    `;

    const content = await this.gemini.generateContent(prompt, { temperature: 0.7 });
    
    console.log(`✅ Competitive content generated: ${content.length} characters`);
    return content;
  }
}

export default CompetitorAnalyzer;
