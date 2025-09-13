#!/usr/bin/env node

/**
 * Athena Shell Commands Extractor
 * 🦉 "From commands executed, workflows crystallize. From workflows, automation blooms."
 *
 * Processes Claude Code shell snapshot history to extract:
 * - Common command patterns
 * - Development workflows
 * - Tool usage statistics
 * - Error patterns and recovery
 *
 * @version 1.0.0
 * @author Athena, Goddess of Wisdom
 */

const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
require("dotenv").config();

class AthenaShellExtractor {
    constructor(options = {}) {
        // Source paths
        this.shellSnapshotsPath = options.shellSnapshotsPath || path.join(
            process.env.HOME,
            ".claude/shell-snapshots"
        );

        // Output paths
        this.logsRoot = options.logsRoot || path.join(process.cwd(), "logs");
        this.shellPath = path.join(this.logsRoot, "shell");
        this.metadataPath = path.join(this.logsRoot, "metadata");

        // Processing state
        this.processedFile = path.join(this.metadataPath, "processed-shells.json");
        this.processedShells = new Set();

        // Command pattern recognition
        this.commandPatterns = {
            git: /^git\s+(\w+)/,
            npm: /^npm\s+(\w+)/,
            docker: /^docker(?:-compose)?\s+(\w+)/,
            test: /^(?:npm\s+test|npx\s+playwright|jest|mocha)/,
            build: /^(?:npm\s+run\s+build|make|cargo\s+build)/,
            install: /^(?:npm\s+install|pip\s+install|cargo\s+add)/,
            navigate: /^cd\s+/,
            search: /^(?:grep|rg|find|ag)\s+/,
            edit: /^(?:vim|nano|code|emacs)\s+/,
            debug: /^(?:node\s+--inspect|gdb|lldb)/
        };

        // Error patterns
        this.errorPatterns = {
            npmError: /npm ERR!/,
            gitConflict: /CONFLICT|merge conflict/i,
            dockerError: /Error response from daemon/,
            testFailure: /FAIL|✗|Tests:\s+\d+\s+failed/,
            buildError: /Build failed|compilation error/i,
            syntaxError: /SyntaxError|ParseError/,
            typeError: /TypeError|type error/i,
            moduleNotFound: /Cannot find module|Module not found/
        };

        // Initialize directories
        this.ensureDirectories();
        this.loadProcessedShells();
    }

