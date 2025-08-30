# 🔧 AI Tools Registry Protocol

**Protocol ID**: TOOLS-REG-001  
**Version**: 1.0.0  
**Created**: August 19, 2025  
**Purpose**: Comprehensive registry and management system for custom-built AI tools and capabilities

## 🎯 Overview

This protocol establishes a centralized registry for tracking, documenting, and managing all custom-built AI tools within the rEngine ecosystem. These tools represent critical capabilities that enable advanced AI-powered development workflows.

## 🚨 Critical Missing Tools (MCP Integration Lost)

**Status**: CRITICAL - Core infrastructure offline  
**Impact**: 5-tier AI provider system inaccessible via VS Code Chat  
**Evidence**: Tools were operational Friday-Monday, confirmed by user

### Missing Tools Inventory

| Tool Name | Primary Function | AI Provider | Status |
|-----------|------------------|-------------|---------|
| `analyze_with_ai` | 5-tier AI analysis with intelligent fallback | Groq→Claude→OpenAI→Gemini→Ollama | ❌ Offline |
| `rapid_context_search` | Ollama-powered instant codebase search | Ollama | ❌ Offline |
| `get_instant_code_target` | Ollama-based file/function targeting | Ollama | ❌ Offline |
| `ingest_full_project` | Complete project analysis (token-efficient) | Ollama | ❌ Offline |

## 📋 Complete AI Tools Registry

### Tier 1: Core Analysis Tools

#### `analyze_with_ai`

- **Purpose**: Multi-provider AI analysis with intelligent fallback routing
- **Provider Chain**: Groq → Claude → OpenAI → Gemini → Ollama
- **Auto-Recording**: Saves all analyses to memory system
- **Input Schema**:

  ```json
  {
    "content": "string (required)",
    "operation": "string (default: general_analysis)"
  }
  ```

- **Use Cases**:
  - Code security/performance review
  - Problem analysis and solution generation
  - Content evaluation and optimization
- **Dependencies**: All 5 AI providers, memory system

#### `rapid_context_search`

- **Purpose**: Lightning-fast codebase search using context matrix
- **Provider**: Ollama-powered search matrix
- **Performance**: 1-2 transaction resolution
- **Input Schema**:

  ```json
  {
    "query": "string (required)",
    "maxResults": "number (default: 5)"
  }
  ```

- **Use Cases**:
  - Function/file location
  - Code pattern discovery
  - Problem description to code mapping
- **Dependencies**: Ollama, pre-built search matrix

#### `get_instant_code_target`

- **Purpose**: Precise file/function targeting for development tasks
- **Provider**: Ollama analysis engine
- **Performance**: 1-2 transaction targeting
- **Input Schema**:

  ```json
  {
    "task_description": "string (required)",
    "code_type": "string (default: any)"
  }
  ```

- **Use Cases**:
  - Development task routing
  - Code modification targeting
  - Architecture navigation
- **Dependencies**: Ollama, project context matrix

#### `ingest_full_project`

- **Purpose**: Comprehensive project analysis with token efficiency
- **Provider**: Ollama optimization engine
- **Performance**: Complete project understanding
- **Input Schema**:

  ```json
  {
    "query": "string (required)",
    "analysis_depth": "enum[quick|detailed|comprehensive] (default: detailed)"
  }
  ```

- **Use Cases**:
  - Project onboarding
  - Architecture review
  - Comprehensive debugging
- **Dependencies**: Ollama, project ingestion system

### Tier 2: Support Tools

#### `get_agents_memory`

- **Purpose**: Retrieve information from agents memory system
- **Provider**: rEngine memory system
- **Auto-Recording**: Records all queries
- **Input Schema**:

  ```json
  {
    "query": "string (optional)",
    "limit": "number (default: 5)"
  }
  ```

- **Use Cases**:
  - Context retrieval
  - Historical analysis
  - Memory exploration
- **Dependencies**: Agent memory system, MCP fallback

#### `get_continuation_context`

- **Purpose**: Intelligent context for conversation continuation
- **Provider**: Memory analysis system
- **Performance**: Instant context bridging
- **Input Schema**:

  ```json
  {
    "include_recent_work": "boolean (default: true)"
  }
  ```

- **Use Cases**:
  - Session handoff
  - Context restoration
  - Work continuity
