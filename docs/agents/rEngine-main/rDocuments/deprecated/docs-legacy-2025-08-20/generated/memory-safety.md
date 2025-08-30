# rEngine Core: Memory Safety & Isolation System

## Purpose & Overview

The `memory-safety.js` file is a critical component of the rEngine Core platform, responsible for ensuring the integrity and security of the application's memory management system. This system enforces strict access controls, automatic backups, and integration with the broader rEngine memory infrastructure.

The key objectives of this system are:

1. **Scribe Isolation**: Ensuring that the scribe component can only write to its designated files, preventing unauthorized access or modifications.
2. **Agent Isolation**: Maintaining separate, isolated memory spaces for each agent, avoiding cross-contamination of data.
3. **Master Lookup**: Maintaining a centralized lookup table to track all memory files and their access permissions.
4. **Automatic Backups**: Automatically backing up deleted memories to provide a 24-hour retention period for emergency recovery.
5. **Memory Database Protection**: Preventing unintentional wipes of the memory database without explicit confirmation.
6. **MCP Integration**: Integrating with the rEngine's Memory Coordination Protocol (MCP) to maintain a consistent and reliable memory system.

## Key Functions/Classes

The `MemorySafetySystem` class is the main component responsible for managing the memory safety and isolation features. Here are its key functions:

### `init()`

Initializes the memory safety system by:

- Ensuring the required directory structure
- Initializing the master lookup table
- Setting up the deleted memory backup mechanism

### `validateFileAccess(requester, operation, filePath)`

Validates the access permissions for a given file based on the requester (scribe or agent) and the operation (read or write).

### `backupBeforeDelete(filePath, content)`

Backs up the content of a file before it is deleted, maintaining a 24-hour retention period for emergency recovery.

### `updateMasterLookup()`

Scans the memory directories and updates the master lookup table with the current file information, including access levels.

### `syncWithMCP()`

Verifies the connection and health of the rEngine's Memory Coordination Protocol (MCP) system.

### `recoverDeletedMemory(fileName, hoursBack = 24)`

Allows for the recovery of deleted memory files from the backup system, within a specified time frame.

### `generateStatusReport()`

Generates a comprehensive status report for the memory safety system, including isolation metrics, backup information, and overall system health.

## Dependencies

The `memory-safety.js` file relies on the following dependencies:

- `fs-extra`: An enhanced file system library for Node.js, providing additional functionality over the built-in `fs` module.
- `path`: The built-in Node.js module for working with file paths.
- `fileURLToPath`: A utility function from the `url` module, used to convert a file URL to a file path.

Additionally, the `syncWithMCP()` function integrates with the rEngine's Memory Coordination Protocol (MCP) system, which is likely implemented in a separate module or component.

## Usage Examples

The `memory-safety.js` file can be used in the following ways:

1. **Initialization**:

```javascript
const safetySys = new MemorySafetySystem();
await safetySys.init();
```

1. **Validating File Access**:

```javascript
const accessResult = await safetySys.validateFileAccess('scribe', 'write', 'scribe_analysis.json');
if (!accessResult.allowed) {
  console.error(`Access denied: ${accessResult.reason}`);
}
```

1. **Updating the Master Lookup**:

```javascript
await safetySys.updateMasterLookup();
```

1. **Recovering Deleted Memory**:

```javascript
const recoveredContent = await safetySys.recoverDeletedMemory('gpt4_memories.json');
console.log(recoveredContent);
```

1. **Generating a Status Report**:

```javascript
const report = await safetySys.generateStatusReport();
console.log(JSON.stringify(report, null, 2));
```

## Configuration

The `MemorySafetySystem` class has the following configuration options:

- `baseDir`: The base directory for the rEngine Core application.
- `memoryDir`: The directory where all memory-related files are stored.
- `scribeDir`: The directory for scribe-specific memory files.
- `agentDir`: The directory for agent-specific memory files.
- `backupDir`: The directory for storing deleted memory backups.
- `deletedBackupFile`: The file path for the deleted memory backup log.
- `masterLookupFile`: The file path for the master memory lookup table.
- `scribeAllowedFiles`: The list of files that the scribe is allowed to write to.
- `agentAllowedFiles`: The list of files that agents are allowed to write to.
- `sharedFiles`: The list of files that are accessible for both scribe and agents.

These configurations can be adjusted to fit the specific requirements of the rEngine Core deployment.

## Integration Points

The `memory-safety.js` file integrates with the following rEngine Core components:

1. **Scribe**: The scribe component interacts with the memory safety system to ensure that it can only write to its designated files.
2. **Agents**: Each agent has its own isolated memory space, managed by the memory safety system.
3. **Memory Coordination Protocol (MCP)**: The memory safety system integrates with the MCP to maintain a consistent and reliable memory infrastructure.
4. **Memory Database**: The memory safety system protects the memory database from unintentional wipes, ensuring data integrity.

## Troubleshooting

Here are some common issues and their solutions related to the Memory Safety & Isolation System:

### Memory File Access Errors

- **Symptom**: Agent or scribe unable to access a memory file.
- **Solution**: Check the master lookup table to ensure that the file access permissions are correctly configured. Verify the `scribeAllowedFiles`, `agentAllowedFiles`, and `sharedFiles` settings.

### Deleted Memory Recovery Failures

- **Symptom**: Unable to recover a deleted memory file.
- **Solution**: Verify that the deleted memory backup file (`deletedBackupFile`) exists and contains the expected backup data. Check the `recoverDeletedMemory()` function for any errors.

### MCP Connection Issues

- **Symptom**: MCP connection is not available or unreliable.
- **Solution**: Ensure that the MCP system is properly configured and running. Check the `syncWithMCP()` function for any errors or network connectivity problems.

### Master Lookup Table Corruption

- **Symptom**: Master lookup table is not updating correctly or contains incorrect information.
- **Solution**: Manually inspect the `masterLookupFile` and try to recreate the file using the `initializeMasterLookup()` function. Check for any file system or permissions issues that may be causing the problem.

If you encounter any other issues, please refer to the rEngine Core documentation or reach out to the development team for further assistance.