    /**
     * Ensure all required directories exist
     */
    async ensureDirectories() {
        const dirs = [
            this.logsRoot,
            this.shellPath,
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
     * Load list of already processed shell snapshots
     */
    async loadProcessedShells() {
        try {
            if (fsSync.existsSync(this.processedFile)) {
                const data = await fs.readFile(this.processedFile, "utf8");
                const processed = JSON.parse(data);
                this.processedShells = new Set(processed);
                console.log(`🦉 Loaded ${this.processedShells.size} processed shell files`);
            }
        } catch (error) {
            console.error("🦉 Error loading processed shells:", error.message);
            this.processedShells = new Set();
        }
    }

    /**
     * Save list of processed shell snapshots
     */
    async saveProcessedShells() {
        try {
            await fs.writeFile(
                this.processedFile,
                JSON.stringify(Array.from(this.processedShells), null, 2)
            );
        } catch (error) {
            console.error("🦉 Error saving processed shells:", error.message);
        }
    }

    /**
     * Parse a shell snapshot file
     */
    async parseShellFile(filePath) {
        try {
            const content = await fs.readFile(filePath, "utf8");

            // Shell snapshots are bash scripts with functions and environment
            const lines = content.split("\n");
            const commands = [];
            const functions = [];
            const aliases = [];
            const exports = [];

            lines.forEach(line => {
                const trimmed = line.trim();

                // Skip comments and empty lines
                if (!trimmed || trimmed.startsWith("#")) {return;}

                // Extract aliases
                if (trimmed.startsWith("alias ")) {
                    const match = trimmed.match(/alias\s+(?:--\s+)?([^=]+)='([^']+)'/);
                    if (match) {
                        aliases.push({
                            name: match[1],
                            command: match[2]
                        });
                    }
                }

                // Extract exports
                if (trimmed.startsWith("export ")) {
                    const match = trimmed.match(/export\s+([^=]+)=(.+)/);
                    if (match) {
                        exports.push({
                            variable: match[1],
                            value: match[2]
                        });
                    }
                }

                // Extract function names
                if (trimmed.match(/^\w+\s*\(\)\s*{/) || trimmed.match(/^function\s+\w+/)) {
                    const match = trimmed.match(/^(?:function\s+)?(\w+)/);
                    if (match) {
                        functions.push(match[1]);
                    }
                }
            });

            // Extract timestamp from filename if possible
            const filename = path.basename(filePath);
            const timestampMatch = filename.match(/snapshot-\w+-(\d+)-/);
            const timestamp = timestampMatch ? parseInt(timestampMatch[1]) : Date.now();

            return {
                timestamp,
                filename,
                aliases,
                exports,
                functions,
                lineCount: lines.length
            };

        } catch (error) {
            console.error(`🦉 Error parsing ${filePath}:`, error.message);
            return null;
        }
    }

    /**
     * Extract workflow patterns from shell data
     */
    extractWorkflowPatterns(shellData) {
        const patterns = {
            aliasCategories: {},
            customFunctions: [],
            environmentVars: {},
            toolUsage: {},
            workflowIndicators: []
        };

        // Categorize aliases
        shellData.aliases.forEach(alias => {
            let category = "other";

            // Categorize by command pattern
            for (const [cat, pattern] of Object.entries(this.commandPatterns)) {
                if (pattern.test(alias.command)) {
                    category = cat;
                    break;
                }
            }

            patterns.aliasCategories[category] = patterns.aliasCategories[category] || [];
            patterns.aliasCategories[category].push(alias.name);
        });

        // Track custom functions
        patterns.customFunctions = shellData.functions.filter(
            fn => !["compdef", "compaudit", "compinit", "compinstall"].includes(fn)
        );

        // Analyze environment variables
        shellData.exports.forEach(exp => {
            if (exp.variable.includes("PATH")) {
                patterns.environmentVars.paths = patterns.environmentVars.paths || [];
                patterns.environmentVars.paths.push(exp.variable);
            } else if (exp.variable.includes("API") || exp.variable.includes("KEY")) {
                patterns.environmentVars.credentials = patterns.environmentVars.credentials || [];
                patterns.environmentVars.credentials.push(exp.variable);
            } else if (exp.variable.includes("DEBUG") || exp.variable.includes("ENV")) {
                patterns.environmentVars.config = patterns.environmentVars.config || [];
                patterns.environmentVars.config.push(exp.variable);
            }
        });

        // Detect workflow indicators from aliases
        shellData.aliases.forEach(alias => {
            if (alias.command.includes("&&") || alias.command.includes(";")) {
                patterns.workflowIndicators.push({
                    type: "chained",
                    alias: alias.name,
                    steps: alias.command.split(/&&|;/).length
                });
            }

            if (alias.command.includes("cd") && alias.command.includes("&&")) {
                patterns.workflowIndicators.push({
                    type: "navigate-and-execute",
                    alias: alias.name
                });
            }
        });

        return patterns;
    }

    /**
     * Generate timestamp-based filename
     */
    generateTimestampName(timestamp) {
        const date = new Date(timestamp);

        const timestampStr = [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0"),
            String(date.getHours()).padStart(2, "0"),
            String(date.getMinutes()).padStart(2, "0"),
            String(date.getSeconds()).padStart(2, "0")
        ].join("-");

        return `${timestampStr}-shell-snapshot`;
    }

    /**
     * Generate Markdown report
     */
    generateMarkdown(shellData, patterns, filename) {
        const lines = [];
        const date = new Date(shellData.timestamp);

        // Header
        lines.push("# Shell Environment Snapshot");
        lines.push("");
        lines.push(`**Date**: ${date.toISOString()}`);
        lines.push(`**Source**: ${shellData.filename}`);
        lines.push(`**Lines**: ${shellData.lineCount}`);
        lines.push("");

        // Custom Functions
        if (patterns.customFunctions.length > 0) {
            lines.push("## 🔧 Custom Functions");
            lines.push("");
            patterns.customFunctions.forEach(fn => {
                lines.push(`- \`${fn}()\``);
            });
            lines.push("");
        }

        // Aliases by Category
        if (Object.keys(patterns.aliasCategories).length > 0) {
            lines.push("## 🚀 Command Aliases");
            lines.push("");

            Object.entries(patterns.aliasCategories)
                .sort((a, b) => b[1].length - a[1].length)
                .forEach(([category, aliases]) => {
                    lines.push(`### ${category.charAt(0).toUpperCase() + category.slice(1)}`);
                    lines.push("");
                    aliases.slice(0, 10).forEach(alias => {
                        lines.push(`- \`${alias}\``);
                    });
                    if (aliases.length > 10) {
                        lines.push(`- ... and ${aliases.length - 10} more`);
                    }
                    lines.push("");
                });
        }

        // Environment Variables
        if (Object.keys(patterns.environmentVars).length > 0) {
            lines.push("## 🌍 Environment Configuration");
            lines.push("");

            if (patterns.environmentVars.paths) {
                lines.push("### Path Variables");
                patterns.environmentVars.paths.forEach(p => {
                    lines.push(`- \`${p}\``);
                });
                lines.push("");
            }

            if (patterns.environmentVars.config) {
                lines.push("### Configuration Variables");
                patterns.environmentVars.config.forEach(c => {
                    lines.push(`- \`${c}\``);
                });
                lines.push("");
            }

            if (patterns.environmentVars.credentials) {
                lines.push("### Credential Variables");
                lines.push(`*${patterns.environmentVars.credentials.length} credential variables configured*`);
                lines.push("");
            }
        }

        // Workflow Indicators
        if (patterns.workflowIndicators.length > 0) {
            lines.push("## 🔄 Workflow Patterns");
            lines.push("");
            patterns.workflowIndicators.forEach(wf => {
                if (wf.type === "chained") {
                    lines.push(`- **${wf.alias}**: ${wf.steps}-step workflow`);
                } else {
                    lines.push(`- **${wf.alias}**: ${wf.type}`);
                }
            });
            lines.push("");
        }

        // Raw Aliases List
        if (shellData.aliases.length > 0) {
            lines.push("## 📝 All Aliases");
            lines.push("");
            lines.push("```bash");
            shellData.aliases.slice(0, 50).forEach(alias => {
                lines.push(`alias ${alias.name}='${alias.command}'`);
            });
            if (shellData.aliases.length > 50) {
                lines.push(`# ... and ${shellData.aliases.length - 50} more aliases`);
            }
            lines.push("```");
            lines.push("");
        }

        // Footer
        lines.push("---");
        lines.push("");
        lines.push("*🦉 Shell patterns extracted by Athena*");
        lines.push(`*Generated: ${new Date().toISOString()}*`);

        return lines.join("\n");
    }

    /**
     * Create Memento entity for shell snapshot
     */
    createMementoEntity(filename, patterns, shellData) {
        const aliasSummary = Object.entries(patterns.aliasCategories)
            .map(([cat, aliases]) => `${cat}:${aliases.length}`)
            .join(", ") || "none";

        return {
            name: `ATHENA:SHELL:${filename}`,
            entityType: "KNOWLEDGE:EXTRACTED:SHELL",
            observations: [
                `TIMESTAMP: ${new Date(shellData.timestamp).toISOString()}`,
                `ALIASES: ${shellData.aliases.length}`,
                `FUNCTIONS: ${shellData.functions.length}`,
                `EXPORTS: ${shellData.exports.length}`,
                `CUSTOM_FUNCTIONS: ${patterns.customFunctions.length}`,
                `ALIAS_CATEGORIES: ${aliasSummary}`,
                `WORKFLOW_PATTERNS: ${patterns.workflowIndicators.length}`,
                `MD_PATH: /logs/shell/${filename}.md`,
                "🦉 EXTRACTED_BY: Athena, Workflow Archaeologist"
            ]
        };
    }

    /**
     * Process a single shell snapshot file
     */
    async processShellFile(filePath) {
        console.log(`   🐚 Processing: ${path.basename(filePath)}`);

        try {
            const shellData = await this.parseShellFile(filePath);
            if (!shellData) {
                console.log(`   ⚠️ Could not parse ${path.basename(filePath)}`);
                return null;
            }

            // Extract patterns
            const patterns = this.extractWorkflowPatterns(shellData);

            // Generate filename
            const filename = this.generateTimestampName(shellData.timestamp);

            // Generate Markdown
            const markdown = this.generateMarkdown(shellData, patterns, filename);

            // Save MD file
            const mdPath = path.join(this.shellPath, `${filename}.md`);
            await fs.writeFile(mdPath, markdown);
            console.log(`   ✅ Created: ${path.basename(mdPath)}`);

            // Create Memento entity
            const mementoEntity = this.createMementoEntity(filename, patterns, shellData);

            return {
                filename,
                mementoEntity,
                patterns,
                shellData
            };

        } catch (error) {
            console.error(`   ❌ Error processing ${path.basename(filePath)}:`, error.message);
            return null;
        }
    }

    /**
     * Process all shell snapshot files
     */
    async processAllShells() {
        console.log("🦉 Extracting wisdom from shell snapshots...");
        console.log("");

        try {
            if (!fsSync.existsSync(this.shellSnapshotsPath)) {
                console.error(`❌ Shell snapshots directory not found: ${this.shellSnapshotsPath}`);
                return [];
            }

            // Get all .sh files
            const files = await fs.readdir(this.shellSnapshotsPath);
            const shellFiles = files
                .filter(f => f.endsWith(".sh"))
                .filter(f => !this.processedShells.has(f));

            if (shellFiles.length === 0) {
                console.log("📭 No unprocessed shell snapshot files found");
                return [];
            }

            console.log(`🐚 Found ${shellFiles.length} shell snapshot files to process`);
            console.log("");

            const results = [];
            const mementoEntities = [];

            // Process each file
            for (const file of shellFiles) {
                const filePath = path.join(this.shellSnapshotsPath, file);
                const result = await this.processShellFile(filePath);

                if (result) {
                    results.push(result);
                    mementoEntities.push(result.mementoEntity);
                    this.processedShells.add(file);
                }

                // Save progress periodically
                if (results.length % 10 === 0) {
                    await this.saveProcessedShells();
                }
            }

            // Save final state
            await this.saveProcessedShells();

            // Output Memento entities
            if (mementoEntities.length > 0) {
                const mementoFile = path.join(this.metadataPath, "memento-shells.json");
                await fs.writeFile(mementoFile, JSON.stringify(mementoEntities, null, 2));
                console.log(`🦉 Memento entities saved to: ${mementoFile}`);
            }

            // Summary statistics
            console.log("");
            console.log("═".repeat(60));
            console.log("🦉 Shell extraction complete!");
            console.log("📊 Statistics:");
            console.log(`   • Files processed: ${results.length}`);
            console.log(`   • Total aliases found: ${results.reduce((sum, r) => sum + r.shellData.aliases.length, 0)}`);
            console.log(`   • Custom functions: ${results.reduce((sum, r) => sum + r.patterns.customFunctions.length, 0)}`);

            // Aggregate alias categories
            const allCategories = {};
            results.forEach(r => {
                Object.entries(r.patterns.aliasCategories).forEach(([cat, aliases]) => {
                    allCategories[cat] = (allCategories[cat] || 0) + aliases.length;
                });
            });

            if (Object.keys(allCategories).length > 0) {
                console.log("   • Alias categories:");
                Object.entries(allCategories)
                    .sort((a, b) => b[1] - a[1])
                    .forEach(([cat, count]) => {
                        console.log(`     - ${cat}: ${count}`);
                    });
            }

            console.log(`📝 Shell analyses saved to: ${this.shellPath}`);

            return results;

        } catch (error) {
            console.error("🦉 Fatal error during shell processing:", error);
            throw error;
        }
    }

    /**
     * Clean restart - clear all processed state
     */
    async cleanRestart() {
        console.log("🦉 Initiating clean restart for shell snapshots...");

        this.processedShells = new Set();
        await this.saveProcessedShells();

        console.log("🦉 Clean restart complete. Ready to process all shell files.");
    }
}

// CLI interface
if (require.main === module) {
    const extractor = new AthenaShellExtractor();

    const command = process.argv[2];

    switch (command) {
        case "clean":
            extractor.cleanRestart().then(() => {
                console.log("🦉 Clean restart complete");
            });
            break;

        case "process":
        default:
            extractor.processAllShells().then(results => {
                if (results.length > 0) {
                    console.log(`\n🦉 "From ${results.length} shell snapshots, workflow wisdom flows."`);
                } else {
                    console.log("\n🦉 No new shell snapshots to process.");
                }
            }).catch(error => {
                console.error("🦉 Athena encountered an error:", error);
                process.exit(1);
            });
    }
}

module.exports = { AthenaShellExtractor };