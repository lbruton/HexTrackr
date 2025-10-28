---
description: Search codebase using natural language queries via claude-context
allowed-tools: mcp__claude-context__search_code
---
use ***claude-context*** and mcp__claude-context__search_code to search our Codebase with these parameters:
- path: "/Volumes/DATA/GitHub/HexTrackr"
- query: [your natural language search query]
- limit: 10 (adjust as needed, max 50)
- extensionFilter: [optional array of extensions like [".js", ".css"]]