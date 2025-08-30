# rEngine Core: Memory Scribe Dashboard Server

## Purpose & Overview

The `dashboard-server.js` file is a critical component of the rEngine Core platform, providing a web-based dashboard and control interface for the Memory Scribe service. This server acts as the central hub for managing the Memory Scribe process, monitoring system status, and exposing various API endpoints for integration with other rEngine Core components.

The Memory Scribe Dashboard Server is responsible for:

1. Hosting a web-based user interface for monitoring and controlling the Memory Scribe service.
2. Exposing a RESTful API for integration with other rEngine Core services.
3. Initializing and managing the AI provider infrastructure.
4. Implementing real-time console log monitoring and reporting.
5. Providing endpoints for system status, statistics, and configuration management.
6. Handling the start, stop, and cleanup operations for the Memory Scribe process.
7. Facilitating the Ollama language model integration and management.
8. Enabling advanced AI-powered features like context analysis, problem-solving, and debugging assistance.

This server serves as the central control point for the Memory Scribe component, allowing developers and operators to monitor, configure, and interact with the system through a comprehensive web-based interface.

## Key Functions/Classes

The `MemoryScribeDashboardServer` class is the main entry point of this file, responsible for the following key functions:

1. **Middleware Setup**: Configures the Express.js application with middleware for CORS, JSON parsing, and serving static files.
2. **Route Configuration**: Defines various API endpoints for system status, statistics, Ollama model management, Memory Scribe control, console monitoring, and AI-powered features.
3. **AI Provider Initialization**: Initializes the AI provider infrastructure, such as OpenAI, Gemini, and Ollama.
4. **Console Monitoring**: Starts and manages the real-time console log monitoring system.
5. **Memory Scribe Control**: Provides methods to start, stop, and clean up the Memory Scribe process.
6. **System Status and Statistics**: Retrieves and returns the current system status and various data statistics.
7. **Ollama Model Management**: Fetches the available Ollama language models and their details.
8. **Configuration Management**: Handles the saving and loading of the system configuration.
9. **Search and Flagging**: Implements the search functionality and the ability to flag items in the Memory Scribe system.
10. **AI-Powered Features**: Exposes endpoints for context analysis, problem-solving, debugging assistance, and AI-powered team collaboration.

The file also includes several utility methods, such as file operations, data parsing, and snippet extraction, to support the main functionality of the dashboard server.

## Dependencies

The `dashboard-server.js` file integrates with the following dependencies and external components:

1. **Express.js**: A popular web application framework for Node.js, used for building the web server and RESTful API.
2. **CORS**: A middleware that enables CORS (Cross-Origin Resource Sharing) with various options.
3. **Path**: A built-in Node.js module for working with file and directory paths.
4. **fs**: A built-in Node.js module for interacting with the file system.
5. **child_process**: A built-in Node.js module for spawning child processes.
6. **util**: A built-in Node.js module for providing utility functions.
7. **AIProviderManager**: A custom module responsible for managing the AI provider infrastructure.
8. **ConversationBridge**: A custom module that handles AI-powered conversation and collaboration features.
9. **ConsoleLogMonitor**: A custom module that monitors and reports on the real-time console log activities.
10. **Ollama**: A language model inference system integrated into the rEngine Core platform.

## Usage Examples

To use the Memory Scribe Dashboard Server, you can import the `MemoryScribeDashboardServer` class and create an instance of it:

```javascript
const MemoryScribeDashboardServer = require('./dashboard-server');

const server = new MemoryScribeDashboardServer();
server.start();
```

This will start the dashboard server and make it available at the specified port (defaulting to `3002`). You can then access the dashboard and API endpoints through your web browser or API client.

## Configuration

The Memory Scribe Dashboard Server can be configured using the following environment variables:

- `PORT`: The port number on which the server should listen (default is `3002`).

Additionally, the server reads a `lifecycle-config.json` file in the same directory, which contains the following configuration options:

- `retentionDays`: The number of days to retain conversation and memory data (default is `90`).
- `foreverMode`: A boolean flag to enable "forever mode", which disables automatic data cleanup.
- `autoCleanup`: A boolean flag to enable automatic data cleanup on a regular schedule.
- `lastCleanup`: The timestamp of the last data cleanup operation.

## Integration Points

The Memory Scribe Dashboard Server integrates with the following rEngine Core components:

1. **Memory Scribe**: The dashboard server manages the lifecycle of the Memory Scribe process, allowing users to start, stop, and monitor its status.
2. **AI Provider Manager**: The server initializes and manages the AI provider infrastructure, including OpenAI, Gemini, and Ollama.
3. **Conversation Bridge**: The server exposes AI-powered features like context analysis, problem-solving, and debugging assistance through the Conversation Bridge module.
4. **Console Log Monitor**: The server integrates with the Console Log Monitor to provide real-time monitoring and reporting of console activities.
5. **Ollama Language Models**: The server manages the available Ollama language models and exposes endpoints for their utilization.

## Troubleshooting

Here are some common issues and their solutions:

1. **Memory Scribe fails to start**: Check the logs for any error messages. Ensure that the `context-lifecycle.js` file exists and is properly configured. Also, check if the Ollama language model is available and properly configured.

1. **Ollama integration issues**: Verify that the Ollama system is installed and accessible. Check the `ollama` command-line tool for any version or availability issues.

1. **Console monitoring not working**: Ensure that the `console-log-monitor.js` module is properly initialized and configured. Check for any file permission or directory access issues.

1. **API endpoints returning errors**: Review the error messages and the server logs for any clues about the underlying issues. Check the input data and configuration for any inconsistencies or invalid values.

1. **Memory Scribe process not stopping**: Try to gracefully stop the process first, and if that fails, use a "hard" kill. Investigate any potential resource leaks or process-level issues.

1. **Data cleanup not working as expected**: Verify the `lifecycle-config.json` file and ensure that the retention settings and "forever mode" are configured correctly.

If you encounter any other issues, you can refer to the rEngine Core documentation or reach out to the development team for further assistance.
