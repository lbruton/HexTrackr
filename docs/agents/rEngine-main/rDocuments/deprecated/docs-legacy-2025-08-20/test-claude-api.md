# test-claude-api.js Documentation

## Purpose & Overview

This script is a simple test utility to verify that the Anthropic Claude API is accessible and functioning correctly. It retrieves an API key from the environment, sends a test request to the Claude API, and logs the response. This script is useful for quickly checking the integration of the Claude API before using it in a production application.

## Technical Architecture

The script is a Node.js script that uses the `fetch` API to make a POST request to the Anthropic Claude API. The key steps are:

1. Load the API key from the environment using the `dotenv` package.
2. Construct the API request with the appropriate headers and request body.
3. Send the request to the Claude API endpoint and handle the response.
4. Log the success or failure of the API request.

The script is structured as a single `testClaudeAPI` function that encapsulates the entire API interaction.

## Dependencies

The script has the following dependencies:

- `dotenv`: Used to load the Anthropic API key from the environment.

## Key Functions/Classes

### `testClaudeAPI()`

The main function that tests the Claude API integration.

## Parameters:

- None

## Return Values:

- `true` if the API request is successful
- `false` if the API request fails

## Function Steps:

1. Retrieve the Anthropic API key from the environment.
2. If the API key is not found, log an error and return `false`.
3. Construct the API request with the appropriate headers and request body.
4. Send the API request using `fetch`.
5. If the API response is not successful, log the error and return `false`.
6. Parse the API response and log the Claude API's response content.
7. Log a success message and return `true`.
8. If any errors occur during the request, log the error and return `false`.

## Usage Examples

To use this script, follow these steps:

1. Ensure you have Node.js installed on your system.
2. Set the `ANTHROPIC_API_KEY` environment variable to your Anthropic API key.
3. Save the script to a file (e.g., `test-claude-api.js`).
4. Run the script using the following command:

   ```bash
   node test-claude-api.js
   ```

   The script will output the status of the API test, including the API key and the response from the Claude API.

## Configuration

The script relies on the `ANTHROPIC_API_KEY` environment variable to be set with a valid Anthropic API key. No other configuration is required.

## Error Handling

The script handles the following errors:

- If the `ANTHROPIC_API_KEY` environment variable is not set, the script logs an error and returns `false`.
- If the API request fails, the script logs the error response status and text, and returns `false`.
- If any other errors occur during the API request, the script logs the error message and returns `false`.

## Integration

This script is a standalone utility that can be used to verify the integration of the Anthropic Claude API within a larger system. It can be run as a pre-deployment check or as part of a continuous integration/deployment pipeline.

## Development Notes

- The script uses the `fetch` API, which is a modern JavaScript feature. If you need to support older environments, you may need to use a polyfill or an alternative library like `axios`.
- The script sets the `anthropic-version` header to `2023-06-01`, which corresponds to the current version of the Claude API. You may need to update this version as the API evolves.
- The script uses the `claude-3-haiku-20240307` model for the test request. You may want to update this to use a different model, depending on your use case.
