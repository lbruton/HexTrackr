#!/usr/bin/env node

/**
 * Fast Recall - Instant memory lookup for agents
 * Usage: node recall.js "search term"
 *        node recall.js "search term" --silent (MCP mode, no console output)
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check for silent mode
const isSilentMode = process.argv.includes('--silent');

async function fastRecall(query) {
    const baseDir = path.dirname(__dirname);
    
    try {
        const results = [];
        let searchPaths = [];
        
        // Priority order: Extended context (newest), Agent memory, Tasks
        const extendedContextPath = path.join(baseDir, 'rMemory', 'rAgentMemories', 'extendedcontext.json');
        const agentMemoryPath = path.join(baseDir, 'agents', 'memory.json');
        const tasksPath = path.join(baseDir, 'rMemory', 'rAgentMemories', 'tasks.json');
        
        searchPaths = [extendedContextPath, agentMemoryPath, tasksPath];
        
        if (!isSilentMode) {
            console.log(`🔍 Fast recall for: "${query}"`);
            console.log('─'.repeat(50));
        }
        
        // Search extended context first (newest data)
        try {
            const extendedData = await fs.readFile(extendedContextPath, 'utf8');
            const extendedContext = JSON.parse(extendedData);
            
            if (extendedContext.sessions) {
                const dates = Object.keys(extendedContext.sessions).sort().reverse(); // Newest first
                
                for (const date of dates.slice(0, 10)) { // Last 10 days
                    const sessions = extendedContext.sessions[date];
                    for (const session of sessions) {
                        const relevance = calculateRelevance(query, session.summary + ' ' + 
                            session.activities.map(a => a.message).join(' '));
                        
                        if (relevance > 0.2) {
                            results.push({
                                source: 'Extended Context',
                                date: date,
                                title: session.summary,
                                relevance: relevance,
                                type: 'session',
                                content: session.activities.map(a => a.message).join('; '),
                                recent: true
                            });
                        }
                    }
                }
            }
        } catch (error) {
            // Extended context not available
        }
        
        // Search agent memory (concepts and entities)
        try {
            const memoryData = await fs.readFile(agentMemoryPath, 'utf8');
            const memory = JSON.parse(memoryData);
            
            for (const [key, value] of Object.entries(memory)) {
                const relevance = calculateRelevance(query, key + ' ' + JSON.stringify(value));
                if (relevance > 0.2) {
                    results.push({
                        source: 'Agent Memory',
                        title: key,
                        relevance: relevance,
                        type: 'concept',
                        content: typeof value === 'string' ? value : JSON.stringify(value).substring(0, 200),
                        recent: false
                    });
                }
            }
        } catch (error) {
            // Agent memory not available
        }
        
        // Search tasks (solutions and patterns)
        try {
            const tasksData = await fs.readFile(tasksPath, 'utf8');
            const tasks = JSON.parse(tasksData);
            
            if (tasks.tasks) {
                for (const task of tasks.tasks) {
                    const relevance = calculateRelevance(query, task.title + ' ' + task.description);
                    if (relevance > 0.2) {
                        results.push({
                            source: 'Tasks',
                            title: task.title,
                            relevance: relevance,
                            type: 'task',
                            content: task.description,
                            status: task.status,
                            recent: false
                        });
                    }
                }
            }
        } catch (error) {
            // Tasks not available
        }
        
        // Sort by relevance and recency
        results.sort((a, b) => {
            // Boost recent items slightly
            const scoreA = a.relevance + (a.recent ? 0.1 : 0);
            const scoreB = b.relevance + (b.recent ? 0.1 : 0);
            return scoreB - scoreA;
        });
        
        // Display results
        if (results.length === 0) {
            console.log('❌ No matches found');
            console.log('💡 Try broader terms or check spelling');
            return;
        }
        
        console.log(`✅ Found ${results.length} matches\n`);
        
        results.slice(0, 5).forEach((result, index) => {
            const icon = result.recent ? '🔥' : '📚';
            const score = Math.round(result.relevance * 10);
            
            console.log(`${icon} ${index + 1}. [${result.source}] ${result.title}`);
            console.log(`   📊 Relevance: ${score}/10`);
            if (result.date) console.log(`   📅 Date: ${result.date}`);
            if (result.status) console.log(`   🏷️  Status: ${result.status}`);
            console.log(`   💬 ${result.content.substring(0, 150)}${result.content.length > 150 ? '...' : ''}`);
            console.log('');
        });
        
        if (results.length > 5) {
            console.log(`📝 + ${results.length - 5} more matches (use longer query for specificity)`);
        }
        
    } catch (error) {
        console.error(`❌ Recall failed: ${error.message}`);
    }
}

function calculateRelevance(query, text) {
    if (!query || !text) return 0;
    
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    
    // Exact match bonus
    if (textLower.includes(queryLower)) {
        return 1.0;
    }
    
    // Word match scoring
    const queryWords = queryLower.split(/\s+/);
    const textWords = textLower.split(/\s+/);
    
    let matches = 0;
    for (const queryWord of queryWords) {
        if (queryWord.length < 3) continue; // Skip short words
        
        for (const textWord of textWords) {
            if (textWord.includes(queryWord) || queryWord.includes(textWord)) {
                matches++;
                break;
            }
        }
    }
    
    return Math.min(matches / queryWords.length, 1.0);
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const query = process.argv[2];
    
    if (!query) {
        console.log('Usage: node recall.js "search term"');
        console.log('');
        console.log('Examples:');
        console.log('  node recall.js "menu system"');
        console.log('  node recall.js "console split"');
        console.log('  node recall.js "javascript bug"');
        console.log('  node recall.js "memory intelligence"');
        process.exit(1);
    }
    
    await fastRecall(query);
}
