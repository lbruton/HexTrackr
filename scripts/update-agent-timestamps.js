#!/usr/bin/env node

/* eslint-env node */
/* global require, console */

/**
 * Update all agent configurations with timestamp standardization
 * Ensures every Memento entity creation includes ISO 8601 timestamp as first observation
 */

const fs = require("fs");
const path = require("path");

const TIMESTAMP_NOTICE = `
### ⚠️ TIMESTAMP REQUIREMENT ⚠️

**CRITICAL**: Every Memento entity MUST include ISO 8601 timestamp as FIRST observation:

\`\`\`javascript
observations: [
  \`TIMESTAMP: \${new Date().toISOString()}\`,  // ALWAYS FIRST (e.g., 2025-09-12T14:30:45.123Z)
  // ... rest of observations
]
\`\`\`

This enables conflict resolution, temporal queries, and audit trails.
`;

function updateAgentFile(filePath) {
    const fileName = path.basename(filePath);
    console.log(`📝 Updating ${fileName}...`);
    
    let content = fs.readFileSync(filePath, "utf8");
    
    // Skip files that already have timestamp requirement
    if (content.includes("TIMESTAMP REQUIREMENT")) {
        console.log("   ✅ Already has timestamp requirement");
        return false;
    }
    
    // Find the MANDATORY After Discoveries section
    const afterDiscoveriesPattern = /### MANDATORY After Discoveries[^#]*/;
    const match = content.match(afterDiscoveriesPattern);
    
    if (match) {
        // Insert timestamp notice after the MANDATORY After Discoveries section
        const insertPosition = match.index + match[0].length;
        content = content.slice(0, insertPosition) + TIMESTAMP_NOTICE + content.slice(insertPosition);
        
        // Update any existing mcp__memento__create_entities examples
        content = content.replace(
            /observations: \[\n\s+("[^"]+",?\n\s+)+\]/g,
            (match) => {
                if (match.includes("TIMESTAMP")) {
                    return match; // Already has timestamp
                }
                // Add timestamp as first observation
                return match.replace(
                    "observations: [",
                    "observations: [\n      `TIMESTAMP: ${new Date().toISOString()}`,  // ALWAYS FIRST"
                );
            }
        );
        
        fs.writeFileSync(filePath, content);
        console.log("   ✅ Updated with timestamp standardization");
        return true;
    } else {
        console.log("   ⚠️  No MANDATORY After Discoveries section found");
        return false;
    }
}

// Update all agent files
const agentsDir = path.join(__dirname, "..", ".claude", "agents");
const agentFiles = fs.readdirSync(agentsDir)
    .filter(file => file.endsWith(".md") && !file.includes("README") && !file.includes("GUIDE"))
    .map(file => path.join(agentsDir, file));

console.log("🔧 Updating agent configurations with timestamp standardization...\n");

let updatedCount = 0;
agentFiles.forEach(file => {
    if (updateAgentFile(file)) {
        updatedCount++;
    }
});

console.log(`\n✨ Updated ${updatedCount} agent configurations`);
console.log("📋 All agents now follow timestamp standardization pattern");