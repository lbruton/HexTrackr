# CRIT-001: rEngine MCP Integration Restoration Plan

## 🎯 **Critical Infrastructure Gap Analysis**

**Issue:** Lost VS Code Chat access to rEngine's 5-tier AI provider system
**Impact:** Core multi-LLM orchestration capabilities completely inaccessible
**Timeline:** Was working Friday-Monday, now broken
**Priority:** P0 - This is fundamental development stack infrastructure

## 🏗️ **Current Architecture State**

### ✅ **What's Working:**

- **Docker Containers Running:** All services operational
  - `stackrtrackr` (main application)
  - `mcp-server-1` (memory MCP server on port 3036)
  - `rengine-platform-1` (rEngine MCP server)
- **rEngine MCP Server:** Full implementation exists (2270 lines)
- **5-Tier AI Providers:** All configured (Groq → Claude → OpenAI → Gemini → Ollama)
- **Memory System:** rAgents integration functional

### ❌ **What's Broken:**

- **VS Code Chat Integration:** Cannot access MCP tools
- **Tool Access:** All rEngine tools inaccessible:
  - `analyze_with_ai` - 5-tier AI analysis
  - `rapid_context_search` - Ollama-powered context search
  - `get_instant_code_target` - Code targeting
  - `ingest_full_project` - Project analysis
  - `get_continuation_context` - Session continuity
  - `trigger_session_handoff` - Session management

## 🔍 **Root Cause Investigation**

### ✅ **BREAKTHROUGH DISCOVERY:** OpenWebUI Pipelines Integration

**Key Insight from User:** The MCP system was using OpenWebUI pipelines as the bridge to AI providers

### **Correct Architecture:**

```
VS Code Chat → rEngine MCP Server → OpenWebUI API (localhost:3031) → Pipelines (localhost:9099) → AI Providers
```

### **Current State Analysis:**

- ✅ **OpenWebUI Container:** Now running on localhost:3031 (was stopped)
- ✅ **Pipelines Container:** Running on localhost:9099  
- ❌ **Missing Link:** rEngine making direct API calls instead of routing through OpenWebUI
- ❌ **Configuration Gap:** rEngine not configured to use OpenWebUI as proxy

### **Root Cause Identified:**

The rEngine MCP server is calling AI providers directly instead of routing through the OpenWebUI/Pipelines system. This breaks the 5-tier integration that was working before.

## 🛠️ **Restoration Plan**

### Phase 1: OpenWebUI Integration (Day 1)

1. **Modify rEngine AI Provider Calls**
   - Update `callGroqAPI()` to route through OpenWebUI
   - Update `callClaudeAPI()` to use OpenWebUI pipelines
   - Update `callGeminiAPI()` to use OpenWebUI pipelines
   - Keep `callOllamaAPI()` as direct connection (already working)

1. **Configure OpenWebUI Endpoints**

   ```javascript
   // New architecture - route through OpenWebUI
   const OPENWEBUI_BASE_URL = 'http://localhost:3031/v1';
   
   // Update provider configs to use OpenWebUI proxy
   async function callViaOpenWebUI(messages, model) {
     return axios.post(`${OPENWEBUI_BASE_URL}/chat/completions`, {
       model,
       messages
     });
   }
   ```

1. **Test Pipeline Connections**
   - Verify Groq pipeline active in OpenWebUI
   - Verify Claude pipeline available
   - Verify Gemini pipeline available
   - Test fallback to Ollama

### Phase 2: VS Code MCP Integration (Day 2)

1. **Update rEngine Server Configuration**
   - Ensure MCP server uses updated provider calls
   - Test tool availability through new routing
   - Verify memory integration still works

1. **VS Code MCP Configuration**

   ```json
   {
     "mcpServers": {
       "rengine": {
         "command": "node",
         "args": ["index.js"],
         "cwd": "/Volumes/DATA/GitHub/rEngine/rEngine"
       }
     }
   }
   ```

1. **End-to-End Testing**
   - Test VS Code Chat → MCP → OpenWebUI → Pipelines flow
   - Verify 5-tier fallback system works
   - Confirm memory recording functions

## 🚀 **Implementation Commands**

### Immediate Diagnostics

```bash

# Check if rEngine MCP server starts

cd /Volumes/DATA/GitHub/rEngine/rEngine
node index.js

# Verify Docker containers

docker ps | grep stackrtrackr

# Check VS Code MCP configuration

code --list-extensions | grep mcp
```

### Configuration Files to Check

- `~/.vscode/settings.json` - VS Code MCP configuration
- `/Volumes/DATA/GitHub/rEngine/rEngine/.env` - Environment variables
- `/Volumes/DATA/GitHub/rEngine/rEngine/index.js` - MCP server implementation

## 📊 **Success Criteria**

### ✅ **Restoration Complete When:**

1. **VS Code Chat Access:** Can call `@rengine analyze_with_ai` successfully
2. **5-Tier Fallback:** AI providers work in priority order
3. **Memory Integration:** Conversations auto-recorded to rAgents
4. **Context Search:** Ollama-powered search returns relevant results
5. **Session Management:** Handoff and resume functions operational

### 🎯 **User Experience Restored:**

- Multi-LLM analysis available in VS Code Chat
- Intelligent code targeting for development tasks
- Persistent memory across sessions
- Context-aware development assistance

## 🔧 **Next Steps**

1. **Immediate (Today):** Begin configuration verification
2. **This Week:** Complete full restoration and testing
3. **Documentation:** Create setup guide to prevent future issues
4. **Monitoring:** Implement health checks for MCP connectivity

---

**Priority:** P0 - Core Infrastructure  
**Estimated Effort:** 1-3 days  
**Impact:** Restores fundamental multi-LLM development capabilities  
**Status:** Planning → Implementation → Testing → Documentation
