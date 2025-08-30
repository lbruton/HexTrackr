#!/usr/bin/env node
/**
 * HexTrackr Memory Launcher
 * Simple launcher for memory analysis tasks using Ollama
 */

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

class MemoryLauncher {
    constructor() {
        this.promptsDir = path.join(__dirname, "../../.prompts");
        this.dataDir = path.join(__dirname, "../json");
        this.ollamaModel = "qwen2.5-coder:7b";
        this.embeddingModel = "nomic-embed-text:latest";
    }

    async checkOllama() {
        console.log("🔍 Checking Ollama status...");
        
        return new Promise((resolve, reject) => {
            const check = spawn("ollama", ["list"]);
            
            check.on("close", (code) => {
                if (code === 0) {
                    console.log("✅ Ollama is running");
                    resolve(true);
                } else {
                    console.error("❌ Ollama not available");
                    reject(new Error("Ollama not running"));
                }
            });

            check.on("error", (error) => {
                console.error("❌ Ollama check failed:", error.message);
                reject(error);
            });
        });
    }

    async scanChatHistory() {
        console.log("\n📖 Step 1: Scanning chat history...");
        
        const scanner = require("./chat-scanner.js");
        const chatScanner = new scanner();
        
        const conversations = await chatScanner.scanChatHistory();
        
        if (conversations.length > 0) {
            chatScanner.generateMementoImport(conversations);
            console.log(`✅ Found ${conversations.length} conversations`);
            return conversations;
        } else {
            throw new Error("No chat history found");
        }
    }

    async analyzeWithOllama(inputFile) {
        console.log("\n🧠 Step 2: Analyzing with Ollama...");
        
        const promptFile = path.join(this.promptsDir, "memory-analysis-comprehensive.prompt.md");
        
        if (!fs.existsSync(promptFile)) {
            throw new Error(`Prompt file not found: ${promptFile}`);
        }

        if (!fs.existsSync(inputFile)) {
            throw new Error(`Input file not found: ${inputFile}`);
        }

        const prompt = fs.readFileSync(promptFile, "utf8");
        const chatData = fs.readFileSync(inputFile, "utf8");

        const fullPrompt = `${prompt}\n\n## Chat Data to Analyze:\n\n${chatData}\n\nPlease analyze this chat history and extract key insights following the format specified above.`;

        console.log("🚀 Sending to Ollama for analysis...");
        console.log(`📝 Using model: ${this.ollamaModel}`);

        return new Promise((resolve, reject) => {
            const ollama = spawn("ollama", ["run", this.ollamaModel]);
            
            let output = "";
            let errorOutput = "";

            ollama.stdout.on("data", (data) => {
                const text = data.toString();
                output += text;
                process.stdout.write(text); // Show progress
            });

            ollama.stderr.on("data", (data) => {
                errorOutput += data.toString();
            });

            ollama.on("close", (code) => {
                if (code === 0) {
                    console.log("\n✅ Ollama analysis complete");
                    
                    // Save analysis output
                    const outputFile = path.join(this.dataDir, "ollama-analysis.txt");
                    fs.writeFileSync(outputFile, output);
                    console.log(`💾 Analysis saved to: ${outputFile}`);
                    
                    resolve(output);
                } else {
                    console.error("❌ Ollama analysis failed");
                    reject(new Error(`Ollama failed with code ${code}: ${errorOutput}`));
                }
            });

            ollama.on("error", (error) => {
                console.error("❌ Ollama spawn error:", error.message);
                reject(error);
            });

            // Send the prompt
            ollama.stdin.write(fullPrompt);
            ollama.stdin.end();
        });
    }

    async extractEntities(analysisText) {
        console.log("\n🔍 Step 3: Extracting entities for Memento...");
        
        try {
            // Try to find JSON in the analysis output
            const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
            
            if (jsonMatch) {
                const entities = JSON.parse(jsonMatch[0]);
                
                const outputFile = path.join(this.dataDir, "extracted-entities.json");
                fs.writeFileSync(outputFile, JSON.stringify(entities, null, 2));
                
                console.log(`✅ Extracted ${entities.entities?.length || 0} entities`);
                console.log(`💾 Entities saved to: ${outputFile}`);
                
                return entities;
            } else {
                console.warn("⚠️  No JSON entities found in analysis");
                
                // Create a simple entity from the analysis
                const fallbackEntity = {
                    entities: [{
                        name: "Chat Analysis Session",
                        entityType: "analysis_session", 
                        observations: [
                            `Analysis completed at ${new Date().toISOString()}`,
                            "Raw analysis text captured",
                            `Analysis length: ${analysisText.length} characters`
                        ]
                    }]
                };
                
                const outputFile = path.join(this.dataDir, "extracted-entities.json");
                fs.writeFileSync(outputFile, JSON.stringify(fallbackEntity, null, 2));
                
                return fallbackEntity;
            }
        } catch (error) {
            console.error("❌ Entity extraction failed:", error.message);
            throw error;
        }
    }

    async quickStart() {
        console.log("🚀 HexTrackr Memory System - Quick Start\n");
        
        try {
            // Step 1: Check Ollama
            await this.checkOllama();
            
            // Step 2: Scan chat history
            const conversations = await this.scanChatHistory();
            
            // Step 3: Analyze with Ollama
            const inputFile = path.join(this.dataDir, "chat-history.json");
            const analysis = await this.analyzeWithOllama(inputFile);
            
            // Step 4: Extract entities
            const entities = await this.extractEntities(analysis);
            
            console.log("\n🎉 Memory analysis complete!");
            console.log("\n📋 Next steps:");
            console.log("1. Review extracted entities in .rMemory/json/extracted-entities.json");
            console.log("2. Import entities into Memento MCP");
            console.log("3. Verify memory storage in Neo4j");
            
            return {
                conversations: conversations.length,
                entities: entities.entities?.length || 0,
                success: true
            };
            
        } catch (error) {
            console.error("\n❌ Quick start failed:", error.message);
            console.log("\n🔧 Troubleshooting:");
            console.log("- Ensure Ollama is running: ollama serve");
            console.log("- Check VS Code chat logs exist");
            console.log("- Verify models are installed: ollama list");
            
            return { success: false, error: error.message };
        }
    }
}

// CLI Usage
if (require.main === module) {
    const launcher = new MemoryLauncher();
    launcher.quickStart();
}

module.exports = MemoryLauncher;
