#!/usr/bin/env node

/**
 * Athena Semantic Search - Enhanced Version 3.0
 * 🦉 "Through structured wisdom, perfect answers emerge"
 *
 * Searches semantic embeddings with enhanced understanding
 * Uses abstracts, summaries, and semantic context for improved relevance
 *
 * @version 3.0.0
 * @author Athena, Goddess of Wisdom
 */

const fs = require("fs").promises;
const path = require("path");
require("dotenv").config();

class AthenaSemanticSearch {
    constructor(options = {}) {
        // Paths
        this.logsRoot = options.logsRoot || path.join(process.cwd(), "logs");
        this.semanticEmbeddingsPath = path.join(this.logsRoot, "semantic-embeddings");

        // Ollama configuration
        this.ollamaUrl = options.ollamaUrl || process.env.OLLAMA_URL || "http://localhost:11434";
        this.ollamaModel = options.ollamaModel || process.env.OLLAMA_MODEL || "mxbai-embed-large";

        // Search configuration
        this.maxResults = options.maxResults || 10;
        this.similarityThreshold = options.similarityThreshold || 0.3;

        // Cache for loaded embeddings
        this.embeddingsCache = new Map();
    }

    /**
     * Generate query embedding
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
            throw new Error(`Failed to generate query embedding: ${error.message}`);
        }
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    cosineSimilarity(vecA, vecB) {
        if (vecA.length !== vecB.length) {
            throw new Error("Vectors must have the same length");
        }

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        normA = Math.sqrt(normA);
        normB = Math.sqrt(normB);

        if (normA === 0 || normB === 0) {
            return 0;
        }

        return dotProduct / (normA * normB);
    }

    /**
     * Load all semantic embeddings
     */
    async loadAllEmbeddings() {
        if (this.embeddingsCache.size > 0) {
            return Array.from(this.embeddingsCache.values()).flat();
        }

        console.log("🧠 Loading semantic embeddings...");

        try {
            const files = await fs.readdir(this.semanticEmbeddingsPath);
            const embeddingFiles = files.filter(f => f.endsWith(".json"));

            console.log(`📜 Loading from ${embeddingFiles.length} embedding files...`);

            const allEmbeddings = [];

            for (const file of embeddingFiles) {
                try {
                    const filePath = path.join(this.semanticEmbeddingsPath, file);
                    const data = await fs.readFile(filePath, "utf8");
                    const embeddingData = JSON.parse(data);

                    // Add file context to each embedding
                    const fileEmbeddings = embeddingData.embeddings.map(embedding => ({
                        ...embedding,
                        sourceFile: embeddingData.filename,
                        embeddingStrategy: embeddingData.embeddingStrategy,
                        semanticModel: embeddingData.semanticModel
                    }));

                    this.embeddingsCache.set(file, fileEmbeddings);
                    allEmbeddings.push(...fileEmbeddings);

                } catch (error) {
                    console.warn(`🦉 Warning: Could not load embeddings from ${file}: ${error.message}`);
                }
            }

            console.log(`📊 Loaded ${allEmbeddings.length} semantic embeddings`);
            return allEmbeddings;

        } catch (error) {
            throw new Error(`Failed to load embeddings: ${error.message}`);
        }
    }

    /**
     * Search semantic embeddings
     */
    async search(query, options = {}) {
        const maxResults = options.maxResults || this.maxResults;
        const threshold = options.threshold || this.similarityThreshold;

        console.log(`🔍 Searching for: "${query}"`);
        console.log("🧠 Generating query embedding...");

        // Generate query embedding
        const queryEmbedding = await this.generateQueryEmbedding(query);

        // Load all embeddings
        const allEmbeddings = await this.loadAllEmbeddings();

        console.log(`📊 Searching across ${allEmbeddings.length} semantic chunks...`);

        // Calculate similarities
        const results = allEmbeddings.map(embeddingData => {
            const similarity = this.cosineSimilarity(queryEmbedding, embeddingData.embedding);

            return {
                similarity: similarity,
                percentage: Math.round(similarity * 100),
                sourceFile: embeddingData.sourceFile,
                chunkIndex: embeddingData.chunkIndex,
                abstract: embeddingData.semantic.abstract,
                summary: embeddingData.semantic.summary,
                keywords: embeddingData.semantic.keywords || [],
                entities: embeddingData.semantic.entities || {},
                problems: embeddingData.semantic.problems || [],
                achievements: embeddingData.semantic.achievements || [],
                context: embeddingData.semantic.context || {},
                embeddingText: embeddingData.embeddingText,
                embeddingStrategy: embeddingData.embeddingStrategy,
                originalTextHash: embeddingData.originalTextHash
            };
        });

        // Filter and sort results
        const filteredResults = results
            .filter(result => result.similarity >= threshold)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, maxResults);

        console.log(`🔍 Found ${filteredResults.length} relevant passages above ${Math.round(threshold * 100)}% threshold.\n`);

