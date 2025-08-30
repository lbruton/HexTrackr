# rSynk Integration

## Purpose & Overview

The `rsynk-integration.js_chunk_2` script is responsible for integrating the `rSynk` client into a larger application, likely a product search or inventory management system. The `rSynk` client provides enhanced search functionality, allowing users to find relevant items more efficiently.

This script serves the following main purposes:

1. **Initialization**: It sets up the `rSynk` client with the provided configuration and integrates it with the existing `StackTrackr` search functionality.
2. **Search Enhancements**: The script provides methods to retrieve both traditional and AI-enhanced search results, merging them to provide the most relevant information.
3. **Utility Functions**: It includes several utility methods to handle caching, rate limiting, user identification, and UI updates.
4. **Public API**: The script exposes a set of public methods to enable, disable, and retrieve the status of the `rSynk` integration.

## Technical Architecture

The script is structured around the `rSynkClient` class, which encapsulates the core functionality of the `rSynk` integration. The class includes the following key components:

1. **Search Methods**: The `getTraditionalResults()` and `simpleSearch()` methods handle the traditional search functionality, while the `enhanceSearch()` method leverages the `rSynk` client to provide AI-enhanced search results.
2. **Utility Methods**: The class includes several utility methods, such as `getServerUrl()`, `generateCacheKey()`, `extractInventoryContext()`, `getUserId()`, `checkRateLimit()`, `recordRequest()`, `findByKeyword()`, `mergeSearchResults()`, and `updateUIStatus()`.
3. **Public API**: The class exposes methods to enable, disable, and retrieve the status of the `rSynk` integration.

The script also includes an `initializerSynk()` function that sets up the `rSynk` client and integrates it with the existing `StackTrackr` search functionality.

## Dependencies

The script does not have any external dependencies. It relies on the global `window` object and the existence of the `StackTrackr` search functionality.

## Key Functions/Classes

### `rSynkClient` Class

#### `getTraditionalResults(query, inventory)`

- **Purpose**: Retrieves traditional search results using the existing `StackTrackr` search functionality or a simple fallback implementation.
- **Parameters**:
  - `query` (string): The search query.
  - `inventory` (Array): The current inventory.
- **Return Value**: An array of search results.

#### `simpleSearch(query, inventory)`

- **Purpose**: Provides a simple search implementation as a fallback when the `StackTrackr` search is not available.
- **Parameters**:
  - `query` (string): The search query.
  - `inventory` (Array): The current inventory.
- **Return Value**: An array of search results.

#### `getServerUrl()`

- **Purpose**: Determines the appropriate server URL based on the current environment (development or production).
- **Return Value**: The server URL.

#### `generateCacheKey(query, inventorySize)`

- **Purpose**: Generates a cache key based on the search query and the inventory size.
- **Parameters**:
  - `query` (string): The search query.
  - `inventorySize` (number): The size of the current inventory.
- **Return Value**: The cache key.

#### `extractInventoryContext(inventory)`

- **Purpose**: Extracts contextual information from the current inventory, such as the total number of items, unique metals, unique types, and a sample of item names.
- **Parameters**:
  - `inventory` (Array): The current inventory.
- **Return Value**: An object containing the extracted inventory context.

#### `getUserId()`

- **Purpose**: Generates or retrieves an anonymous user ID for tracking purposes.
- **Return Value**: The user ID.

#### `checkRateLimit()`

- **Purpose**: Checks if the current user is within the configured rate limit for requests.
- **Return Value**: `true` if the user is within the rate limit, `false` otherwise.

#### `recordRequest(success)`

- **Purpose**: Records a successful or failed request for monitoring purposes.
- **Parameters**:
  - `success` (boolean): Indicates whether the request was successful.

#### `findByKeyword(keyword, inventory)`

- **Purpose**: Finds items in the inventory that match the given keyword.
- **Parameters**:
  - `keyword` (string): The keyword to search for.
  - `inventory` (Array): The current inventory.
- **Return Value**: An array of matching items.

#### `mergeSearchResults(traditional, aiEnhanced)`

