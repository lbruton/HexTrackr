#!/usr/bin/env node

/**
 * Quick Memory Restore Script
 * Finds and prints backup files for manual import to Memento
 */

const fs = require("fs").promises;
const path = require("path");

async function main() {
    console.log("🚀 HexTrackr Memory Restoration Analysis");
    
    const backupDir = path.join(__dirname, "../json");
    const docsDir = path.join(__dirname, "../docs/ops/recovered-memories");
    
    const backupFiles = [
        "memento-import.json",
        "canonical-notes.json", 
        "chat-evidence.json",
        "symbol-index.json",
        "symbols-table.json"
    ];
    
    console.log("\n📊 Backup File Analysis:");
    
    for (const fileName of backupFiles) {
        const filePath = path.join(backupDir, fileName);
        
        try {
            const stats = await fs.stat(filePath);
            const content = await fs.readFile(filePath, "utf8");
            const data = JSON.parse(content);
            
            console.log(`\n✅ ${fileName}:`);
            console.log(`   Size: ${(stats.size / 1024).toFixed(1)}KB`);
            
            if (fileName === "memento-import.json" && data.entities) {
                console.log(`   Entities: ${data.entities.length}`);
                console.log(`   Types: ${[...new Set(data.entities.map(e => e.entityType))].join(", ")}`);
            } else if (fileName === "canonical-notes.json" && Array.isArray(data)) {
                console.log(`   Notes: ${data.length}`);
            } else if (fileName === "chat-evidence.json" && data.clusters) {
                console.log(`   Clusters: ${data.clusters.length}`);
            } else if (fileName === "symbol-index.json" && data.symbols) {
                console.log(`   Symbols: ${data.symbols.length}`);
                const types = [...new Set(data.symbols.map(s => s.type))];
                console.log(`   Symbol Types: ${types.join(", ")}`);
            } else if (fileName === "symbols-table.json" && data.symbols) {
                console.log(`   Symbol Table Entries: ${data.symbols.length}`);
            }
            
        } catch (error) {
            console.log(`⚠️  ${fileName}: Not found or invalid`);
        }
    }
    
    // Check recovered memories
    try {
        const recoveredPath = path.join(docsDir, "memento-import.json");
        const stats = await fs.stat(recoveredPath);
        const content = await fs.readFile(recoveredPath, "utf8");
        const data = JSON.parse(content);
        
        console.log("\n✅ Recovered Memories:");
        console.log(`   Size: ${(stats.size / 1024).toFixed(1)}KB`);
        if (data.entities) {
            console.log(`   Entities: ${data.entities.length}`);
        }
    } catch (error) {
        console.log("\n⚠️  Recovered memories: Not found");
    }
    
    console.log("\n🎯 Summary: Found backup files ready for Memento import");
}

main().catch(console.error);
