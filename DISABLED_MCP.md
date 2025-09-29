# DISABLED_MCP.md

This file contains configuration snippets for MCP servers that have been disabled but may need to be quickly re-enabled.

## code-indexer-ollama

**Purpose**: Local code indexing using Ollama embeddings (no API keys required)

**When to use**:
- When OpenAI API is down or rate limited
- For offline/local-only development
- When you want to avoid API costs

### code-indexer-ollama Configuration

Add this to `~/Library/Application Support/Claude/claude_desktop_config.json` under `mcpServers`:

```json
"code-indexer-ollama": {
  "command": "npx",
  "args": [
    "-y",
    "code-indexer-ollama"
  ],
  "env": {
    "OLLAMA_HOST": "http://localhost:11434"
  }
}
```

### code-indexer-ollama Quick Swap

#### To Enable code-indexer-ollama (and disable claude-context):

1. Open Claude desktop config:
   ```bash
   open ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

2. Comment out or remove the `claude-context` section

3. Add the `code-indexer-ollama` section from above

4. Restart Claude Desktop

#### To Re-enable claude-context:

1. Remove the `code-indexer-ollama` section

2. Ensure `claude-context` section exists with your OpenAI API key:
   ```json
   "claude-context": {
     "command": "npx",
     "args": [
       "-y",
       "@zilliz/claude-context-mcp@latest"
     ],
     "env": {
       "OPENAI_API_KEY": "your-openai-api-key",
       "MILVUS_TOKEN": "your-milvus-token"
     }
   }
   ```

3. Restart Claude Desktop

### code-indexer-ollama vs claude-context

| Feature | code-indexer-ollama | claude-context |
|---------|-------------------|----------------|
| **Embeddings** | Local Ollama | OpenAI API |
| **Cost** | Free (local) | API usage fees |
| **Speed** | Depends on local hardware | Generally faster |
| **Quality** | Good | Excellent |
| **Offline** | Yes | No |
| **Setup** | Requires Ollama running | Requires API keys |

### code-indexer-ollama Usage Notes

Both MCPs provide the same functions:
- `index_codebase`: Index a directory for semantic search
- `search_code`: Search indexed code semantically
- `clear_index`: Clear the search index
- `get_indexing_status`: Check indexing progress

The main difference is the embedding model used for semantic search.

### Troubleshooting

If code-indexer-ollama isn't working:
1. Ensure Ollama is running: `ollama serve`
2. Check you have an embedding model: `ollama pull nomic-embed-text`
3. Verify the host is correct: `http://localhost:11434`

### Other Disabled MCPs

Add additional MCP configurations here as needed when temporarily disabling them.

---

## @iachilles/memento

**Purpose**: Alternative Memento implementation with local SQLite or Neo4j support

**When to use**:
- When @gannonh/memento-mcp has issues
- For testing with local SQLite database
- When you need a different Memento implementation

### @iachilles/memento Configuration

Add this to your Claude config file under `mcpServers`:

```json
"memento": {
  "command": "npx",
  "args": [
    "@iachilles/memento@latest"
  ],
  "env": {
    "MEMORY_DB_PATH": "/Volumes/DATA/GitHub/HexTrackr/memento/memory.db",
    "OPENAI_API_KEY": "your-openai-api-key",
    "NEO4J_URI": "bolt://192.168.1.80:7687",
    "NEO4J_USERNAME": "neo4j",
    "NEO4J_PASSWORD": "MementoKnowledgeGraph2025!",
    "NEO4J_DATABASE": "neo4j",
    "MEMORY_STORAGE_TYPE": "neo4j"
  }
}
```

### @iachilles/memento Quick Swap

#### To Enable @iachilles/memento (and disable @gannonh/memento-mcp):

1. Open Claude config file
2. Replace the `memento` section with the configuration above
3. Update the OPENAI_API_KEY with your actual key
4. Restart Claude Desktop

#### To Re-enable @gannonh/memento-mcp:

1. Replace the `memento` section with:
   ```json
   "memento": {
     "command": "npx",
     "args": ["-y", "@gannonh/memento-mcp"],
     "env": {
       "NEO4J_URI": "bolt://192.168.1.80:7687",
       "NEO4J_USERNAME": "neo4j",
       "NEO4J_PASSWORD": "MementoKnowledgeGraph2025!",
       "NEO4J_DATABASE": "neo4j",
       "MEMORY_STORAGE_TYPE": "neo4j",
       "NEO4J_VECTOR_INDEX": "entity_embeddings",
       "NEO4J_VECTOR_DIMENSIONS": "1536",
       "NEO4J_SIMILARITY_FUNCTION": "cosine",
       "OPENAI_API_KEY": "your-openai-api-key",
       "OPENAI_EMBEDDING_MODEL": "text-embedding-3-small"
     },
     "startupTimeoutMs": 30000
   }
   ```

2. Restart Claude Desktop

### @iachilles/memento vs @gannonh/memento-mcp

| Feature | @iachilles/memento | @gannonh/memento-mcp |
|---------|-------------------|---------------------|
| **Storage** | SQLite or Neo4j | Neo4j optimized |
| **Vector Support** | Basic | Advanced with index config |
| **Embedding Model** | Default OpenAI | Configurable model |
| **Setup Complexity** | Simple | More configuration options |
| **Performance** | Good | Optimized for Neo4j |

### @iachilles/memento Usage Notes

Both implementations provide similar core functions:
- Entity and relation management
- Semantic search with embeddings
- Knowledge graph operations
- Tag support via observations

The main differences are in configuration options and Neo4j optimization.