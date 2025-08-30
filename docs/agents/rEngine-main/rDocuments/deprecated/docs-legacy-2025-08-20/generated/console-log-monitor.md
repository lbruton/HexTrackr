# Console Log Monitor for rEngine Core

## Purpose & Overview

The `console-log-monitor.js` file is a part of the `memory-scribe` module within the rEngine Core platform. It provides a real-time monitoring and logging system for the console output of various components within the rEngine ecosystem, with a focus on tracking the activity of AI agents such as GitHub Copilot, Claude, GPT, and others.

The primary goals of the Console Log Monitor are:

1. **Capture and Log Console Output**: It intercepts the console output (logs, errors, warnings) from various sources, including the rEngine Core processes, VS Code extension host, and potential external log files.
2. **Track AI Agent Activity**: The monitor identifies and logs any activities related to AI agents, such as file operations, memory usage, and other relevant events.
3. **Maintain Activity Logs and Analytics**: The monitor stores the captured console logs and AI agent activity data in a central location, allowing for analysis and reporting.

This module plays a crucial role in the rEngine Core platform by providing comprehensive visibility into the runtime behavior and interactions of the various components, particularly the AI-powered features and services.

## Key Functions/Classes

The `ConsoleLogMonitor` class is the main component of this file, responsible for the following key functions:

### `constructor(memoryScribePath)`

- Initializes the monitor with the provided `memoryScribePath`, which is the root directory for the `memory-scribe` module.
- Sets up paths for the log file and AI activity JSON file.
- Defines the common console log sources and patterns to identify AI agent activity.
- Loads the existing AI activity data from the JSON file.

### `startMonitoring()`

- Starts the real-time console log monitoring process.
- Creates the log file if it doesn't exist.
- Monitors the VS Code extension host logs, the current process console output, and any other potential terminal activity logs.
- Intercepts the console output (log, error, warning) and logs the activity.

### `stopMonitoring()`

- Stops the console log monitoring process.

### `trackAIActivity(content, source)`

- Processes the captured console log content to identify AI agent activity.
- Extracts relevant information, such as the agent name, timestamp, and activity type.
- Updates the AI activity data, including session-level and agent-level statistics.
- Saves the updated AI activity data to the JSON file.

### `getActivitySummary()`

- Provides an overview of the current monitoring status, including total activities, today's activities, agent statistics, and file paths.

### `getRecentActivity(limit = 50)`

- Retrieves the most recent console log activities, up to the specified limit.

## Dependencies

The `console-log-monitor.js` file depends on the following external modules and libraries:

- `fs` (built-in Node.js module) - For file system operations, such as reading and writing log files.
- `child_process` (built-in Node.js module) - For spawning child processes to monitor external log files.
- `path` (built-in Node.js module) - For handling file and directory paths.

## Usage Examples

To use the Console Log Monitor in your rEngine Core application, you can follow these steps:

```javascript
const ConsoleLogMonitor = require('./console-log-monitor');

// Initialize the monitor with the memory-scribe path
const monitor = new ConsoleLogMonitor('/path/to/memory-scribe');

// Start the monitoring process
monitor.startMonitoring();

// Stop the monitoring process (when needed)
monitor.stopMonitoring();

// Get the current activity summary
const summary = monitor.getActivitySummary();
console.log(summary);

// Get the most recent activities
const recentActivity = monitor.getRecentActivity(100);
console.log(recentActivity);
```

## Configuration

The Console Log Monitor does not require any specific environment variables or configuration files. However, the `memoryScribePath` parameter passed to the `ConsoleLogMonitor` constructor should be the correct path to the `memory-scribe` module within the rEngine Core installation.

Additionally, the monitor assumes the existence of certain log file locations, such as the VS Code extension host logs. If these locations need to be modified, you can update the `consoleSources` array in the `constructor` method.

## Integration Points

The Console Log Monitor is a core component of the `memory-scribe` module within the rEngine Core platform. It integrates with the following rEngine Core components:

1. **AI Agents**: The monitor tracks the activity of various AI agents, such as GitHub Copilot, Claude, GPT, and others, and logs their interactions with the rEngine Core ecosystem.
2. **Memory Scribe**: The `memory-scribe` module, which this monitor is a part of, is responsible for capturing and managing the memory-related data and activities within rEngine Core.
3. **Logging and Monitoring**: The console log monitoring and activity tracking functionality provided by this module contribute to the overall logging and monitoring capabilities of the rEngine Core platform.

## Troubleshooting

Here are some common issues and solutions related to the Console Log Monitor:

1. **Log file not being created or updated**:
   - Ensure that the `memoryScribePath` provided to the `ConsoleLogMonitor` constructor is correct and the directory is writable by the application.
   - Check the file permissions and ownership of the log file and the containing directory.

1. **AI activity data not being saved or loaded correctly**:
   - Verify that the `aiActivityPath` is correctly set and the directory is writable by the application.
   - Check the contents of the AI activity JSON file for any syntax errors or corrupted data.

1. **Console output not being captured**:
   - Ensure that the `consoleSources` array in the `constructor` method includes all the relevant console output sources for your rEngine Core deployment.
   - Verify that the console output interception is working correctly by adding some console logs in your application and checking the log file.

1. **AI agent activity not being detected**:
   - Review the `agentPatterns` array in the `constructor` method and ensure that it includes the appropriate regular expressions to match the AI agent names and activity patterns.
   - If you encounter new AI agents or activity patterns, update the `agentPatterns` array accordingly.

If you encounter any other issues or have further questions, please refer to the rEngine Core documentation or reach out to the development team for assistance.
