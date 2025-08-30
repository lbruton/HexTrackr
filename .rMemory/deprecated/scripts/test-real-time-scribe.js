#!/usr/bin/env node

/**
 * Simple Real-time Analysis Test
 * Clean, minimal version to debug issues
 */

const http = require("http");

class SimpleRealTimeScribe {
    constructor() {
        this.ollamaHost = "localhost";
        this.ollamaPort = 11434;
        this.model = "qwen2.5-coder:7b";
    }

    log(message, type = "info") {
        const timestamp = new Date().toLocaleTimeString();
        const icons = {
            info: "📊",
            success: "✅", 
            warning: "⚠️",
            error: "❌",
            start: "🚀"
        };
        console.log(`[${timestamp}] ${icons[type] || "📊"} ${message}`);
    }

    async testOllamaConnection() {
        this.log("Testing Ollama connection...", "start");
        
        try {
            // Test basic connection
            const response = await this.httpRequest(`http://${this.ollamaHost}:${this.ollamaPort}/api/version`);
            this.log(`Ollama version: ${JSON.parse(response).version}`, "success");
            
            // Test model availability
            const tagsResponse = await this.httpRequest(`http://${this.ollamaHost}:${this.ollamaPort}/api/tags`);
            const models = JSON.parse(tagsResponse).models || [];
            const hasQwen = models.some(m => m.name === this.model);
            
            if (hasQwen) {
                this.log(`Model ${this.model} is available`, "success");
            } else {
                this.log(`Model ${this.model} not found. Available models: ${models.map(m => m.name).join(", ")}`, "warning");
                return false;
            }
            
            return true;
        } catch (error) {
            this.log(`Connection failed: ${error.message}`, "error");
            return false;
        }
    }

    async testSimpleGeneration() {
        this.log("Testing simple text generation...", "start");
        
        const prompt = "Analyze this development session: User is testing a real-time analysis system for HexTrackr project. Provide a brief insight.";
        
        try {
            const result = await this.generateWithOllama(prompt);
            this.log(`Generation successful! Response length: ${result.length} chars`, "success");
            this.log(`Sample: ${result.substring(0, 100)}...`, "info");
            return true;
        } catch (error) {
            this.log(`Generation failed: ${error.message}`, "error");
            return false;
        }
    }

    async generateWithOllama(prompt) {
        return new Promise((resolve, reject) => {
            const postData = JSON.stringify({
                model: this.model,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.7,
                    num_predict: 200
                }
            });

            const options = {
                hostname: this.ollamaHost,
                port: this.ollamaPort,
                path: "/api/generate",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(postData)
                },
                timeout: 30000
            };

            const req = http.request(options, (res) => {
                let data = "";
                res.on("data", chunk => data += chunk);
                res.on("end", () => {
                    try {
                        const result = JSON.parse(data);
                        if (result.error) {
                            reject(new Error(result.error));
                        } else {
                            resolve(result.response || "No response");
                        }
                    } catch (parseError) {
                        reject(new Error(`Parse error: ${parseError.message}`));
                    }
                });
            });

            req.on("error", error => reject(error));
            req.on("timeout", () => {
                req.destroy();
                reject(new Error("Request timeout"));
            });

            req.write(postData);
            req.end();
        });
    }

    httpRequest(url) {
        return new Promise((resolve, reject) => {
            const req = http.get(url, { timeout: 5000 }, (res) => {
                let data = "";
                res.on("data", chunk => data += chunk);
                res.on("end", () => resolve(data));
            });
            
            req.on("error", reject);
            req.on("timeout", () => {
                req.destroy();
                reject(new Error("Request timeout"));
            });
        });
    }

    async run() {
        this.log("=== Real-time Analysis Scribe Test ===", "start");
        
        const connectionOk = await this.testOllamaConnection();
        if (!connectionOk) {
            this.log("Connection test failed. Exiting.", "error");
            process.exit(1);
        }
        
        const generationOk = await this.testSimpleGeneration();
        if (!generationOk) {
            this.log("Generation test failed. Exiting.", "error");
            process.exit(1);
        }
        
        this.log("All tests passed! Real-time scribe is ready.", "success");
    }
}

// Run the test
const scribe = new SimpleRealTimeScribe();
scribe.run().catch(error => {
    console.error("❌ Test failed:", error);
    process.exit(1);
});
