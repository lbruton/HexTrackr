#!/usr/bin/env node
/* eslint-env node */
/**
 * HexTrackr Semantic Memory Orchestrator
 * Processes 2.5 weeks of development sessions + rEngine backups
 * Implements ChatGPT semantic approach: Evidence → Reconciliation → Canonical Notes
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawn } = require("child_process");

class SemanticOrchestrator {
    constructor() {
        this.projectRoot = process.cwd();
        this.memoryDir = path.join(this.projectRoot, ".rMemory");
        this.jsonDir = path.join(this.memoryDir, "json");
        this.evidenceFile = path.join(this.jsonDir, "chat-evidence.json");
        this.canonicalFile = path.join(this.jsonDir, "canonical-notes.json");
        this.symbolsFile = path.join(this.jsonDir, "symbols-table.json");
        this.summariesFile = path.join(this.jsonDir, "time-summaries.json");
        this.mementoImportFile = path.join(this.jsonDir, "memento-import.json");
        
        this.ollamaModel = "qwen2.5-coder:7b";
        this.embeddingModel = "nomic-embed-text:latest";
        
        // Evidence buffer for reconciliation
        this.evidenceBuffer = [];
        this.canonicalNotes = {};
        this.symbolsTable = {};
        this.timeSummaries = { "10min": [], "30min": [], "60min": [] };
        
        this.ensureDirectories();
        this.loadExistingData();
    }

    ensureDirectories() {
        [this.jsonDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`📁 Created directory: ${dir}`);
            }
        });
    }

    loadExistingData() {
        try {
            if (fs.existsSync(this.evidenceFile)) {
                this.evidenceBuffer = JSON.parse(fs.readFileSync(this.evidenceFile, "utf8"));
                console.log(`📋 Loaded ${this.evidenceBuffer.length} existing evidence items`);
            }
            
            if (fs.existsSync(this.canonicalFile)) {
                this.canonicalNotes = JSON.parse(fs.readFileSync(this.canonicalFile, "utf8"));
                console.log(`📝 Loaded ${Object.keys(this.canonicalNotes).length} canonical notes`);
            }
            
            if (fs.existsSync(this.symbolsFile)) {
                this.symbolsTable = JSON.parse(fs.readFileSync(this.symbolsFile, "utf8"));
                console.log(`🔧 Loaded symbols table with ${Object.keys(this.symbolsTable).length} symbols`);
            }
        } catch (error) {
            console.warn("⚠️  Error loading existing data:", error.message);
        }
    }

    async processHistoricalChatLogs() {
        console.log("\n🔍 Processing 2.5 weeks of VS Code chat history...");
        
        const vscodeDir = path.join(os.homedir(), "Library/Application Support/Code/User/globalStorage/github.copilot-chat/");
        
        if (!fs.existsSync(vscodeDir)) {
            console.warn("⚠️  VS Code chat directory not found");
            return [];
        }

        const chatFiles = fs.readdirSync(vscodeDir)
            .filter(file => file.endsWith(".jsonl") || file.endsWith(".json"))
            .map(file => ({
                name: file,
                path: path.join(vscodeDir, file),
                modified: fs.statSync(path.join(vscodeDir, file)).mtime
            }))
            .sort((a, b) => b.modified - a.modified); // Most recent first

        console.log(`📊 Found ${chatFiles.length} chat files`);

        let totalConversations = 0;
        
        // Process ALL files (not just 10) for historical import
        for (const file of chatFiles) {
            console.log(`📖 Processing: ${file.name}`);
            
            try {
                const content = fs.readFileSync(file.path, "utf8");
                const conversations = this.parseLogFile(content, file.name);
                
                if (conversations.length > 0) {
                    // Add to evidence buffer
                    for (const conv of conversations) {
                        this.evidenceBuffer.push({
                            id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            topic_key: this.generateTopicKey(conv),
                            source: "vscode_chat",
                            span_ref: `${file.name}:${conv.id}`,
                            text: this.extractConversationText(conv),
                            quality: this.assessQuality(conv),
                            created_at: new Date(conv.timestamp).toISOString(),
                            simhash: this.simpleHash(this.extractConversationText(conv))
                        });
                    }
                    
                    totalConversations += conversations.length;
                    console.log(`   ✅ Added ${conversations.length} conversations to evidence`);
                }
            } catch (error) {
                console.warn(`   ⚠️  Failed to parse ${file.name}: ${error.message}`);
            }
        }

        console.log(`📈 Total: ${totalConversations} conversations processed`);
        return totalConversations;
    }

    async processRealtimeChatData() {
        console.log("\n� Processing real-time chat data from scribe...");
        
        const realtimeChatFile = path.join(this.jsonDir, "realtime-chat-data.json");
        
        if (!fs.existsSync(realtimeChatFile)) {
            console.warn("⚠️  Real-time chat data not found - ensure realtime-chat-scribe.js is running");
            return 0;
        }

        let processedEntries = 0;
        
        try {
            const chatData = JSON.parse(fs.readFileSync(realtimeChatFile, "utf8"));
            
            if (!Array.isArray(chatData) || chatData.length === 0) {
                console.warn("⚠️  No chat data available for processing");
                return 0;
            }
            console.log(`📊 Found ${chatData.length} chat entries to process`);
            
            for (const chatEntry of chatData) {
                // Process each chat entry into evidence buffer
                this.evidenceBuffer.push({
                    id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    topic_key: this.generateTopicKeyFromChat(chatEntry),
                    source: "realtime_chat",
                    span_ref: `vscode-chat/${chatEntry.workspaceId}`,
                    text: JSON.stringify(chatEntry, null, 2),
                    quality: chatEntry.placeholder ? 0.3 : 0.9, // Lower quality for placeholders
                    created_at: new Date(chatEntry.timestamp).toISOString(),
                    simhash: this.simpleHash(JSON.stringify(chatEntry))
                });
                
                processedEntries++;
            }
            
            console.log(`📈 Total: ${processedEntries} chat entries processed`);
            return processedEntries;
            
        } catch (error) {
            console.error("Error processing real-time chat data:", error);
            return 0;
        }
    }

    async buildSymbolsTable() {
        console.log("\n🔧 Building comprehensive symbols table...");
        
        const symbols = {};
        
        // Scan JavaScript/TypeScript files
        const scanDir = (dir, extensions = [".js", ".ts", ".jsx", ".tsx"]) => {
            const files = [];
            
            try {
                const items = fs.readdirSync(dir);
                
                for (const item of items) {
                    if (item.startsWith(".") || item === "node_modules") {continue;}
                    
                    const fullPath = path.join(dir, item);
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory()) {
                        files.push(...scanDir(fullPath, extensions));
                    } else if (extensions.some(ext => item.endsWith(ext))) {
                        files.push(fullPath);
                    }
                }
            } catch (error) {
                // Skip directories we can't read
            }
            
            return files;
        };

        const sourceFiles = scanDir(this.projectRoot);
        console.log(`📊 Found ${sourceFiles.length} source files to analyze`);

        for (const filePath of sourceFiles.slice(0, 100)) { // Limit for performance
            try {
                const relativePath = path.relative(this.projectRoot, filePath);
                const content = fs.readFileSync(filePath, "utf8");
                
                // Simple regex-based symbol extraction
                const functions = content.match(/(?:function|async function)\s+(\w+)|(\w+)\s*[=:]\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>)/g) || [];
                const classes = content.match(/class\s+(\w+)/g) || [];
                const variables = content.match(/(?:const|let|var)\s+(\w+)/g) || [];
                
                functions.forEach((match, index) => {
                    const name = match.match(/\w+/)[0];
                    if (name && name !== "function" && name !== "async") {
                        symbols[`${relativePath}:${name}`] = {
                            name,
                            type: "function",
                            file: relativePath,
                            line: content.substring(0, content.indexOf(match)).split("\n").length,
                            signature: match.trim()
                        };
                    }
                });

                classes.forEach(match => {
                    const name = match.replace("class ", "");
                    symbols[`${relativePath}:${name}`] = {
                        name,
                        type: "class",
                        file: relativePath,
                        line: content.substring(0, content.indexOf(match)).split("\n").length,
                        signature: match.trim()
                    };
                });

                variables.forEach(match => {
                    const name = match.match(/(\w+)$/)[1];
                    if (name) {
                        symbols[`${relativePath}:${name}`] = {
                            name,
                            type: "variable",
                            file: relativePath,
                            line: content.substring(0, content.indexOf(match)).split("\n").length,
                            signature: match.trim()
                        };
                    }
                });
                
            } catch (error) {
                // Skip files we can't read
            }
        }

        this.symbolsTable = {
            generated_at: new Date().toISOString(),
            project: "HexTrackr",
            total_symbols: Object.keys(symbols).length,
            symbols
        };

        console.log(`🔧 Generated symbols table with ${Object.keys(symbols).length} symbols`);
        return symbols;
    }

    async reconcileWithOllama() {
        console.log("\n🧠 Reconciling evidence with Ollama...");
        
        // Group evidence by topic_key
        const topicGroups = {};
        for (const evidence of this.evidenceBuffer) {
            if (!topicGroups[evidence.topic_key]) {
                topicGroups[evidence.topic_key] = [];
            }
            topicGroups[evidence.topic_key].push(evidence);
        }

        console.log(`📊 Found ${Object.keys(topicGroups).length} topic groups to reconcile`);

        let reconciledCount = 0;
        
        for (const [topicKey, evidenceItems] of Object.entries(topicGroups)) {
            try {
                console.log(`🔄 Reconciling topic: ${topicKey}`);
                
                // Prepare prompt for Ollama
                const prompt = this.buildReconciliationPrompt(topicKey, evidenceItems);
                
                // Call Ollama
                const canonicalNote = await this.callOllama(prompt);
                
                if (canonicalNote) {
                    this.canonicalNotes[topicKey] = {
                        topic_key: topicKey,
                        title: this.extractTitle(canonicalNote),
                        body: canonicalNote,
                        created_at: new Date().toISOString(),
                        evidence_count: evidenceItems.length,
                        source_spans: evidenceItems.map(e => e.span_ref)
                    };
                    
                    reconciledCount++;
                    console.log("   ✅ Created canonical note");
                } else {
                    console.log("   ⚠️  Failed to generate canonical note");
                }
                
                // Add small delay to avoid overwhelming Ollama
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.warn(`   ⚠️  Error reconciling ${topicKey}: ${error.message}`);
            }
        }

        console.log(`📈 Reconciled ${reconciledCount} canonical notes`);
        return reconciledCount;
    }

    async generateTimeSummaries() {
        console.log("\n⏱️  Generating time-based summaries...");
        
        const now = new Date();
        const timeWindows = {
            "10min": 10 * 60 * 1000,
            "30min": 30 * 60 * 1000,
            "60min": 60 * 60 * 1000
        };

        for (const [window, duration] of Object.entries(timeWindows)) {
            const cutoff = new Date(now.getTime() - duration);
            
            const recentEvidence = this.evidenceBuffer.filter(e => 
                new Date(e.created_at) > cutoff
            );

            if (recentEvidence.length > 0) {
                const summaryPrompt = this.buildSummaryPrompt(window, recentEvidence);
                const summary = await this.callOllama(summaryPrompt);
                
                this.timeSummaries[window] = {
                    window,
                    generated_at: now.toISOString(),
                    evidence_count: recentEvidence.length,
                    summary: summary || `${recentEvidence.length} activities in last ${window}`
                };
                
                console.log(`   ✅ Generated ${window} summary (${recentEvidence.length} items)`);
            } else {
                this.timeSummaries[window] = {
                    window,
                    generated_at: now.toISOString(),
                    evidence_count: 0,
                    summary: `No recent activity in last ${window}`
                };
                
                console.log(`   📝 No activity in last ${window}`);
            }
        }
    }

    async generateMementoImport() {
        console.log("\n📋 Generating Memento MCP import file...");
        
        const entities = [];
        
        // Add canonical notes as entities
        for (const [topicKey, note] of Object.entries(this.canonicalNotes)) {
            entities.push({
                name: note.title || `Development Session: ${topicKey}`,
                entityType: "development_session",
                observations: [
                    `Topic: ${topicKey}`,
                    `Created: ${note.created_at}`,
                    `Evidence sources: ${note.evidence_count}`,
                    `Summary: ${note.body.substring(0, 200)}...`,
                    `Source spans: ${note.source_spans.join(", ")}`
                ]
            });
        }

        // Add symbols table as entity
        if (Object.keys(this.symbolsTable.symbols || {}).length > 0) {
            entities.push({
                name: "HexTrackr Codebase Symbols",
                entityType: "code_structure",
                observations: [
                    `Total symbols: ${this.symbolsTable.total_symbols}`,
                    `Generated: ${this.symbolsTable.generated_at}`,
                    `Project: ${this.symbolsTable.project}`,
                    `Functions: ${Object.values(this.symbolsTable.symbols).filter(s => s.type === "function").length}`,
                    `Classes: ${Object.values(this.symbolsTable.symbols).filter(s => s.type === "class").length}`,
                    `Variables: ${Object.values(this.symbolsTable.symbols).filter(s => s.type === "variable").length}`
                ]
            });
        }

        // Add time summaries as entities
        for (const [window, summary] of Object.entries(this.timeSummaries)) {
            if (summary.evidence_count > 0) {
                entities.push({
                    name: `Recent Activity Summary (${window})`,
                    entityType: "time_summary",
                    observations: [
                        `Time window: ${window}`,
                        `Activities: ${summary.evidence_count}`,
                        `Generated: ${summary.generated_at}`,
                        `Summary: ${summary.summary}`
                    ]
                });
            }
        }

        const mementoImport = {
            generated_at: new Date().toISOString(),
            total_entities: entities.length,
            source: "semantic_orchestrator",
            entities
        };

        // Save import file
        fs.writeFileSync(this.mementoImportFile, JSON.stringify(mementoImport, null, 2));
        
        console.log(`📋 Generated ${entities.length} entities for Memento import`);
        console.log(`💾 Saved to: ${this.mementoImportFile}`);
        
        return entities.length;
    }

    async saveAllData() {
        console.log("\n💾 Saving all data files...");
        
        try {
            // Save evidence buffer
            fs.writeFileSync(this.evidenceFile, JSON.stringify(this.evidenceBuffer, null, 2));
            console.log(`   ✅ Saved ${this.evidenceBuffer.length} evidence items`);
            
            // Save canonical notes
            fs.writeFileSync(this.canonicalFile, JSON.stringify(this.canonicalNotes, null, 2));
            console.log(`   ✅ Saved ${Object.keys(this.canonicalNotes).length} canonical notes`);
            
            // Save symbols table
            fs.writeFileSync(this.symbolsFile, JSON.stringify(this.symbolsTable, null, 2));
            console.log("   ✅ Saved symbols table");
            
            // Save time summaries
            fs.writeFileSync(this.summariesFile, JSON.stringify(this.timeSummaries, null, 2));
            console.log("   ✅ Saved time summaries");
            
            console.log(`\n📊 All data saved to ${this.jsonDir}`);
            
        } catch (error) {
            console.error("❌ Error saving data:", error.message);
        }
    }

    // Helper methods
    parseLogFile(content, filename) {
        const conversations = [];
        
        try {
            if (filename.endsWith(".jsonl")) {
                const lines = content.split("\n").filter(line => line.trim());
                for (const line of lines) {
                    try {
                        conversations.push(JSON.parse(line));
                    } catch (e) {
                        // Skip invalid lines
                    }
                }
            } else {
                const parsed = JSON.parse(content);
                if (Array.isArray(parsed)) {
                    conversations.push(...parsed);
                } else {
                    conversations.push(parsed);
                }
            }
        } catch (error) {
            // Skip invalid files
        }

        return conversations.map(conv => ({
            id: conv.id || `${filename}-${Date.now()}`,
            timestamp: conv.timestamp || conv.createdAt || Date.now(),
            messages: conv.messages || conv.turns || [conv],
            source: filename
        }));
    }

    generateTopicKey(conversation) {
        // Generate semantic topic key from conversation
        const text = this.extractConversationText(conversation);
        
        // Look for file references
        const fileMatch = text.match(/(\w+\.(js|ts|html|css|md|json))/i);
        if (fileMatch) {
            return `hextrackr:${fileMatch[1]}`;
        }
        
        // Look for feature keywords
        const keywords = text.toLowerCase().match(/\b(api|database|security|ui|bug|feature|test|deploy)\b/);
        if (keywords) {
            return `hextrackr:${keywords[0]}`;
        }
        
        // Default topic
        return "hextrackr:general";
    }

    generateTopicKeyFromBackup(data, filePath) {
        const filename = path.basename(filePath, ".json");
        
        if (data.topic || data.name) {
            return `hextrackr:${data.topic || data.name}`;
        }
        
        return `hextrackr:backup:${filename}`;
    }

    generateTopicKeyFromChat(chatEntry) {
        if (chatEntry.workspaceId) {
            return `hextrackr:chat:${chatEntry.workspaceId}`;
        }
        
        return "hextrackr:chat:unknown";
    }

    extractConversationText(conversation) {
        const messages = conversation.messages || [];
        return messages.map(m => m.content || m.text || "").join(" ").substring(0, 1000);
    }

    assessQuality(conversation) {
        const text = this.extractConversationText(conversation);
        const messages = conversation.messages || [];
        
        let quality = 0.5; // Base quality
        
        // More messages = higher quality
        if (messages.length > 3) {quality += 0.2;}
        
        // Longer text = higher quality
        if (text.length > 200) {quality += 0.1;}
        
        // Code-related content = higher quality
        if (text.match(/\b(function|class|const|let|var|async|await)\b/)) {quality += 0.2;}
        
        return Math.min(quality, 1.0);
    }

    simpleHash(text) {
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    extractTitle(canonicalNote) {
        const lines = canonicalNote.split("\n");
        const firstLine = lines[0] || "";
        
        // Remove markdown formatting
        return firstLine.replace(/^#+\s*/, "").substring(0, 100);
    }

    buildReconciliationPrompt(topicKey, evidenceItems) {
        return `You are a semantic memory reconciler for the HexTrackr project. Create a single canonical note from this evidence.

TOPIC: ${topicKey}

EVIDENCE (${evidenceItems.length} items):
${evidenceItems.map((e, i) => `
${i + 1}. Source: ${e.source} (${e.span_ref})
   Quality: ${e.quality}
   Text: ${e.text.substring(0, 300)}...
`).join("")}

Create a structured canonical note (max 250 words):
- Title: Brief descriptive title
- Summary: Key decisions and outcomes  
- Technical Details: Code changes, configurations
- Next Actions: What needs to be done
- Related Files: Files mentioned
- Context: Why this work was done

Focus on extracting actual decisions, technical insights, and actionable information. Cite evidence sources where relevant.`;
    }

    buildSummaryPrompt(window, evidenceItems) {
        return `Summarize the last ${window} of development activity for HexTrackr project.

EVIDENCE (${evidenceItems.length} items):
${evidenceItems.map(e => `- ${e.source}: ${e.text.substring(0, 100)}...`).join("\n")}

Provide a concise summary (max 100 words) focusing on:
- What was accomplished
- What problems were solved  
- What decisions were made
- Current development focus

Be specific about technical work done.`;
    }

    async callOllama(prompt) {
        return new Promise((resolve, reject) => {
            const ollama = spawn("ollama", ["run", this.ollamaModel]);
            
            let output = "";
            let errorOutput = "";

            ollama.stdout.on("data", (data) => {
                output += data.toString();
            });

            ollama.stderr.on("data", (data) => {
                errorOutput += data.toString();
            });

            ollama.on("close", (code) => {
                if (code === 0) {
                    resolve(output.trim());
                } else {
                    console.warn(`Ollama failed with code ${code}: ${errorOutput}`);
                    resolve(null);
                }
            });

            ollama.on("error", (error) => {
                console.warn(`Ollama error: ${error.message}`);
                resolve(null);
            });

            // Send prompt and close input
            ollama.stdin.write(prompt);
            ollama.stdin.end();
        });
    }

    async runFullOrchestration() {
        console.log("🚀 HexTrackr Semantic Memory Orchestrator - Full Run");
        console.log("===================================================\n");
        
        const startTime = Date.now();
        
        try {
            // Step 1: Process historical chat logs
            const chatCount = await this.processHistoricalChatLogs();
            
            // Step 2: Process rEngine backups
            const realtimeChatCount = await this.processRealtimeChatData();
            
            // Step 3: Build symbols table
            await this.buildSymbolsTable();
            
            // Step 4: Reconcile with Ollama (do in batches to avoid overwhelming)
            const totalEvidence = this.evidenceBuffer.length;
            if (totalEvidence > 100) {
                console.log(`⚠️  Large evidence set (${totalEvidence} items), processing in batches...`);
                // Process top 50 most recent items for initial run
                this.evidenceBuffer = this.evidenceBuffer
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 50);
            }
            
            const reconciledCount = await this.reconcileWithOllama();
            
            // Step 5: Generate time summaries
            await this.generateTimeSummaries();
            
            // Step 6: Generate Memento import
            const entityCount = await this.generateMementoImport();
            
            // Step 7: Save all data
            await this.saveAllData();
            
            const duration = (Date.now() - startTime) / 1000;
            
            console.log("\n🎉 Orchestration Complete!");
            console.log("============================");
            console.log(`⏱️  Duration: ${duration.toFixed(1)} seconds`);
            console.log(`📊 Evidence items: ${this.evidenceBuffer.length}`);
            console.log(`📝 Canonical notes: ${Object.keys(this.canonicalNotes).length}`);
            console.log(`🔧 Symbols: ${this.symbolsTable.total_symbols || 0}`);
            console.log(`📋 Memento entities: ${entityCount}`);
            console.log(`\n📁 Files created in: ${this.jsonDir}`);
            console.log("   - chat-evidence.json");
            console.log("   - canonical-notes.json");
            console.log("   - symbols-table.json");
            console.log("   - time-summaries.json");
            console.log("   - memento-import.json");
            console.log("\n🚀 Ready to import into Memento MCP!");
            
            return {
                success: true,
                duration,
                stats: {
                    evidence: this.evidenceBuffer.length,
                    canonical: Object.keys(this.canonicalNotes).length,
                    symbols: this.symbolsTable.total_symbols || 0,
                    entities: entityCount
                }
            };
            
        } catch (error) {
            console.error("\n❌ Orchestration failed:", error.message);
            console.error(error.stack);
            
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// CLI execution
if (require.main === module) {
    const orchestrator = new SemanticOrchestrator();
    orchestrator.runFullOrchestration()
        .then(result => {
            if (result.success) {
                console.log("\n✅ Memory system is now HUGE with 2.5 weeks of data!");
                process.exit(0);
            } else {
                console.log("\n❌ Orchestration failed");
                process.exit(1);
            }
        })
        .catch(error => {
            console.error("❌ Unexpected error:", error);
            process.exit(1);
        });
}

module.exports = SemanticOrchestrator;
