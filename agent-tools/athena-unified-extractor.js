#!/usr/bin/env node

/**
 * Athena Unified Extractor - Version 2.0
 * 🦉 "From scattered sources, unified wisdom emerges"
 *
 * Correlates and merges three data sources into chronological archives:
 * - Chat logs (JSONL files)
 * - Todo snapshots (JSON files)
 * - Bash command history (JSON files)
 *
 * Output: Hourly markdown files with complete context
 *
 * @version 2.0.0
 * @author Athena, Goddess of Wisdom
 */

const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
const readline = require("readline");
const crypto = require("crypto");
require("dotenv").config();

class AthenaUnifiedExtractor {
    constructor(options = {}) {
        // Source paths - Updated to use global Claude directories
        this.claudeProjectPath = options.claudeProjectPath || path.join(
            process.env.HOME,
            ".claude/projects/-Volumes-DATA-GitHub-HexTrackr"
        );
        this.shellSnapshotsPath = options.shellSnapshotsPath || path.join(
            process.env.HOME,
            ".claude/shell-snapshots"
        );
        this.todosPath = options.todosPath || path.join(
            process.env.HOME,
            ".claude/todos"
        );

        // Output paths
        this.outputRoot = options.outputRoot || path.join(process.cwd(), "logs");
        this.unifiedPath = path.join(this.outputRoot, "unified");
        this.metadataPath = path.join(this.outputRoot, "metadata");

        // Processing configuration
        this.hoursToProcess = options.hours || 24; // Default last 24 hours
        this.processAll = options.all || false;

        // State tracking
        this.processedFile = path.join(this.metadataPath, "unified-processed.json");
        this.processedHours = new Set();

        // Initialize
        this.ensureDirectories();
        this.loadProcessedState();
    }

    /**
     * Create required directories
     */
    async ensureDirectories() {
        const dirs = [this.outputRoot, this.unifiedPath, this.metadataPath];

        for (const dir of dirs) {
            if (!fsSync.existsSync(dir)) {
                await fs.mkdir(dir, { recursive: true });
                console.log(`🦉 Created directory: ${dir}`);
            }
        }
    }

    /**
     * Load processing state
     */
    async loadProcessedState() {
        try {
            if (fsSync.existsSync(this.processedFile)) {
                const data = await fs.readFile(this.processedFile, "utf8");
                const processed = JSON.parse(data);
                this.processedHours = new Set(processed);
                console.log(`🦉 Loaded ${this.processedHours.size} processed hours`);
            }
        } catch (error) {
            console.error("🦉 Warning: Could not load processed state:", error.message);
            this.processedHours = new Set();
        }
    }

    /**
     * Save processing state atomically
     */
    async saveProcessedState() {
        try {
            const tempFile = this.processedFile + ".tmp";
            await fs.writeFile(
                tempFile,
                JSON.stringify(Array.from(this.processedHours), null, 2)
            );

            // Atomic rename
            await fs.rename(tempFile, this.processedFile);
        } catch (error) {
            console.error("🦉 Error saving processed state:", error.message);
        }
    }

    /**
     * Sanitize and validate file paths
     */
    sanitizePath(filePath) {
        const normalized = path.normalize(filePath);

        // Prevent path traversal
        if (normalized.includes("..") || normalized.startsWith("/")) {
            throw new Error(`Invalid path detected: ${filePath}`);
        }

        return normalized;
    }

