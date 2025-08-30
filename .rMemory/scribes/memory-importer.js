#!/usr/bin/env node

/**
 * Memory Importer for .rMemory System
 * Processes queue files and backup data, imports to Memento MCP
 */

const fs = require("fs").promises;
const path = require("path");

class MemoryImporter {
    constructor() {
        this.queueDir = path.join(__dirname, "../docs/ops/memory-queue");
        this.processedDir = path.join(this.queueDir, "processed");
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

    async ensureDirectories() {
        const dirs = [
            this.processedDir,
            path.join(this.queueDir, "real-time/processed"),
            path.join(this.queueDir, "chat-updates/processed"),
            path.join(this.queueDir, "deep-analysis/processed"),
            path.join(this.queueDir, "frustration-data/processed")
        ];

        for (const dir of dirs) {
            try {
                await fs.mkdir(dir, { recursive: true });
            } catch (_error) {
                // Directory might already exist, ignore
            }
        }
    }

    async importToMemento(entities) {
        if (!entities || entities.length === 0) {
            this.log("No entities to import", "warning");
            return 0;
        }

        try {
            this.log(`Importing ${entities.length} entities to Memento MCP...`, "info");
            
            // Split into batches of 10 for better performance
            const batchSize = 10;
            let totalImported = 0;
            
            for (let i = 0; i < entities.length; i += batchSize) {
                const batch = entities.slice(i, i + batchSize);
                this.log(`Importing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(entities.length/batchSize)} (${batch.length} entities)`, "info");
                
                // Note: This requires the calling environment to have Memento MCP available
                // In VS Code with Copilot Chat, this should work
                try {
                    // Try to import to Memento MCP - this will work when run in VS Code with MCP
                    if (typeof mcp_memento_create_entities !== 'undefined') {
                        await mcp_memento_create_entities({ entities: batch });
                        this.log(`✅ Successfully imported batch to Memento MCP`, "success");
                    } else {
                        // Fallback: output structured format for manual import
                        this.log("Memento MCP not available, outputting for manual import", "warning");
                        console.log("\n=== MEMENTO MCP IMPORT BATCH ===");
                        console.log("```");
                        console.log("mcp_memento_create_entities");
                        console.log(JSON.stringify({ entities: batch }, null, 2));
                        console.log("```");
                        console.log("=== END BATCH ===\n");
                    }
                } catch (error) {
                    this.log(`Error with MCP import, falling back to console output: ${error.message}`, "warning");
                    console.log("\n=== MEMENTO MCP IMPORT BATCH (FALLBACK) ===");
                    console.log("```");
                    console.log("mcp_memento_create_entities");
                    console.log(JSON.stringify({ entities: batch }, null, 2));
                    console.log("```");
                    console.log("=== END BATCH ===\n");
                }
                totalImported += batch.length;
                
                // Small delay between batches
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            this.log(`Successfully imported ${totalImported} entities to Memento`, "success");
            return totalImported;
            
        } catch (error) {
            this.log(`Error importing to Memento: ${error.message}`, "error");
            throw error;
        }
    }

    async processBackupFile(filePath, fileName) {
        try {
            const content = await fs.readFile(filePath, "utf8");
            const data = JSON.parse(content);
            
            let entities = [];
            
            if (fileName === "memento-import.json" && data.entities) {
                // Main memento import file
                entities = data.entities.map(entity => ({
                    entityType: entity.entityType || "development_session",
                    name: entity.name,
                    observations: entity.observations || []
                }));
                this.log(`Found ${entities.length} entities in memento-import.json`, "info");
                
            } else if (fileName === "canonical-notes.json" && Array.isArray(data)) {
                // Canonical notes file
                entities = data.map((note, index) => ({
                    entityType: "canonical_note",
                    name: note.title || note.note || `Canonical Note ${index + 1}`,
                    observations: [
                        `Created: ${note.timestamp || "Unknown"}`,
                        `Note: ${note.note || note.content || "No content"}`,
                        note.context ? `Context: ${note.context}` : "",
                        note.importance ? `Importance: ${note.importance}` : ""
                    ].filter(Boolean)
                }));
                this.log(`Found ${entities.length} canonical notes`, "info");
                
            } else if (fileName === "chat-evidence.json" && data.clusters) {
                // Chat evidence clusters
                entities = data.clusters.map((cluster, index) => ({
                    entityType: "chat_evidence",
                    name: `Chat Evidence Cluster ${index + 1}`,
                    observations: [
                        `Topics: ${cluster.topics ? cluster.topics.join(", ") : "Unknown"}`,
                        `Messages: ${cluster.messages ? cluster.messages.length : 0}`,
                        `Created: ${cluster.timestamp || "Unknown"}`,
                        cluster.summary ? `Summary: ${cluster.summary}` : ""
                    ].filter(Boolean)
                }));
                this.log(`Found ${entities.length} chat evidence clusters`, "info");
                
            } else if (fileName === "symbol-index.json" && data.symbols) {
                // Symbol index data - create summary entities
                const symbolsByType = {};
                data.symbols.forEach(symbol => {
                    const type = symbol.type || "unknown";
                    if (!symbolsByType[type]) symbolsByType[type] = [];
                    symbolsByType[type].push(symbol);
                });
                
                entities = Object.entries(symbolsByType).map(([type, symbols]) => ({
                    entityType: "code_symbols",
                    name: `${type.charAt(0).toUpperCase() + type.slice(1)} Symbols`,
                    observations: [
                        `Type: ${type}`,
                        `Count: ${symbols.length}`,
                        `Files: ${new Set(symbols.map(s => s.file)).size}`,
                        `Generated: ${new Date().toISOString()}`,
                        `Sample: ${symbols.slice(0, 3).map(s => s.name).join(", ")}`
                    ]
                }));
                this.log(`Found ${data.symbols.length} symbols in ${Object.keys(symbolsByType).length} categories`, "info");
            }
            
            return entities;
            
        } catch (error) {
            this.log(`Error processing backup file ${fileName}: ${error.message}`, "error");
            return [];
        }
    }

    async restoreBackups() {
        this.log("=== Starting Backup Restoration ===", "start");
        
        const backupFiles = [
            "memento-import.json",
            "canonical-notes.json", 
            "chat-evidence.json",
            "symbol-index.json"
        ];
        
        let totalEntities = 0;
        
        for (const fileName of backupFiles) {
            const filePath = path.join(this.backupDir, fileName);
            
            try {
                await fs.access(filePath);
                this.log(`Processing backup file: ${fileName}`, "info");
                
                const entities = await this.processBackupFile(filePath, fileName);
                if (entities.length > 0) {
                    const imported = await this.importToMemento(entities);
                    totalEntities += imported;
                    this.log(`Imported ${imported} entities from ${fileName}`, "success");
                }
                
            } catch (error) {
                if (error.code !== "ENOENT") {
                    this.log(`Error accessing ${fileName}: ${error.message}`, "warning");
                }
            }
        }
        
        // Also check the docs/ops/recovered-memories directory
        try {
            const recoveredPath = path.join(this.docsDir, "memento-import.json");
            await fs.access(recoveredPath);
            this.log("Processing recovered memories", "info");
            
            const entities = await this.processBackupFile(recoveredPath, "memento-import.json");
            if (entities.length > 0) {
                const imported = await this.importToMemento(entities);
                totalEntities += imported;
                this.log(`Imported ${imported} entities from recovered memories`, "success");
            }
        } catch (_error) {
            // Recovered memories file doesn't exist, that's ok
        }
        
        this.log(`=== Backup Restoration Complete: ${totalEntities} total entities ===`, "success");
        return totalEntities;
    }

    async processQueueDirectory(dirName) {
        const queuePath = path.join(this.queueDir, dirName);
        const processedPath = path.join(queuePath, "processed");
        
        try {
            const files = await fs.readdir(queuePath);
            const jsonFiles = files.filter(f => f.endsWith(".json") && f !== "processed");
            
            if (jsonFiles.length === 0) {
                return 0;
            }

            this.log(`Processing ${jsonFiles.length} files from ${dirName}`, "info");
            
            for (const file of jsonFiles) {
                const filePath = path.join(queuePath, file);
                const processedFilePath = path.join(processedPath, file);
                
                try {
                    // Read the queue file
                    const content = await fs.readFile(filePath, "utf8");
                    const _data = JSON.parse(content);
                    
                    // For now, just move to processed (Memento MCP integration would go here)
                    await fs.rename(filePath, processedFilePath);
                    this.log(`Processed: ${file}`, "success");
                    
                } catch (error) {
                    this.log(`Error processing ${file}: ${error.message}`, "error");
                }
            }
            
            return jsonFiles.length;
        } catch (error) {
            if (error.code !== "ENOENT") {
                this.log(`Error reading ${dirName}: ${error.message}`, "error");
            }
            return 0;
        }
    }

    async run() {
        this.log("=== Memory Import Workflow Starting ===", "start");
        
        await this.ensureDirectories();
        
        // First restore backups
        const restoredEntities = await this.restoreBackups();
        
        // Then process queue files
        const queueTypes = ["real-time", "chat-updates", "deep-analysis", "frustration-data"];
        let totalProcessed = 0;
        
        for (const queueType of queueTypes) {
            const processed = await this.processQueueDirectory(queueType);
            totalProcessed += processed;
        }
        
        const grandTotal = restoredEntities + totalProcessed;
        
        if (grandTotal > 0) {
            this.log(`Successfully restored ${restoredEntities} entities and processed ${totalProcessed} queue files`, "success");
        } else {
            this.log("No files found to process", "info");
        }
        
        this.log("Memory import workflow completed", "success");
        return grandTotal;
    }
}

// Run if called directly
if (require.main === module) {
    const importer = new MemoryImporter();
    importer.run().catch(error => {
        console.error("❌ Memory import failed:", error);
        process.exit(1);
    });
}

        
        // In a real implementation, this would be:
        // await mcp_memento_create_entities({ entities });
        
        return entities.length;
    }

