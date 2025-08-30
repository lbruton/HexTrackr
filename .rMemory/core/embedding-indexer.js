#!/usr/bin/env node
/**
 * HexTrackr Embedding Indexer
 * Runs alongside semantic-orchestrator.js using nomic-embed-text:latest
 * Builds search matrix and embedding indexes in real-time
 */

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

class EmbeddingIndexer {
    constructor() {
        this.projectRoot = process.cwd();
        this.memoryDir = path.join(this.projectRoot, ".rMemory");
        this.jsonDir = path.join(this.memoryDir, "json");
        this.searchMatrixDir = path.join(this.memoryDir, "search-matrix");
        this.embeddingsFile = path.join(this.searchMatrixDir, "embeddings.json");
        this.searchMatrixFile = path.join(this.searchMatrixDir, "search-matrix.json");
        this.consolidatedMatrixFile = path.join(this.searchMatrixDir, "consolidated-matrix.json");
        
        // Evidence and canonical files (shared with orchestrator)
        this.evidenceFile = path.join(this.jsonDir, "chat-evidence.json");
        this.canonicalFile = path.join(this.jsonDir, "canonical-notes.json");
        this.symbolsFile = path.join(this.jsonDir, "symbols-table.json");
        
        this.embeddingModel = "nomic-embed-text:latest";
        
        // In-memory indexes
        this.embeddings = {};
        this.searchMatrix = {};
        this.lastProcessedCount = 0;
        
        this.ensureDirectories();
        this.loadExistingEmbeddings();
    }

