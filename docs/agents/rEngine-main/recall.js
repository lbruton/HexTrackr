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

// Memory file freshness thresholds (in milliseconds)
const FRESHNESS_THRESHOLDS = {
    'handoff.json': 6 * 60 * 60 * 1000,     // 6 hours
    'tasks.json': 6 * 60 * 60 * 1000,       // 6 hours
    'memory.json': 1 * 60 * 60 * 1000,      // 1 hour
    'persistent-memory.json': 6 * 60 * 60 * 1000  // 6 hours
};

/**
 * Check memory file freshness and warn if stale
 */
async function checkMemoryFreshness(baseDir) {
    if (isSilentMode) return; // Skip warnings in silent mode
    
    // Updated paths for merged memory system
    const memoryDirs = [
        path.join(baseDir, 'rMemory', 'rAgentMemories'),
        path.join(baseDir, 'rMemory', 'memory-scribe', 'memory-data')
    ];
    
    const staleFiles = [];
    
    for (const [filename, threshold] of Object.entries(FRESHNESS_THRESHOLDS)) {
        let found = false;
        
        for (const memoryDir of memoryDirs) {
            try {
                const filePath = path.join(memoryDir, filename);
                const stats = await fs.stat(filePath);
                const age = Date.now() - stats.mtime.getTime();
                const ageHours = Math.floor(age / (1000 * 60 * 60));
                
                if (age > threshold) {
                    staleFiles.push({ filename, ageHours, threshold: Math.floor(threshold / (1000 * 60 * 60)) });
                }
                found = true;
                break;
            } catch (error) {
                // Try next directory
                continue;
            }
        }
        
        if (!found) {
            staleFiles.push({ filename, error: 'File not found' });
        }
    }
    
    if (staleFiles.length > 0) {
        console.log('⚠️  Memory Freshness Warning:');
        for (const file of staleFiles) {
            if (file.error) {
                console.log(`   ${file.filename}: ${file.error}`);
            } else {
                console.log(`   ${file.filename}: ${file.ageHours}h old (threshold: ${file.threshold}h)`);
            }
        }
        console.log('   💡 Consider running: node rEngine/enhanced-memory-sync.js');
        console.log('─'.repeat(50));
    }
}

async function fastRecall(query) {
    const baseDir = path.dirname(__dirname);
    
    // Freshness validation for critical memory files
    await checkMemoryFreshness(baseDir);
    
    try {
        const results = [];
        let searchPaths = [];
        
        // Updated paths for merged memory system
        const extendedContextPath = path.join(baseDir, 'rMemory', 'rAgentMemories', 'extendedcontext.json');
        const agentMemoryPath = path.join(baseDir, 'rMemory', 'memory-scribe', 'memory-data', 'conversations.json');
        const knowledgeBasePath = path.join(baseDir, 'rMemory', 'memory-scribe', 'memory-data', 'knowledge-base.json');
        const tasksPath = path.join(baseDir, 'rMemory', 'rAgentMemories', 'tasks.json');
        const autoContextPath = path.join(baseDir, 'rMemory', 'auto-context.json');
        const persistentMemoryPath = path.join(baseDir, 'persistent-memory.json');
        
        searchPaths = [extendedContextPath, agentMemoryPath, knowledgeBasePath, tasksPath, autoContextPath, persistentMemoryPath];
        
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
        
        // Search merged conversations
        try {
            const conversationsData = await fs.readFile(agentMemoryPath, 'utf8');
            const conversations = JSON.parse(conversationsData);
            
            if (Array.isArray(conversations)) {
                for (const conv of conversations) {
                    const searchText = `${conv.userInput} ${conv.aiResponse} ${conv.projectContext || ''} ${(conv.contextTags || []).join(' ')}`;
                    const relevance = calculateRelevance(query, searchText);
                    if (relevance > 0.2) {
                        results.push({
                            source: 'Conversations',
                            title: conv.userInput.substring(0, 60) + '...',
                            relevance: relevance,
                            type: 'conversation',
                            content: conv.aiResponse.substring(0, 200) + '...',
                            date: conv.timestamp,
                            recent: true
                        });
                    }
                }
            }
        } catch (error) {
            // Conversations not available
        }
        
        // Search knowledge base
        try {
            const knowledgeData = await fs.readFile(knowledgeBasePath, 'utf8');
            const knowledge = JSON.parse(knowledgeData);
            
            if (Array.isArray(knowledge)) {
                for (const item of knowledge) {
                    const searchText = `${item.keyConcept} ${item.description} ${item.category || ''}`;
                    const relevance = calculateRelevance(query, searchText);
                    if (relevance > 0.2) {
                        results.push({
                            source: 'Knowledge Base',
                            title: item.keyConcept,
                            relevance: relevance,
                            type: 'concept',
                            content: item.description,
                            category: item.category,
                            recent: false
                        });
                    }
                }
            }
        } catch (error) {
            // Knowledge base not available
        }
        
        // Search auto-context
        try {
            const autoContextData = await fs.readFile(autoContextPath, 'utf8');
            const autoContext = JSON.parse(autoContextData);
            
            const searchText = JSON.stringify(autoContext);
            const relevance = calculateRelevance(query, searchText);
            if (relevance > 0.15) {
                results.push({
                    source: 'Auto Context',
                    title: 'System Context',
                    relevance: relevance,
                    type: 'context',
                    content: `Recent changes: ${(autoContext.recent_changes || []).join(', ')}`,
                    recent: true
                });
            }
        } catch (error) {
            // Auto context not available
        }
        
        // Search persistent memory
        try {
            const persistentData = await fs.readFile(persistentMemoryPath, 'utf8');
            const persistent = JSON.parse(persistentData);
            
            const searchText = JSON.stringify(persistent);
            const relevance = calculateRelevance(query, searchText);
            if (relevance > 0.15) {
                results.push({
                    source: 'Persistent Memory',
                    title: 'System Memory',
                    relevance: relevance,
                    type: 'system',
                    content: `Project context: ${Object.keys(persistent.project_context || {}).join(', ')}`,
                    recent: false
                });
            }
        } catch (error) {
            // Persistent memory not available
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
