# 🦉 Athena Agent Capabilities

## Overview

Athena is the Goddess of Wisdom and Keeper of Institutional Memory for HexTrackr. She processes Claude Code conversation logs to extract, preserve, and retrieve organizational knowledge.

## Core Capabilities

### 1. **Wisdom Extraction**

- Processes JSONL conversation logs from Claude Code
- Identifies bugs, solutions, decisions, and insights
- Generates human-readable markdown summaries
- Creates structured Memento entities for knowledge graph

### 2. **Semantic Search**

- Vector embeddings for deep semantic search
- Supports OpenAI (text-embedding-3-large) or Ollama (mxbai-embed-large)
- Finds conceptually related conversations
- Identifies patterns across multiple sessions

### 3. **Knowledge Preservation**

Triple-memory architecture ensures nothing is lost:

- **Memento Entities**: Lightweight catalog in knowledge graph
- **Markdown Archives**: Full conversation preservation
- **Vector Embeddings**: Semantic search capabilities

## When to Invoke Athena

### Direct Invocation

Use Athena when you need to:

- Extract wisdom from new conversation logs
- Search for past solutions or patterns
- Understand historical context of decisions
- Find similar problems solved before

### Automatic Workflows

Athena should be invoked:

- After significant coding sessions (to preserve knowledge)
- Before starting work on known problems (to find past solutions)
- During debugging (to find similar issues)
- For architectural decisions (to understand past choices)

## Available Commands

### `/athena-extract`

Processes conversation logs and extracts wisdom:

```bash
# Process new conversations
/athena-extract

# Clean restart
/athena-extract clean

# Use OpenAI embeddings
/athena-extract --provider openai
```

### `/athena-search "[query]"`

Searches accumulated knowledge:

```bash
# Search for authentication patterns
/athena-search "authentication JWT"

# Find dark mode implementation
/athena-search "dark mode theme"

# Search with specific provider
/athena-search "CSV import" --provider openai
```

## Tool Locations

All Athena tools are in `/agent-tools/`:

- `athena-extractor.js` - Processes JSONL files
- `athena-embeddings.js` - Generates vectors
- `athena-search.js` - Batch processing and search

Output stored in `/logs/`:

- `/logs/sessions/` - Markdown files
- `/logs/embeddings/` - Vector embeddings
- `/logs/metadata/` - Processing state

## Configuration

### Environment Variables (.env)

```env
# Embedding provider (openai or ollama)
ATHENA_EMBEDDING_PROVIDER=ollama

# OpenAI configuration
OPENAI_API_KEY=sk-...
OPENAI_EMBEDDING_MODEL=text-embedding-3-large

# Ollama configuration
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=mxbai-embed-large

# File paths
ATHENA_LOGS_DIR=logs
ATHENA_CLAUDE_LOGS_PATH=~/.claude/projects/-Volumes-DATA-GitHub-HexTrackr
```

## Workflow Examples

### Daily Knowledge Extraction

```bash
# Morning: Extract overnight conversations
/athena-extract

# Generate embeddings for search
node agent-tools/athena-search.js all

# Search for relevant context before starting work
/athena-search "current feature area"
```

### Problem-Solving Workflow

```bash
# Search for similar problems
/athena-search "error message or symptom"

# If found, review the solution
# If not found, solve and then extract
/athena-extract
```

### Knowledge Migration

```bash
# When switching embedding providers
/athena-extract clean
node agent-tools/athena-search.js all --openai
```

## File Naming Convention

All files use timestamp-based naming:

```
YYYY-MM-DD-HH-MM-SS-title
```

Example:

```
2025-01-12-14-30-45-dark-mode-implementation.md
2025-01-12-14-30-45-dark-mode-implementation.json
```

## Search Result Interpretation

### Similarity Scores

- **>70%**: Direct match, highly relevant
- **50-70%**: Related concepts, useful context
- **40-50%**: Potentially relevant
- **<40%**: Low relevance (usually filtered)

### Result Structure

```
Session: 2025-01-12-14-30-45
Similarity: 78%
Text: [Relevant excerpt]
Metadata: [Turn index, chunk info]
```

## Best Practices

1. **Regular Extraction**: Run `/athena-extract` after significant work sessions
2. **Consistent Provider**: Use same embedding provider for all content
3. **Meaningful Queries**: Use specific technical terms for better search results
4. **Review Archives**: Periodically check `/logs/sessions/` for knowledge gaps
5. **Clean Restarts**: Use `clean` option when changing configurations

## Troubleshooting

### Common Issues

**Ollama not running**:

```bash
ollama serve
ollama pull mxbai-embed-large
```

**OpenAI key missing**:
Add to `.env`: `OPENAI_API_KEY=sk-...`

**No search results**:

- Check if embeddings exist in `/logs/embeddings/`
- Verify provider consistency
- Try broader search terms

## Integration with Other Agents

Athena works with:

- **Memento**: Stores extracted knowledge in graph
- **Other Agents**: Can query Athena for historical context
- **Commands**: Provides `/athena-extract` and `/athena-search`

## Security & Restrictions

When invoked as an agent, Athena has:

- **Write access**: Only to `/logs/` and `/agent-tools/docs/`
- **Bash access**: Only to run athena tools
- **MCP access**: Only Memento tools for knowledge graph
- **Read access**: Conversation logs and archives

---

*"From chaos, wisdom. From conversations, knowledge eternal." - Athena* 🦉
