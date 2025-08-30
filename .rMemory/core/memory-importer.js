#!/usr/bin/env node

/**
 * Memory Importer
 * 
 * Processes memory queue and imports insights into Memento MCP
 * Handles both archaeology results and real-time chat monitoring
 */

const fs = require("fs").promises;
const path = require("path");

class MemoryImporter {
    constructor() {
        this.memoryQueuePath = path.join(__dirname, "../docs/ops/memory-queue");
        this.processedPath = path.join(__dirname, "../docs/ops/memory-processed");
        this.batchSize = 10;
        this.importLog = [];
    }

    /**
     * Process all items in memory queue
     */
    async processQueue() {
        console.log("🔄 Processing memory queue...");
        
        try {
            await this.ensureDirectories();
            
            const queueItems = await this.loadQueueItems();
            console.log(`📋 Found ${queueItems.length} items in queue`);
            
            if (queueItems.length === 0) {
                console.log("✅ Queue is empty");
                return;
            }

            // Sort by priority (high, medium, low)
            const sortedItems = this.sortByPriority(queueItems);
            
            // Process in batches
            for (let i = 0; i < sortedItems.length; i += this.batchSize) {
                const batch = sortedItems.slice(i, i + this.batchSize);
                await this.processBatch(batch);
                
                // Small delay between batches
                await this.sleep(1000);
            }
            
            // Generate import summary
            await this.generateImportSummary();
            
            console.log(`✅ Processed ${this.importLog.length} memory items`);
            
        } catch (error) {
            console.error("❌ Queue processing failed:", error.message);
            throw error;
        }
    }

    /**
     * Load all queue items
     */
    async loadQueueItems() {
        try {
            const files = await fs.readdir(this.memoryQueuePath);
            const queueFiles = files.filter(f => f.startsWith("queue-") && f.endsWith(".json"));
            
            const items = [];
            for (const file of queueFiles) {
                try {
                    const filePath = path.join(this.memoryQueuePath, file);
                    const content = await fs.readFile(filePath, "utf8");
                    const item = JSON.parse(content);
                    
                    items.push({
                        ...item,
                        queueFile: file,
                        queuePath: filePath
                    });
                } catch (error) {
                    console.warn(`Failed to load queue item ${file}:`, error.message);
                }
            }
            
            return items;
            
        } catch (error) {
            if (error.code === "ENOENT") {return [];}
            throw error;
        }
    }

    /**
     * Sort queue items by priority
     */
    sortByPriority(items) {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        
        return items.sort((a, b) => {
            const aPriority = priorityOrder[a.priority] || 1;
            const bPriority = priorityOrder[b.priority] || 1;
            return bPriority - aPriority;
        });
    }

    /**
     * Process a batch of queue items
     */
    async processBatch(batch) {
        console.log(`🔄 Processing batch of ${batch.length} items...`);
        
        for (const item of batch) {
            try {
                await this.processQueueItem(item);
                await this.moveToProcessed(item);
                
                this.importLog.push({
                    timestamp: new Date().toISOString(),
                    type: item.type,
                    session_id: item.session_id,
                    priority: item.priority,
                    status: "success"
                });
                
            } catch (error) {
                console.error(`Failed to process item ${item.queueFile}:`, error.message);
                
                this.importLog.push({
                    timestamp: new Date().toISOString(),
                    type: item.type,
                    session_id: item.session_id,
                    priority: item.priority,
                    status: "error",
                    error: error.message
                });
            }
        }
    }

    /**
     * Process individual queue item
     */
    async processQueueItem(item) {
        if (item.type === "chat_monitor_update") {
            await this.processMonitorUpdate(item);
        } else if (item.type === "chat_archaeology_import") {
            await this.processArchaeologyImport(item);
        } else {
            console.warn(`Unknown queue item type: ${item.type}`);
        }
    }

