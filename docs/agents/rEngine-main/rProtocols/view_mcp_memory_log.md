# Protocol: View MCP Memory Log

**Version: 1.0.0**
**Date: 2025-08-18**
## Status: Active

## Purpose

This protocol defines the steps for viewing MCP memory operation logs in the StackTrackr environment.

## Steps

1. Launch a background console window to view live MCP memory logs:

```bash
open -a Terminal.app /Volumes/DATA/GitHub/rEngine/scripts/view_mcp_memory_log.sh &
```

Or, to view the latest log file in the logs directory in a background console:

```bash
open -a Terminal.app /Volumes/DATA/GitHub/rEngine/scripts/view_latest_memory_log.sh &
```

Replace `<DATE>` with the desired log date if using a custom script.

## Prompt for Copilot

Whenever you need to view MCP memory logs, prompt Copilot with:

> Please execute the view_mcp_memory_log protocol to show live MCP memory operations in a background console.

---

## Notes

- These logs provide real-time feedback for all MCP memory writes and operations.
- For historical logs, browse the `/Volumes/DATA/GitHub/rEngine/logs/` directory.
