#!/usr/bin/env node

/**
 * Script to restore HexTrackr project memory from .rMemory JSON files
 * This script reads the memento-import.json and imports entities into Memento MCP
 */

const fs = require("fs");
const path = require("path");

async function restoreMemory() {
    try {
        console.log("🔄 Starting HexTrackr memory restoration...");
        
        const importFile = path.join(__dirname, "../.rMemory/json/memento-import.json");
        const data = JSON.parse(fs.readFileSync(importFile, "utf8"));
        
        console.log(`📊 Found ${data.total_entities} entities to import`);
        console.log(`📅 Generated: ${data.generated_at}`);
        console.log(`🎯 Source: ${data.source}`);
        
        // Extract entities in Memento format
        const entities = data.entities.map(entity => ({
            entityType: entity.entityType,
            name: entity.name,
            observations: entity.observations || []
        }));
        
        // Log entity types distribution
        const typeCount = {};
        entities.forEach(e => {
            typeCount[e.entityType] = (typeCount[e.entityType] || 0) + 1;
        });
        
        console.log("\n📋 Entity types distribution:");
        Object.entries(typeCount).forEach(([type, count]) => {
            console.log(`  ${type}: ${count}`);
        });
        
        // Output entities for manual import (since we can't call MCP directly from Node)
        console.log("\n✅ Entities ready for import:");
        console.log("Total entities:", entities.length);
        
        // Save in batches for easier import
        const batchSize = 10;
        for (let i = 0; i < entities.length; i += batchSize) {
            const batch = entities.slice(i, i + batchSize);
            const batchFile = path.join(__dirname, `../scripts/memory-batch-${Math.floor(i/batchSize) + 1}.json`);
            fs.writeFileSync(batchFile, JSON.stringify(batch, null, 2));
            console.log(`📦 Batch ${Math.floor(i/batchSize) + 1} saved: ${batch.length} entities`);
        }
        
        console.log("\n🎉 Memory restoration preparation complete!");
        
    } catch (error) {
        console.error("❌ Error restoring memory:", error);
        process.exit(1);
    }
}

restoreMemory();
