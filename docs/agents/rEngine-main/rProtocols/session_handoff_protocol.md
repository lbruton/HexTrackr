# Protocol: Session Handoff & Summarization

**Version:** 1.0  
**Date:** August 19, 2025  
**Status:** ACTIVE  
**Priority:** HIGH  

## Overview

This protocol defines the process for summarizing conversations, creating handoffs between AI agents, and preserving context for future sessions. It serves as the primary context management solution until the rolling memory system (PROJECT-003 SQLite migration) is implemented.

## When to Use This Protocol

### **Trigger Conditions**

- User explicitly requests "summarize" or mentions this protocol
- Conversation context becomes unwieldy (approaching token limits)
- Major work session completion requiring handoff
- End of development session before starting new chat
- Critical decision points that need preservation

### **User Commands**

- "summarize" - Trigger full summarization and handoff process
- "handoff" - Create agent-to-agent handoff without ending session
- "checkpoint" - Save current state with git commit

## Summarization Process

### **STEP 1: Conversation Analysis**

Analyze the current chat for:

- **Primary Objectives**: What user wanted to accomplish
- **Work Completed**: Specific tasks, files modified, systems updated
- **Decisions Made**: Technical choices, architectural decisions, protocol updates
- **Unfinished Tasks**: What remains to be done
- **Context for Next Session**: Critical information for continuation

### **STEP 2: Create Comprehensive Summary**

Generate a structured summary including:

```markdown

# Session Summary - [YYYY-MM-DD HH:MM]

## 🎯 Session Objectives

- [Primary goals user stated]
- [Secondary objectives that emerged]

## ✅ Completed Work

- [Specific files modified with brief description]
- [Systems updated or configured]  
- [Documentation created or updated]
- [Protocols established or modified]

## 🧠 Key Decisions Made

- [Technical decisions with reasoning]
- [Architectural choices]
- [Protocol updates or new procedures]

## 📋 Remaining Tasks

- [Unfinished work items]
- [Next logical steps]
- [Dependencies or blockers]

## 🔍 Critical Context for Next Agent

- [Essential information for continuation]
- [Current system state]
- [Important discoveries or insights]

## 📂 Modified Files

- [List of all files changed with brief description]

## 🚨 Important Notes

- [Any warnings, constraints, or special considerations]

```

### **STEP 3: Memory System Integration**

#### **MCP Memory Storage (Primary)**

```javascript
// Store handoff in MCP memory system
mcp_memory_create_entities([{
  "entityType": "session_handoff",
  "name": "Session Handoff YYYY-MM-DD HH:MM",
  "observations": [
    "Session summary with key accomplishments",
    "Critical decisions and reasoning",
    "Files modified and their purposes", 
    "Next steps and remaining tasks",
    "Important context for continuation"
  ]
}])
```

#### **Local Handoff File (Backup)**

Create timestamped file in `/rDocuments/handoffs/` directory:

- **Filename**: `handoff-YYYY-MM-DD-HHMMSS.prompt.md`
- **Content**: Full session summary in prompt format
- **Purpose**: Fallback if MCP memory unavailable

### **STEP 4: Git Checkpoint**

- **Commit all changes** with descriptive message
- **Tag checkpoint** with session identifier
- **Verify clean working state** for next agent

### **STEP 5: User Confirmation**

Provide written confirmation including:

- Summary of work completed
- Location of handoff files
- Git commit hash
- Instructions for starting fresh chat

## Handoff File Format

### **Template: handoff-YYYY-MM-DD-HHMMSS.prompt.md**

```markdown

# Agent Handoff - [Date Time]

**From Agent**: [Current agent name]
**To Agent**: [Next agent or "Future Session"]  
**Session ID**: [Unique identifier]
**Git Commit**: [Commit hash]

## Context for Next Agent

You are continuing work on the rEngine platform and StackTrackr project. This handoff contains critical context from the previous session.

## Previous Session Summary

[Structured summary as defined above]

## Immediate Actions Required

- [ ] [Priority task 1]
- [ ] [Priority task 2]
- [ ] [Any urgent items]

## System State

- **Platform Services**: [Status of rEngine components]
- **Documentation**: [Recent updates]
- **Protocols**: [New or modified procedures]
- **Memory System**: [MCP status and recent updates]

## Working Files

[List of files that were actively being modified]

## References

- MCP Memory Entity: "Session Handoff [timestamp]"
- Git Commit: [hash]
- Related Protocols: [List relevant protocols]

---
**Note**: This handoff is stored in both MCP memory and this backup file for redundancy.
```

## Implementation Instructions

### **For AI Agents**

When user triggers summarization:

1. **Analyze Conversation**: Review entire chat for key points
2. **Generate Summary**: Use structured format above
3. **Store in MCP Memory**: Create session_handoff entity
4. **Create Backup File**: Save to /rDocuments/handoffs/ directory
5. **Git Checkpoint**: Commit all changes
6. **Confirm with User**: Provide completion notice

### **For Users**

- Use "summarize" command when ready to start fresh chat
- Review generated summary before starting new session
- Reference handoff files when needed
- Trust that context is preserved in memory systems

## Error Handling

### **MCP Memory Unavailable**

- **Fallback**: Rely entirely on local handoff files
- **Warning**: Inform user of degraded functionality
- **Recovery**: Attempt MCP restoration in next session

### **Git Issues**

- **Alternative**: Create manual backup of current state
- **Documentation**: Record what couldn't be committed
- **Recovery**: Address git issues in next session

### **File System Issues**

- **Minimum**: Provide summary in chat for user to copy
- **Fallback**: Use any available storage mechanism
- **Recovery**: Recreate handoff files when possible

## Integration with Rolling Memory

### **Transition Plan**

- **Current**: JSON + MCP + handoff files (triple redundancy)
- **Post-SQLite**: Database + handoff files (dual redundancy)
- **Future**: Rolling context may reduce handoff frequency

### **Compatibility**

- Handoff format designed to work with future systems
- MCP memory entities will migrate to SQLite
- File format remains stable across transitions

## Quality Standards

### **Summary Quality**

- **Comprehensive**: Cover all significant work
- **Actionable**: Next agent can immediately continue
- **Contextual**: Include reasoning behind decisions
- **Organized**: Easy to scan and understand

### **Technical Accuracy**

- **File Lists**: Accurate inventory of changes
- **System State**: Current platform status
- **Dependencies**: Clear understanding of prerequisites

## Related Protocols

- [`memory_management_protocol.md`](memory_management_protocol.md) - MCP memory system usage
- [`documentation_structure_protocol.md`](documentation_structure_protocol.md) - File organization
- [`rEngine_startup_protocol.md`](rEngine_startup_protocol.md) - Platform initialization

---

**Note**: This protocol is critical for maintaining context continuity until rolling memory implementation. It ensures no work is lost and every session can build effectively on previous accomplishments.
