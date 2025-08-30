# HeyGemini: Direct Gemini API Interaction Script

## Purpose & Overview

The `heygemini.js` script is a command-line tool that allows users to directly interact with the Gemini API, a language model developed by Google. This script serves as a convenient entry point for developers and users to leverage the Gemini API within the rEngine Core ecosystem.

The primary purpose of this script is to provide a simple and straightforward way to query the Gemini API and retrieve responses to user-provided questions. It acts as a bridge between the rEngine Core platform and the Gemini API, enabling users to tap into the powerful language generation capabilities of the Gemini model.

## Key Functions/Classes

1. **`askGemini(question)`**: This asynchronous function takes a user-provided question as input, initializes the `GoogleGenerativeAI` class with the `GEMINI_API_KEY`, and then uses the `generateContent` method to obtain a response from the Gemini API. The response is then logged to the console.

## Dependencies

The `heygemini.js` script depends on the following dependencies:

1. **`fs`**: The built-in Node.js file system module, used for interacting with the file system.
2. **`path`**: The built-in Node.js path module, used for working with file paths.
3. **`fileURLToPath`**: A function from the built-in Node.js `url` module, used for converting a file URL to a file path.
4. **`dotenv`**: A third-party library for loading environment variables from a `.env` file.
5. **`@google/generative-ai`**: A third-party library that provides an interface for interacting with Google's Generative AI models, including the Gemini model.

## Usage Examples

To use the `heygemini.js` script, follow these steps:

1. Ensure you have Node.js installed on your system.
2. Clone the rEngine Core repository and navigate to the `scripts` directory.
3. Run the script with your question as a command-line argument:

```bash
node heygemini.js "What is the capital of France?"
```

Alternatively, you can make the script executable and run it directly:

```bash
chmod +x heygemini.js
./heygemini.js "What is the capital of France?"
```

The script will output the response from the Gemini API to the console.

## Configuration

The `heygemini.js` script requires the `GEMINI_API_KEY` environment variable to be set. This API key is used to authenticate with the Gemini API.

To set the `GEMINI_API_KEY`, follow these steps:

1. Create a `.env` file in the `rEngine` directory of the rEngine Core repository.
2. Add the following line to the `.env` file, replacing `YOUR_GEMINI_API_KEY` with your actual API key:

```
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

1. Save the `.env` file.

The script will automatically load the `GEMINI_API_KEY` from the `.env` file when it is executed.

## Integration Points

The `heygemini.js` script is designed to be used as a standalone tool within the rEngine Core ecosystem. However, it can also be integrated into other rEngine Core components or applications that require direct interaction with the Gemini API.

For example, you could integrate the `askGemini` function into a larger rEngine Core application that provides advanced language processing capabilities, allowing users to leverage the Gemini API's text generation features seamlessly.

## Troubleshooting

1. **GEMINI_API_KEY not found**: If you see the error message `❌ GEMINI_API_KEY not found in rEngine/.env`, ensure that you have correctly set the `GEMINI_API_KEY` environment variable in the `.env` file located in the `rEngine` directory.

1. **Error calling Gemini API**: If you encounter an error message related to calling the Gemini API, double-check the following:
   - Ensure that the `GEMINI_API_KEY` is valid and has the necessary permissions to access the Gemini API.
   - Verify that you have a stable internet connection, as the script relies on making a remote API call.
   - Check the error message for any additional details that might help you identify the root cause of the issue.

1. **Usage instructions not clear**: If you need further clarification on how to use the `heygemini.js` script, refer to the "Usage Examples" section of this documentation or consult the help message printed by the script when no question is provided.
