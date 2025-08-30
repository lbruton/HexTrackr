# rEngine Core: Gemini HTML Converter

## Purpose & Overview

The `gemini-html-converter.js` file is a part of the rEngine Core platform, an "Intelligent Development Wrapper" system. This script is responsible for converting Markdown (MD) files, typically located in the `docs/generated/` directory, into high-quality HTML documentation. The generated HTML files are then saved in the `html-docs/generated/` directory.

The conversion process utilizes the Gemini language model, a state-of-the-art natural language processing (NLP) tool, to transform the Markdown content into well-structured and visually appealing HTML. This helps to ensure that the documentation is easy to read, navigate, and maintain.

## Key Functions/Classes

The `GeminiHTMLConverter` class is the main component of this script, and it provides the following key functions:

1. **`getHTMLTemplate()`**: Generates a unified HTML template with rEngine branding and styling, which will be used to wrap the converted Markdown content.
2. **`findMarkdownFiles()`**: Recursively searches the `docs/generated/` directory for all Markdown files and returns their file paths and relative paths.
3. **`convertWithGemini()`**: Sends the Markdown content to the Gemini API for conversion to HTML, handling any errors and falling back to the `marked.js` library if necessary.
4. **`convertFile()`**: Converts a single Markdown file to HTML, including reading any available metadata, and saves the resulting HTML file to the `html-docs/generated/` directory.
5. **`convertAll()`**: Iterates through all found Markdown files and converts them to HTML, tracking the success and failure rates.
6. **`convertPattern()`**: Allows converting a subset of files by matching a specific pattern in the file path or name.

## Dependencies

The `gemini-html-converter.js` file relies on the following dependencies:

- **Node.js**: The script is written in JavaScript and designed to run in a Node.js environment.
- **fs-extra**: A file system utility library that provides additional functionality beyond the built-in `fs` module.
- **path**: The built-in Node.js module for working with file paths.
- **axios**: An HTTP client library used to make requests to the Gemini API.
- **dotenv**: A library for loading environment variables from a `.env` file.
- **marked**: A Markdown-to-HTML conversion library, used as a fallback when the Gemini API is unavailable or returns an invalid response.

## Usage Examples

To use the `gemini-html-converter.js` script, you can run it from the command line:

```bash
node gemini-html-converter.js
```

This will convert all Markdown files found in the `docs/generated/` directory and save the resulting HTML files in the `html-docs/generated/` directory.

Alternatively, you can specify a pattern to convert a subset of the files:

```bash
node gemini-html-converter.js "my-feature"
```

This will convert only the Markdown files that contain the string "my-feature" in their file path or name.

## Configuration

The `GeminiHTMLConverter` class reads the following configuration from the `.env` file:

- `GEMINI_API_KEY`: The API key required to use the Gemini language model for HTML conversion.

If the `GEMINI_API_KEY` is not found in the `.env` file, the script will exit with an error message.

## Integration Points

The `gemini-html-converter.js` script is a key component of the rEngine Core platform, as it is responsible for generating the HTML documentation that is used throughout the ecosystem. This script can be integrated with other rEngine Core components, such as the build and deployment processes, to ensure that the documentation is always up-to-date and available.

## Troubleshooting

1. **Gemini API Errors**: If the Gemini API returns an invalid response or encounters an error, the script will fall back to using the `marked.js` library for Markdown-to-HTML conversion. However, the quality of the output may not be as high as when using the Gemini API.

1. **Missing Environment Variables**: If the `GEMINI_API_KEY` is not found in the `.env` file, the script will exit with an error message. Ensure that the API key is properly configured.

1. **Encoding Issues**: If the Markdown files contain special characters or non-ASCII text, ensure that they are properly encoded (e.g., UTF-8) to avoid issues during the conversion process.

1. **Incomplete or Missing Metadata**: The script attempts to read metadata from JSON files located in the `docs/generated/json/` directory. If these files are missing or incomplete, the generated HTML may not include all the desired metadata information.

1. **Performance Concerns**: Converting a large number of Markdown files may take some time, especially if the Gemini API has rate limits or other constraints. Consider optimizing the conversion process or breaking it down into smaller batches if performance becomes a concern.
