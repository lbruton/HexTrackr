# Bulk Upload Module for VPR Score Tracking

## Purpose & Overview

The `bulk-upload.js` script provides a set of functions for handling the bulk upload and processing of VPR (Vulnerability Priority Rating) data. This script is designed to simplify the process of importing and analyzing VPR data from multiple CSV files, making it easier to track and monitor VPR scores across an organization.

The script includes the following key features:

1. **Batch File Handling**: The `handleBulkUpload` function allows users to upload multiple CSV files simultaneously and process the data in a batch.
2. **CSV Parsing**: The `parseCSVFile` function uses the PapaParse library to parse the contents of a CSV file, handling errors and validating the data.
3. **VPR Data Processing**: The `processVPRData` function analyzes the parsed CSV data, extracting relevant VPR information (severity, score) and calculating various statistics (mean, min, max) for each severity level.
4. **Result Persistence**: The `saveResultsToHistory` function stores the processed VPR data in the browser's local storage, allowing users to access and review past upload results.

By providing a centralized and streamlined approach to VPR data management, this script aims to improve the efficiency and accuracy of vulnerability tracking and reporting within an organization.

## Technical Architecture

The `bulk-upload.js` script is organized into several key components:

1. **Bulk Upload Handling**: The `handleBulkUpload` function is the main entry point, responsible for iterating through the provided files, parsing the CSV data, and processing the VPR information.
2. **CSV Parsing**: The `parseCSVFile` function uses the PapaParse library to parse the contents of a CSV file, handling errors and validating the data structure.
3. **VPR Data Processing**: The `processVPRData` function is responsible for analyzing the parsed CSV data, extracting the relevant VPR information, and calculating various statistics.
4. **Result Persistence**: The `saveResultsToHistory` function is used to store the processed VPR data in the browser's local storage, allowing users to access and review past upload results.

The data flow within the script is as follows:

1. The `handleBulkUpload` function receives an array of CSV files.
2. For each file, the `parseCSVFile` function is called to parse the CSV data.
3. The `processVPRData` function is then used to extract and analyze the VPR information from the parsed data.
4. The processed results are returned by `handleBulkUpload`.
5. The `saveResultsToHistory` function is used to store the processed results in the browser's local storage.

## Dependencies

The `bulk-upload.js` script has the following external dependency:

- **PapaParse**: A powerful CSV parsing library used to handle the parsing of CSV files.

## Key Functions/Classes

### `handleBulkUpload(files)`

- **Purpose**: Handles the bulk upload and processing of multiple CSV files containing VPR data.
- **Parameters**:
  - `files`: An array of File objects representing the CSV files to be processed.
- **Return Value**: An object with the following properties:
  - `results`: An array of objects, each representing the processed data for a single file. Each object has the following properties:
    - `filename`: The name of the processed file.
    - `date`: The date when the file was processed.
    - `data`: The processed VPR data, as returned by the `processVPRData` function.
  - `warnings`: An array of strings, each representing a warning or error message encountered during the processing of a file.

### `parseCSVFile(file)`

- **Purpose**: Parses the contents of a CSV file using the PapaParse library.
- **Parameters**:
  - `file`: A File object representing the CSV file to be parsed.
- **Return Value**: A Promise that resolves to the parsed CSV data (an array of arrays).

### `processVPRData(data)`

- **Purpose**: Processes the parsed CSV data, extracting and analyzing the VPR information.
- **Parameters**:
  - `data`: The parsed CSV data, represented as an array of arrays.
- **Return Value**: An object containing the processed VPR data, with the following properties:
  - For each severity level ('low', 'medium', 'high', 'critical'):
    - `count`: The number of VPR entries with the given severity.
    - `sum`: The sum of the VPR scores for the given severity.
    - `mean`: The average VPR score for the given severity.
    - `min`: The minimum VPR score for the given severity.
    - `max`: The maximum VPR score for the given severity.
  - `total`:
    - `count`: The total number of VPR entries.
    - `sum`: The sum of all VPR scores.
    - `mean`: The average VPR score across all entries.
    - `min`: The minimum VPR score across all entries.
    - `max`: The maximum VPR score across all entries.

### `saveResultsToHistory(results)`

- **Purpose**: Saves the processed VPR data to the browser's local storage, allowing users to access and review past upload results.
- **Parameters**:
  - `results`: The `results` array returned by the `handleBulkUpload` function.
- **Return Value**: The updated history array, including the newly saved results.

## Usage Examples

1. **Bulk Upload and Process VPR Data**:

```javascript
import { handleBulkUpload, saveResultsToHistory } from './bulk-upload.js';

// Assuming you have an array of File objects representing the CSV files to be processed
const csvFiles = [file1, file2, file3];

// Process the CSV files
const { results, warnings } = await handleBulkUpload(csvFiles);

// Save the processed results to history
const history = saveResultsToHistory(results);

// Display any warnings
warnings.forEach(warning => console.warn(warning));

// Access the processed VPR data
console.log(history);
```

1. **Retrieve Past Upload Results**:

```javascript
import { saveResultsToHistory } from './bulk-upload.js';

// Get the existing upload history from local storage
const history = saveResultsToHistory([]);

// Access the processed VPR data
console.log(history);
```

## Configuration

The `bulk-upload.js` script does not require any specific configuration options or environment variables. It relies on the browser's local storage to persist the processed VPR data.

## Error Handling

The `bulk-upload.js` script handles the following types of errors:

1. **CSV Parsing Errors**: If the PapaParse library encounters any errors while parsing a CSV file, the `parseCSVFile` function will reject the Promise with an error message.
2. **Missing Required Columns**: If the `processVPRData` function does not find the required 'definition.vpr.severity' or 'definition.vpr.score' columns in the parsed CSV data, it will throw an error.
3. **General Errors**: Any other errors that occur during the processing of a file will be caught and added to the `warnings` array returned by the `handleBulkUpload` function.

## Integration

The `bulk-upload.js` script is designed to be a standalone module that can be integrated into a larger system or application. It can be imported and used in other parts of the codebase to provide bulk VPR data processing and history management functionality.

## Development Notes

1. **PapaParse Usage**: The `parseCSVFile` function uses the PapaParse library to parse the CSV files. PapaParse is a powerful and flexible CSV parsing library that can handle a wide range of CSV formats and edge cases.
2. **Local Storage Usage**: The `saveResultsToHistory` function uses the browser's local storage to persist the processed VPR data. This allows users to access and review past upload results, even after refreshing the page or closing the application.
3. **Separation of Concerns**: The script is designed with a clear separation of concerns, with each function focusing on a specific task (file handling, CSV parsing, VPR data processing, and result persistence). This makes the code more modular, maintainable, and testable.
4. **Error Handling**: The script includes robust error handling, with specific error messages and warnings to help users troubleshoot any issues that may arise during the upload and processing of VPR data.
5. **Performance Considerations**: The script is designed to handle batch processing of multiple CSV files, which may involve processing large amounts of data. While the current implementation is efficient, for extremely large datasets, further optimizations may be necessary to ensure smooth performance.
