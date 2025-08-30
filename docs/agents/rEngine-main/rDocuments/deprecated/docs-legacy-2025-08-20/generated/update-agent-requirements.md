# rEngine Core: update-agent-requirements.js

## Purpose & Overview

The `update-agent-requirements.js` file is a crucial component in the rEngine Core ecosystem. It is responsible for enforcing and updating the memory requirements for all agent files in the `rMemory/rAgentMemories` directory. This ensures that the agent memory files adhere to the mandatory protocols and guidelines outlined in the `COPILOT_INSTRUCTIONS.md` document.

By running this script, the rEngine platform can guarantee that each agent's memory file contains the necessary critical requirements, such as mandatory startup protocols, memory system paths, protocol enforcement steps, MCP integration details, and information about the Scribe Console. This helps maintain consistency and reliability across the entire rEngine ecosystem.

## Key Functions/Classes

The main function in this file is `updateAgentMemory(agentFile)`, which performs the following tasks:

1. Reads the existing agent memory file (if it exists) and parses the JSON data.
2. Ensures the agent data contains the critical requirements defined in the `CRITICAL_REQUIREMENTS` object.
3. Updates the agent metadata to indicate compliance with the `COPILOT_INSTRUCTIONS.md` guidelines.
4. Fixes any outdated file paths in the agent's shared memory index.
5. Writes the updated agent memory file back to the file system.

The script also updates the `persistent-memory.json` file with the same critical requirements, ensuring that the entire rEngine platform is in compliance.

## Dependencies

The `update-agent-requirements.js` file has the following dependencies:

1. **Node.js** - This script is written in JavaScript and requires a Node.js runtime environment to execute.
2. **File System (fs)** - The script uses the built-in Node.js `fs` module to read and write files.
3. **Path** - The `path` module is used for handling file paths in a cross-platform manner.
4. **COPILOT_INSTRUCTIONS.md** - This document defines the critical requirements that must be enforced in the agent memory files.

## Usage Examples

To run the `update-agent-requirements.js` script, you can execute the following command in your terminal:

```bash
node rEngine/update-agent-requirements.js
```

This will update all agent memory files in the `rMemory/rAgentMemories` directory with the latest critical requirements, as well as update the `persistent-memory.json` file.

## Configuration

The script has the following configuration parameters:

| Parameter | Description |
| --- | --- |
| `AGENT_MEMORY_DIR` | The directory where the agent memory files are stored (default: `/Volumes/DATA/GitHub/rEngine/rMemory/rAgentMemories`) |
| `CRITICAL_REQUIREMENTS` | An object defining the mandatory startup protocols, memory system paths, protocol enforcement steps, MCP integration details, and Scribe Console information |
| `AGENT_TYPES` | An array of agent memory file names to be updated (e.g., `github_copilot_memories.json`, `claude-memory.json`) |

These parameters can be adjusted as needed to fit the specific configuration of your rEngine Core installation.

## Integration Points

The `update-agent-requirements.js` script is tightly integrated with the following rEngine Core components:

1. **COPILOT_INSTRUCTIONS.md** - This document defines the critical requirements that must be enforced in the agent memory files.
2. **rMemory/rAgentMemories** - The agent memory files that are updated by this script.
3. **persistent-memory.json** - This file is also updated with the critical requirements to ensure consistency across the entire rEngine platform.
4. **rAgents/unified-workflow.md** - This document is referenced in the critical requirements and must be followed by agents.
5. **protocol-enforcer.js** - This script is called during the "before_work" protocol enforcement step to check file modifications.
6. **gpt-mandatory-startup.js** - This script is specified as a mandatory startup protocol for GPT agents.
7. **scribe-console.js** - This script provides the real-time monitoring capabilities for the rEngine system.

## Troubleshooting

## Error: Failed to update agent memory file

- Ensure the specified `AGENT_MEMORY_DIR` directory exists and that the script has the necessary file system permissions.
- Check the file path and name of the agent memory file being updated.
- Verify that the `COPILOT_INSTRUCTIONS.md` file is present and up-to-date.

## Error: Failed to update persistent-memory.json

- Ensure the `persistent-memory.json` file exists in the correct location and that the script has the necessary file system permissions to write to it.

**Agent memory file not updated with critical requirements**

- Verify that the agent memory file contains the expected `critical_requirements`, `compliance_version`, and `last_requirements_update` fields.
- Check the agent metadata for the `has_critical_requirements` and `copilot_instructions_compliant` flags.

If you encounter any other issues, please refer to the rEngine Core documentation or reach out to the development team for further assistance.
