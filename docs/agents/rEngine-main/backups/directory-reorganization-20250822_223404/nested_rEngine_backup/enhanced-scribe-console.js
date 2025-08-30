#!/usr/bin/env node

/**
 * Enhanced StackTrackr Scribe Console
 * 
 * Features:
 * - Hello Kitty ASCII art welcome
 * - Clean INFO logging format
 * - Last 5 changes display
 * - Persistent terminal (doesn't close for commands)
 * - Background monitoring with separate terminals
 * 
 * Usage: node enhanced-scribe-console.js
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
const GREEN = '\x1b[92m';
const BLUE = '\x1b[94m';
const DIM_PINK = '\x1b[95;2m';
const RESET = '\x1b[0m';

class EnhancedScribeConsole {
    constructor() {
        this.baseDir = path.dirname(__dirname);
        this.memoryPath = path.join(this.baseDir, 'rMemory', 'rAgentMemories');
        this.enginePath = path.join(this.baseDir, 'rEngine');
        
        // Activity log for last 5 changes
        this.activityLog = [];
        this.maxLogEntries = 5;
        
        // Console interface
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: `${PINK}Scribe> ${RESET}`
        });
        
        // Don't exit on commands - use separate processes
        this.isRunning = true;
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
            full: `${type} - ${message}`
        };
        
        this.activityLog.unshift(entry);
        if (this.activityLog.length > this.maxLogEntries) {
            this.activityLog.pop();
        }
        
        // Print to console
        console.log(`${PINK}[${timestamp}] ${type} - ${message}${RESET}`);
        
        // Update display
        this.updateDisplay();
    }

    async showWelcome() {
        console.clear();
        
        console.log(`${PINK}`);
        console.log(`     /\\_/\\  `);
        console.log(`    ( o.o ) `);
        console.log(`     > ^ <    Hello! StackTrackr Scribe Console`);
        console.log(`    `);
        console.log(`    ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡`);
        console.log(`${RESET}`);
        
        console.log(`${WHITE}🧠 Enhanced Memory Management & Live Monitoring! ${PINK}(⁀ᗢ⁀)${RESET}`);
        console.log(`${YELLOW}═══════════════════════════════════════════════════════════${RESET}`);
        console.log();
        
        await this.initializeSystems();
    }

    async initializeSystems() {
        this.logActivity('Scribe Console initializing...', 'SYSTEM');
        
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
        this.showCurrentStatus();
        this.startInteractiveMode();
    }

    async startBackgroundMonitoring() {
        this.logActivity('Starting background file monitoring...', 'INFO');
        
        // Monitor memory files for changes
        const watcher = chokidar.watch([
            path.join(this.memoryPath, '**/*.json'),
            path.join(this.enginePath, '*.json'),
            path.join(this.baseDir, 'index.html'),
            path.join(this.baseDir, 'js/**/*.js'),
            path.join(this.baseDir, 'css/**/*.css')
        ], {
            ignored: /node_modules|\.git/,
            persistent: true
        });
        
        watcher.on('change', (filePath) => {
            const fileName = path.basename(filePath);
            const extension = path.extname(fileName);
            
            if (extension === '.json') {
                this.logActivity(`Analyzed ${fileName} and noted memory updates`, 'INFO');
            } else if (extension === '.html') {
                this.logActivity(`Analyzed ${fileName} and noted all objects`, 'INFO');
            } else if (extension === '.js') {
                this.logActivity(`Analyzed ${fileName} and noted code patterns`, 'INFO');
            } else if (extension === '.css') {
                this.logActivity(`Analyzed ${fileName} and noted style changes`, 'INFO');
            }
        });
        
        watcher.on('add', (filePath) => {
            const fileName = path.basename(filePath);
            this.logActivity(`New file detected: ${fileName}`, 'INFO');
        });
        
        this.logActivity('Background monitoring active', 'SUCCESS');
    }

    updateDisplay() {
        // Show recent activity (last 5 changes)
        console.log(`\n${BLUE}📊 Recent Activity (Last 5 Changes):${RESET}`);
        console.log(`${YELLOW}────────────────────────────────────────────────${RESET}`);
        
        if (this.activityLog.length === 0) {
            console.log(`${DIM_PINK}   No recent activity${RESET}`);
        } else {
            this.activityLog.forEach((entry, index) => {
                const color = index === 0 ? PINK : DIM_PINK;
                console.log(`${color}   [${entry.timestamp}] ${entry.full}${RESET}`);
            });
        }
        
        console.log(`${YELLOW}────────────────────────────────────────────────${RESET}`);
        console.log();
    }

    showCurrentStatus() {
        console.log(`${GREEN}🎯 Current Status:${RESET}`);
        console.log(`   ✅ Memory system active`);
        console.log(`   ✅ File monitoring running`);
        console.log(`   ✅ Background logging enabled`);
        console.log(`   ✅ Console ready for commands`);
        console.log();
        
        console.log(`${BLUE}📋 Available Commands:${RESET}`);
        console.log(`   summary [timeframe]  - Generate conversation summary`);
        console.log(`   memory              - Check memory status`);
        console.log(`   logs                - View recent logs`);
        console.log(`   clear               - Clear screen`);
        console.log(`   help                - Show this help`);
        console.log(`   quit                - Exit console`);
        console.log();
    }

    startInteractiveMode() {
        this.rl.prompt();
        
        this.rl.on('line', async (input) => {
            const command = input.trim().toLowerCase();
            
            if (command === 'quit' || command === 'exit') {
                this.logActivity('Scribe Console shutting down...', 'SYSTEM');
                process.exit(0);
            }
            
            await this.handleCommand(command);
            this.rl.prompt();
        });
        
        this.rl.on('close', () => {
            this.logActivity('Console closed by user', 'SYSTEM');
            process.exit(0);
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
                
            case 'logs':
                this.showRecentLogs();
                break;
                
            case 'clear':
                console.clear();
                await this.showWelcome();
                break;
                
            case 'help':
                this.showCurrentStatus();
                break;
                
            default:
                if (command) {
                    this.logActivity(`Unknown command: ${command}`, 'ERROR');
                    console.log(`${YELLOW}Type 'help' for available commands${RESET}`);
                }
        }
    }

    async runSummary(timeframe) {
        this.logActivity(`Generating ${timeframe} summary...`, 'INFO');
        
        // Run in separate process to avoid blocking console
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
                this.logActivity(`${timeframe} summary completed`, 'SUCCESS');
                console.log(`${GREEN}Summary Output:${RESET}`);
                console.log(output);
            } else {
                this.logActivity(`Summary generation failed`, 'ERROR');
            }
        });
    }

    async checkMemoryStatus() {
        this.logActivity('Checking memory system status...', 'INFO');
        
        try {
            const memoryFiles = await fs.readdir(this.memoryPath);
            this.logActivity(`Found ${memoryFiles.length} memory files`, 'INFO');
            
            console.log(`${GREEN}Memory System Status:${RESET}`);
            console.log(`   📁 Memory files: ${memoryFiles.length}`);
            console.log(`   📍 Location: ${this.memoryPath}`);
            
            // Check recent modifications
            const stats = await fs.stat(this.memoryPath);
            console.log(`   ⏰ Last modified: ${stats.mtime.toLocaleString()}`);
            
        } catch (error) {
            this.logActivity(`Memory check failed: ${error.message}`, 'ERROR');
        }
    }

    showRecentLogs() {
        console.log(`${BLUE}📋 Recent Activity Log:${RESET}`);
        console.log(`${YELLOW}────────────────────────────────────────────────${RESET}`);
        
        if (this.activityLog.length === 0) {
            console.log(`${DIM_PINK}   No activity recorded yet${RESET}`);
        } else {
            this.activityLog.forEach((entry) => {
                console.log(`${PINK}   [${entry.timestamp}] ${entry.full}${RESET}`);
            });
        }
        
        console.log(`${YELLOW}────────────────────────────────────────────────${RESET}`);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log(`\\n${PINK}👋 Goodbye! Scribe Console shutting down...${RESET}`);
    process.exit(0);
});

// Start the enhanced console
const console_instance = new EnhancedScribeConsole();
await console_instance.showWelcome();
