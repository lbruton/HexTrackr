# rEngine Core: StackTrackr Pagination

## Purpose & Overview

The `pagination.js` file in the `StackTrackr` project of the rEngine Core platform provides functionality for handling the pagination of data. It allows users to navigate through a list of items, displaying a subset of the data at a time based on the current page. This file is an essential component of the StackTrackr application, which is built on the rEngine Core platform.

## Key Functions

### `calculateTotalPages(data = inventory)`

This function calculates the total number of pages required to display the given data, based on the configured `itemsPerPage` value. It returns the total number of pages, ensuring a minimum of 1 page.

### `renderPagination(filteredData = filterInventory())`

This function is responsible for rendering the pagination controls, including the page number buttons, the "First", "Previous", "Next", and "Last" buttons, and the search results information. It adjusts the visible page numbers to show a limited range (maximum 7) centered around the current page.

### `goToPage(page)`

This function allows navigating to a specific page number. It ensures that the page number is within the valid range (between 1 and the total number of pages) and then calls the `renderTable()` function to update the displayed data.

## Dependencies

The `pagination.js` file depends on the following components and functions:

1. `inventory`: An array of data to be paginated.
2. `filterInventory()`: A function that filters the inventory data based on the current search query.
3. `elements`: An object that provides references to various HTML elements, such as the page numbers container and the search results info element.
4. `currentPage`: A variable that keeps track of the current page number.
5. `searchQuery`: A variable that stores the current search query.
6. `renderTable()`: A function that updates the table with the data for the current page.

## Usage Examples

To use the pagination functionality in the StackTrackr application, you can follow these steps:

1. Ensure that the `pagination.js` file is included in your HTML file, typically alongside the other JavaScript files for the StackTrackr project.
2. Make sure that the necessary dependencies, such as the `inventory` array, `filterInventory()` function, and `elements` object, are properly set up and accessible.
3. Call the `renderPagination()` function to initialize the pagination controls and display the first page of data.
4. When the user interacts with the pagination controls (e.g., clicking on a page number or the "Next" button), the `goToPage()` function will be called to navigate to the selected page.

Here's an example of how you might use the pagination functionality:

```javascript
// Assuming the necessary dependencies are set up
renderPagination();

// Handle page number button clicks
document.querySelectorAll('.pagination-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const pageNumber = parseInt(btn.textContent);
    goToPage(pageNumber);
  });
});

// Handle "Next" button clicks
document.getElementById('nextPage').addEventListener('click', () => {
  goToPage(currentPage + 1);
});
```

## Configuration

The `pagination.js` file relies on the following configuration:

- `itemsPerPage`: This variable determines the number of items to be displayed per page. It is likely set elsewhere in the codebase and used by the `calculateTotalPages()` function.

## Integration Points

The `pagination.js` file integrates with other components of the rEngine Core platform, specifically:

1. **StackTrackr Application**: The pagination functionality is an essential part of the StackTrackr application, allowing users to navigate through the inventory data.
2. **rEngine Core Framework**: The `pagination.js` file is part of the rEngine Core ecosystem and utilizes various components and utilities provided by the framework.

## Troubleshooting

Here are some common issues and solutions related to the pagination functionality:

1. **Incorrect data display**: If the data displayed in the table does not match the current page, ensure that the `renderTable()` function is properly updating the table content based on the current page and the filtered data.
2. **Pagination controls not working**: Verify that the event listeners on the pagination buttons are correctly set up and that the `goToPage()` function is being called with the appropriate page number.
3. **Incorrect total page count**: If the total number of pages displayed is incorrect, check the implementation of the `calculateTotalPages()` function and ensure that the `itemsPerPage` configuration is accurate.
4. **Search results not updating**: If the search results information is not updating correctly, ensure that the `filterInventory()` function is working as expected and that the `renderPagination()` function is correctly updating the search results info element.

If you encounter any other issues, you may need to investigate the integration between the `pagination.js` file and the other components of the StackTrackr application, as well as the overall rEngine Core framework.
