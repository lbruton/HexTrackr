#!/usr/bin/env node

/**
 * HexTrackr Context Lifecycle Manager
 * Adapted from rEngine rMemory for rolling context management
 * Integrates with qwen2.5-coder for local processing
 */

const fs = require("fs").promises;
const path = require("path");

class HexTrackrContextLifecycle {
    constructor() {
        this.dataDir = path.join(__dirname, "..", "data");
        this.configPath = path.join(this.dataDir, "context-config.json");
        this.contextPath = path.join(this.dataDir, "rolling-context.json");
        this.logPath = path.join(this.dataDir, "context-log.jsonl");
    }

    async initialize() {
        const defaultConfig = {
            maxContextTokens: 4000,
            rollingWindowSize: 20,
            retentionDays: 30,
            ollamaModel: "qwen2.5-coder",
            enableContextSummary: true,
            lastCleanup: null
        };

        try {
            await fs.mkdir(this.dataDir, { recursive: true });
            await fs.access(this.configPath);
        } catch {
            await fs.writeFile(this.configPath, JSON.stringify(defaultConfig, null, 2));
        }

        console.log("HexTrackr Context Lifecycle Manager initialized");
    }

    async getConfig() {
        try {
            const content = await fs.readFile(this.configPath, "utf8");
            return JSON.parse(content);
        } catch {
            await this.initialize();
            return this.getConfig();
        }
    }

    async updateConfig(updates) {
        const config = await this.getConfig();
        const newConfig = { ...config, ...updates };
        await fs.writeFile(this.configPath, JSON.stringify(newConfig, null, 2));
        return newConfig;
    }

    async addContextEntry(entry) {
        const timestamp = new Date().toISOString();
        const contextEntry = {
            timestamp,
            id: `ctx_${Date.now()}`,
            content: entry.content || entry,
            type: entry.type || "chat",
            metadata: entry.metadata || {}
        };

        // Append to log
        const logLine = JSON.stringify(contextEntry) + "\n";
        await fs.appendFile(this.logPath, logLine);

        // Update rolling context
        await this.updateRollingContext(contextEntry);

        return contextEntry;
    }

    async updateRollingContext(newEntry) {
        const config = await this.getConfig();
        let rollingContext = [];

        try {
            const content = await fs.readFile(this.contextPath, "utf8");
            rollingContext = JSON.parse(content);
        } catch {
            // File doesn't exist yet, start fresh
        }

        rollingContext.push(newEntry);

        // Maintain rolling window size
        if (rollingContext.length > config.rollingWindowSize) {
            rollingContext = rollingContext.slice(-config.rollingWindowSize);
        }

        await fs.writeFile(this.contextPath, JSON.stringify(rollingContext, null, 2));
        return rollingContext;
    }

    async getRollingContext() {
        try {
            const content = await fs.readFile(this.contextPath, "utf8");
            return JSON.parse(content);
        } catch {
            return [];
        }
    }

    async summarizeContext(entries) {
        // This would integrate with qwen2.5-coder via Ollama for context summarization
        const config = await this.getConfig();
        
        if (!config.enableContextSummary) {
            return entries;
        }

        // Placeholder for Ollama integration - would call ollama-detector.js
        console.log(`Context summarization with ${config.ollamaModel} - ${entries.length} entries`);
        
        return {
            summary: "Context summary placeholder",
            originalCount: entries.length,
            model: config.ollamaModel,
            timestamp: new Date().toISOString()
        };
    }

    async performMaintenance() {
        const config = await this.getConfig();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - config.retentionDays);

        let cleanedCount = 0;
        
        try {
            const logContent = await fs.readFile(this.logPath, "utf8");
            const lines = logContent.split("\n").filter(line => line.trim());
            
            const recentLines = lines.filter(line => {
                try {
                    const entry = JSON.parse(line);
                    return new Date(entry.timestamp) > cutoffDate;
                } catch {
                    return false;
                }
            });

            cleanedCount = lines.length - recentLines.length;
            
            if (cleanedCount > 0) {
                await fs.writeFile(this.logPath, recentLines.join("\n") + "\n");
            }
        } catch (error) {
            console.warn("Maintenance error:", error.message);
        }

        await this.updateConfig({ lastCleanup: new Date().toISOString() });
        
        return {
            cleaned: cleanedCount,
            retention: `${config.retentionDays} days`,
            nextMaintenance: "automatic with VS Code chat integration"
        };
    }
}

module.exports = HexTrackrContextLifecycle;

// CLI interface for testing
if (require.main === module) {
    (async () => {
        const manager = new HexTrackrContextLifecycle();
        await manager.initialize();
        
        const command = process.argv[2];
        
        switch (command) {
            case "add":
                const content = process.argv[3] || "Test context entry";
                const entry = await manager.addContextEntry({ content, type: "test" });
                console.log("Added entry:", entry.id);
                break;
                
            case "context":
                const context = await manager.getRollingContext();
                console.log("Rolling context:", context.length, "entries");
                console.log(JSON.stringify(context, null, 2));
                break;
                
            case "maintain":
                const result = await manager.performMaintenance();
                console.log("Maintenance result:", result);
                break;
                
            default:
                console.log("Usage: node context-lifecycle.js [add|context|maintain] [content]");
        }
    })().catch(console.error);
}
