# rEngine Core: `sync_tool.sh` - Memory Synchronization Utility

## Purpose & Overview

The `sync_tool.sh` script is a critical component of the rEngine Core platform, responsible for ensuring seamless synchronization between the JSON-based memory files and the rEngine Memory Control Plane (MCP). This script acts as an "Intelligent Development Wrapper" for managing the data flow and integrity between the two primary memory sources within the rEngine ecosystem.

The main objectives of this script are:

1. **Synchronization**: Regularly synchronize the JSON memory files with the rEngine MCP, maintaining data consistency and coherence.
2. **Backup & Versioning**: Automatically create backups of the current state to enable rollbacks and version control.
3. **Conflict Resolution**: Detect and handle any conflicts that may arise during the synchronization process.
4. **Integrity Verification**: Perform checks to ensure the synchronization process maintains the integrity of the memory data.
5. **Memory Management**: Provide utilities for creating, listing, and packaging the rEngine Core's dynamic memory types.

By utilizing this script, rEngine Core users and developers can ensure that their memory-based applications and services are always up-to-date and functioning correctly, regardless of the underlying data storage mechanisms.

## Key Functions/Classes

The `sync_tool.sh` script consists of several key functions that handle different aspects of the synchronization process:

### `check_mcp_availability()`

- Checks if the rEngine MCP is available and ready for synchronization.
- Simulates the MCP health check for now, but can be expanded to include more robust connectivity checks.

### `discover_memory_files()`

- Automatically discovers all JSON memory files in the designated directory.
- Excludes the configuration and metadata files from the discovery process.

### `validate_json_files()`

- Validates the syntax and structure of all discovered JSON memory files.
- Provides detailed feedback on any invalid JSON files.

### `backup_current_state()`

- Creates a backup of the current state, including both the JSON memory files and the MCP state (if available).
- Stores the backup in a timestamped directory within the `backups` folder.

### `perform_sync()`

- Executes the synchronization process between the JSON memory files and the rEngine MCP.
- Supports both "JSON to MCP" and "MCP to JSON" sync directions.
- Performs validation, backup, and integrity verification during the sync process.

### `handle_conflicts()`

- Checks for and reports any synchronization conflicts between the JSON memory files and the MCP.
- Provides instructions for resolving the conflicts.

### `show_sync_status()`

- Displays the current synchronization status, including MCP availability, last sync time, and file-level details.

### `auto_sync()`

- Performs an automated synchronization process, suitable for scheduled runs.
- Ensures that no manual sync operations are in progress before executing the auto-sync.

### `sync_to_memory_vault()`

- Synchronizes the JSON memory files to the rEngine Memory Vault, a GitHub-based repository for versioning and collaboration.

### `full_sync()`

- Executes a complete synchronization process, including both the MCP and the Memory Vault.

## Dependencies

The `sync_tool.sh` script depends on the following components and tools:

1. **rEngine MCP**: The Memory Control Plane, which serves as the authoritative source for the rEngine Core's memory data.
2. **JSON Memory Files**: The JSON-based representations of the rEngine Core's memory entities, stored in the local file system.
3. **Python 3**: The script utilizes Python 3 for various tasks, such as JSON file validation and memory management.
4. **Memory Vault Sync Script**: A separate Python script that handles the synchronization of memory files to the rEngine Memory Vault repository.

## Usage Examples

The `sync_tool.sh` script can be invoked with various commands to perform different synchronization-related tasks:

```bash

# Sync JSON files to MCP

./sync_tool.sh sync json_to_mcp

# Sync MCP to JSON files

./sync_tool.sh sync mcp_to_json

# Sync to rEngine Memory Vault

./sync_tool.sh sync vault

# Perform a full sync to all destinations (MCP + Memory Vault)

./sync_tool.sh sync all

# Check the current synchronization status

./sync_tool.sh status

# Validate the JSON memory files

./sync_tool.sh validate

# Create a backup of the current state

./sync_tool.sh backup

# Check for and display any sync conflicts

./sync_tool.sh conflicts

# Perform an automated sync (for scheduled runs)

./sync_tool.sh auto

# Create a new memory type

./sync_tool.sh create-memory patterns "Learning patterns for error prevention" 3

# List all available memory types

./sync_tool.sh list-memory

# Package the rEngine Core's brain for a new project

./sync_tool.sh package-brain /path/to/new/project
```

## Configuration

The `sync_tool.sh` script relies on the following configuration parameters:

| Parameter | Description |
| --- | --- |
| `AGENTS_DIR` | The directory where the rEngine Core's agent-related files (including memory files) are stored. |
| `SYNC_SCRIPT` | The path to the Python script responsible for performing the sync between JSON files and the MCP. |
| `CONFIG_FILE` | The path to the synchronization configuration file, which may include settings like sync intervals, conflict resolution strategies, etc. |
| `LOG_FILE` | The path to the log file where the script's output and events are recorded. |

These parameters are defined at the beginning of the script and can be adjusted based on the rEngine Core's deployment and file organization.

## Integration Points

The `sync_tool.sh` script integrates with the following key components of the rEngine Core platform:

1. **rEngine MCP**: The script communicates with the rEngine Memory Control Plane to ensure data synchronization and integrity.
2. **JSON Memory Files**: The script manages the JSON-based memory representations, which are the primary data source for rEngine Core applications.
3. **rEngine Memory Vault**: The script synchronizes the JSON memory files to the rEngine Memory Vault, a GitHub-based repository for versioning and collaboration.
4. **Dynamic Memory Management**: The script provides utilities for creating, listing, and packaging the rEngine Core's dynamic memory types.

These integration points allow the `sync_tool.sh` script to serve as a central hub for managing the rEngine Core's memory data and ensuring its consistency and reliability across the entire platform.

## Troubleshooting

Here are some common issues that may arise when using the `sync_tool.sh` script and their possible solutions:

### MCP Unavailability

**Issue**: The script reports that the rEngine MCP is unavailable, and it proceeds to operate in "JSON-only" mode.
**Solution**: Ensure that the rEngine MCP is properly configured and running. Check the MCP's health and connectivity, and address any issues that may be causing the unavailability.

### JSON File Validation Errors

**Issue**: The script reports that one or more JSON memory files have invalid syntax.
**Solution**: Inspect the reported invalid files and correct the syntax issues. You can use the `sync_tool.sh validate` command to quickly identify and fix any JSON-related problems.

### Synchronization Conflicts

**Issue**: The script detects conflicts between the JSON memory files and the rEngine MCP during the synchronization process.
**Solution**: Use the `sync_tool.sh conflicts` command to review the detected conflicts. Then, follow the provided instructions to resolve the conflicts manually using the `sync_tool.sh sync` command with the appropriate options.

### Memory Vault Sync Failures

**Issue**: The script encounters issues when attempting to sync the JSON memory files to the rEngine Memory Vault.
**Solution**: Ensure that the Memory Vault sync script (`sync_memory_vault.py`) is present and configured correctly. Also, check the network connectivity and permissions required for the sync process to complete successfully.

If you encounter any other issues or have further questions, please consult the rEngine Core documentation or reach out to the rEngine support team for assistance.
