#!/usr/bin/env node

// Direct API test script - bypasses OpenWebUI entirely
// Usage: node test-direct-apis.js "Your message here"

import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

// API Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function testGeminiDirect(message) {
  if (!GEMINI_API_KEY) {
    console.log('❌ GEMINI_API_KEY not found in environment');
    return;
  }

  try {
    console.log('🤖 Testing Gemini Direct API...');
    console.log(`📝 Message: "${message}"`);
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const result = await model.generateContent(message);
    const response = await result.response;
    
    console.log('✅ Gemini Direct Success!');
    console.log('📤 Response:');
    console.log(response.text());
    
  } catch (error) {
    console.log('❌ Gemini Direct Failed:', error.message);
  }
}

async function testGroqDirect(message) {
  if (!GROQ_API_KEY) {
    console.log('❌ GROQ_API_KEY not found in environment');
    return;
  }

  try {
    console.log('🚀 Testing Groq Direct API...');
    console.log(`📝 Message: "${message}"`);
    
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: message }],
      max_tokens: 500,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('✅ Groq Direct Success!');
    console.log('📤 Response:');
    console.log(response.data.choices[0].message.content);
    
  } catch (error) {
    console.log('❌ Groq Direct Failed:', error.message);
  }
}

// Main execution
const message = process.argv[2] || 'Hello! Testing direct API integration.';

console.log('🔧 Direct API Test Suite');
console.log('========================\n');

// Test available APIs
if (GEMINI_API_KEY) {
  await testGeminiDirect(message);
  console.log('\n' + '─'.repeat(50) + '\n');
}

if (GROQ_API_KEY) {
  await testGroqDirect(message);
  console.log('\n' + '─'.repeat(50) + '\n');
}

if (!GEMINI_API_KEY && !GROQ_API_KEY) {
  console.log('❌ No API keys found in environment');
  console.log('💡 Set GEMINI_API_KEY or GROQ_API_KEY to test APIs');
}

console.log('🎯 Test complete!');
