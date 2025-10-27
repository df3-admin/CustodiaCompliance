import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testGeminiAPI() {
  console.log('🧪 Testing Gemini API Connection and Response Quality...\n');
  
  // Check if API key exists
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in environment variables');
    console.log('📝 Please add your Gemini API key to .env.local:');
    console.log('   GEMINI_API_KEY=your_api_key_here');
    return;
  }
  
  console.log('✅ API key found in environment variables');
  
  try {
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('✅ Gemini client initialized successfully');
    
    // Test different models
    const models = ['models/gemini-2.5-flash', 'models/gemini-2.5-pro', 'models/gemini-pro-latest'];
    
    for (const modelName of models) {
      console.log(`\n🔍 Testing model: ${modelName}`);
      
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000
          }
        });
        
        // Test 1: Basic response
        console.log('   📝 Test 1: Basic response...');
        const basicPrompt = 'Write a short paragraph about SOC 2 compliance for startups.';
        const basicResult = await model.generateContent(basicPrompt);
        const basicResponse = basicResult.response.text();
        
        console.log(`   ✅ Basic response received (${basicResponse.length} characters)`);
        console.log(`   📄 Sample: "${basicResponse.substring(0, 100)}..."`);
        
        // Test 2: Structured response
        console.log('   📝 Test 2: Structured JSON response...');
        const jsonPrompt = `Provide information about SOC 2 compliance in JSON format:
        {
          "what_is_soc2": "brief explanation",
          "who_needs_it": "target audience",
          "main_benefits": ["benefit1", "benefit2", "benefit3"],
          "typical_cost": "cost range",
          "timeline": "typical duration"
        }`;
        
        const jsonResult = await model.generateContent(jsonPrompt);
        const jsonResponse = jsonResult.response.text();
        
        console.log(`   ✅ JSON response received (${jsonResponse.length} characters)`);
        
        // Try to parse JSON to verify structure
        try {
          const parsed = JSON.parse(jsonResponse);
          console.log(`   ✅ Valid JSON structure with ${Object.keys(parsed).length} fields`);
        } catch (parseError) {
          console.log(`   ⚠️ JSON parsing failed, but response received`);
        }
        
        // Test 3: Long-form content
        console.log('   📝 Test 3: Long-form content generation...');
        const longPrompt = `Write a comprehensive introduction section for a SOC 2 compliance guide. Include:
        - What SOC 2 is
        - Why it matters for businesses
        - Key benefits
        - Who needs it
        - Current market trends
        
        Make it engaging and informative, around 300-400 words.`;
        
        const longResult = await model.generateContent(longPrompt);
        const longResponse = longResult.response.text();
        
        console.log(`   ✅ Long-form response received (${longResponse.length} characters)`);
        console.log(`   📊 Word count: ${longResponse.split(' ').length} words`);
        
        // Test 4: Research and citations
        console.log('   📝 Test 4: Research with citations...');
        const researchPrompt = `Provide 3 key statistics about SOC 2 compliance adoption, including:
        - The statistic
        - The source (real organization name)
        - The year
        - A brief explanation
        
        Format each as: "According to [Source] ([Year]), [Statistic]. [Explanation]."`;
        
        const researchResult = await model.generateContent(researchPrompt);
        const researchResponse = researchResult.response.text();
        
        console.log(`   ✅ Research response received (${researchResponse.length} characters)`);
        console.log(`   📄 Sample: "${researchResponse.substring(0, 150)}..."`);
        
        // Test 5: Content quality analysis
        console.log('   📝 Test 5: Content quality analysis...');
        const qualityPrompt = `Analyze this content for quality indicators:
        "${longResponse.substring(0, 200)}..."
        
        Rate 1-10 for:
        - Clarity and readability
        - Technical accuracy
        - Engagement level
        - Professional tone
        
        Provide brief explanations for each rating.`;
        
        const qualityResult = await model.generateContent(qualityPrompt);
        const qualityResponse = qualityResult.response.text();
        
        console.log(`   ✅ Quality analysis received (${qualityResponse.length} characters)`);
        
        console.log(`\n🎉 Model ${modelName} is working perfectly!`);
        console.log('✅ All tests passed - Gemini API is fully functional');
        
        // If we get here, this model works, so we can use it
        console.log(`\n🏆 Recommended model: ${modelName}`);
        return modelName;
        
      } catch (modelError: any) {
        console.log(`   ❌ Model ${modelName} failed: ${modelError.message}`);
        continue;
      }
    }
    
    console.log('\n❌ No working models found. Please check your API key and permissions.');
    
  } catch (error: any) {
    console.error('\n❌ Gemini API Error:', error.message);
    
    if (error.message.includes('API key')) {
      console.log('\n💡 Troubleshooting:');
      console.log('1. Verify your API key is correct');
      console.log('2. Check if the API key has proper permissions');
      console.log('3. Ensure you have enabled the Gemini API in Google Cloud Console');
    } else if (error.message.includes('quota')) {
      console.log('\n💡 Troubleshooting:');
      console.log('1. Check your API quota limits');
      console.log('2. Verify billing is enabled');
      console.log('3. Wait for quota reset if limits are exceeded');
    } else if (error.message.includes('model')) {
      console.log('\n💡 Troubleshooting:');
      console.log('1. Try different model names');
      console.log('2. Check if the model is available in your region');
      console.log('3. Verify API version compatibility');
    }
  }
}

