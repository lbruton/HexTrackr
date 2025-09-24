# Prime Instructions for HexTrackr Development

**Purpose**: Load complete project context through a strict, sequential discovery process to provide effective full-stack development assistance.

## STRICT EXECUTION REQUIREMENTS

You MUST follow these phases in exact order. Each phase builds on the previous one.

### Phase 1: Temporal & Git Context + Index Refresh (REQUIRED)
Execute these exact commands in order:

   - use **Sequential Thinking** 

#### 1A: Basic Context (using Bash tool)
1. Run: `date "+%Y-%m-%d %H:%M:%S %Z"` to get current date/time
2. Run: `git log --oneline -3` to see the last 3 commits with messages
3. Run: `git status --short` to see uncommitted changes
4. Run: 'git branch --show-current' (Learn the current working branch)

#### 1B: Claude Context Re-indexing (using MCP tools

5. **ALWAYS re-index at session start**: ` mcp__claude-context__index_codebase ` with:
   - path: "/Volumes/DATA/GitHub/HexTrackr"
   - splitter: "ast"
   - force: true

### Phase 3: Keyword Compilation (REQUIRED)

**DO NOT SKIP THIS PHASE**. Manually extract and compile keywords from Phases 1-2:

From git commits, extract:
- Feature names (e.g., "CSV import", "VPR scoring", "documentation")
- Fix targets (e.g., "pipeline", "modal", "WebSocket")
- Component names (e.g., "importService", "dashboardController")

From bundle summaries, extract:
- Problem areas (e.g., "data corruption", "breaking changes")
- Recent work (e.g., "linting", "refactoring", "testing")
- Session themes (e.g., "critical-bug", "enhancement")

From date, note:
- Current month-year (e.g., "2025-09", "September 2025")
- Day of week (for recent session context)

### Phase 4: Project Knowledge Graph Search (REQUIRED)

**DO NOT SKIP THIS PHASE**. Execute more semantic searches for comprehensive context:

#### Search 1: Last 48 Hours Activity (captures recent handoffs, sessions, insights)
Calculate yesterday's date and current week number from Phase 1 date, then search:
- Tool: `mcp__memento__search_nodes`
- Query Pattern: "[YESTERDAY_DATE] [TODAY_DATE] week-[WEEK#]-[YEAR] handoff session insight completed in-progress"
- Mode: "semantic"
- TopK: 10
- Threshold: 0.35

Example: "2025-09-19 2025-09-20 week-38-2025 handoff session insight completed in-progress"

Example: "project:hextrackr tooltip attachment ES6 module vulnerability JSDoc dark mode"

**Tag Patterns to Watch** (per /memento/TAXONOMY.md):
- Temporal: week-XX-YYYY, YYYY-MM-DD
- Status: completed, in-progress, handoff
- Learning: lesson-learned, pattern, breakthrough, insight

**Store results** - Recent work patterns and insights inform Phase 5 searches.

### Phase 5: Codebase Semantic Search (REQUIRED)

**Note**: Index was refreshed in Phase 1, so all searches will include the latest code changes.

Using keywords from Phase 3, execute these searches with `mcp__claude-context__search_code`:

1. **Architecture Search** (path: "/Volumes/DATA/GitHub/HexTrackr", limit: 3):
   Query: "Express server initialization middleware routes controllers" 

2. **Recent Feature Search** (path: "/Volumes/DATA/GitHub/HexTrackr", limit: 5):
   Query: Use specific features from git commits in Phase 1
  "CSV import pipeline deduplication WebSocket progress"

3. **Problem Area Search** (path: "/Volumes/DATA/GitHub/HexTrackr", limit: 5):
   Query: Use problem areas from bundle summaries in Phase 2
  (e.g., "modal initialization dataManager corruption backup restore")

**If searches return unexpected results**: The index should be fresh from Phase 1, but if you encounter issues, verify the index timestamp matches today's date.

### Phase 7: 

Read: CONSTITUTION.md
Read: CLAUDE.md

### Phase 8: Synthesis & Report (REQUIRED)
You MUST produce this summary to confirm context loading:

## Report

Use the following template to summarize your understanding and confirm readiness:

```markdown

## 📋 Project Summary:

**Project**: HexTrackr v[VERSION from package.json if found]

**Branch**: [from git status]

**Working Directory**: [current path]

**Current Time**: [from Phase 1]

**Index Status**: ✅ Re-indexed at session start ([X] files, [Y] chunks)

**Recent Commits**: [count] commits analyzed

**Session History**: [count] recent sessions found

**Uncommitted Changes**: [Yes/No with count from git status]

### Keywords Extracted for Context

- **Git Keywords**: [list 3-5 from Phase 3]

- **Session Keywords**: [list 3-5 from Phase 3]

- **Active Features**: [list from discoveries]

[1 paragraph summarizing the current state of the project, recent work, and any important patterns or issues discovered]





```
