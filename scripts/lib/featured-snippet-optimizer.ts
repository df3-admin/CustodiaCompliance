import GeminiClient from './gemini-client.js';

export interface FeaturedSnippetOpportunity {
  type: 'definition' | 'how-to' | 'list' | 'comparison' | 'calculation' | 'faq';
  keyword: string;
  opportunityScore: number; // 0-100
  currentSnippet?: string;
  optimizationStrategy: string[];
  contentStructure: string[];
}

export interface FeaturedSnippetStructure {
  questionAnswerPairs: boolean;
  stepByStepGuides: boolean;
  definitionBoxes: boolean;
  comparisonTables: boolean;
  listFormat: boolean;
  codeExamples: boolean;
  calculatorTools: boolean;
  faqSections: boolean;
}

export interface SnippetOptimization {
  opportunities: FeaturedSnippetOpportunity[];
  structure: FeaturedSnippetStructure;
  contentEnhancements: string[];
  optimizationScore: number;
}

export class FeaturedSnippetOptimizer {
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

  async optimizeForFeaturedSnippets(
    content: string,
    keyword: string,
    topic: string
  ): Promise<SnippetOptimization> {
    console.log(`🎯 Optimizing for featured snippets: ${keyword}`);

    try {
      // Identify snippet opportunities
      const opportunities = await this.identifySnippetOpportunities(keyword, topic);
      
      // Determine optimal structure
      const structure = await this.determineOptimalStructure(keyword, topic);
      
      // Generate content enhancements
      const contentEnhancements = await this.generateContentEnhancements(content, keyword);
      
      // Calculate optimization score
      const optimizationScore = this.calculateOptimizationScore(opportunities, structure);

      const optimization: SnippetOptimization = {
        opportunities,
        structure,
        contentEnhancements,
        optimizationScore
      };

      console.log(`✅ Featured snippet optimization complete:`);
      console.log(`   - Optimization Score: ${optimizationScore}/100`);
      console.log(`   - Snippet Opportunities: ${opportunities.length}`);
      console.log(`   - Content Enhancements: ${contentEnhancements.length}`);

      return optimization;
    } catch (error) {
      console.error('❌ Error optimizing for featured snippets:', error);
      throw error;
    }
  }

  private async identifySnippetOpportunities(
    keyword: string,
    topic: string
  ): Promise<FeaturedSnippetOpportunity[]> {
    const prompt = `
    Identify featured snippet opportunities for the keyword "${keyword}" about "${topic}".
    
    Analyze potential snippet types:
    1. DEFINITION: "What is [topic]?"
    2. HOW-TO: "How to implement [topic]"
    3. LIST: "Top 10 [topic] requirements"
    4. COMPARISON: "[Topic] vs [alternative]"
    5. CALCULATION: "[Topic] cost calculator"
    6. FAQ: "Frequently asked questions about [topic]"
    
    For each opportunity, provide:
    - Snippet type
    - Opportunity score (0-100)
    - Optimization strategy
    - Content structure needed
    
    Output as JSON:
    {
      "opportunities": [
        {
          "type": "definition",
          "keyword": "what is SOC 2",
          "opportunityScore": 85,
          "optimizationStrategy": ["clear definition", "concise explanation"],
          "contentStructure": ["definition box", "key points"]
        }
      ]
    }
    `;

    const analysis = await this.gemini.generateContent(prompt, { temperature: 0.3 });
    
    try {
      const parsed = this.parseJSONFromGemini(analysis);
      return parsed.opportunities || [];
    } catch (error) {
      console.warn('⚠️ Could not parse snippet opportunities, using defaults');
      return this.getDefaultSnippetOpportunities(keyword);
    }
  }

