# Prime Workflow v2.0 - Rewind Strategy

## Overview

**Problem**: Running full `/prime` every session wastes 40-60K tokens and takes 60-90 seconds.

**Solution**: Rewind strategy with two complementary commands:
- `/fastprime` - Comprehensive baseline (once daily)
- `/context` - Lean delta load (every subsequent session)

---

## The Two-Command System

### `/fastprime` - Morning Baseline
**When**: First session of the day (or when baseline is stale >24h)
**Token Cost**: 40-60K (agents) → ~5K compressed in Linear
**Time**: 60-90 seconds
**Output**: Comprehensive Prime Log saved to Linear "Prime Logs" team

**What it does**:
1. Re-indexes codebase with claude-context
2. Launches 3 agents IN PARALLEL:
   - `linear-librarian`: Active issues, todo, backlog
   - `memento-oracle`: Patterns, breakthroughs, lessons
   - `codebase-navigator`: Architecture, services, integration points
3. Synthesizes comprehensive report with file:line references
4. Saves to Prime Logs team (PRIME-XX)
5. Agents archive full research to Memento

**Prime Log Structure**:
- Active Work (with file:line references and next actions)
- Code-Ready Integration Points
- Technical Baseline (services, database, commands)
- Memento Intelligence (breakthroughs, patterns, lessons)
- Next Actions (specific tasks with locations)

---

### `/context` - Fast Delta Load
**When**: Every subsequent session same day
**Token Cost**: 5-8K total
**Time**: ~5 seconds
**Output**: 400-word actionable briefing

**What it does**:
1. Loads most recent Prime Log from Linear (~3-4K tokens)
2. Calculates delta:
   - Git commits since prime timestamp
   - Uncommitted file changes
   - Linear issue updates (new/updated in-progress issues)
   - Recently modified files
3. Synthesizes actionable briefing:
   - Active work from baseline + delta updates
   - Integration points from baseline
   - Active patterns from baseline
   - Technical commands from baseline
   - Current focus and next steps

**Context Output Structure**:
- Prime Baseline info (timestamp, age)
- Active Work (with NEW/UPDATED badges)
- Delta Since Prime (commits, Linear updates, modified files)
- Integration Points (from baseline)
- Active Patterns (from baseline)
- Technical Baseline (from baseline)
- Ready to Code (current focus with file:line)

---

## Daily Workflow

### Morning (First Session)
```bash
# Run comprehensive prime
/fastprime

# Takes 60-90 seconds
# Creates Prime Log: HEXTRACKRDEV_PRIMELOG_2025-10-11-08-30-00
# Outputs: "✅ Prime baseline created, Prime Log: PRIME-42"
```

### Rest of Day (Subsequent Sessions)
```bash
# Run fast context load
/context

# Takes ~5 seconds
# Outputs: "✅ Session context loaded (3h since prime)"
```

### Next Morning
```bash
# Run fresh prime (24h cycle)
/fastprime

# New baseline with updated architecture, patterns, issues
```

---

## Token Efficiency Comparison

### Old Way (9 sessions per day)
- 9x `/prime` = 9 × 60K = 540K tokens/day

### New Way (1 prime + 8 contexts)
- 1x `/fastprime` = 60K tokens
- 8x `/context` = 8 × 6K = 48K tokens
- **Total**: 108K tokens/day

**Savings**: 432K tokens/day (80% reduction)

---

## When to Re-Prime

Run `/fastprime` again if:
- **Time**: >24 hours since last prime (baseline stale)
- **Architecture**: Major structural changes (new services, routes, patterns)
- **Missing context**: Prime Log not found or unreadable
- **Index stale**: Codebase changes significant enough to invalidate index

Otherwise, always use `/context` for fast session startup.

---

## Command Comparison

| Feature | `/prime` (old) | `/fastprime` (new) | `/context` (new) |
|---------|----------------|-------------------|-----------------|
| **Token Cost** | 40-60K | 40-60K | 5-8K |
| **Execution Time** | 60-90s | 60-90s | ~5s |
| **When to Use** | Every session | Once daily | Every session after prime |
| **Output Location** | Terminal only | Prime Logs team | Terminal |
| **Agents Used** | Sequential | Parallel | None (reads Prime Log) |
| **Memento Archive** | No | Yes | No |
| **Reusable** | No | Yes | Yes |

