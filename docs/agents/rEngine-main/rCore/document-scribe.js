#!/usr/bin/env node

/**
 * rEngine Document Scribe - Unified API Communication & Documentation System
 * 
 * Features:
 * - Unified API communication with rate limiting
 * - Idle-time documentation crawling with Qwen
 * - Manual document sweeps and HTML generation
 * - MCP relay integration for all providers
 * - Argument-based provider selection
 * - Activity monitoring with prime directive balance
 * 
 * Usage:
 *   node document-scribe.js --provider gemini --prompt "analyze this code"
 *   node document-scribe.js --idle-crawl --duration 30m
 *   node document-scribe.js --html-sweep --manual
 *   node document-scribe.js --rate-limit 10 --provider claude --file script.js
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

/**
 * Document Scribe - Unified API Communication System
 */
class DocumentScribe {
    constructor() {
        this.baseDir = path.dirname(__dirname);
        this.inputDir = path.join(this.baseDir, 'rDocuments/autogen');
        this.outputDir = path.join(this.baseDir, 'rDocuments/html');
        this.logFile = path.join(this.baseDir, 'logs/document-scribe.log');
        
        // Rate limiting configuration
        this.rateLimits = {
            claude: { rpm: 60, rph: 1000 },
            gemini: { rpm: 15, rph: 1500 },
            groq: { rpm: 30, rph: 14400 },
            openai: { rpm: 500, rph: 10000 },
            ollama: { rpm: 1000, rph: 60000 } // Local, no real limits
        };
        
        // Activity monitoring
        this.lastActivity = Date.now();
        this.idleThreshold = 10 * 60 * 1000; // 10 minutes
        this.isIdleCrawling = false;
        this.primeDirectiveActive = true;
        
        // Request tracking for rate limiting
        this.requestCounts = {};
        this.resetRequestCounts();
        
        this.initializeDirectories();
    }

    /**
     * Initialize required directories
     */
    async initializeDirectories() {
        try {
            await fs.mkdir(path.dirname(this.logFile), { recursive: true });
            await fs.mkdir(this.outputDir, { recursive: true });
        } catch (error) {
            console.warn('Directory initialization warning:', error.message);
        }
    }

