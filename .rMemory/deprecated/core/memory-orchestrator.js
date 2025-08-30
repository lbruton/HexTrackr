#!/usr/bin/env node
/**
 * HexTrackr Memory Orchestrator
 * Implements the semantic approach from ChatGPT blueprint
 * 
 * Pipeline: VS Code Chat → Ollama qwen2.5-coder → Evidence → Canonical Notes → Memento MCP
 */

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const crypto = require("crypto");

class MemoryOrchestrator {
    constructor() {
        this.projectRoot = process.cwd();
        this.rMemoryPath = path.join(this.projectRoot, ".rMemory");
        this.jsonPath = path.join(this.rMemoryPath, "json");
        this.evidencePath = path.join(this.jsonPath, "evidence.json");
        this.notesPath = path.join(this.jsonPath, "canonical-notes.json");
        this.todosPath = path.join(this.jsonPath, "todos.json");
        this.symbolsPath = path.join(this.jsonPath, "symbols-table.json");
        this.summariesPath = path.join(this.jsonPath, "time-summaries.json");
        
        this.ollamaModel = "qwen2.5-coder:7b";
        this.embeddingModel = "nomic-embed-text:latest";
        
        this.noiseThreshold = 50; // Max evidence items per hour
        this.duplicateThreshold = 0.92; // Cosine similarity for duplicates
        
        this.ensureDirectories();
        this.initializeDataFiles();
    }

