# Catalog API Documentation

## Purpose & Overview

The `catalog-api.js` script provides a comprehensive catalog API management system for the StackRTrackr application. It allows users to lookup, search, and retrieve market values for items in a numismatic catalog, with support for multiple data providers and a fallback mechanism to ensure reliable performance.

The main features of this script include:

- Abstraction of multiple catalog data providers (e.g., Numista, rSynk) behind a common interface
- Seamless fallback to local data cache when external APIs are unavailable
- Caching of successful API responses to improve performance
- Normalization of data to a standardized format
- Configuration and management of API keys and active provider

This script is designed to be a central hub for all catalog-related functionality within the StackRTrackr application, providing a reliable and extensible solution for working with numismatic data.

## Technical Architecture

The `catalog-api.js` script is organized into several key components:

1. **CatalogProvider**: An abstract base class that defines the interface for all catalog data providers. It includes methods for looking up items, searching, and retrieving market values.
2. **NumistaProvider**: A concrete implementation of the `CatalogProvider` class that interacts with the Numista API.
3. **rSynkProvider**: A placeholder implementation of the `CatalogProvider` class for the future rSynk API integration.
4. **LocalProvider**: A fallback `CatalogProvider` implementation that uses a local data cache stored in the browser's localStorage.
5. **CatalogAPI**: The main entry point that coordinates the different providers, manages the active provider, and handles the fallback chain.

The data flow within the script is as follows:

1. The `CatalogAPI` class is responsible for initializing the available providers and managing the active provider.
2. When a user requests a catalog item lookup or search, the `CatalogAPI` class delegates the request to the active provider.
3. If the active provider fails, the `CatalogAPI` class attempts to use the fallback providers (in order) to complete the request.
4. Successful responses are cached in the `LocalProvider` for faster subsequent lookups.

This architecture allows the StackRTrackr application to seamlessly switch between different catalog data sources, ensuring robust and reliable performance.

## Dependencies

The `catalog-api.js` script has the following dependencies:

- No external library dependencies

## Key Functions/Classes

### CatalogProvider

## Abstract Base Class

```typescript
abstract class CatalogProvider {
  readonly name: string;
  readonly apiKey: string;
  readonly baseUrl: string;
  readonly rateLimit: number;
  readonly timeout: number;

  abstract async lookupItem(catalogId: string): Promise<Object>;
  abstract async searchItems(query: string, filters?: Object): Promise<Array<Object>>;
  abstract async getMarketValue(catalogId: string): Promise<number>;
}
```

The `CatalogProvider` class is an abstract base class that defines the common interface for all catalog data providers. It includes the following methods:

- `lookupItem(catalogId: string)`: Looks up a catalog item by its unique identifier.
- `searchItems(query: string, filters?: Object)`: Searches for catalog items based on a query and optional filters.
- `getMarketValue(catalogId: string)`: Retrieves the current market value for a given catalog item.

### NumistaProvider

## Concrete Implementation of CatalogProvider

```typescript
class NumistaProvider extends CatalogProvider {
  constructor(config: { clientName: string; clientId: string; quota: number; apiKey: string }) {
    super({
      name: 'Numista',
      apiKey: config.apiKey,
      baseUrl: 'https://api.numista.com/api/v3',
      rateLimit: 100,
      timeout: 15000
    });
    this.clientName = config.clientName;
    this.clientId = config.clientId;
    this.quota = config.quota;
  }

  async lookupItem(catalogId: string): Promise<Object> { /* implementation */ }
  async searchItems(query: string, filters?: Object): Promise<Array<Object>> { /* implementation */ }
  async getMarketValue(catalogId: string): Promise<number> { /* implementation */ }
  normalizeItemData(numistaData: Object): Object { /* implementation */ }
  normalizeMetal(composition: string): string { /* implementation */ }
  normalizeType(type: string): string { /* implementation */ }
}
```