  private async determineOptimalStructure(
    keyword: string,
    topic: string
  ): Promise<FeaturedSnippetStructure> {
    const prompt = `
    Determine the optimal content structure for featured snippets about "${topic}" targeting "${keyword}".
    
    Consider which formats work best for this topic:
    - Question-answer pairs (FAQ format)
    - Step-by-step guides (How-to format)
    - Definition boxes (What is format)
    - Comparison tables (vs format)
    - List formats (Top X format)
    - Code examples (Technical format)
    - Calculator tools (Tool format)
    
    Output as JSON:
    {
      "questionAnswerPairs": true/false,
      "stepByStepGuides": true/false,
      "definitionBoxes": true/false,
      "comparisonTables": true/false,
      "listFormat": true/false,
      "codeExamples": true/false,
      "calculatorTools": true/false,
      "faqSections": true/false
    }
    `;

    const structure = await this.gemini.generateContent(prompt, { temperature: 0.3 });
    
    try {
      return this.parseJSONFromGemini(structure);
    } catch (error) {
      console.warn('⚠️ Could not parse structure, using defaults');
      return {
        questionAnswerPairs: true,
        stepByStepGuides: true,
        definitionBoxes: true,
        comparisonTables: true,
        listFormat: true,
        codeExamples: false,
        calculatorTools: true,
        faqSections: true
      };
    }
  }

  private async generateContentEnhancements(
    content: string,
    keyword: string
  ): Promise<string[]> {
    const prompt = `
    Generate specific content enhancements to optimize for featured snippets for the keyword "${keyword}".
    
    Current content length: ${content.length} characters
    
    Focus on enhancements that will:
    1. Answer specific questions directly
    2. Create clear, concise definitions
    3. Provide step-by-step instructions
    4. Include comparison tables
    5. Add FAQ sections
    6. Create list formats
    
    Provide 8-10 specific enhancements.
    
    Output as JSON array of strings.
    `;

    const enhancements = await this.gemini.generateContent(prompt, { temperature: 0.7 });
    
    try {
      return this.parseJSONFromGemini(enhancements);
    } catch (error) {
      return [
        'Add "What is [Topic]?" definition box with concise explanation',
        'Include "How to Implement [Topic]" step-by-step guide',
        'Add comparison table: "[Topic] vs [Alternative]"',
        'Create "Top 10 [Topic] Requirements" numbered list',
        'Include FAQ section with direct question-answer pairs',
        'Add "[Topic] Cost Calculator" with specific ranges',
        'Include "Common [Topic] Mistakes" bulleted list',
        'Add "[Topic] Timeline" with specific phases',
        'Create "[Topic] Checklist" with actionable items',
        'Include "[Topic] Tools Comparison" table'
      ];
    }
  }

  private calculateOptimizationScore(
    opportunities: FeaturedSnippetOpportunity[],
    structure: FeaturedSnippetStructure
  ): number {
    let score = 0;

    // Score based on opportunities
    opportunities.forEach(opportunity => {
      score += opportunity.opportunityScore * 0.1; // Weighted by opportunity score
    });

    // Score based on structure elements
    const structureElements = Object.values(structure).filter(Boolean).length;
    score += structureElements * 5; // 5 points per structure element

    return Math.min(100, Math.round(score));
  }

  private getDefaultSnippetOpportunities(keyword: string): FeaturedSnippetOpportunity[] {
    return [
      {
        type: 'definition',
        keyword: `what is ${keyword}`,
        opportunityScore: 80,
        optimizationStrategy: ['clear definition', 'concise explanation'],
        contentStructure: ['definition box', 'key points']
      },
      {
        type: 'how-to',
        keyword: `how to implement ${keyword}`,
        opportunityScore: 75,
        optimizationStrategy: ['step-by-step guide', 'numbered list'],
        contentStructure: ['implementation steps', 'timeline']
      },
      {
        type: 'list',
        keyword: `${keyword} requirements`,
        opportunityScore: 70,
        optimizationStrategy: ['numbered list', 'bullet points'],
        contentStructure: ['requirements list', 'checklist format']
      },
      {
        type: 'comparison',
        keyword: `${keyword} vs`,
        opportunityScore: 65,
        optimizationStrategy: ['comparison table', 'pros and cons'],
        contentStructure: ['comparison matrix', 'decision factors']
      },
      {
        type: 'faq',
        keyword: `${keyword} FAQ`,
        opportunityScore: 60,
        optimizationStrategy: ['question-answer pairs', 'direct answers'],
        contentStructure: ['FAQ section', 'common questions']
      }
    ];
  }

