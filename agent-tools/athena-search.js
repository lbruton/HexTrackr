#!/usr/bin/env node

/**
 * Athena Search - Version 2.0
 * 🦉 "From semantic vectors, ancient wisdom surfaces"
 *
 * Searches across unified archive embeddings using similarity matching
 * Returns relevant time periods with context and scores
 *
 * @version 2.0.0
 * @author Athena, Goddess of Wisdom
 */

const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
require("dotenv").config();

class AthenaSearch {
    constructor(options = {}) {
        // Paths
        this.logsRoot = options.logsRoot || path.join(process.cwd(), "logs");
        this.embeddingsPath = path.join(this.logsRoot, "embeddings");
        this.unifiedPath = path.join(this.logsRoot, "unified");
        this.metadataPath = path.join(this.logsRoot, "metadata");

        // Ollama configuration
        this.ollamaUrl = options.ollamaUrl || process.env.OLLAMA_URL || "http://localhost:11434";
        this.ollamaModel = options.ollamaModel || process.env.OLLAMA_MODEL || "mxbai-embed-large";

        // Search configuration
        this.similarityThreshold = options.threshold || 0.4;
        this.maxResults = options.maxResults || 10;
    }

    /**
     * Generate embedding for search query
     */
    async generateQueryEmbedding(query) {
        try {
            const response = await fetch(`${this.ollamaUrl}/api/embeddings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: this.ollamaModel,
                    prompt: query.trim()
                })
            });

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            return result.embedding;
        } catch (error) {
            throw new Error(`Error generating query embedding: ${error.message}`);
        }
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    calculateSimilarity(vec1, vec2) {
        if (vec1.length !== vec2.length) {
            throw new Error("Vector dimensions must match");
        }

        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;

        for (let i = 0; i < vec1.length; i++) {
            dotProduct += vec1[i] * vec2[i];
            norm1 += vec1[i] * vec1[i];
            norm2 += vec2[i] * vec2[i];
        }

        if (norm1 === 0 || norm2 === 0) {
            return 0;
        }

        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }

    /**
     * Load all embedding files
     */
    async loadAllEmbeddings() {
        const embeddingFiles = [];

        try {
            const files = await fs.readdir(this.embeddingsPath);
            const jsonFiles = files.filter(f => f.endsWith(".json"));

            for (const file of jsonFiles) {
                try {
                    const filePath = path.join(this.embeddingsPath, file);
                    const data = await fs.readFile(filePath, "utf8");
                    const embeddingData = JSON.parse(data);

                    embeddingFiles.push({
                        filename: embeddingData.filename,
                        sourceFile: embeddingData.sourceFile,
                        created: embeddingData.created,
                        embeddings: embeddingData.embeddings || []
                    });
                } catch (error) {
                    console.log(`🔍 Warning: Could not load ${file}: ${error.message}`);
                }
            }
        } catch (error) {
            throw new Error(`Error loading embeddings: ${error.message}`);
        }

        return embeddingFiles;
    }

    /**
     * Search across all embeddings
     */
    async searchEmbeddings(query) {
        console.log(`🔍 Searching for: "${query}"`);

        // Generate query embedding
        console.log("🧠 Generating query embedding...");
        const queryEmbedding = await this.generateQueryEmbedding(query);

        // Load all embeddings
        console.log("📜 Loading archive embeddings...");
        const embeddingFiles = await this.loadAllEmbeddings();

        if (embeddingFiles.length === 0) {
            console.log("🔍 No embeddings found. Run athena-embedder first.");
            return [];
        }

        console.log(`📊 Searching across ${embeddingFiles.length} archives...`);

        // Search through all chunks
        const matches = [];

        for (const file of embeddingFiles) {
            for (const chunk of file.embeddings) {
                try {
                    const similarity = this.calculateSimilarity(queryEmbedding, chunk.embedding);

                    if (similarity >= this.similarityThreshold) {
                        matches.push({
                            filename: file.filename,
                            sourceFile: file.sourceFile,
                            chunkIndex: chunk.chunkIndex,
                            text: chunk.text,
                            similarity: similarity,
                            metadata: chunk.metadata
                        });
                    }
                } catch (_error) {
                    console.log(`🔍 Warning: Error calculating similarity for ${file.filename} chunk ${chunk.chunkIndex}`);
                }
            }
        }

        // Sort by similarity (highest first) and limit results
        matches.sort((a, b) => b.similarity - a.similarity);
        return matches.slice(0, this.maxResults);
    }

    /**
     * Format search results for display
     */
    formatResults(matches, query) {
        if (matches.length === 0) {
            return `🦉 "I have searched the sacred archives, mortal, but found no wisdom matching '${query}'. Perhaps try different words of power?"`;
        }

        let output = `🦉 "Ah, mortal, you seek wisdom about '${query}'. The archives reveal:\n\n`;

        matches.forEach((match, index) => {
            const similarity = Math.round(match.similarity * 100);
            const timeMatch = match.filename.match(/^(\d{4})-(\d{2})-(\d{2})-(\d{2})$/);
            let timeStr = match.filename;

            if (timeMatch) {
                const [, year, month, day, hour] = timeMatch;
                timeStr = `${year}-${month}-${day} ${hour}:00`;
            }

            output += `📜 Archive ${timeStr} (${similarity}% match)\n`;
            output += `   Chunk ${match.chunkIndex + 1}: ${match.text.substring(0, 200)}${match.text.length > 200 ? "..." : ""}\n`;

            if (index < matches.length - 1) {
                output += "\n";
            }
        });

        output += `\n🔍 Found ${matches.length} relevant passages across the sacred scrolls."`;

        return output;
    }

    /**
     * Get context from full archive file
     */
    async getFullContext(filename) {
        try {
            const archiveFile = path.join(this.unifiedPath, `${filename}.md`);

            if (!fsSync.existsSync(archiveFile)) {
                return "Archive file not found";
            }

            const content = await fs.readFile(archiveFile, "utf8");
            return content;
        } catch (error) {
            return `Error reading archive: ${error.message}`;
        }
    }

    /**
     * Perform search and display results
     */
    async performSearch(query, options = {}) {
        try {
            const matches = await this.searchEmbeddings(query);
            const results = this.formatResults(matches, query);

            console.log("\n" + results);

            // If detailed context requested, show full archive for top match
            if (options.showContext && matches.length > 0) {
                console.log("\n📖 Full context for top match:");
                console.log("═".repeat(60));

                const topMatch = matches[0];
                const fullContext = await this.getFullContext(topMatch.filename);

                // Show just the relevant section plus some context
                const lines = fullContext.split("\n");
                const chunkLines = topMatch.text.split("\n");
                let startIdx = -1;

                // Find where this chunk appears in the full content
                for (let i = 0; i < lines.length - chunkLines.length; i++) {
                    if (lines.slice(i, i + chunkLines.length).join("\n").includes(chunkLines[0])) {
                        startIdx = i;
                        break;
                    }
                }

                if (startIdx >= 0) {
                    const contextStart = Math.max(0, startIdx - 5);
                    const contextEnd = Math.min(lines.length, startIdx + chunkLines.length + 5);
                    const contextLines = lines.slice(contextStart, contextEnd);

                    console.log(contextLines.join("\n"));
                } else {
                    console.log(topMatch.text);
                }
            }

            return matches;
        } catch (error) {
            console.error(`🔍 Search failed: ${error.message}`);
            return [];
        }
    }

    /**
     * Show search statistics
     */
    async showStats() {
        try {
            const embeddingFiles = await this.loadAllEmbeddings();

            let totalChunks = 0;
            let totalEmbeddings = 0;
            const fileStats = [];

            for (const file of embeddingFiles) {
                const chunks = file.embeddings.length;
                totalChunks += chunks;
                totalEmbeddings += chunks;

                fileStats.push({
                    filename: file.filename,
                    chunks: chunks,
                    created: file.created
                });
            }

            console.log("\n🔍 Athena's Search Index Statistics:");
            console.log(`📄 Indexed archives: ${embeddingFiles.length}`);
            console.log(`🔢 Total chunks: ${totalChunks}`);
            console.log(`🧠 Total embeddings: ${totalEmbeddings}`);
            console.log(`🎯 Similarity threshold: ${this.similarityThreshold * 100}%`);
            console.log(`📊 Max results: ${this.maxResults}`);

            if (fileStats.length > 0) {
                console.log("\n📊 Archive breakdown:");
                fileStats
                    .sort((a, b) => b.chunks - a.chunks)
                    .slice(0, 10)
                    .forEach(stat => {
                        console.log(`   ${stat.filename}: ${stat.chunks} chunks`);
                    });
            }
        } catch (error) {
            console.error("Error generating stats:", error.message);
        }
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);

    if (args.includes("stats")) {
        const searcher = new AthenaSearch();
        await searcher.showStats();
        return;
    }

    // Parse search command
    const searchIndex = args.findIndex(arg => arg === "search");
    if (searchIndex === -1 || searchIndex + 1 >= args.length) {
        console.log("🔍 Usage: athena-search.js search \"your query\"");
        console.log("🔍 Options: --threshold 0.4 --max 10 --context");
        return;
    }

    const query = args[searchIndex + 1];
    const options = {};

    // Parse options
    const thresholdIndex = args.findIndex(arg => arg === "--threshold");
    if (thresholdIndex !== -1 && thresholdIndex + 1 < args.length) {
        options.threshold = parseFloat(args[thresholdIndex + 1]);
    }

    const maxIndex = args.findIndex(arg => arg === "--max");
    if (maxIndex !== -1 && maxIndex + 1 < args.length) {
        options.maxResults = parseInt(args[maxIndex + 1]);
    }

    options.showContext = args.includes("--context");

    // Create searcher and search
    const searcher = new AthenaSearch(options);

    try {
        await searcher.performSearch(query, options);
    } catch (error) {
        console.error("🔍 Search failed:", error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { AthenaSearch };