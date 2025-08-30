# rEngine Core: Catalog Providers

## Purpose & Overview

The `catalog-providers.js` file in the `StackTrackr` project of the rEngine Core ecosystem provides an implementation of the `CatalogProvider` base class, which is defined in the `catalog-api.js` file. This file focuses on the `NumistaCatalogProvider` class, which is responsible for interacting with the Numista API to fetch and display information about numismatic items (such as coins and banknotes).

The `CatalogProviders` module acts as a central registry for all available catalog providers, allowing the rEngine Core platform to easily access and utilize different data sources for its catalog functionality.

## Key Functions/Classes

### `NumistaCatalogProvider` Class

The `NumistaCatalogProvider` class is a concrete implementation of the `CatalogProvider` base class, which provides the following functionality:

1. **Constructor**: Initializes the provider with the name "Numista" and the key "numista".
2. **`normalizeId(id)`**: Removes the "N#" prefix from the provided ID, if present, and returns the normalized ID.
3. **`buildLink(id)`**: Constructs a URL link to the Numista website for the given item ID.
4. **`isValid(id)`**: Checks if the provided ID is a valid Numista item ID.

### `CatalogProviders` Module

The `CatalogProviders` module is a self-executing function that provides the following functionality:

1. **`register(p)`**: Registers a new catalog provider in the internal provider map, using the provider's key or name as the lookup key.
2. **`get(key)`**: Retrieves a catalog provider from the internal map, using the provided key. If the key is not found, it defaults to the "numista" provider.
3. **`list()`**: Returns an array of all registered catalog providers.

The module also registers the `NumistaCatalogProvider` instance upon initialization.

## Dependencies

The `catalog-providers.js` file depends on the `catalog-api.js` file, which defines the `CatalogProvider` base class and other related functionality.

## Usage Examples

To use the `NumistaCatalogProvider` and the `CatalogProviders` module, you can follow these examples:

```javascript
// Retrieving the Numista catalog provider
const numistaProv = CatalogProviders.get('numista');

// Checking the validity of a Numista item ID
const isValid = numistaProv.isValid('N#1234');
console.log(isValid); // true

// Building a link to the Numista website for an item
const link = numistaProv.buildLink('N#1234');
console.log(link); // https://en.numista.com/catalogue/pieces1234.html

// Registering a new catalog provider
class MyCatalogProvider extends CatalogProvider {
  constructor() {
    super({ name: 'My Catalog', key: 'mycatalog' });
  }
  // Implement required methods...
}
CatalogProviders.register(new MyCatalogProvider());
```

## Configuration

The `catalog-providers.js` file does not require any specific configuration. The `CatalogProviders` module is designed to be self-contained and easily extensible by registering new catalog providers as needed.

## Integration Points

The `catalog-providers.js` file is part of the `StackTrackr` project within the rEngine Core ecosystem. It integrates with the `catalog-api.js` file, which defines the base `CatalogProvider` class and other related functionality.

The `CatalogProviders` module can be used by other components within the rEngine Core platform to access and utilize different catalog data sources, such as the Numista API.

## Troubleshooting

There are no known common issues with the `catalog-providers.js` file. However, if you encounter any problems with the `NumistaCatalogProvider` or the `CatalogProviders` module, you can check the following:

1. **Ensure the `catalog-api.js` file is correctly included and loaded**: The `NumistaCatalogProvider` class depends on the `CatalogProvider` base class, which is defined in the `catalog-api.js` file.
2. **Verify the Numista API availability and credentials**: If the Numista API becomes unavailable or your credentials are invalid, the `NumistaCatalogProvider` may not function correctly.
3. **Check the validity of the provided item IDs**: The `isValid()` method of the `NumistaCatalogProvider` class checks the format of the provided item IDs. Ensure that the IDs you're using match the expected format.

If you continue to experience issues, please consult the rEngine Core documentation or reach out to the development team for further assistance.