    /**
     * Get all data sources with timestamps
     */
    async gatherDataSources() {
        const sources = {
            chat: [],
            todos: [],
            bash: []
        };

        // Gather chat logs (JSONL files)
        try {
            const chatFiles = await fs.readdir(this.claudeProjectPath);
            const jsonlFiles = chatFiles.filter(f => f.endsWith(".jsonl"));

            for (const file of jsonlFiles) {
                const filePath = path.join(this.claudeProjectPath, file);
                const stats = await fs.stat(filePath);

                sources.chat.push({
                    file: this.sanitizePath(file),
                    path: filePath,
                    modified: stats.mtime
                });
            }
        } catch (error) {
            console.log(`🦉 Note: Could not read chat logs: ${error.message}`);
        }

        // Gather todo files from global directory
        if (fsSync.existsSync(this.todosPath)) {
            try {
                const todoFiles = await fs.readdir(this.todosPath);
                const todoJsonFiles = todoFiles.filter(f => f.endsWith(".json"));

                for (const file of todoJsonFiles) {
                    const filePath = path.join(this.todosPath, file);
                    const stats = await fs.stat(filePath);

                    sources.todos.push({
                        file: this.sanitizePath(file),
                        path: filePath,
                        modified: stats.mtime
                    });
                }
            } catch (error) {
                console.log(`🦉 Note: Could not read todos: ${error.message}`);
            }
        }

        // Gather shell snapshots from global directory
        if (fsSync.existsSync(this.shellSnapshotsPath)) {
            try {
                const shellFiles = await fs.readdir(this.shellSnapshotsPath);
                const shellSnapshots = shellFiles.filter(f => f.endsWith(".sh"));

                for (const file of shellSnapshots) {
                    const filePath = path.join(this.shellSnapshotsPath, file);
                    const stats = await fs.stat(filePath);

                    sources.bash.push({
                        file: this.sanitizePath(file),
                        path: filePath,
                        modified: stats.mtime
                    });
                }
            } catch (error) {
                console.log(`🦉 Note: Could not read shell snapshots: ${error.message}`);
            }
        }

        return sources;
    }

