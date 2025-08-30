# rEngine Core: Two-Stage Documentation Generator

## Purpose & Overview

The `generate-docs.sh` script is a two-stage documentation generator for the rEngine Core platform. It serves as an automated tool to generate comprehensive technical documentation in Markdown (MD) and HTML formats.

The script follows a two-stage process:

1. **Stage 1: Groq for MD/JSON** - The script utilizes the `smart-document-generator.js` module to parse the input file and generate Markdown (MD) and JSON documentation.
2. **Stage 2: Gemini for HTML** - The generated MD documentation is then converted to HTML format using the `gemini-html-converter.js` module.

This approach allows rEngine Core to maintain a centralized source of documentation that can be easily converted to different output formats, facilitating seamless integration and distribution of technical information.

## Key Functions/Classes

The `generate-docs.sh` script primarily interacts with the following components:

1. **smart-document-generator.js**: This module is responsible for parsing the input file and generating Markdown (MD) and JSON documentation.
2. **gemini-html-converter.js**: This module converts the generated Markdown (MD) documentation to HTML format.

## Dependencies

The `generate-docs.sh` script depends on the following components within the rEngine Core platform:

1. **rEngine/smart-document-generator.js**: Generates Markdown (MD) and JSON documentation from the input file.
2. **rEngine/gemini-html-converter.js**: Converts the generated Markdown (MD) documentation to HTML format.

## Usage Examples

To use the `generate-docs.sh` script, follow these steps:

1. Navigate to the `scripts` directory of the rEngine Core project.
2. Run the script with the desired file path as an argument:

   ```bash
   ./generate-docs.sh rProjects/StackTrackr/js/inventory.js
   ```

   This will generate the Markdown (MD) and JSON documentation for the `inventory.js` file, and then convert the MD documentation to HTML format.

1. Additional options are available:

   - `./generate-docs.sh --convert-all`: Converts all existing Markdown (MD) files to HTML format.
   - `./generate-docs.sh --html-only [pattern]`: Converts Markdown (MD) files matching the specified pattern to HTML format.

## Configuration

The `generate-docs.sh` script does not require any additional configuration. It uses the default settings and paths within the rEngine Core platform.

## Integration Points

The `generate-docs.sh` script is a key component in the rEngine Core documentation ecosystem. It integrates with the following components:

1. **smart-document-generator.js**: Generates the initial Markdown (MD) and JSON documentation.
2. **gemini-html-converter.js**: Converts the generated Markdown (MD) documentation to HTML format.
3. **rEngine Core Documentation Portal**: The generated HTML documentation can be accessed and viewed through the rEngine Core Documentation Portal.

## Troubleshooting

1. **MD/JSON Generation Error**: If the script encounters an error during the Markdown (MD) and JSON generation stage (Stage 1), check the error output and ensure that the input file is valid and accessible.

1. **HTML Conversion Error**: If the script encounters an error during the HTML conversion stage (Stage 2), check the error output and ensure that the Markdown (MD) documentation was generated correctly in the previous stage.

1. **Missing Dependencies**: Ensure that the `smart-document-generator.js` and `gemini-html-converter.js` modules are available in the expected locations within the rEngine Core project.

If you encounter any other issues, please refer to the rEngine Core documentation or reach out to the rEngine Core support team for further assistance.
