# fix-documentation-links.js

## Purpose & Overview

This script is designed to fix documentation links in HTML files that have been moved to a new location. It automatically updates the links in the HTML files to point to the correct, updated locations.

The script is particularly useful when you've reorganized your documentation files, such as moving Markdown files, JSON files, and HTML files to a new directory structure. It helps ensure that all the links in your documentation remain accurate and up-to-date, even after significant changes to the file locations.

## Technical Architecture

The script is written in JavaScript and uses the following key components:

1. **File System Operations**: The script uses the `fs-extra` library to read and write files.
2. **Path Manipulation**: The `path` module is used to work with file paths and perform directory/filename operations.
3. **Link Fixing Logic**: The script defines an array of `linkMappings` that specify the old and new locations of various types of files (HTML, Markdown, JSON, etc.). It then iterates through the list of HTML files and replaces the links using these mappings.

The data flow is as follows:

1. The `fixDocumentationLinks()` function is called, which is the entry point of the script.
2. The script identifies the HTML files that need to be updated, based on the predefined file paths.
3. For each HTML file, the `fixFileLinks()` function is called, which reads the file content, applies the link mappings, and writes the updated content back to the file.

## Dependencies

The script has the following dependencies:

1. `fs-extra`: A comprehensive file system library for Node.js that adds extra functionality to the built-in `fs` module.
2. `path`: The built-in Node.js module for working with file and directory paths.

## Key Functions/Classes

1. `fixDocumentationLinks()`:
   - **Purpose**: The main entry point of the script, responsible for orchestrating the link fixing process.
   - **Parameters**: None.
   - **Return Value**: None.

1. `fixFileLinks(filePath, mappings)`:
   - **Purpose**: Reads the content of an HTML file, applies the specified link mappings, and writes the updated content back to the file.
   - **Parameters**:
     - `filePath`: The full path to the HTML file.
     - `mappings`: An array of link mapping objects, each with `from` and `to` properties.
   - **Return Value**: None.

## Usage Examples

To use this script, follow these steps:

1. Ensure you have Node.js installed on your system.
2. Save the script to a file, e.g., `fix-documentation-links.js`.
3. Install the required dependencies by running `npm install fs-extra`.
4. Adjust the `htmlDocsDir` variable in the script to point to the directory containing the HTML documentation files that need to be updated.
5. Run the script using the command `node fix-documentation-links.js`.

The script will automatically update the links in the specified HTML files and log the progress to the console.

## Configuration

The script has the following configuration options:

1. `htmlDocsDir`: The directory path where the HTML documentation files are located. This should be set to the appropriate path in your project.
2. `files`: An array of file paths that need to be updated. By default, this includes `documentation.html` and `developmentstatus.html`.
3. `linkMappings`: An array of objects that define the old and new locations of various types of files (HTML, Markdown, JSON, etc.). You can customize these mappings as needed to match your specific file structure changes.

## Error Handling

The script handles errors that may occur during the link fixing process. If an error occurs while reading or writing a file, the script will log the error message to the console.

## Integration

This script is designed to be used as a standalone tool to update documentation links. It can be integrated into your build or deployment process to ensure that the documentation links are always up-to-date, even after significant changes to the file structure.

## Development Notes

- The script uses a set of predefined link mappings to replace the old links with the new ones. These mappings may need to be adjusted if your file structure changes in a way that is not covered by the default mappings.
- The script assumes that the HTML files are located in a specific directory (`/Volumes/DATA/GitHub/rEngine/html-docs`). You may need to update this path to match your project's file structure.
- The script uses the `fs-extra` library, which provides additional functionality beyond the built-in `fs` module. This makes it easier to work with file system operations.
- The script is designed to be run as a standalone script, but it could also be integrated into a larger build or deployment process.
