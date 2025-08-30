# rEngine Command Client

## Purpose & Overview

The `rengine-client.js` file is a command-line interface (CLI) tool that allows developers to send commands to the rEngine MCP (Master Control Program) server for execution. It serves as a client for interacting with the rEngine Core platform, providing a convenient way to interact with rEngine's various features and functionality.

The rEngine Command Client is designed to simplify the process of executing commands on the rEngine platform, abstracting away the low-level details of communicating with the rEngine MCP server. It provides a straightforward interface for developers to send commands and retrieve the corresponding results.

## Key Functions/Classes

The `rengine-client.js` file primarily contains two key functions:

1. **`sendCommand(command, args)`**:
   - This function is responsible for sending a command to the rEngine MCP server for execution.
   - It takes two parameters:
     - `command`: The name of the command to be executed on the rEngine platform.
     - `args`: An object containing any arguments or parameters required by the command.
   - The function uses the `node-fetch` library to make a POST request to the rEngine MCP server's `/command` endpoint, passing the command and arguments as the request payload.
   - If the command execution is successful, the function returns the response from the rEngine MCP server.
   - If an error occurs during the command execution, the function logs the error message and throws the error.

1. **`main()`**:
   - This is the entry point of the CLI tool.
   - It parses the command-line arguments, extracts the command and its arguments, and then calls the `sendCommand` function to execute the command on the rEngine platform.
   - If no command is provided, the function displays the usage instructions and exits the program.
   - The `main` function is only executed when the script is run directly (not imported as a module).

## Dependencies

The `rengine-client.js` file has the following dependency:

- **`node-fetch`**: A library that provides a `fetch` API for making HTTP requests from Node.js, which is used to communicate with the rEngine MCP server.

## Usage Examples

To use the rEngine Command Client, follow these steps:

1. Ensure you have Node.js installed on your system.
2. Install the `node-fetch` dependency by running `npm install node-fetch` in your project directory.
3. Save the `rengine-client.js` file in your project directory.
4. Open a terminal or command prompt and navigate to the project directory.
5. Run the rEngine Command Client by executing the following command:

   ```bash
   node rengine-client.js <command> [args...]
   ```

   Replace `<command>` with the name of the command you want to execute on the rEngine platform, and `[args...]` with any arguments or parameters required by the command.

Example:

```bash
node rengine-client.js git-checkpoint "feat: implemented new client"
```

This will send the `git-checkpoint` command to the rEngine MCP server, with the argument `"feat: implemented new client"`.

## Configuration

The `rengine-client.js` file uses the following configuration:

- **`RENGINE_URL`**: The base URL of the rEngine MCP server. By default, it is set to `'http://localhost:3034'`.

If you need to connect to a different rEngine MCP server, you can update the `RENGINE_URL` constant in the `rengine-client.js` file.

## Integration Points

The rEngine Command Client is designed to interact with the rEngine MCP server, which is the central component of the rEngine Core platform. The client sends commands to the MCP server, and the MCP server processes these commands and returns the results.

To integrate the rEngine Command Client with other rEngine Core components, you would need to ensure that the rEngine MCP server is running and accessible, and that the commands being sent from the client are supported by the rEngine platform.

## Troubleshooting

Here are some common issues and solutions you may encounter when using the rEngine Command Client:

1. **Command execution fails**:
   - Check the error message returned by the `sendCommand` function. It should provide information about the root cause of the failure.
   - Ensure that the command you are trying to execute is valid and supported by the rEngine platform.
   - Verify that the rEngine MCP server is running and accessible at the configured `RENGINE_URL`.

1. **Connectivity issues**:
   - Make sure you have a stable network connection between your local machine and the rEngine MCP server.
   - Check the firewall settings on both your local machine and the rEngine MCP server to ensure that the necessary ports are open for communication.

1. **Incorrect command arguments**:
   - Review the command and its expected arguments, and ensure that you are providing the correct values in the correct format.
   - If the command requires specific argument formats (e.g., key-value pairs), make sure you are following the expected syntax.

If you encounter any other issues or have further questions, please consult the rEngine Core documentation or reach out to the rEngine support team for assistance.
