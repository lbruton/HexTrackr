# 004-SESSION-HANDOFF-001: Session Handoff & Summarization Protocol

**Protocol ID**: SESSION-HANDOFF-001  
**Version**: 1.0  
**Priority**: 4 (Critical for context preservation)  
**Status**: ACTIVE  
**Required**: YES  

## 🎯 **Purpose**

Context preservation between sessions. Creates MCP memory entities + backup files. Critical until rolling memory implemented.

## 🚀 **Quick Start Commands**

```bash

# Create session handoff (triggered by user "summarize" request)

mcp_memory_create_entities([{
  "entityType": "session_handoff",
  "name": "Session Handoff YYYY-MM-DD HH:MM",
  "observations": ["Summary", "Decisions", "Files modified", "Next steps"]
}])

# Backup file creation

# File: /rDocuments/handoffs/handoff-YYYY-MM-DD-HHMMSS.prompt.md

```

## 📋 **Protocol Steps**

### **When to Execute**

- User requests "summarize" or "handoff"
- End of long work session
- Before major system changes
- Context getting too large

### **Handoff Process**

1. **Analyze Conversation**: Review entire chat for key points
2. **Generate Summary**: Use structured format
3. **Store in MCP Memory**: Create session_handoff entity
4. **Create Backup File**: Save to /rDocuments/handoffs/
5. **Git Checkpoint**: Commit all changes
6. **Confirm with User**: Provide completion notice

### **Required Content**

- **Session Summary**: Key accomplishments and work completed
- **Critical Decisions**: Important choices made with reasoning
- **Files Modified**: Complete list with purposes
- **Next Steps**: Clear actions for continuation
- **Context Notes**: Essential information for next agent

## ⚠️ **Critical Requirements**

- **NEVER lose context** - always create backup files
- **MCP memory is primary** - backup files are fallback
- **Git commit required** with session summary
- **User confirmation** of handoff completion

## 🔗 **Related Protocols**

- **001-MEMORY-MGT-001**: Memory sync after handoff
- **005-RAPID-RECALL-001**: Context loading next session
- **020-GIT-STANDARDS-001**: Proper commit messages

---
*Essential for context continuity until rolling memory system implemented*
