# Handoff Directory

**Purpose**: Storage for timestamped agent handoff files and session summaries.

## 📁 **Directory Contents**

This directory contains backup handoff files created during session transitions. Each file represents a complete context handoff between AI agents or session boundaries.

### **File Naming Convention**

- **Format**: `handoff-YYYY-MM-DD-HHMMSS.prompt.md`
- **Example**: `handoff-2025-08-19-143022.prompt.md`
- **Timezone**: All timestamps in local system time

### **File Purpose**

- **Primary**: Backup for MCP memory system handoffs
- **Secondary**: Human-readable session summaries
- **Fallback**: Context recovery when MCP memory unavailable
- **Archive**: Historical record of agent work sessions

## 🔄 **Integration with Memory Systems**

### **Current Architecture**

- **MCP Memory**: Primary storage for handoff entities
- **Handoff Files**: Backup storage in this directory
- **Agent Memory**: Cross-reference with MCP system

### **Post-SQLite Migration**

- **Database**: Primary storage with FTS5 search
- **Handoff Files**: Backup storage (retained)
- **Rolling Context**: Reduced need for frequent handoffs

## 📋 **File Format**

Each handoff file contains:

- **Agent Information**: Source and target agents
- **Session Summary**: Complete work overview
- **System State**: Current platform status
- **Action Items**: Next steps and priorities
- **References**: Git commits, MCP entities, related files

## 🛠️ **Maintenance**

### **Automatic Cleanup**

- **Retention**: 90 days for handoff files
- **Archival**: Compress files older than 30 days
- **Integration**: Part of PROJECT-005 log cleanup system

### **Manual Management**

- **Review**: Users can read files directly for context
- **Search**: Grep through files for historical decisions
- **Recovery**: Restore context from backup files

## 🔍 **Usage Examples**

### **For Users**

```bash

# View recent handoffs

ls -la handoffs/ | head -10

# Search for specific work

grep -r "rSearch" handoffs/

# Read latest handoff

cat handoffs/handoff-$(ls handoffs/ | tail -1)
```

### **For AI Agents**

- **Startup**: Check latest handoff for context
- **Recovery**: Read backup when MCP unavailable
- **Reference**: Historical decision tracking

## 📚 **Related Protocols**

- [`session_handoff_protocol.md`](../rProtocols/session_handoff_protocol.md) - Complete handoff process
- [`memory_management_protocol.md`](../rProtocols/memory_management_protocol.md) - MCP integration
- [`documentation_structure_protocol.md`](../rProtocols/documentation_structure_protocol.md) - File organization

---

**Note**: This directory serves as the fallback context preservation system until rolling memory implementation. It ensures no critical work context is ever lost between sessions.
