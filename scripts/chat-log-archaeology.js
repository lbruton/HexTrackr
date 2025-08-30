#!/usr/bin/env node

/**
 * Chat Log Archaeology Tool
 * 
 * Processes VS Code chat sessions to reconstruct project memory
 * Uses Ollama qwen2.5-coder for local processing
 * Feeds extracted insights into Memento MCP for searchable memory
 */

const fs = require("fs").promises;
const path = require("path");
const { spawn } = require("child_process");
const { createReadStream } = require("fs");
const { createInterface } = require("readline");

class ChatLogArchaeologist {
    constructor() {
        this.ollamaModel = "qwen2.5-coder";
        this.chatSessionsPath = path.join(
            process.env.HOME,
            "Library/Application Support/Code/User/workspaceStorage"
        );
        this.outputPath = path.join(__dirname, "../docs/ops/recovered-memories");
        this.batchSize = 5; // Process 5 sessions at a time
    }

    /**
     * Main execution flow
     */
    async excavate() {
        console.log("🏺 Starting Chat Log Archaeology...");
        
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
                
                // Small delay to prevent overwhelming Ollama
                await this.sleep(1000);
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
     * Extract insights from chat data using Ollama
     */
    async extractInsights(chatData, session) {
        try {
            // Prepare conversation text for analysis
            const conversationText = this.formatChatForAnalysis(chatData);
            
            if (!conversationText || conversationText.length < 100) {
                return { error: "Insufficient content for analysis" };
            }

            const prompt = this.createInsightExtractionPrompt(conversationText);
            const analysis = await this.queryOllama(prompt);
            
            return this.parseInsightResponse(analysis);
            
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Format chat data for Ollama analysis
     */
    formatChatForAnalysis(chatData) {
        if (!Array.isArray(chatData)) {return "";}

        return chatData
            .filter(msg => msg.message && msg.message.length > 10)
            .slice(-50) // Last 50 messages to avoid token limits
            .map(msg => {
                const role = msg.variableName === "request" ? "USER" : "ASSISTANT";
                return `${role}: ${msg.message}`;
            })
            .join("\n\n");
    }

    /**
     * Create prompt for insight extraction
     */
    createInsightExtractionPrompt(conversationText) {
        return `Analyze this VS Code chat conversation and extract key insights for project memory:

CONVERSATION:
${conversationText}

Extract and categorize the following as JSON:
{
  "decisions": ["architectural decisions made"],
  "problems_solved": ["technical problems resolved"],
  "code_changes": ["files modified or created"],
  "insights": ["key learnings or discoveries"],
  "context": ["project context or state changes"],
  "next_steps": ["planned actions or follow-ups"],
  "entities": ["important project entities mentioned"],
  "relationships": ["connections between concepts"]
}

Focus on actionable, concrete information. Ignore small talk or routine operations.`;
    }

    /**
     * Query Ollama for analysis
     */
    async queryOllama(prompt) {
        return new Promise((resolve, reject) => {
            let output = "";
            let errorOutput = "";

            const ollama = spawn("ollama", ["run", this.ollamaModel], {
                stdio: ["pipe", "pipe", "pipe"]
            });

            ollama.stdout.on("data", (data) => {
                output += data.toString();
            });

            ollama.stderr.on("data", (data) => {
                errorOutput += data.toString();
            });

            ollama.on("close", (code) => {
                if (code === 0) {
                    resolve(output.trim());
                } else {
                    reject(new Error(`Ollama failed (${code}): ${errorOutput}`));
                }
            });

            ollama.on("error", (error) => {
                reject(new Error(`Failed to start Ollama: ${error.message}`));
            });

            // Send prompt to Ollama
            ollama.stdin.write(prompt + "\n");
            ollama.stdin.end();

            // Timeout after 30 seconds
            setTimeout(() => {
                ollama.kill();
                reject(new Error("Ollama query timeout"));
            }, 30000);
        });
    }

    /**
     * Parse Ollama response into structured insights
     */
    parseInsightResponse(response) {
        try {
            // Try to extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            
            // Fallback: treat as plain text summary
            return {
                summary: response,
                extracted_at: new Date().toISOString()
            };
            
        } catch (error) {
            return {
                raw_response: response,
                parse_error: error.message,
                extracted_at: new Date().toISOString()
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
        const totalCodeChanges = memories.reduce((acc, m) => 
            acc + (m.insights?.code_changes?.length || 0), 0);

        return {
            sessions_processed: memories.length,
            decisions_extracted: totalDecisions,
            problems_solved: totalProblems,
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
        return `# Chat Log Archaeology Report

Generated: ${report.generated_at}

## Summary

- **Sessions Processed**: ${report.summary.sessions_processed}
- **Decisions Extracted**: ${report.summary.decisions_extracted}
- **Problems Solved**: ${report.summary.problems_solved}
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
    const archaeologist = new ChatLogArchaeologist();
    
    archaeologist.excavate()
        .then(() => {
            console.log("🎉 Archaeology complete! Your memory has been reconstructed.");
            process.exit(0);
        })
        .catch(error => {
            console.error("💥 Archaeology failed:", error);
            process.exit(1);
        });
}

module.exports = { ChatLogArchaeologist };
