# 🧠 **CONTINUOUS MEMORY & BACKUP PROTOCOL**

## 🚨 **CRITICAL WORKFLOW REQUIREMENTS**

This protocol addresses the identified gap where agents stop writing to memory and making git backups as sessions progress. **THESE ARE MANDATORY PRACTICES**.

---

## 📋 **MANDATORY STARTUP SEQUENCE**

### **STEP 0: Docker Environment (MANDATORY)**

🐳 **CRITICAL**: Always use Docker to prevent macOS security slowdowns!

```bash

# PRIMARY startup (Docker-based) - MANDATORY

cd /Volumes/DATA/GitHub/rEngine && ./docker-dev.sh start

# Verify Docker containers running

docker ps
```

## Docker Benefits:

- ❌ No macOS security prompts
- ⚡ Faster command execution  
- 🔒 Consistent development environment
- 🚀 Zero VS Code script execution delays

### **STEP 1: System Launch**

```bash

# Inside Docker container or fallback

cd /Volumes/DATA/GitHub/rEngine/rEngine && node one-click-startup.js
```

### **STEP 2: MANDATORY MEMORY RECAP**

## 🔴 REQUIRED - Ask memory scribe for context:

```bash

# Get last hour of work (MANDATORY)

node recall.js "last hour of work"

# Get recent progress summary (MANDATORY)  

node memory-intelligence.js recall "recent progress"

# Get current session status (MANDATORY)

node recall.js "current session status"
```

### **STEP 3: Verify Memory Access**

```bash

# Test MCP Memory connection (MANDATORY)

node recall.js "test connection"
```

---

## ⚡ **CONTINUOUS MEMORY PROTOCOL**

### **After Every Major Task Completion:**

1. **Write to MCP Memory** (use MCP tools)
2. **Add context entry**:

   ```bash
   node add-context.js "Task Title" "What was accomplished" "completion"
   ```

1. **Git checkpoint**:

   ```bash
   bash scripts/git-checkpoint.sh
   ```

### **Memory Write Triggers** (MANDATORY)

- ✅ **File Creation/Modification** → Write to memory
- ✅ **Problem Solved** → Document solution  
- ✅ **Bug Fixed** → Record fix pattern
- ✅ **Feature Added** → Update knowledge base
- ✅ **Configuration Changed** → Log modification
- ✅ **Discovery Made** → Preserve insight

### **Git Backup Triggers** (MANDATORY)

- ✅ **Every 15 minutes** during active work
- ✅ **Before major file changes**
- ✅ **After completing any task**
- ✅ **Before switching contexts**
- ✅ **When user requests new feature**
- ✅ **At session milestones**

---

## 🔄 **SESSION MAINTENANCE HABITS**

### **Every 10-15 Minutes During Work:**

```bash

# Quick memory sync

node add-context.js "Progress Update" "Current work: [describe]" "progress"

# Git checkpoint  

bash scripts/git-checkpoint.sh
```

### **When Context Switching:**

```bash

# Document current state

node add-context.js "Context Switch" "Switching from X to Y because..." "transition"

# Backup current work

bash scripts/git-checkpoint.sh
```

### **Before Major Changes:**

```bash

# Document intent

node add-context.js "Pre-Change" "About to modify X for Y reason" "planning"

# Safety backup

bash scripts/git-checkpoint.sh  
```

---

## 🎯 **MEMORY WRITING EXAMPLES**

### **Use MCP Memory Tools For:**

- Project decisions and rationale
- Bug patterns and solutions  
- Feature implementations
- Configuration discoveries
- User feedback and requests
- System behavior observations

### **Use add-context.js For:**

- Quick progress logs
- Session transitions
- Problem-solving steps
- Discovery documentation
- Workflow improvements

---

## 🚨 **ENFORCEMENT REMINDERS**

### **Set Mental Triggers:**

- "Just completed a task" → Memory + Git
- "About to start something new" → Memory + Git
- "Found a solution" → Memory + Git
- "User gave feedback" → Memory + Git
- "Made a discovery" → Memory + Git

### **Visual Cues:**

- Look for `🟢 >RAN MCP Memory Write:` notifications
- Check terminal for git checkpoint confirmations
- Monitor Smart Scribe console activity

---

## � **DOCKER PROTOCOL INTEGRATION**

### **ALL COMMANDS MUST USE DOCKER:**

```bash

# Correct Docker command pattern (NO user prompts)

docker-compose exec -T development node /workspace/rEngine/add-context.js "Title" "Description" "type"

# Docker-based memory recap (MANDATORY startup)

docker-compose exec -T development node /workspace/rEngine/recall.js "last hour of work"

# Docker-based git checkpoints

docker-compose exec -T development bash /workspace/scripts/git-checkpoint.sh
```

### **Key Docker Requirements:**

- ✅ Use `-T` flag to disable TTY allocation (prevents prompts)
- ✅ Use full workspace paths `/workspace/rEngine/`
- ✅ Never run commands on host system during development
- ✅ All memory, recall, and git operations through Docker

## �🔧 **PROTOCOL INTEGRATION**

### **Update COPILOT_INSTRUCTIONS.md:**

- Add mandatory memory recap requirement
- Include continuous memory triggers  
- Embed git checkpoint habits
- **ENFORCE Docker-only command execution**

### **Update Agent Workflows:**

- Make memory writing automatic habit
- Enforce git backup discipline
- Create accountability checkpoints
- **Use Docker for ALL development commands**

---

**Priority**: P0 (Critical)  
**Requirement**: MANDATORY for all agents  
**Enforcement**: Every session, every task  
**Goal**: Never lose context or progress again

> **Remember**: Your memory and git backups are "LLM vitamins" - they keep the entire system healthy and preserve all progress for future agents and sessions.
