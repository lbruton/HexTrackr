# rEngine Core: mcp_json_sync.py Documentation

## Purpose & Overview

The `mcp_json_sync.py` script is a critical component of the rEngine Core platform, responsible for bidirectional synchronization between JSON files and the MCP (Memory Coordination Plane) memory. This synchronization system ensures a 1:1 mapping and perfect sync between the JSON files and the entities stored in the MCP, which is the central memory hub for the rEngine Core ecosystem.

The script handles the following key functionalities:

1. **JSON to MCP Sync**: Converts the data in various JSON files (e.g., tasks, agents, errors, decisions, functions, preferences, styles, memory) into their corresponding MCP entity formats and then updates the MCP with the latest data.
2. **MCP to JSON Sync**: Retrieves the entities from the MCP and converts them back into the appropriate JSON format, which is then written to the corresponding JSON files.
3. **Conflict Detection**: Detects and logs any conflicts between the JSON files and the MCP, ensuring that the synchronization process maintains data integrity.
4. **Metadata Management**: Tracks the synchronization metadata, such as the last sync timestamp, file hashes, and MCP entity hashes, to facilitate efficient and incremental synchronization.

This script is a crucial component in the rEngine Core platform, as it ensures the consistent and reliable synchronization of data between the JSON files and the MCP, which is the foundation for the platform's intelligent development capabilities.

## Key Functions/Classes

The `mcp_json_sync.py` file defines the following key functions and classes:

### `MCPJsonSync` Class

- **`__init__(self, agents_path: str = "/Volumes/DATA/GitHub/rEngine/agents")`**: Initializes the `MCPJsonSync` class with the specified `agents_path`.
- **`setup_logging(self)`**: Sets up the logging configuration for the synchronization process.
- **`calculate_file_hash(self, file_path: Path) -> str`**: Calculates the MD5 hash of the content of a given file.
- **`load_sync_metadata(self) -> Dict`**: Loads the synchronization metadata from the `sync_metadata.json` file.
- **`save_sync_metadata(self, metadata: Dict)`**: Saves the synchronization metadata to the `sync_metadata.json` file.
- **`json_to_mcp_entities(self, file_name: str, json_data: Dict) -> List[Dict]`**: Converts the JSON data to the corresponding MCP entity format.
- **`mcp_entities_to_json(self, entities: List[Dict], file_name: str) -> Dict`**: Converts the MCP entities back to the appropriate JSON format.
- **`sync_json_to_mcp(self, file_name: str) -> bool`**: Synchronizes the JSON file to the MCP.
- **`sync_mcp_to_json(self, file_name: str) -> bool`**: Synchronizes the MCP entities to the corresponding JSON file.
- **`detect_conflicts(self) -> List[Dict]`**: Detects conflicts between the JSON files and the MCP.
- **`full_sync(self, direction: str = "json_to_mcp") -> Dict`**: Performs a full synchronization between the JSON files and the MCP.

## Dependencies

The `mcp_json_sync.py` script has the following dependencies:

- **Python 3**: The script is written in Python 3 and requires a compatible Python 3 runtime environment.
- **Standard Python Libraries**: The script uses several standard Python libraries, including `json`, `os`, `hashlib`, `datetime`, `pathlib`, and `logging`.

## Usage Examples

### Synchronizing from JSON to MCP

```python
from mcp_json_sync import MCPJsonSync

sync = MCPJsonSync()
results = sync.full_sync(direction="json_to_mcp")
print(json.dumps(results, indent=2))
```

This will perform a full synchronization from the JSON files to the MCP, updating the MCP with the latest data from the JSON files.

### Synchronizing from MCP to JSON

```python
from mcp_json_sync import MCPJsonSync

sync = MCPJsonSync()
results = sync.full_sync(direction="mcp_to_json")
print(json.dumps(results, indent=2))
```

This will perform a full synchronization from the MCP to the JSON files, updating the JSON files with the latest data from the MCP.

### Synchronizing a Specific File

```python
from mcp_json_sync import MCPJsonSync

sync = MCPJsonSync()
sync.sync_json_to_mcp("tasks.json")

# or

sync.sync_mcp_to_json("agents.json")
```

These examples will synchronize the `tasks.json` file to the MCP or the `agents.json` file from the MCP, respectively.

## Configuration

The `mcp_json_sync.py` script uses the following configuration:

- **`agents_path`**: The path to the directory containing the JSON files and the `sync_metadata.json` file. This is specified as a parameter in the `MCPJsonSync` constructor.

The script also defines the mapping between the JSON file names and their corresponding MCP entity types, ID fields, and sync priority in the `self.sync_files` dictionary.

## Integration Points

The `mcp_json_sync.py` script is a critical component of the rEngine Core platform and integrates with the following key components:

1. **JSON Files**: The script synchronizes the data between the JSON files (located in the `agents_path` directory) and the MCP.
2. **MCP (Memory Coordination Plane)**: The script interacts with the MCP to create, update, and retrieve the entities that represent the data from the JSON files.
3. **Logging**: The script uses the standard Python `logging` module to log synchronization events, errors, and conflicts.

## Troubleshooting

### Synchronization Errors

If the synchronization process encounters any errors, the script will log the issue and continue with the next file. You can check the `sync.log` file (located in the `agents_path` directory) for more details on the errors.

### Conflicts Between JSON and MCP

The script includes a `detect_conflicts()` method that checks for any conflicts between the JSON files and the MCP. If conflicts are detected, they will be logged in the `sync.log` file and also included in the `full_sync()` method's return value.

You can address these conflicts by manually resolving the differences between the JSON files and the MCP, and then running the synchronization process again.

### Missing or Corrupted Sync Metadata

If the `sync_metadata.json` file is missing or corrupted, the script will initialize the metadata with default values. This may result in the synchronization process not being able to detect changes and conflicts accurately. In such cases, you may need to manually delete the `sync_metadata.json` file and let the script recreate it during the next synchronization.
