# rEngine API Relay Client for StackTrackr

## Purpose & Overview

The `rengine-api-client.js` file provides an enhanced API client for the StackTrackr application, which leverages the rEngine Core platform's relay infrastructure. This client is responsible for handling all API calls to the rEngine Core services, providing intelligent caching, rate limiting, and market intelligence aggregation features.

The main objectives of this client are:

1. **Intelligent Caching**: The client caches API responses based on configurable time-to-live (TTL) values, reducing the number of unnecessary requests to the rEngine Core services.
2. **Rate Limiting**: The client tracks the number of API requests made and enforces rate limits based on the user's service tier, preventing excessive usage.
3. **Market Intelligence Integration**: The client integrates market intelligence data from the rEngine Core services, enhancing the spot price and Numista search results with additional insights.
4. **Community Data Contribution**: The client allows users to anonymously contribute their purchase data to the rEngine Core community, contributing to the overall market intelligence.

By using this enhanced API client, the StackTrackr application can leverage the capabilities of the rEngine Core platform, providing a more robust and intelligent user experience.

## Key Functions/Classes

The main components of the `rengine-api-client.js` file are:

1. **`RENGINE_CONFIG`**: An object that holds the configuration settings for the rEngine API relay, including the production, staging, and development endpoints, client information, service tiers, and caching strategies.

1. **`rEngineAPIClient`**: The main class that encapsulates the enhanced API client functionality. It includes methods for fetching spot prices, market intelligence, Numista search results, and contributing community data.

1. **`StackTrackrEnhancedAPI`**: A class that integrates the `rEngineAPIClient` with the existing StackTrackr API system, providing a seamless user experience.

The key functions of the `rEngineAPIClient` class include:

- `fetchSpotPrices`: Fetches spot prices for the specified metals, with optional market intelligence data.
- `fetchMarketIntelligence`: Fetches market intelligence data based on the provided criteria.
- `contributeMarketData`: Anonymizes and contributes the user's purchase data to the rEngine Core community.
- `searchNumistaIntelligent`: Performs an enhanced Numista search, leveraging the rEngine Core's intelligence.
- `getRequestHeaders`: Generates the necessary request headers for the rEngine API calls.
- `enhanceSpotPriceResponse`: Enriches the spot price response with additional metadata and intelligence.
- `anonymizeForCommunity`: Anonymizes the user's purchase data for community contribution.
- `checkRateLimit`: Checks the current rate limit based on the user's service tier.

The `StackTrackrEnhancedAPI` class integrates the `rEngineAPIClient` with the existing StackTrackr API system, providing methods like `syncSpotPrices` and `shareDataWithCommunity` to seamlessly update the StackTrackr UI with the enhanced data.

## Dependencies

The `rengine-api-client.js` file has the following dependencies:

- **StackTrackr v3.04.86+**: The client is designed to work with the StackTrackr application version 3.04.86 or later.
- **rEngine Core services**: The client relies on the rEngine Core platform's relay infrastructure and APIs to fetch spot prices, market intelligence, and Numista search results.

## Usage Examples

To use the rEngine API Relay Client in the StackTrackr application, follow these steps:

1. Import the `rEngineAPI` instance from the `rengine-api-client.js` file:

```javascript
import { rEngineAPI } from './rengine-api-client.js';
```

1. Call the `syncSpotPrices` method to fetch the latest spot prices and update the StackTrackr UI:

```javascript
rEngineAPI.syncSpotPrices(['silver', 'gold', 'platinum', 'palladium']);
```

1. Call the `shareDataWithCommunity` method to contribute the user's recent purchase data to the rEngine Core community:

```javascript
rEngineAPI.shareDataWithCommunity();
```

1. (Optional) Customize the user's service tier and API key by setting the appropriate values in the local storage:

```javascript
localStorage.setItem('rengine_user_tier', 'pro');
localStorage.setItem('rengine_api_key', 'your_api_key_here');
```

## Configuration

The `rengine-api-client.js` file uses the `RENGINE_CONFIG` object to store the necessary configuration settings. This object includes the following properties:

- `relay`: An object that contains the production, staging, and development endpoints for the rEngine API relay.
- `client`: An object that holds the client's name, version, and supported capabilities.
- `serviceTiers`: An object that defines the request limits and market intelligence access for the different service tiers (free, pro, enterprise).
- `cache`: An object that specifies the time-to-live (TTL) values for different types of cached data (spot prices, market intelligence, Numista metadata).

These configuration settings can be modified to match the specific requirements of the StackTrackr application or the rEngine Core platform deployment.

## Integration Points

The `rengine-api-client.js` file integrates with the following rEngine Core components:

1. **rEngine API Relay**: The client communicates with the rEngine API relay endpoints to fetch spot prices, market intelligence, and Numista search results.
2. **rEngine Market Intelligence**: The client leverages the rEngine Core's market intelligence capabilities to enhance the spot price and Numista search data.
3. **rEngine Community Data**: The client contributes the user's purchase data anonymously to the rEngine Core community, contributing to the overall market intelligence.

The `StackTrackrEnhancedAPI` class acts as the integration point between the rEngine API Relay Client and the existing StackTrackr API system, ensuring a seamless user experience.

## Troubleshooting

1. **API Requests Failing**: If the API requests are failing, check the following:
   - Ensure that the rEngine API relay endpoints in the `RENGINE_CONFIG` object are correct and accessible.
   - Verify that the user's service tier and API key (if applicable) are correctly configured.
   - Check the network logs for any error messages or status codes from the rEngine API relay.

1. **Caching Issues**: If the caching is not working as expected, ensure that the `RENGINE_CONFIG.cache` settings are appropriate for your use case. You may need to adjust the TTL values or the cache size limit.

1. **Rate Limiting**: If the client is hitting the rate limit, try the following:
   - Ensure that the user's service tier is correctly configured in the `RENGINE_CONFIG.serviceTiers` object.
   - Monitor the `rEngineAPIClient.requestCount` and `rEngineAPIClient.lastResetDate` properties to understand the current usage.
   - Implement graceful fallback strategies in your application to handle rate limit exceptions.

1. **Community Data Contribution Issues**: If the community data contribution is not working as expected, check the following:
   - Ensure that the user has opted in to data sharing by setting the `stacktrackr_data_sharing_opt_in` flag in the local storage.
   - Verify that the `contributeMarketData` method is correctly handling any errors and retrying the contribution in case of failures.

By understanding these potential issues and the configuration options available, you can ensure the smooth integration and operation of the rEngine API Relay Client within the StackTrackr application.
