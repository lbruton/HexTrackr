# Memento-Claude Integration Implementation Guide

**Date:** 2025-08-29  
**Purpose:** Implementation roadmap for Claude embedding integration inspired by rMemory architecture  
**Status:** Planning Phase

## Overview

This guide provides step-by-step instructions for implementing Claude API embeddings in memento-mcp, leveraging proven patterns from the rMemory project architecture.

## Phase 1: Architecture Analysis

### rMemory Learnings Applied

## Key Insights from `Lonnie-Bruton/rEngine/rMemory/`:

1. **Dual Memory Architecture**
   - Primary: MCP memory system
   - Fallback: Local JSON files (`protocol_memory.json`, search matrices)
   - **Application**: Maintain JSON fallbacks during Claude transition

1. **Search Matrix System**
   - `consolidated-matrix.json` (2.1MB) - comprehensive context mapping
   - `context-matrix.json` (1.1MB) - focused context relationships
   - **Application**: Generate Claude-powered semantic matrices

1. **Protocol-Based Operations**
   - 27 numbered protocols for systematic operations
   - Clear execution sequences and priorities
   - **Application**: Create memory protocols for Claude operations

1. **Agent-Specific Memory**
   - `rAgentMemories/` folder structure
   - Project-specific memory namespaces
   - **Application**: Separate HexTrackr memory namespace

## Phase 2: Claude Provider Implementation

### Step 1: Memento-MCP Configuration

```bash

# Locate memento-mcp configuration

find ~/.config -name "*memento*" 2>/dev/null
find ~/Library -name "*memento*" 2>/dev/null

# Check VS Code MCP settings

code ~/.config/Code/User/settings.json
```

### Step 2: Claude API Setup

```javascript
// Add to memento-mcp config
{
  "embedding_provider": "claude",
  "claude_config": {
    "api_key": "${ANTHROPIC_API_KEY}",
    "model": "claude-3-embedding", // Future model
    "dimensions": 1536,
    "batch_size": 100,
    "rate_limit_ms": 1000
  },
  "fallback_provider": "openai" // Maintain during transition
}
```

### Step 3: Environment Setup

```bash

# Add Claude API key to environment

echo 'export ANTHROPIC_API_KEY="your-claude-api-key"' >> ~/.zshrc
source ~/.zshrc

# Verify VS Code can access environment

code --list-extensions | grep -i copilot
```

## Phase 3: rMemory-Inspired Memory Structure

### Directory Structure

```
HexTrackr/
├── memento-memory/                 # New memory architecture
│   ├── search-matrix/              # Claude-generated matrices
│   │   ├── consolidated-matrix.json
│   │   ├── context-matrix.json
│   │   └── embedding-matrix.json
│   ├── agent-memories/             # Project-specific memories  
│   │   └── hextrackr/
│   │       ├── session-memory.json
│   │       ├── architectural-decisions.json
│   │       └── code-patterns.json
│   ├── protocol-memory.json        # Memory operation protocols
│   ├── embedding-config.json       # Provider configurations
│   └── backup/                     # Automated backups
│       ├── daily/
│       └── session/
└── scripts/
    ├── memento-claude-setup.js     # Setup automation
    ├── search-matrix-generator.js  # Claude matrix generation
    └── memory-sync.js              # Sync between providers
```

### Memory Protocols (rMemory-Inspired)

```json
{
  "memory_protocols": {
    "001": {
      "id": "001-CLAUDE-EMBED-001",
      "title": "Claude Embedding Generation Protocol",
      "description": "Generate embeddings using Claude API with batching and rate limiting",
      "steps": [
        "Check Claude API availability",
        "Batch entities for processing",
        "Generate embeddings with rate limiting", 
        "Store with fallback to JSON",
        "Update search matrix"
      ]
    },
    "002": {
      "id": "002-SEARCH-MATRIX-001", 
      "title": "Claude Search Matrix Generation Protocol",
      "description": "Generate semantic search matrices using Claude analysis",
      "steps": [
        "Analyze all memory entities",
        "Generate semantic relationships",
        "Create consolidated matrix",
        "Store for fast retrieval"
      ]
    },
    "003": {
      "id": "003-MEMORY-SYNC-001",
      "title": "Memory Synchronization Protocol", 
      "description": "Sync between Neo4j, Claude embeddings, and JSON fallbacks",
      "steps": [
        "Check Neo4j connectivity",
        "Sync embeddings to Claude provider",
        "Update JSON fallbacks",
        "Verify data consistency"
      ]
    }
  }
}
```

## Phase 4: Implementation Scripts

### Claude Setup Script

