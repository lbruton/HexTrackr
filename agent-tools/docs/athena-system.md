# 🦉 Athena Memory System Documentation

**Version**: 2.0.0
**Author**: Claude & HexTrackr Team
**Purpose**: Extract, preserve, and search Claude Code conversation history

## Overview

Athena is a three-tier memory system that processes Claude Code conversation logs to extract wisdom, generate searchable embeddings, and preserve institutional knowledge.

### Three-Tier Architecture

1. **Memento Catalog**: Lightweight entity references in knowledge graph
2. **Markdown Archives**: Human-readable conversation preservation
3. **Vector Embeddings**: Semantic search capabilities (OpenAI or Ollama)

## Directory Structure

```
/logs/
├── sessions/       # Human-readable markdown files (YYYY-MM-DD-HH-MM-SS-title.md)
├── embeddings/     # Vector embeddings JSON (YYYY-MM-DD-HH-MM-SS-title.json)
└── metadata/       # Processing state and configuration
    ├── processed-sessions.json    # Track processed files
    └── memento-entities.json      # Entities for manual import

/agent-tools/
├── athena-extractor.js    # Main extraction pipeline
├── athena-embeddings.js   # Embedding generation service
├── athena-search.js       # Batch processing and search
└── docs/                  # This documentation
```

## Tools

### 1. athena-extractor.js

Processes raw JSONL conversation logs from Claude Code.

**Features**:

- Timestamp-based naming (YYYY-MM-DD-HH-MM-SS)
- Wisdom extraction (bugs, features, decisions, insights)
- Memento entity generation
- Human-readable markdown generation

**Usage**:

```bash
# Process all unprocessed conversations
node agent-tools/athena-extractor.js

# Clean restart (clear processing state)
node agent-tools/athena-extractor.js clean
```

**Output**:

- Creates MD files in `/logs/sessions/`
- Generates Memento entities in `/logs/metadata/memento-entities.json`
- Tracks processed files in `/logs/metadata/processed-sessions.json`

### 2. athena-embeddings.js

Generates vector embeddings for semantic search.

**Providers**:

- **OpenAI**: text-embedding-3-large (3072 dimensions) - Superior quality
- **Ollama**: mxbai-embed-large (1024 dimensions) - Free, local

**Configuration** (.env):

```env
# Provider selection
ATHENA_EMBEDDING_PROVIDER=openai    # or ollama (default)

# OpenAI configuration
OPENAI_API_KEY=sk-...
OPENAI_EMBEDDING_MODEL=text-embedding-3-large

# Ollama configuration
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=mxbai-embed-large
```

**Usage**:

```bash
# Test connection
node agent-tools/athena-embeddings.js test --openai
node agent-tools/athena-embeddings.js test --ollama

# Search embeddings
node agent-tools/athena-embeddings.js search "authentication bug"

# Show statistics
node agent-tools/athena-embeddings.js stats
```

### 3. athena-search.js

Batch processes markdown files and provides search interface.

**Features**:

- Batch embedding generation
- Semantic search across all conversations
- Progress tracking and statistics
- Provider selection (OpenAI/Ollama)

**Usage**:

```bash
# Process all unprocessed files
node agent-tools/athena-search.js all --openai

# Process limited number of files
node agent-tools/athena-search.js all 5 --ollama

# Process single file
node agent-tools/athena-search.js single 2025-01-12-14-30-00-dark-mode.md

# Search across all embeddings
node agent-tools/athena-search.js search "dark mode implementation"

# Show database statistics
node agent-tools/athena-search.js stats
```

## Workflow

### Initial Setup

1. **Configure Environment**:

   ```bash
   # Create .env file
   cp .env.example .env

   # Add your OpenAI key (optional)
   ATHENA_EMBEDDING_PROVIDER=openai
   OPENAI_API_KEY=sk-your-key-here
   ```

2. **Extract Conversations**:

   ```bash
   # Process JSONL files from Claude Code
   node agent-tools/athena-extractor.js
   ```

3. **Generate Embeddings**:

   ```bash
   # Process all markdown files
   node agent-tools/athena-search.js all --openai
   ```

### Daily Usage

1. **Extract New Conversations**:

   ```bash
   node agent-tools/athena-extractor.js
   ```

2. **Generate Embeddings for New Files**:

   ```bash
   node agent-tools/athena-search.js all
   ```

