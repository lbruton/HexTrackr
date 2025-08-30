#!/usr/bin/env node

/**
 * Memory Recovery and Merge Tool
 * Recovers memories from backup locations and merges them into current memory systems
 */

const fs = require('fs').promises;
const path = require('path');

const COLORS = {
    CYAN: '\x1b[36m',
    GREEN: '\x1b[32m',
    YELLOW: '\x1b[33m',
    RED: '\x1b[31m',
    BLUE: '\x1b[34m',
    PINK: '\x1b[95m',
    RESET: '\x1b[0m'
};

class MemoryMerger {
    constructor() {
        this.baseDir = process.cwd();
        this.backupDir = './backups/directory-reorganization-20250822_223404';
        this.currentMemoryDir = './rMemory';
        this.mergedCount = 0;
        this.errorCount = 0;
    }

    log(message, color = COLORS.CYAN) {
        console.log(`${color}${message}${COLORS.RESET}`);
    }

    async loadJsonFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            this.log(`⚠️  Could not load ${filePath}: ${error.message}`, COLORS.YELLOW);
            return null;
        }
    }

    async saveJsonFile(filePath, data) {
        try {
            await fs.writeFile(filePath, JSON.stringify(data, null, 2));
            return true;
        } catch (error) {
            this.log(`❌ Could not save ${filePath}: ${error.message}`, COLORS.RED);
            this.errorCount++;
            return false;
        }
    }

    async mergeMemoryFiles() {
        this.log(`${COLORS.PINK}🧠 Memory Recovery and Merge Tool${COLORS.RESET}`);
        this.log(`${COLORS.PINK}══════════════════════════════════${COLORS.RESET}`);
        
        // 1. Merge auto-context.json
        await this.mergeAutoContext();
        
        // 2. Merge memory-scribe conversations
        await this.mergeConversations();
        
        // 3. Merge knowledge base
        await this.mergeKnowledgeBase();
        
        // 4. Merge search matrix
        await this.mergeSearchMatrix();
        
        // 5. Merge persistent memory
        await this.mergePersistentMemory();
        
        // 6. Merge handoff files
        await this.mergeHandoffFiles();

        this.log(`\n${COLORS.GREEN}✅ Memory merge complete!${COLORS.RESET}`);
        this.log(`${COLORS.CYAN}   • Merged items: ${this.mergedCount}${COLORS.RESET}`);
        this.log(`${COLORS.YELLOW}   • Errors: ${this.errorCount}${COLORS.RESET}`);
    }

    async mergeAutoContext() {
        this.log('\n🔄 Merging auto-context...');
        
        const backupContext = await this.loadJsonFile(`${this.backupDir}/rMemory_backup/auto-context.json`);
        const currentContext = await this.loadJsonFile(`${this.currentMemoryDir}/auto-context.json`);
        
        if (!backupContext) return;
        
        // Merge recent changes and context
        const merged = currentContext || {};
        
        if (backupContext.recent_changes) {
            merged.recent_changes = [
                ...(merged.recent_changes || []),
                ...backupContext.recent_changes
            ].slice(0, 10); // Keep latest 10
        }
        
        if (backupContext.user_preferences) {
            merged.user_preferences = {
                ...merged.user_preferences,
                ...backupContext.user_preferences
            };
        }
        
        merged.last_memory_merge = new Date().toISOString();
        
        if (await this.saveJsonFile(`${this.currentMemoryDir}/auto-context.json`, merged)) {
            this.log('✅ Auto-context merged', COLORS.GREEN);
            this.mergedCount++;
        }
    }

    async mergeConversations() {
        this.log('\n💬 Merging conversations...');
        
        const backupConversations = await this.loadJsonFile(
            `${this.backupDir}/rMemory_backup/memory-scribe/memory-data/conversations.json`
        );
        const currentConversations = await this.loadJsonFile(
            `${this.currentMemoryDir}/memory-scribe/memory-data/conversations.json`
        ) || [];
        
        if (!backupConversations) return;
        
        // Merge unique conversations
        const mergedConversations = [...currentConversations];
        const existingIds = new Set(currentConversations.map(c => c.id));
        
        for (const conv of backupConversations) {
            if (!existingIds.has(conv.id)) {
                mergedConversations.push(conv);
                this.mergedCount++;
            }
        }
        
        // Ensure directory exists
        await fs.mkdir(`${this.currentMemoryDir}/memory-scribe/memory-data`, { recursive: true });
        
        if (await this.saveJsonFile(
            `${this.currentMemoryDir}/memory-scribe/memory-data/conversations.json`, 
            mergedConversations
        )) {
            this.log(`✅ Merged ${mergedConversations.length} conversations`, COLORS.GREEN);
        }
    }

    async mergeKnowledgeBase() {
        this.log('\n📚 Merging knowledge base...');
        
        const backupKnowledge = await this.loadJsonFile(
            `${this.backupDir}/rMemory_backup/memory-scribe/memory-data/knowledge-base.json`
        );
        const currentKnowledge = await this.loadJsonFile(
            `${this.currentMemoryDir}/memory-scribe/memory-data/knowledge-base.json`
        ) || [];
        
        if (!backupKnowledge) return;
        
        // Merge unique knowledge entries
        const mergedKnowledge = [...currentKnowledge];
        const existingConcepts = new Set(currentKnowledge.map(k => k.keyConcept));
        
        for (const knowledge of backupKnowledge) {
            if (!existingConcepts.has(knowledge.keyConcept)) {
                mergedKnowledge.push(knowledge);
                this.mergedCount++;
            }
        }
        
        if (await this.saveJsonFile(
            `${this.currentMemoryDir}/memory-scribe/memory-data/knowledge-base.json`, 
            mergedKnowledge
        )) {
            this.log(`✅ Merged ${mergedKnowledge.length} knowledge entries`, COLORS.GREEN);
        }
    }

    async mergeSearchMatrix() {
        this.log('\n🔍 Merging search matrix...');
        
        try {
            const backupMatrix = await this.loadJsonFile(
                `${this.backupDir}/rMemory_backup/search-matrix/context-matrix.json`
            );
            
            if (backupMatrix) {
                // Copy the backup search matrix as a reference
                await fs.mkdir(`${this.currentMemoryDir}/search-matrix`, { recursive: true });
                await this.saveJsonFile(
                    `${this.currentMemoryDir}/search-matrix/backup-context-matrix.json`, 
                    backupMatrix
                );
                this.log('✅ Search matrix backup preserved', COLORS.GREEN);
                this.mergedCount++;
            }
        } catch (error) {
            this.log(`⚠️  Search matrix merge failed: ${error.message}`, COLORS.YELLOW);
        }
    }

    async mergePersistentMemory() {
        this.log('\n🧠 Merging persistent memory...');
        
        const backupMemory = await this.loadJsonFile(
            `${this.backupDir}/memory-backups_backup/persistent-memory.json`
        );
        const currentMemory = await this.loadJsonFile('./persistent-memory.json');
        
        if (!backupMemory) return;
        
        // Merge memory structures
        const merged = currentMemory || {
            metadata: {
                version: "1.0.0",
                created: new Date().toISOString(),
                lastSync: new Date().toISOString(),
                purpose: "Persistent memory store for rEngine MCP server",
                syncToMCP: true
            },
            entities: {},
            relations: {},
            conversations: {},
            system_state: {},
            project_context: {}
        };
        
        // Merge project context
        if (backupMemory.project_context) {
            merged.project_context = {
                ...merged.project_context,
                ...backupMemory.project_context
            };
        }
        
        // Update metadata
        merged.metadata.lastSync = new Date().toISOString();
        merged.metadata.mergedFrom = backupMemory.metadata?.created || 'unknown';
        
        if (await this.saveJsonFile('./persistent-memory.json', merged)) {
            this.log('✅ Persistent memory merged', COLORS.GREEN);
            this.mergedCount++;
        }
    }

    async mergeHandoffFiles() {
        this.log('\n📋 Merging handoff files...');
        
        try {
            // Find recent handoff files from around the reorganization time
            const handoffFiles = [
                'catch-up-2025-08-20T17-47-50-954Z.md',
                // Add more specific handoff files if found
            ];
            
            for (const handoffFile of handoffFiles) {
                const sourcePath = `${this.currentMemoryDir}/rAgentMemories/${handoffFile}`;
                const backupPath = `${this.currentMemoryDir}/rAgentMemories/merged-${handoffFile}`;
                
                try {
                    const handoffContent = await fs.readFile(sourcePath, 'utf8');
                    if (handoffContent) {
                        await fs.writeFile(backupPath, `# MERGED MEMORY: ${handoffFile}\n\n${handoffContent}`);
                        this.log(`✅ Preserved handoff: ${handoffFile}`, COLORS.GREEN);
                        this.mergedCount++;
                    }
                } catch (error) {
                    // File might not exist, continue
                }
            }
        } catch (error) {
            this.log(`⚠️  Handoff merge failed: ${error.message}`, COLORS.YELLOW);
        }
    }
}

// Run the memory merger
async function main() {
    const merger = new MemoryMerger();
    await merger.mergeMemoryFiles();
}

if (require.main === module) {
    main().catch(error => {
        console.error(`${COLORS.RED}❌ Memory merge failed: ${error.message}${COLORS.RESET}`);
        process.exit(1);
    });
}

module.exports = MemoryMerger;