```javascript
// scripts/memento-claude-setup.js
const fs = require('fs');
const path = require('path');

class MementoClaudeSetup {
  constructor() {
    this.workspaceRoot = '/Volumes/DATA/GitHub/HexTrackr';
    this.memoryDir = path.join(this.workspaceRoot, 'memento-memory');
  }

  async setup() {
    console.log('🚀 Setting up Claude embeddings for Memento MCP...');
    
    // Create rMemory-inspired directory structure
    await this.createDirectoryStructure();
    
    // Configure embedding providers
    await this.configureProviders();
    
    // Initialize search matrices
    await this.initializeSearchMatrices();
    
    // Create memory protocols
    await this.createProtocols();
    
    console.log('✅ Claude embedding setup complete!');
  }

  async createDirectoryStructure() {
    const dirs = [
      'memento-memory/search-matrix',
      'memento-memory/agent-memories/hextrackr', 
      'memento-memory/backup/daily',
      'memento-memory/backup/session'
    ];
    
    for (const dir of dirs) {
      const fullPath = path.join(this.workspaceRoot, dir);
      await fs.promises.mkdir(fullPath, { recursive: true });
      console.log(`📁 Created: ${dir}`);
    }
  }

  async configureProviders() {
    const config = {
      embedding_providers: {
        primary: "claude",
        fallback: "openai",
        claude: {
          api_key_env: "ANTHROPIC_API_KEY",
          model: "claude-3-embedding",
          dimensions: 1536,
          batch_size: 100,
          rate_limit_ms: 1000
        },
        openai: {
          api_key_env: "OPENAI_API_KEY", 
          model: "text-embedding-3-small",
          dimensions: 1536
        }
      },
      memory_architecture: "rMemory-inspired",
      search_matrix_enabled: true,
      protocol_based_operations: true
    };
    
    const configPath = path.join(this.memoryDir, 'embedding-config.json');
    await fs.promises.writeFile(configPath, JSON.stringify(config, null, 2));
    console.log('⚙️ Created embedding configuration');
  }

  async initializeSearchMatrices() {
    const matrices = {
      'consolidated-matrix.json': { 
        description: "Comprehensive semantic relationships",
        entities: {},
        relationships: {},
        generated_by: "claude",
        last_updated: new Date().toISOString()
      },
      'context-matrix.json': {
        description: "Focused context relationships", 
        contexts: {},
        patterns: {},
        generated_by: "claude",
        last_updated: new Date().toISOString()
      },
      'embedding-matrix.json': {
        description: "Embedding vectors and metadata",
        embeddings: {},
        dimensions: 1536,
        provider: "claude",
        last_updated: new Date().toISOString()
      }
    };
    
    for (const [filename, content] of Object.entries(matrices)) {
      const filePath = path.join(this.memoryDir, 'search-matrix', filename);
      await fs.promises.writeFile(filePath, JSON.stringify(content, null, 2));
      console.log(`🔍 Created: search-matrix/${filename}`);
    }
  }

  // Additional methods...
}

// Run setup if called directly
if (require.main === module) {
  new MementoClaudeSetup().setup().catch(console.error);
}

module.exports = MementoClaudeSetup;
```

## Phase 5: Testing and Validation

### Test Plan

1. **Claude API Connectivity**

   ```bash

   # Test Claude API access

   curl -H "Authorization: Bearer $ANTHROPIC_API_KEY" \
        -H "Content-Type: application/json" \
        "https://api.anthropic.com/v1/embeddings"
   ```

1. **Embedding Generation**

   ```javascript
   // Test embedding generation
   const testEntity = {
     name: "test-embedding",
     content: "This is a test for Claude embedding generation"
   };
   
   // Generate embedding and verify dimensions
   // Store in Neo4j and JSON fallback
   // Verify retrieval accuracy
   ```

1. **Search Matrix Generation**

   ```javascript
   // Test search matrix creation
   await generateSearchMatrix();
   
   // Verify matrix structure matches rMemory patterns
   // Test semantic search accuracy
   // Compare with OpenAI baseline performance
   ```

## Phase 6: Documentation and Rollout

### Documentation Requirements

1. **Update Memory System Docs**
   - `docs-source/development/memory-system.md`
   - Add rMemory architecture section
   - Document Claude integration process

1. **Create Operation Guides**
   - Daily memory operations using Claude
   - Search matrix generation procedures
   - Troubleshooting embedding issues

1. **Protocol Documentation**
   - Number all memory protocols (001-003+)
   - Clear execution sequences
   - Emergency fallback procedures

### Rollout Strategy

1. **Development Phase** (Current)
   - Implement Claude provider
   - Test with HexTrackr project
   - Validate rMemory patterns

1. **Transition Phase**
   - Parallel operation (Claude + OpenAI)
   - Performance comparison
   - User acceptance testing

1. **Production Phase**
   - Claude as primary provider
   - OpenAI as fallback only
   - Full rMemory architecture active

## Success Metrics

### Technical Metrics

- [ ] Embedding generation latency < 2s per batch
- [ ] Search accuracy >= OpenAI baseline
- [ ] Memory sync reliability > 99%
- [ ] Search matrix generation < 30s

### User Experience Metrics  

- [ ] Context recall accuracy improved
- [ ] Session continuity seamless
- [ ] Memory search relevance enhanced
- [ ] AI-to-AI communication optimized

## Future Enhancements

### Local LLM Integration

- Ollama provider implementation
- Local embedding generation
- Privacy-focused memory processing
- Reduced API costs

### rMemory Ecosystem Integration

- Bridge to rEngine project
- Shared protocol compatibility
- Cross-project memory sharing
- Advanced search capabilities

---

## Next Steps:

1. Run Phase 1 architecture analysis
2. Implement Claude provider setup
3. Create rMemory-inspired directory structure
4. Test embedding generation pipeline
5. Document lessons learned for future local LLM expansion
