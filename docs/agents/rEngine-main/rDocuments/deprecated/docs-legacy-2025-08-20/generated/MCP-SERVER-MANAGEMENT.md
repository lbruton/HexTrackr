# rEngine MCP Server Management

## Purpose & Overview

The `MCP-SERVER-MANAGEMENT.md` file provides comprehensive documentation for the server management system used in the rEngine Core platform. This system ensures that the critical MCP (Model Context Protocol) servers are always running, which is essential for the proper functioning of the VS Code Chat integration.

The MCP servers play a crucial role in the rEngine Core ecosystem, facilitating AI collaboration, conversation recording, session handoffs, and persistent memory storage. The server management system described in this file addresses the problem of MCP servers stopping due to various reasons, such as system reboots, VS Code restarts, process crashes, or terminal sessions ending.

## Key Functions/Classes

The server management system consists of the following key components:

1. **Startup Script (`start-mcp-servers.sh`)**: This script is responsible for starting both MCP servers if they are not running, providing colored status output, and creating log files for debugging.

1. **Health Monitor (`health-monitor.sh`)**: The health monitor script checks the status of the MCP servers every 5 minutes and automatically restarts any crashed servers. It also logs all its activities.

1. **Auto-Startup Service (`com.stacktrackr.mcp-servers.plist`)**: This macOS LaunchAgent ensures that the MCP servers are automatically started on login and kept alive as a system-level process.

1. **Management Script (`mcp-manager.sh`)**: The management script provides a unified command-line interface for starting, stopping, restarting, and checking the status of the MCP servers. It also handles the installation and uninstallation of the auto-startup service.

## Dependencies

The server management system depends on the following components:

1. **rEngineMCP Server**: This server runs the AI collaboration engine, handles conversation recording, session handoffs, and multi-provider AI access.

1. **Memory MCP Server**: This server provides persistent memory storage, memory operations, and cross-session data management.

## Usage Examples

### Quick Setup (Recommended)

```bash

# Install auto-startup (runs on login)

./mcp-manager.sh install

# Start servers now

./mcp-manager.sh start

# Check status

./mcp-manager.sh status
```

### Manual Usage

```bash

# Start both servers

./mcp-manager.sh start

# Check server status  

./mcp-manager.sh status

# View recent logs

./mcp-manager.sh logs

# Restart if needed

./mcp-manager.sh restart

# Start health monitoring

./mcp-manager.sh monitor
```

### Auto-Startup Installation

```bash

# Install (recommended for permanent solution)

./mcp-manager.sh install

# Remove if needed

./mcp-manager.sh uninstall
```

## Configuration

The server management system does not require any specific environment variables or configuration files. The scripts and LaunchAgent are designed to work out-of-the-box with the rEngine Core platform.

## Integration Points

The MCP servers managed by this system are directly integrated with the VS Code Chat feature of the rEngine Core platform. The servers provide the necessary tools and functionality for memory operations (`@memory`) and AI collaboration (`@rengine`) within the VS Code Chat interface.

## Troubleshooting

The documentation provides guidance for troubleshooting common issues, such as servers not starting, auto-startup not working, and memory-related problems. It suggests checking logs, manually restarting servers, and clearing log files if they become too large.

## Best Practices

The documentation recommends the following best practices for using the server management system:

1. Always use `./mcp-manager.sh status` to check the status before debugging.
2. Install the auto-startup service for worry-free operation.
3. Check the logs when troubleshooting issues.
4. Use the health monitor for long-running systems.

## Recommended Setup

The documentation provides a recommended setup that ensures the MCP servers:

1. Start automatically on login.
2. Restart if they crash.
3. Are monitored continuously.
4. Have easy manual controls.

This setup is achieved by installing the auto-startup service and starting the health monitoring process.
