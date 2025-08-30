# Enhanced Document Generator

## Purpose & Overview

The `enhanced-document-generator.js` file is a part of the rEngine Core ecosystem and serves as an "Intelligent Development Wrapper" for generating comprehensive technical documentation. This file provides an automated solution for generating high-quality Markdown documentation for code files, with support for multiple API providers to handle rate limiting and ensure reliable documentation generation.

The key features of this file include:

- **Multi-Provider Support**: The generator can utilize various API providers (e.g., GROQ, OpenAI, Gemini) to generate documentation, automatically choosing the best provider based on the content and rate limiting considerations.
- **Rate Limiting Handling**: The file includes a `MultiProviderRateLimiter` class that manages rate limits for each provider, ensuring that the generator does not exceed the limits and can gracefully fallback to alternative providers if needed.
- **Large File Handling**: The generator can handle large code files by splitting the content into manageable sections and generating documentation for each section separately, then combining the results.
- **Batch Processing**: The generator can process multiple files in a batch, providing a progress report and saving the generated documentation to the appropriate locations.

## Key Functions/Classes

The main components and their roles in the `enhanced-document-generator.js` file are:

1. **EnhancedDocumentGenerator** class:
   - Responsible for the overall document generation process, including provider selection, rate limiting handling, and large file handling.
   - Provides methods for generating documentation for a single file, as well as for batch processing multiple files.
   - Handles the integration with the various API providers and their respective configurations.

1. **MultiProviderRateLimiter** class:
   - Manages the rate limiting for the different API providers, tracking usage and handling rate limit exceptions.
   - Provides methods for choosing the best provider based on the current rate limiting status and the estimated token count for the content.
   - Keeps track of the overall usage statistics for the providers.

1. **makeDocumentRequest** method:
   - Handles the API request to the selected provider, with fallback to alternative providers in case of failures.
   - Supports both Gemini-specific and OpenAI-compatible request formats.

1. **buildDocumentationPrompt** method:
   - Constructs the prompt for the API providers, guiding them to generate comprehensive Markdown documentation based on the provided code content.

1. **splitContentIntoSections** method:
   - Splits the code content into manageable sections, ensuring that each section can be processed efficiently by the API providers.

1. **getOutputPath** method:
   - Determines the output path for the generated documentation, based on the input file path and the configured output directory.

## Dependencies

The `enhanced-document-generator.js` file depends on the following external libraries and resources:

- `fs-extra`: Provides file system-related utilities, including reading/writing files and creating directories.
- `axios`: Used for making HTTP requests to the API providers.
- `dotenv`: Loads environment variables from a `.env` file.
- `multi-provider-rate-limiter.js`: A custom class that handles rate limiting for multiple API providers.
- `system-config.json`: A configuration file that contains the settings for the document manager API.

## Usage Examples

To use the `EnhancedDocumentGenerator` class, you can create an instance and call the `generateDocumentation` method with the path to the file you want to generate documentation for:

```javascript
import EnhancedDocumentGenerator from './enhanced-document-generator.js';

const generator = new EnhancedDocumentGenerator();
const result = await generator.generateDocumentation('path/to/your/file.js');
```

To generate documentation for multiple files in a batch, you can use the `generateBatchDocumentation` method:

```javascript
const filePaths = ['file1.js', 'file2.js', 'file3.js'];
const results = await generator.generateBatchDocumentation(filePaths);
```

You can also use the command-line interface (CLI) to interact with the generator:

```

# Show provider status

node enhanced-document-generator.js status

# Generate documentation for a single file

node enhanced-document-generator.js file path/to/your/file.js

# Generate documentation for multiple files (using a glob pattern)

node enhanced-document-generator.js batch "js/*.js"
```

## Configuration

The `enhanced-document-generator.js` file requires the following configuration:

1. **Environment Variables**:
   - `GROQ_API_KEY`: The API key for the GROQ provider.
   - `OPENAI_API_KEY`: The API key for the OpenAI provider.
   - `GEMINI_API_KEY`: The API key for the Gemini provider.

1. **system-config.json**:
   - This file should be present in the same directory as the `enhanced-document-generator.js` file and should contain the configuration for the document manager API, including the fallback order for the providers and the maximum token limits.

Example `.env` file:

```
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
```

Example `system-config.json` file:

```json
{
  "brainShareSystem": {
    "documentManager": {
      "api": {
        "fallbackOrder": ["groq", "openai", "gemini"],
        "providers": {
          "groq": {
            "endpoint": "https://api.groq.com/v1/generate",
            "defaultModel": "gpt-3.5-turbo",
            "maxTokens": 2048
          },
          "openai": {
            "endpoint": "https://api.openai.com/v1/chat/completions",
            "defaultModel": "gpt-3.5-turbo",
            "maxTokens": 2048
          },
          "gemini": {
            "endpoint": "https://api.geminiai.com/v1/generate",
            "maxTokens": 2048
          }
        }
      }
    }
  }
}
```

## Integration Points

The `enhanced-document-generator.js` file is a core component of the rEngine Core ecosystem and is designed to integrate seamlessly with other parts of the system. Some key integration points include:

1. **Code Repository Integration**: The generator can be used to automatically generate documentation for code files stored in a version control system, such as Git, as part of the development and deployment workflow.
2. **Documentation Generation Pipeline**: The generator can be incorporated into a larger documentation generation pipeline, where it serves as the engine for producing high-quality Markdown documentation for various components of the rEngine Core platform.
3. **API Provider Integration**: The generator's ability to work with multiple API providers, such as GROQ, OpenAI, and Gemini, allows for flexibility and adaptability as new providers or technologies emerge in the market.

## Troubleshooting

1. **Missing API Keys**: If the required API keys (GROQ_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY) are not found in the environment or the `.env` file, the generator will throw an error and exit.

1. **Rate Limiting Issues**: If any of the API providers encounter rate limiting issues, the generator will automatically try to use the next available provider. If all providers are rate-limited, the generator will throw an error.

1. **Large File Handling**: For large code files that exceed the recommended token count, the generator will attempt to split the content into manageable sections and process them individually. However, if a single section is still too large, the generator will skip that section and continue with the remaining sections.

1. **Incomplete or Incorrect Documentation**: If the API providers are unable to generate satisfactory documentation, the generator will log the error and include a placeholder comment in the generated documentation, indicating the issue.

1. **Configuration Issues**: Problems with the `system-config.json` file, such as missing or incorrect provider configurations, can cause the generator to fail. Ensure that the configuration file is present and correctly formatted.

1. **File Not Found**: If the specified file path does not exist, the generator will throw an error.

To address any issues, you can check the console output for error messages and adjust the configuration or environment variables as needed. If you encounter persistent problems, you may need to investigate the API provider services or reach out to the rEngine Core support team for further assistance.
