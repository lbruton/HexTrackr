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
        this.model = "claude-3-5-sonnet-20241022"; // Using current Sonnet model 
        this.chatSessionsPath = path.join(
            process.env.HOME,
            "Library/Application Support/Code/User/workspaceStorage"
        );
        this.outputPath = path.join(__dirname, "../docs/ops/recovered-memories");
        this.batchSize = 3; // Increased batch size for Sonnet efficiency
        this.mementoTools = true; // Use Memento MCP for direct integration
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
            } catch (_error) {
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
    async extractInsights(chatData, _session) {
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
     * Create prompt for insight extraction using comprehensive memory analysis framework
     */
    createInsightExtractionPrompt(conversationText) {
        
        return `You are an expert memory analyst for the HexTrackr project following the comprehensive memory analysis framework.

## Conversation Data to Analyze
${conversationText}

## Analysis Instructions
Process this VS Code chat conversation to identify:
1. **Technical Decisions** - Architecture choices, technology selections, design patterns
2. **Problem Solutions** - Bug fixes, implementation strategies, workarounds  
3. **Code Insights** - Function discoveries, API integrations, security patterns
4. **Process Knowledge** - Workflows, tool configurations, deployment procedures
5. **Project Context** - Goals, constraints, user requirements, business logic

## Required Output Format
Structure your analysis as JSON entities for Memento MCP:

{
  "entities": [
    {
      "name": "Technical Decision: [Brief Description]",
      "entityType": "technical_decision",
      "observations": [
        "Decision: [What was decided]",
        "Rationale: [Why this was chosen]",
        "Implementation: [How it was implemented]",
        "Impact: [Effect on project]",
        "Date: [When this occurred]"
      ]
    },
    {
      "name": "Problem Solution: [Brief Description]", 
      "entityType": "problem_solution",
      "observations": [
        "Problem: [Issue description]",
        "Cause: [Root cause analysis]",
        "Solution: [How it was resolved]",
        "Prevention: [How to avoid future occurrence]",
        "Context": [Related information]"
      ]
    },
    {
      "name": "Code Discovery: [Function/API/Pattern Name]",
      "entityType": "code_knowledge", 
      "observations": [
        "Type: [Function/API/Library/Pattern]",
        "Purpose: [What it does]",
        "Usage: [How to use it]",
        "Integration: [How it fits with other code]",
        "Notes: [Important considerations]"
      ]
    },
    {
      "name": "Process Knowledge: [Workflow/Tool/Configuration]",
      "entityType": "process_knowledge",
      "observations": [
        "Process: [What workflow or procedure]",
        "Steps: [How to execute]", 
        "Tools: [Required tools or dependencies]",
        "Gotchas: [Common pitfalls or important notes]",
        "Context": [When to use this process]"
      ]
    }
  ]
}

## Quality Standards
- **Be Specific**: Include exact function names, file paths, command syntax
- **Capture Context**: Explain why decisions were made, not just what was done
- **Link Relationships**: Note how different decisions/solutions relate to each other
- **Preserve Rationale**: The thinking behind choices is as important as the choices themselves

Focus on conversations that contain architecture decisions, problem-solving sessions, tool configurations, code implementations, or process improvements. Skip pure social interaction or off-topic discussions.

Your analysis feeds directly into Memento MCP for persistent knowledge storage that will help future AI assistants understand the reasoning and context behind technical decisions.`;
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
            // Try to extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.warn("⚠️  No JSON found in response");
                return null;
            }

            const parsed = JSON.parse(jsonMatch[0]);
            
            // Validate the expected structure from our comprehensive prompt
            if (!parsed.entities || !Array.isArray(parsed.entities)) {
                console.warn("⚠️  Response missing entities array");
                return null;
            }

            // Return the entities directly for Memento MCP
            return parsed;
            
        } catch (error) {
            console.warn("⚠️  Failed to parse insight response:", error.message);
            return null;
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
     * Create Memento import file and directly integrate with Memento MCP
     */
    async createMementoImport(memories) {
        console.log("📊 Creating Memento MCP integration...");
        
        const allEntities = [];
        const relations = [];

        // Process each memory session
        memories.forEach(session => {
            if (!session.insights?.entities) {return;}

            // Add entities from the comprehensive analysis
            session.insights.entities.forEach(entity => {
                // Enhance entity with session context
                const enhancedEntity = {
                    ...entity,
                    observations: [
                        ...entity.observations,
                        `Source: VS Code Chat Session ${session.sessionId}`,
                        `Workspace: ${session.workspace}`,
                        `Extracted: ${new Date().toISOString()}`
                    ]
                };
                allEntities.push(enhancedEntity);
            });

            // Create a session entity to track the source
            const sessionEntity = {
                name: `Chat Session ${session.sessionId}`,
                entityType: "chat_session",
                observations: [
                    `Processed ${session.messageCount || 0} messages`,
                    `Workspace: ${session.workspace}`,
                    `Timestamp: ${session.timestamp}`,
                    `Entities extracted: ${session.insights.entities.length}`
                ]
            };
            allEntities.push(sessionEntity);

            // Create relations between session and extracted entities
            session.insights.entities.forEach(entity => {
                relations.push({
                    from: sessionEntity.name,
                    to: entity.name,
                    relationshipType: "extracted_from",
                    observations: [`Extracted from chat analysis on ${new Date().toISOString()}`]
                });
            });
        });

        const importData = {
            type: "comprehensive_chat_analysis",
            generated_at: new Date().toISOString(),
            entities: allEntities,
            relations,
            summary: {
                total_entities: allEntities.length,
                total_relations: relations.length,
                sessions_processed: memories.length
            }
        };

        // Save to file for backup
        const importPath = path.join(this.outputPath, "memento-comprehensive-import.json");
        await fs.writeFile(importPath, JSON.stringify(importData, null, 2));
        
        console.log(`💾 Saved ${allEntities.length} entities to ${importPath}`);
        console.log("🔄 TODO: Integrate with Memento MCP to store entities directly in Neo4j");
        
        return importData;
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
