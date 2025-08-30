# Fast Recall - Instant Memory Lookup for Agents

This script provides a fast and efficient way to search an agent's memory, recent context, and tasks based on a given search term. It prioritizes recent information and presents the most relevant results to the user, aiding in quick information retrieval and decision-making. This is crucial for agents operating in dynamic environments where access to past experiences and knowledge is essential.

## How to Use

Run the script from the command line using the following syntax:

```bash
node recall.js "search term"
```

For silent mode (MCP mode, no console output):

```bash
node recall.js "search term" --silent
```

## Examples:

```bash
node recall.js "menu system"
node recall.js "console split"
node recall.js "javascript bug"
node recall.js "memory intelligence"
```

## Core Logic Breakdown

1. **Initialization:** The script begins by importing necessary modules (`fs/promises`, `path`, `url`) and determining if silent mode is enabled via the `--silent` flag.

1. **`fastRecall(query)` Function:** This is the core function that performs the memory lookup.
    - It defines the base directory and initializes an empty `results` array.
    - It establishes a prioritized list of search paths: `extendedcontext.json`, `memory.json`, and `tasks.json`.
    - If not in silent mode, it logs the search query to the console.

1. **Searching Extended Context:** The script attempts to read and parse `extendedcontext.json`. If successful, it iterates through the last 10 days of session data (newest first). For each session, it calculates the relevance of the session summary and activities to the query using the `calculateRelevance` function.  Results with a relevance score greater than 0.2 are added to the `results` array.

1. **Searching Agent Memory:** The script attempts to read and parse `memory.json`.  For each key-value pair in the memory, it calculates the relevance to the query.  Results with a relevance score greater than 0.2 are added to the `results` array.

1. **Searching Tasks:** The script attempts to read and parse `tasks.json`. If successful, it iterates through the tasks, calculating the relevance of the title and description to the query. Results with a relevance score greater than 0.2 are added to the `results` array.

1. **Sorting and Displaying Results:** The `results` array is sorted by relevance (with a slight boost for recent items).  The top 5 results are then displayed to the console (unless in silent mode), including their source, title, relevance score, date (if applicable), status (if applicable), and a truncated content preview.  If there are more than 5 results, a message indicating the number of additional matches is displayed.

1. **`calculateRelevance(query, text)` Function:** This helper function determines the relevance of a given text string to the search query. It performs an exact match check and also calculates a word match score based on the number of matching words (excluding short words). The relevance score is a value between 0 and 1.

1. **CLI Usage:** The script checks if it's being run directly from the command line.  If so, it retrieves the search query from the command-line arguments. If no query is provided, it displays usage instructions.  Finally, it calls the `fastRecall` function with the provided query.

## Configuration & Dependencies

## Dependencies:

- `fs/promises`: Used for asynchronous file system operations.
- `path`: Used for path manipulation.
- `url`: Used for URL parsing, specifically `fileURLToPath` for compatibility with ES modules.

## Configuration:

The script relies on the following JSON files:

- `extendedcontext.json`: Stores extended context information, including session summaries and activities.  Located in `rMemory/rAgentMemories/`.
- `memory.json`: Stores the agent's memory (concepts and entities). Located in `agents/`.
- `tasks.json`: Stores task information, including titles, descriptions, and statuses.  Located in `rMemory/rAgentMemories/`.

The script doesn't use any external configuration parameters beyond the search query provided as a command-line argument and the `--silent` flag.

## Machine-Readable Summary

```json
{
  "scriptName": "recall.js",
  "purpose": "Provides fast memory lookup for agents based on a search query, searching across extended context, agent memory, and tasks.",
  "inputs": {
    "arguments": [
      {
        "name": "search term",
        "type": "string",
        "description": "The term to search for in the agent's memory."
      },
      {
        "name": "--silent",
        "type": "flag",
        "description": "Enables silent mode (MCP mode), suppressing console output."
      }
    ],
    "dependencies": [
      "fs/promises",
      "path",
      "url"
    ],
    "files": [
      "rMemory/rAgentMemories/extendedcontext.json",
      "agents/memory.json",
      "rMemory/rAgentMemories/tasks.json"
    ]
  },
  "outputs": {
    "console": "Displays search results, including source, title, relevance, date, status, and content preview (unless in silent mode).",
    "exitCode": "0 on success, 1 on error or if no search query is provided."
  }
}
```
