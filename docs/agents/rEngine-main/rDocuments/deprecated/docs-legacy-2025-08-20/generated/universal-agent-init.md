# Universal Agent Initialization Launcher

## Purpose & Overview

The `universal-agent-init.sh` script is a crucial component in the rEngine Core ecosystem. It serves as an easy-to-use wrapper for initializing various AI agent types within the rEngine platform. This script simplifies the process of setting up and launching different AI agents, such as Claude, GPT, Gemini, GitHub Copilot, and VS Code Copilot, by automating the necessary steps.

## Key Functions/Classes

1. **Agent Type Detection**: The script can automatically detect the agent type if no argument is provided. It also supports manually specifying the agent type as a command-line argument.
2. **Node.js Dependency Check**: The script ensures that Node.js is installed and available in the system's PATH before proceeding with the initialization.
3. **Initialization Execution**: The script calls the `universal-agent-init.js` script, passing the appropriate arguments based on the detected or specified agent type, and runs the initialization in "auto" mode.
4. **Result Handling**: The script checks the exit code of the initialization process and provides appropriate success or failure messages to the user.

## Dependencies

1. **Node.js**: The script requires a functioning Node.js installation to run the `universal-agent-init.js` script.
2. **rEngine Directory**: The script assumes that it is executed from the `rEngine` directory or a subdirectory within it.

## Usage Examples

1. **Automatic Agent Initialization**:

   ```
   ./bin/universal-agent-init.sh
   ```

   This will automatically detect the agent type and initialize the AI agent within the rEngine platform.

1. **Specifying the Agent Type**:

   ```
   ./bin/universal-agent-init.sh <agent_type>
   ```

   Replace `<agent_type>` with the desired agent type, such as "Claude", "GPT", "Gemini", "GitHub Copilot", or "VS Code Copilot".

## Configuration

The `universal-agent-init.sh` script does not require any specific environment variables or configuration files. It relies on the `universal-agent-init.js` script to handle the actual agent initialization process, which may have its own configuration requirements.

## Integration Points

The `universal-agent-init.sh` script is a core component of the rEngine platform and integrates with the following aspects:

1. **universal-agent-init.js**: This script is responsible for the actual initialization of the AI agent and is called by the `universal-agent-init.sh` script.
2. **rProtocols**: The script reminds the user to check the `/rProtocols/` folder for operational procedures related to the specific AI agent being initialized.
3. **MCP Tools**: The script advises the user to check the available MCP (Mission Control Platform) tools before starting any tasks.

## Troubleshooting

1. **Node.js Not Installed or Not in PATH**:
   - If Node.js is not installed or not available in the system's PATH, the script will display an error message and exit.
   - Ensure that Node.js is installed and the `node` command is accessible in the terminal.

1. **Initialization Failure**:
   - If the initialization process fails, the script will display the exit code and suggest checking the output for error details.
   - Review the output of the `universal-agent-init.js` script for any error messages or clues about the cause of the failure.

1. **Incorrect Agent Type**:
   - If the specified agent type is not supported or does not exist, the `universal-agent-init.js` script may fail to initialize the agent.
   - Ensure that the agent type provided as a command-line argument is one of the supported types (e.g., "Claude", "GPT", "Gemini", "GitHub Copilot", "VS Code Copilot").

Remember to consult the `/rProtocols/` folder and the available MCP tools for any additional troubleshooting steps or guidance specific to the AI agent being initialized.
