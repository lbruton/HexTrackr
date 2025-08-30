# Catalog Manager

## Purpose & Overview

The `CatalogManager` class is responsible for managing the mapping between item serials and catalog IDs, specifically for the Numista catalog. This is an enhanced implementation that replaces the basic `catalogMap` object with a robust class that provides better data integrity, validation, and future extensibility.

The key features of the `CatalogManager` include:

- Data validation and integrity checking
- Synchronization between `item.numistaId` and mapping data
- Storage optimization to reduce the localStorage footprint
- Provider-agnostic architecture for future catalog support
- Full backward compatibility with existing data

## Technical Architecture

The `CatalogManager` class has the following key components:

1. **Configuration**: The constructor takes an options object that allows setting the storage key, a save callback, and debug mode.
2. **Data Storage**: The mapping data is stored in the `_mappings` object, which is loaded from and saved to localStorage.
3. **Provider Management**: The `_providers` object allows for future support of multiple catalog providers, with the current implementation focused on Numista.
4. **Mapping Management**: The class provides methods for managing the mapping data, including setting, getting, and synchronizing catalog IDs with inventory items.
5. **Utility Methods**: The class includes utility methods for removing orphaned mappings, deduplicating mappings, and getting storage statistics.

The data flow in the `CatalogManager` is as follows:

1. On initialization, the `_load()` method retrieves the mapping data from localStorage and initializes the `_mappings` object.
2. When a catalog ID is set or updated, the `setCatalogId()` method is called, which validates the input and updates the `_mappings` object.
3. The `_save()` method is called after any changes to the `_mappings` object, which persists the data to localStorage.
4. The `syncItem()` and `syncInventory()` methods ensure that the `_mappings` object is synchronized with the `item.numistaId` values in the inventory.
5. The `removeOrphanedMappings()` and `cleanupOrphans()` methods remove mappings that no longer correspond to inventory items.

## Dependencies

The `CatalogManager` class has the following external dependencies:

1. `loadDataSync()` and `saveData()` functions for loading and saving data to/from localStorage.
2. The `window.inventory` array, which contains the current inventory items.
3. The `updateStorageStats()` function, which is called as a save callback to update storage statistics.

## Key Functions/Classes

### `CatalogManager` Class

The `CatalogManager` class provides the following key functions:

#### Constructor

```javascript
constructor(options = {})
```

- **Parameters**:
  - `options` (Object): Configuration options, including `storageKey`, `saveCallback`, and `debug`.
- **Returns**: A new instance of the `CatalogManager` class.

#### `removeOrphanedMappings(currentInventory = null)`

- **Parameters**:
  - `currentInventory` (Array): An array of current inventory items. If not provided, it will use the global `window.inventory`.
- **Returns**: The number of mappings removed.

#### `deduplicateMappings()`

- **Parameters**: None.
- **Returns**: The number of entries simplified (kept first occurrence).

#### `getStorageStats()`

- **Parameters**: None.
- **Returns**: An object with storage statistics, including the storage key, size in bytes and kilobytes, and the number of entries.

#### `validateCatalogId(catalogId, provider = 'numista')`

- **Parameters**:
  - `catalogId` (string): The catalog ID to validate.
  - `provider` (string): The provider key (default is 'numista').
- **Returns**: `true` if the catalog ID is valid, `false` otherwise.

#### `getCatalogId(serial, provider = 'numista')`

- **Parameters**:
  - `serial` (number|string): The item serial number.
  - `provider` (string): The provider key (default is 'numista').
- **Returns**: The catalog ID associated with the given serial, or `null` if not found.

#### `setCatalogId(serial, catalogId, provider = 'numista')`

- **Parameters**:
  - `serial` (number|string): The item serial number.
  - `catalogId` (string): The catalog ID to set.
  - `provider` (string): The provider key (default is 'numista').
- **Returns**: `true` if the operation was successful, `false` otherwise.

#### `getSerialsByCatalogId(catalogId, provider = 'numista')`

