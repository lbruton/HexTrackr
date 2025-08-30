# rEngine Script Documentation Report

**Generated**: 2025-01-18  
**Version**: 3.04.86+  
**Purpose**: Human-readable documentation of all rEngine scripts with command blocks

## Core System Scripts

### 🚀 System Startup

#### one-click-startup.js

**Purpose**: Complete automated startup for the StackTrackr AI system including MCP Memory, Smart Scribe, and protocol compliance.

**What it does**: Creates git backup, starts MCP Memory server, launches Smart Scribe (Ollama agent), opens Scribe console, enables inline notifications, and tests system visibility.

**Command**:

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
node one-click-startup.js
```

**Dependencies**: Requires MCP servers, Ollama with qwen2.5-coder model, and git repository.

---

#### universal-agent-init.js

**Purpose**: Universal agent initialization system for consistent startup across different AI agents.

**What it does**: Creates git checkpoint, adds context to MCP, recalls previous session state, starts MCP servers, launches Smart Scribe, and opens split scribe console.

**Command**:

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
node universal-agent-init.js
```

**Dependencies**: git-checkpoint.sh, add-context.js, memory-intelligence.js, start-mcp-servers.sh, start-smart-scribe.sh

---

#### enhanced-agent-init.js

**Purpose**: Enhanced version of agent initialization with additional features.

**What it does**: Similar to universal-agent-init but with enhanced error handling and additional system checks.

**Command**:

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
node enhanced-agent-init.js
```

---

### 🤖 Smart Scribe System

#### smart-scribe.js

**Purpose**: AI-powered document analysis and monitoring system using Ollama's qwen2.5-coder model.

**What it does**: Monitors file changes, analyzes documents and chat logs, maintains knowledge database, performs idle analysis, and generates handoff logs for agent coordination.

**Command**:

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
node smart-scribe.js
```

**Configuration**: Requires system-config.json with Ollama endpoint and model settings.

**Features**:

- Real-time file monitoring with chokidar
- Document analysis using local LLM
- Knowledge database management
- Search optimization tables
- Handoff scheduling for agent coordination

---

#### start-smart-scribe.sh

**Purpose**: Shell script to start Smart Scribe system with dependency checks and cron job installation.

**What it does**: Checks Node.js dependencies, installs cron job for keep-alive monitoring, starts Smart Scribe in background, and tests the keep-alive system.

**Command**:

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
./start-smart-scribe.sh
```

**Outputs**:

- Smart Scribe running in background (logs to /tmp/smart-scribe.log)
- Cron job for keep-alive every 5 minutes
- Keep-alive logs in /tmp/scribe-keepalive.log

---

#### scribe-keepalive.sh

**Purpose**: Keep-alive monitoring script for Smart Scribe system.

**What it does**: Monitors Smart Scribe process health, restarts if needed, and provides status checking.

**Commands**:

```bash

# Test keep-alive system

./scribe-keepalive.sh test

# Check system status

./scribe-keepalive.sh status

# Manual keep-alive trigger

./scribe-keepalive.sh keepalive
```

---

### 💾 Memory Management

#### memory-sync-manager.js

**Purpose**: Manages synchronization between JSON files and MCP Memory server with backup capabilities.

**What it does**: Handles memory persistence, creates backups before writes, syncs to MCP server, and provides health monitoring for the memory system.

**Commands**:

```bash

# Check memory system health

node memory-sync-manager.js health

# Create backup of current memory

node memory-sync-manager.js backup

# Pre-commit memory validation

node memory-sync-manager.js pre-commit

# Merge scribe memories

node memory-sync-manager.js merge-scribe
```

**Features**:

- Automatic backup before memory writes
- MCP server sync with timeout handling
- Memory validation and health checks
- Git integration for version control

---

#### dual-memory-writer.js

**Purpose**: Dual-write memory system that writes to both JSON files and MCP server simultaneously.

**What it does**: Ensures memory persistence across multiple backends, handles fallback scenarios, and maintains data consistency.

**Command**:

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
node dual-memory-writer.js
```

**Integration**: Used by other scripts as a module for memory operations.

---

#### memory-intelligence.js

**Purpose**: Intelligent memory recall and context analysis system.

**What it does**: Analyzes conversation history, provides intelligent context recall, and maintains conversation continuity across agent sessions.

**Command**:

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
node memory-intelligence.js
```

**Features**:

- Conversation history analysis
- Context extraction and summarization
- Agent handoff preparation
- Memory pattern recognition

---

#### memory-safety.js

**Purpose**: Memory safety and protection system to prevent accidental data loss.

**What it does**: Creates backup policies, protects critical memory files, maintains deleted memory backups (24h retention), and provides master lookup table.

**Command**:

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
node memory-safety.js
```

**Safety Features**:

- Automatic backup before deletion
- 24-hour retention of deleted memories
- Master lookup table for file references
- Read-only protection for scribe files

---

### 🔗 MCP Integration

#### mcp-fallback-handler.js

**Purpose**: Handles fallback scenarios when MCP servers are unavailable.

**What it does**: Tests MCP connectivity, provides fallback to JSON files, handles emergency scenarios, and maintains system continuity.

**Commands**:

```bash

# Test MCP connection

node mcp-fallback-handler.js test

# Search with fallback

node mcp-fallback-handler.js search "query term"

# Agent handoff preparation

node mcp-fallback-handler.js handoff

# Emergency mode activation

node mcp-fallback-handler.js emergency
```

---

#### start-mcp-servers.sh

**Purpose**: Starts MCP (Model Context Protocol) servers for memory management.

**What it does**: Launches MCP servers with proper configuration and monitors startup success.

