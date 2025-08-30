# AI Search Prototype Documentation

## Purpose & Overview

This script is a prototype for enhancing the existing StackTrackr search system with AI-powered capabilities. It introduces an `AISearchEngine` class that handles caching, loading, and saving search results, as well as a `enhanceExistingSearch` function that integrates the AI-powered search into the existing search flow.

The main goals of this prototype are to:

1. Improve the relevance and accuracy of search results by leveraging AI-based natural language processing and understanding.
2. Provide a seamless integration with the existing StackTrackr search system, allowing a gradual transition to the new AI-enhanced capabilities.
3. Demonstrate the potential benefits of incorporating AI technology into the search experience, such as providing relevant suggestions and insights to users.

## Technical Architecture

The script consists of the following key components:

1. **AISearchEngine Class**:
   - Responsible for managing the cache of search results, including loading, saving, and cleaning up expired entries.
   - Provides methods for enhancing the search results using the AI-powered capabilities.

1. **enhanceExistingSearch Function**:
   - This function is the entry point for integrating the AI-powered search into the existing StackTrackr search system.
   - It first retrieves the traditional search results, then initializes the `AISearchEngine` (if not already done) and calls the `enhanceSearch` method to get the AI-enhanced results.
   - If the AI-enhanced results are available, it updates the UI with the AI insights and returns the combined search results.

1. **displayAIInsights Function**:
   - This function is responsible for rendering the AI insights and suggestions in the UI, creating or updating the "AI Insights" panel.
   - It handles the click events on the suggestion chips, allowing users to update the search query and trigger a new search.

The data flow in the system is as follows:

1. The `enhanceExistingSearch` function is called, typically from the existing StackTrackr search functionality.
2. The function checks if the AI search is enabled and configured, and if so, it initializes the `AISearchEngine` (if not already done).
3. The `enhanceSearch` method of the `AISearchEngine` is called with the traditional search results, search query, and inventory data.
4. The `AISearchEngine` retrieves the search results from the cache, enhances them using the AI capabilities, and returns the updated results.
5. The `enhanceExistingSearch` function updates the UI with the AI insights and returns the combined search results.

## Dependencies

The script does not have any external dependencies. It relies on the following global variables and functions provided by the StackTrackr system:

- `window.aiSearchEnabled`: Indicates whether the AI search is enabled.
- `window.aiApiKey`: The API key for the AI service.
- `window.filterInventory()`: The existing StackTrackr search function.
- `window.searchQuery`: The current search query.
- `window.inventory`: The inventory data.
- `window.searchInventory()`: The function to trigger a new search.

## Key Functions/Classes

### AISearchEngine Class

```javascript
class AISearchEngine {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.cache = new Map();
  }

  /**

   * Enhance search results using AI
   * @param {string} query - The search query
   * @param {Array} inventory - The inventory data
   * @param {Array} traditionalResults - The traditional search results
   * @returns {Promise<{ aiEnhanced: boolean, totalFound: number, aiContribution: number, aiInterpretation: Object, results: Array }>}

   */
  async enhanceSearch(query, inventory, traditionalResults) {
    // ... implementation details ...
  }

  // Other methods: loadCacheFromStorage, saveCacheToStorage, cleanupCache
}
```

The `AISearchEngine` class is responsible for managing the cache of search results and providing the `enhanceSearch` method to improve the search results using AI capabilities.

The `enhanceSearch` method takes the search query, inventory data, and traditional search results as input, and returns an object with the following properties:

- `aiEnhanced`: Indicates whether the results were enhanced by the AI.
- `totalFound`: The total number of items found.
- `aiContribution`: The number of items discovered by the AI.
- `aiInterpretation`: An object containing the AI's interpretation of the search query and any suggested terms.
- `results`: The final, enhanced search results.

### enhanceExistingSearch Function

```javascript
async function enhanceExistingSearch() {
  // ... implementation details ...
}
```

