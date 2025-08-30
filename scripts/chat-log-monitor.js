#!/usr/bin/env node

/**
 * Chat Log Monitor
 * 
 * Monitors VS Code chat sessions for new conversations
 * Automatically processes new content with Ollama and feeds to Memento
 * Provides real-time memory augmentation
 */

const fs = require("fs").promises;
const path = require("path");
const { EventEmitter } = require("events");
const { spawn } = require("child_process");

class ChatLogMonitor extends EventEmitter {
    constructor() {
        super();
        this.ollamaModel = "qwen2.5-coder";
        this.chatSessionsPath = path.join(
            process.env.HOME,
            "Library/Application Support/Code/User/workspaceStorage"
        );
        this.memoryQueuePath = path.join(__dirname, "../docs/ops/memory-queue");
        this.isMonitoring = false;
        this.watchedSessions = new Map();
        this.processInterval = 5000; // Check every 5 seconds
    }

    /**
     * Start monitoring chat sessions
     */
    async startMonitoring() {
        if (this.isMonitoring) {
            console.log("📡 Already monitoring...");
            return;
        }

        console.log("🚀 Starting chat log monitoring...");
        
        try {
            await this.ensureMemoryQueue();
            await this.discoverChatSessions();
            
            this.isMonitoring = true;
            this.monitorLoop();
            
            console.log("✅ Chat monitoring active");
            console.log(`📁 Watching ${this.watchedSessions.size} sessions`);
            
        } catch (error) {
            console.error("❌ Failed to start monitoring:", error.message);
            throw error;
        }
    }

    /**
     * Stop monitoring
     */
    stopMonitoring() {
        this.isMonitoring = false;
        console.log("🛑 Chat monitoring stopped");
    }

    /**
     * Main monitoring loop
     */
    async monitorLoop() {
        while (this.isMonitoring) {
            try {
                await this.checkForUpdates();
                await this.sleep(this.processInterval);
            } catch (error) {
                console.error("⚠️ Monitor error:", error.message);
                await this.sleep(this.processInterval * 2); // Longer wait on error
            }
        }
    }

    /**
     * Discover existing chat sessions to monitor
     */
    async discoverChatSessions() {
        const workspaces = await fs.readdir(this.chatSessionsPath);

        for (const workspace of workspaces) {
            const chatPath = path.join(this.chatSessionsPath, workspace, "chatSessions");
            
            try {
                const stats = await fs.stat(chatPath);
                if (!stats.isDirectory()) {continue;}

                const files = await fs.readdir(chatPath);
                const jsonFiles = files.filter(f => f.endsWith(".json"));

                for (const file of jsonFiles) {
                    const filePath = path.join(chatPath, file);
                    const fileStats = await fs.stat(filePath);
                    
                    this.watchedSessions.set(filePath, {
                        workspace,
                        file,
                        lastModified: fileStats.mtime,
                        lastSize: fileStats.size,
                        processed: false
                    });
                }
                
            } catch (error) {
                // Skip if chatSessions doesn't exist
                continue;
            }
        }
    }

    /**
     * Check for updates in watched sessions
     */
    async checkForUpdates() {
        const updates = [];

        for (const [filePath, session] of this.watchedSessions) {
            try {
                const stats = await fs.stat(filePath);
                
                // Check if file was modified or grew in size
                if (stats.mtime > session.lastModified || stats.size > session.lastSize) {
                    updates.push({
                        path: filePath,
                        session,
                        newModified: stats.mtime,
                        newSize: stats.size
                    });
                }
                
            } catch (error) {
                // File might have been deleted
                this.watchedSessions.delete(filePath);
            }
        }

        // Process updates
        for (const update of updates) {
            await this.processSessionUpdate(update);
        }

        // Discover new sessions
        if (updates.length > 0) {
            await this.discoverNewSessions();
        }
    }

    /**
     * Process an updated chat session
     */
    async processSessionUpdate(update) {
        try {
            console.log(`📝 Processing update: ${update.session.file}`);
            
            const newContent = await this.extractNewContent(update);
            if (!newContent || newContent.length < 50) {
                // Update tracking info but skip processing
                this.updateSessionTracking(update);
                return;
            }

            // Extract insights from new content
            const insights = await this.extractRealTimeInsights(newContent, update.session);
            
            if (insights && Object.keys(insights).length > 0) {
                await this.queueForMemento(insights, update.session);
                console.log(`✅ Queued insights from ${update.session.file}`);
            }

            // Update tracking
            this.updateSessionTracking(update);
            
        } catch (error) {
            console.error(`Failed to process ${update.session.file}:`, error.message);
        }
    }