**Command**:

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
./start-mcp-servers.sh
```

---

### 🖥️ Console and Interface

#### scribe-console.js

**Purpose**: Interactive console interface for monitoring and controlling the scribe system.

**What it does**: Provides real-time monitoring, command interface for memory operations, and system status display.

**Command**:

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
node scribe-console.js
```

**Console Commands**:

- `summary [timeframe]` - Generate conversation summary
- `memory` - Check memory status
- `logs` - View recent logs
- `clear` - Clear screen
- `help` - Show available commands
- `quit` - Exit console

---

#### split-scribe-console.js

**Purpose**: Split-screen console for simultaneous monitoring of multiple scribe components.

**What it does**: Displays multiple data streams in split-screen format for comprehensive system monitoring.

**Command**:

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
node split-scribe-console.js
```

---

#### enhanced-scribe-console.js

**Purpose**: Enhanced version of scribe console with additional features and improved UI.

**Command**:

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
node enhanced-scribe-console.js
```

---

### 📊 Document Processing

#### document-generator.js

**Purpose**: Automated documentation generation using AI analysis.

**What it does**: Analyzes code files, generates human-readable documentation, and creates structured documentation files.

**Command**:

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
node document-generator.js
```

---

#### document-sweep.js

**Purpose**: Automated document analysis and monitoring system.

**What it does**: Scans project files for changes, analyzes documentation coverage, and maintains document index.

**Command**:

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
node document-sweep.js
```

**Features**:

- Recursive file scanning
- Documentation coverage analysis
- Change detection and reporting
- Automated index maintenance

---

### 🔧 Utility Scripts

#### add-context.js

**Purpose**: Adds context information to the MCP memory system.

**What it does**: Processes current system state and adds relevant context to memory for agent continuity.

**Command**:

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
node add-context.js
```

---

#### recall.js

**Purpose**: Memory recall utility for retrieving stored context and conversation history.

**What it does**: Searches memory for relevant context, prepares conversation history, and formats information for agent use.

**Command**:

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
node recall.js
```

---

#### protocol-compliance-checker.js

**Purpose**: Validates system compliance with StackTrackr protocols.

**What it does**: Checks system configuration, validates protocol adherence, and reports compliance status.

**Command**:

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
node protocol-compliance-checker.js
```

---

#### visible-memory-writer.js

**Purpose**: Creates visible notifications for all memory write operations.

**What it does**: Injects console notifications to make memory operations visible during development and debugging.

**Command**: Auto-generated by one-click-startup.js, not run directly.

---

### 🧪 Testing Scripts

#### test-memory.js

**Purpose**: Tests memory system functionality and performance.

**Command**:

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
node test-memory.js
```

---

#### test-intelligence.js

**Purpose**: Tests agent intelligence and database loading capabilities.

**Command**:

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
node test-intelligence.js
```

---

#### test-mcp-connection.js

**Purpose**: Tests MCP server connectivity and functionality.

**Command**:

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
node test-mcp-connection.js
```

---

#### test-ai-providers.js

**Purpose**: Tests different AI provider integrations and capabilities.

**Command**:

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
node test-ai-providers.js
```

---

### 🔄 Automation Scripts

#### auto-launch-scribe.sh

**Purpose**: Automated launch script for scribe system with enhanced features.

**Command**:

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
./auto-launch-scribe.sh
```

**Features**:

- Hello Kitty ASCII art welcome
- Real-time file monitoring display
- Last 5 changes display
- Clean INFO logging format
- Interactive command interface

---

#### auto-launch-split-scribe.sh

**Purpose**: Automated launch for split-screen scribe console.

**Command**:

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
./auto-launch-split-scribe.sh
```

---

#### restart-full-scribe-system.sh

**Purpose**: Complete restart of the entire scribe system.

**Command**:

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
./restart-full-scribe-system.sh
```

---

#### restart-rengine.sh

**Purpose**: Restart the rEngine system components.

**Command**:

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
./restart-rengine.sh
```

---

### 📈 Monitoring and Health

#### health-monitor.sh

**Purpose**: System health monitoring for all rEngine components.

**Command**:

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
./health-monitor.sh
```

---

#### status-check.sh

**Purpose**: Quick status check for all system components.

**Command**:

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
./status-check.sh
```

---

#### post-restart-check.sh

**Purpose**: Validation checks to run after system restart.

**Command**:

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
./post-restart-check.sh
```

---

## Quick Start Commands

### Complete System Startup

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
node one-click-startup.js
```

### Start Smart Scribe Only

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
./start-smart-scribe.sh
```

### Open Monitoring Console

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
node scribe-console.js
```

### Check System Health

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
node memory-sync-manager.js health
./status-check.sh
```

### Test System Components

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
node test-mcp-connection.js
node test-memory.js
node test-intelligence.js
```

## Configuration Requirements

### Essential Files

- `system-config.json` - Main configuration with Ollama settings
- `.env` - Environment variables and API keys
- `persistent-memory.json` - Main memory index file

### Required Services

- **Ollama**: Local LLM server with qwen2.5-coder model
- **MCP Servers**: Memory Context Protocol servers
- **Git**: Version control for checkpoints and backups
- **Cron**: For automated keep-alive monitoring

### Directory Structure

```
rEngine/
├── Core scripts (documented above)
├── node_modules/ (npm dependencies)
├── backups/ (automated backups)
├── .rengine/ (runtime data)
└── .memory-backups/ (memory snapshots)
```

## Integration Notes

All scripts are designed to work together as a cohesive system. The typical workflow is:

1. **Startup**: `one-click-startup.js` or `universal-agent-init.js`
2. **Monitoring**: `scribe-console.js` for real-time visibility
3. **Maintenance**: Automatic via Smart Scribe and keep-alive scripts
4. **Testing**: Regular health checks and component tests

The system is designed for hands-off operation once properly configured, with comprehensive logging and automatic recovery capabilities.
