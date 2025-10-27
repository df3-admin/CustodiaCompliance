import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function listAvailableModels() {
  console.log('🔍 Checking available Gemini models...\n');
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in environment variables');
    return;
  }
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Try to get model info directly
    console.log('📝 Testing direct model access...');
    
    // Test different model names that might work
    const testModels = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.0-pro',
      'gemini-1.0-pro-001',
      'gemini-1.5-pro-001',
      'gemini-1.5-flash-001',
      'models/gemini-pro',
      'models/gemini-1.5-pro',
      'models/gemini-1.5-flash'
    ];
    
    for (const modelName of testModels) {
      try {
        console.log(`\n🔍 Testing model: ${modelName}`);
        
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 100
          }
        });
        
        const result = await model.generateContent('Hello, respond with "API working"');
        const response = result.response.text();
        
        console.log(`✅ SUCCESS! Model ${modelName} is working`);
        console.log(`📄 Response: "${response}"`);
        
        // If we get here, this model works
        console.log(`\n🎉 Found working model: ${modelName}`);
        return modelName;
        
      } catch (error: any) {
        console.log(`❌ Model ${modelName} failed: ${error.message.split('\n')[0]}`);
      }
    }
    
    console.log('\n❌ No working models found');
    
    // Try to get model list via API
    console.log('\n📝 Attempting to fetch model list...');
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + process.env.GEMINI_API_KEY);
      const data = await response.json();
      
      if (data.models) {
        console.log('✅ Available models:');
        data.models.forEach((model: any) => {
          console.log(`  - ${model.name}`);
        });
      } else {
        console.log('❌ Could not fetch model list');
        console.log('Response:', JSON.stringify(data, null, 2));
      }
    } catch (fetchError) {
      console.log('❌ Could not fetch model list:', fetchError);
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

listAvailableModels().catch(console.error);
