# rEngine Core: Document Sweep

## Purpose & Overview

The `document-sweep.js` file is a crucial component of the rEngine Core platform, responsible for automatically generating comprehensive technical documentation for all JavaScript files within the rEngine ecosystem. This script utilizes AI-powered document generation capabilities to create detailed Markdown-formatted documentation, which is then saved to the `docs/generated` directory.

The main objectives of the Document Sweep are:

1. **Automated Documentation Generation**: Scan the rEngine codebase, identify all JavaScript files, and generate detailed documentation for each one using AI-powered APIs.
2. **Documentation Maintenance**: Detect changes in existing documentation and generate diffs to track updates, ensuring the documentation stays up-to-date with the codebase.
3. **Roadmap File Synchronization**: Automatically generate HTML versions of key roadmap and documentation files, keeping them in sync with the Markdown sources.
4. **Reporting and Tracking**: Provide comprehensive reporting on the document sweep process, including success rates, changes detected, and any errors encountered.

This script is designed to be run periodically (e.g., as part of a CI/CD pipeline) to maintain a comprehensive and up-to-date set of technical documentation for the rEngine Core platform.

## Key Functions/Classes

The `DocumentSweep` class is the main entry point for the document sweep process. It contains the following key functions:

1. `findJavaScriptFiles()`: Recursively scans the target directories and compiles a list of all JavaScript files to be processed.
2. `generateDocumentation(filePath)`: Generates the documentation for a single JavaScript file using the AI-powered `smart-document-generator.js` script.
3. `generateAndSaveDiff(sourceFilePath, docPath, previousContent)`: Generates a Git-style diff between the previous and new documentation content, and saves the diff to the `logs/documentation-diffs` directory.
4. `generateHtmlDocumentation()`: Converts the Markdown-based roadmap files to HTML using the `HTMLDocGenerator` class.
5. `generateMultiFormatSummary()`: Generates a summary report in Markdown, JSON, and HTML formats, detailing the overall results of the document sweep.
6. `startAutoSync()`: Starts a file watcher that automatically regenerates the HTML documentation when changes are detected in the Markdown roadmap files.
7. `dryRun()`: Performs a dry run of the document sweep process, listing the files that would be processed without actually generating the documentation.

## Dependencies

The `document-sweep.js` file depends on the following external modules and libraries:

- `fs-extra`: Provides an enhanced file system API with additional functionality.
- `path`: Offers utilities for working with file and directory paths.
- `child_process`: Allows the execution of external commands and scripts.
- `url`: Provides utilities for working with URLs.
- `crypto`: Offers cryptographic functionality, used for generating file diffs.
- `./html-doc-generator.js`: A custom module that generates HTML documentation from Markdown files.

Additionally, the script calls the `smart-document-generator.js` script, which is responsible for the AI-powered documentation generation.

## Usage Examples

To run the Document Sweep, you can execute the script using Node.js:

```bash
node document-sweep.js
```

This will perform the full document sweep, generating documentation for all JavaScript files in the specified directories.

To run the script in dry-run mode, which will list the files that would be processed without generating the documentation:

```bash
node document-sweep.js --dry-run
```

To start the auto-sync mode, which will continuously monitor the roadmap Markdown files and automatically regenerate the corresponding HTML documentation:

```bash
node document-sweep.js --auto-sync
```

## Configuration

The `DocumentSweep` class has several configurable properties:

- `baseDir`: The base directory where the rEngine codebase is located (default: `/Volumes/DATA/GitHub/rEngine`).
- `documentGenerator`: The path to the `smart-document-generator.js` script (default: `./smart-document-generator.js`).
- `targetDirectories`: The directories to scan for JavaScript files (default: `['rEngine', 'rProjects/StackTrackr/js', ...]`).
- `roadmapFiles`: The list of Markdown files to be converted to HTML (default: `['docs/MASTER_ROADMAP.md', ...]`).
- `excludePatterns`: The list of directory and file patterns to exclude from the scan (default: `['node_modules', '.git', ...]`).

These properties can be modified in the `DocumentSweep` constructor to customize the behavior of the document sweep process.

## Integration Points

The `document-sweep.js` file is a core component of the rEngine platform and integrates with several other components:

1. **Smart Document Generator**: The `smart-document-generator.js` script is responsible for the AI-powered generation of the documentation content. The `document-sweep.js` file calls this script to generate the documentation for each JavaScript file.
2. **HTML Documentation Generator**: The `HTMLDocGenerator` class is used to convert the Markdown-based roadmap files to HTML format, keeping the documentation in sync across different formats.
3. **Logging and Reporting**: The results of the document sweep process are logged to various files in the `logs` directory, including a detailed JSON summary, a Markdown-formatted summary, and individual diffs for documentation changes.
4. **Continuous Integration**: The document sweep process is typically integrated into the rEngine CI/CD pipeline, running automatically whenever changes are made to the codebase.

## Troubleshooting

Here are some common issues and solutions related to the `document-sweep.js` script:

1. **Timeout Errors**: If the AI-powered documentation generation takes too long for a particular file, the script will fail with a timeout error. You can try increasing the `timeout` value in the `generateDocumentation()` function to allow more time for the generation process.

1. **Directory Not Found**: If the script encounters a directory that does not exist, it will log a warning and continue processing the remaining directories. Ensure that the `targetDirectories` configuration is correct and that the directories exist in the file system.

1. **Encoding Issues**: If the script encounters any issues with file encoding, it may fail to generate the documentation correctly. Ensure that the source files use a compatible encoding, such as UTF-8.

1. **Dependency Errors**: If any of the dependencies (e.g., `fs-extra`, `child_process`) are not installed or accessible, the script will fail. Verify that all required dependencies are installed and available in your environment.

1. **AI Provider Errors**: If there are any issues with the AI-powered document generation API (e.g., rate limits, authentication problems), the script will log the errors and continue processing the remaining files. Ensure that the AI provider integration is configured correctly and that you have the necessary permissions and access.

If you encounter any other issues, you can check the logs in the `logs` directory for more information and error details.
