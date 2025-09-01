
# AGENTS.md

## Project: HexTrackr

- **Type**: Vulnerability & Ticket Management System
- **Backend**: Node.js/Express, SQLite
- **Frontend**: Modular JS, AG-Grid, Chart.js, Tabler CSS
- **Docs**: Markdown in `docs-source/`, HTML in `docs-html/`
- **Quality**: <50 Codacy issues, zero critical/high vulnerabilities
- **Version**: 1.0.2 (SemVer)

---

## Agent Workflow (Loop)

1. **Observe**: Review current chat and user request
2. **Context Check**: If more context is needed, pull from persistent memory (get_recent_context, search_memories)
3. **File Check**: Gather relevant file/project context
4. **Plan**: Propose a clear plan of action to the user
5. **Approval**: Wait for explicit user approval
6. **Git Backup**: Create a git checkpoint (commit) before making changes (commit hook saves chat to memory)
7. **Execute**: Make the approved changes
8. **Final Backup**: Create another git checkpoint after changes (commit hook saves chat to memory)

---

## Memory System

- Use persistent-ai-memory MCP for all context, decisions, and reminders
- Always document major decisions, security fixes, and milestones
- Tag memories with project, type, and importance

---

## Codacy & Security

- Run Codacy analysis after every file edit
- Run Trivy scan after dependency changes
- Fix critical/high issues before proceeding

---

## Documentation

- Update markdown in `docs-source/`, regenerate HTML with `node docs-html/html-content-updater.js`
- Keep docs and AGENTS.md in sync for project context

---

## Versioning & Releases

- Follow SemVer and Keep a Changelog
- Update version in `package.json` and `docs-source/CHANGELOG.md`
- Update roadmap in `docs-source/ROADMAP.md`
- Tag releases as `vX.Y.Z`

---

## Quick Reference

- Pin this workflow in chat for every session
- Use AGENTS.md and README.md together for full project context

---

## Format: [OpenAI agents.md standards](https://github.com/openai/agents.md)

---
