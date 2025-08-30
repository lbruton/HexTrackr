# Documentation HTML Generator

## Purpose & Overview

The `documentation-html-generator.js` file is a part of the rEngine Core ecosystem, responsible for converting all Markdown (`.md`) files in the `docs/`, `patchnotes/`, and `rEngine-patchnotes/` directories into beautiful and responsive HTML pages. This generator follows the established design patterns from the `developmentstatus.html` file, ensuring a consistent look and feel across the documentation.

The generated HTML pages include features like:

- Syntax-highlighted code blocks
- Responsive layout for different screen sizes
- Category-specific color schemes
- Navigation links to related documentation and resources

By automating the conversion of Markdown files to HTML, this generator simplifies the process of maintaining and publishing the rEngine Core documentation.

## Key Functions/Classes

The main class in this file is `DocumentationHTMLGenerator`, which handles the following responsibilities:

1. **Initialization**: Sets up the necessary directories and files, including the output directory for the generated HTML files.
2. **Markdown Conversion**: Converts Markdown content to HTML using the `marked` library, with customized options for syntax highlighting and other formatting.
3. **Template Management**: Provides a template HTML file that is used to generate the final HTML pages, with placeholders for dynamic content.
4. **File Generation**: Generates an HTML file for each Markdown file, using the template and extracting relevant metadata (title, category, last updated, file size, etc.).
5. **Index Page Generation**: Creates an index page that lists all the generated documentation pages, including statistics and navigation links.

## Dependencies

The `documentation-html-generator.js` file depends on the following external libraries:

- `fs-extra`: A file system library that provides additional functionality beyond the built-in Node.js `fs` module.
- `path`: A built-in Node.js module for working with file and directory paths.
- `fileURLToPath`: A built-in Node.js function for converting a file URL to a file path.
- `marked`: A Markdown parsing and compiling library used to convert Markdown content to HTML.

## Usage Examples

To generate the HTML documentation, you can run the `DocumentationHTMLGenerator` class directly from the command line:

```bash
node documentation-html-generator.js
```

This will scan the `docs/`, `patchnotes/`, and `rEngine-patchnotes/` directories, convert all Markdown files to HTML, and save the generated files in the `docs/html/` directory.

Alternatively, you can import the `DocumentationHTMLGenerator` class and use it in your own code:

```javascript
import { DocumentationHTMLGenerator } from './documentation-html-generator.js';

const generator = new DocumentationHTMLGenerator();
await generator.generateAllHTML();
```

## Configuration

The `DocumentationHTMLGenerator` class has several configurable properties:

- `docsDir`: The directory containing the Markdown documentation files.
- `patchNotesDir`: The directory containing the patch notes Markdown files.
- `rEnginePatchNotesDir`: The directory containing the rEngine-specific patch notes Markdown files.
- `outputDir`: The directory where the generated HTML files will be saved.
- `templatePath`: The path to the HTML template file used for generating the documentation pages.

These paths can be customized as needed to fit the specific file structure of your rEngine Core project.

## Integration Points

The `documentation-html-generator.js` file is a standalone utility that can be used independently within the rEngine Core ecosystem. However, it is designed to work seamlessly with other components, such as:

- **Markdown Documentation**: The generator expects Markdown files to be located in the configured directories, following the established naming conventions and metadata structure.
- **Development Status**: The generated HTML pages include links to the `developmentstatus.html` file, providing a unified view of the rEngine Core project status.
- **JSON Data**: The generated HTML pages also include links to the corresponding JSON data files, allowing for programmatic access to the documentation content.

## Troubleshooting

Here are some common issues and solutions related to the `documentation-html-generator.js` file:

**Issue**: The generated HTML pages are not rendering correctly or have missing content.

**Solution**: Check the following:

1. Ensure that the Markdown files are formatted correctly and follow the expected structure (e.g., correct use of headings, code blocks, etc.).
2. Verify that the HTML template file (`doc-template.html`) is correctly configured and includes all the necessary placeholders.
3. Check the output directory permissions to ensure the generator can write the HTML files.
4. Inspect the console for any error messages that may provide more information about the issue.

**Issue**: The generated index page is not displaying all the documentation pages.

**Solution**:

1. Verify that the `findMarkdownFiles` function is correctly scanning all the expected directories for Markdown files.
2. Check if any Markdown files are being skipped or excluded during the generation process.
3. Ensure that the `generateIndexPage` function is correctly processing the list of generated HTML pages.

**Issue**: The generated HTML pages have incorrect or missing metadata (e.g., title, category, last updated, file size).

**Solution**:

1. Ensure that the Markdown files have the expected metadata structure (e.g., correct use of the first-level heading for the title).
2. Check the `getDocumentCategory` function to make sure it is correctly identifying the category for each Markdown file.
3. Verify that the file stat information (last updated, file size) is being properly retrieved and included in the generated HTML.

If you encounter any other issues, please refer to the console output for error messages and debugging information, or consult the rEngine Core documentation and support resources for further assistance.
