# `sync-memory-files.sh` - Intelligent Memory Synchronization for rEngine Core

## Purpose & Overview

The `sync-memory-files.sh` script is a crucial component in the rEngine Core ecosystem, responsible for keeping the memory files used by the rAgents and agents in sync. This synchronization is necessary due to a limitation in how GitHub handles symbolic links, which is a key feature of the rEngine Core architecture.

The script ensures that the primary memory file located in the `rAgents/memory` directory is kept up-to-date with any changes made by the MCP (Master Control Process) server, which writes to the `agents/memory` directory. This allows the rAgents to seamlessly access the latest memory data, regardless of where the updates were made.

## Key Functions/Classes

The script performs the following key functions:

1. **Memory File Synchronization**: The script compares the modification times of the `rAgents/memory` and `agents/memory` files, and copies the newer file to the other location, ensuring both directories contain the latest data.
2. **Directory Management**: The script creates the target directory (`agents/memory`) if it does not already exist, to ensure a successful copy operation.
3. **Output Formatting**: The script uses ANSI escape codes to provide colorized output, making it easier to understand the script's progress and any potential issues.
4. **Memory File Status Reporting**: The script reports the number of lines in the `rAgents/memory` and `agents/memory` files, providing a quick way to verify the synchronization status.

## Dependencies

The `sync-memory-files.sh` script has the following dependencies:

- Bash shell
- Standard Unix utilities (`mkdir`, `cp`, `wc`)

## Usage Examples

To use the `sync-memory-files.sh` script, simply run it from the command line:

```bash
bash /path/to/sync-memory-files.sh
```

This will initiate the memory file synchronization process.

## Configuration

The script has two configurable variables:

1. `SOURCE_FILE`: The path to the primary memory file located in the `rAgents/memory` directory.
2. `TARGET_FILE`: The path to the secondary memory file located in the `agents/memory` directory.

These variables can be adjusted if the file paths change or the script needs to be used in a different environment.

## Integration Points

The `sync-memory-files.sh` script is a critical component in the rEngine Core ecosystem, as it ensures that the memory data used by the rAgents and agents is always in sync. This allows the rAgents to seamlessly access the latest memory data, regardless of where the updates were made.

The script is typically executed as part of a larger automation or deployment process, and may be triggered by changes in the `rAgents/memory` or `agents/memory` directories, or as part of a scheduled task.

## Troubleshooting

If you encounter any issues with the `sync-memory-files.sh` script, here are some common problems and their solutions:

1. **Permissions Error**: If the script is unable to create the target directory or copy the files, check the file permissions and ensure the script has the necessary permissions to perform these operations.
2. **Outdated File Paths**: If the file paths for `SOURCE_FILE` or `TARGET_FILE` are incorrect, update the script with the correct paths.
3. **Symbolic Link Issues**: If the script is unable to handle the symbolic links correctly, ensure that the file system supports symbolic links and that the script is being executed in an environment that can properly resolve them.

If you continue to encounter issues, you may need to investigate the specific file system or environment-related factors that are causing the problems.
