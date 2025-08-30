# rEngine API Client Documentation

## Purpose & Overview

The `rengine-api-client.js` script is a wrapper around the rEngine API, providing a set of utility functions and features to enhance the functionality of the StackTrackr application. This script acts as a bridge between the legacy StackTrackr API and the rEngine API, allowing the application to take advantage of the advanced data and analytics provided by the rEngine platform.

## Technical Architecture

The script is organized into several key components:

1. **Cache Management**: The script maintains a cache of API responses to improve performance and provide fallback data in case of API failures.
2. **Rate Limiting and Usage Tracking**: The script tracks the number of API requests made and enforces rate limiting based on the user's subscription tier.
3. **Feature Access Control**: The script checks the user's subscription tier to determine which features they have access to, such as market intelligence data.
4. **Utility Methods**: The script provides a set of utility methods for generating request IDs, hashing data, and managing storage of usage data.
5. **Error Handling**: The script implements a fallback strategy to handle API errors, using cached data when available.
6. **StackTrackr Integration**: The `StackTrackrEnhancedAPI` class integrates the rEngine API client with the existing StackTrackr API, providing enhanced functionality such as spot price syncing and community data sharing.

The data flow within the script is as follows:

1. The `StackTrackrEnhancedAPI` class is initialized, determining the user's subscription tier and API key.
2. The `rEngineAPIClient` instance is created and used to interact with the rEngine API.
3. When the `syncSpotPrices` method is called, the rEngine API is used to fetch the latest spot prices and market intelligence data.
4. The spot prices and market intelligence data are then updated in the StackTrackr UI.
5. The `shareDataWithCommunity` method allows the user to contribute their recent purchase data to the rEngine community intelligence.

## Dependencies

The script has the following external dependencies:

1. `RENGINE_CONFIG`: A configuration object that provides details about the rEngine service tiers and their corresponding features.
2. `METALS`: An object that maps metal names to their corresponding configuration details.
3. `window.apiConfig`: A reference to the legacy StackTrackr API configuration.
4. `window.inventory`: The user's inventory data, which is used for community data sharing.

## Key Functions/Classes

### `rEngineAPIClient` Class

The `rEngineAPIClient` class is the main entry point for interacting with the rEngine API. It provides the following key methods:

| Method | Parameters | Return Value | Description |
| --- | --- | --- | --- |
| `getFromCache` | `key: string, maxAge: number` | `any \| null` | Retrieves a cached response from the internal cache, removing it if the cache entry has expired. |
| `setCache` | `key: string, data: any, ttl: number` | `void` | Stores a response in the internal cache, with an optional time-to-live (TTL) value. |
| `checkRateLimit` | `none` | `boolean` | Checks if the current user has reached their daily API request limit. |
| `incrementUsage` | `none` | `void` | Increments the API request count and saves the updated usage data to local storage. |
| `hasMarketIntelAccess` | `none` | `boolean` | Checks if the current user has access to market intelligence data based on their subscription tier. |
| `hasUserOptedIn` | `none` | `boolean` | Checks if the user has opted in to sharing their data with the community. |
| `generateRequestId` | `none` | `string` | Generates a unique request ID. |
| `generateAnonymousHash` | `item: { name: string, date: string, price: number }` | `string` | Generates an anonymous hash for a given data item. |
| `saveUsageToStorage` | `none` | `void` | Saves the current API usage data to local storage. |
| `loadUsageFromStorage` | `none` | `void` | Loads the API usage data from local storage. |
| `handleAPIError` | `error: Error, operation: string` | `any` | Handles API errors, using cached fallback data if available. |
| `getFallbackData` | `operation: string` | `any \| null` | Retrieves cached fallback data for a given API operation. |

### `StackTrackrEnhancedAPI` Class

The `StackTrackrEnhancedAPI` class integrates the rEngine API client with the existing StackTrackr API. It provides the following key methods:

