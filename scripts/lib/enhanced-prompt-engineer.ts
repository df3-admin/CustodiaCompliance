import GeminiClient from './gemini-client.js';
import { KeywordOpportunity } from './enhanced-keyword-research.js';
import { EATOptimization } from './eat-optimizer.js';
import { SnippetOptimization } from './featured-snippet-optimizer.js';
import { QualityAnalysis } from './content-quality-analyzer.js';
import { CompetitiveGapAnalysis } from './competitor-analyzer.js';

export interface EnhancedPromptConfig {
  keywordOpportunity: KeywordOpportunity;
  eatOptimization: EATOptimization;
  snippetOptimization: SnippetOptimization;
  qualityAnalysis: QualityAnalysis;
  gapAnalysis: CompetitiveGapAnalysis;
  topic: string;
  category: string;
}

export interface PromptOptimization {
  basePrompt: string;
  enhancedPrompt: string;
  optimizationScore: number;
  improvements: string[];
}

export class EnhancedPromptEngineer {
  private gemini: GeminiClient;

  constructor() {
    this.gemini = new GeminiClient();
  }

  async generateOptimizedPrompt(config: EnhancedPromptConfig): Promise<string> {
    console.log(`🎯 Generating optimized prompt for: ${config.topic}`);

    try {
      // Build the enhanced prompt
      const enhancedPrompt = this.buildEnhancedPrompt(config);
      
      // Optimize the prompt
      const optimization = await this.optimizePrompt(enhancedPrompt, config);
      
      console.log(`✅ Optimized prompt generated:`);
      console.log(`   - Optimization Score: ${optimization.optimizationScore}/100`);
      console.log(`   - Improvements: ${optimization.improvements.length}`);

      return optimization.enhancedPrompt;
    } catch (error) {
      console.error('❌ Error generating optimized prompt:', error);
      throw error;
    }
  }

