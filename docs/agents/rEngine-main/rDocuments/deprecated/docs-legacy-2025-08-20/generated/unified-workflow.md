# StackTrackr Multi-Agent Development Workflow

## Purpose & Overview

The `unified-workflow.md` file outlines the core workflow and memory management system for the StackTrackr project, which is an "Intelligent Development Wrapper" platform built on the rEngine Core. This file serves as the central reference for how various AI agents (such as GitHub Copilot, Claude 3.5 Sonnet, GPT-4, etc.) coordinate their tasks, share project context, and maintain persistent memory within the rEngine Core ecosystem.

## Key Functions/Classes

1. **Auto-Initialization Protocol**: Defines the standardized process for agents to check their current status, report progress, and request new instructions at the start of each session.
2. **Agent Identity & Memory System**: Outlines the different types of agents used, their primary identities, memory file locations, and the required JSON structure for storing agent-specific insights and shared memory indexes.
3. **Memory Initialization Protocol**: Describes the steps agents must follow to validate their identity, update shared memory indexes, and synchronize their personal insights with the project context.

## Dependencies

The `unified-workflow.md` file relies on the following components and files within the rEngine Core:

- `agents/tasks.json`: Tracks the current project status and assigned tasks for each agent.
- `agents/agents.json`: Defines the available agents, their capabilities, and technical details.
- `agents/decisions.json`: Stores architectural and design decisions made by the team.
- `agents/functions.json`: Lists the function definitions and ownership within the project.
- `agents/errors.json`: Maintains a catalog of known errors and their solutions.
- `agents/memory.json`: Stores the shared project memory accessible to all agents.
- `agents/preferences.json`: Holds the project preferences and settings.
- `agents/styles.json`: Defines the visual style guidelines for the project.

## Usage Examples

To utilize the multi-agent development workflow, agents should follow these steps:

1. **Auto-Initialization**: When the agent is triggered by a "Hello" or new chat session, it must immediately execute the Auto-Initialization Protocol:

   ```
   🤖 Agent Status Check:

   - Agent: [GPT-4o/Claude Opus/etc.]
   - Current Task: [TASK_NAME or "None assigned"]
   - Phase/Step: [Current position in task]
   - Next Action: [What you would do next]
   - Status: [Ready to proceed/Awaiting instructions/Blocked]

   Ready to continue or awaiting new assignment?
   ```

1. **Memory Initialization**: After the auto-initialization, the agent must perform the Memory Initialization Protocol:

   ```
   🧠 Memory System Check:

   1. Validate identity and select correct memory file
   2. Update shared_memory_index timestamps
   3. Read all referenced shared memory files
   4. Update personal insights based on shared context

   ```

1. **Task Execution**: With the memory system synchronized, the agent can now proceed with its assigned tasks or await new instructions.

## Configuration

The `unified-workflow.md` file does not require any direct configuration. However, the various JSON files it references (e.g., `agents/tasks.json`, `agents/agents.json`) may need to be properly configured and maintained by the development team.

## Integration Points

The `unified-workflow.md` file is a core component of the rEngine Core's Intelligent Development Wrapper, serving as the central coordination point for all AI agents involved in the StackTrackr project. It integrates with the following rEngine Core components:

- **Agent Management**: The `agents/agents.json` file defines the available agents and their capabilities, which is used to identify and validate agents during the Auto-Initialization and Memory Initialization protocols.
- **Task Management**: The `agents/tasks.json` file is used by agents to check for assigned tasks and report their current status.
- **Shared Memory**: The various shared memory files (e.g., `agents/memory.json`, `agents/decisions.json`) are accessed and synchronized by agents during the Memory Initialization protocol.

## Troubleshooting

1. **Agent Identification Issues**: If an agent is unable to validate its identity or select the correct memory file, check the `agents/agents.json` file to ensure the agent's definition is correct and up-to-date.
2. **Shared Memory Synchronization Failures**: If agents are unable to successfully read and update the shared memory files, check the file permissions and ensure the agents have the necessary access rights.
3. **Inconsistent Task Assignments**: If agents are reporting conflicting task assignments or project status, review the `agents/tasks.json` file to verify the correct and up-to-date information.
4. **Persistent Memory Corruption**: If agents are encountering issues with their personal insights or learned solutions, check the individual agent memory files (e.g., `agents/github_copilot_memories.json`, `agents/claude_sonnet_memories.json`) for any data integrity problems.
