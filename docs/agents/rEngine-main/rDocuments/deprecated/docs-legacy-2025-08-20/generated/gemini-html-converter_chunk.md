# Gemini HTML Converter

## Purpose & Overview

The `GeminiHTMLConverter` script is a powerful tool that converts Markdown files to HTML pages. It leverages the Gemini API to perform the conversion, providing a high-quality output. In the event that the Gemini API is unavailable or the conversion fails, the script falls back to using the `marked.js` library as a backup.

This script is particularly useful for projects that generate technical documentation, blog posts, or other content in Markdown format, and need to convert it to a more easily consumable HTML format for web publication.

## Technical Architecture

The `GeminiHTMLConverter` class is the central component of this script. It contains the following key methods:

1. `convertWithGemini(markdownContent, title, relativePath)`: This method takes Markdown content, a title, and a relative file path, and uses the Gemini API to convert the Markdown to HTML. If the Gemini API call fails, it falls back to using the `marked.js` library.

1. `convertFile(file)`: This method converts a single Markdown file to HTML. It reads the Markdown content, converts it using `convertWithGemini()`, and then generates a full HTML page template with the converted content. The HTML file is then saved to the output directory.

1. `convertAll()`: This method scans the source directory for all Markdown files, converts them to HTML using `convertFile()`, and saves the resulting HTML files to the output directory.

1. `convertPattern(pattern)`: This method allows you to convert a subset of Markdown files that match a specific pattern in their file name or relative path.

The script also includes a `main()` function that handles the command-line execution of the script, allowing you to convert all files or a specific pattern.

## Dependencies

The `GeminiHTMLConverter` class relies on the following external dependencies:

- `fs-extra`: A file system library that provides additional functionality over the built-in `fs` module.
- `path`: The Node.js built-in path module, used for working with file and directory paths.
- `axios`: A popular HTTP client library used to make the API request to the Gemini service.
- `marked`: A Markdown-to-HTML conversion library, used as a fallback when the Gemini API is unavailable.

## Key Functions/Classes

### `GeminiHTMLConverter` Class

**Constructor**:

- `constructor(sourceDir, outputDir)`
  - `sourceDir`: The directory containing the Markdown files to be converted.
  - `outputDir`: The directory where the generated HTML files will be saved.

**Methods**:

1. `convertWithGemini(markdownContent, title, relativePath)`:
   - **Parameters**:
     - `markdownContent`: The Markdown content to be converted.
     - `title`: The title of the Markdown file.
     - `relativePath`: The relative file path of the Markdown file.
   - **Return Value**: The converted HTML content, or throws an error if the conversion fails.

1. `convertFile(file)`:
   - **Parameters**:
     - `file`: An object representing a Markdown file, with properties `fullPath`, `relativePath`, `name`.
   - **Return Value**: None, but it saves the converted HTML file to the output directory.

1. `convertAll()`:
   - **Parameters**: None.
   - **Return Value**: None, but it converts all Markdown files in the source directory and saves the HTML files to the output directory.

1. `convertPattern(pattern)`:
   - **Parameters**:
     - `pattern`: A string representing a pattern to match against the Markdown file names or relative paths.
   - **Return Value**: None, but it converts the Markdown files that match the specified pattern and saves the HTML files to the output directory.

## Usage Examples

1. **Convert all Markdown files**:

```bash
node gemini-html-converter.js
```

1. **Convert Markdown files matching a pattern**:

```bash
node gemini-html-converter.js "my-article"
```

This will convert all Markdown files that have "my-article" in their file name or relative path.

## Configuration

The `GeminiHTMLConverter` class has the following configuration options:

1. `sourceDir`: The directory containing the Markdown files to be converted.
2. `outputDir`: The directory where the generated HTML files will be saved.

These options are passed to the constructor when creating a new instance of the `GeminiHTMLConverter` class.

## Error Handling

The `GeminiHTMLConverter` class handles errors in the following ways:

1. **Gemini API Conversion Failure**: If the Gemini API call fails for any reason, the script logs a warning message and falls back to using the `marked.js` library for the conversion.
2. **File Reading/Writing Errors**: If there are any errors reading the Markdown files or writing the HTML files, the script logs an error message and continues to the next file.
3. **Metadata Reading Errors**: If the script fails to read the metadata JSON file for a Markdown file, it logs a warning message and continues without the metadata.

## Integration

The `GeminiHTMLConverter` script is designed to be a standalone utility that can be integrated into various project workflows. It can be used as part of a build process, a deployment pipeline, or even as a standalone script to convert Markdown files to HTML.

The script can be easily incorporated into other Node.js projects by importing the `GeminiHTMLConverter` class and using it in the appropriate part of the application.

## Development Notes

1. **Gemini API Limits**: The script includes a 1-second delay between each Gemini API call to respect the service's rate limits.
2. **Metadata Integration**: The script reads optional JSON metadata files alongside the Markdown files and includes this information in the generated HTML pages.
3. **Fallback to `marked.js`**: The script uses the `marked.js` library as a fallback when the Gemini API is unavailable or the conversion fails. This ensures that the script can always generate HTML output, even if the primary conversion method is not working.
4. **Modular Design**: The `GeminiHTMLConverter` class is designed to be modular and extensible, allowing for easy integration into other projects and potential future enhancements.
