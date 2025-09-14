#!/usr/bin/env node

/**
 * Athena Semantic Processor - Gemini-Powered Knowledge Extraction
 * 🦉 "From raw conversations, structured wisdom emerges"
 *
 * Processes unified archives with Gemini to extract:
 * - Abstracts and summaries
 * - Entities (files, tools, people, errors)
 * - Keywords and technical terms
 * - Problem-solution mappings
 * - Temporal context
 *
 * @version 1.0.0
 * @author Athena, Goddess of Wisdom
 */

const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
const crypto = require("crypto");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { AthenaRateLimiter } = require("./athena-rate-limiter");
require("dotenv").config();

class AthenaSemanticProcessor {
    constructor(options = {}) {
        // Paths
        this.logsRoot = options.logsRoot || path.join(process.cwd(), "logs");
        this.unifiedPath = path.join(this.logsRoot, "unified");
        this.semanticCachePath = path.join(this.logsRoot, "semantic-cache");
        this.semanticMetadataPath = path.join(this.logsRoot, "semantic-metadata");

        // Gemini configuration
        this.apiKey = options.apiKey || process.env.GEMINI_API_KEY;
        this.model = options.model || "gemini-1.5-flash";
        this.maxTokensPerRequest = options.maxTokensPerRequest || 8192;

        if (!this.apiKey) {
            throw new Error("GEMINI_API_KEY is required");
        }

        // Initialize Gemini
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        this.geminiModel = this.genAI.getGenerativeModel({
            model: this.model,
            generationConfig: {
                temperature: 0.1, // Low temperature for consistent extraction
                topK: 1,
                topP: 0.8,
                maxOutputTokens: 2048,
            }
        });

        // Rate limiter (2 requests/second)
        this.rateLimiter = new AthenaRateLimiter({
            maxTokens: 120, // per minute
            tokensPerSecond: 2,
            maxRetries: 3
        });

        // State tracking
        this.processedFile = path.join(this.semanticMetadataPath, "semantic-processed.json");
        this.processedFiles = new Set();

        // Statistics
        this.stats = {
            totalChunks: 0,
            processedChunks: 0,
            failedChunks: 0,
            totalTokensUsed: 0,
            startTime: Date.now()
        };

        // Initialize directories and state
        this.ensureDirectories();
        this.loadProcessedState();
    }

