#!/usr/bin/env node
/**
 * HexTrackr Chat History Scanner
 * Simple, reliable chat log processor to populate Memento MCP quickly
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

class ChatScanner {
    constructor() {
        this.chatLogPath = this.findChatLogs();
        this.outputDir = path.join(__dirname, "../json");
        this.ensureOutputDir();
    }

    findChatLogs() {
        // VS Code chat logs location on macOS
        const vscodeDir = path.join(os.homedir(), "Library/Application Support/Code/User/globalStorage/github.copilot-chat/");
        
        if (fs.existsSync(vscodeDir)) {
            console.log(`📁 Found VS Code chat directory: ${vscodeDir}`);
            return vscodeDir;
        }
        
        console.warn("⚠️  VS Code chat directory not found");
        return null;
    }

    ensureOutputDir() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
            console.log(`📁 Created output directory: ${this.outputDir}`);
        }
    }

    async scanChatHistory() {
        if (!this.chatLogPath) {
            console.error("❌ No chat logs found");
            return [];
        }

        console.log("🔍 Scanning chat history...");
        
        try {
            // Find all chat session files
            const files = fs.readdirSync(this.chatLogPath)
                .filter(file => file.endsWith(".jsonl") || file.endsWith(".json"))
                .map(file => ({
                    name: file,
                    path: path.join(this.chatLogPath, file),
                    modified: fs.statSync(path.join(this.chatLogPath, file)).mtime
                }))
                .sort((a, b) => b.modified - a.modified); // Most recent first

            console.log(`📊 Found ${files.length} chat log files`);

            const conversations = [];
            
            for (const file of files.slice(0, 10)) { // Process last 10 files
                console.log(`📖 Processing: ${file.name}`);
                
                try {
                    const content = fs.readFileSync(file.path, "utf8");
                    const parsed = this.parseLogFile(content, file.name);
                    
                    if (parsed.length > 0) {
                        conversations.push(...parsed);
                        console.log(`   ✅ Extracted ${parsed.length} conversations`);
                    }
                } catch (error) {
                    console.warn(`   ⚠️  Failed to parse ${file.name}: ${error.message}`);
                }
            }

            // Save processed conversations
            const outputFile = path.join(this.outputDir, "chat-history.json");
            fs.writeFileSync(outputFile, JSON.stringify(conversations, null, 2));
            
            console.log(`\n✅ Processed ${conversations.length} conversations`);
            console.log(`📄 Saved to: ${outputFile}`);
            
            return conversations;

        } catch (error) {
            console.error("❌ Error scanning chat history:", error.message);
            return [];
        }
    }

    parseLogFile(content, filename) {
        const conversations = [];
        
        try {
            // Handle JSONL format (line-delimited JSON)
            if (filename.endsWith(".jsonl")) {
                const lines = content.split("\n").filter(line => line.trim());
                
                for (const line of lines) {
                    try {
                        const parsed = JSON.parse(line);
                        conversations.push(this.normalizeConversation(parsed, filename));
                    } catch (e) {
                        // Skip invalid lines
                    }
                }
            } 
            // Handle regular JSON
            else {
                const parsed = JSON.parse(content);
                
                if (Array.isArray(parsed)) {
                    conversations.push(...parsed.map(conv => this.normalizeConversation(conv, filename)));
                } else {
                    conversations.push(this.normalizeConversation(parsed, filename));
                }
            }
        } catch (error) {
            console.warn(`Failed to parse ${filename}: ${error.message}`);
        }

        return conversations;
    }

    normalizeConversation(raw, source) {
        return {
            id: raw.id || `${source}-${Date.now()}`,
            timestamp: raw.timestamp || raw.createdAt || Date.now(),
            source: source,
            messages: raw.messages || raw.turns || [raw],
            metadata: {
                processed: new Date().toISOString(),
                source_file: source,
                raw_keys: Object.keys(raw)
            }
        };
    }

    // Generate summary for Memento MCP import
    generateMementoImport(conversations) {
        const entities = [];
        
        for (const conv of conversations) {
            // Extract key topics and decisions
            const messages = conv.messages || [];
            const userMessages = messages.filter(m => m.role === "user" || m.author === "user");
            const assistantMessages = messages.filter(m => m.role === "assistant" || m.author === "assistant");

            if (userMessages.length > 0) {
                entities.push({
                    name: `Chat Session ${conv.id}`,
                    entityType: "development_session",
                    observations: [
                        `Session from ${new Date(conv.timestamp).toISOString()}`,
                        `${userMessages.length} user messages, ${assistantMessages.length} assistant responses`,
                        `Topics: ${this.extractTopics(messages).join(", ")}`,
                        `Source: ${conv.source}`
                    ]
                });
            }
        }

        const outputFile = path.join(this.outputDir, "memento-import.json");
        fs.writeFileSync(outputFile, JSON.stringify({ entities }, null, 2));
        
        console.log(`📋 Generated ${entities.length} entities for Memento import`);
        console.log(`💾 Saved to: ${outputFile}`);
        
        return entities;
    }

    extractTopics(messages) {
        const topics = new Set();
        
        for (const msg of messages) {
            const text = msg.content || msg.text || "";
            
            // Simple keyword extraction
            const keywords = text.toLowerCase().match(/\b(api|database|security|testing|deployment|bug|feature|error|fix|implement|create|update|delete|refactor)\b/g);
            
            if (keywords) {
                keywords.forEach(k => topics.add(k));
            }
        }
        
        return Array.from(topics).slice(0, 5); // Top 5 topics
    }
}

// CLI Usage
if (require.main === module) {
    const scanner = new ChatScanner();
    
    scanner.scanChatHistory()
        .then(conversations => {
            if (conversations.length > 0) {
                scanner.generateMementoImport(conversations);
                console.log("\n🚀 Ready for Memento MCP import!");
                console.log("📋 Next step: Import entities into memory system");
            }
        })
        .catch(error => {
            console.error("❌ Scanner failed:", error);
            process.exit(1);
        });
}

module.exports = ChatScanner;
