---
description: Fast session startup using rewind strategy (Prime Log + Delta)
allowed-tools: Read, Bash, mcp__linear-server__*, mcp__claude-context__*
---
# Context - Lean Session Startup

**Purpose**: Provide instant, actionable context by loading most recent Prime Log and calculating delta (git changes, Linear updates).

**Strategy**: Prime Log = baseline (generated once daily via `/fastprime`), this command calculates changes since then.

**Token Budget**: 5-8K total (vs 40-60K for full prime)

---

## Phase 1: Project Detection & Timestamps

```javascript
// Auto-detect project
const cwd = process.cwd();
const PROJECT_PATH = cwd;
const PROJECT_NAME = cwd.split('/').pop().toUpperCase(); // e.g., "HEXTRACKR"

// Get current time
const NOW = new Date();
const TODAY = NOW.toISOString().split('T')[0]; // "2025-10-11"
const TIMESTAMP = NOW.toISOString(); // Full timestamp
```

---

## Phase 2: Load Most Recent Prime Log

**2A: Query Prime Logs team for today's or most recent prime**

```javascript
mcp__linear-server__list_issues({
  team: "Prime Logs",
  query: `${PROJECT_NAME}`,
  limit: 5,
  orderBy: "createdAt"
})

// Filter for this project (could be Dev, Prod, or base)
const primeIssues = issues.filter(i =>
  i.title.startsWith(PROJECT_NAME) &&
  i.title.includes('PRIMELOG')
);

// Get most recent
const PRIME_LOG = primeIssues[0];
const PRIME_TIMESTAMP = new Date(PRIME_LOG.createdAt);
const HOURS_SINCE_PRIME = (NOW - PRIME_TIMESTAMP) / (1000 * 60 * 60);
```

**2B: Extract key context from Prime Log description**

Parse sections from `PRIME_LOG.description`:
- **Active Work** (file:line references) → Store as `BASELINE_WORK`
- **Integration Points** → Store as `BASELINE_INTEGRATIONS`
- **Active Patterns** → Store as `BASELINE_PATTERNS`
- **Technical Baseline** (services, database, commands) → Store as `TECH_BASELINE`

**2C: Alert if Prime Log is stale**

```javascript
if (HOURS_SINCE_PRIME > 24) {
  console.warn(`⚠️  Prime Log is ${Math.round(HOURS_SINCE_PRIME)} hours old`);
  console.log(`Consider running /fastprime to refresh baseline context`);
}
```

---

## Phase 3: Calculate Delta (Changes Since Prime)

**3A: Git Delta**

```bash
# Get commits since prime timestamp
git log --oneline --since="${PRIME_TIMESTAMP.toISOString()}"

# Current status
git status --short

# Current branch
git branch --show-current
```

Store summary:
```javascript
const GIT_DELTA = {
  branch: currentBranch,
  commitsSince: commits.length,
  uncommitted: uncommittedFiles.length,
  recentCommits: commits.slice(0, 3) // Just last 3
};
```

**3B: Linear Delta (Active Issues Only)**

```javascript
// Get currently in-progress issues
mcp__linear-server__list_issues({
  team: `${PROJECT_NAME}-Dev`,
  state: "In Progress",
  limit: 5
})

// Compare to BASELINE_WORK from Prime Log
const NEW_ISSUES = issues.filter(i => !BASELINE_WORK.includes(i.identifier));
const UPDATED_ISSUES = issues.filter(i =>
  BASELINE_WORK.includes(i.identifier) &&
  new Date(i.updatedAt) > PRIME_TIMESTAMP
);
```

**3C: Recently Modified Files (since Prime)**

```bash
# Files modified since prime timestamp
git diff --name-only $(git rev-list -1 --before="${PRIME_TIMESTAMP.toISOString()}" HEAD)..HEAD
```

**3D: Index Status Check**

```javascript
mcp__claude-context__get_indexing_status({
  path: PROJECT_PATH
})

// If index is stale or missing, prompt to re-index
if (!status.indexed || status.age > 3600000) {
  console.warn("⚠️  Code index is stale - recommend re-indexing before searching");
}
```

---

## Phase 4: Synthesize Actionable Briefing

**Compressed Output Template** (400 words max):