| Method | Parameters | Return Value | Description |
| --- | --- | --- | --- |
| `syncSpotPrices` | `metals: string[]` | `Promise<any>` | Synchronizes the spot prices for the specified metals using the rEngine API, falling back to the legacy StackTrackr API if necessary. |
| `shareDataWithCommunity` | `none` | `Promise<void>` | Shares the user's recent purchase data with the rEngine community, if the user has opted in. |
| `getUserTier` | `none` | `string` | Retrieves the user's subscription tier from local storage. |
| `getAPIKey` | `none` | `string` | Retrieves the rEngine API key from local storage. |
| `updateSpotPricesInUI` | `spotPrices: { [metal: string]: number }` | `void` | Updates the spot prices in the StackTrackr UI. |
| `updateMarketIntelligence` | `intelligence: any` | `void` | Updates the market intelligence panel in the StackTrackr UI. |
| `showEnhancedMetadata` | `metadata: { source: string, dataAge: number, cacheHit: boolean }` | `void` | Displays the enhanced metadata from the rEngine API in the StackTrackr UI. |
| `formatDataAge` | `ageMs: number` | `string` | Formats the age of the data in a human-readable format. |

## Usage Examples

Here's an example of how to use the `StackTrackrEnhancedAPI` class to synchronize spot prices:

```javascript
// Initialize the enhanced API
window.rEngineAPI = new StackTrackrEnhancedAPI();

// Sync spot prices for a set of metals
await window.rEngineAPI.syncSpotPrices(['silver', 'gold', 'platinum', 'palladium']);
```

To share user data with the rEngine community:

```javascript
// Share recent purchase data with the community
await window.rEngineAPI.shareDataWithCommunity();
```

## Configuration

The script relies on the following configuration:

1. `RENGINE_CONFIG`: This object provides details about the rEngine service tiers and their corresponding features.
2. `METALS`: This object maps metal names to their corresponding configuration details.
3. `rengine_user_tier`: The user's subscription tier, stored in local storage.
4. `rengine_api_key`: The user's rEngine API key, stored in local storage.
5. `stacktrackr_data_sharing_opt_in`: A flag indicating whether the user has opted in to sharing their data with the rEngine community, stored in local storage.

## Error Handling

The script implements a fallback strategy to handle API errors. If an API request fails, the script will attempt to retrieve cached fallback data. If no cached data is available, the script will throw an error for upstream handling.

The `handleAPIError` method is responsible for managing API errors. It logs the error, attempts to retrieve cached fallback data, and throws an error if no fallback data is available.

## Integration

The `rengine-api-client.js` script is designed to integrate with the existing StackTrackr application. It provides an enhanced API client, `StackTrackrEnhancedAPI`, that can be used to synchronize spot prices, share user data with the rEngine community, and display enhanced metadata.

The script also includes an integration hook, `enhanceWithrEngine`, which can be called by the StackTrackr application to enable the enhanced functionality.

## Development Notes

1. **Caching**: The script uses an in-memory cache to store API responses, with a periodic cleanup mechanism to remove old entries. This helps improve performance and provide fallback data in case of API failures.

1. **Rate Limiting**: The script tracks the number of API requests made by the user and enforces rate limiting based on the user's subscription tier. This helps prevent abuse of the rEngine API.

1. **Feature Access Control**: The script checks the user's subscription tier to determine which features they have access to, such as market intelligence data. This ensures that users only have access to the features they are entitled to.

1. **Fallback Strategies**: The script implements a fallback strategy to handle API errors, using cached data when available. This helps ensure that the StackTrackr application can continue to function even when the rEngine API is unavailable.

1. **Asynchronous Operations**: The script uses asynchronous operations, such as `await`, to interact with the rEngine API. This helps ensure that the StackTrackr application remains responsive and does not block the main thread.

1. **Modular Design**: The script is designed with a modular approach, separating concerns into different classes and methods. This makes the code easier to maintain, test, and extend in the future.

1. **User Privacy**: The script includes mechanisms to generate anonymous hashes for user data, allowing for community data sharing without compromising user privacy.

1. **Logging and Diagnostics**: The script includes extensive logging and diagnostic information, which can be useful for troubleshooting and monitoring the integration with the rEngine API.
