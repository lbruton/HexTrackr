#!/usr/bin/env node
/* eslint-env node */
/* global require, module, __dirname, console, process, setTimeout, Buffer */

/**
 * Real-time Analysis Scribe
 * 
 * Fast, continuous analysis of development activities using Ollama
 * Provides real-time insights and context while maintaining low latency
 * Part of HexTrackr .rMemory scribes system for live memory processing
 */

const fs = require("fs").promises;
const path = require("path");
const http = require("http");

class RealTimeAnalysisScribe {
    constructor() {
        this.ollamaHost = "localhost";
        this.ollamaPort = 11434;
        this.model = "qwen2.5-coder:7b"; // Code-specialized model for development analysis
        this.chatSessionsPath = path.join(
            process.env.HOME,
            "Library/Application Support/Code/User/workspaceStorage"
        );
        this.outputPath = path.join(__dirname, "../docs/ops/live-insights");
        this.batchSize = 5; // Larger batches for efficiency
        this.pollInterval = 30000; // 30 seconds for real-time monitoring
    }

    /**
     * Clean console logging with timestamps
     */
    log(message, type = "info") {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = {
            info: "📊",
            success: "✅", 
            warning: "⚠️",
            error: "❌",
            start: "🚀"
        }[type] || "📊";
        
        console.log(`[${timestamp}] ${prefix} ${message}`);
    }

    /**
     * Check if Ollama is running and accessible
     */
    async checkOllamaStatus() {
        return new Promise((resolve) => {
            const req = http.get(`http://${this.ollamaHost}:${this.ollamaPort}/api/version`, {
                timeout: 3000
            }, (res) => {
                let data = "";
                res.on("data", chunk => data += chunk);
                res.on("end", () => {
                    try {
                        const version = JSON.parse(data);
                        resolve({ 
                            status: "running", 
                            version: version.version,
                            available: true 
                        });
                    } catch {
                        resolve({ status: "error", available: false });
                    }
                });
            });
            
            req.on("error", () => {
                resolve({ status: "not-running", available: false });
            });
            
            req.on("timeout", () => {
                req.destroy();
                resolve({ status: "timeout", available: false });
            });
        });
    }

    /**
     * Get available Ollama models
     */
    async getAvailableModels() {
        return new Promise((resolve) => {
            const req = http.get(`http://${this.ollamaHost}:${this.ollamaPort}/api/tags`, {
                timeout: 5000
            }, (res) => {
                let data = "";
                res.on("data", chunk => data += chunk);
                res.on("end", () => {
                    try {
                        const result = JSON.parse(data);
                        resolve(result.models || []);
                    } catch {
                        resolve([]);
                    }
                });
            });
            
            req.on("error", () => resolve([]));
            req.on("timeout", () => {
                req.destroy();
                resolve([]);
            });
        });
    }

