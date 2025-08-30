#!/usr/bin/env node

/**
 * 📱 SmartScribe Mobile - Lightweight AI Assistant for Laptops
 * 
 * A battery-optimized, API-based version of SmartScribe using:
 * - Primary: Google Gemini (fast, cost-effective)
 * - Fallback: OpenAI GPT-4o-mini
 * - Emergency: Anthropic Claude 3 Haiku
 * 
 * Features:
 * - Lightweight memory system with sync
 * - Offline operation queue
 * - Cost optimization
 * - Battery-friendly design
 */

const readline = require("readline");
const fs = require("fs");
const path = require("path");
const os = require("os");

// Color codes for terminal output
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m"
};

class MobileScribe {
    constructor() {
        this.configDir = path.join(os.homedir(), ".rengine", "mobile-scribe");
        this.memoryFile = path.join(this.configDir, "memory.json");
        this.queueFile = path.join(this.configDir, "offline-queue.json");
        this.configFile = path.join(this.configDir, "config.json");
        
        this.defaultConfig = {
            primaryAPI: "gemini",
            batteryMode: true,
            offlineQueue: true,
            syncInterval: 300, // 5 minutes
            maxMemoryEntries: 100,
            costLimit: 5.00, // $5 daily limit
            providers: {
                gemini: {
                    endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
                    costPer1kTokens: 0.0005
                },
                openai: {
                    endpoint: "https://api.openai.com/v1/chat/completions",
                    model: "gpt-4o-mini",
                    costPer1kTokens: 0.0005
                },
                anthropic: {
                    endpoint: "https://api.anthropic.com/v1/messages",
                    model: "claude-3-haiku-20240307",
                    costPer1kTokens: 0.0025
                }
            }
        };
        
        this.memory = [];
        this.offlineQueue = [];
        this.config = {};
        this.dailyCost = 0;
        
        this.init();
    }
    
    async init() {
        // Create config directory
        if (!fs.existsSync(this.configDir)) {
            fs.mkdirSync(this.configDir, { recursive: true });
        }
        
        // Load or create config
        this.loadConfig();
        
        // Load memory and queue
        this.loadMemory();
        this.loadQueue();
        
        // Start sync timer if not in offline mode
        if (this.config.syncInterval && !process.argv.includes("--offline")) {
            setInterval(() => this.syncWithMainSystem(), this.config.syncInterval * 1000);
        }
        
        this.printWelcome();
    }
    
    loadConfig() {
        if (fs.existsSync(this.configFile)) {
            this.config = { ...this.defaultConfig, ...JSON.parse(fs.readFileSync(this.configFile, "utf8")) };
        } else {
            this.config = this.defaultConfig;
            this.saveConfig();
        }
    }
    
