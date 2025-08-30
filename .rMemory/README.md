# .rMemory - HexTrackr Memory System

> **Bridge architecture**: Real-time → SQLite → JSON → Memento MCP → Neo4j

The `.rMemory` system implements sophisticated memory capabilities inspired by ChatGPT's advanced features, built incrementally on HexTrackr's existing Memento MCP foundation.

## Architecture Overview

```
📁 .rMemory/
├── 🗃️  sqlite/           # Real-time high-frequency storage
├── 📋 json/              # Structured data exports  
├── 🔄 sync/              # Memento MCP integration
├── 🔧 core/              # Core memory processing scripts
├── 🛠️  tools/            # Memory tools and utilities
└── 🚀 launchers/         # External execution scripts
```

## Core Components

### Real-time Storage (`sqlite/`)

- **symbol_index.db** - Code symbols, functions, variables
- **chat_events.db** - VS Code conversation tracking
- **file_changes.db** - Real-time file modification monitoring

### Structured Data (`json/`)

- **symbol-index.json** - Complete code symbol export
- **memento-import.json** - Formatted for Memento MCP ingestion
- **session-summaries.json** - Conversation analysis results

### Processing Scripts (`core/`)

- **code-symbol-indexer.js** - Scans codebase, extracts symbols
- **chat-log-archaeology.js** - Processes VS Code chat history  
- **memory-scribe.js** - Real-time conversation monitoring
- **memory-importer.js** - Bulk import to Memento MCP
- **memento-launcher.js** - MCP connection utilities

### Tools & Utilities (`tools/`)

- **ollama-detector.js** - Local LLM discovery and setup
- **memory-wrapper-manager.js** - Enhanced protocol management
- **test-memento-claude.js** - Connection verification
- **test-ollama-embedding.js** - Local embedding testing
- **claude-integration.js** - External API integration

### External Launchers (`launchers/`)

- **launch-archaeology-terminal.applescript** - macOS Terminal automation
- **launch-archaeology.sh** - Shell wrapper for external execution
- **README-archaeology-launcher.md** - Usage documentation

## Usage Examples

### Quick Symbol Search

```bash
sqlite3 .rMemory/sqlite/symbol_index.db "SELECT * FROM symbols WHERE symbol_type = 'function';"
```

### Process New Code Changes

```bash
node .rMemory/core/code-symbol-indexer.js
```

### External Memory Processing

```bash

# macOS Terminal (outside VS Code)

osascript .rMemory/launchers/launch-archaeology-terminal.applescript
```

### Test Memory System

```bash
node .rMemory/tools/test-memento-claude.js
```

## Integration Status

- ✅ **SQLite Real-time Storage** - 335+ symbols captured
- ✅ **Code Symbol Indexing** - 1,036 symbols, 364 files analyzed  
- ✅ **AppleScript Launchers** - External Terminal execution
- ✅ **Memento MCP Bridge** - Entity creation working
- 🔄 **Ollama Integration** - Local LLM processing ready
- 📋 **Real-time Monitoring** - File watcher implementation pending

## Next Phase: Real-time Monitoring

The next evolution involves setting up file watchers to update .rMemory as you code, creating a truly responsive memory system that captures your development flow in real-time.

---

*Built incrementally on existing Memento MCP foundation - "start small and work our way up"*

- **Memento**: Final searchable memory (entities, relations)

This hybrid approach gives us:

- ✅ Fast real-time capture
- ✅ Human-readable intermediate data
- ✅ Powerful final search via Neo4j
