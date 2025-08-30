# Enhanced Smart Scribe with Gemini Fallback & Documentation Generator

## Purpose & Overview

The `enhanced-smart-scribe.js` file is a critical component within the rEngine Core platform, responsible for providing an "Intelligent Development Wrapper" with enhanced capabilities for generating and processing structured data. This file introduces the `EnhancedSmartScribe` class, which serves as a unified interface for interacting with various language models (Ollama and Gemini) to perform tasks like:

1. **JSON Parsing**: Reduces noise and improves reliability when parsing JSON responses from language models.
2. **Automatic Documentation Generation**: Generates comprehensive technical documentation, including a README, API documentation, and guides, by leveraging the language models' capabilities.

The primary goals of this component are to:

- Provide a robust and intelligent interface for working with language models.
- Simplify the process of generating high-quality technical documentation.
- Ensure consistent and reliable data processing across the rEngine Core ecosystem.

## Key Functions/Classes

The `EnhancedSmartScribe` class is the main component in this file, and it encompasses the following key functions:

1. **Initialize()**: Checks the available language models, initializes the appropriate model, and sets up the Gemini fallback if necessary.
2. **queryWithFallback()**: Executes a query using the currently selected language model (Ollama or Gemini), and automatically falls back to the other model if the primary one fails.
3. **generateSystemDocumentation()**: Generates comprehensive technical documentation, including a README, API documentation, agent workflow guide, memory system documentation, and a troubleshooting guide.

The class also includes several helper methods, such as `queryGemini()`, `queryOllama()`, and `cleanJSONContent()`, which handle the specifics of interacting with the language models and cleaning up JSON content.

## Dependencies

The `enhanced-smart-scribe.js` file relies on the following dependencies:

- `fs-extra`: For file system operations.
- `path`: For working with file paths.
- `axios`: For making HTTP requests to the language model APIs.
- `child_process`: For executing system commands.
- `url`: For converting file URLs to file paths.

Additionally, the file expects the following environment variables to be set:

- `GEMINI_API_KEY`: The API key for the Gemini language model.

## Usage Examples

To use the `EnhancedSmartScribe` class, you can create an instance and interact with its methods:

```javascript
import EnhancedSmartScribe from './enhanced-smart-scribe.js';

const enhancedScribe = new EnhancedSmartScribe();

// Generate system documentation
await enhancedScribe.generateSystemDocumentation();
```

You can also run the script from the command line with the `--generate-docs` flag to trigger the documentation generation process:

```bash
node enhanced-smart-scribe.js --generate-docs
```

## Configuration

The `EnhancedSmartScribe` class has several configurable properties that can be set in the constructor:

- `baseDir`: The base directory for the project (default: `/Volumes/DATA/GitHub/rEngine`).
- `ollamaEndpoint`: The URL of the Ollama language model API (default: `http://localhost:11434`).
- `primaryModel`: The name of the primary language model to use (default: `'qwen2.5-coder:7b'`).
- `fallbackModel`: The name of the fallback language model to use (default: `'gemma2:2b'`).
- `maxJsonFailures`: The maximum number of JSON parsing failures before switching to the fallback model (default: `3`).

## Integration Points

The `EnhancedSmartScribe` class is a core component of the rEngine Core platform and integrates with various other parts of the system, including:

1. **Memory Intelligence System**: The class uses the memory system APIs (e.g., `recall.js`, `memory-intelligence.js`) to store and retrieve information.
2. **Dual Memory Writer**: The class interacts with the dual memory writer (`dual-memory-writer.js`) to ensure consistent data storage.
3. **Agent Management**: The class utilizes the agent management APIs (`universal-agent-init.js`) to coordinate multi-agent workflows.
4. **MCP Integration**: The class integrates with the MCP (Multi-modal Consensus Protocol) system to leverage its capabilities.
5. **Smart Scribe APIs**: The class provides a unified interface for interacting with the Smart Scribe functionality.

## Troubleshooting

Here are some common issues and solutions related to the `EnhancedSmartScribe` class:

1. **Ollama API Unavailable**:
   - If the Ollama API is not available, the class will automatically fall back to using the Gemini API, if the `GEMINI_API_KEY` environment variable is set.
   - Check the logs for any errors related to the Ollama API, and ensure that the `ollamaEndpoint` configuration is correct.

1. **JSON Parsing Failures**:
   - If the class encounters too many JSON parsing failures (exceeding the `maxJsonFailures` threshold), it will automatically switch to the fallback language model (Gemini or the `fallbackModel` configuration).
   - Check the logs for any errors related to JSON parsing, and ensure that the responses from the language models are structured as expected.

1. **Documentation Generation Issues**:
   - If the documentation generation process fails, check the logs for any errors and ensure that the language models are responding as expected.
   - Verify that the `baseDir` configuration is correct and that the necessary directories and files can be accessed and written to.

1. **Dependency Issues**:
   - Ensure that all the required dependencies (listed in the "Dependencies" section) are installed and available in the project.
   - Check that the necessary environment variables (e.g., `GEMINI_API_KEY`) are correctly set.

If you encounter any other issues, please refer to the rEngine Core documentation or reach out to the development team for further assistance.
