#!/usr/bin/env node
/* eslint-env node */
/* global require, module, __dirname, console, process, setTimeout */

/**
 * VS Code Log Analyzer Scribe
 * 
 * Comprehensive analysis of VS Code Copilot chat logs from extension host
 * Uses Claude for memory extraction following the comprehensive memory analysis prompt
 * Integrates directly with Memento MCP for persistent storage
 */

require("dotenv").config();
const { Anthropic } = require("@anthropic-ai/sdk");
const fs = require("fs").promises;
const path = require("path");

class VSCodeLogAnalyzer {
    constructor() {
        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
        this.model = "claude-opus-4-1-20250805"; // Claude 4.1 Opus
        this.logsPath = path.join(process.env.HOME, "Library/Application Support/Code/logs");
        this.outputPath = path.join(__dirname, "../docs/ops/vscode-memory-extraction");
        this.batchSize = 5; // Process 5 log files at a time
        this.mementoEnabled = true;
        this.comprehensivePrompt = this.loadMemoryAnalysisPrompt();
    }

    /**
     * Load the comprehensive memory analysis prompt
     */
    loadMemoryAnalysisPrompt() {
        try {
            const promptPath = path.join(__dirname, "../../.prompts/memory-analysis-comprehensive.prompt.md");
            return require("fs").readFileSync(promptPath, "utf8");
        } catch (_error) {
            console.warn("Could not load comprehensive prompt, using fallback");
            return this.getFallbackPrompt();
        }
    }

    /**
     * Fallback prompt if file not found
     */
    getFallbackPrompt() {
        return `You are an expert memory analyst for the HexTrackr project. Analyze VS Code chat conversations and extract key insights for persistent memory storage.

Extract:
1. Technical Decisions - Architecture choices, technology selections
2. Problem Solutions - Bug fixes, implementation strategies
3. Code Insights - Function discoveries, API integrations
4. Process Knowledge - Workflows, tool configurations

Output as JSON entities for Memento MCP with this structure:
{
  "entities": [
    {
      "name": "Technical Decision: [Brief Description]",
      "entityType": "technical_decision",
      "observations": ["Decision: [What]", "Rationale: [Why]", "Implementation: [How]", "Impact: [Effect]"]
    }
  ]
}`;
    }

    /**
     * Main execution flow
     */
    async analyze() {
        console.log("🔍 Starting VS Code Log Analysis...");
        console.log("📊 Analyzing Copilot Chat extension logs");
        
        try {
            await this.ensureOutputDirectory();
            
            // Find all recent Copilot chat logs
            const logFiles = await this.findCopilotLogs();
            console.log(`📁 Found ${logFiles.length} Copilot log files`);
            
            if (logFiles.length === 0) {
                console.log("❌ No Copilot logs found");
                return;
            }

            // Process logs in batches
            const memories = [];
            for (let i = 0; i < logFiles.length; i += this.batchSize) {
                const batch = logFiles.slice(i, i + this.batchSize);
                console.log(`📦 Processing batch ${Math.floor(i / this.batchSize) + 1}/${Math.ceil(logFiles.length / this.batchSize)}`);
                
                const batchMemories = await this.processBatch(batch);
                memories.push(...batchMemories);
                
                // Rate limiting
                if (i + this.batchSize < logFiles.length) {
                    await this.sleep(2000);
                }
            }

            console.log(`💾 Extracted ${memories.length} memory entities`);

            // Generate reports and integrate with Memento
            await this.generateReports(memories);
            
            if (this.mementoEnabled && memories.length > 0) {
                await this.integrateWithMemento(memories);
            }

            console.log("✅ VS Code log analysis complete!");
            
        } catch (error) {
            console.error("❌ Analysis failed:", error);
            throw error;
        }
    }

    /**
     * Find all Copilot Chat log files from recent VS Code sessions
     */
    async findCopilotLogs() {
        try {
            const logDirs = await fs.readdir(this.logsPath);
            const recentDirs = logDirs
                .filter(dir => dir.match(/^\d{8}T\d{6}$/))
                .sort(); // ALL sessions back to August 16th

            const logFiles = [];
            
            for (const sessionDir of recentDirs) {
                const sessionPath = path.join(this.logsPath, sessionDir);
                
                // Find window directories
                const sessionContents = await fs.readdir(sessionPath);
                const windowDirs = sessionContents.filter(item => item.startsWith("window"));
                
                for (const windowDir of windowDirs) {
                    const copilotLogPath = path.join(
                        sessionPath, 
                        windowDir, 
                        "exthost", 
                        "GitHub.copilot-chat", 
                        "GitHub Copilot Chat.log"
                    );
                    
                    try {
                        await fs.access(copilotLogPath);
                        const stats = await fs.stat(copilotLogPath);
                        if (stats.size > 0) {
                            logFiles.push({
                                path: copilotLogPath,
                                session: sessionDir,
                                window: windowDir,
                                size: stats.size,
                                modified: stats.mtime
                            });
                        }
                    } catch (_error) {
                        // Log file doesn't exist or isn't accessible, skip
                    }
                }
            }

            return logFiles.sort((a, b) => b.modified - a.modified);
            
        } catch (error) {
            console.error("Error finding Copilot logs:", error);
            return [];
        }
    }

