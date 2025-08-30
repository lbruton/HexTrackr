#!/usr/bin/env node

/**
 * Agent Self-Management Protocol - Ensure agents follow memory contribution protocols
 * This should be run by every agent at startup and task completion
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

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

class AgentSelfManagement {
    constructor() {
        this.baseDir = path.dirname(__dirname);
        this.memoryDir = path.join(this.baseDir, 'rMemory', 'rAgentMemories');
        this.engineDir = path.join(this.baseDir, 'rEngine');
        
        // Short-term memory file for this agent session
        this.shortTermMemoryPath = path.join(this.memoryDir, 'agent-session-memory.json');
        this.persistentMemoryPath = path.join(this.engineDir, 'persistent-memory.json');
        this.extendedContextPath = path.join(this.memoryDir, 'extendedcontext.json');
        
        this.sessionId = `agent-session-${Date.now()}`;
        this.startTime = new Date().toISOString();
        
        this.taskCompletions = [];
        this.memoryContributions = [];
        this.gitBackups = [];
    }
    
    async startupCheck() {
        console.log(`${colors.cyan}🧠 Agent Self-Management: Startup Check${colors.reset}`);
        
        // 1. Check memory for recent tasks
        const recentTasks = await this.checkRecentTasks();
        
        // 2. Load short-term memory from last session
        const shortTermMemory = await this.loadShortTermMemory();
        
        // 3. Check git status and create backup if needed
        const gitStatus = await this.checkGitStatus();
        
        // 4. Initialize session tracking
        await this.initializeSession(recentTasks, shortTermMemory, gitStatus);
        
        console.log(`${colors.green}✅ Agent startup check complete${colors.reset}\n`);
        
        return {
            recentTasks,
            shortTermMemory,
            gitStatus,
            sessionId: this.sessionId
        };
    }
    
    async checkRecentTasks() {
        console.log(`${colors.blue}📋 Checking recent tasks...${colors.reset}`);
        
        try {
            // Check extended context for recent work
            const extendedContext = await fs.readFile(this.extendedContextPath, 'utf8');
            const context = JSON.parse(extendedContext);
            
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            
            const recentSessions = [];
            if (context.sessions) {
                if (context.sessions[today]) recentSessions.push(...context.sessions[today]);
                if (context.sessions[yesterday]) recentSessions.push(...context.sessions[yesterday]);
            }
            
            console.log(`${colors.yellow}  Found ${recentSessions.length} recent sessions${colors.reset}`);
            return recentSessions.slice(-5); // Last 5 sessions
            
        } catch (error) {
            console.log(`${colors.yellow}  ⚠️  Could not load recent tasks: ${error.message}${colors.reset}`);
            return [];
        }
    }
    
    async loadShortTermMemory() {
        console.log(`${colors.blue}🧮 Loading short-term memory...${colors.reset}`);
        
        try {
            const shortTerm = await fs.readFile(this.shortTermMemoryPath, 'utf8');
            const memory = JSON.parse(shortTerm);
            
            // Check if previous session had uncompleted tasks
            const incompleteTasks = memory.tasks?.filter(t => t.status !== 'completed') || [];
            
            if (incompleteTasks.length > 0) {
                console.log(`${colors.yellow}  ⚠️  Found ${incompleteTasks.length} incomplete tasks from previous session${colors.reset}`);
            } else {
                console.log(`${colors.green}  ✅ Previous session completed cleanly${colors.reset}`);
            }
            
            return memory;
            
        } catch (error) {
            console.log(`${colors.yellow}  ℹ️  No previous short-term memory found, starting fresh${colors.reset}`);
            return {
                sessions: [],
                tasks: [],
                contributions: [],
                created: this.startTime
            };
        }
    }
    
    async checkGitStatus() {
        console.log(`${colors.blue}📦 Checking git status...${colors.reset}`);
        
        try {
            const { stdout: status } = await execPromise('git status --porcelain', { 
                cwd: this.baseDir 
            });
            
            const hasChanges = status.trim().length > 0;
            
            if (hasChanges) {
                console.log(`${colors.yellow}  ⚠️  Uncommitted changes detected${colors.reset}`);
                
                // Should we create a backup commit?
                const changeCount = status.split('\n').filter(line => line.trim()).length;
                if (changeCount > 5) {
                    console.log(`${colors.red}    📊 ${changeCount} files changed - consider backup commit${colors.reset}`);
                }
            } else {
                console.log(`${colors.green}  ✅ Git working directory clean${colors.reset}`);
            }
            
            return {
                hasChanges,
                changeCount: hasChanges ? status.split('\n').filter(line => line.trim()).length : 0,
                needsBackup: hasChanges && status.split('\n').filter(line => line.trim()).length > 5
            };
            
        } catch (error) {
            console.log(`${colors.yellow}  ⚠️  Could not check git status: ${error.message}${colors.reset}`);
            return { hasChanges: false, changeCount: 0, needsBackup: false };
        }
    }
    
    async initializeSession(recentTasks, shortTermMemory, gitStatus) {
        console.log(`${colors.blue}🎯 Initializing agent session...${colors.reset}`);
        
        const sessionInit = {
            sessionId: this.sessionId,
            startTime: this.startTime,
            recentTasksFound: recentTasks.length,
            previousSessionStatus: shortTermMemory.tasks?.length > 0 ? 'had_tasks' : 'clean',
            gitStatus: gitStatus.hasChanges ? 'uncommitted_changes' : 'clean',
            memoryContributionPlan: 'active',
            gitBackupSchedule: gitStatus.needsBackup ? 'immediate' : 'on_task_completion'
        };
        
        // Add to extended context
        try {
            await execPromise(`node "${path.join(this.engineDir, 'add-context.js')}" "Agent Session Start" "Agent self-management initialization: ${JSON.stringify(sessionInit)}" "agent_session"`);
            console.log(`${colors.green}  ✅ Session initialization logged to extended context${colors.reset}`);
        } catch (error) {
            console.log(`${colors.yellow}  ⚠️  Could not log to extended context${colors.reset}`);
        }
        
        return sessionInit;
    }
    
    async logTaskCompletion(taskDescription, outcome, filesModified = []) {
        console.log(`${colors.cyan}📝 Logging task completion...${colors.reset}`);
        
        const completion = {
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            taskDescription,
            outcome,
            filesModified,
            duration: Date.now() - new Date(this.startTime).getTime()
        };
        
        this.taskCompletions.push(completion);
        
        // Update short-term memory
        await this.updateShortTermMemory();
        
        // Add to extended context
        try {
            await execPromise(`node "${path.join(this.engineDir, 'add-context.js')}" "Task Completed" "${taskDescription} - ${outcome}" "task_completion"`);
            console.log(`${colors.green}✅ Task completion logged to extended context${colors.reset}`);
        } catch (error) {
            console.log(`${colors.yellow}⚠️  Could not log task completion${colors.reset}`);
        }
        
        // Check if we should make a git backup
        await this.considerGitBackup(completion);
    }
    
    async updateShortTermMemory() {
        const shortTerm = {
            sessionId: this.sessionId,
            startTime: this.startTime,
            lastUpdate: new Date().toISOString(),
            taskCompletions: this.taskCompletions,
            memoryContributions: this.memoryContributions,
            gitBackups: this.gitBackups,
            status: 'active'
        };
        
        try {
            await fs.writeFile(this.shortTermMemoryPath, JSON.stringify(shortTerm, null, 2));
            console.log(`${colors.blue}💾 Short-term memory updated${colors.reset}`);
        } catch (error) {
            console.log(`${colors.red}❌ Failed to update short-term memory: ${error.message}${colors.reset}`);
        }
    }
    
    async considerGitBackup(completion) {
        // Create git backup if:
        // 1. Major files were modified (> 3 files)
        // 2. Critical system files were changed
        // 3. Multiple tasks completed (> 2)
        
        const shouldBackup = (
            completion.filesModified.length > 3 ||
            completion.filesModified.some(f => f.includes('bootstrap-config') || f.includes('memory-intelligence') || f.includes('agent-')) ||
            this.taskCompletions.length > 2
        );
        
        if (shouldBackup) {
            console.log(`${colors.yellow}🔄 Creating incremental git backup...${colors.reset}`);
            
            try {
                await execPromise('git add .', { cwd: this.baseDir });
                
                const commitMessage = `🤖 Agent incremental backup: ${completion.taskDescription.substring(0, 50)}
                
Task: ${completion.taskDescription}
Outcome: ${completion.outcome}
Files: ${completion.filesModified.join(', ')}
Session: ${this.sessionId}`;
                
                await execPromise(`git commit -m "${commitMessage}"`, { cwd: this.baseDir });
                
                const backup = {
                    timestamp: new Date().toISOString(),
                    reason: completion.taskDescription,
                    filesCount: completion.filesModified.length
                };
                
                this.gitBackups.push(backup);
                console.log(`${colors.green}✅ Git backup created successfully${colors.reset}`);
                
            } catch (error) {
                console.log(`${colors.red}❌ Git backup failed: ${error.message}${colors.reset}`);
            }
        }
    }
    
    async sessionCleanup() {
        console.log(`${colors.cyan}🧹 Agent session cleanup...${colors.reset}`);
        
        const sessionSummary = {
            sessionId: this.sessionId,
            startTime: this.startTime,
            endTime: new Date().toISOString(),
            duration: Date.now() - new Date(this.startTime).getTime(),
            tasksCompleted: this.taskCompletions.length,
            memoryContributions: this.memoryContributions.length,
            gitBackups: this.gitBackups.length,
            status: 'completed'
        };
        
        // Update short-term memory with final status
        await this.updateShortTermMemory();
        
        // Add session summary to extended context
        try {
            await execPromise(`node "${path.join(this.engineDir, 'add-context.js')}" "Agent Session Complete" "Session summary: ${JSON.stringify(sessionSummary)}" "agent_session"`);
            console.log(`${colors.green}✅ Session cleanup logged to extended context${colors.reset}`);
        } catch (error) {
            console.log(`${colors.yellow}⚠️  Could not log session cleanup${colors.reset}`);
        }
        
        console.log(`${colors.green}🎉 Agent session completed successfully${colors.reset}`);
        console.log(`${colors.blue}📊 Tasks: ${sessionSummary.tasksCompleted}, Backups: ${sessionSummary.gitBackups}, Duration: ${Math.round(sessionSummary.duration / 1000 / 60)}min${colors.reset}`);
        
        return sessionSummary;
    }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const agent = new AgentSelfManagement();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'startup':
            await agent.startupCheck();
            break;
            
        case 'task-complete':
            const task = process.argv[3] || 'Unknown task';
            const outcome = process.argv[4] || 'Completed';
            await agent.logTaskCompletion(task, outcome);
            break;
            
        case 'cleanup':
            await agent.sessionCleanup();
            break;
            
        default:
            console.log('Usage: node agent-self-management.js [startup|task-complete|cleanup]');
            console.log('  startup       - Check memory and git status on agent start');
            console.log('  task-complete - Log task completion with optional git backup');
            console.log('  cleanup       - End session and create summary');
    }
}

export default AgentSelfManagement;
