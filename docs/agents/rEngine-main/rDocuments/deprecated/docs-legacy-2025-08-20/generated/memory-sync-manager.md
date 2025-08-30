# rEngine Core: Memory Sync Manager

## Purpose & Overview

The `memory-sync-manager.js` file is a crucial component of the rEngine Core platform, responsible for managing the bidirectional synchronization between the persistent JSON memory storage and the rEngine MCP (Multimodal Cognitive Platform) memory. This module ensures the resilience of the memory system against MCP crashes, providing a reliable and consistent way to store and retrieve data.

The main responsibilities of the `MemorySyncManager` class include:

1. **Loading Persistent Memory**: Automatically loading the memory data from a persistent JSON file, or creating a new empty memory structure if the file is not found.
2. **Saving Persistent Memory**: Securely saving the memory data to a persistent JSON file, with a backup copy created for added reliability.
3. **Syncing to MCP**: Providing a mechanism to synchronize the persistent memory data with the MCP memory, ensuring that the two systems stay in sync.
4. **Health Checking**: Performing regular health checks on the memory system, including verifying the existence of the persistent file and tracking sync failures.
5. **Smart Scribe Integration**: Providing a way to merge data from the Smart Scribe system into the persistent memory, enhancing the knowledge base.

By managing the memory synchronization process, this module helps to maintain the integrity and availability of the rEngine Core's memory system, which is crucial for the platform's overall functionality and reliability.

## Key Functions/Classes

The `MemorySyncManager` class is the main component of this file, and it provides the following key functions:

### `loadPersistentMemory()`

Loads the persistent memory data from the JSON file, or creates a new empty memory structure if the file does not exist.

### `savePersistentMemory(memoryData)`

Saves the provided memory data to the persistent JSON file, creating a backup copy before the update.

### `addEntity(entityName, entityData)`

Adds a new entity to the persistent memory and attempts to synchronize it with the MCP memory.

### `addConversation(conversationId, conversationData)`

Adds a new conversation to the persistent memory and synchronizes it with the MCP memory.

### `syncToMCP(memoryData)`

Attempts to synchronize the provided memory data with the MCP memory, handling errors and retries.

### `preCommitSync()`

Performs a pre-commit sync, which includes merging any Smart Scribe data and running a health check before committing changes to version control.

### `healthCheck()`

Checks the health of the memory system, including the existence of the persistent file and the number of sync failures.

### `mergeSmartScribeData()`

Merges data from the Smart Scribe system into the persistent memory, updating the metadata accordingly.

## Dependencies

The `memory-sync-manager.js` file depends on the following external libraries:

- `fs-extra`: Provides a more robust file system API with additional features like `pathExists()` and `readJson()`.
- `path`: Provides utilities for working with file and directory paths.

Additionally, this file is designed to integrate with the rEngine MCP, though the specific implementation details of that integration are not shown in the provided code.

## Usage Examples

The `MemorySyncManager` class can be used in other rEngine Core modules to manage the persistent memory. Here's an example of how to use it:

```javascript
import MemorySyncManager from './memory-sync-manager';

const manager = new MemorySyncManager();

// Load persistent memory
const memory = await manager.loadPersistentMemory();

// Add a new entity
const newEntity = await manager.addEntity('my-entity', {
  name: 'My Entity',
  data: 'some data'
});

// Add a new conversation
const newConversation = await manager.addConversation('my-conversation', {
  topic: 'My Conversation',
  messages: ['Hello', 'World']
});

// Perform a pre-commit sync
await manager.preCommitSync();
```

## Configuration

The `MemorySyncManager` class uses the following configuration options:

| Option | Description | Default Value |
| --- | --- | --- |
| `baseDir` | The base directory for the rEngine Core project | `/Volumes/DATA/GitHub/rEngine` |
| `persistentFile` | The path to the persistent memory JSON file | `path.join(process.cwd(), 'persistent-memory.json')` |
| `backupFile` | The path to the persistent memory backup JSON file | `path.join(process.cwd(), 'persistent-memory.backup.json')` |
| `isReadOnlyToMCP` | Indicates whether the MCP is allowed to write to the persistent memory | `true` |

These options can be modified as needed to fit the specific deployment environment of the rEngine Core platform.

## Integration Points

The `memory-sync-manager.js` file is a crucial component of the rEngine Core platform, and it integrates with the following key components:

1. **rEngine MCP**: The `syncToMCP()` function is responsible for synchronizing the persistent memory data with the MCP memory, ensuring that the two systems stay in sync.
2. **Smart Scribe**: The `mergeSmartScribeData()` function allows for the integration of data from the Smart Scribe system into the persistent memory, enhancing the knowledge base.
3. **Version Control (Git)**: The `preCommitSync()` function is designed to be used as a pre-commit hook, ensuring that the memory is in a consistent state before committing changes to version control.

## Troubleshooting

Here are some common issues that may arise with the `MemorySyncManager` and their potential solutions:

1. **Persistent Memory File Missing**:
   - **Symptom**: The `loadPersistentMemory()` function returns an empty memory structure due to the persistent file not being found.
   - **Solution**: Verify the file path specified in the `persistentFile` configuration option. Ensure that the directory exists and that the rEngine Core process has the necessary permissions to access the file.

1. **Sync Failures**:
   - **Symptom**: The `syncToMCP()` function is unable to successfully synchronize the memory data with the MCP memory, and the `sync_failures` count in the system state increases.
   - **Solution**: Check the MCP integration and ensure that the rEngine Core process has the necessary permissions and access to communicate with the MCP. Review any error messages or logs for more information about the sync failures.

1. **Pre-Commit Sync Timeout**:
   - **Symptom**: The `preCommitSync()` function times out before completing the synchronization process.
   - **Solution**: Increase the timeout value specified in the `timeoutPromise` creation, or investigate potential performance bottlenecks in the synchronization process.

1. **Smart Scribe Data Merge Failure**:
   - **Symptom**: The `mergeSmartScribeData()` function is unable to successfully merge the data from the Smart Scribe system into the persistent memory.
   - **Solution**: Verify the existence and format of the `scribe-mcp-export.json` file, and ensure that the rEngine Core process has the necessary permissions to read and process the file.

By addressing these common issues, you can ensure the smooth operation and reliability of the rEngine Core's memory synchronization system.
