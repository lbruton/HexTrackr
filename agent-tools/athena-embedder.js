#!/usr/bin/env node

/**
 * Athena Embedder - Version 2.0
 * 🦉 "From unified archives, semantic vectors emerge"
 *
 * Generates embeddings for unified markdown archives using Ollama
 * Processes one file at a time to prevent memory exhaustion
 *
 * @version 2.0.0
 * @author Athena, Goddess of Wisdom
 */

const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
const crypto = require("crypto");
require("dotenv").config();

class AthenaEmbedder {
    constructor(options = {}) {
        // Paths
        this.logsRoot = options.logsRoot || path.join(process.cwd(), "logs");
        this.unifiedPath = path.join(this.logsRoot, "unified");
        this.embeddingsPath = path.join(this.logsRoot, "embeddings");
        this.metadataPath = path.join(this.logsRoot, "metadata");

        // Ollama configuration
        this.ollamaUrl = options.ollamaUrl || process.env.OLLAMA_URL || "http://localhost:11434";
        this.ollamaModel = options.ollamaModel || process.env.OLLAMA_MODEL || "mxbai-embed-large";

        // Chunking configuration
        this.chunkSize = options.chunkSize || 1024;
        this.chunkOverlap = options.chunkOverlap || 200;

        // State tracking
        this.processedFile = path.join(this.metadataPath, "embeddings-processed.json");
        this.processedFiles = new Set();

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
     * Save processing state atomically
     */
    async saveProcessedState() {
        try {
            const tempFile = this.processedFile + ".tmp";
            await fs.writeFile(
                tempFile,
                JSON.stringify(Array.from(this.processedFiles), null, 2)
            );

            // Atomic rename
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
     * Smart chunking for markdown content
     */
    smartChunk(content) {
        const chunks = [];
        const lines = content.split("\n");
        let currentChunk = "";
        let currentSize = 0;

        for (const line of lines) {
            const lineSize = Buffer.byteLength(line, "utf8");

            // If adding this line would exceed chunk size
            if (currentSize + lineSize > this.chunkSize && currentChunk.length > 0) {
                // Save current chunk
                chunks.push({
                    text: currentChunk.trim(),
                    size: currentSize,
                    hash: crypto.createHash("md5").update(currentChunk).digest("hex")
                });

                // Start new chunk with overlap
                const overlapLines = currentChunk.split("\n").slice(-Math.floor(this.chunkOverlap / 50));
                currentChunk = overlapLines.join("\n") + "\n" + line;
                currentSize = Buffer.byteLength(currentChunk, "utf8");
            } else {
                currentChunk += line + "\n";
                currentSize += lineSize + 1;
            }
        }

        // Add final chunk
        if (currentChunk.trim().length > 0) {
            chunks.push({
                text: currentChunk.trim(),
                size: currentSize,
                hash: crypto.createHash("md5").update(currentChunk).digest("hex")
            });
        }

        return chunks;
    }

    /**
     * Process a single unified markdown file
     */
    async processFile(filePath) {
        const filename = path.basename(filePath, ".md");

        console.log(`🧠 Processing: ${filename}`);

        try {
            // Read content
            const content = await fs.readFile(filePath, "utf8");

            // Chunk content
            const chunks = this.smartChunk(content);
            console.log(`   Chunked into ${chunks.length} segments`);

            // Generate embeddings for each chunk
            const embeddings = [];

            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];

                try {
                    const startTime = Date.now();
                    const embedding = await this.generateEmbedding(chunk.text);
                    const duration = Date.now() - startTime;

                    embeddings.push({
                        chunkIndex: i,
                        text: chunk.text,
                        textHash: chunk.hash,
                        embedding: embedding,
                        metadata: {
                            filename: filename,
                            chunkSize: chunk.size,
                            processingTime: duration,
                            timestamp: new Date().toISOString()
                        }
                    });

                    console.log(`   Chunk ${i + 1}/${chunks.length} (${duration}ms)`);

                    // Small delay to avoid overwhelming Ollama
                    await new Promise(resolve => setTimeout(resolve, 100));
                } catch (error) {
                    console.error(`🧠 Error processing chunk ${i}: ${error.message}`);
                    // Continue with next chunk rather than failing entire file
                }
            }

            // Save embeddings file atomically
            const outputFile = path.join(this.embeddingsPath, `${filename}.json`);
            const tempFile = outputFile + ".tmp";

            const embeddingData = {
                filename: filename,
                sourceFile: filePath,
                created: new Date().toISOString(),
                model: this.ollamaModel,
                totalChunks: chunks.length,
                successfulEmbeddings: embeddings.length,
                embeddings: embeddings
            };

            await fs.writeFile(tempFile, JSON.stringify(embeddingData, null, 2), "utf8");
            await fs.rename(tempFile, outputFile);

            console.log(`   ✅ Generated ${embeddings.length} embeddings`);

            return {
                filename: filename,
                chunks: chunks.length,
                embeddings: embeddings.length,
                success: true
            };
        } catch (error) {
            console.error(`🧠 Error processing ${filename}: ${error.message}`);
            return {
                filename: filename,
                error: error.message,
                success: false
            };
        }
    }

    /**
     * Process all unified markdown files
     */
    async processAllFiles() {
        console.log("🧠 Athena's memory crystallizes... Generating semantic vectors...");

        // Get all unified markdown files
        let unifiedFiles = [];

        try {
            const files = await fs.readdir(this.unifiedPath);
            unifiedFiles = files
                .filter(f => f.endsWith(".md"))
                .sort();

            console.log(`📜 Found ${unifiedFiles.length} unified archives`);
        } catch (error) {
            console.error(`🧠 Error reading unified directory: ${error.message}`);
            return;
        }

        if (unifiedFiles.length === 0) {
            console.log("🧠 No unified archives found. Run athena-unified-extractor first.");
            return;
        }

        // Process each file
        const results = {
            processed: 0,
            skipped: 0,
            failed: 0,
            totalChunks: 0,
            totalEmbeddings: 0
        };

        for (const filename of unifiedFiles) {
            const baseFilename = path.basename(filename, ".md");

            // Skip if already processed
            if (this.processedFiles.has(baseFilename)) {
                console.log(`⚡ Skipping ${baseFilename} - already processed`);
                results.skipped++;
                continue;
            }

            const filePath = path.join(this.unifiedPath, filename);
            const result = await this.processFile(filePath);

            if (result.success) {
                this.processedFiles.add(baseFilename);
                results.processed++;
                results.totalChunks += result.chunks;
                results.totalEmbeddings += result.embeddings;
            } else {
                results.failed++;
            }

            // Save state after each file
            await this.saveProcessedState();
        }

        console.log("\n🧠 Embedding generation complete!");
        console.log(`📊 Processed: ${results.processed}, Skipped: ${results.skipped}, Failed: ${results.failed}`);
        console.log(`🔢 Total chunks: ${results.totalChunks}, Total embeddings: ${results.totalEmbeddings}`);
        console.log(`📁 Embeddings location: ${this.embeddingsPath}`);
    }

    /**
     * Show statistics
     */
    async showStats() {
        try {
            const files = await fs.readdir(this.embeddingsPath);
            const embeddingFiles = files.filter(f => f.endsWith(".json"));

            let totalChunks = 0;
            let totalEmbeddings = 0;

            for (const file of embeddingFiles) {
                try {
                    const filePath = path.join(this.embeddingsPath, file);
                    const data = await fs.readFile(filePath, "utf8");
                    const embeddingData = JSON.parse(data);

                    totalChunks += embeddingData.totalChunks || 0;
                    totalEmbeddings += embeddingData.successfulEmbeddings || 0;
                } catch (_error) {
                    console.log(`Warning: Could not read ${file}`);
                }
            }

            console.log("\n🧠 Athena's Memory Statistics:");
            console.log(`📄 Embedding files: ${embeddingFiles.length}`);
            console.log(`🔢 Total chunks: ${totalChunks}`);
            console.log(`🧠 Total embeddings: ${totalEmbeddings}`);
            console.log(`📊 Average chunks per file: ${totalChunks / embeddingFiles.length || 0}`);
        } catch (error) {
            console.error("Error generating stats:", error.message);
        }
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);

    if (args.includes("stats")) {
        const embedder = new AthenaEmbedder();
        await embedder.showStats();
        return;
    }

    if (args.includes("clean")) {
        const metadataPath = path.join(process.cwd(), "logs/metadata");
        const processedFile = path.join(metadataPath, "embeddings-processed.json");

        try {
            if (fsSync.existsSync(processedFile)) {
                await fs.unlink(processedFile);
                console.log("🧠 Cleaned embedding processing state");
            }
        } catch (error) {
            console.error("🧠 Error cleaning state:", error.message);
        }
        return;
    }

    // Create embedder and process
    const embedder = new AthenaEmbedder();

    try {
        await embedder.processAllFiles();
        console.log("\n🎖️ Mission accomplished! Semantic vectors ready for search.");
    } catch (error) {
        console.error("🧠 Embedding generation failed:", error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { AthenaEmbedder };