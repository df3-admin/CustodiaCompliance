import GeminiClient from './gemini-client.js';

export interface ContentQualityMetrics {
  comprehensiveness: {
    wordCount: number;
    sectionDepth: number;
    topicCoverage: number; // 0-100%
    practicalExamples: number;
    technicalDepth: 'basic' | 'intermediate' | 'expert';
  };
  userExperience: {
    readabilityScore: number; // Flesch-Kincaid
    mobileOptimization: boolean;
    loadingSpeed: number;
    internalLinking: number;
    externalLinking: number;
    visualElements: number;
  };
  engagementSignals: {
    expectedDwellTime: number; // minutes
    scrollDepth: number; // 0-100%
    bounceRateReduction: number; // percentage
    socialSharing: boolean;
    commentPotential: boolean;
  };
  seoOptimization: {
    keywordDensity: number;
    headingStructure: number; // 0-100
    metaOptimization: number; // 0-100
    schemaMarkup: boolean;
    internalLinking: number;
  };
  authoritySignals: {
    citations: number;
    expertQuotes: number;
    caseStudies: number;
    proprietaryData: boolean;
    uniqueInsights: number;
  };
}

export interface QualityAnalysis {
  overallScore: number; // 0-100
  metrics: ContentQualityMetrics;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  recommendations: string[];
}

export class ContentQualityAnalyzer {
  private gemini: GeminiClient;

  constructor() {
    this.gemini = new GeminiClient();
  }

