# Universal AI Agent Initialization System

## Purpose & Overview

The `universal-agent-init.js` file is a core component of the rEngine Core platform, responsible for the seamless initialization and management of various AI agents. This system provides a unified approach to launching and configuring AI agents, automatically detecting the agent type, integrating with the MCP (Model Context Protocol) server, and setting up the necessary environment for optimal agent performance.

Key features of the Universal AI Agent Initialization System include:

- **Universal Agent Detection**: Automatically identifies and initializes a wide range of AI agents, including Claude, GPT, Gemini, GitHub Copilot, and VS Code Copilot.
- **MCP Memory Integration**: Seamless integration with the MCP server, enabling persistent memory and context management.
- **Session-Specific Memory**: Creation of agent-specific memory files for each session, ensuring isolated and organized data storage.
- **Dual Memory Protocol**: Writes agent data to multiple memory stores simultaneously for redundancy and reliability.
- **Non-Interactive Mode**: Ability to run the initialization process without user prompts, enabling automated workflows.
- **Service Status Checking**: Verifies the availability and health of MCP servers and Docker services.
- **Git Integration**: Automatic checkpoint creation and backup of the agent's memory and state.
- **Agent-Specific Capabilities**: Tailored configuration and capabilities for each supported agent type.

## Key Functions/Classes

The main components of the Universal AI Agent Initialization System are:

1. **`universal-agent-init.js`**: The primary script responsible for the overall initialization process. It handles agent detection, memory management, service verification, and integration with other rEngine Core components.

1. **`dual-memory-writer.js`**: A module that manages the simultaneous writing of agent data to multiple memory stores, ensuring data redundancy and consistency.

1. **`universal-agent-init.sh`**: A launcher script that provides a convenient command-line interface for initiating the universal agent initialization process.

1. **`rMemory/rAgentMemories/`**: The directory where agent-specific memory files are stored, including session logs and persistent data.

## Dependencies

The Universal AI Agent Initialization System relies on the following dependencies:

- **Node.js 18+**: The system is built using the latest version of Node.js, which provides support for ES modules.
- **Docker and Docker Compose**: The initialization process integrates with Docker services, such as the MCP server, for seamless orchestration.
- **Git**: The system utilizes Git for automatic checkpoint creation and backup of agent memory and state.
- **MCP Server Infrastructure**: The initialization process communicates with the MCP server to integrate with the platform's memory and context management capabilities.

## Usage Examples

### Basic Auto-Detection

```bash

# Automatically detects agent and initializes

bash bin/universal-agent-init.sh
```

### Claude Session

```bash

# Explicitly start a Claude session

bash bin/universal-agent-init.sh claude
```

### GPT Session with Non-Interactive Mode

```bash

# Start a GPT session in automation mode

node rEngine/universal-agent-init.js --agent-type gpt --auto
```

### Custom Agent

```bash

# Register and initialize a custom agent type

node rEngine/universal-agent-init.js --agent-type my-custom-agent --auto
```

## Configuration

### Environment Variables

```bash

# API Keys (for agent detection)

export ANTHROPIC_API_KEY="your-key"
export OPENAI_API_KEY="your-key"
export GEMINI_API_KEY="your-key"
export GITHUB_TOKEN="your-token"

# Context Variables

export COPILOT_CONTEXT="agent-specific-context"
export USER_AGENT="agent-identifier"

# Automation

export CI=true  # Enables non-interactive mode
```

### Command Line Options

```bash
--agent-type <type>    # Specify agent type explicitly
--auto                 # Enable non-interactive mode
--non-interactive      # Same as --auto
```

## Integration Points

The Universal AI Agent Initialization System is a core component of the rEngine Core platform and integrates with several other key components:

1. **MCP Server**: The initialization process communicates with the MCP server to integrate agent memory and context management.
2. **Docker Services**: The system manages and verifies the availability of Docker services, such as the MCP server, as part of the initialization process.
3. **rEngine Protocols**: The initialization process follows the requirements outlined in the `rProtocols/rEngine_startup_protocol.md` document, ensuring compliance with the platform's standards.
4. **Agent-Specific Capabilities**: The system tailors the agent's capabilities based on the detected agent type, leveraging the comprehensive documentation in `docs/AGENT_SYSTEM_GUIDE.md`.
5. **COPILOT_INSTRUCTIONS.md**: The universal initialization system is designed to be compatible with the existing manual startup protocol, allowing for a hybrid approach to agent initialization.

## Troubleshooting

### Common Issues

## Script Hangs on Input

- Use `--auto` flag for non-interactive mode
- Set `CI=true` environment variable

## Agent Detection Fails

- Set appropriate API key environment variables
- Use `--agent-type` to specify the agent type explicitly
- Check process arguments and context variables

## MCP Integration Errors

- Verify that the MCP servers are running
- Check the status of Docker services
- Run `bash bin/launch-rEngine-services.sh` to launch the required services

## Memory File Errors

- Ensure that the `rMemory/rAgentMemories/` directory exists
- Check file permissions
- Verify the JSON syntax in existing memory files

### Service Status Check

```bash

# Check all services

docker ps

# Check MCP servers

ps aux | grep -E "(mcp-server|rEngine)" | grep -v grep

# Launch services if needed

bash bin/launch-rEngine-services.sh
```

## Development

### Adding New Agent Types

1. **Update Detection Logic**:

```javascript
// In detectAgent() method
if (env.NEW_AGENT_API_KEY || 
    process.argv.some(arg => arg.includes('new-agent'))) {
    return 'new_agent';
}
```

1. **Add Capabilities**:

```javascript
// In getAgentCapabilities() method
'new_agent': [
    ...baseCapabilities,
    'new_agent_specific_capability',
    'another_capability'
]
```

1. **Add Display Name**:

```javascript
// In getAgentDisplayName() method
'new_agent': 'New Agent Display Name'
```

### Testing

```bash

# Test auto-detection

node rEngine/universal-agent-init.js --auto

# Test specific agent

node rEngine/universal-agent-init.js --agent-type claude --auto

# Test launcher

bash bin/universal-agent-init.sh gemini
```

## Migration Guide

### From Claude-Specific Initialization

1. Replace `claude-agent-init.js` calls with `universal-agent-init.js`
2. Use `--agent-type claude` for explicit Claude sessions
3. All existing memory files and protocols are preserved

### From Manual COPILOT_INSTRUCTIONS.md

1. Optional migration - keep both approaches
2. Use the universal system for routine startup
3. Use the manual protocol for complex debugging or custom scenarios

## Version History

- **v2.0.0**: Universal agent support, enhanced detection, non-interactive mode
- **v1.0.0**: Claude-specific initialization system

## See Also

- `COPILOT_INSTRUCTIONS.md` - Manual startup protocol
- `rProtocols/rEngine_startup_protocol.md` - rEngine service management
- `docs/AGENT_SYSTEM_GUIDE.md` - Comprehensive agent documentation
- `rEngine/README.md` - rEngine platform documentation
