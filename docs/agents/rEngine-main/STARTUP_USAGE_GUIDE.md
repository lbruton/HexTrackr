# rEngine Startup & Usage Guide

## 🚀 Quick Start After Robust Startup

After running `robust-startup-protocol.sh`, you'll have access to multiple memory systems:

### **1. Integrated MCP Servers (NEW - Zero Config)**

**All MCP servers now run locally - no VS Code extensions needed!**

```bash

# MCP servers start automatically with robust-startup-protocol.sh

# Available tools in VS Code Copilot:

# - mcp_memory_* (knowledge graph operations)

# - mcp_context7_* (long-term context management) 

# - mcp_filesystem_* (file operations)

```

## What's included:

- Memory MCP Server (knowledge graph)
- Context7 MCP Server (long-term context)
- Filesystem MCP Server (file operations)

### **2. Local Memory Intelligence**

```bash

# Fast search across all memory

node rEngine/memory-intelligence.js search "your query"

# Example searches that work:

node rEngine/memory-intelligence.js search "memory"
node rEngine/memory-intelligence.js search "startup"
node rEngine/memory-intelligence.js search "protocol"
```

### **3. Dual Memory Writer**

```bash

# Write to all 3 memory stores simultaneously

node rEngine/dual-memory-writer.js [agent] "title" "content"

# Example:

node rEngine/dual-memory-writer.js claude "Test Entry" "This is a test memory entry"
```

### **4. Enhanced Agent System**

```bash

# Initialize with optimal settings

node rEngine/enhanced-agent-init.js

# This sets up:

# - LLM provider selection (Groq → Claude → OpenAI → Gemini)

# - Memory system verification

# - MCP configuration

# - Agent profile creation

```

## 🧠 Memory System Architecture

### **Three-Layer Memory System:**

1. **Persistent Memory** (`persistent-memory.json`)
   - Long-term storage for all agents
   - JSON sanitized and error-resistant
   - Cross-session persistence

1. **Agent-Specific Memory** (`[agent]-memory.json`)
   - Per-agent working memory
   - Session-based organization
   - Temporary context storage

1. **Extended Context** (`extendedcontext.json`)
   - Activity logging and session tracking
   - File change monitoring
   - Background process records

## 🔧 What's Working vs What Needs Fixing

### ✅ **Working Systems:**

- Local memory intelligence search
- Dual memory writer (3/3 stores)
- Enhanced agent initialization
- Docker services (5 containers running)
- Ollama service with models
- Background file monitoring

### ❌ **Needs Fixing:**

- MCP memory server VS Code integration
- Path resolution in validation scripts
- Enhanced memory sync directory structure
- Missing usage documentation
- MCP client configuration

## 🔍 Debugging Commands

```bash

# Check MCP server status

docker-compose ps | grep mcp-server

# Test memory systems

node test-memory.js
node memory-intelligence.js search "test"

# Verify agent initialization

node enhanced-agent-init.js

# Check validation

bash validate-protocol-stack.sh --verbose
```

## 💡 Next Steps

1. **Fix MCP Integration**: Configure VS Code settings for MCP server connection
2. **Create Usage Examples**: Practical workflows for common tasks
3. **Path Standardization**: Align all scripts to use consistent file paths
4. **Documentation**: Create comprehensive user guides
5. **Validation Fixes**: Update validation script path detection
