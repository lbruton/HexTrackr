# Memory Search CLI

## Purpose & Overview

The `memory-search-cli.js` script is a command-line interface (CLI) tool that allows users to search and explore an in-memory database of entities. This tool is designed to demonstrate the capabilities of the `QuickMemorySearch` class, which provides a fast and efficient way to search and retrieve information from a large dataset.

The script supports a variety of commands, including:

- Performing general keyword searches
- Searching for entities by type
- Viewing search index statistics
- Listing available entity types
- Suggesting search terms based on partial input
- Displaying related entities for a given entity

This CLI can be used as a standalone tool or integrated into a larger system that requires efficient in-memory search functionality.

## Technical Architecture

The `memory-search-cli.js` script is built around the `QuickMemorySearch` class, which is imported from the `./quick-memory-search.js` module. The `QuickMemorySearch` class is responsible for managing the in-memory search index and providing the necessary search and retrieval functionality.

The script's main function, `main()`, handles the command-line arguments and dispatches the appropriate action based on the user's input. The supported actions include:

1. **Performing a general keyword search**: The script calls the `search()` method of the `QuickMemorySearch` instance to find relevant entities based on the provided search query.
2. **Searching by entity type**: The script calls the `searchByType()` method of the `QuickMemorySearch` instance to retrieve all entities of a specific type.
3. **Displaying search index statistics**: The script calls the `getStats()` method of the `QuickMemorySearch` instance to retrieve and display various statistics about the search index.
4. **Listing available entity types**: The script iterates over the `types` property of the `QuickMemorySearch` instance's index to display all available entity types.
5. **Suggesting search terms**: The script calls the `suggestTerms()` method of the `QuickMemorySearch` instance to provide search term suggestions based on the provided partial input.
6. **Displaying related entities**: The script calls the `getEntity()` and `findRelated()` methods of the `QuickMemorySearch` instance to retrieve and display entities related to a given entity.

The script also includes various helper functions to format and display the search results in a user-friendly manner.

## Dependencies

The `memory-search-cli.js` script has the following external dependency:

- `QuickMemorySearch` class from the `./quick-memory-search.js` module

## Key Functions/Classes

### `QuickMemorySearch` Class

The `QuickMemorySearch` class is the core component of the search functionality. It provides the following methods:

| Method | Parameters | Return Value | Description |
| --- | --- | --- | --- |
| `initialize()` | - | `Promise<void>` | Initializes the search index. |
| `getStats()` | - | `{ entities: number, keywords: number, relationships: number, types: number, buildTime: number, lastUpdated: string, ready: boolean }` | Retrieves various statistics about the search index. |
| `search(query, options)` | `query: string`, `options?: { maxResults?: number }` | `{ totalMatches: number, results: { entity: Entity, score: number, relevance: string }[] }` | Performs a search for the given query and returns the top matching entities. |
| `searchByType(entityType)` | `entityType: string` | `Entity[]` | Retrieves all entities of the specified type. |
| `suggestTerms(partial, limit)` | `partial: string`, `limit?: number` | `string[]` | Provides search term suggestions based on the provided partial input. |
| `getEntity(entityId)` | `entityId: string` | `Entity` | Retrieves the entity with the specified ID. |
| `findRelated(entityId, maxDepth)` | `entityId: string`, `maxDepth: number` | `{ entity: Entity, path: string[], depth: number }[]` | Finds and returns entities related to the specified entity, up to the given maximum depth. |

### `main()` Function

The `main()` function is the entry point of the script. It handles the command-line arguments and dispatches the appropriate action based on the user's input.

### Helper Functions

The script also includes the following helper functions:

- `showHelp()`: Displays the usage information for the CLI.
- `showStats()`: Displays the search index statistics.
- `showEntityTypes()`: Lists all available entity types.
- `showSuggestions(partial)`: Displays search term suggestions for the provided partial input.
- `searchByType(entityType)`: Performs a search by entity type and displays the results.
- `showRelated(entityId)`: Displays the entities related to the specified entity.
- `performSearch(query)`: Performs a general keyword search and displays the results.

## Usage Examples

### Performing a General Keyword Search

```
node memory-search-cli.js "docker permission"
```

### Searching by Entity Type

```
node memory-search-cli.js --type development_session
```

### Viewing Search Index Statistics

```
node memory-search-cli.js --stats
```

### Listing Available Entity Types

```
node memory-search-cli.js --types
```

### Getting Search Term Suggestions

```
node memory-search-cli.js --suggest "dock"
```

### Displaying Related Entities

```
node memory-search-cli.js --related stacktrackr_app
```

## Configuration

The `memory-search-cli.js` script does not require any configuration options or environment variables. The script is designed to work with the `QuickMemorySearch` class, which is responsible for managing the in-memory search index.

## Error Handling

The script uses a `try-catch` block to handle any errors that may occur during execution. If an error is encountered, the script will display the error message and exit with a non-zero status code.

## Integration

The `memory-search-cli.js` script can be integrated into a larger system that requires efficient in-memory search functionality. The `QuickMemorySearch` class can be used as a standalone component or as part of a more complex system.

## Development Notes

The `memory-search-cli.js` script is a demonstration of the `QuickMemorySearch` class and its capabilities. The script is designed to be easy to understand and modify, making it a useful starting point for developers who need to implement similar search functionality in their own projects.

Some key implementation details and gotchas:

1. **Performance Considerations**: The `QuickMemorySearch` class is optimized for fast search and retrieval, but the performance of the overall system will depend on the size and complexity of the dataset being searched.
2. **Memory Usage**: The `QuickMemorySearch` class loads the entire dataset into memory, which may not be suitable for very large datasets. In such cases, you may need to consider alternative approaches, such as using a database or a more specialized search engine.
3. **Extensibility**: The `QuickMemorySearch` class is designed to be extensible, allowing you to add new features or modify the existing ones as needed. For example, you could add support for additional search options or result sorting.
4. **Data Format**: The `QuickMemorySearch` class assumes that the input data is in a specific format (i.e., an array of `Entity` objects). You may need to modify the class or the script to accommodate different data formats.
5. **Concurrency**: The current implementation of the `QuickMemorySearch` class is not thread-safe, so it may not be suitable for use in a highly concurrent environment. You may need to add synchronization mechanisms or use a different data structure to support concurrent access.

Overall, the `memory-search-cli.js` script provides a solid foundation for developers who need to implement efficient in-memory search functionality in their own projects.
