---
description: Check codebase indexing status and progress
allowed-tools: mcp__claude-context__get_indexing_status, mcp__claude-context__clear_index
---
use ***claude-context*** and mcp__claude-context__get_indexing_status to check indexing status with these parameters:
- path: "/Volumes/DATA/GitHub/HexTrackr"

This will show:
- Whether the codebase is indexed
- Current indexing progress (if indexing is in progress)
- Last update timestamp
- Completion percentage

To clear an index:
- Use mcp__claude-context__clear_index with path parameter

Thank you.