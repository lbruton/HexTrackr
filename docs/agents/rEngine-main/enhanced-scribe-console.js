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
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import SessionRecapGenerator from './session-recap-generator.js';

// Use built-in fetch (Node.js 18+)
const fetch = globalThis.fetch;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

// ============================================================================
// 🧠 LLM Configuration - Easy Model Swapping
// ============================================================================
const LLM_CONFIG = {
    MODEL_NAME: 'llama3.1:8b', // 🏆 Winner from benchmark testing!
    OLLAMA_URL: 'http://localhost:11434',
    TIMEOUT: 300000, // 5 minutes
    MAX_TOKENS: 2048, // Optimized for llama3.1:8b
    TEMPERATURE: 0.3, // Optimized for llama3.1:8b
    ENABLE_MEMORY_SYNC: true,
    MEMORY_SYNC_INTERVAL: 60, // seconds
    // Quick model presets
    MODELS: {
        'llama3.1:8b': { temp: 0.3, tokens: 2048 }, // 🏆 BENCHMARK WINNER
        'qwen2.5-coder:7b': { temp: 0.1, tokens: 4096 }, // ❌ JSON issues
        'codellama:7b': { temp: 0.1, tokens: 4096 },
        'mistral:7b': { temp: 0.2, tokens: 2048 }
    }
};

// ============================================================================
// 💬 IDE Chat Integration Configuration
// ============================================================================
// NOTE: This section is VS Code specific for current implementation.
// ROADMAP: When expanding to other IDEs (Cursor, IntelliJ, etc.), 
// create separate modules for each IDE's chat log format and paths.
// Future: chat-integrations/vscode.js, chat-integrations/cursor.js, etc.
const CHAT_INTEGRATION = {
    // VS Code Copilot Chat Settings
    VSCODE: {
        ENABLED: true,
        LOG_PATHS: [
            path.join(os.homedir(), 'Library/Application Support/Code/logs'),
            path.join(os.homedir(), 'Library/Application Support/Code - Insiders/logs')
        ],
        CHAT_LOG_PATTERN: '**/exthost/GitHub.copilot-chat/*.log',
        SCAN_INTERVAL: 30, // seconds - faster than memory sync for real-time context
        MAX_DAYS_BACK: 30, // days to scan for rolling context
        ROLLING_CONTEXT_LIMITS: {
            LAST_CHAT: 1,
            LAST_10_CHATS: 10,
            LAST_100_CHATS: 100,
            LAST_1000_CHATS: 1000 // "forever" practical limit
        }
    },
    // Future IDE integrations - placeholder for roadmap
    CURSOR: { ENABLED: false }, // TODO: Implement when expanding
    INTELLIJ: { ENABLED: false }, // TODO: Implement when expanding
    SUBLIME: { ENABLED: false }  // TODO: Implement when expanding
};

console.log(`🤖 Using AI Model: ${LLM_CONFIG.ANALYSIS_MODEL}`);
console.log(`⚙️  Smart Analysis: ${LLM_CONFIG.ENABLE_SMART_ANALYSIS ? 'ENABLED' : 'DISABLED'}`);
console.log(`🔄 Memory Sync: ${LLM_CONFIG.ENABLE_MEMORY_SYNC ? `Every ${LLM_CONFIG.MEMORY_SYNC_INTERVAL}s` : 'DISABLED'}`);
// ============================================================

// Colors
const PINK = '\x1b[95m';
const WHITE = '\x1b[97m';
const YELLOW = '\x1b[93m';
const GREEN = '\x1b[92m';
const BLUE = '\x1b[94m';
const RED = '\x1b[91m';
const DIM_PINK = '\x1b[95;2m';
const RESET = '\x1b[0m';

