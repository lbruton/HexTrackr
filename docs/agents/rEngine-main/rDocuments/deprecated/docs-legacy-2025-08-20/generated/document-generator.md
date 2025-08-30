# rEngine Core: Document Generator

## Purpose & Overview

The `document-generator.js` file is a key component of the rEngine Core platform, responsible for automatically generating comprehensive technical documentation for any given script or module. It leverages the power of the Gemini AI model (or the Groq model, if configured) to analyze the script content and produce high-quality, markdown-formatted documentation.

The generated documentation covers a wide range of important details, including:

1. **Title**: A clear title for the document.
2. **Overview**: A concise summary of the script's purpose and its role within the broader rEngine Core system.
3. **How to Use**: Clear instructions on how to run the script from the command line, including any required arguments and a practical example.
4. **Core Logic Breakdown**: A detailed, step-by-step explanation of the script's functionality, describing the main functions, classes, and their responsibilities, as well as the flow of data and control.
5. **Configuration & Dependencies**: Details on any external dependencies (npm packages) or configuration files (e.g., `system-config.json`) that the script relies on, along with an explanation of the key configuration parameters.
6. **Machine-Readable Summary**: A section containing a single JSON object that programmatically describes the script, including its name, purpose, inputs, and outputs.

This comprehensive documentation helps developers and users better understand the rEngine Core ecosystem and effectively utilize the various scripts and modules provided.

## Key Functions/Classes

The `DocumentManager` class is the core component of the `document-generator.js` file. It is responsible for the following key functionalities:

1. **Configuration Loading**: The constructor reads the `system-config.json` file and extracts the necessary configuration parameters for the document generation process, such as the API endpoint, model, and provider.
2. **API Key Management**: The constructor also sets the appropriate API key based on the configured provider (Groq or Gemini).
3. **Prompt Creation**: The `createPrompt()` method generates a detailed prompt for the AI model, based on the input script file's name and content.
4. **Documentation Generation**: The `generate()` method is the main entry point, which reads the input script file, calls the AI model to generate the documentation, and saves the resulting markdown content to the appropriate location.
5. **Documentation Saving**: The `saveDocumentation()` method ensures the necessary directories exist, writes the generated markdown content to a file, and updates the `generated-system-info.json` file with the script's metadata.
6. **System Info Update**: The `updateGeneratedSystemInfo()` method updates the `generated-system-info.json` file with the script's machine-readable summary.

## Dependencies

The `document-generator.js` file relies on the following dependencies:

1. **Node.js**: The script is designed to run on a Node.js environment.
2. **fs-extra**: A comprehensive file system library that provides enhanced functionality over the built-in `fs` module.
3. **path**: The built-in Node.js module for working with file and directory paths.
4. **axios**: A popular HTTP client library for making API calls.
5. **dotenv**: A module for loading environment variables from a `.env` file.

Additionally, the script requires the following configuration files:

1. **system-config.json**: This file contains the necessary configuration for the document generation process, such as the API endpoint, model, and provider.
2. **.env**: This file stores the API keys required for interacting with the Groq or Gemini AI models.

## Usage Examples

To generate documentation for a script using the `document-generator.js` file, follow these steps:

1. Ensure that you have Node.js installed on your system.
2. Clone the rEngine Core repository and navigate to the `rEngine` directory.
3. Install the required dependencies by running `npm install`.
4. Create a `.env` file in the `rEngine` directory and add the appropriate API key (either `GROQ_API_KEY` or `GEMINI_API_KEY`) based on the configured provider in the `system-config.json` file.
5. Run the document generator script with the path to the script you want to document:

   ```bash
   node document-generator.js path/to/your/script.js
   ```

   This will generate the documentation for the specified script and save it as a Markdown file in the `docs/generated` directory.

## Configuration

The `document-generator.js` script relies on the following configuration:

1. **system-config.json**: This file, located in the `rEngine` directory, contains the necessary configuration for the document generation process, including the API endpoint, model, and provider.

   Example `system-config.json`:

   ```json
   {
     "brainShareSystem": {
       "documentManager": {
         "api": {
           "endpoint": "https://api.example.com/v1/models",
           "model": "gpt-3.5-turbo",
           "provider": "gemini"
         }
       },
       "storage": {
         "memoryDirectory": "/path/to/memory/directory"
       }
     }
   }
   ```

1. **.env**: This file, also located in the `rEngine` directory, stores the API key required for interacting with the Groq or Gemini AI models.

   Example `.env` file:

   ```
   GROQ_API_KEY=your_groq_api_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

Make sure to update the `system-config.json` and `.env` files with the appropriate values for your rEngine Core deployment.

## Integration Points

The `document-generator.js` file is a crucial component of the rEngine Core platform, as it enables the automatic generation of comprehensive documentation for all the scripts and modules within the ecosystem. This documentation is essential for developers and users to understand the various components, their functionality, and how they integrate with each other.

The generated documentation files are saved in the `docs/generated` directory, which can be used to publish the documentation on the rEngine Core website or include it in the project's overall documentation.

Additionally, the `generated-system-info.json` file is updated with the metadata for each documented script, providing a programmatic way to interact with the rEngine Core system information.

## Troubleshooting

1. **Error: system-config.json not found**: Ensure that the `system-config.json` file is present in the `rEngine` directory and that the file path is correct.
2. **Error: API key not found in .env**: Verify that the appropriate API key (either `GROQ_API_KEY` or `GEMINI_API_KEY`) is set in the `.env` file.
3. **Error during documentation generation**: Check the error message for more information about the issue. Common problems may include network connectivity, API service unavailability, or issues with the input script file.
4. **Missing machine-readable summary**: If the generated documentation does not contain the expected machine-readable summary section, check the input script file for any formatting issues or unexpected content that may be preventing the parser from extracting the required information.

If you encounter any other issues, please report them to the rEngine Core development team for assistance.