        return filteredResults;
    }

    /**
     * Format search results for display
     */
    formatResults(results, query) {
        if (results.length === 0) {
            return `🦉 "I searched through the sacred scrolls, but found no wisdom matching '${query}'. Perhaps try different terms or lower the threshold?"\n`;
        }

        let output = `🦉 "Ah, mortal, you seek wisdom about '${query}'. The archives reveal:\n\n`;

        results.forEach((result, _index) => {
            output += `📜 Archive ${result.sourceFile} (${result.percentage}% match)\n`;
            output += `   Abstract: ${result.abstract}\n`;
            output += `   Summary: ${result.summary}\n`;

            // Add keywords if present
            if (result.keywords.length > 0) {
                output += `   Keywords: ${result.keywords.join(", ")}\n`;
            }

            // Add key entities if present
            const keyEntities = [];
            if (result.entities.files && result.entities.files.length > 0) {
                keyEntities.push(`Files: ${result.entities.files.slice(0, 3).join(", ")}`);
            }
            if (result.entities.tools && result.entities.tools.length > 0) {
                keyEntities.push(`Tools: ${result.entities.tools.slice(0, 3).join(", ")}`);
            }
            if (result.entities.errors && result.entities.errors.length > 0) {
                keyEntities.push(`Errors: ${result.entities.errors.slice(0, 2).join(", ")}`);
            }

            if (keyEntities.length > 0) {
                output += `   Entities: ${keyEntities.join(" | ")}\n`;
            }

            // Add problems if present
            if (result.problems.length > 0) {
                const problemSummary = result.problems
                    .slice(0, 2)
                    .map(p => `${p.issue} (${p.severity})`)
                    .join("; ");
                output += `   Issues: ${problemSummary}\n`;
            }

            // Add achievements if present
            if (result.achievements.length > 0) {
                output += `   Achievements: ${result.achievements.slice(0, 2).join("; ")}\n`;
            }

            // Add context
            if (result.context.session_type) {
                output += `   Context: ${result.context.session_type} session, ${result.context.complexity} complexity, ${result.context.domain} domain\n`;
            }

            output += "\n";
        });

        output += `🔍 Found ${results.length} relevant passages across the sacred scrolls."\n`;

        return output;
    }

    /**
     * Interactive search with detailed results
     */
    async interactiveSearch(query, options = {}) {
        try {
            const results = await this.search(query, options);
            const formattedOutput = this.formatResults(results, query);

            console.log(formattedOutput);

            // Optional: Return results for programmatic use
            return results;

        } catch (error) {
            console.error(`🦉 Search failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get search statistics
     */
    async getSearchStats() {
        try {
            const allEmbeddings = await this.loadAllEmbeddings();

            const stats = {
                totalEmbeddings: allEmbeddings.length,
                filesCached: this.embeddingsCache.size,
                strategies: {},
                semanticModels: {},
                averageEmbeddingTextLength: 0
            };

            // Calculate strategy and model distribution
            let totalTextLength = 0;
            allEmbeddings.forEach(embedding => {
                const strategy = embedding.embeddingStrategy || "unknown";
                const model = embedding.semanticModel || "unknown";

                stats.strategies[strategy] = (stats.strategies[strategy] || 0) + 1;
                stats.semanticModels[model] = (stats.semanticModels[model] || 0) + 1;

                if (embedding.embeddingText) {
                    totalTextLength += embedding.embeddingText.length;
                }
            });

            stats.averageEmbeddingTextLength = Math.round(totalTextLength / allEmbeddings.length);

            return stats;

        } catch (error) {
            console.error("Error generating search stats:", error.message);
            return null;
        }
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);

    if (args.includes("--help") || args.includes("-h")) {
        console.log(`
🦉 Athena Semantic Search

Usage:
  node athena-semantic-search.js search "<query>" [options]
  node athena-semantic-search.js stats

Commands:
  search "<query>"     Search semantic embeddings
  stats                Show search system statistics

Options:
  --max-results <n>    Maximum results to return (default: 10)
  --threshold <n>      Similarity threshold 0.0-1.0 (default: 0.3)
  --help, -h           Show this help message

Examples:
  node athena-semantic-search.js search "ag-grid v33 upgrade"
  node athena-semantic-search.js search "bug fix" --max-results 5
  node athena-semantic-search.js search "theme system" --threshold 0.4
  node athena-semantic-search.js stats
        `);
        return;
    }

    if (args.includes("stats")) {
        const search = new AthenaSemanticSearch();
        const stats = await search.getSearchStats();

        if (stats) {
            console.log("\n🦉 Semantic Search Statistics:");
            console.log(`📊 Total embeddings: ${stats.totalEmbeddings}`);
            console.log(`📁 Files cached: ${stats.filesCached}`);
            console.log(`📈 Avg text length: ${stats.averageEmbeddingTextLength} chars`);
            console.log("🚀 Strategies:", Object.entries(stats.strategies).map(([k, v]) => `${k}: ${v}`).join(", "));
            console.log("🤖 Semantic models:", Object.entries(stats.semanticModels).map(([k, v]) => `${k}: ${v}`).join(", "));
        }
        return;
    }

    if (args[0] === "search" && args[1]) {
        const query = args[1];

        // Parse options
        const maxResultsIndex = args.indexOf("--max-results");
        const maxResults = maxResultsIndex >= 0 && args[maxResultsIndex + 1]
            ? parseInt(args[maxResultsIndex + 1])
            : 10;

        const thresholdIndex = args.indexOf("--threshold");
        const threshold = thresholdIndex >= 0 && args[thresholdIndex + 1]
            ? parseFloat(args[thresholdIndex + 1])
            : 0.3;

        const search = new AthenaSemanticSearch();
        await search.interactiveSearch(query, {
            maxResults: maxResults,
            threshold: threshold
        });

        return;
    }

    console.error("🦉 Invalid usage. Use --help for instructions.");
    process.exit(1);
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { AthenaSemanticSearch };