    ensureDirectories() {
        const dirs = [
            this.jsonPath,
            path.join(this.rMemoryPath, "logs"),
            path.join(this.rMemoryPath, "evidence"),
            path.join(this.rMemoryPath, "canonical")
        ];
        
        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`📁 Created directory: ${dir}`);
            }
        });
    }

    initializeDataFiles() {
        const dataFiles = {
            [this.evidencePath]: [],
            [this.notesPath]: {},
            [this.todosPath]: [],
            [this.symbolsPath]: { symbols: [], files: [], lastUpdate: null },
            [this.summariesPath]: { 
                last10min: null, 
                last30min: null, 
                last60min: null, 
                lastUpdate: null 
            }
        };

        Object.entries(dataFiles).forEach(([filePath, defaultData]) => {
            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
                console.log(`📄 Initialized: ${path.basename(filePath)}`);
            }
        });
    }

    // Semantic approach: Single source of truth + evidence reconciliation
    async processMemoryPipeline() {
        console.log("🚀 Starting memory pipeline with semantic approach...\n");

        try {
            // Step 1: Collect evidence from all sources
            const evidence = await this.collectEvidence();
            console.log(`📊 Collected ${evidence.length} evidence items`);

            // Step 2: Apply noise controls
            const filteredEvidence = this.applyNoiseControls(evidence);
            console.log(`🔄 Filtered to ${filteredEvidence.length} items (noise control)`);

            // Step 3: Generate symbols table
            await this.updateSymbolsTable();

            // Step 4: Reconcile evidence into canonical notes
            const canonicalNotes = await this.reconcileEvidence(filteredEvidence);
            console.log(`📝 Generated ${Object.keys(canonicalNotes).length} canonical notes`);

            // Step 5: Generate time-based summaries
            await this.generateTimeSummaries();

            // Step 6: Export for Memento MCP
            await this.exportForMemento(canonicalNotes);

            console.log("\n✅ Memory pipeline complete!");
            return { success: true, notes: Object.keys(canonicalNotes).length };

        } catch (error) {
            console.error("❌ Memory pipeline failed:", error);
            return { success: false, error: error.message };
        }
    }

    async collectEvidence() {
        const evidence = [];
        const timestamp = Date.now();

        // VS Code chat logs (highest priority)
        const chatEvidence = await this.collectChatEvidence();
        evidence.push(...chatEvidence.map(item => ({
            ...item,
            source: "vscode-chat",
            quality: 0.8,
            timestamp
        })));

        // File changes (medium priority)
        const fileEvidence = await this.collectFileEvidence();
        evidence.push(...fileEvidence.map(item => ({
            ...item,
            source: "file-changes",
            quality: 0.6,
            timestamp
        })));

        // Git history (low priority)
        const gitEvidence = await this.collectGitEvidence();
        evidence.push(...gitEvidence.map(item => ({
            ...item,
            source: "git-history",
            quality: 0.4,
            timestamp
        })));

        return evidence;
    }

    async collectChatEvidence() {
        const chatLogPath = path.join(require("os").homedir(), 
            "Library/Application Support/Code/User/globalStorage/github.copilot-chat/");
        
        if (!fs.existsSync(chatLogPath)) {
            console.warn("⚠️  No VS Code chat logs found");
            return [];
        }

        const evidence = [];
        const files = fs.readdirSync(chatLogPath)
            .filter(file => file.endsWith(".jsonl") || file.endsWith(".json"))
            .slice(0, 10); // Last 10 files only

        for (const file of files) {
            try {
                const content = fs.readFileSync(path.join(chatLogPath, file), "utf8");
                const parsed = this.parseLogFile(content, file);
                
                parsed.forEach(conversation => {
                    evidence.push({
                        topicKey: this.generateTopicKey("chat", conversation.id),
                        text: this.summarizeConversation(conversation),
                        spanRef: `chat:${file}:${conversation.id}`,
                        simhash: this.simpleHash(this.summarizeConversation(conversation))
                    });
                });
            } catch (error) {
                console.warn(`⚠️  Failed to parse ${file}: ${error.message}`);
            }
        }

        return evidence;
    }

    async collectFileEvidence() {
        // Simple file change detection based on recent modifications
        const evidence = [];
        const recentFiles = await this.getRecentFiles();

        recentFiles.forEach(file => {
            evidence.push({
                topicKey: this.generateTopicKey("file", file.path),
                text: `File modified: ${file.path}`,
                spanRef: `file:${file.path}:${file.modified}`,
                simhash: this.simpleHash(file.path)
            });
        });

        return evidence;
    }

    async collectGitEvidence() {
        // Simple git log parsing
        const evidence = [];
        
        try {
            const gitLog = await this.execCommand("git log --oneline -10");
            const commits = gitLog.split("\n").filter(line => line.trim());

            commits.forEach(commit => {
                const [hash, ...messageParts] = commit.split(" ");
                const message = messageParts.join(" ");
                
                evidence.push({
                    topicKey: this.generateTopicKey("commit", hash),
                    text: `Commit: ${message}`,
                    spanRef: `git:${hash}`,
                    simhash: this.simpleHash(message)
                });
            });
        } catch (error) {
            console.warn("⚠️  Git log collection failed:", error.message);
        }

        return evidence;
    }

    applyNoiseControls(evidence) {
        // Apply noise budget and deduplication
        const hourAgo = Date.now() - (60 * 60 * 1000);
        const recentEvidence = evidence.filter(item => item.timestamp > hourAgo);

        // Sort by quality and enforce budget
        const sorted = recentEvidence.sort((a, b) => b.quality - a.quality);
        const budgetLimited = sorted.slice(0, this.noiseThreshold);

        // Remove duplicates by simhash
        const deduped = [];
        const seenHashes = new Set();

        budgetLimited.forEach(item => {
            if (!seenHashes.has(item.simhash)) {
                deduped.push(item);
                seenHashes.add(item.simhash);
            }
        });

        return deduped;
    }

    async reconcileEvidence(evidence) {
        const canonicalNotes = {};
        
        // Group evidence by topic key
        const grouped = evidence.reduce((groups, item) => {
            if (!groups[item.topicKey]) {
                groups[item.topicKey] = [];
            }
            groups[item.topicKey].push(item);
            return groups;
        }, {});

        // Process each topic with Ollama
        for (const [topicKey, items] of Object.entries(grouped)) {
            console.log(`🧠 Processing topic: ${topicKey}`);
            
            try {
                const canonicalNote = await this.generateCanonicalNote(topicKey, items);
                canonicalNotes[topicKey] = canonicalNote;
            } catch (error) {
                console.warn(`⚠️  Failed to process ${topicKey}: ${error.message}`);
            }
        }

        // Save canonical notes
        fs.writeFileSync(this.notesPath, JSON.stringify(canonicalNotes, null, 2));
        
        return canonicalNotes;
    }

    async generateCanonicalNote(topicKey, evidence) {
        const prompt = this.buildCanonicalNotePrompt(topicKey, evidence);
        
        try {
            const response = await this.callOllama(prompt);
            const canonicalNote = this.parseCanonicalNoteResponse(response, evidence);
            
            return canonicalNote;
        } catch (error) {
            // Fallback to simple note
            return {
                title: `Topic: ${topicKey}`,
                body: evidence.map(e => `- ${e.text}`).join("\n"),
                evidenceIds: evidence.map(e => e.spanRef),
                confidence: 0.3,
                created: new Date().toISOString()
            };
        }
    }

    buildCanonicalNotePrompt(topicKey, evidence) {
        return `You are Scribe for HexTrackr project. Create a canonical note for topic: ${topicKey}

EVIDENCE:
${evidence.map((e, i) => `[${i}] ${e.text} (source: ${e.source})`).join("\n")}

REQUIREMENTS:
- Bullet sections only
- Max 250 words
- Include sections: Decisions, Next Actions, Related Files
- Cite evidence as [E:0], [E:1], etc.
- Output JSON format:

{
  "title": "Brief descriptive title",
  "sections": {
    "decisions": ["Decision 1 [E:0]", "Decision 2 [E:1]"],
    "next_actions": ["Action 1", "Action 2"],
    "related_files": ["file1.js", "file2.md"]
  }
}`;
    }

    async updateSymbolsTable() {
        console.log("🔍 Updating symbols table...");
        
        const symbols = await this.extractCodeSymbols();
        const symbolsData = {
            symbols,
            files: symbols.map(s => s.file).filter((v, i, a) => a.indexOf(v) === i),
            lastUpdate: new Date().toISOString(),
            projectPath: this.projectRoot
        };

        fs.writeFileSync(this.symbolsPath, JSON.stringify(symbolsData, null, 2));
        console.log(`📊 Updated symbols table: ${symbols.length} symbols`);
        
        return symbolsData;
    }

    async extractCodeSymbols() {
        const symbols = [];
        const extensions = [".js", ".ts", ".jsx", ".tsx", ".vue", ".py", ".md"];
        
        const scanDir = (dir) => {
            if (dir.includes("node_modules") || dir.includes(".git")) {return;}
            
            const files = fs.readdirSync(dir);
            
            files.forEach(file => {
                const fullPath = path.join(dir, file);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    scanDir(fullPath);
                } else if (extensions.includes(path.extname(file))) {
                    const content = fs.readFileSync(fullPath, "utf8");
                    const fileSymbols = this.parseFileSymbols(fullPath, content);
                    symbols.push(...fileSymbols);
                }
            });
        };

        scanDir(this.projectRoot);
        return symbols;
    }

    parseFileSymbols(filePath, content) {
        const symbols = [];
        const relativePath = path.relative(this.projectRoot, filePath);
        
        // Simple regex-based symbol extraction
        const patterns = {
            function: /(?:function\s+|const\s+|let\s+|var\s+)(\w+)\s*[\(=]/g,
            class: /class\s+(\w+)/g,
            variable: /(?:const\s+|let\s+|var\s+)(\w+)\s*=/g,
            export: /export\s+(?:default\s+)?(?:function\s+|class\s+|const\s+)?(\w+)/g
        };

        const lines = content.split("\n");
        
        Object.entries(patterns).forEach(([type, pattern]) => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const lineNumber = content.substring(0, match.index).split("\n").length;
                
                symbols.push({
                    name: match[1],
                    type,
                    file: relativePath,
                    line: lineNumber,
                    signature: lines[lineNumber - 1]?.trim() || "",
                    context: lines.slice(Math.max(0, lineNumber - 2), lineNumber + 1).join("\n")
                });
            }
        });

        return symbols;
    }

    async generateTimeSummaries() {
        console.log("⏰ Generating time-based summaries...");
        
        const now = Date.now();
        const summaries = {
            last10min: await this.generateTimeSummary(now - 10 * 60 * 1000, "10 minutes"),
            last30min: await this.generateTimeSummary(now - 30 * 60 * 1000, "30 minutes"),
            last60min: await this.generateTimeSummary(now - 60 * 60 * 1000, "60 minutes"),
            lastUpdate: new Date().toISOString()
        };

        fs.writeFileSync(this.summariesPath, JSON.stringify(summaries, null, 2));
        console.log("📊 Time summaries updated");
        
        return summaries;
    }

    async generateTimeSummary(since, timeLabel) {
        const evidence = this.loadEvidence().filter(e => e.timestamp > since);
        
        if (evidence.length === 0) {
            return { summary: `No activity in last ${timeLabel}`, count: 0 };
        }

        const prompt = `Summarize HexTrackr development activity from last ${timeLabel}:

ACTIVITY:
${evidence.map(e => `- ${e.text} (${e.source})`).join("\n")}

Provide a 2-3 sentence summary focusing on:
- Key decisions made
- Files modified
- Next steps identified

Summary:`;

        try {
            const summary = await this.callOllama(prompt);
            return {
                summary: summary.trim(),
                count: evidence.length,
                timeframe: timeLabel,
                lastActivity: new Date(Math.max(...evidence.map(e => e.timestamp))).toISOString()
            };
        } catch (error) {
            return {
                summary: `${evidence.length} activities in last ${timeLabel}`,
                count: evidence.length,
                error: error.message
            };
        }
    }

    async exportForMemento(canonicalNotes) {
        console.log("📤 Exporting for Memento MCP...");
        
        const entities = [];
        
        // Export canonical notes as entities
        Object.entries(canonicalNotes).forEach(([topicKey, note]) => {
            entities.push({
                name: note.title || topicKey,
                entityType: "development_session",
                observations: [
                    `Topic: ${topicKey}`,
                    `Content: ${note.body || JSON.stringify(note.sections)}`,
                    `Created: ${note.created}`,
                    `Confidence: ${note.confidence || 0.8}`,
                    `Evidence: ${note.evidenceIds?.join(", ") || "none"}`
                ]
            });
        });

        // Export symbols table
        const symbolsData = JSON.parse(fs.readFileSync(this.symbolsPath, "utf8"));
        entities.push({
            name: "HexTrackr Symbols Table",
            entityType: "code_knowledge",
            observations: [
                `Symbol count: ${symbolsData.symbols.length}`,
                `File count: ${symbolsData.files.length}`,
                `Last update: ${symbolsData.lastUpdate}`,
                `Top functions: ${symbolsData.symbols.filter(s => s.type === "function").slice(0, 10).map(s => s.name).join(", ")}`
            ]
        });

        // Export time summaries
        const summaries = JSON.parse(fs.readFileSync(this.summariesPath, "utf8"));
        entities.push({
            name: "HexTrackr Work Summary",
            entityType: "work_summary",
            observations: [
                `Last 10 min: ${summaries.last10min?.summary || "No activity"}`,
                `Last 30 min: ${summaries.last30min?.summary || "No activity"}`,
                `Last 60 min: ${summaries.last60min?.summary || "No activity"}`,
                `Updated: ${summaries.lastUpdate}`
            ]
        });

        const mementoExport = { entities };
        const exportPath = path.join(this.jsonPath, "memento-import.json");
        fs.writeFileSync(exportPath, JSON.stringify(mementoExport, null, 2));
        
        console.log(`📋 Exported ${entities.length} entities for Memento`);
        console.log(`💾 Saved to: ${exportPath}`);
        
        return exportPath;
    }

    // Utility methods
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
                    reject(new Error(`Ollama failed: ${errorOutput}`));
                }
            });

            ollama.stdin.write(prompt);
            ollama.stdin.end();
        });
    }

    async execCommand(command) {
        return new Promise((resolve, reject) => {
            const process = spawn("sh", ["-c", command], { cwd: this.projectRoot });
            
            let output = "";
            let errorOutput = "";

            process.stdout.on("data", (data) => {
                output += data.toString();
            });

            process.stderr.on("data", (data) => {
                errorOutput += data.toString();
            });

            process.on("close", (code) => {
                if (code === 0) {
                    resolve(output.trim());
                } else {
                    reject(new Error(`Command failed: ${errorOutput}`));
                }
            });
        });
    }

    generateTopicKey(type, identifier) {
        const project = "HexTrackr";
        const timestamp = Math.floor(Date.now() / (4 * 60 * 60 * 1000)); // 4-hour windows
        return `${project}:${type}:${timestamp}:${identifier}`;
    }

    simpleHash(text) {
        return crypto.createHash("md5").update(text.toLowerCase()).digest("hex").substring(0, 8);
    }

    parseLogFile(content, filename) {
        // Simple JSONL parser
        const conversations = [];
        
        if (filename.endsWith(".jsonl")) {
            const lines = content.split("\n").filter(line => line.trim());
            lines.forEach(line => {
                try {
                    const parsed = JSON.parse(line);
                    conversations.push(parsed);
                } catch (e) {
                    // Skip invalid lines
                }
            });
        } else {
            try {
                const parsed = JSON.parse(content);
                conversations.push(parsed);
            } catch (e) {
                // Skip invalid JSON
            }
        }
        
        return conversations;
    }

    summarizeConversation(conversation) {
        const messages = conversation.messages || [conversation];
        const userMessages = messages.filter(m => m.role === "user" || m.author === "user");
        const lastMessage = userMessages[userMessages.length - 1];
        
        return lastMessage?.content || lastMessage?.text || "Chat conversation";
    }

    parseCanonicalNoteResponse(response, evidence) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    title: parsed.title,
                    body: JSON.stringify(parsed.sections),
                    evidenceIds: evidence.map(e => e.spanRef),
                    confidence: 0.8,
                    created: new Date().toISOString()
                };
            }
        } catch (error) {
            // Fallback
        }
        
        return {
            title: "Generated Note",
            body: response.substring(0, 500),
            evidenceIds: evidence.map(e => e.spanRef),
            confidence: 0.5,
            created: new Date().toISOString()
        };
    }

    async getRecentFiles() {
        // Find recently modified files
        const files = [];
        const since = Date.now() - (60 * 60 * 1000); // Last hour
        
        const scanDir = (dir) => {
            if (dir.includes("node_modules") || dir.includes(".git")) {return;}
            
            try {
                const dirFiles = fs.readdirSync(dir);
                
                dirFiles.forEach(file => {
                    const fullPath = path.join(dir, file);
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory()) {
                        scanDir(fullPath);
                    } else if (stat.mtime.getTime() > since) {
                        files.push({
                            path: path.relative(this.projectRoot, fullPath),
                            modified: stat.mtime.getTime()
                        });
                    }
                });
            } catch (error) {
                // Skip directories we can't read
            }
        };

        scanDir(this.projectRoot);
        return files.slice(0, 20); // Limit to 20 most recent
    }

    loadEvidence() {
        try {
            return JSON.parse(fs.readFileSync(this.evidencePath, "utf8"));
        } catch (error) {
            return [];
        }
    }

    async startContinuousMode() {
        console.log("🔄 Starting continuous memory monitoring...");
        
        const interval = 5 * 60 * 1000; // 5 minutes
        
        // Initial run
        await this.processMemoryPipeline();
        
        // Continuous monitoring
        setInterval(async () => {
            console.log("\n⏰ Running scheduled memory update...");
            await this.processMemoryPipeline();
        }, interval);
        
        console.log(`✅ Continuous mode active (${interval / 1000}s intervals)`);
    }
}

// CLI Usage
if (require.main === module) {
    const orchestrator = new MemoryOrchestrator();
    
    const mode = process.argv[2] || "once";
    
    if (mode === "continuous") {
        orchestrator.startContinuousMode();
    } else {
        orchestrator.processMemoryPipeline()
            .then(result => {
                if (result.success) {
                    console.log(`\n🎉 Success! Generated ${result.notes} canonical notes`);
                    console.log("\n📋 Files created:");
                    console.log("  📄 .rMemory/json/canonical-notes.json");
                    console.log("  📄 .rMemory/json/symbols-table.json");
                    console.log("  📄 .rMemory/json/time-summaries.json");
                    console.log("  📄 .rMemory/json/memento-import.json");
                    console.log("\n🔄 Next: Import to Memento MCP via VS Code");
                }
            })
            .catch(error => {
                console.error("❌ Orchestrator failed:", error);
                process.exit(1);
            });
    }
}

module.exports = MemoryOrchestrator;
