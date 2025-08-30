# rEngine Core Documentation: app-functions.js

## Purpose & Overview

The `app-functions.js` file is a part of the `VulnTrackr` application, which is a component within the rEngine Core ecosystem. This file contains the implementation of several key functions that handle the display of vulnerability tracking results, generation of HTML reports, and management of historical data.

The main responsibilities of this file include:

1. **Displaying Latest Vulnerability Tracking Results**: The `displayLatestResults()` function takes the latest scan results and populates the corresponding panels on the user interface with detailed statistics and progress bars.

1. **Generating HTML Reports**: The `generateHTMLReport()` function creates a comprehensive HTML report that summarizes the vulnerability tracking history, including executive summary, latest scan results, and a table of historical scans.

1. **Updating Historical Charts and Tables**: The `updateHistoryCharts()` function retrieves the vulnerability tracking history from the local storage, processes the data, and generates interactive charts and tables to visualize the historical trends.

These functions work together to provide a seamless user experience for the VulnTrackr application within the rEngine Core platform.

## Key Functions/Classes

1. **`displayLatestResults(result)`**:
   - This function takes the latest vulnerability tracking results and updates the corresponding panels on the user interface.
   - It formats the output with styled rows and updates the progress bars based on the severity levels.

1. **`generateHTMLReport(history)`**:
   - This function generates a comprehensive HTML report from the vulnerability tracking history data.
   - It includes an executive summary, the latest scan results, and a table of historical scans.
   - The report is styled with a responsive and visually appealing layout.

1. **`generateLatestResultsHTML(latestScan)`**:
   - This helper function generates the HTML for the latest scan results section of the report.
   - It creates a grid of cards, each displaying the count, sum, and mean for a specific severity level, along with a progress bar.

1. **`generateHistoryTableHTML(history)`**:
   - This helper function generates the HTML for the historical scans table in the report.
   - It creates a table with columns for date, filename, and various vulnerability statistics.

1. **`updateHistoryCharts()`**:
   - This function retrieves the vulnerability tracking history from the local storage and updates the corresponding charts and tables.
   - It creates line charts for the historical trends of each severity level and a total score chart.
   - It also generates tables with the last 5 entries for each severity level, displaying the score, count, and change from the previous entry.

## Dependencies

The `app-functions.js` file does not have any direct dependencies. However, it assumes the presence of the following elements in the HTML:

- `<div id="output-{panelIndex}">`: The element where the latest results will be displayed.
- `<div id="progress-{panelIndex}">`: The element where the progress bars will be updated.
- `<div id="filename">`: The element where the filename of the latest scan will be displayed.
- `<canvas id="histchart-{chartIndex}">`: The elements where the historical trend charts will be rendered.
- `<div id="histtable-{tableIndex}">`: The elements where the historical tables will be displayed.

Additionally, the file assumes the presence of a Chart.js library to create the historical trend charts.

## Usage Examples

To use the functions in this file, you can call them from your application's main entry point (e.g., `app.js`):

```javascript
// Fetch the latest vulnerability tracking results
fetch('/api/latest-results')
  .then(response => response.json())
  .then(result => {
    displayLatestResults(result);
  });

// Generate an HTML report from the vulnerability tracking history
const history = JSON.parse(localStorage.getItem('vprHistory')) || [];
const reportHTML = generateHTMLReport(history);
document.getElementById('report-container').innerHTML = reportHTML;

// Update the historical charts and tables
updateHistoryCharts();
```

## Configuration

The `app-functions.js` file does not require any specific configuration. The functions assume that the necessary HTML elements and dependencies are available in the application.

## Integration Points

The `app-functions.js` file is a part of the `VulnTrackr` application within the rEngine Core ecosystem. It integrates with the following components:

1. **UI/Frontend**: The functions in this file directly update the user interface by manipulating the DOM and rendering charts and tables.
2. **API Integration**: The `displayLatestResults()` function expects to receive the latest vulnerability tracking results from an API endpoint.
3. **Local Storage**: The `updateHistoryCharts()` function retrieves and updates the vulnerability tracking history stored in the local storage.

## Troubleshooting

1. **Missing HTML Elements**: If the necessary HTML elements (e.g., `output-{panelIndex}`, `progress-{panelIndex}`, `filename`, `histchart-{chartIndex}`, `histtable-{tableIndex}`) are not present in the application, the functions in this file will not be able to update the UI as expected.

   **Solution**: Ensure that the required HTML elements are correctly placed in the application's structure.

1. **Incorrect Data Format**: The functions in this file expect the vulnerability tracking results and history data to be in a specific format. If the data structure is different, the functions may not work as expected.

   **Solution**: Verify that the data being passed to the functions matches the expected format. Modify the functions or the data transformation logic accordingly.

1. **Missing Chart.js Library**: The `updateHistoryCharts()` function relies on the Chart.js library to create the historical trend charts. If the Chart.js library is not included in the application, the charts will not be rendered.

   **Solution**: Make sure the Chart.js library is properly imported and available in the application.

1. **Inconsistent Local Storage Data**: If the vulnerability tracking history stored in the local storage is inconsistent or corrupted, the `updateHistoryCharts()` function may not work as expected.

   **Solution**: Consider adding error handling and data validation logic to handle cases where the local storage data is not in the expected format.

By addressing these potential issues, you can ensure the smooth integration and functioning of the `app-functions.js` file within the rEngine Core platform.
