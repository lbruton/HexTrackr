# ADR-0001: Memory Backend via memento-mcp

Date: 2025-08-29

## Status

Accepted

## Context

HexTrackr requires project-scoped memory for agents to persist decisions, summarize changes, and support memory-first workflows. VS Code Chat supports MCP servers that can expose memory operations.

## Decision

Adopt `memento-mcp` as the primary memory backend, configured via `.vscode/settings.json` under `chat.mcp.servers` and route aliases `memory.write`, `memory.search`, and `memory.tag`.

## Consequences

- Agents can query and write memory through standardized routes.
- If the server is unavailable, operations fall back to logging notes in `docs/ops/AGENTS_LOG.md` and opening a task to restore the MCP.
- ADRs and memory entries must be tagged with `project:${workspaceFolderBasename}` for scoping.

## Alternatives Considered

- Local JSON files only: simpler but lacks search and tagging capabilities.
- Other MCP memory servers: viable but not standardized in this project.