    /**
     * Log activity with timestamps
     */
    async log(message, level = 'INFO') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${level}] ${message}\n`;
        
        console.log(`📝 ${level}: ${message}`);
        
        try {
            await fs.appendFile(this.logFile, logEntry);
        } catch (error) {
            console.warn('Logging failed:', error.message);
        }
    }

    /**
     * Reset request counts hourly
     */
    resetRequestCounts() {
        this.requestCounts = {
            claude: { minute: 0, hour: 0, lastMinute: new Date().getMinutes(), lastHour: new Date().getHours() },
            gemini: { minute: 0, hour: 0, lastMinute: new Date().getMinutes(), lastHour: new Date().getHours() },
            groq: { minute: 0, hour: 0, lastMinute: new Date().getMinutes(), lastHour: new Date().getHours() },
            openai: { minute: 0, hour: 0, lastMinute: new Date().getMinutes(), lastHour: new Date().getHours() },
            ollama: { minute: 0, hour: 0, lastMinute: new Date().getMinutes(), lastHour: new Date().getHours() }
        };
    }

    /**
     * Check and enforce rate limits
     */
    async checkRateLimit(provider) {
        const now = new Date();
        const currentMinute = now.getMinutes();
        const currentHour = now.getHours();
        
        const counts = this.requestCounts[provider];
        const limits = this.rateLimits[provider];
        
        // Reset counters if minute/hour changed
        if (currentMinute !== counts.lastMinute) {
            counts.minute = 0;
            counts.lastMinute = currentMinute;
        }
        
        if (currentHour !== counts.lastHour) {
            counts.hour = 0;
            counts.lastHour = currentHour;
        }
        
        // Check limits
        if (counts.minute >= limits.rpm) {
            const waitTime = (60 - now.getSeconds()) * 1000;
            await this.log(`Rate limit reached for ${provider}, waiting ${Math.ceil(waitTime/1000)}s`, 'WARN');
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        if (counts.hour >= limits.rph) {
            const waitTime = (60 - now.getMinutes()) * 60 * 1000;
            await this.log(`Hourly rate limit reached for ${provider}, waiting ${Math.ceil(waitTime/60000)}m`, 'WARN');
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        // Increment counters
        counts.minute++;
        counts.hour++;
    }

    /**
     * Call LLM via MCP relay system
     */
    async callLLMViaMCP(provider, prompt, model = null, maxRetries = 3) {
        await this.checkRateLimit(provider);
        
        const mcpCallScript = path.join(__dirname, 'call-llm.js');
        const args = [
            '--mcp',
            '--provider', provider
        ];
        
        if (model) {
            args.push('--model', model);
        }
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                await this.log(`Calling ${provider} via MCP (attempt ${attempt}/${maxRetries})`);
                
                const child = spawn('node', [mcpCallScript, ...args], {
                    cwd: this.baseDir,
                    stdio: ['pipe', 'pipe', 'pipe']
                });
                
                // Send prompt via stdin
                child.stdin.write(JSON.stringify({ 
                    provider, 
                    prompt,
                    model: model || 'default'
                }));
                child.stdin.end();
                
                let stdout = '';
                let stderr = '';
                
                child.stdout.on('data', (data) => {
                    stdout += data.toString();
                });
                
                child.stderr.on('data', (data) => {
                    stderr += data.toString();
                });
                
                return new Promise((resolve, reject) => {
                    child.on('close', (code) => {
                        if (code === 0 && stdout.trim() && !stdout.includes('error')) {
                            resolve(stdout.trim());
                        } else {
                            reject(new Error(`${provider} failed: ${stderr || stdout || 'Unknown error'}`));
                        }
                    });
                });
                
            } catch (error) {
                await this.log(`${provider} attempt ${attempt} failed: ${error.message}`, 'WARN');
                if (attempt === maxRetries) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }

    /**
     * Intelligent provider selection with fallback
     */
    async callLLMWithFallback(prompt, preferredProvider = 'qwen2.5-coder:7b', task = 'documentation') {
        // Define provider chains based on task type
        const providerChains = {
            documentation: ['ollama:qwen2.5-coder:7b', 'gemini', 'claude', 'groq', 'openai'],
            analysis: ['claude', 'gemini', 'groq', 'openai', 'ollama:qwen2.5:3b'],
            html: ['gemini', 'claude', 'groq', 'openai'],
            idle: ['ollama:qwen2.5-coder:7b', 'ollama:qwen2.5:3b'] // Idle tasks use only local models
        };
        
        const providers = providerChains[task] || providerChains.documentation;
        
        // Put preferred provider first if specified
        if (preferredProvider && !preferredProvider.startsWith('ollama:')) {
            const index = providers.indexOf(preferredProvider);
            if (index > 0) {
                providers.splice(index, 1);
                providers.unshift(preferredProvider);
            }
        }
        
        for (const provider of providers) {
            try {
                let actualProvider, model;
                
                if (provider.startsWith('ollama:')) {
                    [actualProvider, model] = provider.split(':').slice(0, 2);
                    model = provider.split(':').slice(1).join(':'); // Handle model names with colons
                } else {
                    actualProvider = provider;
                    model = null;
                }
                
                await this.log(`🤖 Trying ${actualProvider}${model ? ` (${model})` : ''}...`);
                const response = await this.callLLMViaMCP(actualProvider, prompt, model);
                
                if (response && response.length > 50 && !response.toLowerCase().includes('error')) {
                    await this.log(`✅ Success with ${actualProvider}${model ? ` (${model})` : ''}`);
                    return response;
                }
            } catch (error) {
                await this.log(`⚠️ ${provider} failed: ${error.message}`, 'WARN');
                continue;
            }
        }
        
        throw new Error('All LLM providers failed');
    }

    /**
     * Monitor activity and trigger idle crawling
     */
    startActivityMonitoring() {
        setInterval(() => {
            const now = Date.now();
            const idleTime = now - this.lastActivity;
            
            if (idleTime > this.idleThreshold && !this.isIdleCrawling && this.primeDirectiveActive) {
                this.log('🌙 Idle threshold reached, starting documentation crawl');
                this.startIdleCrawl();
            }
        }, 60000); // Check every minute
    }

    /**
     * Update activity timestamp (call when user is active)
     */
    updateActivity() {
        this.lastActivity = Date.now();
        if (this.isIdleCrawling) {
            this.log('👤 User activity detected, pausing idle crawl');
            this.isIdleCrawling = false;
        }
    }

    /**
     * Start idle documentation crawling
     */
    async startIdleCrawl() {
        if (this.isIdleCrawling) return;
        
        this.isIdleCrawling = true;
        await this.log('🔍 Starting idle documentation crawl with Qwen');
        
        try {
            // Find undocumented files
            const files = await this.findUndocumentedFiles();
            
            for (const file of files) {
                // Check if still idle
                if (Date.now() - this.lastActivity < this.idleThreshold) {
                    await this.log('👤 User returned, stopping idle crawl');
                    this.isIdleCrawling = false;
                    return;
                }
                
                await this.documentFileIdle(file);
                
                // Rate limiting for idle crawling (be gentle)
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
            
        } catch (error) {
            await this.log(`Idle crawl error: ${error.message}`, 'ERROR');
        } finally {
            this.isIdleCrawling = false;
        }
    }

    /**
     * Find files that need documentation
     */
    async findUndocumentedFiles() {
        const extensions = ['.js', '.py', '.sh', '.md'];
        const excludeDirs = ['node_modules', '.git', 'logs', 'backups', 'deprecated'];
        const undocumented = [];
        
        const scanDir = async (dir) => {
            try {
                const entries = await fs.readdir(dir, { withFileTypes: true });
                
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    
                    if (entry.isDirectory() && !excludeDirs.includes(entry.name)) {
                        await scanDir(fullPath);
                    } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
                        const relativePath = path.relative(this.baseDir, fullPath);
                        const docPath = path.join(this.inputDir, relativePath.replace(/\.[^/.]+$/, '.md'));
                        
                        try {
                            await fs.access(docPath);
                        } catch {
                            // No documentation exists, add to list
                            undocumented.push(fullPath);
                        }
                    }
                }
            } catch (error) {
                // Skip directories we can't read
            }
        };
        
        await scanDir(this.baseDir);
        return undocumented.slice(0, 50); // Limit to 50 files per session
    }

    /**
     * Document a single file during idle time
     */
    async documentFileIdle(filePath) {
        try {
            const relativePath = path.relative(this.baseDir, filePath);
            await this.log(`📄 Documenting: ${relativePath}`);
            
            const content = await fs.readFile(filePath, 'utf-8');
            const extension = path.extname(filePath);
            
            const prompt = `Please analyze and document this ${extension} file. Provide:

