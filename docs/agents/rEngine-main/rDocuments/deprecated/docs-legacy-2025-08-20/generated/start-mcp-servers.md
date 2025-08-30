# `start-mcp-servers.sh` - rEngine Core MCP Servers Startup Script

## Purpose & Overview

The `start-mcp-servers.sh` script is a crucial component in the rEngine Core ecosystem. It ensures that the two essential MCP (Model Context Protocol) servers, `rEngineMCP` and `Memory MCP`, are running and operational. These servers provide the necessary infrastructure for the integration of the VS Code Chat feature within the rEngine Core platform.

The script performs the following key tasks:

1. Checks if the memory file synchronization script is available and executes it if present.
2. Starts the `rEngineMCP` server, which is the main communication hub for the rEngine Core platform.
3. Starts the `Memory MCP` server, which is responsible for managing the memory context during the development process.
4. Verifies that both servers are running and provides instructions for viewing their respective logs.

By ensuring that these MCP servers are up and running, the `start-mcp-servers.sh` script plays a vital role in the overall functionality and integration of the rEngine Core platform.

## Key Functions/Classes

The script consists of the following main components:

1. **Color Variables**: Defines color variables for enhanced console output.
2. **Path Variables**: Specifies the directories and log file paths for the rEngine Core and Memory MCP servers.
3. **is_running()**: A function that checks if a specific process is running based on the provided pattern.
4. **start_rengine()**: A function that starts the `rEngineMCP` server.
5. **start_memory()**: A function that starts the `Memory MCP` server.

These functions work together to manage the lifecycle of the MCP servers and provide a comprehensive overview of their status.

## Dependencies

The `start-mcp-servers.sh` script has the following dependencies:

- **Node.js**: The rEngine Core platform is built on Node.js, and the script relies on the `node` and `npx` commands to start the MCP servers.
- **rEngine Core**: The script is specific to the rEngine Core platform and expects the necessary directories and files to be present in the expected locations.
- **Memory Sync Script**: The script checks for and executes the `sync-memory-files.sh` script, which is responsible for synchronizing the memory files before starting the MCP servers.

## Usage Examples

To use the `start-mcp-servers.sh` script, follow these steps:

1. Ensure that you have the necessary permissions to execute the script:

   ```bash
   chmod +x start-mcp-servers.sh
   ```

1. Run the script from the rEngine Core directory:

   ```bash
   ./start-mcp-servers.sh
   ```

   This will start the `rEngineMCP` and `Memory MCP` servers, and provide information about their status and log file locations.

## Configuration

The `start-mcp-servers.sh` script uses the following configuration parameters:

| Parameter | Description |
| --- | --- |
| `RENGINE_DIR` | The directory where the rEngine Core project is located. |
| `RENGINE_LOG` | The path to the rEngine Core server log file. |
| `MEMORY_LOG` | The path to the Memory MCP server log file. |

These parameters are defined at the beginning of the script and can be adjusted based on the specific deployment environment.

## Integration Points

The `start-mcp-servers.sh` script is a critical integration point within the rEngine Core ecosystem. It ensures that the necessary MCP servers are running, which is a prerequisite for the following rEngine Core components:

- **VS Code Chat Integration**: The rEngine Core platform integrates with VS Code, and the MCP servers provide the communication infrastructure for the chat feature.
- **Memory Management**: The `Memory MCP` server is responsible for managing the memory context during the development process, which is essential for the rEngine Core functionality.
- **rEngine Core Platform**: The `rEngineMCP` server is the central communication hub for the entire rEngine Core platform, facilitating the exchange of data and commands between various components.

## Troubleshooting

If you encounter any issues with the `start-mcp-servers.sh` script, you can refer to the following troubleshooting steps:

1. **Server Not Starting**: If one or both of the MCP servers fail to start, check the corresponding log files (`RENGINE_LOG` and `MEMORY_LOG`) for any error messages or clues about the issue.
2. **Server Not Running**: If the script reports that a server is not running, verify the process ID (PID) and check if the server is still running using the `ps` command.
3. **Memory Sync Script Not Found**: If the `sync-memory-files.sh` script is not found, the script will continue without synchronizing the memory files. Ensure that the script is present in the expected location.
4. **Permissions Issues**: Verify that you have the necessary permissions to execute the `start-mcp-servers.sh` script and access the required directories and files.

If you continue to experience issues, you may need to investigate further or seek assistance from the rEngine Core development team.
