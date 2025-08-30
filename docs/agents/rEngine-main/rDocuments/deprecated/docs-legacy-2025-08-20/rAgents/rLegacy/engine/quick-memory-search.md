# Quick Memory Search Index - Proof of Concept

## Purpose & Overview

The `quick-memory-search.js` script provides a fast in-memory search solution for the StackTrackr agent memory, without requiring a complex database migration or setup. This allows for efficient searching and retrieval of relevant information within the agent's memory without the overhead of a traditional database-backed search.

The script creates an in-memory index of the agent's entities, relationships, and other relevant data, enabling quick searches and context retrieval. This can be particularly useful in scenarios where fast access to information is crucial, such as in real-time systems or applications with high user interaction.

## Technical Architecture

The `QuickMemorySearch` class is the main component of the script, responsible for building and managing the search index. The key parts of the architecture are:

1. **Index Data Structure**: The `index` property of the `QuickMemorySearch` class contains several Map objects that store different aspects of the search index:
   - `entities`: Stores the full entity data, indexed by the `entity_id`.
   - `keywords`: Stores a reverse index of keywords to the corresponding `entity_id` values.
   - `relationships`: Stores the relationships between entities, indexed by `entity_id`.
   - `types`: Stores a mapping of entity types to their corresponding `entity_id` values.
   - `searchableText`: Stores the concatenated searchable text for each entity, indexed by `entity_id`.
   - `metadata`: Stores various metadata about the search index, such as the total number of entities, the last update time, and the build time.

1. **Index Building**: The `initialize()` method is responsible for building the search index from the `memory.json` file and any additional context files (e.g., `agents.json`, `tasks.json`, `decisions.json`). This process involves building the entity index, relationship index, and extracting keywords.

1. **Searching**: The `search()` method implements the search functionality, using multiple strategies to find relevant entities based on the provided query. This includes exact keyword matches, partial keyword matches, and full-text search within the searchable content.

1. **Related Entity Retrieval**: The `findRelated()` method allows traversing the relationship index to find entities related to a given `entity_id`, up to a specified depth.

1. **Additional Utilities**: The script also provides methods for getting search statistics, searching by entity type, retrieving entities by ID, and suggesting search terms based on the indexed keywords.

## Dependencies

The script imports the following dependencies:

- `fs/promises`: For asynchronous file I/O operations.
- `path`: For working with file paths.

## Key Functions/Classes

### `QuickMemorySearch` Class

The `QuickMemorySearch` class is the main entry point for the search functionality.

#### Constructor

```typescript
constructor(agentsPath = './agents')
```

- `agentsPath`: The path to the directory containing the agent-related JSON files (default is `'./agents'`).

#### Methods

- `initialize()`: Initializes the search index by loading the `memory.json` file and any additional context files.
- `buildEntityIndex(memoryData)`: Builds the main entity index from the `memoryData` object.
- `buildSearchableText(entity)`: Generates the searchable text for a given entity.
- `extractKeywords(entityId, searchableText)`: Extracts keywords from the searchable text and builds the reverse index.
- `buildRelationshipIndex(memoryData)`: Builds the relationship index from the `memoryData` object.
- `addRelationship(fromId, toId)`: Adds a relationship between two entities to the index.
- `loadAdditionalContext()`: Loads and indexes additional context data from other JSON files.
- `indexAdditionalData(filename, data)`: Indexes the data from an additional context file.
- `search(query, options)`: Searches the index using multiple strategies and returns the results.
- `calculateRelevance(query, entity)`: Calculates a relevance explanation for a search result.
- `findRelated(entityId, maxDepth, visited)`: Finds related entities through relationship traversal.
- `getStats()`: Retrieves search index statistics.
- `searchByType(entityType)`: Searches for entities of a specific type.
- `getEntity(entityId)`: Retrieves an entity by its ID.
- `suggestTerms(partial, maxSuggestions)`: Suggests search terms based on the indexed keywords.

## Usage Examples

```javascript
// Initialize the search index
const searcher = new QuickMemorySearch();
await searcher.initialize();

// Perform a search
const results = searcher.search('docker permission issues', { maxResults: 3 });
console.log(results);

// Find related entities
const relatedEntities = searcher.findRelated('some_entity_id', 2);
console.log(relatedEntities);

// Get search index statistics
const stats = searcher.getStats();
console.log(stats);
```

## Configuration

The `QuickMemorySearch` class has one configuration option:

- `agentsPath`: The path to the directory containing the agent-related JSON files (default is `'./agents'`).

## Error Handling

The `QuickMemorySearch` class handles errors during the index building process. If an error occurs, it will be logged to the console, and the error will be rethrown.

## Integration

The `QuickMemorySearch` class can be integrated into a larger system that uses agent memory data, such as a monitoring or management application. By providing fast in-memory search capabilities, it can enhance the overall user experience and enable more efficient data exploration and troubleshooting.

## Development Notes

- The script uses a combination of strategies to perform searches, including exact keyword matches, partial keyword matches, and full-text search. This approach aims to provide the most relevant results for a given query.
- The relationship traversal algorithm in the `findRelated()` method uses a depth-first search approach, which may not be the most efficient for large data sets. In such cases, a more advanced graph traversal algorithm may be required.
- The script assumes that the input JSON files are correctly formatted and consistent. In a production environment, additional error handling and validation may be necessary to ensure data integrity.
- The script does not currently provide any persistence or updating mechanisms for the search index. In a real-world scenario, the index may need to be periodically refreshed or updated to reflect changes in the agent memory.
