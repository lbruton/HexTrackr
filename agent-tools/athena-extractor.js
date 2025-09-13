#!/usr/bin/env node

/**
 * Athena Memory Extractor - Enhanced Edition
 * 🦉 "From chaos, wisdom. From conversations, knowledge eternal."
 *
 * Processes Claude Code conversation logs with:
 * - Consistent date/time naming
 * - Memento catalog integration
 * - Human-readable MD generation
 * - Embedding preparation
 *
 * @version 2.0.0
 * @author Athena, Goddess of Wisdom
 */

const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
const readline = require("readline");
require("dotenv").config();

class AthenaExtractor {
    constructor(options = {}) {
        // Paths configuration
        this.claudeLogsPath = options.claudeLogsPath || path.join(
            process.env.HOME,
            ".claude/projects/-Volumes-DATA-GitHub-HexTrackr"
        );

        // New standardized paths
        this.logsRoot = options.logsRoot || path.join(process.cwd(), "logs");
        this.sessionsPath = path.join(this.logsRoot, "sessions");
        this.embeddingsPath = path.join(this.logsRoot, "embeddings");
        this.metadataPath = path.join(this.logsRoot, "metadata");

        // Processing state
        this.processedFile = path.join(this.metadataPath, "processed-sessions.json");
        this.processedSessions = new Set();

        // Wisdom extraction patterns
        this.wisdomPatterns = {
            bugFix: /fix|bug|error|issue|problem|solve|resolved|patch/i,
            architecture: /architecture|design|pattern|structure|refactor|system/i,
            feature: /implement|feature|add|create|build|enhance/i,
            discovery: /found|discovered|realized|learned|insight|observed/i,
            decision: /decided|chose|selected|opted|agreed|determined/i,
            security: /security|vulnerability|xss|csrf|injection|authentication/i,
            performance: /optimize|performance|speed|cache|efficient/i
        };

        // Initialize directories
        this.ensureDirectories();
        this.loadProcessedSessions();
    }

    /**
     * Ensure all required directories exist
     */
    async ensureDirectories() {
        const dirs = [
            this.logsRoot,
            this.sessionsPath,
            this.embeddingsPath,
            this.metadataPath
        ];

        for (const dir of dirs) {
            if (!fsSync.existsSync(dir)) {
                await fs.mkdir(dir, { recursive: true });
                console.log(`🦉 Created directory: ${dir}`);
            }
        }
    }

    /**
     * Load list of already processed sessions
     */
    async loadProcessedSessions() {
        try {
            if (fsSync.existsSync(this.processedFile)) {
                const data = await fs.readFile(this.processedFile, "utf8");
                const processed = JSON.parse(data);
                this.processedSessions = new Set(processed);
                console.log(`🦉 Loaded ${this.processedSessions.size} processed sessions`);
            }
        } catch (error) {
            console.error("🦉 Error loading processed sessions:", error.message);
            this.processedSessions = new Set();
        }
    }

    /**
     * Save list of processed sessions
     */
    async saveProcessedSessions() {
        try {
            await fs.writeFile(
                this.processedFile,
                JSON.stringify(Array.from(this.processedSessions), null, 2)
            );
        } catch (error) {
            console.error("🦉 Error saving processed sessions:", error.message);
        }
    }

    /**
     * Generate timestamp-based filename
     * Format: YYYY-MM-DD-HH-MM-SS-[title]
     */
    generateTimestampName(conversation) {
        const date = new Date(conversation.metadata?.createdAt || Date.now());

        // Format: YYYY-MM-DD-HH-MM-SS
        const timestamp = [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0"),
            String(date.getHours()).padStart(2, "0"),
            String(date.getMinutes()).padStart(2, "0"),
            String(date.getSeconds()).padStart(2, "0")
        ].join("-");

        // Extract title from conversation
        let title = conversation.title || "untitled";
        title = title.toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
            .substring(0, 50); // Limit title length

        return `${timestamp}-${title}`;
    }

