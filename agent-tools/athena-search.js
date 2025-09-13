#!/usr/bin/env node

/**
 * Athena Universal Search & Embedding Processor
 * 🦉 "From ancient scrolls, semantic wisdom emerges"
 *
 * Processes and searches across:
 * - Conversation sessions
 * - Todo histories
 * - Shell snapshots
 *
 * @version 2.0.0
 * @author Claude & HexTrackr Team
 */

const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
const { AthenaEmbeddingService } = require("./athena-embeddings.js");

class AthenaBatchProcessor {
    constructor(options = {}) {
        // Multi-type directory structure
        this.logsRoot = path.join(process.cwd(), "logs");
        this.sessionsDir = path.join(this.logsRoot, "sessions");
        this.todosDir = path.join(this.logsRoot, "todos");
        this.shellDir = path.join(this.logsRoot, "shell");

        // Data type to process
        this.dataType = options.dataType || "sessions"; // sessions | todos | shell | all

        // Pass provider options through to embedding service
        this.embeddingService = new AthenaEmbeddingService({
            embeddingsDir: path.join(this.logsRoot, "embeddings"),
            provider: options.provider || process.env.ATHENA_EMBEDDING_PROVIDER || "ollama"
        });

        this.stats = {
            totalFiles: 0,
            processedFiles: 0,
            skippedFiles: 0,
            totalChunks: 0,
            totalEmbeddings: 0,
            byType: {
                sessions: { files: 0, chunks: 0 },
                todos: { files: 0, chunks: 0 },
                shell: { files: 0, chunks: 0 }
            },
            errors: []
        };
    }
    
    /**
     * Get list of markdown files that need embedding processing
     */
    async getUnprocessedFiles(dataType = null) {
        const type = dataType || this.dataType;
        const results = {};

        // Determine which directories to scan
        const dirsToScan = type === "all"
            ? ["sessions", "todos", "shell"]
            : [type];

        for (const dirType of dirsToScan) {
            const dir = this.getDirectoryForType(dirType);

            if (!fsSync.existsSync(dir)) {
                console.log(`📁 Directory not found: ${dir}`);
                results[dirType] = [];
                continue;
            }

            try {
                const files = await fs.readdir(dir);
                const markdownFiles = files.filter(f => f.endsWith(".md"));

                const unprocessed = [];

                for (const file of markdownFiles) {
                    // Check if embeddings already exist
                    const embeddingId = this.extractFileId(file, dirType);
                    const embeddingFile = path.join(
                        this.embeddingService.embeddingsDir,
                        `${dirType}-${embeddingId}.json`
                    );

                    try {
                        await fs.access(embeddingFile);
                        console.log(`⚡ Skipping ${file} - embeddings already exist`);
                        this.stats.skippedFiles++;
                    } catch (error) {
                        // Embedding file doesn't exist, needs processing
                        unprocessed.push({
                            file,
                            type: dirType,
                            path: path.join(dir, file)
                        });
                    }
                }

                results[dirType] = unprocessed;
            } catch (error) {
                console.error(`Failed to scan ${dirType} directory: ${error.message}`);
                results[dirType] = [];
            }
        }

        return type === "all" ? results : results[type] || [];
    }

    /**
     * Get directory for data type
     */
    getDirectoryForType(type) {
        switch (type) {
            case "sessions": return this.sessionsDir;
            case "todos": return this.todosDir;
            case "shell": return this.shellDir;
            default: throw new Error(`Unknown data type: ${type}`);
        }
    }
    
    /**
     * Extract file ID from filename for embedding storage
     */
    extractFileId(filename, dataType) {
        // New timestamp format: YYYY-MM-DD-HH-MM-SS-title.md
        const timestampMatch = filename.match(/^(\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2})/);
        if (timestampMatch) {
            return timestampMatch[1];
        }

