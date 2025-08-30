#!/usr/bin/envconst { spawn } = require('child_process');node
/* eslint-env node */
/* global require, module, __dirname, console, process */

/**
 * Qwen2.5-Coder + Symbols Integration
 * 
 * Enhances real-time analysis with automatic symbols indexing
 * Uses qwen2.5-coder to understand code changes and maintain symbol database
 * Bridges chat analysis with codebase structure understanding
 */

const fs = require("fs").promises;
const path = require("path");
const http = require("http");

class QwenSymbolsIntegration {
    constructor() {
        this.ollamaHost = "localhost";
        this.ollamaPort = 11434;
        this.model = "qwen2.5-coder:7b";
        this.projectRoot = path.resolve(__dirname, "../..");
        this.outputPath = path.join(__dirname, "../docs/ops/live-insights");
        this.lastSymbolsScan = null;
        this.watchedFiles = new Map(); // Track file modification times
    }

    /**
     * Initialize symbols integration
     */
    async initialize() {
        console.log("🔗 Initializing Qwen + Symbols Integration...");
        
        try {
            // Check Ollama status
            const ollamaStatus = await this.checkOllamaStatus();
            if (!ollamaStatus) {
                throw new Error("Ollama not accessible");
            }
            
            // Initial symbols scan
            await this.performInitialSymbolsScan();
            
            console.log("✅ Qwen + Symbols Integration ready");
            return true;
            
        } catch (error) {
            console.error("❌ Failed to initialize integration:", error.message);
            return false;
        }
    }

    /**
     * Check if Ollama is running
     */
    async checkOllamaStatus() {
        return new Promise((resolve) => {
            const req = http.request({
                hostname: this.ollamaHost,
                port: this.ollamaPort,
                path: "/api/tags",
                method: "GET",
                timeout: 5000
            }, (res) => {
                resolve(res.statusCode === 200);
            });
            
            req.on("error", () => resolve(false));
            req.on("timeout", () => {
                req.destroy();
                resolve(false);
            });
            
            req.end();
        });
    }

    /**
     * Perform initial symbols scan of the codebase
     */
    async performInitialSymbolsScan() {
        console.log("🔍 Performing initial symbols scan...");
        
        try {
            // Get list of JavaScript/TypeScript files
            const codeFiles = await this.findCodeFiles();
            console.log(`📁 Found ${codeFiles.length} code files to analyze`);
            
            // Track current state
            for (const file of codeFiles) {
                try {
                    const stats = await fs.stat(file);
                    this.watchedFiles.set(file, stats.mtime.getTime());
                } catch (_error) {
                    // File might not exist, skip
                }
            }
            
            this.lastSymbolsScan = Date.now();
            console.log(`✅ Initial scan complete - tracking ${this.watchedFiles.size} files`);
            
        } catch (error) {
            console.error("❌ Initial symbols scan failed:", error.message);
        }
    }