    /**
     * Extract wisdom from conversation
     */
    extractWisdom(messages) {
        const wisdom = {
            bugFixes: [],
            architectureDecisions: [],
            features: [],
            discoveries: [],
            decisions: [],
            security: [],
            performance: [],
            codeFragments: [],
            filesModified: new Set()
        };

        messages.forEach(msg => {
            const content = msg.content || "";

            // Check wisdom patterns
            Object.entries(this.wisdomPatterns).forEach(([key, pattern]) => {
                if (pattern.test(content)) {
                    const summary = this.extractSummary(content);
                    if (summary && key === "bugFix") {wisdom.bugFixes.push(summary);}
                    if (summary && key === "architecture") {wisdom.architectureDecisions.push(summary);}
                    if (summary && key === "feature") {wisdom.features.push(summary);}
                    if (summary && key === "discovery") {wisdom.discoveries.push(summary);}
                    if (summary && key === "decision") {wisdom.decisions.push(summary);}
                    if (summary && key === "security") {wisdom.security.push(summary);}
                    if (summary && key === "performance") {wisdom.performance.push(summary);}
                }
            });

            // Extract code fragments
            const codeMatches = content.match(/```[\s\S]*?```/g);
            if (codeMatches) {
                wisdom.codeFragments.push(...codeMatches);
            }

            // Extract file paths
            const fileMatches = content.match(/[\/\w-]+\.(js|json|md|html|css|jsx|ts|tsx|py|java|go|rs)/g);
            if (fileMatches) {
                fileMatches.forEach(file => wisdom.filesModified.add(file));
            }
        });

        wisdom.filesModified = Array.from(wisdom.filesModified);
        return wisdom;
    }

    /**
     * Extract a meaningful summary from content
     */
    extractSummary(content, maxLength = 200) {
        // Remove code blocks
        const clean = content.replace(/```[\s\S]*?```/g, "");

        // Get first meaningful sentence
        const sentences = clean.split(/[.!?]\s+/);
        if (sentences.length > 0) {
            let summary = sentences[0].trim();
            if (summary.length > maxLength) {
                summary = summary.substring(0, maxLength) + "...";
            }
            return summary;
        }
        return null;
    }

    /**
     * Generate ABSTRACT (one-line summary)
     */
    generateAbstract(conversation, wisdom) {
        const bugs = wisdom.bugFixes.length;
        const features = wisdom.features.length;
        const decisions = wisdom.decisions.length;
        const title = conversation.title || "Session";

        return `Extracted ${bugs} bug fixes, ${features} features, ${decisions} decisions from "${title}"`;
    }

    /**
     * Generate SUMMARY (detailed description)
     */
    generateSummary(conversation, wisdom) {
        const parts = [];

        parts.push(`Session: ${conversation.title || "Untitled"}`);
        parts.push(`Messages: ${conversation.messages?.length || 0}`);

        if (wisdom.bugFixes.length > 0) {
            parts.push(`Bug Fixes: ${wisdom.bugFixes.slice(0, 3).join("; ")}`);
        }

        if (wisdom.features.length > 0) {
            parts.push(`Features: ${wisdom.features.slice(0, 3).join("; ")}`);
        }

        if (wisdom.architectureDecisions.length > 0) {
            parts.push(`Architecture: ${wisdom.architectureDecisions.slice(0, 2).join("; ")}`);
        }

        if (wisdom.discoveries.length > 0) {
            parts.push(`Discoveries: ${wisdom.discoveries.slice(0, 2).join("; ")}`);
        }

        if (wisdom.filesModified.length > 0) {
            parts.push(`Files Modified: ${wisdom.filesModified.slice(0, 5).join(", ")}`);
        }

        parts.push(`Code Fragments: ${wisdom.codeFragments.length}`);

        return parts.join(". ");
    }

