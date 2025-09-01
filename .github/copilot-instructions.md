# HexTrackr AI Assistant Instructions

## Project Overview

HexTrackr is a vulnerability and ticket management system with a monolithic Node.js/Express backend and browser-based frontend. It uses SQLite for persistence and follows a modular JavaScript architecture pattern.

## Memory-First Workflow (MANDATORY)

### Core Memory System

1. **Initialize**: Always check `get_recent_context` and `search_memories` at session start
2. **Document**: Create memories for decisions, store conversations at milestones  
3. **Update**: Set reminders, update status, maintain project continuity

Memory tools available in `.prompts/` directory. Use semantic search to find previous solutions.

## Essential Architecture

### Key Files

- `server.js`: Main backend entry point
- `scripts/init-database.js`: DB schema and initialization
- `scripts/shared/settings-modal.js`: Global frontend utilities
- `data/hextrackr.db`: SQLite database
- `docs-source/`: Markdown documentation source

## Documentation System

- **Source**: `docs-source/` (Markdown) → **Generated**: `docs-html/` (HTML)
- **Update**: Run `node docs-html/html-content-updater.js` to regenerate
- **Architecture**: `docs-source/architecture/`
- **APIs**: `docs-source/api-reference/`

## Current Standards

- **Version**: 1.0.2 (Semantic Versioning)
- **Changelog**: Follow Keep a Changelog format
- **Quality**: Maintain <50 Codacy issues
- **Security**: Zero critical/high vulnerabilities

## When to Load Specialized Instructions

Load additional instruction modules based on task context:

- **Memory operations & workflows**: Load `.github/instructions/memory-workflow.md`
- **Architecture & technical details**: Load `.github/instructions/architecture-guide.md`
- **Versioning & releases**: Load `.github/instructions/versioning-standards.md`
- **Code quality & Codacy**: Load `.github/instructions/codacy-compliance.md`
- **Documentation system**: Load `.github/instructions/documentation-system.md`
- **MCP tools & integrations**: Load `.github/instructions/mcp-tools-guide.md`

## Critical Workflows

### Git Checkpoint (MANDATORY)

- **Before ANY file writes**: Create git checkpoint with `git add . && git commit -m "checkpoint: [brief description]"`
- **Before major changes**: Ensure clean working directory
- **Recovery point**: Enables rollback if issues occur

### Code Quality (MANDATORY)

- **After ANY file edit**: Run `codacy_cli_analyze` immediately
- **After dependencies**: Run with tool "trivy"
- **Fix issues**: Resolve before proceeding

### Common Pitfalls

- File uploads max 100MB
- SQLite requires write permissions in `data/`
- Remember to unlink temp files after processing
- Docker container restart needed before Playwright tests

## Project Context

Frontend follows modular pattern (shared/pages/utils). Backend is monolithic Express with runtime schema evolution. Integration points include ServiceNow tickets, CSV imports, and backup/restore systems.

Full detailed documentation available in specialized instruction modules above.