    /**
     * Create required directories
     */
    async ensureDirectories() {
        const dirs = [this.semanticCachePath, this.semanticMetadataPath];

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
     * Generate semantic extraction prompt
     */
    generateExtractionPrompt(content, filename) {
        return `Analyze this HexTrackr development conversation log and extract structured semantic information.

**Context**: This is from ${filename}, containing chat logs, tool usage, todos, and shell commands from a cybersecurity vulnerability management application built with Express.js, SQLite, AG-Grid, and various frontend technologies.

**Content to Analyze**:
\`\`\`
${content}
\`\`\`

**Extract the following JSON structure**:
\`\`\`json
{
  "abstract": "One concise sentence summarizing the main activity/outcome",
  "summary": "2-3 sentences with detailed context, key decisions, and outcomes",
  "entities": {
    "files": ["list of file paths mentioned"],
    "tools": ["list of tools/commands used"],
    "technologies": ["frameworks, libraries, technologies mentioned"],
    "errors": ["specific error messages or issues"],
    "people": ["user", "assistant", or specific names mentioned"]
  },
  "keywords": ["key technical terms and concepts"],
  "problems": [
    {
      "issue": "description of problem",
      "solution": "how it was resolved",
      "severity": "low|medium|high|critical"
    }
  ],
  "achievements": ["things completed or implemented"],
  "decisions": ["important technical decisions made"],
  "context": {
    "session_type": "bug_fix|feature_development|configuration|research|testing",
    "complexity": "simple|moderate|complex",
    "domain": "frontend|backend|database|infrastructure|security"
  },
  "timestamp_range": "approximate time range if determinable"
}
\`\`\`

**Guidelines**:
- Focus on technical content, ignore conversational fluff
- Extract specific file paths, error messages, and tool names
- Identify problem-solution pairs clearly
- Classify session type and complexity accurately
- Keep abstract under 15 words, summary under 50 words
- Use empty arrays [] for missing data, not null

Return only the JSON, no other text.`;
    }

    /**
     * Process content with Gemini
     */
    async processWithGemini(content, filename) {
        const prompt = this.generateExtractionPrompt(content, filename);

        const result = await this.rateLimiter.executeWithLimit(async () => {
            const response = await this.geminiModel.generateContent(prompt);
            const text = response.response.text();

            // Estimate tokens used (rough approximation)
            this.stats.totalTokensUsed += Math.ceil((prompt.length + text.length) / 4);

            // Parse JSON response
            try {
                const cleanText = text.replace(/```json\s*/, "").replace(/```\s*$/, "").trim();
                return JSON.parse(cleanText);
            } catch (parseError) {
                console.warn(`🦉 JSON parse warning for ${filename}: ${parseError.message}`);
                // Return fallback structure
                return {
                    abstract: `Processing content from ${filename}`,
                    summary: "Content processed but structure extraction failed",
                    entities: { files: [], tools: [], technologies: [], errors: [], people: [] },
                    keywords: [],
                    problems: [],
                    achievements: [],
                    decisions: [],
                    context: { session_type: "unknown", complexity: "unknown", domain: "unknown" },
                    timestamp_range: null,
                    extraction_error: parseError.message
                };
            }
        }, `Gemini processing for ${filename}`);

        return result;
    }

    /**
     * Smart chunking for semantic processing
     */
    smartChunk(content, maxChunkSize = 6000) {
        const chunks = [];
        const lines = content.split("\n");
        let currentChunk = "";
        let currentSize = 0;

        for (const line of lines) {
            const lineSize = Buffer.byteLength(line, "utf8");

            // Check if adding this line would exceed chunk size
            if (currentSize + lineSize > maxChunkSize && currentChunk.length > 0) {
                // Try to find a good break point (conversation boundary)
                const breakPoint = this.findConversationBreak(currentChunk);
                if (breakPoint > currentChunk.length * 0.5) {
                    // Good break point found
                    chunks.push({
                        text: currentChunk.substring(0, breakPoint).trim(),
                        size: Buffer.byteLength(currentChunk.substring(0, breakPoint), "utf8")
                    });
                    currentChunk = currentChunk.substring(breakPoint) + "\n" + line;
                    currentSize = Buffer.byteLength(currentChunk, "utf8");
                } else {
                    // No good break point, use current chunk
                    chunks.push({
                        text: currentChunk.trim(),
                        size: currentSize
                    });
                    currentChunk = line;
                    currentSize = lineSize;
                }
            } else {
                currentChunk += line + "\n";
                currentSize += lineSize + 1;
            }
        }

        // Add final chunk
        if (currentChunk.trim().length > 0) {
            chunks.push({
                text: currentChunk.trim(),
                size: currentSize
            });
        }

        return chunks;
    }

    /**
     * Find good conversation break points
     */
    findConversationBreak(text) {
        const breakPatterns = [
            /\n---\n/g,  // Markdown dividers
            /\n### \d{2}:\d{2}:\d{2} - /g,  // Timestamp headers
            /\n\*\*assistant\*\*:/g,  // Assistant responses
            /\n\*\*user\*\*:/g,       // User messages
        ];

        let bestBreak = -1;
        let bestScore = 0;

        for (const pattern of breakPatterns) {
            const matches = Array.from(text.matchAll(pattern));
            for (const match of matches) {
                const position = match.index;
                // Prefer breaks that are 60-80% through the text
                const relativePosition = position / text.length;
                if (relativePosition > 0.6 && relativePosition < 0.8) {
                    const score = 1 - Math.abs(0.7 - relativePosition);
                    if (score > bestScore) {
                        bestScore = score;
                        bestBreak = position;
                    }
                }
            }
        }

        return bestBreak > 0 ? bestBreak : text.length * 0.7;
    }

    /**
     * Process a single unified archive file
     */
    async processFile(filePath) {
        const filename = path.basename(filePath, ".md");
        const outputFile = path.join(this.semanticCachePath, `${filename}.json`);

        console.log(`🧠 Processing: ${filename}`);

        try {
            // Read content
            const content = await fs.readFile(filePath, "utf8");

            // Chunk content intelligently
            const chunks = this.smartChunk(content);
            console.log(`   Chunked into ${chunks.length} segments`);
            this.stats.totalChunks += chunks.length;

            // Process each chunk with Gemini
            const semanticData = {
                filename: filename,
                sourceFile: filePath,
                created: new Date().toISOString(),
                model: this.model,
                totalChunks: chunks.length,
                chunks: []
            };

            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                console.log(`   Processing chunk ${i + 1}/${chunks.length} (${chunk.size} bytes)`);

                try {
                    const semanticResult = await this.processWithGemini(chunk.text, `${filename}-chunk-${i + 1}`);

                    semanticData.chunks.push({
                        chunkIndex: i,
                        textSize: chunk.size,
                        textHash: crypto.createHash("md5").update(chunk.text).digest("hex"),
                        originalText: chunk.text, // Keep for debugging/fallback
                        semantic: semanticResult,
                        metadata: {
                            processed: new Date().toISOString(),
                            model: this.model
                        }
                    });

                    this.stats.processedChunks++;
                } catch (error) {
                    console.error(`🧠 Error processing chunk ${i + 1}: ${error.message}`);

                    // Add failed chunk with fallback data
                    semanticData.chunks.push({
                        chunkIndex: i,
                        textSize: chunk.size,
                        textHash: crypto.createHash("md5").update(chunk.text).digest("hex"),
                        originalText: chunk.text,
                        semantic: {
                            abstract: `Failed to process chunk ${i + 1} from ${filename}`,
                            summary: "Processing failed, falling back to original text",
                            entities: { files: [], tools: [], technologies: [], errors: [], people: [] },
                            keywords: [],
                            problems: [],
                            achievements: [],
                            decisions: [],
                            context: { session_type: "unknown", complexity: "unknown", domain: "unknown" },
                            timestamp_range: null,
                            processing_error: error.message
                        },
                        metadata: {
                            processed: new Date().toISOString(),
                            error: error.message
                        }
                    });

                    this.stats.failedChunks++;
                }
            }

            // Save semantic data atomically
            const tempFile = outputFile + ".tmp";
            await fs.writeFile(tempFile, JSON.stringify(semanticData, null, 2), "utf8");
            await fs.rename(tempFile, outputFile);

            console.log(`   ✅ Generated semantic data for ${semanticData.chunks.length} chunks`);

            return {
                filename: filename,
                chunks: chunks.length,
                processed: semanticData.chunks.length,
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
     * Process all unified archives
     */
    async processAllFiles() {
        console.log("🧠 Athena's wisdom extraction begins... Analyzing conversations with Gemini...");

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
            failed: 0
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
            } else {
                results.failed++;
            }

            // Save state after each file
            await this.saveProcessedState();

            // Print progress every 10 files
            if ((results.processed + results.failed) % 10 === 0) {
                this.printProgress(results, unifiedFiles.length);
            }
        }

        console.log("\n🧠 Semantic processing complete!");
        this.printFinalStats(results);
    }

    /**
     * Print processing progress
     */
    printProgress(results, totalFiles) {
        const completed = results.processed + results.failed + results.skipped;
        const percentage = ((completed / totalFiles) * 100).toFixed(1);
        const eta = this.rateLimiter.estimateTimeRemaining(totalFiles - completed);

        console.log(`\n📊 Progress: ${completed}/${totalFiles} (${percentage}%)`);
        console.log(`   ✅ Processed: ${results.processed}`);
        console.log(`   ⚡ Skipped: ${results.skipped}`);
        console.log(`   ❌ Failed: ${results.failed}`);
        console.log(`   ⏱️  ETA: ${this.rateLimiter.formatTimeEstimate(eta)}`);

        this.rateLimiter.printStats();
    }

    /**
     * Print final statistics
     */
    printFinalStats(results) {
        const runtimeMs = Date.now() - this.stats.startTime;
        const runtimeMin = runtimeMs / 60000;
        const costEstimate = (this.stats.totalTokensUsed / 1000000) * 0.075; // $0.075 per 1M tokens

        console.log("\n📊 Final Results:");
        console.log(`   📄 Files processed: ${results.processed}`);
        console.log(`   📝 Total chunks: ${this.stats.totalChunks}`);
        console.log(`   ✅ Successful chunks: ${this.stats.processedChunks}`);
        console.log(`   ❌ Failed chunks: ${this.stats.failedChunks}`);
        console.log(`   🪙 Tokens used: ${this.stats.totalTokensUsed.toLocaleString()}`);
        console.log(`   💰 Estimated cost: $${costEstimate.toFixed(3)}`);
        console.log(`   ⏰ Runtime: ${runtimeMin.toFixed(1)} minutes`);
        console.log(`   📁 Cache location: ${this.semanticCachePath}`);

        this.rateLimiter.printStats();
    }

    /**
     * Show statistics for existing cache
     */
    async showCacheStats() {
        try {
            const files = await fs.readdir(this.semanticCachePath);
            const semanticFiles = files.filter(f => f.endsWith(".json"));

            let totalChunks = 0;
            let totalProcessed = 0;
            let totalTokensEstimate = 0;

            for (const file of semanticFiles) {
                try {
                    const filePath = path.join(this.semanticCachePath, file);
                    const data = await fs.readFile(filePath, "utf8");
                    const semanticData = JSON.parse(data);

                    totalChunks += semanticData.totalChunks || 0;
                    totalProcessed += semanticData.chunks?.length || 0;

                    // Estimate tokens from content
                    for (const chunk of semanticData.chunks || []) {
                        if (chunk.originalText) {
                            totalTokensEstimate += Math.ceil(chunk.originalText.length / 4);
                        }
                    }
                } catch (_error) {
                    console.log(`Warning: Could not read ${file}`);
                }
            }

            console.log("\n🧠 Semantic Cache Statistics:");
            console.log(`📄 Cached files: ${semanticFiles.length}`);
            console.log(`📝 Total chunks: ${totalChunks}`);
            console.log(`✅ Processed chunks: ${totalProcessed}`);
            console.log(`🪙 Estimated tokens: ${totalTokensEstimate.toLocaleString()}`);
            console.log(`💰 Estimated cost: $${(totalTokensEstimate / 1000000 * 0.075).toFixed(3)}`);
            console.log(`📊 Success rate: ${totalChunks > 0 ? (totalProcessed / totalChunks * 100).toFixed(1) : 0}%`);

        } catch (error) {
            console.error("Error generating cache stats:", error.message);
        }
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);

    if (args.includes("--help") || args.includes("-h")) {
        console.log(`
🦉 Athena Semantic Processor

Usage:
  node athena-semantic-processor.js [options]

Options:
  --stats          Show semantic cache statistics
  --clean          Clean semantic processing state
  --help, -h       Show this help message

Examples:
  node athena-semantic-processor.js           # Process all archives
  node athena-semantic-processor.js --stats   # Show statistics
  node athena-semantic-processor.js --clean   # Reset state
        `);
        return;
    }

    if (args.includes("--stats")) {
        const processor = new AthenaSemanticProcessor();
        await processor.showCacheStats();
        return;
    }

    if (args.includes("--clean")) {
        const metadataPath = path.join(process.cwd(), "logs/semantic-metadata");
        const processedFile = path.join(metadataPath, "semantic-processed.json");

        try {
            if (fsSync.existsSync(processedFile)) {
                await fs.unlink(processedFile);
                console.log("🧠 Cleaned semantic processing state");
            }
        } catch (error) {
            console.error("🧠 Error cleaning state:", error.message);
        }
        return;
    }

    // Main processing
    const processor = new AthenaSemanticProcessor();

    try {
        await processor.processAllFiles();
        console.log("\n🎖️ Mission accomplished! Semantic wisdom extracted and cached.");
    } catch (error) {
        console.error("🧠 Semantic processing failed:", error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { AthenaSemanticProcessor };