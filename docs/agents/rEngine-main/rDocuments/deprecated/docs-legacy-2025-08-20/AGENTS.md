# StackTrackr Agent Ecosystem - Memory File Directory

**Universal Agent Support**: Claude, GPT, Gemini, and all future Copilot agents

## 🧠 Memory File Locations

### **Agent-Specific Memory Files**

Each agent creates its own dedicated memory file:

```
/Volumes/DATA/GitHub/rEngine/rMemory/rAgentMemories/
├── claude-memory.json          # Claude (Anthropic) agent sessions
├── gpt-memory.json             # GPT (OpenAI) agent sessions  
├── gemini-memory.json          # Gemini (Google) agent sessions
├── copilot-agent-memory.json   # Generic Copilot agents
└── [future-agent]-memory.json  # Any new agents added to ecosystem
```

### **Shared Memory Files**

Cross-agent memory accessible by all agents:

```
/Volumes/DATA/GitHub/rEngine/rMemory/rAgentMemories/
├── extendedcontext.json        # Shared context and session history
├── tasks.json                  # Task tracking and project management
├── memory.json                 # Legacy shared memory
└── agent-session-memory.json   # Short-term session memory
```

### **System Memory Files**

Core system and configuration memory:

```
/Volumes/DATA/GitHub/rEngine/rEngine/
├── persistent-memory.json      # Cross-session persistent memory
├── active-agent-profile.json   # Current agent configuration
└── search-optimization.json    # Memory search optimization
```

## 🤖 Agent Initialization

### **Universal Initialization** (Recommended)

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
node universal-agent-init.js --agent-type [claude|gpt|gemini|auto]
```

### **Agent-Specific Initialization**

```bash

# Claude

node claude-agent-init.js

# GPT  

node gpt-mandatory-startup.js

# Gemini (uses universal)

node universal-agent-init.js --agent-type gemini

# Auto-detect

node universal-agent-init.js
```

## 📋 Memory File Purposes

### **Agent-Specific Files** (`{agent}-memory.json`)

- **Purpose**: Track individual agent sessions, capabilities, and performance
- **Contains**: Session history, agent-specific tasks, learning patterns
- **Access**: Read/write by specific agent, read-only by others
- **Format**:

  ```json
  {
    "agent_type": "claude|gpt|gemini",
    "created_at": "ISO timestamp",
    "sessions": { "YYYY-MM-DD": [...] },
    "capabilities": [...],
    "memory_stats": {...}
  }
  ```

### **Shared Memory Files** (2)

#### **extendedcontext.json**

- **Purpose**: Cross-agent context sharing and session handoffs
- **Contains**: Detailed session logs, decisions, code changes
- **Access**: Read/write by all agents
- **Use Case**: Agent handoffs, context preservation, decision tracking

#### **tasks.json**

- **Purpose**: Project task management and tracking
- **Contains**: Task definitions, progress, assignments
- **Access**: Read/write by all agents
- **Use Case**: Project coordination, task delegation, progress tracking

#### **persistent-memory.json**

- **Purpose**: Core system memory that persists across all sessions
- **Contains**: System state, key configurations, critical knowledge
- **Access**: Read/write by all agents
- **Use Case**: System continuity, configuration management

## 🔗 MCP Integration

All memory files are accessible via Model Context Protocol (MCP):

```bash

# MCP Memory Server

cd /Volumes/DATA/GitHub/rEngine/rEngine
node start-mcp-servers.sh
```

**MCP Endpoints**:

- `memory://agent-specific/{agent}-memory.json`
- `memory://shared/extendedcontext.json`  
- `memory://shared/tasks.json`
- `memory://system/persistent-memory.json`

## 🌍 External Agent Access

For agents outside VS Code (CLI, API, other IDEs):

### **Direct File Access**

```bash

# Read agent memory

cat /Volumes/DATA/GitHub/rEngine/rMemory/rAgentMemories/claude-memory.json

# Write to shared context  

echo '{"entry": "data"}' >> /Volumes/DATA/GitHub/rEngine/rMemory/rAgentMemories/extendedcontext.json
```

### **Script Interface**

```bash

# Add context via script

cd /Volumes/DATA/GitHub/rEngine/rEngine
node add-context.js "title" "description" "type"

# Recall memory

node recall.js "search term"

# Memory intelligence

node memory-intelligence.js recall "query"
```

### **API Integration** (Future)

```javascript
// REST API access (planned)
GET /api/memory/agent/{agent-type}
POST /api/memory/shared/context
PUT /api/memory/system/persistent
```

## 🎯 Agent Ecosystem Vision

**Goal**: Seamless collaboration between all AI agents working on StackTrackr

**Principles**:

1. **Agent Independence**: Each agent has its own memory space
2. **Shared Context**: Common memory for handoffs and collaboration  
3. **External Access**: Memory accessible outside VS Code
4. **Future-Proof**: System supports any new agents added to ecosystem
5. **MCP Integration**: Standard protocol for memory access
6. **Git Integration**: All memory changes are version controlled

**Supported Agents**:

- ✅ Claude (Anthropic) - Advanced reasoning and function calling
- ✅ GPT (OpenAI) - Code generation and web browsing  
- ✅ Gemini (Google) - Multimodal and search integration
- ✅ Generic Copilot Agents - Future-proof support
- 🔄 Custom Agents - Via universal initialization system

## 🚀 Quick Start for New Agents

1. **Initialize**: `node universal-agent-init.js`
2. **Verify**: Check that `{agent}-memory.json` was created
3. **Test MCP**: Ensure MCP server shows memory access notifications
4. **Collaborate**: Use shared memory files for cross-agent work

**Memory files should be visible and actively updated during agent sessions!**
