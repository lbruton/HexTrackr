# Dual Memory Writer

## Purpose & Overview

The `dual-memory-writer.js` file is a part of the rEngine Core ecosystem and is responsible for ensuring that all agents write their memory entries to both the persistent memory store and the agent-specific memory stores. This file includes JSON sanitization and error handling to ensure the integrity of the stored data.

The `DualMemoryWriter` class is the main component of this file, and it provides methods to write memory entries to the persistent memory, agent-specific memory, and extended context. This helps maintain a consistent and reliable memory system for the rEngine Core platform.

## Key Functions/Classes

### `DualMemoryWriter` Class

- `constructor()`: Initializes the class by setting the base directory, file paths, and other necessary properties.
- `sanitizeForJSON(data)`: Sanitizes the input data to prevent JSON parsing errors.
- `writeToPersistentMemory(entry)`: Writes the memory entry to the persistent memory store.
- `writeToAgentMemory(agentType, entry)`: Writes the memory entry to the agent-specific memory store.
- `writeToExtendedContext(entry)`: Writes the memory entry to the extended context.
- `dualWrite(agentType, entry)`: Performs the dual write operation, calling the above methods to write the memory entry to both the persistent and agent-specific stores.

## Dependencies

The `dual-memory-writer.js` file depends on the following modules:

- `fs/promises`: For asynchronous file system operations.
- `path`: For working with file paths.
- `fileURLToPath`: For converting the module URL to a file path.

## Usage Examples

To use the `DualMemoryWriter` class, you can import it and create an instance:

```javascript
import DualMemoryWriter from './dual-memory-writer.js';

const writer = new DualMemoryWriter();
```

Then, you can call the `dualWrite` method to write a memory entry:

```javascript
const agentType = 'claude';
const entry = {
  title: 'Test Entry',
  content: 'Test dual memory write',
  type: 'test'
};

await writer.dualWrite(agentType, entry);
```

This will write the memory entry to both the persistent memory store and the agent-specific memory store.

## Configuration

The `DualMemoryWriter` class uses the following file paths, which can be configured by modifying the constructor:

- `persistentMemoryPath`: The path to the persistent memory store file.
- `agentMemoryDir`: The directory where the agent-specific memory store files are located.
- `extendedContextPath`: The path to the extended context file.

## Integration Points

The `dual-memory-writer.js` file is a core component of the rEngine Core platform and is responsible for managing the memory system. It integrates with the following components:

- **Agents**: The memory entries written by the `DualMemoryWriter` class are associated with specific agents.
- **Persistent Memory Store**: The persistent memory store holds long-term memory data for the rEngine Core platform.
- **Agent-Specific Memory Store**: The agent-specific memory stores hold short-term memory data for individual agents.
- **Extended Context**: The extended context holds additional information about the memory entries, such as session details and timestamps.

## Troubleshooting

Here are some common issues and solutions related to the `dual-memory-writer.js` file:

### JSON Parsing Errors

If you encounter JSON parsing errors, it's likely due to invalid or malformed data being written to the memory stores. The `sanitizeForJSON` method in the `DualMemoryWriter` class is designed to handle these cases, but if the data is particularly complex or contains unexpected characters, it may still fail.

To troubleshoot this issue, you can:

1. Check the input data being passed to the `dualWrite` method and ensure it is properly formatted.
2. Inspect the error messages for more information about the specific parsing issue.
3. Modify the `sanitizeForJSON` method to handle any additional edge cases or special characters in the data.

### File System Errors

If you encounter file system errors, such as permission issues or file not found errors, it's likely due to the file paths being incorrect or the file system not being accessible.

To troubleshoot this issue, you can:

1. Verify that the file paths specified in the constructor are correct and that the necessary directories and files exist.
2. Check the file system permissions to ensure the rEngine Core application has the necessary access to read and write the files.
3. Ensure that the file system is accessible and functioning properly.

### Memory Write Failures

If the memory writes fail, it's important to investigate the underlying cause. The `dualWrite` method returns a boolean value indicating whether the write was successful (at least 2 out of 3 writes succeeded).

To troubleshoot this issue, you can:

1. Check the error messages logged by the `writeToPersistentMemory`, `writeToAgentMemory`, and `writeToExtendedContext` methods to identify the specific failure points.
2. Ensure that the file system is accessible and that the necessary directories and files exist.
3. Verify that the input data being passed to the `dualWrite` method is properly formatted and sanitized.

By addressing these common issues, you can ensure the reliable operation of the `dual-memory-writer.js` file within the rEngine Core platform.
