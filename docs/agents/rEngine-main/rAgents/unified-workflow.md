# StackTrackr Multi-Agent Development Workflow

**Version**: 3.2 - Enhanced Memory Management  
**Created**: August 16, 2025  
**Current Version**: v3.04.95

---

## 🎯 **PROJECT MISSION**

**StackrTrackr is a client-side precious metals inventory management web app. It runs entirely in the browser with no server dependencies, using localStorage for data persistence. Our goal is to provide a fast, private, and feature-rich experience for collectors and investors.**

---

## 🔄 **AUTO-INITIALIZATION PROTOCOL**

### **Trigger: "Hello" or New Chat Session**

## Every agent MUST immediately execute this checklist:

1. **Check for assigned tasks**: Read `rMemory/rAgentMemories/tasks.json` for current project status and assigned work
2. **Report current status**: State what task you're on and next step
3. **Request permission**: Ask if you should proceed or await new instructions

### **Standard Initialization Response Format:**

```
🤖 Agent Status Check:

- Agent: [GPT-4o/Claude Opus/etc.]
- Current Task: [TASK_NAME or "None assigned"]
- Phase/Step: [Current position in task]
- Next Action: [What you would do next]
- Status: [Ready to proceed/Awaiting instructions/Blocked]

Ready to continue or awaiting new assignment?
```

---

## 🧠 **AGENT IDENTITY & MEMORY SYSTEM**

### **Agent Identity Management**

#### **GitHub Copilot in VS Code**

- **Primary Identity**: GitHub Copilot
- **Memory File**: `rMemory/rAgentMemories/github_copilot_memories.json`
- **Technical Base**: Claude 3.5 Sonnet via VS Code
- **Use Case**: Primary development tasks in VS Code

#### **Direct Claude 3.5 Sonnet**

- **Primary Identity**: Claude 3.5 Sonnet
- **Memory File**: `rMemory/rAgentMemories/claude_sonnet_memories.json`
- **Technical Base**: Direct Claude API
- **Use Case**: Analysis and complex tasks outside VS Code

#### **Other Agent Types**

- GPT-4/GPT-4 Opus: `agents/gpt4_memories.json`, `agents/gpt4o_memories.json`
- Gemini Pro: `agents/gemini_pro_memories.json`
- Claude Opus: `agents/claude_opus_memories.json`

### **Memory File Structure**

#### **File Requirements:**

- **Location**: `agents/[modelname]_memories.json`
- **Format**: JSON structure for programmatic access
- **Purpose**: Store agent-specific insights and shared memory indexes

#### **Required JSON Structure:**

```json
{
  "metadata": {
    "agent_name": "[MODEL_NAME]",
    "agent_type": "[PRIMARY_IDENTITY]",
    "technical_base": "[UNDERLYING_MODEL]",
    "created": "[YYYY-MM-DD]",
    "last_updated": "[YYYY-MM-DD HH:MM]",
    "session_count": 0,
    "total_tasks_completed": 0
  },
  "shared_memory_index": {
    "agents": {
      "file": "agents/agents.json",
      "purpose": "Agent definitions and capabilities",
      "last_checked": "[YYYY-MM-DD HH:MM]"
    },
    "tasks": {
      "file": "agents/tasks.json",
      "purpose": "Active tasks and project status",
      "last_checked": "[YYYY-MM-DD HH:MM]"
    },
    "decisions": {
      "file": "agents/decisions.json", 
      "purpose": "Architectural and design decisions",
      "last_checked": "[YYYY-MM-DD HH:MM]"
    },
    "functions": {
      "file": "agents/functions.json",
      "purpose": "Function definitions and ownership",
      "last_checked": "[YYYY-MM-DD HH:MM]"
    },
    "errors": {
      "file": "agents/errors.json",
      "purpose": "Known errors and solutions",
      "last_checked": "[YYYY-MM-DD HH:MM]"
    },
    "memory": {
      "file": "agents/memory.json",
      "purpose": "Shared project memory",
      "last_checked": "[YYYY-MM-DD HH:MM]"
    },
    "preferences": {
      "file": "agents/preferences.json",
      "purpose": "Project preferences and settings",
      "last_checked": "[YYYY-MM-DD HH:MM]"
    },
    "styles": {
      "file": "agents/styles.json",
      "purpose": "Visual style definitions",
      "last_checked": "[YYYY-MM-DD HH:MM]"
    }
  },
  "personal_insights": {
    "coding_patterns": [],
    "optimization_discoveries": [],
    "debugging_strategies": [],
    "performance_observations": []
  },
  "task_preferences": {
    "preferred_approaches": [],
    "avoided_patterns": [],
    "efficiency_notes": []
  },
  "learned_solutions": {
    "recurring_issues": [],
    "effective_fixes": [],
    "context_specific_solutions": []
  },
  "session_notes": {
    "current_session": "",
    "previous_sessions": []
  }
}
```

#### **Memory Initialization Protocol:**

```
🧠 Memory System Check:

1. Validate identity and select correct memory file
2. Update shared_memory_index timestamps
3. Read all referenced shared memory files
4. Update personal insights based on shared context

```

[Rest of original workflow content follows...]
