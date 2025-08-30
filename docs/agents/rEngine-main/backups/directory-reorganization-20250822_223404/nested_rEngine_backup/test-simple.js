#!/usr/bin/env node

// Quick test of the multi-provider AI system
console.log("🧪 Testing Multi-Provider AI System...\n");

// Test Groq API directly
async function testGroq() {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + process.env.GROQ_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user", 
          content: "Hello! This is a test of the 5-tier AI system. Please respond with \"GROQ AI RESPONDING\" and tell me one cool fact."
        }
      ],
      max_tokens: 100
    })
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
}

// Test Gemini API
async function testGemini() {
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + process.env.GEMINI_API_KEY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: "Hello! This is a test of the 5-tier AI system. Please respond with \"GEMINI AI RESPONDING\" and tell me one cool fact."
        }]
      }]
    })
  });
  
  const data = await response.json();
  
  if (data.candidates && data.candidates[0] && data.candidates[0].content) {
    return data.candidates[0].content.parts[0].text;
  } else {
    throw new Error("Unexpected Gemini response format: " + JSON.stringify(data));
  }
}

async function runTests() {
  try {
    console.log("🚀 Testing Groq (Tier 1)...");
    const groqResponse = await testGroq();
    console.log("✅ GROQ:", groqResponse);
    console.log("");
    
    console.log("🌟 Testing Gemini (Tier 4)...");
    const geminiResponse = await testGemini();
    console.log("✅ GEMINI:", geminiResponse);
    console.log("");
    
    console.log("🎉 Multi-Provider System Working!");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

runTests();
