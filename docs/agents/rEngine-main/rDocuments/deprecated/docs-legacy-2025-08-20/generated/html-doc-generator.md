# HTML Documentation Generator for rScribe Workers

## Purpose & Overview

The `html-doc-generator.js` file is a part of the rEngine Core ecosystem, and its purpose is to generate HTML documentation from Markdown files. This script is designed to be used by rScribe Workers, which are responsible for converting Markdown content into various output formats, including HTML and JSON.

The main functionality of this script is to:

1. Load a HTML template file and extract the base CSS styles.
2. Enhance the styles with a custom branding theme and sidebar navigation.
3. Convert Markdown files to HTML, leveraging the `marked` library.
4. Automatically generate a table of contents and navigation based on the Markdown structure.
5. Output the generated HTML files to a designated directory.
6. (Optionally) generate a JSON representation of the Markdown content alongside the HTML.

This script serves as a crucial component in the rEngine Core's documentation generation and publishing workflow, ensuring that Markdown-based documentation is transformed into a visually appealing and easily navigable HTML format.

## Key Functions/Classes

The main class in this file is `HTMLDocGenerator`, which encapsulates the logic for generating HTML documentation from Markdown files. Here are the key functions within this class:

1. `loadTemplate()`: Responsible for loading the base HTML template, extracting the CSS styles, and combining them with custom branding and navigation styles.
2. `generateNavigation(sections)`: Generates the HTML navigation sidebar based on the extracted sections from the Markdown content.
3. `convertMarkdownToHTML(markdownPath, outputPath, options)`: Converts a Markdown file to HTML, including the generation of the navigation and the overall HTML structure.
4. `extractSections(markdownContent)`: Parses the Markdown content and extracts the section titles and subsections, which are used to build the navigation.
5. `generateCompleteHTML(title, navigation, content)`: Generates the complete HTML document by combining the title, navigation, and Markdown-generated content.
6. `generateJSON(markdownPath, jsonPath)`: Generates a JSON representation of the Markdown content, including the extracted sections and metadata.
7. `generateMultiFormat(markdownPath)`: A convenience method that generates both HTML and JSON output for a given Markdown file.

## Dependencies

The `html-doc-generator.js` file relies on the following dependencies:

1. `fs/promises`: The Node.js file system module, used for reading and writing files.
2. `path`: The Node.js path module, used for handling file paths.
3. `marked`: A Markdown-to-HTML conversion library, used to transform the Markdown content to HTML.

## Usage Examples

To use the `HTMLDocGenerator` class, you can create an instance and call the relevant methods. Here's an example:

```javascript
import { HTMLDocGenerator } from './html-doc-generator.js';

async function generateDocumentation() {
  const generator = new HTMLDocGenerator();
  await generator.loadTemplate();

  // Generate HTML only
  await generator.convertMarkdownToHTML('TASK_SUMMARY.md', 'html-docs/TASK_SUMMARY.html');

  // Generate HTML and JSON
  await generator.generateMultiFormat('SQLITE_MIGRATION_PLAN.md');
}

generateDocumentation();
```

The script also supports a command-line interface (CLI) for batch processing of Markdown files. You can run the script with the following arguments:

```
node html-doc-generator.js <markdown-file>     # Generate HTML only
node html-doc-generator.js --all <markdown>    # Generate HTML + JSON
node html-doc-generator.js --batch *.md        # Process multiple files
```

## Configuration

The `HTMLDocGenerator` class does not require any specific environment variables or configuration. However, the script assumes the following directory structure:

- The HTML template file is located at `html-docs/documentation.html`.
- The branding theme CSS file is located at `rEngine/templates/branding-theme.css`.
- The generated HTML files are output to the `html-docs/` directory.
- The generated JSON files are output to the `docs/` directory.

You can modify these paths within the `HTMLDocGenerator` class if your project structure differs.

## Integration Points

The `html-doc-generator.js` file is primarily integrated with the rScribe Workers, which are responsible for converting Markdown content into various output formats. The `HTMLDocGenerator` class provides a convenient way for the rScribe Workers to generate HTML documentation from Markdown files.

Additionally, the generated HTML and JSON files can be used by other rEngine Core components, such as the documentation portal or the API documentation generator, to display and distribute the documentation.

## Troubleshooting

1. **Markdown file not found**: Ensure that the provided Markdown file path is correct and that the file exists in the expected location.
2. **Template file not found**: Verify that the HTML template file (`documentation.html`) and the branding theme CSS file (`branding-theme.css`) are present in the expected locations.
3. **Conversion errors**: If the Markdown-to-HTML conversion fails, check the error message for more details. Common issues may include unsupported Markdown syntax or formatting problems.
4. **Output directory issues**: Ensure that the `html-docs/` and `docs/` directories exist and that the script has the necessary permissions to write files to these locations.
5. **Dependency issues**: Make sure that the required dependencies (`fs/promises`, `path`, `marked`) are installed and available in your project.

If you encounter any other issues, please refer to the rEngine Core documentation or reach out to the rEngine support team for further assistance.
