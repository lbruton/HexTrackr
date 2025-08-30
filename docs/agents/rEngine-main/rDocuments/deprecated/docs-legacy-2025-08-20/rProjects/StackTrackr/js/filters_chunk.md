# Filters.js Chunk 2 Documentation

## Purpose & Overview

This script is responsible for managing the active filters and rendering the corresponding filter chips in the user interface. It provides functionality for adding, removing, and clearing filters, as well as applying advanced filtering logic to the inventory data.

The script handles the legacy column filters, as well as the more advanced filters that allow users to filter by various criteria, such as metal, type, purchase location, storage location, and collectability. It also includes a powerful text search feature that supports multi-word searches and advanced logic to handle common coin series like Eagles, Maples, Britannias, Krugerrands, Buffalos, Pandas, and Kangaroos.

## Technical Architecture

The script is structured as follows:

1. **renderActiveFilters**: This function is responsible for creating and rendering the filter chips in the user interface. It takes the active filters and the container element as input, and generates the appropriate filter chips with the correct styling, tooltips, and event handlers.

1. **filterInventoryAdvanced**: This function applies the advanced filters to the inventory data, returning the filtered result. It iterates over the active filters and applies the corresponding filtering logic for each field.

The script utilizes various helper functions, such as `simplifyChipValue`, `getTypeColor`, `getColor`, `getContrastColor`, `getPurchaseLocationColor`, `getStorageLocationColor`, and `getCompositionFirstWords`, to handle the specific logic for different filter types and ensure consistent styling and behavior.

## Dependencies

The script relies on the following imports and external dependencies:

- `inventory`: The inventory data that is being filtered.
- `activeFilters`: The object containing the currently active filters.
- `columnFilters`: The legacy column filters.
- `METAL_COLORS` and `METAL_TEXT_COLORS`: Objects that define the predefined colors for different metal types.
- `nameColors`: An object that maps names to colors, used as a fallback for metals without predefined colors.
- `applyQuickFilter` and `removeFilter`: Functions for applying and removing filters.
- `clearAllFilters`: A function to clear all active filters.
- `formatDisplayDate`: A function to format the date for display.
- `simplifyChipValue`: A function to simplify the display value for filter chips.

## Key Functions/Classes

1. **renderActiveFilters(container)**: This function is responsible for rendering the active filters as a set of filter chips in the provided container element.

   **Parameters**:

   - `container`: The DOM element where the filter chips should be rendered.

   **Return Value**: None.

1. **filterInventoryAdvanced()**: This function applies the advanced filters to the `inventory` data and returns the filtered result.

   **Parameters**: None.

   **Return Value**: The filtered inventory items.

## Usage Examples

To use the `renderActiveFilters` function, you would call it with the appropriate container element:

```javascript
const filtersContainer = document.getElementById('filters-container');
renderActiveFilters(filtersContainer);
```

To apply the advanced filters and get the filtered inventory, you would call the `filterInventoryAdvanced` function:

```javascript
const filteredInventory = filterInventoryAdvanced();
// Use the filteredInventory array as needed
```

## Configuration

There are no specific configuration options or environment variables for this script. However, it does rely on the following global variables and functions:

- `inventory`: The inventory data that is being filtered.
- `activeFilters`: The object containing the currently active filters.
- `columnFilters`: The legacy column filters.
- `METAL_COLORS` and `METAL_TEXT_COLORS`: Objects that define the predefined colors for different metal types.
- `nameColors`: An object that maps names to colors, used as a fallback for metals without predefined colors.
- `applyQuickFilter` and `removeFilter`: Functions for applying and removing filters.
- `clearAllFilters`: A function to clear all active filters.
- `formatDisplayDate`: A function to format the date for display.
- `simplifyChipValue`: A function to simplify the display value for filter chips.

## Error Handling

The script does not explicitly handle errors, as it relies on the availability of the global variables and functions mentioned in the Configuration section. If any of these dependencies are not properly set up or defined, the script may encounter errors.

## Integration

This script is a part of a larger system that manages the inventory and filtering functionality. It integrates with the overall user interface and the inventory data to provide a comprehensive filtering experience for the users.

## Development Notes

1. **Advanced Filtering Logic**: The `filterInventoryAdvanced` function includes some complex logic to handle advanced filtering scenarios, especially for common coin series like Eagles, Maples, Britannias, Krugerrands, Buffalos, Pandas, and Kangaroos. This logic ensures that the filtering produces accurate and intuitive results for these types of items.

1. **Extensibility**: The script is designed to be extensible, allowing for the addition of new filter types and custom filtering logic as needed. The modular structure and use of helper functions make it easier to maintain and expand the functionality.

1. **Optimization**: The script makes use of various optimization techniques, such as simplifying chip values, caching colors, and using efficient array filtering methods, to ensure good performance, even with large inventories and complex filtering scenarios.

1. **Accessibility**: The script includes accessibility features, such as making the filter chip close buttons keyboard-accessible and providing appropriate aria-labels and titles for the filter chips.

1. **Debugging**: The script includes an optional debug mode, which can be enabled by setting the `window.DEBUG_FILTERS` flag. This mode provides additional console logging to help with debugging and understanding the filter rendering process.

Overall, this script is a robust and well-designed component that plays a crucial role in the larger inventory management system.
