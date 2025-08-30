# rEngine Core: Scribe Summary System

## Purpose & Overview

The `scribe-summary.js` file is a part of the rEngine Core platform and provides an intelligent system for generating on-demand conversation summaries. This system allows users to quickly get context about recent development activities, such as handoffs, memory updates, git commits, and scribe logs, for multiple timeframes.

The `ScribeSummarySystem` class is the main component that handles the data gathering, analysis, and summarization using an AI-powered summarization model. It can be called from any chat interface to provide a concise summary of the most relevant development activity.

## Key Functions/Classes

1. **`ScribeSummarySystem`**: The main class that encapsulates the Scribe Summary System functionality.
   - `generateSummary(timeframe)`: Generates a summary of recent development activity for the specified timeframe.
   - `getTimeframeCutoff(timeframe)`: Calculates the cutoff time for the specified timeframe.
   - `gatherRelevantData(cutoffTime)`: Collects relevant data from various sources (handoff files, memory updates, git history, scribe logs).
   - `getHandoffFiles(cutoffTime)`, `getRecentMemoryUpdates(cutoffTime)`, `getGitHistory(cutoffTime)`, `getScribeLogs(cutoffTime)`: Helper functions to retrieve data from specific sources.
   - `summarizeWithAI(data, timeframe)`: Generates a summary using an AI-powered summarization model.
   - `generateSimpleSummary(data, timeframe)`: Fallback to a simple text-based summary if the AI-powered summarization fails.
1. **`analyzeAndPreChunk(targetFile)`**: Analyzes recent code changes and pre-chunks files for documentation, using the Qwen 2.5 Coder to identify optimal logical chunk boundaries.
   - `findRecentChanges()`: Identifies files that have been recently changed and need pre-chunking analysis.
   - `analyzeFileStructure(filePath)`: Analyzes the structure of a file and identifies optimal chunking boundaries.
   - `createChunkPlan(filePath, analysis)`: Creates a chunk plan based on the analysis results.
   - `queueForDocumentation(filePath, chunkPlan)`: Adds the file with the pre-chunk plan to the documentation queue.

## Dependencies

The `scribe-summary.js` file has the following dependencies:

- `fs-extra`: For file system operations.
- `path`: For working with file paths.
- `axios`: For making HTTP requests to the Ollama AI endpoint.
- `child_process`: For executing Git commands.

It also relies on the following rEngine Core components:

- `rMemory`: Stores agent memories and handoff files.
- `rEngine/pre-chunk-queue.json`: Maintains the queue of files to be documented.

## Usage Examples

To generate a summary for the last hour, you can use the following code:

```javascript
const ScribeSummarySystem = require('./scribe-summary.js');
const scribe = new ScribeSummarySystem();

scribe.generateSummary('1h').then(summary => {
    console.log(summary);
}).catch(error => {
    console.error('Error generating summary:', error);
});
```

To pre-chunk a specific file for documentation:

```javascript
const scribe = new ScribeSummarySystem();
scribe.analyzeAndPreChunk('path/to/your/file.js');
```

## Configuration

The `ScribeSummarySystem` class has the following configuration options:

- `baseDir`: The base directory of the rEngine Core project.
- `memoryDir`: The directory where agent memories are stored.
- `handoffDir`: The directory where handoff files are stored.
- `ollamaEndpoint`: The URL of the Ollama AI endpoint used for summarization.
- `model`: The name of the AI model to use for summarization.

These values can be set in the constructor of the `ScribeSummarySystem` class.

## Integration Points

The Scribe Summary System integrates with the following rEngine Core components:

1. **rMemory**: The system retrieves handoff files and memory updates from the `rMemory` directory.
2. **Documentation Queue**: The pre-chunking analysis results are added to the `pre-chunk-queue.json` file, which is used by the documentation system.
3. **Ollama AI**: The system uses the Ollama AI endpoint for generating summaries based on the collected data.

## Troubleshooting

1. **AI Summarization Failure**: If the AI-powered summarization fails, the system will fall back to a simple text-based summary. Check the error logs for more information.
2. **Missing Data**: If the system is unable to find any relevant data for the specified timeframe, it will return a message indicating that there is no significant activity.
3. **Pre-Chunking Analysis Failure**: If the pre-chunking analysis fails for a specific file, the system will log the error and move on to the next file. Check the error logs for more information.
