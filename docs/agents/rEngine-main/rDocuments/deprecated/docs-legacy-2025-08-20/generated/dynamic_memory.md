# Dynamic Memory Type Creator

## Purpose & Overview

The `dynamic_memory.py` script is a part of the `rMemory/rAgentMemories` module in the rEngine Core platform. It provides a way to automatically generate new memory type JSON files and integrate them into the sync system.

This script allows developers to create custom memory types, such as "patterns", "learnings", or any other domain-specific data, and seamlessly integrate them into the rEngine Core ecosystem. It handles the creation of the memory type file, updates the sync configuration, and documents the new memory type in the shared workflow files.

## Key Functions/Classes

The main component in this script is the `DynamicMemoryCreator` class, which provides the following key functions:

1. `create_memory_type(memory_type, purpose, structure, sync_priority, auto_sync)`: Creates a new memory type JSON file and integrates it into the sync system.
2. `list_memory_types()`: Lists all existing memory types, including their name, purpose, creation date, file size, and whether they were auto-generated.
3. `create_project_brain_package(target_project_path)`: Creates a portable brain package that can be copied to new projects, including all memory type JSON files and workflow documentation.

The script also includes several helper methods, such as `_create_default_structure()`, `_add_to_sync_config()`, and `_update_workflow_docs()`, which handle the internal implementation details.

## Dependencies

The `dynamic_memory.py` script depends on the following:

1. **Python 3**: The script is written in Python 3 and requires a compatible Python 3 environment.
2. **JSON**: The script uses the built-in `json` module to read and write JSON files.
3. **Pathlib**: The `Path` class from the `pathlib` module is used for file and directory handling.
4. **Datetime**: The `datetime` module is used to handle timestamps and dates.

## Usage Examples

Here are some examples of how to use the `DynamicMemoryCreator` class:

```python
from dynamic_memory import DynamicMemoryCreator

# Create a new memory type

creator = DynamicMemoryCreator()
creator.create_memory_type(
    memory_type="patterns",
    purpose="Store information about detected patterns",
    sync_priority=3,
    auto_sync=True
)

# List all existing memory types

memory_types = creator.list_memory_types()
for mt in memory_types:
    print(f"{mt['name']} - {mt['purpose']} ({mt['size_kb']}KB)")

# Create a brain package for a new project

creator.create_project_brain_package(target_project_path="/path/to/new/project")
```

## Configuration

The `DynamicMemoryCreator` class requires the following configuration:

- `agents_path`: The path to the `agents` directory, which defaults to `/Volumes/DATA/GitHub/rEngine/agents`. This can be overridden when creating a new `DynamicMemoryCreator` instance.

The script also reads and writes to the `sync_config.json` file located in the `agents_path` directory.

## Integration Points

The `dynamic_memory.py` script integrates with the following rEngine Core components:

1. **Sync System**: The script updates the `sync_config.json` file to include the new memory type, enabling it to be synchronized with the rEngine Core platform.
2. **Workflow Documentation**: The script updates the `AGENTS.md` and `COPILOT_INSTRUCTIONS.md` files to include the new memory type in the shared memory index.
3. **Memory Management**: The generated memory type JSON files are used by other rEngine Core components to store and manage domain-specific data.

## Troubleshooting

1. **Memory Type Already Exists**: If the script attempts to create a memory type that already exists, it will print an error message and return `False`.
2. **File Write Errors**: If the script encounters any issues writing the new memory type JSON file, it will print an error message and return `False`.
3. **Sync Config Update Errors**: If the script fails to update the `sync_config.json` file, it will print a warning message but continue to function.
4. **Workflow Documentation Update Errors**: If the script fails to update the workflow documentation files, it will print a warning message but continue to function.

In case of any issues, check the output of the script for error messages, and ensure that the `agents_path` directory and its contents are accessible and writable by the script.
