#!/usr/bin/env node

/* eslint-env node */
/* global require, process, console */

/**
 * Athena's Memory Extraction Tool
 * 🦉 "From chaos, wisdom. From conversations, knowledge eternal."
 * 
 * Goddess of Wisdom and Keeper of Institutional Memory
 * Extracts knowledge from Claude Code conversation logs and preserves it in Memento
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");
// const crypto = require("crypto"); // Unused - reserved for future use
const { AthenaEmbeddingService } = require("./athena-embeddings.js");

class AthenaScholar {
    constructor() {
        this.sacredScrollsPath = path.join(
            process.env.HOME,
            ".claude/projects/-Volumes-DATA-GitHub-HexTrackr"
        );
        this.processedScrollsFile = path.join(__dirname, ".athena-processed-scrolls.json");
        this.processedScrolls = this.loadProcessedScrolls();
        this.libraryPath = path.join(process.cwd(), "claudelogs/sessions");
        this.wisdomPatterns = {
            bugFix: /fix|bug|error|issue|problem|solve|resolved/i,
            architecture: /architecture|design|pattern|structure|refactor/i,
            feature: /implement|feature|add|create|build/i,
            discovery: /found|discovered|realized|learned|insight/i,
            decision: /decided|chose|selected|opted|agreed/i
        };
        
        // Initialize embedding service
        this.embeddingService = new AthenaEmbeddingService({
            embeddingsDir: path.join(process.cwd(), "claudelogs/embeddings")
        });
        
        // Ensure library exists
        if (!fs.existsSync(this.libraryPath)) {
            fs.mkdirSync(this.libraryPath, { recursive: true });
        }
    }

    /**
     * Load list of already processed conversation files
     */
    loadProcessedScrolls() {
        try {
            if (fs.existsSync(this.processedScrollsFile)) {
                return new Set(JSON.parse(fs.readFileSync(this.processedScrollsFile, "utf8")));
            }
        } catch (_error) {
            console.log("🦉 No previous scrolls found. Beginning fresh archive...");
        }
        return new Set();
    }

    /**
     * Save list of processed files
     */
    saveProcessedScrolls() {
        fs.writeFileSync(
            this.processedScrollsFile,
            JSON.stringify(Array.from(this.processedScrolls), null, 2)
        );
    }

    /**
     * Extract wisdom from a single JSONL conversation file
     */
    async extractWisdomFromScroll(scrollPath) {
        const scrollId = path.basename(scrollPath, ".jsonl");
        
        if (this.processedScrolls.has(scrollId)) {
            return null; // Already processed
        }

        console.log(`🦉 Reading sacred scroll: ${scrollId}`);
        
        const wisdom = {
            sessionId: scrollId,
            timestamp: new Date().toISOString(),
            battles: [],      // Problems faced
            victories: [],    // Solutions found
            sacredRunes: [],  // Code snippets
            decisions: [],    // Architectural decisions
            wisdomGained: [], // Insights and learnings
            mortalBranch: null,
            filesModified: new Set(),
            fullConversation: [] // Store full conversation for markdown
        };

        const fileStream = fs.createReadStream(scrollPath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let currentContext = null;
        let messageCount = 0;
        let firstUserMessage = null;
        let sessionDate = null;

        for await (const line of rl) {
            try {
                const entry = JSON.parse(line);
                messageCount++;

                // Store full conversation entry
                wisdom.fullConversation.push(entry);

                // Extract session date from timestamp
                if (!sessionDate && entry.timestamp) {
                    sessionDate = new Date(entry.timestamp);
                }

                // Extract git branch
                if (entry.gitBranch && !wisdom.mortalBranch) {
                    wisdom.mortalBranch = entry.gitBranch;
                }

                // Process different message types
                if (entry.type === "user" && entry.message) {
                    if (!firstUserMessage) {
                        firstUserMessage = this.extractTitle(entry.message);
                    }
                    currentContext = this.extractUserIntent(entry.message);
                } else if (entry.type === "assistant" && entry.message) {
                    const insights = this.extractAssistantWisdom(entry.message, currentContext);
                    this.mergeWisdom(wisdom, insights);
                } else if (entry.type === "tool_use" && entry.name) {
                    this.extractToolWisdom(entry, wisdom);
                }

            } catch (_error) {
                // Skip malformed lines
                continue;
            }
        }

        // Convert Sets to Arrays for storage
        wisdom.filesModified = Array.from(wisdom.filesModified);
        wisdom.title = firstUserMessage || "Untitled Session";
        wisdom.date = sessionDate || new Date();

        console.log(`🦉 Extracted wisdom from ${messageCount} messages`);
        console.log(`   Battles: ${wisdom.battles.length}`);
        console.log(`   Victories: ${wisdom.victories.length}`);
        console.log(`   Sacred Runes: ${wisdom.sacredRunes.length}`);
        console.log(`   Decisions: ${wisdom.decisions.length}`);

        // Save as markdown in the library
        await this.saveToLibrary(wisdom);

        this.processedScrolls.add(scrollId);
        return wisdom;
    }

    /**
     * Extract intent from user messages
     */
    extractUserIntent(message) {
        const content = JSON.stringify(message).toLowerCase();
        
        for (const [pattern, regex] of Object.entries(this.wisdomPatterns)) {
            if (regex.test(content)) {
                return pattern;
            }
        }
        return "general";
    }

    /**
     * Extract wisdom from assistant responses
     */
    extractAssistantWisdom(message, context) {
        const insights = {
            battles: [],
            victories: [],
            sacredRunes: [],
            decisions: [],
            wisdomGained: []
        };

        const content = JSON.stringify(message);
        
        // Extract code blocks
        const codeMatches = content.match(/```[\s\S]*?```/g);
        if (codeMatches) {
            insights.sacredRunes = codeMatches.map(code => 
                code.replace(/```/g, "").trim()
            ).filter(code => code.length > 0);
        }

        // Extract patterns based on context
        if (context === "bugFix" && content.includes("fix")) {
            const problemMatch = content.match(/problem[:\s]+([^.]+)/i);
            const solutionMatch = content.match(/solution[:\s]+([^.]+)/i);
            
            if (problemMatch) {insights.battles.push(problemMatch[1]);}
            if (solutionMatch) {insights.victories.push(solutionMatch[1]);}
        }

        // Extract decisions
        if (content.includes("decided") || content.includes("will use")) {
            const decisionMatch = content.match(/(decided|will use)[:\s]+([^.]+)/i);
            if (decisionMatch) {insights.decisions.push(decisionMatch[2]);}
        }

        // Extract insights
        if (content.includes("learned") || content.includes("discovered")) {
            const insightMatch = content.match(/(learned|discovered)[:\s]+([^.]+)/i);
            if (insightMatch) {insights.wisdomGained.push(insightMatch[2]);}
        }

        return insights;
    }

    /**
     * Extract information from tool use
     */
    extractToolWisdom(entry, wisdom) {
        if (entry.name === "Edit" || entry.name === "Write") {
            if (entry.parameters && entry.parameters.file_path) {
                wisdom.filesModified.add(entry.parameters.file_path);
            }
        }
    }

    /**
     * Merge extracted insights into main wisdom object
     */
    mergeWisdom(wisdom, insights) {
        Object.keys(insights).forEach(key => {
            if (Array.isArray(wisdom[key]) && Array.isArray(insights[key])) {
                wisdom[key].push(...insights[key]);
            }
        });
    }

    /**
     * Extract a title from the first user message
     */
    extractTitle(message) {
        let content = "";
        
        // Handle different message formats
        if (typeof message === "string") {
            content = message;
        } else if (Array.isArray(message)) {
            // Handle array of message parts
            const textParts = message.filter(part => 
                typeof part === "string" || (part && part.type === "text")
            );
            content = textParts.map(part => 
                typeof part === "string" ? part : part.text || ""
            ).join(" ");
        } else if (message && message.text) {
            content = message.text;
        }

        // Clean and truncate for title
        content = content.replace(/```[\s\S]*?```/g, "")  // Remove code blocks
                        .replace(/\n+/g, " ")              // Replace newlines
                        .replace(/\s+/g, " ")              // Normalize spaces
                        .trim();

        // Take first 80 chars or first sentence
        const firstSentence = content.match(/^[^.!?]+[.!?]?/);
        let title = firstSentence ? firstSentence[0] : content;
        
        if (title.length > 80) {
            title = title.substring(0, 77) + "...";
        }

        return title || "Conversation";
    }

    /**
     * Save conversation as markdown in the library
     */
    async saveToLibrary(wisdom) {
        const dateStr = wisdom.date.toISOString().split("T")[0];
        const sessionNum = this.processedScrolls.size + 1;
        
        // Create filename: [session-number]_[date]_[brief-title].md
        const safeTitle = wisdom.title
            .replace(/[^a-zA-Z0-9\s-]/g, "")  // Remove special chars
            .replace(/\s+/g, "-")              // Replace spaces with dashes
            .toLowerCase()
            .substring(0, 50);                 // Limit length
        
        const filename = `${String(sessionNum).padStart(3, "0")}_${dateStr}_${safeTitle}.md`;
        const filepath = path.join(this.libraryPath, filename);
        
        // Store filename in wisdom for catalog references
        wisdom.filename = filename;

        // Build markdown content
        let markdown = `# 🦉 Athena's Sacred Scroll #${sessionNum}\n\n`;
        markdown += `**Date**: ${wisdom.date.toLocaleString()}\n`;
        markdown += `**Session ID**: ${wisdom.sessionId}\n`;
        markdown += `**Branch**: ${wisdom.mortalBranch || "unknown"}\n`;
        markdown += `**Title**: ${wisdom.title}\n\n`;
        markdown += "---\n\n";
        markdown += "## Conversation\n\n";

        // Process full conversation
        for (const entry of wisdom.fullConversation) {
            if (entry.type === "user") {
                markdown += "### 👤 User\n\n";
                markdown += this.formatMessage(entry.message);
                markdown += "\n\n";
            } else if (entry.type === "assistant") {
                markdown += "### 🤖 Assistant\n\n";
                markdown += this.formatMessage(entry.message);
                markdown += "\n\n";
            } else if (entry.type === "tool_use") {
                markdown += `#### 🔧 Tool: ${entry.name}\n\n`;
                if (entry.parameters) {
                    markdown += "```json\n";
                    markdown += JSON.stringify(entry.parameters, null, 2);
                    markdown += "\n```\n\n";
                }
            } else if (entry.type === "tool_result") {
                markdown += "#### ✅ Tool Result\n\n";
                markdown += "```\n";
                markdown += this.formatMessage(entry.result).substring(0, 1000);
                if (entry.result && entry.result.length > 1000) {
                    markdown += "\n... (truncated)";
                }
                markdown += "\n```\n\n";
            }
        }

        // Add wisdom summary at the end
        markdown += "---\n\n";
        markdown += "## 🦉 Athena's Wisdom Summary\n\n";
        
        if (wisdom.battles.length > 0) {
            markdown += "### ⚔️ Battles Faced\n";
            wisdom.battles.forEach(battle => markdown += `- ${battle}\n`);
            markdown += "\n";
        }
        
        if (wisdom.victories.length > 0) {
            markdown += "### 🏆 Victories Won\n";
            wisdom.victories.forEach(victory => markdown += `- ${victory}\n`);
            markdown += "\n";
        }
        
        if (wisdom.decisions.length > 0) {
            markdown += "### 🎯 Strategic Decisions\n";
            wisdom.decisions.forEach(decision => markdown += `- ${decision}\n`);
            markdown += "\n";
        }
        
        if (wisdom.wisdomGained.length > 0) {
            markdown += "### 💡 Wisdom Gained\n";
            wisdom.wisdomGained.forEach(insight => markdown += `- ${insight}\n`);
            markdown += "\n";
        }

        if (wisdom.filesModified.length > 0) {
            markdown += "### 📝 Files Modified\n";
            wisdom.filesModified.forEach(file => markdown += `- \`${file}\`\n`);
            markdown += "\n";
        }

        // Write the file
        fs.writeFileSync(filepath, markdown, "utf8");
        console.log(`📚 Saved to library: ${filename}`);
        
        // Generate embeddings for semantic search
        try {
            console.log("🧠 Generating embeddings for semantic search...");
            const embeddingResult = await this.embeddingService.processSession(markdown, {
                sessionId: wisdom.sessionId.substring(0, 16), // Shorter ID for embedding
                timestamp: wisdom.timestamp,
                filename: filename,
                title: wisdom.title,
                filepath: filepath
            });
            
            // Store embedding info for Memento
            wisdom.embeddingFile = embeddingResult.embeddingFile;
            wisdom.chunksProcessed = embeddingResult.chunksProcessed;
            wisdom.embeddingsGenerated = embeddingResult.embeddingsGenerated;
            
            console.log(`✨ Embeddings completed: ${embeddingResult.chunksProcessed} chunks, ${embeddingResult.embeddingsGenerated} embeddings`);
        } catch (error) {
            console.warn(`⚠️  Embedding generation failed: ${error.message}`);
            // Continue processing even if embeddings fail
        }
    }

    /**
     * Format message content for markdown
     */
    formatMessage(message) {
        if (typeof message === "string") {
            return message;
        } else if (Array.isArray(message)) {
            return message.map(part => {
                if (typeof part === "string") {return part;}
                if (part && part.type === "text") {return part.text || "";}
                if (part && part.type === "image") {return `[Image: ${part.source?.data ? "base64 data" : "image"}]`;}
                return JSON.stringify(part);
            }).join("");
        } else if (message && message.text) {
            return message.text;
        } else {
            return JSON.stringify(message, null, 2);
        }
    }

    /**
     * Create Memento entity from extracted wisdom
     */
    createMementoEntity(wisdom) {
        const entityName = `ATHENA:WISDOM:SESSION:${wisdom.sessionId.substring(0, 8)}`;
        const entityType = "KNOWLEDGE:EXTRACTED:CONVERSATION";
        
        // Generate ABSTRACT (one-line summary)
        const abstract = `Session wisdom extracted: ${wisdom.battles.length} battles, ${wisdom.victories.length} victories, ${wisdom.decisions.length} decisions, ${wisdom.wisdomGained.length} insights from ${wisdom.title}`;
        
        // Generate SUMMARY (detailed description)
        let summary = "Comprehensive session analysis from HexTrackr development conversation. ";
        if (wisdom.battles.length > 0) {
            summary += `Challenges addressed: ${wisdom.battles.join(", ")}. `;
        }
        if (wisdom.victories.length > 0) {
            summary += `Solutions implemented: ${wisdom.victories.join(", ")}. `;
        }
        if (wisdom.decisions.length > 0) {
            summary += `Strategic decisions: ${wisdom.decisions.join(", ")}. `;
        }
        if (wisdom.wisdomGained.length > 0) {
            summary += `Key insights gained: ${wisdom.wisdomGained.join(", ")}. `;
        }
        if (wisdom.filesModified.length > 0) {
            summary += `Files modified: ${wisdom.filesModified.join(", ")}. `;
        }
        summary += `Session conducted on ${wisdom.mortalBranch || "unknown"} branch with ${wisdom.sacredRunes.length} code fragments preserved for future reference.`;
        
        const observations = [
            `TIMESTAMP: ${wisdom.timestamp}`,                    // ALWAYS FIRST
            `ABSTRACT: ${abstract}`,                            // ALWAYS SECOND
            `SUMMARY: ${summary}`,                              // ALWAYS THIRD
            "🦉 EXTRACTED_BY: Athena, Goddess of Wisdom",
            `SESSION_ID: ${wisdom.sessionId}`,
            `MORTAL_BRANCH: ${wisdom.mortalBranch || "unknown"}`,
            `SESSION_TITLE: ${wisdom.title}`
        ];

        if (wisdom.battles.length > 0) {
            observations.push(`BATTLES_FACED: ${wisdom.battles.join("; ")}`);
        }
        if (wisdom.victories.length > 0) {
            observations.push(`VICTORIES_WON: ${wisdom.victories.join("; ")}`);
        }
        if (wisdom.decisions.length > 0) {
            observations.push(`STRATEGIC_DECISIONS: ${wisdom.decisions.join("; ")}`);
        }
        if (wisdom.wisdomGained.length > 0) {
            observations.push(`WISDOM_GAINED: ${wisdom.wisdomGained.join("; ")}`);
        }
        if (wisdom.filesModified.length > 0) {
            observations.push(`SACRED_TEXTS_MODIFIED: ${wisdom.filesModified.join(", ")}`);
        }
        if (wisdom.sacredRunes.length > 0) {
            observations.push(`RUNES_INSCRIBED: ${wisdom.sacredRunes.length} code fragments preserved`);
        }
        
        // Add embedding catalog information (dual-memory system)
        if (wisdom.embeddingFile) {
            observations.push(`MARKDOWN_SCROLL: ${path.relative(process.cwd(), path.join(this.libraryPath, wisdom.filename || "unknown.md"))}`);
            observations.push(`VECTOR_INDEX: ${path.relative(process.cwd(), wisdom.embeddingFile)}`);
            observations.push(`EMBEDDING_CHUNKS: ${wisdom.chunksProcessed || 0} semantic segments indexed`);
            observations.push(`SEARCH_VECTORS: ${wisdom.embeddingsGenerated || 0} embeddings generated with mxbai-embed-large`);
        }

        return {
            name: entityName,
            entityType: entityType,
            observations: observations
        };
    }

    /**
     * Send entities to Memento via MCP
     */
    async sendToMemento(entities) {
        if (!Array.isArray(entities) || entities.length === 0) {
            return;
        }

        try {
            console.log(`🦉 Sending ${entities.length} entities to the eternal archives (Memento)...`);
            
            // In a real CLI environment, this would use the MCP tool
            // For now, we'll use a child process to call Claude with the MCP tool
            const { spawn } = require("child_process");
            
            const mementoPayload = {
                entities: entities
            };

            // Create a temporary file with the MCP command
            const tempFile = path.join(__dirname, ".athena-memento-temp.json");
            fs.writeFileSync(tempFile, JSON.stringify(mementoPayload, null, 2));
            
            console.log("🦉 Entities prepared for Memento storage:");
            entities.forEach(entity => {
                console.log(`   📚 ${entity.name}: ${entity.observations[1]}`); // Show ABSTRACT
            });
            
            // Note: In actual implementation, this would be handled by the MCP server
            // For now, we log the entities that would be sent
            console.log("🦉 Note: MCP integration requires Claude Code context to send to Memento");
            console.log(`📁 Entity data saved to: ${tempFile}`);
            
            // Clean up temp file
            setTimeout(() => {
                try {
                    fs.unlinkSync(tempFile);
                } catch (_error) {
                    // Ignore cleanup errors
                }
            }, 5000);
            
        } catch (error) {
            console.error("🦉 Error sending wisdom to Memento:", error.message);
            // Don't fail the extraction if Memento storage fails
        }
    }

    /**
     * Main extraction process
     */
    async extractAllWisdom(options = {}) {
        console.log("🦉 Athena awakens... Seeking wisdom in the sacred scrolls...");
        console.log(`📜 Scrolls location: ${this.sacredScrollsPath}`);

        if (!fs.existsSync(this.sacredScrollsPath)) {
            console.error("🦉 The sacred scrolls are not where they should be!");
            return;
        }

        const scrolls = fs.readdirSync(this.sacredScrollsPath)
            .filter(file => file.endsWith(".jsonl"))
            .map(file => path.join(this.sacredScrollsPath, file));

        console.log(`🦉 Found ${scrolls.length} scrolls to examine...`);
        console.log(`📚 Already processed: ${this.processedScrolls.size} scrolls`);

        let scrollsToProcess;
        if (options.migrate || options.reprocessAll) {
            scrollsToProcess = scrolls;
            console.log(`🔄 Migration mode: Re-processing ${scrollsToProcess.length} scrolls with new ABSTRACT/SUMMARY pattern`);
        } else {
            scrollsToProcess = scrolls.filter(scroll => 
                !this.processedScrolls.has(path.basename(scroll, ".jsonl"))
            );
            console.log(`✨ New scrolls to process: ${scrollsToProcess.length}`);
        }

        const allWisdom = [];
        const mementoEntities = [];
        
        for (const scroll of scrollsToProcess) {
            const wisdom = await this.extractWisdomFromScroll(scroll);
            if (wisdom) {
                allWisdom.push(wisdom);
                
                // Create Memento entity with new ABSTRACT/SUMMARY pattern
                const entity = this.createMementoEntity(wisdom);
                mementoEntities.push(entity);
                
                console.log(`🦉 Wisdom entity prepared: ${entity.name}`);
            }
        }

        // Send all entities to Memento in batch
        if (mementoEntities.length > 0) {
            await this.sendToMemento(mementoEntities);
        }

        this.saveProcessedScrolls();
        
        console.log("\n🦉 Wisdom extraction complete!");
        console.log(`📊 Processed ${allWisdom.length} new conversations`);
        console.log(`💾 Total archive size: ${this.processedScrolls.size} scrolls`);
        console.log(`🧠 Memento entities created: ${mementoEntities.length}`);
        
        return allWisdom;
    }

    /**
     * Search for specific wisdom
     */
    async searchWisdom(query) {
        console.log(`🦉 Searching the archives for: "${query}"`);
        // This would integrate with Memento search
        // For now, return a placeholder
        return {
            query: query,
            message: "Integration with Memento search pending..."
        };
    }
}

// CLI Interface
async function main() {
    const athena = new AthenaScholar();
    const args = process.argv.slice(2);
    const command = args[0];
    const flags = args.slice(1);

    switch (command) {
        case "extract":
            const options = {
                migrate: flags.includes("--migrate"),
                reprocessAll: flags.includes("--all")
            };
            await athena.extractAllWisdom(options);
            break;
        case "search":
            const query = args.slice(1).join(" ");
            if (!query) {
                console.log("🦉 What wisdom do you seek, mortal?");
                process.exit(1);
            }
            await athena.searchWisdom(query);
            break;
        default:
            console.log("🦉 Athena's Memory Extraction Tool");
            console.log("Usage:");
            console.log("  athena-memory-extractor.js extract                    - Extract wisdom from new conversations");
            console.log("  athena-memory-extractor.js extract --migrate          - Re-process all conversations with new ABSTRACT/SUMMARY pattern");
            console.log("  athena-memory-extractor.js extract --all              - Force re-process all conversations (same as --migrate)");
            console.log("  athena-memory-extractor.js search [query]             - Search for specific wisdom");
            console.log("");
            console.log("🦉 New in this version: ABSTRACT/SUMMARY pattern for better knowledge retrieval");
    }
}

// Execute if run directly
if (require.main === module) {
    main().catch(error => {
        console.error("🦉 An error disturbed my meditation:", error);
        process.exit(1);
    });
}

module.exports = AthenaScholar;