    /**
     * Extract new content since last processing
     */
    async extractNewContent(update) {
        try {
            const content = await fs.readFile(update.path, "utf8");
            const data = JSON.parse(content);
            
            if (!data.requests || !Array.isArray(data.requests)) {
                return null;
            }

            // Get last few messages (new activity)
            const recentMessages = data.requests.slice(-10);
            
            return recentMessages
                .filter(msg => msg.message && msg.message.length > 10)
                .map(msg => {
                    const role = msg.variableName === "request" ? "USER" : "ASSISTANT";
                    return `${role}: ${msg.message}`;
                })
                .join("\n\n");
                
        } catch (error) {
            console.warn(`Failed to extract content from ${update.path}:`, error.message);
            return null;
        }
    }

    /**
     * Extract real-time insights from new content
     */
    async extractRealTimeInsights(content, session) {
        try {
            const prompt = `Analyze this recent VS Code chat activity and extract key insights:

RECENT ACTIVITY:
${content}

Extract ONLY significant information as JSON:
{
  "quick_decisions": ["immediate decisions made"],
  "problems_identified": ["new problems discovered"],
  "solutions_applied": ["solutions implemented"],
  "context_changes": ["project state changes"],
  "entities_mentioned": ["important project entities"],
  "action_items": ["next steps or todos"]
}

Focus on actionable, concrete information. Ignore routine responses.`;

            const analysis = await this.queryOllama(prompt);
            return this.parseInsightResponse(analysis);
            
        } catch (error) {
            console.warn("Failed to extract real-time insights:", error.message);
            return null;
        }
    }

    /**
     * Queue insights for Memento processing
     */
    async queueForMemento(insights, session) {
        const queueItem = {
            type: "chat_monitor_update",
            timestamp: new Date().toISOString(),
            session_id: session.file.replace(".json", ""),
            workspace: session.workspace,
            insights,
            priority: this.calculatePriority(insights)
        };

        const queueFile = path.join(this.memoryQueuePath, `queue-${Date.now()}.json`);
        await fs.writeFile(queueFile, JSON.stringify(queueItem, null, 2));
    }

    /**
     * Calculate priority for memory queue processing
     */
    calculatePriority(insights) {
        let priority = "low";
        
        if (insights.quick_decisions?.length > 0 || insights.solutions_applied?.length > 0) {
            priority = "high";
        } else if (insights.problems_identified?.length > 0 || insights.context_changes?.length > 0) {
            priority = "medium";
        }
        
        return priority;
    }

    /**
     * Update session tracking information
     */
    updateSessionTracking(update) {
        const session = this.watchedSessions.get(update.path);
        if (session) {
            session.lastModified = update.newModified;
            session.lastSize = update.newSize;
            session.processed = true;
        }
    }

    /**
     * Discover new chat sessions
     */
    async discoverNewSessions() {
        const currentSessions = new Set(this.watchedSessions.keys());
        await this.discoverChatSessions();
        
        const newSessions = [];
        for (const path of this.watchedSessions.keys()) {
            if (!currentSessions.has(path)) {
                newSessions.push(path);
            }
        }

        if (newSessions.length > 0) {
            console.log(`🆕 Discovered ${newSessions.length} new chat sessions`);
        }
    }

    /**
     * Query Ollama (shared with archaeology tool)
     */
    async queryOllama(prompt) {
        return new Promise((resolve, reject) => {
            let output = "";
            let errorOutput = "";

            const ollama = spawn("ollama", ["run", this.ollamaModel], {
                stdio: ["pipe", "pipe", "pipe"]
            });

            ollama.stdout.on("data", (data) => {
                output += data.toString();
            });

            ollama.stderr.on("data", (data) => {
                errorOutput += data.toString();
            });

            ollama.on("close", (code) => {
                if (code === 0) {
                    resolve(output.trim());
                } else {
                    reject(new Error(`Ollama failed (${code}): ${errorOutput}`));
                }
            });

            ollama.on("error", (error) => {
                reject(new Error(`Failed to start Ollama: ${error.message}`));
            });

            ollama.stdin.write(prompt + "\n");
            ollama.stdin.end();

            // Timeout after 15 seconds for real-time processing
            setTimeout(() => {
                ollama.kill();
                reject(new Error("Ollama query timeout"));
            }, 15000);
        });
    }

    /**
     * Parse Ollama response
     */
    parseInsightResponse(response) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Ensure memory queue directory exists
     */
    async ensureMemoryQueue() {
        try {
            await fs.mkdir(this.memoryQueuePath, { recursive: true });
        } catch (error) {
            if (error.code !== "EEXIST") {throw error;}
        }
    }

    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// CLI interface
if (require.main === module) {
    const monitor = new ChatLogMonitor();
    
    // Handle graceful shutdown
    process.on("SIGINT", () => {
        console.log("\n🛑 Shutting down chat monitor...");
        monitor.stopMonitoring();
        process.exit(0);
    });

    monitor.startMonitoring()
        .then(() => {
            console.log("📡 Chat monitor running. Press Ctrl+C to stop.");
        })
        .catch(error => {
            console.error("💥 Monitor failed:", error);
            process.exit(1);
        });
}

module.exports = { ChatLogMonitor };
