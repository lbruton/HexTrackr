# rEngine Memory Protection & Sync Script

## Purpose & Overview

The `memory-protection.sh` script is a critical component of the rEngine Core ecosystem, responsible for ensuring the persistence and integrity of the application's memory data. This script performs the following key functions:

1. **Backup Management**: Automatically creates timestamped backups of the `persistent-memory.json` file, which stores the application's critical data. It keeps a rolling history of the last 10 backups to protect against data loss.

1. **Memory Health Checks**: Regularly runs health checks on the application's memory to detect any potential issues or corruption, allowing for proactive maintenance and troubleshooting.

1. **MCP Memory Synchronization**: Attempts to read from the MCP (Memory Control Plane) in a read-only mode, ensuring that any new data from the MCP is properly integrated with the local persistent memory.

This script is designed to work seamlessly with the rEngine Core platform, providing a robust and reliable memory management system that can withstand unexpected crashes or failures of the MCP.

## Key Functions/Classes

The `memory-protection.sh` script defines the following key functions:

1. `create_backup()`: This function creates a timestamped backup of the `persistent-memory.json` file and stores it in the `.memory-backups` directory. It also manages the backup history, keeping only the last 10 backups to conserve disk space.

1. `check_memory_health()`: This function runs a health check on the application's memory by executing the `memory-sync-manager.js` script in a read-only mode. It reports the status of the memory health check.

1. `read_from_mcp()`: This function attempts to read from the MCP's memory in a read-only mode, ensuring that any new data from the MCP is properly integrated with the local persistent memory.

## Dependencies

The `memory-protection.sh` script has the following dependencies:

1. **Node.js**: The script relies on the `memory-sync-manager.js` script, which is a Node.js application. Ensure that Node.js is installed on the system where the script is running.

1. **rEngine Core**: The script is designed to work within the rEngine Core ecosystem and requires the presence of the rEngine directory and the `persistent-memory.json` file.

## Usage Examples

To run the `memory-protection.sh` script, navigate to the rEngine directory and execute the script:

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
./memory-protection.sh
```

The script will automatically perform the following steps:

1. Create a backup of the `persistent-memory.json` file.
2. Run a memory health check.
3. Attempt to read from the MCP's memory in a read-only mode.

The script will output the status of each step and provide information about the overall memory protection system.

## Configuration

The `memory-protection.sh` script uses the following configuration parameters:

- `RENGINE_DIR`: The path to the rEngine directory, where the `persistent-memory.json` file and the `.memory-backups` directory are located.
- `PERSISTENT_FILE`: The path to the `persistent-memory.json` file, which stores the application's critical data.
- `BACKUP_DIR`: The path to the `.memory-backups` directory, where the backup files are stored.

These parameters can be adjusted based on the specific deployment of the rEngine Core platform.

## Integration Points

The `memory-protection.sh` script is a critical component of the rEngine Core platform and integrates with the following components:

1. **persistent-memory.json**: The script manages the backup and synchronization of the data stored in this file, which is the primary storage for the application's persistent memory.

1. **memory-sync-manager.js**: The script calls this Node.js application to perform the memory health checks and read-only operations from the MCP.

1. **MCP (Memory Control Plane)**: The script attempts to read from the MCP's memory in a read-only mode, ensuring that any new data from the MCP is properly integrated with the local persistent memory.

## Troubleshooting

Here are some common issues and solutions related to the `memory-protection.sh` script:

1. **Backup creation failure**:
   - **Cause**: The `persistent-memory.json` file does not exist or is not accessible.
   - **Solution**: Ensure that the `RENGINE_DIR` and `PERSISTENT_FILE` paths are correct and that the user running the script has the necessary permissions to access the file.

1. **Memory health check failure**:
   - **Cause**: The `memory-sync-manager.js` script is not available or is not functioning correctly.
   - **Solution**: Verify that the `memory-sync-manager.js` script is present in the rEngine directory and that it is executable. Also, ensure that Node.js is installed and configured correctly.

1. **MCP read failure**:
   - **Cause**: The MCP is not available or is not responding to the read-only request.
   - **Solution**: Check the connectivity and availability of the MCP. Ensure that the rEngine Core platform is properly configured to interact with the MCP.

If you encounter any other issues, please refer to the rEngine Core documentation or reach out to the rEngine support team for further assistance.
