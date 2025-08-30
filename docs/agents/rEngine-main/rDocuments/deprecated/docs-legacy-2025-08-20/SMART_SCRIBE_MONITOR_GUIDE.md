# Smart Scribe Monitor - Quick Reference

## 🚀 Launch Command

```bash
./launch-smart-scribe-monitor.applescript
```

## 📊 What You'll See

The monitor displays:

- **⏰ Last updated**: Current timestamp
- **💾 Memory usage**: Smart Scribe process memory consumption
- **🔧 Process status**: Whether Smart Scribe is running
- **📋 Latest Activity**: Last 10 lines from Smart Scribe logs
- **🔄 Auto-refresh**: Updates every 10 seconds

## 🎛️ Controls

- **Ctrl+C**: Stop monitoring (keeps Smart Scribe running)
- **Window title**: "🤖 Smart Scribe Monitor"
- **Auto-positioning**: Opens at coordinates (100,100) with 700x500 size

## 🔧 Features

- **Memory-safe startup**: Won't start duplicate processes
- **Process checking**: Validates existing Smart Scribe instances
- **Memory warnings**: Alerts if system memory > 80%
- **Verbose logging**: Real-time activity monitoring
- **Terminal.app integration**: Dedicated monitoring window

## 📁 Log Files

- **Smart Scribe logs**: `rEngine/logs/smart-scribe.log`
- **Process PID**: `rEngine/logs/smart-scribe.pid`
- **Deprecation log**: `rEngine/logs/deprecation.log`

## ⚠️ Deprecated

This system replaces:

- `split-screen-scribe` (deprecated Aug 19, 2025)
- Manual `node smart-scribe.js` commands
- Separate monitoring scripts

---
*Created: August 19, 2025*
*Part of: rEngine Platform v2.1.1*
