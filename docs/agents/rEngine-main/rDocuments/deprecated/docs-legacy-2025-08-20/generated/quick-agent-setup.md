# rEngine Core: Quick Agent Setup Documentation

## Purpose & Overview

The `quick-agent-setup.js` file is a script within the rEngine Core ecosystem that provides a streamlined process for initializing an rEngine agent with full memory intelligence, API optimization, and MCP (Memory Control Panel) integration. This script aims to simplify the setup process and ensure that new agents are properly configured with the necessary capabilities to function effectively within the rEngine platform.

## Key Functions/Classes

1. **`quickAgentSetup(apiPreference)`**: This is the main function that performs the agent setup process. It takes an optional `apiPreference` parameter, which can be set to `'auto'` (default) or a specific API preference (e.g., `'groq'`, `'claude'`, `'openai'`).

   - Runs an enhanced agent initialization process by executing the `enhanced-agent-init.js` script.
   - Performs a quick memory test by executing the `recall.js` script and checking the output.
   - Runs mandatory startup protocols by executing the `agent-self-management.js` script with the `'startup'` command.
   - Logs the setup completion to the agent's memory via the MCP (Memory Control Panel) using the `add-context.js` script with the `'--mcp-mode'` flag.
   - Displays a quick reference section with information about commonly used commands and best practices.

1. **`execPromise(command)`**: This is a helper function that uses `promisify` from the `util` module to create a Promise-based version of the `exec` function from the `child_process` module. This allows for easier asynchronous execution of external commands.

1. **`colors`**: An object that defines various ANSI escape codes for terminal color formatting, used throughout the script for improved readability and visibility.

## Dependencies

The `quick-agent-setup.js` script depends on the following rEngine Core components:

- `enhanced-agent-init.js`: Responsible for the enhanced initialization of the rEngine agent.
- `recall.js`: Executes memory retrieval and testing.
- `agent-self-management.js`: Handles the mandatory startup protocols for the agent.
- `add-context.js`: Facilitates logging the setup completion to the agent's memory via the MCP.

Additionally, the script utilizes the `child_process` and `util` modules from the Node.js standard library.

## Usage Examples

To use the `quick-agent-setup.js` script, follow these steps:

1. Ensure you have Node.js installed on your system.
2. Navigate to the rEngine Core directory containing the `quick-agent-setup.js` file.
3. Run the script from the command line:

   ```bash
   node quick-agent-setup.js [api-preference]
   ```

   - The `[api-preference]` parameter is optional and can be set to `'auto'` (default) or a specific API preference (e.g., `'groq'`, `'claude'`, `'openai'`).

Example usage:

```bash
node quick-agent-setup.js
node quick-agent-setup.js groq
```

## Configuration

The `quick-agent-setup.js` script does not require any specific environment variables or configuration files. However, it does rely on the proper setup and configuration of the rEngine Core components it interacts with, such as `enhanced-agent-init.js`, `recall.js`, `agent-self-management.js`, and `add-context.js`.

## Integration Points

The `quick-agent-setup.js` script is a part of the rEngine Core ecosystem and is designed to work seamlessly with other rEngine Core components. It integrates with the following components:

1. **Enhanced Agent Initialization**: The script runs the `enhanced-agent-init.js` script to perform the initial setup and configuration of the rEngine agent.
2. **Memory Intelligence**: The script tests the agent's memory intelligence by executing the `recall.js` script and verifying the output.
3. **Agent Self-Management**: The script runs the `agent-self-management.js` script to ensure that the mandatory startup protocols are executed.
4. **Memory Control Panel (MCP)**: The script logs the setup completion to the agent's memory using the `add-context.js` script with the `'--mcp-mode'` flag.

## Troubleshooting

1. **Setup Failure**: If the `quick-agent-setup.js` script fails to complete the setup process, check the error message and try running the individual components manually:

   ```bash
   node enhanced-agent-init.js
   node agent-menu.js 1
   ```

   This can help identify the specific issue and allow you to troubleshoot the problem.

1. **Memory Test Inconclusive**: If the memory test performed by the script is inconclusive, it may still indicate that the system is working, but there could be some issues with the memory intelligence. Try running more comprehensive memory tests using the `memory-intelligence.js` script.

1. **Startup Protocol Failures**: If the mandatory startup protocols fail, check the error message and investigate any issues with the `agent-self-management.js` script. This could indicate problems with the agent's self-management or system-level integration.

1. **Memory Logging Failures**: If the script is unable to log the setup completion to the agent's memory using the MCP, it may be due to issues with the `add-context.js` script or the MCP configuration. Ensure that the MCP is properly set up and accessible.

Remember to consult the rEngine Core documentation and reach out to the support team if you encounter any persistent issues.
