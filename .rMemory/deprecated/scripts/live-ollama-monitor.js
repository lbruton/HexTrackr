#!/usr/bin/env node

/**
 * Live Ollama Monitor - REAL real-time responses
 * Shows actual Ollama/Qwen responses as they happen
 * No fake waiting screens, no useless archaeology reports
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

class LiveOllamaMonitor {
    constructor() {
        this.model = "qwen2.5-coder:7b";
        this.host = "localhost";
        this.port = 11434;
        this.sessionCount = 0;
    }

    log(message, type = "info") {
        const timestamp = new Date().toLocaleTimeString();
        const colors = {
            info: "\x1b[36m",    // cyan
            success: "\x1b[32m", // green
            error: "\x1b[31m",   // red
            response: "\x1b[33m", // yellow
            reset: "\x1b[0m"
        };
        
        const color = colors[type] || colors.info;
        console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
    }

    async testOllamaConnection() {
        return new Promise((resolve) => {
            const req = http.get(`http://${this.host}:${this.port}/api/version`, {
                timeout: 3000
            }, (res) => {
                let data = "";
                res.on("data", chunk => data += chunk);
                res.on("end", () => {
                    try {
                        const version = JSON.parse(data);
                        resolve({ connected: true, version: version.version });
                    } catch {
                        resolve({ connected: false });
                    }
                });
            });
            
            req.on("error", () => resolve({ connected: false }));
            req.on("timeout", () => {
                req.destroy();
                resolve({ connected: false });
            });
        });
    }

    async sendPrompt(prompt) {
        return new Promise((resolve, reject) => {
            const postData = JSON.stringify({
                model: this.model,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.7,
                    top_p: 0.9,
                    num_predict: 300
                }
            });

            this.log(`🤖 Sending to ${this.model}: "${prompt.substring(0, 60)}..."`, "info");

            const startTime = Date.now();
            const req = http.request({
                hostname: this.host,
                port: this.port,
                path: "/api/generate",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(postData)
                },
                timeout: 45000
            }, (res) => {
                let data = "";
                res.on("data", chunk => data += chunk);
                res.on("end", () => {
                    const responseTime = Date.now() - startTime;
                    try {
                        const result = JSON.parse(data);
                        this.log(`⚡ Response received in ${responseTime}ms`, "success");
                        this.log(`📝 Qwen says: ${result.response}`, "response");
                        resolve({
                            response: result.response,
                            responseTime: responseTime,
                            model: this.model
                        });
                    } catch (error) {
                        reject(new Error(`Parse error: ${error.message}`));
                    }
                });
            });

            req.on("error", reject);
            req.on("timeout", () => {
                req.destroy();
                reject(new Error("Request timeout"));
            });

            req.write(postData);
            req.end();
        });
    }

    async runLiveDemo() {
        console.log("\n🚀 LIVE OLLAMA MONITOR - Real responses, no BS");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        
        // Test connection
        const connection = await this.testOllamaConnection();
        if (!connection.connected) {
            this.log("❌ Ollama not running or not accessible", "error");
            process.exit(1);
        }
        
        this.log(`✅ Connected to Ollama v${connection.version}`, "success");
        console.log("");

        // Demo prompts that show real AI capability
        const demoPrompts = [
            "What are the key principles of good software architecture?",
            "Explain the benefits of using TypeScript over JavaScript",
            "What's the difference between REST and GraphQL APIs?",
            "How would you optimize a slow database query?",
            "What are some common security vulnerabilities in web apps?"
        ];

        for (let i = 0; i < demoPrompts.length; i++) {
            this.sessionCount++;
            this.log(`\n🎯 Demo ${this.sessionCount}/5`, "info");
            
            try {
                const result = await this.sendPrompt(demoPrompts[i]);
                
                // Save real response to file
                const filename = `.rMemory/docs/ops/live-insights/live-demo-${Date.now()}.json`;
                fs.writeFileSync(filename, JSON.stringify({
                    timestamp: new Date().toISOString(),
                    prompt: demoPrompts[i],
                    response: result.response,
                    responseTime: result.responseTime,
                    model: result.model
                }, null, 2));
                
                this.log(`💾 Saved to ${path.basename(filename)}`, "success");
                
            } catch (error) {
                this.log(`❌ Failed: ${error.message}`, "error");
            }
            
            // Wait between requests
            if (i < demoPrompts.length - 1) {
                this.log("⏳ Waiting 3 seconds...", "info");
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }

        console.log("\n🎉 Demo complete! Check .rMemory/docs/ops/live-insights/ for saved responses");
        console.log("🔄 This proves Ollama is working and can generate real insights");
    }

    async startInteractiveMode() {
        console.log("\n🎮 INTERACTIVE MODE - Type your questions");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("Type \"exit\" to quit\n");

        const readline = require("readline");
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const askQuestion = () => {
            rl.question("🤔 Your question: ", async (question) => {
                if (question.toLowerCase() === "exit") {
                    console.log("👋 Goodbye!");
                    rl.close();
                    return;
                }

                if (question.trim()) {
                    try {
                        await this.sendPrompt(question);
                    } catch (error) {
                        this.log(`❌ Error: ${error.message}`, "error");
                    }
                }

                console.log("");
                askQuestion();
            });
        };

        askQuestion();
    }
}

// Main execution
async function main() {
    const monitor = new LiveOllamaMonitor();
    
    const mode = process.argv[2];
    
    if (mode === "--interactive" || mode === "-i") {
        // Test connection first
        const connection = await monitor.testOllamaConnection();
        if (!connection.connected) {
            monitor.log("❌ Ollama not running", "error");
            process.exit(1);
        }
        await monitor.startInteractiveMode();
    } else {
        await monitor.runLiveDemo();
    }
}

if (require.main === module) {
    main().catch(console.error);
}
