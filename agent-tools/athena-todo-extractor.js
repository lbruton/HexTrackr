#!/usr/bin/env node

/**
 * Athena Todo History Extractor
 * 🦉 "From tasks completed, patterns emerge. From patterns, productivity flows."
 *
 * Processes Claude Code todo history to extract:
 * - Task patterns and workflows
 * - Project phases and milestones
 * - Time estimates vs actual completion
 * - Common task sequences
 *
 * @version 1.0.0
 * @author Athena, Goddess of Wisdom
 */

const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
require("dotenv").config();

class AthenaTodoExtractor {
    constructor(options = {}) {
        // Source paths
        this.todoHistoryPath = options.todoHistoryPath || path.join(
            process.env.HOME,
            ".claude/todo-history"
        );

        // Output paths
        this.logsRoot = options.logsRoot || path.join(process.cwd(), "logs");
        this.todosPath = path.join(this.logsRoot, "todos");
        this.metadataPath = path.join(this.logsRoot, "metadata");

        // Processing state
        this.processedFile = path.join(this.metadataPath, "processed-todos.json");
        this.processedTodos = new Set();

        // Task pattern recognition
        this.taskPatterns = {
            bugFix: /fix|bug|error|issue|debug|resolve|patch|repair/i,
            feature: /implement|add|create|build|develop|feature|enhance/i,
            refactor: /refactor|clean|optimize|improve|restructure|reorganize/i,
            test: /test|spec|coverage|e2e|unit|integration/i,
            docs: /document|docs|readme|comment|explain|describe/i,
            review: /review|check|validate|verify|inspect|audit/i,
            deploy: /deploy|release|publish|ship|launch|production/i,
            research: /research|investigate|explore|analyze|study|understand/i
        };

        // Initialize directories
        this.ensureDirectories();
        this.loadProcessedTodos();
    }

