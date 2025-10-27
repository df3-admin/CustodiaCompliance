import GeminiClient from './gemini-client.js';

export interface EATSignals {
  experience: {
    caseStudies: boolean;
    realWorldExamples: boolean;
    implementationStories: boolean;
    clientTestimonials: boolean;
    troubleshooting: boolean;
    lessonsLearned: boolean;
  };
  expertise: {
    technicalDepth: 'basic' | 'intermediate' | 'expert-level';
    industryJargon: 'minimal' | 'appropriate' | 'extensive';
    detailedProcesses: boolean;
    advancedConcepts: boolean;
    methodologyExplanation: boolean;
  };
  authoritativeness: {
    authorCredentials: string;
    companyAuthority: string;
    industryRecognition: boolean;
    thoughtLeadership: boolean;
    proprietaryInsights: boolean;
    uniqueData: boolean;
  };
  trustworthiness: {
    citations: 'minimal' | 'adequate' | 'extensive';
    factChecking: boolean;
    transparency: 'low' | 'medium' | 'high';
    contactInfo: boolean;
    updateFrequency: string;
    errorCorrection: boolean;
  };
}

export interface EATOptimization {
  score: number; // 0-100
  signals: EATSignals;
  improvements: string[];
  recommendations: string[];
  contentEnhancements: string[];
}

export class EATOptimizer {
  private gemini: GeminiClient;

  constructor() {
    this.gemini = new GeminiClient();
  }

  private parseJSONFromGemini(text: string): any {
    try {
      // Try to extract JSON from markdown code blocks or plain text
      let jsonStr = text.trim();
      
      // Check if wrapped in markdown code blocks
      const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1].trim();
      }
      
