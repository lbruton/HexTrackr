#!/usr/bin/env node

/**
 * Athena Semantic Embedder - Enhanced Version 3.0
 * 🦉 "From structured wisdom, precise vectors emerge"
 *
 * Generates embeddings from Gemini-processed semantic data
 * Uses abstracts, summaries, and keywords instead of raw text
 * Dramatically improved search relevance through semantic understanding
 *
 * @version 3.0.0
 * @author Athena, Goddess of Wisdom
 */

const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
const crypto = require("crypto");
require("dotenv").config();

class AthenaSemanticEmbedder {
    constructor(options = {}) {
        // Paths
        this.logsRoot = options.logsRoot || path.join(process.cwd(), "logs");
        this.semanticCachePath = path.join(this.logsRoot, "semantic-cache");
        this.embeddingsPath = path.join(this.logsRoot, "semantic-embeddings");
        this.metadataPath = path.join(this.logsRoot, "semantic-metadata");

        // Ollama configuration for embeddings
        this.ollamaUrl = options.ollamaUrl || process.env.OLLAMA_URL || "http://localhost:11434";
        this.ollamaModel = options.ollamaModel || process.env.OLLAMA_MODEL || "mxbai-embed-large";

        // Processing configuration
        this.includeOriginalText = options.includeOriginalText || false;
        this.embeddingStrategy = options.embeddingStrategy || "abstract_summary"; // abstract_summary | full_semantic | hybrid

        // State tracking
        this.processedFile = path.join(this.metadataPath, "semantic-embeddings-processed.json");
        this.processedFiles = new Set();

        // Statistics
        this.stats = {
            totalFiles: 0,
            processedFiles: 0,
            totalChunks: 0,
            processedChunks: 0,
            totalEmbeddings: 0,
            startTime: Date.now()
        };

        // Initialize
        this.ensureDirectories();
        this.loadProcessedState();
    }

    /**
     * Create required directories
     */
    async ensureDirectories() {
        const dirs = [this.embeddingsPath, this.metadataPath];

        for (const dir of dirs) {
            if (!fsSync.existsSync(dir)) {
                await fs.mkdir(dir, { recursive: true });
                console.log(`🧠 Created directory: ${dir}`);
            }
        }
    }

    /**
     * Load processing state
     */
    async loadProcessedState() {
        try {
            if (fsSync.existsSync(this.processedFile)) {
                const data = await fs.readFile(this.processedFile, "utf8");
                const processed = JSON.parse(data);
                this.processedFiles = new Set(processed);
                console.log(`🧠 Loaded ${this.processedFiles.size} processed files`);
            }
        } catch (error) {
            console.error("🧠 Warning: Could not load processed state:", error.message);
            this.processedFiles = new Set();
        }
    }

    /**
     * Save processing state
     */
    async saveProcessedState() {
        try {
            const tempFile = this.processedFile + ".tmp";
            await fs.writeFile(
                tempFile,
                JSON.stringify(Array.from(this.processedFiles), null, 2)
            );
            await fs.rename(tempFile, this.processedFile);
        } catch (error) {
            console.error("🧠 Error saving processed state:", error.message);
        }
    }

    /**
     * Generate embedding using Ollama
     */
    async generateEmbedding(text) {
        const maxRetries = 3;
        let attempt = 0;

        while (attempt < maxRetries) {
            try {
                const response = await fetch(`${this.ollamaUrl}/api/embeddings`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        model: this.ollamaModel,
                        prompt: text.trim()
                    })
                });

                if (!response.ok) {
                    throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
                }

