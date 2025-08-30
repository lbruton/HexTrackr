# Smart Document Generator

## Purpose & Overview

The `smart-document-generator.js` script is a powerful tool for automatically generating comprehensive Markdown documentation for JavaScript files. It utilizes various AI language models (GROQ, Gemini, and Claude) to analyze the code and generate detailed documentation, including the purpose, technical architecture, dependencies, key functions/classes, usage examples, configuration, error handling, integration, and development notes.

The key features of this script include:

- **Auto Rate Limiting**: The script uses a rate limiter to handle API request limits, with exponential backoff to avoid exceeding the limits.
- **Smart Chunking**: For large files, the script automatically chunks the content and generates documentation for each chunk, ensuring the output remains manageable.
- **Automatic Retries**: The script automatically retries failed requests, handling errors gracefully and providing detailed error logging.
- **Persistent State**: The script maintains state across runs, allowing for seamless continuation of the documentation generation process.
- **Real-time Progress and Stats**: The script provides real-time updates on the progress of the documentation generation, as well as detailed statistics.

## Technical Architecture

The `SmartDocumentManager` class is the core component of the script, responsible for orchestrating the entire documentation generation process. It has the following key components:

1. **Rate Limiter**: Handles API request rate limiting with exponential backoff.
2. **Request Functions**: Implements the different AI language model APIs (`makeGroqRequest`, `makeGeminiRequest`, `makeClaudeRequest`) to generate the documentation.
3. **Prompt Creation**: Generates the prompts for the AI language models based on the provided file information.
4. **Documentation Saving**: Saves the generated Markdown documentation, HTML, and JSON metadata to the appropriate directories.
5. **HTML Index Update**: Updates the HTML index file to include the newly generated documentation.
6. **Shutdown Handling**: Gracefully shuts down the script and the rate limiter.

The script also includes a CLI interface that allows users to generate documentation for a specific file path.

## Dependencies

The script has the following external dependencies:

1. `axios`: Used for making HTTP requests to the AI language model APIs.
2. `fs-extra`: Provides an enhanced file system API with additional functionality, such as ensuring directory existence.
3. `path`: Used for handling file paths.

## Key Functions/Classes

### `SmartDocumentManager` Class

#### `generate(filePath, customFilename = null)`

- **Parameters**:
  - `filePath` (string): The file path of the script to generate documentation for.
  - `customFilename` (string | null): Optional custom filename for the generated documentation.
- **Return Value**: A Promise that resolves to an object containing the paths to the generated Markdown, HTML, and JSON files.
- **Description**: The main entry point for generating documentation. It handles the overall process, including rate limiting, chunking, error handling, and saving the generated documentation.

#### `makeGroqRequest(prompt)`

- **Parameters**:
  - `prompt` (string): The prompt to send to the GROQ language model.
- **Return Value**: A Promise that resolves to the generated documentation content.
- **Description**: Sends a request to the GROQ language model and returns the generated documentation.

#### `makeGeminiRequest(prompt)`

- **Parameters**:
  - `prompt` (string): The prompt to send to the Gemini language model.
- **Return Value**: A Promise that resolves to the generated documentation content.
- **Description**: Sends a request to the Gemini language model and returns the generated documentation.

#### `makeClaudeRequest(prompt)`

- **Parameters**:
  - `prompt` (string): The prompt to send to the Claude language model.
- **Return Value**: A Promise that resolves to the generated documentation content.
- **Description**: Sends a request to the Claude language model and returns the generated documentation.

#### `createPrompt(filename, fileContent)`

- **Parameters**:
  - `filename` (string): The name of the file to generate documentation for.
  - `fileContent` (string): The content of the file to generate documentation for.
- **Return Value**: A string containing the prompt for the AI language model.
- **Description**: Generates the prompt to be sent to the AI language model, based on the file information and the required documentation structure.

