#!/usr/bin/env node

/**
 * Athena Status Indicator - Version 1.0
 * 🦉 "Knowledge of what awaits extraction brings wisdom to the prepared mind"
 *
 * Shows unprocessed counts for chat logs, todos, and shell snapshots
 * Provides tactical overview of pending wisdom extraction
 *
 * @version 1.0.0
 * @author Athena, Goddess of Wisdom
 */

const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
require("dotenv").config();

class AthenaStatusIndicator {
    constructor(options = {}) {
        // Source paths - Match unified extractor paths
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

        // State tracking paths
        this.metadataPath = path.join(process.cwd(), "logs", "metadata");
        this.processedFile = path.join(this.metadataPath, "unified-processed.json");

        // Processed state
        this.processedHours = new Set();
        this.lastExtractionTime = null;
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

                // Get file modification time for last extraction
                const stats = await fs.stat(this.processedFile);
                this.lastExtractionTime = stats.mtime;
            }
        } catch (_error) {
            // No processed state means everything is unprocessed
            this.processedHours = new Set();
        }
    }

    /**
     * Get all available data sources with metadata
     */
    async gatherDataSources() {
        const sources = {
            chat: [],
            todos: [],
            bash: []
        };

        // Gather chat logs (JSONL files)
        try {
            if (fsSync.existsSync(this.claudeProjectPath)) {
                const chatFiles = await fs.readdir(this.claudeProjectPath);
                const jsonlFiles = chatFiles.filter(f => f.endsWith(".jsonl"));

                for (const file of jsonlFiles) {
                    const filePath = path.join(this.claudeProjectPath, file);
                    const stats = await fs.stat(filePath);
                    sources.chat.push({
                        file,
                        path: filePath,
                        modified: stats.mtime,
                        size: stats.size
                    });
                }
            }
        } catch (_error) {
            // Chat directory not accessible
        }

        // Gather todo files
        try {
            if (fsSync.existsSync(this.todosPath)) {
                const todoFiles = await fs.readdir(this.todosPath);
                const todoJsonFiles = todoFiles.filter(f => f.endsWith(".json"));

                for (const file of todoJsonFiles) {
                    const filePath = path.join(this.todosPath, file);
                    const stats = await fs.stat(filePath);
                    sources.todos.push({
                        file,
                        path: filePath,
                        modified: stats.mtime,
                        size: stats.size
                    });
                }
            }
        } catch (_error) {
            // Todo directory not accessible
        }

        // Gather shell snapshots
        try {
            if (fsSync.existsSync(this.shellSnapshotsPath)) {
                const shellFiles = await fs.readdir(this.shellSnapshotsPath);
                const shellSnapshots = shellFiles.filter(f => f.endsWith(".sh"));

                for (const file of shellSnapshots) {
                    const filePath = path.join(this.shellSnapshotsPath, file);
                    const stats = await fs.stat(filePath);
                    sources.bash.push({
                        file,
                        path: filePath,
                        modified: stats.mtime,
                        size: stats.size
                    });
                }
            }
        } catch (_error) {
            // Shell directory not accessible
        }

        return sources;
    }

    /**
     * Count entries in a JSONL file without loading into memory
     */
    async countJsonlEntries(filePath) {
        let count = 0;
        try {
            const fileStream = fsSync.createReadStream(filePath);
            const rl = require("readline").createInterface({
                input: fileStream,
                crlfDelay: Infinity
            });

            for await (const line of rl) {
                if (line.trim()) {
                    count++;
                }
            }
        } catch (_error) {
            // Error reading file
        }
        return count;
    }

    /**
     * Estimate time range coverage of new data
     */
    getTimeRangeCoverage(sources) {
        let earliestTime = null;
        let latestTime = null;

        const allFiles = [...sources.chat, ...sources.todos, ...sources.bash];

        for (const file of allFiles) {
            if (!earliestTime || file.modified < earliestTime) {
                earliestTime = file.modified;
            }
            if (!latestTime || file.modified > latestTime) {
                latestTime = file.modified;
            }
        }

        return { earliestTime, latestTime };
    }

    /**
     * Display comprehensive status
     */
    async displayStatus() {
        console.log("🦉 Athena's Wisdom Extraction Status");
        console.log("═══════════════════════════════════");

        await this.loadProcessedState();
        const sources = await this.gatherDataSources();

        // Count all available sources
        const totalSources = sources.chat.length + sources.todos.length + sources.bash.length;

        if (totalSources === 0) {
            console.log("📭 No data sources found - all directories empty");
            return;
        }

        console.log("📊 Data Sources Found:");
        console.log(`   📄 Chat logs: ${sources.chat.length} JSONL files`);
        console.log(`   ✅ Todo snapshots: ${sources.todos.length} JSON files`);
        console.log(`   ⚡ Shell snapshots: ${sources.bash.length} .sh files`);
        console.log();

        // Time range analysis
        const { earliestTime, latestTime } = this.getTimeRangeCoverage(sources);
        if (earliestTime) {
            console.log("⏰ Data Time Range:");
            console.log(`   📅 Earliest: ${earliestTime.toISOString()}`);
            console.log(`   📅 Latest: ${latestTime.toISOString()}`);

            const daysCovered = Math.ceil((latestTime - earliestTime) / (1000 * 60 * 60 * 24));
            console.log(`   📈 Coverage: ${daysCovered} days`);
            console.log();
        }

        // Processing status
        console.log("🔄 Processing Status:");
        console.log(`   🏛️ Unified archives: ${this.processedHours.size} hourly files`);

        if (this.lastExtractionTime) {
            const hoursSince = Math.round((Date.now() - this.lastExtractionTime) / (1000 * 60 * 60));
            console.log(`   ⏱️  Last extraction: ${hoursSince} hours ago`);
        } else {
            console.log("   ⚠️  No extraction history found");
        }

        // Quick entry count for chat files (expensive but informative)
        if (sources.chat.length > 0 && sources.chat.length <= 5) {
            console.log();
            console.log("📈 Recent Chat Activity:");
            for (const chatFile of sources.chat.slice(0, 5)) {
                const entryCount = await this.countJsonlEntries(chatFile.path);
                const sizeMB = (chatFile.size / (1024 * 1024)).toFixed(1);
                console.log(`   📝 ${chatFile.file}: ${entryCount} entries (${sizeMB}MB)`);
            }
        }

        console.log();
        console.log("💡 Recommendation:");

        const newDataAvailable = sources.chat.length > 0 || sources.todos.length > 0 || sources.bash.length > 0;
        const extractionAge = this.lastExtractionTime ?
            Math.round((Date.now() - this.lastExtractionTime) / (1000 * 60 * 60)) : 999;

        if (!newDataAvailable) {
            console.log("   ✅ All data appears processed - system up to date");
        } else if (extractionAge > 24) {
            console.log("   🚨 Extraction overdue! Run: node agent-tools/athena-unified-extractor.js");
        } else if (extractionAge > 6) {
            console.log("   ⚡ Consider extraction: node agent-tools/athena-unified-extractor.js");
        } else {
            console.log("   ✨ Recent extraction - system appears current");
        }

        console.log();
        console.log("🎖️  Status check complete!");
    }

    /**
     * Output JSON status for programmatic use
     */
    async getJsonStatus() {
        await this.loadProcessedState();
        const sources = await this.gatherDataSources();
        const { earliestTime, latestTime } = this.getTimeRangeCoverage(sources);

        const status = {
            timestamp: new Date().toISOString(),
            sources: {
                chat: sources.chat.length,
                todos: sources.todos.length,
                bash: sources.bash.length,
                total: sources.chat.length + sources.todos.length + sources.bash.length
            },
            processed: {
                archives: this.processedHours.size,
                lastExtraction: this.lastExtractionTime?.toISOString() || null,
                hoursSinceExtraction: this.lastExtractionTime ?
                    Math.round((Date.now() - this.lastExtractionTime) / (1000 * 60 * 60)) : null
            },
            coverage: {
                earliest: earliestTime?.toISOString() || null,
                latest: latestTime?.toISOString() || null,
                daysCovered: earliestTime && latestTime ?
                    Math.ceil((latestTime - earliestTime) / (1000 * 60 * 60 * 24)) : 0
            }
        };

        return status;
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const indicator = new AthenaStatusIndicator();

    if (args.includes("json")) {
        const status = await indicator.getJsonStatus();
        console.log(JSON.stringify(status, null, 2));
    } else {
        await indicator.displayStatus();
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { AthenaStatusIndicator };