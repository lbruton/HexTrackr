# Agents Operations Log

Date | Agent | Branch | Actions | Files | Decisions/ADRs | Follow-ups
--- | --- | --- | --- | --- | --- | ---
2025-08-29 | engineering-agent | chore/memento-mcp-setup | Initialize memory MCP and playbook scaffolding | .vscode/settings.json; docs/agents/AGENTS.md | ADR-0001 | Verify MCP server availability and DB path
2025-08-29 | engineering-agent | chore/memento-mcp-setup | Added ops log, ADR, prompt templates; linted edited files; attempted memento-mcp startup | docs/ops/AGENTS_LOG.md; docs/adr/ADR-0001-memory-backend.md; .prompts/memory-first-search.prompt.md; .prompts/summarize-and-link.prompt.md | ADR-0001 | memento-mcp not found via npm; confirm correct package or provide install path; consider fallback local memory store
