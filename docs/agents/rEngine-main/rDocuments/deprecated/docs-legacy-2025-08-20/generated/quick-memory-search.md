# rEngine Core: Quick Memory Search

## Purpose & Overview

The `quick-memory-search.js` file provides a fast in-memory search solution for the `StackTrackr` agent memory within the rEngine Core platform. It allows for efficient querying and retrieval of agent data without the need for a database migration or complex setup. This feature is particularly useful for quickly searching and exploring the rich information stored in the agent memory.

## Key Functions/Classes

The main component in this file is the `QuickMemorySearch` class, which encompasses the following key functionalities:

### `QuickMemorySearch` Class

- `constructor(agentsPath = './agents')`: Initializes the search index with the specified path to the agents directory.
- `initialize()`: Builds the search index by loading and processing the `memory.json` file and any additional context files (e.g., `agents.json`, `tasks.json`, `decisions.json`).
- `search(query, options)`: Performs a multi-strategy search on the indexed data, including exact keyword matches, partial keyword matches, and full-text search.
- `findRelated(entityId, maxDepth, visited)`: Traverses the relationship index to find entities related to the specified entity ID, up to a certain depth.
- `getStats()`: Retrieves various statistics about the search index, such as the number of entities, keywords, relationships, and the last update time.
- `searchByType(entityType)`: Retrieves all entities of the specified type.
- `getEntity(entityId)`: Retrieves the entity data for the specified entity ID.
- `suggestTerms(partial, maxSuggestions)`: Suggests search terms based on the indexed keywords.

## Dependencies

The `quick-memory-search.js` file depends on the following modules:

- `fs/promises`: For asynchronous file system operations.
- `path`: For working with file paths.

## Usage Examples

To use the `QuickMemorySearch` class, you can follow these steps:

```javascript
import QuickMemorySearch from './quick-memory-search.js';

// Create a new instance of the QuickMemorySearch class
const searcher = new QuickMemorySearch();

// Initialize the search index
await searcher.initialize();

// Perform a search
const results = searcher.search('docker permission issues');
console.log(results);

// Find related entities
const relatedEntities = searcher.findRelated('entity_id_123', 2);
console.log(relatedEntities);

// Get search statistics
const stats = searcher.getStats();
console.log(stats);
```

## Configuration

The `QuickMemorySearch` class has a single configuration parameter in the constructor:

- `agentsPath`: The path to the directory containing the agent data files (default is `'./agents'`).

No additional environment variables or configuration are required.

## Integration Points

The `QuickMemorySearch` class is designed to be integrated with the rEngine Core platform, specifically the `StackTrackr` agent memory management system. It provides a fast and efficient way to search and explore the data stored in the agent memory, which can be useful for various rEngine Core features and workflows.

## Troubleshooting

1. **Search index not initialized**: If you encounter the error `"Search index not initialized. Call initialize() first."`, ensure that you have called the `initialize()` method before attempting to perform any searches.

1. **Missing context files**: If you see warnings like `"⚠️ Could not load agents.json:"`, it means that the additional context files (e.g., `agents.json`, `tasks.json`, `decisions.json`) could not be loaded. Make sure these files are present in the `agentsPath` directory.

1. **Slow search performance**: If the search performance is not meeting your expectations, consider the following:
   - Ensure that the `agentsPath` is set to the correct location, and the agent data files are not excessively large.
   - Optimize the search query by using more specific keywords or filtering by entity type.
   - Monitor the search index statistics (e.g., number of entities, keywords, relationships) to ensure the index is properly built and maintained.

1. **Incomplete search results**: If the search results do not seem to cover all the relevant entities, check the following:
   - Ensure that the entity data is properly structured and indexed in the `memory.json` file.
   - Verify that the `buildSearchableText()` method is capturing all the relevant fields from the entity data.
   - Consider adjusting the keyword extraction and indexing process to better suit your use case.

If you encounter any other issues or have further questions, please refer to the rEngine Core documentation or reach out to the rEngine Core support team.