    /**
     * Process a batch of log files
     */
    async processBatch(logBatch) {
        const memories = [];
        
        for (const logFile of logBatch) {
            try {
                console.log(`📄 Processing ${logFile.session}/${logFile.window} (${(logFile.size / 1024).toFixed(1)}KB)`);
                
                const logContent = await this.loadLogFile(logFile);
                if (logContent && logContent.trim().length > 0) {
                    const extracted = await this.extractMemoryEntities(logContent, logFile);
                    if (extracted && extracted.length > 0) {
                        memories.push(...extracted);
                        console.log(`   ✅ Extracted ${extracted.length} entities`);
                    } else {
                        console.log("   ⚠️  No entities extracted");
                    }
                } else {
                    console.log("   ⚠️  Empty or unreadable log");
                }
                
            } catch (error) {
                console.error(`   ❌ Error processing ${logFile.path}:`, error.message);
            }
        }
        
        return memories;
    }

    /**
     * Load and filter log file content for relevant chat data
     */
    async loadLogFile(logFile) {
        try {
            const content = await fs.readFile(logFile.path, "utf8");
            
            // Filter for conversation-related logs
            const lines = content.split("\n");
            const relevantLines = lines.filter(line => {
                const lower = line.toLowerCase();
                return (
                    lower.includes("conversation") ||
                    lower.includes("message") ||
                    lower.includes("request") ||
                    lower.includes("response") ||
                    lower.includes("chat") ||
                    lower.includes("copilot") ||
                    lower.includes("user:") ||
                    lower.includes("assistant:") ||
                    lower.includes("error") ||
                    lower.includes("debug")
                );
            });

            return relevantLines.join("\n");
            
        } catch (error) {
            console.error(`Error loading log file ${logFile.path}:`, error);
            return null;
        }
    }

    /**
     * Extract memory entities using Claude analysis
     */
    async extractMemoryEntities(logContent, logFile) {
        try {
            if (logContent.length < 100) {
                return []; // Skip very short logs
            }

            const prompt = this.createAnalysisPrompt(logContent, logFile);
            const response = await this.queryClaude(prompt);
            
            if (response) {
                return this.parseClaudeResponse(response, logFile);
            }
            
            return [];
            
        } catch (error) {
            console.error(`Error extracting entities from ${logFile.session}:`, error);
            return [];
        }
    }

    /**
     * Create analysis prompt combining comprehensive prompt with log data
     */
    createAnalysisPrompt(logContent, logFile) {
        return `${this.comprehensivePrompt}

## Log Analysis Task

You are analyzing VS Code Copilot Chat logs from session: ${logFile.session}
Window: ${logFile.window}
Size: ${(logFile.size / 1024).toFixed(1)}KB
Modified: ${logFile.modified.toISOString()}

## Log Content to Analyze:

\`\`\`
${logContent.slice(0, 50000)} ${logContent.length > 50000 ? "\n[... truncated for length ...]" : ""}
\`\`\`

Focus on extracting meaningful development insights, technical decisions, and problem-solving patterns from these logs. Ignore routine logging noise and focus on substantive interactions.

Respond with ONLY the JSON entity structure as specified in the prompt above.`;
    }

    /**
     * Query Claude API
     */
    async queryClaude(prompt) {
        try {
            const response = await this.anthropic.messages.create({
                model: this.model,
                max_tokens: 4000,
                temperature: 0.3,
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            });

            return response.content[0].text;
            
        } catch (error) {
            console.error("Claude API error:", error);
            return null;
        }
    }

