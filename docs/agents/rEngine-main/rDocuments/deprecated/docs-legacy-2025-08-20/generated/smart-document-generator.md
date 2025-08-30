# Smart Document Generator for rEngine Core

## Purpose & Overview

The `smart-document-generator.js` file is a critical component of the rEngine Core platform, responsible for automatically generating high-quality technical documentation for source code files. This script leverages the power of language models like Groq, Gemini, and Claude to analyze the provided code and generate comprehensive Markdown documentation.

The key features of this smart document generator include:

- **Intelligent Rate Limiting**: The script uses a custom rate limiter to make API requests to the language models, ensuring that it respects the rate limits and avoids being throttled.
- **Smart Chunking**: For large source code files, the generator intelligently splits the content into smaller chunks and processes them in a rate-limited manner, ensuring that the entire file is documented.
- **Persistent State**: The generator maintains a persistent state, allowing it to resume processing if interrupted and avoid duplicating work.
- **Detailed Metadata**: The generator produces detailed JSON metadata for each generated documentation file, including information about the source file, the generated Markdown and HTML, and the processing details.
- **HTML Generation**: While the primary output is Markdown, the generator also produces HTML versions of the documentation, which can be used for publishing and sharing.
- **Intelligent Chunking**: The generator can leverage pre-chunked analysis from the rScribe system, using intelligent boundaries based on the code structure, rather than simple line-based chunking.

By integrating this smart document generator into the rEngine Core platform, developers can enjoy seamless, high-quality documentation for their source code, ensuring that their projects are well-documented and easy to understand.

## Key Functions/Classes

The `SmartDocumentManager` class is the main entry point for the smart document generator. It handles the following key responsibilities:

1. **Configuration Management**: Loads the system configuration, including API endpoint, API key, and provider-specific settings.
2. **Rate Limiting**: Manages the rate limiting logic using the `RateLimiter` and `FastGroqRateLimiter` classes, which handle the API request throttling and exponential backoff.
3. **File Processing**: Implements the core logic for generating documentation, including handling large files, leveraging pre-chunked analysis, and combining the results.
4. **HTML Template Generation**: Provides a method to generate HTML templates for the documentation pages, with a consistent and visually appealing layout.
5. **Metadata Generation**: Generates detailed JSON metadata for each documentation file, capturing information about the source file, the generated Markdown and HTML, and the processing details.
6. **HTML Index Management**: Updates the HTML index file, which provides a centralized entry point for all generated documentation.

The script also includes several helper functions, such as `getFileCategory`, `getFileIcon`, `convertMarkdownToHTML`, and `updateHTMLIndex`, which are used to support the main functionality.

## Dependencies

The `smart-document-generator.js` file relies on the following dependencies:

- `fs-extra`: Provides an enhanced file system API with additional functionality.
- `path`: Handles file and directory paths.
- `axios`: Performs HTTP requests to the language model APIs.
- `dotenv`: Loads environment variables from a `.env` file.
- `marked`: Converts Markdown content to HTML.

These dependencies are imported at the beginning of the file and used throughout the `SmartDocumentManager` class.

## Usage Examples

To use the smart document generator, you can run the script from the command line, passing in the path to the source code file you want to document:

```bash
node smart-document-generator.js /path/to/your/source/file.js
```

The script will automatically generate the Markdown and HTML documentation, as well as the corresponding JSON metadata, and save them to the appropriate directories within the `docs` folder.

If you don't provide a file path, the script will display a usage message and exit:

```bash
node smart-document-generator.js
```

## Configuration

The smart document generator relies on several environment variables, which must be set in a `.env` file in the same directory as the script:

- `GROQ_API_KEY`: The API key for the Groq language model.
- `ANTHROPIC_API_KEY`: The API key for the Anthropic (Claude) language model.
- `GEMINI_API_KEY`: The API key for the Gemini language model.

These API keys are used to authenticate the requests to the respective language model APIs.

The script also reads configuration settings from a `system-config.json` file, which must be present in the same directory as the script. This file contains information about the storage locations, default provider, and other system-level settings.

## Integration Points

The smart document generator is a core component of the rEngine platform, and it integrates with several other components:

1. **rScribe**: The smart document generator can leverage pre-chunked analysis from the rScribe system, using intelligent boundaries based on the code structure to improve the documentation generation process.
2. **rEngine Core**: The generated documentation is a critical part of the overall rEngine Core ecosystem, providing developers with comprehensive information about the various components and their usage.
3. **HTML Documentation**: The HTML versions of the generated documentation can be used for publishing and sharing, either within the rEngine platform or externally.
4. **JSON Metadata**: The detailed JSON metadata produced by the generator can be used for indexing, search, and other data-driven features within the rEngine platform.

## Troubleshooting

Here are some common issues and solutions related to the smart document generator:

1. **Missing API Keys**: If the required API keys (`GROQ_API_KEY`, `ANTHROPIC_API_KEY`, or `GEMINI_API_KEY`) are not found in the `.env` file, the script will throw an error. Ensure that the API keys are correctly configured.

1. **Missing System Configuration**: If the `system-config.json` file is not found in the same directory as the script, the generator will fail to initialize. Ensure that the configuration file is present and correctly formatted.

1. **Rate Limiting Issues**: If the generator is hitting rate limits from the language model APIs, it will automatically handle the rate limiting using the custom `RateLimiter` and `FastGroqRateLimiter` classes. However, if the rate limits are still being exceeded, try adjusting the configuration settings (e.g., `maxRequestsPerMinute`, `maxRequestsPerHour`) or contacting the API providers for higher limits.

1. **Large File Handling**: For large source code files, the generator will automatically split the content into smaller chunks and process them individually. If you encounter issues with this process, try adjusting the `maxFileSizeBytes` and `maxLines` configuration settings.

1. **Interrupted Execution**: If the script is interrupted (e.g., by a system shutdown or power failure), it will attempt to resume processing the next time it is run. However, if the state file (`pre-chunk-queue.json`) becomes corrupted, you may need to delete it and start over.

If you encounter any other issues, please refer to the rEngine Core documentation or reach out to the rEngine support team for assistance.
