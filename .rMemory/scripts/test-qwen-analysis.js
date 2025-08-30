#!/usr/bin/env node

/**
 * Test Qwen Code Analysis
 * Creates sample activity and shows Qwen's actual responses
 */

const http = require("http");

class QwenTester {
    constructor() {
        this.ollamaHost = "localhost";
        this.ollamaPort = 11434;
        this.model = "qwen2.5-coder:7b";
    }

    async sendToOllama(prompt) {
        return new Promise((resolve, reject) => {
            const postData = JSON.stringify({
                model: this.model,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.7,
                    top_p: 0.9
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
                        resolve(result.response || "No response");
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

    async testDevelopmentAnalysis() {
        console.log("🧪 Testing Qwen Code Analysis with Sample Development Activity");
        console.log("═══════════════════════════════════════════════════════════════");

        const sampleActivity = `Recent VS Code Chat Session:

User: I'm working on the HexTrackr project and need to implement automated memory scribes for the .rMemory system. We want to capture development insights in real-time using Ollama.

GitHub Copilot: Perfect! Let me help you set up the real-time analysis scribe. We'll use qwen2.5-coder:7b for better code understanding and create a monitoring system that runs every 30 seconds.

User: Great! I also need the memory import workflow to process the queue and send insights to Memento MCP for persistent storage.

GitHub Copilot: Excellent! I'll create the complete workflow: real-time monitoring → queue processing → Memento MCP import. This will give you perfect continuity between chat sessions.`;

        const prompt = `Analyze this recent development chat session for key insights:

${sampleActivity}

Provide a brief analysis focused on:
1. Current development focus/task
2. Technical decisions being made  
3. Problems being solved
4. Next likely steps

Keep response concise and actionable (max 200 words).`;

        try {
            console.log("📤 Sending to Qwen Code 7B...");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            
            const startTime = Date.now();
            const response = await this.sendToOllama(prompt);
            const duration = Date.now() - startTime;
            
            console.log("📥 Qwen Code Response:");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log(response);
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log(`⏱️  Response time: ${duration}ms`);
            console.log("✅ Test complete! This shows what the real-time scribe will capture.");
            
        } catch (error) {
            console.error("❌ Test failed:", error.message);
        }
    }
}

// Run test
async function main() {
    const tester = new QwenTester();
    await tester.testDevelopmentAnalysis();
}

main();