  async generateSnippetOptimizedContent(
    topic: string,
    keyword: string,
    structure: FeaturedSnippetStructure
  ): Promise<string> {
    console.log(`🎯 Generating snippet-optimized content for: ${topic}`);

    const prompt = `
    Create featured snippet optimized content for "${topic}" targeting "${keyword}".
    
    FEATURED SNIPPET OPTIMIZATION REQUIREMENTS:
    
    STRUCTURE ELEMENTS TO INCLUDE:
    ${structure.questionAnswerPairs ? '- FAQ section with direct question-answer pairs' : ''}
    ${structure.stepByStepGuides ? '- Step-by-step implementation guide with numbered steps' : ''}
    ${structure.definitionBoxes ? '- Clear definition box answering "What is [topic]?"' : ''}
    ${structure.comparisonTables ? '- Comparison table with pros/cons' : ''}
    ${structure.listFormat ? '- Numbered lists and bullet points' : ''}
    ${structure.codeExamples ? '- Code examples and technical snippets' : ''}
    ${structure.calculatorTools ? '- Cost calculator or tool section' : ''}
    
    CONTENT STRUCTURE FOR SNIPPETS:
    1. Introduction with clear value proposition
    2. "What is [Topic]?" - Definition optimized for featured snippets
    3. "Why [Topic] Matters" - Current relevance
    4. Step-by-step implementation guide (if applicable)
    5. Requirements checklist (if applicable)
    6. Cost breakdown with specific numbers
    7. Timeline with phases
    8. Comparison section (if applicable)
    9. FAQ section with direct answers
    10. Tools/resources section
    11. Conclusion with next steps
    
    SNIPPET OPTIMIZATION TECHNIQUES:
    - Use clear, concise language
    - Answer questions directly
    - Include specific numbers and data
    - Use structured formats (lists, tables)
    - Provide actionable steps
    - Include comparison elements
    - Add FAQ sections
    
    TONE: Clear, authoritative, helpful
    LENGTH: 8,000-12,000 words
    STYLE: Structured with clear headings and formats
    
    Focus on creating content that Google can easily extract for featured snippets.
    `;

    const content = await this.gemini.generateContent(prompt, { temperature: 0.7 });
    
    console.log(`✅ Snippet-optimized content generated: ${content.length} characters`);
    return content;
  }

  async generateSnippetSpecificContent(
    snippetType: string,
    keyword: string,
    topic: string
  ): Promise<string> {
    console.log(`🎯 Generating ${snippetType} snippet content for: ${keyword}`);

    const prompts = {
      definition: `
        Create a definition snippet for "${keyword}" about "${topic}".
        
        Requirements:
        - Clear, concise definition (2-3 sentences)
        - Key characteristics or components
        - Brief explanation of importance
        
        Format for featured snippet extraction.
        `,
      
      'how-to': `
        Create a how-to snippet for "${keyword}" about "${topic}".
        
        Requirements:
        - Step-by-step instructions (5-7 steps)
        - Clear, actionable steps
        - Specific details for each step
        
        Format as numbered list for featured snippet extraction.
        `,
      
      list: `
        Create a list snippet for "${keyword}" about "${topic}".
        
        Requirements:
        - Top 10 items (or appropriate number)
        - Clear, concise descriptions
        - Specific details for each item
        
        Format as numbered list for featured snippet extraction.
        `,
      
      comparison: `
        Create a comparison snippet for "${keyword}" about "${topic}".
        
        Requirements:
        - Clear comparison table
        - Key differences highlighted
        - Pros and cons for each option
        
        Format as table for featured snippet extraction.
        `,
      
      faq: `
        Create FAQ snippet content for "${keyword}" about "${topic}".
        
        Requirements:
        - 5-7 common questions
        - Direct, concise answers
        - Specific information
        
        Format as question-answer pairs for featured snippet extraction.
        `
    };

    const prompt = prompts[snippetType as keyof typeof prompts] || prompts.definition;
    const content = await this.gemini.generateContent(prompt, { temperature: 0.3 });
    
    console.log(`✅ ${snippetType} snippet content generated: ${content.length} characters`);
    return content;
  }
}

export default FeaturedSnippetOptimizer;
