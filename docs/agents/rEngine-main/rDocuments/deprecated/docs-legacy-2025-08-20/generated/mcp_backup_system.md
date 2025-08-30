# rEngine Core - MCP Memory Backup System

## Purpose & Overview

The `mcp_backup_system.py` file is a part of the `rMemory` module in the rEngine Core platform. It serves as a backup and fallback system for the Memory Consolidation Point (MCP) memory, which is the central knowledge base for the rEngine Core.

This system exports the complete MCP memory, including entities, relations, and various categories like roadmap, bugs, workflows, and technical glossary, to local JSON files. These backup files can be used to restore the MCP memory when the primary MCP is unavailable, ensuring the continuity of the rEngine Core's operations.

## Key Functions/Classes

The `mcp_backup_system.py` file contains the following key functions:

1. **`ensure_backup_dir()`**: Ensures that the backup directory exists, creating it if necessary.
2. **`export_mcp_memory_to_json(mcp_graph_data)`**: Exports the complete MCP memory graph to structured JSON files, including a full backup and individual category-based backups.
3. **`load_backup_memory()`**: Loads the MCP memory data from the backup files and returns a combined memory data structure.
4. **`get_available_tasks_from_backup()`**: Extracts available tasks from the backup files for agent queries, such as critical bugs, bug fixes, feature enhancements, and more.
5. **`search_backup_memory(query)`**: Searches the backup memory for relevant information based on the provided query, returning matching entities and observations.

## Dependencies

The `mcp_backup_system.py` file depends on the following modules and libraries:

- `json`: For reading and writing JSON data
- `os`: For interacting with the file system
- `datetime`: For generating timestamp information
- `pathlib`: For creating directories

## Usage Examples

**Exporting MCP Memory to Backup Files**:

```python
from mcp_backup_system import export_mcp_memory_to_json

# Assuming you have the complete MCP memory graph data

mcp_graph_data = {
    "entities": [...],
    "relations": [...]
}

backup_info = export_mcp_memory_to_json(mcp_graph_data)
print(backup_info)
```

**Loading Backup Memory**:

```python
from mcp_backup_system import load_backup_memory

backup_data = load_backup_memory()
print(backup_data)
```

**Searching Backup Memory**:

```python
from mcp_backup_system import search_backup_memory

search_query = "critical bug"
search_results = search_backup_memory(search_query)
print(search_results)
```

**Extracting Available Tasks from Backup**:

```python
from mcp_backup_system import get_available_tasks_from_backup

tasks = get_available_tasks_from_backup()
print(tasks)
```

## Configuration

The `mcp_backup_system.py` file uses the following configuration constants:

| Constant | Description |
| --- | --- |
| `BACKUP_DIR` | The directory where the backup files will be stored. |
| `MEMORY_BACKUP_FILE` | The file path for the complete MCP memory backup. |
| `ROADMAP_BACKUP_FILE` | The file path for the roadmap category backup. |
| `BUGS_BACKUP_FILE` | The file path for the bugs backup. |
| `WORKFLOWS_BACKUP_FILE` | The file path for the workflows backup. |
| `GLOSSARY_BACKUP_FILE` | The file path for the technical glossary backup. |

These constants can be modified to change the backup file locations or structure if needed.

## Integration Points

The `mcp_backup_system.py` file is part of the `rMemory` module in the rEngine Core platform. It integrates with the following components:

1. **MCP (Memory Consolidation Point)**: The `mcp_backup_system.py` file exports the complete MCP memory to backup files, which can be used to restore the MCP memory when the primary MCP is unavailable.
2. **Agents**: Agents can use the `get_available_tasks_from_backup()` and `search_backup_memory()` functions to access the backup data and perform tasks or queries when the MCP is not accessible.

## Troubleshooting

**Issue**: No backup data found when trying to load or search the backup memory.
**Solution**: Ensure that the `export_mcp_memory_to_json()` function has been called at least once to generate the backup files. If the backup directory or files are missing, check the file paths and ensure that the necessary permissions are in place.

**Issue**: Errors when loading or searching the backup memory.
**Solution**: Check the error messages and logs for more information. Ensure that the backup files are not corrupted and that the JSON data is correctly formatted.

**Issue**: Backup files are not being updated as expected.
**Solution**: Verify that the `export_mcp_memory_to_json()` function is being called with the correct MCP memory graph data. Also, check that the backup directory and file paths are configured correctly.

If you encounter any other issues, please reach out to the rEngine Core development team for further assistance.