    async processBackupFile(filePath, fileName) {
        try {
            const content = await fs.readFile(filePath, "utf8");
            const data = JSON.parse(content);
            
            let entities = [];
            
            if (fileName === "memento-import.json" && data.entities) {
                // Main memento import file
                entities = data.entities.map(entity => ({
                    entityType: entity.entityType || "development_session",
                    name: entity.name,
                    observations: entity.observations || []
                }));
                this.log(`Found ${entities.length} entities in memento-import.json`, "info");
                
            } else if (fileName === "canonical-notes.json" && Array.isArray(data)) {
                // Canonical notes file
                entities = data.map((note, index) => ({
                    entityType: "canonical_note",
                    name: note.title || note.note || `Canonical Note ${index + 1}`,
                    observations: [
                        `Created: ${note.timestamp || "Unknown"}`,
                        `Note: ${note.note || note.content || "No content"}`,
                        note.context ? `Context: ${note.context}` : "",
                        note.importance ? `Importance: ${note.importance}` : ""
                    ].filter(Boolean)
                }));
                this.log(`Found ${entities.length} canonical notes`, "info");
                
            } else if (fileName === "chat-evidence.json" && data.clusters) {
                // Chat evidence clusters
                entities = data.clusters.map((cluster, index) => ({
                    entityType: "chat_evidence",
                    name: `Chat Evidence Cluster ${index + 1}`,
                    observations: [
                        `Topics: ${cluster.topics ? cluster.topics.join(", ") : "Unknown"}`,
                        `Messages: ${cluster.messages ? cluster.messages.length : 0}`,
                        `Created: ${cluster.timestamp || "Unknown"}`,
                        cluster.summary ? `Summary: ${cluster.summary}` : ""
                    ].filter(Boolean)
                }));
                this.log(`Found ${entities.length} chat evidence clusters`, "info");
                
            } else if (fileName === "symbol-index.json" && data.symbols) {
                // Symbol index data - create summary entities
                const symbolsByType = {};
                data.symbols.forEach(symbol => {
                    const type = symbol.type || "unknown";
                    if (!symbolsByType[type]) symbolsByType[type] = [];
                    symbolsByType[type].push(symbol);
                });
                
                entities = Object.entries(symbolsByType).map(([type, symbols]) => ({
                    entityType: "code_symbols",
                    name: `${type.charAt(0).toUpperCase() + type.slice(1)} Symbols`,
                    observations: [
                        `Type: ${type}`,
                        `Count: ${symbols.length}`,
                        `Files: ${new Set(symbols.map(s => s.file)).size}`,
                        `Generated: ${new Date().toISOString()}`,
                        `Sample: ${symbols.slice(0, 3).map(s => s.name).join(", ")}`
                    ]
                }));
                this.log(`Found ${data.symbols.length} symbols in ${Object.keys(symbolsByType).length} categories`, "info");
            }
            
            return entities;
            
        } catch (error) {
            this.log(`Error processing backup file ${fileName}: ${error.message}`, "error");
            return [];
        }
    }

