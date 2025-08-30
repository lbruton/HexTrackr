# rEngine Core - API Integration

## Purpose & Overview

The `api.js` file in the `StackTrackr` project is responsible for managing the integration with various Metals APIs. It provides functionality for:

- Configuring and storing API keys and settings
- Fetching spot prices for precious metals from the configured API
- Caching API responses to reduce the number of requests
- Tracking API usage and quota limits
- Displaying API connection status and usage metrics
- Providing utilities for syncing, resetting, and managing the API cache

This file is a critical component of the `StackTrackr` application, which is part of the rEngine Core ecosystem. It ensures that users can retrieve up-to-date spot prices for metals from external APIs and use that data to manage their precious metals inventory.

## Key Functions/Classes

The main functions and components in the `api.js` file are:

1. **API Configuration Management**:
   - `loadApiConfig()`: Loads the API configuration from localStorage.
   - `saveApiConfig(config)`: Saves the API configuration to localStorage.
   - `clearApiConfig()`: Clears the API configuration and cache.
   - `clearApiCache()`: Clears only the API cache, keeping the configuration.

1. **API Status and Usage Tracking**:
   - `setProviderStatus(provider, status)`: Updates the connection status for a specific API provider.
   - `updateProviderHistoryTables()`: Renders the API usage/quota data for each provider.
   - `refreshProviderStatuses()`: Refreshes the provider statuses based on stored keys and cache age.

1. **API Request Handling**:
   - `fetchSpotPricesFromApi(provider, apiKey)`: Fetches spot prices from the specified API.
   - `fetchBatchSpotPrices(provider, apiKey, selectedMetals, historyDays, historyTimes)`: Fetches spot prices for multiple metals in a single batch request.
   - `syncSpotPricesFromApi(showProgress, forceSync)`: Synchronizes spot prices from the API and updates the application.

1. **API Cache Management**:
   - `loadApiCache()`: Loads the cached API data from localStorage.
   - `saveApiCache(data, provider)`: Saves the API data to the cache.
   - `refreshFromCache()`: Refreshes the display using the cached API data.

1. **Utility Functions**:
   - `calculateApiUsage(selectedMetals, historyDays, batchSupported)`: Calculates the API usage for batch vs. individual requests.
   - `updateBatchCalculation(provider)`: Updates the batch calculation display for a specific provider.
   - `updateProviderSettings(provider)`: Updates the provider settings from form inputs.
   - `setupProviderSettingsListeners(provider)`: Sets up event listeners for provider settings.

1. **UI Interactions**:
   - `showApiModal()`, `hideApiModal()`: Shows and hides the API settings modal.
   - `showApiHistoryModal()`, `hideApiHistoryModal()`: Shows and hides the API history modal.
   - `showApiProvidersModal()`, `hideApiProvidersModal()`: Shows and hides the API providers modal.
   - `showProviderInfo(providerKey)`, `hideProviderInfo()`: Shows and hides the provider information modal.

## Dependencies

The `api.js` file depends on the following:

- `API_PROVIDERS` object: Defines the available API providers and their configurations.
- `METALS` object: Defines the supported metals and their properties.
- `elements` object: Provides references to various UI elements in the application.
- `spotPrices` object: Stores the current spot prices for each metal.
- `spotHistory` array: Stores the historical spot price data.
- `APP_VERSION` constant: Represents the current version of the application.
- `LS_KEY`, `SPOT_HISTORY_KEY`, `API_KEY_STORAGE_KEY`, `API_CACHE_KEY` constants: Define the keys used for localStorage operations.

## Usage Examples

To use the API integration functionality provided by the `api.js` file, you can call the following functions:

1. **Manage API Configuration**:

   ```javascript
   // Load the current API configuration
   const config = loadApiConfig();

   // Save the API configuration
   saveApiConfig(newConfig);

   // Clear the API configuration and cache
   clearApiConfig();

   // Clear only the API cache
   clearApiCache();
   ```

1. **Sync Spot Prices from API**:

   ```javascript
   // Synchronize spot prices from the configured API
   await syncSpotPricesFromApi(true, false);
   ```

1. **Test API Connection**:

   ```javascript
   // Test the connection to a specific API provider
   const isConnected = await testApiConnection(providerKey, apiKey);
   ```

1. **Interact with UI Modals**:

   ```javascript
   // Show and hide the API settings modal
   showApiModal();
   hideApiModal();

   // Show and hide the API history modal
   showApiHistoryModal();
   hideApiHistoryModal();

   // Show and hide the API providers modal
   showApiProvidersModal();
   hideApiProvidersModal();

   // Show and hide the provider information modal
   showProviderInfo(providerKey);
   hideProviderInfo();
   ```

## Configuration

The `api.js` file uses the following configuration:

- **API Providers**: The `API_PROVIDERS` object defines the available API providers and their configurations, including the base URL, endpoints, and parsing logic.
- **Metals**: The `METALS` object defines the supported metals and their properties, such as the default price and spot price key.
- **Storage Keys**: The `LS_KEY`, `SPOT_HISTORY_KEY`, `API_KEY_STORAGE_KEY`, and `API_CACHE_KEY` constants define the keys used for localStorage operations.
- **Default API Quota**: The `DEFAULT_API_QUOTA` constant defines the default API usage quota.

## Integration Points

The `api.js` file integrates with the following components of the rEngine Core ecosystem:

1. **StackTrackr Application**: The `api.js` file is a critical component of the `StackTrackr` application, responsible for fetching and managing spot prices for precious metals.
2. **UI Elements**: The file interacts with various UI elements, such as input fields, buttons, and modals, to provide a seamless user experience for configuring and managing the API integration.
3. **LocalStorage**: The file uses the browser's localStorage to store and retrieve the API configuration and cache data.

## Troubleshooting

Here are some common issues and solutions related to the `api.js` file:

1. **API Connection Errors**:
   - Ensure that the API key is valid and correctly entered in the API settings modal.
   - Check the API provider's documentation for any changes or updates to the API endpoints or authentication methods.
   - Verify that the network connection is stable and that the browser is not blocking any requests to the API.

1. **API Quota Exceeded**:
   - Monitor the API usage statistics displayed in the API providers modal and adjust the usage accordingly.
   - Consider upgrading the API plan or switching to a different provider if the current one does not meet your needs.

1. **Cached Data Issues**:
   - If the cached data is not reflecting the latest spot prices, try clearing the API cache and forcing a sync from the API.
   - Ensure that the `cacheHours` setting in the API configuration is appropriate for your use case.

1. **UI Rendering Problems**:
   - Check for any errors in the browser console that might be related to the `api.js` file or the interactions with the UI elements.
   - Ensure that the necessary HTML elements are present and correctly referenced in the JavaScript code.

If you encounter any other issues or have questions about the `api.js` file, please refer to the rEngine Core documentation or reach out to the support team for assistance.