  private buildEnhancedPrompt(config: EnhancedPromptConfig): string {
    const {
      keywordOpportunity,
      eatOptimization,
      snippetOptimization,
      qualityAnalysis,
      gapAnalysis,
      topic,
      category
    } = config;

    return `
Create a comprehensive, #1-ranking article about "${topic}" that will dominate search results and outperform all competitors.

COMPETITIVE ANALYSIS & OPPORTUNITY IDENTIFICATION:
- Primary Keyword: "${keywordOpportunity.primaryKeyword}" (${keywordOpportunity.searchVolume} searches/month)
- Opportunity Score: ${keywordOpportunity.opportunityScore}/100
- Competition Score: ${keywordOpportunity.competitionScore}/100
- Difficulty Score: ${keywordOpportunity.difficultyScore}/100
- Commercial Value: ${keywordOpportunity.commercialValue}/100
- Search Intent: ${keywordOpportunity.searchIntent}
- Featured Snippet Opportunity: ${keywordOpportunity.featuredSnippetOpportunity ? 'YES' : 'NO'}

COMPETITOR GAPS TO EXPLOIT:
Missing Topics: ${gapAnalysis.overallGaps.missingTopics.join(', ')}
Depth Opportunities: ${gapAnalysis.overallGaps.depthOpportunities.join(', ')}
Format Opportunities: ${gapAnalysis.overallGaps.formatOpportunities.join(', ')}
Keyword Opportunities: ${gapAnalysis.overallGaps.keywordOpportunities.join(', ')}
User Intent Gaps: ${gapAnalysis.overallGaps.userIntentGaps.join(', ')}

COMPETITIVE ADVANTAGES TO LEVERAGE:
${gapAnalysis.competitiveAdvantages.join(', ')}

DIFFERENTIATION POINTS:
${gapAnalysis.differentiationPoints.join(', ')}

E-E-A-T OPTIMIZATION REQUIREMENTS (Score: ${eatOptimization.score}/100):

EXPERIENCE (Demonstrate real-world experience):
- Include 2-3 detailed case studies with specific examples
- Add real implementation stories with actual timelines and costs
- Include client testimonials or success stories
- Add troubleshooting section with common issues and solutions
- Include lessons learned from actual implementations
- Showcase Custodia's veteran-owned expertise

EXPERTISE (Show deep technical knowledge):
- Use appropriate industry jargon and technical terms
- Provide detailed step-by-step implementation processes
- Include advanced concepts and methodologies
- Explain complex topics in accessible ways
- Show understanding of regulatory nuances
- Demonstrate proprietary compliance frameworks

AUTHORITATIVENESS (Establish credibility):
- Position Custodia as veteran-owned compliance experts
- Include proprietary frameworks and methodologies
- Reference unique industry insights and data
- Demonstrate thought leadership through unique perspectives
- Show company authority in the compliance space
- Include authoritative citations and sources

TRUSTWORTHINESS (Build user confidence):
- Include extensive citations to authoritative sources
- Provide transparent cost breakdowns and timelines
- Acknowledge challenges and limitations honestly
- Include clear contact information and next steps
- Reference fact-checked information and current regulations
- Show transparency in pricing and process

FEATURED SNIPPET OPTIMIZATION (Score: ${snippetOptimization.optimizationScore}/100):

STRUCTURE ELEMENTS TO INCLUDE:
${snippetOptimization.structure.questionAnswerPairs ? '- FAQ section with direct question-answer pairs' : ''}
${snippetOptimization.structure.stepByStepGuides ? '- Step-by-step implementation guide with numbered steps' : ''}
${snippetOptimization.structure.definitionBoxes ? '- Clear definition box answering "What is [topic]?"' : ''}
${snippetOptimization.structure.comparisonTables ? '- Comparison table with pros/cons' : ''}
${snippetOptimization.structure.listFormat ? '- Numbered lists and bullet points' : ''}
${snippetOptimization.structure.calculatorTools ? '- Cost calculator or tool section' : ''}

SNIPPET OPPORTUNITIES:
${snippetOptimization.opportunities.map(opp => 
  `- ${opp.type.toUpperCase()}: ${opp.keyword} (Score: ${opp.opportunityScore}/100)`
).join('\n')}

CONTENT QUALITY REQUIREMENTS (Score: ${qualityAnalysis.overallScore}/100):

COMPREHENSIVENESS:
- Word count: 10,000-15,000 words (exceeding competitors)
- Topic coverage: 95%+ (addressing all gaps)
- Technical depth: Expert-level
- Practical examples: 5+ real-world examples
- Case studies: 2+ detailed implementations

USER EXPERIENCE:
- Readability score: 80+ (Flesch-Kincaid)
- Clear structure with logical flow
- Visual elements: tables, charts, diagrams
- Internal linking: 10+ strategic links
- External linking: 15+ authoritative sources

ENGAGEMENT SIGNALS:
- Expected dwell time: 8+ minutes
- Scroll depth: 85%+
- Bounce rate reduction: 30%+
- Social sharing optimization
- Comment-worthy insights

AUTHORITY SIGNALS:
- Citations: 20+ authoritative sources
- Expert quotes: 5+ industry experts
- Case studies: 3+ detailed implementations
- Proprietary data: Yes
- Unique insights: 8+ proprietary insights

CONTENT STRUCTURE FOR DOMINATION:

1. INTRODUCTION (500 words)
   - Compelling hook with industry statistic
   - Clear value proposition and competitive advantages
   - What readers will learn (addressing competitor gaps)
   - Why this matters now (current relevance)

2. "WHAT IS [TOPIC]?" (600 words)
   - Expert definition optimized for featured snippets
   - Key characteristics and components
   - Industry context and importance
   - Current market landscape

3. "WHY [TOPIC] MATTERS IN 2025" (700 words)
   - Current industry trends and drivers
   - Regulatory changes and requirements
   - Business impact and ROI
   - Competitive advantages

4. DETAILED IMPLEMENTATION GUIDE (2,000 words)
   - Step-by-step process (addressing depth gaps)
   - Technical requirements and considerations
   - Resource requirements and planning
   - Common challenges and solutions

5. COST BREAKDOWN (800 words)
   - Transparent pricing by company size
   - Hidden costs and considerations
   - ROI analysis and business case
   - Cost comparison with alternatives

6. TIMELINE AND PROCESS (700 words)
   - Realistic implementation timeline
   - Phase-by-phase breakdown
   - Resource allocation and milestones
   - Risk mitigation strategies

7. CASE STUDY: REAL CLIENT IMPLEMENTATION (1,000 words)
   - Detailed client success story
   - Specific challenges and solutions
   - Results and outcomes
   - Lessons learned

8. COMMON CHALLENGES AND SOLUTIONS (800 words)
   - Top 10 implementation challenges
   - Detailed solutions and workarounds
   - Prevention strategies
   - Expert troubleshooting tips

9. TOOLS AND RESOURCES COMPARISON (1,000 words)
   - Comprehensive tool comparison
   - Pros and cons analysis
   - Pricing and feature comparison
   - Custodia positioning and advantages

10. FAQ SECTION (1,200 words)
    - 20+ comprehensive questions
    - Direct, expert answers
    - Addressing competitor gaps
    - Optimized for featured snippets

11. CONCLUSION (400 words)
    - Key takeaways and next steps
    - Clear call-to-action
    - Contact information and consultation offer
    - Competitive differentiation summary

TECHNICAL SEO OPTIMIZATION:

KEYWORD OPTIMIZATION:
- Primary keyword density: 1.5-2%
- Secondary keywords: ${keywordOpportunity.longTailVariations.join(', ')}
- LSI keywords: Naturally integrated throughout
- Long-tail variations: ${keywordOpportunity.longTailVariations.join(', ')}

ON-PAGE SEO:
- Title tag: Optimized with primary keyword
- Meta description: Compelling with call-to-action
- Heading structure: H1, H2, H3 hierarchy
- Internal linking: Strategic and contextual
- External linking: Authoritative sources only

SCHEMA MARKUP:
- Article schema
- FAQ schema
- HowTo schema
- Organization schema
- Review/Rating schema

HUMANIZATION TECHNIQUES:

WRITING STYLE:
- Vary sentence length (8-35 words)
- Use contractions and conversational tone
- Include rhetorical questions
- Add transitional phrases
- Use specific examples with details
- Include personal insights and industry experience

AUTHORITY DEMONSTRATION:
- Reference Custodia's veteran-owned status
- Include proprietary methodologies
- Showcase client success stories
- Demonstrate industry expertise
- Provide unique insights and data

ENGAGEMENT OPTIMIZATION:
- Compelling headlines and subheadings
- Interactive elements and checklists
- Visual breaks and formatting
- Social sharing prompts
- Comment-worthy insights

CITATIONS AND AUTHORITY:

REQUIRED CITATIONS:
- Official framework documentation
- Industry reports and statistics
- Government regulations and guidelines
- Academic research and studies
- Expert opinions and quotes

CITATION FORMAT:
- Inline citations: [Source](URL)
- Reference list at end
- Fact-checked information only
- Current and authoritative sources
- 20+ total citations

UNIQUE VALUE PROPOSITIONS:

CUSTODIA DIFFERENTIATORS:
- Veteran-owned compliance expertise
- Fixed pricing transparency
- Comprehensive implementation support
- Industry-specific insights
- Proprietary methodologies
- Client success track record

COMPETITIVE ADVANTAGES:
- More comprehensive than competitors
- More practical and actionable
- More authoritative and trustworthy
- More user-friendly and engaging
- More transparent and honest
- More expert and experienced

OUTPUT REQUIREMENTS:

TONE: Expert, authoritative, helpful, transparent, engaging
LENGTH: 12,000-15,000 words (exceeding all competitors)
STYLE: Comprehensive, practical, differentiated, user-focused

QUALITY STANDARDS:
- Exceed competitor content quality
- Address all identified gaps
- Leverage competitive advantages
- Provide superior value
- Optimize for search and users
- Build authority and trust

Focus on creating content that will clearly outperform competitors, capture market share, and establish Custodia as the definitive authority on this topic.
    `;
  }