- **Purpose**: Merges traditional search results with AI-enhanced results, prioritizing the AI-enhanced matches.
- **Parameters**:
  - `traditional` (Array): The traditional search results.
  - `aiEnhanced` (Array): The AI-enhanced search results.
- **Return Value**: The merged search results.

#### `updateUIStatus(available)`

- **Purpose**: Updates the UI status indicator for the `rSynk` integration.
- **Parameters**:
  - `available` (boolean): Indicates whether the `rSynk` integration is available.

#### `enable()`

- **Purpose**: Enables the `rSynk` integration and saves the preference in local storage.

#### `disable()`

- **Purpose**: Disables the `rSynk` integration and saves the preference in local storage.

#### `isEnabled()`

- **Purpose**: Checks if the `rSynk` integration is enabled.

#### `getStats()`

- **Purpose**: Retrieves the current status and statistics of the `rSynk` integration.
- **Return Value**: An object containing the integration status, availability, request statistics, and cache size.

### `initializerSynk()` Function

- **Purpose**: Initializes the `rSynk` integration by loading saved preferences, creating the global `rSynk` instance, and integrating it with the existing `StackTrackr` search functionality.

## Usage Examples

To use the `rSynk` integration, you can follow these steps:

1. Ensure the `rsynk-integration.js_chunk_2` script is included in your application.
2. The `rSynk` client will be automatically initialized when the DOM is ready.
3. You can then interact with the `rSynk` integration using the exposed public API methods:

```javascript
// Enable the rSynk integration
window.rSynk.enable();

// Perform a search
const query = 'your search query';
const inventory = window.inventory; // Assuming you have access to the current inventory
const searchResults = await window.rSynk.enhanceSearch(query, inventory);

// Disable the rSynk integration
window.rSynk.disable();

// Retrieve the current status and statistics
const stats = window.rSynk.getStats();
console.log(stats);
```

## Configuration

The `rSynk` integration is configured using the `RSYNK_CONFIG` object, which is expected to be available in the global scope. The configuration options include:

- `enabled`: Determines whether the `rSynk` integration is initially enabled or disabled.
- `localUrl`: The URL to use for the `rSynk` server in a local/development environment.
- `serverUrl`: The URL to use for the `rSynk` server in a production environment.
- `maxRequestsPerMinute`: The maximum number of requests allowed per minute before rate limiting is applied.
- `requestCooldown`: The minimum time (in milliseconds) between requests before a new request is allowed.

## Error Handling

The `rSynk` integration handles errors in the following ways:

1. If the `StackTrackr` search functionality is unavailable, the script falls back to a simple search implementation.
2. If an error occurs during the `rSynk` integration process, a warning message is logged to the console, and the original `StackTrackr` search functionality is used.
3. The `checkRateLimit()` method checks if the user is within the configured rate limit, and if not, it returns `false` to indicate that the request should be blocked.

## Integration

The `rSynk` integration is designed to work seamlessly with existing product search or inventory management systems. By integrating the `rSynk` client, the application can provide enhanced search capabilities, leveraging AI-powered algorithms to surface the most relevant results.

The script specifically integrates with the `StackTrackr` search functionality, replacing the original `filterInventory()` method with a new one that calls the `rSynk` client's `enhanceSearch()` method. This ensures a transparent and seamless integration for the end-user.

## Development Notes

- The script assumes the existence of a global `window.inventory` array, which contains the current inventory items.
- The script relies on the `StackTrackr` search functionality, which is expected to be available in the global scope. If this functionality is not present, the script will use a simple fallback implementation.
- The script generates and stores an anonymous user ID in the browser's local storage to track usage statistics and monitor the `rSynk` integration.
- The script includes rate limiting functionality to ensure the `rSynk` client is not overloaded with requests.
- The script updates the UI status indicator to reflect the availability of the `rSynk` integration.

Overall, this `rsynk-integration.js_chunk_2` script provides a robust and well-designed integration of the `rSynk` client into a larger application, enhancing the product search and inventory management experience for users.
