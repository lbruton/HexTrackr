#!/usr/bin/env node
/* eslint-env node */
/**
 * Real-time VS Code Chat Scribe
 * Monitors VS Code GitHub Copilot chat databases and extracts conversations in real-time
 * Outputs structured data for the Semantic Orchestrator to process
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawn } = require("child_process");

class RealTimeChatScribe {
    constructor() {
        this.homeDir = os.homedir();
        this.vscodeStoragePath = path.join(
            this.homeDir,
            "Library/Application Support/Code/User/workspaceStorage"
        );
        this.outputDir = path.join(__dirname, "../json");
        this.outputFile = path.join(this.outputDir, "realtime-chat-data.json");
        this.lastProcessedTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
        
        this.ensureOutputDir();
        console.log("🎯 Real-time Chat Scribe initialized");
    }

    ensureOutputDir() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    async findCopilotChatDatabases() {
        const databases = [];
        
        try {
            const workspaceStorages = await fs.promises.readdir(this.vscodeStoragePath);
            
            for (const workspaceId of workspaceStorages) {
                const copilotChatDir = path.join(
                    this.vscodeStoragePath,
                    workspaceId,
                    "GitHub.copilot-chat"
                );
                
                if (fs.existsSync(copilotChatDir)) {
                    const dbPath = path.join(copilotChatDir, "workspace-chunks.db");
                    if (fs.existsSync(dbPath)) {
                        const stats = await fs.promises.stat(dbPath);
                        databases.push({
                            workspaceId,
                            dbPath,
                            lastModified: stats.mtime.getTime(),
                            size: stats.size
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Error finding chat databases:", error.message);
        }
        
        // Sort by most recently modified
        return databases.sort((a, b) => b.lastModified - a.lastModified);
    }

    async extractRecentChats() {
        console.log("📡 Checking for new chat activity...");
        
        const databases = await this.findCopilotChatDatabases();
        const newChats = [];
        
        for (const db of databases) {
            if (db.lastModified > this.lastProcessedTime) {
                console.log(`📝 Processing ${db.workspaceId} (${Math.round(db.size/1024/1024)}MB, modified ${new Date(db.lastModified).toLocaleString()})`);
                
                try {
                    // Use Qwen to process the database
                    const chats = await this.processWithQwen(db);
                    if (chats && chats.length > 0) {
                        newChats.push(...chats);
                    }
                } catch (error) {
                    console.error(`Error processing ${db.workspaceId}:`, error.message);
                }
            }
        }
        
        if (newChats.length > 0) {
            await this.saveChats(newChats);
            this.lastProcessedTime = Date.now();
        }
        
        return newChats;
    }

    async processWithQwen(dbInfo) {
        return new Promise((resolve, reject) => {
            // Create a simplified chat extraction for now
            // TODO: Implement proper SQLite reading when database isn't locked
            const mockChat = {
                workspaceId: dbInfo.workspaceId,
                timestamp: Date.now(),
                extractedAt: new Date().toISOString(),
                dbPath: dbInfo.dbPath,
                dbSize: dbInfo.size,
                lastModified: dbInfo.lastModified,
                status: "database_locked_awaiting_proper_extraction",
                placeholder: true
            };
            
            console.log(`🤖 Qwen processing placeholder for ${dbInfo.workspaceId}`);
            resolve([mockChat]);
        });
    }

    async saveChats(chats) {
        try {
            let existingData = [];
            if (fs.existsSync(this.outputFile)) {
                const content = await fs.promises.readFile(this.outputFile, "utf8");
                existingData = JSON.parse(content);
            }
            
            existingData.push(...chats);
            
            await fs.promises.writeFile(
                this.outputFile,
                JSON.stringify(existingData, null, 2)
            );
            
            console.log(`💾 Saved ${chats.length} new chat entries to ${this.outputFile}`);
        } catch (error) {
            console.error("Error saving chats:", error);
        }
    }

    async startMonitoring() {
        console.log("🔄 Starting real-time chat monitoring...");
        
        // Initial extraction
        await this.extractRecentChats();
        
        // Monitor every 30 seconds
        setInterval(async () => {
            try {
                await this.extractRecentChats();
            } catch (error) {
                console.error("Monitoring error:", error);
            }
        }, 30000);
    }
}

// CLI interface
if (require.main === module) {
    const scribe = new RealTimeChatScribe();
    scribe.startMonitoring().catch(console.error);
}

module.exports = RealTimeChatScribe;
