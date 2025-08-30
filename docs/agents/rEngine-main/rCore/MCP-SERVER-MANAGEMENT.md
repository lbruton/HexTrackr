# StackTrackr MCP Server Management

This system ensures both MCP servers are always running for VS Code Chat integration.

## Problem Solved

**Issue**: MCP servers can stop running due to:

- System reboots
- VS Code restarts  
- Process crashes
- Terminal sessions ending

**Solution**: Automated startup, monitoring, and restart system.

## Components

### 1. Startup Script (`start-mcp-servers.sh`)

- Starts both MCP servers if not running
- Provides colored status output
- Creates log files for debugging

### 2. Health Monitor (`health-monitor.sh`)

- Monitors server health every 5 minutes
- Auto-restarts crashed servers
- Logs all activities

### 3. Auto-Startup Service (`com.stacktrackr.mcp-servers.plist`)

- macOS LaunchAgent for automatic startup
- Runs on login and keeps servers alive
- System-level process management

### 4. Management Script (`mcp-manager.sh`)

- Unified command interface
- Start, stop, restart, status commands
- Install/uninstall auto-startup

## Quick Setup (Recommended)

```bash

# Install auto-startup (runs on login)

./mcp-manager.sh install

# Start servers now

./mcp-manager.sh start

# Check status

./mcp-manager.sh status
```

## Manual Usage

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

## Auto-Startup Installation

```bash

# Install (recommended for permanent solution)

./mcp-manager.sh install

# Remove if needed

./mcp-manager.sh uninstall
```

## What Runs

1. **rEngineMCP Server** (`node index.js`)
   - AI collaboration engine
   - Conversation recording  
   - Session handoffs
   - Multi-provider AI access

1. **Memory MCP Server** (`@modelcontextprotocol/server-memory`)
   - Persistent memory storage
   - Memory operations
   - Cross-session data

## Log Locations

- `rengine.log` - rEngineMCP server output
- `memory-server.log` - Memory MCP server output  
- `health-monitor.log` - Health check activities
- `launchd.log` - Auto-startup service output

## Troubleshooting

### Servers won't start

```bash

# Check logs for errors

./mcp-manager.sh logs

# Try manual restart

./mcp-manager.sh restart

# Check if ports are blocked

lsof -i :11434  # Ollama
```

### Auto-startup not working

```bash

# Reinstall the service

./mcp-manager.sh uninstall
./mcp-manager.sh install

# Check launchd status

launchctl list | grep stacktrackr
```

### Memory issues

```bash

# Stop all servers

./mcp-manager.sh stop

# Clear logs if too large

> rengine.log
> memory-server.log

# Restart

./mcp-manager.sh start
```

## VS Code Integration

Both servers provide tools to VS Code Chat:

- **@memory**: Memory operations (create, read, search entities)
- **@rengine**: AI collaboration (smart hello, conversation analysis, handoffs)

## Prevention Strategy

1. **Auto-startup on login**: ✅ Install LaunchAgent
2. **Health monitoring**: ✅ Auto-restart crashed servers
3. **Proper logging**: ✅ Debug issues quickly  
4. **Manual controls**: ✅ Easy start/stop/restart
5. **Status checking**: ✅ Know what's running

## Best Practices

- Always use `./mcp-manager.sh status` to check before debugging
- Install auto-startup for worry-free operation
- Check logs when troubleshooting
- Use health monitor for long-running systems

## Recommended Setup

```bash

# One-time setup for permanent solution

cd /Volumes/DATA/GitHub/rEngine/rEngineMCP

# Install auto-startup

./mcp-manager.sh install

# Start health monitoring  

./mcp-manager.sh monitor

# Verify everything is working

./mcp-manager.sh status
```

This ensures both MCP servers will:

- Start automatically on login
- Restart if they crash
- Be monitored continuously
- Have easy manual controls
