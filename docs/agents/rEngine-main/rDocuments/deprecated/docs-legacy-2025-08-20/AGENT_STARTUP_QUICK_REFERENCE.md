# rEngine Agent Startup - Quick Reference

## 🚀 One-Command Startup

```bash
./launch-smart-scribe-monitor.applescript
```

## What this does:

- ✅ Starts Docker containers (if not running)
- ✅ Launches Smart Scribe with qwen2.5-coder:7b model
- ✅ Opens monitoring console in Terminal.app
- ✅ Prevents double-launch conflicts
- ✅ Uses ~6-7GB RAM (vs 12GB+ with old llama3:8b)

## 🛡️ Safety Features

- **Process Detection**: Won't start if already running
- **Memory Monitoring**: Warns if system RAM > 80%
- **Docker Integration**: Prefers containerized services
- **Conflict Resolution**: Interactive prompts for edge cases

## 📊 Monitoring Console

The Terminal.app window shows:

- Container status and health
- Latest Smart Scribe activity (last 10 log entries)
- Real-time updates every 10 seconds
- Docker log aggregation

## 🔧 Troubleshooting

## High Memory Usage:

```bash
docker-compose down  # Stop all containers
```

## Restart Everything:

```bash
docker-compose down && docker-compose up -d
./launch-smart-scribe-monitor.applescript
```

## Check What's Running:

```bash
docker ps  # See active containers
ps aux | grep scribe  # Check local processes
```

## 📁 Key Files

- `launch-smart-scribe-monitor.applescript` - Main startup script
- `bin/safe-smart-scribe-start.sh` - Safety wrapper
- `rEngine/system-config.json` - Model configuration
- `docker-compose.yml` - Container definitions

---
*Simple, clean, conflict-free agent startup for rEngine Platform*
