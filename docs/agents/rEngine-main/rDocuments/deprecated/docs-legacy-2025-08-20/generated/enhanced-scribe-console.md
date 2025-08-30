# Enhanced StackTrackr Scribe Console

## Purpose & Overview

The `enhanced-scribe-console.js` file is part of the rEngine Core ecosystem and provides an enhanced version of the StackTrackr Scribe Console. This console serves as a command-line interface for interacting with the rEngine Core platform, offering features such as:

- Hello Kitty ASCII art welcome
- Clean INFO logging format
- Display of the last 5 changes
- Persistent terminal (doesn't close for commands)
- Background monitoring with separate terminals

The enhanced console aims to improve the user experience and provide a more intuitive way to manage the rEngine Core system, including memory management, file monitoring, and generating summaries.

## Key Functions/Classes

The main class in this file is `EnhancedScribeConsole`, which encapsulates the functionality of the enhanced console. Here are the key functions and their roles:

| Function | Description |
| --- | --- |
| `constructor()` | Initializes the console, setting up the base directory, memory path, engine path, and activity log. It also creates the readline interface and starts the interactive mode. |
| `logActivity(message, type)` | Logs an activity message with the specified type (e.g., "INFO", "ERROR", "SYSTEM") and updates the activity log. |
| `showWelcome()` | Displays the Hello Kitty ASCII art welcome message and initializes the system. |
| `initializeSystems()` | Checks the memory and summary systems, starts the background monitoring, and shows the current status. |
| `startBackgroundMonitoring()` | Sets up a file watcher to monitor changes in the memory, engine, and UI files, and logs the corresponding updates. |
| `updateDisplay()` | Updates the console display with the recent activity log. |
| `showCurrentStatus()` | Displays the current system status and the available commands. |
| `startInteractiveMode()` | Starts the interactive console, handling user commands and executing the corresponding actions. |
| `handleCommand(command)` | Processes the user's command, such as generating a summary, checking memory status, or displaying logs. |
| `runSummary(timeframe)` | Generates a conversation summary for the specified timeframe by running the `scribe-summary.js` script in a separate process. |
| `checkMemoryStatus()` | Checks the status of the memory system, including the number of memory files and the last modification time. |
| `showRecentLogs()` | Displays the recent activity log. |

## Dependencies

The `enhanced-scribe-console.js` file depends on the following external modules:

- `readline`: For creating the interactive console interface.
- `fs/promises`: For accessing and manipulating the file system.
- `path`: For working with file paths.
- `child_process`: For spawning separate processes to run the summary generation.
- `url`: For converting file URLs to file paths.
- `chokidar`: For monitoring file changes in the background.

Additionally, it integrates with the following rEngine Core components:

- `rMemory/rAgentMemories`: The directory where the agent's memory files are stored.
- `rEngine/scribe-summary.js`: The script that generates the conversation summary.

## Usage Examples

To use the Enhanced StackTrackr Scribe Console, run the following command:

```
node enhanced-scribe-console.js
```

This will start the console and display the Hello Kitty ASCII art welcome message. From here, you can interact with the console by entering various commands:

- `summary [timeframe]`: Generate a conversation summary for the specified timeframe (e.g., "1h", "1d", "1w").
- `memory`: Check the status of the memory system.
- `logs`: View the recent activity log.
- `clear`: Clear the console screen.
- `help`: Display the available commands.
- `quit`: Exit the console.

## Configuration

The Enhanced StackTrackr Scribe Console does not require any specific environment variables or configuration files. The necessary paths and settings are hardcoded within the `EnhancedScribeConsole` class.

## Integration Points

The Enhanced StackTrackr Scribe Console is a key component of the rEngine Core platform, providing a user-friendly interface for interacting with the system. It integrates with the following rEngine Core components:

- `rMemory/rAgentMemories`: The console monitors the memory files and logs any updates or changes.
- `rEngine/scribe-summary.js`: The console can run the summary generation script to produce conversation summaries.
- `index.html` and `js/**/*.js`, `css/**/*.css`: The console monitors these files for changes and logs the updates.

## Troubleshooting

Here are some common issues and solutions related to the Enhanced StackTrackr Scribe Console:

### Memory System Not Found

If the console logs an error message indicating that the memory system is not found, check the following:

1. Ensure that the `rMemory/rAgentMemories` directory exists within the rEngine Core project.
2. Verify that the user running the console has the necessary permissions to access the memory directory.
3. If the directory is not present, create it or check the file structure of the rEngine Core project.

### Summary System Not Found

If the console logs an error message indicating that the summary system is not found, check the following:

1. Ensure that the `rEngine/scribe-summary.js` file exists within the rEngine Core project.
2. Verify that the file has the correct name and location.
3. If the file is missing, check the rEngine Core project structure or create the file with the necessary summary generation code.

### Monitoring Issues

If the background file monitoring seems to be not working as expected, check the following:

1. Ensure that the file paths being monitored (memory files, HTML, JavaScript, CSS) are correct and match the actual file structure.
2. Verify that the `chokidar` library is installed and functioning properly.
3. Check if any of the monitored directories or files are being excluded or ignored by the `chokidar` configuration.

If you encounter any other issues, please refer to the rEngine Core documentation or reach out to the development team for further assistance.