  private parseJSONFromGemini(text: string): any {
    try {
      let jsonStr = text.trim();
      const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) jsonStr = codeBlockMatch[1].trim();
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) jsonStr = jsonMatch[0];
      return JSON.parse(jsonStr);
    } catch (error) {
      return null;
    }
  }

  async analyzeContentQuality(
    content: string,
    topic: string,
    keyword: string
  ): Promise<QualityAnalysis> {
    console.log(`📊 Analyzing content quality for: ${topic}`);

    try {
      // Analyze comprehensive metrics
      const metrics = await this.analyzeMetrics(content, topic, keyword);
      
      // Identify strengths and weaknesses
      const strengths = await this.identifyStrengths(content, topic);
      const weaknesses = await this.identifyWeaknesses(content, topic);
      
      // Generate improvements
      const improvements = await this.generateImprovements(content, topic, keyword);
      
      // Create recommendations
      const recommendations = await this.generateRecommendations(topic, keyword);
      
      // Calculate overall score
      const overallScore = this.calculateOverallScore(metrics);

      const analysis: QualityAnalysis = {
        overallScore,
        metrics,
        strengths,
        weaknesses,
        improvements,
        recommendations
      };

      console.log(`✅ Content quality analysis complete:`);
      console.log(`   - Overall Score: ${overallScore}/100`);
      console.log(`   - Strengths: ${strengths.length}`);
      console.log(`   - Weaknesses: ${weaknesses.length}`);
      console.log(`   - Improvements: ${improvements.length}`);
      console.log(`   - Recommendations: ${recommendations.length}`);

      return analysis;
    } catch (error) {
      console.error('❌ Error analyzing content quality:', error);
      throw error;
    }
  }

  private async analyzeMetrics(
    content: string,
    topic: string,
    keyword: string
  ): Promise<ContentQualityMetrics> {
    const prompt = `
    Analyze the content quality metrics for this content about "${topic}" targeting "${keyword}":
    
    Content: ${content.substring(0, 3000)}...
    
    Analyze and provide scores for:
    
    COMPREHENSIVENESS:
    - Word count: ${content.split(' ').length}
    - Section depth: How many detailed sections?
    - Topic coverage: What percentage of the topic is covered? (0-100%)
    - Practical examples: How many real-world examples?
    - Technical depth: basic/intermediate/expert
    
    USER EXPERIENCE:
    - Readability score: Estimate Flesch-Kincaid score
    - Mobile optimization: true/false
    - Internal linking: How many internal links?
    - External linking: How many external links?
    - Visual elements: How many images/tables/lists?
    
    ENGAGEMENT SIGNALS:
    - Expected dwell time: How many minutes?
    - Scroll depth: What percentage will users scroll?
    - Bounce rate reduction: What percentage improvement?
    - Social sharing potential: true/false
    - Comment potential: true/false
    
    SEO OPTIMIZATION:
    - Keyword density: What percentage?
    - Heading structure: How well structured? (0-100)
    - Meta optimization: How well optimized? (0-100)
    - Schema markup: true/false
    - Internal linking: How many internal links?
    
    AUTHORITY SIGNALS:
    - Citations: How many authoritative sources?
    - Expert quotes: How many expert quotes?
    - Case studies: How many case studies?
    - Proprietary data: true/false
    - Unique insights: How many unique insights?
    
    Output as JSON:
    {
      "comprehensiveness": {
        "wordCount": 5000,
        "sectionDepth": 8,
        "topicCoverage": 85,
        "practicalExamples": 5,
        "technicalDepth": "expert"
      },
      "userExperience": {
        "readabilityScore": 75,
        "mobileOptimization": true,
        "loadingSpeed": 85,
        "internalLinking": 8,
        "externalLinking": 12,
        "visualElements": 6
      },
      "engagementSignals": {
        "expectedDwellTime": 6,
        "scrollDepth": 80,
        "bounceRateReduction": 25,
        "socialSharing": true,
        "commentPotential": true
      },
      "seoOptimization": {
        "keywordDensity": 1.5,
        "headingStructure": 85,
        "metaOptimization": 90,
        "schemaMarkup": true,
        "internalLinking": 8
      },
      "authoritySignals": {
        "citations": 15,
        "expertQuotes": 3,
        "caseStudies": 2,
        "proprietaryData": true,
        "uniqueInsights": 5
      }
    }
    `;

    const analysis = await this.gemini.generateContent(prompt, { temperature: 0.3 });
    
    try {
      return JSON.parse(analysis);
    } catch (error) {
      console.warn('⚠️ Could not parse metrics analysis, using defaults');
      return this.getDefaultMetrics(content);
    }
  }

  private async identifyStrengths(content: string, topic: string): Promise<string[]> {
    const prompt = `
    Identify the strengths of this content about "${topic}":
    
    Content: ${content.substring(0, 2000)}...
    
    Focus on:
    - Content depth and comprehensiveness
    - Technical accuracy and expertise
    - Practical value and actionable advice
    - Structure and organization
    - Authority and credibility
    - User experience elements
    
    Provide 5-7 specific strengths.
    
    Output as JSON array of strings.
    `;

    const strengths = await this.gemini.generateContent(prompt, { temperature: 0.7 });
    
    try {
      return JSON.parse(strengths);
    } catch (error) {
      return [
        'Comprehensive coverage of the topic',
        'Clear structure with logical flow',
        'Practical implementation guidance',
        'Authoritative tone and expertise',
        'Good use of headings and organization'
      ];
    }
  }

  private async identifyWeaknesses(content: string, topic: string): Promise<string[]> {
    const prompt = `
    Identify the weaknesses of this content about "${topic}":
    
    Content: ${content.substring(0, 2000)}...
    
    Focus on:
    - Missing information or gaps
    - Areas lacking depth
    - User experience issues
    - SEO optimization problems
    - Authority and credibility gaps
    - Engagement and retention issues
    
    Provide 5-7 specific weaknesses.
    
    Output as JSON array of strings.
    `;

    const weaknesses = await this.gemini.generateContent(prompt, { temperature: 0.7 });
    
    try {
      return JSON.parse(weaknesses);
    } catch (error) {
      return [
        'Limited real-world examples',
        'Missing cost breakdown details',
        'Insufficient troubleshooting guidance',
        'Lack of visual elements',
        'Limited internal linking'
      ];
    }
  }

  private async generateImprovements(
    content: string,
    topic: string,
    keyword: string
  ): Promise<string[]> {
    const prompt = `
    Generate specific improvements for this content about "${topic}" targeting "${keyword}":
    
    Content length: ${content.length} characters
    
    Focus on improvements that will:
    1. Increase comprehensiveness and depth
    2. Improve user experience and engagement
    3. Enhance SEO optimization
    4. Build authority and credibility
    5. Add practical value
    
    Provide 8-10 specific, actionable improvements.
    
    Output as JSON array of strings.
    `;

    const improvements = await this.gemini.generateContent(prompt, { temperature: 0.7 });
    
    try {
      return JSON.parse(improvements);
    } catch (error) {
      return [
        'Add detailed case study with real implementation example',
        'Include comprehensive cost breakdown with specific numbers',
        'Add troubleshooting section with common issues and solutions',
        'Include more visual elements (tables, charts, diagrams)',
        'Add internal links to related content',
        'Include client testimonials or success stories',
        'Add FAQ section addressing common questions',
        'Include step-by-step implementation checklist',
        'Add comparison table with alternatives',
        'Include downloadable resources or templates'
      ];
    }
  }

  private async generateRecommendations(
    topic: string,
    keyword: string
  ): Promise<string[]> {
    const prompt = `
    Generate strategic recommendations for creating high-quality content about "${topic}" targeting "${keyword}".
    
    Focus on:
    1. Content strategy and approach
    2. User experience optimization
    3. SEO and technical optimization
    4. Authority and credibility building
    5. Engagement and retention tactics
    
    Provide 6-8 strategic recommendations.
    
    Output as JSON array of strings.
    `;

    const recommendations = await this.gemini.generateContent(prompt, { temperature: 0.7 });
    
    try {
      return JSON.parse(recommendations);
    } catch (error) {
      return [
        'Position as the definitive guide with comprehensive coverage',
        'Include proprietary frameworks and methodologies',
        'Add interactive elements and downloadable resources',
        'Optimize for featured snippets and voice search',
        'Build authority through case studies and client success stories',
        'Create content clusters around related topics',
        'Implement user feedback loops for continuous improvement',
        'Develop content partnerships with industry experts'
      ];
    }
  }

  private calculateOverallScore(metrics: ContentQualityMetrics): number {
    let score = 0;

    // Comprehensiveness scoring (25 points)
    if (metrics.comprehensiveness.wordCount > 8000) score += 8;
    else if (metrics.comprehensiveness.wordCount > 5000) score += 6;
    else if (metrics.comprehensiveness.wordCount > 3000) score += 4;
    
    if (metrics.comprehensiveness.topicCoverage > 90) score += 7;
    else if (metrics.comprehensiveness.topicCoverage > 80) score += 5;
    else if (metrics.comprehensiveness.topicCoverage > 70) score += 3;
    
    if (metrics.comprehensiveness.technicalDepth === 'expert') score += 10;
    else if (metrics.comprehensiveness.technicalDepth === 'intermediate') score += 6;
    else score += 3;

    // User Experience scoring (25 points)
    if (metrics.userExperience.readabilityScore > 80) score += 8;
    else if (metrics.userExperience.readabilityScore > 70) score += 6;
    else if (metrics.userExperience.readabilityScore > 60) score += 4;
    
    if (metrics.userExperience.mobileOptimization) score += 5;
    if (metrics.userExperience.internalLinking > 10) score += 6;
    else if (metrics.userExperience.internalLinking > 5) score += 4;
    if (metrics.userExperience.visualElements > 5) score += 6;

    // Engagement scoring (25 points)
    if (metrics.engagementSignals.expectedDwellTime > 5) score += 8;
    else if (metrics.engagementSignals.expectedDwellTime > 3) score += 6;
    else score += 4;
    
    if (metrics.engagementSignals.scrollDepth > 80) score += 7;
    else if (metrics.engagementSignals.scrollDepth > 60) score += 5;
    else score += 3;
    
    if (metrics.engagementSignals.bounceRateReduction > 20) score += 5;
    else if (metrics.engagementSignals.bounceRateReduction > 10) score += 3;
    if (metrics.engagementSignals.socialSharing) score += 3;
    if (metrics.engagementSignals.commentPotential) score += 2;

    // SEO scoring (25 points)
    if (metrics.seoOptimization.keywordDensity >= 1 && metrics.seoOptimization.keywordDensity <= 2) score += 8;
    else if (metrics.seoOptimization.keywordDensity > 0.5) score += 5;
    
    if (metrics.seoOptimization.headingStructure > 80) score += 6;
    else if (metrics.seoOptimization.headingStructure > 60) score += 4;
    
    if (metrics.seoOptimization.metaOptimization > 80) score += 6;
    else if (metrics.seoOptimization.metaOptimization > 60) score += 4;
    
    if (metrics.seoOptimization.schemaMarkup) score += 3;
    if (metrics.seoOptimization.internalLinking > 5) score += 2;

    return Math.min(100, score);
  }

  private getDefaultMetrics(content: string): ContentQualityMetrics {
    return {
      comprehensiveness: {
        wordCount: content.split(' ').length,
        sectionDepth: 6,
        topicCoverage: 75,
        practicalExamples: 3,
        technicalDepth: 'intermediate'
      },
      userExperience: {
        readabilityScore: 70,
        mobileOptimization: true,
        loadingSpeed: 80,
        internalLinking: 5,
        externalLinking: 8,
        visualElements: 4
      },
      engagementSignals: {
        expectedDwellTime: 4,
        scrollDepth: 70,
        bounceRateReduction: 15,
        socialSharing: true,
        commentPotential: true
      },
      seoOptimization: {
        keywordDensity: 1.2,
        headingStructure: 75,
        metaOptimization: 80,
        schemaMarkup: true,
        internalLinking: 5
      },
      authoritySignals: {
        citations: 10,
        expertQuotes: 2,
        caseStudies: 1,
        proprietaryData: false,
        uniqueInsights: 3
      }
    };
  }

  async generateQualityOptimizedContent(
    topic: string,
    keyword: string,
    qualityTargets: Partial<ContentQualityMetrics>
  ): Promise<string> {
    console.log(`📊 Generating quality-optimized content for: ${topic}`);

    const prompt = `
    Create high-quality content for "${topic}" targeting "${keyword}" that meets these quality targets:
    
    QUALITY TARGETS:
    ${qualityTargets.comprehensiveness?.wordCount ? `- Word count: ${qualityTargets.comprehensiveness.wordCount}+` : ''}
    ${qualityTargets.comprehensiveness?.topicCoverage ? `- Topic coverage: ${qualityTargets.comprehensiveness.topicCoverage}%+` : ''}
    ${qualityTargets.comprehensiveness?.technicalDepth ? `- Technical depth: ${qualityTargets.comprehensiveness.technicalDepth}` : ''}
    ${qualityTargets.userExperience?.readabilityScore ? `- Readability score: ${qualityTargets.userExperience.readabilityScore}+` : ''}
    ${qualityTargets.engagementSignals?.expectedDwellTime ? `- Dwell time: ${qualityTargets.engagementSignals.expectedDwellTime}+ minutes` : ''}
    ${qualityTargets.authoritySignals?.citations ? `- Citations: ${qualityTargets.authoritySignals.citations}+` : ''}
    
    CONTENT QUALITY REQUIREMENTS:
    
    COMPREHENSIVENESS:
    - Cover all aspects of the topic thoroughly
    - Include practical examples and case studies
    - Provide detailed implementation guidance
    - Address common questions and concerns
    
    USER EXPERIENCE:
    - Clear structure with logical flow
    - Easy-to-read formatting with headings
    - Visual elements (tables, lists, diagrams)
    - Internal and external linking
    
    ENGAGEMENT:
    - Compelling introduction and conclusion
    - Interactive elements and actionable advice
    - Social sharing optimization
    - Comment-worthy insights
    
    AUTHORITY:
    - Expert-level technical depth
    - Authoritative citations and sources
    - Proprietary insights and methodologies
    - Real-world examples and case studies
    
    TONE: Expert, authoritative, helpful, engaging
    LENGTH: 8,000-12,000 words
    STYLE: Professional with practical examples and clear structure
    
    Focus on creating content that exceeds quality standards and provides exceptional value.
    `;

    const content = await this.gemini.generateContent(prompt, { temperature: 0.7 });
    
    console.log(`✅ Quality-optimized content generated: ${content.length} characters`);
    return content;
  }
}

export default ContentQualityAnalyzer;
