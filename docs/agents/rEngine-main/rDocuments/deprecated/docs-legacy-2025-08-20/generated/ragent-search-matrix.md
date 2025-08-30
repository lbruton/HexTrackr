# rAgent Search Matrix Integration Tool

## Purpose & Overview

The `ragent-search-matrix.js` file is a command-line tool that provides rAgents with instant access to StackTrackr's comprehensive search matrix. This tool allows rAgents to quickly search and retrieve contextual information about various code elements, functions, and related dependencies within the rEngine Core ecosystem.

The search matrix is a database of over 1,853+ indexed entries that contain detailed information about the rEngine Core codebase, including function definitions, context clues, and related dependencies. By integrating this search matrix, rAgents can rapidly target and understand relevant code snippets, improving their efficiency and productivity when working with the rEngine Core platform.

## Key Functions/Classes

The main functionality of this tool is provided by the following functions:

1. **`loadSearchMatrix()`**: Loads the search matrix data from the `context-matrix.json` file in the `rMemory/search-matrix` directory.
2. **`searchMatrix()`**: Searches the loaded search matrix for relevant entries based on the provided query and options.
3. **`formatResults()`**: Formats the search results in various output formats (context, JSON, summary) for rAgent consumption.
4. **`getUserPreferences()`**: Retrieves the rAgent's communication style preferences from the `rMemory/rAgentMemories/preferences.json` file.
5. **`handleMCPMode()`**: Handles the MCP (Machine Communication Protocol) mode, where the tool accepts JSON input and produces JSON output.
6. **`parseArgs()`**: Parses the command-line arguments and options provided to the tool.
7. **`showStats()`**: Displays various statistics about the search matrix, such as the total number of entries, files indexed, functions, and context clues.
8. **`showHelp()`**: Displays the help message with usage information and examples.

## Dependencies

The `ragent-search-matrix.js` file depends on the following:

1. **Node.js**: This tool is written in JavaScript and requires a Node.js runtime environment to execute.
2. **rMemory**: The search matrix data is loaded from the `rMemory/search-matrix/context-matrix.json` file, and the rAgent's communication style preferences are retrieved from the `rMemory/rAgentMemories/preferences.json` file.

## Usage Examples

1. **Searching the matrix with a query**:

   ```bash
   node ragent-search-matrix.js "api functions"
   ```

1. **Searching the matrix with a query and returning results in JSON format**:

   ```bash
   node ragent-search-matrix.js --format json "encryption"
   ```

1. **Searching the matrix with a query and filtering by category**:

   ```bash
   node ragent-search-matrix.js --category code_functions "memory"
   ```

1. **Searching the matrix using MCP (Machine Communication Protocol) mode**:

   ```bash
   echo '{"query":"api","format":"json","category":"context_clues"}' | node ragent-search-matrix.js --mcp
   ```

1. **Displaying search matrix statistics**:

   ```bash
   node ragent-search-matrix.js --stats
   ```

1. **Displaying the help message**:

   ```bash
   node ragent-search-matrix.js --help
   ```

## Configuration

This tool does not require any specific environment variables or configuration files. However, it does rely on the presence of the `rMemory/search-matrix/context-matrix.json` and `rMemory/rAgentMemories/preferences.json` files, which contain the search matrix data and rAgent communication style preferences, respectively.

## Integration Points

The `ragent-search-matrix.js` tool is designed to be used as a standalone utility within the rEngine Core ecosystem. It integrates with the following components:

1. **rMemory**: The search matrix data and rAgent preferences are loaded from the `rMemory` directory.
2. **StackTrackr**: The search matrix is provided by the StackTrackr component, which indexes the rEngine Core codebase and provides contextual information.
3. **rAgents**: This tool is specifically designed to provide rAgents with rapid access to the search matrix, improving their ability to understand and navigate the rEngine Core codebase.

## Troubleshooting

1. **Failed to load search matrix**: If the tool fails to load the search matrix, ensure that the `context-matrix.json` file is present in the `rMemory/search-matrix` directory and that it contains valid data. You can try running the `./start-search-matrix.sh scan` command in the `rScribe` directory to rebuild the search matrix.

1. **No results found**: If the tool does not return any results for a given query, try the following:
   - Check the spelling and syntax of the query.
   - Ensure that the search matrix contains relevant information for the query.
   - Try adjusting the search options, such as the category or maximum number of results.

1. **Unexpected output format**: If the output format is not as expected, verify that the specified format (context, JSON, summary) is supported and that the corresponding formatting logic in the `formatResults()` function is correct.

1. **Preferences not loading**: If the rAgent's communication style preferences are not being loaded correctly, ensure that the `preferences.json` file is present in the `rMemory/rAgentMemories` directory and that it contains valid JSON data.

If you encounter any other issues, please refer to the rEngine Core documentation or contact the rEngine Core support team for further assistance.
