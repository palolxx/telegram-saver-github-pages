// Test script to verify Groq AI integration
require('dotenv').config();

const GROQ_API_KEY = process.env.GROQ_API_KEY || 'YOUR_GROQ_API_KEY_HERE';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

if (GROQ_API_KEY === 'YOUR_GROQ_API_KEY_HERE') {
  console.error('❌ Please set your GROQ_API_KEY in the .env file');
  console.error('📝 Get your API key from: https://console.groq.com/keys');
  console.error('💡 Copy .env.example to .env and add your API key');
  process.exit(1);
}

async function testGroqAI() {
  try {
    console.log('🤖 Testing Groq AI integration...');
    console.log(`📋 Using model: ${GROQ_MODEL}`);
    
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful assistant. Respond in JSON format with {"test": "success", "message": "Hello from Groq!"}'
      },
      {
        role: 'user',
        content: 'Hello, please respond with a test message'
      }
    ];

    const requestBody = {
      model: GROQ_MODEL,
      messages: messages,
      temperature: 0.2,
      max_tokens: 100,
      stream: false
    };

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || response.statusText;
      
      if (response.status === 401) {
        throw new Error(`Authentication Error: Invalid API key. Please check your GROQ_API_KEY in the .env file.`);
      } else if (response.status === 404) {
        throw new Error(`Endpoint not found. This might indicate an invalid API key or service issue. Error: ${errorMessage}`);
      } else {
        throw new Error(`Groq API error (${response.status}): ${errorMessage}`);
      }
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content || '';
    
    console.log('✅ Groq AI Response:', generatedText);
    console.log('🎉 Integration test successful!');
    console.log('🚀 Your Groq AI integration is working properly!');
    
  } catch (error) {
    console.error('❌ Error testing Groq AI:', error.message);
    console.error('💡 Check the GROQ_SETUP.md file for troubleshooting tips');
  }
}

// Run the test
testGroqAI();