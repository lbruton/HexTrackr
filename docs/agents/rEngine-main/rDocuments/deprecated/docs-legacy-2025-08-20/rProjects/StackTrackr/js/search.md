# Search Functionality

## Purpose & Overview

The `filterInventory()` function is responsible for filtering the inventory items based on the current search query and active column filters. It handles advanced multi-term, phrase, and series-specific logic for coins and metals, providing a powerful and flexible search capability.

## Technical Architecture

The `filterInventory()` function is the main entry point for the search functionality. It first checks if an advanced filtering system is available (`filterInventoryAdvanced()`), and if so, it delegates the filtering to that function. If the advanced filtering is not available, it falls back to the legacy filtering logic.

The legacy filtering process works as follows:

1. It applies the column filters by iterating through the `columnFilters` object and filtering the `inventory` array based on the field values.
2. If the `searchQuery` is not empty, it processes the query by:
   - Handling the "collectable" keyword separately and removing it from the query.
   - Splitting the query into comma-separated terms and handling each term individually.
   - Performing a more sophisticated search that includes:
     - Checking for exact phrase matches.
     - Ensuring all words in a multi-word search are present as word boundaries.
     - Preventing cross-metal matching for common coin series (e.g., "Silver Eagle" should not match "American Gold Eagle").
     - Handling fractional weight searches more specifically.
     - Preventing overly broad country/origin searches.

The function returns the filtered inventory items that match the search query and active filters.

## Dependencies

This script does not have any external dependencies. It relies on the following global variables:

- `inventory`: The array of inventory items to be filtered.
- `columnFilters`: An object containing the active column filters.
- `searchQuery`: The current search query.
- `currentPage`: The current page number (used for pagination).

Additionally, it uses the `debounce()` function, which is assumed to be defined elsewhere in the codebase.

## Key Functions/Classes

### `filterInventory()`

**Purpose**: Filters the inventory based on the current search query and active column filters.

**Parameters**: None

**Return Value**: `Array<Object>` - The filtered inventory items matching the search query and filters.

**Example Usage**:

```javascript
filterInventory();
```

## Usage Examples

To use the `filterInventory()` function, you can call it directly:

```javascript
const filteredItems = filterInventory();
console.log(filteredItems);
```

The function will return an array of filtered inventory items based on the current search query and active column filters.

## Configuration

This script does not have any specific configuration options or environment variables. The behavior is controlled by the global variables `inventory`, `columnFilters`, and `searchQuery`.

## Error Handling

The `filterInventory()` function does not explicitly handle any errors. It assumes that the input data (inventory, column filters, and search query) is in the expected format and structure.

## Integration

The `filterInventory()` function is a core part of the search functionality for the inventory management system. It can be used in conjunction with other components, such as the user interface, pagination, and sorting, to provide a comprehensive search experience.

## Development Notes

- The search logic implemented in this function is quite complex, handling a variety of advanced use cases and edge cases. It demonstrates a robust and flexible search capability.
- The function is designed to be efficient and performant, using techniques like word boundary matching and comma-separated term handling to optimize the search process.
- The extensive comments and code structure make the function easy to understand and maintain, even with the complex logic involved.
- The function is designed to be extensible, with the ability to leverage an advanced filtering system if available, and the ability to handle future updates to the search requirements.

Overall, this `filterInventory()` function is a well-designed and comprehensive implementation of search functionality for an inventory management system.
