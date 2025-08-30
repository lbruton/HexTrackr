#!/usr/bin/env node

/**
 * StackTrackr Scribe Console
 * Interactive console interface for conversation summaries and memory management
 * Features pink verbose logging and real-time memory interaction
 * 
 * Usage: node scribe-console.js
 */

import readline from 'readline';
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

const PINK = '\x1b[95m';
const RESET = '\x1b[0m';
const BRIGHT_PINK = '\x1b[95;1m';
const DIM_PINK = '\x1b[95;2m';

class ScribeConsole {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: `${BRIGHT_PINK}StackTrackr Scribe> ${RESET}`
        });
        
        this.memoryPath = path.join(process.cwd(), 'rMemory', 'rAgentMemories');
        this.enginePath = path.join(process.cwd(), 'rEngine');
        this.isVerbose = true;
    }

    log(message, level = 'INFO') {
        const timestamp = new Date().toISOString().substring(11, 19);
        const levelColors = {
            'INFO': PINK,
            'SUCCESS': BRIGHT_PINK,
            'ERROR': '\x1b[91m',
            'VERBOSE': DIM_PINK,
            'SYSTEM': BRIGHT_PINK
        };
        
        const color = levelColors[level] || PINK;
        console.log(`${color}[${timestamp}] ${level}: ${message}${RESET}`);
    }

    verbose(message) {
        if (this.isVerbose) {
            this.log(message, 'VERBOSE');
        }
    }

    async init() {
        console.log(`${BRIGHT_PINK}
╔══════════════════════════════════════════════════════════════╗
║                    StackTrackr Scribe Console                ║
║                                                              ║
║   🧠 Memory Management & Conversation Analysis              ║
║   📝 Real-time Context Switching & Summary Generation       ║
║   🤖 AI Agent Memory Coordination                          ║
╚══════════════════════════════════════════════════════════════╝${RESET}
`);

        this.log('Scribe Console initializing...', 'SYSTEM');
        await this.checkSystems();
        this.showHelp();
        this.startPrompt();
    }

    async checkSystems() {
        this.verbose('Checking memory system integrity...');
        
        try {
            await fs.access(this.memoryPath);
            this.verbose(`Memory path verified: ${this.memoryPath}`);
        } catch (error) {
            this.log(`Memory path not found: ${this.memoryPath}`, 'ERROR');
        }

        try {
            await fs.access(this.enginePath);
            this.verbose(`Engine path verified: ${this.enginePath}`);
        } catch (error) {
            this.log(`Engine path not found: ${this.enginePath}`, 'ERROR');
        }

        this.verbose('Checking scribe-summary availability...');
        try {
            const summaryPath = path.join(this.enginePath, 'scribe-summary.js');
            await fs.access(summaryPath);
            this.verbose('Scribe summary system ready');
        } catch (error) {
            this.log('Scribe summary system not found', 'ERROR');
        }

        this.log('System check complete', 'SUCCESS');
    }

    showHelp() {
        console.log(`${PINK}
Available Commands:
  summary [timeframe]  - Generate conversation summary (30m, 1h, 6h, 12h, 24h)
  memory list         - List all agent memory files
  memory read [file]  - Read specific memory file
  memory search [term] - Search across all memories
  status              - Show system status
  verbose on/off      - Toggle verbose logging
  clear               - Clear console
  help                - Show this help
  exit                - Exit scribe console

Examples:
  summary 6h          - Get 6 hour conversation summary
  memory read tasks   - Read tasks.json memory file
  memory search "bug" - Search for "bug" across all memories
${RESET}`);
    }

    async executeCommand(command, args = []) {
        const cmd = command.toLowerCase();
        
        this.verbose(`Executing command: ${cmd} with args: [${args.join(', ')}]`);

        switch (cmd) {
            case 'summary':
                await this.generateSummary(args[0] || '6h');
                break;
            
            case 'memory':
                await this.handleMemoryCommand(args);
                break;
            
            case 'status':
                await this.showStatus();
                break;
            
            case 'verbose':
                this.toggleVerbose(args[0]);
                break;
            
            case 'clear':
                console.clear();
                this.log('Console cleared', 'SYSTEM');
                break;
            
            case 'help':
                this.showHelp();
                break;
            
            case 'exit':
                this.log('Goodbye! 👋', 'SYSTEM');
                this.rl.close();
                return;
            
            default:
                this.log(`Unknown command: ${cmd}. Type 'help' for available commands.`, 'ERROR');
        }
    }

    async generateSummary(timeframe) {
        this.log(`Generating ${timeframe} conversation summary...`, 'SYSTEM');
        this.verbose('Calling scribe-summary.js...');
        
        try {
            const summaryPath = path.join(this.enginePath, 'scribe-summary.js');
            const result = execSync(`node "${summaryPath}" ${timeframe}`, { 
                encoding: 'utf8',
                cwd: process.cwd()
            });
            
            console.log(`${PINK}📝 Summary (${timeframe}):${RESET}\n${result}`);
            this.log('Summary generation complete', 'SUCCESS');
        } catch (error) {
            this.log(`Summary generation failed: ${error.message}`, 'ERROR');
            this.verbose(`Error details: ${error.stack}`);
        }
    }

    async handleMemoryCommand(args) {
        const subCommand = args[0];
        
        switch (subCommand) {
            case 'list':
                await this.listMemoryFiles();
                break;
            
            case 'read':
                await this.readMemoryFile(args[1]);
                break;
            
            case 'search':
                await this.searchMemories(args.slice(1).join(' '));
                break;
            
            default:
                this.log('Memory subcommands: list, read [file], search [term]', 'ERROR');
        }
    }

    async listMemoryFiles() {
        this.verbose('Scanning memory directory...');
        
        try {
            const files = await fs.readdir(this.memoryPath);
            const jsonFiles = files.filter(f => f.endsWith('.json'));
            
            this.log('Agent Memory Files:', 'SYSTEM');
            jsonFiles.forEach(file => {
                console.log(`${PINK}  📄 ${file}${RESET}`);
            });
            
            this.verbose(`Found ${jsonFiles.length} memory files`);
        } catch (error) {
            this.log(`Failed to list memory files: ${error.message}`, 'ERROR');
        }
    }

    async readMemoryFile(filename) {
        if (!filename) {
            this.log('Please specify a filename (without .json extension)', 'ERROR');
            return;
        }

        const filepath = path.join(this.memoryPath, `${filename}.json`);
        this.verbose(`Reading memory file: ${filepath}`);
        
        try {
            const content = await fs.readFile(filepath, 'utf8');
            const data = JSON.parse(content);
            
            console.log(`${PINK}📖 Memory: ${filename}.json${RESET}`);
            console.log(JSON.stringify(data, null, 2));
            
            this.log(`Memory file read: ${filename}.json`, 'SUCCESS');
        } catch (error) {
            this.log(`Failed to read memory file: ${error.message}`, 'ERROR');
        }
    }

    async searchMemories(searchTerm) {
        if (!searchTerm) {
            this.log('Please provide a search term', 'ERROR');
            return;
        }

        this.verbose(`Searching memories for: "${searchTerm}"`);
        
        try {
            const files = await fs.readdir(this.memoryPath);
            const jsonFiles = files.filter(f => f.endsWith('.json'));
            
            let results = [];
            
            for (const file of jsonFiles) {
                const filepath = path.join(this.memoryPath, file);
                const content = await fs.readFile(filepath, 'utf8');
                
                if (content.toLowerCase().includes(searchTerm.toLowerCase())) {
                    results.push({
                        file,
                        content: content.substring(0, 200) + '...'
                    });
                }
            }
            
            if (results.length > 0) {
                this.log(`Found ${results.length} matches for "${searchTerm}":`, 'SUCCESS');
                results.forEach(result => {
                    console.log(`${PINK}📄 ${result.file}:${RESET}`);
                    console.log(`   ${result.content}\n`);
                });
            } else {
                this.log(`No matches found for "${searchTerm}"`, 'ERROR');
            }
            
        } catch (error) {
            this.log(`Search failed: ${error.message}`, 'ERROR');
        }
    }

    async showStatus() {
        this.log('System Status Check:', 'SYSTEM');
        
        try {
            // Check memory system
            const memoryFiles = await fs.readdir(this.memoryPath);
            const jsonCount = memoryFiles.filter(f => f.endsWith('.json')).length;
            
            console.log(`${PINK}📁 Memory System: ${jsonCount} files in rAgentMemories/${RESET}`);
            
            // Check engine system  
            const engineFiles = await fs.readdir(this.enginePath);
            const jsCount = engineFiles.filter(f => f.endsWith('.js')).length;
            
            console.log(`${PINK}⚙️  Engine System: ${jsCount} tools available${RESET}`);
            
            // Check git status
            try {
                const gitStatus = execSync('git status --porcelain', { 
                    encoding: 'utf8',
                    cwd: process.cwd()
                });
                const changeCount = gitStatus.trim().split('\n').filter(l => l).length;
                console.log(`${PINK}📝 Git Status: ${changeCount} uncommitted changes${RESET}`);
            } catch (error) {
                console.log(`${PINK}📝 Git Status: Not a git repository${RESET}`);
            }
            
            this.log('Status check complete', 'SUCCESS');
            
        } catch (error) {
            this.log(`Status check failed: ${error.message}`, 'ERROR');
        }
    }

    toggleVerbose(setting) {
        if (setting === 'on') {
            this.isVerbose = true;
            this.log('Verbose logging enabled', 'SYSTEM');
        } else if (setting === 'off') {
            this.isVerbose = false;
            this.log('Verbose logging disabled', 'SYSTEM');
        } else {
            this.isVerbose = !this.isVerbose;
            this.log(`Verbose logging ${this.isVerbose ? 'enabled' : 'disabled'}`, 'SYSTEM');
        }
    }

    startPrompt() {
        this.rl.prompt();
        
        this.rl.on('line', async (input) => {
            const trimmed = input.trim();
            if (trimmed) {
                const [command, ...args] = trimmed.split(' ');
                await this.executeCommand(command, args);
            }
            this.rl.prompt();
        });

        this.rl.on('close', () => {
            this.log('\nScribe Console session ended', 'SYSTEM');
            process.exit(0);
        });
    }
}

// Start the console if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const console = new ScribeConsole();
    console.init().catch(error => {
        console.error(`${PINK}Failed to start Scribe Console: ${error.message}${RESET}`);
        process.exit(1);
    });
}

export default ScribeConsole;
