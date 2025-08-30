# StackTrackr Catalog API Documentation

## Purpose & Overview

The `catalog-api.js` file is a part of the rEngine Core ecosystem, providing a provider-agnostic catalog API architecture for the StackTrackr application. This file abstracts the integration with various catalog data providers, such as Numista and the future rSynk API, allowing for easy swapping between them.

The primary purpose of this file is to:

1. Manage the configuration and encryption of API keys for different catalog providers.
2. Provide a consistent API for looking up, searching, and retrieving market values of catalog items.
3. Implement a fallback chain to ensure availability of catalog data, even when primary providers are unavailable.
4. Cache catalog data locally to improve performance and reduce external API calls.

This centralized Catalog API system ensures a seamless and reliable user experience for StackTrackr, regardless of the underlying data sources.

## Key Functions/Classes

The main components of the `catalog-api.js` file are:

1. **`CryptoUtils`**: A class that provides simple encryption and decryption utilities for securely storing API keys.
2. **`CatalogConfig`**: A class that manages the configuration and storage of API keys for different catalog providers, including encryption and decryption.
3. **`CatalogProvider`**: An abstract base class that defines the common interface for all catalog providers, ensuring consistency in the API.
4. **`NumistaProvider`**, **`rSynkProvider`**, and **`LocalProvider`**: Concrete implementations of the `CatalogProvider` class, handling the specific API integrations for Numista, rSynk (future), and local data, respectively.
5. **`CatalogAPI`**: The main API manager that coordinates the use of multiple providers, handles fallback logic, and caches data locally.

## Dependencies

The `catalog-api.js` file has the following dependencies:

1. **Web Crypto API**: The `crypto.subtle` API is used for the encryption and decryption of API keys.
2. **Fetch API**: The `fetch` function is used to make HTTP requests to catalog data providers.

## Usage Examples

Here are some examples of how to use the Catalog API:

### Lookup an item by catalog ID

```javascript
const catalogId = '5685'; // American Silver Eagle 1986
const item = await catalogAPI.lookupItem(catalogId);
console.log(item);
```

### Search for items by query

```javascript
const query = 'silver eagle';
const filters = { limit: 10 };
const results = await catalogAPI.searchItems(query, filters);
console.log(results);
```

### Get the current market value of an item

```javascript
const catalogId = '5685';
const marketValue = await catalogAPI.getMarketValue(catalogId);
console.log(`Market value: $${marketValue.toFixed(2)}`);
```

### Set the Numista API key

```javascript
const numistaApiKey = 'your_numista_api_key';
catalogAPI.setApiKey('numista', numistaApiKey);
```

### Switch the active catalog provider

```javascript
catalogAPI.switchProvider('rsynk');
```

## Configuration

The Catalog API system uses the following configuration options, which are stored in the browser's local storage:

- `catalog_api_config`: The encrypted API keys and other settings for each catalog provider.
- `catalog_session_keys`: The decrypted API keys, stored in memory for the current session.
- `stackrtrackr.catalog.settings`: The user-defined settings, such as the active provider and API key management.

These configuration options can be accessed and modified through the `CatalogConfig` and `CatalogAPI` classes.

## Integration Points

The Catalog API system is a core component of the StackTrackr application, providing the necessary catalog data integration. It can be accessed and used by other parts of the rEngine Core platform that require access to catalog information.

## Troubleshooting

### Decryption Failure

If you encounter an error when trying to decrypt an API key, ensure that the password used for encryption matches the one used for decryption. If the password is lost, the encrypted API key cannot be recovered, and you will need to generate a new API key and re-encrypt it.

### Rate Limit Exceeded

The Catalog API system implements rate limiting to prevent excessive usage of the underlying catalog providers. If you encounter a "Rate limit exceeded" error, try reducing the frequency of your requests or switch to a different provider if available.

### Provider Initialization Failure

If a catalog provider fails to initialize, check the provider-specific configuration (e.g., API key, client details) and ensure that the required information is correctly provided and stored in the application's settings.

### Local Data Cache Issues

If you encounter issues with the local data cache, such as missing or outdated data, try clearing the cache by removing the `stackrtrackr.catalog.cache` item from the browser's local storage.
