#!/usr/bin/env node

/**
 * Memory Bridge - Keeps your memory tools accessible at all times
 * 
 * This ensures recall.js and your memory graph stay connected
 * even when VS Code MCP plugin becomes unstable.
 */

const express = require("express");
const { spawn, exec } = require("child_process");
const path = require("path");
const fs = require("fs").promises;

class MemoryBridge {
    constructor() {
        this.baseDir = path.dirname(__dirname);
        this.app = express();
        this.bridgePort = 8092;
        this.mcpServers = new Map();
        
        console.log("🧠 Memory Bridge initializing...");
        console.log(`📂 Base directory: ${this.baseDir}`);
        
        this.setupAPI();
        this.startServer();
        this.monitorMCPHealth();
    }

    setupAPI() {
        this.app.use(express.json());
        
        // Recall.js endpoint - your fast memory search
        this.app.post("/api/recall", async (req, res) => {
            try {
                const { query, timeframe } = req.body;
                console.log(`🔍 Recall query: "${query}"`);
                
                const recallPath = path.join(this.baseDir, "rEngine", "recall.js");
                const command = `cd "${path.dirname(recallPath)}" && node recall.js "${query}"`;
                
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        console.error("❌ Recall error:", error);
                        res.status(500).json({
                            success: false,
                            error: error.message,
                            query
                        });
                        return;
                    }
                    
                    console.log("✅ Recall successful");
                    res.json({
                        success: true,
                        query,
                        results: stdout,
                        stderr: stderr || null,
                        timestamp: new Date().toISOString()
                    });
                });
            } catch (error) {
                console.error("❌ Recall endpoint error:", error);
                res.status(500).json({
                    success: false,
                    error: error.message,
                    query: req.body.query
                });
            }
        });
        
        // Memory status endpoint
        this.app.get("/api/memory-status", async (req, res) => {
            try {
                const memoryPath = path.join(this.baseDir, "rMemory", "rAgentMemories");
                
                let files = [];
                try {
                    files = await fs.readdir(memoryPath);
                } catch (err) {
                    console.log(`📁 Memory path not found: ${memoryPath}`);
                }
                
                const status = {
                    bridge_active: true,
                    memory_files_count: files.length,
                    memory_files: files.slice(0, 10), // First 10 files
                    recall_available: true,
                    mcp_servers_detected: this.mcpServers.size,
                    timestamp: new Date().toISOString(),
                    base_directory: this.baseDir
                };
                
                res.json(status);
            } catch (error) {
                console.error("❌ Memory status error:", error);
                res.status(500).json({ error: error.message });
            }
        });
        
        // Enhanced Scribe Console proxy
        this.app.get("/api/scribe-status", async (req, res) => {
            try {
                exec("ps aux | grep -E \"(smart-scribe|split-scribe)\" | grep -v grep", (error, stdout, stderr) => {
                    const processes = stdout.split("\n").filter(line => line.trim().length > 0);
                    
                    res.json({
                        scribe_processes: processes.length,
                        processes: processes,
                        timestamp: new Date().toISOString()
                    });
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
        
        // VS Code MCP health check
        this.app.get("/api/mcp-health", async (req, res) => {
            try {
                exec("ps aux | grep -E \"(memory-server|context7|mcp)\" | grep -v grep", (error, stdout, stderr) => {
                    const processes = stdout.split("\n").filter(line => line.trim().length > 0);
                    
                    res.json({
                        mcp_processes: processes.length,
                        processes: processes,
                        vs_code_mcp_active: processes.some(p => p.includes("memory-server")),
                        context7_active: processes.some(p => p.includes("context7")),
                        timestamp: new Date().toISOString()
                    });
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
        
        // Test endpoint
        this.app.get("/api/test", (req, res) => {
            res.json({
                status: "Memory Bridge Active",
                message: "Your memory tools are accessible!",
                timestamp: new Date().toISOString(),
                endpoints: [
                    "POST /api/recall - Search memories",
                    "GET /api/memory-status - Memory system status",
                    "GET /api/scribe-status - Scribe processes",
                    "GET /api/mcp-health - MCP server health"
                ]
            });
        });
        
        console.log("🔗 API endpoints configured");
    }

    startServer() {
        this.server = this.app.listen(this.bridgePort, () => {
            console.log(`✅ Memory Bridge active on port ${this.bridgePort}`);
            console.log(`🌐 Access your memory tools at: http://localhost:${this.bridgePort}/api/test`);
            console.log("");
            console.log("🎯 Available endpoints:");
            console.log(`   📝 POST http://localhost:${this.bridgePort}/api/recall`);
            console.log(`   📊 GET  http://localhost:${this.bridgePort}/api/memory-status`);
            console.log(`   🔍 GET  http://localhost:${this.bridgePort}/api/scribe-status`);
            console.log(`   ❤️  GET  http://localhost:${this.bridgePort}/api/mcp-health`);
            console.log("");
            console.log("💡 Your memory brain is now persistent - VS Code disconnects won't matter!");
        });
        
        this.server.on("error", (err) => {
            if (err.code === "EADDRINUSE") {
                console.log(`⚠️  Port ${this.bridgePort} in use, trying ${this.bridgePort + 1}...`);
                this.bridgePort++;
                this.startServer();
            } else {
                console.error("❌ Server error:", err);
            }
        });
    }

    monitorMCPHealth() {
        // Check MCP health every 30 seconds
        setInterval(() => {
            exec("ps aux | grep -E \"(memory-server|context7)\" | grep -v grep", (error, stdout, stderr) => {
                const processes = stdout.split("\n").filter(line => line.trim().length > 0);
                
                if (processes.length === 0) {
                    console.log("⚠️  No MCP servers detected - your memory is still accessible via bridge");
                } else {
                    console.log(`✅ ${processes.length} MCP server(s) running`);
                }
            });
        }, 30000);
        
        console.log("👁️  MCP health monitoring started");
    }

    shutdown() {
        console.log("🛑 Shutting down Memory Bridge...");
        
        if (this.server) {
            this.server.close(() => {
                console.log("✅ Memory Bridge shutdown complete");
                process.exit(0);
            });
        } else {
            process.exit(0);
        }
    }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
    if (global.bridge) {
        global.bridge.shutdown();
    } else {
        process.exit(0);
    }
});

process.on("SIGTERM", () => {
    if (global.bridge) {
        global.bridge.shutdown();
    } else {
        process.exit(0);
    }
});

// Start the bridge
console.log("🚀 Starting Memory Bridge...");
global.bridge = new MemoryBridge();
