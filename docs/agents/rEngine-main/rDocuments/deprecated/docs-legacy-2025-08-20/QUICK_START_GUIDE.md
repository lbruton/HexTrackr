# StackTrackr Quick Start Guide

**Version**: 3.04.86+  
**Last Updated**: August 18, 2025  
**For**: New developers, system operators, and AI agents

---

## 🚀 **One-Click System Startup ("W Button")**

The "W Button" refers to our complete system initialization workflow. Here's the exact sequence:

### **Primary Startup Command**

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
node one-click-startup.js
```

This single command executes the complete "W Button" workflow:

1. **Git Backup** → `bash /Volumes/DATA/GitHub/rEngine/scripts/git-checkpoint.sh`
2. **MCP Memory Start** → Starts MCP servers with visible widgets
3. **Smart Scribe Launch** → `node smart-scribe.js` (background)
4. **Console Opening** → `node split-scribe-console.js` (new terminal)
5. **Notifications Enable** → Creates `visible-memory-writer.js`
6. **System Testing** → Validates all components
7. **Live Dashboard** → Real-time status display

### **Alternative Startup Scripts**

```bash

# Universal agent initialization

node universal-agent-init.js

# Enhanced startup with additional features

node enhanced-agent-init.js

# Shell script version

./start-smart-scribe.sh
```

---

## 📋 **Key .md Files and Their Control Functions**

### **🎯 Master Control Files**

#### **MASTER_ROADMAP.md** - Single Source of Truth

- **Controls**: All project tracking, issues, milestones, and priorities
- **Purpose**: Unified roadmap for StackTrackr app + rEngine components
- **Usage**: Check before starting any work, update with new issues
- **Who Updates**: All team members and AI agents
- **Format**: P0/P1/P2/P3 priority system with component tracking

#### **COPILOT_INSTRUCTIONS.md** - AI Agent Behavior

- **Controls**: How AI agents should behave and operate
- **Purpose**: Consistent agent behavior across all sessions
- **Usage**: Reference for agent decision-making and protocols
- **Who Updates**: System administrators only
- **Format**: Detailed protocols and behavioral guidelines

#### **START.md** - Project Overview

- **Controls**: Initial project understanding and context
- **Purpose**: High-level project description and current state
- **Usage**: First file to read when joining project
- **Who Updates**: Project leads
- **Format**: Executive summary with key points

### **🔧 System Configuration Files**

#### **AGENT_SYSTEM_GUIDE.md** - Agent Operations

- **Controls**: How agents should interact with the system
- **Purpose**: Technical guide for agent functionality
- **Usage**: Reference for agent development and troubleshooting
- **Who Updates**: rEngine developers
- **Format**: Technical procedures and best practices

#### **BRAIN_SHARE_MEMORY_SYSTEM.md** - Memory Architecture

- **Controls**: Memory system design and operation
- **Purpose**: Documents how the MCP memory system works
- **Usage**: Understanding memory persistence and retrieval
- **Who Updates**: Memory system developers
- **Format**: Architecture diagrams and technical specs

#### **AGENT_HANDOFF_SYSTEM_GUIDE.md** - Session Continuity

- **Controls**: How agents transfer context between sessions
- **Purpose**: Ensures seamless agent handoffs
- **Usage**: Protocol for maintaining conversation continuity
- **Who Updates**: rEngine team
- **Format**: Step-by-step handoff procedures

### **📊 Documentation and Planning Files**

#### **RENGINE_SCRIPT_DOCUMENTATION.md** - Script Reference

- **Controls**: All rEngine script usage and commands
- **Purpose**: Human-readable documentation of 40+ scripts
- **Usage**: Copy-paste commands for system operations
- **Who Updates**: Auto-generated, manually curated
- **Format**: Command blocks with descriptions

#### **SQLITE_MIGRATION_PLAN.md** - Database Migration

- **Controls**: SQLite migration strategy and implementation
- **Purpose**: Plan for converting JSON files to SQLite database
- **Usage**: Implementation guide for performance optimization
- **Who Updates**: Database team
- **Format**: Phased implementation plan with timelines

#### **CLEANUP.md** - File Organization

- **Controls**: Project file cleanup and optimization strategy
- **Purpose**: Maintain clean codebase and reduce storage overhead
- **Usage**: Guide for archiving and organizing project files
- **Who Updates**: Maintenance team
- **Format**: Categorized cleanup tasks with commands

### **🏗️ Architecture and Vision Files**

#### **rX-ARCHITECTURE.md** - System Design

- **Controls**: Overall system architecture and design decisions
- **Purpose**: High-level technical architecture documentation
- **Usage**: Understanding system structure and relationships
- **Who Updates**: Architecture team
- **Format**: System diagrams and component descriptions

#### **VISION.md** - Project Direction

- **Controls**: Long-term project vision and goals
- **Purpose**: Strategic direction for StackTrackr development
- **Usage**: Alignment on project objectives and roadmap
- **Who Updates**: Project leadership
- **Format**: Vision statements and strategic goals

---

## 🛠️ **Essential Commands for Daily Operations**

### **System Startup & Health**

```bash

# Complete system startup (W Button)

cd /Volumes/DATA/GitHub/rEngine/rEngine
node one-click-startup.js

# Check system health

node memory-sync-manager.js health
./health-monitor.sh
./status-check.sh

