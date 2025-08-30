# rEngine Core: Agent Memory Search Integration Guide

## Purpose & Overview

The `memory-search-integration.md` file provides comprehensive documentation for the Agent Memory Search feature in the rEngine Core platform. This feature allows rEngine agents to quickly and efficiently search and navigate the memory data stored in the system, providing significant performance improvements over manual JSON parsing.

The Agent Memory Search integration enables rEngine agents to:

1. Perform fast, unified searches across all memory data files.
2. Instantly traverse relationships between different entities.
3. Easily filter and discover relevant context for their current tasks.
4. Make informed decisions based on the current state of the system.

This guide covers the key components, usage examples, and integration points for the Agent Memory Search feature, helping rEngine developers leverage this powerful functionality in their agents.

## Key Functions/Classes

### `QuickMemorySearch` Class

The `QuickMemorySearch` class is the main component responsible for providing the fast search and traversal capabilities. It encapsulates the following key functions:

- `initialize()`: Initializes the search index and prepares the system for use.
- `search(query, options)`: Performs a multi-strategy search with relevance scoring.
- `searchByType(entityType)`: Filters search results by a specific entity type.
- `getEntity(entityId)`: Retrieves a specific entity by its unique identifier.
- `findRelated(entityId, depth)`: Discovers related entities up to a specified depth.
- `suggestTerms(partial)`: Provides auto-completion suggestions for search queries.

### `memory-search-cli.js`

The `memory-search-cli.js` file provides a command-line interface (CLI) for interacting with the Agent Memory Search feature. This allows rEngine developers to quickly test and explore the search capabilities from the terminal.

## Dependencies

The `memory-search-integration.md` file and its associated components rely on the following dependencies:

1. **rEngine Core Platform**: The Agent Memory Search feature is an integral part of the rEngine Core platform and is designed to work seamlessly within the ecosystem.
2. **JSON Memory Data**: The search system operates on the JSON-formatted memory data stored in the rEngine Core system.

## Usage Examples

### Basic Search

```javascript
import QuickMemorySearch from './agents/engine/quick-memory-search.js';

const searcher = new QuickMemorySearch();
await searcher.initialize(); // Do this once per session

// Fast search
const results = searcher.search("docker permission issues");
console.log(`Found ${results.totalMatches} matches in ${results.searchTime}ms`);

// Get specific entity
const entity = searcher.getEntity("stacktrackr_app");

// Find related entities
const related = searcher.findRelated("serverless_plugin", 2);
```

### CLI Usage

```bash

# From StackTrackr root directory

node agents/engine/memory-search-cli.js "your search query"
node agents/engine/memory-search-cli.js --type development_session
node agents/engine/memory-search-cli.js --stats
node agents/engine/memory-search-cli.js --related stacktrackr_app
```

## Configuration

The Agent Memory Search feature does not require any specific configuration. The `QuickMemorySearch` class is designed to work with the default rEngine Core memory data setup.

## Integration Points

The Agent Memory Search integration is a core component of the rEngine Core platform and is designed to be seamlessly used by rEngine agents. Agents can leverage the search and traversal capabilities provided by the `QuickMemorySearch` class to enhance their memory exploration and decision-making processes.

## Troubleshooting

### Initialization Failure

If the `initialize()` method of the `QuickMemorySearch` class fails, ensure that the rEngine Core memory data files are accessible and in the expected format.

### Unexpected Search Results

If the search results do not match your expectations, check the following:

1. Verify the search query syntax and try different variations.
2. Ensure that the memory data in the rEngine Core system is up-to-date and accurately reflects the current state of the system.
3. If necessary, adjust the search options (e.g., `maxResults`, `minScore`) to refine the results.

### Relationship Traversal Issues

If the `findRelated()` method does not return the expected related entities, double-check the entity IDs and the depth parameter. Ensure that the relationships between entities are correctly defined in the memory data.

For any other issues or questions, please refer to the rEngine Core documentation or reach out to the rEngine support team.