                const result = await response.json();
                return result.embedding;
            } catch (error) {
                attempt++;
                if (attempt >= maxRetries) {
                    throw error;
                }

                console.log(`🧠 Retry ${attempt}/${maxRetries} for embedding generation: ${error.message}`);
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }

    /**
     * Create embedding text based on strategy
     */
    createEmbeddingText(semanticChunk, strategy = "abstract_summary") {
        const semantic = semanticChunk.semantic;

        switch (strategy) {
            case "abstract_summary":
                // Use only abstract and summary for focused embeddings
                return `${semantic.abstract}\n\n${semantic.summary}`;

            case "full_semantic":
                // Use all semantic data for comprehensive embeddings
                return this.buildFullSemanticText(semantic);

            case "hybrid":
                // Combine semantic data with original text snippet
                const semanticText = this.buildFullSemanticText(semantic);
                const originalSnippet = semanticChunk.originalText?.substring(0, 500) || "";
                return `${semanticText}\n\n--- Original Context ---\n${originalSnippet}`;

            default:
                return `${semantic.abstract}\n\n${semantic.summary}`;
        }
    }

    /**
     * Build comprehensive semantic text
     */
    buildFullSemanticText(semantic) {
        const parts = [];

        // Core content
        parts.push(`Abstract: ${semantic.abstract}`);
        parts.push(`Summary: ${semantic.summary}`);

        // Keywords
        if (semantic.keywords && semantic.keywords.length > 0) {
            parts.push(`Keywords: ${semantic.keywords.join(", ")}`);
        }

        // Entities
        if (semantic.entities) {
            Object.entries(semantic.entities).forEach(([type, items]) => {
                if (items && items.length > 0) {
                    parts.push(`${type}: ${items.join(", ")}`);
                }
            });
        }

        // Problems and solutions
        if (semantic.problems && semantic.problems.length > 0) {
            const problemTexts = semantic.problems.map(p =>
                `Problem: ${p.issue} | Solution: ${p.solution} | Severity: ${p.severity}`
            );
            parts.push(`Issues: ${problemTexts.join("; ")}`);
        }

        // Achievements
        if (semantic.achievements && semantic.achievements.length > 0) {
            parts.push(`Achievements: ${semantic.achievements.join(", ")}`);
        }

        // Decisions
        if (semantic.decisions && semantic.decisions.length > 0) {
            parts.push(`Decisions: ${semantic.decisions.join(", ")}`);
        }

        // Context
        if (semantic.context) {
            const contextParts = Object.entries(semantic.context)
                .map(([key, value]) => `${key}: ${value}`)
                .join(", ");
            parts.push(`Context: ${contextParts}`);
        }

        return parts.join("\n");
    }

    /**
     * Process a single semantic cache file
     */
    async processSemanticFile(filePath) {
        const filename = path.basename(filePath, ".json");

        console.log(`🧠 Processing semantic data: ${filename}`);

        try {
            // Read semantic data
            const content = await fs.readFile(filePath, "utf8");
            const semanticData = JSON.parse(content);

            console.log(`   Found ${semanticData.chunks.length} semantic chunks`);
            this.stats.totalChunks += semanticData.chunks.length;

            // Process each semantic chunk
            const embeddings = [];

            for (let i = 0; i < semanticData.chunks.length; i++) {
                const semanticChunk = semanticData.chunks[i];

                try {
                    // Create embedding text based on strategy
                    const embeddingText = this.createEmbeddingText(semanticChunk, this.embeddingStrategy);

                    const startTime = Date.now();
                    const embedding = await this.generateEmbedding(embeddingText);
                    const duration = Date.now() - startTime;

                    embeddings.push({
                        chunkIndex: semanticChunk.chunkIndex,
                        embeddingText: embeddingText,
                        embeddingTextHash: crypto.createHash("md5").update(embeddingText).digest("hex"),
                        originalTextHash: semanticChunk.textHash,
                        embedding: embedding,
                        semantic: semanticChunk.semantic,
                        metadata: {
                            filename: filename,
                            processingTime: duration,
                            timestamp: new Date().toISOString(),
                            embeddingStrategy: this.embeddingStrategy,
                            semanticModel: semanticData.model,
                            embeddingModel: this.ollamaModel
                        }
                    });

                    console.log(`   Chunk ${i + 1}/${semanticData.chunks.length} (${duration}ms) - ${embeddingText.length} chars`);
                    this.stats.processedChunks++;

                    // Small delay to avoid overwhelming Ollama
                    await new Promise(resolve => setTimeout(resolve, 50));

                } catch (error) {
                    console.error(`🧠 Error processing chunk ${i}: ${error.message}`);
                    // Continue with next chunk rather than failing entire file
                }
            }

            // Save semantic embeddings file atomically
            const outputFile = path.join(this.embeddingsPath, `${filename}.json`);
            const tempFile = outputFile + ".tmp";

            const embeddingData = {
                filename: filename,
                sourceSemanticFile: filePath,
                created: new Date().toISOString(),
                embeddingModel: this.ollamaModel,
                embeddingStrategy: this.embeddingStrategy,
                semanticModel: semanticData.model,
                totalChunks: semanticData.chunks.length,
                successfulEmbeddings: embeddings.length,
                embeddings: embeddings
            };

            await fs.writeFile(tempFile, JSON.stringify(embeddingData, null, 2), "utf8");
            await fs.rename(tempFile, outputFile);

            console.log(`   ✅ Generated ${embeddings.length} semantic embeddings`);
            this.stats.totalEmbeddings += embeddings.length;

            return {
                filename: filename,
                chunks: semanticData.chunks.length,
                embeddings: embeddings.length,
                success: true
            };

        } catch (error) {
            console.error(`🧠 Error processing semantic file ${filename}: ${error.message}`);
            return {
                filename: filename,
                error: error.message,
                success: false
            };
        }
    }

    /**
     * Process all semantic cache files
     */
    async processAllSemanticFiles() {
        console.log("🧠 Athena's semantic embeddings begin... Vectorizing structured wisdom...");

        // Get all semantic cache files
        let semanticFiles = [];

        try {
            const files = await fs.readdir(this.semanticCachePath);
            semanticFiles = files
                .filter(f => f.endsWith(".json"))
                .sort();

            console.log(`📜 Found ${semanticFiles.length} semantic cache files`);
            this.stats.totalFiles = semanticFiles.length;
        } catch (error) {
            console.error(`🧠 Error reading semantic cache directory: ${error.message}`);
            return;
        }

        if (semanticFiles.length === 0) {
            console.log("🧠 No semantic cache files found. Run athena-semantic-processor first.");
            return;
        }

        // Process each file
        const results = {
            processed: 0,
            skipped: 0,
            failed: 0
        };

        for (const filename of semanticFiles) {
            const baseFilename = path.basename(filename, ".json");

            // Skip if already processed
            if (this.processedFiles.has(baseFilename)) {
                console.log(`⚡ Skipping ${baseFilename} - already processed`);
                results.skipped++;
                continue;
            }

            const filePath = path.join(this.semanticCachePath, filename);
            const result = await this.processSemanticFile(filePath);

            if (result.success) {
                this.processedFiles.add(baseFilename);
                results.processed++;
                this.stats.processedFiles++;
            } else {
                results.failed++;
            }

            // Save state after each file
            await this.saveProcessedState();

            // Print progress every 10 files
            if ((results.processed + results.failed) % 10 === 0) {
                this.printProgress(results);
            }
        }

        console.log("\n🧠 Semantic embedding generation complete!");
        this.printFinalStats(results);
    }

    /**
     * Print processing progress
     */
    printProgress(results) {
        const completed = results.processed + results.failed + results.skipped;
        const percentage = ((completed / this.stats.totalFiles) * 100).toFixed(1);

        console.log(`\n📊 Progress: ${completed}/${this.stats.totalFiles} (${percentage}%)`);
        console.log(`   ✅ Processed: ${results.processed}`);
        console.log(`   ⚡ Skipped: ${results.skipped}`);
        console.log(`   ❌ Failed: ${results.failed}`);
        console.log(`   🔢 Total embeddings: ${this.stats.totalEmbeddings}`);
    }

    /**
     * Print final statistics
     */
    printFinalStats(results) {
        const runtimeMs = Date.now() - this.stats.startTime;
        const runtimeMin = runtimeMs / 60000;

        console.log("\n📊 Final Results:");
        console.log(`   📄 Files processed: ${results.processed}`);
        console.log(`   📝 Total chunks: ${this.stats.totalChunks}`);
        console.log(`   ✅ Successful embeddings: ${this.stats.totalEmbeddings}`);
        console.log(`   🚀 Strategy: ${this.embeddingStrategy}`);
        console.log(`   🤖 Embedding model: ${this.ollamaModel}`);
        console.log(`   ⏰ Runtime: ${runtimeMin.toFixed(1)} minutes`);
        console.log(`   📁 Output location: ${this.embeddingsPath}`);
        console.log(`   📊 Average: ${(this.stats.totalEmbeddings / runtimeMin).toFixed(1)} embeddings/min`);
    }

    /**
     * Show statistics for existing embeddings
     */
    async showEmbeddingStats() {
        try {
            const files = await fs.readdir(this.embeddingsPath);
            const embeddingFiles = files.filter(f => f.endsWith(".json"));

            let totalChunks = 0;
            let totalEmbeddings = 0;
            const strategies = {};

            for (const file of embeddingFiles) {
                try {
                    const filePath = path.join(this.embeddingsPath, file);
                    const data = await fs.readFile(filePath, "utf8");
                    const embeddingData = JSON.parse(data);

                    totalChunks += embeddingData.totalChunks || 0;
                    totalEmbeddings += embeddingData.successfulEmbeddings || 0;

                    const strategy = embeddingData.embeddingStrategy || "unknown";
                    strategies[strategy] = (strategies[strategy] || 0) + 1;
                } catch (_error) {
                    console.log(`Warning: Could not read ${file}`);
                }
            }

            console.log("\n🧠 Semantic Embeddings Statistics:");
            console.log(`📄 Embedding files: ${embeddingFiles.length}`);
            console.log(`📝 Total chunks: ${totalChunks}`);
            console.log(`🧠 Total embeddings: ${totalEmbeddings}`);
            console.log(`📊 Success rate: ${totalChunks > 0 ? (totalEmbeddings / totalChunks * 100).toFixed(1) : 0}%`);
            console.log("📈 Strategies used:", Object.entries(strategies).map(([k, v]) => `${k}: ${v}`).join(", "));

        } catch (error) {
            console.error("Error generating embedding stats:", error.message);
        }
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);

    if (args.includes("--help") || args.includes("-h")) {
        console.log(`
🦉 Athena Semantic Embedder

Usage:
  node athena-semantic-embedder.js [options]

Options:
  --strategy <type>    Embedding strategy (abstract_summary, full_semantic, hybrid)
  --stats              Show semantic embeddings statistics
  --clean              Clean semantic embedding processing state
  --help, -h           Show this help message

Strategies:
  abstract_summary     Use only abstracts and summaries (focused, default)
  full_semantic        Use all semantic data (comprehensive)
  hybrid              Combine semantic data with original text snippets

Examples:
  node athena-semantic-embedder.js                        # Process with abstract_summary
  node athena-semantic-embedder.js --strategy hybrid      # Process with hybrid strategy
  node athena-semantic-embedder.js --stats                # Show statistics
        `);
        return;
    }

    if (args.includes("--stats")) {
        const embedder = new AthenaSemanticEmbedder();
        await embedder.showEmbeddingStats();
        return;
    }

    if (args.includes("--clean")) {
        const metadataPath = path.join(process.cwd(), "logs/semantic-metadata");
        const processedFile = path.join(metadataPath, "semantic-embeddings-processed.json");

        try {
            if (fsSync.existsSync(processedFile)) {
                await fs.unlink(processedFile);
                console.log("🧠 Cleaned semantic embedding processing state");
            }
        } catch (error) {
            console.error("🧠 Error cleaning state:", error.message);
        }
        return;
    }

    // Parse strategy
    const strategyIndex = args.indexOf("--strategy");
    const strategy = strategyIndex >= 0 && args[strategyIndex + 1]
        ? args[strategyIndex + 1]
        : "abstract_summary";

    const validStrategies = ["abstract_summary", "full_semantic", "hybrid"];
    if (!validStrategies.includes(strategy)) {
        console.error(`🧠 Invalid strategy: ${strategy}. Valid options: ${validStrategies.join(", ")}`);
        return;
    }

    // Main processing
    const embedder = new AthenaSemanticEmbedder({
        embeddingStrategy: strategy
    });

    console.log(`🧠 Using embedding strategy: ${strategy}`);

    try {
        await embedder.processAllSemanticFiles();
        console.log("\n🎖️ Mission accomplished! Semantic embeddings ready for enhanced search.");
    } catch (error) {
        console.error("🧠 Semantic embedding generation failed:", error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { AthenaSemanticEmbedder };