#!/usr/bin/env node
/* eslint-env node */
/**
 * Memory Scribe for HexTrackr
 * Implements rolling context and log retrieval inspired by rMemory architecture
 * 
 * Based on original design from original-memory-build-pre-memento:
 * - Hybrid recall: Symbolic queries + vector search + raw transcripts
 * - Protocol memory: Rules enforced outside LLM
 * - Cross-project continuity with confidence scoring
 */

const fs = require("fs").promises;
const path = require("path");

class MemoryScribe {
  constructor(options = {}) {
    this.dataDir = options.dataDir || path.join(__dirname, "../data/memory-scribe");
    this.maxContextTokens = options.maxContextTokens || 8000;
    this.chunkSize = options.chunkSize || 1000;
    this.chunkOverlap = options.chunkOverlap || 150;
    
    // Initialize data directories
    this.init();
  }

  async init() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      await fs.mkdir(path.join(this.dataDir, "conversations"), { recursive: true });
      await fs.mkdir(path.join(this.dataDir, "context-patterns"), { recursive: true });
      await fs.mkdir(path.join(this.dataDir, "protocols"), { recursive: true });
      
      console.log("🧠 Memory Scribe initialized");
    } catch (error) {
      console.error("Failed to initialize Memory Scribe:", error);
    }
  }

  /**
   * Process VS Code chat logs into structured memory
   */
  async processConversation(conversation) {
    const timestamp = Date.now();
    const conversationId = `conv_${timestamp}`;
    
    // Extract structured data from conversation
    const structured = await this.extractStructuredData(conversation);
    
    // Create conversation chunks for context retrieval
    const chunks = this.createChunks(conversation.messages);
    
    // Store with metadata
    const conversationData = {
      id: conversationId,
      timestamp,
      structured,
      chunks,
      metadata: {
        project: conversation.project || "HexTrackr",
        repo: conversation.repo,
        branch: conversation.branch,
        files: conversation.files || [],
        confidence: this.calculateConfidence(structured)
      }
    };

    await this.storeConversation(conversationData);
    return conversationId;
  }

  /**
   * Extract structured data using heuristics + LLM validation
   * Implements the two-stage filter from original design
   */
  async extractStructuredData(conversation) {
    const structured = {
      todos: [],
      decisions: [],
      patterns: [],
      issues: []
    };

    for (const message of conversation.messages) {
      // Stage 1: Cheap regex/heuristics
      const candidates = this.extractCandidates(message);
      
      // Stage 2: LLM validation (using Ollama if available)
      for (const candidate of candidates) {
        const validated = await this.validateCandidate(candidate);
        if (validated.confidence > 0.6) {
          structured[validated.type].push({
            ...validated,
            source: {
              messageId: message.id,
              timestamp: message.timestamp,
              span: candidate.span
            }
          });
        }
      }
    }

    return structured;
  }

  /**
   * Stage 1: Extract candidates using heuristics
   */
  extractCandidates(message) {
    const candidates = [];
    const text = message.content;

    // TODO patterns
    const todoRegex = /(?:TODO|FIXME|NOTE|HACK|BUG):\s*(.+)/gi;
    let match;
    while ((match = todoRegex.exec(text)) !== null) {
      candidates.push({
        type: "todo",
        text: match[1],
        span: { start: match.index, end: match.index + match[0].length },
        confidence: 0.8
      });
    }

    // Decision patterns
    const decisionRegex = /(?:decided|chosen|selected|going with|settled on)\s+(.+)/gi;
    while ((match = decisionRegex.exec(text)) !== null) {
      candidates.push({
        type: "decision",
        text: match[1],
        span: { start: match.index, end: match.index + match[0].length },
        confidence: 0.7
      });
    }

    // Issue patterns
    const issueRegex = /(?:error|bug|issue|problem|fail):\s*(.+)/gi;
    while ((match = issueRegex.exec(text)) !== null) {
      candidates.push({
        type: "issue",
        text: match[1],
        span: { start: match.index, end: match.index + match[0].length },
        confidence: 0.7
      });
    }

    return candidates;
  }

  /**
   * Stage 2: LLM validation using Ollama
   */
  async validateCandidate(candidate) {
    // For now, return the candidate with adjusted confidence
    // TODO: Implement Ollama validation when qwen2.5-coder is available
    return {
      ...candidate,
      confidence: Math.min(candidate.confidence + 0.1, 1.0),
      validated: false // Mark as not yet LLM-validated
    };
  }

  /**
   * Create conversation chunks for retrieval
   */
  createChunks(messages) {
    const chunks = [];
    let currentChunk = "";
    let chunkTokens = 0;

    for (const message of messages) {
      const messageText = `[${message.role}]: ${message.content}\n`;
      const messageTokens = Math.ceil(messageText.length / 4); // Rough token estimate

      if (chunkTokens + messageTokens > this.chunkSize && currentChunk) {
        // Store current chunk
        chunks.push({
          id: `chunk_${chunks.length}`,
          content: currentChunk,
          tokens: chunkTokens,
          messageIds: this.extractMessageIds(currentChunk)
        });

        // Start new chunk with overlap
        const overlapText = this.getOverlapText(currentChunk, this.chunkOverlap);
        currentChunk = overlapText + messageText;
        chunkTokens = Math.ceil(currentChunk.length / 4);
      } else {
        currentChunk += messageText;
        chunkTokens += messageTokens;
      }
    }

    // Store final chunk
    if (currentChunk) {
      chunks.push({
        id: `chunk_${chunks.length}`,
        content: currentChunk,
        tokens: chunkTokens,
        messageIds: this.extractMessageIds(currentChunk)
      });
    }

    return chunks;
  }

  /**
   * Calculate confidence score for structured data
   */
  calculateConfidence(structured) {
    let totalItems = 0;
    let validatedItems = 0;

    for (const type of Object.keys(structured)) {
      for (const item of structured[type]) {
        totalItems++;
        if (item.validated) {validatedItems++;}
      }
    }

    return totalItems > 0 ? validatedItems / totalItems : 1.0;
  }

  /**
   * Store conversation data to file system
   */
  async storeConversation(conversationData) {
    const filePath = path.join(
      this.dataDir, 
      "conversations", 
      `${conversationData.id}.json`
    );
    
    await fs.writeFile(filePath, JSON.stringify(conversationData, null, 2));
    console.log(`💾 Stored conversation: ${conversationData.id}`);
  }

  /**
   * Search conversations by filters
   */
  async searchConversations(filters = {}) {
    const conversationsDir = path.join(this.dataDir, "conversations");
    
    try {
      const files = await fs.readdir(conversationsDir);
      const results = [];

      for (const file of files) {
        if (!file.endsWith(".json")) {continue;}

        const filePath = path.join(conversationsDir, file);
        const data = JSON.parse(await fs.readFile(filePath, "utf8"));

        // Apply filters
        if (this.matchesFilters(data, filters)) {
          results.push({
            id: data.id,
            timestamp: data.timestamp,
            metadata: data.metadata,
            structured: data.structured
          });
        }
      }

      // Sort by timestamp (newest first)
      return results.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error("Search failed:", error);
      return [];
    }
  }

  /**
   * Get full conversation context by ID
   */
  async getFullContext(conversationId) {
    const filePath = path.join(
      this.dataDir, 
      "conversations", 
      `${conversationId}.json`
    );
    
    try {
      const data = JSON.parse(await fs.readFile(filePath, "utf8"));
      return data;
    } catch (error) {
      console.error(`Failed to get context for ${conversationId}:`, error);
      return null;
    }
  }

  // Helper methods
  extractMessageIds(text) {
    // Extract message IDs from chunk content
    return []; // Placeholder
  }

  getOverlapText(text, overlapTokens) {
    // Get last N tokens for overlap
    const words = text.split(" ");
    const overlapWords = Math.ceil(overlapTokens / 4);
    return words.slice(-overlapWords).join(" ");
  }

  matchesFilters(data, filters) {
    if (filters.project && data.metadata.project !== filters.project) {return false;}
    if (filters.repo && data.metadata.repo !== filters.repo) {return false;}
    if (filters.branch && data.metadata.branch !== filters.branch) {return false;}
    if (filters.files && !filters.files.some(f => data.metadata.files.includes(f))) {return false;}
    if (filters.minConfidence && data.metadata.confidence < filters.minConfidence) {return false;}
    
    return true;
  }
}

module.exports = MemoryScribe;

// CLI interface
if (require.main === module) {
  async function main() {
    const scribe = new MemoryScribe();
    
    // Example conversation processing
    const exampleConversation = {
      project: "HexTrackr",
      repo: "git@github.com:Lonnie-Bruton/HexTrackr.git",
      branch: "copilot", 
      files: ["tickets.html", "scripts/pages/tickets.js"],
      messages: [
        {
          id: "msg1",
          role: "user",
          content: "TODO: Fix the ticket filtering bug in tickets.html",
          timestamp: Date.now() - 1000
        },
        {
          id: "msg2", 
          role: "assistant",
          content: "I'll help you fix the filtering. First, let me check the current implementation.",
          timestamp: Date.now()
        }
      ]
    };

    console.log("🧪 Testing Memory Scribe...");
    const convId = await scribe.processConversation(exampleConversation);
    
    console.log("🔍 Searching conversations...");
    const results = await scribe.searchConversations({ project: "HexTrackr" });
    console.log(`Found ${results.length} conversations`);
    
    console.log("📖 Getting full context...");
    const context = await scribe.getFullContext(convId);
    console.log(`Context has ${context.chunks.length} chunks`);
  }

  main().catch(console.error);
}
