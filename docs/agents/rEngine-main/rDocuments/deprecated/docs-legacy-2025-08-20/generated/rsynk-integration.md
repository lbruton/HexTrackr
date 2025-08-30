# rSynk Integration for StackTrackr

## Purpose & Overview

The `rsynk-integration.js` file provides a client-side integration for the `StackTrackr` application to leverage the `rSynk` Intelligent Development Wrapper platform. `rSynk` is an AI-powered search enhancement service that can improve the relevance and accuracy of search results within the `StackTrackr` application.

This integration allows `StackTrackr` to send user search queries and inventory data to the `rSynk` server, which then applies advanced natural language processing and machine learning techniques to provide enhanced search results. The integration also includes fallback mechanisms to ensure reliable search functionality, even when the `rSynk` service is unavailable.

## Key Functions/Classes

1. **`rSynkClient`** class:
   - Handles communication with the `rSynk` server, including testing the connection, sending search requests, and processing the responses.
   - Implements fallback mechanisms to use local AI or traditional search when the `rSynk` service is unavailable.
   - Provides caching and rate limiting functionality to optimize performance and prevent abuse.
   - Exposes a public API to enable/disable the `rSynk` integration and retrieve usage statistics.

1. **`enhanceSearch()`** method:
   - Takes a user search query and the current inventory data as input.
   - Checks if the `rSynk` integration is enabled and available, and if so, sends the request to the `rSynk` server.
   - Processes the `rSynk` server response, applying the AI-generated suggestions to the inventory data and merging the results with traditional search results.
   - Returns the enhanced search results, including metadata about the AI processing.

1. **`fallbackToLocalAI()`** and **`fallbackToTraditional()`** methods:
   - Provide fallback mechanisms when the `rSynk` service is unavailable or encounters issues.
   - `fallbackToLocalAI()` attempts to use a local AI search engine if available.
   - `fallbackToTraditional()` falls back to the traditional StackTrackr search functionality.

1. **`initializeRSynk()`** function:
   - Initializes the `rSynkClient` instance and integrates it with the existing `StackTrackr` search functionality.
   - Loads saved user preferences (whether the `rSynk` integration is enabled or not) from local storage.
   - Replaces the `filterInventory()` function in `StackTrackr` to use the enhanced search provided by `rSynk`.

## Dependencies

The `rsynk-integration.js` file depends on the following:

1. **StackTrackr core functionality**: The file integrates with the existing `StackTrackr` application, relying on functions like `filterInventory()` and `searchQuery`.
2. **Local AI search engine**: If available, the file will attempt to use a local AI search engine as a fallback mechanism.

## Usage Examples

To use the `rSynk` integration in your `StackTrackr` application, follow these steps:

1. Include the `rsynk-integration.js` file in your HTML:

   ```html
   <script src="js/rsynk-integration.js"></script>
   ```

1. The integration will automatically initialize when the DOM is ready. You can also manually call the `initializeRSynk()` function:

   ```javascript
   initializeRSynk();
   ```

1. To enable or disable the `rSynk` integration, use the following methods:

   ```javascript
   window.rSynk.enable(); // Enable rSynk integration
   window.rSynk.disable(); // Disable rSynk integration
   ```

1. To check the current status of the `rSynk` integration, use the `getStats()` method:

   ```javascript
   const stats = window.rSynk.getStats();
   console.log(stats);
   ```

## Configuration

The `rSynk` integration is configured using the `RSYNK_CONFIG` object, which can be passed to the `rSynkClient` constructor. The available configuration options are:

| Option                 | Description                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `serverUrl`             | The URL of the `rSynk` server for production use.                                                            |
| `localUrl`              | The URL of the `rSynk` server for local development/testing.                                                 |
| `fallbackToLocal`       | Whether to use a local AI search engine as a fallback when the `rSynk` service is unavailable.             |
| `fallbackToTraditional` | Whether to use the traditional `StackTrackr` search as a final fallback.                                    |
| `timeout`               | The timeout (in milliseconds) for `rSynk` API requests.                                                     |
| `retryAttempts`         | The number of times to retry failed `rSynk` API requests.                                                   |
| `cacheResults`          | Whether to cache the `rSynk` search results locally.                                                        |
| `enabled`               | Whether the `rSynk` integration is enabled by default.                                                      |
| `debugMode`             | Whether to log detailed information for debugging purposes.                                                 |
| `maxRequestsPerMinute`  | The maximum number of `rSynk` API requests allowed per minute (client-side rate limiting).                |
| `requestCooldown`       | The cooldown period (in milliseconds) between `rSynk` API requests (client-side rate limiting).           |

You can customize these settings by creating a new `RSYNK_CONFIG` object and passing it to the `rSynkClient` constructor:

```javascript
const customConfig = {
  serverUrl: 'https://your-rsynk-server.com',
  fallbackToLocal: false,
  debugMode: true
};

window.rSynk = new rSynkClient(customConfig);
```

## Integration Points

The `rsynk-integration.js` file integrates with the following rEngine Core components:

1. **StackTrackr**: The file replaces the `filterInventory()` function in `StackTrackr` to provide enhanced search results using the `rSynk` service.
2. **Local AI search engine**: If available, the file will attempt to use a local AI search engine as a fallback mechanism when the `rSynk` service is unavailable.

## Troubleshooting

### rSynk server is unavailable

If the `rSynk` server is unavailable, the integration will automatically fall back to using the local AI search engine (if configured) or the traditional `StackTrackr` search functionality.

You can check the status of the `rSynk` integration by calling the `getStats()` method:

```javascript
const stats = window.rSynk.getStats();
console.log(stats);
```

This will show whether the `rSynk` integration is enabled, if the `rSynk` server is available, and provide usage statistics.

### Local AI search engine is unavailable

If the local AI search engine is not available or encounters issues, the integration will fall back to the traditional `StackTrackr` search functionality.

You can check the logs for any errors related to the local AI search engine integration.

### Unexpected search results

If the search results are not as expected, you can try the following:

1. Check the `debugMode` configuration option to see if there are any relevant log messages.
2. Verify that the `rSynk` integration is correctly integrated with the `StackTrackr` application.
3. Ensure that the inventory data being passed to the `enhanceSearch()` method is accurate and up-to-date.
4. Test the `rSynk` integration with different search queries to identify any issues.

If you continue to experience issues, please contact the rEngine Core support team for further assistance.
