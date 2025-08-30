# StackTrackr Agent System Documentation

## Purpose & Overview

The `AGENTS.md` file in the `rAgents` directory provides comprehensive instructions and guidelines for the StackTrackr agent system, which is a critical component of the rEngine Core platform. This file outlines the mandatory workflow protocols, the bootstrapped memory system, and the critical requirements that all agents must follow to ensure seamless collaboration and efficient task execution within the rEngine Core ecosystem.

## Key Functions/Classes

1. **Agent Identity & Memory Files**: The `AGENTS.md` file defines the various agent memory files that store the individual agent's knowledge and state, such as `github_copilot_memories.json`, `claude_sonnet_memories.json`, `gpt4_memories.json`, `gpt4o_memories.json`, `gemini_pro_memories.json`, and `claude_opus_memories.json`.

1. **Shared Memory Index**: The file also defines the "Shared Memory Index", which is a set of essential files that store project-wide information, such as tasks, agent capabilities, architectural decisions, function ownership, known issues, shared project memory, preferences, visual styles, and learning patterns.

1. **Auto-Initialization Checklist**: The file outlines a mandatory checklist that every agent must execute when starting a new session or receiving a "Hello" message. This checklist ensures that agents properly identify themselves, check sync status, read the current tasks, update the shared memory index, and report their status.

1. **Critical Requirements**: The file also defines the critical requirements that agents must follow before, during, and after their work, including Git checkpointing, task and memory checks, workflow protocol adherence, memory file updates, synchronization with the Master Control Plane (MCP), and documentation updates.

## Dependencies

The `AGENTS.md` file is a crucial part of the rEngine Core platform and is closely integrated with the following components:

1. **Unified Workflow**: The file references the `agents/unified-workflow.md` file, which provides complete agent workflow guidance and detailed memory structure information.
2. **Master Control Plane (MCP)**: The file mentions the need to synchronize with the MCP using the `agents/scripts/sync_tool.sh` script.
3. **Agent Memory Files**: The file defines the various agent memory files that store the individual agent's knowledge and state.
4. **Shared Memory Index**: The file defines the set of essential files that store project-wide information, which the agents must interact with.

## Usage Examples

To use the StackTrackr agent system, agents must follow the instructions outlined in the `AGENTS.md` file, which include:

1. Identifying themselves and loading the correct memory file.
2. Checking the sync status and running the `sync_tool.sh` script.
3. Reading the `tasks.json` file for current assignments.
4. Updating the shared memory index timestamps.
5. Reporting their status using the standard format.

Additionally, agents must follow the critical requirements before, during, and after their work, as specified in the file.

## Configuration

The `AGENTS.md` file does not directly require any environment variables or configuration settings. However, the various memory files and shared memory index files mentioned in the file may require specific configuration or setup within the rEngine Core platform.

## Integration Points

The `AGENTS.md` file is a core component of the rEngine Core platform and is closely integrated with the following systems:

1. **Unified Workflow**: The agent system follows the protocols and guidelines defined in the `agents/unified-workflow.md` file.
2. **Master Control Plane (MCP)**: The agents must synchronize their work with the MCP using the provided `sync_tool.sh` script.
3. **Agent Memory Files**: The agents must load and update their individual memory files as specified in the `AGENTS.md` file.
4. **Shared Memory Index**: The agents must interact with the set of essential files that store project-wide information.

## Troubleshooting

Some common issues and solutions related to the StackTrackr agent system include:

1. **Sync Issues**: If an agent is unable to synchronize with the MCP, they should check the status of the `sync_tool.sh` script and ensure that the MCP is available and accessible.
2. **Memory File Conflicts**: If there are conflicts between an agent's memory file and the shared memory index, the agent should follow the workflow protocols to resolve the conflicts and update the relevant files.
3. **Workflow Violations**: If an agent fails to follow the mandatory workflow protocols outlined in the `AGENTS.md` file, they may encounter issues with task coordination and project progress. In such cases, the agent should review the `agents/unified-workflow.md` file and rectify their approach.
4. **Shared Memory Index Inconsistencies**: If the shared memory index files are not properly maintained or updated, agents may encounter issues with task assignments, architectural decisions, and other project-wide information. In such cases, the project team should review and update the shared memory index files as necessary.

Remember to always refer to the `agents/unified-workflow.md` file for comprehensive protocols, detailed memory structure, and complete task coordination guidelines.
