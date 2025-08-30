# Protocol: Memory Management & Synchronization

**Version: 1.0.0**
**Date: 2025-08-18**
## Status: Active

## 1. Overview

This document provides the definitive protocol for managing and synchronizing the project's dual-memory architecture. Adherence to this protocol is mandatory to ensure data integrity, prevent context loss between sessions, and maintain system health.

The architecture consists of two distinct memory systems:

- **MCP Server Memory**: A centralized, cloud-based knowledge graph for long-term, strategic information (protocols, system status, etc.).
- **rMemory Local Storage**: A local, file-based system for agent-specific working memory (active tasks, handoffs, immediate context).

## 2. Memory Synchronization Protocol

To prevent data drift, the two memory systems must be synchronized. The following utilities have been created for this purpose.

### 2.1. Manual Synchronization

For an immediate, on-demand sync, use the memory sync utility. This is useful for ensuring systems are aligned before a major task or after a manual change.

- **Command**: `node /Volumes/DATA/GitHub/rEngine/rEngine/memory-sync-utility.js`
- **Action**: Performs a bidirectional sync between the MCP server and local rMemory files. It validates data and provides a comprehensive report upon completion.

### 2.2. Automated Synchronization

An automated script manages daily synchronization and provides health checks.

- **Command**: `/Volumes/DATA/GitHub/rEngine/rEngine/memory-sync-automation.sh [action]`
- **Actions**:
  - `manual`: Runs the sync process interactively in the foreground.
  - `setup`: Configures the daily cron job for automated execution.
  - `status`: Checks the current sync health and reports any issues.

**It is mandatory to run a manual sync at the beginning and end of every work session to ensure full context.**

## 3. Primary Memory Interaction: VS Code MCP Tools

**CRITICAL**: The primary and authoritative method for writing to the centralized **MCP Server Memory** is through the integrated VS Code tools. These tools interface directly with the server and provide immediate visual feedback.

- **Action**: To save session handoffs, create new tasks, or record strategic information.
- **Tool**: Use the `mcp_memory_create_entities` tool.
- **Benefit**: This ensures data is saved directly to the central server and triggers the necessary UI notifications for confirmation.

**The `rEngine` scripts are secondary and should only be used for local memory interaction or synchronization as detailed below.**

## 4. Local Memory & Sync Scripts Reference

The following scripts are the primary tools for interacting with the **local `rMemory` file system** and for running synchronization tasks. Direct file manipulation is forbidden.

| Script | Location | Purpose |
| --- | --- | --- |
| `memory-sync-utility.js` | `rEngine/` | **[SYNC]** Performs a manual, on-demand sync between MCP and local memory. |
| `memory-sync-automation.sh`| `rEngine/` | **[SYNC]** Manages automated daily syncs and provides health status checks. |
| `add-context.js` | `rEngine/` | **[LOCAL]** Adds information to the local `rMemory` files. **Does not write to the MCP Server.** |
| `recall.js` | `rEngine/` | **[LOCAL]** Queries the local `rMemory` files. |
| `mcp-client.js` | `rEngine/` | The underlying HTTP client for communicating with the Memory Server. Not typically called directly. |

## 5. Standard Operating Procedure

1. **Start of Session**: Run the manual sync to pull the latest updates from the MCP server: `bash /Volumes/DATA/GitHub/rEngine/rEngine/memory-sync-automation.sh manual`.
2. **During Session**: For any strategic updates or logging, use the VS Code `mcp_memory_create_entities` tool. Use local scripts (`add-context.js`, `recall.js`) only for tasks that are explicitly local.
3. **End of Session (Handoff)**:
    - **Step A (CRITICAL)**: Save the final session handoff using the VS Code `mcp_memory_create_entities` tool to ensure it is logged in the central server.
    - **Step B**: Run the manual sync to ensure all local changes are pushed to the server and that local files are up-to-date for the next session: `bash /Volumes/DATA/GitHub/rEngine/rEngine/memory-sync-automation.sh manual`.
