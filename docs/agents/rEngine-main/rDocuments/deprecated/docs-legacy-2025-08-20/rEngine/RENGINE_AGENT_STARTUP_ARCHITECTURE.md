# rEngine Agent Startup Architecture - Technical Documentation

## 🏗️ System Architecture Overview

The rEngine platform uses a **single-instance, Docker-first** architecture to prevent resource conflicts and ensure consistent agent behavior across sessions.

### Core Principles

1. **Single Instance Enforcement** - Only one Smart Scribe instance runs at a time
2. **Docker-First Strategy** - Prefer containerized services over local processes
3. **External Monitoring** - Console output in Terminal.app, not VS Code
4. **Memory Efficiency** - Use optimized models (qwen2.5-coder:7b vs llama3:8b)
5. **Conflict Prevention** - Pre-flight checks before launching any services

## 📋 Service Dependencies

```
rEngine Platform Startup Chain:
├── Docker Environment (docker-compose.yml)
│   ├── StackTrackr Application Container
│   ├── rEngine Platform Container  
│   ├── MCP Memory Server Container
│   └── Development Environment Container
├── Smart Scribe Service (in Docker)
│   ├── qwen2.5-coder:7b Model (~6-7GB RAM)
│   ├── File Watching System
│   ├── Memory Health Monitoring
│   └── Technical Knowledge Database
└── External Monitoring Console (Terminal.app)
    ├── Docker Log Aggregation
    ├── Real-time Activity Display
    └── 10-second Refresh Cycle
```

## 🚀 Startup Scripts

### Primary Launch Script

- **File**: `bin/launch-rEngine-services.sh`
- **Purpose**: Start entire Docker environment
- **Output**: Opens new Terminal.app window
- **Dependencies**: Docker, docker-compose

### Smart Scribe Monitor

- **File**: `launch-smart-scribe-monitor.applescript`
- **Purpose**: External console for Docker Smart Scribe
- **Output**: Terminal.app monitoring window
- **Dependencies**: Docker containers running

### Safety Wrapper

- **File**: `bin/safe-smart-scribe-start.sh`
- **Purpose**: Conflict detection and prevention
- **Output**: Interactive prompts for conflict resolution
- **Dependencies**: Process checking, Docker detection

## 🔧 Technical Implementation

### Memory Management

```json
{
  "model": "qwen2.5-coder:7b",
  "memory_usage": "~6-7GB RAM",
  "optimization": "Specialized for code analysis",
  "fallback": "gemma2:2b (~2-3GB if needed)"
}
```

### Process Detection Logic

```bash

# Check for local Smart Scribe processes

EXISTING_SCRIBE=$(ps aux | grep -E "smart-scribe\.js" | grep -v grep)

# Check for Docker containers

DOCKER_SCRIBE=$(docker ps --format "{{.Names}}" | grep -E "scribe|development")

# Conflict resolution matrix:

# Local + Docker = Prompt user choice

# Local only = Continue local

# Docker only = Use Docker

# Neither = Start preferred method

```

### Container Communication

```bash

# Docker log monitoring

CONTAINER_NAME=$(docker ps --format '{{.Names}}' | grep -E 'development')
docker logs $CONTAINER_NAME --tail 10 --follow

# Container health checking

docker ps --format 'table {{.Names}}\t{{.Status}}'
```

## 🛡️ Error Prevention

### Double-Launch Prevention

1. **Process Scanning**: Check for existing Smart Scribe instances
2. **Docker Detection**: Verify container status before local launch
3. **User Confirmation**: Interactive prompts for conflict scenarios
4. **Resource Monitoring**: Memory usage warnings at 80%+ threshold

### Recovery Procedures

```bash

# Complete service restart

docker-compose down
docker-compose up -d
./launch-smart-scribe-monitor.applescript

# Emergency cleanup

pkill -f smart-scribe
docker stop $(docker ps -q)
brew services stop ollama
```

## 📊 Monitoring & Logging

### Log Locations

- **Docker Logs**: `docker logs <container_name>`
- **Local Logs**: `rEngine/logs/smart-scribe.log`
- **Process IDs**: `rEngine/logs/smart-scribe.pid`
- **System Logs**: `rEngine/logs/deprecation.log`

### Monitoring Metrics

- **Memory Usage**: Per-process RAM consumption
- **Container Status**: Running/stopped state
- **Model Loading**: Ollama model status
- **File Watching**: Active directory monitoring
- **API Connectivity**: MCP server health

## 🔄 Standard Operating Procedure

### Daily Startup

1. Run `./launch-smart-scribe-monitor.applescript`
2. Verify Docker containers are healthy
3. Confirm Smart Scribe is active in monitoring console
4. Check memory usage is within acceptable range

### Troubleshooting

1. **High Memory**: Switch to smaller model (gemma2:2b)
2. **Double Launch**: Use safe-smart-scribe-start.sh
3. **Container Issues**: docker-compose down/up cycle
4. **Log Analysis**: Check both Docker and local logs

### Clean Shutdown

1. Stop monitoring console (Ctrl+C)
2. Stop Docker containers: `docker-compose down`
3. Verify no orphaned processes: `ps aux | grep scribe`

## 📝 Configuration Files

### Primary Config

- **File**: `rEngine/system-config.json`
- **Model**: `qwen2.5-coder:7b`
- **Provider**: `ollama`
- **Endpoint**: `http://localhost:11434`

### Docker Config

- **File**: `docker-compose.yml`
- **Version**: No version attribute (modern Docker Compose)
- **Services**: stacktrackr-app, rengine-platform, mcp-server, development

## 🎯 Performance Targets

- **Startup Time**: < 30 seconds for full environment
- **Memory Usage**: < 8GB total (Smart Scribe + containers)
- **CPU Usage**: < 50% sustained during normal operation
- **Log Refresh**: 10-second monitoring intervals
- **Response Time**: < 2 seconds for Smart Scribe queries

---

**Version**: 1.0  
**Last Updated**: August 19, 2025  
**Maintainer**: rEngine Platform Team
