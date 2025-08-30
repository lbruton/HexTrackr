# rEngine Core: Memory Intelligence System

## Purpose & Overview

The `memory-intelligence.js` file is part of the rEngine Core platform, and it implements a comprehensive Memory Intelligence System. This system combines a Multi-Context Perception (MCP) Memory, Extended Context tracking, and Pattern Recognition capabilities to provide advanced memory recall and contextual search functionality.

The Memory Intelligence System enables rEngine-based applications to quickly retrieve relevant information, detect historical patterns, and generate intelligent suggestions based on the agent's accumulated knowledge and experiences. This is a crucial component that allows rEngine to maintain a persistent memory and leverage its "intelligence" to assist users and automate tasks more effectively.

## Key Functions/Classes

The main class in this file is `MemoryIntelligence`, which encapsulates the core functionality of the Memory Intelligence System. Here are the key methods:

1. **`smartRecall(query, timeframe = null)`**: This is the primary entry point for performing intelligent search and recall. It coordinates the various memory sources and returns a structured set of results.
2. **`searchExtendedContext(query, timeframe = null)`**: Searches the agent's extended context (recent sessions and activities) for relevant matches.
3. **`searchAgentMemory(query)`**: Searches the agent's long-term memory (entities and concepts) for patterns and related information.
4. **`searchTasks(query)`**: Searches the agent's task history (active and completed tasks) for relevant solutions and issues.
5. **`generateSmartSuggestions(query, results)`**: Analyzes the search results and generates intelligent suggestions based on detected patterns and context.
6. **`calculateRelevance(query, text)`**: Calculates a relevance score for text matching, used to rank and prioritize the search results.
7. **`filterDatesByTimeframe(dates, timeframe)`**: Filters a list of dates based on the specified timeframe (e.g., last week, last month).
8. **`displayResults(results)`**: Formats and prints the search results in a user-friendly way.

## Dependencies

The `memory-intelligence.js` file depends on the following modules and libraries:

- `fs/promises`: For asynchronous file system operations.
- `path`: For working with file paths.
- `fileURLToPath`: For converting file URLs to file paths.

Additionally, it assumes the existence of the following files and directories within the rEngine Core project:

- `rMemory/rAgentMemories/extendedcontext.json`: The agent's extended context data.
- `rMemory/rAgentMemories/memory.json`: The agent's long-term memory (entities and concepts).
- `rMemory/rAgentMemories/tasks.json`: The agent's task history (active and completed tasks).

## Usage Examples

The Memory Intelligence System can be used from the command line interface (CLI) or integrated into other rEngine Core components. Here are some example usage scenarios:

**CLI Usage**:

```bash

# Perform a smart recall search

node memory-intelligence.js recall "javascript bug"

# Search for recent activity related to "console"

node memory-intelligence.js recent "console"

# Search for relevant information within the last month

node memory-intelligence.js recall "menu system" 1m
```

**Programmatic Usage**:

```javascript
import MemoryIntelligence from './memory-intelligence.js';

const memory = new MemoryIntelligence();
const results = await memory.smartRecall('javascript error');
memory.displayResults(results);
```

## Configuration

The `MemoryIntelligence` class relies on the following configuration settings:

- `baseDir`: The base directory of the rEngine Core project.
- `memoryPath`: The path to the directory containing the agent's memory files.
- `extendedContextPath`: The path to the agent's extended context data file.
- `agentMemoryPath`: The path to the agent's long-term memory file.
- `tasksPath`: The path to the agent's task history file.

These paths are set in the constructor of the `MemoryIntelligence` class and should match the actual file structure of the rEngine Core project.

## Integration Points

The Memory Intelligence System is a core component of the rEngine platform and integrates with various other parts of the system:

1. **Agent Interaction**: The Memory Intelligence System provides a way for rEngine-based agents to access and leverage the agent's accumulated knowledge and experiences, allowing for more contextual and intelligent interactions.
2. **Task Management**: The task search functionality allows rEngine to provide relevant solutions and historical insights when users are working on new tasks or issues.
3. **Knowledge Management**: The pattern recognition and smart suggestion capabilities can be used to organize and surface important information, concepts, and best practices within the rEngine ecosystem.
4. **Automation**: The Memory Intelligence System can be used to automate various workflows and decision-making processes by drawing upon the agent's memory and contextual awareness.

## Troubleshooting

Here are some common issues and solutions related to the Memory Intelligence System:

**MCP Memory Server Configuration**:
If the MCP Memory server is not properly configured, the system will fall back to using the extended context and agent memory searches. Ensure that the MCP Memory server is set up and accessible for optimal performance.

**Missing Memory Files**:
If any of the required memory files (extended context, agent memory, or tasks) are missing or corrupted, the corresponding search functionality will not work as expected. Verify that these files exist in the correct locations and have the expected data structure.

**Slow Performance**:
If the search performance is slow, consider optimizing the data structures or indexing mechanisms used in the memory files. Additionally, ensure that the file system access is efficient and not a bottleneck.

**Incomplete or Inaccurate Results**:
If the search results do not seem comprehensive or accurate, review the data quality and completeness of the underlying memory sources. Improve the data gathering, processing, and storage mechanisms to ensure that the Memory Intelligence System has access to the most relevant and up-to-date information.
