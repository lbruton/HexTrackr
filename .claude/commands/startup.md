---
description: Quick compressed context load from Linear, Memento, and codebase for session start
allowed-tools: mcp__memento__*, mcp__linear-server__*, mcp__claude-context__*
---
# Startup Context Load

**Philosophy**: Read from historical reports (already processed), check deltas (what changed), synthesize for action.

**Token Strategy**: Use subagents for heavy lifting, main chat receives only compressed 400-500 word briefing.

---

## Phase 1: Historical Context (Linear Reports)

Use **linear-librarian** agent to quickly retrieve and extract key highlights:

1. **Latest Prime Log** (team: "Prime Logs", orderBy: "updatedAt", limit: 1)
   - Extract: Session date, codebase state summary, active issues

2. **Latest Weekly Report** (team: "HexTrackr-Dev", label: "daily-report", orderBy: "updatedAt", limit: 1)
   - Extract: Team progress, sprint status, key blockers

3. **Latest Insights Report** (team: "Memories", label: "prime-log", orderBy: "updatedAt", limit: 1)
   - Extract: Technical breakthroughs, patterns, lessons learned

**Compression Target**: 1 sentence per report (3 sentences total)

---

## Phase 2: Delta Check (What Changed Since Last Session)

Use **codebase-navigator** agent to check:

- **Git commits** since last Prime Log timestamp (parse date from Phase 1)
- **Changed files**: `git diff --name-only HEAD~[N]` (N = commits since last session)
- **Current branch** + uncommitted changes: `git status --short`
- **Branch context**: Extract HEX-XXX issue ID from branch name if present

**Compression Target**: 2-3 sentences max

---

## Phase 3: Current Context (Parallel Agents)

Launch the following agents **IN PARALLEL** (single message, multiple Task calls):

### 1. linear-librarian
**Compression Target**: 1 paragraph max
- Current Linear issue from git branch (if HEX-XXX in branch name, get full details)
- Task checklist status (what's done, what's in progress, what remains)
- Any blockers or dependencies
- Related issues (parent/child relationships)

### 2. codebase-navigator
**Compression Target**: 2 paragraphs max
- **Para 1 - Recent Activity**: Last 3-5 edited files with purpose
- **Para 2 - Technical Foundation**: File structure (app/routes, app/services, app/public), framework stack (Express/SQLite/Socket.io/AG-Grid/ApexCharts), key integration points for current work

### 3. memento-oracle
**Compression Target**: 1 paragraph max
- Database schema overview (main tables relevant to current work)
- Recent patterns/lessons learned related to current branch (last 30 days)
- Any critical anti-patterns to avoid

---

## Final Synthesis

Create a **5-paragraph executive briefing** (400-500 words max):

**¶1 - Historical Highlights** (Phase 1):
```
Last session ([date from Prime Log]):
- Prime Log: [key codebase state insight]
- Weekly Report: [key team progress or blocker]
- Insights: [key technical breakthrough or pattern]
```

**¶2 - What Changed** (Phase 2):
```
Since last session:
- [N] commits: [brief summary of commit messages]
- Changed files: [list files, indicate purpose]
- Branch: [branch name] (HEX-XXX if applicable)
- Worktree: [clean / N uncommitted changes]
```

**¶3 - Current Task** (Phase 3 - linear-librarian):
```
Working on: HEX-XXX - [issue title]
Status: [X/Y tasks complete, or current state]
Next up: [specific task from checklist]
Blockers: [if any, otherwise "None"]
Related: [parent/child issues if relevant]
```

**¶4 - Technical Context** (Phase 3 - codebase-navigator + memento-oracle):
```
Architecture: [relevant stack elements for current work]
Recent edits: [last 3-5 files + purpose]
DB Schema: [relevant tables]
Patterns: [lessons learned from memento-oracle]
Anti-patterns: [what to avoid]
```

**¶5 - Ready State** (Your synthesis):
```
Cross-reference: [How historical context (¶1) connects to current work (¶3)]
Next action: "Ready to continue with [specific task from Linear checklist]"
```

---

## Output Format

Present as a clean executive briefing with clear section headers. Example:

```markdown
# HexTrackr Session Startup

## Historical Context
Last session (2025-10-08 09:00): Prime Log reported auth v1.0.48 complete.
Weekly standup showed 90% perf improvement from HEX-117. Insights highlighted
RPI workflow validation.

## Delta Since Last Session
3 commits: Added vendor CSV breakdown (HEX-149 Tasks 1.1-1.3). Changed files:
app/services/csvExportService.js, app/public/js/helpers.js, tests/csv.test.js.
Branch: feature/hex-149-vendor-csv-breakdown. Worktree: clean.

## Current Task
Working on: HEX-150 - IMPLEMENT: Add Vendor Breakdown to CSV Export
Status: 3/5 tasks complete (Tasks 1.1-1.3 done, 1.4-1.5 remaining)
Next up: Task 1.4 - Add arithmetic validation
Blockers: None
Related: Parent HEX-149 (PLAN), Grandparent HEX-148 (RESEARCH)

## Technical Context
Architecture: Express/SQLite/better-sqlite3, CSV export via csvExportService.js
Recent edits: csvExportService.js (vendor breakdown), helpers.js (aggregation)
DB Schema: vulnerabilities table (vendor, severity, status columns)
Patterns: O(n) aggregation preferred over SQL joins for vendor filtering
Anti-patterns: Avoid in-memory full table scans, use Map for O(1) lookups

## Ready State
Cross-reference: Today's vendor CSV work (HEX-150) builds on last week's
CSV export foundation (HEX-144) and continues the RPI workflow pattern
validated in Insights report.

Ready to continue with Task 1.4: Add arithmetic validation to vendor breakdown tables.
```

---

**CRITICAL**:
- Total output under 500 words
- Be ruthlessly concise
- Focus on actionable information
- Use subagents to isolate token consumption
- Main chat receives only the final briefing