The `enhanceExistingSearch` function is the entry point for integrating the AI-powered search into the existing StackTrackr search system. It handles the following tasks:

1. Checks if the AI search is enabled and configured.
2. Retrieves the traditional search results using the `filterInventory` function.
3. Initializes the `AISearchEngine` if not already done.
4. Calls the `enhanceSearch` method of the `AISearchEngine` to get the AI-enhanced results.
5. Updates the UI with the AI insights using the `displayAIInsights` function.
6. Returns the final, combined search results.

### displayAIInsights Function

```javascript
function displayAIInsights(aiInterpretation) {
  // ... implementation details ...
}
```

The `displayAIInsights` function is responsible for rendering the AI insights and suggestions in the UI. It creates or updates the "AI Insights" panel and adds click event handlers for the suggestion chips, allowing users to update the search query and trigger a new search.

## Usage Examples

To use the AI-powered search functionality, follow these steps:

1. Ensure that the `aiSearchEnabled` and `aiApiKey` global variables are set to enable the AI search.
2. Call the `enhanceExistingSearch` function instead of the original `filterInventory` function to trigger the AI-enhanced search.
3. The UI will display the AI insights and suggestions, which the user can interact with to refine the search.

Example usage:

```javascript
// Trigger the AI-enhanced search
const results = await enhanceExistingSearch();

// Use the enhanced search results
displaySearchResults(results);
```

## Configuration

The script relies on the following configuration options and environment variables:

- `window.aiSearchEnabled`: A boolean flag that indicates whether the AI search is enabled.
- `window.aiApiKey`: The API key for the AI service used in the `AISearchEngine`.
- `AI_SEARCH_CONFIG.cache.storageKey`: The key used to store the search result cache in the browser's localStorage.
- `AI_SEARCH_CONFIG.cache.maxSize`: The maximum number of entries to keep in the search result cache.
- `AI_SEARCH_CONFIG.cache.ttl`: The time-to-live (in milliseconds) for each cache entry.

## Error Handling

The script handles errors that may occur during the following operations:

1. **Loading cache from localStorage**: If there's an error while parsing the cached data, a warning message is logged, and the cache is assumed to be empty.
2. **Saving cache to localStorage**: If there's an error while saving the cache, a warning message is logged, and the operation is skipped.
3. **Enhancing search with AI**: If there's an error during the AI-powered search enhancement, an error message is logged, and the script falls back to the traditional search results.

In all cases, the script tries to provide a graceful fallback to ensure the search functionality remains operational, even if the AI-powered capabilities are not available.

## Integration

This AI search prototype is designed to integrate seamlessly with the existing StackTrackr search system. The `enhanceExistingSearch` function acts as the bridge between the traditional search and the AI-enhanced search, allowing the StackTrackr system to gradually transition to the new capabilities.

The script exports the `AISearchEngine` class and the `enhanceExistingSearch` function, which can be used by the StackTrackr system to incorporate the AI-powered search functionality.

## Development Notes

1. **Caching Strategy**: The script uses a cache to store the search results, which is loaded from and saved to the browser's localStorage. This helps improve the performance of subsequent searches and reduces the load on the AI service.

1. **Cache Cleanup**: The `cleanupCache` method periodically removes expired cache entries and enforces the maximum cache size to ensure efficient memory usage.

1. **AI Insights Rendering**: The `displayAIInsights` function creates a dedicated "AI Insights" panel in the UI, which can be expanded in the future to provide more detailed information and interactive features.

1. **Suggestion Handling**: The script adds click event handlers to the suggestion chips in the "AI Insights" panel, allowing users to easily update the search query and trigger a new search.

1. **Fallback to Traditional Search**: If the AI-powered search enhancement fails for any reason, the script gracefully falls back to the traditional search results to ensure the search functionality remains available.

1. **Extensibility**: The `AISearchEngine` class and the `enhanceExistingSearch` function are designed to be easily extensible, allowing the StackTrackr system to incorporate additional AI-powered features in the future.
