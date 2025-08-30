# detailsModal.js Documentation

## Purpose & Overview

The `detailsModal.js` script is responsible for displaying a detailed breakdown of a specified metal's inventory data. It provides a modal dialog that shows a pie chart visualization of the breakdown by item type and purchase location. This script is a crucial component of the larger system, enabling users to quickly analyze the composition of the metal inventory.

## Technical Architecture

The script is structured around the following key components:

1. **Data Retrieval**: The `getBreakdownData` function retrieves the inventory data for a given metal, calculating the breakdown by type and location.
2. **DOM Manipulation**: The `createBreakdownElements` function generates the HTML elements for displaying the breakdown data in the modal.
3. **Chart Rendering**: The `showDetailsModal` function creates and renders the pie charts using the breakdown data.
4. **Modal Management**: The `showDetailsModal` and `closeDetailsModal` functions handle the opening and closing of the details modal, including cleanup of the chart instances.

The script utilizes a global `elements` object to reference the necessary DOM elements and a `chartInstances` object to store the chart instances for cleanup.

## Dependencies

This script has the following external dependencies:

1. **Inventory Data**: The script assumes the existence of a global `inventory` array containing the metal inventory data.
2. **Formatting Utility**: The script uses a global `formatCurrency` function to format the monetary values.
3. **Modal Functionality**: The script assumes the existence of global `openModalById` and `closeModalById` functions (or falls back to manual modal handling).
4. **Charting Library**: The script uses a charting library (likely a third-party library like Chart.js or ApexCharts) to render the pie charts. The `createPieChart` and `destroyCharts` functions are assumed to be available.

## Key Functions/Classes

1. **`getBreakdownData(metal)`**
   - **Purpose**: Calculates the breakdown data for the specified metal by type and location.
   - **Parameters**: `metal` (string) - The metal type to calculate the breakdown for.
   - **Return Value**: An object containing the `typeBreakdown` and `locationBreakdown` data.

1. **`createBreakdownElements(breakdown)`**
   - **Purpose**: Creates the DOM elements for displaying the breakdown data.
   - **Parameters**: `breakdown` (object) - The breakdown data object.
   - **Return Value**: A `DocumentFragment` containing the breakdown elements.

1. **`showDetailsModal(metal)`**
   - **Purpose**: Shows the details modal for the specified metal, including the pie charts and breakdown elements.
   - **Parameters**: `metal` (string) - The metal type to display the details for.

1. **`closeDetailsModal()`**
   - **Purpose**: Closes the details modal and cleans up the chart instances.

## Usage Examples

To use the `detailsModal.js` script, follow these steps:

1. Include the script in your HTML file:

   ```html
   <script src="detailsModal.js"></script>
   ```

1. Trigger the `showDetailsModal` function when the user requests to view the details for a specific metal:

   ```javascript
   const showDetailsButton = document.getElementById('showDetailsButton');
   showDetailsButton.addEventListener('click', () => {
     showDetailsModal('Gold');
   });
   ```

1. Ensure that the necessary global functions and variables are available, such as `inventory`, `formatCurrency`, `openModalById`, `closeModalById`, `createPieChart`, and `destroyCharts`.

## Configuration

This script does not have any specific configuration options or environment variables. It relies on the availability of the global `inventory` data and the necessary utility functions.

## Error Handling

The script handles the following potential errors:

1. **No Breakdown Data**: If there is no data available for the specified metal, the script will display a "No data available" message in the breakdown elements.
2. **Modal Handling Fallback**: If the global `openModalById` and `closeModalById` functions are not available, the script falls back to manual modal handling using the `detailsModal` element.

## Integration

The `detailsModal.js` script is an integral part of the larger system, providing detailed inventory insights to the users. It is typically triggered by user interactions, such as clicking a "View Details" button or link.

The script is designed to be reusable and can be integrated into various parts of the application where detailed metal inventory information needs to be displayed.

## Development Notes

1. **Pie Chart Library**: The script assumes the use of a third-party charting library for rendering the pie charts. The specific implementation details, such as the library used and the chart configuration, are not covered in this documentation.
2. **Modal Handling**: The script provides a fallback for manual modal handling, in case the global `openModalById` and `closeModalById` functions are not available. This ensures compatibility with a wider range of systems.
3. **Resize Handling**: The script sets up a `ResizeObserver` to handle the resizing of the details modal, ensuring the pie charts are properly resized as well.
4. **Globalization**: The script assumes the use of a `formatCurrency` function to handle currency formatting. This function should be implemented to match the desired currency format and localization requirements.

Overall, the `detailsModal.js` script is a well-structured and robust component that provides a clear and comprehensive breakdown of the metal inventory data, enhancing the user experience and decision-making capabilities of the larger system.
