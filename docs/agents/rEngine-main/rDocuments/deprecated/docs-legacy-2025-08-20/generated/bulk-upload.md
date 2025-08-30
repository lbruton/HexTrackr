# rEngine Core - VulnTrackr Bulk Upload Module

## Purpose & Overview

The `bulk-upload.js` file is a module within the `VulnTrackr` component of the rEngine Core platform. It provides functionality for handling the bulk upload of vulnerability assessment data, specifically related to VPR (Vulnerability Priority Rating) scores.

The main purpose of this module is to:

1. **Process multiple CSV files** containing VPR data
2. **Parse and extract relevant information** from the CSV files
3. **Compute various statistics** for the VPR scores, grouped by severity level
4. **Save the processed results** to the application's history for later reference

This module is a key part of the VulnTrackr feature, which allows users to track and analyze their organization's vulnerability data in a centralized manner.

## Key Functions/Classes

The `bulk-upload.js` file exports the following main functions:

1. **`handleBulkUpload(files)`**: This is the main entry point for the module. It takes an array of files (presumably CSV files) and processes them, returning an object with two properties:
   - `results`: An array of objects, each representing the processed data for a single file
   - `warnings`: An array of string messages describing any errors or issues encountered during the processing

1. **`parseCSVFile(file)`**: This function is responsible for parsing a single CSV file using the PapaParse library. It returns a Promise that resolves to the parsed data (as a 2D array) or rejects with an error message.

1. **`processVPRData(data)`**: This function takes the parsed CSV data (as a 2D array) and computes various statistics related to the VPR scores, such as the count, sum, mean, minimum, and maximum for each severity level (low, medium, high, critical) as well as the overall totals.

1. **`saveResultsToHistory(results)`**: This function is responsible for saving the processed results to the application's history, which is stored in the browser's local storage. It retrieves the existing history, appends the new results, sorts the history by date, and then saves the updated history back to local storage.

## Dependencies

The `bulk-upload.js` file has the following dependencies:

1. **PapaParse**: A popular CSV parsing library used to process the uploaded CSV files.

## Usage Examples

To use the `bulk-upload.js` module in your rEngine Core application, you can import the relevant functions and call them as needed:

```javascript
import { handleBulkUpload, saveResultsToHistory } from './bulk-upload.js';

// Handle a user's file upload
const files = [...]; // Array of File objects
const { results, warnings } = await handleBulkUpload(files);

// Save the processed results to history
const history = saveResultsToHistory(results);

// Display the results and history to the user
console.log(results);
console.log(warnings);
console.log(history);
```

## Configuration

This module does not require any specific configuration. It relies on the browser's local storage to persist the VPR history data.

## Integration Points

The `bulk-upload.js` module is a part of the VulnTrackr component within the rEngine Core platform. It integrates with the following components:

1. **VulnTrackr UI**: The module provides processed VPR data that can be displayed in the VulnTrackr user interface.
2. **Local Storage**: The module uses the browser's local storage to save the VPR history data.

## Troubleshooting

Here are some common issues and solutions related to the `bulk-upload.js` module:

1. **CSV file parsing errors**:
   - **Cause**: The CSV file may have an invalid format or contain unexpected data.
   - **Solution**: Check the error messages in the `warnings` array returned by `handleBulkUpload()` to identify the specific issues with each file. Ensure that the CSV files are properly formatted and contain the required columns (e.g., `definition.vpr.severity` and `definition.vpr.score`).

1. **No valid data rows in the CSV file**:
   - **Cause**: The CSV file may be empty or may not contain the expected data.
   - **Solution**: Verify that the CSV files contain at least two rows (one for the headers and one for the data).

1. **Missing required columns in the CSV file**:
   - **Cause**: The CSV file may be missing the required columns for VPR severity and score.
   - **Solution**: Ensure that the CSV files contain the `definition.vpr.severity` and `definition.vpr.score` columns.

1. **Issues with local storage**:
   - **Cause**: The module may encounter problems when reading from or writing to the browser's local storage.
   - **Solution**: Check the browser's local storage settings and permissions. Ensure that the application has the necessary access to read and write data to the local storage.

If you encounter any other issues, please refer to the rEngine Core documentation or reach out to the support team for further assistance.
