/**
 * Athena Embeddings Service
 * 
 * Provides semantic search capabilities for chat logs using Ollama's mxbai-embed-large.
 * Creates a dual-memory system: Memento catalogs + vector embeddings.
 * 
 * @version 1.0.0
 * @author Claude & HexTrackr Team
 */

const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");

class AthenaEmbeddingService {
    constructor(options = {}) {
        this.ollamaUrl = options.ollamaUrl || "http://localhost:11434";
        this.modelName = options.modelName || "mxbai-embed-large";
        this.embeddingsDir = options.embeddingsDir || "./claudelogs/embeddings";
        this.chunkSize = options.chunkSize || 1024; // characters per chunk
        this.chunkOverlap = options.chunkOverlap || 200; // character overlap
        
        // Ensure embeddings directory exists
        this.initializeDirectories();
    }
    
    async initializeDirectories() {
        try {
            await fs.mkdir(this.embeddingsDir, { recursive: true });
        } catch (error) {
            console.warn("Warning: Could not create embeddings directory:", error.message);
        }
    }
    
    /**
     * Generate embedding vector for text using Ollama
     * @param {string} text - Text to embed
     * @returns {Promise<number[]>} - 1024-dimensional embedding vector
     */
    async generateEmbedding(text) {
        try {
            const response = await fetch(`${this.ollamaUrl}/api/embeddings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: this.modelName,
                    prompt: text.trim()
                })
            });
            
            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
            }
            
            const result = await response.json();
            return result.embedding;
        } catch (error) {
            console.error("Error generating embedding:", error.message);
            throw error;
        }
    }
    
    /**
     * Smart chunking algorithm for conversation segments
     * @param {string} content - Full conversation content
     * @returns {Array<{text: string, metadata: object}>} - Chunks with metadata
     */
    smartChunk(content) {
        const chunks = [];
        const currentPos = 0;
        
        // Split by conversation turns first (User/Assistant markers)
        const turns = content.split(/\n(?=(?:User:|Assistant:|Human:|Claude:))/);
        
        for (let i = 0; i < turns.length; i++) {
            const turn = turns[i].trim();
            if (!turn) {continue;}
            
            // If turn is small enough, use as single chunk
            if (turn.length <= this.chunkSize) {
                chunks.push({
                    text: turn,
                    metadata: {
                        turnIndex: i,
                        chunkType: "single_turn",
                        length: turn.length
                    }
                });
            } else {
                // Split large turns into overlapping chunks
                const turnChunks = this.splitLongText(turn, i);
                chunks.push(...turnChunks);
            }
        }
        
        return chunks;
    }
    
    /**
     * Split long text into overlapping chunks
     * @param {string} text - Text to split
     * @param {number} turnIndex - Turn index for metadata
     * @returns {Array<{text: string, metadata: object}>} - Text chunks
     */
    splitLongText(text, turnIndex) {
        const chunks = [];
        let start = 0;
        let chunkIndex = 0;
        
        while (start < text.length) {
            let end = start + this.chunkSize;
            
            // Don't split mid-word unless necessary
            if (end < text.length) {
                const lastSpace = text.lastIndexOf(" ", end);
                if (lastSpace > start + this.chunkSize * 0.7) {
                    end = lastSpace;
                }
            }
            
            const chunk = text.substring(start, end).trim();
            if (chunk) {
                chunks.push({
                    text: chunk,
                    metadata: {
                        turnIndex,
                        chunkIndex: chunkIndex++,
                        chunkType: "split_turn",
                        length: chunk.length,
                        startPos: start,
                        endPos: end
                    }
                });
            }
            
            // Move start position with overlap
            start = Math.max(start + this.chunkSize - this.chunkOverlap, end);
        }
        
        return chunks;
    }
    
    /**
     * Process a chat session and generate embeddings
     * @param {string} sessionContent - Full chat session markdown
     * @param {object} metadata - Session metadata (filename, timestamp, etc.)
     * @returns {Promise<object>} - Processing results with file paths
     */
    async processSession(sessionContent, metadata) {
        const startTime = Date.now();
        const sessionId = metadata.sessionId || this.generateSessionId(metadata);
        
        console.log(`\n🧠 Processing session: ${sessionId}`);
        
        // 1. Generate chunks
        const chunks = this.smartChunk(sessionContent);
        console.log(`📝 Generated ${chunks.length} chunks`);
        
        // 2. Generate embeddings for each chunk
        const embeddings = [];
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            console.log(`🔮 Embedding chunk ${i + 1}/${chunks.length}...`);
            
            try {
                const embedding = await this.generateEmbedding(chunk.text);
                embeddings.push({
                    id: crypto.createHash("md5").update(chunk.text).digest("hex"),
                    text: chunk.text,
                    embedding: embedding,
                    metadata: {
                        ...chunk.metadata,
                        sessionId,
                        timestamp: metadata.timestamp || new Date().toISOString()
                    }
                });
            } catch (error) {
                console.error(`❌ Failed to embed chunk ${i + 1}:`, error.message);
            }
        }
        
        // 3. Save embeddings to file
        const embeddingFile = path.join(this.embeddingsDir, `${sessionId}.json`);
        const embeddingData = {
            sessionId,
            metadata,
            embeddings,
            stats: {
                totalChunks: chunks.length,
                successfulEmbeddings: embeddings.length,
                processingTime: Date.now() - startTime,
                generatedAt: new Date().toISOString()
            }
        };
        
        await fs.writeFile(embeddingFile, JSON.stringify(embeddingData, null, 2));
        console.log(`💾 Saved embeddings to: ${embeddingFile}`);
        
        return {
            sessionId,
            embeddingFile,
            chunksProcessed: chunks.length,
            embeddingsGenerated: embeddings.length,
            processingTime: Date.now() - startTime
        };
    }
    
    /**
     * Search for similar content using semantic similarity
     * @param {string} query - Search query
     * @param {object} options - Search options
     * @returns {Promise<Array>} - Ranked search results
     */
    async search(query, options = {}) {
        const {
            topK = 5,
            threshold = 0.4,  // Lowered from 0.7 for better recall
            sessionIds = null
        } = options;
        
        console.log(`🔍 Searching for: "${query}"`);
        
        // Generate query embedding
        const queryEmbedding = await this.generateEmbedding(query);
        
        // Load embeddings from files
        const allEmbeddings = await this.loadAllEmbeddings(sessionIds);
        
        // Calculate similarities
        const results = allEmbeddings
            .map(item => ({
                ...item,
                similarity: this.cosineSimilarity(queryEmbedding, item.embedding)
            }))
            .filter(item => item.similarity >= threshold)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, topK);
        
        console.log(`📊 Found ${results.length} relevant results`);
        
        return results.map(result => ({
            sessionId: result.metadata.sessionId,
            text: result.text,
            similarity: result.similarity,
            metadata: result.metadata
        }));
    }
    
    /**
     * Load all embeddings from storage
     * @param {Array<string>} sessionIds - Optional filter by session IDs
     * @returns {Promise<Array>} - All embedding entries
     */
    async loadAllEmbeddings(sessionIds = null) {
        const embeddings = [];
        
        try {
            const files = await fs.readdir(this.embeddingsDir);
            const jsonFiles = files.filter(f => f.endsWith(".json"));
            
            for (const file of jsonFiles) {
                const sessionId = path.basename(file, ".json");
                
                // Skip if filtering by sessionIds
                if (sessionIds && !sessionIds.includes(sessionId)) {
                    continue;
                }
                
                try {
                    const filePath = path.join(this.embeddingsDir, file);
                    const data = JSON.parse(await fs.readFile(filePath, "utf8"));
                    embeddings.push(...data.embeddings);
                } catch (error) {
                    console.warn(`Warning: Could not load ${file}:`, error.message);
                }
            }
        } catch (error) {
            console.warn("Warning: Could not read embeddings directory:", error.message);
        }
        
        return embeddings;
    }
    
    /**
     * Calculate cosine similarity between two vectors
     * @param {number[]} a - First vector
     * @param {number[]} b - Second vector
     * @returns {number} - Similarity score (0-1)
     */
    cosineSimilarity(a, b) {
        if (a.length !== b.length) {
            throw new Error("Vectors must have same length");
        }
        
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        
        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
    
    /**
     * Generate unique session ID from metadata
     * @param {object} metadata - Session metadata
     * @returns {string} - Session ID
     */
    generateSessionId(metadata) {
        const timestamp = metadata.timestamp || new Date().toISOString();
        const date = timestamp.split("T")[0];
        const time = timestamp.split("T")[1].substring(0, 5).replace(":", "");
        return `${date}-T${time}`;
    }
    
    /**
     * Get statistics about the embedding database
     * @returns {Promise<object>} - Database statistics
     */
    async getStats() {
        try {
            const files = await fs.readdir(this.embeddingsDir);
            const jsonFiles = files.filter(f => f.endsWith(".json"));
            
            let totalEmbeddings = 0;
            const totalSessions = jsonFiles.length;
            let oldestSession = null;
            let newestSession = null;
            
            for (const file of jsonFiles) {
                try {
                    const filePath = path.join(this.embeddingsDir, file);
                    const data = JSON.parse(await fs.readFile(filePath, "utf8"));
                    
                    totalEmbeddings += data.embeddings.length;
                    
                    const sessionDate = new Date(data.metadata.timestamp || data.stats.generatedAt);
                    if (!oldestSession || sessionDate < oldestSession.date) {
                        oldestSession = { file, date: sessionDate };
                    }
                    if (!newestSession || sessionDate > newestSession.date) {
                        newestSession = { file, date: sessionDate };
                    }
                } catch (error) {
                    console.warn(`Warning: Could not read stats from ${file}`);
                }
            }
            
            return {
                totalSessions,
                totalEmbeddings,
                averageEmbeddingsPerSession: totalSessions > 0 ? Math.round(totalEmbeddings / totalSessions) : 0,
                oldestSession: oldestSession?.file || null,
                newestSession: newestSession?.file || null,
                embeddingsDirectory: this.embeddingsDir
            };
        } catch (error) {
            return {
                error: error.message,
                totalSessions: 0,
                totalEmbeddings: 0
            };
        }
    }
}

// Export the service
module.exports = {
    AthenaEmbeddingService
};

// CLI interface for testing
if (require.main === module) {
    const service = new AthenaEmbeddingService();
    
    const command = process.argv[2];
    const arg = process.argv[3];
    
    switch (command) {
        case "test":
            console.log("🧪 Testing Ollama connection...");
            service.generateEmbedding("Hello, this is a test!")
                .then(embedding => {
                    console.log("✅ Success! Embedding dimensions:", embedding.length);
                    console.log("Sample values:", embedding.slice(0, 5).map(v => v.toFixed(4)));
                })
                .catch(error => console.error("❌ Test failed:", error.message));
            break;
            
        case "search":
            if (!arg) {
                console.error("Usage: node athena-embeddings.js search \"your query\"");
                process.exit(1);
            }
            service.search(arg)
                .then(results => {
                    console.log(`\n📊 Search Results for: "${arg}"`);
                    results.forEach((result, i) => {
                        console.log(`\n${i + 1}. Similarity: ${result.similarity.toFixed(3)}`);
                        console.log(`Session: ${result.sessionId}`);
                        console.log(`Text: ${result.text.substring(0, 200)}...`);
                    });
                })
                .catch(error => console.error("❌ Search failed:", error.message));
            break;
            
        case "stats":
            service.getStats()
                .then(stats => {
                    console.log("\n📊 Embedding Database Statistics:");
                    console.log(`Total Sessions: ${stats.totalSessions}`);
                    console.log(`Total Embeddings: ${stats.totalEmbeddings}`);
                    console.log(`Average per Session: ${stats.averageEmbeddingsPerSession}`);
                    console.log(`Directory: ${stats.embeddingsDirectory}`);
                })
                .catch(error => console.error("❌ Stats failed:", error.message));
            break;
            
        default:
            console.log(`
🧠 Athena Embedding Service

Usage:
  node athena-embeddings.js test           # Test Ollama connection
  node athena-embeddings.js search "query" # Search embeddings  
  node athena-embeddings.js stats          # Show database stats

Examples:
  node athena-embeddings.js test
  node athena-embeddings.js search "authentication bugs"
  node athena-embeddings.js stats
            `);
    }
}