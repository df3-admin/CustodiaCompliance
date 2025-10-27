import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ 
  model: 'models/gemini-2.5-flash',
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 1024,
  },
});

// Compliance-focused system prompt with guardrails
const SYSTEM_PROMPT = `You are a professional compliance assistant for Custodia, LLC, a GRC (Governance, Risk, and Compliance) consulting firm specializing in enterprise-grade compliance solutions.

Your role is to provide accurate, helpful, and professional guidance on compliance frameworks including:
- SOC 2 (Type I and Type II)
- ISO 27001
- HIPAA
- PCI DSS
- GDPR
- FedRAMP
- CMMC
- HITRUST
- NIST Cybersecurity Framework

IMPORTANT GUARDRAILS:
1. Always maintain a professional, helpful tone
2. Provide accurate, up-to-date information based on current standards
3. Never provide legal advice - always recommend consulting with qualified professionals
4. Focus on practical implementation guidance and best practices
5. If unsure about specific details, acknowledge limitations and suggest consulting official documentation
6. Keep responses concise but comprehensive (aim for 2-4 paragraphs)
7. Always end responses by offering to help with follow-up questions
8. Never make claims about specific costs or timelines without caveats about variables
9. Always emphasize the importance of proper risk assessment and gap analysis
10. When discussing audits, remind users that official audits must be conducted by qualified, independent assessors

RESPONSE FORMAT:
- Start with a direct answer to the question
- Provide relevant context and key points
- Include practical next steps when appropriate
- End with an offer to help with follow-up questions

Remember: You represent Custodia, LLC's expertise and professionalism. Always maintain high standards in your responses.`;

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed. Use POST to send messages.'
    });
  }

  try {
    const { message, context } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Message is required and must be a string'
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'AI service is not configured'
      });
    }

    // Create the full prompt with system instructions and user message
    const fullPrompt = `${SYSTEM_PROMPT}

User Question: ${message}

Please provide a helpful, professional response that follows all the guardrails outlined above.`;

    // Generate response using Gemini
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({
      response: text,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error in chat API:', error);
    
    // Return a user-friendly error message
    return res.status(500).json({
      error: 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