The `NumistaProvider` class is a concrete implementation of the `CatalogProvider` interface that interacts with the Numista API. It includes the following methods:

- `lookupItem(catalogId: string)`: Looks up a catalog item by its Numista ID.
- `searchItems(query: string, filters?: Object)`: Searches for catalog items on Numista based on a query and optional filters.
- `getMarketValue(catalogId: string)`: Retrieves the current market value for a given catalog item from Numista.
- `normalizeItemData(numistaData: Object)`: Normalizes the raw Numista API response data to a standardized format.
- `normalizeMetal(composition: string)`: Normalizes the metal composition information from Numista.
- `normalizeType(type: string)`: Normalizes the item type information from Numista.

### rSynkProvider

## Placeholder Implementation of CatalogProvider

```typescript
class rSynkProvider extends CatalogProvider {
  constructor(apiKey: string) {
    super({
      name: 'rSynk',
      apiKey: apiKey,
      baseUrl: 'https://api.rsynk.com/v1',
      rateLimit: 120,
      timeout: 10000
    });
  }

  async lookupItem(catalogId: string): Promise<Object> {
    throw new Error('rSynk provider not yet implemented');
  }

  async searchItems(query: string, filters?: Object): Promise<Array<Object>> {
    throw new Error('rSynk provider not yet implemented');
  }

  async getMarketValue(catalogId: string): Promise<number> {
    throw new Error('rSynk provider not yet implemented');
  }
}
```

The `rSynkProvider` class is a placeholder implementation of the `CatalogProvider` interface, designed for future integration with the rSynk API. Currently, all its methods throw an error indicating that the provider is not yet implemented.

### LocalProvider

## Fallback Implementation of CatalogProvider

```typescript
class LocalProvider extends CatalogProvider {
  private localData: Object;

  constructor() {
    super({
      name: 'Local',
      rateLimit: 1000,
      timeout: 1000
    });
    this.localData = this.loadLocalData();
  }

  loadLocalData(): Object { /* implementation */ }
  async lookupItem(catalogId: string): Promise<Object> { /* implementation */ }
  async searchItems(query: string, filters?: Object): Promise<Array<Object>> { /* implementation */ }
  async getMarketValue(catalogId: string): Promise<number> { /* implementation */ }
  cacheItem(catalogId: string, itemData: Object): void { /* implementation */ }
}
```

The `LocalProvider` class is a fallback implementation of the `CatalogProvider` interface that uses a local data cache stored in the browser's localStorage. It includes the following methods:

- `loadLocalData()`: Loads the cached catalog data from localStorage.
- `lookupItem(catalogId: string)`: Retrieves a catalog item from the local data cache.
- `searchItems(query: string, filters?: Object)`: Searches the local data cache for matching catalog items.
- `getMarketValue(catalogId: string)`: Retrieves the market value for a catalog item from the local data cache.
- `cacheItem(catalogId: string, itemData: Object)`: Caches a catalog item in the local data store.

### CatalogAPI

## Main Catalog API Manager

```typescript
class CatalogAPI {
  private providers: Array<CatalogProvider>;
  private localProvider: LocalProvider;
  private activeProvider: CatalogProvider | null;
  private settings: { 
    activeProvider: string;
    numistaApiKey: string;
    rsynkApiKey: string;
    enableFallback: boolean;
    cacheDuration: number;
  };

  constructor() { /* implementation */ }
  loadSettings(): { /* implementation */ }
  saveSettings(): void { /* implementation */ }
  initializeProviders(): void { /* implementation */ }
  setApiKey(provider: string, apiKey: string): void { /* implementation */ }
  switchProvider(providerName: string): void { /* implementation */ }
  async lookupItem(catalogId: string): Promise<Object> { /* implementation */ }
  async searchItems(query: string, filters?: Object): Promise<Array<Object>> { /* implementation */ }
  async getMarketValue(catalogId: string): Promise<number> { /* implementation */ }
}
```

