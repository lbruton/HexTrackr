#!/usr/bin/env node
/* eslint-env node */
/* global require, module, __dirname, console, process, setTimeout */

/**
 * Deep Chat Analysis Scribe
 * 
 * High-quality retrospective analysis of VS Code chat sessions
 * Uses Claude Opus for comprehensive insight extraction and memory reconstruction
 * Part of HexTrackr .rMemory scribes system for advanced memory processing
 */

require("dotenv").config();
const { Anthropic } = require("@anthropic-ai/sdk");
const fs = require("fs").promises;
const path = require("path");

class DeepChatAnalysisScribe {
    constructor() {
        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
        this.model = "claude-opus-4-1-20250805"; // Latest Claude Opus 4.1 with correct format
        this.chatSessionsPath = path.join(
            process.env.HOME,
            "Library/Application Support/Code/User/workspaceStorage"
        );
        this.outputPath = path.join(__dirname, "../docs/ops/recovered-memories");
        this.batchSize = 1; // Reduced batch size for Opus processing
    }

    /**
     * Main execution flow
     */
    async excavate() {
        console.log("🔍 Starting Deep Chat Analysis with Claude Opus...");
        console.log("📊 Mode: Retrospective high-quality analysis");
        
        try {
            // Ensure output directory exists
            await this.ensureOutputDirectory();
            
            // Find HexTrackr workspace chat sessions
            const chatSessions = await this.findChatSessions();
            console.log(`📁 Found ${chatSessions.length} chat sessions`);
            
            // Process sessions in batches
            const memories = [];
            for (let i = 0; i < chatSessions.length; i += this.batchSize) {
                const batch = chatSessions.slice(i, i + this.batchSize);
                console.log(`🔍 Processing batch ${Math.floor(i/this.batchSize) + 1}...`);
                
                const batchMemories = await this.processBatch(batch);
                memories.push(...batchMemories);
                
                // Small delay to prevent overwhelming Claude API
                await this.sleep(2000);
            }
            
            // Create consolidated memory report
            await this.createMemoryReport(memories);
            
            // Generate Memento import file
            await this.createMementoImport(memories);
            
            console.log("✅ Archaeology complete! Memory reconstructed.");
            console.log(`📊 Extracted ${memories.length} memory entities`);
            console.log(`📁 Reports saved to: ${this.outputPath}`);
            
        } catch (error) {
            console.error("❌ Archaeology failed:", error.message);
            throw error;
        }
    }

    /**
     * Find VS Code chat sessions for HexTrackr workspace
     */
    async findChatSessions() {
        const workspaces = await fs.readdir(this.chatSessionsPath);
        const sessions = [];

        for (const workspace of workspaces) {
            const chatPath = path.join(this.chatSessionsPath, workspace, "chatSessions");
            
            try {
                const stats = await fs.stat(chatPath);
                if (stats.isDirectory()) {
                    const files = await fs.readdir(chatPath);
                    const jsonFiles = files
                        .filter(f => f.endsWith(".json"))
                        .map(f => ({
                            workspace,
                            file: f,
                            path: path.join(chatPath, f)
                        }));
                    
                    sessions.push(...jsonFiles);
                }
            } catch (error) {
                // Skip if chatSessions doesn't exist
                continue;
            }
        }

        // Sort by modification time (newest first)
        const sessionsWithStats = await Promise.all(
            sessions.map(async (session) => {
                const stats = await fs.stat(session.path);
                return { ...session, mtime: stats.mtime };
            })
        );

        return sessionsWithStats
            .sort((a, b) => b.mtime - a.mtime)
            .slice(0, 20); // Limit to 20 most recent sessions
    }

    /**
     * Process a batch of chat sessions
     */
    async processBatch(sessionBatch) {
        const batchPromises = sessionBatch.map(session => this.processSession(session));
        const results = await Promise.allSettled(batchPromises);
        
        return results
            .filter(result => result.status === "fulfilled")
            .map(result => result.value)
            .filter(Boolean);
    }

    /**
     * Process individual chat session
     */
    async processSession(session) {
        try {
            console.log(`  📝 Processing ${session.file}...`);
            
            const chatData = await this.loadChatSession(session.path);
            if (!chatData) {return null;}

            // Extract key insights using Ollama
            const insights = await this.extractInsights(chatData, session);
            
            return {
                sessionId: session.file.replace(".json", ""),
                workspace: session.workspace,
                timestamp: session.mtime,
                insights,
                messageCount: chatData.length || 0
            };
            
        } catch (error) {
            console.warn(`⚠️  Failed to process ${session.file}:`, error.message);
            return null;
        }
    }

    /**
     * Load and parse chat session JSON
     */
    async loadChatSession(sessionPath) {
        try {
            const content = await fs.readFile(sessionPath, "utf8");
            const data = JSON.parse(content);
            
            // Extract messages from VS Code chat format
            if (data.requests && Array.isArray(data.requests)) {
                return data.requests;
            }
            
            return null;
        } catch (error) {
            console.warn(`Failed to load ${sessionPath}:`, error.message);
            return null;
        }
    }

