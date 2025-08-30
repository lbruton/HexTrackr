# rEngine Core: `test-simple.js` Documentation

## Purpose & Overview

The `test-simple.js` file is a part of the rEngine Core ecosystem and serves as a quick test for the multi-provider AI system. This script demonstrates how to interact with two different AI providers, Groq and Gemini, to generate responses to a simple prompt.

The purpose of this file is to validate the functionality of the rEngine Core's multi-provider integration, ensuring that the system can seamlessly utilize different AI models and services to provide a robust and reliable AI-powered experience.

## Key Functions/Classes

The `test-simple.js` file contains the following key functions:

1. `testGroq()`: This function tests the Groq API by sending a POST request to the Groq API endpoint with a predefined prompt and model. It then returns the generated response from the Groq API.

1. `testGemini()`: This function tests the Gemini API by sending a POST request to the Gemini API endpoint with a predefined prompt. It then parses the response and returns the generated content.

1. `runTests()`: This function orchestrates the execution of the Groq and Gemini tests, logs the results, and handles any errors that may occur during the testing process.

## Dependencies

The `test-simple.js` file has the following dependencies:

1. **Node.js**: The script is written for execution in a Node.js environment.
2. **Environment Variables**: The script requires the following environment variables to be set:
   - `GROQ_API_KEY`: The API key for the Groq API.
   - `GEMINI_API_KEY`: The API key for the Gemini API.

## Usage Examples

To run the `test-simple.js` script, follow these steps:

1. Ensure that you have Node.js installed on your system.
2. Set the required environment variables (`GROQ_API_KEY` and `GEMINI_API_KEY`) with the appropriate values.
3. Save the `test-simple.js` file in your rEngine Core project directory.
4. Open a terminal or command prompt, navigate to the project directory, and run the following command:

   ```bash
   node test-simple.js
   ```

   This will execute the `runTests()` function, which will perform the Groq and Gemini API tests and log the results to the console.

## Configuration

The `test-simple.js` file requires the following configuration:

1. **Environment Variables**:
   - `GROQ_API_KEY`: The API key for the Groq API.
   - `GEMINI_API_KEY`: The API key for the Gemini API.

These environment variables must be set before running the script.

## Integration Points

The `test-simple.js` file is part of the rEngine Core ecosystem and is intended to be used for testing and validating the multi-provider AI system. It can be integrated into automated testing workflows or executed manually during the development and deployment of the rEngine Core platform.

## Troubleshooting

If you encounter any issues while running the `test-simple.js` script, here are some common problems and their potential solutions:

1. **Environment Variables Not Set**: Ensure that the required environment variables (`GROQ_API_KEY` and `GEMINI_API_KEY`) are properly set before running the script.

1. **API Key Issues**: Verify that the API keys used for the Groq and Gemini APIs are valid and have the necessary permissions to access the corresponding services.

1. **Network Connectivity Problems**: Check your network connection and ensure that the script can successfully make requests to the Groq and Gemini API endpoints.

1. **Unexpected Response Formats**: If the API responses do not match the expected format, update the script to handle the changes accordingly.

If you continue to encounter issues, consult the rEngine Core documentation or reach out to the development team for further assistance.
