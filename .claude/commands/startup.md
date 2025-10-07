---
description: Quick compressed context load from Linear, Memento, and codebase for session start
allowed-tools: mcp__memento__*, mcp__linear-server__*, mcp__claude-context__*
---
# Startup Context Load

Launch the following agents **IN PARALLEL** (single message, multiple Task calls) to gather compressed context:

## 1. linear-librarian
**Compression Target**: 1 paragraph max
- Current Linear issue from git branch (if HEX-XXX in branch name, get full details)
- Task checklist status (what's done, what's in progress, what remains)
- Any blockers or dependencies

## 2. codebase-navigator
**Compression Target**: 2 paragraphs max
- **Para 1 - Recent Activity**: Last 3-5 edited files with purpose + last 3 commits summary
- **Para 2 - Technical Foundation**: File structure (app/routes, app/services, app/public), framework stack (Express/SQLite/Socket.io/AG-Grid/ApexCharts), key integration points for current work

## 3. memento-oracle
**Compression Target**: 1 paragraph max
- Database schema overview (main tables relevant to current work)
- Recent patterns/lessons learned related to current branch (last 30 days)
- Any critical anti-patterns to avoid

## Final Synthesis

Create a **3-5 paragraph executive briefing**:

**¶1 - Session Context** (linear-librarian):
Current issue HEX-XXX, current task status, what remains

**¶2 - Recent Activity** (codebase-navigator):
Last edited files + recent commits + their purpose

**¶3 - Technical Baseline** (codebase-navigator):
Architecture overview, framework patterns, integration points

**¶4 - Schema & Patterns** (memento-oracle):
Relevant DB tables, key lessons, anti-patterns

**¶5 - Next Action** (your synthesis):
One sentence: "Ready to continue with [specific next task]"

**CRITICAL**: Keep total output under 400 words. Be ruthlessly concise.
