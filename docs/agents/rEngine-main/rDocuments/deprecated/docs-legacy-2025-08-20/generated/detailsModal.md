# rEngine Core: detailsModal.js Documentation

## Purpose & Overview

The `detailsModal.js` file is a part of the `StackTrackr` application within the rEngine Core ecosystem. It provides the functionality to display a details modal with a breakdown of inventory data by metal type and purchase location, along with interactive pie charts.

The main purpose of this file is to:

1. Calculate and organize the breakdown data for a selected metal.
2. Create the necessary DOM elements to display the breakdown details.
3. Render the pie charts using the breakdown data.
4. Manage the opening and closing of the details modal.

This file integrates with the rEngine Core platform to provide a seamless user experience for analyzing inventory data within the `StackTrackr` application.

## Key Functions/Classes

1. `getBreakdownData(metal)`:
   - Calculates the breakdown data for the specified metal by type and location.
   - Returns an object containing the type and location breakdowns.

1. `createBreakdownElements(breakdown)`:
   - Creates the DOM elements to display the breakdown data.
   - Returns a DocumentFragment containing the breakdown items.

1. `showDetailsModal(metal)`:
   - Handles the display of the details modal for the specified metal.
   - Updates the modal title, clears existing content, and creates the pie charts.
   - Appends the breakdown elements to the modal.
   - Adds a resize observer to handle chart resizing on modal resize.

1. `closeDetailsModal()`:
   - Handles the closing of the details modal.
   - Destroys the existing pie charts.

## Dependencies

The `detailsModal.js` file has the following dependencies:

1. **Global Variables**:
   - `inventory`: An array of inventory items.
   - `elements`: An object containing references to various DOM elements.
   - `chartInstances`: An object to store the created chart instances.

1. **Functions**:
   - `formatCurrency`: A function to format a numeric value as currency.
   - `createPieChart`: A function to create a pie chart using the breakdown data.
   - `destroyCharts`: A function to destroy the existing chart instances.
   - `openModalById` and `closeModalById`: Functions to open and close the details modal (if available).

1. **Libraries**:
   - The file assumes the presence of a charting library (e.g., Chart.js) to create the pie charts.

## Usage Examples

To use the functionality provided by `detailsModal.js`, you can call the following functions:

1. **Show the Details Modal**:

   ```javascript
   showDetailsModal('Silver');
   ```

   This will display the details modal for the "Silver" metal, showing the breakdown by type and location, as well as the corresponding pie charts.

1. **Close the Details Modal**:

   ```javascript
   closeDetailsModal();
   ```

   This will close the details modal and clean up the chart instances.

## Configuration

The `detailsModal.js` file does not require any specific configuration. It relies on the global variables and functions mentioned in the "Dependencies" section to function correctly.

## Integration Points

The `detailsModal.js` file is integrated into the `StackTrackr` application within the rEngine Core ecosystem. It communicates with the following components:

1. **Inventory Data**: The file utilizes the `inventory` array to calculate the breakdown data.
2. **DOM Elements**: The file interacts with various DOM elements, such as the details modal, type breakdown, and location breakdown containers, to display the breakdown information.
3. **Charting Library**: The file integrates with a charting library (e.g., Chart.js) to create the pie charts.
4. **Modal Management**: The file can use the `openModalById` and `closeModalById` functions (if available) to manage the opening and closing of the details modal.

## Troubleshooting

1. **Missing Dependencies**:
   - Ensure that the required global variables (`inventory`, `elements`, `chartInstances`) and functions (`formatCurrency`, `createPieChart`, `destroyCharts`, `openModalById`, `closeModalById`) are properly defined and accessible.
   - Verify that the charting library (e.g., Chart.js) is properly included and can be used by the file.

1. **Pie Chart Rendering Issues**:
   - Confirm that the pie chart elements (e.g., `elements.typeChart`, `elements.locationChart`) are correctly set up and have the necessary dimensions to display the charts.
   - Ensure that the `createPieChart` function is correctly implemented and can handle the breakdown data.

1. **Modal Behavior Problems**:
   - If the `openModalById` and `closeModalById` functions are not available, ensure that the fallback logic for displaying and hiding the modal is working correctly.
   - Verify that the modal element (`elements.detailsModal`) is properly configured and can be manipulated by the file.

By addressing these potential issues, you can ensure the smooth integration and functionality of the `detailsModal.js` file within the rEngine Core platform.