    /**
     * Convert conversation to human-readable Markdown
     */
    generateMarkdown(conversation, wisdom, filename) {
        const lines = [];
        const date = new Date(conversation.metadata?.createdAt || Date.now());

        // Header
        lines.push(`# ${conversation.title || "Claude Code Session"}`);
        lines.push("");
        lines.push(`**Date**: ${date.toISOString()}`);
        lines.push(`**Session ID**: ${conversation.id || "unknown"}`);
        lines.push(`**Messages**: ${conversation.messages?.length || 0}`);
        lines.push("");

        // Wisdom Summary
        lines.push("## 🦉 Wisdom Extracted");
        lines.push("");

        if (wisdom.bugFixes.length > 0) {
            lines.push("### Bug Fixes");
            wisdom.bugFixes.forEach(fix => lines.push(`- ${fix}`));
            lines.push("");
        }

        if (wisdom.features.length > 0) {
            lines.push("### Features Implemented");
            wisdom.features.forEach(feature => lines.push(`- ${feature}`));
            lines.push("");
        }

        if (wisdom.architectureDecisions.length > 0) {
            lines.push("### Architecture Decisions");
            wisdom.architectureDecisions.forEach(decision => lines.push(`- ${decision}`));
            lines.push("");
        }

        if (wisdom.discoveries.length > 0) {
            lines.push("### Discoveries & Insights");
            wisdom.discoveries.forEach(discovery => lines.push(`- ${discovery}`));
            lines.push("");
        }

        if (wisdom.filesModified.length > 0) {
            lines.push("### Files Modified");
            wisdom.filesModified.forEach(file => lines.push(`- \`${file}\``));
            lines.push("");
        }

        // Conversation
        lines.push("---");
        lines.push("");
        lines.push("## Conversation");
        lines.push("");

        if (conversation.messages) {
            conversation.messages.forEach((msg, index) => {
                const role = msg.role === "user" ? "👤 User" : "🤖 Assistant";
                lines.push(`### Message ${index + 1} - ${role}`);
                lines.push("");

                // Handle content that might be an array or string
                const content = Array.isArray(msg.content)
                    ? msg.content.map(c => c.text || c).join("\n")
                    : msg.content || "";

                lines.push(content);
                lines.push("");
            });
        }

        // Footer
        lines.push("---");
        lines.push("");
        lines.push("*🦉 Preserved by Athena, Goddess of Wisdom*");
        lines.push(`*Generated: ${new Date().toISOString()}*`);

        return lines.join("\n");
    }

    /**
     * Create Memento entity for session
     */
    createMementoEntity(filename, wisdom, abstract, summary) {
        return {
            name: `ATHENA:SESSION:${filename}`,
            entityType: "KNOWLEDGE:EXTRACTED:CONVERSATION",
            observations: [
                `TIMESTAMP: ${new Date().toISOString()}`,
                `ABSTRACT: ${abstract}`,
                `SUMMARY: ${summary}`,
                `MD_PATH: /logs/sessions/${filename}.md`,
                `EMBED_PATH: /logs/embeddings/${filename}.json`,
                `BUG_FIXES: ${wisdom.bugFixes.length}`,
                `FEATURES: ${wisdom.features.length}`,
                `DECISIONS: ${wisdom.decisions.length}`,
                `CODE_FRAGMENTS: ${wisdom.codeFragments.length}`,
                `FILES_MODIFIED: ${wisdom.filesModified.join(", ") || "none"}`,
                "🦉 EXTRACTED_BY: Athena, Goddess of Wisdom"
            ]
        };
    }

