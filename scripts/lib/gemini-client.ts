import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  
  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(key);
  }
  
  async generateContent(prompt: string, options?: {
    temperature?: number;
    maxTokens?: number;
  }) {
    try {
      const model = this.genAI.getGenerativeModel({ 
        model: 'models/gemini-2.5-flash',
        generationConfig: {
          temperature: options?.temperature || 0.7,
          maxOutputTokens: options?.maxTokens || 8192
        }
      });
      
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }

  async generateContentStream(prompt: string, options?: {
    temperature?: number;
    maxTokens?: number;
  }) {
    try {
      const model = this.genAI.getGenerativeModel({ 
        model: 'models/gemini-2.5-flash',
        generationConfig: {
          temperature: options?.temperature || 0.7,
          maxOutputTokens: options?.maxTokens || 8192
        }
      });
      
      const result = await model.generateContentStream(prompt);
      return result.stream;
    } catch (error) {
      console.error('Gemini API Stream Error:', error);
      throw error;
    }
  }

  async analyzeCompetitors(keyword: string, competitorUrls: string[]) {
    const prompt = `
Analyze these top-ranking articles for "${keyword}":
${competitorUrls.map(url => `- ${url}`).join('\n')}

Provide comprehensive analysis in JSON format:
{
  "keyword": "${keyword}",
  "analysis": {
    "commonTopics": ["topic1", "topic2", "topic3"],
    "uniqueTopics": {
      "topPerformer1": ["unique topic 1", "unique topic 2"],
      "topPerformer2": ["unique topic 3", "unique topic 4"]
    },
    "contentGaps": ["gap1", "gap2", "gap3"],
    "averageWordCount": 8500,
    "contentDepth": "high|medium|low",
    "externalSources": [
      {
        "source": "Gartner",
        "url": "https://gartner.com/...",
        "frequency": 5
      }
    ],
    "rankingFactors": [
      "comprehensive checklists",
      "real-world examples",
      "expert insights"
    ],
    "improvementOpportunities": [
      "Add more specific implementation details",
      "Include cost breakdowns",
      "Provide tool comparisons"
    ]
  },
  "competitors": [
    {
      "url": "https://...",
      "title": "Article Title",
      "wordCount": 8000,
      "strengths": ["strength1", "strength2"],
      "weaknesses": ["weakness1", "weakness2"],
      "uniqueAngles": ["angle1", "angle2"]
    }
  ]
}

Focus on compliance/GRC topics and provide actionable insights for creating superior content.
`;

    return await this.generateContent(prompt, { temperature: 0.3 });
  }

  async researchTopic(topic: string) {
    const prompt = `
Research "${topic}" comprehensively for a compliance/GRC article. Provide:

1. Latest statistics (2024-2025) with authoritative sources
2. Industry trends and data points
3. Expert opinions and quotes
4. Case studies and real-world examples
5. Best practices from practitioners
6. Common challenges and solutions
7. Cost breakdowns and timelines
8. Tool recommendations with pros/cons

For EVERY statistic, provide:
- Exact number/percentage
- Source name (Gartner, Forrester, AICPA, NIST, etc.)
- Source URL (if publicly available)
- Publication date
- Context of the statistic

Format as structured JSON:
{
  "topic": "${topic}",
  "statistics": [
    {
      "fact": "85% of enterprises require SOC 2",
      "value": "85%",
      "source": "Gartner 2024 Security Report",
      "url": "https://gartner.com/...",
      "date": "2024-03-15",
      "context": "Enterprise security requirements"
    }
  ],
  "trends": [
    {
      "trend": "Increasing SOC 2 adoption",
      "description": "More companies requiring SOC 2",
      "source": "Forrester Research",
      "url": "https://forrester.com/...",
      "date": "2024-06-20"
    }
  ],
  "expertQuotes": [
    {
      "quote": "SOC 2 compliance is no longer optional",
      "author": "John Smith, CISO",
      "company": "Fortune 500 Company",
      "source": "CSO Online",
      "url": "https://csoonline.com/...",
      "date": "2024-08-10"
    }
  ],
  "caseStudies": [
    {
      "title": "Startup achieves SOC 2 in 6 months",
      "description": "How TechCorp streamlined compliance",
      "source": "Security Magazine",
      "url": "https://securitymagazine.com/...",
      "date": "2024-09-05"
    }
  ],
  "costBreakdowns": [
    {
      "companySize": "Small (1-50 employees)",
      "cost": "$8,000 - $15,000",
      "timeline": "3-6 months",
      "source": "Compliance Industry Report",
      "url": "https://...",
      "date": "2024-07-15"
    }
  ],
  "tools": [
    {
      "name": "Drata",
      "category": "Compliance Automation",
      "pricing": "$10,000+/year",
      "pros": ["Automated evidence collection"],
      "cons": ["High cost"],
      "bestFor": "Mid-market companies",
      "source": "Tool Comparison Study",
      "url": "https://...",
      "date": "2024-08-20"
    }
  ]
}

Prioritize authoritative sources: Government agencies, industry research firms (Gartner, Forrester), official frameworks (AICPA, NIST, ISO), and established industry publications.
`;

    return await this.generateContent(prompt, { temperature: 0.2 });
  }

  async generateArticle(topic: string, research: any, competitorAnalysis: any) {
    const prompt = `
Write a comprehensive, expert-level article on "${topic}" that will rank #1 on Google.

REQUIREMENTS:
- 8,000-10,000 words
- Natural, conversational tone (like an expert consultant writing)
- Use contractions, varied sentence structure, personal insights
- Include specific examples and real-world scenarios
- Add practical implementation details
- Use industry jargon appropriately

RESEARCH DATA TO USE:
${JSON.stringify(research, null, 2)}

COMPETITOR ANALYSIS:
${JSON.stringify(competitorAnalysis, null, 2)}

STRUCTURE (follow exactly):
1. Introduction (300 words)
   - Hook with compelling statistic from research
   - What readers will learn
   - Why this matters now

2. What is ${topic}? (500 words)
   - Clear definition
   - Who needs it and why
   - Business benefits
   - Current market landscape

3. Comparison Section (600 words)
   - Detailed comparison (Type I vs Type II, etc.)
   - When to choose each
   - Cost and timeline differences

4. Core Framework/Requirements (800 words)
   - Detailed breakdown
   - Examples for each component
   - Implementation considerations

5. Pre-Implementation Checklist (1,200 words)
   - 15-20 actionable items
   - Scoping and planning steps
   - Resource requirements

6. Implementation Checklist (1,500 words)
   - 25-30 actionable items
   - Step-by-step process
   - Technical details

7. Testing/Audit Phase (1,000 words)
   - Evidence collection
   - Common issues
   - Remediation strategies

8. Tools Comparison (800 words)
   - 5-7 tools with features, pricing, pros/cons
   - Include Custodia positioning

9. Costs & Timeline (600 words)
   - Breakdown by company size
   - Hidden costs
   - ROI analysis

10. Common Mistakes (500 words)
    - Top 10 pitfalls
    - How to avoid them

11. How Custodia Helps (400 words)
    - Unique value proposition
    - Fixed pricing
    - Success metrics

12. FAQ (1,000 words)
    - 15-20 comprehensive questions

13. Conclusion (300 words)
    - Key takeaways
    - Next steps

CITATION REQUIREMENTS:
- Include [SOURCE](URL) inline for every statistic
- Use format: "According to [Gartner's 2024 report](https://...), 85% of enterprises..."
- Cite 10-15 authoritative external sources from research
- Link to official framework documentation

HUMANIZATION:
- Vary sentence length (8-35 words)
- Use rhetorical questions
- Include personal insights from compliance experience
- Add transitional phrases
- Use specific examples with details
- Write like a human expert, not AI
- Add contractions (don't, can't, it's)
- Include conversational phrases

OUTPUT FORMAT:
Provide as TypeScript array of content blocks matching our ArticleContent interface:
[
  {
    type: 'heading',
    level: 2,
    content: 'Article Title'
  },
  {
    type: 'paragraph',
    content: 'Content with [citation](url) links'
  },
  {
    type: 'callout',
    variant: 'tip',
    content: 'Practical tip'
  }
]

Make it comprehensive, authoritative, and better than all competitors.
`;

    return await this.generateContent(prompt, { temperature: 0.7 });
  }

  async humanizeContent(content: string) {
    const prompt = `
Review this article content and make it more human-like to avoid AI detection:

${content}

Improvements needed:
1. Vary sentence structure more (mix short, medium, long)
2. Add more contractions and conversational phrases
3. Include personal anecdotes or Custodia client experiences
4. Add rhetorical questions
5. Use more specific examples with details
6. Add transitional phrases between sections
7. Include occasional informal language (while maintaining professionalism)
8. Add nuanced opinions and considerations
9. Use more varied sentence starters
10. Add personal voice and expert insights

Maintain: Technical accuracy, all citations, professional tone

Output: Improved content with same structure and all citations preserved
`;

    return await this.generateContent(prompt, { temperature: 0.8 });
  }

  async verifyCitations(citations: any[]) {
    const prompt = `
Verify these citations are accurate and authoritative:

${JSON.stringify(citations, null, 2)}

For each:
1. Is the URL valid and accessible?
2. Is the source credible (government, research firm, official framework)?
3. Does the statistic/fact match the source?
4. Is there a better/more recent source?
5. Rate credibility (1-10)

Suggest replacements for low-quality sources.

Output as JSON:
{
  "verifiedCitations": [
    {
      "original": "85% of enterprises require SOC 2",
      "source": "Gartner 2024 Security Report",
      "url": "https://gartner.com/...",
      "credibility": 9,
      "status": "verified|needs_replacement",
      "replacement": "suggested better source if needed"
    }
  ],
  "summary": "Overall citation quality assessment"
}
`;

    return await this.generateContent(prompt, { temperature: 0.2 });
  }

  async checkAIDetection(content: string) {
    const prompt = `
Analyze this content for AI detection risk:

${content}

Evaluate:
1. Sentence length variation (calculate coefficient of variation)
2. Natural language patterns
3. Personal voice and opinions
4. Specific examples and details
5. Transitional phrase variety
6. Overall human-like quality
7. Contraction usage
8. Conversational elements
9. Expert insights and personal experience
10. Varied sentence starters

Rate AI detection risk (1-10, 1=undetectable, 10=obviously AI)

Provide specific improvements if score >3

Output as JSON:
{
  "aiDetectionScore": 2,
  "analysis": {
    "sentenceVariation": "good|needs_improvement",
    "naturalLanguage": "good|needs_improvement",
    "personalVoice": "good|needs_improvement",
    "specificDetails": "good|needs_improvement",
    "transitions": "good|needs_improvement"
  },
  "improvements": ["specific improvement 1", "specific improvement 2"],
  "overallAssessment": "Content quality assessment"
}
`;

    return await this.generateContent(prompt, { temperature: 0.3 });
  }

  async seoAudit(article: any, keyword: string) {
    const prompt = `
SEO audit for article targeting "${keyword}":

${JSON.stringify(article, null, 2)}

Check:
1. Keyword placement (title, H1, first paragraph, H2s)
2. Keyword density (target 1-2%)
3. LSI keywords present
4. Internal linking opportunities
5. External link quality
6. Meta description optimization
7. Schema markup recommendations
8. Content depth and comprehensiveness
9. Heading structure optimization
10. Call-to-action placement

Provide specific improvements.

Output as JSON:
{
  "seoScore": 85,
  "analysis": {
    "keywordPlacement": "good|needs_improvement",
    "keywordDensity": "1.2%",
    "lsiKeywords": ["related keyword 1", "related keyword 2"],
    "internalLinks": ["suggested internal link 1"],
    "externalLinks": "good|needs_improvement",
    "metaDescription": "suggested meta description",
    "schemaMarkup": "recommended schema types",
    "contentDepth": "comprehensive|needs_expansion"
  },
  "improvements": ["specific improvement 1", "specific improvement 2"],
  "recommendations": ["recommendation 1", "recommendation 2"]
}
`;

    return await this.generateContent(prompt, { temperature: 0.3 });
  }

  async generateImage(prompt: string) {
    try {
      // Try Hugging Face first (free)
      const hfApiKey = process.env.HUGGINGFACE_API_KEY;
      
      if (hfApiKey) {
        return await this.generateImageHuggingFace(prompt, hfApiKey);
      }
      
      // Fallback to Replicate if HF key not available
      const replicateApiKey = process.env.REPLICATE_API_TOKEN;
      if (!replicateApiKey) {
        throw new Error('No image generation API key found. Add HUGGINGFACE_API_KEY or REPLICATE_API_TOKEN to .env.local');
      }
      
      return await this.generateImageReplicate(prompt, replicateApiKey);
    } catch (error) {
      console.error('Image Generation Error:', error);
      throw error;
    }
  }

  private async generateImageHuggingFace(prompt: string, apiKey: string) {
    const response = await fetch('https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          width: 800,
          height: 400,
          num_inference_steps: 20,
          guidance_scale: 7.5
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API Error: ${response.statusText}`);
    }

    const imageBuffer = await response.arrayBuffer();
    return Buffer.from(imageBuffer).toString('base64');
  }

  private async generateImageReplicate(prompt: string, apiKey: string) {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${apiKey}`
      },
      body: JSON.stringify({
        version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
        input: {
          prompt: prompt,
          width: 800,
          height: 400,
          num_inference_steps: 20,
          guidance_scale: 7.5,
          negative_prompt: "text, words, letters, blurry, low quality, distorted, watermark"
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Replicate API Error: ${response.statusText}`);
    }

    const prediction = await response.json();
    
    // Poll for completion
    let result = prediction;
    while (result.status === 'starting' || result.status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: {
          'Authorization': `Token ${apiKey}`
        }
      });
      
      result = await statusResponse.json();
    }

    if (result.status === 'succeeded' && result.output && result.output[0]) {
      // Download the image and convert to base64
      const imageResponse = await fetch(result.output[0]);
      const imageBuffer = await imageResponse.arrayBuffer();
      const base64 = Buffer.from(imageBuffer).toString('base64');
      return base64;
    } else {
      throw new Error(`Replicate generation failed: ${result.error || 'Unknown error'}`);
    }
  }
}

export default GeminiClient;