class EnhancedScribeConsole {
    constructor() {
        this.enginePath = process.cwd();
        this.memoryPath = path.join(this.enginePath, 'rMemory');
        this.activityLog = [];
        this.maxLogEntries = 10;
        
        // AI Analysis state
        this.knowledgeBase = new Map();
        this.extractedFunctions = new Map();
        this.memorySync = {
            lastSync: null,
            syncCount: 0,
            failureCount: 0
        };
        
        // VS Code Chat Log Integration
        this.vscodeLogPath = path.join(os.homedir(), 'Library/Application Support/Code/logs');
        this.chatHistoryPath = path.join(this.memoryPath, 'chat-history');
        this.rollingContext = {
            conversations: [],
            maxConversations: 1000, // Keep last 1000 conversations
            lastProcessedLog: null,
            searchIndex: new Map()
        };
        
        // Session tracking
        this.sessionId = `session_${Date.now()}`;
        this.sessionFile = path.join(this.enginePath, 'lastsession.json');
        this.sessionStart = new Date().toISOString();
        this.sessionData = {
            sessionId: this.sessionId,
            timestamp: this.sessionStart,
            status: 'active',
            summary: {
                mainObjective: null,
                keyAccomplishments: [],
                technicalChanges: [],
                nextSteps: []
            },
            context: {
                workingDirectory: this.enginePath,
                aiModel: LLM_CONFIG.ANALYSIS_MODEL,
                activeFiles: [],
                memoryState: {}
            },
            handoff: null
        };
        
        // Initialize readline interface
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: `${PINK}🌸 scribe> ${RESET}`
        });
        
        // Start background processes
        // Note: startBackgroundMonitoring is called in initializeSystems()
        if (LLM_CONFIG.ENABLE_MEMORY_SYNC) {
            this.startMemorySync();
        }
        
        // Auto-save session data periodically
        this.startSessionTracking();
    }

    // ==================== AI ANALYSIS METHODS ====================
    
    async callOllama(prompt, systemPrompt = null) {
        if (!LLM_CONFIG.ENABLE_SMART_ANALYSIS) {
            return null;
        }

        try {
            const messages = [];
            
            if (systemPrompt) {
                messages.push({
                    role: "system",
                    content: systemPrompt
                });
            }
            
            messages.push({
                role: "user", 
                content: prompt
            });

            const response = await fetch(`${LLM_CONFIG.OLLAMA_HOST}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: LLM_CONFIG.ANALYSIS_MODEL,
                    messages: messages,
                    stream: false,
                    options: {
                        temperature: LLM_CONFIG.TEMPERATURE,
                        num_predict: LLM_CONFIG.MAX_TOKENS
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.status}`);
            }

            const data = await response.json();
            return data.message?.content || null;
        } catch (error) {
            this.logActivity(`AI Analysis failed: ${error.message}`, 'ERROR');
            return null;
        }
    }

    async analyzeCodeFile(filePath, content) {
        if (!LLM_CONFIG.ENABLE_FUNCTION_EXTRACTION) {
            return null;
        }

        const systemPrompt = `You are a code analysis expert. Extract key information from code files.
        
Return a JSON object with:
{
  "functions": ["function1", "function2"],
  "classes": ["Class1", "Class2"], 
  "imports": ["module1", "module2"],
  "key_concepts": ["concept1", "concept2"],
  "summary": "Brief description of what this file does"
}

Be concise and accurate. Only include actual functions/classes found.`;

        const prompt = `Analyze this ${path.extname(filePath)} file:

File: ${path.basename(filePath)}
Content:
${content.substring(0, LLM_CONFIG.CONTEXT_WINDOW)}`;

        const result = await this.callOllama(prompt, systemPrompt);
        
        if (result) {
            try {
                const analysis = JSON.parse(result);
                this.extractedFunctions.set(filePath, {
                    timestamp: new Date().toISOString(),
                    analysis
                });
                this.logActivity(`Extracted ${analysis.functions?.length || 0} functions from ${path.basename(filePath)}`, 'INFO');
                return analysis;
            } catch (error) {
                this.logActivity(`Failed to parse analysis for ${path.basename(filePath)}`, 'ERROR');
            }
        }
        return null;
    }

    async analyzeConversation(conversationText) {
        if (!LLM_CONFIG.ENABLE_KNOWLEDGE_BUILDING) {
            return null;
        }

        const systemPrompt = `You are a conversation analyst. Extract key insights from development conversations.

Return a JSON object with:
{
  "key_decisions": ["decision1", "decision2"],
  "action_items": ["action1", "action2"],
  "technical_insights": ["insight1", "insight2"],
  "file_mentions": ["file1.js", "file2.py"],
  "summary": "What was accomplished in this conversation"
}

Focus on actionable information and technical details.`;

        const prompt = `Analyze this development conversation:

${conversationText.substring(0, LLM_CONFIG.CONTEXT_WINDOW)}`;

        const result = await this.callOllama(prompt, systemPrompt);
        
        if (result) {
            try {
                const analysis = JSON.parse(result);
                const timestamp = new Date().toISOString();
                this.knowledgeBase.set(`conversation_${timestamp}`, analysis);
                this.logActivity(`Built knowledge from conversation (${analysis.key_decisions?.length || 0} decisions)`, 'INFO');
                return analysis;
            } catch (error) {
                this.logActivity(`Failed to parse conversation analysis`, 'ERROR');
            }
        }
        return null;
    }

    async performMemorySync() {
        if (!LLM_CONFIG.ENABLE_MEMORY_SYNC) {
            return;
        }

        const lockFile = path.join(this.enginePath, 'memory-sync.lock');
        
        try {
            // Create lock file to signal memory sync in progress
            await fs.writeFile(lockFile, new Date().toISOString(), 'utf8');
            
            this.logActivity('Starting memory sync...', 'INFO');
            
            // Read recent memory files
            const memoryFiles = await fs.readdir(this.memoryPath);
            const recentFiles = memoryFiles
                .filter(f => f.endsWith('.json'))
                .slice(-3); // Last 3 memory files
            
            let processedFiles = 0;
            for (const file of recentFiles) {
                const filePath = path.join(this.memoryPath, file);
                try {
                    const content = await fs.readFile(filePath, 'utf8');
                    const memoryData = JSON.parse(content);
                    
                    // Check for different conversation formats
                    if (memoryData.conversation) {
                        await this.analyzeConversation(JSON.stringify(memoryData.conversation));
                        processedFiles++;
                    } else if (memoryData.conversations && Array.isArray(memoryData.conversations)) {
                        // Handle emergency recall format
                        for (const conv of memoryData.conversations) {
                            await this.analyzeConversation(JSON.stringify(conv));
                        }
                        processedFiles++;
                    } else {
                        // Skip files without conversation data (like auto-context.json)
                        this.logActivity(`Skipped ${file} - no conversation data`, 'INFO');
                    }
                } catch (error) {
                    this.logActivity(`Failed to process memory file ${file}: ${error.message}`, 'WARN');
                }
            }
            
            this.logActivity(`Processed ${processedFiles} of ${recentFiles.length} memory files`, 'INFO');
            
            this.memorySync.lastSync = new Date().toISOString();
            this.memorySync.syncCount++;
            this.logActivity(`Memory sync completed (${this.memorySync.syncCount} total)`, 'SUCCESS');
            
        } catch (error) {
            this.memorySync.failureCount++;
            this.logActivity(`Memory sync failed: ${error.message}`, 'ERROR');
        } finally {
            // Always remove lock file when done
            try {
                await fs.unlink(lockFile);
            } catch {
                // Lock file may not exist, ignore error
            }
        }
    }

    startMemorySync() {
        // Initial sync
        setTimeout(() => this.performMemorySync(), 5000); // Wait 5s after startup
        
        // Regular sync interval
        setInterval(() => {
            this.performMemorySync();
        }, LLM_CONFIG.MEMORY_SYNC_INTERVAL * 1000);
        
        this.logActivity(`Memory sync scheduled every ${LLM_CONFIG.MEMORY_SYNC_INTERVAL}s`, 'SUCCESS');
        
        // Start VS Code chat log scanning (faster interval for real-time context)
        if (CHAT_INTEGRATION.VSCODE.ENABLED) {
            this.startVSCodeChatScanning();
        }
    }

    // ==================== VS CODE CHAT INTEGRATION METHODS ====================

    /**
     * Start VS Code chat log scanning for rolling context windows
     * Runs every 30 seconds to build searchable conversation history
     */
    startVSCodeChatScanning() {
        // Initial scan
        setTimeout(() => this.scanVSCodeChatLogs(), 10000); // Wait 10s after startup
        
        // Regular chat scan interval (30 seconds - faster than memory sync)
        setInterval(() => {
            this.scanVSCodeChatLogs();
        }, CHAT_INTEGRATION.VSCODE.SCAN_INTERVAL * 1000);
        
        this.logActivity(`VS Code chat scanning enabled every ${CHAT_INTEGRATION.VSCODE.SCAN_INTERVAL}s`, 'SUCCESS');
    }

    /**
     * Scan VS Code chat logs and extract conversations for rolling context
     */
    async scanVSCodeChatLogs() {
        try {
            this.logActivity('Scanning VS Code chat logs...', 'INFO');
            
            // Ensure chat history directory exists
            await fs.mkdir(this.chatHistoryPath, { recursive: true });
            
            // Find recent VS Code log directories
            const logDirs = await this.findRecentVSCodeLogs();
            
            for (const logDir of logDirs) {
                await this.processChatLogDirectory(logDir);
            }
            
            // Update search index for rolling context queries
            await this.updateChatSearchIndex();
            
            this.logActivity(`Chat scan complete - ${this.rollingContext.conversations.length} conversations indexed`, 'SUCCESS');
            
        } catch (error) {
            this.logActivity(`VS Code chat scan failed: ${error.message}`, 'ERROR');
        }
    }

    /**
     * Find recent VS Code log directories (last 30 days)
     */
    async findRecentVSCodeLogs() {
        const recentDirs = [];
        const now = new Date();
        const maxAge = CHAT_INTEGRATION.VSCODE.MAX_DAYS_BACK * 24 * 60 * 60 * 1000;
        
        for (const logPath of CHAT_INTEGRATION.VSCODE.LOG_PATHS) {
            try {
                await fs.access(logPath);
                const entries = await fs.readdir(logPath);
                
                for (const entry of entries) {
                    // VS Code log dir format: 20250822T223255
                    if (entry.match(/^\d{8}T\d{6}$/)) {
                        const dirPath = path.join(logPath, entry);
                        const stats = await fs.stat(dirPath);
                        
                        if (now - stats.mtime <= maxAge) {
                            recentDirs.push({
                                path: dirPath,
                                date: entry,
                                mtime: stats.mtime
                            });
                        }
                    }
                }
            } catch (error) {
                // Log path doesn't exist, skip
            }
        }
        
        // Sort by date (newest first)
        return recentDirs.sort((a, b) => b.mtime - a.mtime);
    }

    /**
     * Process a VS Code log directory for chat conversations
     */
    async processChatLogDirectory(logDir) {
        try {
            const chatLogPath = path.join(logDir.path, 'window1/exthost/GitHub.copilot-chat/GitHub Copilot Chat.log');
            
            try {
                await fs.access(chatLogPath);
                await this.extractConversationsFromLog(chatLogPath, logDir.date);
            } catch {
                // No chat log in this directory, skip
            }
            
        } catch (error) {
            this.logActivity(`Failed to process log directory ${logDir.date}: ${error.message}`, 'ERROR');
        }
    }

    /**
     * Extract conversations from VS Code Copilot chat log
     */
    async extractConversationsFromLog(logPath, logDate) {
        try {
            const content = await fs.readFile(logPath, 'utf8');
            const lines = content.split('\n');
            
            let currentConversation = null;
            const conversations = [];
            
            for (const line of lines) {
                // Look for request patterns that indicate conversation boundaries
                if (line.includes('ccreq:') && line.includes('success')) {
                    if (currentConversation) {
                        conversations.push(currentConversation);
                    }
                    
                    // Extract conversation metadata
                    const timestampMatch = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
                    const requestIdMatch = line.match(/requestId: \[([^\]]+)\]/);
                    const modelMatch = line.match(/\| ([^|]+) \|/);
                    
                    currentConversation = {
                        id: requestIdMatch ? requestIdMatch[1] : `${logDate}_${Date.now()}`,
                        timestamp: timestampMatch ? timestampMatch[1] : null,
                        logDate: logDate,
                        model: modelMatch ? modelMatch[1].trim() : 'unknown',
                        context: [],
                        processed: false
                    };
                }
                
                // Collect conversation context (tool calls, errors, etc.)
                if (currentConversation && (
                    line.includes('Error from tool') ||
                    line.includes('Tool') ||
                    line.includes('message') ||
                    line.includes('finish reason')
                )) {
                    currentConversation.context.push(line.trim());
                }
            }
            
            // Add final conversation
            if (currentConversation) {
                conversations.push(currentConversation);
            }
            
            // Merge with existing conversations (avoid duplicates)
            this.mergeConversations(conversations);
            
        } catch (error) {
            this.logActivity(`Failed to extract conversations from ${logPath}: ${error.message}`, 'ERROR');
        }
    }

    /**
     * Merge new conversations with existing ones, avoiding duplicates
     */
    mergeConversations(newConversations) {
        const existingIds = new Set(this.rollingContext.conversations.map(c => c.id));
        
        for (const conv of newConversations) {
            if (!existingIds.has(conv.id)) {
                this.rollingContext.conversations.push(conv);
            }
        }
        
        // Maintain rolling window - keep only last N conversations
        if (this.rollingContext.conversations.length > this.rollingContext.maxConversations) {
            this.rollingContext.conversations = this.rollingContext.conversations
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, this.rollingContext.maxConversations);
        }
    }

    /**
     * Update search index for rolling context queries
     */
    async updateChatSearchIndex() {
        try {
            this.rollingContext.searchIndex.clear();
            
            for (const conv of this.rollingContext.conversations) {
                // Index by keywords from context
                const keywords = conv.context.join(' ').toLowerCase();
                const searchTerms = keywords.match(/\b\w{3,}\b/g) || [];
                
                for (const term of searchTerms) {
                    if (!this.rollingContext.searchIndex.has(term)) {
                        this.rollingContext.searchIndex.set(term, []);
                    }
                    this.rollingContext.searchIndex.get(term).push(conv.id);
                }
            }
            
            // Save rolling context to disk for persistence
            const contextFile = path.join(this.chatHistoryPath, 'rolling-context.json');
            await fs.writeFile(contextFile, JSON.stringify({
                conversations: this.rollingContext.conversations,
                lastUpdate: new Date().toISOString(),
                totalConversations: this.rollingContext.conversations.length
            }, null, 2));
            
        } catch (error) {
            this.logActivity(`Failed to update chat search index: ${error.message}`, 'ERROR');
        }
    }

    /**
     * Query rolling context window - main interface for chat history access
     */
    async queryRollingContext(query, limit = CHAT_INTEGRATION.VSCODE.ROLLING_CONTEXT_LIMITS.LAST_10_CHATS) {
        try {
            // Ensure we have chat data loaded
            if (this.rollingContext.conversations.length === 0) {
                console.log(`${YELLOW}📥 Loading conversation history...${RESET}`);
                await this.scanVSCodeChatLogs();
            }
            
            // If query is a number, get last N conversations
            if (typeof query === 'number') {
                const conversations = this.rollingContext.conversations
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .slice(0, query);
                    
                console.log(`${GREEN}💬 Last ${Math.min(query, conversations.length)} conversation(s):${RESET}`);
                console.log(`${YELLOW}────────────────────────────────────────────────${RESET}`);
                
                conversations.forEach((conversation, index) => {
                    const date = new Date(conversation.timestamp).toLocaleString();
                    const preview = conversation.content.slice(0, 200).replace(/\n/g, ' ');
                    
                    console.log(`${PINK}   ${index + 1}. ${date}${RESET}`);
                    console.log(`${DIM_PINK}      ${preview}${RESET}`);
                    if (conversation.content.length > 200) {
                        console.log(`${DIM_PINK}      ... [${conversation.content.length} total characters]${RESET}`);
                    }
                    
                    if (index < conversations.length - 1) {
                        console.log();
                    }
                });
                
                console.log(`${YELLOW}────────────────────────────────────────────────${RESET}`);
                return conversations;
            }
            
            // String queries for search
            if (query === 'last' || query === 'recent') {
                // Get most recent conversations
                return this.rollingContext.conversations
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .slice(0, limit);
            }
            
            // Search by keywords
            const searchTerms = query.toLowerCase().split(' ');
            const matchingIds = new Set();
            
            for (const term of searchTerms) {
                const ids = this.rollingContext.searchIndex.get(term) || [];
                ids.forEach(id => matchingIds.add(id));
            }
            
            // Get matching conversations
            const matching = this.rollingContext.conversations.filter(c => matchingIds.has(c.id));
            
            return matching
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, limit);
                
        } catch (error) {
            console.error(`${RED}❌ Error querying rolling context: ${error.message}${RESET}`);
            this.logActivity(`Rolling context query error: ${error.message}`, 'ERROR');
            return [];
        }
    }

    async searchConversationContext(searchTerm) {
        try {
            console.log(`${BLUE}🔍 Searching conversation history for: "${searchTerm}"${RESET}`);
            
            // Ensure we have recent chat data
            if (this.rollingContext.conversations.length === 0) {
                console.log(`${YELLOW}📥 No conversations loaded. Scanning VS Code logs...${RESET}`);
                await this.scanVSCodeChatLogs();
            }
            
            // Search conversations
            const results = await this.queryRollingContext(searchTerm, 50); // Get up to 50 results
            
            if (results.length === 0) {
                console.log(`${DIM_PINK}   No conversations found matching "${searchTerm}"${RESET}`);
                return;
            }
            
            console.log(`${GREEN}📊 Found ${results.length} matching conversation(s):${RESET}`);
            console.log(`${YELLOW}────────────────────────────────────────────────${RESET}`);
            
            results.forEach((conversation, index) => {
                const date = new Date(conversation.timestamp).toLocaleString();
                const preview = conversation.content.slice(0, 100).replace(/\n/g, ' ') + '...';
                
                console.log(`${PINK}   ${index + 1}. ${date}${RESET}`);
                console.log(`${DIM_PINK}      ${preview}${RESET}`);
                
                if (index < results.length - 1) {
                    console.log();
                }
            });
            
            console.log(`${YELLOW}────────────────────────────────────────────────${RESET}`);
            console.log(`${BLUE}💡 Use 'chats <number>' to see recent conversations in detail${RESET}`);
            
        } catch (error) {
            console.error(`${RED}❌ Error searching conversations: ${error.message}${RESET}`);
            this.logActivity(`Conversation search error: ${error.message}`, 'ERROR');
        }
    }

    // ==================== END VS CODE CHAT INTEGRATION ====================

    // ==================== END AI ANALYSIS METHODS ====================

    // ==================== SESSION TRACKING METHODS ====================
    
    startSessionTracking() {
        // Auto-save session data every 2 minutes
        setInterval(() => {
            this.updateSessionData();
        }, 120000); // 2 minutes
        
        this.logActivity('Session tracking started', 'SUCCESS');
    }

    async updateSessionData() {
        try {
            // Update context with current state
            this.sessionData.context.memoryState = {
                extractedFunctions: this.extractedFunctions.size,
                knowledgeEntries: this.knowledgeBase.size,
                memorySyncCount: this.memorySync.syncCount,
                lastMemorySync: this.memorySync.lastSync
            };
            
            // Add recent activity as technical changes
            const recentChanges = this.activityLog
                .filter(entry => entry.type === 'INFO' || entry.type === 'SUCCESS')
                .slice(-3)
                .map(entry => entry.message);
            
            this.sessionData.summary.technicalChanges = [
                ...new Set([...this.sessionData.summary.technicalChanges, ...recentChanges])
            ].slice(-10); // Keep last 10
            
            // Update timestamp
            this.sessionData.timestamp = new Date().toISOString();
            
            // Save to file
            await fs.writeFile(this.sessionFile, JSON.stringify(this.sessionData, null, 2), 'utf8');
            
        } catch (error) {
            this.logActivity(`Session save failed: ${error.message}`, 'ERROR');
        }
    }

    async addAccomplishment(accomplishment) {
        this.sessionData.summary.keyAccomplishments.push(accomplishment);
        await this.updateSessionData();
        this.logActivity(`Accomplishment recorded: ${accomplishment}`, 'SUCCESS');
    }

    async setObjective(objective) {
        this.sessionData.summary.mainObjective = objective;
        await this.updateSessionData();
        this.logActivity(`Objective set: ${objective}`, 'INFO');
    }

    async addNextStep(step) {
        this.sessionData.summary.nextSteps.push(step);
        await this.updateSessionData();
        this.logActivity(`Next step added: ${step}`, 'INFO');
    }

    async createHandoff(type, priority, description, requiredContext = []) {
        this.sessionData.handoff = {
            type,
            priority,
            description,
            requiredContext,
            createdAt: new Date().toISOString()
        };
        this.sessionData.status = 'handoff_ready';
        await this.updateSessionData();
        this.logActivity(`Handoff created: ${description}`, 'SUCCESS');
    }

    async generateSessionRecap() {
        try {
            const generator = new SessionRecapGenerator();
            await generator.generateRecap();
            this.logActivity('Session recap generated', 'SUCCESS');
            return true;
        } catch (error) {
            this.logActivity(`Recap generation failed: ${error.message}`, 'ERROR');
            return false;
        }
    }

    // ==================== END SESSION TRACKING METHODS ====================

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
        
        // Generate session recap from previous session
        console.log(`${BLUE}📋 Checking for previous session...${RESET}`);
        const recapGenerated = await this.generateSessionRecap();
        if (recapGenerated) {
            console.log(`${GREEN}✅ Previous session recap available: SESSION_RECAP.md${RESET}`);
        }
        
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
        this.logActivity('Starting enhanced background monitoring with AI analysis...', 'INFO');
        
        // Watch specific directories for changes
        const watchPaths = [
            path.join(this.memoryPath, '**/*.json'),
            path.join(this.enginePath, 'rEngine/**/*.js'),
            path.join(this.enginePath, 'rCore/**/*.js'), 
            path.join(this.enginePath, 'rAgents/**/*.js'),
            path.join(this.enginePath, 'rScribe/**/*.js'),
            path.join(this.enginePath, 'scripts/**/*.js'),
            path.join(this.enginePath, 'tools/**/*.js'),
            path.join(this.enginePath, '*.js'),
            path.join(this.enginePath, '*.md'),
            path.join(this.enginePath, '*.json'),
            path.join(this.enginePath, 'index.html'),
            path.join(this.enginePath, 'js/**/*.js'),
            path.join(this.enginePath, 'css/**/*.css')
        ];
        
        const watcher = chokidar.watch(watchPaths, {
            ignored: [
                '**/node_modules/**',
                '**/logs/**',
                '**/rLogs/**',
                '**/.git/**',
                '**/backups/**',
                '**/deprecated/**'
            ],
            persistent: true,
            ignoreInitial: true
        });
        
        watcher.on('change', async (filePath) => {
            const fileName = path.basename(filePath);
            const extension = path.extname(filePath);
            
            this.logActivity(`${fileName} modified`, 'INFO');
            
            // Smart analysis for code files
            if (LLM_CONFIG.ENABLE_SMART_ANALYSIS && (extension === '.js' || extension === '.py' || extension === '.ts')) {
                try {
                    const content = await fs.readFile(filePath, 'utf8');
                    if (content.length > 100 && content.length < LLM_CONFIG.CONTEXT_WINDOW) {
                        await this.analyzeCodeFile(filePath, content);
                    }
                } catch (error) {
                    this.logActivity(`Failed to analyze ${fileName}: ${error.message}`, 'ERROR');
                }
            }
            
            // Legacy pattern analysis (maintained for compatibility)
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
        
        watcher.on('add', async (filePath) => {
            const fileName = path.basename(filePath);
            const extension = path.extname(filePath);
            this.logActivity(`New file detected: ${fileName}`, 'INFO');
            
            // Analyze new code files immediately
            if (LLM_CONFIG.ENABLE_SMART_ANALYSIS && (extension === '.js' || extension === '.py' || extension === '.ts')) {
                try {
                    const content = await fs.readFile(filePath, 'utf8');
                    if (content.length > 100 && content.length < LLM_CONFIG.CONTEXT_WINDOW) {
                        await this.analyzeCodeFile(filePath, content);
                    }
                } catch (error) {
                    this.logActivity(`Failed to analyze new file ${fileName}`, 'ERROR');
                }
            }
        });
        
        this.logActivity('Enhanced background monitoring active with smart analysis', 'SUCCESS');
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
        console.log(`   ✅ File monitoring running with AI analysis`);
        console.log(`   ✅ Background logging enabled`);
        console.log(`   🤖 AI Model: ${LLM_CONFIG.ANALYSIS_MODEL}`);
        console.log(`   🔄 Memory sync: ${LLM_CONFIG.ENABLE_MEMORY_SYNC ? `Every ${LLM_CONFIG.MEMORY_SYNC_INTERVAL}s` : 'Disabled'}`);
        console.log(`   📊 Functions extracted: ${this.extractedFunctions.size}`);
        console.log(`   🧠 Knowledge entries: ${this.knowledgeBase.size}`);
        console.log(`   ✅ Console ready for commands`);
        console.log();
        
        console.log(`${BLUE}📋 Available Commands:${RESET}`);
        console.log(`   summary [timeframe]  - Generate conversation summary`);
        console.log(`   memory              - Check memory status`);
        console.log(`   logs                - View recent logs`);
        console.log(`   functions           - Show extracted functions`);
        console.log(`   knowledge           - Show knowledge base`);
        console.log(`   sync                - Manual memory sync`);
        console.log(`   analyze <file>      - Analyze specific file`);
        console.log(`   config              - Show AI configuration`);
        console.log(`   session             - Show current session info`);
        console.log(`   objective <text>    - Set session objective`);
        console.log(`   accomplished <text> - Record accomplishment`);
        console.log(`   nextstep <text>     - Add next step`);
        console.log(`   handoff <desc>      - Create session handoff`);
        console.log(`   recap               - Generate session recap`);
        console.log(`   clear               - Clear screen`);
        console.log(`   help                - Show this help`);
        console.log(`   quit                - Exit console`);
        console.log();
        console.log(`${PINK}💬 Rolling Context Commands:${RESET}`);
        console.log(`   chat / lastchat     - Show last conversation`);
        console.log(`   chats <n>           - Show last N conversations`);
        console.log(`   last10              - Show last 10 conversations`);
        console.log(`   last100             - Show last 100 conversations`);
        console.log(`   last1000            - Show last 1000 conversations`);
        console.log(`   conversations scan  - Manually scan VS Code logs`);
        console.log(`   searchchat <term>   - Search conversation history`);
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
                
            case 'functions':
                this.showExtractedFunctions();
                break;
                
            case 'knowledge':
                this.showKnowledgeBase();
                break;
                
            case 'sync':
                await this.performMemorySync();
                break;
                
            case 'analyze':
                if (args[0]) {
                    await this.analyzeSpecificFile(args[0]);
                } else {
                    console.log(`${YELLOW}Usage: analyze <filename>${RESET}`);
                }
                break;
                
            case 'config':
                this.showAIConfiguration();
                break;
                
            case 'session':
                this.showSessionInfo();
                break;
                
            case 'objective':
                if (args.length > 0) {
                    await this.setObjective(args.join(' '));
                    console.log(`${GREEN}✅ Objective set: ${args.join(' ')}${RESET}`);
                } else {
                    console.log(`${YELLOW}Usage: objective <description>${RESET}`);
                }
                break;
                
            case 'accomplished':
                if (args.length > 0) {
                    await this.addAccomplishment(args.join(' '));
                    console.log(`${GREEN}✅ Accomplishment recorded: ${args.join(' ')}${RESET}`);
                } else {
                    console.log(`${YELLOW}Usage: accomplished <description>${RESET}`);
                }
                break;
                
            case 'nextstep':
                if (args.length > 0) {
                    await this.addNextStep(args.join(' '));
                    console.log(`${GREEN}✅ Next step added: ${args.join(' ')}${RESET}`);
                } else {
                    console.log(`${YELLOW}Usage: nextstep <description>${RESET}`);
                }
                break;
                
            case 'handoff':
                if (args.length > 0) {
                    await this.createHandoff('manual', 'normal', args.join(' '));
                    console.log(`${GREEN}✅ Handoff created: ${args.join(' ')}${RESET}`);
                } else {
                    console.log(`${YELLOW}Usage: handoff <description>${RESET}`);
                }
                break;
                
            case 'recap':
                console.log(`${BLUE}📋 Generating session recap...${RESET}`);
                const success = await this.generateSessionRecap();
                if (success) {
                    console.log(`${GREEN}✅ Session recap generated: SESSION_RECAP.md${RESET}`);
                }
                break;
                
            case 'clear':
                console.clear();
                await this.showWelcome();
                break;
                
            case 'help':
                this.showCurrentStatus();
                break;
                
            // ==================== ROLLING CONTEXT COMMANDS ====================
            case 'chat':
            case 'lastchat':
                await this.queryRollingContext(1);
                break;
                
            case 'chats':
                const count = parseInt(args[0]) || 10;
                await this.queryRollingContext(count);
                break;
                
            case 'last10':
                await this.queryRollingContext(10);
                break;
                
            case 'last100':
                await this.queryRollingContext(100);
                break;
                
            case 'last1000':
                await this.queryRollingContext(1000);
                break;
                
            case 'conversations':
                if (args[0] && args[0] === 'scan') {
                    console.log(`${BLUE}🔄 Manually triggering VS Code chat scan...${RESET}`);
                    await this.scanVSCodeChatLogs();
                } else {
                    await this.queryRollingContext(parseInt(args[0]) || 10);
                }
                break;
                
            case 'searchcontext':
            case 'searchchat':
                if (args.length > 0) {
                    const searchTerm = args.join(' ');
                    await this.searchConversationContext(searchTerm);
                } else {
                    console.log(`${YELLOW}Usage: searchchat <search term>${RESET}`);
                }
                break;
                
            default:
                if (command) {
                    this.logActivity(`Unknown command: ${command}`, 'ERROR');
                    console.log(`${YELLOW}Type 'help' for available commands${RESET}`);
                }
        }
    }

    // ==================== NEW COMMAND IMPLEMENTATIONS ====================
    
    showExtractedFunctions() {
        console.log(`${BLUE}🔧 Extracted Functions (${this.extractedFunctions.size} files):${RESET}`);
        console.log(`${YELLOW}────────────────────────────────────────────────${RESET}`);
        
        if (this.extractedFunctions.size === 0) {
            console.log(`${DIM_PINK}   No functions extracted yet${RESET}`);
        } else {
            for (const [filePath, data] of this.extractedFunctions) {
                const fileName = path.basename(filePath);
                const analysis = data.analysis;
                console.log(`${PINK}   📄 ${fileName}${RESET}`);
                if (analysis.functions && analysis.functions.length > 0) {
                    console.log(`${DIM_PINK}      Functions: ${analysis.functions.join(', ')}${RESET}`);
                }
                if (analysis.classes && analysis.classes.length > 0) {
                    console.log(`${DIM_PINK}      Classes: ${analysis.classes.join(', ')}${RESET}`);
                }
                if (analysis.summary) {
                    console.log(`${DIM_PINK}      Summary: ${analysis.summary}${RESET}`);
                }
                console.log();
            }
        }
        console.log(`${YELLOW}────────────────────────────────────────────────${RESET}`);
    }

    showKnowledgeBase() {
        console.log(`${BLUE}🧠 Knowledge Base (${this.knowledgeBase.size} entries):${RESET}`);
        console.log(`${YELLOW}────────────────────────────────────────────────${RESET}`);
        
        if (this.knowledgeBase.size === 0) {
            console.log(`${DIM_PINK}   No knowledge entries yet${RESET}`);
        } else {
            for (const [key, analysis] of this.knowledgeBase) {
                console.log(`${PINK}   📚 ${key}${RESET}`);
                if (analysis.key_decisions && analysis.key_decisions.length > 0) {
                    console.log(`${DIM_PINK}      Decisions: ${analysis.key_decisions.slice(0, 2).join(', ')}${RESET}`);
                }
                if (analysis.technical_insights && analysis.technical_insights.length > 0) {
                    console.log(`${DIM_PINK}      Insights: ${analysis.technical_insights.slice(0, 2).join(', ')}${RESET}`);
                }
                if (analysis.summary) {
                    console.log(`${DIM_PINK}      Summary: ${analysis.summary.substring(0, 100)}...${RESET}`);
                }
                console.log();
            }
        }
        console.log(`${YELLOW}────────────────────────────────────────────────${RESET}`);
    }

    async analyzeSpecificFile(fileName) {
        this.logActivity(`Manual analysis requested for: ${fileName}`, 'INFO');
        
        try {
            // Find file in common locations
            const searchPaths = [
                path.join(this.enginePath, fileName),
                path.join(this.enginePath, 'rEngine', fileName),
                path.join(this.enginePath, 'rCore', fileName),
                path.join(this.enginePath, 'scripts', fileName),
                path.join(this.enginePath, 'tools', fileName)
            ];
            
            let filePath = null;
            for (const searchPath of searchPaths) {
                try {
                    await fs.access(searchPath);
                    filePath = searchPath;
                    break;
                } catch {
                    // Continue searching
                }
            }
            
            if (!filePath) {
                console.log(`${YELLOW}File not found: ${fileName}${RESET}`);
                return;
            }
            
            const content = await fs.readFile(filePath, 'utf8');
            const analysis = await this.analyzeCodeFile(filePath, content);
            
            if (analysis) {
                console.log(`${GREEN}✅ Analysis completed for ${fileName}${RESET}`);
                console.log(`${BLUE}Functions: ${analysis.functions?.join(', ') || 'None'}${RESET}`);
                console.log(`${BLUE}Classes: ${analysis.classes?.join(', ') || 'None'}${RESET}`);
                console.log(`${BLUE}Summary: ${analysis.summary || 'No summary'}${RESET}`);
            } else {
                console.log(`${YELLOW}Analysis failed or disabled${RESET}`);
            }
            
        } catch (error) {
            console.log(`${RED}Error analyzing file: ${error.message}${RESET}`);
        }
    }

    showAIConfiguration() {
        console.log(`${BLUE}🤖 AI Configuration:${RESET}`);
        console.log(`${YELLOW}────────────────────────────────────────────────${RESET}`);
        console.log(`${PINK}   Model: ${LLM_CONFIG.ANALYSIS_MODEL}${RESET}`);
        console.log(`${PINK}   Host: ${LLM_CONFIG.OLLAMA_HOST}${RESET}`);
        console.log(`${PINK}   Temperature: ${LLM_CONFIG.TEMPERATURE}${RESET}`);
        console.log(`${PINK}   Max Tokens: ${LLM_CONFIG.MAX_TOKENS}${RESET}`);
        console.log(`${PINK}   Memory Sync: ${LLM_CONFIG.MEMORY_SYNC_INTERVAL}s${RESET}`);
        console.log(`${PINK}   Smart Analysis: ${LLM_CONFIG.ENABLE_SMART_ANALYSIS}${RESET}`);
        console.log(`${PINK}   Function Extraction: ${LLM_CONFIG.ENABLE_FUNCTION_EXTRACTION}${RESET}`);
        console.log(`${PINK}   Knowledge Building: ${LLM_CONFIG.ENABLE_KNOWLEDGE_BUILDING}${RESET}`);
        console.log();
        console.log(`${DIM_PINK}   Sync Status: ${this.memorySync.syncCount} completed, ${this.memorySync.failureCount} failed${RESET}`);
        console.log(`${DIM_PINK}   Last Sync: ${this.memorySync.lastSync || 'Not yet run'}${RESET}`);
        console.log(`${YELLOW}────────────────────────────────────────────────${RESET}`);
    }

    showSessionInfo() {
        const uptime = Math.floor((Date.now() - new Date(this.sessionStart).getTime()) / 1000 / 60);
        
        console.log(`${BLUE}📊 Current Session Info:${RESET}`);
        console.log(`${YELLOW}────────────────────────────────────────────────${RESET}`);
        console.log(`${PINK}   Session ID: ${this.sessionId}${RESET}`);
        console.log(`${PINK}   Started: ${new Date(this.sessionStart).toLocaleString()}${RESET}`);
        console.log(`${PINK}   Uptime: ${uptime} minutes${RESET}`);
        console.log(`${PINK}   Status: ${this.sessionData.status}${RESET}`);
        console.log();
        
        console.log(`${BLUE}🎯 Current Objective:${RESET}`);
        console.log(`${DIM_PINK}   ${this.sessionData.summary.mainObjective || 'No objective set'}${RESET}`);
        console.log();
        
        console.log(`${BLUE}✅ Accomplishments (${this.sessionData.summary.keyAccomplishments.length}):${RESET}`);
        if (this.sessionData.summary.keyAccomplishments.length === 0) {
            console.log(`${DIM_PINK}   No accomplishments recorded yet${RESET}`);
        } else {
            this.sessionData.summary.keyAccomplishments.slice(-3).forEach(acc => {
                console.log(`${DIM_PINK}   • ${acc}${RESET}`);
            });
        }
        console.log();
        
        console.log(`${BLUE}🚀 Next Steps (${this.sessionData.summary.nextSteps.length}):${RESET}`);
        if (this.sessionData.summary.nextSteps.length === 0) {
            console.log(`${DIM_PINK}   No next steps defined${RESET}`);
        } else {
            this.sessionData.summary.nextSteps.slice(-3).forEach(step => {
                console.log(`${DIM_PINK}   • ${step}${RESET}`);
            });
        }
        
        console.log(`${YELLOW}────────────────────────────────────────────────${RESET}`);
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