The `CatalogAPI` class is the main entry point for the catalog management system. It coordinates the different `CatalogProvider` implementations, manages the active provider, and handles the fallback chain. It includes the following methods:

- `loadSettings()`: Loads the catalog API settings from localStorage.
- `saveSettings()`: Saves the catalog API settings to localStorage.
- `initializeProviders()`: Initializes the available catalog providers based on the configured API keys.
- `setApiKey(provider: string, apiKey: string)`: Sets the API key for a specific provider.
- `switchProvider(providerName: string)`: Switches the active catalog provider.
- `lookupItem(catalogId: string)`: Looks up a catalog item, using the fallback chain if necessary.
- `searchItems(query: string, filters?: Object)`: Searches for catalog items using the active provider.
- `getMarketValue(catalogId: string)`: Retrieves the current market value for a catalog item, using the fallback chain if necessary.

## Usage Examples

### Lookup a Catalog Item

```javascript
const catalogApi = new CatalogAPI();
const item = await catalogApi.lookupItem('123456');
console.log(item);
```

### Search for Catalog Items

```javascript
const catalogApi = new CatalogAPI();
const results = await catalogApi.searchItems('gold coin', { country: 'US', year: 2020 });
console.log(results);
```

### Get Market Value for a Catalog Item

```javascript
const catalogApi = new CatalogAPI();
const marketValue = await catalogApi.getMarketValue('123456');
console.log(`Market value: $${marketValue.toFixed(2)}`);
```

### Switch Catalog Provider

```javascript
const catalogApi = new CatalogAPI();
catalogApi.switchProvider('rsynk');
```

## Configuration

The `CatalogAPI` class manages the following configuration settings, which are stored in the browser's localStorage:

| Setting | Description |
| --- | --- |
| `activeProvider` | The name of the currently active catalog provider |
| `numistaApiKey` | The API key for the Numista provider |
| `rsynkApiKey` | The API key for the rSynk provider |
| `enableFallback` | Determines whether to use the fallback chain when the active provider fails |
| `cacheDuration` | The duration (in milliseconds) for which successful API responses are cached locally |

These settings can be accessed and modified using the `setApiKey()` and `switchProvider()` methods of the `CatalogAPI` class.

## Error Handling

The `catalog-api.js` script handles errors in the following ways:

1. **API Errors**: If an external catalog provider fails to respond or returns an error, the script will log the error and throw a new error with a more user-friendly message.
2. **Local Cache Errors**: If there are any issues with loading or saving the local data cache, the script will log a warning but continue to function using the available providers.
3. **Configuration Errors**: If there are any issues with loading or saving the configuration settings, the script will log a warning and use default settings.

In all cases, the script aims to provide a seamless experience for the user, with appropriate error handling and fallback mechanisms to ensure reliable performance.

## Integration

The `catalog-api.js` script is designed to be a central component of the StackRTrackr application, providing a standardized interface for working with catalog data. It can be integrated into other parts of the application, such as the user interface, data processing, and storage modules, to provide a consistent and reliable catalog management system.

## Development Notes

1. **Extensibility**: The `CatalogProvider` interface is designed to be easily extensible, allowing for the addition of new data providers in the future (e.g., rSynk) without requiring significant changes to the existing codebase.
2. **Caching**: The local data cache implemented in the `LocalProvider` class is crucial for improving performance and providing a seamless user experience, even when external APIs are unavailable.
3. **Fallback Chain**: The fallback chain mechanism in the `CatalogAPI` class ensures that the application can continue to function even if the primary data provider fails, providing a robust and reliable user experience.
4. **Configuration Management**: The use of localStorage for storing configuration settings allows the application to maintain user preferences across sessions and devices.
5. **Error Handling**: The script's error handling mechanisms, including logging and user-friendly error messages, help to provide a polished and professional user experience.

Overall, the `catalog-api.js` script is a well-designed and extensible component that serves as the foundation for the catalog management system in the StackRTrackr application.
