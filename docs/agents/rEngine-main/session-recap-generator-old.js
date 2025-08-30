#!/usr/bin/env node

/**
 * Session Recap Generator
 * 
 * Reads lastsession.json and generates a markdown recap for the user
 * Similar to the conversation summary system, but focused on session handoffs
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SessionRecapGenerator {
    constructor() {
        this.enginePath = process.cwd();
        this.sessionFile = path.join(this.enginePath, 'lastsession.json');
        this.outputFile = path.join(this.enginePath, 'SESSION_RECAP.md');
    }

    async generateRecap() {
        try {
            console.log('📋 Generating session recap from lastsession.json...');
            
            // Read the last session data
            const sessionData = await this.readSessionData();
            if (!sessionData) {
                console.log('❌ No session data found');
                return;
            }
            
            // Generate markdown content
            const markdown = this.createMarkdown(sessionData);
            
            // Write to file
            await fs.writeFile(this.outputFile, markdown, 'utf8');
            
            console.log(`✅ Session recap generated: ${this.outputFile}`);
            console.log(`📖 Last session: ${sessionData.summary?.mainObjective || 'Unknown objective'}`);
            
        } catch (error) {
            console.error(`❌ Failed to generate session recap: ${error.message}`);
        }
    }

    async readSessionData() {
        try {
            const content = await fs.readFile(this.sessionFile, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            console.log(`⚠️  No previous session data found (${error.message})`);
            return null;
        }
    }

    createMarkdown(sessionData) {
        const timestamp = new Date(sessionData.timestamp).toLocaleString();
        const session = sessionData.summary || {};
        const context = sessionData.context || {};
        const handoff = sessionData.handoff || {};
        
        return `# 📋 Last Session Recap

**Session ID:** \`${sessionData.sessionId}\`  
**Completed:** ${timestamp}  
**Status:** ${sessionData.status}

## 🎯 Main Objective
${session.mainObjective || 'No objective recorded'}

## ✅ Key Accomplishments
${session.keyAccomplishments ? session.keyAccomplishments.map(item => `- ${item}`).join('\n') : '- No accomplishments recorded'}

## 🔧 Technical Changes
${session.technicalChanges ? session.technicalChanges.map(item => `- ${item}`).join('\n') : '- No technical changes recorded'}

## 📂 Working Context
- **Directory:** \`${context.workingDirectory || 'Unknown'}\`
- **AI Model:** \`${context.aiModel || 'Not specified'}\`
- **Active Files:** ${context.activeFiles ? context.activeFiles.map(f => `\`${f}\``).join(', ') : 'None'}

## 🧠 Memory State
${context.memoryState ? Object.entries(context.memoryState).map(([key, value]) => `- **${key}:** ${value}`).join('\n') : '- No memory state recorded'}

## 🚀 Next Steps
${session.nextSteps ? session.nextSteps.map(item => `- [ ] ${item}`).join('\n') : '- No next steps defined'}

## 🔄 Handoff Information
${handoff.description ? `
**Type:** ${handoff.type}  
**Priority:** ${handoff.priority}  
**Description:** ${handoff.description}

**Required Context:**
${handoff.requiredContext ? handoff.requiredContext.map(item => `- ${item}`).join('\n') : '- No context specified'}
` : '- No handoff information'}

---
*Generated automatically by Session Recap Generator*  
*To update this recap, modify \`lastsession.json\` and run \`node session-recap-generator.js\`*
`;
    }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

class SessionRecapGenerator {
    constructor() {
        this.enginePath = process.cwd();
        this.memoryPath = path.join(this.enginePath, 'rMemory');
        this.logPath = path.join(this.enginePath, 'rLogs');
        this.outputFile = path.join(this.enginePath, 'SESSION_RECAP.md');
    }

    async generateRecap() {
        console.log('🔄 Generating session recap...');
        
        const recap = {
            timestamp: new Date().toISOString(),
            lastSession: await this.getLastSessionInfo(),
            recentCommits: await this.getRecentCommits(),
            memoryState: await this.getMemoryState(),
            systemState: await this.getSystemState(),
            activeProjects: await this.getActiveProjects(),
            nextActions: await this.suggestNextActions()
        };
        
        const markdown = this.formatAsMarkdown(recap);
        
        await fs.writeFile(this.outputFile, markdown, 'utf8');
        console.log(`✅ Session recap saved to: SESSION_RECAP.md`);
        
        return this.outputFile;
    }

    async getLastSessionInfo() {
        try {
            // Get last commit info
            const { stdout } = await execAsync('git log -1 --pretty=format:"%H|%ai|%s" 2>/dev/null || echo "No commits"');
            
            if (stdout.includes('|')) {
                const [hash, date, message] = stdout.split('|');
                return {
                    lastCommit: {
                        hash: hash.substring(0, 8),
                        date: new Date(date).toLocaleString(),
                        message: message
                    },
                    sessionGap: this.calculateTimeSince(new Date(date))
                };
            }
            
            return { lastCommit: null, sessionGap: 'Unknown' };
        } catch (error) {
            return { lastCommit: null, sessionGap: 'Error calculating' };
        }
    }

    async getRecentCommits() {
        try {
            const { stdout } = await execAsync('git log --oneline -5 2>/dev/null || echo "No commits"');
            return stdout.split('\n').filter(line => line.trim());
        } catch (error) {
            return ['Error fetching commits'];
        }
    }

    async getMemoryState() {
        try {
            const memoryFiles = await fs.readdir(this.memoryPath);
            const jsonFiles = memoryFiles.filter(f => f.endsWith('.json'));
            
            let totalConversations = 0;
            let lastActivity = null;
            
            // Check recent memory files
            for (const file of jsonFiles.slice(-3)) {
                try {
                    const filePath = path.join(this.memoryPath, file);
                    const stats = await fs.stat(filePath);
                    const content = await fs.readFile(filePath, 'utf8');
                    const data = JSON.parse(content);
                    
                    if (data.conversation) {
                        totalConversations++;
                    }
                    
                    if (!lastActivity || stats.mtime > lastActivity) {
                        lastActivity = stats.mtime;
                    }
                } catch {
                    // Skip invalid files
                }
            }
            
            return {
                memoryFiles: jsonFiles.length,
                totalConversations,
                lastActivity: lastActivity ? lastActivity.toLocaleString() : 'Unknown'
            };
        } catch (error) {
            return {
                memoryFiles: 0,
                totalConversations: 0,
                lastActivity: 'Error reading memory'
            };
        }
    }

    async getSystemState() {
        try {
            // Check if Docker containers are running
            const dockerStatus = await this.checkDockerStatus();
            
            // Check if Ollama is running
            const ollamaStatus = await this.checkOllamaStatus();
            
            // Check if enhanced scribe is configured
            const scribeStatus = await this.checkScribeStatus();
            
            return {
                docker: dockerStatus,
                ollama: ollamaStatus,
                scribe: scribeStatus,
                timestamp: new Date().toLocaleString()
            };
        } catch (error) {
            return {
                docker: 'Error checking',
                ollama: 'Error checking',
                scribe: 'Error checking',
                timestamp: new Date().toLocaleString()
            };
        }
    }

    async checkDockerStatus() {
        try {
            const { stdout } = await execAsync('docker ps --format "table {{.Names}}" 2>/dev/null || echo "Docker not running"');
            const containers = stdout.split('\n').filter(line => line.trim() && !line.includes('NAMES'));
            return containers.length > 0 ? `${containers.length} containers running` : 'No containers running';
        } catch {
            return 'Docker not available';
        }
    }

    async checkOllamaStatus() {
        try {
            const { stdout } = await execAsync('ollama list 2>/dev/null | grep -c qwen || echo "0"');
            const qwenModels = parseInt(stdout.trim());
            return qwenModels > 0 ? 'Qwen models available' : 'No Qwen models found';
        } catch {
            return 'Ollama not available';
        }
    }

    async checkScribeStatus() {
        try {
            const scribeFile = path.join(this.enginePath, 'enhanced-scribe-console.js');
            await fs.access(scribeFile);
            
            const content = await fs.readFile(scribeFile, 'utf8');
            const hasQwenConfig = content.includes('qwen2.5-coder');
            const hasMemorySync = content.includes('MEMORY_SYNC_INTERVAL');
            
            return hasQwenConfig && hasMemorySync ? 'Enhanced with AI features' : 'Basic version';
        } catch {
            return 'Scribe console not found';
        }
    }

    async getActiveProjects() {
        try {
            const projects = [];
            
            // Check for common project indicators
            const indicators = [
                { file: 'package.json', type: 'Node.js Project' },
                { file: 'requirements.txt', type: 'Python Project' },
                { file: 'docker-compose.yml', type: 'Docker Environment' },
                { file: 'robust-startup-protocol.sh', type: 'Startup System' }
            ];
            
            for (const indicator of indicators) {
                try {
                    await fs.access(path.join(this.enginePath, indicator.file));
                    projects.push(indicator.type);
                } catch {
                    // File doesn't exist
                }
            }
            
            return projects;
        } catch (error) {
            return ['Error detecting projects'];
        }
    }

    async suggestNextActions() {
        const suggestions = [];
        
        try {
            // Check if startup system needs to run
            const { stdout: dockerPs } = await execAsync('docker ps 2>/dev/null || echo ""');
            if (!dockerPs.includes('mcp-memory')) {
                suggestions.push('🚀 Run startup system: `./robust-startup-package/robust-startup-protocol.sh`');
            }
            
            // Check if scribe console should be started
            const { stdout: scribePs } = await execAsync('pgrep -f "enhanced-scribe-console" 2>/dev/null || echo ""');
            if (!scribePs.trim()) {
                suggestions.push('🌸 Start enhanced scribe: `node enhanced-scribe-console.js`');
            }
            
            // Check for uncommitted changes
            const { stdout: gitStatus } = await execAsync('git status --porcelain 2>/dev/null || echo ""');
            if (gitStatus.trim()) {
                suggestions.push('📝 Commit pending changes: `git add . && git commit -m "Your message"`');
            }
            
            // Always suggest checking memory sync
            suggestions.push('🧠 Check memory system: Use `memory` command in scribe console');
            suggestions.push('🔍 Review functions: Use `functions` command in scribe console');
            
        } catch {
            suggestions.push('⚠️  Run system diagnostics to check component status');
        }
        
        return suggestions;
    }

    calculateTimeSince(date) {
        const now = new Date();
        const diff = now - date;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        
        if (hours < 1) {
            const minutes = Math.floor(diff / (1000 * 60));
            return `${minutes} minutes ago`;
        } else if (hours < 24) {
            return `${hours} hours ago`;
        } else {
            const days = Math.floor(hours / 24);
            return `${days} days ago`;
        }
    }

    formatAsMarkdown(recap) {
        return `# Session Recap
*Generated: ${new Date(recap.timestamp).toLocaleString()}*

## 🕐 Last Session Summary

**Last Activity:** ${recap.lastSession.sessionGap}

${recap.lastSession.lastCommit ? `
**Last Commit:** 
- \`${recap.lastSession.lastCommit.hash}\` - ${recap.lastSession.lastCommit.date}
- Message: *${recap.lastSession.lastCommit.message}*
` : '**No recent commits found**'}

## 📊 Recent Development Activity

### Git History (Last 5 commits)
\`\`\`
${recap.recentCommits.join('\n')}
\`\`\`

### Memory System State
- **Memory Files:** ${recap.memoryState.memoryFiles}
- **Conversations:** ${recap.memoryState.totalConversations}
- **Last Activity:** ${recap.memoryState.lastActivity}

## 🔧 System Status

### Component Health
- **Docker:** ${recap.systemState.docker}
- **Ollama/AI:** ${recap.systemState.ollama}
- **Enhanced Scribe:** ${recap.systemState.scribe}
- **Checked:** ${recap.systemState.timestamp}

### Active Projects
${recap.activeProjects.map(project => `- ✅ ${project}`).join('\n')}

## 🎯 Suggested Next Actions

${recap.nextActions.map(action => `${action}`).join('\n\n')}

## 💡 Quick Commands

\`\`\`bash
# Start the system
./robust-startup-package/robust-startup-protocol.sh

# Launch enhanced scribe console
node enhanced-scribe-console.js

# Check memory status
# (Use 'memory' command in scribe console)

# View extracted functions
# (Use 'functions' command in scribe console)
\`\`\`

---
*This recap was automatically generated to help you quickly understand the current state of your development environment and pick up where you left off.*
`;
    }
}

// Run if called directly
if (import.meta.url === `file://${__filename}`) {
    const generator = new SessionRecapGenerator();
    generator.generateRecap().catch(console.error);
}

export default SessionRecapGenerator;
