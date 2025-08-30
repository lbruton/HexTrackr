#!/usr/bin/env node
/* eslint-env node */
/* global require, module, __dirname, console, process, setTimeout */

/**
 * Real-Time Memory Scribe
 * 
 * Lightweight real-time monitoring for VS Code chat sessions
 * Uses Ollama qwen2.5-coder:7b for fast analysis
 * Provides continuous logging with actual LLM prompts and responses
 */

require("dotenv").config();
const fs = require("fs").promises;
const path = require("path");
const fetch = require("node-fetch").default || require("node-fetch"); // Add fetch polyfill for Node.js

class RealTimeScribe {
    constructor() {
        this.ollamaBaseUrl = "http://localhost:11434";
        this.model = "qwen2.5-coder:7b";
        this.chatSessionsPath = path.join(
            process.env.HOME,
            "Library/Application Support/Code/User/workspaceStorage"
        );
        this.lastProcessedTime = Date.now();
        this.logDir = path.join(__dirname, "../logs/real-time");
        this.promptLogDir = path.join(__dirname, "../logs/prompts");
        this.responseLogDir = path.join(__dirname, "../logs/responses");
        
        console.log("🔥 Real-Time Memory Scribe Starting");
        console.log("📍 Ollama:", this.ollamaBaseUrl);
        console.log("🤖 Model:", this.model);
        console.log("📁 Monitoring:", this.chatSessionsPath);
        console.log("📝 Logs:", this.logDir);
        console.log("");
    }

    async ensureDirectories() {
        await fs.mkdir(this.logDir, { recursive: true });
        await fs.mkdir(this.promptLogDir, { recursive: true });
        await fs.mkdir(this.responseLogDir, { recursive: true });
    }