  private async optimizePrompt(
    basePrompt: string,
    config: EnhancedPromptConfig
  ): Promise<PromptOptimization> {
    const prompt = `
    Optimize this content generation prompt for maximum effectiveness:
    
    Base Prompt: ${basePrompt.substring(0, 2000)}...
    
    Current Configuration:
    - Opportunity Score: ${config.keywordOpportunity.opportunityScore}/100
    - E-E-A-T Score: ${config.eatOptimization.score}/100
    - Snippet Score: ${config.snippetOptimization.optimizationScore}/100
    - Quality Score: ${config.qualityAnalysis.overallScore}/100
    
    Optimize for:
    1. Clarity and specificity
    2. Actionable instructions
    3. Quality standards
    4. Competitive advantage
    5. User value
    
    Provide:
    - Optimized prompt
    - Optimization score (0-100)
    - Specific improvements made
    
    Output as JSON:
    {
      "enhancedPrompt": "optimized prompt text",
      "optimizationScore": 85,
      "improvements": ["improvement1", "improvement2"]
    }
    `;

    const optimization = await this.gemini.generateContent(prompt, { temperature: 0.3 });
    
    try {
      const parsed = JSON.parse(optimization);
      return {
        basePrompt,
        enhancedPrompt: parsed.enhancedPrompt || basePrompt,
        optimizationScore: parsed.optimizationScore || 75,
        improvements: parsed.improvements || []
      };
    } catch (error) {
      console.warn('⚠️ Could not parse prompt optimization, using base prompt');
      return {
        basePrompt,
        enhancedPrompt: basePrompt,
        optimizationScore: 75,
        improvements: ['Used base prompt due to parsing error']
      };
    }
  }

