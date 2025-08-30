#!/usr/bin/env node

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
            console.log(`📊 Generating enhanced summary for ${timeframe}...`);
            
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
            return `⚠️  Unable to generate enhanced summary: ${error.message}`;
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
        const queryWords = query.toLowerCase().split(/\s+/);
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
            return `ℹ️  No ${query ? 'matching ' : ''}activity found in the last ${timeframe}`;
        }

        const summary = [`📊 **Enhanced Summary - Last ${timeframe}${query ? ` (query: ${query})` : ''}**\n`];
        
        // Group by type
        const byType = entities.reduce((acc, entity) => {
            acc[entity.type] = acc[entity.type] || [];
            acc[entity.type].push(entity);
            return acc;
        }, {});

        // Summary stats
        summary.push(`📈 **Activity Overview:**`);
        summary.push(`   • Total entries: ${entities.length}`);
        summary.push(`   • Types: ${Object.keys(byType).join(', ')}`);
        summary.push(`   • Sources: ${[...new Set(entities.map(e => e.source))].join(', ')}`);
        summary.push('');

        // Details by type
        for (const [type, typeEntities] of Object.entries(byType)) {
            summary.push(`🔸 **${type.toUpperCase()}** (${typeEntities.length}):`);
            
            for (const entity of typeEntities.slice(0, 5)) {
                const preview = this.getEntityPreview(entity);
                summary.push(`   • ${preview}`);
            }
            
            if (typeEntities.length > 5) {
                summary.push(`   ... and ${typeEntities.length - 5} more`);
            }
            summary.push('');
        }

        return summary.join('\n');
    }

    getEntityPreview(entity) {
        const time = new Date(entity.timestamp).toLocaleTimeString();
        
        if (entity.content.message) {
            return `[${time}] ${entity.content.message.substring(0, 100)}...`;
        }
        
        if (entity.content.value) {
            return `[${time}] ${entity.content.value.substring(0, 100)}...`;
        }
        
        if (entity.content.title) {
            return `[${time}] ${entity.content.title}`;
        }
        
        return `[${time}] ${entity.source} activity`;
    }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const summary = new EnhancedMemorySummary();
    const timeframe = process.argv[2] || '24h';
    const query = process.argv[3] || null;
    
    summary.generateSummary(timeframe, query).then(result => {
        console.log('\n' + result);
    }).catch(error => {
        console.error('❌ Summary failed:', error);
    });
}

export default EnhancedMemorySummary;