- **Parameters**:
  - `catalogId` (string): The catalog ID to look up.
  - `provider` (string): The provider key (default is 'numista').
- **Returns**: An array of serials associated with the given catalog ID.

#### `syncItem(item)`

- **Parameters**:
  - `item` (Object): The inventory item to synchronize.
- **Returns**: The updated inventory item.

#### `syncInventory(items)`

- **Parameters**:
  - `items` (Array): An array of inventory items to synchronize.
- **Returns**: The updated array of inventory items.

#### `cleanupOrphans(inventory)`

- **Parameters**:
  - `inventory` (Array): The current inventory items.
- **Returns**: The number of orphaned mappings removed.

#### `exportMappings()`

- **Parameters**: None.
- **Returns**: An object containing the serialized export of all mappings.

#### `importMappings(mappings, merge = false)`

- **Parameters**:
  - `mappings` (Object): The mappings data to import.
  - `merge` (boolean): If `true`, merge the new mappings with the existing ones, otherwise replace them.
- **Returns**: The number of mappings imported.

#### `getStats()`

- **Parameters**: None.
- **Returns**: An object with summary statistics about the mappings, including the total number of mappings, the counts by provider, and the storage size.

## Usage Examples

Here are some examples of how to use the `CatalogManager` class:

```javascript
// Initialize the CatalogManager
const catalogManager = new CatalogManager({
  storageKey: CATALOG_MAP_KEY,
  debug: DEBUG,
  saveCallback: () => {
    updateStorageStats();
  }
});

// Set a catalog ID for an item
catalogManager.setCatalogId(12345, 'n123456');

// Get the catalog ID for an item
const catalogId = catalogManager.getCatalogId(12345);

// Sync an inventory item with the catalog mapping
const updatedItem = catalogManager.syncItem(inventoryItem);

// Sync the entire inventory with the catalog mappings
const updatedInventory = catalogManager.syncInventory(inventory);

// Clean up orphaned mappings
const orphansRemoved = catalogManager.cleanupOrphans(inventory);

// Get storage statistics
const stats = catalogManager.getStorageStats();
```

## Configuration

The `CatalogManager` class can be configured using the following options:

| Option | Type | Description |
| --- | --- | --- |
| `storageKey` | `string` | The localStorage key used to store the catalog mappings. Default is `CATALOG_MAP_KEY`. |
| `saveCallback` | `Function` | An optional callback function that is called whenever the mapping data is saved to localStorage. |
| `debug` | `boolean` | Enables debug logging if set to `true`. Default is `DEBUG`. |

## Error Handling

The `CatalogManager` class handles errors that may occur during the following operations:

- Loading data from localStorage (`_load()`)
- Saving data to localStorage (`_save()`)
- Removing orphaned mappings (`removeOrphanedMappings()`)
- Deduplicating mappings (`deduplicateMappings()`)
- Getting storage statistics (`getStorageStats()`)

In case of an error, the class logs a warning message to the console and falls back to a default state (e.g., an empty `_mappings` object).

## Integration

The `CatalogManager` class is designed to be a self-contained module that can be easily integrated into a larger system. It provides a clean, structured API for managing catalog mappings, which can be used throughout the application as needed.

The class is initialized with a global instance (`window.catalogManager`) that can be accessed and used by other parts of the application. The `syncItem()` and `syncInventory()` methods are particularly useful for ensuring that the catalog mappings are kept in sync with the inventory data.

## Development Notes

- The `CatalogManager` class is designed to be provider-agnostic, allowing for future support of multiple catalog providers. The current implementation is focused on the Numista provider, but the architecture allows for easy expansion to other providers.
- The class maintains backward compatibility with the legacy `catalogMap` data format, ensuring a smooth transition for existing applications.
- The storage optimization techniques, such as deduplicating mappings and removing orphaned entries, help to reduce the localStorage footprint and improve performance.
- The class includes comprehensive error handling and logging to aid in debugging and troubleshooting.
- The documentation focuses on providing clear, practical information to help developers understand and use the `CatalogManager` class effectively.
