# rEngine Core: Claude HTML Documentation Generator

## Purpose & Overview

The `claude-html-generator.js` file is part of the rEngine Core platform and is responsible for converting Markdown-formatted documentation into professional-looking HTML files with the rEngine Core branding and styling. This tool uses the Anthropic Claude AI model to generate the HTML output, ensuring a consistent and visually appealing presentation of the rEngine Core documentation.

The key features of this generator include:

1. Automatic conversion of Markdown files to HTML with rEngine Core branding
2. Inclusion of navigation, responsive design, and professional styling
3. Preservation of technical content and code blocks
4. Addition of the rEngine Core header and "Intelligent Development Wrapper" tagline
5. Use of the Inter font family and syntax highlighting for code blocks
6. Responsive and mobile-friendly design
7. Generation of an index.html file for easy navigation of the documentation portal

## Key Functions/Classes

The `ClaudeHTMLGenerator` class is the main component of this file and handles the following responsibilities:

1. **Validation of the Anthropic API Key**: Ensures that a valid API key is available for interacting with the Claude AI model.
2. **Conversion of Markdown to HTML**: Utilizes the Claude AI model to convert the provided Markdown content into HTML with the specified rEngine Core branding and styling.
3. **Generation of HTML Documentation**: Iterates through all Markdown files in the input directory, converts them to HTML, and writes the results to the output directory.
4. **Generation of the Documentation Index**: Creates an `index.html` file that provides a centralized portal for accessing the generated HTML documentation.

## Dependencies

The `claude-html-generator.js` file has the following dependencies:

1. **Node.js**: This script is designed to run in a Node.js environment.
2. **fs**: The built-in Node.js file system module, used for reading and writing files.
3. **path**: The built-in Node.js path module, used for managing file paths.
4. **dotenv**: A library for loading environment variables from a `.env` file.

## Usage Examples

To use the Claude HTML Documentation Generator, follow these steps:

1. Ensure that you have Node.js installed on your system.
2. Clone the rEngine Core repository and navigate to the `rEngine` directory.
3. Create a `.env` file in the `rEngine` directory and add your Anthropic API key:

   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

1. Run the generator script:

   ```bash
   node claude-html-generator.js
   ```

   This will:

   - Validate the Anthropic API key
   - Convert all Markdown files in the `../docs/generated` directory to HTML
   - Save the generated HTML files in the `../html-docs/generated` directory
   - Create an `index.html` file in the `../html-docs/generated` directory for easy navigation

1. Open the `index.html` file in your web browser to access the rEngine Core documentation portal.

## Configuration

The `ClaudeHTMLGenerator` class has several configurable properties:

- `apiKey`: The Anthropic API key, which must be provided in the `.env` file.
- `inputDir`: The directory containing the Markdown documentation files (default: `'../docs/generated'`).
- `outputDir`: The directory where the generated HTML files will be saved (default: `'../html-docs/generated'`).
- `templateDir`: The directory containing the HTML template files (default: `'../html-docs/vision'`).
- `rateLimit`: The rate limit in milliseconds between requests to the Anthropic API (default: `1000` milliseconds, or 1 second).
- `branding`: An object containing the rEngine Core branding details, including the name, tagline, and color scheme.

## Integration Points

The `claude-html-generator.js` file is a standalone tool within the rEngine Core ecosystem, but it is designed to work seamlessly with the overall documentation workflow. The generated HTML files can be integrated with the rEngine Core website or deployed as a standalone documentation portal.

Additionally, the `ClaudeHTMLGenerator` class can be imported and used by other rEngine Core components that require the generation of HTML documentation from Markdown sources.

## Troubleshooting

## Issue: No ANTHROPIC_API_KEY found in environment

- Ensure that you have added your Anthropic API key to the `.env` file in the `rEngine` directory.

## Issue: Claude API Error

- Check the error message for more details on the specific API error.
- Verify that your Anthropic API key is valid and has the necessary permissions.
- Ensure that you have an active internet connection and that the Anthropic API is accessible.

## Issue: Error converting Markdown to HTML

- Ensure that the Markdown files in the `inputDir` directory are properly formatted and do not contain any syntax errors.
- Check the error message for more information on the specific issue.
- Try running the script again, as the Anthropic API may have temporary rate limiting or other issues.

If you encounter any other issues, please report them to the rEngine Core development team for further assistance.
