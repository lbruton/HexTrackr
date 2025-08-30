# Smart Scribe - Continuous Knowledge Management

## Purpose & Overview

The `smart-scribe.js` file is a critical component of the rEngine Core platform, responsible for managing the continuous knowledge management and documentation system. Its primary functions are:

1. **Monitoring and Analyzing Files**: Continuously watching for changes in project files (Markdown, JavaScript, JSON, Shell scripts) and performing in-depth analysis to extract technical concepts, patterns, and relationships.
2. **Maintaining Technical Knowledge Database**: Storing the extracted knowledge in a centralized database, including a searchable index for efficient retrieval.
3. **Optimizing Search Tables**: Periodically analyzing the knowledge base to identify the most relevant keywords and concept relationships, improving the overall search performance.
4. **Monitoring Chat Logs**: Analyzing chat logs from development sessions to capture technical decisions, successful solutions, user preferences, and other actionable insights.
5. **Generating Handoff Logs**: Automatically creating comprehensive handoff logs at regular intervals, providing continuity for development teams.
6. **Monitoring System Health**: Proactively checking the memory usage and overall health of the Smart Scribe system, triggering alerts and generating incident reports when issues are detected.

This system plays a crucial role in the rEngine Core platform, ensuring that technical knowledge is continuously captured, organized, and made available for efficient retrieval and reuse by developers, architects, and other stakeholders.

## Key Functions/Classes

The `smart-scribe.js` file defines the main `SmartScribe` class, which encapsulates the various functionalities of the knowledge management system. Here are the key components:

1. **Initialization and Configuration**: The `constructor()` method sets up the initial configuration, including file paths, API endpoints, and system prompts.
2. **File Monitoring and Analysis**: The `startFileWatching()` and `analyzeDocument()` methods handle monitoring file changes and performing in-depth document analysis using the Ollama language model.
3. **Chat Log Monitoring and Analysis**: The `startChatLogMonitoring()` and `analyzeChatLog()` methods handle monitoring and analyzing chat logs to extract technical insights.
4. **Knowledge Database Management**: The `initializeKnowledgeDB()`, `storeDocumentAnalysis()`, and `storeChatAnalysis()` methods handle the creation, storage, and updating of the technical knowledge database.
5. **Search Table Optimization**: The `optimizeSearchTables()` method analyzes the knowledge base and updates the search optimization tables to improve overall search performance.
6. **Handoff Log Generation**: The `generateHandoffLog()` method creates comprehensive handoff logs at regular intervals, capturing the current system state and recent context.
7. **Memory Health Monitoring**: The `performMemoryHealthCheck()` and `storeMemoryIncidentReport()` methods monitor the memory usage and overall health of the Smart Scribe system, triggering alerts and generating incident reports when issues are detected.
8. **Idle Processing and Maintenance**: The `performIdleAnalysis()` and `performMaintenance()` methods handle scheduled tasks, such as analyzing all documents and archiving old chat insights, during periods of inactivity.
9. **Utility Functions**: The file also includes several helper methods, such as `getActiveProcesses()`, `getRecentFileChanges()`, and `globFiles()`, which provide additional system information and functionality.

## Dependencies

The `smart-scribe.js` file depends on the following external modules and libraries:

- `fs-extra`: For enhanced file system operations.
- `path`: For handling file paths.
- `axios`: For making HTTP requests to the Ollama language model API.
- `chokidar`: For efficient file monitoring and change detection.
- `child_process`: For executing system commands.
- `url`: For converting file URLs to paths.
- `./smart-scribe-memory-monitor.js`: A custom module for monitoring the memory health of the Smart Scribe system.

Additionally, the file relies on the `system-config.json` file for configuration parameters, such as the Ollama API endpoint and the local language model.

## Usage Examples

The `smart-scribe.js` file is not meant to be used directly, but rather as a part of the rEngine Core platform. It is instantiated and run as a standalone process within the rEngine ecosystem. Here's an example of how it can be used:

```javascript
import SmartScribe from './smart-scribe.js';

const scribe = new SmartScribe();
scribe.initialize();
```

This will create a new instance of the `SmartScribe` class and initialize the knowledge management system, including file monitoring, chat log analysis, and other background tasks.

## Configuration

The `smart-scribe.js` file reads its configuration from the `system-config.json` file, which should be located in the same directory. The configuration includes the following parameters:

```json
{
  "brainShareSystem": {
    "smartScribe": {
      "localLlm": {
        "endpoint": "http://localhost:8000",
        "model": "gpt-3.5-turbo"
      }
    }
  }
}
```

These parameters define the Ollama language model API endpoint and the specific model to be used for document and chat log analysis.

## Integration Points

The `smart-scribe.js` file is a core component of the rEngine Core platform and integrates with several other systems:

1. **rAgents**: The knowledge base maintained by the Smart Scribe system is used by rAgents to provide contextual information and recommendations during development sessions.
2. **rMemory**: The handoff logs generated by the Smart Scribe system are stored in the rMemory component, ensuring continuity and knowledge transfer between development teams.
3. **rScribe**: The Smart Scribe system's document analysis and knowledge extraction capabilities are used by the rScribe component to generate high-quality technical documentation.
4. **MCP (Memory Coordination Platform)**: The Smart Scribe system periodically exports its knowledge base to the MCP, which acts as a centralized memory and coordination system for the entire rEngine platform.

## Troubleshooting

1. **Ollama API Unavailable**: If the Ollama language model API is not running or accessible, the Smart Scribe system will not be able to perform document and chat log analysis. Ensure that the Ollama API is properly configured and running.
2. **Knowledge Database Corruption**: If the knowledge database becomes corrupted or inaccessible, the Smart Scribe system may not function correctly. In this case, try deleting the `technical-knowledge.json` and `search-optimization.json` files and allowing the system to recreate them.
3. **Memory Health Issues**: If the Smart Scribe system detects critical memory health issues, it will generate a detailed incident report. Review the report and take the recommended actions to resolve the problems.
4. **File Monitoring Errors**: If the file monitoring system encounters issues, such as permissions problems or file system changes, it may fail to analyze certain documents. Check the logs for any errors or warnings related to file monitoring.
5. **Chat Log Analysis Failures**: If the chat log analysis encounters issues, such as poorly formatted logs or unexpected content, it may fail to extract the desired insights. Review the logs for any errors or warnings related to chat log analysis.

Remember to check the logs and error messages for more detailed information and guidance on resolving any issues that may arise.
