# rEngine Health Monitoring System

## Overview

Comprehensive health monitoring and protocol stack management for the rEngine platform with enterprise-grade security and memory architecture.

## 🏥 Health Check Components

### 1. Command Line Health Check

**File:** `health-check.sh`
**Usage:** `./health-check.sh [--report]`

## Features:

- ✅ Docker system health verification
- 🧠 Memory system integrity checks  
- 🔍 Service availability monitoring
- 🌐 Network connectivity tests
- 📊 Resource usage analysis
- 📋 Comprehensive health reports

## Example Output:

```bash
🏥 rEngine Health Check System
=================================
🐳 Docker System Health: ✅ All systems operational
🧠 Memory System Health: ✅ Persistent memory intact
🔍 Service Health Checks: 4/6 services healthy
📋 Overall Status: ⚠️ Partial Systems Healthy
```

### 2. Health Monitoring API

**File:** `health-api.cjs`
**Port:** `4039`
**URL:** `http://localhost:4039`

## Endpoints:

- `GET /api/health` - Overall system health status
- `GET /api/services` - Docker service status
- `GET /api/memory` - Memory system status
- `GET /api/logs` - Recent system logs
- `POST /api/run-health-check` - Execute full health check

## API Response Example:

```json
{
  "timestamp": "2025-08-23T07:22:50.123Z",
  "status": "healthy",
  "services": [
    {
      "name": "mcp-memory-persistent",
      "status": "healthy",
      "port": "4041"
    }
  ],
  "memory": {
    "persistentMemoryExists": true,
    "size": 16149,
    "validJson": true
  }
}
```

### 3. Interactive Health Dashboard

**File:** `health-dashboard.html`
**Access:** `http://localhost:4039/dashboard`

## Features: (2)

- 📊 Real-time health monitoring
- 🔧 Service management controls
- 🧠 Memory system visualization
- 📋 System logs viewer
- 🎛️ **Protocol Stack Editor** (Visual drag-and-drop)

## 🎛️ Protocol Stack Editor

### Visual Flowchart Management

The dashboard includes a sophisticated **Protocol Stack Editor** that allows you to:

1. **Drag & Drop Reordering**: Visually reorganize protocol execution order
2. **Add Custom Protocols**: Create new protocol layers with descriptions
3. **Enable/Disable Protocols**: Toggle individual protocols on/off
4. **Edit Protocol Details**: Modify names and descriptions in-place
5. **Export/Import Configurations**: Save and share protocol stack setups

### Default Protocol Stack

```

1. MCP Memory Protocol

   └─ Persistent memory management and context switching

1. GitHub Integration Protocol  

   └─ Repository management and version control integration

1. Security Layer Protocol

   └─ Per-project isolation and git workflow security

1. Code Execution Protocol

   └─ Sandboxed code execution and testing environment
```

### Protocol Configuration

Protocols can be reordered by dragging, and the system will automatically:

- Update execution priority
- Maintain data flow dependencies
- Preserve security boundaries
- Save configuration changes

## 🚀 Quick Start Guide

### 1. Start Health Monitoring

```bash

# Start the health API server

node health-api.cjs

# Access the dashboard

open http://localhost:4039/dashboard
```

### 2. Run Health Checks

```bash

# Quick health check

./health-check.sh

# Generate detailed report  

./health-check.sh --report
```

### 3. Start Enhanced Docker Environment

```bash

# Start all enhanced services

docker-compose -f docker-compose-enhanced.yml up -d

# Check status

./health-check.sh
```

### 4. Access Dashboard Features

#### Health Monitor Tab

- View real-time service status
- Monitor system metrics (CPU, Memory, Uptime)
- Quick action buttons for service management

#### Protocol Stack Tab  

- Visual protocol flowchart editor
- Drag protocols to reorder execution
- Add/edit/remove protocol layers
- Export configuration for backup

#### Memory System Tab

- Per-project memory isolation status
- Project context visualization
- Memory health indicators

#### System Logs Tab

- Real-time log streaming
- Log filtering and search
- Download logs for analysis

## 🔧 Troubleshooting

### Common Issues

#### Services Not Starting

```bash

# Check Docker daemon

docker info

# Restart Docker services

docker-compose -f docker-compose-enhanced.yml restart

# View service logs

docker-compose logs [service-name]
```

#### Memory System Issues

```bash

# Check memory file integrity

./health-check.sh | grep "Memory"

# Backup current memory

cp persistent-memory.json memory-backups/backup-$(date +%Y%m%d).json

# Validate JSON format

jq empty persistent-memory.json
```

#### Protocol Stack Problems

```bash

# Reset to default configuration

# (Use dashboard "Reset to Default" button)

# Export current configuration

# (Use dashboard "Export Configuration" button)

```

### Health Check Failure Responses

#### ❌ Container Not Running

**Solution:** `docker-compose up -d [service-name]`

#### ⚠️ Port Not Responding  

**Solution:** Check port conflicts, restart service

#### 🔍 HTTP Endpoint Unhealthy

**Solution:** Check service logs, verify configuration

## 📊 Monitoring Best Practices

### Regular Health Checks

1. **Daily:** Run `./health-check.sh` for quick status
2. **Weekly:** Generate full reports with `--report` flag
3. **After Changes:** Always run health check after system modifications

### Protocol Stack Management

1. **Before Changes:** Export current configuration as backup
2. **Test Changes:** Use staging environment for protocol modifications
3. **Document Changes:** Keep notes on protocol reordering rationale

### Memory System Maintenance

1. **Monitor Growth:** Check memory file size regularly
2. **Backup Frequently:** Automated backups in `memory-backups/`
3. **Validate Integrity:** Regular JSON validation checks

## 🛡️ Security Considerations

### Per-Project Memory Isolation

- Each git repository gets isolated memory context
- Zero cross-project contamination
- Role-based access control enforcement

### Git Workflow Security

- All AI changes in Docker sandboxes
- Working branch automation
- Mandatory merge approval workflows

### Health Monitoring Security

- Local-only access by default
- No sensitive data in health logs
- Secure protocol configuration storage

## 🎯 Performance Targets

### Health Check Performance

- ✅ Full health check: < 10 seconds
- ✅ API response time: < 500ms
- ✅ Dashboard load time: < 2 seconds

### System Health Targets

- ✅ Service uptime: 99.9%
- ✅ Memory isolation: 100% (zero contamination)
- ✅ Git security: 100% (all changes through approval)

## 🔮 Future Enhancements

### Planned Features

1. **Real-time Alerting**: Slack/email notifications for health issues
2. **Advanced Analytics**: Historical performance trending
3. **Auto-Recovery**: Automatic service restart on failure
4. **Load Balancing**: Multi-instance protocol execution
5. **Cloud Integration**: AWS/Azure health monitoring

### Protocol Stack Evolution

1. **Visual Flow Editor**: More sophisticated drag-and-drop interface
2. **Conditional Protocols**: If/then protocol execution logic  
3. **Performance Monitoring**: Per-protocol execution metrics
4. **A/B Testing**: Protocol configuration experiments

---

*This health monitoring system ensures rEngine's enterprise-grade reliability while maintaining the user-friendly experience that makes it accessible to individual developers. The visual protocol stack editor represents a unique innovation in AI development platform management.*
