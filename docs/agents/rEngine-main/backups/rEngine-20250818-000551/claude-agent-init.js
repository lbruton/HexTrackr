#!/usr/bin/env node

/**
 * Claude Agent Initialization System
 * Creates session-specific memory, activates MCP servers, shows memory status
 */

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

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

class ClaudeAgentInit {
    constructor() {
        this.baseDir = path.dirname(__dirname);
        this.memoryDir = path.join(this.baseDir, 'rMemory', 'rAgentMemories');
        this.sessionId = `claude-session-${Date.now()}`;
        this.agentName = "Claude 3.5 Sonnet";
        this.sessionMemoryFile = `claude_35_sonnet_session_${new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]}_${Date.now()}.json`;
        this.sessionMemoryPath = path.join(this.memoryDir, this.sessionMemoryFile);
    }

    async init() {
        console.log(`${colors.cyan}
╔══════════════════════════════════════════════════════════════════════╗
║                🧠 Claude Agent Memory System Initialization 🧠        ║
║                                                                      ║
║    Activating MCP Integration & Session-Specific Memory Files       ║
╚══════════════════════════════════════════════════════════════════════╝${colors.reset}\n`);

        // 1. Check previous work and show summary
        await this.showPreviousWorkSummary();

        // 2. Ask if we should continue or start fresh
        const shouldContinue = await this.askContinueOrFresh();

        // 3. Check MCP server status
        await this.checkMCPStatus();

        // 4. Create session-specific memory file
        await this.createSessionMemory();

        // 5. Request git save
        await this.requestGitSave();

        // 6. Show active memory files
        await this.showActiveMemoryFiles();

        return shouldContinue;
    }

    async showPreviousWorkSummary() {
        console.log(`${colors.blue}📋 Retrieving previous work summary...${colors.reset}`);
        
        try {
            // Read extended context for recent work
            const extendedContextPath = path.join(this.memoryDir, 'extendedcontext.json');
            const extendedContext = JSON.parse(await fs.readFile(extendedContextPath, 'utf8'));
            
            const today = new Date().toISOString().split('T')[0];
            const todaySessions = extendedContext.sessions?.[today] || [];
            
            if (todaySessions.length > 0) {
                console.log(`${colors.green}✅ Recent Work Found (${today}):${colors.reset}`);
                todaySessions.slice(-3).forEach((session, index) => {
                    console.log(`   ${index + 1}. ${session.summary}`);
                    if (session.key_events?.length > 0) {
                        console.log(`      Last: ${session.key_events[session.key_events.length - 1].message}`);
                    }
                });
            } else {
                console.log(`${colors.yellow}⚠️  No recent work found for today${colors.reset}`);
            }

            // Show last few git commits
            try {
                const gitLog = await execPromise('git log --oneline -3');
                console.log(`\n${colors.cyan}📦 Recent Git History:${colors.reset}`);
                gitLog.stdout.split('\n').filter(line => line.trim()).forEach(line => {
                    console.log(`   ${line}`);
                });
            } catch (error) {
                console.log(`${colors.yellow}⚠️  Could not retrieve git history${colors.reset}`);
            }

        } catch (error) {
            console.log(`${colors.yellow}⚠️  Could not load previous work summary: ${error.message}${colors.reset}`);
        }
    }

    async askContinueOrFresh() {
        console.log(`\n${colors.pink}🤔 How should we proceed?${colors.reset}`);
        console.log(`${colors.blue}1.${colors.reset} Continue where we left off`);
        console.log(`${colors.blue}2.${colors.reset} Start fresh session`);
        console.log(`${colors.blue}3.${colors.reset} Show detailed memory review`);
        
        // For automation, we'll default to continue but show the options
        console.log(`${colors.cyan}💡 [Auto-selecting: Continue where we left off]${colors.reset}`);
        return 'continue';
    }

    async checkMCPStatus() {
        console.log(`\n${colors.blue}🔌 Checking MCP Server Status...${colors.reset}`);
        
        try {
            const mcpProcesses = await execPromise('ps aux | grep -i mcp | grep -v grep');
            const processes = mcpProcesses.stdout.split('\n').filter(line => line.includes('mcp'));
            
            if (processes.length > 0) {
                console.log(`${colors.green}✅ MCP Servers Active:${colors.reset}`);
                processes.forEach(proc => {
                    if (proc.includes('mcp-server-memory')) {
                        console.log(`   🧠 Memory Server: Running`);
                    }
                    if (proc.includes('rEngine') || proc.includes('index.js')) {
                        console.log(`   🔧 rEngine Server: Running`);
                    }
                });
            } else {
                console.log(`${colors.yellow}⚠️  No MCP servers detected, starting them...${colors.reset}`);
                await this.startMCPServers();
            }
        } catch (error) {
            console.log(`${colors.yellow}⚠️  MCP server check inconclusive${colors.reset}`);
        }
    }

    async startMCPServers() {
        try {
            console.log(`${colors.cyan}🚀 Starting MCP servers...${colors.reset}`);
            await execPromise('bash start-mcp-servers.sh');
            console.log(`${colors.green}✅ MCP servers started${colors.reset}`);
        } catch (error) {
            console.log(`${colors.red}❌ Failed to start MCP servers: ${error.message}${colors.reset}`);
        }
    }

