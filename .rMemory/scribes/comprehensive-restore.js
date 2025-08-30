#!/usr/bin/env node

/**
 * Direct Memento Import - imports backup data directly
 * Run this to restore all backup entities to Memento MCP
 */

const fs = require("fs").promises;
const path = require("path");

async function importCanonicalNotes() {
    try {
        const filePath = path.join(__dirname, "../json/canonical-notes.json");
        const content = await fs.readFile(filePath, "utf8");
        const data = JSON.parse(content);
        
        if (!Array.isArray(data)) {
            console.log("❌ canonical-notes.json is not an array");
            return [];
        }
        
        const entities = data.map((note, index) => ({
            entityType: "canonical_note",
            name: note.title || note.note || `Canonical Note ${index + 1}`,
            observations: [
                `Created: ${note.timestamp || "Unknown"}`,
                `Note: ${note.note || note.content || "No content"}`,
                note.context ? `Context: ${note.context}` : "",
                note.importance ? `Importance: ${note.importance}` : ""
            ].filter(Boolean)
        }));
        
        console.log(`📝 Found ${entities.length} canonical notes`);
        return entities;
        
    } catch (error) {
        console.log(`❌ Error processing canonical notes: ${error.message}`);
        return [];
    }
}

async function importChatEvidence() {
    try {
        const filePath = path.join(__dirname, "../json/chat-evidence.json");
        const content = await fs.readFile(filePath, "utf8");
        const data = JSON.parse(content);
        
        if (!data.clusters) {
            console.log("❌ chat-evidence.json missing clusters");
            return [];
        }
        
        const entities = data.clusters.map((cluster, index) => ({
            entityType: "chat_evidence",
            name: `Chat Evidence Cluster ${index + 1}`,
            observations: [
                `Topics: ${cluster.topics ? cluster.topics.join(", ") : "Unknown"}`,
                `Messages: ${cluster.messages ? cluster.messages.length : 0}`,
                `Created: ${cluster.timestamp || "Unknown"}`,
                cluster.summary ? `Summary: ${cluster.summary}` : ""
            ].filter(Boolean)
        }));
        
        console.log(`💬 Found ${entities.length} chat evidence clusters`);
        return entities;
        
    } catch (error) {
        console.log(`❌ Error processing chat evidence: ${error.message}`);
        return [];
    }
}

async function importSymbolSummary() {
    try {
        const filePath = path.join(__dirname, "../json/symbol-index.json");
        const content = await fs.readFile(filePath, "utf8");
        const data = JSON.parse(content);
        
        if (!data.symbols) {
            console.log("❌ symbol-index.json missing symbols");
            return [];
        }
        
        // Group symbols by type for summary entities
        const symbolsByType = {};
        data.symbols.forEach(symbol => {
            const type = symbol.type || "unknown";
            if (!symbolsByType[type]) {symbolsByType[type] = [];}
            symbolsByType[type].push(symbol);
        });
        
        const entities = Object.entries(symbolsByType).map(([type, symbols]) => ({
            entityType: "code_symbols",
            name: `${type.charAt(0).toUpperCase() + type.slice(1)} Symbols`,
            observations: [
                `Type: ${type}`,
                `Count: ${symbols.length}`,
                `Files: ${new Set(symbols.map(s => s.file)).size}`,
                `Generated: ${new Date().toISOString()}`,
                `Sample: ${symbols.slice(0, 5).map(s => s.name).join(", ")}`
            ]
        }));
        
        console.log(`🔣 Found ${data.symbols.length} symbols in ${Object.keys(symbolsByType).length} categories`);
        return entities;
        
    } catch (error) {
        console.log(`❌ Error processing symbols: ${error.message}`);
        return [];
    }
}

async function main() {
    console.log("🚀 Starting comprehensive memory restoration...");
    
    // Import different data types
    const canonicalNotes = await importCanonicalNotes();
    const chatEvidence = await importChatEvidence();
    const symbolSummary = await importSymbolSummary();
    
    const allEntities = [...canonicalNotes, ...chatEvidence, ...symbolSummary];
    
    console.log(`\n📊 Total entities ready for import: ${allEntities.length}`);
    console.log(`   - Canonical Notes: ${canonicalNotes.length}`);
    console.log(`   - Chat Evidence: ${chatEvidence.length}`);
    console.log(`   - Symbol Categories: ${symbolSummary.length}`);
    
    // Save for batch import
    const batchFile = path.join(__dirname, "comprehensive-restore-batch.json");
    await fs.writeFile(batchFile, JSON.stringify(allEntities, null, 2));
    
    console.log("\n✅ Entities saved to: comprehensive-restore-batch.json");
    console.log("🎯 Ready for Memento MCP import!");
    
    return allEntities;
}

main().catch(console.error);
