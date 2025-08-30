# rEngine Core: report-generator.js Documentation

## Purpose & Overview

The `report-generator.js` file is a module within the `VulnTrackr` component of the rEngine Core platform. It is responsible for generating comprehensive HTML reports based on vulnerability history data. These reports provide visibility into vulnerability trends, severity distribution, and other key metrics to help organizations track and manage their security posture.

The module exports two main functions: `generateHTMLReport` and `downloadHTMLReport`. These functions work together to create and download the HTML report, respectively.

## Key Functions/Classes

### `generateHTMLReport(history)`

This function takes an array of vulnerability history data (`history`) and generates an HTML report. It performs the following key tasks:

1. Checks if the `history` data is available, and returns an error message if not.
2. Sorts the history data by date, with the most recent entries first.
3. Generates the HTML report structure, including an executive summary, latest scan results, historical trends, and a detailed scan history table.
4. Utilizes helper functions (`generateLatestResults` and `generateHistoryTable`) to populate the report with the relevant data.
5. Returns the complete HTML report as a string.

### `generateLatestResults(latestScan)`

This helper function is responsible for generating the "Latest Scan Results" section of the HTML report. It takes the latest scan data (`latestScan`) and creates a grid of cards displaying the vulnerability counts, sums, and means for each severity level (Low, Medium, High, Critical) as well as the total.

### `generateHistoryTable(history)`

This helper function generates the HTML table for the "Scan History" section of the report. It iterates through the provided `history` data and creates a table row for each scan, displaying the date, filename, and various vulnerability metrics.

### `downloadHTMLReport(history)`

This function takes the `history` data and generates the HTML report using `generateHTMLReport`. It then creates a downloadable HTML file for the user to save.

## Dependencies

The `report-generator.js` module does not have any external dependencies. It is a self-contained module within the `VulnTrackr` component of the rEngine Core platform.

## Usage Examples

To use the `report-generator` module in your rEngine Core application, you can import the necessary functions and call them with the appropriate data:

```javascript
import { generateHTMLReport, downloadHTMLReport } from './report-generator';

// Example usage
const vulnerabilityHistory = [
  {
    date: '2023-04-01',
    filename: 'scan_report_1.json',
    data: {
      low: { count: 10, sum: 5.2, mean: 0.52 },
      medium: { count: 8, sum: 12.7, mean: 1.59 },
      high: { count: 4, sum: 20.1, mean: 5.03 },
      critical: { count: 2, sum: 15.3, mean: 7.65 },
      total: { count: 24, sum: 53.3, mean: 2.22 }
    }
  },
  // Add more history data as needed
];

// Generate the HTML report
const htmlReport = generateHTMLReport(vulnerabilityHistory);
console.log(htmlReport);

// Download the HTML report
downloadHTMLReport(vulnerabilityHistory);
```

## Configuration

The `report-generator.js` module does not require any specific configuration. It uses the vulnerability history data provided to it to generate the HTML report.

## Integration Points

The `report-generator.js` module is part of the `VulnTrackr` component within the rEngine Core platform. It is designed to work seamlessly with other components that provide vulnerability data, such as the `VulnScanner` module.

The generated HTML report can be integrated into the rEngine Core user interface or exported for external use, depending on the application's requirements.

## Troubleshooting

## Issue: No history data available to generate report

If the `history` parameter passed to the `generateHTMLReport` function is empty or `undefined`, the module will return an error message indicating the lack of data.

**Solution:** Ensure that the `VulnTrackr` component has collected and stored the necessary vulnerability history data before attempting to generate the report.

## Issue: Incomplete or incorrect data in the report

If the vulnerability history data provided to the module is incomplete or inaccurate, the generated report may not accurately reflect the true security posture.

**Solution:** Verify that the `VulnTrackr` component is correctly collecting and storing the vulnerability data. Double-check the data structure and ensure that all necessary fields are present and populated correctly.

If you encounter any other issues or have additional questions, please refer to the rEngine Core documentation or reach out to the rEngine Core support team for assistance.
