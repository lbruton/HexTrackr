# Console Log Monitor

## Purpose & Overview

The `ConsoleLogMonitor` class is a powerful tool that provides real-time monitoring and logging of console activity, with a specific focus on tracking AI agent interactions. This script serves several key purposes:

1. **Console Logging**: It intercepts and logs all `console.log`, `console.error`, and `console.warn` statements, creating a comprehensive record of console activity.
2. **AI Agent Tracking**: The script identifies and logs any console output related to AI agents, such as GitHub Copilot, Claude, GPT, and others. This allows for detailed analysis of AI agent usage and behavior.
3. **Activity Tracking**: The script maintains a detailed log of all monitored activity, including the type of activity (file edit, file creation, terminal commands, etc.), the timestamp, and the associated AI agent.
4. **Analytics and Reporting**: The script provides methods to retrieve activity summaries, recent activity logs, and agent-specific statistics, enabling users to gain valuable insights into the system's operations.

This script is a crucial component in a larger system, where it serves as a real-time monitor and data collector for the various AI agents and processes running within the environment.

## Technical Architecture

The `ConsoleLogMonitor` class is the main component of this script, and it comprises the following key elements:

1. **Initialization**: The constructor sets up the necessary file paths, loads existing AI activity data, and defines patterns to identify AI agent-related console output.
2. **Monitoring**: The `startMonitoring()` method sets up the console log monitoring, including:
   - Watching for changes in the VS Code extension host logs
   - Intercepting and logging the process's console output
   - Tailing potential log files for additional AI agent activity
1. **Log Processing**: The `processLogContent()` method analyzes the console output, identifies AI agent-related entries, and logs the activity details.
2. **Activity Tracking**: The `trackAIActivity()` method records the details of each AI agent-related activity, including the timestamp, agent name, source, and activity type. It also maintains overall activity statistics and agent-specific data.
3. **Reporting**: The `getActivitySummary()` and `getRecentActivity()` methods provide access to the monitored activity data, allowing users to retrieve summary information and the most recent activities.

The script utilizes several built-in Node.js modules, such as `fs`, `child_process`, and `path`, to perform file operations, spawn processes, and handle file paths.

## Dependencies

This script has no external dependencies. It uses only built-in Node.js modules.

## Key Functions/Classes

### `ConsoleLogMonitor` Class

**Constructor**:

- `memoryScribePath` (string): The path to the "Memory Scribe" directory, where the log files and activity data will be stored.

**Methods**:

1. `loadAIActivity()`: Loads the existing AI activity data from the `ai-agent-activity.json` file.
2. `saveAIActivity()`: Saves the current AI activity data to the `ai-agent-activity.json` file.
3. `startMonitoring()`: Starts the real-time console log monitoring, including watching for VS Code logs, intercepting process console output, and tailing potential log files.
4. `monitorVSCodeLogs()`: Sets up a file watcher to monitor changes in the VS Code extension host logs.
5. `monitorProcessConsole()`: Intercepts and logs the console output from the current process.
6. `monitorTerminalActivity()`: Tails potential log files that might contain AI agent-related activity.
7. `tailLogFile(filePath)`: Spawns a `tail` process to monitor changes in a specific log file.
8. `processLogFile(filePath)`: Reads and processes the content of a specific log file.
9. `processLogContent(content, source)`: Analyzes the console output, identifies AI agent-related entries, and logs the activity details.
10. `isAIAgentActivity(line)`: Checks if a given line of console output is related to an AI agent.
11. `logActivity(type, content)`: Writes a log entry to the `console-activity.log` file.
12. `trackAIActivity(content, source)`: Records the details of an AI agent-related activity, including updating the activity statistics.
13. `classifyActivity(content)`: Determines the type of activity based on the console output.
14. `stopMonitoring()`: Stops the real-time console log monitoring.
15. `getActivitySummary()`: Retrieves a summary of the monitored activity, including the total activities, today's activities, agent statistics, and file paths.
16. `getRecentActivity(limit = 50)`: Retrieves the most recent activities, up to the specified limit.

## Usage Examples

To use the `ConsoleLogMonitor` class, you can create an instance and start the monitoring process:

```javascript
const ConsoleLogMonitor = require('./console-log-monitor');

const monitor = new ConsoleLogMonitor('/path/to/memory-scribe');
monitor.startMonitoring();
```

To retrieve the activity summary:

```javascript
const summary = monitor.getActivitySummary();
console.log(summary);
```

To get the most recent activities:

```javascript
const recentActivity = monitor.getRecentActivity(20);
console.log(recentActivity);
```

To stop the monitoring:

```javascript
monitor.stopMonitoring();
```

## Configuration

The `ConsoleLogMonitor` class has the following configuration options:

- `memoryScribePath` (required): The path to the "Memory Scribe" directory, where the log files and activity data will be stored.

The script also defines several hardcoded paths and patterns that can be customized if needed:

- `consoleSources`: An array of common paths where VS Code console logs are located.
- `agentPatterns`: An array of regular expressions used to identify AI agent-related console output.

## Error Handling

The `ConsoleLogMonitor` class handles several potential errors, including:

- Errors when loading or saving the AI activity data
- Errors when tailing or processing log files
- Errors when writing to the console log file

In case of any errors, the script logs the error message to the console for debugging purposes.

## Integration

The `ConsoleLogMonitor` class is designed to be a modular component within a larger system. It can be easily integrated into other applications or services that require real-time monitoring and analysis of console activity, with a focus on tracking AI agent interactions.

## Development Notes

- The script uses a combination of file watching, console output interception, and log file tailing to capture console activity from various sources.
- The `trackAIActivity()` method maintains a detailed log of AI agent-related activities, including the ability to classify the type of activity (file edit, file creation, terminal command, etc.).
- The activity data is stored in a JSON file (`ai-agent-activity.json`) for persistence and easy access.
- The script is designed to be lightweight and efficient, with minimal impact on the overall system performance.
- The use of regular expressions to identify AI agent-related console output can be expanded or modified to suit specific requirements.
- The script could be further enhanced with features like email/Slack notifications, real-time dashboards, or integration with external monitoring/analytics tools.

Overall, this `ConsoleLogMonitor` script provides a robust and versatile solution for tracking and analyzing console activity, with a strong focus on AI agent interactions within a larger system.
