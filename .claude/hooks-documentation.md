# Claude Code Hooks Documentation - HexTrackr

## Overview

This document describes the automated hooks configured for Claude Code sessions in the HexTrackr project. These hooks enhance workflow automation and maintain context continuity across your multi-AI development environment.

## Hook Categories

### 🚀 SessionStart Hooks

**Purpose**: Initialize context and prepare development environment

- Triggers when Claude Code session begins
- Runs `/refresh-context-first` command to load recent project context
- Integrates with global memory management commands

### 🔍 PreToolUse Hooks

**Edit/Write Operations**:

- **Trigger**: Before `Edit`, `Write`, or `MultiEdit` tools
- **Action**: Shows current Git status (modified files preview)
- **Timeout**: 10 seconds
- **Purpose**: Context awareness before file modifications

**Playwright Operations**:

- **Trigger**: Before any `mcp__playwright__*` tool usage
- **Action**: Ensures Docker containers are running, starts if needed
- **Timeout**: 30 seconds  
- **Purpose**: Prevents Playwright test failures due to container state

**Server.js Operations**:

- **Trigger**: Before editing/running commands on `server.js`
- **Action**: Preparation notice for potential restart
- **Timeout**: 5 seconds
- **Purpose**: User awareness of upcoming service interruption

### 🔄 PostToolUse Hooks  

**Server.js Modifications**:

- **Trigger**: After editing `server.js` file
- **Action**: Automatic `docker-compose restart`
- **Timeout**: 45 seconds
- **Purpose**: Immediate application of server changes

**Memory Operations**:

- **Trigger**: After `mcp__memento__*` tool usage
- **Action**: Confirmation of memory operation completion
- **Timeout**: 5 seconds
- **Purpose**: Context preservation acknowledgment

**Zen Analysis Operations**:

- **Trigger**: After `mcp__zen__*` tool usage  
- **Action**: Log analysis completion timestamp
- **Timeout**: 10 seconds
- **Purpose**: Track analysis workflow for future reference

### 🧪 Notification Hooks

**Test Operations**:

- **Trigger**: Any test-related Bash commands
- **Action**: Alert about test monitoring
- **Timeout**: 5 seconds
- **Purpose**: Highlight test execution for quality assurance

## 📊 Status Line Display

**Format**: `branch | modified_files📝 | running_containers🐳`

**Components**:

- **Git Branch**: Current working branch (or 'no-git' if not in repo)
- **Modified Files**: Count of unstaged/staged files with 📝 icon
- **Docker Status**: Count of running containers with 🐳 icon
- **Updates**: Real-time during Claude Code session

**Example**: `feature/websocket-progress | 12📝 | 3🐳`

## Integration with Multi-AI Workflow

### Claude Code → VS Code/Cursor

- Status line shows context before switching to IDE
- Hooks ensure environment consistency
- Memory operations preserve context across tools

### Claude Code → GitHub Copilot Chat  

- Independent systems - no conflicts
- Complementary MCP server configurations
- Shared project context through Git state

### Claude Code → Claude Desktop/CLI Tools

- Global memory commands work seamlessly
- Hook-maintained environment state
- Consistent context across AI platforms

## Hook Execution Safety

### Timeouts

- All hooks have reasonable timeout limits
- Failed hooks don't block Claude Code operations
- Non-critical hooks use `|| true` for fault tolerance

### Permissions

- Hooks respect existing permission framework
- Only authorized commands can execute
- Docker operations require explicit permission

### Conflict Prevention

- Hooks don't interfere with Git pre-commit hooks
- VS Code Copilot configuration remains independent
- Each AI tool maintains its own MCP server connections

## Troubleshooting

### Hook Not Executing

1. Check `.claude/settings.local.json` syntax
2. Verify command permissions in `allow` list
3. Test hook command manually in terminal
4. Check timeout values for slow operations

### Docker Integration Issues  

1. Ensure `docker-compose.yml` exists in project root
2. Verify Docker daemon is running
3. Check container names match service definitions
4. Test `docker-compose ps` manually

### Memory Integration Problems

1. Verify Memento MCP server is connected (`claude mcp list`)
2. Check global commands exist in `~/.claude/commands/`
3. Test memory search manually
4. Verify database connectivity

## Customization Options

### Adding New Hooks

```json
{
  "PreToolUse": [{
    "matcher": "YourTool",
    "hooks": [{
      "type": "command",
      "command": "your-command-here",
      "timeout": 15
    }]
  }]
}
```

### Modifying Status Line

```json
{
  "statusLine": {
    "type": "command", 
    "command": "echo \"your-custom-status\"",
    "padding": 1
  }
}
```

### Extending Memory Integration

- Add PostToolUse hooks for automatic memory saving
- Create SessionEnd hooks for context preservation
- Implement Notification hooks for important state changes

This documentation ensures your Claude Code sessions are fully integrated with your multi-AI development workflow while maintaining the flexibility to adapt to changing project needs.