    /**
     * Process chat monitor update
     */
    async processMonitorUpdate(item) {
        const { insights, session_id, workspace, timestamp } = item;
        
        // Create entity for this chat session update
        const entityName = `Chat Update ${session_id.substring(0, 8)}`;
        const observations = [
            "Live chat session update from VS Code",
            `Workspace: ${workspace}`,
            `Processed: ${timestamp}`
        ];

        // Add insights as observations
        if (insights.quick_decisions) {
            observations.push(...insights.quick_decisions.map(d => `Decision: ${d}`));
        }
        
        if (insights.problems_identified) {
            observations.push(...insights.problems_identified.map(p => `Problem: ${p}`));
        }
        
        if (insights.solutions_applied) {
            observations.push(...insights.solutions_applied.map(s => `Solution: ${s}`));
        }
        
        if (insights.context_changes) {
            observations.push(...insights.context_changes.map(c => `Context: ${c}`));
        }

        if (insights.action_items) {
            observations.push(...insights.action_items.map(a => `Action: ${a}`));
        }

        // This would integrate with Memento MCP
        // For now, create local memory record
        await this.createMemoryRecord({
            name: entityName,
            entityType: "chat_session_update",
            observations,
            metadata: {
                session_id,
                workspace,
                priority: item.priority,
                source: "chat_monitor"
            }
        });
    }

    /**
     * Process archaeology import
     */
    async processArchaeologyImport(item) {
        if (item.entities) {
            for (const entity of item.entities) {
                await this.createMemoryRecord({
                    ...entity,
                    metadata: {
                        source: "chat_archaeology",
                        imported_at: new Date().toISOString()
                    }
                });
            }
        }
    }

    /**
     * Create memory record (placeholder for Memento integration)
     */
    async createMemoryRecord(record) {
        // For now, write to local file for manual Memento import
        // In full implementation, this would use Memento MCP directly
        
        const recordFile = path.join(
            this.processedPath, 
            `memory-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.json`
        );
        
        const memoryRecord = {
            ...record,
            created_at: new Date().toISOString(),
            project: "HexTrackr"
        };
        
        await fs.writeFile(recordFile, JSON.stringify(memoryRecord, null, 2));
        console.log(`📝 Created memory record: ${record.name}`);
    }

    /**
     * Move processed item to processed directory
     */
    async moveToProcessed(item) {
        const processedFile = path.join(this.processedPath, item.queueFile);
        
        try {
            await fs.rename(item.queuePath, processedFile);
        } catch (error) {
            // If move fails, just delete the queue file
            await fs.unlink(item.queuePath);
        }
    }

    /**
     * Generate import summary
     */
    async generateImportSummary() {
        const summary = {
            import_session: new Date().toISOString(),
            total_processed: this.importLog.length,
            successful: this.importLog.filter(item => item.status === "success").length,
            failed: this.importLog.filter(item => item.status === "error").length,
            by_type: this.groupByType(),
            by_priority: this.groupByPriority(),
            log: this.importLog
        };

        const summaryPath = path.join(this.processedPath, `import-summary-${Date.now()}.json`);
        await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
        
        // Also create readable markdown
        const markdown = this.generateMarkdownSummary(summary);
        const mdPath = path.join(this.processedPath, `import-summary-${Date.now()}.md`);
        await fs.writeFile(mdPath, markdown);
    }

    /**
     * Group import log by type
     */
    groupByType() {
        const groups = {};
        for (const item of this.importLog) {
            groups[item.type] = (groups[item.type] || 0) + 1;
        }
        return groups;
    }

    /**
     * Group import log by priority
     */
    groupByPriority() {
        const groups = {};
        for (const item of this.importLog) {
            groups[item.priority] = (groups[item.priority] || 0) + 1;
        }
        return groups;
    }

    /**
     * Generate markdown summary
     */
    generateMarkdownSummary(summary) {
        return `# Memory Import Summary

**Import Session**: ${summary.import_session}

## Statistics

- **Total Processed**: ${summary.total_processed}
- **Successful**: ${summary.successful}
- **Failed**: ${summary.failed}

## By Type

${Object.entries(summary.by_type).map(([type, count]) => `- ${type}: ${count}`).join("\n")}

## By Priority

${Object.entries(summary.by_priority).map(([priority, count]) => `- ${priority}: ${count}`).join("\n")}

## Details

${summary.log.map(item => `
### ${item.type} - ${item.status}

- **Session**: ${item.session_id}
- **Priority**: ${item.priority}
- **Time**: ${item.timestamp}
${item.error ? `- **Error**: ${item.error}` : ""}
`).join("\n")}
`;
    }

    /**
     * Ensure directories exist
     */
    async ensureDirectories() {
        await fs.mkdir(this.memoryQueuePath, { recursive: true });
        await fs.mkdir(this.processedPath, { recursive: true });
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
    const importer = new MemoryImporter();
    
    importer.processQueue()
        .then(() => {
            console.log("🎉 Memory import complete!");
            process.exit(0);
        })
        .catch(error => {
            console.error("💥 Import failed:", error);
            process.exit(1);
        });
}

module.exports = { MemoryImporter };
