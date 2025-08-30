#!/usr/bin/env node

/**
 * 🔍 Live Qwen Code Response Viewer
 * Monitors and displays Qwen Code analysis responses in real-time
 */

const fs = require("fs");
const path = require("path");

class QwenResponseViewer {
    constructor() {
        this.insightsDir = ".rMemory/docs/ops/live-insights";
        this.monitoredFiles = new Set();
        this.lastCheck = Date.now();
        
        // Ensure directory exists
        if (!fs.existsSync(this.insightsDir)) {
            fs.mkdirSync(this.insightsDir, { recursive: true });
        }
    }

    /**
     * Format timestamp for display
     */
    formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString();
    }

    /**
     * Display a Qwen response beautifully
     */
    displayResponse(insight) {
        console.log("\n" + "=".repeat(80));
        console.log(`🤖 QWEN CODE ANALYSIS - ${this.formatTime(insight.timestamp)}`);
        console.log("=".repeat(80));
        
        if (insight.insights) {
            console.log("📊 INSIGHTS:");
            console.log(insight.insights);
        }
        
        if (insight.sessionsAnalyzed) {
            console.log(`\n📁 Sessions analyzed: ${insight.sessionsAnalyzed}`);
        }
        
        if (insight.model) {
            console.log(`🧠 Model: ${insight.model}`);
        }
        
        console.log("=".repeat(80));
    }

    /**
     * Watch for new insights files and display responses
     */
    async startMonitoring() {
        console.log("🚀 Starting Qwen Code Response Viewer...");
        console.log(`📡 Monitoring: ${this.insightsDir}`);
        console.log("🎯 Press Ctrl+C to stop\n");

        setInterval(() => {
            try {
                // Check for new or modified files
                const files = fs.readdirSync(this.insightsDir)
                    .filter(f => f.endsWith(".jsonl"))
                    .map(f => path.join(this.insightsDir, f));

                files.forEach(file => {
                    const stats = fs.statSync(file);
                    const fileKey = `${file}-${stats.mtime.getTime()}`;
                    
                    if (!this.monitoredFiles.has(fileKey) && stats.mtime.getTime() > this.lastCheck) {
                        this.monitoredFiles.add(fileKey);
                        
                        // Read and display new insights
                        const content = fs.readFileSync(file, "utf8");
                        const lines = content.trim().split("\n").filter(line => line.trim());
                        
                        lines.forEach(line => {
                            try {
                                const insight = JSON.parse(line);
                                this.displayResponse(insight);
                            } catch (e) {
                                console.log("📝 Raw response:", line);
                            }
                        });
                    }
                });
                
            } catch (error) {
                // Silently handle directory read errors
            }
        }, 2000); // Check every 2 seconds
    }
}

// Start the viewer
const viewer = new QwenResponseViewer();
viewer.startMonitoring();