    /**
     * Ensure all required directories exist
     */
    async ensureDirectories() {
        const dirs = [
            this.logsRoot,
            this.todosPath,
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
     * Load list of already processed todos
     */
    async loadProcessedTodos() {
        try {
            if (fsSync.existsSync(this.processedFile)) {
                const data = await fs.readFile(this.processedFile, "utf8");
                const processed = JSON.parse(data);
                this.processedTodos = new Set(processed);
                console.log(`🦉 Loaded ${this.processedTodos.size} processed todo files`);
            }
        } catch (error) {
            console.error("🦉 Error loading processed todos:", error.message);
            this.processedTodos = new Set();
        }
    }

    /**
     * Save list of processed todos
     */
    async saveProcessedTodos() {
        try {
            await fs.writeFile(
                this.processedFile,
                JSON.stringify(Array.from(this.processedTodos), null, 2)
            );
        } catch (error) {
            console.error("🦉 Error saving processed todos:", error.message);
        }
    }

    /**
     * Parse a todo history JSON file
     */
    async parseTodoFile(filePath) {
        try {
            const content = await fs.readFile(filePath, "utf8");
            const data = JSON.parse(content);

            // Structure can vary, normalize it
            const todos = data.todos || data || [];
            const metadata = data.metadata || {};

            return {
                todos: Array.isArray(todos) ? todos : [],
                metadata,
                filename: path.basename(filePath)
            };
        } catch (error) {
            console.error(`🦉 Error parsing ${filePath}:`, error.message);
            return null;
        }
    }

    /**
     * Extract task patterns and insights
     */
    extractTaskPatterns(todos) {
        const patterns = {
            taskTypes: {},
            completionRate: 0,
            totalTasks: 0,
            completedTasks: 0,
            pendingTasks: 0,
            inProgressTasks: 0,
            taskSequences: [],
            commonWorkflows: [],
            estimateAccuracy: []
        };

        // Count by status
        todos.forEach(todo => {
            patterns.totalTasks++;

            // Status counts
            if (todo.status === "completed" || todo.completed) {
                patterns.completedTasks++;
            } else if (todo.status === "in_progress") {
                patterns.inProgressTasks++;
            } else {
                patterns.pendingTasks++;
            }

            // Categorize by pattern
            const content = todo.content || todo.text || "";
            for (const [type, pattern] of Object.entries(this.taskPatterns)) {
                if (pattern.test(content)) {
                    patterns.taskTypes[type] = (patterns.taskTypes[type] || 0) + 1;
                }
            }
        });

        // Calculate completion rate
        if (patterns.totalTasks > 0) {
            patterns.completionRate = Math.round(
                (patterns.completedTasks / patterns.totalTasks) * 100
            );
        }

        // Extract task sequences (completed tasks in order)
        const completedInOrder = todos
            .filter(t => t.status === "completed" || t.completed)
            .map(t => this.summarizeTask(t.content || t.text || ""));

        if (completedInOrder.length > 0) {
            patterns.taskSequences = this.findCommonSequences(completedInOrder);
        }

        return patterns;
    }

    /**
     * Summarize a task into a short category
     */
    summarizeTask(content) {
        for (const [type, pattern] of Object.entries(this.taskPatterns)) {
            if (pattern.test(content)) {
                return type;
            }
        }
        return "other";
    }

    /**
     * Find common task sequences
     */
    findCommonSequences(tasks) {
        const sequences = [];
        const windowSize = 3;

        for (let i = 0; i <= tasks.length - windowSize; i++) {
            const sequence = tasks.slice(i, i + windowSize).join(" → ");
            sequences.push(sequence);
        }

        // Count frequency
        const frequency = {};
        sequences.forEach(seq => {
            frequency[seq] = (frequency[seq] || 0) + 1;
        });

        // Return top sequences
        return Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([seq, count]) => ({ sequence: seq, count }));
    }

    /**
     * Generate timestamp-based filename
     */
    generateTimestampName(metadata) {
        const date = new Date(metadata.timestamp || Date.now());

        const timestamp = [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0"),
            String(date.getHours()).padStart(2, "0"),
            String(date.getMinutes()).padStart(2, "0"),
            String(date.getSeconds()).padStart(2, "0")
        ].join("-");

        return `${timestamp}-todo-history`;
    }

    /**
     * Generate Markdown report
     */
    generateMarkdown(todoData, patterns, filename) {
        const lines = [];
        const date = new Date(todoData.metadata?.timestamp || Date.now());

        // Header
        lines.push("# Todo History Analysis");
        lines.push("");
        lines.push(`**Date**: ${date.toISOString()}`);
        lines.push(`**Total Tasks**: ${patterns.totalTasks}`);
        lines.push(`**Completion Rate**: ${patterns.completionRate}%`);
        lines.push("");

        // Status Breakdown
        lines.push("## 📊 Task Status");
        lines.push("");
        lines.push(`- ✅ Completed: ${patterns.completedTasks}`);
        lines.push(`- 🔄 In Progress: ${patterns.inProgressTasks}`);
        lines.push(`- ⏳ Pending: ${patterns.pendingTasks}`);
        lines.push("");

        // Task Types
        if (Object.keys(patterns.taskTypes).length > 0) {
            lines.push("## 🔍 Task Categories");
            lines.push("");
            Object.entries(patterns.taskTypes)
                .sort((a, b) => b[1] - a[1])
                .forEach(([type, count]) => {
                    lines.push(`- **${type}**: ${count} tasks`);
                });
            lines.push("");
        }

        // Common Workflows
        if (patterns.taskSequences.length > 0) {
            lines.push("## 🔄 Common Task Sequences");
            lines.push("");
            patterns.taskSequences.forEach(({ sequence, count }) => {
                lines.push(`- \`${sequence}\` (${count} times)`);
            });
            lines.push("");
        }

        // Task List
        lines.push("## 📝 Task Details");
        lines.push("");

        // Group by status
        const byStatus = {
            completed: [],
            in_progress: [],
            pending: []
        };

        todoData.todos.forEach(todo => {
            const status = todo.status || (todo.completed ? "completed" : "pending");
            byStatus[status] = byStatus[status] || [];
            byStatus[status].push(todo);
        });

        // Completed tasks
        if (byStatus.completed.length > 0) {
            lines.push("### ✅ Completed Tasks");
            lines.push("");
            byStatus.completed.forEach(todo => {
                const content = todo.content || todo.text || "Unnamed task";
                lines.push(`- [x] ${content}`);
            });
            lines.push("");
        }

        // In progress tasks
        if (byStatus.in_progress.length > 0) {
            lines.push("### 🔄 In Progress");
            lines.push("");
            byStatus.in_progress.forEach(todo => {
                const content = todo.content || todo.text || "Unnamed task";
                const activeForm = todo.activeForm ? ` (${todo.activeForm})` : "";
                lines.push(`- [ ] ${content}${activeForm}`);
            });
            lines.push("");
        }

        // Pending tasks
        if (byStatus.pending.length > 0) {
            lines.push("### ⏳ Pending Tasks");
            lines.push("");
            byStatus.pending.forEach(todo => {
                const content = todo.content || todo.text || "Unnamed task";
                lines.push(`- [ ] ${content}`);
            });
            lines.push("");
        }

        // Footer
        lines.push("---");
        lines.push("");
        lines.push("*🦉 Task patterns extracted by Athena*");
        lines.push(`*Generated: ${new Date().toISOString()}*`);

        return lines.join("\n");
    }

    /**
     * Create Memento entity for todo history
     */
    createMementoEntity(filename, patterns, todoCount) {
        const taskTypeSummary = Object.entries(patterns.taskTypes)
            .map(([type, count]) => `${type}:${count}`)
            .join(", ") || "none";

        return {
            name: `ATHENA:TODOS:${filename}`,
            entityType: "KNOWLEDGE:EXTRACTED:TODOS",
            observations: [
                `TIMESTAMP: ${new Date().toISOString()}`,
                `TOTAL_TASKS: ${patterns.totalTasks}`,
                `COMPLETED: ${patterns.completedTasks}`,
                `IN_PROGRESS: ${patterns.inProgressTasks}`,
                `PENDING: ${patterns.pendingTasks}`,
                `COMPLETION_RATE: ${patterns.completionRate}%`,
                `TASK_TYPES: ${taskTypeSummary}`,
                `MD_PATH: /logs/todos/${filename}.md`,
                `COMMON_SEQUENCES: ${patterns.taskSequences.length} patterns found`,
                "🦉 EXTRACTED_BY: Athena, Task Pattern Analyzer"
            ]
        };
    }

    /**
     * Process a single todo history file
     */
    async processTodoFile(filePath) {
        console.log(`   📋 Processing: ${path.basename(filePath)}`);

        try {
            const todoData = await this.parseTodoFile(filePath);
            if (!todoData || todoData.todos.length === 0) {
                console.log(`   ⚠️ No todos found in ${path.basename(filePath)}`);
                return null;
            }

            // Extract patterns
            const patterns = this.extractTaskPatterns(todoData.todos);

            // Generate filename
            const filename = this.generateTimestampName(todoData.metadata);

            // Generate Markdown
            const markdown = this.generateMarkdown(todoData, patterns, filename);

            // Save MD file
            const mdPath = path.join(this.todosPath, `${filename}.md`);
            await fs.writeFile(mdPath, markdown);
            console.log(`   ✅ Created: ${path.basename(mdPath)}`);

            // Create Memento entity
            const mementoEntity = this.createMementoEntity(
                filename,
                patterns,
                todoData.todos.length
            );

            return {
                filename,
                mementoEntity,
                patterns,
                todoCount: todoData.todos.length
            };

        } catch (error) {
            console.error(`   ❌ Error processing ${path.basename(filePath)}:`, error.message);
            return null;
        }
    }

    /**
     * Process all todo history files
     */
    async processAllTodos() {
        console.log("🦉 Extracting wisdom from todo history...");
        console.log("");

        try {
            if (!fsSync.existsSync(this.todoHistoryPath)) {
                console.error(`❌ Todo history directory not found: ${this.todoHistoryPath}`);
                return [];
            }

            // Get all JSON files
            const files = await fs.readdir(this.todoHistoryPath);
            const jsonFiles = files
                .filter(f => f.endsWith(".json"))
                .filter(f => !this.processedTodos.has(f));

            if (jsonFiles.length === 0) {
                console.log("📭 No unprocessed todo history files found");
                return [];
            }

            console.log(`📋 Found ${jsonFiles.length} todo history files to process`);
            console.log("");

            const results = [];
            const mementoEntities = [];

            // Process each file
            for (const file of jsonFiles) {
                const filePath = path.join(this.todoHistoryPath, file);
                const result = await this.processTodoFile(filePath);

                if (result) {
                    results.push(result);
                    mementoEntities.push(result.mementoEntity);
                    this.processedTodos.add(file);
                }

                // Save progress periodically
                if (results.length % 10 === 0) {
                    await this.saveProcessedTodos();
                }
            }

            // Save final state
            await this.saveProcessedTodos();

            // Output Memento entities
            if (mementoEntities.length > 0) {
                const mementoFile = path.join(this.metadataPath, "memento-todos.json");
                await fs.writeFile(mementoFile, JSON.stringify(mementoEntities, null, 2));
                console.log(`🦉 Memento entities saved to: ${mementoFile}`);
            }

            // Summary statistics
            console.log("");
            console.log("═".repeat(60));
            console.log("🦉 Todo extraction complete!");
            console.log("📊 Statistics:");
            console.log(`   • Files processed: ${results.length}`);
            console.log(`   • Total tasks analyzed: ${results.reduce((sum, r) => sum + r.todoCount, 0)}`);

            // Aggregate task types
            const allTypes = {};
            results.forEach(r => {
                Object.entries(r.patterns.taskTypes).forEach(([type, count]) => {
                    allTypes[type] = (allTypes[type] || 0) + count;
                });
            });

            if (Object.keys(allTypes).length > 0) {
                console.log("   • Task breakdown:");
                Object.entries(allTypes)
                    .sort((a, b) => b[1] - a[1])
                    .forEach(([type, count]) => {
                        console.log(`     - ${type}: ${count}`);
                    });
            }

            console.log(`📝 Todo analyses saved to: ${this.todosPath}`);

            return results;

        } catch (error) {
            console.error("🦉 Fatal error during todo processing:", error);
            throw error;
        }
    }

    /**
     * Clean restart - clear all processed state
     */
    async cleanRestart() {
        console.log("🦉 Initiating clean restart for todo history...");

        this.processedTodos = new Set();
        await this.saveProcessedTodos();

        console.log("🦉 Clean restart complete. Ready to process all todo files.");
    }
}

// CLI interface
if (require.main === module) {
    const extractor = new AthenaTodoExtractor();

    const command = process.argv[2];

    switch (command) {
        case "clean":
            extractor.cleanRestart().then(() => {
                console.log("🦉 Clean restart complete");
            });
            break;

        case "process":
        default:
            extractor.processAllTodos().then(results => {
                if (results.length > 0) {
                    console.log(`\n🦉 "From ${results.length} task histories, productivity patterns emerge."`);
                } else {
                    console.log("\n🦉 No new todo histories to process.");
                }
            }).catch(error => {
                console.error("🦉 Athena encountered an error:", error);
                process.exit(1);
            });
    }
}

module.exports = { AthenaTodoExtractor };