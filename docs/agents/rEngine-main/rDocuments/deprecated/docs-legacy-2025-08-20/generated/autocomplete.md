# rEngine Core Autocomplete Module

## Purpose & Overview

The `autocomplete.js` file is a core component of the rEngine Core platform, providing a powerful autocomplete system for the StackTrackr application. This module is responsible for generating and managing a comprehensive lookup table of inventory items, purchase locations, storage locations, and item types. It leverages this lookup data to provide intelligent and fuzzy search suggestions, enhancing the user experience during data entry and lookup.

The autocomplete system is designed to be highly customizable and performant, with features like caching, configurable options, and pre-built industry data to improve the initial load time and accuracy of suggestions.

## Key Functions/Classes

### `AUTOCOMPLETE_CONFIG`

This object defines the configuration options for the autocomplete system, including the maximum number of suggestions, minimum characters before showing suggestions, fuzzy match threshold, cache TTL, and cache storage keys.

### `LookupTable`

The `LookupTable` type represents the data structure used to store the autocomplete lookup data. It includes fields for unique item names, purchase locations, storage locations, item types, abbreviations, and metadata like the last update timestamp and total item count.

### `generateLookupTable(inventory, options)`

This function generates a new lookup table from the provided inventory data, optionally including pre-built industry data and building search indices for faster lookups.

### `loadLookupTable(inventory, forceRefresh)`

This function loads the lookup table, either from the cache or by generating a new one. It handles caching and expiration of the lookup table data.

### `refreshLookupTable(inventory)`

This function clears the cached lookup table and generates a new one, forcing a refresh of the data.

### `initializeAutocomplete(inventory)`

This function is the entry point for initializing the autocomplete system. It loads or generates the lookup table and logs initialization statistics.

### `extractUniqueValues(inventory, field, options)`

This utility function extracts unique values from the inventory data for a specific field, with options to include empty values and preserve case.

### `generateVariations(term)`

This function generates searchable variations of a given term, including abbreviations, partial matches, and individual word combinations.

### `buildSearchIndices(lookupTable)`

This function enhances the lookup table by building search indices for the names, locations, and types, making lookups more efficient.

### `normalizeItemName(fullName)`

This function normalizes a full item name by removing year prefixes and matching against the pre-built lookup data to find the base name.

### `getCachedLookupTable()`, `cacheLookupTable(lookupTable)`, `clearLookupCache()`

These functions handle the caching and retrieval of the lookup table data in the browser's localStorage.

### `getLookupStats()`

This function returns the current statistics of the lookup table, including the number of entries, last update timestamp, and cache validity.

## Dependencies

The `autocomplete.js` file does not have any external dependencies. It is a self-contained module that can be used within the rEngine Core platform.

## Usage Examples

To use the autocomplete system, you can follow these steps:

1. Initialize the autocomplete system with the current inventory data:

```javascript
const inventory = [
  { name: '2023 American Silver Eagle', purchase_location: 'APMEX', storage_location: 'Home Safe', type: 'Coin' },
  // ... other inventory items
];

const lookupTable = window.autocomplete.initializeAutocomplete(inventory);
```

1. Use the generated lookup table for autocomplete suggestions:

```javascript
const searchTerm = 'american silver';
const suggestions = window.autocomplete.generateVariations(searchTerm)
  .flatMap(variant => {
    const nameMatches = lookupTable.searchIndices.nameVariants.get(variant) || [];
    const locationMatches = lookupTable.searchIndices.locationVariants.get(variant) || [];
    const typeMatches = lookupTable.searchIndices.typeVariants.get(variant) || [];
    return [...new Set([...nameMatches, ...locationMatches, ...typeMatches])];
  })
  .slice(0, AUTOCOMPLETE_CONFIG.maxSuggestions);
```

1. Refresh the lookup table if the inventory data changes:

```javascript
const updatedInventory = [
  // ... updated inventory items
];

const refreshedLookupTable = window.autocomplete.refreshLookupTable(updatedInventory);
```

## Configuration

The `autocomplete.js` file uses the `AUTOCOMPLETE_CONFIG` object to define the configuration options for the system. These options can be modified to customize the behavior of the autocomplete features.

```javascript
const AUTOCOMPLETE_CONFIG = {
  maxSuggestions: 8,
  minCharacters: 2,
  threshold: 0.3,
  cacheTTL: 60 * 60 * 1000,
  cacheKey: 'autocomplete_lookup_cache',
  timestampKey: 'autocomplete_cache_timestamp'
};
```

## Integration Points

The `autocomplete.js` file is a core component of the rEngine Core platform and is designed to integrate seamlessly with other parts of the system, such as:

- **StackTrackr Application**: The autocomplete system is used to provide intelligent search suggestions in the StackTrackr application, enhancing the user experience.
- **Inventory Management**: The lookup table is generated from the current inventory data, ensuring that the autocomplete suggestions are up-to-date and relevant.
- **Fuzzy Search**: The `autocomplete.js` file works in conjunction with the `fuzzy-search.js` module to provide fuzzy matching and intelligent search suggestions.

## Troubleshooting

1. **Lookup Table Not Generating**: If the lookup table is not generating correctly, check the following:
   - Ensure that the `inventory` data passed to the `initializeAutocomplete` function is an array of valid objects with the expected fields (`name`, `purchase_location`, `storage_location`, `type`).
   - Verify that the `PREBUILT_LOOKUP_DATA` array contains the expected industry-standard items. If not, you may need to update this data.

1. **Autocomplete Suggestions Not Accurate**: If the autocomplete suggestions are not meeting your expectations, try the following:
   - Adjust the `AUTOCOMPLETE_CONFIG` options, such as the `minCharacters`, `threshold`, or `maxSuggestions` values, to fine-tune the behavior.
   - Ensure that the `normalizeItemName` function is correctly handling the item naming conventions in your inventory data.
   - Check the `generateVariations` function to see if it is generating the expected search term variations.

1. **Caching Issues**: If you're experiencing problems with the caching of the lookup table:
   - Ensure that the browser's localStorage is accessible and not blocked by any privacy settings or extensions.
   - Try clearing the cache manually using the `clearLookupCache` function.
   - Verify that the cache expiration logic in the `getCachedLookupTable` function is working as expected.

1. **Performance Concerns**: If the autocomplete system is causing performance issues:
   - Optimize the inventory data structure and fields to reduce the total number of items.
   - Ensure that the `buildSearchIndices` function is efficiently creating the search indices.
   - Consider implementing server-side autocomplete suggestions to offload the processing from the client.

If you encounter any other issues or have questions, please refer to the rEngine Core documentation or reach out to the development team for assistance.
