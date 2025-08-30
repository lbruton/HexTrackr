# rEngine Core: MCP Fallback Handler

## Purpose & Overview

The `mcp-fallback-handler.js` file is a crucial component in the rEngine Core ecosystem, providing an automatic fallback mechanism for the Memory Consolidation Platform (MCP) server. When the MCP server is unavailable or fails, this script allows the rEngine-based applications to seamlessly switch to using local JSON memory files, ensuring uninterrupted operation and data retrieval.

The primary purpose of this file is to:

1. **Test MCP Server Availability**: Regularly check if the MCP server is running and accessible.
2. **Provide Local Memory Fallback**: Retrieve memory data from local JSON files when the MCP server is unavailable.
3. **Handle Critical Memory Files**: Ensure access to essential memory files, such as `handoff.json`, `tasks.json`, and others, even in emergency situations.

This fallback mechanism is essential for maintaining the reliability and resilience of the rEngine Core platform, especially in scenarios where the MCP server experiences downtime or connectivity issues.

## Key Functions/Classes

The `MCPFallbackHandler` class is the main component in this file, and it provides the following key functions:

1. **`testMCPConnection()`**: Checks if the MCP server is running and available.
2. **`getLocalMemory(searchTerm)`**: Retrieves memory data from local JSON files as a fallback when the MCP server is unavailable.
3. **`getMemoryFile(filename)`**: Retrieves a specific JSON memory file from the local file system.
4. **`getHandoffInfo()`**: Retrieves the handoff information, which is critical for agent transitions.
5. **`getMemoryWithFallback(searchTerm)`**: The main entry point that tries to use the MCP server first and falls back to local JSON files if necessary.
6. **`emergencyHandoff()`**: Retrieves all critical memory files (handoff, tasks, decisions, memory, and extended context) in an emergency situation, regardless of the MCP server's status.

These functions work together to provide a seamless fallback mechanism, ensuring that rEngine-based applications can continue to operate even when the MCP server is unavailable.

## Dependencies

The `mcp-fallback-handler.js` file has the following dependencies:

- **Node.js**: This script is designed to run in a Node.js environment.
- **Built-in Modules**: The script uses the following built-in Node.js modules:
  - `fs/promises`: For asynchronous file system operations.
  - `path`: For working with file paths.
  - `child_process`: For executing shell commands.
  - `url`: For handling file URLs.

Additionally, the script relies on the `recall.js` script located in the `rEngine` directory, which is used to retrieve memory data from local JSON files.

## Usage Examples

You can use the `MCPFallbackHandler` class in your rEngine-based applications by importing it and calling the relevant methods:

```javascript
import MCPFallbackHandler from './mcp-fallback-handler.js';

const fallback = new MCPFallbackHandler();

// Test MCP server availability
const mcpAvailable = await fallback.testMCPConnection();
console.log(`MCP Server Available: ${mcpAvailable}`);

// Get memory with fallback
const memory = await fallback.getMemoryWithFallback('search term');
console.log(memory);

// Get handoff information
const handoff = await fallback.getHandoffInfo();
console.log(handoff);

// Emergency handoff
const emergencyData = await fallback.emergencyHandoff();
console.log(emergencyData);
```

## Configuration

The `MCPFallbackHandler` class has the following configuration options:

1. **`basePath`**: The base path where the StackTrackr project is located. This is used to locate the `rAgents` and `rMemory/rAgentMemories` directories.
2. **`ragentsPath`**: The path to the `rAgents` directory, which is derived from the `basePath`.
3. **`rMemoryPath`**: The path to the `rMemory/rAgentMemories` directory, which is also derived from the `basePath`.

These paths can be modified if the project structure changes or if the script needs to be used in a different environment.

## Integration Points

The `mcp-fallback-handler.js` file is a critical component in the rEngine Core platform, as it provides a reliable fallback mechanism for the Memory Consolidation Platform (MCP) server. It integrates with the following rEngine Core components:

1. **MCP Server**: The script checks the availability of the MCP server and uses it as the primary source of memory data.
2. **`recall.js`**: The script uses the `recall.js` utility to retrieve memory data from local JSON files when the MCP server is unavailable.
3. **rAgent Memory**: The script can access the `rAgents` and `rMemory/rAgentMemories` directories to retrieve critical memory files.

## Troubleshooting

Here are some common issues and solutions related to the `mcp-fallback-handler.js` file:

1. **MCP Server Unavailable**: If the MCP server is unavailable, the script will automatically fall back to using local JSON memory files. However, if the local memory files are also not accessible, the script will return an error.
   - **Solution**: Ensure that the `rAgents` and `rMemory/rAgentMemories` directories are accessible and contain the necessary JSON files.

1. **Missing Memory Files**: If a specific memory file (e.g., `handoff.json`, `tasks.json`) is not found in the expected locations, the script will return an error.
   - **Solution**: Check the file paths in the `MCPFallbackHandler` class and ensure that the necessary memory files are present in the correct locations.

1. **Unexpected Memory Data Format**: If the memory data retrieved from the local JSON files is not in the expected format, the script may encounter errors.
   - **Solution**: Ensure that the local JSON memory files are structured correctly and match the expected data format.

1. **Compatibility Issues with `recall.js`**: If there are changes or issues with the `recall.js` script, the fallback mechanism may not work as expected.
   - **Solution**: Verify the compatibility and functionality of the `recall.js` script, and update the `mcp-fallback-handler.js` file accordingly.

By addressing these potential issues, you can ensure the reliable operation of the `mcp-fallback-handler.js` file and the overall resilience of the rEngine Core platform.
