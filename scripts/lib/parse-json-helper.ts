/**
 * Utility function to parse JSON from Gemini AI responses
 * Handles various formats including markdown code blocks, plain text, and escaped characters
 */
export function parseJSONFromGemini(text: string): any {
  if (!text || typeof text !== 'string') {
    return null;
  }

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
    return null;
  }
}

