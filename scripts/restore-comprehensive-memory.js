#!/usr/bin/env node

/**
 * Comprehensive Memory Restoration Script for HexTrackr
 * Imports data from all .rMemory/json files into Memento MCP
 */

const fs = require("fs");
const path = require("path");

async function processCanonicalNotes() {
    console.log("📚 Processing canonical-notes.json...");
    
    const filePath = path.join(__dirname, "../.rMemory/json/canonical-notes.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    
    const entities = [];
    
    for (const [topicKey, note] of Object.entries(data)) {
        entities.push({
            entityType: "canonical_note",
            name: note.title,
            observations: [
                `Topic: ${topicKey}`,
                `Created: ${note.created_at}`,
                `Evidence count: ${note.evidence_count}`,
                `Summary: ${note.body.slice(0, 200)}...`,
                `Source spans: ${note.source_spans.join(", ")}`
            ]
        });
    }
    
    console.log(`📝 Found ${entities.length} canonical notes`);
    
    // Save in batches for import
    const batchSize = 10;
    for (let i = 0; i < entities.length; i += batchSize) {
        const batch = entities.slice(i, i + batchSize);
        const batchFile = path.join(__dirname, `canonical-batch-${Math.floor(i/batchSize) + 1}.json`);
        fs.writeFileSync(batchFile, JSON.stringify(batch, null, 2));
        console.log(`📦 Canonical batch ${Math.floor(i/batchSize) + 1}: ${batch.length} entities`);
    }
    
    return entities.length;
}

async function processChatEvidence() {
    console.log("💬 Processing chat-evidence.json...");
    
    const filePath = path.join(__dirname, "../.rMemory/json/chat-evidence.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    
    // Group chat evidence by topic for more meaningful entities
    const topicGroups = {};
    
    data.forEach(evidence => {
        const topic = evidence.topicKey || "general";
        if (!topicGroups[topic]) {
            topicGroups[topic] = [];
        }
        topicGroups[topic].push(evidence);
    });
    
    const entities = [];
    
    for (const [topic, evidences] of Object.entries(topicGroups)) {
        if (evidences.length > 5) { // Only include topics with substantial evidence
            entities.push({
                entityType: "chat_evidence_cluster",
                name: `Chat Evidence: ${topic}`,
                observations: [
                    `Topic: ${topic}`,
                    `Evidence count: ${evidences.length}`,
                    `Quality range: ${Math.min(...evidences.map(e => e.quality))} - ${Math.max(...evidences.map(e => e.quality))}`,
                    `Date range: ${evidences[0].createdAt} to ${evidences[evidences.length-1].createdAt}`,
                    `Sources: ${[...new Set(evidences.map(e => e.source))].join(", ")}`
                ]
            });
        }
    }
    
    console.log(`💭 Found ${entities.length} chat evidence clusters from ${data.length} individual evidences`);
    
    // Save chat evidence entities
    const batchFile = path.join(__dirname, "chat-evidence-entities.json");
    fs.writeFileSync(batchFile, JSON.stringify(entities, null, 2));
    
    return entities.length;
}

async function processSymbolData() {
    console.log("🔍 Processing symbol data...");
    
    const symbolsTablePath = path.join(__dirname, "../.rMemory/json/symbols-table.json");
    const symbolsData = JSON.parse(fs.readFileSync(symbolsTablePath, "utf8"));
    
    const entities = [];
    
    // Create entity for overall symbol statistics
    entities.push({
        entityType: "code_analysis",
        name: "HexTrackr Symbol Analysis",
        observations: [
            `Generated: ${symbolsData.generated}`,
            `Total symbols: ${symbolsData.totalSymbols}`,
            `Functions: ${symbolsData.symbolsByType.function?.length || 0}`,
            `Classes: ${symbolsData.symbolsByType.class?.length || 0}`,
            `Variables: ${symbolsData.symbolsByType.variable?.length || 0}`,
            `Files analyzed: ${symbolsData.fileCount || "unknown"}`
        ]
    });
    
    console.log("🔢 Created symbol analysis entity");
    
    // Save symbol entities
    const batchFile = path.join(__dirname, "symbol-entities.json");
    fs.writeFileSync(batchFile, JSON.stringify(entities, null, 2));
    
    return entities.length;
}

async function processTimelineData() {
    console.log("⏰ Processing time-summaries.json...");
    
    const filePath = path.join(__dirname, "../.rMemory/json/time-summaries.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    
    const entities = [];
    
    if (data.summaries && Array.isArray(data.summaries)) {
        data.summaries.forEach((summary, index) => {
            entities.push({
                entityType: "timeline_summary",
                name: `Timeline Summary ${index + 1}`,
                observations: [
                    `Period: ${summary.period || "unknown"}`,
                    `Key events: ${summary.events?.length || 0}`,
                    `Summary: ${summary.description || summary.summary || "No description"}`.slice(0, 200),
                    `Created: ${summary.timestamp || data.generated || "unknown"}`
                ]
            });
        });
    }
    
    console.log(`📅 Found ${entities.length} timeline summaries`);
    
    if (entities.length > 0) {
        const batchFile = path.join(__dirname, "timeline-entities.json");
        fs.writeFileSync(batchFile, JSON.stringify(entities, null, 2));
    }
    
    return entities.length;
}

async function main() {
    console.log("🚀 Starting comprehensive memory restoration for HexTrackr...");
    
    let totalEntities = 0;
    
    try {
        totalEntities += await processCanonicalNotes();
        totalEntities += await processChatEvidence();
        totalEntities += await processSymbolData();
        totalEntities += await processTimelineData();
        
        console.log("\n🎉 Memory restoration preparation complete!");
        console.log(`📊 Total entities prepared: ${totalEntities}`);
        console.log("\n📋 Files created for import:");
        console.log("  - canonical-batch-*.json (canonical notes)");
        console.log("  - chat-evidence-entities.json (chat evidence clusters)");
        console.log("  - symbol-entities.json (code analysis)");
        console.log("  - timeline-entities.json (timeline summaries)");
        
    } catch (error) {
        console.error("❌ Error during memory restoration:", error);
        process.exit(1);
    }
}

main();
