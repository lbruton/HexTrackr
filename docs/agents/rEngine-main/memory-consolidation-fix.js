#!/usr/bin/env node

/**
 * Memory Consolidation & Search Matrix Fix
 * 
 * This script:
 * 1. Scans all JSON files in rAgents/ and rMemory/rAgentMemories/
 * 2. Consolidates them into rMemory for consistency
 * 3. Updates the search matrix with all memory content
 * 4. Fixes the scribe summary system to find all data
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MemoryConsolidationFix {
    constructor() {
        this.baseDir = __dirname;
        this.rAgentsDir = path.join(this.baseDir, 'rAgents');
        this.rMemoryDir = path.join(this.baseDir, 'rMemory', 'rAgentMemories');
        this.searchMatrixDir = path.join(this.baseDir, 'rMemory', 'search-matrix');
        
        console.log('🧠 Memory Consolidation & Search Matrix Fix initialized');
        console.log(`📁 rAgents: ${this.rAgentsDir}`);
        console.log(`📁 rMemory: ${this.rMemoryDir}`);
        console.log(`📁 Search Matrix: ${this.searchMatrixDir}`);
    }

    async run() {
        try {
            console.log('\n🔍 PHASE 1: Scanning all memory files...');
            const memoryFiles = await this.scanAllMemoryFiles();
            
            console.log('\n📋 PHASE 2: Analyzing memory structure...');
            const analysis = await this.analyzeMemoryStructure(memoryFiles);
            
            console.log('\n🔄 PHASE 3: Consolidating to rMemory...');
            await this.consolidateMemory(analysis);
            
            console.log('\n🔍 PHASE 4: Rebuilding search matrix...');
            await this.rebuildSearchMatrix();
            
            console.log('\n🔧 PHASE 5: Fixing scribe summary system...');
            await this.fixScribeSummary();
            
            console.log('\n✅ Memory consolidation complete!');
            await this.generateReport();
            
        } catch (error) {
            console.error('❌ Memory consolidation failed:', error);
        }
    }

    async scanAllMemoryFiles() {
        const memoryFiles = {
            rAgents: [],
            rMemory: [],
            duplicates: [],
            missing: []
        };

        // Scan rAgents directory
        console.log('📂 Scanning rAgents directory...');
        const rAgentsFiles = await this.getJsonFiles(this.rAgentsDir);
        for (const file of rAgentsFiles) {
            const stats = await fs.stat(file);
            memoryFiles.rAgents.push({
                path: file,
                relativePath: path.relative(this.rAgentsDir, file),
                name: path.basename(file),
                size: stats.size,
                mtime: stats.mtime
            });
        }

        // Scan rMemory directory
        console.log('📂 Scanning rMemory directory...');
        const rMemoryFiles = await this.getJsonFiles(this.rMemoryDir);
        for (const file of rMemoryFiles) {
            const stats = await fs.stat(file);
            memoryFiles.rMemory.push({
                path: file,
                relativePath: path.relative(this.rMemoryDir, file),
                name: path.basename(file),
                size: stats.size,
                mtime: stats.mtime
            });
        }

        // Find duplicates
        console.log('🔍 Finding duplicates...');
        const rAgentsNames = memoryFiles.rAgents.map(f => f.name);
        const rMemoryNames = memoryFiles.rMemory.map(f => f.name);
        
        for (const name of rAgentsNames) {
            if (rMemoryNames.includes(name)) {
                const rAgentFile = memoryFiles.rAgents.find(f => f.name === name);
                const rMemoryFile = memoryFiles.rMemory.find(f => f.name === name);
                
                memoryFiles.duplicates.push({
                    name,
                    rAgent: rAgentFile,
                    rMemory: rMemoryFile,
                    newerLocation: rAgentFile.mtime > rMemoryFile.mtime ? 'rAgents' : 'rMemory'
                });
            }
        }

        console.log(`✅ Found ${memoryFiles.rAgents.length} files in rAgents`);
        console.log(`✅ Found ${memoryFiles.rMemory.length} files in rMemory`);
        console.log(`⚠️  Found ${memoryFiles.duplicates.length} duplicates`);

        return memoryFiles;
    }

    async getJsonFiles(dir, files = []) {
        const items = await fs.readdir(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stats = await fs.stat(fullPath);
            
            if (stats.isDirectory()) {
                // Skip some directories
                if (!['node_modules', '.git', 'backups', 'archived'].includes(item)) {
                    await this.getJsonFiles(fullPath, files);
                }
            } else if (path.extname(item) === '.json') {
                files.push(fullPath);
            }
        }
        
        return files;
    }

    async analyzeMemoryStructure(memoryFiles) {
        console.log('🔍 Analyzing memory content...');
        
        const analysis = {
            totalFiles: memoryFiles.rAgents.length + memoryFiles.rMemory.length,
            totalSize: 0,
            contentTypes: {},
            agentTypes: new Set(),
            lastUpdated: new Date(0),
            needsConsolidation: []
        };

        // Analyze content
        for (const fileGroup of [memoryFiles.rAgents, memoryFiles.rMemory]) {
            for (const file of fileGroup) {
                analysis.totalSize += file.size;
                
                if (file.mtime > analysis.lastUpdated) {
                    analysis.lastUpdated = file.mtime;
                }

                // Categorize by content type
                if (file.name.includes('memory')) {
                    analysis.contentTypes.memories = (analysis.contentTypes.memories || 0) + 1;
                } else if (file.name.includes('session')) {
                    analysis.contentTypes.sessions = (analysis.contentTypes.sessions || 0) + 1;
                } else if (file.name.includes('handoff')) {
                    analysis.contentTypes.handoffs = (analysis.contentTypes.handoffs || 0) + 1;
                } else {
                    analysis.contentTypes.other = (analysis.contentTypes.other || 0) + 1;
                }

                // Extract agent types
                const agentMatch = file.name.match(/(claude|gpt|gemini|github|copilot)_?(opus|sonnet|4o?|pro)?/i);
                if (agentMatch) {
                    analysis.agentTypes.add(agentMatch[0].toLowerCase());
                }
            }
        }

        // Determine what needs consolidation
        for (const duplicate of memoryFiles.duplicates) {
            if (duplicate.newerLocation === 'rAgents') {
                analysis.needsConsolidation.push({
                    action: 'copy_to_rmemory',
                    source: duplicate.rAgent.path,
                    target: duplicate.rMemory.path,
                    reason: 'rAgents version is newer'
                });
            }
        }

        // Files only in rAgents need to be copied
        for (const file of memoryFiles.rAgents) {
            if (!memoryFiles.duplicates.find(d => d.name === file.name)) {
                analysis.needsConsolidation.push({
                    action: 'copy_to_rmemory',
                    source: file.path,
                    target: path.join(this.rMemoryDir, file.name),
                    reason: 'Only exists in rAgents'
                });
            }
        }

        console.log(`📊 Analysis complete:`);
        console.log(`   Total files: ${analysis.totalFiles}`);
        console.log(`   Total size: ${(analysis.totalSize / 1024).toFixed(1)} KB`);
        console.log(`   Agent types: ${Array.from(analysis.agentTypes).join(', ')}`);
        console.log(`   Actions needed: ${analysis.needsConsolidation.length}`);

        return analysis;
    }

    async consolidateMemory(analysis) {
        console.log('🔄 Starting memory consolidation...');
        
        let copiedCount = 0;
        let updatedCount = 0;

        for (const action of analysis.needsConsolidation) {
            try {
                if (action.action === 'copy_to_rmemory') {
                    // Ensure target directory exists
                    await fs.ensureDir(path.dirname(action.target));
                    
                    // Copy file
                    await fs.copy(action.source, action.target);
                    
                    console.log(`✅ ${action.reason}: ${path.basename(action.source)}`);
                    copiedCount++;
                }
            } catch (error) {
                console.error(`❌ Failed to consolidate ${action.source}:`, error.message);
            }
        }

        console.log(`📋 Consolidation complete: ${copiedCount} files copied, ${updatedCount} files updated`);
    }

    async rebuildSearchMatrix() {
        console.log('🔍 Rebuilding search matrix...');
        
        await fs.ensureDir(this.searchMatrixDir);
        
        const searchMatrix = {
            metadata: {
                created: new Date().toISOString(),
                version: '2.0.0',
                totalEntries: 0,
                lastRebuild: new Date().toISOString()
            },
            entityIndex: {},
            keywordIndex: {},
            relationshipMatrix: {},
            contentByFile: {}
        };

        // Process all JSON files in rMemory
        const memoryFiles = await this.getJsonFiles(this.rMemoryDir);
        
        for (const filePath of memoryFiles) {
            try {
                const content = await fs.readJSON(filePath);
                const fileName = path.basename(filePath);
                
                // Add to search matrix
                await this.indexFileContent(fileName, content, searchMatrix);
                
                console.log(`✅ Indexed: ${fileName}`);
                
            } catch (error) {
                console.log(`⚠️  Skipped ${path.basename(filePath)}: ${error.message}`);
            }
        }

        // Save search matrix
        const matrixFile = path.join(this.searchMatrixDir, 'consolidated-matrix.json');
        await fs.writeJSON(matrixFile, searchMatrix, { spaces: 2 });
        
        console.log(`📊 Search matrix rebuilt with ${searchMatrix.metadata.totalEntries} entries`);
    }

    async indexFileContent(fileName, content, searchMatrix) {
        const fileKey = fileName.replace('.json', '');
        
        // Store full content reference
        searchMatrix.contentByFile[fileKey] = {
            file: fileName,
            type: this.detectContentType(fileName, content),
            lastModified: new Date().toISOString(),
            entityCount: 0,
            keywords: []
        };

        // Extract and index entities
        if (Array.isArray(content)) {
            // Array of entities
            for (const item of content) {
                this.indexEntity(item, fileKey, searchMatrix);
            }
        } else if (typeof content === 'object') {
            // Object with nested content
            this.indexObject(content, fileKey, searchMatrix);
        }

        searchMatrix.metadata.totalEntries = Object.keys(searchMatrix.entityIndex).length;
    }

    indexEntity(entity, source, searchMatrix) {
        if (!entity || typeof entity !== 'object') return;

        // Generate entity ID
        const entityId = this.generateEntityId(entity, source);
        
        // Add to entity index
        searchMatrix.entityIndex[entityId] = {
            id: entityId,
            source: source,
            type: entity.type || 'unknown',
            content: entity,
            keywords: this.extractKeywords(entity),
            timestamp: entity.timestamp || new Date().toISOString()
        };

        // Add keywords to reverse index
        for (const keyword of searchMatrix.entityIndex[entityId].keywords) {
            if (!searchMatrix.keywordIndex[keyword]) {
                searchMatrix.keywordIndex[keyword] = [];
            }
            if (!searchMatrix.keywordIndex[keyword].includes(entityId)) {
                searchMatrix.keywordIndex[keyword].push(entityId);
            }
        }

        // Update file stats
        searchMatrix.contentByFile[source].entityCount++;
        searchMatrix.contentByFile[source].keywords.push(...searchMatrix.entityIndex[entityId].keywords);
    }

    indexObject(obj, source, searchMatrix, prefix = '') {
        for (const [key, value] of Object.entries(obj)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            
            if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    if (typeof item === 'object') {
                        this.indexEntity(item, source, searchMatrix);
                    }
                });
            } else if (typeof value === 'object' && value !== null) {
                this.indexObject(value, source, searchMatrix, fullKey);
            } else if (typeof value === 'string' && value.length > 10) {
                // Index significant string values
                const entityId = `${source}_${fullKey}`;
                searchMatrix.entityIndex[entityId] = {
                    id: entityId,
                    source: source,
                    type: 'string_value',
                    content: { key: fullKey, value: value },
                    keywords: this.extractKeywords({ text: value }),
                    timestamp: new Date().toISOString()
                };
            }
        }
    }

    generateEntityId(entity, source) {
        if (entity.id) return `${source}_${entity.id}`;
        if (entity.session_id) return `${source}_${entity.session_id}`;
        if (entity.timestamp) return `${source}_${entity.timestamp}`;
        
        // Generate from content hash
        const content = JSON.stringify(entity).substring(0, 50);
        const hash = content.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
        return `${source}_${hash}`;
    }

    extractKeywords(entity) {
        const text = JSON.stringify(entity).toLowerCase();
        const keywords = new Set();
        
        // Extract meaningful words
        const words = text.match(/\b[a-z]{3,}\b/g) || [];
        for (const word of words) {
            if (!this.isStopWord(word)) {
                keywords.add(word);
            }
        }

        // Extract technical terms
        const techTerms = text.match(/\b(docker|ollama|mcp|memory|agent|scribe|claude|gpt|gemini)\b/g) || [];
        for (const term of techTerms) {
            keywords.add(term);
        }

        return Array.from(keywords).slice(0, 20); // Limit keywords
    }

    isStopWord(word) {
        const stopWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'she', 'use', 'way', 'say', 'each', 'which', 'their', 'time', 'will', 'about', 'write', 'would', 'there', 'could', 'other'];
        return stopWords.includes(word);
    }

    detectContentType(fileName, content) {
        if (fileName.includes('memory')) return 'memory';
        if (fileName.includes('session')) return 'session';
        if (fileName.includes('handoff')) return 'handoff';
        if (fileName.includes('decision')) return 'decision';
        if (fileName.includes('task')) return 'task';
        if (fileName.includes('function')) return 'function';
        
        if (Array.isArray(content)) return 'array';
        if (content.metadata) return 'structured';
        
        return 'object';
    }

    async fixScribeSummary() {
        console.log('🔧 Fixing scribe summary system...');
        
        const scribeSummaryPath = path.join(this.baseDir, 'scribe-summary.js');
        
        if (await fs.pathExists(scribeSummaryPath)) {
            let content = await fs.readFile(scribeSummaryPath, 'utf8');
            
            // Fix the memory files list to include all important files
            const oldMemoryFiles = `const memoryFiles = ['memory.json', 'decisions.json', 'functions.json'];`;
            const newMemoryFiles = `const memoryFiles = [
                'memory.json', 'decisions.json', 'functions.json', 'extendedcontext.json',
                'handoff.json', 'tasks.json', 'interactions.json', 'preferences.json',
                'claude_opus_memories.json', 'claude_sonnet_memories.json',
                'github_copilot_memories.json', 'gpt4_memories.json', 'gpt4o_memories.json',
                'gemini_pro_memories.json'
            ];`;
            
            if (content.includes(oldMemoryFiles)) {
                content = content.replace(oldMemoryFiles, newMemoryFiles);
                await fs.writeFile(scribeSummaryPath, content, 'utf8');
                console.log('✅ Updated scribe-summary.js memory file list');
            } else {
                console.log('ℹ️  Scribe summary file structure has changed');
            }
        }

        // Create an enhanced summary script
        const enhancedSummaryPath = path.join(this.baseDir, 'enhanced-memory-summary.js');
        await this.createEnhancedSummaryScript(enhancedSummaryPath);
    }

    async createEnhancedSummaryScript(filePath) {
        const script = `#!/usr/bin/env node

/**
 * Enhanced Memory Summary
 * Uses the consolidated search matrix to provide comprehensive summaries
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EnhancedMemorySummary {
    constructor() {
        this.baseDir = __dirname;
        this.searchMatrixPath = path.join(this.baseDir, 'rMemory', 'search-matrix', 'consolidated-matrix.json');
        this.memoryDir = path.join(this.baseDir, 'rMemory', 'rAgentMemories');
    }

    async generateSummary(timeframe = '24h', query = null) {
        try {
            console.log(\`📊 Generating enhanced summary for \${timeframe}...\`);
            
            const cutoffTime = this.getTimeframeCutoff(timeframe);
            const searchMatrix = await this.loadSearchMatrix();
            const recentEntities = this.findRecentEntities(searchMatrix, cutoffTime);
            
            if (query) {
                const filtered = this.filterByQuery(recentEntities, query, searchMatrix);
                return this.formatSummary(filtered, timeframe, query);
            }
            
            return this.formatSummary(recentEntities, timeframe);
            
        } catch (error) {
            console.error('❌ Enhanced summary failed:', error);
            return \`⚠️  Unable to generate enhanced summary: \${error.message}\`;
        }
    }

    async loadSearchMatrix() {
        if (await fs.pathExists(this.searchMatrixPath)) {
            return await fs.readJSON(this.searchMatrixPath);
        }
        throw new Error('Search matrix not found. Run memory consolidation first.');
    }

    getTimeframeCutoff(timeframe) {
        const now = new Date();
        const hours = {
            '1h': 1, '6h': 6, '12h': 12, '24h': 24, '1d': 24, '3d': 72, '1w': 168
        };
        return new Date(now.getTime() - (hours[timeframe] || 24) * 60 * 60 * 1000);
    }

    findRecentEntities(searchMatrix, cutoffTime) {
        const recent = [];
        
        for (const [entityId, entity] of Object.entries(searchMatrix.entityIndex)) {
            const entityTime = new Date(entity.timestamp);
            if (entityTime > cutoffTime) {
                recent.push(entity);
            }
        }
        
        return recent.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    filterByQuery(entities, query, searchMatrix) {
        const queryWords = query.toLowerCase().split(/\\s+/);
        const scored = [];
        
        for (const entity of entities) {
            let score = 0;
            const content = JSON.stringify(entity.content).toLowerCase();
            
            for (const word of queryWords) {
                if (content.includes(word)) score += 2;
                if (entity.keywords.includes(word)) score += 3;
            }
            
            if (score > 0) {
                scored.push({ entity, score });
            }
        }
        
        return scored
            .sort((a, b) => b.score - a.score)
            .slice(0, 20)
            .map(item => item.entity);
    }

    formatSummary(entities, timeframe, query = null) {
        if (!entities.length) {
            return \`ℹ️  No \${query ? 'matching ' : ''}activity found in the last \${timeframe}\`;
        }

        const summary = [\`📊 **Enhanced Summary - Last \${timeframe}\${query ? \` (query: \${query})\` : ''}**\\n\`];
        
        // Group by type
        const byType = entities.reduce((acc, entity) => {
            acc[entity.type] = acc[entity.type] || [];
            acc[entity.type].push(entity);
            return acc;
        }, {});

        // Summary stats
        summary.push(\`📈 **Activity Overview:**\`);
        summary.push(\`   • Total entries: \${entities.length}\`);
        summary.push(\`   • Types: \${Object.keys(byType).join(', ')}\`);
        summary.push(\`   • Sources: \${[...new Set(entities.map(e => e.source))].join(', ')}\`);
        summary.push('');

        // Details by type
        for (const [type, typeEntities] of Object.entries(byType)) {
            summary.push(\`🔸 **\${type.toUpperCase()}** (\${typeEntities.length}):\`);
            
            for (const entity of typeEntities.slice(0, 5)) {
                const preview = this.getEntityPreview(entity);
                summary.push(\`   • \${preview}\`);
            }
            
            if (typeEntities.length > 5) {
                summary.push(\`   ... and \${typeEntities.length - 5} more\`);
            }
            summary.push('');
        }

        return summary.join('\\n');
    }

    getEntityPreview(entity) {
        const time = new Date(entity.timestamp).toLocaleTimeString();
        
        if (entity.content.message) {
            return \`[\${time}] \${entity.content.message.substring(0, 100)}...\`;
        }
        
        if (entity.content.value) {
            return \`[\${time}] \${entity.content.value.substring(0, 100)}...\`;
        }
        
        if (entity.content.title) {
            return \`[\${time}] \${entity.content.title}\`;
        }
        
        return \`[\${time}] \${entity.source} activity\`;
    }
}

// CLI interface
if (import.meta.url === \`file://\${process.argv[1]}\`) {
    const summary = new EnhancedMemorySummary();
    const timeframe = process.argv[2] || '24h';
    const query = process.argv[3] || null;
    
    summary.generateSummary(timeframe, query).then(result => {
        console.log('\\n' + result);
    }).catch(error => {
        console.error('❌ Summary failed:', error);
    });
}

export default EnhancedMemorySummary;
`;

        await fs.writeFile(filePath, script, 'utf8');
        await fs.chmod(filePath, '755');
        console.log('✅ Created enhanced-memory-summary.js');
    }

    async generateReport() {
        console.log('\n📊 Generating consolidation report...');
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                rAgentsFiles: (await this.getJsonFiles(this.rAgentsDir)).length,
                rMemoryFiles: (await this.getJsonFiles(this.rMemoryDir)).length,
                searchMatrixExists: await fs.pathExists(path.join(this.searchMatrixDir, 'consolidated-matrix.json'))
            },
            recommendations: [
                '✅ All memory files consolidated in rMemory/rAgentMemories/',
                '✅ Search matrix rebuilt with comprehensive indexing',
                '✅ Enhanced summary system created',
                '🔄 Use: node enhanced-memory-summary.js 24h [query]',
                '🔄 Regular consolidation: Add to startup scripts'
            ]
        };

        const reportPath = path.join(this.baseDir, 'memory-consolidation-report.json');
        await fs.writeJSON(reportPath, report, { spaces: 2 });
        
        console.log('📋 CONSOLIDATION REPORT:');
        console.log(`   • rAgents files: ${report.summary.rAgentsFiles}`);
        console.log(`   • rMemory files: ${report.summary.rMemoryFiles}`);
        console.log(`   • Search matrix: ${report.summary.searchMatrixExists ? 'Built' : 'Missing'}`);
        console.log(`   • Report saved: ${reportPath}`);
        
        console.log('\n🚀 NEXT STEPS:');
        report.recommendations.forEach(rec => console.log(`   ${rec}`));
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const consolidator = new MemoryConsolidationFix();
    consolidator.run().catch(console.error);
}

export default MemoryConsolidationFix;