        // Legacy format for sessions: 156_2025-09-12_conversation.md
        if (dataType === "sessions") {
            const match = filename.match(/(\d+)_(\d{4}-\d{2}-\d{2})_(.+)\.md$/);
            if (match) {
                const [, sessionNum, date] = match;
                return `${date}-T${sessionNum.padStart(4, "0")}`;
            }
        }

        // Fallback to filename without extension
        return path.basename(filename, ".md");
    }
    
    /**
     * Process a single markdown file
     */
    async processFile(fileInfo) {
        // Handle both old string format and new object format
        const isObject = typeof fileInfo === "object";
        const filename = isObject ? fileInfo.file : fileInfo;
        const dataType = isObject ? fileInfo.type : "sessions";
        const filePath = isObject ? fileInfo.path : path.join(this.sessionsDir, filename);

        try {
            const typeEmoji = {
                sessions: "📜",
                todos: "📋",
                shell: "🐚"
            }[dataType] || "📄";

            console.log(`\n🦉 Processing ${typeEmoji} ${dataType}: ${filename}`);

            // Read markdown content
            const content = await fs.readFile(filePath, "utf8");
            const fileSize = Buffer.byteLength(content, "utf8");

            console.log(`📄 File size: ${(fileSize / 1024).toFixed(1)} KB`);

            // Extract metadata from filename and content
            const fileId = this.extractFileId(filename, dataType);
            const metadata = {
                sessionId: `${dataType}-${fileId}`,
                filename,
                filepath: filePath,
                dataType,
                timestamp: new Date().toISOString(),
                processedBy: "Athena Universal Processor",
                originalSize: fileSize
            };

            // Extract title based on data type
            if (dataType === "sessions") {
                const titleMatch = content.match(/^# (.+)$/m);
                if (titleMatch) {
                    metadata.title = titleMatch[1];
                }
            } else if (dataType === "todos") {
                metadata.title = "Todo History Analysis";
            } else if (dataType === "shell") {
                metadata.title = "Shell Environment Snapshot";
            }

            // Process embeddings with type-specific ID
            const result = await this.embeddingService.processSession(content, metadata);

            // Update statistics
            this.stats.processedFiles++;
            this.stats.totalChunks += result.chunksProcessed;
            this.stats.totalEmbeddings += result.embeddingsGenerated;

            // Update type-specific stats
            this.stats.byType[dataType].files++;
            this.stats.byType[dataType].chunks += result.chunksProcessed;

            console.log(`✨ Completed: ${result.chunksProcessed} chunks, ${result.embeddingsGenerated} embeddings in ${result.processingTime}ms`);

            return result;

        } catch (error) {
            console.error(`❌ Failed to process ${filename}: ${error.message}`);
            this.stats.errors.push({ filename, dataType, error: error.message });
            return null;
        }
    }
    
    /**
     * Process all unprocessed markdown files
     */
    async processAll(options = {}) {
        const {
            maxFiles = null,
            delay = 500,  // Delay between files to prevent overwhelming Ollama
            dataType = this.dataType
        } = options;

        console.log("🦉 Athena's Universal Embedding Processor");
        console.log(`📚 Scanning for unprocessed files (type: ${dataType})...`);

        const unprocessedFiles = await this.getUnprocessedFiles(dataType);

        // Flatten files if processing all types
        let allFiles = [];
        if (dataType === "all") {
            for (const [type, files] of Object.entries(unprocessedFiles)) {
                allFiles = allFiles.concat(files);
            }
        } else {
            allFiles = unprocessedFiles;
        }

        this.stats.totalFiles = allFiles.length;

        if (allFiles.length === 0) {
            console.log("✅ All files have been processed! No work needed.");
            return this.stats;
        }

        console.log(`📋 Found ${allFiles.length} files to process`);

        if (dataType === "all") {
            console.log("   By type:");
            for (const [type, files] of Object.entries(unprocessedFiles)) {
                if (files.length > 0) {
                    console.log(`   • ${type}: ${files.length} files`);
                }
            }
        }

        const filesToProcess = maxFiles ?
            allFiles.slice(0, maxFiles) :
            allFiles;

        const startTime = Date.now();

        for (let i = 0; i < filesToProcess.length; i++) {
            const file = filesToProcess[i];

            console.log(`\n📊 Progress: ${i + 1}/${filesToProcess.length}`);

            await this.processFile(file);

            // Add delay between files (except for the last one)
            if (i < filesToProcess.length - 1 && delay > 0) {
                console.log(`⏸️  Waiting ${delay}ms before next file...`);
                await this.sleep(delay);
            }
        }

        const totalTime = Date.now() - startTime;
        this.stats.processingTime = totalTime;

        console.log("\n🎊 Batch processing complete!");
        this.printStats();

        return this.stats;
    }
    
    /**
     * Process a single file by name
     */
    async processSingle(filename) {
        console.log(`🦉 Processing single file: ${filename}`);
        
        const result = await this.processFile(filename);
        if (result) {
            this.stats.totalFiles = 1;
            this.stats.processedFiles = 1;
            this.stats.totalChunks = result.chunksProcessed;
            this.stats.totalEmbeddings = result.embeddingsGenerated;
        }
        
        this.printStats();
        return result;
    }
    
    /**
     * Print processing statistics
     */
    printStats() {
        console.log("\n📊 Processing Statistics:");
        console.log(`   Total Files: ${this.stats.totalFiles}`);
        console.log(`   Processed: ${this.stats.processedFiles}`);
        console.log(`   Skipped: ${this.stats.skippedFiles}`);
        console.log(`   Total Chunks: ${this.stats.totalChunks}`);
        console.log(`   Total Embeddings: ${this.stats.totalEmbeddings}`);

        // Show breakdown by type if available
        const hasTypeStats = Object.values(this.stats.byType).some(t => t.files > 0);
        if (hasTypeStats) {
            console.log("\n   By Type:");
            for (const [type, stats] of Object.entries(this.stats.byType)) {
                if (stats.files > 0) {
                    console.log(`   • ${type}: ${stats.files} files, ${stats.chunks} chunks`);
                }
            }
        }

        if (this.stats.processingTime) {
            console.log(`\n   Total Time: ${(this.stats.processingTime / 1000).toFixed(1)}s`);
        }

        if (this.stats.errors.length > 0) {
            console.log(`\n   Errors: ${this.stats.errors.length}`);
            this.stats.errors.forEach((error, i) => {
                const type = error.dataType ? `[${error.dataType}] ` : "";
                console.log(`     ${i + 1}. ${type}${error.filename}: ${error.error}`);
            });
        }
    }
    
    /**
     * Search across processed embeddings
     */
    async search(query, options = {}) {
        console.log(`🔍 Searching processed scrolls for: "${query}"`);
        
        const results = await this.embeddingService.search(query, options);
        
        if (results.length === 0) {
            console.log("📭 No relevant results found.");
            return results;
        }
        
        console.log(`\n📊 Found ${results.length} relevant results:\n`);
        
        results.forEach((result, i) => {
            console.log(`${i + 1}. Similarity: ${(result.similarity * 100).toFixed(1)}%`);
            console.log(`   Session: ${result.sessionId}`);
            console.log(`   Text: ${result.text.substring(0, 150)}...`);
            console.log();
        });
        
        return results;
    }
    
    /**
     * Get database statistics
     */
    async getStats() {
        const stats = await this.embeddingService.getStats();
        
        console.log("\n🗃️  Embedding Database Statistics:");
        console.log(`   Sessions: ${stats.totalSessions}`);
        console.log(`   Embeddings: ${stats.totalEmbeddings}`);
        console.log(`   Avg per Session: ${stats.averageEmbeddingsPerSession}`);
        console.log(`   Directory: ${stats.embeddingsDirectory}`);
        
        if (stats.oldestSession) {
            console.log(`   Oldest: ${stats.oldestSession}`);
        }
        if (stats.newestSession) {
            console.log(`   Newest: ${stats.newestSession}`);
        }
        
        return stats;
    }
    
    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// CLI interface
if (require.main === module) {
    // Parse CLI arguments
    const args = process.argv.slice(2);

    // Extract provider
    const provider = args.includes("--openai") ? "openai" :
                     args.includes("--ollama") ? "ollama" :
                     process.env.ATHENA_EMBEDDING_PROVIDER || "ollama";

    // Extract data type
    let dataType = "sessions"; // default
    if (args.includes("--sessions")) {dataType = "sessions";}
    else if (args.includes("--todos")) {dataType = "todos";}
    else if (args.includes("--shell")) {dataType = "shell";}
    else if (args.includes("--all")) {dataType = "all";}

    const processor = new AthenaBatchProcessor({ provider, dataType });

    // Get command and argument (filtering out flags)
    const nonFlagArgs = args.filter(a => !a.startsWith("--"));
    const command = nonFlagArgs[0];
    const arg = nonFlagArgs[1];

    async function main() {
        try {
            switch (command) {
                case "all":
                    const maxFiles = arg ? parseInt(arg) : null;
                    await processor.processAll({ maxFiles, dataType });
                    break;

                case "single":
                    if (!arg) {
                        console.error("Usage: node athena-search.js single <filename> [--type]");
                        process.exit(1);
                    }
                    await processor.processSingle(arg);
                    break;

                case "search":
                    if (!arg) {
                        console.error("Usage: node athena-search.js search \"query\" [--type]");
                        process.exit(1);
                    }
                    await processor.search(arg);
                    break;

                case "stats":
                    await processor.getStats();
                    break;

                case "extract":
                    // Run all extractors
                    console.log("🦉 Running all Athena extractors...\n");

                    const { execSync } = require("child_process");
                    const extractors = [
                        "athena-extractor.js",
                        "athena-todo-extractor.js",
                        "athena-shell-extractor.js"
                    ];

                    for (const extractor of extractors) {
                        console.log(`\n📚 Running ${extractor}...`);
                        console.log("═".repeat(60));
                        try {
                            execSync(`node ${path.join(__dirname, extractor)}`, { stdio: "inherit" });
                        } catch (error) {
                            console.error(`❌ Failed to run ${extractor}`);
                        }
                    }
                    console.log("\n✨ All extractors complete!");
                    break;

                default:
                    console.log(`
🦉 Athena's Universal Search & Embedding System v2.0

Usage:
  node athena-search.js extract                          # Run all extractors
  node athena-search.js all [max] [--type] [--provider]  # Process embeddings
  node athena-search.js search "query" [--type]          # Search embeddings
  node athena-search.js stats                            # Show database stats

Data Type Options:
  --sessions  Process conversation sessions [default]
  --todos     Process todo histories
  --shell     Process shell snapshots
  --all       Process all types

Provider Options:
  --openai    Use OpenAI text-embedding-3-large (3072 dims)
  --ollama    Use Ollama mxbai-embed-large (1024 dims) [default]

Examples:
  # Extract all data first
  node athena-search.js extract

  # Process embeddings for all types
  node athena-search.js all --all --openai

  # Process only todos with Ollama
  node athena-search.js all --todos --ollama

  # Search across all data types
  node athena-search.js search "dark mode" --all

  # Search only shell snapshots
  node athena-search.js search "git alias" --shell

Workflow:
  1. Run extractors: node athena-search.js extract
  2. Generate embeddings: node athena-search.js all --all
  3. Search knowledge: node athena-search.js search "query"

Note: Configure defaults in .env file
                    `);
            }
        } catch (error) {
            console.error(`❌ Error: ${error.message}`);
            process.exit(1);
        }
    }

    main();
}

module.exports = { AthenaBatchProcessor };