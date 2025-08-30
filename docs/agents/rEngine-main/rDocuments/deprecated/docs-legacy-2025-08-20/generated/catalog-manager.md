# rEngine Core: Catalog Manager Documentation

## Purpose & Overview

The `catalog-manager.js` file is a part of the rEngine Core ecosystem and provides a robust implementation for managing the mapping between item serial numbers and their corresponding catalog IDs. This file replaces the basic `catalogMap` object with a comprehensive `CatalogManager` class, which offers improved data integrity, validation, and future extensibility.

The `CatalogManager` class is responsible for:

- Synchronizing catalog ID mappings with inventory items
- Optimizing storage by deduplicating identical mappings
- Providing a provider-agnostic architecture for supporting multiple catalog providers (e.g., Numista)
- Maintaining backward compatibility with existing data

By using the `CatalogManager`, rEngine Core applications can efficiently manage the relationship between inventory items and their corresponding catalog entries, ensuring data consistency and reducing the footprint in local storage.

## Key Functions/Classes

### `CatalogManager` Class

The `CatalogManager` class is the main component of this file and provides the following key functions:

1. **`removeOrphanedMappings(currentInventory)`**: Removes mappings for serials that no longer exist in the current inventory.
2. **`deduplicateMappings()`**: Deduplicates identical provider mappings across serials.
3. **`getStorageStats()`**: Returns basic storage statistics for the catalog mapping data.
4. **`validateCatalogId(catalogId, provider)`**: Validates the format of a catalog ID based on the specified provider.
5. **`getCatalogId(serial, provider)`**: Retrieves the catalog ID for a given item serial.
6. **`setCatalogId(serial, catalogId, provider)`**: Sets the catalog ID for a given item serial.
7. **`getSerialsByCatalogId(catalogId, provider)`**: Retrieves the item serials associated with a given catalog ID.
8. **`syncItem(item)`**: Synchronizes a single inventory item with the catalog mapping.
9. **`syncInventory(items)`**: Synchronizes all inventory items with the catalog mappings.
10. **`cleanupOrphans(inventory)`**: Removes orphaned mappings that don't correspond to the current inventory items.
11. **`exportMappings()`**: Generates a serialized export of all catalog mappings for backup purposes.
12. **`importMappings(mappings, merge)`**: Imports catalog mappings from a backup.
13. **`getStats()`**: Retrieves summary statistics about the catalog mappings.

### Global Instance

The file also initializes a global `catalogManager` instance of the `CatalogManager` class, which is made accessible through the `window.catalogManager` object. This global instance can be used throughout the rEngine Core application.

## Dependencies

The `catalog-manager.js` file has the following dependencies:

1. **`loadDataSync`** and **`saveData`** functions: These are likely utility functions that handle the synchronous loading and saving of data in local storage. The file assumes these functions are available in the global scope.
2. **`CATALOG_MAP_KEY`** and **`DEBUG`** constants: These are assumed to be defined in the global scope and used for the `CatalogManager` configuration.
3. **`window.inventory`**: The `CatalogManager` class expects the current inventory to be available in the global `window.inventory` object.
4. **`updateStorageStats`**: This is an optional function that is called as a callback when the catalog mappings are saved. It is assumed to be available in the global scope.

## Usage Examples

To use the `CatalogManager` in your rEngine Core application, you can follow these examples:

```javascript
// Get the global CatalogManager instance
const catalogManager = window.catalogManager;

// Get the catalog ID for an item serial
const catalogId = catalogManager.getCatalogId(item.serial);

// Set the catalog ID for an item serial
catalogManager.setCatalogId(item.serial, '123456');

// Synchronize an inventory item with the catalog mapping
const updatedItem = catalogManager.syncItem(item);

// Synchronize the entire inventory with catalog mappings
const syncedInventory = catalogManager.syncInventory(inventory);

// Remove orphaned mappings
const orphansRemoved = catalogManager.cleanupOrphans(inventory);

// Export catalog mappings for backup
const backupData = catalogManager.exportMappings();

// Import catalog mappings from a backup
catalogManager.importMappings(backupData);

// Get storage statistics
const stats = catalogManager.getStorageStats();
```

## Configuration

The `CatalogManager` class can be configured using the following options in the constructor:

- `storageKey`: The key used to store the catalog mappings in local storage (default: `CATALOG_MAP_KEY`).
- `saveCallback`: An optional callback function that is called when the catalog mappings are saved.
- `debug`: A boolean flag to enable debug logging (default: `DEBUG`).

```javascript
// Example configuration
const catalogManager = new CatalogManager({
  storageKey: 'my-custom-catalog-key',
  saveCallback: () => {
    // Custom save callback logic
  },
  debug: true
});
```

## Integration Points

The `catalog-manager.js` file is a core component of the rEngine Core ecosystem and integrates with various other parts of the system:

1. **Inventory Management**: The `CatalogManager` class relies on the availability of the current inventory, which is expected to be stored in the global `window.inventory` object.
2. **Storage Optimization**: The `CatalogManager` class optimizes the storage footprint by deduplicating identical mappings and removing orphaned entries.
3. **Catalog Provider Support**: The `CatalogManager` class is designed to be provider-agnostic, allowing for the future integration of additional catalog providers beyond the current Numista support.
4. **Backward Compatibility**: The `CatalogManager` class maintains backward compatibility with existing catalog mapping data, ensuring a smooth transition for existing rEngine Core applications.
5. **Global Accessibility**: The `CatalogManager` instance is made available globally through the `window.catalogManager` object, allowing easy access and integration throughout the rEngine Core application.

## Troubleshooting

Here are some common issues and solutions related to the `catalog-manager.js` file:

### Inventory Items Not Synchronizing Correctly

If inventory items are not properly synchronizing with the catalog mappings, check the following:

1. Ensure the `window.inventory` object is correctly populated and accessible.
2. Verify that the `item.serial` and `item.numistaId` properties are correctly set on the inventory items.
3. Check for any custom code that may be interfering with the `CatalogManager.syncItem()` and `CatalogManager.syncInventory()` functions.

### Catalog Mapping Data Not Saving/Loading Correctly

If the catalog mapping data is not being saved or loaded correctly, check the following:

1. Ensure the `loadDataSync()` and `saveData()` functions are correctly implemented and accessible.
2. Verify that the `CATALOG_MAP_KEY` constant is correctly defined and matches the local storage key used.
3. Check for any errors or issues reported in the browser console when saving or loading the catalog mapping data.

### Catalog ID Validation Issues

If you encounter problems with the validation of catalog IDs, check the following:

1. Ensure the `validateCatalogId()` function is correctly implemented and covers the expected format for the supported catalog providers.
2. If you need to support additional catalog providers, extend the `validateCatalogId()` function to handle the new provider's catalog ID format.

By addressing these common issues, you can ensure the smooth integration and operation of the `catalog-manager.js` file within the rEngine Core ecosystem.