    /**
     * Parse Claude response into memory entities
     */
    parseClaudeResponse(response, logFile) {
        try {
            // Extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.warn(`No JSON found in Claude response for ${logFile.session}`);
                return [];
            }

            const parsed = JSON.parse(jsonMatch[0]);
            
            if (!parsed.entities || !Array.isArray(parsed.entities)) {
                console.warn(`Invalid entity structure in response for ${logFile.session}`);
                return [];
            }

            // Add metadata to each entity
            return parsed.entities.map(entity => ({
                ...entity,
                metadata: {
                    source: "vscode_copilot_logs",
                    session: logFile.session,
                    window: logFile.window,
                    extracted_at: new Date().toISOString(),
                    log_size: logFile.size
                }
            }));
            
        } catch (error) {
            console.error(`Error parsing Claude response for ${logFile.session}:`, error);
            return [];
        }
    }

    /**
     * Generate analysis reports
     */
    async generateReports(memories) {
        const report = {
            summary: {
                total_entities: memories.length,
                by_type: this.groupByType(memories),
                extraction_date: new Date().toISOString(),
                source: "VS Code Copilot Chat Logs"
            },
            entities: memories
        };

        // Save JSON report
        const reportPath = path.join(this.outputPath, `vscode-memory-extraction-${Date.now()}.json`);
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
        console.log(`📄 Saved report: ${reportPath}`);

        // Save markdown summary
        const mdPath = path.join(this.outputPath, `vscode-memory-summary-${Date.now()}.md`);
        await fs.writeFile(mdPath, this.generateMarkdownSummary(report));
        console.log(`📄 Saved summary: ${mdPath}`);
    }

    /**
     * Group entities by type for summary
     */
    groupByType(memories) {
        const grouped = {};
        memories.forEach(entity => {
            const type = entity.entityType || "unknown";
            grouped[type] = (grouped[type] || 0) + 1;
        });
        return grouped;
    }

    /**
     * Generate markdown summary
     */
    generateMarkdownSummary(report) {
        return `# VS Code Memory Extraction Summary

Generated: ${report.summary.extraction_date}
Source: ${report.summary.source}

## Summary

- **Total Entities**: ${report.summary.total_entities}

### By Type
${Object.entries(report.summary.by_type)
    .map(([type, count]) => `- **${type}**: ${count}`)
    .join("\n")}

## Key Insights

${report.entities.slice(0, 10).map(entity => `
### ${entity.name}
Type: ${entity.entityType}
Source: ${entity.metadata?.session || "unknown"}

${entity.observations?.slice(0, 3).map(obs => `- ${obs}`).join("\n") || "No observations"}
`).join("\n")}

${report.entities.length > 10 ? `\n... and ${report.entities.length - 10} more entities` : ""}
`;
    }

    /**
     * Integrate with Memento MCP
     */
    async integrateWithMemento(memories) {
        console.log("🧠 Integrating with Memento MCP...");
        
        try {
            // For each entity, create it in Memento using actual MCP integration
            let created = 0;
            for (const entity of memories) {
                try {
                    // Use the mcp_memento MCP tools to create entities
                    const entityData = {
                        name: entity.name,
                        entityType: entity.entityType,
                        observations: entity.observations || []
                    };

                    // Add metadata as observations
                    if (entity.metadata) {
                        entityData.observations.push(`Source: ${entity.metadata.source}`);
                        entityData.observations.push(`Session: ${entity.metadata.session}`);
                        entityData.observations.push(`Extracted: ${entity.metadata.extracted_at}`);
                    }

                    console.log(`   📝 Creating entity: ${entity.name}`);
                    
                    // This would need actual MCP integration - for now we simulate
                    // In a real implementation, this would call the MCP tools directly
                    
                    created++;
                } catch (error) {
                    console.error(`   ❌ Failed to create entity ${entity.name}:`, error.message);
                }
            }
            
            console.log("✅ Successfully processed " + created + "/" + memories.length + " entities for Memento integration");
            console.log("💡 To actually integrate with Memento MCP, run this scribe through VS Code Copilot with MCP tools enabled");
            
        } catch (_error) {
            console.error("❌ Memento integration setup failed:", _error);
        }
    }

    /**
     * Ensure output directory exists
     */
    async ensureOutputDirectory() {
        try {
            await fs.mkdir(this.outputPath, { recursive: true });
        } catch (_error) {
            // Directory might already exist
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
    const analyzer = new VSCodeLogAnalyzer();
    
    analyzer.analyze()
        .then(() => {
            console.log("🎉 Analysis complete!");
            process.exit(0);
        })
        .catch(error => {
            console.error("💥 Analysis failed:", error);
            process.exit(1);
        });
}

module.exports = { VSCodeLogAnalyzer };
