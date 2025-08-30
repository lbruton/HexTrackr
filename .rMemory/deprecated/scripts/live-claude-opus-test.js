#!/usr/bin/env node
/* eslint-env node */
/* global require, module, __dirname, console, process, setTimeout */

/**
 * Live Claude Opus 4.1 Test - REAL deep analysis responses
 * Shows actual Claude Opus responses to prove it's working
 * Equivalent to live-ollama-monitor.js but for Claude
 */

require("dotenv").config();
const { Anthropic } = require("@anthropic-ai/sdk");
const fs = require("fs");
const path = require("path");

class LiveClaudeOpusTest {
    constructor() {
        this.model = "claude-opus-4-1-20250805"; // Claude Opus 4.1 with correct format
        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
        this.sessionCount = 0;
    }

    log(message, type = "info") {
        const timestamp = new Date().toLocaleTimeString();
        const colors = {
            info: "\x1b[36m",    // cyan
            success: "\x1b[32m", // green
            error: "\x1b[31m",   // red
            response: "\x1b[35m", // magenta (different from Ollama)
            reset: "\x1b[0m"
        };
        
        const color = colors[type] || colors.info;
        console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
    }

    async testClaudeConnection() {
        try {
            // Simple test to verify API key and model access
            const response = await this.anthropic.messages.create({
                model: this.model,
                max_tokens: 50,
                messages: [
                    { role: "user", content: "Hello, are you Claude Opus 4.1?" }
                ]
            });
            
            return { 
                connected: true, 
                model: this.model,
                response: response.content[0].text 
            };
        } catch (error) {
            return { 
                connected: false, 
                error: error.message 
            };
        }
    }

    async sendPrompt(prompt, maxTokens = 500) {
        const startTime = Date.now();
        this.log(`🧠 Sending to ${this.model}: "${prompt.substring(0, 60)}..."`, "info");

        try {
            const response = await this.anthropic.messages.create({
                model: this.model,
                max_tokens: maxTokens,
                temperature: 0.7,
                messages: [
                    { role: "user", content: prompt }
                ]
            });

            const responseTime = Date.now() - startTime;
            const content = response.content[0].text;
            
            this.log(`⚡ Response received in ${responseTime}ms`, "success");
            this.log(`🎭 Claude Opus says: ${content}`, "response");
            
            return {
                response: content,
                responseTime: responseTime,
                model: this.model,
                usage: response.usage
            };
        } catch (error) {
            throw new Error(`Claude API error: ${error.message}`);
        }
    }

    async runDeepAnalysisDemo() {
        console.log("\n🧠 LIVE CLAUDE OPUS 4.1 TEST - Real deep analysis, no BS");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        
        // Test connection
        const connection = await this.testClaudeConnection();
        if (!connection.connected) {
            this.log(`❌ Claude not accessible: ${connection.error}`, "error");
            process.exit(1);
        }
        
        this.log(`✅ Connected to Claude Opus 4.1: "${connection.response}"`, "success");
        console.log("");

        // Deep analysis prompts to test Claude's reasoning
        const deepPrompts = [
            {
                prompt: "Analyze this development workflow: A team is building a memory system that captures VS Code chat sessions, processes them with AI models (Ollama for real-time, Claude for deep analysis), and stores insights in a Neo4j knowledge graph. What are the key architectural considerations and potential failure points?",
                tokens: 600
            },
            {
                prompt: "You're reviewing code for a system called HexTrackr that combines real-time monitoring, memory persistence, and AI analysis. The system has been producing \"Insufficient content for analysis\" errors. Given this context, what debugging approach would you recommend?",
                tokens: 500
            },
            {
                prompt: "Compare the trade-offs between using Ollama (local, fast, Qwen Code) vs Claude Opus (API, powerful, expensive) for different types of code analysis in a continuous development monitoring system.",
                tokens: 600
            }
        ];

        for (let i = 0; i < deepPrompts.length; i++) {
            this.sessionCount++;
            this.log(`\n🎯 Deep Analysis ${this.sessionCount}/${deepPrompts.length}`, "info");
            
            try {
                const result = await this.sendPrompt(deepPrompts[i].prompt, deepPrompts[i].tokens);
                
                // Save real response to file
                const filename = `.rMemory/docs/ops/deep-analysis/claude-opus-test-${Date.now()}.json`;
                fs.writeFileSync(filename, JSON.stringify({
                    timestamp: new Date().toISOString(),
                    prompt: deepPrompts[i].prompt,
                    response: result.response,
                    responseTime: result.responseTime,
                    model: result.model,
                    usage: result.usage
                }, null, 2));
                
                this.log(`💾 Saved to ${path.basename(filename)}`, "success");
                
            } catch (error) {
                this.log(`❌ Failed: ${error.message}`, "error");
            }
            
            // Wait between requests to respect rate limits
            if (i < deepPrompts.length - 1) {
                this.log("⏳ Waiting 5 seconds...", "info");
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        console.log("\n🎉 Claude Opus 4.1 test complete! Check .rMemory/docs/ops/deep-analysis/ for saved responses");
        console.log("🔄 This proves Claude Opus is working and can generate real deep insights");
    }

    async runMemoryAnalysisTest() {
        console.log("\n🔍 MEMORY ANALYSIS TEST - Testing archaeological capabilities");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        
        const memoryPrompt = `You are analyzing a chat session for a memory system. The session contains technical discussions about:

1. Setting up automated memory systems
2. Debugging terminal launch issues  
3. Integrating Ollama and Claude for different analysis types
4. Converting old chat logs into structured memory

Based on this context, extract:
- Key technical decisions made
- Problems solved and their solutions
- Tools and technologies used
- Next steps or follow-up actions needed

Provide structured insights that could be stored in a knowledge graph.`;

        try {
            const result = await this.sendPrompt(memoryPrompt, 800);
            
            const filename = `.rMemory/docs/ops/deep-analysis/memory-analysis-test-${Date.now()}.json`;
            fs.writeFileSync(filename, JSON.stringify({
                timestamp: new Date().toISOString(),
                type: "memory_analysis_test",
                prompt: memoryPrompt,
                response: result.response,
                responseTime: result.responseTime,
                model: result.model,
                usage: result.usage
            }, null, 2));
            
            this.log(`💾 Memory analysis saved to ${path.basename(filename)}`, "success");
            console.log("\n🧠 This shows Claude can extract structured insights from chat content");
            
        } catch (error) {
            this.log(`❌ Memory analysis failed: ${error.message}`, "error");
        }
    }
}

// Main execution
async function main() {
    const tester = new LiveClaudeOpusTest();
    
    const mode = process.argv[2];
    
    if (mode === "--memory" || mode === "-m") {
        await tester.runMemoryAnalysisTest();
    } else {
        await tester.runDeepAnalysisDemo();
        console.log("\n" + "═".repeat(60));
        await tester.runMemoryAnalysisTest();
    }
}

if (require.main === module) {
    main().catch(console.error);
}
