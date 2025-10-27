import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testBasicGemini() {
  console.log('🧪 Testing basic Gemini API...');
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const result = await model.generateContent('Hello, write a short test message.');
    console.log('✅ Success:', result.response.text());
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testBasicGemini();
