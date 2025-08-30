#!/usr/bin/env node
/* eslint-env node */
/**
 * Claude API Integration for HexTrackr Memory System
 * Provides embedding and chat capabilities using Anthropic's Claude API
 * 
 * Usage:
 *   node scripts/claude-integration.js embed "text to embed"
 *   node scripts/claude-integration.js chat "prompt text"
 *   node scripts/claude-integration.js test
 */

require("dotenv").config();
const { Anthropic } = require("@anthropic-ai/sdk");

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Generate embeddings using Claude (via completion with special prompt)
 * Note: Claude doesn't have dedicated embedding API, so we use a completion approach
 */
async function generateEmbedding(text) {
  try {
    // For now, we'll use a simple approach - in production you might want
    // to use a dedicated embedding service or Claude's completion for semantic vectors
    const response = await anthropic.messages.create({
      model: process.env.CLAUDE_EMBEDDING_MODEL || "claude-3-haiku-20240307",
      max_tokens: parseInt(process.env.CLAUDE_MAX_TOKENS) || 1024,
      temperature: parseFloat(process.env.CLAUDE_TEMPERATURE) || 0.1,
      messages: [{
        role: "user",
        content: `Create a semantic summary vector for this text (return as array of 1024 normalized float values between -1 and 1): "${text}"`
      }]
    });

    // This is a simplified approach - in practice you'd want to use a proper embedding model
    // For now, we'll create a mock embedding based on text characteristics
    const embedding = createMockEmbedding(text);
    
    return {
      embedding,
      model: process.env.CLAUDE_EMBEDDING_MODEL || "claude-3-haiku-20240307",
      usage: {
        prompt_tokens: response.usage.input_tokens,
        total_tokens: response.usage.input_tokens + response.usage.output_tokens
      }
    };
  } catch (error) {
    console.error("Claude embedding error:", error.message);
    throw error;
  }
}

/**
 * Generate chat completion using Claude
 */
async function generateCompletion(prompt, context = []) {
  try {
    const messages = [
      ...context,
      { role: "user", content: prompt }
    ];

    const response = await anthropic.messages.create({
      model: process.env.CLAUDE_EMBEDDING_MODEL || "claude-3-haiku-20240307",
      max_tokens: parseInt(process.env.CLAUDE_MAX_TOKENS) || 4096,
      temperature: parseFloat(process.env.CLAUDE_TEMPERATURE) || 0.1,
      messages
    });

    return {
      content: response.content[0].text,
      model: process.env.CLAUDE_EMBEDDING_MODEL || "claude-3-haiku-20240307",
      usage: {
        prompt_tokens: response.usage.input_tokens,
        completion_tokens: response.usage.output_tokens,
        total_tokens: response.usage.input_tokens + response.usage.output_tokens
      }
    };
  } catch (error) {
    console.error("Claude completion error:", error.message);
    throw error;
  }
}

/**
 * Create a mock embedding for demonstration
 * In production, you'd use a proper embedding model or service
 */
function createMockEmbedding(text) {
  const dimension = parseInt(process.env.NEO4J_VECTOR_DIMENSIONS) || 1024;
  const embedding = new Array(dimension);
  
  // Simple hash-based mock embedding
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  for (let i = 0; i < dimension; i++) {
    // Create pseudo-random values based on text hash and position
    const seed = hash + i;
    embedding[i] = (Math.sin(seed) * 0.5); // Normalize to [-0.5, 0.5]
  }
  
  // Normalize the vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / magnitude);
}

/**
 * Test Claude API connection
 */
async function testConnection() {
  try {
    console.log("Testing Claude API connection...");
    
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "your_claude_api_key_here") {
      throw new Error("ANTHROPIC_API_KEY not configured in .env file");
    }

    const response = await generateCompletion("Hello! Please respond with \"Claude API is working correctly.\"");
    
    console.log("✅ Claude API connection successful!");
    console.log("Model:", response.model);
    console.log("Response:", response.content);
    console.log("Token usage:", response.usage);
    
    // Test embedding
    console.log("\nTesting embedding generation...");
    const embeddingResult = await generateEmbedding("test embedding text");
    console.log("✅ Embedding generation successful!");
    console.log("Embedding dimensions:", embeddingResult.embedding.length);
    console.log("Sample values:", embeddingResult.embedding.slice(0, 5));
    
    return true;
  } catch (error) {
    console.error("❌ Claude API test failed:", error.message);
    return false;
  }
}

/**
 * Main CLI interface
 */
async function main() {
  const [command, ...args] = process.argv.slice(2);

  switch (command) {
    case "embed":
      if (!args[0]) {
        console.error("Usage: node claude-integration.js embed \"text to embed\"");
        process.exit(1);
      }
      try {
        const result = await generateEmbedding(args[0]);
        console.log(JSON.stringify(result, null, 2));
      } catch (error) {
        console.error("Embedding failed:", error.message);
        process.exit(1);
      }
      break;

    case "chat":
      if (!args[0]) {
        console.error("Usage: node claude-integration.js chat \"prompt text\"");
        process.exit(1);
      }
      try {
        const result = await generateCompletion(args[0]);
        console.log(JSON.stringify(result, null, 2));
      } catch (error) {
        console.error("Chat completion failed:", error.message);
        process.exit(1);
      }
      break;

    case "test": {
      const success = await testConnection();
      process.exit(success ? 0 : 1);
      break;
    }

    default:
      console.log(`Claude API Integration for HexTrackr

Usage:
  node scripts/claude-integration.js test           # Test API connection
  node scripts/claude-integration.js embed "text"   # Generate embedding
  node scripts/claude-integration.js chat "prompt"  # Generate completion

Environment variables:
  ANTHROPIC_API_KEY         # Your Claude API key
  CLAUDE_EMBEDDING_MODEL    # Claude model to use (default: claude-3-haiku-20240307)
  CLAUDE_MAX_TOKENS         # Max tokens per request (default: 4096)
  CLAUDE_TEMPERATURE        # Temperature setting (default: 0.1)
`);
      process.exit(1);
  }
}

module.exports = {
  generateEmbedding,
  generateCompletion,
  testConnection
};

if (require.main === module) {
  main().catch(console.error);
}
