#!/usr/bin/env node
/**
 * Real-time Memory Monitor
 * Shows live prompts and responses from Ollama in terminal
 */

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

class MemoryMonitor {
    constructor() {
        this.rMemoryPath = path.join(process.cwd(), ".rMemory");
        this.logsPath = path.join(this.rMemoryPath, "logs");
        this.logFile = path.join(this.logsPath, "memory-monitor.log");
        
        this.ensureLogsDir();
        this.initLogFile();
    }

    ensureLogsDir() {
        if (!fs.existsSync(this.logsPath)) {
            fs.mkdirSync(this.logsPath, { recursive: true });
        }
    }

    initLogFile() {
        const startMessage = `\n${"=".repeat(60)}\n🚀 HexTrackr Memory Monitor Started\n${new Date().toISOString()}\n${"=".repeat(60)}\n`;
        fs.writeFileSync(this.logFile, startMessage);
    }

    log(message, type = "info") {
        const timestamp = new Date().toISOString();
        const prefix = {
            "info": "📊",
            "prompt": "🧠",
            "response": "💬",
            "error": "❌",
            "success": "✅"
        }[type] || "📝";
        
        const logEntry = `[${timestamp}] ${prefix} ${message}\n`;
        
        // Write to file
        fs.appendFileSync(this.logFile, logEntry);
        
        // Write to console with color
        const color = {
            "info": "\x1b[36m",      // Cyan
            "prompt": "\x1b[33m",    // Yellow
            "response": "\x1b[32m",  // Green
            "error": "\x1b[31m",     // Red
            "success": "\x1b[92m"    // Bright Green
        }[type] || "\x1b[0m";
        
        console.log(`${color}[${timestamp.split("T")[1].split(".")[0]}] ${prefix} ${message}\x1b[0m`);
    }

    async startMonitoring() {
        this.log("Memory monitoring started", "success");
        this.log("Monitoring VS Code chat logs and running Ollama analysis...", "info");
        
        // Start the memory orchestrator
        await this.startOrchestrator();
        
        // Start log tailing
        this.startLogTail();
    }

    async startOrchestrator() {
        this.log("Starting memory orchestrator in continuous mode...", "info");
        
        const orchestratorPath = path.join(this.rMemoryPath, "core", "memory-orchestrator.js");
        
        const orchestrator = spawn("node", [orchestratorPath, "continuous"], {
            stdio: ["inherit", "pipe", "pipe"],
            cwd: process.cwd()
        });

        orchestrator.stdout.on("data", (data) => {
            const output = data.toString().trim();
            if (output) {
                this.log(`ORCHESTRATOR: ${output}`, "info");
            }
        });

        orchestrator.stderr.on("data", (data) => {
            const error = data.toString().trim();
            if (error) {
                this.log(`ORCHESTRATOR ERROR: ${error}`, "error");
            }
        });

        orchestrator.on("close", (code) => {
            this.log(`Orchestrator exited with code ${code}`, code === 0 ? "info" : "error");
        });

        return orchestrator;
    }

    startLogTail() {
        this.log("Starting real-time log tail...", "info");
        
        // Monitor the memory monitor log file itself
        let lastSize = 0;
        
        setInterval(() => {
            try {
                const stats = fs.statSync(this.logFile);
                if (stats.size > lastSize) {
                    const content = fs.readFileSync(this.logFile, "utf8");
                    const newContent = content.substring(lastSize);
                    
                    // Don't re-log our own messages
                    if (newContent && !newContent.includes("[MONITOR]")) {
                        process.stdout.write(newContent);
                    }
                    
                    lastSize = stats.size;
                }
            } catch (error) {
                // File might not exist yet
            }
        }, 1000);
    }

    async monitorOllamaActivity() {
        this.log("Monitoring Ollama activity...", "info");
        
        // Check if Ollama is running
        try {
            const ollamaCheck = spawn("ollama", ["list"]);
            
            ollamaCheck.on("close", (code) => {
                if (code === 0) {
                    this.log("Ollama is running and available", "success");
                } else {
                    this.log("Ollama is not available", "error");
                }
            });
        } catch (error) {
            this.log("Failed to check Ollama status", "error");
        }
    }

    displayStatus() {
        console.clear();
        console.log("\x1b[1m\x1b[34m" + "=".repeat(80) + "\x1b[0m");
        console.log("\x1b[1m\x1b[34m🧠 HexTrackr Memory System - Real-Time Monitor\x1b[0m");
        console.log("\x1b[1m\x1b[34m" + "=".repeat(80) + "\x1b[0m");
        console.log();
        console.log("\x1b[1m📊 System Status:\x1b[0m");
        console.log("  🔄 Continuous monitoring active");
        console.log("  📁 Log file: .rMemory/logs/memory-monitor.log");
        console.log("  🎯 Monitoring: VS Code chat logs → Ollama analysis → Memento export");
        console.log();
        console.log("\x1b[1m🎛️  Controls:\x1b[0m");
        console.log("  Ctrl+C - Stop monitoring");
        console.log("  tail -f .rMemory/logs/memory-monitor.log - External log view");
        console.log();
        console.log("\x1b[1m📈 Live Activity:\x1b[0m");
        console.log("\x1b[2m" + "-".repeat(80) + "\x1b[0m");
    }

    async checkMemoryFiles() {
        const files = [
            ".rMemory/json/canonical-notes.json",
            ".rMemory/json/symbols-table.json", 
            ".rMemory/json/time-summaries.json",
            ".rMemory/json/memento-import.json"
        ];

        for (const file of files) {
            const filePath = path.join(process.cwd(), file);
            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                const size = (stats.size / 1024).toFixed(1);
                const modified = stats.mtime.toLocaleTimeString();
                this.log(`FILE: ${file} (${size}KB, modified ${modified})`, "info");
            }
        }
    }

    async showRecentAnalysis() {
        try {
            const summariesPath = path.join(process.cwd(), ".rMemory/json/time-summaries.json");
            if (fs.existsSync(summariesPath)) {
                const summaries = JSON.parse(fs.readFileSync(summariesPath, "utf8"));
                
                this.log("RECENT ANALYSIS:", "info");
                this.log(`  Last 10 min: ${summaries.last10min?.summary || "No activity"}`, "info");
                this.log(`  Last 30 min: ${summaries.last30min?.summary || "No activity"}`, "info");
                this.log(`  Last 60 min: ${summaries.last60min?.summary || "No activity"}`, "info");
            }
        } catch (error) {
            this.log(`Failed to read recent analysis: ${error.message}`, "error");
        }
    }

    setupGracefulShutdown() {
        process.on("SIGINT", () => {
            this.log("Shutting down memory monitor...", "info");
            this.log("Memory monitoring stopped", "success");
            process.exit(0);
        });
    }
}

// Start monitoring if called directly
if (require.main === module) {
    const monitor = new MemoryMonitor();
    
    monitor.setupGracefulShutdown();
    monitor.displayStatus();
    
    // Initial status checks
    monitor.monitorOllamaActivity()
        .then(() => monitor.checkMemoryFiles())
        .then(() => monitor.showRecentAnalysis())
        .then(() => {
            monitor.log("Starting continuous monitoring...", "success");
            return monitor.startMonitoring();
        })
        .catch(error => {
            monitor.log(`Failed to start monitoring: ${error.message}`, "error");
            process.exit(1);
        });
}

module.exports = MemoryMonitor;
