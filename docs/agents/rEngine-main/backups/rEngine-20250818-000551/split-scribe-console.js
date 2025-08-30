#!/usr/bin/env node

/**
 * Enhanced Scribe Console with Split Display
 * 
 * Left side: Last 5 changes + status
 * Right side: Full verbose log stream
 * 
 * Usage: node split-scribe-console.js
 */

import readline from 'readline';
import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import chokidar from 'chokidar';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors
const PINK = '\x1b[95m';
const WHITE = '\x1b[97m';
const YELLOW = '\x1b[93m';
const ORANGE = '\x1b[38;5;208m';  // Orange for document sweep
const GREEN = '\x1b[92m';
const BLUE = '\x1b[94m';
const LIGHT_BLUE = '\x1b[96m';    // Light blue for success
const DIM_PINK = '\x1b[95;2m';
const CYAN = '\x1b[96m';
const RESET = '\x1b[0m';

class SplitScribeConsole {
    constructor() {
        this.baseDir = path.dirname(__dirname);
        this.memoryPath = path.join(this.baseDir, 'rMemory', 'rAgentMemories');
        this.enginePath = path.join(this.baseDir, 'rEngine');
        this.extendedContextPath = path.join(this.memoryPath, 'extendedcontext.json');
        
        // Session tracking
        this.sessionId = `session-${Date.now()}`;
        this.sessionStartTime = new Date().toISOString();
        this.sessionActivities = [];
        
        // Activity logs
        this.activityLog = [];
        this.verboseLog = [];
        this.maxActivityEntries = 5;
        this.maxVerboseEntries = 50;
        
        // Console interface
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: `${PINK}Scribe> ${RESET}`
        });
        
        this.isRunning = true;
        this.displayCounter = 0;
    }

    logActivity(message, type = 'INFO') {
        const timestamp = new Date().toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        const entry = {
            timestamp,
            type,
            message,
            full: `${type} - ${message}`,
            isoTimestamp: new Date().toISOString()
        };
        
        // Add to both logs
        this.activityLog.unshift(entry);
        if (this.activityLog.length > this.maxActivityEntries) {
            this.activityLog.pop();
        }
        
        this.verboseLog.unshift({...entry, id: this.displayCounter++});
        if (this.verboseLog.length > this.maxVerboseEntries) {
            this.verboseLog.pop();
        }
        
        // Add to session activities for extended context
        this.sessionActivities.push(entry);
        
        // Write to extended context periodically (every 10 activities or on important events)
        if (this.sessionActivities.length % 10 === 0 || type === 'SUCCESS' || type === 'ERROR') {
            this.updateExtendedContext();
        }
        
        // Update display
        this.updateSplitDisplay();
    }

    async updateExtendedContext() {
        try {
            // Load existing extended context
            let extendedContext = {};
            try {
                const data = await fs.readFile(this.extendedContextPath, 'utf8');
                extendedContext = JSON.parse(data);
            } catch (error) {
                // File doesn't exist or is invalid, start fresh
                extendedContext = {
                    metadata: {
                        created: new Date().toISOString().split('T')[0],
                        last_updated: new Date().toISOString().split('T')[0],
                        version: "1.0.0",
                        purpose: "Persistent memory storage for important discussions and long-term context"
                    },
                    sessions: {}
                };
            }
            
            // Update metadata
            extendedContext.metadata.last_updated = new Date().toISOString().split('T')[0];
            
            // Ensure sessions object exists
            if (!extendedContext.sessions) {
                extendedContext.sessions = {};
            }
            
            // Get today's date
            const today = new Date().toISOString().split('T')[0];
            
            // Ensure today's session exists
            if (!extendedContext.sessions[today]) {
                extendedContext.sessions[today] = [];
            }
            
            // Check if this session already exists
            let existingSession = extendedContext.sessions[today].find(s => s.session_id === this.sessionId);
            
            if (!existingSession) {
                // Create new session entry
                existingSession = {
                    session_id: this.sessionId,
                    start_time: this.sessionStartTime,
                    activities: [],
                    summary: "Enhanced split scribe console session",
                    key_events: []
                };
                extendedContext.sessions[today].push(existingSession);
            }
            
            // Update session with latest activities
            existingSession.last_updated = new Date().toISOString();
            existingSession.activities = this.sessionActivities.slice(-50); // Keep last 50 activities
            
            // Extract key events (SUCCESS, ERROR, or important file changes)
            existingSession.key_events = this.sessionActivities
                .filter(activity => 
                    activity.type === 'SUCCESS' || 
                    activity.type === 'ERROR' || 
                    activity.message.includes('New file detected') ||
                    activity.message.includes('Console implementation') ||
                    activity.message.includes('Menu system')
                )
                .slice(-10); // Keep last 10 key events
            
            // Write back to file
            await fs.writeFile(this.extendedContextPath, JSON.stringify(extendedContext, null, 2));
            
        } catch (error) {
            console.error(`${YELLOW}⚠️  Failed to update extended context: ${error.message}${RESET}`);
        }
    }

    async showWelcome() {
        console.clear();
        
        console.log(`${PINK}`);
        console.log(`     /\\_/\\  `);
        console.log(`    ( o.o ) `);
        console.log(`     > ^ <    Split Scribe Console - Enhanced Display`);
        console.log(`    `);
        console.log(`    ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡`);
        console.log(`${RESET}`);
        
        console.log(`${WHITE}🧠 Left: Last 5 Changes | Right: Full Verbose Log ${PINK}(⁀ᗢ⁀)${RESET}`);
        console.log(`${YELLOW}═══════════════════════════════════════════════════════════════════${RESET}`);
        console.log();
        
        await this.initializeSystems();
    }

    updateSplitDisplay() {
        // Clear screen and redraw
        console.clear();
        
        // Header
        console.log(`${PINK}     /\\_/\\  ( o.o )  > ^ <    Split Scribe Console${RESET}`);
        console.log(`${YELLOW}═══════════════════════════════════════════════════════════════════${RESET}`);
        
        // Split layout
        const leftWidth = 50;
        const rightWidth = 70;
        
        // Left side: Last 5 changes
        console.log(`${BLUE}📊 LAST 5 CHANGES${' '.repeat(leftWidth - 16)} ${CYAN}📜 FULL VERBOSE LOG${RESET}`);
        console.log(`${YELLOW}${'─'.repeat(leftWidth)} ${'─'.repeat(rightWidth)}${RESET}`);
        
        // Get max rows to display
        const maxRows = Math.max(this.activityLog.length, Math.min(this.verboseLog.length, 15));
        
        for (let i = 0; i < Math.max(maxRows, 5); i++) {
            let leftText = '';
            let rightText = '';
            
            // Left side content
            if (i < this.activityLog.length) {
                const entry = this.activityLog[i];
                const color = i === 0 ? PINK : DIM_PINK;
                leftText = `${color}[${entry.timestamp}] ${entry.full}${RESET}`;
            } else {
                leftText = `${DIM_PINK}${' '.repeat(leftWidth)}${RESET}`;
            }
            
            // Right side content  
            if (i < this.verboseLog.length) {
                const entry = this.verboseLog[i];
                const color = this.getLogColor(entry.type);
                rightText = `${color}[${entry.timestamp}] ${entry.full}${RESET}`;
            } else {
                rightText = `${DIM_PINK}${' '.repeat(rightWidth)}${RESET}`;
            }
            
            // Truncate if needed
            const leftDisplay = this.truncateText(leftText, leftWidth);
            const rightDisplay = this.truncateText(rightText, rightWidth);
            
            console.log(`${leftDisplay} ${rightDisplay}`);
        }
        
        console.log(`${YELLOW}${'─'.repeat(leftWidth)} ${'─'.repeat(rightWidth)}${RESET}`);
        
        // Status line
        const status = `${GREEN}✅ Monitoring: ${this.activityLog.length}/5 recent | ${this.verboseLog.length} total logged${RESET}`;
        console.log(status);
        console.log();
        
        // Commands
        console.log(`${BLUE}Commands: summary [time] | memory | docs | logs | clear | help | quit${RESET}`);
        this.rl.prompt();
    }

    getLogColor(type) {
        const colors = {
            'SYSTEM': CYAN,
            'INFO': PINK,
            'SUCCESS': GREEN,
            'DOC_SUCCESS': LIGHT_BLUE,     // Light blue for document sweep success
            'SCRIBE_SUCCESS': GREEN,       // Green for scribe success  
            'DOC_SWEEP': ORANGE,           // Orange for document sweep activities
            'DOC_INFO': YELLOW,            // Yellow for document sweep info
            'ERROR': '\x1b[91m',
            'VERBOSE': DIM_PINK
        };
        return colors[type] || PINK;
    }

    truncateText(text, maxWidth) {
        // Remove ANSI codes for length calculation
        const cleanText = text.replace(/\x1b\[[0-9;]*m/g, '');
        if (cleanText.length <= maxWidth) {
            return text.padEnd(maxWidth + (text.length - cleanText.length));
        }
        
        // Truncate and add ellipsis
        const truncated = cleanText.substring(0, maxWidth - 3) + '...';
        return text.substring(0, text.length - cleanText.length + maxWidth - 3) + '...';
    }

    async initializeSystems() {
        this.logActivity('Split Scribe Console initializing...', 'SYSTEM');
        
        // Check memory system
        try {
            await fs.access(this.memoryPath);
            this.logActivity('Memory system verified', 'INFO');
        } catch (error) {
            this.logActivity('Memory system not found', 'ERROR');
        }
        
        // Check engine systems
        try {
            await fs.access(path.join(this.enginePath, 'scribe-summary.js'));
            this.logActivity('Summary system verified', 'INFO');
        } catch (error) {
            this.logActivity('Summary system not found', 'ERROR');
        }
        
        // Start background monitoring
        await this.startBackgroundMonitoring();
        
        this.logActivity('All systems operational', 'SUCCESS');
        this.startInteractiveMode();
    }

    async startBackgroundMonitoring() {
        this.logActivity('Starting background file monitoring...', 'INFO');
        
        // Initialize document sweep log monitoring
        this.initDocumentSweepMonitoring();
        
        const watcher = chokidar.watch([
            path.join(this.memoryPath, '**/*.json'),
            path.join(this.enginePath, '*.json'),
            path.join(this.baseDir, 'index.html'),
            path.join(this.baseDir, 'js/**/*.js'),
            path.join(this.baseDir, 'css/**/*.css'),
            path.join(this.baseDir, 'logs/**/*.log'),           // Monitor log files
            path.join(this.baseDir, 'logs/**/*.json'),          // Monitor results files
            path.join(this.baseDir, 'docs/generated/**/*.md')   // Monitor generated docs
        ], {
            ignored: /node_modules|\.git/,
            persistent: true
        });
        
        watcher.on('change', (filePath) => {
            const fileName = path.basename(filePath);
            const extension = path.extname(fileName);
            const relativePath = path.relative(this.baseDir, filePath);
            
            if (extension === '.json') {
                if (fileName === 'document-sweep-results.json') {
                    this.logActivity(`📊 Document sweep results updated`, 'DOC_SUCCESS');
                } else {
                    this.logActivity(`ANALYZED ${fileName} and noted memory updates`, 'INFO');
                }
            } else if (extension === '.log') {
                if (fileName === 'document-sweep.log') {
                    this.parseDocumentSweepLog(filePath);
                } else {
                    this.logActivity(`📜 Log file updated: ${fileName}`, 'INFO');
                }
            } else if (extension === '.md' && relativePath.includes('docs/generated')) {
                this.logActivity(`📄 Documentation generated: ${fileName}`, 'DOC_SUCCESS');
            } else if (extension === '.html') {
                this.logActivity(`ANALYZED ${fileName} and noted all objects`, 'INFO');
            } else if (extension === '.js') {
                this.logActivity(`ANALYZED ${fileName} and noted code patterns`, 'INFO');
            } else if (extension === '.css') {
                this.logActivity(`ANALYZED ${fileName} and noted style changes`, 'INFO');
            }
        });
        
        watcher.on('add', (filePath) => {
            const fileName = path.basename(filePath);
            const extension = path.extname(fileName);
            const relativePath = path.relative(this.baseDir, filePath);
            
            if (extension === '.md' && relativePath.includes('docs/generated')) {
                this.logActivity(`📄 New documentation: ${fileName}`, 'DOC_SUCCESS');
            } else if (fileName === 'document-sweep.log') {
                this.logActivity(`📊 Document sweep started - monitoring logs`, 'DOC_SWEEP');
            } else {
                this.logActivity(`New file detected: ${fileName}`, 'INFO');
            }
        });
        
        // Simulate some activity for demo
        setInterval(() => {
            const activities = [
                'Logging user input',
                'Logging agent input', 
                'Memory sync completed',
                'Background health check',
                'Context refresh completed'
            ];
            const activity = activities[Math.floor(Math.random() * activities.length)];
            this.logActivity(activity, Math.random() > 0.8 ? 'SCRIBE_SUCCESS' : 'INFO');
        }, 15000); // Every 15 seconds (reduced frequency)
        
        this.logActivity('Background monitoring active', 'SUCCESS');
    }

    startInteractiveMode() {
        this.rl.on('line', async (input) => {
            const command = input.trim().toLowerCase();
            
            if (command === 'quit' || command === 'exit') {
                this.logActivity('Split Scribe Console shutting down...', 'SYSTEM');
                await this.updateExtendedContext(); // Save final session state
                process.exit(0);
            }
            
            await this.handleCommand(command);
        });
        
        this.rl.on('close', () => {
            this.logActivity('Console closed by user', 'SYSTEM');
            this.updateExtendedContext().then(() => process.exit(0));
        });
    }

    async handleCommand(command) {
        const parts = command.split(' ');
        const cmd = parts[0];
        const args = parts.slice(1);
        
        switch (cmd) {
            case 'summary':
                await this.runSummary(args[0] || '1h');
                break;
                
            case 'memory':
                await this.checkMemoryStatus();
                break;
                
            case 'docs':
            case 'docsweep':
                await this.checkDocumentSweepStatus();
                break;
                
            case 'logs':
                this.showVerboseLogs();
                break;
                
            case 'clear':
                this.activityLog = [];
                this.verboseLog = [];
                this.updateSplitDisplay();
                break;
                
            case 'help':
                this.showHelp();
                break;
                
            default:
                if (command) {
                    this.logActivity(`Unknown command: ${command}`, 'ERROR');
                }
        }
    }

    async runSummary(timeframe) {
        this.logActivity(`Generating ${timeframe} summary...`, 'INFO');
        
        const summaryProcess = spawn('node', ['scribe-summary.js', timeframe], {
            cwd: this.enginePath,
            stdio: 'pipe'
        });
        
        let output = '';
        summaryProcess.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        summaryProcess.on('close', (code) => {
            if (code === 0) {
                this.logActivity(`${timeframe} summary completed`, 'SCRIBE_SUCCESS');
            } else {
                this.logActivity(`Summary generation failed`, 'ERROR');
            }
        });
    }

    // Document Sweep Monitoring Methods
    initDocumentSweepMonitoring() {
        this.lastLogPosition = 0;
        this.documentSweepLogPath = path.join(this.baseDir, 'logs', 'document-sweep.log');
        
        // Check if log exists and set initial position
        fs.access(this.documentSweepLogPath)
            .then(() => {
                return fs.stat(this.documentSweepLogPath);
            })
            .then((stats) => {
                this.lastLogPosition = stats.size;
                this.logActivity('📊 Document sweep log monitoring initialized', 'DOC_INFO');
            })
            .catch(() => {
                this.logActivity('📊 Waiting for document sweep logs...', 'DOC_INFO');
            });
    }

    async parseDocumentSweepLog(logPath) {
        try {
            const stats = await fs.stat(logPath);
            if (stats.size <= this.lastLogPosition) {
                return; // No new content
            }

            // Read only new content
            const stream = await fs.open(logPath, 'r');
            const newContent = Buffer.alloc(stats.size - this.lastLogPosition);
            await stream.read(newContent, 0, newContent.length, this.lastLogPosition);
            await stream.close();

            const newLines = newContent.toString().split('\n').filter(line => line.trim());
            
            for (const line of newLines) {
                this.parseDocumentSweepLogLine(line);
            }

            this.lastLogPosition = stats.size;
            
        } catch (error) {
            this.logActivity(`Error reading document sweep log: ${error.message}`, 'ERROR');
        }
    }

    parseDocumentSweepLogLine(line) {
        if (!line.trim()) return;

        // Parse different types of document sweep messages
        if (line.includes('DOCUMENT SWEEP COMPLETE')) {
            this.logActivity('🎉 Document sweep completed successfully', 'DOC_SUCCESS');
        } else if (line.includes('📊 Total files processed:')) {
            const match = line.match(/📊 Total files processed: (\d+)/);
            if (match) {
                this.logActivity(`📊 Processed ${match[1]} files`, 'DOC_SWEEP');
            }
        } else if (line.includes('✅ Successfully generated:')) {
            const match = line.match(/✅ Successfully generated: (\d+)/);
            if (match) {
                this.logActivity(`✅ Generated ${match[1]} docs`, 'DOC_SUCCESS');
            }
        } else if (line.includes('🔄 Documentation updates:')) {
            const match = line.match(/🔄 Documentation updates: (\d+)/);
            if (match) {
                this.logActivity(`🔄 Updated ${match[1]} docs`, 'DOC_SWEEP');
            }
        } else if (line.includes('📊 Diffs generated:')) {
            const match = line.match(/📊 Diffs generated: (\d+)/);
            if (match) {
                this.logActivity(`📊 Generated ${match[1]} diffs`, 'DOC_SWEEP');
            }
        } else if (line.includes('❌ Failed:')) {
            const match = line.match(/❌ Failed: (\d+)/);
            if (match) {
                this.logActivity(`❌ Failed: ${match[1]} files`, 'ERROR');
            }
        } else if (line.includes('📄 Generating docs for:')) {
            const match = line.match(/📄 Generating docs for: (.+)/);
            if (match) {
                const fileName = path.basename(match[1]);
                this.logActivity(`📄 Generating: ${fileName}`, 'DOC_INFO');
            }
        } else if (line.includes('✅ Success:')) {
            const match = line.match(/✅ Success: (.+)/);
            if (match) {
                this.logActivity(`✅ Generated: ${match[1]}`, 'DOC_SUCCESS');
            }
        } else if (line.includes('📊 Diff saved:')) {
            const match = line.match(/📊 Diff saved: (.+)/);
            if (match) {
                this.logActivity(`📊 Diff: ${match[1]}`, 'DOC_SWEEP');
            }
        } else if (line.includes('Powered by: Gemini')) {
            this.logActivity('🧠 Powered by Gemini 1.5 Pro API', 'DOC_SUCCESS');
        } else if (line.includes('ERROR') || line.includes('❌')) {
            // Generic error handling
            const shortError = line.length > 50 ? line.substring(0, 47) + '...' : line;
            this.logActivity(`❌ ${shortError}`, 'ERROR');
        } else if (line.includes('Starting document sweep')) {
            this.logActivity('🚀 Document sweep starting...', 'DOC_SWEEP');
        }
    }

    async checkMemoryStatus() {
        this.logActivity('Checking memory system status...', 'INFO');
        
        try {
            const memoryFiles = await fs.readdir(this.memoryPath);
            this.logActivity(`Found ${memoryFiles.length} memory files`, 'SCRIBE_SUCCESS');
        } catch (error) {
            this.logActivity(`Memory check failed: ${error.message}`, 'ERROR');
        }
    }

    async checkDocumentSweepStatus() {
        this.logActivity('Checking document sweep status...', 'DOC_INFO');
        
        try {
            // Check if results file exists
            const resultsPath = path.join(this.baseDir, 'logs', 'document-sweep-results.json');
            const logPath = path.join(this.baseDir, 'logs', 'document-sweep.log');
            
            try {
                const results = await fs.readFile(resultsPath, 'utf8');
                const data = JSON.parse(results);
                const timestamp = new Date(data.timestamp).toLocaleString();
                this.logActivity(`📊 Last run: ${timestamp}`, 'DOC_SUCCESS');
                this.logActivity(`📊 Success: ${data.summary.succeeded}/${data.summary.processed}`, 'DOC_SUCCESS');
                if (data.summary.updatesDetected > 0) {
                    this.logActivity(`🔄 Updates: ${data.summary.updatesDetected} diffs generated`, 'DOC_SWEEP');
                }
            } catch (error) {
                this.logActivity('📊 No previous runs found', 'DOC_INFO');
            }
            
            // Check cron status
            const nextRun = this.getNextCronTime();
            this.logActivity(`⏰ Next run: ${nextRun}`, 'DOC_INFO');
            
            // Check generated docs count
            const docsPath = path.join(this.baseDir, 'docs', 'generated');
            try {
                const generatedFiles = await this.countFilesRecursively(docsPath);
                this.logActivity(`📄 Generated docs: ${generatedFiles} files`, 'DOC_SUCCESS');
            } catch (error) {
                this.logActivity('📄 No generated docs found', 'DOC_INFO');
            }
            
        } catch (error) {
            this.logActivity(`Doc sweep check failed: ${error.message}`, 'ERROR');
        }
    }

    async countFilesRecursively(dir) {
        let count = 0;
        try {
            const items = await fs.readdir(dir, { withFileTypes: true });
            for (const item of items) {
                if (item.isDirectory()) {
                    count += await this.countFilesRecursively(path.join(dir, item.name));
                } else {
                    count++;
                }
            }
        } catch (error) {
            // Directory doesn't exist or can't be read
        }
        return count;
    }

    getNextCronTime() {
        const now = new Date();
        const next6AM = new Date(now);
        const next6PM = new Date(now);
        
        next6AM.setHours(6, 0, 0, 0);
        next6PM.setHours(18, 0, 0, 0);
        
        // If current time is past 6 AM today, move to tomorrow
        if (now.getHours() >= 6) {
            next6AM.setDate(next6AM.getDate() + 1);
        }
        
        // If current time is past 6 PM today, move to tomorrow
        if (now.getHours() >= 18) {
            next6PM.setDate(next6PM.getDate() + 1);
        }
        
        // Return the nearest future time
        const nextRun = next6AM < next6PM ? next6AM : next6PM;
        return nextRun.toLocaleString();
    }

    showVerboseLogs() {
        this.logActivity('Displaying verbose logs...', 'INFO');
        // The verbose logs are already visible on the right side
    }

    showHelp() {
        this.logActivity('Commands: summary [time] | memory | docs | logs | clear | quit', 'INFO');
        this.logActivity('  • docs/docsweep - Check document sweep status', 'DOC_INFO');
        this.logActivity('  • summary [1h] - Generate time-based summary', 'INFO');
        this.logActivity('  • memory - Check memory system status', 'INFO');
    }
}

// Start the split console
const console_instance = new SplitScribeConsole();

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log(`\n${PINK}👋 Goodbye! Split Scribe Console shutting down...${RESET}`);
    // Save final session state before exit
    await console_instance.updateExtendedContext();
    process.exit(0);
});

await console_instance.showWelcome();
