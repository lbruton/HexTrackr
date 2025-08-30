# rEngine Core: state.js Documentation

## Purpose & Overview

The `state.js` file is a crucial component of the `StackTrackr` application, which is part of the rEngine Core ecosystem. This file manages the application's state, including sorting, editing, pagination, search, and various other aspects of the user interface and data management.

The state tracked in this file is essential for the proper functioning of the `StackTrackr` application, as it ensures that the user's interactions and data are handled consistently across the different components of the application.

## Key Functions/Classes

The `state.js` file defines several key variables and objects that represent the different aspects of the application's state:

1. **Sorting State**: `sortColumn` and `sortDirection` control the sorting of the inventory items.
2. **Editing State**: `editingIndex`, `notesIndex`, and `editingChangeLogIndex` track the indices of items being edited or having their notes edited.
3. **Pagination State**: `currentPage` and `itemsPerPage` control the pagination of the inventory items.
4. **Search State**: `searchQuery` and `columnFilters` store the current search query and active column filters.
5. **Chart Instances**: `chartInstances` holds references to the chart instances used in the application.
6. **Composition Options**: `compositionOptions` is a set of available composition options for inventory items.
7. **Market Value View**: `marketValueViewItems` is a set of item indices that are currently displaying market value instead of purchase price.
8. **DOM Elements**: `elements` is an object that caches references to various DOM elements used in the application for improved performance.
9. **Change Log**: `changeLog` is an array that stores the history of changes made to the inventory.
10. **Inventory Data**: `inventory` is the main data structure that holds the inventory items.
11. **Spot Prices**: `spotPrices` and `spotHistory` store the current and historical spot prices for different metals.
12. **API Configuration**: `apiConfig` and `apiCache` hold the current API configuration and cached API data.
13. **Catalog Mapping**: `catalogMap` is a proxy object that provides backward compatibility for the catalog mapping functionality.

## Dependencies

The `state.js` file does not have any direct dependencies. However, it relies on the following external components and libraries:

1. **localStorage**: The `changeLog` array is stored in and retrieved from the browser's localStorage.
2. **catalogManager**: The `catalogMap` proxy object interacts with the `catalogManager` to handle catalog ID mapping.

## Usage Examples

The `state.js` file is primarily used by other components within the `StackTrackr` application to access and update the application's state. Here's an example of how the `inventory` array might be used in another component:

```javascript
import { inventory } from './state.js';

// Accessing the inventory data
const allItems = inventory;

// Updating the inventory data
inventory.push({
  id: 123,
  name: 'Gold Bar',
  quantity: 1,
  // Other inventory item properties
});
```

## Configuration

The `state.js` file does not require any specific configuration. However, the application's behavior can be influenced by modifying the initial values of the state variables, such as `sortColumn`, `itemsPerPage`, or `compositionOptions`.

## Integration Points

The `state.js` file is a central component of the `StackTrackr` application and interacts with various other parts of the rEngine Core ecosystem:

1. **UI Components**: The state variables and DOM element references in `state.js` are used by the application's UI components to display and update the user interface.
2. **Data Management**: The `inventory` array and other data structures in `state.js` are used to store and manage the application's data.
3. **API Integration**: The `apiConfig` and `apiCache` variables are used to interact with external APIs for data retrieval and updates.
4. **Catalog Management**: The `catalogMap` proxy object integrates with the `catalogManager` to handle catalog ID mapping.

## Troubleshooting

Here are some common issues and solutions related to the `state.js` file:

1. **Unexpected UI Behavior**: If the user interface is not behaving as expected, check the state variables in `state.js` to ensure they are being updated correctly by the various components of the application.
2. **Data Inconsistencies**: If the inventory data or other data structures in `state.js` are not being updated or saved correctly, review the code that interacts with these data structures to identify any issues.
3. **API Integration Problems**: If the application is experiencing issues with external API integration, review the `apiConfig` and `apiCache` variables to ensure they are configured and used correctly.
4. **Catalog Mapping Errors**: If the catalog mapping functionality is not working as expected, check the `catalogMap` proxy object and ensure that the `catalogManager` is properly integrated and configured.

Remember to consult the rEngine Core documentation and the `StackTrackr` application's own documentation for more detailed troubleshooting guidance and support.