    async callOllama(prompt, context = "") {
        const timestamp = new Date().toISOString();
        const promptId = `prompt-${Date.now()}`;
        
        try {
            // Log the actual prompt being sent
            const promptLog = {
                id: promptId,
                timestamp,
                model: this.model,
                prompt: prompt,
                context: context
            };
            
            console.log(`📤 PROMPT [${promptId}]:`, prompt.substring(0, 100) + "...");
            await fs.writeFile(
                path.join(this.promptLogDir, `${promptId}.json`),
                JSON.stringify(promptLog, null, 2)
            );

            const response = await fetch(`${this.ollamaBaseUrl}/api/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: this.model,
                    prompt: prompt,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.status}`);
            }

            const result = await response.json();
            
            // Log the actual response received
            const responseLog = {
                promptId,
                timestamp: new Date().toISOString(),
                model: this.model,
                response: result.response,
                stats: {
                    eval_count: result.eval_count,
                    eval_duration: result.eval_duration,
                    prompt_eval_count: result.prompt_eval_count,
                    prompt_eval_duration: result.prompt_eval_duration
                }
            };
            
            console.log(`📥 RESPONSE [${promptId}]:`, result.response.substring(0, 100) + "...");
            console.log(`⏱️  Stats: ${result.eval_count} tokens in ${Math.round(result.eval_duration/1000000)}ms`);
            
            await fs.writeFile(
                path.join(this.responseLogDir, `${promptId}.json`),
                JSON.stringify(responseLog, null, 2)
            );

            return result.response;

        } catch (error) {
            console.error(`❌ Ollama Error [${promptId}]:`, error.message);
            return null;
        }
    }

    async scanChatSessions() {
        try {
            const workspaces = await fs.readdir(this.chatSessionsPath);
            const newChats = [];

            for (const workspace of workspaces) {
                const chatPath = path.join(this.chatSessionsPath, workspace, "ms-vscode.vscode-copilot", "chatSessions");
                
                try {
                    const chatFiles = await fs.readdir(chatPath);
                    
                    for (const chatFile of chatFiles) {
                        if (!chatFile.endsWith(".json")) {continue;}
                        
                        const fullPath = path.join(chatPath, chatFile);
                        const stats = await fs.stat(fullPath);
                        
                        if (stats.mtime.getTime() > this.lastProcessedTime) {
                            const content = await fs.readFile(fullPath, "utf8");
                            newChats.push({
                                file: chatFile,
                                workspace: workspace,
                                content: content,
                                modified: stats.mtime
                            });
                        }
                    }
                } catch (error) {
                    // Skip workspaces without chat sessions
                    continue;
                }
            }

            return newChats;

        } catch (error) {
            console.error("❌ Error scanning chat sessions:", error.message);
            return [];
        }
    }

    async analyzeChatUpdate(chatData) {
        console.log(`🔍 Analyzing: ${chatData.file} (${chatData.workspace})`);
        
        const prompt = `🧠 REAL-TIME MEMORY ANALYSIS - HexTrackr .rMemory Scribe

You are a sophisticated AI scribe within the HexTrackr .rMemory system, designed to provide comprehensive analysis of VS Code chat sessions for perfect development continuity.

## 📊 ANALYSIS FRAMEWORK

### 1. PROJECT CLASSIFICATION
Classify this conversation by project context:
- **HexTrackr**: Issue tracking + .rMemory system development
- **StackTrackr**: Legacy coin tracking system (numismatic focus)
- **rMemory Legacy**: Historical rEngine ecosystem discussions
- **General Development**: Cross-project or general programming

### 2. CONVERSATION CONTEXT ANALYSIS
- **Session Type**: New feature, debugging, refactoring, planning, architecture
- **Complexity Level**: Simple task, complex implementation, architectural decision
- **Stakeholder Involvement**: Solo development, collaboration, user feedback
- **Urgency Indicators**: Deadline pressure, blocking issues, routine enhancement

### 3. TECHNICAL INSIGHT EXTRACTION
- **Code Changes**: Files modified, new implementations, deletions
- **Architecture Decisions**: Design patterns, technology choices, structural changes
- **Dependencies**: New packages, API integrations, external services
- **Testing Strategy**: Unit tests, integration tests, validation approaches
- **Performance Considerations**: Optimization needs, scaling concerns, bottlenecks

### 4. FRUSTRATION PATTERN DETECTION
Identify and categorize frustrations for learning:
- **Technical Blockers**: API issues, environment problems, configuration errors
- **Process Inefficiencies**: Repetitive tasks, unclear workflows, context switching
- **Tool Limitations**: IDE issues, extension problems, missing features
- **Knowledge Gaps**: Learning needs, documentation gaps, unclear requirements

### 5. CONTINUITY TRACKING
- **Progress Momentum**: What was accomplished, what's next
- **Context Preservation**: Key decisions, rationale, trade-offs made
- **Relationship Building**: Communication patterns, collaboration style
- **Success Patterns**: What approaches worked well

### 6. MEMORY SYNTHESIS
- **Actionable Insights**: Immediate next steps, follow-up actions
- **Learning Opportunities**: Skills to develop, patterns to remember
- **Prevention Strategies**: How to avoid similar frustrations
- **Knowledge Assets**: Reusable solutions, patterns, configurations

## 🎯 CURRENT SESSION DATA

WORKSPACE: ${chatData.workspace}
SESSION FILE: ${chatData.file}
TIMESTAMP: ${new Date().toISOString()}

CHAT CONTENT:
${chatData.content}

## 📝 REQUIRED OUTPUT FORMAT

Provide a comprehensive analysis in this structure:

**PROJECT CLASSIFICATION:** [Project type and confidence level]

**TECHNICAL SUMMARY:**
- Main topics and objectives
- Code changes and implementations
- Architecture decisions made

**FRUSTRATION ANALYSIS:**
- Pain points identified
- Root causes
- Prevention strategies

**CONTINUITY INSIGHTS:**
- Progress achieved
- Context to preserve
- Next logical steps

**MEMORY SYNTHESIS:**
- Key learnings
- Reusable patterns
- Action items

**QUALITY INDICATORS:**
- Collaboration effectiveness
- Decision quality
- Progress momentum

Keep analysis detailed but focused. This will feed into the broader .rMemory system for perfect development continuity.`;

        const analysis = await this.callOllama(prompt, chatData.file);
        
        if (analysis) {
            const result = {
                timestamp: new Date().toISOString(),
                file: chatData.file,
                workspace: chatData.workspace,
                analysis: analysis
            };
            
            console.log(`✅ Analysis complete for ${chatData.file}`);
            return result;
        } else {
            console.log(`⚠️  Analysis failed for ${chatData.file}`);
            return null;
        }
    }

    async run() {
        await this.ensureDirectories();
        
        console.log("🚀 Starting real-time monitoring...");
        console.log("⏰ Checking for updates every 30 seconds");
        console.log("");

        // Real-time monitoring loop
        // eslint-disable-next-line no-constant-condition
        while (true) {
            try {
                const newChats = await this.scanChatSessions();
                
                if (newChats.length > 0) {
                    console.log(`📢 Found ${newChats.length} new/updated chat sessions`);
                    
                    for (const chat of newChats) {
                        const analysis = await this.analyzeChatUpdate(chat);
                        if (analysis) {
                            // Save analysis to timestamped file
                            const filename = `analysis-${Date.now()}.json`;
                            await fs.writeFile(
                                path.join(this.logDir, filename),
                                JSON.stringify(analysis, null, 2)
                            );
                        }
                    }
                    
                    this.lastProcessedTime = Date.now();
                } else {
                    console.log(`⏳ ${new Date().toLocaleTimeString()}: No new updates`);
                }

            } catch (error) {
                console.error("❌ Monitor error:", error.message);
            }

            // Wait 30 seconds before next check
            await new Promise(resolve => setTimeout(resolve, 30000));
        }
    }
}

// Start the real-time scribe
const scribe = new RealTimeScribe();
scribe.run().catch(error => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
});