    /**
     * Extract insights from chat data using Claude API
     */
    async extractInsights(chatData, session) {
        try {
            // Prepare conversation text for analysis
            const conversationText = this.formatChatForAnalysis(chatData);
            
            if (!conversationText || conversationText.length < 100) {
                return { error: "Insufficient content for analysis" };
            }

            const prompt = this.createInsightExtractionPrompt(conversationText);
            const analysis = await this.queryClaude(prompt);
            
            return this.parseInsightResponse(analysis);
            
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Format chat data for Claude analysis (larger context window)
     */
    formatChatForAnalysis(chatData) {
        if (!Array.isArray(chatData)) {return "";}

        const messages = [];
        
        for (const item of chatData) {
            // Add user message
            if (item.message && item.message.text) {
                const userText = item.message.text.trim();
                if (userText.length > 10) {
                    messages.push(`USER: ${userText}`);
                }
            }
            
            // Add assistant response
            if (item.response && Array.isArray(item.response)) {
                const responseTexts = item.response
                    .filter(r => r.value && typeof r.value === "string")
                    .map(r => r.value.trim())
                    .filter(text => text.length > 10);
                
                for (const responseText of responseTexts) {
                    messages.push(`ASSISTANT: ${responseText}`);
                }
            }
        }

        return messages
            .slice(-100) // Last 100 messages - Claude can handle more than Ollama
            .join("\n\n");
    }

    /**
     * Create prompt for insight extraction (optimized for Claude) with project classification
     */
    createInsightExtractionPrompt(conversationText) {
        return `You are an expert AI assistant analyzing VS Code chat conversations to extract key insights for project memory reconstruction. 

CONVERSATION TO ANALYZE:
${conversationText}

First, identify which project this conversation belongs to based on context clues:
- **HexTrackr**: Task tracking, project management, Docker, Neo4j, .rMemory system, Memento MCP
- **StackTrackr**: Precious metals tracking, financial data, market analysis
- **rMemory**: Memory system development, AI embeddings, chat analysis tools, agent systems
- **Legacy rMemory**: Historical rEngine, rAgents, rScribe, rMemories ecosystem (mark as "rMemory")

For legacy content, look for references to: rEngine, rAgents, rScribe, rMemories, or similar r-prefixed tools.
All legacy rMemory ecosystem content should be classified as "rMemory" project.

Extract and categorize the following information as valid JSON:

{
  "project_classification": {
    "primary_project": "HexTrackr|StackTrackr|rMemory|Unknown",
    "confidence": 0.95,
    "legacy_detected": false,
    "context_clues": ["specific terms, file paths, or concepts that indicated the project"]
  },
  "decisions": ["specific architectural or technical decisions made"],
  "problems_solved": ["concrete technical problems that were resolved"],
  "frustrations": [
    {
      "issue": "specific frustration or pain point encountered",
      "category": "build_error|import_issue|config_problem|syntax_error|logic_bug|performance|deployment|testing|documentation|tooling",
      "time_impact": "immediate|minutes|hours|recurring",
      "resolution_status": "solved|workaround|unresolved"
    }
  ],
  "code_changes": ["files, functions, or components modified/created"],
  "insights": ["key learnings, discoveries, or realizations"],
  "context": ["important project context or state changes"],
  "next_steps": ["planned actions, follow-ups, or future work"],
  "entities": ["important project entities, tools, or components mentioned"],
  "relationships": ["connections between concepts, dependencies, or workflows"],
  "timeline": ["chronological sequence of major events in this session"]
}

Guidelines:
- Project classification is CRITICAL - analyze file paths, terminology, and context carefully
- Focus on actionable, concrete information that would help future developers understand what happened
- CAPTURE FRUSTRATIONS: Extract any pain points, blockers, errors, or time-wasting issues encountered
- Ignore small talk, routine operations, or basic troubleshooting
- Prioritize decisions, code changes, problem resolutions, and frustration patterns
- Extract specific file names, function names, and technical details when mentioned
- Identify patterns, workflows, or methodologies discussed
- Note any architectural patterns, design decisions, or best practices established

Return ONLY the JSON object, no additional text.`;
    }

    /**
     * Query Claude API for analysis
     */
    async queryClaude(prompt) {
        try {
            const response = await this.anthropic.messages.create({
                model: this.model,
                max_tokens: 2000,
                temperature: 0.1,
                messages: [{
                    role: "user",
                    content: prompt
                }]
            });

            return response.content[0].text;
            
        } catch (error) {
            throw new Error(`Claude API failed: ${error.message}`);
        }
    }

    /**
     * Parse Claude response into structured insights
     */
    parseInsightResponse(response) {
        try {
            // Claude typically provides better structured JSON responses
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    ...parsed,
                    extracted_at: new Date().toISOString(),
                    source: "claude-api"
                };
            }
            
            // Fallback: treat as plain text summary
            return {
                summary: response,
                extracted_at: new Date().toISOString(),
                source: "claude-api"
            };
            
        } catch (error) {
            return {
                raw_response: response,
                parse_error: error.message,
                extracted_at: new Date().toISOString(),
                source: "claude-api"
            };
        }
    }

