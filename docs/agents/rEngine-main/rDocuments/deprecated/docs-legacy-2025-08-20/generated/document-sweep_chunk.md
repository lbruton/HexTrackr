# Document Sweep Summary

## Purpose & Overview

The `document-sweep.js` script is responsible for generating comprehensive documentation for a codebase. It scans the project directory, identifies JavaScript files, and generates Markdown, JSON, and HTML summaries of the changes and errors detected during the documentation generation process. The script is designed to be run as a part of a continuous integration (CI) or automation workflow to ensure that the project's documentation is up-to-date and accessible in multiple formats.

## Technical Architecture

The `DocumentSweep` class is the main entry point for the script. It has the following key components:

1. **File Discovery**: The `findJavaScriptFiles()` method is responsible for locating all JavaScript files in the project directory.
2. **Markdown Summary Generation**: The `generateMarkdownSummary()` method generates a detailed Markdown summary of the documentation generation process, including the overall execution summary, changes detected, and any errors encountered.
3. **HTML Generation**: The `HTMLGenerator` class (not shown in the provided code) is responsible for generating HTML documentation from the source files.
4. **Logging and Reporting**: The `printSummary()` method logs the overall results of the documentation sweep to the console, and also saves a detailed JSON report to the `logs/` directory.
5. **Auto-Sync**: The `startAutoSync()` method sets up a file watcher using the `chokidar` library to automatically regenerate the HTML documentation when changes are detected in the "roadmap" files.

The script uses several external dependencies, including `fs-extra` for file system operations and `chokidar` for the auto-sync functionality.

## Dependencies

The script has the following external dependencies:

- `fs-extra`: For advanced file system operations
- `chokidar`: For file change monitoring and auto-sync functionality

## Key Functions/Classes

### `DocumentSweep` Class

The `DocumentSweep` class is the main entry point for the script and has the following key methods:

1. **`performSweep()`**: Performs the main documentation generation process, including file discovery, HTML generation, and summary reporting.
2. **`generateMarkdownSummary(data)`**: Generates a detailed Markdown summary of the documentation generation process, based on the provided `data` object.
3. **`printSummary()`**: Logs the overall results of the documentation sweep to the console and saves a detailed JSON report to the `logs/` directory.
4. **`startAutoSync()`**: Sets up a file watcher to automatically regenerate the HTML documentation when changes are detected in the "roadmap" files.
5. **`dryRun()`**: Previews the files that would be processed without actually generating the documentation.

### `HTMLGenerator` Class (Not Shown)

The `HTMLGenerator` class is responsible for generating HTML documentation from the source files. It is not shown in the provided code, but it likely has methods for parsing the source files, generating the HTML content, and saving the output files.

## Usage Examples

1. **Perform a full documentation sweep**:

   ```bash
   node document-sweep.js
   ```

1. **Run a dry run to preview the files that would be processed**:

   ```bash
   node document-sweep.js --dry-run
   ```

1. **Start the auto-sync mode to watch for changes in the roadmap files**:

   ```bash
   node document-sweep.js --auto-sync
   ```

## Configuration

The script does not have any explicit configuration options or environment variables. However, the paths and file names for the "roadmap" files are hardcoded in the `startAutoSync()` method:

```javascript
const roadmapFiles = [
    'MASTER_ROADMAP.md',
    'TASK_SUMMARY.md', 
    'RSCRIBE_DOCUMENT_PROTOCOL.md'
].map(file => path.join(this.baseDir, file));
```

You may need to update these paths and file names to match your project's structure.

## Error Handling

The script handles errors in the following ways:

1. **HTML Generation Errors**: If there is an error during the HTML generation process, the script logs the error message to the console using `console.error()`.
2. **General Errors**: If an error occurs during the main `performSweep()` or `startAutoSync()` methods, the script logs the error message to the console using `console.error()` and then exits the process with a non-zero exit code.

## Integration

The `document-sweep.js` script is designed to be integrated into a larger system or workflow, such as a continuous integration (CI) pipeline. It can be used to automatically generate and update the project's documentation as part of the build process, ensuring that the documentation remains up-to-date and accessible in multiple formats (Markdown, JSON, and HTML).

## Development Notes

1. **Dependency Management**: The script uses the `chokidar` library for file change monitoring and auto-sync functionality. This library is not a standard Node.js module and may need to be installed separately.
2. **Path Handling**: The script uses the `path` module to handle file and directory paths in a cross-platform manner.
3. **Logging and Reporting**: The script generates detailed logs and reports, which can be useful for troubleshooting and monitoring the documentation generation process.
4. **Extensibility**: The script is designed to be extensible, with the ability to add new features or customize the documentation generation process as needed.
