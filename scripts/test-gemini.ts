import GeminiClient from './lib/gemini-client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testGemini() {
  console.log('🧪 Testing Gemini API connection...');
  
  try {
    const gemini = new GeminiClient();
    console.log('✅ Gemini client created successfully');
    
    const result = await gemini.generateContent('Write a short test message about compliance.', { temperature: 0.7 });
    console.log('✅ Gemini API response:', result.substring(0, 100) + '...');
    
  } catch (error) {
    console.error('❌ Gemini API error:', error);
  }
}

testGemini();
