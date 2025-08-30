# 001-MEMORY-MGT-001: Memory Management & Synchronization Protocol

**Protocol ID**: MEMORY-MGT-001  
**Version**: 1.0  
**Priority**: 1 (HIGHEST - Execute First)  
**Status**: ACTIVE  
**Required**: YES  

## 🎯 **Purpose**

Dual-memory architecture management with MCP memory server + local JSON backup. Critical for context preservation across sessions.

## 🚀 **Quick Start Commands**

```bash

# MANDATORY: Start of every session

bash memory-sync-automation.sh manual

# Query memory during session  

node recall.js "last session summary"

# Store important updates

mcp_memory_create_entities [data]

# MANDATORY: End of every session

bash memory-sync-automation.sh manual
```

## 📋 **Protocol Steps**

### **Session Start** (MANDATORY)

1. **Memory Sync**: `bash memory-sync-automation.sh manual`
2. **Verify MCP Connection**: Check MCP server health
3. **Load Context**: `node recall.js` for recent work

### **During Session**

1. **Continuous Updates**: Use MCP tools for strategic updates
2. **Local Scripts**: Only for explicitly local tasks
3. **Context Recording**: Document decisions and reasoning

### **Session End** (MANDATORY)  

1. **Session Handoff**: Store final summary in MCP
2. **Memory Sync**: `bash memory-sync-automation.sh manual`
3. **Verify Backup**: Confirm local files updated

## ⚠️ **Critical Requirements**

- **NEVER skip memory sync** at session start/end
- **Always use absolute file paths**
- **MCP server must be operational** before other protocols
- **Triple redundancy**: MCP + JSON + handoff files

## 🔗 **Related Protocols**

- **002-RENGINE-START-001**: rEngine startup (required for MCP)
- **004-SESSION-HANDOFF-001**: Session context preservation
- **005-RAPID-RECALL-001**: Context loading procedures

---
*This protocol is FOUNDATION TIER - all other protocols depend on it*