    /**
     * Process a single JSONL file
     */
    async processConversation(filePath) {
        console.log(`🦉 Processing: ${path.basename(filePath)}`);

        try {
            // Read JSONL file
            const fileContent = await fs.readFile(filePath, "utf8");
            const lines = fileContent.trim().split("\n");

            // Parse conversation data
            let conversation = null;
            const messages = [];

            for (const line of lines) {
                if (line.trim()) {
                    try {
                        const data = JSON.parse(line);
                        if (data.type === "conversation.item.created") {
                            messages.push(data.item);
                        } else if (data.type === "conversation.created") {
                            conversation = data.conversation;
                        }
                    } catch (e) {
                        // Skip malformed lines
                    }
                }
            }

            if (!conversation) {
                conversation = { messages, title: "Untitled Session" };
            } else {
                conversation.messages = messages;
            }

            // Extract wisdom
            const wisdom = this.extractWisdom(messages);

            // Generate filename with timestamp
            const filename = this.generateTimestampName(conversation);

            // Generate ABSTRACT and SUMMARY
            const abstract = this.generateAbstract(conversation, wisdom);
            const summary = this.generateSummary(conversation, wisdom);

            // Generate Markdown
            const markdown = this.generateMarkdown(conversation, wisdom, filename);

            // Save MD file
            const mdPath = path.join(this.sessionsPath, `${filename}.md`);
            await fs.writeFile(mdPath, markdown);
            console.log(`🦉 Created: ${mdPath}`);

            // Create Memento entity
            const mementoEntity = this.createMementoEntity(filename, wisdom, abstract, summary);

            // Mark as processed
            this.processedSessions.add(path.basename(filePath));

            return {
                filename,
                mementoEntity,
                wisdom,
                messageCount: messages.length
            };

        } catch (error) {
            console.error(`🦉 Error processing ${filePath}:`, error.message);
            return null;
        }
    }

    /**
     * Process all unprocessed conversations across all projects
     */
    async processAllConversations() {
        console.log("🦉 Athena awakens to extract wisdom from the sacred scrolls...");
        console.log("");

        try {
            // Get all project directories
            const projectsPath = path.join(process.env.HOME, ".claude", "projects");

            if (!fsSync.existsSync(projectsPath)) {
                console.error(`❌ Claude projects directory not found: ${projectsPath}`);
                return [];
            }

            // List all project directories
            const projectDirs = await fs.readdir(projectsPath);
            const validProjectDirs = [];

            for (const dir of projectDirs) {
                const dirPath = path.join(projectsPath, dir);
                const stat = await fs.stat(dirPath);
                if (stat.isDirectory()) {
                    validProjectDirs.push(dir);
                }
            }

            console.log(`🏛️ Found ${validProjectDirs.length} project directories`);
            console.log("");

            const allResults = [];
            const allMementoEntities = [];
            let totalFilesFound = 0;
            let totalFilesProcessed = 0;

            // Process each project directory
            for (const projectDir of validProjectDirs) {
                const projectPath = path.join(projectsPath, projectDir);

                // Decode URL-encoded project name
                const projectName = decodeURIComponent(projectDir.replace(/-/g, "/"));
                console.log(`📁 Project: ${projectName}`);
                console.log(`   Path: ${projectDir}`);

                // Get JSONL files in this project
                const files = await fs.readdir(projectPath);
                const jsonlFiles = files
                    .filter(f => f.endsWith(".jsonl"))
                    .filter(f => !this.processedSessions.has(`${projectDir}/${f}`)); // Include project in key

                if (jsonlFiles.length === 0) {
                    console.log("   📭 No unprocessed conversations in this project");
                    console.log("");
                    continue;
                }

                console.log(`   📚 Found ${jsonlFiles.length} unprocessed conversations`);
                totalFilesFound += jsonlFiles.length;

                // Process each file in this project
                for (const file of jsonlFiles) {
                    const filePath = path.join(projectPath, file);
                    const result = await this.processConversationWithProject(filePath, projectDir, projectName);

                    if (result) {
                        allResults.push(result);
                        allMementoEntities.push(result.mementoEntity);
                        totalFilesProcessed++;

                        // Track with project prefix
                        this.processedSessions.add(`${projectDir}/${file}`);
                    }

                    // Save progress periodically
                    if (allResults.length % 10 === 0) {
                        await this.saveProcessedSessions();
                    }
                }
                console.log("");
            }

            // Save final state
            await this.saveProcessedSessions();

            // Output Memento entities for manual saving
            if (allMementoEntities.length > 0) {
                const mementoFile = path.join(this.metadataPath, "memento-entities.json");
                await fs.writeFile(mementoFile, JSON.stringify(allMementoEntities, null, 2));
                console.log(`🦉 Memento entities saved to: ${mementoFile}`);
            }

            // Summary
            console.log("═".repeat(60));
            console.log("🦉 Wisdom extraction complete!");
            console.log("📊 Statistics:");
            console.log(`   • Projects scanned: ${validProjectDirs.length}`);
            console.log(`   • Total files found: ${totalFilesFound}`);
            console.log(`   • Files processed: ${totalFilesProcessed}`);
            console.log(`   • Total messages: ${allResults.reduce((sum, r) => sum + r.messageCount, 0)}`);
            console.log(`   • Bug fixes found: ${allResults.reduce((sum, r) => sum + r.wisdom.bugFixes.length, 0)}`);
            console.log(`   • Features documented: ${allResults.reduce((sum, r) => sum + r.wisdom.features.length, 0)}`);
            console.log(`   • Code fragments preserved: ${allResults.reduce((sum, r) => sum + r.wisdom.codeFragments.length, 0)}`);
            console.log(`📝 Sessions saved to: ${this.sessionsPath}`);

            return allResults;

        } catch (error) {
            console.error("🦉 Fatal error during processing:", error);
            throw error;
        }
    }

