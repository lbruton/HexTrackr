# rEngine Core: `test-direct-apis.js` Documentation

## Purpose & Overview

The `test-direct-apis.js` file is a script that allows you to directly test the integration of the Gemini and Groq APIs within the rEngine Core platform. It bypasses the OpenWebUI component and directly interacts with the respective APIs to generate content based on a given input message.

This script is designed to help developers and users of the rEngine Core platform quickly validate the integration and functionality of these external APIs, without having to go through the full OpenWebUI interface.

## Key Functions/Classes

The main components and their roles in this script are:

1. **`testGeminiDirect(message)`**: This function is responsible for testing the Gemini Direct API integration. It creates a `GoogleGenerativeAI` instance with the provided `GEMINI_API_KEY`, retrieves the Gemini Pro model, and generates content based on the input message.

1. **`testGroqDirect(message)`**: This function is responsible for testing the Groq Direct API integration. It sends a POST request to the Groq API endpoint with the provided `GROQ_API_KEY`, the input message, and the specified configuration (model, max tokens, temperature).

## Dependencies

This script depends on the following external libraries and components:

1. **`@google/generative-ai`**: This library is used to interact with the Google Generative AI services, specifically the Gemini Pro model.
2. **`axios`**: This library is used to make the HTTP POST request to the Groq API endpoint.

Additionally, the script relies on the following environment variables:

- `GEMINI_API_KEY`: The API key required to authenticate with the Gemini API.
- `GROQ_API_KEY`: The API key required to authenticate with the Groq API.

## Usage Examples

To use the `test-direct-apis.js` script, follow these steps:

1. Ensure that you have the necessary environment variables (`GEMINI_API_KEY` and `GROQ_API_KEY`) set in your environment.
2. Run the script with the desired message as an argument:

   ```bash
   node test-direct-apis.js "Hello! Testing direct API integration."
   ```

   If no message is provided, the script will use a default message: "Hello! Testing direct API integration."

## Configuration

The configuration for this script is done through environment variables:

| Environment Variable | Description |
| --- | --- |
| `GEMINI_API_KEY` | The API key required to authenticate with the Gemini API. |
| `GROQ_API_KEY` | The API key required to authenticate with the Groq API. |

Make sure to set these environment variables before running the script.

## Integration Points

The `test-direct-apis.js` script is designed to work within the rEngine Core platform, specifically to test the integration of the Gemini and Groq APIs. It can be used as a standalone script or integrated into the rEngine Core's overall testing and development workflow.

## Troubleshooting

If you encounter any issues while running the `test-direct-apis.js` script, here are some common problems and their solutions:

1. **Missing API Keys**:
   - Error message: `❌ GEMINI_API_KEY not found in environment` or `❌ GROQ_API_KEY not found in environment`
   - Solution: Ensure that the required API keys are set as environment variables before running the script.

1. **API Integration Failure**:
   - Error message: `❌ Gemini Direct Failed: ...` or `❌ Groq Direct Failed: ...`
   - Solution: Check the error message for more details on the specific issue. Verify that the API keys are correct and that the APIs are functioning as expected.

1. **Timeout Errors**:
   - Error message: `Error: timeout of 30000ms exceeded`
   - Solution: Increase the timeout value in the `testGroqDirect()` function to allow more time for the API response.

If you encounter any other issues, please refer to the rEngine Core documentation or reach out to the development team for further assistance.
