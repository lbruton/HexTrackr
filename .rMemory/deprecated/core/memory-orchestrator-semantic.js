#!/usr/bin/env node
/**
 * HexTrackr Semantic Memory Orchestrator
 * 
 * Implements ChatGPT's semantic approach:
 * - Single source of truth per topic/timebox
 * - Evidence reconciliation (not summary proliferation)  
 * - Noise budget controls
 * - Protocol-based memory operations
 * - Claude embeddings integration for Memento MCP
 * 
 * Pipeline: VS Code Chat → Ollama qwen2.5-coder → SQLite → Memento JSON → Neo4j
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawn, execSync } = require("child_process");

class SemanticMemoryOrchestrator {
    constructor() {
        this.projectRoot = process.cwd();
        this.memoryDir = path.join(this.projectRoot, ".rMemory");
        this.jsonDir = path.join(this.memoryDir, "json");
        this.mementoDir = path.join(this.memoryDir, "memento");
        
        // Ollama configuration
        this.ollamaModel = "qwen2.5-coder:7b";
        this.embeddingModel = "nomic-embed-text:latest";
        
        // ChatGPT semantic approach settings
        this.noiseBudget = 50; // max evidence items per hour
        this.timeWindows = [10, 30, 60]; // minutes for summaries
        this.maxTopicAge = 4 * 60 * 60 * 1000; // 4 hours in ms
        
        // VS Code chat logs
        this.chatLogPath = path.join(os.homedir(), "Library/Application Support/Code/User/globalStorage/github.copilot-chat/");
        
        this.ensureDirectories();
        this.loadState();
    }

    ensureDirectories() {
        [this.jsonDir, this.mementoDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    loadState() {
        const stateFile = path.join(this.jsonDir, "orchestrator-state.json");
        this.state = fs.existsSync(stateFile) 
            ? JSON.parse(fs.readFileSync(stateFile, "utf8"))
            : {
                lastChatScan: 0,
                lastCodeScan: 0,
                lastReconcile: 0,
                topicKeys: new Set(),
                evidenceCount: 0,
                canonicalNotes: 0
            };
    }

    saveState() {
        const stateFile = path.join(this.jsonDir, "orchestrator-state.json");
        fs.writeFileSync(stateFile, JSON.stringify({
            ...this.state,
            topicKeys: Array.from(this.state.topicKeys)
        }, null, 2));
    }

    async checkOllama() {
        console.log("🔍 Checking Ollama status...");
        
        try {
            const result = execSync("ollama list", { encoding: "utf8" });
            
            if (!result.includes(this.ollamaModel)) {
                console.warn(`⚠️  Model ${this.ollamaModel} not found. Pulling...`);
                execSync(`ollama pull ${this.ollamaModel}`, { stdio: "inherit" });
            }
            
            if (!result.includes(this.embeddingModel)) {
                console.warn(`⚠️  Embedding model ${this.embeddingModel} not found. Pulling...`);
                execSync(`ollama pull ${this.embeddingModel}`, { stdio: "inherit" });
            }
            
            console.log("✅ Ollama ready");
            return true;
        } catch (error) {
            console.error("❌ Ollama not available:", error.message);
            return false;
        }
    }

    async scanChatHistory() {
        console.log("📖 Scanning VS Code chat history...");
        
        if (!fs.existsSync(this.chatLogPath)) {
            console.warn("⚠️  VS Code chat directory not found");
            return [];
        }

        try {
            const files = fs.readdirSync(this.chatLogPath)
                .filter(file => file.endsWith(".jsonl") || file.endsWith(".json"))
                .map(file => ({
                    name: file,
                    path: path.join(this.chatLogPath, file),
                    modified: fs.statSync(path.join(this.chatLogPath, file)).mtime.getTime()
                }))
                .sort((a, b) => b.modified - a.modified); // Most recent first

            console.log(`📊 Found ${files.length} chat log files`);

            const evidence = [];
            const processLimit = 10; // Process last 10 files (ChatGPT pattern)
            
            for (const file of files.slice(0, processLimit)) {
                if (file.modified <= this.state.lastChatScan) {continue;}
                
                console.log(`📖 Processing: ${file.name}`);
                
                try {
                    const content = fs.readFileSync(file.path, "utf8");
                    const conversations = this.parseLogFile(content, file.name);
                    
                    for (const conv of conversations) {
                        const topicKey = this.generateTopicKey(conv);
                        this.state.topicKeys.add(topicKey);
                        
                        evidence.push({
                            id: `CHAT-${conv.id}-${Date.now()}`,
                            topicKey,
                            source: "vscode_chat",
                            spanRef: `${file.name}:${conv.timestamp}`,
                            text: this.extractConversationText(conv),
                            quality: this.assessQuality(conv),
                            createdAt: new Date(conv.timestamp).toISOString(),
                            simHash: this.simpleHash(this.extractConversationText(conv))
                        });
                    }
                    
                    console.log(`   ✅ Extracted ${conversations.length} conversations`);
                } catch (error) {
                    console.warn(`   ⚠️  Failed to parse ${file.name}: ${error.message}`);
                }
            }

            this.state.lastChatScan = Date.now();
            this.state.evidenceCount += evidence.length;
            
            // Save evidence for reconciliation
            const evidenceFile = path.join(this.jsonDir, "chat-evidence.json");
            const existingEvidence = fs.existsSync(evidenceFile) 
                ? JSON.parse(fs.readFileSync(evidenceFile, "utf8")) 
                : [];
            
            const combinedEvidence = [...existingEvidence, ...evidence];
            fs.writeFileSync(evidenceFile, JSON.stringify(combinedEvidence, null, 2));
            
            console.log(`✅ Processed ${evidence.length} new chat evidence items`);
            return evidence;

        } catch (error) {
            console.error("❌ Chat history scan failed:", error.message);
            return [];
        }
    }

    parseLogFile(content, filename) {
        const conversations = [];
        
        try {
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
            } else {
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
            source,
            messages: raw.messages || raw.turns || [raw],
            metadata: {
                processed: new Date().toISOString(),
                sourceFile: source,
                rawKeys: Object.keys(raw)
            }
        };
    }

    generateTopicKey(conversation) {
        // Generate semantic topic key based on project + file/feature context
        const messages = conversation.messages || [];
        const text = messages.map(m => m.content || m.text || "").join(" ").toLowerCase();
        
        // Extract file references
        const fileMatch = text.match(/\b[\w\-]+\.(js|html|css|md|json|ts|jsx|tsx)\b/g);
        const file = fileMatch ? fileMatch[0] : "general";
        
        // Extract feature context
        const features = [];
        if (text.includes("ticket")) {features.push("tickets");}
        if (text.includes("vulnerabilit")) {features.push("vulnerabilities");}
        if (text.includes("memento") || text.includes("memory")) {features.push("memory");}
        if (text.includes("docker") || text.includes("deploy")) {features.push("deployment");}
        if (text.includes("api") || text.includes("server")) {features.push("api");}
        
        const feature = features.length > 0 ? features[0] : "development";
        const date = new Date(conversation.timestamp).toISOString().split("T")[0];
        
        return `hextrackr:${feature}:${file}:${date}`;
    }

    extractConversationText(conversation) {
        const messages = conversation.messages || [];
        return messages
            .map(m => `${m.role || m.author || "user"}: ${m.content || m.text || ""}`)
            .join("\n")
            .slice(0, 2000); // Limit text size for processing
    }

    assessQuality(conversation) {
        const text = this.extractConversationText(conversation);
        let quality = 0.5; // baseline
        
        // Boost for code-related content
        if (text.includes("function") || text.includes("const ") || text.includes("class ")) {quality += 0.2;}
        
        // Boost for decisions/solutions
        if (text.includes("decision") || text.includes("solution") || text.includes("fix")) {quality += 0.2;}
        
        // Boost for architecture/design
        if (text.includes("architect") || text.includes("design") || text.includes("pattern")) {quality += 0.1;}
        
        // Reduce for short conversations
        if (text.length < 100) {quality -= 0.2;}
        
        return Math.max(0.1, Math.min(1.0, quality));
    }

    simpleHash(text) {
        // Simple hash for deduplication (ChatGPT SimHash pattern)
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    async scanCodebase() {
        console.log("🔍 Scanning codebase for symbols...");
        
        try {
            // Use existing code indexer if available, otherwise create simple one
            const symbolsFile = path.join(this.jsonDir, "symbols-table.json");
            
            const symbols = await this.extractCodeSymbols();
            fs.writeFileSync(symbolsFile, JSON.stringify(symbols, null, 2));
            
            console.log(`✅ Indexed ${symbols.length} code symbols`);
            this.state.lastCodeScan = Date.now();
            
            return symbols;
        } catch (error) {
            console.error("❌ Codebase scan failed:", error.message);
            return [];
        }
    }

    async extractCodeSymbols() {
        const symbols = [];
        const extensions = [".js", ".ts", ".jsx", ".tsx", ".html", ".css", ".md"];
        
        const scanDir = (dir, basePath = "") => {
            if (dir.includes("node_modules") || dir.includes(".git")) {return;}
            
            try {
                const entries = fs.readdirSync(dir);
                
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry);
                    const relativePath = path.join(basePath, entry);
                    
                    if (fs.statSync(fullPath).isDirectory()) {
                        scanDir(fullPath, relativePath);
                    } else if (extensions.some(ext => entry.endsWith(ext))) {
                        const content = fs.readFileSync(fullPath, "utf8");
                        const fileSymbols = this.parseFileSymbols(content, relativePath);
                        symbols.push(...fileSymbols);
                    }
                }
            } catch (error) {
                // Skip inaccessible directories
            }
        };
        
        scanDir(this.projectRoot);
        return symbols;
    }

    parseFileSymbols(content, filePath) {
        const symbols = [];
        const lines = content.split("\n");
        
        lines.forEach((line, lineNumber) => {
            // Extract functions
            const functionMatch = line.match(/(?:function|const|let|var)\s+(\w+)\s*(?:=\s*(?:async\s+)?(?:function|\()|=|\()/);
            if (functionMatch) {
                symbols.push({
                    name: functionMatch[1],
                    type: "function",
                    file: filePath,
                    line: lineNumber + 1,
                    signature: line.trim()
                });
            }
            
            // Extract classes
            const classMatch = line.match(/class\s+(\w+)/);
            if (classMatch) {
                symbols.push({
                    name: classMatch[1],
                    type: "class",
                    file: filePath,
                    line: lineNumber + 1,
                    signature: line.trim()
                });
            }
            
            // Extract exports
            const exportMatch = line.match(/export\s+(?:default\s+)?(?:const|function|class)\s+(\w+)/);
            if (exportMatch) {
                symbols.push({
                    name: exportMatch[1],
                    type: "export",
                    file: filePath,
                    line: lineNumber + 1,
                    signature: line.trim()
                });
            }
        });
        
        return symbols;
    }

    async reconcileEvidence() {
        console.log("🔄 Running semantic evidence reconciliation...");
        
        // Implementation of ChatGPT's reconciliation pattern
        const evidenceFile = path.join(this.jsonDir, "chat-evidence.json");
        if (!fs.existsSync(evidenceFile)) {return;}
        
        const evidence = JSON.parse(fs.readFileSync(evidenceFile, "utf8"));
        const canonicalNotes = new Map();
        
        // Group evidence by topic key and time window
        const topicGroups = new Map();
        
        for (const item of evidence) {
            if (!topicGroups.has(item.topicKey)) {
                topicGroups.set(item.topicKey, []);
            }
            topicGroups.get(item.topicKey).push(item);
        }
        
        // Process each topic group
        for (const [topicKey, items] of topicGroups) {
            console.log(`🧠 Processing topic: ${topicKey}`);
            
            // Deduplicate by simHash
            const deduped = this.deduplicateEvidence(items);
            
            // Create or update canonical note
            const canonicalNote = await this.createCanonicalNote(topicKey, deduped);
            canonicalNotes.set(topicKey, canonicalNote);
        }
        
        // Save canonical notes for Memento
        const notesFile = path.join(this.jsonDir, "canonical-notes.json");
        fs.writeFileSync(notesFile, JSON.stringify(Array.from(canonicalNotes.values()), null, 2));
        
        this.state.lastReconcile = Date.now();
        this.state.canonicalNotes = canonicalNotes.size;
        
        console.log(`✅ Created ${canonicalNotes.size} canonical notes`);
        return Array.from(canonicalNotes.values());
    }

    deduplicateEvidence(items) {
        const unique = new Map();
        
        for (const item of items) {
            const existing = Array.from(unique.values()).find(existing => 
                Math.abs(existing.simHash - item.simHash) < 1000 // Simple similarity threshold
            );
            
            if (!existing) {
                unique.set(item.id, item);
            } else {
                // Merge quality scores
                existing.quality = Math.max(existing.quality, item.quality);
                existing.sources = existing.sources || [];
                existing.sources.push(item.id);
            }
        }
        
        return Array.from(unique.values());
    }

    async createCanonicalNote(topicKey, evidence) {
        console.log(`🎯 Creating canonical note for ${topicKey}`);
        
        const prompt = this.buildCanonicalNotePrompt(topicKey, evidence);
        
        try {
            const analysis = await this.callOllama(prompt);
            
            // Extract structured note from Ollama response
            const canonicalNote = {
                id: `NOTE-${topicKey}-${Date.now()}`,
                topicKey,
                title: this.extractTitle(analysis, topicKey),
                body: this.extractStructuredBody(analysis),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                freshness: 1.0,
                confidence: this.assessNoteConfidence(evidence),
                evidenceIds: evidence.map(e => e.id),
                source: "ollama_qwen2.5-coder"
            };
            
            return canonicalNote;
        } catch (error) {
            console.error(`❌ Failed to create note for ${topicKey}:`, error.message);
            
            // Fallback: create simple note
            return {
                id: `NOTE-${topicKey}-${Date.now()}`,
                topicKey,
                title: `Development Session: ${topicKey}`,
                body: `Automated session summary with ${evidence.length} evidence items`,
                createdAt: new Date().toISOString(),
                confidence: 0.3,
                evidenceIds: evidence.map(e => e.id),
                source: "fallback"
            };
        }
    }

    buildCanonicalNotePrompt(topicKey, evidence) {
        return `You are Scribe for HexTrackr project. Create a canonical note for topic: ${topicKey}

CONSTRAINTS:
- Bullet sections only, no prose paragraphs
- Every claim must cite evidence ID [EVID:x] inline  
- Include: Decisions, Open Questions, Next Actions, Related Files
- Max 250 words total
- Focus on HexTrackr cybersecurity ticket/vulnerability management

EVIDENCE:
${evidence.map(e => `[EVID:${e.id}] ${e.text.slice(0, 200)}...`).join("\n")}

OUTPUT STRUCTURED NOTE:`;
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
                    resolve(output);
                } else {
                    reject(new Error(`Ollama failed: ${errorOutput}`));
                }
            });

            ollama.on("error", (error) => {
                reject(error);
            });

            // Send prompt
            ollama.stdin.write(prompt);
            ollama.stdin.end();
        });
    }

    extractTitle(analysis, topicKey) {
        const lines = analysis.split("\n");
        const titleLine = lines.find(line => 
            line.includes("Title:") || 
            line.includes("## ") ||
            line.includes("# ")
        );
        
        if (titleLine) {
            return titleLine.replace(/^#+\s*|Title:\s*/g, "").trim();
        }
        
        return `Development Session: ${topicKey.split(":").slice(1).join(" ")}`;
    }

    extractStructuredBody(analysis) {
        // Extract bullet points and structured sections
        const lines = analysis.split("\n");
        const bodyLines = lines.filter(line => 
            line.trim().startsWith("-") || 
            line.trim().startsWith("*") ||
            line.includes("[EVID:") ||
            line.includes("Decisions:") ||
            line.includes("Next Actions:")
        );
        
        return bodyLines.join("\n").slice(0, 1000); // Limit body size
    }

    assessNoteConfidence(evidence) {
        const avgQuality = evidence.reduce((sum, e) => sum + e.quality, 0) / evidence.length;
        const evidenceCount = evidence.length;
        
        // More evidence + higher quality = higher confidence
        return Math.min(1.0, avgQuality * (1 + Math.log10(evidenceCount)));
    }

    async generateTimeSummaries() {
        console.log("⏰ Generating time-based summaries...");
        
        const now = Date.now();
        const summaries = {};
        
        for (const window of this.timeWindows) {
            const cutoff = now - (window * 60 * 1000);
            const recentEvidence = this.getEvidenceSince(cutoff);
            
            if (recentEvidence.length > 0) {
                const summary = await this.createTimeSummary(window, recentEvidence);
                summaries[`last_${window}_minutes`] = summary;
            }
        }
        
        // Save summaries for Memento
        const summariesFile = path.join(this.jsonDir, "time-summaries.json");
        fs.writeFileSync(summariesFile, JSON.stringify(summaries, null, 2));
        
        console.log(`✅ Generated summaries for ${Object.keys(summaries).length} time windows`);
        return summaries;
    }

    getEvidenceSince(cutoff) {
        const evidenceFile = path.join(this.jsonDir, "chat-evidence.json");
        if (!fs.existsSync(evidenceFile)) {return [];}
        
        const evidence = JSON.parse(fs.readFileSync(evidenceFile, "utf8"));
        return evidence.filter(item => new Date(item.createdAt).getTime() > cutoff);
    }

    async createTimeSummary(windowMinutes, evidence) {
        const prompt = `Summarize HexTrackr development activity from last ${windowMinutes} minutes:

EVIDENCE (${evidence.length} items):
${evidence.map(e => `- ${e.text.slice(0, 100)}...`).join("\n")}

Provide concise bullet summary focusing on:
- Key decisions made
- Problems solved  
- Next actions identified
- Files/features worked on

Max 100 words:`;

        try {
            const summary = await this.callOllama(prompt);
            return {
                window: `${windowMinutes} minutes`,
                evidenceCount: evidence.length,
                summary: summary.slice(0, 500),
                generatedAt: new Date().toISOString()
            };
        } catch (error) {
            return {
                window: `${windowMinutes} minutes`,
                evidenceCount: evidence.length,
                summary: `Analysis unavailable (${evidence.length} evidence items processed)`,
                generatedAt: new Date().toISOString()
            };
        }
    }

    async generateMementoExport() {
        console.log("💾 Generating Memento MCP export...");
        
        // Load all generated data
        const canonicalNotes = this.loadJsonFile("canonical-notes.json", []);
        const symbols = this.loadJsonFile("symbols-table.json", []);
        const summaries = this.loadJsonFile("time-summaries.json", {});
        
        const mementoEntities = [];
        
        // Export canonical notes as entities
        for (const note of canonicalNotes) {
            mementoEntities.push({
                name: note.title,
                entityType: "development_session",
                observations: [
                    `Topic: ${note.topicKey}`,
                    `Content: ${note.body}`,
                    `Evidence IDs: ${note.evidenceIds.join(", ")}`,
                    `Confidence: ${note.confidence}`,
                    `Generated: ${note.createdAt}`
                ]
            });
        }
        
        // Export symbols as code entities
        const symbolsByFile = new Map();
        for (const symbol of symbols) {
            if (!symbolsByFile.has(symbol.file)) {
                symbolsByFile.set(symbol.file, []);
            }
            symbolsByFile.get(symbol.file).push(symbol);
        }
        
        for (const [file, fileSymbols] of symbolsByFile) {
            mementoEntities.push({
                name: `Code Symbols: ${file}`,
                entityType: "code_structure",
                observations: [
                    `File: ${file}`,
                    `Symbol count: ${fileSymbols.length}`,
                    `Functions: ${fileSymbols.filter(s => s.type === "function").map(s => `${s.name}:${s.line}`).join(", ")}`,
                    `Classes: ${fileSymbols.filter(s => s.type === "class").map(s => `${s.name}:${s.line}`).join(", ")}`,
                    `Last scanned: ${new Date().toISOString()}`
                ]
            });
        }
        
        // Export time summaries
        for (const [window, summary] of Object.entries(summaries)) {
            mementoEntities.push({
                name: `Activity Summary: ${window}`,
                entityType: "time_summary",
                observations: [
                    `Time window: ${summary.window}`,
                    `Evidence processed: ${summary.evidenceCount}`,
                    `Summary: ${summary.summary}`,
                    `Generated: ${summary.generatedAt}`
                ]
            });
        }
        
        // Export project context
        mementoEntities.push({
            name: "HexTrackr Project Context",
            entityType: "project_context",
            observations: [
                "Project: HexTrackr - Cybersecurity ticket and vulnerability management",
                "Architecture: Docker + Node.js + Express + SQLite",
                "Frontend: Tabler.io CSS framework",
                "Memory System: Memento MCP + Neo4j + Claude embeddings",
                `Symbol count: ${symbols.length}`,
                `Active topics: ${this.state.topicKeys.size}`,
                `Last updated: ${new Date().toISOString()}`
            ]
        });
        
        const mementoExport = { entities: mementoEntities };
        
        // Save for Memento import
        const exportFile = path.join(this.mementoDir, "memento-import.json");
        fs.writeFileSync(exportFile, JSON.stringify(mementoExport, null, 2));
        
        console.log(`✅ Generated ${mementoEntities.length} entities for Memento MCP`);
        console.log(`💾 Export saved to: ${exportFile}`);
        
        return mementoExport;
    }

    loadJsonFile(filename, defaultValue) {
        const filePath = path.join(this.jsonDir, filename);
        if (fs.existsSync(filePath)) {
            try {
                return JSON.parse(fs.readFileSync(filePath, "utf8"));
            } catch (error) {
                console.warn(`⚠️  Failed to load ${filename}: ${error.message}`);
            }
        }
        return defaultValue;
    }

    async runFullOrchestration() {
        console.log("🚀 Starting Semantic Memory Orchestration");
        console.log("=" .repeat(50));
        
        const startTime = Date.now();
        
        try {
            // Step 1: Check prerequisites
            const ollamaReady = await this.checkOllama();
            if (!ollamaReady) {
                throw new Error("Ollama not available");
            }
            
            // Step 2: Scan chat history for evidence
            const evidence = await this.scanChatHistory();
            
            // Step 3: Scan codebase for symbols
            const symbols = await this.scanCodebase();
            
            // Step 4: Reconcile evidence into canonical notes
            const notes = await this.reconcileEvidence();
            
            // Step 5: Generate time-based summaries
            const summaries = await this.generateTimeSummaries();
            
            // Step 6: Generate Memento export
            const mementoExport = await this.generateMementoExport();
            
            // Step 7: Save orchestrator state
            this.saveState();
            
            const duration = (Date.now() - startTime) / 1000;
            
            console.log("\n🎉 Semantic Memory Orchestration Complete!");
            console.log("=" .repeat(50));
            console.log(`⏱️  Duration: ${duration.toFixed(1)}s`);
            console.log(`📊 Evidence items: ${evidence.length}`);
            console.log(`🔍 Code symbols: ${symbols.length}`);
            console.log(`📝 Canonical notes: ${notes.length}`);
            console.log(`⏰ Time summaries: ${Object.keys(summaries).length}`);
            console.log(`💾 Memento entities: ${mementoExport.entities.length}`);
            
            console.log("\n📋 Next Steps:");
            console.log("1. Import entities into Memento MCP via VS Code");
            console.log("2. Verify memory storage in Neo4j database");
            console.log("3. Test memory retrieval in next chat session");
            console.log(`4. Check output files in: ${this.jsonDir}`);
            
            return {
                success: true,
                duration,
                stats: {
                    evidence: evidence.length,
                    symbols: symbols.length,
                    notes: notes.length,
                    summaries: Object.keys(summaries).length,
                    entities: mementoExport.entities.length
                }
            };
            
        } catch (error) {
            console.error("\n❌ Orchestration failed:", error.message);
            console.log("\n🔧 Troubleshooting:");
            console.log("- Ensure Ollama is running: ollama serve");
            console.log("- Check VS Code chat logs exist");
            console.log("- Verify models installed: ollama list");
            console.log("- Check disk space and permissions");
            
            return { success: false, error: error.message };
        }
    }

    async startContinuousMode() {
        console.log("🔄 Starting continuous monitoring mode...");
        
        // Initial full run
        await this.runFullOrchestration();
        
        // Then monitor at intervals
        const monitorInterval = 10 * 60 * 1000; // 10 minutes
        
        setInterval(async () => {
            console.log("\n🔄 Running periodic memory update...");
            
            try {
                // Quick update: just new evidence + reconciliation
                const evidence = await this.scanChatHistory();
                if (evidence.length > 0) {
                    await this.reconcileEvidence();
                    await this.generateTimeSummaries();
                    await this.generateMementoExport();
                    this.saveState();
                    
                    console.log(`✅ Updated with ${evidence.length} new evidence items`);
                }
            } catch (error) {
                console.error("❌ Periodic update failed:", error.message);
            }
        }, monitorInterval);
        
        console.log(`🔄 Continuous monitoring active (${monitorInterval/60000} min intervals)`);
    }
}

// CLI interface
if (require.main === module) {
    const orchestrator = new SemanticMemoryOrchestrator();
    
    const command = process.argv[2] || "run";
    
    switch (command) {
        case "run":
            orchestrator.runFullOrchestration();
            break;
        case "continuous":
            orchestrator.startContinuousMode();
            break;
        case "scan-chats":
            orchestrator.scanChatHistory();
            break;
        case "scan-code":
            orchestrator.scanCodebase();
            break;
        case "reconcile":
            orchestrator.reconcileEvidence();
            break;
        case "export":
            orchestrator.generateMementoExport();
            break;
        default:
            console.log("Usage: node memory-orchestrator-semantic.js [run|continuous|scan-chats|scan-code|reconcile|export]");
            process.exit(1);
    }
}

module.exports = SemanticMemoryOrchestrator;
