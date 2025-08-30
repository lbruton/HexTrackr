# Smart Scribe Memory Health Monitoring

## Overview

Smart Scribe now includes comprehensive memory health monitoring that periodically verifies the integrity of both MCP Server Memory and rMemory Local Storage systems. This feature ensures continuous system reliability by detecting memory sync gaps, connectivity issues, and file corruption.

## Features

### 🔍 **Periodic Health Checks**

- **Frequency**: Every 15 minutes during Smart Scribe operation
- **Initial Check**: 2 minutes after Smart Scribe startup (allows system stabilization)
- **Coverage**: Both MCP Server and local file systems

### 🧠 **Memory System Monitoring**

- **MCP Server Connectivity**: Validates connection to cloud-based knowledge graph
- **Local File Integrity**: Checks critical memory files for corruption/staleness
- **Sync Gap Detection**: Identifies time gaps between MCP and local systems
- **Fallback Verification**: Ensures local memory can operate when MCP is offline

### 📋 **Incident Reporting**

- **Automatic AI Analysis**: When issues detected, generates technical incident reports
- **Structured Logging**: Stores detailed reports in `rMemory/memory-scribe/logs/`
- **Historical Tracking**: Maintains incident history in main `scribe.log`
- **Priority Classification**: CRITICAL, WARNING, and HEALTHY status levels

## Architecture

### Integration Points

```javascript
// Smart Scribe Constructor
this.memoryMonitor = new SmartScribeMemoryMonitor();

// Periodic Monitoring (15-minute intervals)
startMemoryHealthMonitoring() {
    setInterval(() => {
        this.performMemoryHealthCheck();
    }, 15 * 60 * 1000);
}
```

### Health Check Process

1. **Connectivity Test**: Verify MCP Server accessibility
2. **File Validation**: Check critical local memory files
3. **Sync Analysis**: Compare timestamps and detect gaps
4. **Report Generation**: Create health status summary
5. **Issue Analysis**: AI-powered incident analysis when problems detected
6. **Logging**: Store reports and update system logs

## Critical Files Monitored

| File | Purpose | Health Criteria |
|------|---------|----------------|
| `memory.json` | Core agent memories | < 24 hours old, valid JSON |
| `handoff.json` | Agent handoff logs | < 24 hours old, valid JSON |
| `tasks.json` | Active task tracking | < 24 hours old, valid JSON |
| `persistent-memory.json` | Long-term storage | < 24 hours old, valid JSON |
| `mcp-sync-summary.json` | Sync operation logs | < 24 hours old, valid JSON |

## Health Status Levels

### ✅ **HEALTHY**

- MCP Server accessible
- All local files present and recent
- No sync gaps detected
- System operating normally

### ⚠️ **WARNING**  

- MCP Server intermittent issues
- Some files slightly stale (but < 24 hours)
- Minor sync delays detected
- Local fallback operational

### ❌ **CRITICAL**

- MCP Server completely offline
- Critical files missing or severely stale
- Major sync gaps (> 24 hours)
- System degraded functionality

## Incident Reports

When health issues are detected, Smart Scribe generates comprehensive incident reports:

### Report Structure

```json
{
  "timestamp": "2025-01-25T10:30:00.000Z",
  "type": "memory_health_incident",
  "health_report": {
    "overall_health": "CRITICAL",
    "mcp_status": "offline",
    "local_files": {...},
    "sync_gaps": {...}
  },
  "ai_analysis": "Root cause analysis and recommendations...",
  "generated_by": "smart_scribe_memory_monitor"
}
```

### AI Analysis Includes

- **Root Cause Analysis**: Technical investigation of detected issues
- **Action Items**: Immediate steps to resolve critical problems  
- **Prevention**: Measures to avoid future issues
- **Impact Assessment**: Effect on system reliability
- **Monitoring Adjustments**: Recommended frequency changes

## Usage

### Automatic Operation

Memory monitoring activates automatically when Smart Scribe starts:

```bash

# Start Smart Scribe (includes memory monitoring)

./start-smart-scribe.sh
```

### Manual Health Check

```bash

# Direct memory health check

cd rEngine
node smart-scribe-memory-monitor.js health
```

### View Reports

```bash

# Browse incident reports

ls rMemory/memory-scribe/logs/memory-incident-*.json

# Check main log

tail -f scribe.log | grep MEMORY_HEALTH
```

## Configuration

### Monitoring Intervals

- **Health Checks**: 15 minutes (configurable via `setInterval`)
- **File Age Threshold**: 24 hours (configurable via `maxFileAge`)
- **Initial Delay**: 2 minutes (allows system startup)

### Log Locations

- **Incident Reports**: `rMemory/memory-scribe/logs/memory-incident-{timestamp}.json`
- **System Log**: `scribe.log` (MEMORY_HEALTH entries)
- **Dashboard Status**: `developmentstatus.html` (real-time display)

## MCP Connectivity

Smart Scribe can access MCP Server from Ollama context:

- **Protocol**: Network-based MCP communication
- **Fallback**: Local file system when MCP offline  
- **Architecture**: Standalone MCP server accessible to any client
- **Reliability**: Dual-path memory access ensures continuity

## Benefits

### 🛡️ **Proactive Problem Detection**

- Identifies memory issues before they impact operations
- Prevents data loss through early warning systems
- Maintains system reliability through continuous monitoring

### 🔧 **Automated Incident Response**  

- AI-powered analysis of detected problems
- Structured incident reports for rapid troubleshooting
- Historical tracking enables pattern recognition

### 📊 **System Visibility**

- Real-time memory health status in development dashboard
- Comprehensive logging for forensic analysis
- Performance metrics for optimization decisions

## Troubleshooting

### Common Issues

## MCP Server Offline

- Check MCP process: `ps aux | grep mcp-server`
- Restart MCP: `npm run start-mcp`
- Verify network connectivity

## Stale Local Files

- Run memory sync: `./scripts/memory-sync-automation.sh manual`
- Check file permissions: `ls -la rMemory/rAgentMemories/`
- Validate JSON syntax: `node -e "console.log(JSON.parse(fs.readFileSync('file.json')))"`

## High Incident Volume

- Adjust monitoring frequency in Smart Scribe
- Check system resource usage
- Review MCP server stability

## Future Enhancements

- **Adaptive Monitoring**: Frequency adjustment based on system load
- **Predictive Analytics**: ML-based failure prediction
- **Integration Dashboard**: Web-based memory health visualization
- **Alert Channels**: Slack/email notifications for critical incidents
- **Performance Metrics**: Memory system benchmarking and optimization

---

**Last Updated**: January 25, 2025  
**Version**: 1.0.0  
**Integration Status**: ✅ Active in Smart Scribe
