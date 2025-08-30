#!/usr/bin/env node
/* eslint-env node */
/**
 * Ollama Detection Service for HexTrackr
 * Detects available Ollama installation and models
 * 
 * Usage:
 *   node scripts/ollama-detector.js
 *   node scripts/ollama-detector.js --json
 *   node scripts/ollama-detector.js --models-only
 */

const http = require("http");

/**
 * Check if Ollama is running and accessible
 */
async function checkOllamaStatus() {
  return new Promise((resolve) => {
    const req = http.get("http://localhost:11434/api/version", {
      timeout: 3000
    }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          const version = JSON.parse(data);
          resolve({ 
            status: "running", 
            version: version.version,
            available: true 
          });
        } catch {
          resolve({ status: "error", available: false });
        }
      });
    });
    
    req.on("error", () => {
      resolve({ status: "not-running", available: false });
    });
    
    req.on("timeout", () => {
      req.destroy();
      resolve({ status: "timeout", available: false });
    });
  });
}

/**
 * Fetch available models from Ollama
 */
async function getAvailableModels() {
  return new Promise((resolve) => {
    const req = http.get("http://localhost:11434/api/tags", {
      timeout: 5000
    }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          const response = JSON.parse(data);
          const models = response.models || [];
          resolve({
            success: true,
            models: models.map(model => ({
              name: model.name,
              size: model.size,
              digest: model.digest,
              modified_at: model.modified_at,
              details: model.details
            }))
          });
        } catch (error) {
          resolve({ success: false, error: error.message, models: [] });
        }
      });
    });
    
    req.on("error", (error) => {
      resolve({ success: false, error: error.message, models: [] });
    });
    
    req.on("timeout", () => {
      req.destroy();
      resolve({ success: false, error: "Request timeout", models: [] });
    });
  });
}

/**
 * Get recommended model for different use cases
 */
function getModelRecommendations(models) {
  const recommendations = {
    coding: null,
    chat: null,
    embedding: null
  };
  
  for (const model of models) {
    const name = model.name.toLowerCase();
    
    // Embedding models (prioritize dedicated embedding models)
    if (name.includes("embed") || name.includes("nomic")) {
      recommendations.embedding = model; // Always prefer dedicated embedding models
    } else if (name.includes("llama") && !recommendations.embedding) {
      recommendations.embedding = model; // Fallback to general models
    }
    
    // Coding models
    if (name.includes("coder") || name.includes("code")) {
      if (!recommendations.coding || name.includes("qwen")) {
        recommendations.coding = model;
      }
    }
    
    // Chat models  
    if (name.includes("llama") || name.includes("chat")) {
      if (!recommendations.chat || name.includes("3.1")) {
        recommendations.chat = model;
      }
    }
  }
  
  return recommendations;
}

/**
 * Format file size for display
 */
function formatSize(bytes) {
  if (!bytes) {return "Unknown";}
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Main detection function
 */
async function detectOllama() {
  console.log("🔍 Detecting Ollama installation...");
  
  // Check if Ollama is running
  const status = await checkOllamaStatus();
  
  if (!status.available) {
    return {
      available: false,
      status: status.status,
      message: "Ollama not detected. Please install Ollama Desktop and ensure it's running.",
      models: [],
      recommendations: {}
    };
  }
  
  console.log(`✅ Ollama detected (version: ${status.version})`);
  
  // Get available models
  console.log("📋 Fetching available models...");
  const modelsResult = await getAvailableModels();
  
  if (!modelsResult.success) {
    return {
      available: true,
      status: "running",
      version: status.version,
      models: [],
      error: modelsResult.error,
      recommendations: {}
    };
  }
  
  const models = modelsResult.models;
  console.log(`🎯 Found ${models.length} models`);
  
  // Get recommendations
  const recommendations = getModelRecommendations(models);
  
  return {
    available: true,
    status: "running",
    version: status.version,
    models,
    recommendations,
    summary: {
      total: models.length,
      totalSize: models.reduce((sum, m) => sum + (m.size || 0), 0)
    }
  };
}

/**
 * Display results in human-readable format
 */
function displayResults(result) {
  if (!result.available) {
    console.log(`❌ ${result.message}`);
    return;
  }
  
  console.log(`\n🎉 Ollama Status: ${result.status} (v${result.version})`);
  console.log(`📊 Total Models: ${result.summary.total}`);
  console.log(`💾 Total Size: ${formatSize(result.summary.totalSize)}`);
  
  if (result.models.length > 0) {
    console.log("\n📋 Available Models:");
    result.models.forEach(model => {
      console.log(`  • ${model.name} (${formatSize(model.size)})`);
    });
    
    console.log("\n🎯 Recommendations:");
    if (result.recommendations.coding) {
      console.log(`  • Coding: ${result.recommendations.coding.name}`);
    }
    if (result.recommendations.chat) {
      console.log(`  • Chat: ${result.recommendations.chat.name}`);
    }
    if (result.recommendations.embedding) {
      console.log(`  • Embedding: ${result.recommendations.embedding.name}`);
    }
  }
}

/**
 * CLI interface
 */
async function main() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes("--json");
  const modelsOnly = args.includes("--models-only");
  
  try {
    const result = await detectOllama();
    
    if (jsonOutput) {
      console.log(JSON.stringify(result, null, 2));
    } else if (modelsOnly) {
      if (result.available && result.models.length > 0) {
        result.models.forEach(model => console.log(model.name));
      }
    } else {
      displayResults(result);
    }
    
    process.exit(result.available ? 0 : 1);
    
  } catch (error) {
    console.error("❌ Detection failed:", error.message);
    process.exit(1);
  }
}

module.exports = {
  detectOllama,
  checkOllamaStatus,
  getAvailableModels,
  getModelRecommendations
};

if (require.main === module) {
  main();
}