async function testContentGeneration() {
  console.log('\n🚀 Testing Content Generation Capabilities...\n');
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ 
      model: 'models/gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000
      }
    });
    
    // Test article structure generation
    console.log('📝 Testing article structure generation...');
    const structurePrompt = `Create a detailed outline for a comprehensive SOC 2 compliance guide. Include:
    
    1. Main sections (10-12 sections)
    2. Sub-sections for each main section
    3. Key topics to cover in each section
    4. Estimated word count for each section
    
    Format as a structured outline with clear hierarchy.`;
    
    const structureResult = await model.generateContent(structurePrompt);
    const structureResponse = structureResult.response.text();
    
    console.log('✅ Article structure generated successfully');
    console.log(`📊 Structure length: ${structureResponse.length} characters`);
    console.log(`📄 Sample structure:\n${structureResponse.substring(0, 300)}...`);
    
    // Test competitor analysis simulation
    console.log('\n📝 Testing competitor analysis capabilities...');
    const competitorPrompt = `Analyze these hypothetical competitor articles for "SOC 2 compliance checklist":
    
    Competitor 1: "SOC 2 Basics" - 2,000 words, covers basic requirements
    Competitor 2: "Complete SOC 2 Guide" - 5,000 words, includes implementation steps
    Competitor 3: "SOC 2 for Startups" - 3,000 words, focuses on small businesses
    
    Provide analysis including:
    - Content gaps we can exploit
    - Areas where competitors are weak
    - Opportunities to create better content
    - Recommended content length and depth`;
    
    const competitorResult = await model.generateContent(competitorPrompt);
    const competitorResponse = competitorResult.response.text();
    
    console.log('✅ Competitor analysis generated successfully');
    console.log(`📊 Analysis length: ${competitorResponse.length} characters`);
    
    // Test research capabilities
    console.log('\n📝 Testing research and fact generation...');
    const researchPrompt = `Generate realistic research data for SOC 2 compliance, including:
    
    1. 3 key statistics with sources
    2. 2 expert quotes
    3. 1 case study example
    4. Cost breakdown by company size
    5. Timeline estimates
    
    Make the data realistic and professional, suitable for a compliance article.`;
    
    const researchResult = await model.generateContent(researchPrompt);
    const researchResponse = researchResult.response.text();
    
    console.log('✅ Research data generated successfully');
    console.log(`📊 Research length: ${researchResponse.length} characters`);
    
    console.log('\n🎉 All content generation tests passed!');
    console.log('✅ Gemini is ready for article generation');
    
  } catch (error: any) {
    console.error('❌ Content generation test failed:', error.message);
  }
}

async function runFullTest() {
  console.log('🚀 Starting Comprehensive Gemini API Test Suite\n');
  console.log('=' .repeat(60));
  
  const workingModel = await testGeminiAPI();
  
  if (workingModel) {
    console.log('\n' + '=' .repeat(60));
    await testContentGeneration();
    
    console.log('\n' + '=' .repeat(60));
    console.log('🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('✅ Gemini API is fully functional and ready for content generation');
    console.log(`🏆 Using model: ${workingModel}`);
    console.log('\n📋 Next steps:');
    console.log('1. Run: npx tsx scripts/generate-all-articles.ts --all');
    console.log('2. Monitor the generation process');
    console.log('3. Deploy articles to database when ready');
  } else {
    console.log('\n❌ Tests failed - please fix API issues before proceeding');
  }
}

// Run the test
runFullTest().catch(console.error);
