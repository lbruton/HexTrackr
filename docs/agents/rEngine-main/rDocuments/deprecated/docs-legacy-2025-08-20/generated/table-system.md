# rEngine Core - Table System Architecture Documentation

## Purpose & Overview

The `table-system.md` file provides a comprehensive overview of the architecture and functionality of the StackTrackr table system, a core component of the rEngine Core platform. This interactive data display system offers robust inventory management capabilities, including sorting, filtering, pagination, responsive design, and inline editing.

The table system is built using vanilla JavaScript and serves as a highly versatile and customizable solution for presenting and manipulating tabular data within the rEngine Core ecosystem.

## Key Functions/Classes

The table system's core functionality is divided across several key files:

### 1. `index.html`

- Defines the main table structure and column headers
- Contains templates for table-related modals (edit, notes, etc.)
- Houses search and filter UI elements
- Defines the responsive table section layout

### 2. `js/inventory.js`

This file contains the primary table logic, including the following core functions:

```javascript
// Main rendering engine
renderTable()

- Filters and sorts inventory data
- Implements pagination
- Generates table row HTML
- Updates sort indicators
- Manages column visibility
- Triggers summary updates

// Data manipulation
recalcItem(item)

- Calculates derived values (premiums, totals)
- Updates item properties

// UI Interactions
toggleCollectable(idx)

- Toggles item collectable status
- Updates derived values
- Saves changes

deleteItem(idx)

- Removes items with confirmation
- Updates display
- Logs changes

showNotes(idx)

- Opens notes modal
- Manages text area content

// Display updates
updateItemCount(filteredCount, totalCount)

- Shows filtered vs total items ratio

updateTypeSummary(items)

- Legacy filter chip system

hideEmptyColumns()

- Optimizes table display

```

### 3. `js/events.js`

This file handles event handling and interaction logic, including:

```javascript
// Column Management
updateColumnVisibility()

- Responsive column hiding based on screen width
- Implements breakpoint-based column display

setupResponsiveColumns()

- Initializes responsive behavior
- Attaches resize listeners

// Search & Filter Events
setupEventListeners()

- Debounced search input handling
- Filter dropdown behaviors
- Sort header click handlers
- Pagination control events
- Button click handlers

// Table Interactions
setupTableListeners()

- Header click sorting
- Row action buttons
- Inline edit triggers

```

### 4. `js/search.js`

This file provides the search and filter functionality, including:

```javascript
filterInventory()

- Applies search query to items
- Implements column filters
- Returns filtered dataset

clearAllFilters()

- Resets search and filters
- Restores full table view

```

## Dependencies

The table system relies on the following dependencies within the rEngine Core platform:

- Required files loaded in `index.html`
- CSS styles in `styles.css`
- Utility functions in `utils.js`
- Constants in `constants.js`

## Usage Examples

To use the table system within the rEngine Core platform, you can follow these steps:

1. Include the necessary HTML, CSS, and JavaScript files in your project:

   ```html
   <link rel="stylesheet" href="styles.css" />
   <script src="js/utils.js"></script>
   <script src="js/constants.js"></script>
   <script src="js/events.js"></script>
   <script src="js/search.js"></script>
   <script src="js/inventory.js"></script>
   ```

1. Prepare your data and initialize the table:

   ```javascript
   // Fetch data from an API or other source
   const inventoryData = await fetchInventoryData();

   // Initialize the table
   initializeTable(inventoryData);
   ```

1. Interact with the table using the available functions and event handlers:

   ```javascript
   // Sort the table
   sortTable('price', 'asc');

   // Apply a filter
   filterTable({ category: 'electronics' });

   // Handle table row actions
   document.querySelector('.table-row button.delete').addEventListener('click', (event) => {
     const itemIndex = event.target.dataset.index;
     deleteItem(itemIndex);
   });
   ```

## Configuration

The table system's behavior can be customized using the following constants defined in the `constants.js` file:

| Constant | Description | Default Value |
| --- | --- | --- |
| `ITEMS_PER_PAGE` | The number of items to display per page | `10` |
| `BREAKPOINTS` | An object defining the column visibility breakpoints | `{ small: 768, medium: 992, large: 1200 }` |
| `COLUMN_VISIBILITY` | An object defining the columns to show at each breakpoint | `{ small: ['name', 'price'], medium: ['name', 'price', 'category'], large: ['name', 'price', 'category', 'quantity'] }` |

## Integration Points

The table system is a core component of the rEngine Core platform and integrates with various other modules, such as:

- **Inventory Management**: The table system provides a user-friendly interface for managing inventory data, including CRUD operations.
- **Search and Filtering**: The table system leverages the search and filtering functionality provided by the `search.js` module.
- **Responsive Design**: The table system's layout and column visibility are managed in coordination with the platform's responsive design system.
- **Persistence**: The table system's data is persisted using the platform's local storage or other data storage mechanisms.

## Troubleshooting

Here are some common issues and solutions related to the table system:

### Slow Performance

If the table system is experiencing performance issues, consider the following:

1. **Optimize Data Fetching**: Ensure that the data being displayed in the table is optimized and only the necessary fields are being fetched.
2. **Implement Pagination**: Use the built-in pagination functionality to display a limited number of items at a time, reducing the initial load.
3. **Optimize Rendering**: Ensure that the `renderTable()` function is efficiently generating the table rows and only updating the necessary elements.

### Responsive Design Issues

If the table system is not displaying correctly on different screen sizes, check the following:

1. **Review Breakpoint Definitions**: Ensure that the `BREAKPOINTS` and `COLUMN_VISIBILITY` constants are properly configured to match your design requirements.
2. **Validate CSS Styles**: Verify that the CSS styles in `styles.css` are correctly handling the responsive layout and column visibility.
3. **Test on Multiple Devices**: Test the table system on a variety of devices and screen sizes to identify and address any layout issues.

### Data Persistence Problems

If the table system is not properly persisting data changes, investigate the following:

1. **Verify Local Storage Integration**: Ensure that the data storage and retrieval logic in the `inventory.js` file is correctly interacting with the platform's local storage or other data storage mechanisms.
2. **Implement Robust Error Handling**: Add proper error handling to the data persistence code to gracefully handle any issues that may arise.
3. **Monitor for Data Consistency**: Regularly check the persisted data to ensure that it matches the state displayed in the table system.

By addressing these common issues, you can ensure the table system functions reliably and seamlessly within the rEngine Core platform.
