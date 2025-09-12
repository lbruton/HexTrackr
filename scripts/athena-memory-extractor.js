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
        
        const observations = [
            `TIMESTAMP: ${wisdom.timestamp}`,
            "🦉 EXTRACTED_BY: Athena, Goddess of Wisdom",
            `SESSION_ID: ${wisdom.sessionId}`,
            `MORTAL_BRANCH: ${wisdom.mortalBranch || "unknown"}`
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

        return {
            name: entityName,
            entityType: entityType,
            observations: observations
        };
    }

    /**
     * Main extraction process
     */
    async extractAllWisdom() {
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

        const newScrolls = scrolls.filter(scroll => 
            !this.processedScrolls.has(path.basename(scroll, ".jsonl"))
        );

        console.log(`✨ New scrolls to process: ${newScrolls.length}`);

        const allWisdom = [];
        for (const scroll of newScrolls) {
            const wisdom = await this.extractWisdomFromScroll(scroll);
            if (wisdom) {
                allWisdom.push(wisdom);
                
                // Create Memento entity (would be sent to MCP in production)
                const entity = this.createMementoEntity(wisdom);
                console.log("\n🦉 Memento Entity Created:");
                console.log(JSON.stringify(entity, null, 2));
            }
        }

        this.saveProcessedScrolls();
        
        console.log("\n🦉 Wisdom extraction complete!");
        console.log(`📊 Processed ${allWisdom.length} new conversations`);
        console.log(`💾 Total archive size: ${this.processedScrolls.size} scrolls`);
        
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
    const command = process.argv[2];

    switch (command) {
        case "extract":
            await athena.extractAllWisdom();
            break;
        case "search":
            const query = process.argv.slice(3).join(" ");
            if (!query) {
                console.log("🦉 What wisdom do you seek, mortal?");
                process.exit(1);
            }
            await athena.searchWisdom(query);
            break;
        default:
            console.log("🦉 Athena's Memory Extraction Tool");
            console.log("Usage:");
            console.log("  athena-memory-extractor.js extract  - Extract wisdom from new conversations");
            console.log("  athena-memory-extractor.js search [query] - Search for specific wisdom");
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