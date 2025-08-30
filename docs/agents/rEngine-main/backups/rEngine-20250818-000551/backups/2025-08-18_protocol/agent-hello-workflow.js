#!/usr/bin/env node

/**
 * Agent Hello Workflow - Persistent Memory and Context Continuity
 * Manages agent initialization with handoff logs and memory integration
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AgentHelloWorkflow {
    constructor() {
        this.baseDir = path.dirname(path.dirname(__filename));
        this.memoryDir = path.join(this.baseDir, 'rMemory', 'rAgentMemories');
        this.agentsDir = path.join(this.baseDir, 'agents');
        
        // Memory Intelligence System Paths
        this.memoryIntelligencePath = path.join(this.baseDir, 'rEngine', 'memory-intelligence.js');
        this.fastRecallPath = path.join(this.baseDir, 'rEngine', 'recall.js');
        this.addContextPath = path.join(this.baseDir, 'rEngine', 'add-context.js');
        this.extendedContextPath = path.join(this.memoryDir, 'extendedcontext.json');
        
        this.colors = {
            pink: '\x1b[95m',
            green: '\x1b[92m',
            blue: '\x1b[94m',
            yellow: '\x1b[93m',
            cyan: '\x1b[96m',
            red: '\x1b[91m',
            reset: '\x1b[0m'
        };
        
        // Memory Intelligence System Status
        this.memorySystemStatus = this.checkMemorySystemStatus();
    }

    async initializeAgent() {
        console.log('👋 Agent initialization started...');
        
        try {
            // Load latest handoff
            const latestHandoff = await this.getLatestHandoff();
            
            // Load personal memories
            const personalMemories = await this.loadPersonalMemories();
            
            // Load MCP memory if available
            const mcpMemories = await this.loadMCPMemories();
            
            // Load technical knowledge
            const knowledgeDB = await this.loadKnowledgeDB();
            
            // Generate continuation prompt
            const continuationPrompt = this.generateContinuationPrompt(
                latestHandoff, 
                personalMemories, 
                mcpMemories,
                knowledgeDB
            );
            
            return {
                hasContext: !!(latestHandoff || personalMemories || mcpMemories),
                continuationPrompt,
                latestHandoff,
                memoryCount: {
                    personal: personalMemories?.length || 0,
                    mcp: mcpMemories?.entities?.length || 0,
                    handoff: latestHandoff ? 1 : 0,
                    knowledge: knowledgeDB ? Object.keys(knowledgeDB.concepts || {}).length : 0
                },
                detailedContext: {
                    latestHandoff,
                    personalMemories,
                    mcpMemories,
                    knowledgeDB
                }
            };
            
        } catch (error) {
            console.error('❌ Agent initialization failed:', error);
            return { hasContext: false, error: error.message };
        }
    }

    async getLatestHandoff() {
        try {
            if (!await fs.pathExists(this.handoffDir)) {
                console.log('ℹ️  No handoff directory found');
                return null;
            }
            
            const files = await fs.readdir(this.handoffDir);
            const handoffFiles = files
                .filter(f => f.startsWith('catch-up-') && f.endsWith('.md'))
                .sort()
                .reverse();
            
            if (handoffFiles.length === 0) {
                console.log('ℹ️  No handoff files found');
                return null;
            }
            
            const latestFile = path.join(this.handoffDir, handoffFiles[0]);
            const content = await fs.readFile(latestFile, 'utf8');
            const stats = await fs.stat(latestFile);
            
            return {
                filename: handoffFiles[0],
                content,
                timestamp: stats.mtime,
                timeAgo: this.getTimeAgo(stats.mtime),
                summary: this.extractHandoffSummary(content)
            };
            
        } catch (error) {
            console.warn('⚠️  Could not load handoff:', error.message);
            return null;
        }
    }

    extractHandoffSummary(content) {
        // Extract key information from handoff content
        const lines = content.split('\n');
        let summary = '';
        let inHandoffDetails = false;
        
        for (const line of lines) {
            if (line.includes('## Handoff Details')) {
                inHandoffDetails = true;
                continue;
            }
            if (inHandoffDetails && line.startsWith('##')) {
                break;
            }
            if (inHandoffDetails && line.trim()) {
                summary += line + '\n';
                if (summary.length > 300) break; // Keep it concise
            }
        }
        
        return summary.trim();
    }

    async loadPersonalMemories() {
        try {
            const personalMemoryFile = path.join(this.memoryDir, 'rAgentMemories', 'personal-context.json');
            
            if (!await fs.pathExists(personalMemoryFile)) {
                console.log('ℹ️  No personal memories found');
                return null;
            }
            
            const memories = await fs.readJson(personalMemoryFile);
            
            return memories.slice(-10); // Return last 10 personal contexts
            
        } catch (error) {
            console.warn('⚠️  Could not load personal memories:', error.message);
            return null;
        }
    }

    async loadMCPMemories() {
        try {
            const mcpExportFile = path.join(this.engineDir, 'scribe-mcp-export.json');
            
            if (!await fs.pathExists(mcpExportFile)) {
                console.log('ℹ️  No MCP export found');
                return null;
            }
            
            return await fs.readJson(mcpExportFile);
            
        } catch (error) {
            console.warn('⚠️  Could not load MCP memories:', error.message);
            return null;
        }
    }

    async loadKnowledgeDB() {
        try {
            const knowledgeFile = path.join(this.engineDir, 'technical-knowledge.json');
            
            if (!await fs.pathExists(knowledgeFile)) {
                console.log('ℹ️  No knowledge database found');
                return null;
            }
            
            return await fs.readJson(knowledgeFile);
            
        } catch (error) {
            console.warn('⚠️  Could not load knowledge database:', error.message);
            return null;
        }
    }

    generateContinuationPrompt(handoff, personal, mcp, knowledge) {
        let prompt = "🧠 **AGENT MEMORY SYSTEM LOADED**\n\n";
        
        if (handoff) {
            prompt += `📋 **Latest Handoff** (${handoff.timeAgo}):\n`;
            prompt += `\`\`\`\n${handoff.summary.substring(0, 400)}${handoff.summary.length > 400 ? '...' : ''}\n\`\`\`\n\n`;
        }
        
        if (personal && personal.length > 0) {
            const lastInteraction = personal[personal.length - 1];
            prompt += `👤 **Personal Context**: ${personal.length} recent interactions\n`;
            prompt += `Last session: ${this.getTimeAgo(new Date(lastInteraction.timestamp))}\n\n`;
        }
        
        if (mcp && mcp.entities) {
            prompt += `🧠 **Technical Memory**: ${mcp.entities.length} concepts in knowledge base\n`;
            prompt += `Last sync: ${this.getTimeAgo(new Date(mcp.timestamp))}\n\n`;
        }
        
        if (knowledge && knowledge.metadata) {
            prompt += `📚 **Smart Scribe Knowledge**: ${knowledge.metadata.total_concepts} concepts, ${knowledge.metadata.total_patterns} patterns\n`;
            prompt += `Last updated: ${this.getTimeAgo(new Date(knowledge.metadata.last_updated))}\n\n`;
        }
        
        prompt += "**How would you like to proceed?**\n";
        prompt += "1. 🔄 **Continue** where we left off\n";
        prompt += "2. 🆕 **Start fresh** (memories remain available for reference)\n";
        prompt += "3. 📊 **Show detailed context** summary\n";
        prompt += "4. 🔍 **Search memories** for specific information\n\n";
        prompt += "*Just say your choice or tell me what you'd like to work on!*";
        
        return prompt;
    }

    generateDetailedContext(handoff, personal, mcp, knowledge) {
        let context = "# 📊 Detailed Context Summary\n\n";
        
        if (handoff) {
            context += "## 📋 Latest Handoff\n";
            context += `**File:** ${handoff.filename}\n`;
            context += `**Generated:** ${handoff.timeAgo}\n`;
            context += `**Content:**\n${handoff.content}\n\n`;
        }
        
        if (personal && personal.length > 0) {
            context += "## 👤 Personal Memory\n";
            personal.slice(-3).forEach((memory, index) => {
                context += `**Session ${personal.length - 2 + index}** (${this.getTimeAgo(new Date(memory.timestamp))}):\n`;
                context += `${JSON.stringify(memory.context, null, 2)}\n\n`;
            });
        }
        
        if (knowledge && knowledge.metadata) {
            context += "## 📚 Recent Knowledge Base Updates\n";
            context += `**Total Concepts:** ${knowledge.metadata.total_concepts}\n`;
            context += `**Total Patterns:** ${knowledge.metadata.total_patterns}\n`;
            context += `**Last Updated:** ${this.getTimeAgo(new Date(knowledge.metadata.last_updated))}\n\n`;
            
            // Show recent concepts
            const recentConcepts = Object.entries(knowledge.concepts || {})
                .sort((a, b) => new Date(b[1].updated_at) - new Date(a[1].updated_at))
                .slice(0, 5);
                
            if (recentConcepts.length > 0) {
                context += "**Recent Concepts:**\n";
                recentConcepts.forEach(([term, concept]) => {
                    context += `- **${term}**: ${concept.definition}\n`;
                });
                context += "\n";
            }
        }
        
        return context;
    }

    getTimeAgo(timestamp) {
        const now = Date.now();
        const then = new Date(timestamp).getTime();
        const diffMinutes = Math.floor((now - then) / (1000 * 60));
        
        if (diffMinutes < 1) {
            return 'just now';
        } else if (diffMinutes < 60) {
            return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
        } else if (diffMinutes < 1440) {
            const hours = Math.floor(diffMinutes / 60);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            const days = Math.floor(diffMinutes / 1440);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
    }

    async savePersonalContext(context) {
        const personalMemoryFile = path.join(this.memoryDir, 'rAgentMemories', 'personal-context.json');
        await fs.ensureDir(path.dirname(personalMemoryFile));
        
        let existingContext = [];
        if (await fs.pathExists(personalMemoryFile)) {
            existingContext = await fs.readJson(personalMemoryFile);
        }
        
        existingContext.push({
            timestamp: new Date().toISOString(),
            context,
            session_id: process.env.SESSION_ID || `session_${Date.now()}`
        });
        
        // Keep last 100 personal contexts
        if (existingContext.length > 100) {
            existingContext = existingContext.slice(-100);
        }
        
        await fs.writeJson(personalMemoryFile, existingContext, { spaces: 2 });
        console.log('💾 Personal context saved');
    }

    async searchMemories(query) {
        console.log(`🔍 Searching memories for: "${query}"`);
        
        const results = {
            handoffs: [],
            personal: [],
            knowledge: [],
            total: 0
        };
        
        try {
            // Search handoff files
            if (await fs.pathExists(this.handoffDir)) {
                const files = await fs.readdir(this.handoffDir);
                const handoffFiles = files.filter(f => f.startsWith('catch-up-') && f.endsWith('.md'));
                
                for (const file of handoffFiles) {
                    const content = await fs.readFile(path.join(this.handoffDir, file), 'utf8');
                    if (content.toLowerCase().includes(query.toLowerCase())) {
                        results.handoffs.push({
                            file,
                            snippet: this.extractSnippet(content, query)
                        });
                    }
                }
            }
            
            // Search personal memories
            const personalFile = path.join(this.memoryDir, 'rAgentMemories', 'personal-context.json');
            if (await fs.pathExists(personalFile)) {
                const personal = await fs.readJson(personalFile);
                for (const memory of personal) {
                    const contextStr = JSON.stringify(memory.context);
                    if (contextStr.toLowerCase().includes(query.toLowerCase())) {
                        results.personal.push({
                            timestamp: memory.timestamp,
                            snippet: this.extractSnippet(contextStr, query)
                        });
                    }
                }
            }
            
            // Search knowledge database
            const knowledgeFile = path.join(this.engineDir, 'technical-knowledge.json');
            if (await fs.pathExists(knowledgeFile)) {
                const knowledge = await fs.readJson(knowledgeFile);
                
                // Search concepts
                for (const [term, concept] of Object.entries(knowledge.concepts || {})) {
                    if (term.toLowerCase().includes(query.toLowerCase()) || 
                        concept.definition.toLowerCase().includes(query.toLowerCase())) {
                        results.knowledge.push({
                            type: 'concept',
                            term,
                            definition: concept.definition,
                            source: concept.source_file
                        });
                    }
                }
            }
            
            results.total = results.handoffs.length + results.personal.length + results.knowledge.length;
            
        } catch (error) {
            console.error('❌ Memory search failed:', error);
        }
        
        return results;
    }

    extractSnippet(text, query, contextLength = 100) {
        const index = text.toLowerCase().indexOf(query.toLowerCase());
        if (index === -1) return text.substring(0, contextLength);
        
        const start = Math.max(0, index - contextLength / 2);
        const end = Math.min(text.length, index + query.length + contextLength / 2);
        
        return text.substring(start, end);
    }

    checkMemorySystemStatus() {
        const status = {
            memoryIntelligence: false,
            fastRecall: false,
            addContext: false,
            extendedContext: false,
            allSystemsReady: false
        };
        
        try {
            // Check if memory intelligence files exist
            status.memoryIntelligence = fs.existsSync(this.memoryIntelligencePath);
            status.fastRecall = fs.existsSync(this.fastRecallPath);
            status.addContext = fs.existsSync(this.addContextPath);
            status.extendedContext = fs.existsSync(this.extendedContextPath);
            
            status.allSystemsReady = status.memoryIntelligence && status.fastRecall && 
                                    status.addContext && status.extendedContext;
        } catch (error) {
            console.warn('⚠️  Memory system status check failed:', error.message);
        }
        
        return status;
    }

    async initializeMemorySystem() {
        const { colors } = this;
        
        console.log(`${colors.cyan}🧠 Memory Intelligence System Status:${colors.reset}`);
        
        if (this.memorySystemStatus.allSystemsReady) {
            console.log(`${colors.green}✅ Memory Intelligence System: READY${colors.reset}`);
            console.log(`${colors.blue}📚 Extended Context Database: ACTIVE${colors.reset}`);
            console.log(`${colors.blue}🔍 Fast Recall System: ENABLED${colors.reset}`);
            console.log(`${colors.blue}📝 Context Entry System: AVAILABLE${colors.reset}`);
            
            // Quick memory test
            try {
                const { exec } = await import('child_process');
                const { promisify } = await import('util');
                const execPromise = promisify(exec);
                
                const testResult = await execPromise(`node "${this.fastRecallPath}" "system"`);
                const matchCount = (testResult.stdout.match(/Found \d+ matches/) || ['Found 0 matches'])[0];
                console.log(`${colors.yellow}🔬 Memory Test: ${matchCount}${colors.reset}`);
                
            } catch (error) {
                console.log(`${colors.yellow}⚠️  Memory test failed, but system is operational${colors.reset}`);
            }
            
        } else {
            console.log(`${colors.red}❌ Memory Intelligence System: INCOMPLETE${colors.reset}`);
            console.log(`${colors.yellow}Missing components:${colors.reset}`);
            if (!this.memorySystemStatus.memoryIntelligence) 
                console.log(`${colors.red}  - memory-intelligence.js${colors.reset}`);
            if (!this.memorySystemStatus.fastRecall) 
                console.log(`${colors.red}  - recall.js${colors.reset}`);
            if (!this.memorySystemStatus.addContext) 
                console.log(`${colors.red}  - add-context.js${colors.reset}`);
            if (!this.memorySystemStatus.extendedContext) 
                console.log(`${colors.red}  - extendedcontext.json${colors.reset}`);
        }
        
        return this.memorySystemStatus.allSystemsReady;
    }

    async showMemoryCommands() {
        const { colors } = this;
        
        console.log(`${colors.cyan}📚 Memory Intelligence Commands:${colors.reset}\n`);
        
        if (this.memorySystemStatus.fastRecall) {
            console.log(`${colors.green}🔍 Fast Recall:${colors.reset}`);
            console.log(`  node "${this.fastRecallPath}" "search term"`);
            console.log(`  Examples: "menu system", "javascript bug", "console split"\n`);
        }
        
        if (this.memorySystemStatus.addContext) {
            console.log(`${colors.green}📝 Add Context:${colors.reset}`);
            console.log(`  node "${this.addContextPath}" "title" "description" [type]`);
            console.log(`  Example: "Bug Fix" "Fixed undefined variable" "fix"\n`);
        }
        
        if (this.memorySystemStatus.memoryIntelligence) {
            console.log(`${colors.green}🔬 Advanced Memory:${colors.reset}`);
            console.log(`  node "${this.memoryIntelligencePath}" recall "complex query"`);
            console.log(`  node "${this.memoryIntelligencePath}" suggest "topic"\n`);
        }
        
        console.log(`${colors.blue}💡 Integration Tip: Use MCP calls to scribe for seamless recall${colors.reset}`);
    }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const workflow = new AgentHelloWorkflow();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'init':
            const result = await workflow.initializeAgent();
            console.log('🧠 Agent Initialization Result:');
            console.log(result.continuationPrompt);
            break;
            
        case 'search':
            const query = process.argv[3];
            if (!query) {
                console.log('Usage: node agent-hello-workflow.js search "query"');
                break;
            }
            const searchResults = await workflow.searchMemories(query);
            console.log(`🔍 Found ${searchResults.total} results for "${query}"`);
            console.log(JSON.stringify(searchResults, null, 2));
            break;
            
        case 'context':
            const initResult = await workflow.initializeAgent();
            if (initResult.hasContext) {
                const detailedContext = workflow.generateDetailedContext(
                    initResult.detailedContext.latestHandoff,
                    initResult.detailedContext.personalMemories,
                    initResult.detailedContext.mcpMemories,
                    initResult.detailedContext.knowledgeDB
                );
                console.log(detailedContext);
            } else {
                console.log('No context available');
            }
            break;
            
        default:
            console.log('Usage: node agent-hello-workflow.js [init|search|context]');
            console.log('  init    - Initialize agent with memory context');
            console.log('  search  - Search memories for specific content');
            console.log('  context - Show detailed context summary');
    }
}

export default AgentHelloWorkflow;