    /**
     * Send prompt to Ollama
     */
    async sendToOllama(prompt) {
        return new Promise((resolve, reject) => {
            const postData = JSON.stringify({
                model: this.model,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.3, // Lower temperature for more focused responses
                    top_p: 0.9,
                    num_predict: 512 // Shorter responses for real-time
                }
            });

            const req = http.request({
                hostname: this.ollamaHost,
                port: this.ollamaPort,
                path: "/api/generate",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(postData)
                },
                timeout: 30000
            }, (res) => {
                let data = "";
                res.on("data", chunk => data += chunk);
                res.on("end", () => {
                    try {
                        const result = JSON.parse(data);
                        resolve(result.response);
                    } catch (error) {
                        reject(new Error(`Failed to parse Ollama response: ${error.message}`));
                    }
                });
            });

            req.on("error", reject);
            req.on("timeout", () => {
                req.destroy();
                reject(new Error("Request to Ollama timed out"));
            });

            req.write(postData);
            req.end();
        });
    }

    /**
     * Monitor for real-time analysis
     */
    async startMonitoring() {
        console.log("⚡ Starting Real-time Analysis with Ollama...");
        console.log("📡 Mode: Continuous live monitoring");
        
        // Check Ollama availability
        const status = await this.checkOllamaStatus();
        if (!status.available) {
            throw new Error(`Ollama not available: ${status.status}`);
        }
        console.log(`✅ Ollama running (v${status.version})`);

        // Check if model is available
        const models = await this.getAvailableModels();
        const modelAvailable = models.some(m => m.name.includes(this.model));
        if (!modelAvailable) {
            console.log(`⚠️  Model ${this.model} not found. Available models:`, models.map(m => m.name));
            // Try to use the first available model
            if (models.length > 0) {
                this.model = models[0].name;
                console.log(`🔄 Switching to ${this.model}`);
            } else {
                throw new Error("No Ollama models available");
            }
        }

        await this.ensureOutputDirectory();
        
        console.log(`🔄 Starting monitoring loop (${this.pollInterval/1000}s intervals)...`);
        
        // Continuous monitoring loop
        const running = true;
        while (running) {
            try {
                await this.analyzeRecentActivity();
                await this.sleep(this.pollInterval);
            } catch (error) {
                console.error("❌ Analysis cycle failed:", error.message);
                // Continue monitoring despite errors
                await this.sleep(5000); // Short delay before retry
            }
        }
    }

    /**
     * Analyze recent development activity
     */
    async analyzeRecentActivity() {
        const timestamp = new Date().toISOString();
        this.log(`🔍 Analyzing activity at ${timestamp}`);
        
        try {
            // Debug: Show what we're looking for
            this.log(`🔍 Checking chat sessions in: ${this.chatSessionsPath}`);
            
            // Find recent chat sessions (last 1 hour)
            const recentSessions = await this.findRecentChatSessions(3600000); // 1 hour
            
            if (recentSessions.length === 0) {
                this.log("😴 No recent activity detected");
                // Debug: Show what directories exist
                try {
                    const dirs = await fs.readdir(this.chatSessionsPath);
                    this.log(`📁 Found ${dirs.length} workspace directories`);
                    if (dirs.length > 0) {
                        this.log(`📁 Sample directories: ${dirs.slice(0, 3).join(", ")}`);
                    }
                } catch (error) {
                    this.log(`❌ Cannot access chat sessions path: ${error.message}`);
                }
                return;
            }
            
            this.log(`📊 Found ${recentSessions.length} recent sessions`);
            
            // Quick analysis of recent content
            const insights = await this.analyzeSessionsQuickly(recentSessions);
            
            // Save real-time insights
            await this.saveRealTimeInsights(insights, timestamp);
            
            this.log("✅ Real-time analysis complete");
            
        } catch (error) {
            this.log(`💥 Real-time analysis failed: ${error.message}`, "error");
        }
    }

    /**
     * Find chat sessions modified in the last N milliseconds
     */
    async findRecentChatSessions(timeWindowMs = 3600000) {
        const sessions = [];
        const cutoffTime = Date.now() - timeWindowMs;
        
        try {
            const workspaceStorageDirs = await fs.readdir(this.chatSessionsPath);
            
            for (const workspaceDir of workspaceStorageDirs) {
                const chatHistoryPath = path.join(
                    this.chatSessionsPath,
                    workspaceDir,
                    "ms-vscode.vscode-copilot-chat",
                    "chatHistory"
                );
                
                try {
                    const stats = await fs.stat(chatHistoryPath);
                    if (stats.mtime.getTime() > cutoffTime) {
                        const content = await fs.readFile(chatHistoryPath, "utf8");
                        if (content.trim()) {
                            sessions.push({
                                path: chatHistoryPath,
                                content: content,
                                mtime: stats.mtime
                            });
                        }
                    }
                } catch {
                    // Skip if chat history doesn't exist or can't be read
                }
            }
        } catch (error) {
            console.error("Error finding recent sessions:", error.message);
        }
        
        return sessions.sort((a, b) => b.mtime - a.mtime);
    }

    /**
     * Quick analysis using Ollama for real-time processing
     */
    async analyzeSessionsQuickly(sessions) {
        const recentContent = sessions
            .slice(0, 3) // Only analyze most recent 3 sessions
            .map(session => session.content)
            .join("\n---\n");
        
        const prompt = `Analyze this recent VS Code chat session for key development insights:

${recentContent}

Provide a brief analysis focused on:
1. Current development focus/task
2. Technical decisions being made
3. Problems being solved
4. Next likely steps

Keep response concise and actionable (max 200 words).`;

        try {
            const analysis = await this.sendToOllama(prompt);
            
            return {
                timestamp: new Date().toISOString(),
                sessionsAnalyzed: sessions.length,
                model: this.model,
                insights: analysis,
                context: "real-time-monitoring"
            };
        } catch (error) {
            console.error("Ollama analysis failed:", error.message);
            return {
                timestamp: new Date().toISOString(),
                sessionsAnalyzed: sessions.length,
                error: error.message,
                context: "real-time-monitoring"
            };
        }
    }

    /**
     * Save real-time insights to output directory
     */
    async saveRealTimeInsights(insights, timestamp) {
        const filename = `live-insights-${timestamp.split("T")[0]}.jsonl`;
        const filepath = path.join(this.outputPath, filename);
        
        const logEntry = JSON.stringify(insights) + "\n";
        
        try {
            await fs.appendFile(filepath, logEntry);
            console.log(`💾 Insights saved to ${filename}`);
        } catch (error) {
            console.error("Failed to save insights:", error.message);
        }
    }

    /**
     * Ensure output directory exists
     */
    async ensureOutputDirectory() {
        try {
            await fs.mkdir(this.outputPath, { recursive: true });
        } catch (error) {
            console.error("Failed to create output directory:", error.message);
        }
    }

    /**
     * Sleep utility for monitoring loop
     */
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Single analysis run (non-monitoring mode)
     */
    async analyze() {
        console.log("⚡ Starting Real-time Analysis (single run)...");
        
        const status = await this.checkOllamaStatus();
        if (!status.available) {
            throw new Error(`Ollama not available: ${status.status}`);
        }
        
        await this.ensureOutputDirectory();
        await this.analyzeRecentActivity();
        
        console.log("🎉 Real-time analysis complete!");
    }
}

// CLI interface
if (require.main === module) {
    const scribe = new RealTimeAnalysisScribe();
    
    // Check for monitoring flag
    const isMonitoring = process.argv.includes("--monitor") || process.argv.includes("-m");
    
    const operation = isMonitoring ? scribe.startMonitoring() : scribe.analyze();
    
    operation
        .then(() => {
            if (!isMonitoring) {
                console.log("🎉 Real-time analysis complete!");
                process.exit(0);
            }
        })
        .catch(error => {
            console.error("💥 Real-time analysis failed:", error);
            process.exit(1);
        });
}

module.exports = { RealTimeAnalysisScribe };
