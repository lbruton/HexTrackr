const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs").promises;
const { spawn, exec } = require("child_process");
const util = require("util");
const AIProviderManager = require("./ai-provider-manager");
const { ConversationBridge } = require("./conversation-bridge");
const ConsoleLogMonitor = require("./console-log-monitor");

const execAsync = util.promisify(exec);

class MemoryScribeDashboardServer {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3002; // Changed from 3000 to avoid OpenWebUI conflict
        this.memoryScribeProcess = null;
        this.startTime = Date.now();
        this.aiProvider = new AIProviderManager();
        this.conversationBridge = new ConversationBridge();
        this.consoleMonitor = new ConsoleLogMonitor(__dirname);
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupStaticFiles();
        this.initializeAI();
        this.startConsoleMonitoring();
    }

    async initializeAI() {
        try {
            await this.aiProvider.initializeProviders();
        } catch (error) {
            console.error("AI Provider initialization failed:", error.message);
        }
    }

    async startConsoleMonitoring() {
        try {
            await this.consoleMonitor.startMonitoring();
            console.log("🔍 Real-time console monitoring started");
        } catch (error) {
            console.error("Console monitoring failed to start:", error.message);
        }
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname)));
    }

    setupStaticFiles() {
        // Serve the dashboard HTML file
        this.app.get("/", (req, res) => {
            res.sendFile(path.join(__dirname, "dashboard.html"));
        });
    }

    setupRoutes() {
        // Health check endpoint
        this.app.get("/health", (req, res) => {
            res.json({ 
                status: "healthy", 
                timestamp: new Date().toISOString(),
                uptime: Date.now() - this.startTime,
                service: "memory-scribe-dashboard"
            });
        });

        // System status endpoint
        this.app.get("/api/status", async (req, res) => {
            try {
                const status = await this.getSystemStatus();
                res.json(status);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // System statistics endpoint
        this.app.get("/api/stats", async (req, res) => {
            try {
                const stats = await this.getSystemStats();
                res.json(stats);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Ollama models endpoint
        this.app.get("/api/models", async (req, res) => {
            try {
                const models = await this.getOllamaModels();
                res.json(models);
            } catch (error) {
                res.json({ error: error.message, models: [] });
            }
        });

        // Start Memory Scribe
        this.app.post("/api/start", async (req, res) => {
            try {
                const result = await this.startMemoryScribe();
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: error.message, success: false });
            }
        });

        // Stop Memory Scribe
        this.app.post("/api/stop", async (req, res) => {
            try {
                const result = await this.stopMemoryScribe();
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: error.message, success: false });
            }
        });

        // Analyze context
        this.app.post("/api/analyze", async (req, res) => {
            try {
                const result = await this.analyzeContext();
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: error.message, success: false });
            }
        });

        // Cleanup memory
        this.app.post("/api/cleanup", async (req, res) => {
            try {
                const result = await this.cleanupMemory();
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: error.message, success: false });
            }
        });

        // Console monitoring endpoints
        this.app.get("/api/console/activity", (req, res) => {
            try {
                const summary = this.consoleMonitor.getActivitySummary();
                res.json(summary);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.get("/api/console/recent", (req, res) => {
            try {
                const limit = parseInt(req.query.limit) || 50;
                const activities = this.consoleMonitor.getRecentActivity(limit);
                res.json(activities);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.post("/api/console/start", (req, res) => {
            try {
                this.consoleMonitor.startMonitoring();
                res.json({ success: true, message: "Console monitoring started" });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.post("/api/console/stop", (req, res) => {
            try {
                this.consoleMonitor.stopMonitoring();
                res.json({ success: true, message: "Console monitoring stopped" });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Test Ollama connection
        this.app.post("/api/test-ollama", async (req, res) => {
            try {
                const result = await this.testOllama();
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: error.message, success: false });
            }
        });

        // Save configuration
        this.app.post("/api/config", async (req, res) => {
            try {
                const result = await this.saveConfig(req.body);
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: error.message, success: false });
            }
        });

        // Search endpoint
        this.app.get("/api/search", async (req, res) => {
            try {
                const query = req.query.q;
                const results = await this.performSearch(query);
                res.json(results);
            } catch (error) {
                res.status(500).json({ error: error.message, results: [] });
            }
        });

        // Flag management endpoint
        this.app.post("/api/flag", async (req, res) => {
            try {
                const result = await this.flagItem(req.body);
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: error.message, success: false });
            }
        });

        // AI Provider endpoints
        this.app.get("/api/ai-providers", async (req, res) => {
            try {
                const providers = this.aiProvider.getProviderStatus();
                res.json({ providers });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.post("/api/ai-config", async (req, res) => {
            try {
                await this.aiProvider.updateConfiguration(req.body);
                res.json({ success: true, message: "AI configuration updated" });
            } catch (error) {
                res.status(500).json({ error: error.message, success: false });
            }
        });

        this.app.post("/api/ai-test", async (req, res) => {
            try {
                const { provider, prompt = "Hello! Please respond with a brief greeting." } = req.body;
                const result = await this.aiProvider.generateResponse(prompt, { provider });
                res.json({ success: true, result });
            } catch (error) {
                res.status(500).json({ error: error.message, success: false });
            }
        });

        this.app.post("/api/ai-smart-route", async (req, res) => {
            try {
                const { prompt, requirements = {} } = req.body;
                const result = await this.aiProvider.generateResponse(prompt, requirements);
                res.json({ success: true, result });
            } catch (error) {
                res.status(500).json({ error: error.message, success: false });
            }
        });

        // AI Tag-In System Routes
        this.app.post("/api/tag-in", async (req, res) => {
            try {
                const { provider, request, context } = req.body;
                const result = await this.conversationBridge.tagIn(provider, request, context);
                res.json({ success: true, result });
            } catch (error) {
                res.status(500).json({ error: error.message, success: false });
            }
        });

        this.app.post("/api/hey-gpt", async (req, res) => {
            try {
                const { request } = req.body;
                const result = await this.conversationBridge.heyGPT(request);
                res.json({ success: true, result });
            } catch (error) {
                res.status(500).json({ error: error.message, success: false });
            }
        });

        this.app.post("/api/hey-gemini", async (req, res) => {
            try {
                const { request } = req.body;
                const result = await this.conversationBridge.heyGemini(request);
                res.json({ success: true, result });
            } catch (error) {
                res.status(500).json({ error: error.message, success: false });
            }
        });

        this.app.post("/api/hey-qwen", async (req, res) => {
            try {
                const { request } = req.body;
                const result = await this.conversationBridge.heyQwen(request);
                res.json({ success: true, result });
            } catch (error) {
                res.status(500).json({ error: error.message, success: false });
            }
        });

        this.app.post("/api/hey-ollama", async (req, res) => {
            try {
                const { request, model } = req.body;
                const result = await this.conversationBridge.heyOllama(request, model);
                res.json({ success: true, result });
            } catch (error) {
                res.status(500).json({ error: error.message, success: false });
            }
        });

        this.app.post("/api/consult-team", async (req, res) => {
            try {
                const { request, providers = ["openai", "gemini"] } = req.body;
                const result = await this.conversationBridge.consultTeam(request, providers);
                res.json({ success: true, result });
            } catch (error) {
                res.status(500).json({ error: error.message, success: false });
            }
        });

        this.app.post("/api/solve-problem", async (req, res) => {
            try {
                const { problem } = req.body;
                const result = await this.conversationBridge.solveProblem(problem);
                res.json({ success: true, result });
            } catch (error) {
                res.status(500).json({ error: error.message, success: false });
            }
        });

        this.app.post("/api/debug-assist", async (req, res) => {
            try {
                const { error, context } = req.body;
                const result = await this.conversationBridge.debug(error, context);
                res.json({ success: true, result });
            } catch (error) {
                res.status(500).json({ error: error.message, success: false });
            }
        });
    }

    async getSystemStatus() {
        const isRunning = this.memoryScribeProcess && !this.memoryScribeProcess.killed;
        const uptime = Math.floor((Date.now() - this.startTime) / 1000);
        
        // Check if protection system is active
        const protectionActive = await this.checkFileExists("memory-protector.js");
        
        // Get memory usage (rough estimate)
        const memoryUsage = process.memoryUsage();
        const memoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);

        return {
            scribe: isRunning,
            protection: protectionActive,
            uptime: uptime,
            memory: memoryMB,
            timestamp: new Date().toISOString()
        };
    }

    async getSystemStats() {
        try {
            // Read data files to get statistics
            const [conversations, knowledge, patterns, backups] = await Promise.allSettled([
                this.readJSONFile("conversations.json"),
                this.readJSONFile("memory.json"),
                this.readJSONFile("patterns.json"),
                this.getBackupCount()
            ]);

            return {
                conversations: conversations.status === "fulfilled" ? Object.keys(conversations.value || {}).length : 0,
                knowledge: knowledge.status === "fulfilled" ? Object.keys(knowledge.value || {}).length : 0,
                patterns: patterns.status === "fulfilled" ? Object.keys(patterns.value || {}).length : 0,
                backups: backups.status === "fulfilled" ? backups.value : 0
            };
        } catch (error) {
            return {
                conversations: 0,
                knowledge: 0,
                patterns: 0,
                backups: 0
            };
        }
    }

    async getOllamaModels() {
        try {
            const { stdout } = await execAsync("ollama list");
            const lines = stdout.split("\n").filter(line => line.trim() && !line.startsWith("NAME"));
            
            const models = lines.map(line => {
                const parts = line.split(/\s+/);
                const name = parts[0];
                const sizeStr = parts[1] || "0B";
                
                // Parse size (convert to bytes)
                let size = 0;
                const sizeMatch = sizeStr.match(/(\d+(?:\.\d+)?)\s*(GB|MB|KB|B)/i);
                if (sizeMatch) {
                    const value = parseFloat(sizeMatch[1]);
                    const unit = sizeMatch[2].toUpperCase();
                    
                    switch (unit) {
                        case "GB": size = value * 1024 * 1024 * 1024; break;
                        case "MB": size = value * 1024 * 1024; break;
                        case "KB": size = value * 1024; break;
                        default: size = value; break;
                    }
                }
                
                return { name, size, formatted: sizeStr };
            });

            return { models, total: models.length };
        } catch (error) {
            throw new Error(`Ollama not available: ${error.message}`);
        }
    }

    async startMemoryScribe() {
        if (this.memoryScribeProcess && !this.memoryScribeProcess.killed) {
            return { success: false, message: "Memory Scribe is already running" };
        }

        try {
            // Check if the context lifecycle file exists and is not empty
            const lifecycleExists = await this.checkFileExists("context-lifecycle.js");
            if (!lifecycleExists) {
                // Create a basic lifecycle file
                await this.createContextLifecycle();
            }

            this.memoryScribeProcess = spawn("node", ["bootstrap.js"], {
                cwd: __dirname,
                detached: false,
                stdio: "pipe"
            });

            this.memoryScribeProcess.on("error", (error) => {
                console.error("Memory Scribe error:", error);
            });

            this.memoryScribeProcess.on("exit", (code) => {
                console.log(`Memory Scribe exited with code ${code}`);
                this.memoryScribeProcess = null;
            });

            return { success: true, message: "Memory Scribe started successfully" };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async stopMemoryScribe() {
        if (!this.memoryScribeProcess || this.memoryScribeProcess.killed) {
            return { success: false, message: "Memory Scribe is not running" };
        }

        try {
            this.memoryScribeProcess.kill("SIGTERM");
            
            // Wait a bit for graceful shutdown
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            if (!this.memoryScribeProcess.killed) {
                this.memoryScribeProcess.kill("SIGKILL");
            }

            this.memoryScribeProcess = null;
            return { success: true, message: "Memory Scribe stopped" };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async analyzeContext() {
        try {
            // Run context analysis
            const { stdout } = await execAsync("node dashboard.js", { cwd: __dirname });
            return { success: true, analysis: stdout };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async cleanupMemory() {
        try {
            // Read current data
            const conversations = await this.readJSONFile("conversations.json") || {};
            const memory = await this.readJSONFile("memory.json") || {};
            const patterns = await this.readJSONFile("patterns.json") || {};
            
            // Read configuration
            const config = await this.readJSONFile("lifecycle-config.json") || { retentionDays: 90 };
            
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - config.retentionDays);
            
            let archivedCount = 0;
            
            // Archive old conversations (if not in forever mode)
            if (!config.foreverMode) {
                for (const [id, conv] of Object.entries(conversations)) {
                    const convDate = new Date(conv.timestamp || conv.created_at);
                    if (convDate < cutoffDate) {
                        delete conversations[id];
                        archivedCount++;
                    }
                }
                
                await this.writeJSONFile("conversations.json", conversations);
            }
            
            return { success: true, archived: archivedCount };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async testOllama() {
        try {
            const { stdout } = await execAsync("ollama --version");
            return { success: true, version: stdout.trim() };
        } catch (error) {
            return { success: false, error: "Ollama not available" };
        }
    }

    async saveConfig(config) {
        try {
            const configPath = path.join(__dirname, "lifecycle-config.json");
            await fs.writeFile(configPath, JSON.stringify(config, null, 2));
            return { success: true, message: "Configuration saved" };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async performSearch(query) {
        try {
            if (!query || query.length < 3) {
                return { results: [] };
            }

            const results = [];
            
            // Search conversations
            const conversations = await this.readJSONFile("conversations.json") || {};
            for (const [id, conv] of Object.entries(conversations)) {
                if (JSON.stringify(conv).toLowerCase().includes(query.toLowerCase())) {
                    results.push({
                        id,
                        title: `Conversation ${id}`,
                        snippet: this.extractSnippet(JSON.stringify(conv), query),
                        source: "Conversations",
                        timestamp: conv.timestamp || conv.created_at || "Unknown"
                    });
                }
            }
            
            // Search memory
            const memory = await this.readJSONFile("memory.json") || {};
            for (const [id, item] of Object.entries(memory)) {
                if (JSON.stringify(item).toLowerCase().includes(query.toLowerCase())) {
                    results.push({
                        id,
                        title: `Memory ${id}`,
                        snippet: this.extractSnippet(JSON.stringify(item), query),
                        source: "Knowledge Base",
                        timestamp: item.timestamp || item.created_at || "Unknown"
                    });
                }
            }
            
            return { results: results.slice(0, 20) }; // Limit to 20 results
        } catch (error) {
            return { error: error.message, results: [] };
        }
    }

    async flagItem({ type, id, action, reason }) {
        try {
            const flaggedItems = await this.readJSONFile("flagged-items.json") || {};
            
            const flagKey = `${type}-${id}`;
            flaggedItems[flagKey] = {
                type,
                id,
                action,
                reason: reason || "",
                timestamp: new Date().toISOString()
            };
            
            await this.writeJSONFile("flagged-items.json", flaggedItems);
            return { success: true, message: `Item flagged as ${action}` };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Utility methods
    async checkFileExists(filename) {
        try {
            await fs.access(path.join(__dirname, filename));
            return true;
        } catch {
            return false;
        }
    }

    async readJSONFile(filename) {
        try {
            const content = await fs.readFile(path.join(__dirname, filename), "utf8");
            return JSON.parse(content);
        } catch {
            return null;
        }
    }

    async writeJSONFile(filename, data) {
        await fs.writeFile(path.join(__dirname, filename), JSON.stringify(data, null, 2));
    }

    async getBackupCount() {
        try {
            const backupDir = path.join(__dirname, "backups");
            const files = await fs.readdir(backupDir);
            return files.length;
        } catch {
            return 0;
        }
    }

    extractSnippet(text, query) {
        const index = text.toLowerCase().indexOf(query.toLowerCase());
        if (index === -1) {return text.substring(0, 100) + "...";}
        
        const start = Math.max(0, index - 50);
        const end = Math.min(text.length, index + query.length + 50);
        
        return (start > 0 ? "..." : "") + text.substring(start, end) + (end < text.length ? "..." : "");
    }

    async createContextLifecycle() {
        const lifecycleCode = `const fs = require('fs').promises;
const path = require('path');

class ContextLifecycleManager {
    constructor() {
        this.configPath = path.join(__dirname, 'lifecycle-config.json');
        this.flaggedItemsPath = path.join(__dirname, 'flagged-items.json');
        this.logPath = path.join(__dirname, 'cleanup-log.json');
    }

    async initialize() {
        const defaultConfig = {
            retentionDays: 90,
            foreverMode: true,
            autoCleanup: false,
            lastCleanup: null
        };

        try {
            await fs.access(this.configPath);
        } catch {
            await fs.writeFile(this.configPath, JSON.stringify(defaultConfig, null, 2));
        }

        console.log('Context Lifecycle Manager initialized');
    }

    async getConfig() {
        try {
            const content = await fs.readFile(this.configPath, 'utf8');
            return JSON.parse(content);
        } catch {
            return { retentionDays: 90, foreverMode: true, autoCleanup: false };
        }
    }

    async performCleanup() {
        const config = await this.getConfig();
        
        if (config.foreverMode) {
            console.log('Forever mode enabled - skipping cleanup');
            return { archived: 0, skipped: 'forever mode' };
        }

        console.log('Context cleanup completed - forever mode recommended');
        return { archived: 0, recommendation: 'enable forever mode' };
    }
}

module.exports = ContextLifecycleManager;

if (require.main === module) {
    const manager = new ContextLifecycleManager();
    manager.initialize().then(() => {
        console.log('Context Lifecycle Manager ready');
    });
}`;

        await fs.writeFile(path.join(__dirname, "context-lifecycle.js"), lifecycleCode);
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`🧠 Memory Scribe Dashboard running at http://localhost:${this.port}`);
            console.log("📊 Real-time monitoring and control interface ready");
            console.log("🔄 Auto-refresh enabled for live status updates");
        });
    }
}

// Start the server
const server = new MemoryScribeDashboardServer();
server.start();

module.exports = MemoryScribeDashboardServer;