---

## Prime Log Team in Linear

**Team Name**: "Prime Logs"
**Issue Prefix**: PRIME-XX
**Title Format**: `${PROJECT}${INSTANCE}_PRIMELOG_${YYYY-MM-DD-HH-MM-SS}`
**Labels**: `["prime-log", "${project}"]`

**Examples**:
- `HEXTRACKRDEV_PRIMELOG_2025-10-11-08-30-00` (Dev instance)
- `HEXTRACKRPROD_PRIMELOG_2025-10-11-09-15-00` (Prod instance)
- `STACKTRACKRDEV_PRIMELOG_2025-10-11-10-00-00` (StackTrackr)

**Retention**: Prime Logs accumulate over time, providing historical context.

**Query Pattern**:
```javascript
// Get today's prime logs
mcp__linear-server__list_issues({
  team: "Prime Logs",
  query: "HEXTRACKR",
  createdAt: "-P1D", // Last 24 hours
  orderBy: "createdAt"
})

// Get most recent prime (any day)
mcp__linear-server__list_issues({
  team: "Prime Logs",
  query: "HEXTRACKR",
  limit: 1,
  orderBy: "createdAt"
})
```

---

## Integration with Existing Commands

### Unchanged Commands
- `/load-git` - Still works for quick git context only
- `/save-*` commands - Still save to Memento as before
- `/recall-*` commands - Still query Memento as before
- `/create-report` - Daily intelligence reports (different purpose)

### Deprecated Commands
- `/prime` - Use `/fastprime` instead (same functionality, better naming)
- `/quickstart` - Use `/context` instead (faster, more comprehensive)
- `/start` - Use `/fastprime` or `/context` depending on session timing

### Recommended Workflow
```bash
# Morning startup
/fastprime           # Comprehensive baseline

# Work session 1
# ... code, test, commit ...

# Break, come back
/context             # Fast resume (5s)

# Work session 2
# ... code, test, commit ...

# Lunch, come back
/context             # Fast resume (5s)

# Work session 3
# ... code, test, commit ...

# Next day
/fastprime           # Fresh 24h baseline
```

---

## Troubleshooting

### "No Prime Log found"
```bash
# Solution: Run fastprime to create baseline
/fastprime
```

### "Prime Log is 30 hours old"
```bash
# Solution: Re-prime for fresh baseline
/fastprime
```

### "Prime Log format unrecognized"
```bash
# Solution: Regenerate with latest template
/fastprime
```

### "Code index stale"
```bash
# /context will warn you
# Re-index manually:
mcp__claude-context__index_codebase({
  path: "/Volumes/DATA/GitHub/HexTrackr",
  splitter: "ast",
  force: true
})

# Or just re-prime (includes index refresh):
/fastprime
```

---

## Benefits of Rewind Strategy

1. **Token Efficiency**: 80% reduction in daily token consumption
2. **Time Efficiency**: 5 seconds vs 90 seconds for subsequent sessions
3. **Persistent Context**: Prime Logs in Linear are searchable and historical
4. **Agent Research Archive**: Full agent findings preserved in Memento
5. **Actionable Focus**: Delta highlights what changed since baseline
6. **Flexibility**: Can re-prime anytime baseline is stale

---

## Technical Implementation

### `/fastprime` Key Features
- **Parallel agent execution**: Single message with 3 Task calls
- **Mandatory index refresh**: Always re-indexes before agents run
- **Comprehensive synthesis**: Combines all 3 agent reports
- **Linear persistence**: Saves to Prime Logs team for reuse
- **Memento archival**: Agents save full research (15-20K each)

### `/context` Key Features
- **Prime Log parsing**: Extracts structured sections from Linear issue
- **Delta calculation**: Git + Linear + file changes since prime timestamp
- **Badge system**: NEW/UPDATED tags for changed issues
- **Stale detection**: Warns if prime >24h old
- **Compressed output**: 400 words max, file:line references

---

## Migration Path

1. **Keep existing commands**: `/prime`, `/quickstart` still work
2. **Test new commands**: Try `/fastprime` and `/context` in parallel
3. **Compare results**: Verify context quality matches or exceeds old commands
4. **Adopt gradually**: Use new commands for a week
5. **Deprecate old**: Once confident, switch to new workflow exclusively

**No breaking changes** - old commands remain functional during transition.
