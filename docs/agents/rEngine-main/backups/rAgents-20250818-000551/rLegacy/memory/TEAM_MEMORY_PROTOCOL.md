# Team Memory Protocol - Critical for All AI Agents

## 🎯 **Memory Distribution Rule**

**Established**: August 16, 2025  
**Applies To**: All AI agents working on StackTrackr (GitHub Copilot, Claude, GPT, Gemini, etc.)

## 📝 **Pronoun-Based Memory Classification**

### **Team Memories** (Shared Across All Agents)

**Trigger Words**: "we", "us", "everyone", "team", "all of us", etc.

- **Action**: Store in shared team memory accessible to ALL agents
- **Scope**: GitHub Copilot, Claude, GPT, Gemini, and any future agents
- **Purpose**: Ensures consistent knowledge across the entire AI team
- **Examples**:
  - "We decided to use MemoryChangeBundle format"
  - "Everyone should remember the export workflow"
  - "Our team uses the prompt system for collaboration"

### **Personal Memories** (Agent-Specific)

**Trigger Words**: "You", "your", "yourself", etc.

- **Action**: Store in individual agent's personal memory only
- **Scope**: Current agent (GitHub Copilot) only
- **Purpose**: Agent-specific context and preferences
- **Examples**:
  - "You prefer to use semantic search before file reading"
  - "Your coding style emphasizes clear documentation"
  - "You should remember my preference for TypeScript"

## 🔄 **Implementation Guidelines**

### **For All AI Agents**

1. **Listen for pronouns** in user communications
2. **Classify memory type** based on pronoun usage
3. **Route memories appropriately**:
   - Team pronouns → Shared memory systems
   - Personal pronouns → Agent-specific memory
1. **Cross-reference** this protocol before storing any memory

### **Memory Storage Locations**

- **Team Memories**:
  - `agents/memory/` folder
  - `agents/github_copilot_memories.json`
  - `agents/claude_sonnet_memories.json`
  - `agents/gpt4_memories.json`
  - etc.
- **Personal Memories**: Agent-specific memory systems

## ⚠️ **Critical Importance**

This protocol ensures:

- **Consistency** across all AI agents
- **Proper knowledge distribution**
- **Efficient collaboration** between agents
- **Respect for user's memory intentions**
- **Seamless handoffs** between AI agents

## 🎯 **User Intent Recognition**

The user (lbruton) established this protocol because:

- Multiple AI agents work on StackTrackr
- Some knowledge needs to be shared (team decisions, workflows)
- Some knowledge is agent-specific (personal preferences, individual context)
- Proper memory distribution is critical for effective multi-agent collaboration

## 📋 **Quick Reference**

| User Says | Memory Type | Storage | Access |
|-----------|-------------|---------|---------|
| "We should..." | Team | Shared | All agents |
| "Everyone needs to..." | Team | Shared | All agents |
| "You should remember..." | Personal | Individual | Current agent only |
| "Your preference is..." | Personal | Individual | Current agent only |

---

**⚡ REMINDER**: Check this protocol EVERY TIME before storing memories!
