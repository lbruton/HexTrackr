#!/usr/bin/env node
/* eslint-env node */
/**
 * Simple Ollama embedding test
 * Tests nomic-embed-text for memory/embedding operations
 */

require("dotenv").config();

async function testOllamaEmbedding() {
  try {
    console.log("🧠 Testing Ollama embedding with nomic-embed-text...");
    
    const testText = "HexTrackr vulnerability tracking system with memory integration";
    
    // Test Ollama embedding API
    const response = await fetch("http://localhost:11434/api/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "nomic-embed-text:latest",
        prompt: testText
      })
    });
    
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log("✅ Ollama embedding successful!");
    console.log("📊 Embedding details:");
    console.log("  • Model: nomic-embed-text:latest");
    console.log(`  • Input text: "${testText}"`);
    console.log(`  • Embedding dimensions: ${data.embedding.length}`);
    console.log(`  • Sample values: [${data.embedding.slice(0, 5).map(v => v.toFixed(4)).join(", ")}...]`);
    
    // Test similarity with a related text
    console.log("\n🔍 Testing semantic similarity...");
    const similarText = "Security vulnerability management and threat tracking";
    
    const response2 = await fetch("http://localhost:11434/api/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "nomic-embed-text:latest",
        prompt: similarText
      })
    });
    
    const data2 = await response2.json();
    
    // Calculate cosine similarity
    const similarity = cosineSimilarity(data.embedding, data2.embedding);
    console.log(`  • Similarity between texts: ${(similarity * 100).toFixed(1)}%`);
    
    if (similarity > 0.5) {
      console.log("✅ Semantic understanding working well!");
    } else {
      console.log("⚠️  Lower similarity than expected");
    }
    
    return true;
    
  } catch (error) {
    console.error("❌ Ollama embedding test failed:");
    console.error(`  • Error: ${error.message}`);
    
    if (error.message.includes("ECONNREFUSED")) {
      console.error("  • Suggestion: Make sure Ollama is running (ollama serve)");
    } else if (error.message.includes("404")) {
      console.error("  • Suggestion: Pull the model (ollama pull nomic-embed-text)");
    }
    
    return false;
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same length");
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

if (require.main === module) {
  testOllamaEmbedding()
    .then(success => {
      console.log(success ? "\n🎉 Ollama embedding test complete!" : "\n❌ Test failed");
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error("Test execution failed:", error);
      process.exit(1);
    });
}

module.exports = { testOllamaEmbedding };
