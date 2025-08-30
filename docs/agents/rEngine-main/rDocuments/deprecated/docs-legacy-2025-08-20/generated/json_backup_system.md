# JSON-First Backup System for rEngine Core

## Purpose & Overview

The `json_backup_system.py` file is a critical component of the rEngine Core platform, responsible for managing the backup and restoration of all JSON-based project data and critical documentation. This "JSON-First Backup System" ensures the stability and recoverability of the rEngine Core ecosystem by providing a reliable mechanism to backup and restore the complete project context.

Key features of this backup system include:

- Automatic backup of all JSON-based project files (agents, tasks, memory, etc.) with timestamp-based versioning
- Backup of critical project documentation (workflow, development guides, roadmap, changelog)
- Ability to restore the system from the latest backup or a specific timestamp
- Fallback mechanism to load project context from JSON files when the Memory Coordination Process (MCP) is unavailable
- Capability to create a complete emergency recovery package for disaster scenarios

By prioritizing JSON-based data and documentation, this system ensures that the rEngine Core platform can be quickly and reliably restored to a known good state, minimizing downtime and data loss.

## Key Functions/Classes

The `json_backup_system.py` file contains the following key functions:

1. `ensure_backup_dir()`: Creates the necessary directory structure for storing backup files.
2. `backup_json_files()`: Backs up all core JSON files and critical documentation, with timestamp-based versioning.
3. `restore_from_backup(timestamp=None)`: Restores JSON files from the latest backup or a specific timestamp.
4. `load_json_memory_fallback()`: Loads the complete project context from JSON files when the MCP is unavailable.
5. `get_available_tasks_from_json()`: Extracts the available tasks from the `tasks.json` file for agent queries.
6. `search_json_memory(query)`: Searches across all JSON files for relevant information based on a given query.
7. `create_emergency_recovery_package()`: Creates a complete recovery package with all critical files for disaster scenarios.

These functions work together to ensure the reliable backup, restoration, and fallback mechanisms for the rEngine Core platform.

## Dependencies

The `json_backup_system.py` file depends on the following Python modules:

- `json`: For reading and writing JSON data
- `os`: For interacting with the file system
- `shutil`: For copying files
- `datetime`: For generating timestamp-based backups
- `pathlib`: For creating directories

These dependencies are all part of the standard Python library and do not require any additional installations.

## Usage Examples

### Backup Project Data

```python
from json_backup_system import backup_json_files

# Create a new backup

backup_manifest = backup_json_files()
print(f"Backup completed: {len(backup_manifest['files_backed_up'])} files backed up")
```

### Restore from Backup

```python
from json_backup_system import restore_from_backup

# Restore from latest backup

restore_from_backup()

# Restore from a specific timestamp

restore_from_backup(timestamp="20230401_120000")
```

### Load Project Context from JSON

```python
from json_backup_system import load_json_memory_fallback

# Load project memory from JSON files

memory_data = load_json_memory_fallback()
print(f"Loaded memory from {len(memory_data)} JSON file categories")
```

### Search Across JSON Memory

```python
from json_backup_system import search_json_memory

# Search for a specific query

results = search_json_memory("task template")
for result in results:
    print(f"{result['type']}: {result['location']} - {result['content']}")
```

### Create Emergency Recovery Package

```python
from json_backup_system import create_emergency_recovery_package

# Create a complete emergency recovery package

recovery_dir = create_emergency_recovery_package()
print(f"Emergency recovery package created: {recovery_dir}")
```

## Configuration

The `json_backup_system.py` file uses the following configuration variables:

| Variable | Description |
| --- | --- |
| `AGENTS_DIR` | The directory where agent-related files are stored (default: "agents") |
| `BACKUP_DIR` | The directory where backup files are stored (default: "backups/agents_json") |
| `CORE_JSON_FILES` | A list of core JSON files that need to be backed up |
| `CRITICAL_FILES` | A list of critical project documentation files that need to be backed up |

These configuration variables can be adjusted to fit the specific file structure and requirements of the rEngine Core platform.

## Integration Points

The `json_backup_system.py` file is a critical component of the rEngine Core platform, as it ensures the reliable backup and restoration of all project data and documentation. It integrates with the following rEngine Core components:

1. **Memory Coordination Process (MCP)**: The `load_json_memory_fallback()` function is used as a fallback mechanism when the MCP is unavailable, allowing the system to load the complete project context from JSON files.
2. **Agents**: Agents rely on the JSON files backed up by this system to access and manipulate project data, such as tasks, memory, and preferences.
3. **Task Management**: The `get_available_tasks_from_json()` function provides agents with the ability to query the available tasks from the `tasks.json` file.
4. **Search Functionality**: The `search_json_memory()` function allows agents and other rEngine Core components to search across the backed-up JSON files for relevant information.

By integrating with these key components, the `json_backup_system.py` file ensures the overall stability and recoverability of the rEngine Core platform.

## Troubleshooting

### Backup or Restoration Failures

If there are issues with backing up or restoring JSON files, check the following:

1. Ensure that the `AGENTS_DIR` and `BACKUP_DIR` configurations are correct and that the necessary directories exist.
2. Verify that the user running the script has the necessary permissions to read, write, and copy the JSON files.
3. Check for any disk space or file system issues that may be preventing the backup or restoration process.

### Memory Loading Failures

If there are issues with loading the project context from the JSON files, check the following:

1. Ensure that all the expected JSON files are present in the `agents/` directory.
2. Verify that the JSON files are properly formatted and do not contain any syntax errors.
3. Check the file permissions to ensure the script can read the JSON files.

### Task Loading Failures

If there are issues with loading the available tasks from the `tasks.json` file, check the following:

1. Ensure that the `tasks.json` file is present in the `agents/` directory.
2. Verify that the `tasks.json` file is properly formatted and contains the expected data structure.
3. Check the file permissions to ensure the script can read the `tasks.json` file.

If you continue to experience issues, please reach out to the rEngine Core support team for further assistance.
