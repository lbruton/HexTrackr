# Agent Menu System Usage

## 🎯 Quick Fix for Menu Interaction

The agent initialization shows a menu but doesn't wait for interactive input. Here's how to use it:

### 1. **Show the Menu**

```bash
node rEngine/agent-hello-workflow.js init
```

This displays the menu with options 1-4.

### 2. **Process Your Choice**

Use the corresponding command for your menu choice:

```bash

# Choice 1: Continue where we left off

node rEngine/agent-menu.js 1

# Choice 2: Start fresh session

node rEngine/agent-menu.js 2

# Choice 3: Show detailed context summary  

node rEngine/agent-menu.js 3

# Choice 4: Memory search mode info

node rEngine/agent-menu.js 4
```

## 🔍 **Menu Options Explained**

**Option 1** - Continue where we left off

- Loads existing context and continues previous work
- Best for resuming interrupted sessions

**Option 2** - Start fresh

- Begins new session (memories still available for reference)
- Good for new tasks or different projects

**Option 3** - Detailed context summary

- Shows comprehensive overview of recent activity
- Includes handoff logs, knowledge base stats, recent concepts

**Option 4** - Memory search

- Shows instructions for searching agent memories
- Use: `node agent-hello-workflow.js search "your query"`

## 🚀 **Example Usage**

```bash

# Show menu

node rEngine/agent-hello-workflow.js init

# If you see menu options 1-4, choose option 1 to continue:

node rEngine/agent-menu.js 1

# Agent is now ready for work!

```

This approach fixes the terminal input issue while maintaining all functionality.