    /**
     * Process a single conversation with project context
     */
    async processConversationWithProject(filePath, projectDir, projectName) {
        console.log(`   📖 Processing: ${path.basename(filePath)}`);

        try {
            // Read JSONL file
            const fileContent = await fs.readFile(filePath, "utf8");
            const lines = fileContent.trim().split("\n");

            // Parse conversation data
            let conversation = null;
            const messages = [];

            for (const line of lines) {
                if (line.trim()) {
                    try {
                        const data = JSON.parse(line);
                        if (data.type === "conversation.item.created") {
                            messages.push(data.item);
                        } else if (data.type === "conversation.created") {
                            conversation = data.conversation;
                        }
                    } catch (e) {
                        // Skip malformed lines
                    }
                }
            }

            if (!conversation) {
                conversation = { messages, title: "Untitled Session" };
            } else {
                conversation.messages = messages;
            }

            // Add project context to conversation metadata
            if (!conversation.metadata) {
                conversation.metadata = {};
            }
            conversation.metadata.projectPath = projectDir;
            conversation.metadata.projectName = projectName;

            // Extract wisdom
            const wisdom = this.extractWisdom(messages);

            // Generate filename with timestamp and project prefix
            const baseFilename = this.generateTimestampName(conversation);
            // Add sanitized project name prefix for clarity
            const projectPrefix = projectName
                .split("/").pop() // Get last part of path
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .substring(0, 20);
            const filename = `${projectPrefix}-${baseFilename}`;

            // Generate ABSTRACT and SUMMARY
            const abstract = this.generateAbstract(conversation, wisdom);
            const summary = this.generateSummary(conversation, wisdom);

            // Generate Markdown with project context
            const markdown = this.generateMarkdownWithProject(conversation, wisdom, filename, projectName);

            // Save MD file
            const mdPath = path.join(this.sessionsPath, `${filename}.md`);
            await fs.writeFile(mdPath, markdown);
            console.log(`   ✅ Created: ${path.basename(mdPath)}`);

            // Create Memento entity with project context
            const mementoEntity = this.createMementoEntityWithProject(filename, wisdom, abstract, summary, projectName);

            return {
                filename,
                mementoEntity,
                wisdom,
                messageCount: messages.length,
                projectName
            };

        } catch (error) {
            console.error(`   ❌ Error processing ${path.basename(filePath)}:`, error.message);
            return null;
        }
    }