#### `saveDocumentation(originalFilePath, content, suffix = null, stats = null)`

- **Parameters**:
  - `originalFilePath` (string): The original file path of the script.
  - `content` (string): The generated documentation content.
  - `suffix` (string | null): Optional suffix for the generated documentation file name.
  - `stats` (object | null): Optional statistics object for the generated documentation.
- **Return Value**: A Promise that resolves to an object containing the paths to the generated Markdown, HTML, and JSON files.
- **Description**: Saves the generated Markdown documentation, generates HTML, and saves the JSON metadata for the documentation.

#### `shutdown()`

- **Parameters**: None
- **Return Value**: A Promise that resolves when the shutdown process is complete.
- **Description**: Gracefully shuts down the `SmartDocumentManager` and the rate limiter.

#### `getStats()`

- **Parameters**: None
- **Return Value**: An object containing the current statistics of the `SmartDocumentManager`.
- **Description**: Returns the current statistics of the `SmartDocumentManager`, including the number of requests made, the number of retries, and the current rate limit status.

## Usage Examples

To use the `SmartDocumentManager`, you can create an instance and call the `generate` method with the file path of the script you want to generate documentation for:

```javascript
const manager = new SmartDocumentManager();
await manager.generate('path/to/your/script.js');
```

You can also provide a custom filename for the generated documentation:

```javascript
await manager.generate('path/to/your/script.js', 'custom-filename');
```

## Configuration

The `SmartDocumentManager` class has the following configuration options:

- `apiEndpoint`: The API endpoint for the AI language model to use.
- `apiKey`: The API key for the AI language model.
- `model`: The name of the AI language model to use (e.g., 'gpt-3.5-turbo').
- `docsDir`: The directory where the generated documentation will be saved.

These options can be set in the constructor of the `SmartDocumentManager` class.

## Error Handling

The `SmartDocumentManager` class handles errors in the following ways:

1. **API Errors**: If there is an error response from the AI language model API, the error details (status and data) are logged to the console.
2. **Other Errors**: For any other errors that occur during the documentation generation process, the error message is logged to the console.
3. **Retry Handling**: The script automatically retries failed requests, with exponential backoff to avoid exceeding rate limits.
4. **Graceful Shutdown**: If an error occurs during the documentation generation process, the `SmartDocumentManager` class will attempt to gracefully shut down the rate limiter before exiting.

## Integration

The `smart-document-generator.js` script is designed to be used as a standalone tool for generating documentation for JavaScript files. It can be integrated into a larger system or workflow, such as a continuous integration/continuous deployment (CI/CD) pipeline, to automatically generate documentation for the codebase.

## Development Notes

1. **Rate Limiting**: The script uses a rate limiter to handle API request limits, with exponential backoff to avoid exceeding the limits. This ensures that the script can run reliably without hitting rate limits.

1. **Chunking**: For large files, the script automatically chunks the content and generates documentation for each chunk. This ensures that the output remains manageable and avoids issues with the maximum output token limits of the AI language models.

1. **Persistent State**: The script maintains state across runs, allowing for seamless continuation of the documentation generation process. This is particularly useful when dealing with large codebases or in the context of a CI/CD pipeline.

1. **Modular Design**: The script is designed with a modular structure, making it easy to extend or modify the functionality, such as adding support for new AI language models or customizing the documentation generation process.

1. **Error Handling**: The script provides robust error handling, with automatic retries and detailed error logging. This ensures that the documentation generation process can continue even in the face of temporary API issues or other errors.

1. **CLI Integration**: The script includes a CLI interface, making it easy to use and integrate into various development workflows.

1. **Customization**: The script allows for custom filenames and provides flexibility in terms of the generated documentation structure and content. This enables users to tailor the output to their specific needs.

Overall, the `smart-document-generator.js` script is a powerful and versatile tool for automating the documentation generation process for JavaScript projects, with a focus on reliability, scalability, and ease of integration.
