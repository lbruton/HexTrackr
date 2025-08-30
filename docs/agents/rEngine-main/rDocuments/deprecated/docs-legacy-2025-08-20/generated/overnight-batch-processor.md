# rEngine Core: Overnight Batch Processor

## Purpose & Overview

The `overnight-batch-processor.js` file is a part of the rEngine Core platform and is responsible for running an overnight batch processing routine. This script is designed to process large files in a conservative and fault-tolerant manner, ensuring that the processing can run unattended with excellent error handling.

The main purpose of this script is to provide a robust and reliable way to generate documents or other artifacts from input files, such as CSS and JavaScript files. This functionality is particularly useful for the StackTrackr project, which is part of the rEngine Core ecosystem.

## Key Functions/Classes

The main component in this file is the `OvernightBatchProcessor` class, which encapsulates the following key functions:

1. **`constructor()`**: Initializes the batch processor by setting up the log file, recording the start time, and logging the beginning of the batch processing.
2. **`log(message)`**: Logs the provided message to the console and the log file.
3. **`processFile(filePath)`**: Processes a single file by dynamically importing the `smart-document-generator.js` script and executing it with the given file path. It handles any errors that may occur during the processing and returns the result.
4. **`processBatch(filePatterns)`**: Processes a batch of files by finding all files that match the provided patterns, calling `processFile()` for each file, and keeping track of the overall results.
5. **`findFiles(pattern)`**: Finds all files that match the given pattern, supporting the `*.css` and `*.js` patterns.
6. **`generateReport(results)`**: Generates a detailed report of the batch processing, including the overall summary and the detailed results for each file. The report is logged and also saved to a file.

## Dependencies

The `overnight-batch-processor.js` file depends on the following external libraries and modules:

1. **`fs-extra`**: Provides an enhanced file system API with additional functionality, such as ensuring directory existence.
2. **`path`**: Handles file paths and directory operations.
3. **`child_process`**: Allows the script to execute external commands and processes.
4. **`util`**: Provides utility functions, such as `promisify()`, which is used to convert a callback-based function into a Promise-based one.

Additionally, the script dynamically imports the `smart-document-generator.js` file, which is responsible for the actual document generation.

## Usage Examples

To run the overnight batch processor, you can execute the script using the following command:

```bash
node overnight-batch-processor.js [custom-patterns]
```

If no custom patterns are provided, the script will use the default patterns defined in the `main()` function:

```javascript
const patterns = [
    'rProjects/StackTrackr/css/*.css',
    'rProjects/StackTrackr/js/*.js',
    'js/*.js',
    'scripts/*.js'
];
```

You can pass one or more custom patterns as command-line arguments to override the default patterns:

```bash
node overnight-batch-processor.js '*.css' '*.js'
```

## Configuration

The `overnight-batch-processor.js` file does not require any specific environment variables or configuration files. The log file path and other internal settings are handled within the script itself.

## Integration Points

The `overnight-batch-processor.js` script is designed to be part of the rEngine Core platform and works in conjunction with the `smart-document-generator.js` script, which is responsible for the actual document generation.

This script can be integrated into the larger rEngine Core ecosystem, potentially being triggered by a scheduler or other event-driven mechanisms to run the overnight batch processing routine.

## Troubleshooting

### Common Issues and Solutions

1. **Timeout or buffer exceeded**: If a file takes too long to process or generates too much output, the script will log the error and move on to the next file. You can adjust the timeout and buffer size settings in the `processFile()` method if needed.

1. **Missing dependencies**: Ensure that the required dependencies (`fs-extra`, `path`, `child_process`, and `util`) are installed and available to the script.

1. **Incorrect file patterns**: If the file patterns provided are not matching the expected files, double-check the patterns and the file structure in your project.

1. **Unexpected errors**: In case of any unexpected errors, check the log file for more details and try to identify the root cause of the issue.

### Logging and Debugging

The `overnight-batch-processor.js` script provides comprehensive logging to both the console and a log file. The log file can be found in the `logs` directory and is named `batch-processing-<date>.log`.

Additionally, the script generates a detailed report file in the `logs` directory, named `batch-report-<date>.md`, which provides a summary of the batch processing and the detailed results for each file.

These logs and reports can be helpful in troubleshooting any issues that may arise during the overnight batch processing.
