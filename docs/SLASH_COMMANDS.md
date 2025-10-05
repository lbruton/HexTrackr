# Slash Commands Reference

## Context Generation & Recovery

### /prime

**Purpose**: Full intelligence generation (60k internal tokens, 60s)
**When to Use**:

- Session start (especially after long breaks)
- Major context shift (switching features/issues)
- Weekly refresh (if context > 7 days old)
- After major architectural changes

**What it Does**:

- Runs 4 specialized agents (linear-librarian, memento-oracle, codebase-navigator, technical baseline)
- Creates PRIME-X issue in Linear "Prime Logs" team
- Saves intelligence entities to Memento knowledge graph
- Returns compressed 8-12k token context report

**Output**: Comprehensive project state including active work, recent completions, blockers, next actions, code locations, patterns

---

### /quickprime

**Purpose**: Fast context recovery (10k tokens, 5-10s)
**When to Use**:

- Post-auto-compact recovery (primary use case)
- Mid-session context check ("what was I working on?")
- Morning context restore (if prime log < 24h old)

**What it Does**:

- Loads most recent PRIME-X issue from Linear
- Adds git delta analysis (commits since prime)
- Checks CHANGELOG status
- Extracts Memento intelligence links

**Output**: Prime context + delta summary showing what changed since prime run

**Trade-off**: 85% faster than /prime, uses prime log age (not real-time), but adds git delta for recency

---

### /prime_old, /slowprime, /quickprime_old

**Status**: Legacy/alternative implementations
**Recommendation**: Use /prime and /quickprime instead (current production versions)

---

## Session Memory Management

### /save-conversation

**Purpose**: Persist current session to local file
**When to Use**:

- End of productive session (for future replay)
- Before risky operations (safety checkpoint)
- Before switching contexts/projects

**Storage**: Local `.claude/` directory (machine-specific)

---

### /recall-conversation

**Purpose**: Restore previous conversation session
**When to Use**:

- Continue work from previous session
- Replay specific problem-solving session
- Restore context after accidental loss

**Output**: Exact conversation state with all messages and tool calls

---

## Inter-Instance Communication

### /save-handoff

**Purpose**: Create handoff package for Claude-Prod/Desktop
**When to Use**:

- Completed feature ready for production deployment
- Complex issue requiring cross-instance coordination
- Context transfer between Dev → Prod → Desktop

**Storage**: `.claude/.handoff/HEXTRACKR-HANDOFF-YYYYMMDD-HHMMSS.json` (git-tracked)

**Workflow**:

```bash
# Claude-Dev (Mac)
/save-handoff
git add .claude/.handoff/
git commit -m "chore: Handoff package for Claude-Prod"
git push origin dev

# Claude-Prod (Ubuntu)
git pull origin dev
/recall-handoff
```

---

### /recall-handoff

**Purpose**: Load handoff from another Claude instance
**When to Use**:

- Starting work based on another instance's completion
- Receiving context from Claude-Dev or Claude-Desktop

**Output**: Full context reconstruction from handoff package

---

## Knowledge Capture

### /save-insights

**Purpose**: Capture key learnings/breakthroughs from session
**When to Use**:

- Discovered important pattern or anti-pattern
- Solved difficult problem worth remembering
- End of research-heavy session
- After performance breakthrough

**Storage**: Local `.claude/insights/` (persists across sessions)

---

### /recall-insights

**Purpose**: Reload saved insights from previous sessions
**When to Use**:

- "How did we solve X problem before?"
- Pattern discovery for similar issues
- Knowledge archaeology (months-old insights)

**Output**: Curated breakthrough discoveries from past sessions

---

## Safety Checkpoints

### /save-rewind

**Purpose**: Create checkpoint before major changes
**When to Use**:

- Before major refactoring
- Before database migrations
- Before risky architectural changes
- Before dependency upgrades

**Storage**: Local `.claude/rewind/` (rollback points)

---

### /recall-rewind

**Purpose**: Restore to previous checkpoint
**When to Use**:

- Risky change went wrong
- Need to undo complex refactoring
- Rollback to known-good state

**Output**: Session state from checkpoint

---

## Code Intelligence

### /search-code

**Purpose**: Query indexed codebase with natural language
**When to Use**:

- Find implementations of specific patterns
- Locate where feature X is implemented
- Search for security vulnerabilities
- Find all usages of deprecated API

**Backend**: Claude-Context MCP (semantic search)

**Example**:

```text
/search-code "express session middleware configuration"
→ Returns: server.js:123, auth.js:10-29, related files
```

---

### /index-code

**Purpose**: Re-index codebase for semantic search
**When to Use**:

- After major file additions/deletions
- Index feels stale (search results poor)
- First-time project setup

**Backend**: Claude-Context MCP (creates embeddings)

---

### /status-code

**Purpose**: Check codebase indexing status
**When to Use**:

- Verify index is up-to-date
- Check file/chunk counts
- Troubleshoot search issues

**Output**: Files indexed, chunk count, last index time

---

## Analysis & Reporting

### /create-report

**Purpose**: Generate project status report
**When to Use**:

- Weekly status updates
- Sprint retrospectives
- Stakeholder summaries

**Output**: Linear REP-XX issue with status snapshot

---

### /compare-reports

**Purpose**: Delta analysis between two reports
**When to Use**:

- Track velocity trends
- Sprint comparison
- "How much progress since last week?"

**Output**: Trend analysis, velocity changes, completion rates

---

## Reasoning Tools

### /think

**Purpose**: Sequential thinking for complex problems
**When to Use**:

- Multi-step problem analysis
- Planning complex features
- Debugging difficult issues
- Architectural decision analysis

**Backend**: mcp__sequential-thinking MCP

**Output**: Structured thought process with reasoning steps

---

### /why

**Purpose**: Explain reasoning for decisions/recommendations
**When to Use**:

- "Why did you choose X approach?"
- Understand recommendation rationale
- Learn from AI decision-making

**Output**: Explanation of reasoning behind suggestions

---

## Utility

### /help

**Purpose**: Get help with using Claude Code
**When to Use**: Need Claude Code usage guidance

### /clear

**Purpose**: Clear conversation history
**When to Use**: Start fresh session (loses context unless saved)

### /context

**Purpose**: Show token usage breakdown
**When to Use**: Monitor context usage, approaching auto-compact threshold