      // Try to find JSON object boundaries
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      } else {
        // Try array
        const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          jsonStr = arrayMatch[0];
        }
      }
      
      return JSON.parse(jsonStr);
    } catch (error) {
      console.warn('⚠️ Could not parse JSON:', error);
      return null;
    }
  }

  async optimizeEAT(
    content: string,
    topic: string,
    category: string
  ): Promise<EATOptimization> {
    console.log(`🎯 Optimizing E-E-A-T for topic: ${topic}`);

    try {
      // Analyze current E-E-A-T signals
      const currentSignals = await this.analyzeCurrentEAT(content, topic);
      
      // Generate improvements
      const improvements = await this.generateEATImprovements(content, topic, category);
      
      // Create recommendations
      const recommendations = await this.generateEATRecommendations(topic, category);
      
      // Calculate E-E-A-T score
      const score = this.calculateEATScore(currentSignals);
      
      // Generate content enhancements
      const contentEnhancements = await this.generateContentEnhancements(content, topic);

      const optimization: EATOptimization = {
        score,
        signals: currentSignals,
        improvements,
        recommendations,
        contentEnhancements
      };

      console.log(`✅ E-E-A-T optimization complete:`);
      console.log(`   - E-E-A-T Score: ${score}/100`);
      console.log(`   - Improvements: ${improvements.length}`);
      console.log(`   - Recommendations: ${recommendations.length}`);
      console.log(`   - Content Enhancements: ${contentEnhancements.length}`);

      return optimization;
    } catch (error) {
      console.error('❌ Error optimizing E-E-A-T:', error);
      throw error;
    }
  }

  private async analyzeCurrentEAT(content: string, topic: string): Promise<EATSignals> {
    const prompt = `
    Analyze the E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) signals in this content about "${topic}":
    
    Content: ${content.substring(0, 2000)}...
    
    Evaluate each E-E-A-T component:
    
    EXPERIENCE:
    - Are there real-world examples or case studies?
    - Does it show practical implementation experience?
    - Are there client stories or testimonials?
    - Does it include troubleshooting or lessons learned?
    
    EXPERTISE:
    - What is the technical depth level?
    - Is industry jargon used appropriately?
    - Are processes explained in detail?
    - Are advanced concepts covered?
    
    AUTHORITATIVENESS:
    - What credentials are shown?
    - Is the company/author authoritative?
    - Are there unique insights or proprietary data?
    - Is thought leadership demonstrated?
    
    TRUSTWORTHINESS:
    - How many citations are included?
    - Is information fact-checked?
    - Is there transparency about costs/challenges?
    - Is contact information provided?
    
    Output as JSON:
    {
      "experience": {
        "caseStudies": true/false,
        "realWorldExamples": true/false,
        "implementationStories": true/false,
        "clientTestimonials": true/false,
        "troubleshooting": true/false,
        "lessonsLearned": true/false
      },
      "expertise": {
        "technicalDepth": "basic/intermediate/expert-level",
        "industryJargon": "minimal/appropriate/extensive",
        "detailedProcesses": true/false,
        "advancedConcepts": true/false,
        "methodologyExplanation": true/false
      },
      "authoritativeness": {
        "authorCredentials": "description",
        "companyAuthority": "description",
        "industryRecognition": true/false,
        "thoughtLeadership": true/false,
        "proprietaryInsights": true/false,
        "uniqueData": true/false
      },
      "trustworthiness": {
        "citations": "minimal/adequate/extensive",
        "factChecking": true/false,
        "transparency": "low/medium/high",
        "contactInfo": true/false,
        "updateFrequency": "description",
        "errorCorrection": true/false
      }
    }
    `;

    const analysis = await this.gemini.generateContent(prompt, { temperature: 0.3 });
    
    const parsed = this.parseJSONFromGemini(analysis);
    if (parsed) {
      return parsed;
    } else {
      console.warn('⚠️ Could not parse E-E-A-T analysis, using defaults');
      return this.getDefaultEATSignals();
    }
  }

  private async generateEATImprovements(
    content: string,
    topic: string,
    category: string
  ): Promise<string[]> {
    const prompt = `
    Generate specific E-E-A-T improvements for content about "${topic}" in the ${category} category.
    
    Current content length: ${content.length} characters
    
    Focus on improvements that will:
    1. Demonstrate more experience (case studies, real examples)
    2. Show deeper expertise (technical details, advanced concepts)
    3. Build authority (credentials, unique insights)
    4. Increase trust (citations, transparency)
    
    Provide 8-12 specific, actionable improvements.
    
    Output as JSON array of strings.
    `;

    const improvements = await this.gemini.generateContent(prompt, { temperature: 0.7 });
    
    const parsed = this.parseJSONFromGemini(improvements);
    if (parsed && Array.isArray(parsed)) {
      return parsed;
    }
    return [
      'Add detailed case study with real implementation example',
      'Include specific cost breakdown with actual numbers',
      'Add troubleshooting section with common issues and solutions',
      'Include client testimonial or success story',
      'Add technical implementation details with code examples',
      'Include proprietary methodology or framework',
      'Add more authoritative citations and sources',
      'Include transparent discussion of challenges and limitations',
      'Add author credentials and company expertise',
      'Include unique industry insights and data'
    ];
  }

  private async generateEATRecommendations(
    topic: string,
    category: string
  ): Promise<string[]> {
    const prompt = `
    Generate E-E-A-T recommendations for creating authoritative content about "${topic}" in the ${category} category.
    
    Focus on:
    1. Experience signals (what experiences to highlight)
    2. Expertise demonstration (how to show deep knowledge)
    3. Authority building (how to establish credibility)
    4. Trust building (how to build user confidence)
    
    Provide 6-8 strategic recommendations.
    
    Output as JSON array of strings.
    `;

    const recommendations = await this.gemini.generateContent(prompt, { temperature: 0.7 });
    
    const parsed = this.parseJSONFromGemini(recommendations);
    if (parsed && Array.isArray(parsed)) {
      return parsed;
    }
    return [
        'Position Custodia as veteran-owned compliance experts with real-world experience',
        'Include detailed implementation timelines based on actual client projects',
        'Add proprietary compliance frameworks developed through experience',
        'Showcase specific cost savings achieved for clients',
        'Include industry-specific insights and regulatory expertise',
        'Demonstrate thought leadership through unique perspectives',
        'Provide transparent pricing and process information',
        'Include detailed author bios with relevant credentials'
      ];
  }

  private calculateEATScore(signals: EATSignals): number {
    let score = 0;

    // Experience scoring (25 points)
    if (signals.experience.caseStudies) score += 5;
    if (signals.experience.realWorldExamples) score += 5;
    if (signals.experience.implementationStories) score += 5;
    if (signals.experience.clientTestimonials) score += 5;
    if (signals.experience.troubleshooting) score += 3;
    if (signals.experience.lessonsLearned) score += 2;

    // Expertise scoring (25 points)
    if (signals.expertise.technicalDepth === 'expert-level') score += 10;
    else if (signals.expertise.technicalDepth === 'intermediate') score += 5;
    if (signals.expertise.industryJargon === 'appropriate') score += 5;
    else if (signals.expertise.industryJargon === 'extensive') score += 3;
    if (signals.expertise.detailedProcesses) score += 5;
    if (signals.expertise.advancedConcepts) score += 3;
    if (signals.expertise.methodologyExplanation) score += 2;

    // Authoritativeness scoring (25 points)
    if (signals.authoritativeness.authorCredentials.includes('expert')) score += 8;
    if (signals.authoritativeness.companyAuthority.includes('authority')) score += 5;
    if (signals.authoritativeness.industryRecognition) score += 4;
    if (signals.authoritativeness.thoughtLeadership) score += 4;
    if (signals.authoritativeness.proprietaryInsights) score += 2;
    if (signals.authoritativeness.uniqueData) score += 2;

    // Trustworthiness scoring (25 points)
    if (signals.trustworthiness.citations === 'extensive') score += 8;
    else if (signals.trustworthiness.citations === 'adequate') score += 5;
    if (signals.trustworthiness.factChecking) score += 5;
    if (signals.trustworthiness.transparency === 'high') score += 7;
    else if (signals.trustworthiness.transparency === 'medium') score += 4;
    if (signals.trustworthiness.contactInfo) score += 3;
    if (signals.trustworthiness.errorCorrection) score += 2;

    return Math.min(100, score);
  }

  private async generateContentEnhancements(
    content: string,
    topic: string
  ): Promise<string[]> {
    const prompt = `
    Generate specific content enhancements to improve E-E-A-T for "${topic}".
    
    Current content: ${content.substring(0, 1000)}...
    
    Suggest specific additions like:
    - Case study examples
    - Technical implementation details
    - Cost breakdowns
    - Timeline examples
    - Troubleshooting guides
    - Client success stories
    
    Provide 6-8 specific content additions.
    
    Output as JSON array of strings.
    `;

    const enhancements = await this.gemini.generateContent(prompt, { temperature: 0.7 });
    
    const parsed = this.parseJSONFromGemini(enhancements);
    if (parsed && Array.isArray(parsed)) {
      return parsed;
    }
    return [
        'Add "Real Client Case Study: How [Company] Achieved SOC 2 Compliance in 90 Days"',
        'Include "Cost Breakdown: Actual Implementation Costs by Company Size"',
        'Add "Common Implementation Challenges and How to Overcome Them"',
        'Include "Timeline Example: 6-Month SOC 2 Implementation Roadmap"',
        'Add "Technical Implementation Guide: Step-by-Step Control Implementation"',
        'Include "Client Success Story: [Company] Saved $50K with Our Approach"',
        'Add "Troubleshooting Guide: Solutions to Top 10 Implementation Issues"',
        'Include "Proprietary Framework: Custodia\'s 5-Phase Compliance Methodology"'
    ];
  }

  private getDefaultEATSignals(): EATSignals {
    return {
      experience: {
        caseStudies: false,
        realWorldExamples: false,
        implementationStories: false,
        clientTestimonials: false,
        troubleshooting: false,
        lessonsLearned: false
      },
      expertise: {
        technicalDepth: 'intermediate',
        industryJargon: 'appropriate',
        detailedProcesses: false,
        advancedConcepts: false,
        methodologyExplanation: false
      },
      authoritativeness: {
        authorCredentials: 'Basic author information',
        companyAuthority: 'Standard company description',
        industryRecognition: false,
        thoughtLeadership: false,
        proprietaryInsights: false,
        uniqueData: false
      },
      trustworthiness: {
        citations: 'minimal',
        factChecking: false,
        transparency: 'low',
        contactInfo: false,
        updateFrequency: 'Unknown',
        errorCorrection: false
      }
    };
  }

  async generateEATOptimizedContent(
    topic: string,
    category: string,
    keywordOpportunity: any
  ): Promise<string> {
    console.log(`🎯 Generating E-E-A-T optimized content for: ${topic}`);

    const prompt = `
    Create E-E-A-T optimized content for "${topic}" targeting the keyword "${keywordOpportunity.primaryKeyword}".
    
    E-E-A-T REQUIREMENTS:
    
    EXPERIENCE (Demonstrate real-world experience):
    - Include 2-3 detailed case studies with specific examples
    - Add real implementation stories with actual timelines and costs
    - Include client testimonials or success stories
    - Add troubleshooting section with common issues and solutions
    - Include lessons learned from actual implementations
    
    EXPERTISE (Show deep technical knowledge):
    - Use appropriate industry jargon and technical terms
    - Provide detailed step-by-step implementation processes
    - Include advanced concepts and methodologies
    - Explain complex topics in accessible ways
    - Show understanding of regulatory nuances
    
    AUTHORITATIVENESS (Establish credibility):
    - Position Custodia as veteran-owned compliance experts
    - Include proprietary frameworks and methodologies
    - Reference unique industry insights and data
    - Demonstrate thought leadership through unique perspectives
    - Show company authority in the compliance space
    
    TRUSTWORTHINESS (Build user confidence):
    - Include extensive citations to authoritative sources
    - Provide transparent cost breakdowns and timelines
    - Acknowledge challenges and limitations honestly
    - Include clear contact information and next steps
    - Reference fact-checked information and current regulations
    
    CONTENT STRUCTURE:
    1. Introduction with compelling hook and authority statement
    2. "What is [Topic]?" with expert definition
    3. "Why [Topic] Matters in 2025" with industry insights
    4. Detailed implementation guide with real examples
    5. Cost breakdown with actual numbers and transparency
    6. Timeline with realistic expectations
    7. Case study: Real client implementation story
    8. Common challenges and solutions (troubleshooting)
    9. Tools comparison with proprietary insights
    10. FAQ section with expert answers
    11. Conclusion with clear next steps and contact info
    
    TONE: Expert, authoritative, helpful, and trustworthy
    LENGTH: 8,000-12,000 words
    STYLE: Professional with personal insights and real examples
    
    Focus on demonstrating deep expertise while building trust through transparency and real-world experience.
    `;

    const content = await this.gemini.generateContent(prompt, { temperature: 0.7 });
    
    console.log(`✅ E-E-A-T optimized content generated: ${content.length} characters`);
    return content;
  }
}

export default EATOptimizer;