  async generateSpecializedPrompts(
    topic: string,
    keyword: string,
    config: EnhancedPromptConfig
  ): Promise<{
    mainContent: string;
    caseStudy: string;
    faq: string;
    comparison: string;
  }> {
    console.log(`🎯 Generating specialized prompts for: ${topic}`);

    const mainContentPrompt = this.buildEnhancedPrompt(config);

    const caseStudyPrompt = `
    Create a detailed case study for "${topic}" that demonstrates Custodia's expertise and success.
    
    Requirements:
    - Real client implementation story
    - Specific challenges and solutions
    - Detailed timeline and process
    - Quantifiable results and outcomes
    - Lessons learned and insights
    - Client testimonial or quote
    
    Focus on showcasing Custodia's veteran-owned expertise and unique approach.
    `;

    const faqPrompt = `
    Create a comprehensive FAQ section for "${topic}" targeting "${keyword}".
    
    Requirements:
    - 20+ questions addressing common concerns
    - Direct, expert answers
    - Optimized for featured snippets
    - Address competitor gaps
    - Include Custodia-specific insights
    
    Focus on providing authoritative answers that outperform competitors.
    `;

    const comparisonPrompt = `
    Create a detailed comparison section for "${topic}" that positions Custodia advantageously.
    
    Requirements:
    - Compare with main alternatives
    - Highlight Custodia's advantages
    - Include cost and timeline comparisons
    - Address common decision factors
    - Provide clear recommendations
    
    Focus on demonstrating why Custodia is the superior choice.
    `;

    return {
      mainContent: mainContentPrompt,
      caseStudy: caseStudyPrompt,
      faq: faqPrompt,
      comparison: comparisonPrompt
    };
  }

  async generateContentVariations(
    topic: string,
    keyword: string,
    config: EnhancedPromptConfig
  ): Promise<{
    comprehensive: string;
    practical: string;
    authoritative: string;
    engaging: string;
  }> {
    console.log(`🎯 Generating content variations for: ${topic}`);

    const comprehensivePrompt = `
    Create comprehensive, encyclopedic content for "${topic}" targeting "${keyword}".
    
    Focus on:
    - Complete topic coverage
    - Detailed technical information
    - Extensive examples and case studies
    - Comprehensive resource lists
    
    Length: 15,000+ words
    Style: Academic, thorough, authoritative
    `;

    const practicalPrompt = `
    Create practical, actionable content for "${topic}" targeting "${keyword}".
    
    Focus on:
    - Step-by-step implementation guides
    - Practical tools and checklists
    - Real-world examples and scenarios
    - Actionable advice and tips
    
    Length: 10,000+ words
    Style: Practical, hands-on, actionable
    `;

    const authoritativePrompt = `
    Create authoritative, expert content for "${topic}" targeting "${keyword}".
    
    Focus on:
    - Industry expertise and insights
    - Proprietary methodologies
    - Thought leadership perspectives
    - Expert analysis and recommendations
    
    Length: 12,000+ words
    Style: Expert, authoritative, insightful
    `;

    const engagingPrompt = `
    Create engaging, user-friendly content for "${topic}" targeting "${keyword}".
    
    Focus on:
    - Compelling storytelling
    - Interactive elements
    - Visual appeal and formatting
    - User engagement and retention
    
    Length: 10,000+ words
    Style: Engaging, conversational, user-focused
    `;

    return {
      comprehensive: comprehensivePrompt,
      practical: practicalPrompt,
      authoritative: authoritativePrompt,
      engaging: engagingPrompt
    };
  }
}

export default EnhancedPromptEngineer;