    async createSessionMemory() {
        console.log(`\n${colors.blue}📝 Creating session-specific memory file...${colors.reset}`);
        
        const sessionMemory = {
            metadata: {
                agent_name: this.agentName,
                session_id: this.sessionId,
                start_time: new Date().toISOString(),
                memory_file: this.sessionMemoryFile,
                base_memory: "claude_sonnet_memories.json"
            },
            session_context: {
                working_on: "StackTrackr ecosystem development",
                focus_areas: ["Memory system optimization", "Agent protocols", "MCP integration"],
                previous_session_summary: "Fixed popup issues and GPT protocol enforcement"
            },
            active_memory_files: {
                session_memory: this.sessionMemoryPath,
                extended_context: path.join(this.memoryDir, 'extendedcontext.json'),
                agent_memories: path.join(this.memoryDir, 'claude_sonnet_memories.json'),
                tasks: path.join(this.memoryDir, 'tasks.json'),
                decisions: path.join(this.memoryDir, 'decisions.json')
            },
            mcp_integration: {
                memory_server_active: true,
                last_memory_sync: new Date().toISOString(),
                notifications_enabled: true
            },
            session_log: [
                {
                    timestamp: new Date().toISOString(),
                    action: "session_start",
                    message: "Claude 3.5 Sonnet session initialized with MCP memory integration"
                }
            ]
        };

        try {
            await fs.writeFile(this.sessionMemoryPath, JSON.stringify(sessionMemory, null, 2));
            console.log(`${colors.green}✅ Session memory created: ${this.sessionMemoryFile}${colors.reset}`);
            console.log(`${colors.cyan}📍 Memory file: ${this.sessionMemoryPath}${colors.reset}`);
        } catch (error) {
            console.log(`${colors.red}❌ Failed to create session memory: ${error.message}${colors.reset}`);
        }
    }

    async requestGitSave() {
        console.log(`\n${colors.yellow}💾 Git Checkpoint Recommended${colors.reset}`);
        console.log(`${colors.blue}Before we continue, let's save current progress to git...${colors.reset}`);
        
        try {
            // Check if there are changes to commit
            const status = await execPromise('git status --porcelain');
            if (status.stdout.trim()) {
                console.log(`${colors.cyan}📦 Changes detected, creating git checkpoint...${colors.reset}`);
                await execPromise('git add -A');
                await execPromise(`git commit -m "Claude session start checkpoint - ${new Date().toISOString()}"`);
                console.log(`${colors.green}✅ Git checkpoint created${colors.reset}`);
            } else {
                console.log(`${colors.green}✅ Working directory clean, no git save needed${colors.reset}`);
            }
        } catch (error) {
            console.log(`${colors.yellow}⚠️  Git checkpoint failed: ${error.message}${colors.reset}`);
        }
    }

    async showActiveMemoryFiles() {
        console.log(`\n${colors.pink}🗂️  Active Memory Files (These will show MCP notifications):${colors.reset}`);
        
        const memoryFiles = [
            { name: 'Session Memory', path: this.sessionMemoryFile, purpose: 'Current session tracking' },
            { name: 'Extended Context', path: 'extendedcontext.json', purpose: 'Cross-session memory' },
            { name: 'Agent Memory', path: 'claude_sonnet_memories.json', purpose: 'Claude-specific memories' },
            { name: 'Tasks', path: 'tasks.json', purpose: 'Active tasks and goals' },
            { name: 'Decisions', path: 'decisions.json', purpose: 'Architectural decisions' }
        ];

        for (const file of memoryFiles) {
            const fullPath = path.join(this.memoryDir, file.path);
            try {
                const stats = await fs.stat(fullPath);
                const lastModified = stats.mtime.toISOString().split('T')[0];
                console.log(`${colors.green}✅ ${file.name}${colors.reset}`);
                console.log(`   📁 ${file.path}`);
                console.log(`   📝 ${file.purpose}`);
                console.log(`   🕒 Last modified: ${lastModified}`);
                console.log('');
            } catch (error) {
                console.log(`${colors.red}❌ ${file.name}: File not found${colors.reset}`);
            }
        }

        console.log(`${colors.cyan}💡 You should see MCP notifications when I read/write these files!${colors.reset}`);
    }

    async logToSession(action, message) {
        try {
            const sessionMemory = JSON.parse(await fs.readFile(this.sessionMemoryPath, 'utf8'));
            sessionMemory.session_log.push({
                timestamp: new Date().toISOString(),
                action,
                message
            });
            await fs.writeFile(this.sessionMemoryPath, JSON.stringify(sessionMemory, null, 2));
        } catch (error) {
            console.log(`${colors.yellow}⚠️  Failed to log to session: ${error.message}${colors.reset}`);
        }
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const agent = new ClaudeAgentInit();
    const result = await agent.init();
    
    console.log(`\n${colors.green}🚀 Claude Agent Ready!${colors.reset}`);
    console.log(`${colors.blue}Session ID: ${agent.sessionId}${colors.reset}`);
    console.log(`${colors.blue}Memory File: ${agent.sessionMemoryFile}${colors.reset}`);
    console.log(`${colors.pink}Next: You should see MCP notifications as I work with memory files!${colors.reset}\n`);
}

export default ClaudeAgentInit;
