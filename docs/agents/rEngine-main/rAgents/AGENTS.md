# StackTrackr Agent System Instructions

**MANDATORY**: All agents must follow the StackTrackr agent workflow protocols.

## 📋 **Primary Instructions**

→ See `agents/unified-workflow.md` for complete agent workflow guidance

**NOTE**: The memory system below is bootstrapped for quick startup, but you MUST still read the full unified-workflow.md for comprehensive protocols, detailed memory structure, and complete task coordination guidelines.

---

## 🧠 **MEMORY SYSTEM (Bootstrapped)**

### **Agent Identity & Memory Files**

- **GitHub Copilot**: `agents/github_copilot_memories.json`
- **Claude 3.5 Sonnet**: `agents/claude_sonnet_memories.json`
- **GPT-4/GPT-4o**: `agents/gpt4_memories.json`, `agents/gpt4o_memories.json`
- **Gemini Pro**: `agents/gemini_pro_memories.json`
- **Claude Opus**: `agents/claude_opus_memories.json`

### **Shared Memory Index (Essential Files)**

```json
{
  "tasks": "agents/tasks.json",        // Current project status & assignments
  "agents": "agents/agents.json",      // Agent capabilities & selection
  "decisions": "agents/decisions.json", // Architectural decisions
  "functions": "agents/functions.json", // Function ownership
  "errors": "agents/errors.json",      // Known issues & solutions
  "memory": "agents/memory.json",      // Shared project memory
  "preferences": "agents/preferences.json", // Project settings
  "styles": "agents/styles.json",       // Visual style definitions
  "patterns": "agents/patterns.json",      // Learning patterns to prevent recurring errors and improve efficiency
}
```

### **Auto-Initialization Checklist**

Every agent MUST execute on "Hello" or new session:

1. **Identify yourself** and load correct memory file
2. **Check sync status**: Run `agents/scripts/sync_tool.sh status`
3. **Read tasks.json** for current assignments (after confirming sync)
4. **Update shared_memory_index** timestamps
5. **Report status** using standard format:

```
🤖 Agent Status Check:

- Agent: [AGENT_NAME]
- Current Task: [TASK_NAME or "None assigned"]
- Phase/Step: [Current position]
- Next Action: [What you would do next]
- Sync Status: [In sync/Needs sync/MCP unavailable]
- Status: [Ready/Awaiting/Blocked]

```

---

## 🚨 **Critical Requirements**

### **Before ANY work:**

1. **Git checkpoint**: `git add -A && git commit -m "Checkpoint before [task]"`
2. **Check tasks**: Read `agents/tasks.json` for current project status
3. **Memory check**: Review personal agent memory file and shared context

### **During work:**

- **Follow workflow protocols** as specified in `agents/unified-workflow.md`
- **Update memory files** with discoveries and progress
- **Sync to MCP**: Run `agents/scripts/sync_tool.sh sync` after significant changes
- **Document changes** in appropriate JSON files
- **Refer to unified-workflow.md** for complex scenarios, memory management details, and coordination protocols

### **After completion:**

- **Final commit** with complete description
- **Sync to MCP**: Run `agents/scripts/sync_tool.sh sync` to ensure all changes are synchronized
- **Update documentation** (patches, recent issues, functions)
- **Update personal memory** with lessons learned

---
