# Universal AI Agent Initialization System

**Version: 2.0.0**  
**Status: Active**  
**Supports: Claude, GPT, Gemini, GitHub Copilot, VS Code Copilot, and future agents**

## Overview

The Universal AI Agent Initialization System provides a single, comprehensive startup protocol that works with any AI agent. It automatically detects the agent type, creates session-specific memory files, integrates with MCP servers, and prepares the full StackTrackr ecosystem for optimal agent performance.

## Key Features

- **🤖 Universal Agent Detection**: Automatically identifies Claude, GPT, Gemini, GitHub Copilot, VS Code Copilot, and custom agents
- **🧠 MCP Memory Integration**: Full Model Context Protocol integration with persistent memory
- **📝 Session-Specific Memory**: Creates agent-specific memory files for each session
- **🔄 Dual Memory Protocol**: Writes to multiple memory stores simultaneously
- **⚡ Non-Interactive Mode**: Runs automatically without hanging on user prompts
- **🛠️ Service Status Checking**: Verifies MCP servers and Docker services
- **📦 Git Integration**: Automatic checkpoint creation and backup
- **🎯 Agent-Specific Capabilities**: Tailored configuration for each agent type

## Quick Start

### Method 1: Launcher Script (Recommended)

```bash

# Auto-detect agent type

bash bin/universal-agent-init.sh

# Specify agent type

bash bin/universal-agent-init.sh claude
bash bin/universal-agent-init.sh gpt
bash bin/universal-agent-init.sh gemini
```

### Method 2: Direct Node.js Execution

```bash

# Auto-detection with non-interactive mode

node rEngine/universal-agent-init.js --auto

# Specify agent type (2)

node rEngine/universal-agent-init.js --agent-type claude --auto
```

## Supported Agents

| Agent Type | Detection Method | Capabilities |
|------------|-----------------|--------------|
| **Claude** | `ANTHROPIC_API_KEY`, command args | Anthropic API, function calling, long context, semantic search |
| **GPT** | `OPENAI_API_KEY`, command args | OpenAI API, code interpreter, web browsing, conversation management |
| **Gemini** | `GEMINI_API_KEY`, `GOOGLE_API_KEY` | Google API, multimodal, search integration, document generation |
| **GitHub Copilot** | `GITHUB_TOKEN`, Copilot context | GitHub integration, code completion, repository operations |
| **VS Code Copilot** | `VSCODE_PID`, VS Code context | VS Code integration, editor commands, workspace operations |
| **Universal Agent** | Default fallback | Base capabilities with memory and MCP protocol |

## Agent Detection Priority

1. **Command Line Arguments**: `--agent-type <type>`
2. **Environment Variables**: API keys (ANTHROPIC_API_KEY, OPENAI_API_KEY, etc.)
3. **Context Variables**: USER_AGENT, COPILOT_CONTEXT
4. **Process Arguments**: Keywords in command line
5. **Default Fallback**: Universal Agent

## Memory System

### Agent-Specific Memory Files

- `claude-memory.json` - Claude-specific sessions and capabilities
- `gpt-memory.json` - GPT-specific sessions and capabilities  
- `gemini-memory.json` - Gemini-specific sessions and capabilities
- etc.

### Session Memory Files

- `{agent}-session-{timestamp}.json` - Individual session tracking
- Contains metadata, initialization status, and session logs

### Shared Memory Files

- `extendedcontext.json` - Cross-session context and history
- `persistent-memory.json` - MCP-integrated persistent storage
- `tasks.json` - Active tasks and goals
- `decisions.json` - Architectural decisions
- `handoff.json` - Session handoff data

## Usage Examples

### Basic Auto-Detection

```bash

# Automatically detects agent and initializes

bash bin/universal-agent-init.sh
```

### Claude Session

```bash

# Explicitly start Claude session

bash bin/universal-agent-init.sh claude
```

### GPT Session with Non-Interactive Mode

```bash

# Start GPT session in automation mode

node rEngine/universal-agent-init.js --agent-type gpt --auto
```

### Custom Agent

```bash

# Register custom agent type

node rEngine/universal-agent-init.js --agent-type my-custom-agent --auto
```

## Integration with Existing Protocols

### COPILOT_INSTRUCTIONS.md Compatibility

The universal system is fully compatible with the existing manual startup protocol in `COPILOT_INSTRUCTIONS.md`. You can:

- Use the automated system for quick startup
- Fall back to manual protocol for detailed control
- Combine both approaches for hybrid workflows

### rEngine Protocol Compliance

Follows all requirements from `rProtocols/rEngine_startup_protocol.md`:

- ✅ MCP server communication protocol
- ✅ Service management and verification
- ✅ Memory system integration
- ✅ Docker service orchestration
- ✅ Automatic memory scribe activation

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

## System Requirements

### Dependencies

- Node.js 18+ with ES modules support
- Docker and Docker Compose (for service orchestration)
- Git (for checkpoint management)
- MCP server infrastructure

### Required Files

- `rEngine/universal-agent-init.js` - Main initialization script
- `bin/universal-agent-init.sh` - Launcher script
- `rEngine/dual-memory-writer.js` - Memory management
- `rMemory/rAgentMemories/` - Memory storage directory

## Troubleshooting

### Common Issues

## Script Hangs on Input

- Use `--auto` flag for non-interactive mode
- Set `CI=true` environment variable

## Agent Detection Fails

- Set appropriate API key environment variables
- Use `--agent-type` to specify explicitly
- Check process arguments and context variables

## MCP Integration Errors

- Verify MCP servers are running
- Check Docker service status
- Run `bash bin/launch-rEngine-services.sh`

## Memory File Errors

- Ensure `rMemory/rAgentMemories/` directory exists
- Check file permissions
- Verify JSON syntax in existing memory files

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
2. Use universal system for routine startup
3. Use manual protocol for complex debugging or custom scenarios

## Version History

- **v2.0.0**: Universal agent support, enhanced detection, non-interactive mode
- **v1.0.0**: Claude-specific initialization system

## See Also

- `COPILOT_INSTRUCTIONS.md` - Manual startup protocol
- `rProtocols/rEngine_startup_protocol.md` - rEngine service management
- `docs/AGENT_SYSTEM_GUIDE.md` - Comprehensive agent documentation
- `rEngine/README.md` - rEngine platform documentation
