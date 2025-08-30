#!/usr/bin/env node

/**
 * Memory Intelligence System - Fast recall and pattern matching
 * Combines MCP Memory + Extended Context + Pattern Recognition
 * 
 * Usage: node memory-intelligence.js [command] [query]
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MemoryIntelligence {
    constructor() {
        this.baseDir = path.dirname(__dirname);
        this.memoryPath = path.join(this.baseDir, 'rMemory', 'rAgentMemories');
        this.extendedContextPath = path.join(this.memoryPath, 'extendedcontext.json');
        this.agentMemoryPath = path.join(this.memoryPath, 'memory.json');
        this.tasksPath = path.join(this.memoryPath, 'tasks.json');
    }

    /**
     * SMART RECALL - Find relevant context for any query
     */
    async smartRecall(query, timeframe = null) {
        console.log(`🧠 Smart Recall: "${query}"`);
        console.log('═══════════════════════════════════════');
        
        const results = {
            mcp_entities: [],
            recent_sessions: [],
            historical_patterns: [],
            related_tasks: [],
            smart_suggestions: []
        };

        // 1. FAST: Check MCP Memory first (if available)
        try {
            // Note: MCP Memory tools would go here when server is fixed
            console.log('⚡ MCP Memory: Server needs configuration');
        } catch (error) {
            console.log(`⚠️  MCP Memory: ${error.message}`);
        }

        // 2. RECENT: Search extended context sessions
        results.recent_sessions = await this.searchExtendedContext(query, timeframe);

        // 3. DEEP: Search agent memory patterns
        results.historical_patterns = await this.searchAgentMemory(query);

        // 4. TASKS: Search related tasks/issues
        results.related_tasks = await this.searchTasks(query);

        // 5. SMART: Generate intelligent suggestions
        results.smart_suggestions = this.generateSmartSuggestions(query, results);

        return results;
    }

    /**
     * Search extended context for sessions matching query
     */
    async searchExtendedContext(query, timeframe = null) {
        try {
            const data = await fs.readFile(this.extendedContextPath, 'utf8');
            const extendedContext = JSON.parse(data);
            
            const matches = [];
            const queryLower = query.toLowerCase();
            
            // Get date range to search
            const dates = Object.keys(extendedContext.sessions || {});
            const searchDates = timeframe ? this.filterDatesByTimeframe(dates, timeframe) : dates;
            
            for (const date of searchDates) {
                const sessions = extendedContext.sessions[date] || [];
                
                for (const session of sessions) {
                    let relevanceScore = 0;
                    const matchedActivities = [];
                    
                    // Check activities for matches
                    for (const activity of session.activities || []) {
                        if (activity.message.toLowerCase().includes(queryLower) ||
                            activity.type.toLowerCase().includes(queryLower)) {
                            matchedActivities.push(activity);
                            relevanceScore += 1;
                        }
                    }
                    
                    // Check key events for matches
                    for (const event of session.key_events || []) {
                        if (event.message.toLowerCase().includes(queryLower)) {
                            matchedActivities.push(event);
                            relevanceScore += 2; // Key events are more important
                        }
                    }
                    
                    if (relevanceScore > 0) {
                        matches.push({
                            date,
                            session_id: session.session_id,
                            start_time: session.start_time,
                            summary: session.summary,
                            relevance_score: relevanceScore,
                            matched_activities: matchedActivities.slice(0, 5), // Top 5 matches
                            total_matches: matchedActivities.length
                        });
                    }
                }
            }
            
            // Sort by relevance and date (most recent first)
            return matches.sort((a, b) => {
                if (a.relevance_score !== b.relevance_score) {
                    return b.relevance_score - a.relevance_score;
                }
                return new Date(b.start_time) - new Date(a.start_time);
            }).slice(0, 10); // Top 10 results
            
        } catch (error) {
            console.log(`⚠️  Extended Context search failed: ${error.message}`);
            return [];
        }
    }

    /**
     * Search agent memory for patterns and concepts
     */
    async searchAgentMemory(query) {
        try {
            const data = await fs.readFile(this.agentMemoryPath, 'utf8');
            const memory = JSON.parse(data);
            
            const matches = [];
            const queryLower = query.toLowerCase();
            
            // Search entities
            for (const [entityKey, entity] of Object.entries(memory.entities || {})) {
                if (entityKey.toLowerCase().includes(queryLower) ||
                    entity.description?.toLowerCase().includes(queryLower)) {
                    matches.push({
                        type: 'entity',
                        key: entityKey,
                        data: entity,
                        relevance: this.calculateRelevance(queryLower, entityKey + ' ' + (entity.description || ''))
                    });
                }
            }
            
            // Search concepts
            for (const [conceptKey, concept] of Object.entries(memory.concepts || {})) {
                if (conceptKey.toLowerCase().includes(queryLower) ||
                    concept.description?.toLowerCase().includes(queryLower)) {
                    matches.push({
                        type: 'concept',
                        key: conceptKey,
                        data: concept,
                        relevance: this.calculateRelevance(queryLower, conceptKey + ' ' + (concept.description || ''))
                    });
                }
            }
            
            return matches.sort((a, b) => b.relevance - a.relevance).slice(0, 5);
            
        } catch (error) {
            console.log(`⚠️  Agent Memory search failed: ${error.message}`);
            return [];
        }
    }

    /**
     * Search tasks for related issues/solutions
     */
    async searchTasks(query) {
        try {
            const data = await fs.readFile(this.tasksPath, 'utf8');
            const tasks = JSON.parse(data);
            
            const matches = [];
            const queryLower = query.toLowerCase();
            
            // Search active tasks
            for (const [taskKey, task] of Object.entries(tasks.active_tasks || {})) {
                if (taskKey.toLowerCase().includes(queryLower) ||
                    task.description?.toLowerCase().includes(queryLower) ||
                    task.solution?.toLowerCase().includes(queryLower)) {
                    matches.push({
                        type: 'active_task',
                        key: taskKey,
                        data: task,
                        relevance: this.calculateRelevance(queryLower, 
                            taskKey + ' ' + (task.description || '') + ' ' + (task.solution || ''))
                    });
                }
            }
            
            // Search completed tasks
            for (const [taskKey, task] of Object.entries(tasks.completed_tasks || {})) {
                if (taskKey.toLowerCase().includes(queryLower) ||
                    task.description?.toLowerCase().includes(queryLower) ||
                    task.solution?.toLowerCase().includes(queryLower)) {
                    matches.push({
                        type: 'completed_task',
                        key: taskKey,
                        data: task,
                        relevance: this.calculateRelevance(queryLower, 
                            taskKey + ' ' + (task.description || '') + ' ' + (task.solution || ''))
                    });
                }
            }
            
            return matches.sort((a, b) => b.relevance - a.relevance).slice(0, 5);
            
        } catch (error) {
            console.log(`⚠️  Tasks search failed: ${error.message}`);
            return [];
        }
    }

    /**
     * Generate intelligent suggestions based on found patterns
     */
    generateSmartSuggestions(query, results) {
        const suggestions = [];
        
        // Pattern: If searching for "bug" or "error", suggest checking completed tasks
        if (query.toLowerCase().includes('bug') || query.toLowerCase().includes('error')) {
            const completedBugFixes = results.related_tasks.filter(t => 
                t.type === 'completed_task' && 
                (t.key.includes('bug') || t.key.includes('fix') || t.key.includes('error'))
            );
            
            if (completedBugFixes.length > 0) {
                suggestions.push({
                    type: 'pattern_match',
                    suggestion: 'Found similar bug fixes in completed tasks',
                    action: 'Review solutions from previous bug fixes',
                    confidence: 'high',
                    related_items: completedBugFixes.slice(0, 3)
                });
            }
        }
        
        // Pattern: If searching for implementation details, suggest checking recent sessions
        if (query.toLowerCase().includes('implement') || query.toLowerCase().includes('setup') || query.toLowerCase().includes('create')) {
            const recentImplementations = results.recent_sessions.filter(s =>
                s.matched_activities.some(a => 
                    a.message.includes('implement') || 
                    a.message.includes('create') || 
                    a.message.includes('setup')
                )
            );
            
            if (recentImplementations.length > 0) {
                suggestions.push({
                    type: 'recent_work',
                    suggestion: 'Found recent implementation work',
                    action: 'Check recent session activities for implementation details',
                    confidence: 'medium',
                    related_items: recentImplementations.slice(0, 2)
                });
            }
        }
        
        // Pattern: If no specific matches, suggest broader search
        if (results.recent_sessions.length === 0 && results.historical_patterns.length === 0) {
            suggestions.push({
                type: 'search_strategy',
                suggestion: 'No direct matches found',
                action: 'Try broader search terms or check git commit history',
                confidence: 'low',
                related_items: []
            });
        }
        
        return suggestions;
    }

    /**
     * Calculate relevance score for text matching
     */
    calculateRelevance(query, text) {
        const textLower = text.toLowerCase();
        let score = 0;
        
        // Exact phrase match
        if (textLower.includes(query)) {
            score += 10;
        }
        
        // Word matches
        const queryWords = query.split(' ');
        for (const word of queryWords) {
            if (textLower.includes(word)) {
                score += 2;
            }
        }
        
        return score;
    }

    /**
     * Filter dates by timeframe
     */
    filterDatesByTimeframe(dates, timeframe) {
        const now = new Date();
        const cutoff = new Date();
        
        switch (timeframe) {
            case '1d':
            case 'today':
                cutoff.setDate(now.getDate() - 1);
                break;
            case '1w':
            case 'week':
                cutoff.setDate(now.getDate() - 7);
                break;
            case '1m':
            case 'month':
                cutoff.setMonth(now.getMonth() - 1);
                break;
            case '3m':
                cutoff.setMonth(now.getMonth() - 3);
                break;
            default:
                return dates; // No filtering
        }
        
        return dates.filter(date => new Date(date) >= cutoff);
    }

    /**
     * Display results in a formatted way
     */
    displayResults(results) {
        console.log('\n🎯 SMART RECALL RESULTS');
        console.log('═══════════════════════════════════════\n');
        
        // Recent Sessions
        if (results.recent_sessions.length > 0) {
            console.log('📅 RECENT SESSIONS:');
            for (const session of results.recent_sessions.slice(0, 3)) {
                console.log(`  ${session.date} - ${session.summary}`);
                console.log(`  Relevance: ${session.relevance_score}/10 | Matches: ${session.total_matches}`);
                if (session.matched_activities.length > 0) {
                    console.log(`  Top Match: ${session.matched_activities[0].message}`);
                }
                console.log('');
            }
        }
        
        // Historical Patterns
        if (results.historical_patterns.length > 0) {
            console.log('🧠 HISTORICAL PATTERNS:');
            for (const pattern of results.historical_patterns.slice(0, 3)) {
                console.log(`  ${pattern.type.toUpperCase()}: ${pattern.key}`);
                console.log(`  Relevance: ${pattern.relevance}/10`);
                console.log('');
            }
        }
        
        // Related Tasks
        if (results.related_tasks.length > 0) {
            console.log('📋 RELATED TASKS:');
            for (const task of results.related_tasks.slice(0, 3)) {
                console.log(`  ${task.type.replace('_', ' ').toUpperCase()}: ${task.key}`);
                console.log(`  Relevance: ${task.relevance}/10`);
                if (task.data.solution) {
                    console.log(`  Solution: ${task.data.solution.substring(0, 100)}...`);
                }
                console.log('');
            }
        }
        
        // Smart Suggestions
        if (results.smart_suggestions.length > 0) {
            console.log('💡 SMART SUGGESTIONS:');
            for (const suggestion of results.smart_suggestions) {
                console.log(`  ${suggestion.suggestion}`);
                console.log(`  Action: ${suggestion.action}`);
                console.log(`  Confidence: ${suggestion.confidence}`);
                console.log('');
            }
        }
        
        if (results.recent_sessions.length === 0 && 
            results.historical_patterns.length === 0 && 
            results.related_tasks.length === 0) {
            console.log('ℹ️  No relevant memories found. Try different search terms.');
        }
    }
}

// CLI interface
async function main() {
    const memory = new MemoryIntelligence();
    const command = process.argv[2];
    const query = process.argv[3];
    
    switch (command) {
        case 'recall':
        case 'search':
            if (!query) {
                console.log('Usage: node memory-intelligence.js recall "your query"');
                console.log('Example: node memory-intelligence.js recall "bug in javascript"');
                break;
            }
            
            const timeframe = process.argv[4]; // Optional timeframe
            const results = await memory.smartRecall(query, timeframe);
            memory.displayResults(results);
            break;
            
        case 'recent':
            const recentQuery = query || 'console';
            const recentResults = await memory.smartRecall(recentQuery, '1w');
            memory.displayResults(recentResults);
            break;
            
        default:
            console.log('Memory Intelligence System');
            console.log('Usage:');
            console.log('  recall "query" [timeframe] - Smart recall search');
            console.log('  recent ["query"]           - Search recent week');
            console.log('');
            console.log('Examples:');
            console.log('  node memory-intelligence.js recall "javascript bug"');
            console.log('  node memory-intelligence.js recall "menu system" 1m');
            console.log('  node memory-intelligence.js recent "console"');
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    await main();
}

export default MemoryIntelligence;