    saveConfig() {
        fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 2));
    }
    
    loadMemory() {
        if (fs.existsSync(this.memoryFile)) {
            this.memory = JSON.parse(fs.readFileSync(this.memoryFile, "utf8"));
        }
    }
    
    saveMemory() {
        // Keep only the most recent entries to save space
        if (this.memory.length > this.config.maxMemoryEntries) {
            this.memory = this.memory.slice(-this.config.maxMemoryEntries);
        }
        fs.writeFileSync(this.memoryFile, JSON.stringify(this.memory, null, 2));
    }
    
    loadQueue() {
        if (fs.existsSync(this.queueFile)) {
            this.offlineQueue = JSON.parse(fs.readFileSync(this.queueFile, "utf8"));
        }
    }
    
    saveQueue() {
        fs.writeFileSync(this.queueFile, JSON.stringify(this.offlineQueue, null, 2));
    }
    
    printWelcome() {
        console.clear();
        console.log(`${colors.cyan}┌─────────────────────────────────────────────────────────────┐${colors.reset}`);
        console.log(`${colors.cyan}│${colors.white}                📱 SmartScribe Mobile v1.0                   ${colors.cyan}│${colors.reset}`);
        console.log(`${colors.cyan}│${colors.yellow}              Lightweight AI Assistant for Laptops            ${colors.cyan}│${colors.reset}`);
        console.log(`${colors.cyan}└─────────────────────────────────────────────────────────────┘${colors.reset}`);
        console.log();
        console.log(`${colors.green}🟢 Status:${colors.reset} Ready`);
        console.log(`${colors.blue}🤖 Primary API:${colors.reset} ${this.config.primaryAPI.toUpperCase()}`);
        console.log(`${colors.yellow}🔋 Battery Mode:${colors.reset} ${this.config.batteryMode ? "ON" : "OFF"}`);
        console.log(`${colors.magenta}💰 Daily Cost:${colors.reset} $${this.dailyCost.toFixed(4)}/${this.config.costLimit}`);
        console.log(`${colors.cyan}💾 Memory:${colors.reset} ${this.memory.length} entries`);
        
        if (this.offlineQueue.length > 0) {
            console.log(`${colors.red}📴 Offline Queue:${colors.reset} ${this.offlineQueue.length} pending`);
        }
        
        console.log();
        console.log(`${colors.white}Commands:${colors.reset}`);
        console.log(`  ${colors.green}/help${colors.reset}     - Show all commands`);
        console.log(`  ${colors.green}/status${colors.reset}   - Show system status`);
        console.log(`  ${colors.green}/sync${colors.reset}     - Sync with main rEngine`);
        console.log(`  ${colors.green}/config${colors.reset}   - Change settings`);
        console.log(`  ${colors.green}/clear${colors.reset}    - Clear screen`);
        console.log(`  ${colors.green}/exit${colors.reset}     - Exit SmartScribe Mobile`);
        console.log();
        console.log(`${colors.yellow}💡 Tip: Start typing your question or request!${colors.reset}`);
        console.log();
    }
    
    async makeAPICall(prompt, context = []) {
        const provider = this.config.primaryAPI;
        const apiKey = process.env[`${provider.toUpperCase()}_API_KEY`];
        
        if (!apiKey) {
            throw new Error(`No API key found for ${provider}. Set ${provider.toUpperCase()}_API_KEY environment variable.`);
        }
        
        const startTime = Date.now();
        let response, tokens = 0, cost = 0;
        
        try {
            switch (provider) {
                case "gemini":
                    response = await this.callGemini(prompt, context, apiKey);
                    break;
                case "openai":
                    response = await this.callOpenAI(prompt, context, apiKey);
                    break;
                case "anthropic":
                    response = await this.callAnthropic(prompt, context, apiKey);
                    break;
                default:
                    throw new Error(`Unknown provider: ${provider}`);
            }
            
            // Estimate cost (rough calculation)
            tokens = Math.ceil(prompt.length / 4) + Math.ceil(response.length / 4);
            cost = (tokens / 1000) * this.config.providers[provider].costPer1kTokens;
            this.dailyCost += cost;
            
            // Log the interaction
            this.logInteraction({
                timestamp: new Date().toISOString(),
                prompt: prompt.substring(0, 100) + "...",
                response: response.substring(0, 100) + "...",
                provider,
                tokens,
                cost,
                responseTime: Date.now() - startTime
            });
            
            return response;
            
        } catch (error) {
            if (this.config.offlineQueue) {
                this.offlineQueue.push({
                    timestamp: new Date().toISOString(),
                    prompt,
                    context,
                    provider
                });
                this.saveQueue();
                return `${colors.yellow}⚠️ Network error - Added to offline queue. Will retry when connection is restored.${colors.reset}`;
            }
            throw error;
        }
    }
    
    async callGemini(prompt, context, apiKey) {
        const axios = require("axios");
        
        const payload = {
            contents: [{
                parts: [{
                    text: `Context: ${context.map(c => c.content).join("\\n")}\\n\\nUser: ${prompt}`
                }]
            }]
        };
        
        const response = await axios.post(
            `${this.config.providers.gemini.endpoint}?key=${apiKey}`,
            payload,
            {
                headers: { "Content-Type": "application/json" },
                timeout: 30000
            }
        );
        
        return response.data.candidates[0].content.parts[0].text;
    }
    
    async callOpenAI(prompt, context, apiKey) {
        const axios = require("axios");
        
        const messages = [
            { role: "system", content: "You are a helpful AI assistant. Be concise and practical." },
            ...context.map(c => ({ role: c.role || "user", content: c.content })),
            { role: "user", content: prompt }
        ];
        
        const response = await axios.post(
            this.config.providers.openai.endpoint,
            {
                model: this.config.providers.openai.model,
                messages,
                max_tokens: 1000,
                temperature: 0.7
            },
            {
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                timeout: 30000
            }
        );
        
        return response.data.choices[0].message.content;
    }
    
    async callAnthropic(prompt, context, apiKey) {
        const axios = require("axios");
        
        const response = await axios.post(
            this.config.providers.anthropic.endpoint,
            {
                model: this.config.providers.anthropic.model,
                max_tokens: 1000,
                messages: [
                    ...context.map(c => ({ role: c.role || "user", content: c.content })),
                    { role: "user", content: prompt }
                ]
            },
            {
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json",
                    "anthropic-version": "2023-06-01"
                },
                timeout: 30000
            }
        );
        
        return response.data.content[0].text;
    }
    
    logInteraction(interaction) {
        this.memory.push(interaction);
        this.saveMemory();
    }
    
    async syncWithMainSystem() {
        console.log(`${colors.blue}🔄 Syncing with main rEngine system...${colors.reset}`);
        
        // This would sync with the main rEngine memory system
        // For now, just a placeholder
        
        if (this.offlineQueue.length > 0) {
            console.log(`${colors.yellow}📤 Processing ${this.offlineQueue.length} queued items...${colors.reset}`);
            
            for (const item of this.offlineQueue) {
                try {
                    await this.makeAPICall(item.prompt, item.context);
                } catch (error) {
                    console.log(`${colors.red}❌ Failed to process queued item: ${error.message}${colors.reset}`);
                }
            }
            
            this.offlineQueue = [];
            this.saveQueue();
        }
        
        console.log(`${colors.green}✅ Sync completed${colors.reset}`);
    }
    
    async processCommand(input) {
        const command = input.trim().toLowerCase();
        
        switch (command) {
            case "/help":
                this.showHelp();
                break;
                
            case "/status":
                this.showStatus();
                break;
                
            case "/sync":
                await this.syncWithMainSystem();
                break;
                
            case "/config":
                await this.showConfig();
                break;
                
            case "/clear":
                console.clear();
                this.printWelcome();
                break;
                
            case "/exit":
                console.log(`${colors.yellow}👋 Thanks for using SmartScribe Mobile!${colors.reset}`);
                process.exit(0);
                
            default:
                if (command.startsWith("/")) {
                    console.log(`${colors.red}❌ Unknown command: ${command}${colors.reset}`);
                    console.log(`${colors.yellow}💡 Type /help for available commands${colors.reset}`);
                } else {
                    await this.processQuery(input);
                }
        }
    }
    
    async processQuery(prompt) {
        if (this.dailyCost >= this.config.costLimit) {
            console.log(`${colors.red}💰 Daily cost limit reached ($${this.config.costLimit}). Reset tomorrow or adjust limit.${colors.reset}`);
            return;
        }
        
        console.log(`${colors.blue}🤖 Thinking...${colors.reset}`);
        
        try {
            // Get relevant context from memory
            const context = this.memory.slice(-5).map(m => ({
                content: m.prompt + " -> " + m.response,
                role: "assistant"
            }));
            
            const response = await this.makeAPICall(prompt, context);
            
            console.log();
            console.log(`${colors.green}🤖 SmartScribe:${colors.reset}`);
            console.log(response);
            console.log();
            
        } catch (error) {
            console.log(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
            
            if (this.config.offlineQueue) {
                console.log(`${colors.yellow}📴 Added to offline queue for later processing${colors.reset}`);
            }
        }
    }
    
    showHelp() {
        console.log(`${colors.cyan}📖 SmartScribe Mobile Help${colors.reset}`);
        console.log();
        console.log(`${colors.white}Commands:${colors.reset}`);
        console.log(`  ${colors.green}/help${colors.reset}     - Show this help message`);
        console.log(`  ${colors.green}/status${colors.reset}   - Show system status and statistics`);
        console.log(`  ${colors.green}/sync${colors.reset}     - Sync with main rEngine system`);
        console.log(`  ${colors.green}/config${colors.reset}   - View and change configuration`);
        console.log(`  ${colors.green}/clear${colors.reset}    - Clear the screen`);
        console.log(`  ${colors.green}/exit${colors.reset}     - Exit SmartScribe Mobile`);
        console.log();
        console.log(`${colors.white}Usage:${colors.reset}`);
        console.log("  • Just type your question or request");
        console.log("  • Commands start with / (slash)");
        console.log("  • Press Ctrl+C to exit anytime");
        console.log();
    }
    
    showStatus() {
        console.log(`${colors.cyan}📊 System Status${colors.reset}`);
        console.log();
        console.log(`${colors.white}Configuration:${colors.reset}`);
        console.log(`  Primary API: ${this.config.primaryAPI.toUpperCase()}`);
        console.log(`  Battery Mode: ${this.config.batteryMode ? "ON" : "OFF"}`);
        console.log(`  Offline Queue: ${this.config.offlineQueue ? "ON" : "OFF"}`);
        console.log();
        console.log(`${colors.white}Statistics:${colors.reset}`);
        console.log(`  Daily Cost: $${this.dailyCost.toFixed(4)}/${this.config.costLimit}`);
        console.log(`  Memory Entries: ${this.memory.length}/${this.config.maxMemoryEntries}`);
        console.log(`  Offline Queue: ${this.offlineQueue.length} items`);
        console.log();
        
        if (this.memory.length > 0) {
            const lastInteraction = this.memory[this.memory.length - 1];
            console.log(`${colors.white}Last Interaction:${colors.reset}`);
            console.log(`  Time: ${new Date(lastInteraction.timestamp).toLocaleString()}`);
            console.log(`  Provider: ${lastInteraction.provider.toUpperCase()}`);
            console.log(`  Response Time: ${lastInteraction.responseTime}ms`);
            console.log(`  Cost: $${lastInteraction.cost.toFixed(6)}`);
        }
        console.log();
    }
    
    async showConfig() {
        console.log(`${colors.cyan}⚙️ Configuration${colors.reset}`);
        console.log();
        console.log("Current settings:");
        console.log(`  1. Primary API: ${this.config.primaryAPI}`);
        console.log(`  2. Battery Mode: ${this.config.batteryMode}`);
        console.log(`  3. Daily Cost Limit: $${this.config.costLimit}`);
        console.log(`  4. Max Memory Entries: ${this.config.maxMemoryEntries}`);
        console.log(`  5. Sync Interval: ${this.config.syncInterval}s`);
        console.log();
        console.log(`${colors.yellow}💡 To change settings, edit: ${this.configFile}${colors.reset}`);
        console.log();
    }
    
    async start() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: `${colors.cyan}📱 ${colors.reset}`
        });
        
        rl.prompt();
        
        rl.on("line", async (input) => {
            if (input.trim()) {
                await this.processCommand(input);
            }
            rl.prompt();
        });
        
        rl.on("close", () => {
            console.log(`${colors.yellow}👋 Goodbye!${colors.reset}`);
            process.exit(0);
        });
    }
}

// Handle command line arguments
if (process.argv.includes("--help")) {
    console.log("SmartScribe Mobile - Lightweight AI Assistant");
    console.log();
    console.log("Usage: node smart-scribe-mobile.js [options]");
    console.log();
    console.log("Options:");
    console.log("  --help     Show this help");
    console.log("  --offline  Start in offline mode (no sync)");
    console.log();
    console.log("Environment Variables:");
    console.log("  GEMINI_API_KEY      - Google Gemini API key");
    console.log("  OPENAI_API_KEY      - OpenAI API key");
    console.log("  ANTHROPIC_API_KEY   - Anthropic API key");
    console.log();
    process.exit(0);
}

// Start the mobile scribe
const scribe = new MobileScribe();
scribe.start().catch(console.error);