# Test core components

node test-mcp-connection.js
node test-memory.js
node test-intelligence.js
```

### **Memory Operations**

```bash

# Add context to memory

node add-context.js

# Recall previous session

node recall.js "recent work"

# Memory system backup

node memory-sync-manager.js backup

# Memory validation

node memory-sync-manager.js pre-commit
```

### **Console and Monitoring**

```bash

# Open scribe console

node scribe-console.js

# Enhanced console with features

node enhanced-scribe-console.js

# Split-screen monitoring

node split-scribe-console.js

# Auto-launch with ASCII art

./auto-launch-scribe.sh
```

### **Documentation and Maintenance**

```bash

# Generate documentation

node document-generator.js

# Run document sweep

node document-sweep.js

# Check protocol compliance

node protocol-compliance-checker.js

# Git checkpoint

bash scripts/git-checkpoint.sh
```

---

## 🔄 **Workflow Integration**

### **Standard Development Workflow**

1. **Start Session**

   ```bash
   cd /Volumes/DATA/GitHub/rEngine/rEngine
   node one-click-startup.js
   ```

1. **Check Current State**
   - Read `MASTER_ROADMAP.md` for current priorities
   - Review `START.md` for project context
   - Check `COPILOT_INSTRUCTIONS.md` for agent protocols

1. **Work on Tasks**
   - Update `MASTER_ROADMAP.md` with progress
   - Use scripts from `RENGINE_SCRIPT_DOCUMENTATION.md`
   - Follow guidelines in relevant .md files

1. **Session Handoff**
   - Memory system automatically creates handoff logs
   - Update roadmap with current status
   - Commit changes with `scripts/git-checkpoint.sh`

### **Agent Handoff Protocol**

1. **Previous Agent Preparation**

   ```bash
   node memory-sync-manager.js pre-commit
   node add-context.js
   ```

1. **New Agent Initialization**

   ```bash
   node one-click-startup.js
   node recall.js "recent work"
   ```

1. **Context Verification**
   - Check `MASTER_ROADMAP.md` for current priorities
   - Review recent git commits
   - Validate system health

---

## 📁 **File Hierarchy and Responsibilities**

### **Critical System Files** (Never Edit Directly)

- `persistent-memory.json` - Master memory index
- `rEngine/system-config.json` - Core configuration
- `package.json` - Project dependencies

### **Safe to Edit Files**

- `MASTER_ROADMAP.md` - Update with new tasks/issues
- Documentation files (.md) - Update as needed
- CSS/JS files - Development changes

### **Auto-Generated Files** (Review Only)

- `docs/generated/` - Auto-generated documentation
- Log files (*.log) - System operation logs
- Backup files (*.backup.json) - Automatic backups

---

## 🚨 **Emergency Procedures**

### **System Not Starting**

```bash

# Check processes

ps aux | grep -E "(smart-scribe|mcp|node)"

# Restart MCP servers

cd /Volumes/DATA/GitHub/rEngine/rEngine
./start-mcp-servers.sh

# Force restart entire system

./restart-full-scribe-system.sh
```

### **Memory System Issues**

```bash

# Check memory health

node memory-sync-manager.js health

# Test MCP connection

node test-mcp-connection.js

# Fallback to JSON

node mcp-fallback-handler.js emergency
```

### **Lost Context Recovery**

```bash

# Recall from memory

node recall.js "last session"

# Check recent git commits

git log --oneline -10

# Review roadmap for current state

cat MASTER_ROADMAP.md
```

---

## 🎯 **Success Indicators**

### **System Running Correctly**

- ✅ Multiple terminal windows open (one-click-startup creates them)
- ✅ Console shows "🔔 MCP Widgets: ENABLED"
- ✅ "🧠 MEMORY SYSTEM: Ready for agent handoffs"
- ✅ No error messages in scribe console
- ✅ Git status clean or committed

### **Ready for Development**

- ✅ `MASTER_ROADMAP.md` shows current priorities
- ✅ All test scripts pass (`test-*.js`)
- ✅ System health check returns green status
- ✅ Memory recall works (`node recall.js "test"`)

---

## 📞 **Quick Reference**

### **Most Important Commands**

```bash

# THE W BUTTON - Complete startup

node one-click-startup.js

# Check what to work on

cat MASTER_ROADMAP.md

# Save progress

bash scripts/git-checkpoint.sh

# Get help with scripts

cat RENGINE_SCRIPT_DOCUMENTATION.md
```

### **Key File Locations**

- **Main Project**: `/Volumes/DATA/GitHub/rEngine/`
- **Scripts**: `/Volumes/DATA/GitHub/rEngine/rEngine/`
- **Documentation**: Root directory (*.md files)
- **Memory**: `/Volumes/DATA/GitHub/rEngine/rMemory/`
- **Web App**: `/Volumes/DATA/GitHub/rEngine/index.html`

### **Emergency Contacts**

- **System Issues**: Check `MASTER_ROADMAP.md` for current critical issues
- **Agent Problems**: Review `COPILOT_INSTRUCTIONS.md` for protocols
- **Memory Issues**: Run `node memory-sync-manager.js health`

---

*This guide covers the essential "W Button" workflow and all critical .md files that control system behavior. For detailed script documentation, see `RENGINE_SCRIPT_DOCUMENTATION.md`.*
