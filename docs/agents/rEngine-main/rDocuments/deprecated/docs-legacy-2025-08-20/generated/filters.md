# rEngine Core: Filters Module

## Purpose & Overview

The `filters.js` file in the `rProjects/StackTrackr/js/` directory is a crucial component of the rEngine Core platform. It provides an advanced filtering system for managing and interacting with the inventory data in the StackTrackr application.

The main responsibilities of this module include:

1. **Filtering Inventory**: Applying various types of filters (e.g., metal, type, name, purchase/storage location, collectable status) to the inventory data and returning the filtered results.
2. **Rendering Active Filters**: Displaying the currently active filters as clickable "chips" below the search bar, allowing users to easily see and manage the applied filters.
3. **Handling Filter Interactions**: Providing functions to apply, remove, and clear filters, as well as updating the UI and the filtered inventory accordingly.
4. **Supporting Advanced Filtering**: Incorporating both explicit filters (set through the UI) and implicit filters (based on search terms) to provide a comprehensive and intuitive filtering experience.
5. **Generating Category Summaries**: Analyzing the filtered inventory to determine the available categories (metals, types, dates, purchase/storage locations) and their respective item counts, which are then displayed in the filter chips.

This module is a core component of the StackTrackr application, as it enables users to efficiently navigate and explore the inventory data by applying various filters to refine their search.

## Key Functions/Classes

The `filters.js` file exports the following key functions:

1. **`clearAllFilters()`**: Clears all active filters, resets the search input and pagination, and re-renders the table.
2. **`removeFilter(field, value)`**: Removes a specific filter from the active filters or search.
3. **`simplifyChipValue(value, field)`**: Simplifies the display of common coin names in the filter chips.
4. **`generateCategorySummary(inventory)`**: Generates a summary of metals, types, dates, purchase locations, and storage locations from the filtered inventory, including item counts.
5. **`hasMatchingData(field, value, inventory)`**: Checks if a filter field/value combination has matching data in the given inventory.
6. **`renderActiveFilters()`**: Renders the active filter chips beneath the search bar, updating the filter chip container based on the current filters and inventory.
7. **`filterInventoryAdvanced()`**: Applies the advanced filters (both explicit and implicit) to the inventory and returns the filtered results.
8. **`applyQuickFilter(field, value, isGrouped)`**: Applies a quick filter for a specific field value, supporting a 3-level deep filtering mechanism.
9. **`applyColumnFilter(field, value)`**: A legacy function for backward compatibility with table click handlers.

These functions work together to provide the advanced filtering capabilities of the StackTrackr application.

## Dependencies

The `filters.js` file depends on the following:

1. **Global variables/functions**:
   - `inventory`: The complete inventory data.
   - `searchQuery`: The current search query.
   - `currentPage`: The current page of the paginated table.
   - `columnFilters`: Legacy column filters for backward compatibility.
   - `METAL_COLORS` and `METAL_TEXT_COLORS`: Objects containing predefined colors for various metals.
   - `getTypeColor()`, `getPurchaseLocationColor()`, `getStorageLocationColor()`, and `getContrastColor()`: Helper functions for determining appropriate colors for UI elements.
   - `formatDisplayDate()`: A function for formatting dates.
   - `window.autocomplete` and `window.autocomplete.normalizeItemName()`: Functionality for handling grouped name filtering (if available).
   - `window.featureFlags` and `window.featureFlags.isEnabled()`: Feature flag management (if available).
1. **External dependencies**:
   - None directly, but the file is part of the broader rEngine Core ecosystem and likely interacts with other components.

## Usage Examples

To use the functionality provided by the `filters.js` file, you can call the exported functions from other parts of the rEngine Core application. Here are some examples:

```javascript
// Clear all active filters
clearAllFilters();

// Apply a quick filter
applyQuickFilter('metal', 'gold');
applyQuickFilter('type', 'eagle', true); // Grouped name filter

// Remove a specific filter
removeFilter('metal', 'gold');

// Get the filtered inventory
const filteredInventory = filterInventoryAdvanced();

// Render the active filters UI
renderActiveFilters();
```

These examples demonstrate how to interact with the filtering system to manage the inventory data and update the user interface accordingly.

## Configuration

The `filters.js` file does not require any specific configuration. However, it does make use of some global variables and functions that may need to be provided or configured elsewhere in the rEngine Core application.

Additionally, the file supports some optional feature flags, such as `GROUPED_NAME_CHIPS`, which can be enabled or disabled to control the behavior of the grouped name filtering functionality.

## Integration Points

The `filters.js` file is a core component of the StackTrackr application within the rEngine Core ecosystem. It integrates with the following components:

1. **Inventory Data**: The file operates on the `inventory` data, which is likely managed and provided by other components.
2. **Search Functionality**: The file interacts with the search functionality, handling search queries and updating the filtered results.
3. **Pagination**: The file updates the `currentPage` variable to maintain the correct pagination state.
4. **User Interface**: The file renders the active filters UI, which is likely integrated into the overall application layout.
5. **Feature Flags**: The file can leverage feature flags, such as `GROUPED_NAME_CHIPS`, to enable or disable specific functionalities.

By integrating with these components, the `filters.js` file contributes to the overall functionality and user experience of the StackTrackr application within the rEngine Core platform.

## Troubleshooting

Here are some common issues and solutions related to the `filters.js` file:

1. **Filters not updating**: Ensure that the required global variables and functions (e.g., `inventory`, `searchQuery`, `currentPage`, `columnFilters`, helper functions) are properly set and accessible.
2. **Incorrect filter chip colors**: Verify that the `METAL_COLORS`, `METAL_TEXT_COLORS`, and other color-related helper functions are correctly configured and returning appropriate values.
3. **Grouped name filtering not working**: Check if the `window.autocomplete` and `window.autocomplete.normalizeItemName()` functions are available and functioning correctly. Also, ensure that the `GROUPED_NAME_CHIPS` feature flag is enabled.
4. **Compatibility issues with legacy column filters**: If there are problems with the `applyColumnFilter()` function, review the integration with the legacy filtering system and ensure that the transition to the new advanced filtering approach is properly handled.
5. **Performance issues with large inventories**: Monitor the performance of the `filterInventoryAdvanced()` function, as it may need optimization for handling large datasets. Consider implementing pagination, lazy loading, or other techniques to improve the user experience.

If you encounter any other issues, it's recommended to thoroughly review the code, check the dependencies, and consult the broader rEngine Core documentation and support channels for further assistance.
