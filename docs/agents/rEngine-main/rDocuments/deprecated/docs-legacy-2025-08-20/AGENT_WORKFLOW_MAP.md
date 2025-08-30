# 🗺️ rEngine Platform Agent Workflow Map

*Complete File Structure and Flow Documentation for v2.1.0*

## 📋 **Table of Contents**

1. [Entry Points & Initialization](#entry-points--initialization)
2. [Core Workflow Files](#core-workflow-files)
3. [Memory System Architecture](#memory-system-architecture)
4. [Mobile Development System](#mobile-development-system)
5. [Docker Container Management](#docker-container-management)
6. [Template & Backup System](#template--backup-system)
7. [User Customization Guide](#user-customization-guide)
8. [Emergency Recovery](#emergency-recovery)

---

## 🚀 **Entry Points & Initialization**

### **Primary Entry Point**

```
COPILOT_INSTRUCTIONS.md (Read-Write, Current)
├── Purpose: Main agent instructions and system access
├── Contains: Complete bootstrap protocol, memory sources, commands
├── Updates: Live updates as system evolves
└── Flow: → one-click-startup.js → recall.js → ready state
```

### **Emergency Backup Entry Point**

```
START.md (Read-Only, Protected)
├── Purpose: Emergency backup when COPILOT_INSTRUCTIONS.md fails
├── Protection: Write-protected (chmod 444)
├── Usage: Human fallback only, not for agent updates
└── Restoration: Manual copy from COPILOT_INSTRUCTIONS.md when needed
```

### **Secondary Reference Points**

```
AGENT.md (Read-Write, Reference)
├── Purpose: Quick protocol overview and critical warnings
├── Contains: Directory structure, mandatory steps, violations
└── Flow: → COPILOT_INSTRUCTIONS.md → rAgents/unified-workflow.md

AGENT_HANDOFF_SYSTEM_GUIDE.md (Read-Write, Documentation)
├── Purpose: Complete handoff system documentation
├── Contains: File structure, initialization commands, troubleshooting
└── Usage: Reference for understanding system architecture
```

---

## ⚙️ **Core Workflow Files**

### **1. System Initialization**

```
rEngine/
├── one-click-startup.js ⭐ CRITICAL ENTRY POINT
│   ├── Purpose: Complete system initialization
│   ├── Actions: Git backup, MCP start, Scribe launch, dashboard
│   ├── Dependencies: universal-agent-init.js, agent-hello-workflow.js
│   └── Output: Live dashboard + ready state
│
├── universal-agent-init.js
│   ├── Purpose: Agent-specific initialization 
│   ├── Actions: Memory file creation, protocol checks, context loading
│   ├── Creates: rMemory/rAgentMemories/{agent}-memory.json
│   └── Flow: → dual-memory-writer.js → agent menu
│
├── agent-hello-workflow.js
│   ├── Purpose: Auto-detect new sessions and initialize
│   ├── Status: Manual trigger (automatic detection needs implementation)
│   ├── Actions: Hello detection, handoff reading, context presentation
│   └── Dependencies: recall.js, add-context.js
│
└── enhanced-agent-init.js
    ├── Purpose: Advanced initialization with LLM optimization
    ├── Actions: System checks, memory init, LLM config, MCP setup
    ├── Creates: active-agent-profile.json, extendedcontext.json
    └── Output: Agent profile with optimal configuration
```

### **2. Memory Operations**

```
rEngine/
├── recall.js ⭐ PRIMARY MEMORY ACCESS
│   ├── Purpose: Fast memory search and retrieval
│   ├── Usage: node recall.js "search term"
│   ├── Speed: < 2 seconds for most queries
│   └── Sources: All agent memories, context files, handoffs
│
├── memory-intelligence.js
│   ├── Purpose: Advanced semantic search with patterns
│   ├── Usage: node memory-intelligence.js recall "complex query"
│   ├── Features: Temporal searches, pattern matching, relationships
│   └── Backend: Smart Scribe + Ollama integration
│
├── add-context.js
│   ├── Purpose: Add new discoveries to memory system
│   ├── Usage: node add-context.js "title" "description" [type]
│   ├── Actions: Dual memory write (MCP + file system)
│   └── Types: fix, feature, handoff, decision, etc.
│
└── dual-memory-writer.js
    ├── Purpose: Ensure consistency between MCP and file memories
    ├── Actions: Sync MCP server with local JSON files
    ├── Prevents: Memory fragmentation and loss
    └── Auto-called: By add-context.js and initialization scripts
```

### **3. System Management**

```
scripts/
├── git-checkpoint.sh
│   ├── Purpose: Create git backup before significant changes
│   ├── Auto-called: By one-click-startup.js and protocol checks
│   ├── Actions: Stage all changes, commit with timestamp
│   └── Safety: Prevents work loss during agent transitions
│
├── restart-full-scribe-system.sh
│   ├── Purpose: Emergency restart of all background systems
│   ├── Actions: Kill existing processes, restart MCP, launch Scribe
│   ├── Usage: When systems become unresponsive
│   └── Recovery: Full system restoration
│
└── protocol-compliance-checker.js
    ├── Purpose: Validate system state and protocol adherence
    ├── Checks: File containment, memory consistency, backup status
    ├── Actions: Auto-fix violations or alert user
    └── Usage: node protocol-compliance-checker.js check
```

---

## 🧠 **Memory System Architecture**

### **Agent-Specific Memories**

```
rMemory/rAgentMemories/
├── claude-memory.json (Claude sessions)
├── gpt-memory.json (GPT sessions)
├── github_copilot_memories.json (VS Code Copilot)
├── gemini-memory.json (Gemini sessions)
├── active-agent-profile.json (Current agent config)
├── extendedcontext.json (Cross-session context)
├── handoff.json (Agent transition data)
├── tasks.json (Current assignments & priorities)
├── decisions.json (Architectural decisions)
├── functions.json (Code ownership & responsibilities)
└── memory.json (Core project knowledge)
```

### **Shared Intelligence Sources**

```
rMemory/rAgentMemories/
├── templates/ (Template system for restoration)
│   ├── project-initialization.md
│   ├── bug_resolution_template.md
│   ├── theme-template.md
│   └── agent_readme.md
│
├── notes/ (Development guidelines)
│   ├── consolidated-development-guide.md
│   ├── rengine-architecture-vision.md
│   ├── naming-guidelines.md
│   └── patch-notes-guidelines.md
│
├── tasks/ (Task management)
│   ├── comprehensive-audit-task.md
│   └── agent-prompts.md
│
└── catch-up-{timestamp}.md (Auto-generated summaries)
```

---

## � **Mobile Development System**

### **Mobile Checkout System**

```
scripts/mobile-checkout.js (Mobile Development Package Creator)
├── Purpose: Create portable development environments
├── Features:
│   ├── Git-ignored file analysis and packaging
│   ├── API key extraction and masking
│   ├── Mobile configuration generation with fallbacks
│   └── Secure zip package creation (29MB typical)
│
├── Output Files:
│   ├── mobile-checkout-{timestamp}.zip (Complete package)
│   ├── mobile-checkout-{timestamp}-manifest.json (Package contents)
│   └── mobile-setup.sh (Auto-setup script)
│
└── Command: npm run mobile-checkout
```

### **Mobile Environment Structure**

```
mobile-checkout-{timestamp}.zip Contents:
├── ignored-files/ (Git-ignored sensitive files)
│   ├── openwebui-api-keys.env
│   ├── rEngine/.env
│   ├── rMemory/.env
│   └── All *secret*, *key*, *token* files
│
├── mobile-configs/ (Fallback configurations)
│   ├── mobile-config.json (API fallback settings)
│   ├── environment-overrides.json (Mobile-specific configs)
│   └── api-key-map.json (Masked key references)
│
├── mobile-setup.sh (One-click environment setup)
├── package.json (Mobile dependencies)
└── README-MOBILE.md (Setup instructions)
```

### **Mobile Checkin System**

```
scripts/mobile-checkin.js (Change Merge System)
├── Purpose: Merge mobile development back to main environment
├── Features:
│   ├── Change analysis and conflict detection
│   ├── Smart merge for non-conflicting files
│   ├── Backup creation before merging
│   └── Memory system integration
│
├── Output Files:
│   ├── mobile-checkin-{timestamp}-report.json (Merge summary)
│   ├── .backup-{timestamp}/ (Original file backups)
│   └── conflict-resolution-{timestamp}.md (Manual review guide)
│
└── Command: npm run mobile-checkin mobile-checkout-{timestamp}
```

### **API Fallback Configuration**

```
mobile-configs/mobile-config.json Structure:
{
  "fallback_apis": {
    "openai": { "model": "gpt-4o-mini", "enabled": true },
    "anthropic": { "model": "claude-3-haiku", "enabled": true },
    "groq": { "model": "llama-3.1-70b", "enabled": false },
    "gemini": { "model": "gemini-1.5-pro", "enabled": true }
  },
  "mobile_limitations": {
    "no_docker": true,
    "no_ollama": true,
    "api_only": true,
    "lightweight_mode": true
  },
  "security": {
    "mask_keys_in_logs": true,
    "backup_before_merge": true,
    "write_protect_backups": true
  }
}
```

---

## 🐳 **Docker Container Management**

### **Port Allocation System (v2.1.0)**

```
docker-compose.yml Port Mapping:
├── Port Range: 3032-3038 (Dedicated, no conflicts)
├── Services:
│   ├── nginx (Entry Point): 3032:80, 3038:443
│   ├── stacktrackr-app: 3033:3000
│   ├── rengine-platform: 3034:8080, 3035:8081
│   ├── mcp-server: 3036:8082
│   └── development: 3037:8000
│
├── Access Points:
│   ├── 🌐 Main Entry: http://localhost:3032
│   ├── 📱 App Direct: http://localhost:3033
│   ├── 🤖 rEngine API: http://localhost:3034
│   └── 🧠 MCP Server: http://localhost:3036
│
└── Benefits:
    ├── ✅ Zero port conflicts with MCP Memory (port 3000)
    ├── ✅ Professional multi-service architecture
    └── ✅ Easy service isolation and debugging
```

### **Docker Development Scripts**

```
docker-dev.sh (Container Management)
├── Purpose: One-click Docker environment management
├── Commands:
│   ├── ./docker-dev.sh start (Start all services)
│   ├── ./docker-dev.sh stop (Stop all services)
│   ├── ./docker-dev.sh restart (Restart all services)
│   └── ./docker-dev.sh logs [service] (View service logs)
│
├── Features:
│   ├── Health check validation
│   ├── Service dependency management
│   ├── Automatic port conflict detection
│   └── Development environment setup
│
└── Integration: Works with mobile development system
```

### **Docker Requirement Validation**

```
scripts/docker-requirement-check.sh (System Validation)
├── Purpose: Validate Docker installation and requirements
├── Checks:
│   ├── Docker installation and version
│   ├── Docker daemon status
│   ├── Available system resources
│   └── Port availability in 3032-3038 range
│
├── Outputs:
│   ├── Installation guidance for missing components
│   ├── Resource recommendations
│   └── Port conflict resolution steps
│
└── Integration: Called by one-click-startup.js
```

---

## �📚 **Template & Backup System**

### **Baseline Templates (For Recovery)**

```
rMemory/rAgentMemories/templates/
├── project-initialization.md ⭐ PROJECT SETUP TEMPLATE
│   ├── Purpose: Clean project structure template
│   ├── Usage: Restore project setup when borked
│   └── Contains: Directory structure, essential files, protocols
│
├── bug_resolution_template.md
│   ├── Purpose: Standardized bug fixing workflow
│   ├── Usage: Consistent debugging approach
│   └── Contains: Issue analysis, solution steps, verification
│
├── theme-template.md
│   ├── Purpose: UI theme customization template
│   ├── Usage: Restore default styling when CSS breaks
│   └── Contains: Color schemes, layout patterns, components
│
└── agent_readme.md
    ├── Purpose: Agent documentation template
    ├── Usage: Create new agent instruction sets
    └── Contains: Standard agent protocols, capabilities, limits
```

### **Backup Locations**

```
backups/
├── rAgents-{timestamp}/ (Complete rAgents backup)
├── rEngine-{timestamp}/ (Complete rEngine backup)
├── mcp_memory/ (MCP server memory backups)
└── logs-{timestamp}/ (System log archives)

archive/
├── agents/ (Historical agent configurations)
├── tests/ (Test result archives)
├── root/ (Root file backups)
└── benchmark_results/ (Performance benchmarks)
```

---

## 🛠️ **User Customization Guide**

### **Safe Customization Areas**

#### **1. Agent Instructions (COPILOT_INSTRUCTIONS.md)**

```yaml
Customizable Sections:

  - Memory Sources: Add custom memory files
  - Smart Search Commands: Modify search patterns
  - Project Status: Update current workflow
  - Terminal Commands: Add custom automation

Backup Strategy:

  - Copy to START.md before major changes
  - Use git checkpoints frequently
  - Test changes with protocol-compliance-checker.js

```

#### **2. Memory Templates**

```yaml
Template Files:

  - rMemory/rAgentMemories/templates/*.md
  - Modify for project-specific workflows
  - Add custom agent prompts
  - Create domain-specific templates

Restoration:

  - Keep original templates in backups/
  - Document changes in decisions.json
  - Version control custom templates

```

#### **3. System Scripts**

```yaml
Customizable Scripts:

  - rEngine/recall.js: Modify search algorithms
  - rEngine/add-context.js: Add custom memory types
  - scripts/: Add project-specific automation

Safety Rules:

  - Always backup before modification
  - Test with small changes first
  - Document modifications in memory system

```

### **Configuration Points**

#### **Memory System Configuration**

```javascript
// rEngine/memory-intelligence.js
const CONFIG = {
  searchDepth: 3,           // Customizable: How deep to search
  maxResults: 20,           // Customizable: Result limit
  semanticThreshold: 0.7,   // Customizable: Relevance threshold
  temporalSearchDays: 30    // Customizable: Time window
}
```

#### **Agent Initialization Settings**

```javascript
// rEngine/universal-agent-init.js
const AGENT_CONFIG = {
  memoryFileSize: "10MB",      // Customizable: Memory file limits
  backupFrequency: "session",  // Customizable: Backup frequency
  protocolLevel: "strict",     // Customizable: Enforcement level
  autoHandoff: false           // Customizable: Auto handoff detection
}
```

#### **Docker Environment Settings**

```yaml

# docker-compose.yml - Customizable ports and resources

services:
  stacktrackr-app:
    ports:

      - "3000:3000"    # Customizable: External port

    environment:

      - NODE_ENV=development  # Customizable: Environment

```

---

## 🆘 **Emergency Recovery**

### **Complete System Recovery**

```bash

# 1. Emergency Stop

./docker-dev.sh stop
pkill -f "smart-scribe"
pkill -f "mcp"

# 2. Restore from Backup

cp START.md COPILOT_INSTRUCTIONS.md
cp -r backups/rAgents-latest/* rAgents/
cp -r backups/rEngine-latest/* rEngine/

# 3. Fresh Initialization  

cd rEngine && node one-click-startup.js
node protocol-compliance-checker.js check
```

### **Selective Recovery**

#### **Memory System Recovery**

```bash

# Restore memory templates

cp -r rMemory/rAgentMemories/templates/* rMemory/rAgentMemories/
rm rMemory/rAgentMemories/*-memory.json
node rEngine/universal-agent-init.js
```

#### **Agent Instructions Recovery**

```bash

# Restore protected instructions

cp START.md COPILOT_INSTRUCTIONS.md
chmod 644 COPILOT_INSTRUCTIONS.md
node protocol-compliance-checker.js check
```

#### **Docker Environment Recovery**

```bash

# Reset containers

./docker-dev.sh down --volumes
./docker-dev.sh build --no-cache
./docker-dev.sh start
```

### **Validation Commands**

```bash

# System Health Check

node protocol-compliance-checker.js check
node recall.js "system status" 
./scripts/docker-requirement-check.sh

# Memory Integrity Check

node memory-intelligence.js recall "recent work"
ls -la rMemory/rAgentMemories/*.json

# Container Health Check

./docker-dev.sh status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

---

## 📊 **Summary: Complete Flow**

```mermaid
graph TD
    A[User Starts Session] --> B{Docker Check}
    B -->|Missing| C[Install Docker]
    B -->|OK| D[COPILOT_INSTRUCTIONS.md]
    C --> D
    D --> E[one-click-startup.js]
    E --> F[universal-agent-init.js]
    F --> G[recall.js "recent work"]
    G --> H[Agent Ready State]
    
    H --> I[Development Work]
    I --> J[add-context.js]
    J --> K[git checkpoint]
    K --> L[handoff.json]
    L --> M[Next Agent Session]
    M --> D
    
    D -->|Fails| N[START.md Emergency]
    N --> E
    
    E -->|Fails| O[Emergency Recovery]
    O --> P[Restore from Backups]
    P --> E
```

---

## 🎯 **Key Principles**

1. **COPILOT_INSTRUCTIONS.md is the living document** - always current
2. **START.md is the emergency backup** - write-protected, manually updated
3. **Templates enable recovery** - baseline configurations for restoration
4. **Memory is dual-stored** - MCP + file system for redundancy
5. **Docker eliminates prompts** - consistent environment across systems
6. **Git checkpoints prevent loss** - automatic backups before changes
7. **Protocol compliance prevents violations** - automatic validation and fixes

**🔄 This document should be updated whenever the workflow changes!**

---

*Last Updated: August 18, 2025*  
*System: rEngine Platform v2.1.0*  
*Status: Production Ready with Docker Integration*
