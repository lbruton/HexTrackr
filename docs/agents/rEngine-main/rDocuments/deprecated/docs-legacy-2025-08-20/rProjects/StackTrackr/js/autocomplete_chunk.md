# Autocomplete.js Documentation

## Purpose & Overview

The `autocomplete.js` script is a comprehensive utility for managing an autocomplete system within a precious metals inventory management application. It provides functions to generate, load, and refresh a lookup table that powers the autocomplete functionality. The lookup table includes data such as item names, purchase locations, storage locations, and item types, as well as pre-built industry data and search indices for efficient autocomplete suggestions.

## Technical Architecture

The script is organized into several key components:

1. **Lookup Table Generation**: The `generateLookupTable` function extracts unique values from the provided inventory data and combines them with pre-built industry data to create a comprehensive lookup table. It also supports optional configuration to include metal abbreviations and build search indices.

1. **Lookup Table Loading and Caching**: The `loadLookupTable` function checks for a cached lookup table and uses it if available, otherwise it generates a new one. The `cacheLookupTable` and `getCachedLookupTable` functions handle the caching process, storing and retrieving the lookup table from the browser's localStorage.

1. **Search Indices**: The `buildSearchIndices` function creates search indices for efficient autocomplete suggestions, indexing the lookup table data by name, location, and type variants.

1. **Utility Functions**: The script includes several utility functions, such as `extractUniqueValues`, `generateVariations`, and `normalizeItemName`, which are used throughout the main functionality.

1. **Configuration and State Management**: The script exposes a global `autocomplete` object that contains the core functions, utility functions, configuration options, and access to the current lookup table state.

## Dependencies

The `autocomplete.js` script does not have any external dependencies. It is a self-contained module that can be used independently within a larger application.

## Key Functions and Classes

### `generateLookupTable(inventory, options)`

- **Purpose**: Generates a comprehensive lookup table from the provided inventory data, optionally including pre-built industry data.
- **Parameters**:
  - `inventory` (optional): An array of inventory items.
  - `options` (optional): An object with the following properties:
    - `includeAbbreviations` (boolean, default: `true`): Include metal abbreviations in the lookup table.
    - `buildIndices` (boolean, default: `true`): Build search indices for the lookup table.
    - `usePrebuiltData` (boolean, default: `true`): Include pre-built industry data in the lookup table.
- **Return Value**: A `LookupTable` object containing the generated lookup table data.

### `loadLookupTable(inventory, forceRefresh)`

- **Purpose**: Loads the lookup table from the cache or generates a new one if the cache is invalid or `forceRefresh` is `true`.
- **Parameters**:
  - `inventory` (optional): An array of inventory items.
  - `forceRefresh` (boolean, default: `false`): Force the generation of a new lookup table, ignoring the cache.
- **Return Value**: A `LookupTable` object containing the loaded or generated lookup table data.

### `refreshLookupTable(inventory)`

- **Purpose**: Clears the lookup table cache and generates a new lookup table from the provided inventory data.
- **Parameters**:
  - `inventory` (optional): An array of inventory items.
- **Return Value**: A `LookupTable` object containing the refreshed lookup table data.

### `initializeAutocomplete(inventory)`

- **Purpose**: Initializes the autocomplete system by loading or generating the lookup table.
- **Parameters**:
  - `inventory` (optional): An array of inventory items.
- **Return Value**: A `LookupTable` object containing the initialized lookup table data.

### `LookupTable` (Object)

The `LookupTable` object has the following properties:

- `names`: An array of unique item names.
- `purchaseLocations`: An array of unique purchase locations.
- `storageLocations`: An array of unique storage locations.
- `types`: An array of unique item types.
- `abbreviations`: An object containing metal abbreviations.
- `lastUpdated`: The timestamp of the last lookup table update.
- `itemCount`: The total number of inventory items.
- `prebuiltItemCount`: The number of pre-built items in the lookup table.
- `searchIndices`: An object containing search indices for efficient autocomplete suggestions.

## Usage Examples

1. **Initialize the Autocomplete System**:

```javascript
const inventory = [
  { name: 'Gold Coin', purchase_location: 'APMEX', storage_location: 'Home Safe', type: 'Coin' },
  { name: 'Silver Bar', purchase_location: 'JM Bullion', storage_location: 'Bank Vault', type: 'Bar' },
  // ... more inventory items
];

const lookupTable = initializeAutocomplete(inventory);
```

1. **Refresh the Lookup Table**:

```javascript
const updatedInventory = [
  // ... updated inventory data
];

const refreshedLookupTable = refreshLookupTable(updatedInventory);
```

1. **Access Lookup Table Statistics**:

```javascript
const stats = getLookupStats();
console.log(stats);
```

## Configuration

The `autocomplete.js` script uses the following configuration options, exposed through the `AUTOCOMPLETE_CONFIG` object:

- `cacheKey`: The key used to store the cached lookup table in localStorage.
- `timestampKey`: The key used to store the timestamp of the cached lookup table in localStorage.
- `cacheTTL`: The time-to-live (in milliseconds) for the cached lookup table.

## Error Handling

The `autocomplete.js` script uses `try-catch` blocks to handle errors that may occur during the various operations, such as lookup table generation, caching, and retrieval. Any errors are logged to the console using `console.error`.

## Integration

The `autocomplete.js` script is designed to be a standalone utility that can be integrated into a larger application. It exposes its functionality through a global `autocomplete` object, which can be accessed and used by other parts of the application.

## Development Notes

- The script uses localStorage to cache the lookup table, which may not be suitable for all use cases (e.g., server-side rendering). In such cases, the caching mechanism may need to be modified to use a different storage solution.
- The pre-built industry data (e.g., common purchase locations, storage locations, and item types) can be expanded or customized to better fit the specific requirements of the application.
- The search indices implementation can be further optimized for performance, depending on the size and complexity of the inventory data.
- The script assumes that the inventory data is an array of objects with specific properties (e.g., `name`, `purchase_location`, `storage_location`, `type`). If the inventory data has a different structure, the script may need to be modified accordingly.
