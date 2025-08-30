# rEngine Core: `add-context.js` Documentation

## Purpose & Overview

The `add-context.js` file is an Enhanced Context Entry Tool that integrates with the rEngine Core's Memory Consolidation Platform (MCP). This tool allows users to submit new context entries to the MCP memory server, which can be used to enhance the knowledge base and improve the performance of the rEngine Core platform.

## Key Functions/Classes

1. **`addContextEntry(title, description, entryType)`**: This asynchronous function is responsible for submitting a new context entry to the MCP memory server. It takes the following parameters:
   - `title`: The title of the context entry.
   - `description`: The description of the context entry.
   - `entryType`: The type of the context entry (default is `'general'`).

1. **`interactiveMode()`**: This asynchronous function runs the tool in interactive mode, where the user is prompted to enter the title, description, and optional entry type for the new context entry.

1. **`main()`**: This is the main entry point of the script, which handles the command-line arguments and calls either the `interactiveMode()` or the `addContextEntry()` function based on the provided arguments.

## Dependencies

The `add-context.js` file depends on the following:

1. **`readline`**: A built-in Node.js module used for handling user input in interactive mode.
2. **`mcp-client.js`**: A module that provides the `addMemory()` function for submitting context entries to the MCP memory server.

## Usage Examples

1. **Interactive Mode**:

   ```bash
   node add-context.js
   ```

   This will run the tool in interactive mode, prompting the user to enter the title, description, and optional entry type for the new context entry.

1. **Direct Mode**:

   ```bash
   node add-context.js "My Context Entry" "This is a description of the context entry." "custom"
   ```

   This will directly submit a new context entry with the provided title, description, and entry type (in this case, `"custom"`).

## Configuration

The `add-context.js` file does not require any specific configuration. It relies on the `mcp-client.js` module to handle the connection and authentication with the MCP memory server.

## Integration Points

The `add-context.js` file is a standalone tool that integrates with the rEngine Core's MCP. It can be used independently or as part of a larger rEngine Core workflow to enhance the platform's knowledge base.

## Troubleshooting

1. **Failed to add context to memory**:
   - Check the error message for any additional information about the failure.
   - Ensure that the MCP memory server is accessible and that the necessary authentication credentials are configured correctly in the `mcp-client.js` module.
   - Try running the tool in interactive mode to ensure that the input data is valid.

1. **Invalid command-line arguments**:
   - If the provided command-line arguments are invalid, the tool will display the correct usage information and exit with a non-zero status code.
   - Refer to the "Usage Examples" section for the correct command-line syntax.

If you encounter any other issues, please refer to the rEngine Core documentation or reach out to the development team for further assistance.
