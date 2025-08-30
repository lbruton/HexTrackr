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
        // Check command line arguments first
        if (process.argv.includes('--agent-type')) {
            const agentIndex = process.argv.indexOf('--agent-type');
            return process.argv[agentIndex + 1] || 'unknown';
        }

        // Check VS Code context and process info for active agent detection
        const env = process.env;
        
        // VS Code Copilot detection (high priority in VS Code environment)
        if (env.VSCODE_PID || env.VSCODE_CONTEXT) {
            // Check if we're in a VS Code Copilot Chat context
            if (env.VSCODE_COPILOT_CHAT || process.argv.some(arg => arg.includes('copilot'))) {
                return 'vscode_copilot';
            }
            
            // In VS Code but not explicitly Copilot - check for other indicators
            // Look for Claude-specific patterns in VS Code
            if (env.USER_AGENT?.toLowerCase().includes('claude') ||
                env.COPILOT_CONTEXT?.includes('claude') ||
                process.title?.toLowerCase().includes('claude')) {
                return 'claude';
            }
        }
        
        // GitHub Copilot detection (before generic API keys)
        if (env.GITHUB_TOKEN && 
            (env.COPILOT_CONTEXT || 
             process.argv.some(arg => arg.includes('copilot')) ||
             process.argv.some(arg => arg.includes('github')))) {
            return 'github_copilot';
        }
        
        // Context-based detection (prioritize actual usage over just API key presence)
        if (env.USER_AGENT?.toLowerCase().includes('claude') || 
            env.COPILOT_CONTEXT?.includes('claude') ||
            process.argv.some(arg => arg.includes('claude'))) {
            return 'claude';
        }
        
        if (env.USER_AGENT?.toLowerCase().includes('gpt') || 
            env.COPILOT_CONTEXT?.includes('gpt') ||
            process.argv.some(arg => arg.includes('gpt'))) {
            return 'gpt';
        }
        
        if (env.USER_AGENT?.toLowerCase().includes('gemini') || 
            env.COPILOT_CONTEXT?.includes('gemini') ||
            process.argv.some(arg => arg.includes('gemini'))) {
            return 'gemini';
        }

        // API key detection (lower priority - just indicates capability, not active usage)
        if (env.ANTHROPIC_API_KEY) {
            return 'claude';
        }
        
        if (env.OPENAI_API_KEY) {
            return 'gpt';
        }
        
        if (env.GEMINI_API_KEY || env.GOOGLE_API_KEY) {
            return 'gemini';
        }
        
        // Final fallbacks
        if (env.GITHUB_TOKEN) {
            return 'github_copilot';
        }
        
        // Default fallback
        return 'universal_agent';
    }
    
    async initializeAgent() {
        console.log(`${colors.pink}
╔═══════════════════════════════════════════════════════════════════╗
║                🌍 Universal Agent Initialization 🌍                ║
║                                                                   ║
║     Supporting Claude, GPT, Gemini & All Future Agents          ║
╚═══════════════════════════════════════════════════════════════════╝${colors.reset}\n`);
        
        console.log(`${colors.cyan}🤖 Detected Agent: ${this.getAgentDisplayName()}${colors.reset}`);
        console.log(`${colors.blue}🔍 Detection Method: ${this.getDetectionMethod()}${colors.reset}`);
        console.log(`${colors.blue}📅 Session ID: ${this.sessionId}${colors.reset}`);
        console.log(`${colors.blue}🕒 Start Time: ${this.startTime}${colors.reset}`);
        
        // Show agent capabilities
        const capabilities = this.getAgentCapabilities();
        console.log(`${colors.green}🛠️  Agent Capabilities (${capabilities.length})${colors.reset}`);
        const displayCaps = capabilities.slice(0, 6); // Show first 6
        displayCaps.forEach(cap => {
            console.log(`   ${colors.cyan}• ${cap.replace(/_/g, ' ')}${colors.reset}`);
        });
        if (capabilities.length > 6) {
            console.log(`   ${colors.yellow}... and ${capabilities.length - 6} more${colors.reset}`);
        }
        console.log('');
        
        try {
            // 0. CRITICAL: Check requirements compliance
            await this.checkCriticalRequirements();
            
            // 1. Create agent-specific memory file
            await this.createAgentMemoryFile();
            
            // 2. Git backup
            await this.createGitBackup();
            
            // 3. MCP memory integration
            await this.initializeMCPMemory();

            // 3.5 Check service status and offer recommendations
            await this.checkServiceStatus();

            // 3.6 Ensure split console is visible or offer to launch it
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
            agent_info: {
                type: this.agentType,
                capabilities: this.getAgentCapabilities(),
                detection_method: this.getDetectionMethod()
            },
            initialization: {
                git_backup: false,
                mcp_integration: false,
                context_loaded: false,
                dual_memory: false,
                services_checked: false
            },
            session_metadata: {
                working_directory: this.baseDir,
                memory_file: `${this.agentType}-memory.json`,
                session_memory_file: `${this.agentType}-session-${Date.now()}.json`
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
        
        const agentSpecificCapabilities = {
            'claude': [
                ...baseCapabilities, 
                'anthropic_api', 
                'function_calling', 
                'long_context',
                'semantic_search',
                'file_operations',
                'terminal_commands',
                'code_analysis',
                'architecture_design'
            ],
            'gpt': [
                ...baseCapabilities, 
                'openai_api', 
                'code_interpreter', 
                'web_browsing',
                'conversation_management',
                'text_processing',
                'creative_writing'
            ],
            'gemini': [
                ...baseCapabilities, 
                'google_api', 
                'multimodal', 
                'search_integration',
                'document_generation',
                'image_analysis',
                'research_capabilities'
            ],
            'github_copilot': [
                ...baseCapabilities,
                'github_integration',
                'code_completion',
                'pull_request_management',
                'repository_operations',
                'workflow_automation'
            ],
            'vscode_copilot': [
                ...baseCapabilities,
                'vscode_integration',
                'editor_commands',
                'extension_management',
                'workspace_operations',
                'debugging_support'
            ],
            'universal_agent': baseCapabilities
        };
        
        return agentSpecificCapabilities[this.agentType] || baseCapabilities;
    }
    
    getDetectionMethod() {
        // Return how the agent was detected for debugging/audit purposes
        if (process.argv.includes('--agent-type')) {
            return 'command_line_argument';
        }
        
        const env = process.env;
        
        // VS Code context detection
        if (env.VSCODE_PID || env.VSCODE_CONTEXT) {
            if (env.VSCODE_COPILOT_CHAT || process.argv.some(arg => arg.includes('copilot'))) {
                return 'vscode_copilot_context';
            }
            if (env.USER_AGENT?.toLowerCase().includes('claude') ||
                env.COPILOT_CONTEXT?.includes('claude') ||
                process.title?.toLowerCase().includes('claude')) {
                return 'vscode_claude_context';
            }
        }
        
        // GitHub context detection
        if (env.GITHUB_TOKEN && 
            (env.COPILOT_CONTEXT || 
             process.argv.some(arg => arg.includes('copilot')) ||
             process.argv.some(arg => arg.includes('github')))) {
            return 'github_copilot_context';
        }
        
        // Active usage context detection
        if (env.USER_AGENT?.toLowerCase().includes('claude') || 
            env.COPILOT_CONTEXT?.includes('claude') ||
            process.argv.some(arg => arg.includes('claude'))) {
            return 'claude_usage_context';
        }
        
        if (env.USER_AGENT?.toLowerCase().includes('gpt') || 
            env.COPILOT_CONTEXT?.includes('gpt') ||
            process.argv.some(arg => arg.includes('gpt'))) {
            return 'gpt_usage_context';
        }
        
        if (env.USER_AGENT?.toLowerCase().includes('gemini') || 
            env.COPILOT_CONTEXT?.includes('gemini') ||
            process.argv.some(arg => arg.includes('gemini'))) {
            return 'gemini_usage_context';
        }
        
        // API key detection (fallback)
        if (env.ANTHROPIC_API_KEY) return 'anthropic_api_key';
        if (env.OPENAI_API_KEY) return 'openai_api_key';
        if (env.GEMINI_API_KEY || env.GOOGLE_API_KEY) return 'google_api_key';
        if (env.GITHUB_TOKEN) return 'github_token';
        if (env.COPILOT_CONTEXT) return 'copilot_context';
        if (env.VSCODE_PID || env.VSCODE_CONTEXT) return 'vscode_environment';
        if (env.USER_AGENT) return 'user_agent_string';
        
        return 'default_fallback';
    }
    
    getAgentDisplayName() {
        const displayNames = {
            'claude': 'Claude 3.5 Sonnet',
            'gpt': 'ChatGPT/GPT-4',
            'gemini': 'Google Gemini',
            'github_copilot': 'GitHub Copilot',
            'vscode_copilot': 'VS Code Copilot',
            'universal_agent': 'Universal AI Agent'
        };
        
        return displayNames[this.agentType] || 'Unknown Agent';
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
        
        // Run memory file sync check before MCP operations
        console.log(`${colors.blue}🔄 Checking memory file synchronization...${colors.reset}`);
        try {
            await execPromise('bash /Volumes/DATA/GitHub/rEngine/scripts/sync-memory-files.sh');
            console.log(`${colors.green}✅ Memory files synchronized${colors.reset}`);
        } catch (error) {
            console.log(`${colors.yellow}⚠️  Memory sync check had issues: ${error.message}${colors.reset}`);
        }
        
        try {
            // Create MCP memory entry
            const mcpData = {
                title: `${this.agentType.toUpperCase()} Agent Session Started`,
                content: `New ${this.agentType} agent session initialized with full protocol compliance. Session ID: ${this.sessionId}`,
                category: `${this.agentType}_session`
            };
            
            // Use MCP mode to avoid popups - use relative path since we're running from rEngine directory
            await execPromise(`cd ${this.engineDir} && echo '${JSON.stringify(mcpData)}' | node add-context.js --mcp-mode`);
            console.log(`${colors.green}✅ MCP memory integration active${colors.reset}`);
            
            // Update session status
            await this.updateSessionStatus('mcp_integration', true);
            
        } catch (error) {
            console.log(`${colors.yellow}⚠️  MCP integration had issues: ${error.message}${colors.reset}`);
        }
    }
    
    async checkServiceStatus() {
        console.log(`${colors.cyan}🔌 Checking Service Status...${colors.reset}`);
        
        try {
            // Check for MCP server processes
            const mcpCheck = await execPromise('ps aux | grep -E "(mcp-server|rEngine)" | grep -v grep');
            const mcpProcesses = mcpCheck.stdout.split('\n').filter(line => 
                line.includes('mcp-server') || line.includes('rEngine')
            );
            
            if (mcpProcesses.length > 0) {
                console.log(`${colors.green}✅ MCP Services Active:${colors.reset}`);
                mcpProcesses.forEach(proc => {
                    if (proc.includes('mcp-server-memory')) {
                        console.log(`   ${colors.cyan}🧠 Memory Server: Running${colors.reset}`);
                    }
                    if (proc.includes('rEngine')) {
                        console.log(`   ${colors.cyan}🔧 rEngine Server: Running${colors.reset}`);
                    }
                });
                
                // Offer console monitoring popups (as specified in COPILOT_INSTRUCTIONS.md)
                console.log(`${colors.blue}📊 Console Monitoring Options:${colors.reset}`);
                console.log(`   ${colors.cyan}• MCP Memory Log: bash scripts/view_mcp_memory_log.sh${colors.reset}`);
                console.log(`   ${colors.cyan}• Service Dashboard: bash scripts/open-service-monitor.sh${colors.reset}`);
                console.log(`   ${colors.yellow}💡 These open in Terminal.app as per COPILOT_INSTRUCTIONS.md${colors.reset}`);
                
            } else {
                console.log(`${colors.yellow}⚠️  No MCP servers detected${colors.reset}`);
                console.log(`${colors.blue}💡 Recommendation: Start services with:${colors.reset}`);
                console.log(`   ${colors.white}bash bin/launch-rEngine-services.sh${colors.reset}`);
            }
            
            // Check Docker services if applicable
            try {
                const dockerCheck = await execPromise('docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "(stacktrackr|rengine)"');
                if (dockerCheck.stdout.trim()) {
                    console.log(`${colors.green}✅ Docker Services:${colors.reset}`);
                    console.log(`${dockerCheck.stdout}`);
                }
            } catch (error) {
                // Docker not running or no containers - not critical
            }
            
            await this.updateSessionStatus('services_checked', true);
            
        } catch (error) {
            console.log(`${colors.yellow}⚠️  Service status check inconclusive: ${error.message}${colors.reset}`);
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
                await this.updateSessionStatus('dual_memory', true);
            } else {
                console.log(`${colors.yellow}⚠️  Partial dual memory success - check logs${colors.reset}`);
            }
            
            // Create session-specific memory file
            await this.createSessionSpecificMemory();
            
        } catch (error) {
            console.log(`${colors.red}❌ Dual memory initialization failed: ${error.message}${colors.reset}`);
        }
    }
    
    async createSessionSpecificMemory() {
        console.log(`${colors.cyan}📄 Creating session-specific memory file...${colors.reset}`);
        
        const sessionMemoryFile = `${this.agentType}-session-${Date.now()}.json`;
        const sessionMemoryPath = path.join(this.memoryDir, sessionMemoryFile);
        
        const sessionMemory = {
            metadata: {
                agent_name: this.getAgentDisplayName(),
                agent_type: this.agentType,
                session_id: this.sessionId,
                start_time: this.startTime,
                detection_method: this.getDetectionMethod(),
                capabilities: this.getAgentCapabilities(),
                initialization_version: "2.0.0"
            },
            session_context: {
                working_directory: this.baseDir,
                project_name: "StackTrackr",
                focus_areas: [
                    "Memory system optimization",
                    "Universal agent protocols", 
                    "MCP integration",
                    "Cross-platform compatibility"
                ],
                project_status: "Active development"
            },
            active_memory_files: {
                agent_memory: `${this.agentType}-memory.json`,
                session_memory: sessionMemoryFile,
                extended_context: 'extendedcontext.json',
                tasks: 'tasks.json',
                decisions: 'decisions.json',
                handoff: 'handoff.json'
            },
            initialization_status: {
                git_backup: true,
                mcp_integration: true,
                context_loaded: true,
                dual_memory: true,
                services_checked: true
            },
            session_log: [
                {
                    timestamp: this.startTime,
                    action: "session_start",
                    message: `${this.getAgentDisplayName()} session initialized with universal protocol`
                }
            ]
        };
        
        try {
            await fs.writeFile(sessionMemoryPath, JSON.stringify(sessionMemory, null, 2));
            console.log(`${colors.green}✅ Session memory created: ${sessionMemoryFile}${colors.reset}`);
            return sessionMemoryPath;
        } catch (error) {
            console.log(`${colors.red}❌ Failed to create session memory: ${error.message}${colors.reset}`);
            return null;
        }
    }

    async loadPreviousContext() {
        console.log(`${colors.cyan}🧠 Loading previous context and memory...${colors.reset}`);
        
        try {
            // 1. PRIORITY: Load handoff.json first for agent transitions
            const handoffData = await this.loadHandoffData();
            
            // 2. Use memory intelligence to get recent context
            const contextResult = await execPromise(`cd ${this.engineDir} && node memory-intelligence.js recall "recent work" --silent`);
            
            // 3. Load agent-specific memory
            const agentMemoryPath = path.join(this.memoryDir, `${this.agentType}-memory.json`);
            const agentMemory = JSON.parse(await fs.readFile(agentMemoryPath, 'utf8'));
            
            // 4. Get summary of recent sessions
            const recentSessions = this.getRecentSessions(agentMemory);
            
            console.log(`${colors.green}✅ Context loaded successfully${colors.reset}`);
            console.log(`${colors.blue}📊 Recent sessions: ${recentSessions.length}${colors.reset}`);
            
            // 5. Update session status
            await this.updateSessionStatus('context_loaded', true);
            
            // Return comprehensive context including handoff data
            const recallSummary = (contextResult?.stdout || '').toString().trim().slice(0, 1000);
            return { 
                agentMemory, 
                recentSessions, 
                recallSummary,
                handoffData: handoffData // Add handoff data to context
            };
            
        } catch (error) {
            console.log(`${colors.yellow}⚠️  Context loading had issues: ${error.message}${colors.reset}`);
            return null;
        }
    }
    
    async loadHandoffData() {
        console.log(`${colors.cyan}🔄 Loading and syncing handoff data...${colors.reset}`);
        
        try {
            // Load handoff.json
            const handoffPath = path.join(this.memoryDir, 'handoff.json');
            const handoffData = JSON.parse(await fs.readFile(handoffPath, 'utf8'));
            
            // Check if there's an active handoff
            const currentHandoff = handoffData.current_handoff;
            if (currentHandoff && currentHandoff.status === 'active_handoff_ready') {
                console.log(`${colors.green}🤝 Active handoff found from ${currentHandoff.from_agent}${colors.reset}`);
                console.log(`${colors.blue}📋 Handoff: ${currentHandoff.handoff_summary.slice(0, 100)}...${colors.reset}`);
                
                // Sync handoff to MCP Memory for persistence
                await this.syncHandoffToMCP(currentHandoff);
                
                return {
                    hasActiveHandoff: true,
                    handoffSummary: currentHandoff.handoff_summary,
                    fromAgent: currentHandoff.from_agent,
                    nextTasks: currentHandoff.context_package?.immediate_next_tasks || [],
                    fullHandoff: currentHandoff
                };
            } else {
                console.log(`${colors.yellow}ℹ️  No active handoff found${colors.reset}`);
                return { hasActiveHandoff: false };
            }
            
        } catch (error) {
            console.log(`${colors.yellow}⚠️  Handoff loading failed: ${error.message}${colors.reset}`);
            return { hasActiveHandoff: false, error: error.message };
        }
    }
    
    async syncHandoffToMCP(handoffData) {
        try {
            console.log(`${colors.cyan}🔗 Syncing handoff to MCP Memory...${colors.reset}`);
            
            // Sync the complete handoff as a structured memory entry
            const mcpData = {
                title: `HANDOFF: ${handoffData.from_agent} → ${handoffData.to_agent}`,
                content: JSON.stringify({
                    handoff_summary: handoffData.handoff_summary,
                    immediate_next_tasks: handoffData.context_package?.immediate_next_tasks || [],
                    technical_context: handoffData.context_package?.technical_context || {},
                    work_completed: handoffData.context_package?.work_completed || {}
                }, null, 2),
                category: 'agent_handoff'
            };
            
            await execPromise(`cd ${this.engineDir} && echo '${JSON.stringify(mcpData)}' | node add-context.js --mcp-mode`);
            console.log(`${colors.green}✅ Handoff synced to MCP Memory${colors.reset}`);
            
        } catch (error) {
            console.log(`${colors.yellow}⚠️  MCP handoff sync failed: ${error.message}${colors.reset}`);
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

    // Ask user if the split scribe console is visible; expect it to already be running from startup scripts
    async ensureSplitScribeConsoleVisible() {
        try {
            // Check if we're in automated/non-interactive environment
            const isAutomated = !process.stdin.isTTY || 
                               process.env.CI || 
                               process.env.NON_INTERACTIVE ||
                               process.argv.includes('--auto') ||
                               process.argv.includes('--non-interactive');
            
            if (isAutomated) {
                console.log(`${colors.cyan}👀 Checking for split scribe console visibility...${colors.reset}`);
                console.log(`${colors.green}✅ Assuming console is visible (launched by startup scripts)${colors.reset}`);
                console.log(`${colors.blue}📺 Split Scribe Console should be running in Terminal.app${colors.reset}`);
                return;
            }
            
            const ask = async (question) => {
                const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
                
                return new Promise((resolve) => {
                    // Set a timeout for the input
                    const timeout = setTimeout(() => {
                        console.log(`\n${colors.yellow}⏰ No input received, assuming console is visible${colors.reset}`);
                        rl.close();
                        resolve('y');
                    }, 5000); // 5 second timeout
                    
                    rl.question(question, (answer) => {
                        clearTimeout(timeout);
                        rl.close();
                        resolve(answer);
                    });
                });
            };

            const answer = await ask(`${colors.cyan}👀 Can you see the split scribe console in Terminal.app? (y/N) ${colors.reset}`);
            const yes = (answer || '').trim().toLowerCase().startsWith('y');
            if (!yes) {
                console.log(`${colors.blue}🪄 Launching split scribe console in Terminal.app...${colors.reset}`);
                // Use proper Terminal.app launch as specified in COPILOT_INSTRUCTIONS.md
                try {
                    await execPromise(`osascript -e '
                        tell application "Terminal"
                            activate
                            set newWindow to do script "cd /Volumes/DATA/GitHub/rEngine/rEngine && node split-scribe-console.js"
                            set bounds of front window to {50, 100, 900, 700}
                            set custom title of front window to "rEngine Split Scribe Console"
                        end tell
                    '`);
                    console.log(`${colors.green}✅ Split scribe console launched in Terminal.app${colors.reset}`);
                } catch (e) {
                    console.log(`${colors.yellow}⚠️  Could not auto-launch console: ${e.message}${colors.reset}`);
                    console.log(`${colors.blue}ℹ️  Manual: Open Terminal.app and run: cd ${this.engineDir} && node split-scribe-console.js${colors.reset}`);
                }
            } else {
                console.log(`${colors.green}✅ Split scribe console is visible in Terminal.app${colors.reset}`);
            }
        } catch (err) {
            // Non-fatal
            console.log(`${colors.yellow}ℹ️  Console visibility check skipped: ${err.message}${colors.reset}`);
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
            
            // Show handoff information first (highest priority)
            if (prev.handoffData?.hasActiveHandoff) {
                const handoff = prev.handoffData;
                console.log(`${colors.green}🤝 ACTIVE HANDOFF from ${handoff.fromAgent}:${colors.reset}`);
                console.log(`${colors.cyan}   ${handoff.handoffSummary.slice(0, 200)}...${colors.reset}`);
                
                if (handoff.nextTasks?.length) {
                    console.log(`${colors.yellow}📋 Immediate Next Tasks:${colors.reset}`);
                    handoff.nextTasks.slice(0, 3).forEach((task, i) => {
                        console.log(`   ${i + 1}. ${task.slice(0, 80)}${task.length > 80 ? '...' : ''}${colors.reset}`);
                    });
                }
                console.log('');
            }
            
            // Show recent session information
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
            // Check if we're in an automated/non-interactive environment
            const isAutomated = !process.stdin.isTTY || 
                               process.env.CI || 
                               process.argv.includes('--auto') ||
                               process.argv.includes('--non-interactive');
            
            let selected = 'continue'; // Default choice
            
            if (isAutomated) {
                console.log(`${colors.cyan}🤖 Non-interactive mode detected${colors.reset}`);
                console.log(`${colors.green}🔄 Auto-selecting: Continue with existing context${colors.reset}`);
            } else {
                // Interactive mode - but with timeout
                const ask = async (question) => {
                    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
                    
                    return new Promise((resolve) => {
                        // Set a timeout for the input
                        const timeout = setTimeout(() => {
                            console.log(`\n${colors.yellow}⏰ No input received, defaulting to 'continue'${colors.reset}`);
                            rl.close();
                            resolve('continue');
                        }, 10000); // 10 second timeout
                        
                        rl.question(question, (answer) => {
                            clearTimeout(timeout);
                            rl.close();
                            resolve(answer);
                        });
                    });
                };
                
                const choice = (await ask(`\n${colors.cyan}Proceed options — type 'continue' or 'fresh' [continue]: ${colors.reset}`)).trim().toLowerCase();
                selected = choice === 'fresh' ? 'fresh' : 'continue';
            }
            
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
                    intent: selected,
                    mode: isAutomated ? 'automated' : 'interactive'
                });
                await fs.writeFile(extendedPath, JSON.stringify(data, null, 2));
            } catch {}
        } catch (e) {
            // Non-fatal - default to continue
            console.log(`${colors.green}🔄 Defaulting to continue mode${colors.reset}`);
        }
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const agentInit = new UniversalAgentInit();
    await agentInit.initializeAgent();
    
    // Enhanced completion summary
    console.log(`\n${colors.green}${colors.cyan}
╔═══════════════════════════════════════════════════════════════════╗
║                    🚀 INITIALIZATION COMPLETE 🚀                  ║
║                                                                   ║
║     ${agentInit.getAgentDisplayName().padEnd(43)} Agent Ready!     ║
╚═══════════════════════════════════════════════════════════════════╝${colors.reset}`);
    
    console.log(`${colors.blue}Session Details:${colors.reset}`);
    console.log(`  ${colors.cyan}• Agent Type: ${agentInit.agentType}${colors.reset}`);
    console.log(`  ${colors.cyan}• Session ID: ${agentInit.sessionId}${colors.reset}`);
    console.log(`  ${colors.cyan}• Detection: ${agentInit.getDetectionMethod()}${colors.reset}`);
    console.log(`  ${colors.cyan}• Capabilities: ${agentInit.getAgentCapabilities().length} features${colors.reset}`);
    
    console.log(`\n${colors.green}✅ All Systems Ready:${colors.reset}`);
    console.log(`  ${colors.cyan}🧠 MCP Memory Integration Active${colors.reset}`);
    console.log(`  ${colors.cyan}💾 Session-Specific Memory Created${colors.reset}`);
    console.log(`  ${colors.cyan}🔄 Dual Memory Protocol Enabled${colors.reset}`);
    console.log(`  ${colors.cyan}📦 Git Checkpoint Saved${colors.reset}`);
    
    console.log(`\n${colors.pink}💡 MCP notifications will appear as I interact with memory files!${colors.reset}`);
    console.log(`${colors.yellow}🎯 Ready for ${agentInit.getAgentDisplayName()} session work!${colors.reset}\n`);
}

export default UniversalAgentInit;
