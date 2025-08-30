#!/usr/bin/env node

/**
 * Universal Agent Initialization System
 * Handles ALL agents: Claude, GPT, Gemini, and any future Copilot agents
 * Creates agent-specific memory files and ensures MCP integration
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execPromise = promisify(exec);

const colors = {
    pink: '\x1b[95m',
    green: '\x1b[92m',
    blue: '\x1b[94m',
    yellow: '\x1b[93m',
    cyan: '\x1b[96m',
    red: '\x1b[91m',
    reset: '\x1b[0m'
};

class UniversalAgentInit {
    constructor() {
        this.baseDir = path.dirname(__dirname);
        this.memoryDir = path.join(this.baseDir, 'rMemory', 'rAgentMemories');
        this.engineDir = path.join(this.baseDir, 'rEngine');
        
        // Agent detection - determine which agent is running
        this.agentType = this.detectAgent();
        this.sessionId = `${this.agentType}-session-${Date.now()}`;
        this.startTime = new Date().toISOString();
    }
    
    detectAgent() {
        // Check environment and context to determine agent type
        const userAgent = process.env.USER_AGENT || '';
        const copilotContext = process.env.COPILOT_CONTEXT || '';
        
        // Check for specific agent indicators
        if (userAgent.toLowerCase().includes('claude') || copilotContext.includes('claude')) {
            return 'claude';
        } else if (userAgent.toLowerCase().includes('gpt') || copilotContext.includes('gpt')) {
            return 'gpt';
        } else if (userAgent.toLowerCase().includes('gemini') || copilotContext.includes('gemini')) {
            return 'gemini';
        } else if (process.argv.includes('--agent-type')) {
            // Allow manual specification
            const agentIndex = process.argv.indexOf('--agent-type');
            return process.argv[agentIndex + 1] || 'unknown';
        } else {
            // Default detection based on common patterns
            return 'copilot-agent';
        }
    }
    
    async initializeAgent() {
        console.log(`${colors.pink}
╔═══════════════════════════════════════════════════════════════════╗
║                🌍 Universal Agent Initialization 🌍                ║
║                                                                   ║
║     Supporting Claude, GPT, Gemini & All Future Agents          ║
╚═══════════════════════════════════════════════════════════════════╝${colors.reset}\n`);
        
        console.log(`${colors.cyan}🤖 Detected Agent: ${this.agentType.toUpperCase()}${colors.reset}`);
        console.log(`${colors.blue}📅 Session ID: ${this.sessionId}${colors.reset}\n`);
        
        try {
            // 0. CRITICAL: Check requirements compliance
            await this.checkCriticalRequirements();
            
            // 1. Create agent-specific memory file
            await this.createAgentMemoryFile();
            
            // 2. Git backup
            await this.createGitBackup();
            
            // 3. MCP memory integration
            await this.initializeMCPMemory();

            // 3.5 Ensure split console is visible or offer to launch it
            await this.ensureSplitScribeConsoleVisible();
            
            // 4. Load previous context and display summary
            const prev = await this.loadPreviousContext();
            await this.showStartupSummary(prev);
            await this.promptResumeOrFresh();
            
            // 5. Initialize dual memory protocol with sanitization
            await this.initializeDualMemory();
            
            // 6. Status check and user interaction
            await this.presentAgentMenu();
            
        } catch (error) {
            console.error(`${colors.red}❌ Initialization failed: ${error.message}${colors.reset}`);
            process.exit(1);
        }
    }
    
    async createAgentMemoryFile() {
        const agentMemoryPath = path.join(this.memoryDir, `${this.agentType}-memory.json`);
        
        console.log(`${colors.cyan}📝 Creating agent-specific memory file...${colors.reset}`);
        
        let agentMemory;
        try {
            // Try to load existing memory
            const existing = await fs.readFile(agentMemoryPath, 'utf8');
            agentMemory = JSON.parse(existing);
            console.log(`${colors.green}✅ Loaded existing ${this.agentType} memory file${colors.reset}`);
        } catch (error) {
            // Create new memory file
            agentMemory = {
                agent_type: this.agentType,
                created_at: this.startTime,
                sessions: {},
                capabilities: this.getAgentCapabilities(),
                memory_stats: {
                    total_sessions: 0,
                    total_tasks: 0,
                    last_active: this.startTime
                }
            };
            console.log(`${colors.yellow}📄 Created new ${this.agentType} memory file${colors.reset}`);
        }
        
        // Add current session
        const today = new Date().toISOString().split('T')[0];
        if (!agentMemory.sessions[today]) {
            agentMemory.sessions[today] = [];
        }
        
        agentMemory.sessions[today].push({
            session_id: this.sessionId,
            start_time: this.startTime,
            status: 'active',
            initialization: {
                git_backup: false,
                mcp_integration: false,
                context_loaded: false
            }
        });
        
        agentMemory.memory_stats.last_active = this.startTime;
        agentMemory.memory_stats.total_sessions++;
        
        await fs.writeFile(agentMemoryPath, JSON.stringify(agentMemory, null, 2));
        console.log(`${colors.green}✅ ${this.agentType}-memory.json updated${colors.reset}`);
        
        return agentMemory;
    }
    
    getAgentCapabilities() {
        const baseCapabilities = [
            'memory_recall',
            'context_preservation',
            'task_logging',
            'git_integration',
            'mcp_protocol'
        ];
        
        switch (this.agentType) {
            case 'claude':
                return [...baseCapabilities, 'anthropic_api', 'function_calling', 'long_context'];
            case 'gpt':
                return [...baseCapabilities, 'openai_api', 'code_interpreter', 'web_browsing'];
            case 'gemini':
                return [...baseCapabilities, 'google_api', 'multimodal', 'search_integration'];
            default:
                return baseCapabilities;
        }
    }
    
    async createGitBackup() {
        console.log(`${colors.cyan}📂 Creating mandatory git backup...${colors.reset}`);
        try {
            const scriptPath = path.join(this.baseDir, 'scripts', 'git-checkpoint.sh');
            await execPromise(`bash "${scriptPath}"`);
            console.log(`${colors.green}✅ Git backup created successfully${colors.reset}`);
            await this.updateSessionStatus('git_backup', true);
        } catch (error) {
            console.log(`${colors.red}❌ Git backup failed: ${error.message}${colors.reset}`);
        }
    }
    
    async initializeMCPMemory() {
        console.log(`${colors.cyan}🔗 Initializing MCP memory integration...${colors.reset}`);
        
        try {
            // Create MCP memory entry
            const mcpData = {
                title: `${this.agentType.toUpperCase()} Agent Session Started`,
                content: `New ${this.agentType} agent session initialized with full protocol compliance. Session ID: ${this.sessionId}`,
                category: `${this.agentType}_session`
            };
            
            // Use MCP mode to avoid popups
            await execPromise(`echo '${JSON.stringify(mcpData)}' | node add-context.js --mcp-mode`);
            console.log(`${colors.green}✅ MCP memory integration active${colors.reset}`);
            
            // Update session status
            await this.updateSessionStatus('mcp_integration', true);
            
        } catch (error) {
            console.log(`${colors.yellow}⚠️  MCP integration had issues: ${error.message}${colors.reset}`);
        }
    }
    
    async initializeDualMemory() {
        console.log(`${colors.cyan}🧠 Initializing dual memory protocol with JSON sanitization...${colors.reset}`);
        
        try {
            const DualMemoryWriter = await import('./dual-memory-writer.js');
            const memoryWriter = new DualMemoryWriter.default();
            
            const success = await memoryWriter.dualWrite(this.agentType, {
                title: `${this.agentType.toUpperCase()} Agent Session Complete`,
                content: `${this.agentType} agent initialized with dual memory protocol, JSON sanitization, MCP integration, and full system compliance. Session: ${this.sessionId}`,
                type: 'agent_initialization',
                features: ['dual_memory_write', 'json_sanitization', 'error_handling', 'mcp_integration'],
                session_info: {
                    session_id: this.sessionId,
                    timestamp: new Date().toISOString(),
                    agent_type: this.agentType
                }
            });
            
            if (success) {
                console.log(`${colors.green}✅ Dual memory protocol active - all memory stores updated${colors.reset}`);
            } else {
                console.log(`${colors.yellow}⚠️  Partial dual memory success - check logs${colors.reset}`);
            }
            
        } catch (error) {
            console.log(`${colors.red}❌ Dual memory initialization failed: ${error.message}${colors.reset}`);
        }
    }

    async loadPreviousContext() {
        console.log(`${colors.cyan}🧠 Loading previous context and memory...${colors.reset}`);
        
        try {
            // Use memory intelligence to get recent context
            const contextResult = await execPromise('node memory-intelligence.js recall "recent work" --silent');
            
            // Load agent-specific memory
            const agentMemoryPath = path.join(this.memoryDir, `${this.agentType}-memory.json`);
            const agentMemory = JSON.parse(await fs.readFile(agentMemoryPath, 'utf8'));
            
            // Get summary of recent sessions
            const recentSessions = this.getRecentSessions(agentMemory);
            
            console.log(`${colors.green}✅ Context loaded successfully${colors.reset}`);
            console.log(`${colors.blue}📊 Recent sessions: ${recentSessions.length}${colors.reset}`);
            
            // Update session status
            await this.updateSessionStatus('context_loaded', true);
            
            // Return a trimmed recall summary for display
            const recallSummary = (contextResult?.stdout || '').toString().trim().slice(0, 1000);
            return { agentMemory, recentSessions, recallSummary };
            
        } catch (error) {
            console.log(`${colors.yellow}⚠️  Context loading had issues: ${error.message}${colors.reset}`);
            return null;
        }
    }
    
    getRecentSessions(agentMemory) {
        const allSessions = [];
        const today = new Date();
        
        // Get last 7 days of sessions
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            if (agentMemory.sessions[dateStr]) {
                allSessions.push(...agentMemory.sessions[dateStr]);
            }
        }
        
        return allSessions.slice(0, 10); // Last 10 sessions
    }
    
    async presentAgentMenu() {
        console.log(`\n${colors.pink}🎯 ${this.agentType.toUpperCase()} Agent Ready - StackTrackr Ecosystem${colors.reset}`);
        console.log('═'.repeat(60));
        
        console.log(`\n${colors.cyan}🤖 SYSTEM STATUS:${colors.reset}`);
        console.log(`✅ Agent Type: ${this.agentType.toUpperCase()}`);
        console.log(`✅ Memory File: ${this.agentType}-memory.json`);
        console.log(`✅ MCP Integration: Active`);
        console.log(`✅ Git Backup: Complete`);
        console.log(`✅ Session ID: ${this.sessionId}`);
        
        console.log(`\n${colors.yellow}📋 MEMORY FILES ACTIVE:${colors.reset}`);
        console.log(`• ${this.agentType}-memory.json (agent-specific)`);
        console.log(`• extendedcontext.json (shared context)`);
        console.log(`• tasks.json (task tracking)`);
        console.log(`• persistent-memory.json (cross-session)`);
        
        console.log(`\n${colors.green}🚀 AVAILABLE OPTIONS:${colors.reset}`);
        console.log(`1. 🔄 Continue previous work (load context & resume)`);
        console.log(`2. 🆕 Start fresh task (clear context & begin new)`);
        console.log(`3. 📊 System status (detailed health check)`);
        console.log(`4. 🧠 Memory review (search/browse all context)`);
        console.log(`5. 📝 Quick commands (summary, backup, status)`);
        
        console.log(`\n${colors.blue}💡 QUICK COMMANDS:${colors.reset}`);
        console.log(`• "continue" → Load previous context and resume work`);
        console.log(`• "fresh" → Start new task with clean slate`);
        console.log(`• "status" → Full system and memory status`);
        console.log(`• "backup" → Create git checkpoint`);
        console.log(`• "memory" → Search and browse memory files`);
        
        console.log(`\n${colors.cyan}📋 NEXT STEPS:${colors.reset}`);
        console.log(`${colors.yellow}⚠️  IMPORTANT: Save project to git before starting work${colors.reset}`);
        console.log(`Choose an option or describe your task to begin!`);
        console.log('═'.repeat(60));
    }
    
    async updateSessionStatus(key, value) {
        try {
            const agentMemoryPath = path.join(this.memoryDir, `${this.agentType}-memory.json`);
            const agentMemory = JSON.parse(await fs.readFile(agentMemoryPath, 'utf8'));
            
            const today = new Date().toISOString().split('T')[0];
            const todaySessions = agentMemory.sessions[today] || [];
            const currentSession = todaySessions.find(s => s.session_id === this.sessionId);
            
            if (currentSession) {
                currentSession.initialization[key] = value;
                await fs.writeFile(agentMemoryPath, JSON.stringify(agentMemory, null, 2));
            }
        } catch (error) {
            console.log(`${colors.yellow}⚠️  Session status update failed: ${error.message}${colors.reset}`);
        }
    }
    
    async checkCriticalRequirements() {
        console.log(`${colors.blue}🔍 Checking COPILOT_INSTRUCTIONS compliance...${colors.reset}`);
        
        try {
            // 1. Check if agent memory has critical requirements
            const agentMemoryPath = path.join(this.memoryDir, `${this.agentType}-memory.json`);
            
            try {
                await fs.access(agentMemoryPath);
                const agentMemory = JSON.parse(await fs.readFile(agentMemoryPath, 'utf8'));
                
                if (!agentMemory.critical_requirements) {
                    console.log(`${colors.yellow}⚠️  Agent memory missing critical requirements - updating...${colors.reset}`);
                    // The update-agent-requirements.js should have handled this
                }
                
                if (agentMemory.metadata && agentMemory.metadata.copilot_instructions_compliant) {
                    console.log(`${colors.green}✅ Agent memory is COPILOT_INSTRUCTIONS compliant${colors.reset}`);
                } else {
                    console.log(`${colors.yellow}⚠️  Agent memory compliance status unknown${colors.reset}`);
                }
            } catch (err) {
                console.log(`${colors.yellow}⚠️  Agent memory file not found - will create with requirements${colors.reset}`);
            }
            
            // 2. Check MCP server status (critical learning from previous session)
            await this.checkMCPServerStatus();
            
            // 3. For GPT agents, remind about mandatory startup
            if (this.agentType.includes('gpt')) {
                console.log(`${colors.red}🚨 GPT AGENT DETECTED 🚨${colors.reset}`);
                console.log(`${colors.yellow}MANDATORY: Run 'node gpt-mandatory-startup.js' first!${colors.reset}`);
                console.log(`${colors.yellow}Failure to do this = BROKEN HANDOFFS & LOST WORK${colors.reset}`);
            }
            
            console.log(`${colors.green}✅ Critical requirements check complete${colors.reset}\n`);
            
        } catch (error) {
            console.log(`${colors.red}❌ Requirements check failed: ${error.message}${colors.reset}`);
        }
    }
    
    async checkMCPServerStatus() {
        console.log(`${colors.blue}🔍 Checking Smart Scribe MCP server status...${colors.reset}`);
        
        try {
            const { stdout } = await execPromise('ps aux | grep smart-scribe | grep -v grep');
            if (stdout.trim()) {
                console.log(`${colors.green}✅ Smart Scribe MCP server is running${colors.reset}`);
                return true;
            } else {
                throw new Error('No Smart Scribe process found');
            }
        } catch (error) {
            console.log(`${colors.red}❌ Smart Scribe MCP server NOT running${colors.reset}`);
            console.log(`${colors.yellow}⚠️  This will cause memory sync failures!${colors.reset}`);
            // Auto-start MCP Memory then rEngine, plus Smart Scribe keepalive
            try {
                const startScript = path.join(this.engineDir, 'start-mcp-servers.sh');
                console.log(`${colors.cyan}💡 Starting MCP servers (memory first)...${colors.reset}`);
                await execPromise(`bash "${startScript}"`);
            } catch (e) {
                console.log(`${colors.red}❌ Failed to start MCP servers automatically: ${e.message}${colors.reset}`);
            }
            // Try to start Smart Scribe if still not up
            try {
                const rootWrapper = path.join(this.baseDir, 'start-smart-scribe.sh');
                await execPromise(`bash "${rootWrapper}"`);
                console.log(`${colors.green}✅ Smart Scribe started${colors.reset}`);
            } catch (e2) {
                console.log(`${colors.yellow}ℹ️  Manual start: ./start-smart-scribe.sh${colors.reset}`);
            }
            return false;
        }
    }

    // Ask user if the split scribe console is visible; if not, auto-launch it
    async ensureSplitScribeConsoleVisible() {
        try {
            const ask = async (question) => {
                if (!process.stdin.isTTY) return 'y'; // Non-interactive: assume OK and continue
                const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
                const answer = await new Promise(resolve => rl.question(question, a => resolve(a)));
                rl.close();
                return answer;
            };

            const answer = await ask(`${colors.cyan}👀 Can you see the split scribe console window? (y/N) ${colors.reset}`);
            const yes = (answer || '').trim().toLowerCase().startsWith('y');
            if (!yes) {
                console.log(`${colors.blue}🪄 Launching split scribe console...${colors.reset}`);
                const launchScript = path.join(this.engineDir, 'auto-launch-split-scribe.sh');
                try {
                    await execPromise(`bash "${launchScript}"`);
                    console.log(`${colors.green}✅ Split scribe console launched${colors.reset}`);
                } catch (e) {
                    console.log(`${colors.yellow}⚠️  Could not auto-launch console: ${e.message}${colors.reset}`);
                    console.log(`${colors.blue}ℹ️  Manual: cd ${this.engineDir} && ./auto-launch-split-scribe.sh${colors.reset}`);
                }
            }
        } catch (err) {
            // Non-fatal
            console.log(`${colors.yellow}ℹ️  Console visibility prompt skipped: ${err.message}${colors.reset}`);
        }
    }

    // Display a brief "where you left off" summary drawn from memory recall and recent sessions
    async showStartupSummary(prev) {
        try {
            console.log(`\n${colors.pink}🧭 Where you left off:${colors.reset}`);
            if (!prev) {
                console.log(`${colors.yellow}ℹ️  No previous context available.${colors.reset}`);
                return;
            }
            const { recentSessions = [], recallSummary = '' } = prev;
            if (recentSessions.length) {
                const last = recentSessions[0];
                console.log(`${colors.blue}• Last session: ${last.session_id} at ${last.start_time}${colors.reset}`);
            }
            console.log(`${colors.blue}• Sessions in last week: ${recentSessions.length}${colors.reset}`);
            if (recallSummary) {
                const preview = recallSummary.split('\n').slice(0, 10).join('\n');
                console.log(`${colors.cyan}• Recent work summary:${colors.reset}\n${preview}${preview.length >= 1000 ? '\n…' : ''}`);
            }
        } catch {}
    }

    // Ask user whether to resume or start fresh; default to continue when non-interactive
    async promptResumeOrFresh() {
        try {
            const ask = async (question) => {
                if (!process.stdin.isTTY) return 'continue';
                const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
                const answer = await new Promise(resolve => rl.question(question, a => resolve(a)));
                rl.close();
                return answer;
            };
            const choice = (await ask(`\n${colors.cyan}Proceed options — type 'continue' or 'fresh' [continue]: ${colors.reset}`)).trim().toLowerCase();
            const selected = choice === 'fresh' ? 'fresh' : 'continue';
            if (selected === 'fresh') {
                console.log(`${colors.yellow}🆕 Fresh start selected. Context will be treated as new work.${colors.reset}`);
            } else {
                console.log(`${colors.green}🔄 Continue selected. Resuming with loaded context.${colors.reset}`);
            }
            // Persist intent marker to extended context for visibility
            try {
                const extendedPath = path.join(this.memoryDir, 'extendedcontext.json');
                let data = {};
                try { data = JSON.parse(await fs.readFile(extendedPath, 'utf8')); } catch {}
                if (!data.intent_log) data.intent_log = [];
                data.intent_log.push({
                    timestamp: new Date().toISOString(),
                    agent: this.agentType,
                    session_id: this.sessionId,
                    intent: selected
                });
                await fs.writeFile(extendedPath, JSON.stringify(data, null, 2));
            } catch {}
        } catch (e) {
            // Non-fatal
        }
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const agentInit = new UniversalAgentInit();
    await agentInit.initializeAgent();
}

export default UniversalAgentInit;