    /**
     * Generate Markdown with project context
     */
    generateMarkdownWithProject(conversation, wisdom, filename, projectName) {
        const lines = [];
        const date = new Date(conversation.metadata?.createdAt || Date.now());

        // Header with project info
        lines.push(`# ${conversation.title || "Claude Code Session"}`);
        lines.push("");
        lines.push(`**Project**: ${projectName}`);
        lines.push(`**Date**: ${date.toISOString()}`);
        lines.push(`**Session ID**: ${conversation.id || "unknown"}`);
        lines.push(`**Messages**: ${conversation.messages?.length || 0}`);
        lines.push("");

        // Rest is same as original generateMarkdown
        lines.push("## 🦉 Wisdom Extracted");
        lines.push("");

        if (wisdom.bugFixes.length > 0) {
            lines.push("### Bug Fixes");
            wisdom.bugFixes.forEach(fix => lines.push(`- ${fix}`));
            lines.push("");
        }

        if (wisdom.features.length > 0) {
            lines.push("### Features Implemented");
            wisdom.features.forEach(feature => lines.push(`- ${feature}`));
            lines.push("");
        }

        if (wisdom.architectureDecisions.length > 0) {
            lines.push("### Architecture Decisions");
            wisdom.architectureDecisions.forEach(decision => lines.push(`- ${decision}`));
            lines.push("");
        }

        if (wisdom.discoveries.length > 0) {
            lines.push("### Discoveries & Insights");
            wisdom.discoveries.forEach(discovery => lines.push(`- ${discovery}`));
            lines.push("");
        }

        if (wisdom.filesModified.length > 0) {
            lines.push("### Files Modified");
            wisdom.filesModified.forEach(file => lines.push(`- \`${file}\``));
            lines.push("");
        }

        // Conversation
        lines.push("---");
        lines.push("");
        lines.push("## Conversation");
        lines.push("");

        if (conversation.messages) {
            conversation.messages.forEach((msg, index) => {
                const role = msg.role === "user" ? "👤 User" : "🤖 Assistant";
                lines.push(`### Message ${index + 1} - ${role}`);
                lines.push("");

                // Handle content that might be an array or string
                const content = Array.isArray(msg.content)
                    ? msg.content.map(c => c.text || c).join("\n")
                    : msg.content || "";

                lines.push(content);
                lines.push("");
            });
        }

        // Footer
        lines.push("---");
        lines.push("");
        lines.push("*🦉 Preserved by Athena, Goddess of Wisdom*");
        lines.push(`*Generated: ${new Date().toISOString()}*`);

        return lines.join("\n");
    }

    /**
     * Create Memento entity with project context
     */
    createMementoEntityWithProject(filename, wisdom, abstract, summary, projectName) {
        return {
            name: `ATHENA:SESSION:${filename}`,
            entityType: "KNOWLEDGE:EXTRACTED:CONVERSATION",
            observations: [
                `TIMESTAMP: ${new Date().toISOString()}`,
                `PROJECT: ${projectName}`,
                `ABSTRACT: ${abstract}`,
                `SUMMARY: ${summary}`,
                `MD_PATH: /logs/sessions/${filename}.md`,
                `EMBED_PATH: /logs/embeddings/${filename}.json`,
                `BUG_FIXES: ${wisdom.bugFixes.length}`,
                `FEATURES: ${wisdom.features.length}`,
                `DECISIONS: ${wisdom.decisions.length}`,
                `CODE_FRAGMENTS: ${wisdom.codeFragments.length}`,
                `FILES_MODIFIED: ${wisdom.filesModified.join(", ") || "none"}`,
                "🦉 EXTRACTED_BY: Athena, Goddess of Wisdom"
            ]
        };
    }

    /**
     * Clean restart - clear all processed state
     */
    async cleanRestart() {
        console.log("🦉 Initiating clean restart...");

        // Clear processed sessions
        this.processedSessions = new Set();
        await this.saveProcessedSessions();

        // Clear existing files (optional - commented out for safety)
        // await fs.rm(this.sessionsPath, { recursive: true, force: true });
        // await fs.rm(this.embeddingsPath, { recursive: true, force: true });
        // await this.ensureDirectories();

        console.log("🦉 Clean restart complete. Ready to process all sessions.");
    }
}

// CLI interface
if (require.main === module) {
    const extractor = new AthenaExtractor();

    const command = process.argv[2];

    switch (command) {
        case "clean":
            extractor.cleanRestart().then(() => {
                console.log("🦉 Clean restart complete");
            });
            break;

        case "process":
        default:
            extractor.processAllConversations().then(results => {
                console.log(`\n🦉 "From ${results.length} conversations, eternal wisdom flows."`);
            }).catch(error => {
                console.error("🦉 Athena encountered an error:", error);
                process.exit(1);
            });
    }
}

module.exports = { AthenaExtractor };