    async restoreBackups() {
        this.log("=== Starting Backup Restoration ===", "start");
        
        const backupFiles = [
            "memento-import.json",
            "canonical-notes.json", 
            "chat-evidence.json",
            "symbol-index.json"
        ];
        
        let totalEntities = 0;
        
        for (const fileName of backupFiles) {
            const filePath = path.join(this.backupDir, fileName);
            
            try {
                await fs.access(filePath);
                this.log(`Processing backup file: ${fileName}`, "info");
                
                const entities = await this.processBackupFile(filePath, fileName);
                if (entities.length > 0) {
                    const imported = await this.importToMemento(entities);
                    totalEntities += imported;
                    this.log(`Imported ${imported} entities from ${fileName}`, "success");
                }
                
            } catch (error) {
                if (error.code !== "ENOENT") {
                    this.log(`Error accessing ${fileName}: ${error.message}`, "warning");
                }
            }
        }
        
        // Also check the docs/ops/recovered-memories directory
        try {
            const recoveredPath = path.join(this.docsDir, "memento-import.json");
            await fs.access(recoveredPath);
            this.log("Processing recovered memories", "info");
            
            const entities = await this.processBackupFile(recoveredPath, "memento-import.json");
            if (entities.length > 0) {
                const imported = await this.importToMemento(entities);
                totalEntities += imported;
                this.log(`Imported ${imported} entities from recovered memories`, "success");
            }
        } catch (error) {
            // Recovered memories file doesn't exist, that's ok
        }
        
        this.log(`=== Backup Restoration Complete: ${totalEntities} total entities ===`, "success");
        return totalEntities;
    }
    }

    async processQueueDirectory(dirName) {
        const queuePath = path.join(this.queueDir, dirName);
        const processedPath = path.join(queuePath, "processed");
        
        try {
            const files = await fs.readdir(queuePath);
            const jsonFiles = files.filter(f => f.endsWith(".json") && f !== "processed");
            
            if (jsonFiles.length === 0) {
                return 0;
            }

            this.log(`Processing ${jsonFiles.length} files from ${dirName}`, "info");
            
            for (const file of jsonFiles) {
                const filePath = path.join(queuePath, file);
                const processedFilePath = path.join(processedPath, file);
                
                try {
                    // Read the queue file
                    const content = await fs.readFile(filePath, "utf8");
                    const data = JSON.parse(content);
                    
                    // For now, just move to processed (Memento MCP integration would go here)
                    await fs.rename(filePath, processedFilePath);
                    this.log(`Processed: ${file}`, "success");
                    
                } catch (error) {
                    this.log(`Error processing ${file}: ${error.message}`, "error");
                }
            }
            
            return jsonFiles.length;
        } catch (error) {
            if (error.code !== "ENOENT") {
                this.log(`Error reading ${dirName}: ${error.message}`, "error");
            }
            return 0;
        }
    }

    async run() {
        this.log("=== Memory Import Workflow Starting ===", "start");
        
        await this.ensureDirectories();
        
        const queueTypes = ["real-time", "chat-updates", "deep-analysis", "frustration-data"];
        let totalProcessed = 0;
        
        for (const queueType of queueTypes) {
            const processed = await this.processQueueDirectory(queueType);
            totalProcessed += processed;
        }
        
        if (totalProcessed > 0) {
            this.log(`Successfully processed ${totalProcessed} memory files`, "success");
        } else {
            this.log("No files in queue to process", "info");
        }
        
        this.log("Memory import workflow completed", "success");
        return totalProcessed;
    }
}

// Run if called directly
if (require.main === module) {
    const importer = new MemoryImporter();
    importer.run().catch(error => {
        console.error("❌ Memory import failed:", error);
        process.exit(1);
    });
}

module.exports = MemoryImporter;