    /**
     * Create consolidated memory report
     */
    async createMemoryReport(memories) {
        const report = {
            generated_at: new Date().toISOString(),
            total_sessions: memories.length,
            summary: this.generateSummary(memories),
            sessions: memories
        };

        const reportPath = path.join(this.outputPath, "archaeology-report.json");
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
        
        // Also create human-readable markdown
        const markdown = this.generateMarkdownReport(report);
        const mdPath = path.join(this.outputPath, "archaeology-report.md");
        await fs.writeFile(mdPath, markdown);
    }

    /**
     * Generate summary statistics
     */
    generateSummary(memories) {
        const totalDecisions = memories.reduce((acc, m) => 
            acc + (m.insights?.decisions?.length || 0), 0);
        const totalProblems = memories.reduce((acc, m) => 
            acc + (m.insights?.problems_solved?.length || 0), 0);
        const totalFrustrations = memories.reduce((acc, m) => 
            acc + (m.insights?.frustrations?.length || 0), 0);
        const totalCodeChanges = memories.reduce((acc, m) => 
            acc + (m.insights?.code_changes?.length || 0), 0);

        return {
            sessions_processed: memories.length,
            decisions_extracted: totalDecisions,
            problems_solved: totalProblems,
            frustrations_captured: totalFrustrations,
            code_changes_tracked: totalCodeChanges,
            oldest_session: memories.length > 0 ? 
                Math.min(...memories.map(m => new Date(m.timestamp))) : null,
            newest_session: memories.length > 0 ? 
                Math.max(...memories.map(m => new Date(m.timestamp))) : null
        };
    }

    /**
     * Generate markdown report
     */
    generateMarkdownReport(report) {
        return `# Deep Chat Analysis Report

Generated: ${report.generated_at}

## Summary

- **Sessions Processed**: ${report.summary.sessions_processed}
- **Decisions Extracted**: ${report.summary.decisions_extracted}
- **Problems Solved**: ${report.summary.problems_solved}
- **Frustrations Captured**: ${report.summary.frustrations_captured}
- **Code Changes**: ${report.summary.code_changes_tracked}

## Session Details

${report.sessions.map(session => `
### Session ${session.sessionId}

**Timestamp**: ${session.timestamp}  
**Messages**: ${session.messageCount}  
**Workspace**: ${session.workspace}

${session.insights?.decisions ? `
**Decisions Made**:
${session.insights.decisions.map(d => `- ${d}`).join("\n")}
` : ""}

${session.insights?.problems_solved ? `
**Problems Solved**:
${session.insights.problems_solved.map(p => `- ${p}`).join("\n")}
` : ""}

${session.insights?.frustrations ? `
**Frustrations Encountered**:
${session.insights.frustrations.map(f => `- ${f.issue} (${f.category}, ${f.time_impact} impact, ${f.resolution_status})`).join("\n")}
` : ""}

${session.insights?.code_changes ? `
**Code Changes**:
${session.insights.code_changes.map(c => `- ${c}`).join("\n")}
` : ""}

---
`).join("\n")}
`;
    }

    /**
     * Create Memento import file
     */
    async createMementoImport(memories) {
        const entities = [];
        const relations = [];

        memories.forEach(session => {
            if (!session.insights) {return;}

            // Create session entity
            const sessionEntity = {
                name: `Chat Session ${session.sessionId}`,
                entityType: "chat_session",
                observations: [
                    `Processed ${session.messageCount} messages`,
                    `Workspace: ${session.workspace}`,
                    `Timestamp: ${session.timestamp}`
                ]
            };

            if (session.insights.decisions) {
                sessionEntity.observations.push(...session.insights.decisions.map(d => `Decision: ${d}`));
            }

            if (session.insights.problems_solved) {
                sessionEntity.observations.push(...session.insights.problems_solved.map(p => `Solved: ${p}`));
            }

            if (session.insights.frustrations) {
                sessionEntity.observations.push(...session.insights.frustrations.map(f => 
                    `Frustration: ${f.issue} [${f.category}] - ${f.time_impact} impact, ${f.resolution_status}`
                ));
            }

            entities.push(sessionEntity);
        });

        const importData = {
            type: "chat_archaeology_import",
            generated_at: new Date().toISOString(),
            entities,
            relations
        };

        const importPath = path.join(this.outputPath, "memento-import.json");
        await fs.writeFile(importPath, JSON.stringify(importData, null, 2));
    }

    /**
     * Ensure output directory exists
     */
    async ensureOutputDirectory() {
        try {
            await fs.mkdir(this.outputPath, { recursive: true });
        } catch (error) {
            if (error.code !== "EEXIST") {throw error;}
        }
    }

    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// CLI interface
if (require.main === module) {
    const scribe = new DeepChatAnalysisScribe();
    
    scribe.excavate()
        .then(() => {
            console.log("🎉 Deep analysis complete! High-quality insights extracted.");
            process.exit(0);
        })
        .catch(error => {
            console.error("💥 Deep analysis failed:", error);
            process.exit(1);
        });
}

module.exports = { DeepChatAnalysisScribe };
