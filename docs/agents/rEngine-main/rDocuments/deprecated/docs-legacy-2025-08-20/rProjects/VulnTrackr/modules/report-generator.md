# Report Generator Documentation

## Purpose & Overview

The `report-generator.js` script is a part of a larger system that tracks and analyzes VPR (Vulnerability Prioritization Rating) scores. The main purpose of this script is to generate a comprehensive HTML report based on the historical VPR score data. This report provides an executive summary, the latest scan results, historical trends, and a detailed scan history table.

The generated report is designed to be clear, visually appealing, and informative, helping stakeholders and security teams understand the vulnerability landscape and make informed decisions.

## Technical Architecture

The script consists of three main functions:

1. `generateHTMLReport(history)`: This is the main function that generates the complete HTML report. It takes an array of historical VPR score data as input and returns the generated HTML.

1. `generateLatestResults(latestScan)`: This function generates the HTML for the "Latest Scan Results" section of the report. It takes the latest scan data as input and displays the vulnerability counts, sums, and means for each severity level.

1. `generateHistoryTable(history)`: This function generates the HTML for the "Scan History" table. It takes the entire history array as input and creates a table with the relevant data for each scan.

The script also includes a `downloadHTMLReport(history)` function, which allows the user to download the generated HTML report as a file.

The report generation process involves the following data flow:

1. The script receives the historical VPR score data as an input array.
2. The data is sorted by date (newest first) and passed to the `generateHTMLReport` function.
3. The `generateHTMLReport` function calls the `generateLatestResults` and `generateHistoryTable` functions to generate the respective sections of the report.
4. The final HTML report is assembled and returned.

## Dependencies

The script does not have any external dependencies. It uses only built-in JavaScript functionality to generate the HTML report.

## Key Functions/Classes

1. `generateHTMLReport(history)`:
   - Parameters:
     - `history` (Array): An array of historical VPR score data, where each object in the array has the following structure:
       - `date` (string): The date of the scan
       - `filename` (string): The filename of the scan report
       - `data` (object): An object containing the vulnerability data for the scan, with the following properties:
         - `low` (object): An object with `count`, `sum`, and `mean` properties for low-severity vulnerabilities
         - `medium` (object): An object with `count`, `sum`, and `mean` properties for medium-severity vulnerabilities
         - `high` (object): An object with `count`, `sum`, and `mean` properties for high-severity vulnerabilities
         - `critical` (object): An object with `count`, `sum`, and `mean` properties for critical-severity vulnerabilities
         - `total` (object): An object with `count`, `sum`, and `mean` properties for the total vulnerabilities
   - Return value: A string containing the generated HTML report.

1. `generateLatestResults(latestScan)`:
   - Parameters:
     - `latestScan` (object): The latest VPR score data, with the same structure as the objects in the `history` array.
   - Return value: A string containing the HTML for the "Latest Scan Results" section of the report.

1. `generateHistoryTable(history)`:
   - Parameters:
     - `history` (Array): An array of historical VPR score data, with the same structure as the `history` parameter in `generateHTMLReport`.
   - Return value: A string containing the HTML for the "Scan History" table.

1. `downloadHTMLReport(history)`:
   - Parameters:
     - `history` (Array): An array of historical VPR score data, with the same structure as the `history` parameter in `generateHTMLReport`.
   - Return value: None. This function downloads the generated HTML report as a file.

## Usage Examples

To use the report generator, you would typically follow these steps:

1. Import the necessary functions from the `report-generator.js` file:

```javascript
import { generateHTMLReport, downloadHTMLReport } from './report-generator.js';
```

1. Provide the historical VPR score data as an array:

```javascript
const vprHistory = [
  {
    date: '2023-04-01',
    filename: 'vpr-report-2023-04-01.json',
    data: {
      low: { count: 10, sum: 50.0, mean: 5.0 },
      medium: { count: 5, sum: 75.0, mean: 15.0 },
      high: { count: 3, sum: 90.0, mean: 30.0 },
      critical: { count: 1, sum: 80.0, mean: 80.0 },
      total: { count: 19, sum: 295.0, mean: 15.5 }
    }
  },
  // Add more historical data as needed
];
```

1. Generate the HTML report:

```javascript
const htmlReport = generateHTMLReport(vprHistory);
```

1. Display the report or download it as a file:

```javascript
// Display the report (e.g., in a web page)
document.getElementById('report-container').innerHTML = htmlReport;

// Download the report as a file
downloadHTMLReport(vprHistory);
```

## Configuration

The script does not have any configuration options or environment variables. The historical VPR score data is passed as an input array to the functions.

## Error Handling

The script checks for the presence of the `history` array before generating the report. If the `history` array is empty or undefined, the script returns an error message instead of the report.

## Integration

This report generator script is designed to be integrated into a larger system that tracks and analyzes VPR scores. It can be used as a standalone component or integrated into a web application or other system that requires VPR score reporting.

## Development Notes

1. **Styling**: The script includes extensive CSS styling to create a visually appealing and professional-looking report. This styling can be customized or replaced as needed to match the branding and design requirements of the larger system.

1. **Chart Rendering**: The script includes a placeholder for a chart that would display the historical VPR score trends. In a real implementation, this chart would be rendered using a JavaScript charting library, such as Chart.js or D3.js.

1. **Filename Generation**: The `downloadHTMLReport` function generates a filename for the downloaded report based on the current date. This can be modified to include additional information, such as the report title or the user's name.

1. **Accessibility**: While the current styling and HTML structure aim for a clean and readable report, additional accessibility features, such as proper heading structure, alt text for images, and ARIA labels, could be added to improve the report's usability for users with disabilities.

1. **Performance**: The script currently generates the entire HTML report in a single string. For very large datasets, this approach may impact performance. In such cases, the report generation could be broken down into smaller, modular components that are rendered dynamically.

Overall, this script provides a solid foundation for generating comprehensive and visually appealing VPR score reports. The modular design and well-documented functions make it easy to extend and integrate into a larger system.
