# Memory Search CLI

## Purpose & Overview

The `memory-search-cli.js` script is a command-line interface (CLI) tool that provides a quick demonstration of search improvements in a memory-based search system. It allows users to perform various search-related operations, such as searching for entities, exploring entity types, getting search term suggestions, and viewing related entities.

The main purpose of this script is to showcase the capabilities of the `QuickMemorySearch` class, which is responsible for indexing and searching through a collection of entities stored in memory. The CLI provides a user-friendly interface for interacting with the search system, making it easier to test and demonstrate its features.

## Technical Architecture

The script is structured as follows:

1. **Main Entry Point**: The `main()` function is the entry point of the script, which handles the command-line arguments and dispatches the appropriate functionality based on the user's input.
2. **QuickMemorySearch Class**: The `QuickMemorySearch` class is the core component of the system, responsible for initializing the search index, performing searches, and providing various search-related functionalities.
3. **Command Handlers**: The script defines several functions, such as `showHelp()`, `showStats()`, `showEntityTypes()`, `showSuggestions()`, `searchByType()`, `showRelated()`, and `performSearch()`, which handle the different command-line options and display the corresponding information.

The overall data flow is as follows:

1. The user provides a command-line argument, which is parsed by the `main()` function.
2. The `main()` function dispatches the appropriate command handler based on the user's input.
3. The command handler interacts with the `QuickMemorySearch` instance to retrieve the necessary information and displays the results to the user.

## Dependencies

The script imports the `QuickMemorySearch` class from the `./quick-memory-search.js` file, which is assumed to be a separate module providing the search functionality.

## Key Functions/Classes

### QuickMemorySearch Class

The `QuickMemorySearch` class is the main component of the search system. It provides the following key methods:

```javascript
class QuickMemorySearch {
  initialize() // Initializes the search index
  getStats() // Returns statistics about the search index
  suggestTerms(partial, limit) // Suggests search terms based on a partial input
  searchByType(entityType) // Searches for entities of a specific type
  getEntity(entityId) // Retrieves an entity by its ID
  findRelated(entityId, maxDepth) // Finds related entities for a given entity
  search(query, options) // Performs a search query and returns the results
}
```

### Command Handlers

The script defines the following command handler functions:

```javascript
showHelp() // Displays the help information
showStats() // Displays the search index statistics
showEntityTypes() // Lists all available entity types
showSuggestions(partial) // Displays search term suggestions for a partial input
searchByType(entityType) // Searches for entities of a specific type
showRelated(entityId) // Displays related entities for a given entity
performSearch(query) // Performs a search query and displays the results
```

## Usage Examples

Here are some examples of how to use the Memory Search CLI:

```

# Search for entities

node memory-search-cli.js "docker permission"

# Show entities of a specific type

node memory-search-cli.js --type development_session

# Get search term suggestions

node memory-search-cli.js --suggest "dock"

# Show related entities for a specific entity

node memory-search-cli.js --related stacktrackr_app
```

## Configuration

The script does not have any configurable options or environment variables. The search functionality is provided by the `QuickMemorySearch` class, which is expected to be pre-configured and ready to use.

## Error Handling

The `main()` function wraps the entire execution in a `try-catch` block, ensuring that any errors are caught and displayed to the user. If an error occurs, the script will exit with a non-zero status code.

## Integration

This Memory Search CLI script is intended to be a standalone tool that demonstrates the capabilities of the `QuickMemorySearch` class. It can be integrated into a larger system by using the `QuickMemorySearch` class directly, or by incorporating the CLI functionality into a more comprehensive application.

## Development Notes

- The script uses the `process.argv` array to handle command-line arguments, which can be error-prone for more complex argument parsing. Consider using a dedicated command-line argument parsing library, such as `yargs` or `commander.js`, for better maintainability and extensibility.
- The `QuickMemorySearch` class is assumed to be a separate module, but its implementation is not provided in the given code. Ensure that the `QuickMemorySearch` class is thoroughly documented and tested to ensure the reliability of the overall system.
- The script could be further improved by adding support for more advanced search features, such as fuzzy searching, filtering, and sorting.
- Consider adding unit tests for the command handler functions to ensure the CLI's robustness and ease of maintenance.
