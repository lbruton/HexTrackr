#!/usr/bin/env node

/**
 * Athena Batch Embedding Processor
 * 🦉 "From ancient scrolls, semantic wisdom emerges"
 * 
 * Processes existing markdown session files to generate embeddings
 * for the dual-memory system (Memento catalogs + vector search)
 * 
 * @version 1.0.0
 * @author Claude & HexTrackr Team
 */

const fs = require("fs").promises;
const path = require("path");
const { AthenaEmbeddingService } = require("./athena-embeddings.js");

class AthenaBatchProcessor {
    constructor() {
        this.sessionsDir = path.join(process.cwd(), "claudelogs/sessions");
        this.embeddingService = new AthenaEmbeddingService({
            embeddingsDir: path.join(process.cwd(), "claudelogs/embeddings")
        });
        this.stats = {
            totalFiles: 0,
            processedFiles: 0,
            skippedFiles: 0,
            totalChunks: 0,
            totalEmbeddings: 0,
            errors: []
        };
    }
    
    /**
     * Get list of markdown files that need embedding processing
     */
    async getUnprocessedFiles() {
        try {
            const sessionFiles = await fs.readdir(this.sessionsDir);
            const markdownFiles = sessionFiles.filter(f => f.endsWith(".md"));
            
            const unprocessed = [];
            
            for (const file of markdownFiles) {
                // Check if embeddings already exist
                const baseName = path.basename(file, ".md");
                const embeddingId = this.extractSessionId(file);
                const embeddingFile = path.join(this.embeddingService.embeddingsDir, `${embeddingId}.json`);
                
                try {
                    await fs.access(embeddingFile);
                    console.log(`⚡ Skipping ${file} - embeddings already exist`);
                    this.stats.skippedFiles++;
                } catch (error) {
                    // Embedding file doesn't exist, needs processing
                    unprocessed.push(file);
                }
            }
            
            return unprocessed;
        } catch (error) {
            throw new Error(`Failed to scan sessions directory: ${error.message}`);
        }
    }
    
    /**
     * Extract session ID from filename for embedding storage
     */
    extractSessionId(filename) {
        // Extract date and create session ID
        // Format: 156_2025-09-12_conversation.md -> 2025-09-12-T1300
        const match = filename.match(/(\d+)_(\d{4}-\d{2}-\d{2})_(.+)\.md$/);
        if (match) {
            const [, sessionNum, date, title] = match;
            return `${date}-T${sessionNum.padStart(4, "0")}`;
        }
        
        // Fallback to filename without extension
        return path.basename(filename, ".md");
    }
    
    /**
     * Process a single markdown file
     */
    async processFile(filename) {
        const filePath = path.join(this.sessionsDir, filename);
        
        try {
            console.log(`\n🦉 Processing sacred scroll: ${filename}`);
            
            // Read markdown content
            const content = await fs.readFile(filePath, "utf8");
            const fileSize = Buffer.byteLength(content, "utf8");
            
            console.log(`📄 File size: ${(fileSize / 1024).toFixed(1)} KB`);
            
            // Extract metadata from filename and content
            const sessionId = this.extractSessionId(filename);
            const metadata = {
                sessionId,
                filename,
                filepath: filePath,
                timestamp: new Date().toISOString(),
                processedBy: "Athena Batch Processor",
                originalSize: fileSize
            };
            
            // Extract title from markdown header if available
            const titleMatch = content.match(/^# 🦉 Athena's Sacred Scroll #\d+$/m);
            if (titleMatch) {
                const titleLineMatch = content.match(/\*\*Title\*\*: (.+)$/m);
                if (titleLineMatch) {
                    metadata.title = titleLineMatch[1];
                }
            }
            
            // Process embeddings
            const result = await this.embeddingService.processSession(content, metadata);
            
            // Update statistics
            this.stats.processedFiles++;
            this.stats.totalChunks += result.chunksProcessed;
            this.stats.totalEmbeddings += result.embeddingsGenerated;
            
            console.log(`✨ Completed: ${result.chunksProcessed} chunks, ${result.embeddingsGenerated} embeddings in ${result.processingTime}ms`);
            
            return result;
            
        } catch (error) {
            console.error(`❌ Failed to process ${filename}: ${error.message}`);
            this.stats.errors.push({ filename, error: error.message });
            return null;
        }
    }
    
    /**
     * Process all unprocessed markdown files
     */
    async processAll(options = {}) {
        const { 
            maxFiles = null,
            delay = 500  // Delay between files to prevent overwhelming Ollama
        } = options;
        
        console.log("🦉 Athena's Batch Embedding Processor");
        console.log("📚 Scanning for unprocessed sacred scrolls...");
        
        const unprocessedFiles = await this.getUnprocessedFiles();
        this.stats.totalFiles = unprocessedFiles.length;
        
        if (unprocessedFiles.length === 0) {
            console.log("✅ All scrolls have been processed! No work needed.");
            return this.stats;
        }
        
        console.log(`📋 Found ${unprocessedFiles.length} files to process`);
        
        const filesToProcess = maxFiles ? 
            unprocessedFiles.slice(0, maxFiles) : 
            unprocessedFiles;
        
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
        
        if (this.stats.processingTime) {
            console.log(`   Total Time: ${(this.stats.processingTime / 1000).toFixed(1)}s`);
        }
        
        if (this.stats.errors.length > 0) {
            console.log(`   Errors: ${this.stats.errors.length}`);
            this.stats.errors.forEach((error, i) => {
                console.log(`     ${i + 1}. ${error.filename}: ${error.error}`);
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
    const processor = new AthenaBatchProcessor();
    
    const command = process.argv[2];
    const arg = process.argv[3];
    
    async function main() {
        try {
            switch (command) {
                case "all":
                    const maxFiles = arg ? parseInt(arg) : null;
                    await processor.processAll({ maxFiles });
                    break;
                    
                case "single":
                    if (!arg) {
                        console.error("Usage: node athena-batch-embeddings.js single <filename>");
                        process.exit(1);
                    }
                    await processor.processSingle(arg);
                    break;
                    
                case "search":
                    if (!arg) {
                        console.error("Usage: node athena-batch-embeddings.js search \"query\"");
                        process.exit(1);
                    }
                    await processor.search(arg);
                    break;
                    
                case "stats":
                    await processor.getStats();
                    break;
                    
                default:
                    console.log(`
🦉 Athena's Batch Embedding Processor

Usage:
  node athena-batch-embeddings.js all [max_files]     # Process all unprocessed files
  node athena-batch-embeddings.js single <filename>   # Process single file
  node athena-batch-embeddings.js search "query"      # Search embeddings
  node athena-batch-embeddings.js stats               # Show database stats

Examples:
  node athena-batch-embeddings.js all                 # Process all files
  node athena-batch-embeddings.js all 5               # Process max 5 files
  node athena-batch-embeddings.js single 156_2025-09-12_conversation.md
  node athena-batch-embeddings.js search "authentication bug"
  node athena-batch-embeddings.js stats
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