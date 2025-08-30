# rMemory/rAgentMemories/scripts/sync_memory_vault.py

## Purpose & Overview

The `sync_memory_vault.py` script is a part of the rEngine Core ecosystem, responsible for synchronizing the memory files of rEngine agents with a centralized "Memory Vault" repository. This script ensures that the latest agent memory data is consistently stored and versioned in the Memory Vault, enabling seamless collaboration and data sharing among rEngine components.

## Key Functions/Classes

1. **MemoryVaultSync Class**:
   - `__init__`: Initializes the class with the necessary paths and file names.
   - `ensure_vault_directory`: Ensures that the Memory Vault directory exists.
   - `get_last_sync_time`: Retrieves the timestamp of the last successful sync.
   - `update_last_sync_time`: Updates the timestamp of the last successful sync.
   - `has_changes`: Checks if a file has been modified since the last sync.
   - `sync_memory_files`: Synchronizes the memory files from the source path to the Memory Vault.
   - `commit_and_push`: Commits and pushes the changes to the Memory Vault repository.
   - `sync`: The main synchronization process, which orchestrates the entire sync operation.

1. **main() Function**:
   - Instantiates the `MemoryVaultSync` class and calls the `sync()` method to initiate the memory synchronization.

## Dependencies

The `sync_memory_vault.py` script depends on the following:

- Python 3
- The `os`, `sys`, `json`, `shutil`, `datetime`, `pathlib`, `subprocess`, and `time` modules from the Python standard library.

## Usage Examples

To use the `sync_memory_vault.py` script, follow these steps:

1. Ensure that the script is placed in the correct directory (`rMemory/rAgentMemories/scripts/`).
2. Run the script using the following command:

   ```bash
   python3 sync_memory_vault.py
   ```

   This will initiate the memory synchronization process.

## Configuration

The script requires the following configuration settings, which are hardcoded in the `MemoryVaultSync` class:

- `source_path`: The path to the directory containing the agent memory files.
- `vault_repo`: The name of the Memory Vault repository.
- `vault_path`: The path to the Memory Vault directory.
- `last_sync_file`: The path to the file that stores the timestamp of the last successful sync.

You can modify these values in the script's source code to match your specific deployment environment.

## Integration Points

The `sync_memory_vault.py` script is closely integrated with the rEngine Core platform, specifically the rMemory and rAgentMemories components. It ensures that the agent memory data is consistently synchronized with the centralized Memory Vault, allowing other rEngine components to access and utilize the latest agent memory information.

## Troubleshooting

1. **Memory files not found**: If the script encounters any memory files that are not present in the source directory, it will log a message indicating the missing file.
2. **Git operation failures**: If the script encounters any issues during the Git commit or push operations, it will log the error message and continue the sync process.
3. **Sync process fails**: If the sync process fails for any reason, the script will log the error and exit.

To troubleshoot issues, you can check the script's output for any error messages or warnings, and ensure that the configured paths and permissions are correct.
