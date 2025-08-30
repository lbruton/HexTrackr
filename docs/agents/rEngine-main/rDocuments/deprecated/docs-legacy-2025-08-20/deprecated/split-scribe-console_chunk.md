# Split Scribe Console Documentation

## Purpose & Overview

The `split-scribe-console.js_chunk_2` script is a part of the larger Split Scribe application, which is a command-line interface (CLI) tool for managing and monitoring the Scribe documentation generation process. This script contains the core functionality of the Split Scribe Console, including commands for generating summaries, checking memory and document sweep status, viewing logs, and handling various other administrative tasks.

The Split Scribe Console serves as a centralized hub for developers and technical writers to interact with the Scribe documentation system, providing a user-friendly way to monitor and control the documentation generation process.

## Technical Architecture

The `SplitScribeConsole` class is the main component of this script, responsible for handling user commands, interacting with the Scribe documentation system, and managing the console's state and output.

The key components and data flow of the `SplitScribeConsole` class are as follows:

1. **Command Handling**: The `handleCommand` method parses the user's input and executes the corresponding action, such as generating a summary, checking memory status, or managing the document sweep process.

1. **Scribe Integration**: The `runSummary`, `checkMemoryStatus`, and `checkDocumentSweepStatus` methods interact with the Scribe documentation system to retrieve and display relevant information.

1. **Document Sweep Monitoring**: The `initDocumentSweepMonitoring`, `parseDocumentSweepLog`, and `parseDocumentSweepLogLine` methods continuously monitor the document sweep log file, parsing and displaying the relevant events and status updates.

1. **Logging and Output**: The `logActivity` method is used to log various types of messages (info, success, error, etc.) to the console's activity log, which is then displayed in the Split Scribe Console UI.

1. **Utility Methods**: The `countFilesRecursively` and `getNextCronTime` methods provide additional functionality to support the console's operations.

1. **Lifecycle Management**: The script sets up a graceful shutdown process to ensure the final session state is saved before the application exits.

## Dependencies

The `split-scribe-console.js_chunk_2` script has the following dependencies:

- `child_process`: Used to spawn the `scribe-summary.js` process.
- `fs`: Used for file system operations, such as reading and writing log files.
- `path`: Used for managing file paths.

## Key Functions/Classes

### `SplitScribeConsole` Class

The `SplitScribeConsole` class is the main component of the script and provides the following key methods:

#### `handleCommand(command)`

- **Description**: Handles a user command by parsing the input and executing the corresponding action.
- **Parameters**: `command` (string) - The user's input command.
- **Returns**: `Promise<void>`

#### `runSummary(timeframe)`

- **Description**: Generates a summary report for the specified time frame.
- **Parameters**: `timeframe` (string) - The time frame for the summary report (e.g., "1h", "1d", "1w").
- **Returns**: `Promise<void>`

#### `initDocumentSweepMonitoring()`

- **Description**: Initializes the monitoring of the document sweep log file.
- **Parameters**: None
- **Returns**: `void`

#### `parseDocumentSweepLog(logPath)`

- **Description**: Parses the document sweep log file and updates the console's activity log with the relevant events and status updates.
- **Parameters**: `logPath` (string) - The path to the document sweep log file.
- **Returns**: `Promise<void>`

#### `checkMemoryStatus()`

- **Description**: Checks the status of the memory system and logs the number of memory files found.
- **Parameters**: None
- **Returns**: `Promise<void>`

#### `checkDocumentSweepStatus()`

- **Description**: Checks the status of the document sweep process, including the last run timestamp, success rate, and the number of generated documents.
- **Parameters**: None
- **Returns**: `Promise<void>`

#### `countFilesRecursively(dir)`

- **Description**: Recursively counts the number of files in a directory.
- **Parameters**: `dir` (string) - The directory path to count files in.
- **Returns**: `Promise<number>` - The number of files found.

#### `getNextCronTime()`

- **Description**: Calculates the next scheduled time for the document sweep process to run (either 6 AM or 6 PM).
- **Parameters**: None
- **Returns**: `string` - The next scheduled run time in a localized string format.

## Usage Examples

Here are some examples of how to use the Split Scribe Console:

```
> summary 1h
Generating 1h summary...
1h summary completed

> memory
Checking memory system status...
Found 42 memory files

> docs
Checking document sweep status...
📊 Last run: 5/25/2023, 6:00:00 AM
📊 Success: 250/300
🔄 Updates: 15 diffs generated
⏰ Next run: 5/26/2023, 6:00:00 AM
📄 Generated docs: 500 files

> logs
Displaying verbose logs...
```

## Configuration

The Split Scribe Console relies on the following configuration options and environment variables:

- `enginePath`: The path to the Scribe documentation generation engine.
- `baseDir`: The base directory for the Scribe project.
- `memoryPath`: The path to the memory files used by the Scribe system.

These values are typically set as part of the larger Split Scribe application configuration and should be managed accordingly.

## Error Handling

The Split Scribe Console handles errors in the following ways:

- **Command Errors**: If an unknown command is entered, the console logs an "Unknown command" error message.
- **Scribe Integration Errors**: If there are any issues when interacting with the Scribe system (e.g., summary generation failure, memory check failure), the console logs an error message with the relevant details.
- **File System Errors**: If there are any issues when reading or writing log files, the console logs an error message with the error details.

In all cases, the console attempts to gracefully handle the errors and continue operation, providing the user with relevant feedback and error messages.

## Integration

The Split Scribe Console is a key component of the larger Split Scribe application, which provides a comprehensive solution for managing the Scribe documentation generation process. The console integrates with the Scribe system, monitoring its status and providing a user-friendly interface for developers and technical writers to interact with the documentation workflow.

## Development Notes

- The console uses a combination of synchronous and asynchronous operations, leveraging `async/await` syntax to handle the various tasks.
- The parsing of the document sweep log file is a crucial aspect of the console's functionality, as it allows for real-time monitoring and reporting of the documentation generation process.
- The console's command handling and output formatting are designed to provide a clear and intuitive user experience, making it easy for developers and technical writers to manage the Scribe documentation system.
- The graceful shutdown process ensures that the console's state is properly saved before the application exits, allowing for a smooth transition between sessions.
