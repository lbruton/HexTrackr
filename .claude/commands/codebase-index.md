---
description: Index or re-index codebase for semantic search capabilities
allowed-tools: mcp__claude-context__index_codebase
---
use ***claude-context*** MCP server and use mcp__claude-context__index_codebase to re-index our Codebase with these parameters:
- path: "/Volumes/DATA/GitHub/HexTrackr"
- splitter: "ast" (for AST-based code splitting, or "langchain" for character-based)
- force: true (set to true for full reindex if the index is out of date)