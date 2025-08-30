#!/usr/bin/env node
/* eslint-env node */
/**
 * Dependency-Aware Memory System Launcher
 * Ensures proper startup order: Real-time Scribe → Semantic Orchestrator → Embedding Indexer
 */

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

class MemorySystemLauncher {
    constructor() {
        this.projectRoot = process.cwd();
        this.jsonDir = path.join(this.projectRoot, ".rMemory/json");
        
        this.processes = new Map();
        this.requiredFiles = {
            scribe: path.join(this.jsonDir, "realtime-chat-data.json"),
            orchestrator: path.join(this.jsonDir, "memento-import.json"),
            embeddings: path.join(this.jsonDir, "embeddings-index.json")
        };
        
        console.log("🎯 Memory System Launcher initialized");
    }

    async checkDependencies() {
        const status = {
            scribe: fs.existsSync(this.requiredFiles.scribe),
            orchestrator: fs.existsSync(this.requiredFiles.orchestrator),
            embeddings: fs.existsSync(this.requiredFiles.embeddings)
        };
        
        console.log("📋 Dependency Status:");
        console.log(`   📡 Real-time Chat Data: ${status.scribe ? "✅" : "❌"}`);
        console.log(`   🧠 Orchestrator Output: ${status.orchestrator ? "✅" : "❌"}`);
        console.log(`   🔍 Embeddings Index: ${status.embeddings ? "✅" : "❌"}`);
        
        return status;
    }

    async startRealTimeScribe() {
        if (this.processes.has("scribe")) {
            console.log("📡 Real-time scribe already running");
            return;
        }
        
        console.log("🚀 Starting real-time chat scribe...");
        
        const scribe = spawn("node", [".rMemory/core/realtime-chat-scribe.js"], {
            cwd: this.projectRoot,
            stdio: ["ignore", "pipe", "pipe"]
        });
        
        this.processes.set("scribe", scribe);
        
        scribe.stdout.on("data", (data) => {
            console.log(`📡 Scribe: ${data.toString().trim()}`);
        });
        
        scribe.stderr.on("data", (data) => {
            console.error(`📡 Scribe Error: ${data.toString().trim()}`);
        });
        
        // Wait for initial output
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    async runSemanticOrchestrator() {
        console.log("🧠 Running semantic orchestrator...");
        
        return new Promise((resolve, reject) => {
            const orchestrator = spawn("node", [".rMemory/core/semantic-orchestrator.js"], {
                cwd: this.projectRoot,
                stdio: ["ignore", "pipe", "pipe"]
            });
            
            let output = "";
            
            orchestrator.stdout.on("data", (data) => {
                const text = data.toString();
                output += text;
                console.log(`🧠 ${text.trim()}`);
            });
            
            orchestrator.stderr.on("data", (data) => {
                console.error(`🧠 Error: ${data.toString().trim()}`);
            });
            
            orchestrator.on("close", (code) => {
                if (code === 0) {
                    console.log("✅ Semantic orchestrator completed successfully");
                    resolve(true);
                } else {
                    console.error(`❌ Semantic orchestrator failed with code ${code}`);
                    reject(new Error(`Orchestrator failed: ${code}`));
                }
            });
        });
    }

    async startEmbeddingIndexer() {
        if (this.processes.has("embeddings")) {
            console.log("🔍 Embedding indexer already running");
            return;
        }
        
        console.log("🚀 Starting embedding indexer...");
        
        const indexer = spawn("node", [".rMemory/core/embedding-indexer.js"], {
            cwd: this.projectRoot,
            stdio: ["ignore", "pipe", "pipe"]
        });
        
        this.processes.set("embeddings", indexer);
        
        indexer.stdout.on("data", (data) => {
            console.log(`🔍 Embeddings: ${data.toString().trim()}`);
        });
        
        indexer.stderr.on("data", (data) => {
            console.error(`🔍 Embeddings Error: ${data.toString().trim()}`);
        });
    }

    async fullSystemLaunch() {
        console.log("🎯 Starting full memory system with dependency checking...");
        
        try {
            // Step 1: Check current status
            let status = await this.checkDependencies();
            
            // Step 2: Start real-time scribe if needed
            if (!status.scribe) {
                await this.startRealTimeScribe();
                
                // Wait for scribe to generate data
                console.log("⏳ Waiting for real-time scribe to generate data...");
                let attempts = 0;
                while (!fs.existsSync(this.requiredFiles.scribe) && attempts < 10) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    attempts++;
                }
                
                if (!fs.existsSync(this.requiredFiles.scribe)) {
                    throw new Error("Real-time scribe failed to generate data");
                }
            }
            
            // Step 3: Run semantic orchestrator if scribe data exists
            status = await this.checkDependencies();
            if (status.scribe) {
                await this.runSemanticOrchestrator();
            } else {
                throw new Error("Cannot run orchestrator without scribe data");
            }
            
            // Step 4: Start embedding indexer if orchestrator completed
            status = await this.checkDependencies();
            if (status.orchestrator) {
                await this.startEmbeddingIndexer();
                console.log("✅ All systems launched successfully!");
            } else {
                throw new Error("Cannot start embeddings without orchestrator output");
            }
            
            // Keep monitoring
            this.startMonitoring();
            
        } catch (error) {
            console.error("❌ System launch failed:", error.message);
            await this.shutdown();
            process.exit(1);
        }
    }

    startMonitoring() {
        console.log("👁️  Starting system monitoring...");
        
        setInterval(async () => {
            const status = await this.checkDependencies();
            
            // Check if processes are still running
            for (const [name, process] of this.processes) {
                if (process.killed) {
                    console.warn(`⚠️  Process ${name} has died, restarting...`);
                    this.processes.delete(name);
                    
                    if (name === "scribe") {
                        await this.startRealTimeScribe();
                    } else if (name === "embeddings") {
                        await this.startEmbeddingIndexer();
                    }
                }
            }
        }, 30000); // Check every 30 seconds
    }

    async shutdown() {
        console.log("🛑 Shutting down memory system...");
        
        for (const [name, process] of this.processes) {
            console.log(`   Stopping ${name}...`);
            process.kill("SIGTERM");
        }
        
        this.processes.clear();
    }
}

// CLI interface
if (require.main === module) {
    const launcher = new MemorySystemLauncher();
    
    // Handle graceful shutdown
    process.on("SIGINT", async () => {
        console.log("\n🛑 Received SIGINT, shutting down...");
        await launcher.shutdown();
        process.exit(0);
    });
    
    process.on("SIGTERM", async () => {
        console.log("\n🛑 Received SIGTERM, shutting down...");
        await launcher.shutdown();
        process.exit(0);
    });
    
    launcher.fullSystemLaunch().catch(error => {
        console.error("❌ Launch failed:", error);
        process.exit(1);
    });
}

module.exports = MemorySystemLauncher;
