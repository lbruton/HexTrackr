# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<!-- SPEC-KIT START -->
<!-- DO NOT MODIFY: This section is managed by spec-kit scripts -->
## Active Technologies
- Node.js/Express + SQLite (HexTrackr core)

## Recent Changes
- 003-vulnerability-vpr-score: VPR scoring implementation
- 004-tickets-table-prototype: AG-Grid implementation for tickets table
<!-- SPEC-KIT END -->

<!-- MANUAL ADDITIONS START -->

## 🧠 Memory Keyword Matrix

When user says → I should:
- **"remember"/"recall"/"do you know"** → Search Memento semantically for relevant memories
- **"last time"/"previously"/"before"** → Check recent bundles + Memento SESSION entities
- **"we discussed"/"we talked about"** → `mcp__memento__search_nodes` with "project:hextrackr SESSION [topic]"
- **"the bug with"/"the issue where"** → Search "critical-bug [feature]" in Memento
- **"insight about"/"lesson learned"** → Search "INSIGHT breakthrough [topic]"
- **"what did we decide"** → Search "DECISION conclusion [topic]"
- **"progress on"/"status of"** → Search "in-progress blocked [feature]"

## 🛠️ MCP Servers Reference

### Primary Tools
- **Claude Context**: Semantic code search. Re-index at session start with `force: true` if git shows recent changes
- **Memento**: Knowledge graph. Always use `mode: "semantic"` for conceptual searches
- **Brave Search**: Web research. Use with `summary: true` then `brave_summarizer` for AI synthesis

### Specialized Tools
- **Context7**: Library docs. Call `resolve-library-id` first, then `get-library-docs`
- **Playwright**: Browser testing. Always `docker-compose restart` before E2E tests
- **Sequential-thinking**: Break down complex tasks into steps
- **Zen**: Deep analysis tools (user request only)

## ⚡ Essential Workflows

### Session Start (/prime)
```javascript
// 1. Git context + re-index
date && git log --oneline -5 && git status
mcp__claude-context__index_codebase({path: "/Volumes/DATA/GitHub/HexTrackr", force: true})

// 2. Recent memories
mcp__memento__search_nodes({query: "project:hextrackr SESSION 2025-09", mode: "semantic"})

// 3. Bundle check if needed
~/.claude/hooks/list-bundles.sh | head -5
```

### Code Discovery Pattern
```
Did I just write/modify code?
├─ YES → Use Read/Grep directly (index is stale)
└─ NO → Use claude-context__search_code first
```

### After Code Changes
1. Read changed files directly
2. Re-index only after batch of changes complete
3. Never search for code just written (use Read)

## 🏗️ Key Patterns

### AG-Grid Tables
- Custom cell renderers for arrays (show 2 + overflow)
- `tooltipValueGetter` for full data display
- Theme switching via class toggle: `ag-theme-quartz` ↔ `ag-theme-quartz-dark`

### Security & Testing
- **PathValidator** for all file operations
- **Docker only** for testing (port 8989)
- **Lint before commit**: `npm run eslint && npm run stylelint`

### Critical Paths
- Controllers: `/app/controllers/` (singleton pattern)
- Services: `/app/services/` (functional exports)
- Frontend: `/app/public/scripts/pages/` (ES6 modules)
- Styles: `/app/public/styles/` (modular CSS)

## 📜 Constitution & Rules

**LAW OF THE LAND**: `.specify/memory/constitution.md` contains mandatory operating principles
- Claude Context is PRIMARY discovery tool (not file reads)
- All code MUST pass linting (ESLint 9+, Stylelint)
- Docker for ALL testing (never run locally)
- Document AFTER feature completion

**Spec-Kit** (EXPERIMENTAL): Use `/specify` → `/plan` → `/tasks` when helpful, not mandatory

## 🚀 Quick Commands

### Development
```bash
docker-compose up -d         # Start (port 8989)
docker-compose restart       # Before Playwright tests
npm run eslint:fix          # Fix JS issues
npm run stylelint:fix       # Fix CSS issues
```

### Documentation
```bash
npm run docs:generate       # Update HTML portal
npm run docs:pipeline       # JSDoc → Markdown
```

### Testing
```bash
npm test                    # All tests
npx playwright test         # E2E tests
npm run test:coverage       # Coverage report
```

### Code Quality (No MCP Required)
```bash
# HexTrackr has Codacy CLI built-in at .codacy/cli.sh
./.codacy/cli.sh analyze --format text       # Text output
./.codacy/cli.sh analyze --format json       # JSON output

# Config file: .codacy/codacy.yaml
# Excludes tests, vendor libs, minified files
# Tools: ESLint, Lizard, PMD, Semgrep, Trivy
```

## 🎯 Focus Areas

1. **Performance**: AG-Grid handles 10K+ rows, WebSocket for progress
2. **Architecture**: Modular ES6 frontend, Express + SQLite backend
3. **Themes**: CSS variable hierarchy for dark/light modes
4. **Security**: PathValidator, DOMPurify, parameterized queries

<!-- MANUAL ADDITIONS END -->