3. **Search Historical Knowledge**:

   ```bash
   node agent-tools/athena-search.js search "your search query"
   ```

## Memento Integration

Athena creates Memento entities with the following structure:

```javascript
{
  name: "ATHENA:SESSION:YYYY-MM-DD-HH-MM-SS-title",
  entityType: "KNOWLEDGE:EXTRACTED:CONVERSATION",
  observations: [
    "TIMESTAMP: 2025-01-12T19:30:00.000Z",           // ISO 8601 timestamp
    "ABSTRACT: Extracted 3 bugs, 2 features...",     // One-line summary
    "SUMMARY: Comprehensive session analysis...",     // Detailed description
    "MD_PATH: /logs/sessions/filename.md",           // Markdown file path
    "EMBED_PATH: /logs/embeddings/filename.json",    // Embedding file path
    "BUG_FIXES: 3",                                  // Statistics
    "FEATURES: 2",
    "DECISIONS: 1",
    "CODE_FRAGMENTS: 5",
    "FILES_MODIFIED: server.js, auth.js",
    "🦉 EXTRACTED_BY: Athena, Goddess of Wisdom"
  ]
}
```

### Manual Import to Memento

After extraction, import entities to Memento:

```javascript
// Load generated entities
const entities = require('./logs/metadata/memento-entities.json');

// Import via MCP tool
await mcp__memento__create_entities({ entities });
```

## Search Capabilities

### Semantic Search

Search uses cosine similarity to find relevant conversation chunks:

```bash
# Find authentication-related discussions
node agent-tools/athena-search.js search "authentication JWT tokens"

# Find dark mode implementation details
node agent-tools/athena-search.js search "dark mode theme system"

# Find security patterns
node agent-tools/athena-search.js search "XSS prevention security"
```

### Search Results

Results include:

- Similarity score (0-100%)
- Session ID and timestamp
- Text snippet from conversation
- Metadata (turn index, chunk info)

### Similarity Thresholds

- **>70%**: Highly relevant, direct match
- **50-70%**: Relevant, related concepts
- **40-50%**: Potentially relevant, broader context
- **<40%**: Low relevance (filtered by default)

## Performance Considerations

### Chunking Strategy

- **Chunk Size**: 2048 characters (optimal for context)
- **Overlap**: 400 characters (maintains continuity)
- **Smart Splitting**: Preserves conversation turns when possible

### Processing Speed

- **Ollama**: ~2-3 seconds per embedding (local)
- **OpenAI**: ~0.5-1 second per embedding (API)
- **Batch Delay**: 500ms between files (prevent overload)

### Storage Requirements

- **Markdown**: ~10-50 KB per session
- **Embeddings**: ~100-500 KB per session (JSON)
- **Total**: ~1-5 MB per 10 conversations

## Troubleshooting

### Common Issues

1. **Ollama Not Running**:

   ```bash
   # Start Ollama server
   ollama serve

   # Pull embedding model
   ollama pull mxbai-embed-large
   ```

2. **OpenAI API Key Missing**:

   ```bash
   # Add to .env file
   OPENAI_API_KEY=sk-your-key-here
   ```

3. **Files Already Processed**:

   ```bash
   # Clean restart
   node agent-tools/athena-extractor.js clean
   ```

4. **Search Returns No Results**:
   - Check if embeddings exist in `/logs/embeddings/`
   - Verify provider consistency (don't mix OpenAI/Ollama embeddings)
   - Lower similarity threshold in search

## Best Practices

1. **Consistent Provider**: Use same provider for all embeddings
2. **Regular Processing**: Extract and embed new conversations daily
3. **Backup Embeddings**: Store `/logs/` directory in version control
4. **Memory Cleanup**: Periodically review and prune old sessions

## Future Enhancements

- [ ] Automatic Memento import after extraction
- [ ] Cross-provider embedding compatibility
- [ ] Conversation threading and linking
- [ ] Real-time embedding generation
- [ ] Web UI for search interface
- [ ] Clustering and topic modeling
- [ ] Automatic wisdom summarization

## Support

For issues or questions:

1. Check logs in `/logs/metadata/` for processing errors
2. Verify provider configuration in `.env`
3. Ensure Claude Code logs exist in `~/.claude/projects/`
4. Consult Athena agent configuration in `.claude/agents/athena.md`

---

*🦉 "From chaos, wisdom. From conversations, knowledge eternal."*
