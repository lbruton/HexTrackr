# Memory Scribe Dashboard Server Documentation

## Purpose & Overview

The `dashboard-server.js` script is a part of the Memory Scribe system, which provides a real-time monitoring and control interface for the Memory Scribe process. This server-side script sets up an HTTP server that exposes various API endpoints for managing the Memory Scribe, analyzing the context, cleaning up memory, and performing other related tasks.

The key responsibilities of this script include:

1. Starting and stopping the Memory Scribe process
2. Analyzing the context and generating reports
3. Cleaning up and archiving old conversation data and memory items
4. Providing a search interface to explore conversations and memory
5. Allowing users to flag items for review or action

By running this dashboard server, developers and administrators can monitor the health and status of the Memory Scribe, as well as perform various management and maintenance tasks to ensure the smooth operation of the overall system.

## Technical Architecture

The `dashboard-server.js` script is built using Node.js and the Express.js web framework. It defines a `MemoryScribeDashboardServer` class that encapsulates the server's functionality.

The main components of the script are:

1. **Server Setup**: The `start()` method sets up the Express.js server and starts listening on the configured port.
2. **Memory Scribe Management**: The `startMemoryScribe()` and `stopMemoryScribe()` methods allow starting and stopping the Memory Scribe process.
3. **Context Analysis**: The `analyzeContext()` method runs the context analysis and returns the results.
4. **Memory Cleanup**: The `cleanupMemory()` method archives old conversation and memory data based on the configured retention policy.
5. **Search and Flagging**: The `performSearch()` and `flagItem()` methods provide search functionality and the ability to flag items for review.
6. **Utility Methods**: The script includes several utility methods for working with files, reading/writing JSON data, and extracting text snippets.

The script also includes the code for a basic `ContextLifecycleManager` class, which is responsible for managing the lifecycle configuration and performing cleanup tasks.

## Dependencies

The `dashboard-server.js` script has the following dependencies:

1. `fs`: Node.js built-in file system module
2. `path`: Node.js built-in path module
3. `child_process`: Node.js built-in child process module (used for executing external commands)

The script also makes use of the following external dependencies:

1. `express`: Web framework for Node.js

## Key Functions/Classes

### `MemoryScribeDashboardServer` Class

This is the main class that encapsulates the server's functionality.

**Constructor**:

- `constructor(port = 3000)`: Initializes the server with the specified port number (default is 3000).

**Public Methods**:

1. `startMemoryScribe()`: Starts the Memory Scribe process, ensuring that the `context-lifecycle.js` file exists and creating it if necessary.
2. `stopMemoryScribe()`: Stops the running Memory Scribe process.
3. `analyzeContext()`: Runs the context analysis and returns the results.
4. `cleanupMemory()`: Performs cleanup by archiving old conversation and memory data based on the configured retention policy.
5. `testOllama()`: Checks if the Ollama tool is available and returns its version.
6. `saveConfig(config)`: Saves the provided configuration to the `lifecycle-config.json` file.
7. `performSearch(query)`: Searches for the given query in conversations and memory, and returns the results.
8. `flagItem({ type, id, action, reason })`: Flags an item (conversation or memory) with the specified action and reason.

**Utility Methods**:

- `checkFileExists(filename)`: Checks if the specified file exists.
- `readJSONFile(filename)`: Reads and parses the JSON content of the specified file.
- `writeJSONFile(filename, data)`: Writes the provided data to the specified JSON file.
- `getBackupCount()`: Returns the number of backup files in the `backups` directory.
- `extractSnippet(text, query)`: Extracts a snippet of text around the provided query.
- `createContextLifecycle()`: Creates a basic `context-lifecycle.js` file with default configuration.

### `ContextLifecycleManager` Class

This class is responsible for managing the context lifecycle configuration and performing cleanup tasks.

**Constructor**:

- `constructor()`: Initializes the class with the paths for the configuration file, flagged items file, and cleanup log file.

**Public Methods**:

- `initialize()`: Ensures that the `lifecycle-config.json` file exists with default configuration.
- `getConfig()`: Reads and returns the configuration from the `lifecycle-config.json` file.
- `performCleanup()`: Performs the cleanup process based on the configured retention policy.

## Usage Examples

### Starting the Memory Scribe Dashboard Server

```javascript
const server = new MemoryScribeDashboardServer();
server.start();
```

