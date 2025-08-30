#!/usr/bin/env node

/**
 * Memory Importer for .rMemory System
 * Processes queue files and imports insights to Memento MCP
 */

const fs = require("fs").promises;
const path = require("path");

class MemoryImporter {
    constructor() {
        this.queueDir = path.join(__dirname, "../docs/ops/memory-queue");
        this.processedDir = path.join(this.queueDir, "processed");
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
            } catch (error) {
                // Directory might already exist, ignore
            }
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