- **Dependencies**: Memory system, work tracking

#### `vscode_system_status`

- **Purpose**: VS Code MCP integration status monitoring
- **Provider**: System diagnostics
- **Real-time**: Live status reporting
- **Input Schema**: `{}`
- **Use Cases**:
  - Integration debugging
  - Provider availability checking
  - System health monitoring
- **Dependencies**: VS Code MCP, all AI providers

## 🏗 Technical Architecture

### AI Provider Integration

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   VS Code Chat │────│ MCP Server   │────│ rEngine Tools   │
└─────────────────┘    └──────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  5-Tier AI Stack │
                    ├──────────────────┤
                    │ 1. Groq (Fast)   │
                    │ 2. Claude (Smart)│
                    │ 3. OpenAI (Balanced)│
                    │ 4. Gemini (Multi)│
                    │ 5. Ollama (Local)│
                    └──────────────────┘
```

### Tool Routing Logic

1. **Primary**: Fast providers for simple queries (Groq)
2. **Fallback**: Intelligent providers for complex analysis (Claude, OpenAI)
3. **Local**: Ollama for privacy-sensitive or offline operations
4. **Recording**: All operations auto-save to agent memory

### Context Matrix System

- **Pre-indexed**: Entire project pre-analyzed by Ollama
- **Search Matrix**: Optimized for sub-second responses
- **Token Efficiency**: Minimal token usage for maximum context
- **Live Updates**: Matrix updates with code changes

## 🚨 Restoration Priority

### P0 (Critical - This Week)

1. **MCP Integration Restoration**: Rebuild VS Code MCP connection
2. **Tool Access Verification**: Confirm all 4 critical tools accessible
3. **Provider Chain Testing**: Verify 5-tier AI fallback system
4. **Memory Integration**: Ensure auto-recording functionality

### P1 (High - Next Week)

1. **Performance Optimization**: Restore 1-2 transaction performance
2. **Context Matrix Rebuild**: Reconstruct search matrix if corrupted
3. **Documentation Updates**: Update all tool documentation
4. **Monitoring Setup**: Implement tool availability monitoring

## 📊 Tool Performance Metrics

### Target Performance

- **`rapid_context_search`**: < 2 seconds response time
- **`get_instant_code_target`**: 1-2 transactions to target
- **`analyze_with_ai`**: < 10 seconds for complex analysis
- **`ingest_full_project`**: < 30 seconds for comprehensive analysis

### Success Indicators

- **Tool Availability**: 99.9% uptime for critical tools
- **Provider Fallback**: < 5 second failover between providers
- **Memory Recording**: 100% operation capture rate
- **Search Accuracy**: > 95% relevant results for context searches

## 🔐 Access Control & Security

### Tool Access Levels

- **VS Code Integration**: Full access to all tools via MCP
- **Direct API**: Authenticated access for automation
- **Memory Recording**: Automatic for all authenticated sessions
- **Provider Isolation**: Secure API key management

### Security Protocols

- **API Key Rotation**: Monthly rotation for all providers
- **Access Logging**: Complete audit trail for all tool usage
- **Rate Limiting**: Prevent abuse of external AI providers
- **Local Fallback**: Ollama ensures privacy-sensitive operations

## 📚 Related Systems

### Dependencies

- **MCP Server**: Core integration layer (`rEngine/index.js`)
- **AI Providers**: All 5-tier provider configurations
- **Memory System**: Agent memory for recording and retrieval
- **Search Matrix**: Pre-built Ollama context index

### Integration Points

- **VS Code Chat**: Primary interface for tool access
- **rEngine Platform**: Tool registration and management
- **rMemory System**: Persistent storage for all operations
- **Docker Containers**: Isolated provider environments

## 🔄 Maintenance Protocol

### Daily Monitoring

- Check tool availability via `vscode_system_status`
- Verify provider response times
- Review memory recording completeness

### Weekly Maintenance

- Update search matrix with recent code changes
- Review tool usage patterns and optimization opportunities
- Test provider fallback chains

### Monthly Reviews

- Provider performance analysis
- Tool usage statistics
- Security audit and key rotation

---

**Status**: CRITICAL - Restoration Required  
**Next Steps**: Immediate MCP integration restoration  
**Owner**: rEngine Core Infrastructure Team  
**Priority**: P0 - Blocking all advanced AI workflows