This will start the Memory Scribe Dashboard server and listen for incoming requests on the configured port (default is 3000).

### Starting the Memory Scribe Process

```javascript
const result = await server.startMemoryScribe();
if (result.success) {
    console.log(result.message);
} else {
    console.error(result.message);
}
```

This will start the Memory Scribe process and return the result as an object with `success` and `message` properties.

### Performing Context Analysis

```javascript
const result = await server.analyzeContext();
if (result.success) {
    console.log(result.analysis);
} else {
    console.error(result.error);
}
```

This will run the context analysis and return the results or an error message.

### Cleaning up Memory

```javascript
const result = await server.cleanupMemory();
if (result.success) {
    console.log(`Archived ${result.archived} items`);
} else {
    console.error(result.error);
}
```

This will perform the memory cleanup process and return the number of archived items or an error message.

### Searching for Items

```javascript
const result = await server.performSearch('example query');
if (result.error) {
    console.error(result.error);
} else {
    console.log(result.results);
}
```

This will search for the provided query in conversations and memory, and return the search results.

### Flagging an Item

```javascript
const result = await server.flagItem({
    type: 'conversation',
    id: '123',
    action: 'review',
    reason: 'Contains sensitive information'
});

if (result.success) {
    console.log(result.message);
} else {
    console.error(result.error);
}
```

This will flag the specified item (conversation or memory) with the provided action and reason.

## Configuration

The `dashboard-server.js` script uses the following configuration options:

1. **Port**: The port on which the server will listen for incoming requests. This can be set in the constructor of the `MemoryScribeDashboardServer` class.
2. **Lifecycle Configuration**: The `ContextLifecycleManager` class manages the lifecycle configuration, which includes the following options:
   - `retentionDays`: The number of days to retain conversation and memory data.
   - `foreverMode`: If set to `true`, the cleanup process will be skipped, and all data will be retained.
   - `autoCleanup`: If set to `true`, the cleanup process will be automatically triggered at regular intervals.
   - `lastCleanup`: The timestamp of the last successful cleanup operation.

These configuration options can be modified by editing the `lifecycle-config.json` file or by using the `saveConfig()` method of the `MemoryScribeDashboardServer` class.

## Error Handling

The `dashboard-server.js` script includes various error handling mechanisms:

1. **Memory Scribe Process Errors**: If the Memory Scribe process encounters an error, the error will be logged to the console using the `console.error()` method.
2. **Asynchronous Method Errors**: Most asynchronous methods in the `MemoryScribeDashboardServer` class return an object with `success` and `error` or `message` properties, allowing the caller to handle errors appropriately.
3. **File System Errors**: When reading or writing files, the script handles potential errors and returns `null` or an error message, depending on the context.

If an unhandled error occurs, the script will throw an error, which can be caught and handled by the calling code or the overall application.

## Integration

The `dashboard-server.js` script is designed to be a part of the larger Memory Scribe system. It integrates with the following components:

1. **Memory Scribe Process**: The script is responsible for starting, stopping, and monitoring the Memory Scribe process.
2. **Context Analysis**: The script can run the context analysis and return the results.
3. **Data Storage**: The script interacts with the `conversations.json`, `memory.json`, `patterns.json`, and `flagged-items.json` files to manage the data.
4. **Configuration Management**: The script reads and writes the `lifecycle-config.json` file to manage the context lifecycle configuration.

By providing a centralized dashboard and management interface, the `dashboard-server.js` script allows developers and administrators to monitor and control the overall Memory Scribe system.

## Development Notes

1. **Ollama Dependency**: The script assumes the presence of the Ollama tool, which is used for context analysis. If Ollama is not available, the `analyzeContext()` method will throw an error.
2. **File Structure**: The script assumes that all necessary files (configuration, data, and logs) are located in the same directory as the script itself.
3. **Backup Management**: The script includes a method to retrieve the number of backup files in the `backups` directory, but it does not currently include any logic for managing or cleaning up these backups.
4. **Lifecycle Configuration**: The `ContextLifecycleManager` class provides a basic implementation for managing the context lifecycle configuration. In a production environment, this class may need to be extended or replaced with a more sophisticated solution.
5. **Security Considerations**: The script does not currently include any authentication or authorization mechanisms. In a production environment, it is recommended to implement appropriate security measures to control access to the dashboard and its functionality.
