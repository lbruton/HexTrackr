# rEngine Core: `search.js` Documentation

## Purpose & Overview

The `search.js` file within the `StackTrackr` project of the rEngine Core platform provides the core functionality for filtering and searching the inventory database. It handles advanced multi-term, phrase, and series-specific logic for coins and metals, allowing users to quickly find and retrieve relevant inventory items based on various search criteria.

This file serves as the backbone of the search functionality in the rEngine Core ecosystem, enabling users to effectively navigate and manage their inventory data.

## Key Functions/Classes

The main component in this file is the `filterInventory()` function, which is responsible for:

1. **Advanced Filtering**: If the `filterInventoryAdvanced()` function is available, it will use the advanced filtering system. Otherwise, it will fall back to the legacy filtering approach.
2. **Column Filters**: Applying active column filters to the inventory data, allowing users to narrow down the results based on specific fields.
3. **Search Query Parsing**: Handling multi-term, phrase, and series-specific searches, including support for collectable items, date formatting, and various coin/metal series.
4. **Debounced Search**: Applying a debounce to the search input to improve performance and prevent excessive API calls.

## Dependencies

The `search.js` file depends on the following rEngine Core components:

1. **Inventory Data**: It assumes the existence of an `inventory` array or object containing the inventory items to be filtered and searched.
2. **Column Filters**: It utilizes the `columnFilters` object to apply active filters to the inventory data.
3. **Search Query**: It relies on the `searchQuery` variable to store the current search term.
4. **Debounce Function**: It uses the `debounce()` function, which is likely defined in a utility or helper module.
5. **Date Formatting**: It calls the `formatDisplayDate()` function to format the item dates for searching.

## Usage Examples

To use the `filterInventory()` function, you can call it in your application code like this:

```javascript
// Filtering the inventory based on the current search query and filters
const filteredItems = filterInventory();

// Using the filtered items for further processing or display
console.log(filteredItems);
```

If you want to integrate the search functionality with your user interface, you can set up an event listener on the search input element and call the `filterInventory()` function when the input value changes:

```javascript
const searchInput = document.getElementById('searchInput');

searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  currentPage = 1; // Reset the current page
  filterInventory();
});
```

## Configuration

The `search.js` file does not require any specific configuration. It relies on the following variables to be available in the global scope or passed as arguments:

- `inventory`: The array or object containing the inventory items to be filtered.
- `columnFilters`: The object containing the active column filters.
- `searchQuery`: The current search term entered by the user.
- `currentPage`: The current page number for pagination (if applicable).

## Integration Points

The `search.js` file is a key component in the rEngine Core ecosystem, as it provides the core search and filtering functionality for the inventory management system. It can be integrated with other rEngine Core components, such as:

1. **User Interface**: The search and filtering functionality can be integrated into the user interface, allowing users to interact with the inventory data.
2. **Pagination**: The `currentPage` variable can be used to implement pagination, displaying a limited number of results per page.
3. **Advanced Filtering**: The `filterInventoryAdvanced()` function can be implemented to provide more complex filtering capabilities, if needed.
4. **Data Storage/Retrieval**: The `inventory` data can be retrieved from a database or other storage system and passed to the `filterInventory()` function.

## Troubleshooting

Here are some common issues and solutions related to the `search.js` file:

**Issue**: The `filterInventory()` function is not working as expected.
**Solution**: Ensure that the required variables (`inventory`, `columnFilters`, `searchQuery`, `currentPage`) are properly set and available in the global scope. Also, check for any errors or typos in the function logic.

**Issue**: The search results are not accurate or do not match the expected behavior.
**Solution**: Review the complex search logic, especially the handling of multi-term, phrase, and series-specific searches. Ensure that the regular expressions and string manipulations are correctly implemented to match the desired search behavior.

**Issue**: The search performance is slow or the page is unresponsive.
**Solution**: Verify that the debounce function is properly implemented and configured with an appropriate delay value. Also, consider optimizing the filtering logic or implementing pagination to improve the overall performance.

**Issue**: The `filterInventoryAdvanced()` function is not available or not working as expected.
**Solution**: Ensure that the advanced filtering system is properly integrated and configured. If the `filterInventoryAdvanced()` function is not available, the `search.js` file will fall back to the legacy filtering approach.

If you encounter any other issues or have questions about the `search.js` file, please consult the rEngine Core documentation or reach out to the rEngine Core support team for assistance.