```markdown
# ${PROJECT_NAME} Session Context

**Prime Baseline**: ${PRIME_LOG.title} (${HOURS_SINCE_PRIME}h ago)
**Current Time**: ${TIMESTAMP}
**Branch**: ${GIT_DELTA.branch}
**Index Status**: ${index.status} (${index.age}h old)

---

## 🎯 Active Work (From Prime + Delta)

**In Progress** (${issues.length} issues):
${issues.map(i => {
  const isNew = NEW_ISSUES.includes(i);
  const isUpdated = UPDATED_ISSUES.includes(i);
  const badge = isNew ? "🆕" : isUpdated ? "📝" : "";
  return `- ${badge} [${i.identifier}]: ${i.title}`;
}).join('\n')}

**Next Actions** (from Prime Log):
${BASELINE_WORK.map(work => `- ${work.issue}: ${work.nextAction} at \`${work.location}\``).join('\n')}

---

## 📊 Delta Since Prime (${HOURS_SINCE_PRIME}h ago)

**Git Activity**:
- Commits: ${GIT_DELTA.commitsSince}
- Uncommitted: ${GIT_DELTA.uncommitted} files
- Recent:
${GIT_DELTA.recentCommits.map(c => `  - ${c.hash}: ${c.message}`).join('\n')}

**Linear Updates**:
- New issues: ${NEW_ISSUES.length}
- Updated issues: ${UPDATED_ISSUES.length}

**Modified Files** (top 5):
${modifiedFiles.slice(0, 5).map(f => `- ${f}`).join('\n')}

---

## 🔧 Integration Points (From Prime)

${BASELINE_INTEGRATIONS.map(point => `- **${point.type}**: \`${point.location}\` (pattern: ${point.pattern})`).join('\n')}

---

## 🧠 Active Patterns (From Prime)

${BASELINE_PATTERNS.map(pattern => `- **${pattern.name}**: See \`${pattern.example}\` (use for: ${pattern.useCase})`).join('\n')}

---

## 📋 Technical Baseline (From Prime)

**Services**: ${TECH_BASELINE.services.count} | **Database**: ${TECH_BASELINE.database.type}
**Runtime**: ${TECH_BASELINE.runtime} | **Docker**: ${TECH_BASELINE.docker ? 'Yes' : 'No'}

**Key Commands**:
- Dev: \`${TECH_BASELINE.commands.dev}\`
- Test: \`${TECH_BASELINE.commands.test}\`
- Lint: \`${TECH_BASELINE.commands.lint}\`

---

## ⚡ Ready to Code

**Current Focus**: ${BASELINE_WORK[0]?.issue || "No active work"}
**Next Step**: ${BASELINE_WORK[0]?.nextAction || "Check Linear for tasks"}
**Code Location**: \`${BASELINE_WORK[0]?.location || "TBD"}\`

**Prime Log**: ${PRIME_LOG.url} (full context)
**Refresh Context**: Run \`/fastprime\` if working on new features or baseline is stale
```

---

## Phase 5: Provide Actionable Guidance

**Terminal Output**:
```
✅ Session context loaded (${HOURS_SINCE_PRIME}h since prime)
📊 Baseline: ${PRIME_LOG.identifier}
🔄 Delta: ${GIT_DELTA.commitsSince} commits, ${UPDATED_ISSUES.length} Linear updates
🎯 Focus: ${BASELINE_WORK[0]?.issue}
📍 Location: ${BASELINE_WORK[0]?.location}

${HOURS_SINCE_PRIME > 24 ? '⚠️  Prime baseline >24h old - consider /fastprime' : '✓ Baseline fresh'}
${index.stale ? '⚠️  Code index stale - recommend re-indexing' : '✓ Code index current'}
```

---

## Error Handling

**If No Prime Log Found**:
```
❌ No Prime Log found for ${PROJECT_NAME}
📝 Run /fastprime to create baseline context (one-time 60K token investment)
```

**If Prime Log Parse Fails**:
```
⚠️  Prime Log found but format unrecognized
📝 Run /fastprime to regenerate with latest template
```

**If Git/Linear Queries Fail**:
```
⚠️  Delta calculation incomplete
✓ Loaded Prime Log baseline successfully
⚠️  Run individual queries manually if needed
```

---

## Success Metrics

You have instant context when:
- Active issues with file:line references are clear
- Git delta shows what changed since prime
- Linear updates highlight new/changed work
- Integration points are ready for immediate coding
- No need to re-prime unless baseline is stale (>24h)

**Token Efficiency**:
- Prime Log load: ~3-4K tokens (one Linear issue with comprehensive description)
- Git delta: ~500 tokens (git commands + parsing)
- Linear delta: ~1-2K tokens (in-progress issues only)
- Synthesis: ~1-2K tokens (compressed output)
- **Total**: 5-8K tokens (vs 40-60K for full prime)

**Time Efficiency**:
- Prime Log query: ~2 seconds
- Git delta: ~1 second
- Linear delta: ~2 seconds
- **Total**: ~5 seconds (vs 60-90 seconds for full prime)
