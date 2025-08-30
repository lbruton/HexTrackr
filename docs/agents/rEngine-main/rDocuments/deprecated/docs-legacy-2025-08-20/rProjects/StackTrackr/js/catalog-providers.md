# Catalog Providers Documentation

## Purpose & Overview

The `catalog-providers.js` script defines a set of classes and utilities for interacting with various coin and currency data catalogs. It serves as a foundation for the "Phase 1D" of the application and provides a consistent interface for accessing catalog data from different sources.

The primary component is the `NumistaCatalogProvider` class, which extends the base `CatalogProvider` class (defined elsewhere in the codebase). This class encapsulates the logic for interacting with the Numista online catalog, including normalizing identifier formats, building links to catalog entries, and validating identifiers.

The `CatalogProviders` module acts as a registry and utility for managing the available catalog providers. It allows you to register new providers, retrieve a specific provider by key, and list all registered providers.

## Technical Architecture

The `catalog-providers.js` script consists of the following key components:

1. **NumistaCatalogProvider Class**: This class extends the `CatalogProvider` base class and implements the necessary methods for interacting with the Numista catalog. It handles identifier normalization, link generation, and validity checking.

1. **CatalogProviders Module**: This module acts as a singleton registry for managing the available catalog providers. It provides three main functions:
   - `register(p)`: Registers a new catalog provider instance.
   - `get(key)`: Retrieves a catalog provider instance by its key (or the "numista" provider by default).
   - `list()`: Returns an array of all registered catalog provider instances.

The data flow within this script is as follows:

1. The `NumistaCatalogProvider` class is defined, which extends the `CatalogProvider` base class.
2. The `CatalogProviders` module is immediately invoked, creating a private `map` object to store the registered providers.
3. The `register()` function is defined within the `CatalogProviders` module, allowing new providers to be registered.
4. The `NumistaCatalogProvider` instance is immediately registered with the `CatalogProviders` module.
5. The `CatalogProviders` module exposes the `register()`, `get()`, and `list()` functions as its public API.
6. If the script is running in a browser environment, the `NumistaCatalogProvider` and `CatalogProviders` are attached to the global `window` object.

## Dependencies

This script has the following dependencies:

- `CatalogProvider` class (defined in `catalog-api.js`)

## Key Functions/Classes

### NumistaCatalogProvider Class

**Constructor**:

```typescript
constructor()
```

Creates a new instance of the `NumistaCatalogProvider` class, which extends the `CatalogProvider` base class. The constructor calls the parent constructor with an object containing the provider's name and key.

**normalizeId(id)**:

```typescript
normalizeId(id: string): string
```

Normalizes the provided `id` by trimming whitespace and removing any leading "N#" prefix (case-insensitive). This ensures a consistent format for the catalog identifier.

**buildLink(id)**:

```typescript
buildLink(id: string): string | null
```

Builds a URL link to the Numista catalog entry for the provided `id`. If the `id` is invalid, `null` is returned.

**isValid(id)**:

```typescript
isValid(id: string): boolean
```

Checks if the provided `id` is a valid Numista catalog identifier. The identifier must match the pattern `^N?#?\d+$/i` (optionally starting with "N#") or simply `^\d+$`.

### CatalogProviders Module

**register(p)**:

```typescript
register(p: CatalogProvider): void
```

Registers a new catalog provider instance in the `CatalogProviders` module.

**get(key)**:

```typescript
get(key: string): CatalogProvider
```

Retrieves a catalog provider instance by its `key` (or the "numista" provider by default if the key is not found).

**list()**:

```typescript
list(): CatalogProvider[]
```

Returns an array of all registered catalog provider instances.

## Usage Examples

### Retrieving a Catalog Provider

```javascript
// Get the "numista" provider
const numista = CatalogProviders.get('numista');

// Get a different provider by key
const myProvider = CatalogProviders.get('my-custom-provider');
```

### Checking Identifier Validity

```javascript
const numista = CatalogProviders.get('numista');

// Check if an ID is valid
console.log(numista.isValid('N#12345')); // true
console.log(numista.isValid('12345')); // true
console.log(numista.isValid('abc')); // false
```

### Building a Catalog Entry Link

```javascript
const numista = CatalogProviders.get('numista');

// Build a link to a catalog entry
const link = numista.buildLink('N#12345');
console.log(link); // https://en.numista.com/catalogue/pieces12345.html
```

## Configuration

This script does not require any specific configuration options or environment variables.

## Error Handling

The `NumistaCatalogProvider` class does not explicitly handle any errors. If an invalid identifier is provided to the `buildLink()` method, it will return `null` instead of a valid URL.

## Integration

The `catalog-providers.js` script is part of the larger application infrastructure, providing a consistent interface for accessing catalog data from different sources. It is likely used in conjunction with other components, such as the `CatalogApi` class (defined in `catalog-api.js`), to facilitate the retrieval and display of catalog information.

## Development Notes

- The `NumistaCatalogProvider` class is the only concrete implementation of a `CatalogProvider` in this script. Additional catalog providers can be added by creating new classes that extend the `CatalogProvider` base class and registering them with the `CatalogProviders` module.
- The `CatalogProviders` module uses a private `map` object to store the registered providers, ensuring a singleton-like behavior and allowing for easy retrieval and listing of the available providers.
- The script is designed to be compatible with both server-side (Node.js) and client-side (browser) environments. In the browser, the `NumistaCatalogProvider` and `CatalogProviders` are exposed on the global `window` object.