1. **Purpose**: What this file does
2. **Key Functions**: Main functions/components (if applicable)  
3. **Dependencies**: What it relies on
4. **Usage**: How to use/call it
5. **Notes**: Any important implementation details

File: ${relativePath}
Content:
\`\`\`${extension.substring(1)}
${content}
\`\`\`

Generate concise technical documentation in Markdown format.`;

            const documentation = await this.callLLMWithFallback(prompt, 'ollama:qwen2.5-coder:7b', 'idle');
            
            // Save documentation
            const outputPath = path.join(this.inputDir, relativePath.replace(/\.[^/.]+$/, '.md'));
            await fs.mkdir(path.dirname(outputPath), { recursive: true });
            await fs.writeFile(outputPath, documentation, 'utf-8');
            
            await this.log(`✅ Documented: ${relativePath} -> ${path.relative(this.baseDir, outputPath)}`);
            
        } catch (error) {
            await this.log(`Failed to document ${filePath}: ${error.message}`, 'ERROR');
        }
    }

    /**
     * Manual document sweep (existing functionality with rate limiting)
     */
    async runDocumentSweep(targetDir = null) {
        await this.log('🚀 Starting manual document sweep');
        this.updateActivity();
        
        const scanDirs = targetDir ? [targetDir] : [
            path.join(this.baseDir, 'rEngine'),
            path.join(this.baseDir, 'rScribe'),
            path.join(this.baseDir, 'scripts'),
            path.join(this.baseDir, 'bin')
        ];
        
        for (const dir of scanDirs) {
            await this.sweepDirectory(dir);
        }
        
        await this.log('✅ Document sweep completed');
    }

    /**
     * Sweep a directory for documentation
     */
    async sweepDirectory(dir) {
        try {
            const files = await fs.readdir(dir, { recursive: true });
            const scriptFiles = files.filter(file => 
                (file.endsWith('.js') || file.endsWith('.py') || file.endsWith('.sh')) &&
                !file.includes('node_modules') &&
                !file.includes('.git')
            );
            
            for (const file of scriptFiles) {
                const fullPath = path.join(dir, file);
                const stat = await fs.lstat(fullPath);
                
                if (stat.isFile()) {
                    await this.documentFileIdle(fullPath);
                }
            }
        } catch (error) {
            await this.log(`Error sweeping ${dir}: ${error.message}`, 'ERROR');
        }
    }

    /**
     * Generate HTML documentation using Gemini
     */
    async generateHTML() {
        await this.log('🌐 Starting HTML generation with Gemini');
        this.updateActivity();
        
        try {
            // Find all markdown files in rDocuments/autogen
            const docsDir = path.join(this.baseDir, 'rDocuments/autogen');
            const htmlDir = path.join(this.baseDir, 'rDocuments/html');
            
            await fs.mkdir(htmlDir, { recursive: true });
            
            const markdownFiles = await this.findMarkdownFiles(docsDir);
            await this.log(`📄 Found ${markdownFiles.length} markdown files to convert`);
            
            let converted = 0;
            for (const mdFile of markdownFiles) {
                await this.convertMarkdownToHTML(mdFile, docsDir, htmlDir);
                converted++;
                
                // Rate limiting: Gemini has 15 requests/minute
                if (converted % 10 === 0) {
                    await this.log(`⏱️  Rate limiting: converted ${converted}/${markdownFiles.length}, pausing...`);
                    await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second pause every 10 files
                }
            }
            
            await this.log(`✅ HTML generation completed: ${converted} files converted via Gemini`);
            return `Converted ${converted} markdown files to HTML`;
            
        } catch (error) {
            await this.log(`HTML generation failed: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    /**
     * Find all markdown files recursively
     */
    async findMarkdownFiles(dir) {
        const files = [];
        
        const scanDir = async (currentDir) => {
            try {
                const entries = await fs.readdir(currentDir, { withFileTypes: true });
                
                for (const entry of entries) {
                    const fullPath = path.join(currentDir, entry.name);
                    
                    if (entry.isDirectory()) {
                        await scanDir(fullPath);
                    } else if (entry.isFile() && entry.name.endsWith('.md')) {
                        files.push(fullPath);
                    }
                }
            } catch (error) {
                // Skip directories we can't read
            }
        };
        
        await scanDir(dir);
        return files;
    }

    /**
     * Convert a single markdown file to HTML using Gemini
     */
    async convertMarkdownToHTML(mdFilePath, sourceDir, outputDir) {
        try {
            const relativePath = path.relative(sourceDir, mdFilePath);
            const htmlPath = path.join(outputDir, relativePath.replace('.md', '.html'));
            
            // Ensure output directory exists
            await fs.mkdir(path.dirname(htmlPath), { recursive: true });
            
            // Read markdown content
            const markdownContent = await fs.readFile(mdFilePath, 'utf-8');
            
            if (markdownContent.length < 100) {
                await this.log(`⚠️  Skipping short file: ${relativePath}`);
                return;
            }
            
            const prompt = `Convert this technical markdown documentation to high-quality HTML with proper formatting, syntax highlighting, and navigation.

Requirements:
- Include proper HTML5 structure with head, meta tags, and body
- Add CSS styling for code blocks, tables, and technical content
- Use syntax highlighting for code examples
- Create a clean, professional technical documentation style
- Maintain all markdown formatting and structure
- Add a navigation header with the document title
- Use responsive design principles

Markdown Content:
\`\`\`markdown
${markdownContent}
\`\`\`

Generate complete HTML document:`;

            await this.log(`🔄 Converting ${relativePath} via Gemini...`);
            
            const htmlContent = await this.callLLMViaMCP('gemini', prompt);
            
            // Clean up the HTML (remove markdown code blocks if any)
            let cleanHTML = htmlContent;
            if (htmlContent.includes('```html')) {
                const htmlMatch = htmlContent.match(/```html\s*([\s\S]*?)\s*```/);
                if (htmlMatch) {
                    cleanHTML = htmlMatch[1];
                }
            }
            
            await fs.writeFile(htmlPath, cleanHTML, 'utf-8');
            await this.log(`✅ Converted: ${relativePath} -> ${path.relative(this.baseDir, htmlPath)}`);
            
        } catch (error) {
            await this.log(`Failed to convert ${mdFilePath}: ${error.message}`, 'ERROR');
        }
    }

    /**
     * CLI argument parser
     */
    parseArguments(args) {
        const config = {
            action: 'help',
            provider: 'auto',
            prompt: null,
            file: null,
            rateLimit: null,
            duration: '30m',
            model: null
        };
        
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            const next = args[i + 1];
            
            switch (arg) {
                case '--idle-crawl':
                    config.action = 'idle-crawl';
                    break;
                case '--document-sweep':
                    config.action = 'document-sweep';
                    break;
                case '--html-sweep':
                    config.action = 'html-sweep';
                    break;
                case '--provider':
                    config.provider = next;
                    i++;
                    break;
                case '--prompt':
                    config.prompt = next;
                    config.action = 'api-call'; // Set action when prompt is provided
                    i++;
                    break;
                case '--file':
                    config.file = next;
                    i++;
                    break;
                case '--rate-limit':
                    config.rateLimit = parseInt(next);
                    i++;
                    break;
                case '--duration':
                    config.duration = next;
                    i++;
                    break;
                case '--model':
                    config.model = next;
                    i++;
                    break;
                case '--help':
                    config.action = 'help';
                    break;
            }
        }
        
        return config;
    }

    /**
     * Show help information
     */
    showHelp() {
        console.log(`
🚀 rEngine Document Scribe - Unified API Communication & Documentation System

Usage:
  node document-scribe.js [options]

Actions:
  --idle-crawl              Start idle documentation crawling
  --document-sweep          Run manual document sweep
  --html-sweep              Generate HTML documentation
  
API Communication:
  --provider <name>         Specify provider: claude, gemini, groq, openai, ollama
  --model <model>           Specify model (e.g., qwen2.5-coder:7b for ollama)
  --prompt <text>           Direct prompt to send
  --file <path>             Document specific file
  --rate-limit <num>        Custom rate limit (requests per minute)
  
Options:
  --duration <time>         Idle crawl duration (default: 30m)
  --help                    Show this help

Examples:
  node document-scribe.js --provider gemini --prompt "Analyze this API"
  node document-scribe.js --idle-crawl --duration 1h
  node document-scribe.js --document-sweep --file script.js
  node document-scribe.js --html-sweep
  node document-scribe.js --provider ollama --model qwen2.5-coder:7b --file myfile.js

Environment Variables:
  CLAUDE_API_KEY           Claude API key
  GEMINI_API_KEY          Gemini API key  
  GROQ_API_KEY            Groq API key
  OPENAI_API_KEY          OpenAI API key
  
Rate Limits (default):
  Claude:  60/min, 1000/hour
  Gemini:  15/min, 1500/hour
  Groq:    30/min, 14400/hour
  OpenAI:  500/min, 10000/hour
  Ollama:  Unlimited (local)
`);
    }

    /**
     * Main execution method
     */
    async run(args = []) {
        const config = this.parseArguments(args);
        
        try {
            // Handle direct prompts with API communication
            if (config.action === 'api-call' && config.prompt && config.provider !== 'auto') {
                await this.log(`🤖 Sending prompt to ${config.provider}${config.model ? ` (${config.model})` : ''}`);
                
                if (config.rateLimit) {
                    this.rateLimits[config.provider] = { 
                        rpm: config.rateLimit, 
                        rph: config.rateLimit * 60 
                    };
                }
                
                const response = await this.callLLMViaMCP(config.provider, config.prompt, config.model);
                console.log('\n--- Response ---');
                console.log(response);
                console.log('\n--- End Response ---');
                return;
            }
            
            switch (config.action) {
                case 'idle-crawl':
                    this.startActivityMonitoring();
                    await this.startIdleCrawl();
                    break;
                    
                case 'document-sweep':
                    await this.runDocumentSweep(config.file);
                    break;
                    
                case 'html-sweep':
                    await this.generateHTML();
                    break;
                    
                case 'help':
                default:
                    this.showHelp();
                    break;
            }
        } catch (error) {
            await this.log(`Execution failed: ${error.message}`, 'ERROR');
            process.exit(1);
        }
    }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
    const scribe = new DocumentScribe();
    scribe.run(process.argv.slice(2));
}

export default DocumentScribe;
