# rEngine Core: BOOTSTRAP_MEMORY_PROTOCOL

## Purpose & Overview

The `BOOTSTRAP_MEMORY_PROTOCOL` defines the mandatory memory management procedures for all rEngine Core agent sessions. This protocol ensures the Memory Coordination Platform (MCP) remains the authoritative source of knowledge, while utilizing local JSON files and automation systems as secondary and background support respectively.

Following this protocol allows rEngine agents to maintain a consistent, synchronized, and well-documented memory hierarchy across all work sessions. This promotes reliable context retrieval, informed decision-making, and comprehensive session tracking for the rEngine Core platform.

## Key Functions/Classes

The main components and their roles in this protocol are:

| Component | Description |
| --- | --- |
| `mcp_memory_read_graph()` | Loads the current state of the MCP knowledge graph. This is the mandatory first step for every session. |
| `mcp_memory_add_observations()` | Adds new observations, decisions, and progress updates to the MCP memory. This is used throughout the session. |
| `MCP Memory` | The primary, authoritative source of knowledge for the agent. All significant information must be recorded here. |
| `Local JSON Files` | A secondary source of shared team memory, used to coordinate context across agents. |
| `Personal Memory JSON` | An agent-specific context store, used as a tertiary memory source. |
| `Automation Systems` | Background systems that provide extended context, such as chat logs and keyword lookups. These are not the primary memory sources. |

## Dependencies

The `BOOTSTRAP_MEMORY_PROTOCOL` relies on the following rEngine Core components:

- `mcp_memory_read_graph()`: Retrieves the current state of the MCP knowledge graph.
- `mcp_memory_add_observations()`: Adds new observations, decisions, and progress updates to the MCP memory.
- `MCP Memory`: The central knowledge graph that serves as the primary memory source.
- `Local JSON Files`: The secondary source of shared team memory.
- `Personal Memory JSON`: The tertiary, agent-specific context store.
- `Automation Systems`: Background support systems that provide extended context.

## Usage Examples

### Session Start Protocol

```javascript
// ALWAYS run this first in every session
mcp_memory_read_graph() 

// Then immediately check current state and add session start observation
mcp_memory_add_observations([{
  "entityName": "Current_Session_2025_XX_XX",
  "contents": [
    "SESSION START: [describe current objectives]"
  ]
}])
```

### Decision Pattern

```javascript
// Before any significant decision:
mcp_memory_add_observations([{
  "entityName": "Current_Session_2025_XX_XX",
  "contents": [
    "DECISION POINT: [describe situation]",
    "OPTIONS CONSIDERED: [list alternatives]", 
    "CHOSEN APPROACH: [selected option]",
    "REASONING: [why this choice]"
  ]
}])
```

### Work Progress Pattern

```javascript
// Regular progress updates:
mcp_memory_add_observations([{
  "entityName": "[relevant_entity_name]",
  "contents": [
    "PROGRESS UPDATE: [what was accomplished]",
    "CURRENT STATE: [where things stand]",
    "NEXT STEPS: [what comes next]"
  ]
}])
```

## Configuration

The `BOOTSTRAP_MEMORY_PROTOCOL` does not require any specific environment variables or configuration. It relies on the underlying rEngine Core platform to provide the necessary memory management functions and storage systems.

## Integration Points

The `BOOTSTRAP_MEMORY_PROTOCOL` is a critical component of the rEngine Core platform, as it ensures consistent and reliable memory management across all agent sessions. It integrates with the following rEngine Core components:

- `MCP Memory`: The primary source of knowledge and the authoritative memory store.
- `Local JSON Files`: The secondary source of shared team memory.
- `Personal Memory JSON`: The tertiary, agent-specific context store.
- `Automation Systems`: Background support systems that provide extended context.

## Troubleshooting

### "MCP memory graph not loaded"

Ensure that the `mcp_memory_read_graph()` function is called at the beginning of every session, before any other memory-related operations.

### "Missing decision reasoning in MCP memory"

Verify that the `mcp_memory_add_observations()` function is called before and after any significant decisions, with the appropriate content describing the decision-making process.

### "Outdated information in local JSON files"

Check that the local JSON files are being updated alongside the MCP memory, as per the "MANDATORY MEMORY WRITING PATTERN" section of the protocol.

### "Incomplete session tracking"

Ensure that the session start, progress, and end protocols are being followed, with all relevant information being recorded in the MCP memory.

If you encounter any other issues, please refer to the rEngine Core documentation or reach out to the development team for further assistance.