    /**
     * Find all code files in the project
     */
    async findCodeFiles() {
        const _patterns = [
            "*.js", "*.ts", "*.mjs",
            "scripts/**/*.js",
            "styles/**/*.js", 
            ".rMemory/**/*.js"
        ];
        
        const excludePatterns = [
            "node_modules/**",
            ".git/**",
            "*.min.js",
            "__MACOSX/**"
        ];
        
        const files = [];
        
        try {
            // Use simple recursive directory walk
            const walkDir = async (dir) => {
                const entries = await fs.readdir(dir, { withFileTypes: true });
                
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    
                    if (entry.isDirectory()) {
                        // Skip excluded directories
                        if (!excludePatterns.some(pattern => 
                            fullPath.includes(pattern.replace("/**", "")))) {
                            await walkDir(fullPath);
                        }
                    } else if (entry.isFile()) {
                        // Include JavaScript/TypeScript files
                        if (/\.(js|ts|mjs)$/.test(entry.name) && 
                            !entry.name.includes(".min.")) {
                            files.push(fullPath);
                        }
                    }
                }
            };
            
            await walkDir(this.projectRoot);
            return files;
            
        } catch (error) {
            console.error("Error finding code files:", error.message);
            return [];
        }
    }

    /**
     * Detect and analyze code changes since last scan
     */
    async detectCodeChanges() {
        const changes = [];
        
        try {
            const codeFiles = await this.findCodeFiles();
            
            for (const file of codeFiles) {
                try {
                    const stats = await fs.stat(file);
                    const currentMtime = stats.mtime.getTime();
                    const lastMtime = this.watchedFiles.get(file);
                    
                    if (!lastMtime || currentMtime > lastMtime) {
                        // File has changed or is new
                        changes.push({
                            file,
                            type: lastMtime ? "modified" : "added",
                            mtime: currentMtime
                        });
                        
                        this.watchedFiles.set(file, currentMtime);
                    }
                } catch (_error) {
                    // File might have been deleted
                    if (this.watchedFiles.has(file)) {
                        changes.push({
                            file,
                            type: "deleted",
                            mtime: Date.now()
                        });
                        
                        this.watchedFiles.delete(file);
                    }
                }
            }
            
            return changes;
            
        } catch (error) {
            console.error("Error detecting code changes:", error.message);
            return [];
        }
    }

    /**
     * Analyze code changes with qwen2.5-coder
     */
    async analyzeCodeChanges(changes) {
        if (changes.length === 0) {return null;}
        
        console.log(`🔍 Analyzing ${changes.length} code changes with qwen2.5-coder...`);
        
        try {
            // Prepare context for qwen2.5-coder
            const changesSummary = changes.map(change => {
                const relativePath = path.relative(this.projectRoot, change.file);
                return `${change.type.toUpperCase()}: ${relativePath}`;
            }).join("\n");
            
            const prompt = `Analyze these code changes in HexTrackr project:

${changesSummary}

Focus on:
1. What functions/classes/exports were added/modified/removed?
2. What is the likely intent of these changes?
3. How do these changes affect the overall codebase structure?
4. Any potential symbols that should be indexed?

Provide a concise technical analysis (max 300 words).`;

            const analysis = await this.sendToOllama(prompt);
            
            return {
                timestamp: new Date().toISOString(),
                changesAnalyzed: changes.length,
                changes: changes.map(c => ({
                    file: path.relative(this.projectRoot, c.file),
                    type: c.type
                })),
                analysis,
                model: this.model
            };
            
        } catch (error) {
            console.error("Code analysis failed:", error.message);
            return null;
        }
    }

    /**
     * Send prompt to Ollama (qwen2.5-coder)
     */
    async sendToOllama(prompt) {
        return new Promise((resolve, reject) => {
            const postData = JSON.stringify({
                model: this.model,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.2, // Lower temperature for code analysis
                    top_p: 0.9,
                    num_predict: 400
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
                reject(new Error("Request timed out"));
            });

            req.write(postData);
            req.end();
        });
    }

    /**
     * Save symbols analysis to output
     */
    async saveSymbolsAnalysis(analysis) {
        if (!analysis) {return;}
        
        try {
            const timestamp = new Date().toISOString().split("T")[0];
            const filename = `symbols-analysis-${timestamp}.jsonl`;
            const filepath = path.join(this.outputPath, filename);
            
            const logEntry = JSON.stringify({
                type: "symbols_analysis",
                ...analysis
            }) + "\n";
            
            await fs.appendFile(filepath, logEntry);
            console.log(`💾 Symbols analysis saved to ${filename}`);
            
        } catch (error) {
            console.error("Failed to save symbols analysis:", error.message);
        }
    }

    /**
     * Main integration loop - combines chat and code analysis
     */
    async runIntegratedAnalysis() {
        console.log("🔄 Running integrated chat + symbols analysis...");
        
        try {
            // Detect code changes
            const codeChanges = await this.detectCodeChanges();
            
            if (codeChanges.length > 0) {
                console.log(`📝 Detected ${codeChanges.length} code changes`);
                
                // Analyze with qwen2.5-coder
                const symbolsAnalysis = await this.analyzeCodeChanges(codeChanges);
                
                if (symbolsAnalysis) {
                    await this.saveSymbolsAnalysis(symbolsAnalysis);
                    console.log("✅ Symbols analysis complete");
                    return symbolsAnalysis;
                }
            } else {
                console.log("😴 No code changes detected");
            }
            
            return null;
            
        } catch (error) {
            console.error("❌ Integrated analysis failed:", error.message);
            return null;
        }
    }

    /**
     * Start continuous monitoring
     */
    async startMonitoring(interval = 30000) { // 30 seconds default
        console.log("🚀 Starting continuous Qwen + Symbols monitoring...");
        console.log(`⏰ Analysis interval: ${interval/1000} seconds`);
        
        const initialized = await this.initialize();
        if (!initialized) {
            console.error("❌ Failed to initialize - monitoring aborted");
            return;
        }
        
        // Main monitoring loop
        while (true) {
            try {
                await this.runIntegratedAnalysis();
                await this.sleep(interval);
            } catch (error) {
                console.error("❌ Monitoring error:", error.message);
                await this.sleep(5000); // Short delay before retry
            }
        }
    }

    /**
     * Helper: Sleep for specified milliseconds
     */
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// CLI support
if (require.main === module) {
    const integration = new QwenSymbolsIntegration();
    
    const args = process.argv.slice(2);
    if (args.includes("--monitor")) {
        integration.startMonitoring();
    } else if (args.includes("--test")) {
        integration.runIntegratedAnalysis().then(() => {
            console.log("🎉 Test complete!");
            process.exit(0);
        });
    } else {
        console.log("Usage: node qwen-symbols-integration.js [--monitor|--test]");
        process.exit(1);
    }
}

module.exports = { QwenSymbolsIntegration };
