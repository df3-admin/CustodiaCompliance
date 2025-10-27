import GeminiClient from './lib/gemini-client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testArticleGeneration() {
  console.log('🧪 Testing Article Generation...\n');
  
  try {
    const gemini = new GeminiClient();
    console.log('✅ Gemini client created');
    
    // Test basic article generation
    console.log('📝 Generating test article...');
    
    const prompt = `Write a comprehensive introduction section for a SOC 2 compliance checklist article. Include:
    
    1. What SOC 2 is and why it matters
    2. Who needs SOC 2 compliance
    3. Key benefits of SOC 2
    4. Current market trends
    5. What readers will learn from this guide
    
    Make it engaging, informative, and around 500 words. Use a professional but conversational tone.`;
    
    const result = await gemini.generateContent(prompt, { temperature: 0.7 });
    console.log('✅ Article content generated successfully');
    console.log(`📊 Content length: ${result.length} characters`);
    console.log(`📄 Word count: ${result.split(' ').length} words`);
    console.log('\n📝 Sample content:');
    console.log(result.substring(0, 300) + '...');
    
    // Save test content
    const testFile = path.join('data', 'articles', 'test-article.txt');
    fs.writeFileSync(testFile, result);
    console.log(`\n💾 Test content saved to: ${testFile}`);
    
    console.log('\n🎉 Article generation test successful!');
    console.log('✅ Ready to generate full articles');
    
  } catch (error) {
    console.error('❌ Article generation test failed:', error);
  }
}

testArticleGeneration();
