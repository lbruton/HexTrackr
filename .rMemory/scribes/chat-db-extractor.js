#!/usr/bin/env node
/**
 * Chat Database Extractor
 * Extracts VS Code chat sessions from SQLite databases
 * Creates extended-memory table in Neo4j with full searchable context
 */

/* eslint-env node */
/* eslint no-undef: "off" */
/* eslint no-console: "off" */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

class ChatDatabaseExtractor {
    constructor() {
        this.projectRoot = process.cwd();
        this.memoryDir = path.join(this.projectRoot, ".rMemory");
        this.rawDataDir = path.join(this.memoryDir, "raw-data");
        this.extendedLogFile = path.join(this.memoryDir, "json", "extended-log.json");
        
        // VS Code database paths
        this.workspaceId = "1e021a91f96ec733f89597596e621688";
        this.sourceDatabaseDir = path.join(
            process.env.HOME,
            "Library/Application Support/Code/User/workspaceStorage",
            this.workspaceId,
            "GitHub.copilot-chat"
        );
        
        // Extended memory structure
        this.extendedMemory = [];
        
        this.ensureDirectories();
    }

    ensureDirectories() {
        [this.rawDataDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`📁 Created directory: ${dir}`);
            }
        });
    }

    async copyDatabases() {
        console.log("📋 Copying VS Code chat databases...");
        
        const databases = ["workspace-chunks.db", "local-index.1.db"];
        const copied = [];
        
        for (const dbName of databases) {
            const sourcePath = path.join(this.sourceDatabaseDir, dbName);
            const destPath = path.join(this.rawDataDir, dbName);
            
            try {
                if (fs.existsSync(sourcePath)) {
                    fs.copyFileSync(sourcePath, destPath);
                    const stats = fs.statSync(destPath);
                    console.log(`   ✅ Copied ${dbName} (${(stats.size / 1024 / 1024).toFixed(1)}MB)`);
                    copied.push({ name: dbName, path: destPath, size: stats.size });
                } else {
                    console.warn(`   ⚠️  Database not found: ${dbName}`);
                }
            } catch (error) {
                console.error(`   ❌ Failed to copy ${dbName}: ${error.message}`);
            }
        }
        
        return copied;
    }

    async extractChatSessions(dbPath) {
        return new Promise((resolve, reject) => {
            console.log(`🔍 Extracting chat sessions from ${path.basename(dbPath)}...`);
            
            const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
                if (err) {
                    console.error(`❌ Cannot open database: ${err.message}`);
                    reject(err);
                    return;
                }
            });

            // First, explore the schema
            db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                console.log(`   📊 Found ${tables.length} tables:`, tables.map(t => t.name).join(", "));
                
                const chatSessions = [];
                let processedTables = 0;
                
                if (tables.length === 0) {
                    resolve([]);
                    return;
                }
                
                // Extract data from each table
                tables.forEach(table => {
                    const tableName = table.name;
                    
                    db.all(`SELECT * FROM "${tableName}" LIMIT 100`, [], (err, rows) => {
                        processedTables++;
                        
                        if (err) {
                            console.warn(`   ⚠️  Error reading ${tableName}: ${err.message}`);
                        } else if (rows.length > 0) {
                            console.log(`   📋 ${tableName}: ${rows.length} rows`);
                            
                            // Process rows based on table structure
                            rows.forEach(row => {
                                chatSessions.push({
                                    sessionId: this.generateSessionId(),
                                    source: `${path.basename(dbPath)}:${tableName}`,
                                    extractedAt: new Date().toISOString(),
                                    data: row,
                                    metadata: {
                                        table: tableName,
                                        database: path.basename(dbPath),
                                        rowIndex: chatSessions.length
                                    }
                                });
                            });
                        }
                        
                        // When all tables processed, resolve
                        if (processedTables === tables.length) {
                            console.log(`   ✅ Extracted ${chatSessions.length} total records`);
                            db.close();
                            resolve(chatSessions);
                        }
                    });
                });
            });
        });
    }

    generateSessionId() {
        return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    async processChatsIntoExtendedMemory(chatSessions) {
        console.log("🧠 Processing chat sessions into extended memory format...");
        
        for (const session of chatSessions) {
            // Create extended memory entry
            const extendedEntry = {
                id: session.sessionId,
                timestamp: session.extractedAt,
                source: session.source,
                rawData: session.data,
                
                // Semantic analysis fields
                projectContext: this.detectProjectContext(session.data),
                semanticKeywords: this.extractSemanticKeywords(session.data),
                messageType: this.classifyMessageType(session.data),
                importance: this.assessImportance(session.data),
                
                // Searchable fields
                searchableText: this.createSearchableText(session.data),
                timeOfDay: new Date(session.extractedAt).getHours(),
                dayOfWeek: new Date(session.extractedAt).getDay(),
                
                // References
                relatedEntities: [], // To be populated by memory scribes
                summaryRef: null,    // Reference to summary in primary memory
                
                metadata: {
                    ...session.metadata,
                    processed: true,
                    version: "1.0"
                }
            };
            
            this.extendedMemory.push(extendedEntry);
        }
        
        console.log(`   ✅ Created ${this.extendedMemory.length} extended memory entries`);
    }

    detectProjectContext(data) {
        const text = JSON.stringify(data).toLowerCase();
        
        if (text.includes("hextrackr") || text.includes("copilot")) {
            return "HexTrackr";
        }
        if (text.includes("stacktrackr")) {
            return "StackTrackr";
        }
        if (text.includes("rmemory") || text.includes("rengine")) {
            return "rMemory";
        }
        
        return "General";
    }

    extractSemanticKeywords(data) {
        const text = JSON.stringify(data).toLowerCase();
        const keywords = [];
        
        // Technical keywords
        const techTerms = ["api", "database", "neo4j", "ollama", "claude", "memory", "scribe", "embedding"];
        const actionTerms = ["create", "fix", "analyze", "build", "deploy", "test", "debug"];
        const entityTerms = ["function", "class", "component", "service", "endpoint", "schema"];
        
        [...techTerms, ...actionTerms, ...entityTerms].forEach(term => {
            if (text.includes(term)) {
                keywords.push(term);
            }
        });
        
        return [...new Set(keywords)]; // Remove duplicates
    }

    classifyMessageType(data) {
        const text = JSON.stringify(data).toLowerCase();
        
        if (text.includes("error") || text.includes("fix") || text.includes("bug")) {
            return "bug_fix";
        }
        if (text.includes("create") || text.includes("build") || text.includes("implement")) {
            return "feature_development";
        }
        if (text.includes("analyze") || text.includes("review") || text.includes("check")) {
            return "analysis";
        }
        if (text.includes("deploy") || text.includes("release") || text.includes("production")) {
            return "deployment";
        }
        
        return "general_discussion";
    }

    assessImportance(data) {
        const text = JSON.stringify(data).toLowerCase();
        let score = 0;
        
        // High importance indicators
        if (text.includes("critical") || text.includes("urgent")) {
            score += 3;
        }
        if (text.includes("production") || text.includes("deploy")) {
            score += 2;
        }
        if (text.includes("fix") || text.includes("bug")) {
            score += 1;
        }
        if (text.includes("create") || text.includes("implement")) {
            score += 1;
        }
        
        return Math.min(score, 5); // Cap at 5
    }

    createSearchableText(data) {
        // Extract all text content for full-text search
        return JSON.stringify(data)
            .replace(/[{}"\[\]]/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .substring(0, 2000); // Limit for performance
    }

    async saveExtendedMemory() {
        console.log("💾 Saving extended memory to JSON...");
        
        const outputData = {
            metadata: {
                created: new Date().toISOString(),
                totalEntries: this.extendedMemory.length,
                version: "1.0",
                description: "Extended memory containing full chat session history with semantic indexing"
            },
            entries: this.extendedMemory
        };
        
        fs.writeFileSync(this.extendedLogFile, JSON.stringify(outputData, null, 2));
        
        const fileSize = fs.statSync(this.extendedLogFile).size;
        console.log(`   ✅ Saved ${outputData.entries.length} entries (${(fileSize / 1024).toFixed(1)}KB)`);
        console.log(`   📁 File: ${this.extendedLogFile}`);
    }

    async generateReport() {
        console.log("\n📊 Extended Memory Extraction Report");
        console.log("=" .repeat(50));
        
        const projectStats = {};
        const typeStats = {};
        const importanceStats = {};
        
        this.extendedMemory.forEach(entry => {
            // Project distribution
            projectStats[entry.projectContext] = (projectStats[entry.projectContext] || 0) + 1;
            
            // Message type distribution  
            typeStats[entry.messageType] = (typeStats[entry.messageType] || 0) + 1;
            
            // Importance distribution
            importanceStats[entry.importance] = (importanceStats[entry.importance] || 0) + 1;
        });
        
        console.log(`📈 Total Entries: ${this.extendedMemory.length}`);
        console.log("🎯 Project Distribution:", projectStats);
        console.log("📝 Message Types:", typeStats);
        console.log("⭐ Importance Levels:", importanceStats);
        
        return {
            totalEntries: this.extendedMemory.length,
            projectDistribution: projectStats,
            messageTypes: typeStats,
            importanceLevels: importanceStats
        };
    }

    async extract() {
        console.log("🚀 Starting Chat Database Extraction...");
        
        try {
            // Step 1: Copy databases from VS Code
            const copiedDbs = await this.copyDatabases();
            
            if (copiedDbs.length === 0) {
                console.warn("⚠️  No databases found to extract");
                return;
            }
            
            // Step 2: Extract chat sessions from each database
            let allSessions = [];
            for (const db of copiedDbs) {
                const sessions = await this.extractChatSessions(db.path);
                allSessions = allSessions.concat(sessions);
            }
            
            console.log(`📊 Total sessions extracted: ${allSessions.length}`);
            
            // Step 3: Process into extended memory format
            await this.processChatsIntoExtendedMemory(allSessions);
            
            // Step 4: Save to JSON
            await this.saveExtendedMemory();
            
            // Step 5: Generate report
            const report = await this.generateReport();
            
            console.log("\n✅ Chat database extraction complete!");
            console.log("🎯 Next steps:");
            console.log("   1. Run memory scribes to create summaries");
            console.log("   2. Index extended memory in Neo4j");
            console.log("   3. Build semantic search capabilities");
            
            return report;
            
        } catch (error) {
            console.error("❌ Extraction failed:", error);
            throw error;
        }
    }
}

// Run if called directly
if (require.main === module) {
    const extractor = new ChatDatabaseExtractor();
    extractor.extract().catch(console.error);
}

module.exports = ChatDatabaseExtractor;
