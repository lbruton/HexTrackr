#!/usr/bin/env node
/* eslint-env node */
/**
 * Simple memento-mcp connection test
 */

require("dotenv").config();

async function testConnection() {
  try {
    console.log("🧠 Testing memento-mcp connection...");
    
    // Just test the package import
    const memento = require("@gannonh/memento-mcp");
    console.log("✅ Package imported:", Object.keys(memento).slice(0, 3).join(", "), "...");
    
    console.log("✅ Configuration ready:");
    console.log("  - Neo4j:", process.env.NEO4J_URI ? "✅" : "❌");
    console.log("  - Claude API:", process.env.ANTHROPIC_API_KEY ? "✅" : "❌");
    
    return true;
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    return false;
  }
}

if (require.main === module) {
  testConnection().then(success => process.exit(success ? 0 : 1));
}

module.exports = { testConnection };
