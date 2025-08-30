#!/usr/bin/env node

/**
 * Memory Restoration Script for HexTrackr
 * Restores all backup data from .rMemory to Memento MCP
 */

const fs = require("fs");
const path = require("path");

class MemoryRestorer {
    constructor() {
        this.backupDir = path.join(__dirname, "../json");
        this.docsDir = path.join(__dirname, "../docs/ops/recovered-memories");
    }

    log(message, type = "info") {
        const timestamp = new Date().toLocaleTimeString();
        const icons = {
            info: "📊",
            success: "✅", 
            warning: "⚠️",
            error: "❌",
            start: "🚀"
        };
        console.log(`[${timestamp}] ${icons[type] || "📊"} ${message}`);
    }

    async restoreFromFile(filePath, fileName) {
        this.log(`Processing ${fileName}...`, "info");
        
        try {
            const content = fs.readFileSync(filePath, "utf8");
            const data = JSON.parse(content);
            
            let entities = [];
            
            if (fileName === "memento-import.json" && data.entities) {
                // Main memento import file (54 entities)
                entities = data.entities.map(entity => ({
                    entityType: entity.entityType || "development_session",
                    name: entity.name,
                    observations: entity.observations || []
                }));
                
            } else if (fileName === "canonical-notes.json") {
                // Convert object keys to entities
                if (typeof data === "object" && !Array.isArray(data)) {
                    entities = Object.entries(data).map(([key, note]) => ({
                        entityType: "canonical_note",
                        name: note.title || key,
                        observations: [
                            `Topic: ${key}`,
                            `Created: ${note.timestamp || "Unknown"}`,
                            `Note: ${note.note || note.content || "No content"}`,
                            note.context ? `Context: ${note.context}` : "",
                            note.importance ? `Importance: ${note.importance}` : ""
                        ].filter(Boolean)
                    }));
                }
                
            } else if (fileName === "chat-evidence.json") {
                // Convert clusters or evidence data
                if (data.clusters && Array.isArray(data.clusters)) {
                    entities = data.clusters.map((cluster, index) => ({
                        entityType: "chat_evidence",
                        name: `Chat Evidence Cluster ${index + 1}`,
                        observations: [
                            `Topics: ${cluster.topics ? cluster.topics.join(", ") : "Unknown"}`,
                            `Messages: ${cluster.messages ? cluster.messages.length : 0}`,
                            `Summary: ${cluster.summary || "No summary"}`,
                            `Created: ${cluster.timestamp || "Unknown"}`
                        ].filter(Boolean)
                    }));
                }
                
            } else if (fileName.includes("symbol")) {
                // Skip symbols for now due to size - will handle separately
                this.log(`Skipping ${fileName} - symbols require special handling`, "warning");
                return [];
            }
            
            this.log(`Found ${entities.length} entities in ${fileName}`, "success");
            return entities;
            
        } catch (error) {
            this.log(`Error processing ${fileName}: ${error.message}`, "error");
            return [];
        }
    }

    async run() {
        this.log("=== Starting Memory Restoration ===", "start");
        
        const backupFiles = [
            "memento-import.json",
            "canonical-notes.json", 
            "chat-evidence.json"
        ];
        
        const allEntities = [];
        
        // Process main backup files
        for (const fileName of backupFiles) {
            const filePath = path.join(this.backupDir, fileName);
            if (fs.existsSync(filePath)) {
                const entities = await this.restoreFromFile(filePath, fileName);
                allEntities.push(...entities);
            } else {
                this.log(`File not found: ${fileName}`, "warning");
            }
        }
        
        // Process recovered memories
        const recoveredPath = path.join(this.docsDir, "memento-import.json");
        if (fs.existsSync(recoveredPath)) {
            const entities = await this.restoreFromFile(recoveredPath, "recovered-memento-import.json");
            allEntities.push(...entities);
        }
        
        this.log(`Total entities to restore: ${allEntities.length}`, "success");
        
        // Output in batches for manual import
        const batchSize = 10;
        for (let i = 0; i < allEntities.length; i += batchSize) {
            const batch = allEntities.slice(i, i + batchSize);
            const batchNum = Math.floor(i / batchSize) + 1;
            
            console.log(`\n=== IMPORT BATCH ${batchNum} ===`);
            console.log(JSON.stringify(batch, null, 2));
            console.log(`=== END BATCH ${batchNum} ===\n`);
        }
        
        this.log(`=== Memory Restoration Complete: ${allEntities.length} entities ready ===`, "success");
        return allEntities.length;
    }
}

const restorer = new MemoryRestorer();
restorer.run().catch(console.error);
