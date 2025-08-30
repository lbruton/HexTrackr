# rEngine Core: Agent Menu System Usage

## Purpose & Overview

The `AGENT_MENU_USAGE.md` file provides technical documentation for the Agent Menu System, a key component of the rEngine Core platform. The Agent Menu System allows users to interact with rEngine's intelligent agent through a command-line interface, enabling various functionalities such as continuing previous work, starting a fresh session, viewing context summaries, and searching the agent's memory.

This documentation serves as a comprehensive guide for developers and users to understand the purpose, usage, and integration of the Agent Menu System within the rEngine Core ecosystem.

## Key Functions/Classes

1. **Agent Initialization**: The `agent-hello-workflow.js` script is responsible for initializing the agent and displaying the menu options.

1. **Menu Options**: The available menu options include:
   - **Option 1**: Continue where we left off
   - **Option 2**: Start fresh session
   - **Option 3**: Show detailed context summary
   - **Option 4**: Memory search mode info

1. **Menu Navigation**: The `agent-menu.js` script is used to process the user's menu choice and execute the corresponding functionality.

## Dependencies

The Agent Menu System relies on the following rEngine Core components:

1. **rEngine Agent**: The intelligent agent that powers the menu system and provides the core functionality.
2. **Context Management**: The ability to load and save the agent's context, enabling the "Continue where we left off" functionality.
3. **Memory Search**: The memory search capabilities allow users to query the agent's knowledge base.

## Usage Examples

Here's an example of how to use the Agent Menu System:

```bash

# Show the menu

node rEngine/agent-hello-workflow.js init

# If you see menu options 1-4, choose option 1 to continue:

node rEngine/agent-menu.js 1

# The agent is now ready for work!

```

You can also use the other menu options by running the corresponding commands:

```bash

# Choice 2: Start fresh session

node rEngine/agent-menu.js 2

# Choice 3: Show detailed context summary

node rEngine/agent-menu.js 3

# Choice 4: Memory search mode info

node rEngine/agent-menu.js 4
```

## Configuration

The Agent Menu System does not require any specific environment variables or configuration. It relies on the overall rEngine Core platform configuration, which may include settings related to the agent, context management, and memory search.

## Integration Points

The Agent Menu System is a core component of the rEngine Core platform and integrates with the following key components:

1. **rEngine Agent**: The menu system provides a user-friendly interface to interact with the rEngine agent.
2. **Context Management**: The ability to load and save the agent's context is essential for the "Continue where we left off" functionality.
3. **Memory Search**: The memory search capabilities are exposed through the menu system, allowing users to query the agent's knowledge base.

## Troubleshooting

**Issue**: The agent initialization shows the menu but doesn't wait for interactive input.

**Solution**: The provided code in the `AGENT_MENU_USAGE.md` file addresses this issue by using separate scripts (`agent-hello-workflow.js` and `agent-menu.js`) to handle the menu display and menu choice processing, respectively.

If you encounter any other issues, please refer to the rEngine Core documentation or reach out to the rEngine support team for assistance.