    /**
     * Parse JSONL file with streaming to prevent memory exhaustion
     */
    async parseJsonlFile(filePath) {
        const entries = [];
        const fileStream = fsSync.createReadStream(filePath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        for await (const line of rl) {
            try {
                if (line.trim()) {
                    const entry = JSON.parse(line);
                    if (entry.timestamp || entry.createdAt || entry.created_at) {
                        entries.push(entry);
                    }
                }
            } catch (error) {
                console.log(`🦉 Warning: Could not parse line in ${path.basename(filePath)}: ${error.message}`);
            }
        }

        return entries;
    }

    /**
     * Extract timestamp from various entry formats
     */
    extractTimestamp(entry) {
        const timestamp = entry.timestamp ||
                         entry.createdAt ||
                         entry.created_at ||
                         entry.metadata?.createdAt ||
                         entry.metadata?.created_at ||
                         Date.now();

        return new Date(timestamp);
    }

    /**
     * Extract commands from shell snapshot content
     */
    extractCommandsFromShell(shellContent) {
        const commands = [];
        const lines = shellContent.split("\n");

        for (const line of lines) {
            // Look for command patterns in shell snapshots
            if (line.startsWith("$ ") || line.startsWith("❯ ") || line.startsWith("➜ ")) {
                const command = line.replace(/^[$❯➜]\s*/, "").trim();
                if (command && command.length > 0) {
                    commands.push(command);
                }
            }
        }

        return commands.slice(0, 20); // Limit to 20 most recent commands
    }

    /**
     * Group entries by hour
     */
    groupByHour(allEntries) {
        const hourGroups = {};

        allEntries.forEach(entry => {
            const timestamp = this.extractTimestamp(entry);
            const hourKey = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, "0")}-${String(timestamp.getDate()).padStart(2, "0")}-${String(timestamp.getHours()).padStart(2, "0")}`;

            if (!hourGroups[hourKey]) {
                hourGroups[hourKey] = {
                    chat: [],
                    todos: [],
                    bash: [],
                    startTime: timestamp
                };
            }

            // Categorize by type
            if (entry.type === "todo" || entry.todos) {
                hourGroups[hourKey].todos.push(entry);
            } else if (entry.type === "bash" || entry.command) {
                hourGroups[hourKey].bash.push(entry);
            } else {
                hourGroups[hourKey].chat.push(entry);
            }
        });

        return hourGroups;
    }

    /**
     * Generate markdown for an hour group
     */
    generateHourlyMarkdown(hourKey, hourData) {
        const { chat, todos, bash, startTime } = hourData;
        const hourEnd = new Date(startTime.getTime() + 60 * 60 * 1000);

        let markdown = `# Unified Archive: ${hourKey}\n\n`;
        markdown += `**Time Period**: ${startTime.toISOString()} to ${hourEnd.toISOString()}\n\n`;
        markdown += `**Summary**: ${chat.length} conversations, ${todos.length} todo updates, ${bash.length} commands\n\n`;

        // Sort all entries chronologically
        const allEntries = [
            ...chat.map(e => ({ ...e, _type: "chat", _timestamp: this.extractTimestamp(e) })),
            ...todos.map(e => ({ ...e, _type: "todos", _timestamp: this.extractTimestamp(e) })),
            ...bash.map(e => ({ ...e, _type: "bash", _timestamp: this.extractTimestamp(e) }))
        ].sort((a, b) => a._timestamp - b._timestamp);

        markdown += "## Chronological Timeline\n\n";

        allEntries.forEach((entry, index) => {
            const time = entry._timestamp.toISOString().substr(11, 8);

            markdown += `### ${time} - ${entry._type.toUpperCase()}\n\n`;

            switch (entry._type) {
                case "chat":
                    // Handle individual message entry format
                    if (entry.message && entry.message.content) {
                        const role = entry.message.role || entry.type || "unknown";
                        let content = "";

                        // Extract content from content array
                        if (Array.isArray(entry.message.content)) {
                            entry.message.content.forEach(item => {
                                if (item.type === "text" && item.text) {
                                    content += item.text + " ";
                                } else if (item.type === "tool_use" && item.name) {
                                    content += `[Used tool: ${item.name}] `;
                                }
                            });
                        } else if (typeof entry.message.content === "string") {
                            content = entry.message.content;
                        }

                        if (content.trim()) {
                            const truncatedContent = content.substring(0, 500);
                            markdown += `**${role}**: ${truncatedContent}${content.length > 500 ? "..." : ""}\n\n`;
                        }
                    }
                    break;

                case "todos":
                    markdown += "**Todo Update**\n\n";
                    // Todo files are direct arrays, not nested objects
                    if (Array.isArray(entry.todoList)) {
                        entry.todoList.forEach(todo => {
                            markdown += `- [${todo.status || "unknown"}] ${todo.content || todo.description || "No description"}\n`;
                        });
                    }
                    markdown += "\n";
                    break;

                case "bash":
                    markdown += "**Shell Snapshot**\n\n";
                    markdown += `**File**: ${entry.filename}\n\n`;

                    if (entry.commands && entry.commands.length > 0) {
                        markdown += "**Recent Commands**:\n";
                        entry.commands.slice(0, 10).forEach(cmd => {
                            markdown += `- \`${cmd}\`\n`;
                        });
                        markdown += "\n";
                    }

                    if (entry.content) {
                        markdown += `**Shell Content** (preview):\n\`\`\`bash\n${entry.content.substring(0, 500)}${entry.content.length > 500 ? "\n..." : ""}\n\`\`\`\n\n`;
                    }
                    break;
            }

            markdown += "---\n\n";
        });

        return markdown;
    }

    /**
     * Process all sources and generate unified archives
     */
    async processUnifiedExtraction() {
        console.log("🦉 Athena awakens... Seeking wisdom across all sacred sources...");

        // Gather all data sources
        const sources = await this.gatherDataSources();
        console.log(`📜 Found ${sources.chat.length} chat logs, ${sources.todos.length} todo snapshots, ${sources.bash.length} shell snapshots`);

        // Parse all files and collect entries
        const allEntries = [];

        // Process chat files
        for (const chatFile of sources.chat) {
            try {
                console.log(`📖 Processing chat: ${chatFile.file}`);
                const entries = await this.parseJsonlFile(chatFile.path);
                allEntries.push(...entries);
            } catch (error) {
                console.error(`🦉 Error processing ${chatFile.file}: ${error.message}`);
            }
        }

        // Process todo files
        for (const todoFile of sources.todos) {
            try {
                const data = await fs.readFile(todoFile.path, "utf8");
                const todoList = JSON.parse(data); // This is a direct array

                // Create a wrapper entry for the todo list
                const todoEntry = {
                    type: "todo",
                    timestamp: todoFile.modified.toISOString(),
                    filename: todoFile.file,
                    todoList: todoList
                };

                allEntries.push(todoEntry);
            } catch (error) {
                console.error(`🦉 Error processing ${todoFile.file}: ${error.message}`);
            }
        }

        // Process shell snapshot files
        for (const shellFile of sources.bash) {
            try {
                const shellContent = await fs.readFile(shellFile.path, "utf8");

                // Extract timestamp from filename (snapshot-zsh-TIMESTAMP-ID.sh)
                const timestampMatch = shellFile.file.match(/snapshot-zsh-(\d+)-/);
                let timestamp = shellFile.modified;

                if (timestampMatch) {
                    timestamp = new Date(parseInt(timestampMatch[1]));
                }

                // Create shell snapshot entry
                const shellData = {
                    type: "bash",
                    timestamp: timestamp.toISOString(),
                    filename: shellFile.file,
                    commands: this.extractCommandsFromShell(shellContent),
                    content: shellContent.substring(0, 2000) // Limit content size
                };

                allEntries.push(shellData);
            } catch (error) {
                console.error(`🦉 Error processing ${shellFile.file}: ${error.message}`);
            }
        }

        console.log(`⚡ Collected ${allEntries.length} total entries`);

        // Group by hour
        const hourGroups = this.groupByHour(allEntries);
        const hourKeys = Object.keys(hourGroups).sort();

        console.log(`📅 Grouped into ${hourKeys.length} hours`);

        // Process each hour
        let newFilesCreated = 0;

        for (const hourKey of hourKeys) {
            // Skip if already processed (unless processing all)
            if (!this.processAll && this.processedHours.has(hourKey)) {
                console.log(`⚡ Skipping ${hourKey} - already processed`);
                continue;
            }

            const hourData = hourGroups[hourKey];

            // Generate markdown
            const markdown = this.generateHourlyMarkdown(hourKey, hourData);

            // Write to file atomically
            const outputFile = path.join(this.unifiedPath, `${hourKey}.md`);
            const tempFile = outputFile + ".tmp";

            try {
                await fs.writeFile(tempFile, markdown, "utf8");
                await fs.rename(tempFile, outputFile);

                this.processedHours.add(hourKey);
                newFilesCreated++;

                console.log(`📝 Created: ${hourKey}.md (${hourData.chat.length + hourData.todos.length + hourData.bash.length} entries)`);
            } catch (error) {
                console.error(`🦉 Error writing ${hourKey}: ${error.message}`);
                // Clean up temp file
                try {
                    await fs.unlink(tempFile);
                } catch (cleanupError) {
                    // Ignore cleanup errors
                }
            }
        }

        // Save state
        await this.saveProcessedState();

        console.log("\n🦉 Wisdom extraction complete!");
        console.log(`📊 Created ${newFilesCreated} new unified archives`);
        console.log(`💾 Total archives: ${this.processedHours.size} hours`);
        console.log(`📁 Output location: ${this.unifiedPath}`);
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const options = {};

    // Parse arguments
    if (args.includes("all")) {
        options.all = true;
        console.log("🦉 Processing ALL available data");
    } else if (args.includes("clean")) {
        // Clean processing state
        const metadataPath = path.join(process.cwd(), "logs/metadata");
        const processedFile = path.join(metadataPath, "unified-processed.json");

        try {
            if (fsSync.existsSync(processedFile)) {
                await fs.unlink(processedFile);
                console.log("🦉 Cleaned processing state - will reprocess all data");
            }
        } catch (error) {
            console.error("🦉 Error cleaning state:", error.message);
        }
        return;
    }

    // Create extractor and process
    const extractor = new AthenaUnifiedExtractor(options);

    try {
        await extractor.processUnifiedExtraction();
        console.log("\n🎖️ Mission accomplished! Unified wisdom archives ready for embedding.");
    } catch (error) {
        console.error("🦉 Extraction failed:", error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { AthenaUnifiedExtractor };