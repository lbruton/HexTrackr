# rEngine Core: VulnTrackr Documentation

## Purpose & Overview

The `app.js` file in the `rProjects/VulnTrackr` directory is a prototype for a web-based vulnerability tracking and reporting tool built on the rEngine Core platform. It provides the following key functionality:

1. **CSV Data Parsing and Visualization**: The file can parse CSV files containing vulnerability data, extract relevant information (e.g., severity, score), and display aggregated statistics and trends in a web-based user interface.
2. **Formula-based Calculations**: The tool supports the use of simple Excel-like formulas to perform calculations on the vulnerability data, allowing users to customize the analysis.
3. **History Tracking and Reporting**: The tool stores the analysis results for each uploaded CSV file, allowing users to view historical trends and generate reports.
4. **Bulk Processing**: The tool can process multiple CSV files in a batch, consolidating the data and providing a comprehensive view of the vulnerability landscape.

This prototype showcases how the rEngine Core platform can be used to build custom data analysis and reporting tools for vulnerability management within an organization.

## Key Functions/Classes

The `app.js` file contains the following key functions and modules:

1. **CSV Parsing and Formula Translation**:
   - `colLetterToIndex(letter)`: Converts a column letter (e.g., "A", "B") to a zero-based index.
   - `translateFormula(formula)`: Translates a simple Excel-like formula to a JavaScript expression that can be evaluated on the parsed CSV data.
   - `applyFormulaToData(jsExpr)`: Applies the translated JavaScript expression to the parsed CSV data and returns the results.

1. **Data Visualization**:
   - `renderTable(results, opts)`: Renders a preview table of the CSV data and the calculated formula results.
   - `renderChart(results)`: Renders a bar chart of the calculated formula results.

1. **History Tracking and Reporting**:
   - `storeCurrentResults(filename)`: Stores the current calculation results in the browser's localStorage for historical tracking.
   - `updateHistoryCharts()`: Updates the historical charts and tables based on the stored data.
   - `generateHTMLReport(history)`: Generates an HTML report based on the stored historical data.

1. **Calculation Panels**:
   - `autoCalculatePanels()`: Automatically calculates and displays the statistics for each severity level and the overall total.
   - `getTrendIndicator(current, previous)`: Determines the trend indicator (up, down, or equal) based on the current and previous values.
   - `updateProgressBar(id, value, max)`: Updates the progress bar for a given panel based on the calculated values.

1. **Bulk Processing**:
   - `bulkUploadBtn` and `bulkUploadInput` event handlers: Handle the bulk file upload process, parse the CSV data, and aggregate the results.

1. **Utilities**:
   - `toNumber(v)`: Converts a value to a number, handling null/undefined and removing commas.
   - `generateSampleData(cols, rows)`: Generates sample CSV data for testing purposes.

## Dependencies

The `app.js` file relies on the following dependencies:

1. **PapaParse**: A fast and powerful CSV parser that is used to parse the uploaded CSV files.
2. **Chart.js**: A charting library used to render the historical trend charts.

These dependencies are not explicitly imported in the file, as it is assumed that they are available in the browser context. In a production environment, these dependencies would likely be bundled using a tool like Webpack or Rollup.

## Usage Examples

To use the VulnTrackr tool, follow these steps:

1. **Upload a CSV file**: Click the "Choose File" button and select a CSV file containing vulnerability data. The file should have columns for "definition.vpr.severity" and "definition.vpr.score".
2. **Apply a formula**: Enter a formula in the "Formula" input field and click the "Apply" button to see the results.
3. **View historical data**: The tool will automatically store the results of each CSV file upload. Use the "Bulk Run" button to view the historical trends and charts.
4. **Generate a report**: Click the "Generate Report" button to generate an HTML report of the stored historical data.

Here's an example of a simple formula that calculates the sum of scores for the "High" severity vulnerabilities:

```
=SUMIF(definition.vpr.severity:definition.vpr.severity,"High",definition.vpr.score:definition.vpr.score)
```

## Configuration

The VulnTrackr tool does not require any specific configuration. However, it does use the browser's localStorage to store the historical data. This means that the data will persist across page reloads and browser sessions.

## Integration Points

The VulnTrackr tool is a standalone prototype within the rEngine Core ecosystem. It does not directly integrate with other rEngine Core components, but it demonstrates how the rEngine Core platform can be used to build custom data analysis and reporting tools.

In a production environment, the VulnTrackr tool could be integrated with other rEngine Core components, such as the data ingestion and processing pipelines, to provide a more comprehensive vulnerability management solution.

## Troubleshooting

Here are some common issues and solutions for the VulnTrackr tool:

1. **CSV file not loading**: Ensure that the CSV file has the required "definition.vpr.severity" and "definition.vpr.score" columns. If the file structure does not match the expected format, the tool may fail to parse the data correctly.

1. **Formula not working as expected**: Check the syntax of the formula and ensure that it matches the expected format. The tool supports simple Excel-like formulas, but more complex expressions may require further development.

1. **Historical data not displaying**: Verify that the browser's localStorage is not blocked or cleared. The historical data is stored in the browser's localStorage, so if it is not available, the historical charts and tables will not be displayed.

1. **Bulk processing issues**: Ensure that the filenames in the "csvhistory" directory follow a consistent pattern that can be detected by the tool. If the filenames do not match the expected pattern, the bulk processing feature may not work correctly.

If you encounter any other issues, check the browser's console for error messages, which may provide additional information to help troubleshoot the problem.