    ensureDirectories() {
        [this.searchMatrixDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`📁 Created directory: ${dir}`);
            }
        });
    }

    loadExistingEmbeddings() {
        try {
            if (fs.existsSync(this.embeddingsFile)) {
                this.embeddings = JSON.parse(fs.readFileSync(this.embeddingsFile, "utf8"));
                console.log(`🔍 Loaded ${Object.keys(this.embeddings).length} existing embeddings`);
            }
            
            if (fs.existsSync(this.searchMatrixFile)) {
                this.searchMatrix = JSON.parse(fs.readFileSync(this.searchMatrixFile, "utf8"));
                console.log(`📊 Loaded search matrix with ${Object.keys(this.searchMatrix).length} entries`);
            }
        } catch (error) {
            console.warn("⚠️  Error loading existing embeddings:", error.message);
        }
    }

    async generateEmbedding(text, id) {
        try {
            console.log(`🧠 Generating embedding for: ${id.substring(0, 30)}...`);
            
            // Truncate text if too long (avoid spawn E2BIG)
            const maxLength = 8000;
            const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
            
            // Use HTTP API for embeddings
            const { spawn } = require("child_process");
            const curl = spawn("curl", [
                "-d", JSON.stringify({
                    model: this.embeddingModel,
                    prompt: truncatedText
                }),
                "http://localhost:11434/api/embeddings"
            ]);
            
            let output = "";
            let errorOutput = "";

            curl.stdout.on("data", (data) => {
                output += data.toString();
            });

            curl.stderr.on("data", (data) => {
                errorOutput += data.toString();
            });

            return new Promise((resolve) => {
                curl.on("close", (code) => {
                    if (code === 0) {
                        try {
                            const response = JSON.parse(output.trim());
                            if (response.embedding && Array.isArray(response.embedding)) {
                                console.log(`   ✅ Generated embedding (${response.embedding.length} dimensions)`);
                                resolve(response.embedding);
                            } else {
                                console.warn("   ⚠️  Invalid embedding response format");
                                resolve(null);
                            }
                        } catch (parseError) {
                            console.warn(`   ⚠️  Failed to parse embedding: ${parseError.message}`);
                            resolve(null);
                        }
                    } else {
                        console.warn(`   ❌ Curl failed: ${errorOutput}`);
                        resolve(null);
                    }
                });

                curl.on("error", (error) => {
                    console.warn(`   ❌ Curl process error: ${error.message}`);
                    resolve(null);
                });
            });
            
        } catch (error) {
            console.warn(`   ❌ Embedding generation error: ${error.message}`);
            return null;
        }
    }

    calculateCosineSimilarity(vecA, vecB) {
        if (!vecA || !vecB || vecA.length !== vecB.length) {return 0;}
        
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    async processEvidenceItems() {
        if (!fs.existsSync(this.evidenceFile)) {
            console.log("📋 Waiting for evidence file...");
            return 0;
        }

        try {
            const evidenceData = JSON.parse(fs.readFileSync(this.evidenceFile, "utf8"));
            const newItems = evidenceData.slice(this.lastProcessedCount);
            
            if (newItems.length === 0) {
                return 0;
            }

            console.log(`\n🔍 Processing ${newItems.length} new evidence items for embeddings...`);
            
            let processed = 0;
            for (const item of newItems) {
                if (!this.embeddings[item.id]) {
                    // Generate embedding for the text content
                    const embedding = await this.generateEmbedding(item.text, item.id);
                    
                    if (embedding) {
                        this.embeddings[item.id] = {
                            id: item.id,
                            topic_key: item.topic_key,
                            source: item.source,
                            embedding: embedding,
                            text_preview: item.text.substring(0, 200),
                            created_at: new Date().toISOString()
                        };
                        processed++;
                    }
                    
                    // Small delay to prevent overwhelming Ollama
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
            
            this.lastProcessedCount = evidenceData.length;
            console.log(`   ✅ Generated ${processed} new embeddings`);
            
            return processed;
            
        } catch (error) {
            console.warn("⚠️  Error processing evidence items:", error.message);
            return 0;
        }
    }

    async processCanonicalNotes() {
        if (!fs.existsSync(this.canonicalFile)) {
            return 0;
        }

        try {
            const canonicalData = JSON.parse(fs.readFileSync(this.canonicalFile, "utf8"));
            
            let processed = 0;
            for (const [topicKey, note] of Object.entries(canonicalData)) {
                const canonicalId = `canonical:${topicKey}`;
                
                if (!this.embeddings[canonicalId]) {
                    // Generate embedding for canonical note
                    const fullText = `${note.title || ""} ${note.summary || ""} ${note.technical_details || ""}`;
                    const embedding = await this.generateEmbedding(fullText, canonicalId);
                    
                    if (embedding) {
                        this.embeddings[canonicalId] = {
                            id: canonicalId,
                            topic_key: topicKey,
                            source: "canonical_note",
                            embedding: embedding,
                            text_preview: note.summary || note.title || "",
                            created_at: new Date().toISOString()
                        };
                        processed++;
                    }
                    
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
            
            if (processed > 0) {
                console.log(`   ✅ Generated ${processed} canonical note embeddings`);
            }
            
            return processed;
            
        } catch (error) {
            console.warn("⚠️  Error processing canonical notes:", error.message);
            return 0;
        }
    }

    buildSearchMatrix() {
        console.log("\n📊 Building search matrix from embeddings...");
        
        const embeddingIds = Object.keys(this.embeddings);
        const matrixSize = embeddingIds.length;
        
        if (matrixSize < 2) {
            console.log("   ⚠️  Need at least 2 embeddings to build matrix");
            return;
        }

        // Build similarity matrix
        const similarityMatrix = {};
        let comparisons = 0;
        
        for (let i = 0; i < embeddingIds.length; i++) {
            const idA = embeddingIds[i];
            const embeddingA = this.embeddings[idA];
            
            if (!similarityMatrix[idA]) {
                similarityMatrix[idA] = {};
            }
            
            for (let j = i + 1; j < embeddingIds.length; j++) {
                const idB = embeddingIds[j];
                const embeddingB = this.embeddings[idB];
                
                const similarity = this.calculateCosineSimilarity(
                    embeddingA.embedding,
                    embeddingB.embedding
                );
                
                // Store bidirectional similarities above threshold
                if (similarity > 0.3) {
                    similarityMatrix[idA][idB] = similarity;
                    
                    if (!similarityMatrix[idB]) {
                        similarityMatrix[idB] = {};
                    }
                    similarityMatrix[idB][idA] = similarity;
                }
                
                comparisons++;
            }
        }
        
        // Update search matrix
        this.searchMatrix = {
            metadata: {
                total_embeddings: matrixSize,
                total_comparisons: comparisons,
                last_updated: new Date().toISOString(),
                embedding_model: this.embeddingModel
            },
            similarity_matrix: similarityMatrix,
            topics: this.buildTopicClusters(similarityMatrix)
        };
        
        console.log(`   ✅ Built search matrix: ${matrixSize} embeddings, ${comparisons} comparisons`);
    }

    buildTopicClusters(similarityMatrix) {
        const clusters = {};
        const processed = new Set();
        
        for (const [itemId, similarities] of Object.entries(similarityMatrix)) {
            if (processed.has(itemId)) {continue;}
            
            const embedding = this.embeddings[itemId];
            if (!embedding) {continue;}
            
            const topicKey = embedding.topic_key;
            if (!clusters[topicKey]) {
                clusters[topicKey] = {
                    members: [],
                    avg_similarity: 0,
                    sources: new Set()
                };
            }
            
            clusters[topicKey].members.push(itemId);
            clusters[topicKey].sources.add(embedding.source);
            processed.add(itemId);
        }
        
        // Convert sets to arrays for JSON serialization
        for (const cluster of Object.values(clusters)) {
            cluster.sources = Array.from(cluster.sources);
        }
        
        return clusters;
    }

    buildConsolidatedMatrix() {
        console.log("\n🔄 Building consolidated matrix (rMemory-style)...");
        
        const consolidated = {
            metadata: {
                project: "HexTrackr",
                created_at: new Date().toISOString(),
                total_items: Object.keys(this.embeddings).length,
                embedding_model: this.embeddingModel,
                version: "1.0.0"
            },
            embeddings_summary: {},
            topic_hierarchy: {},
            search_index: {},
            similarity_clusters: this.searchMatrix.topics || {}
        };
        
        // Build embeddings summary by source
        for (const embedding of Object.values(this.embeddings)) {
            const source = embedding.source;
            if (!consolidated.embeddings_summary[source]) {
                consolidated.embeddings_summary[source] = {
                    count: 0,
                    topics: new Set(),
                    avg_dimensions: 0
                };
            }
            
            consolidated.embeddings_summary[source].count++;
            consolidated.embeddings_summary[source].topics.add(embedding.topic_key);
            consolidated.embeddings_summary[source].avg_dimensions = embedding.embedding.length;
        }
        
        // Convert sets to arrays
        for (const summary of Object.values(consolidated.embeddings_summary)) {
            summary.topics = Array.from(summary.topics);
        }
        
        // Build topic hierarchy
        for (const embedding of Object.values(this.embeddings)) {
            const parts = embedding.topic_key.split(":");
            let current = consolidated.topic_hierarchy;
            
            for (const part of parts) {
                if (!current[part]) {
                    current[part] = { children: {}, items: [] };
                }
                current = current[part].children;
            }
            
            // Add item to final level
            const finalKey = parts[parts.length - 1];
            if (consolidated.topic_hierarchy[parts[0]]) {
                let target = consolidated.topic_hierarchy[parts[0]];
                for (let i = 1; i < parts.length - 1; i++) {
                    target = target.children[parts[i]];
                }
                if (!target.children[finalKey].items) {
                    target.children[finalKey].items = [];
                }
                target.children[finalKey].items.push(embedding.id);
            }
        }
        
        // Build search index for fast lookups
        for (const [id, embedding] of Object.entries(this.embeddings)) {
            consolidated.search_index[id] = {
                topic_key: embedding.topic_key,
                source: embedding.source,
                preview: embedding.text_preview
            };
        }
        
        console.log(`   ✅ Consolidated matrix: ${Object.keys(consolidated.search_index).length} indexed items`);
        
        return consolidated;
    }

    async saveAllData() {
        try {
            // Save embeddings
            fs.writeFileSync(this.embeddingsFile, JSON.stringify(this.embeddings, null, 2));
            console.log(`💾 Saved ${Object.keys(this.embeddings).length} embeddings`);
            
            // Save search matrix
            fs.writeFileSync(this.searchMatrixFile, JSON.stringify(this.searchMatrix, null, 2));
            console.log("💾 Saved search matrix");
            
            // Save consolidated matrix (rMemory style)
            const consolidated = this.buildConsolidatedMatrix();
            fs.writeFileSync(this.consolidatedMatrixFile, JSON.stringify(consolidated, null, 2));
            console.log("💾 Saved consolidated matrix");
            
        } catch (error) {
            console.error("❌ Error saving data:", error.message);
        }
    }

    async runContinuousIndexing() {
        console.log("🚀 HexTrackr Embedding Indexer - Continuous Mode");
        console.log("================================================\n");
        console.log(`🧠 Using model: ${this.embeddingModel}`);
        console.log(`📁 Output directory: ${this.searchMatrixDir}\n`);
        
        let cycles = 0;
        
        while (true) {
            try {
                cycles++;
                console.log(`\n🔄 Indexing cycle ${cycles} - ${new Date().toLocaleTimeString()}`);
                
                // Process new evidence items
                const newEvidenceCount = await this.processEvidenceItems();
                
                // Process canonical notes
                const newCanonicalCount = await this.processCanonicalNotes();
                
                const totalNew = newEvidenceCount + newCanonicalCount;
                
                if (totalNew > 0) {
                    // Rebuild search matrix with new embeddings
                    this.buildSearchMatrix();
                    
                    // Save everything
                    await this.saveAllData();
                    
                    console.log(`   ✅ Processed ${totalNew} new items this cycle`);
                } else {
                    console.log("   📊 No new items to process");
                }
                
                // Show current stats
                const totalEmbeddings = Object.keys(this.embeddings).length;
                console.log(`   📈 Total embeddings: ${totalEmbeddings}`);
                
                // Wait before next cycle (30 seconds)
                await new Promise(resolve => setTimeout(resolve, 30000));
                
            } catch (error) {
                console.error(`❌ Error in indexing cycle ${cycles}:`, error.message);
                await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10s before retry
            }
        }
    }
}

// CLI execution
if (require.main === module) {
    const indexer = new EmbeddingIndexer();
    indexer.runContinuousIndexing().catch(error => {
        console.error("❌ Indexer failed:", error);
        process.exit(1);
    });
}

module.exports = EmbeddingIndexer;
