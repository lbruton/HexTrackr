# Smart Scribe Memory Monitoring

## Purpose & Overview

The `smart-scribe.js_chunk_2` script is responsible for the memory health monitoring and incident reporting functionality of the Smart Scribe system. It provides the following key capabilities:

1. **Memory Health Monitoring**: The script continuously monitors the system's memory usage and health, detecting potential incidents or issues.
2. **Memory Incident Reporting**: When a memory-related incident is detected, the script generates a detailed incident report, which is stored in the system's memory scribe logs.
3. **Agent Handoff Log Generation**: The script can create a comprehensive handoff log that captures the current system state, recent context, and next steps, allowing for seamless continuity between agents.
4. **Idle-time Analysis and Maintenance**: The script performs periodic, background tasks to analyze all project documentation, optimize search tables, and clean up old data, ensuring the system remains efficient and up-to-date.

## Technical Architecture

The `smart-scribe.js_chunk_2` script is part of the larger Smart Scribe system, which is responsible for managing the system's memory, knowledge, and documentation. The key components and data flow of this script are as follows:

1. **Memory Health Monitoring**: The script continuously monitors the system's memory usage and health, and generates a detailed `healthReport` object when an incident is detected.
2. **Memory Incident Reporting**: The `reportData` object is created, containing the timestamp, incident type, health report, AI analysis, and other relevant information. This data is then stored in the `rMemory/memory-scribe/logs` directory, and a log entry is appended to the main `scribe.log` file.
3. **Agent Handoff Log Generation**: The script retrieves the current system state, analyzes the recent context, and generates a comprehensive handoff log. This log is stored in the `rMemory/rAgentMemories` directory, with old logs being archived after 8 hours.
4. **Idle-time Analysis and Maintenance**: The script periodically (when the system is idle) analyzes all project documentation, optimizes the search tables, and performs other maintenance tasks to keep the system efficient and up-to-date.

## Dependencies

The `smart-scribe.js_chunk_2` script has the following dependencies:

- `fs-extra`: A file system library that provides additional functionality over the built-in `fs` module.
- `path`: The built-in Node.js module for working with file paths.
- `axios`: A popular HTTP client library for making API requests.
- `execSync`: A function from the built-in `child_process` module for executing shell commands synchronously.

## Key Functions/Classes

1. **`reportMemoryIncident(healthReport, analysis)`**: This function is responsible for generating and storing a memory incident report. It creates the `reportData` object, writes it to a file in the `rMemory/memory-scribe/logs` directory, and appends a log entry to the `scribe.log` file.

1. **`generateHandoffLog()`**: This function generates a comprehensive agent handoff log, capturing the current system state, recent context, and next steps. The handoff log is stored in the `rMemory/rAgentMemories` directory, with old logs being archived after 8 hours.

1. **`getCurrentSystemState()`**: This helper function retrieves the current system state, including active processes, recent file changes, Git status, running models, and knowledge base statistics.

1. **`analyzeRecentContext()`**: This helper function analyzes the recent context, including chat sessions and document analyses, and generates a summary of the relevant activities.

1. **`storeHandoffLog(handoffData)`**: This function writes the generated handoff log to a file in the `rMemory/rAgentMemories` directory, and performs cleanup of old handoff logs.

1. **`cleanupOldHandoffs(handoffDir)`**: This helper function archives old handoff logs (older than 8 hours) to a dedicated "archived" directory.

1. **`performIdleAnalysis()`**: This function is responsible for performing periodic, background tasks, including analyzing all project documentation, optimizing search tables, and performing other maintenance activities.

1. **`analyzeAllDocuments()`**: This helper function iterates through all the project documentation files and analyzes them using the Ollama AI system.

1. **`analyzeDocument(filePath)`**: This function analyzes a single document, extracts structured knowledge, and stores the analysis in the knowledge base.

1. **`storeDocumentAnalysis(filePath, analysis)`**: This function updates the knowledge base with the extracted concepts, patterns, and search index information from the document analysis.

1. **`regenerateHTMLDocumentation()`**: This function triggers the execution of the documentation HTML generator, which regenerates the HTML version of the project documentation.

1. **`analyzeChatLog(logPath)`**: This function analyzes a chat log, extracting valuable technical insights, and stores the analysis in the knowledge base.

## Usage Examples

To use the memory monitoring and incident reporting functionality provided by this script, you would typically integrate it into your larger Smart Scribe system. For example, you might call the `reportMemoryIncident()` function whenever a memory-related incident is detected, passing in the relevant `healthReport` and `analysis` data.

To generate a handoff log, you would call the `generateHandoffLog()` function, which will create a comprehensive document with the current system state and recent context.

The idle-time analysis and maintenance tasks are automatically triggered by the script, so no additional usage is required.

## Configuration

The `smart-scribe.js_chunk_2` script relies on the following configuration options and environment variables:

- `baseDir`: The base directory of the Smart Scribe system, used for file paths.
- `ollamaEndpoint`: The URL of the Ollama AI system, used for making API requests.
- `knowledgeDB`: The file path to the knowledge base JSON file.
- `systemPrompts`: A set of system prompts used for various AI-based tasks.

## Error Handling

The script employs robust error handling, wrapping all its main functions in `try-catch` blocks. When an error occurs, it is logged to the console using the `console.error()` function, providing details about the failure.

## Integration

The `smart-scribe.js_chunk_2` script is a crucial component of the larger Smart Scribe system, responsible for managing the system's memory health and providing agent handoff capabilities. It integrates seamlessly with other parts of the system, such as the Ollama AI engine, the knowledge base, and the file system.

## Development Notes

1. **Memory Incident Reporting**: The script uses a dedicated `rMemory/memory-scribe/logs` directory to store memory incident reports, ensuring they are easily accessible and separable from other log files.

1. **Agent Handoff Logs**: The handoff logs are stored in the `rMemory/rAgentMemories` directory, which is distinct from the `rAgents` directory to avoid confusion.

1. **Idle-time Analysis**: The `performIdleAnalysis()` function is designed to run periodically when the system is idle, ensuring that documentation analysis and maintenance tasks do not interfere with the system's primary functions.

1. **HTML Documentation Generation**: The `regenerateHTMLDocumentation()` function triggers the execution of a separate HTML documentation generator, which is responsible for converting the project's Markdown documentation into a user-friendly, browsable HTML format.

1. **Knowledge Base Integration**: The script integrates closely with the system's knowledge base, storing and retrieving information about concepts, patterns, and search indices. This ensures that the knowledge gathered through various analyses is made available to the rest of the system.

1. **Scalability and Performance**: The script is designed to handle large-scale projects and documentation, with features like skipping large files, processing a limited number of files per idle cycle, and archiving old handoff logs to ensure the system remains efficient and responsive.
