# rEngine/scribe-console.js

## Purpose & Overview

The `scribe-console.js` file is a part of the rEngine Core ecosystem, providing an interactive console interface for managing conversation summaries and agent memory. This tool, known as the "StackTrackr Scribe Console", allows users to generate summaries of conversations, interact with agent memory files, and perform various system management tasks.

The Scribe Console serves as a centralized hub for the following key features:

1. **Conversation Summarization**: Users can generate detailed summaries of conversations based on specific time frames (e.g., 30 minutes, 1 hour, 6 hours, 12 hours, 24 hours).
2. **Memory Management**: Users can list all available agent memory files, read the contents of individual files, and search across all memories for specific terms.
3. **System Monitoring**: Users can check the status of the memory system, engine system, and Git repository.
4. **Verbose Logging**: The console provides a pink-themed verbose logging system to aid in debugging and troubleshooting.

This console-based interface is designed to simplify the management and analysis of conversational data within the rEngine Core platform.

## Key Functions/Classes

The `scribe-console.js` file defines a single class, `ScribeConsole`, which encapsulates the main functionality of the console.

### `ScribeConsole` Class

The `ScribeConsole` class is responsible for the following tasks:

1. **Initialization**: The `init()` method sets up the readline interface, checks the integrity of the memory and engine systems, and displays the welcome message.
2. **Command Execution**: The `executeCommand()` method handles the processing of user commands, such as generating summaries, managing memory files, and checking system status.
3. **Logging**: The `log()`, `verbose()`, and `toggleVerbose()` methods provide logging functionality with different levels of verbosity and color-coded output.
4. **Memory Management**: The `listMemoryFiles()`, `readMemoryFile()`, and `searchMemories()` methods handle the listing, reading, and searching of agent memory files.
5. **Summary Generation**: The `generateSummary()` method calls the `scribe-summary.js` script to generate conversation summaries for the specified time frame.
6. **Status Reporting**: The `showStatus()` method checks the status of the memory system, engine system, and Git repository.
7. **Prompt Handling**: The `startPrompt()` method sets up the readline interface and listens for user input, executing commands as they are entered.

## Dependencies

The `scribe-console.js` file relies on the following dependencies:

1. **Node.js**: The script is designed to run in a Node.js environment.
2. **Readline**: The `readline` module is used to create the interactive console interface.
3. **File System**: The `fs/promises` module is used for file system operations, such as reading and writing files.
4. **Path**: The `path` module is used for handling file paths.
5. **Child Process**: The `execSync` function from the `child_process` module is used to execute the `scribe-summary.js` script.

Additionally, the script expects the following directory structure within the rEngine Core project:

- `rMemory/rAgentMemories`: The directory where agent memory files are stored.
- `rEngine`: The directory where the `scribe-summary.js` script and other rEngine Core components are located.

## Usage Examples

To use the StackTrackr Scribe Console, follow these steps:

1. Navigate to the rEngine Core project directory in your terminal.
2. Run the following command to start the console:

   ```bash
   node scribe-console.js
   ```

1. The console will display the welcome message and prompt you to enter commands.

Here are some example commands you can use:

```
summary 6h          # Generate a 6-hour conversation summary
memory list         # List all agent memory files
memory read tasks   # Read the contents of the tasks.json memory file
memory search "bug" # Search for the term "bug" across all memories
status              # Show the current system status
verbose on          # Enable verbose logging
clear               # Clear the console
help                # Display the available commands
exit                # Exit the Scribe Console
```

## Configuration

The `scribe-console.js` script does not require any external configuration files or environment variables. The paths to the memory and engine directories are hardcoded within the `ScribeConsole` class.

If you need to customize these paths, you can modify the `this.memoryPath` and `this.enginePath` properties in the constructor of the `ScribeConsole` class.

## Integration Points

The Scribe Console is a standalone component within the rEngine Core ecosystem, but it interacts with other components in the following ways:

1. **Conversation Summarization**: The `generateSummary()` method calls the `scribe-summary.js` script, which is responsible for generating the conversation summaries.
2. **Memory Management**: The Scribe Console reads and writes agent memory files stored in the `rAgentMemories` directory.
3. **System Monitoring**: The `showStatus()` method checks the status of the memory system, engine system, and Git repository, providing a high-level overview of the rEngine Core environment.

These integration points allow the Scribe Console to function as a central hub for managing and analyzing the data within the rEngine Core platform.

## Troubleshooting

Here are some common issues and solutions related to the Scribe Console:

1. **Memory Path or Engine Path Not Found**:
   - Ensure that the `rAgentMemories` and `rEngine` directories exist within the rEngine Core project structure.
   - Check the file permissions and ensure that the current user has the necessary access rights to these directories.

1. **Scribe Summary System Not Found**:
   - Verify that the `scribe-summary.js` script is present in the `rEngine` directory.
   - Check that the script is properly exported and can be executed from the Scribe Console.

1. **Verbose Logging Not Working**:
   - Ensure that the `isVerbose` property in the `ScribeConsole` class is set correctly.
   - Check the console output for any error messages related to the verbose logging functionality.

1. **Memory File Reading or Searching Issues**:
   - Verify that the agent memory files are in the correct JSON format and located in the `rAgentMemories` directory.
   - Ensure that the file names match the expected format (e.g., `filename.json`).

1. **Summary Generation Failures**:
   - Check the console output for any error messages related to the summary generation process.
   - Ensure that the `scribe-summary.js` script is functioning correctly and can be executed independently.

If you encounter any other issues or have further questions, please refer to the rEngine Core documentation or reach out to the development team for assistance.
