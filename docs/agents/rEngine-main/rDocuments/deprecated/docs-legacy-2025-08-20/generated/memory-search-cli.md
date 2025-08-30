# Memory Search CLI Documentation

## Purpose & Overview

The `memory-search-cli.js` file is a command-line interface (CLI) tool that demonstrates the capabilities of the `QuickMemorySearch` class, which is part of the rEngine Core platform. This CLI allows users to perform various search operations on an in-memory index of entities, such as searching by keywords, entity types, and related entities.

The primary purpose of this tool is to showcase the search functionality of the rEngine Core platform and provide a quick way for developers to explore and experiment with the memory search capabilities.

## Key Functions/Classes

### `QuickMemorySearch` Class

The `QuickMemorySearch` class is the main component of this CLI tool. It provides the following key functionalities:

1. **Initialization**: The `initialize()` method sets up the in-memory search index.
2. **Searching**: The `search()` method performs keyword-based searches, returning a list of relevant entities.
3. **Filtering by Type**: The `searchByType()` method allows searching for entities of a specific type.
4. **Suggestions**: The `suggestTerms()` method provides search term suggestions based on the existing index.
5. **Related Entities**: The `findRelated()` method identifies entities related to a given entity ID.
6. **Statistics**: The `getStats()` method retrieves various statistics about the search index, such as the number of entities, keywords, and relationships.

### `main()` Function

The `main()` function is the entry point of the CLI. It handles the command-line arguments and dispatches the appropriate functionality based on the user's input.

## Dependencies

The `memory-search-cli.js` file depends on the following components:

1. **QuickMemorySearch**: This is the main class that provides the search functionality.
2. **Node.js**: The CLI is designed to run on a Node.js environment.

## Usage Examples

To use the Memory Search CLI, follow these steps:

1. Ensure you have Node.js installed on your system.
2. Save the `memory-search-cli.js` file to your local machine.
3. Open a terminal or command prompt and navigate to the directory containing the file.
4. Run the CLI with one of the following commands:

   ```bash

   # Perform a general search

   node memory-search-cli.js "your search query"

   # Search by entity type

   node memory-search-cli.js --type bug

   # Show search index statistics

   node memory-search-cli.js --stats

   # Get search term suggestions

   node memory-search-cli.js --suggest "dock"

   # Show related entities for a specific entity

   node memory-search-cli.js --related stacktrackr_app
   ```

1. Explore the output and experiment with different search queries and options.

## Configuration

The Memory Search CLI does not require any specific configuration. It uses the default Node.js environment and relies on the `QuickMemorySearch` class to handle the search functionality.

## Integration Points

The `memory-search-cli.js` file is a standalone demonstration tool and is not directly integrated with other rEngine Core components. However, the `QuickMemorySearch` class it uses is a key component of the rEngine Core platform and can be integrated into other rEngine-based applications.

## Troubleshooting

Here are some common issues and solutions you may encounter when using the Memory Search CLI:

1. **No results found**: If your search query does not match any entities in the index, the CLI will display a message suggesting you try different search terms, use the `--suggest` option to find available keywords, or use the `--types` option to see the available entity types.

1. **Index not ready**: If the `initialize()` method fails, the CLI will display an error message. This could happen if the index is not properly set up or if there are issues with the underlying data. Make sure the `QuickMemorySearch` class is properly configured and that the necessary data is available.

1. **Unexpected errors**: If you encounter any other errors, the CLI will display the error message. Check the error message for more information and try to identify the root cause of the issue.

If you need further assistance or have additional questions, please reach out to the rEngine Core support team.
