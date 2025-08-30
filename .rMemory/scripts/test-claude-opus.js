#!/usr/bin/env node

/**
 * Live Claude Opus Test - Verify deep analysis capabilities
 * Tests Claude Opus model for chat session analysis
 * Equivalent to live-ollama-monitor.js but for Claude
 */

require("dotenv").config();
const { Anthropic } = require("@anthropic-ai/sdk");
const fs = require("fs");
const path = require("path");

class LiveClaudeOpusTest {
    constructor() {
        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
        this.model = "claude-3-5-haiku-20241022"; // Latest available Claude model
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

    async testConnection() {
        try {
            const response = await this.anthropic.messages.create({
                model: this.model,
                max_tokens: 100,
                temperature: 0.1,
                messages: [{
                    role: "user",
                    content: "Test connection. Reply with 'Claude 3.5 Sonnet operational' and current capabilities."
                }]
            });
            
            return {
                connected: true,
                response: response.content[0].text,
                model: this.model
            };
        } catch (error) {
            return {
                connected: false,
                error: error.message
            };
        }
    }

    async sendPrompt(prompt) {
        const startTime = Date.now();
        
        try {
            this.log(`🤖 Sending to ${this.model}: "${prompt.substring(0, 60)}..."`, "info");

            const response = await this.anthropic.messages.create({
                model: this.model,
                max_tokens: 2000,
                temperature: 0.3,
                messages: [{
                    role: "user",
                    content: prompt
                }]
            });

            const responseTime = Date.now() - startTime;
            const responseText = response.content[0].text;
            
            this.log(`⚡ Response received in ${responseTime}ms`, "success");
            this.log(`📝 Claude Opus says: ${responseText}`, "response");
            
            return {
                response: responseText,
                responseTime: responseTime,
                model: this.model
            };
        } catch (error) {
            throw new Error(`Claude Opus failed: ${error.message}`);
        }
    }

    async runDeepAnalysisDemo() {
        console.log("\n🧠 CLAUDE 3.5 SONNET DEEP ANALYSIS TEST");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        
        // Test connection
        const connection = await this.testConnection();
        if (!connection.connected) {
            this.log(`❌ Claude Opus not accessible: ${connection.error}`, "error");
            process.exit(1);
        }
        
        this.log(`✅ Connected to ${this.model}`, "success");
        this.log(`🔗 Test response: ${connection.response}`, "info");
        console.log("");

        // Demo prompts for chat session analysis capabilities
        const analysisPrompts = [
            `Analyze this simulated VS Code chat session for deep insights:

User: "I'm struggling with memory management in this Node.js app"
Assistant: "Let's examine your current approach..."
User: "The garbage collector seems to be running too frequently"
Assistant: "That suggests potential memory leaks. Let me help debug..."

Extract: 1) Technical decisions, 2) Problems solved, 3) Knowledge gaps, 4) Next steps`,

            `Deep pattern analysis of this development conversation:

Developer: "Should we use Redis or Memcached for caching?"
Assistant: "Consider your specific needs..."
Developer: "We need persistence and complex data structures"
Assistant: "Redis would be better suited..."

Identify: 1) Architectural choices, 2) Trade-offs discussed, 3) Decision rationale`,

            `Retrospective analysis of this coding session:

"Spent 3 hours debugging TypeScript compilation errors"
"Finally realized it was a missing type definition"
"Fixed by adding @types/node package"
"All tests now pass"

Extract: 1) Frustrations, 2) Solutions discovered, 3) Learning outcomes`,
        ];

        for (let i = 0; i < analysisPrompts.length; i++) {
            this.sessionCount++;
            this.log(`\n🎯 Deep Analysis Demo ${this.sessionCount}/3`, "info");
            
            try {
                const result = await this.sendPrompt(analysisPrompts[i]);
                
                // Save analysis to file
                const filename = `.rMemory/docs/ops/deep-analysis/claude-demo-${Date.now()}.json`;
                const dir = path.dirname(filename);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                
                fs.writeFileSync(filename, JSON.stringify({
                    timestamp: new Date().toISOString(),
                    prompt: analysisPrompts[i],
                    analysis: result.response,
                    responseTime: result.responseTime,
                    model: result.model,
                    type: "deep-analysis-demo"
                }, null, 2));
                
                this.log(`💾 Analysis saved to ${path.basename(filename)}`, "success");
                
            } catch (error) {
                this.log(`❌ Failed: ${error.message}`, "error");
            }
            
            // Wait between requests
            if (i < analysisPrompts.length - 1) {
                this.log("⏳ Waiting 2 seconds...", "info");
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        console.log("\n🎉 Claude Opus deep analysis demo complete!");
        console.log("📊 Check .rMemory/docs/ops/deep-analysis/ for saved analyses");
        console.log("🧠 This proves Claude 3.5 Sonnet can perform high-quality retrospective analysis");
    }
}

// Main execution
async function main() {
    const tester = new LiveClaudeOpusTest();
    await tester.runDeepAnalysisDemo();
}

if (require.main === module) {
    main().catch(console.error);
}
