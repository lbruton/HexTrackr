---
description: Comprehensive prime context loading with parallel agent execution (once daily)
allowed-tools: Task, Bash, mcp__linear-server__*, mcp__claude-context__*
---
# FastPrime - Comprehensive Daily Context Load

**Purpose**: Generate comprehensive project baseline once per day using parallel agent execution.

**When to use**: First session of the day, or when baseline context is stale (>24h)

**Strategy**: Launch 3 specialized research agents in PARALLEL → Synthesize → Save to Prime Logs team

**Token Cost**: 40-60K internal (agents) → ~5K compressed output → Saved to Linear for repeated access

---

## Phase 1: Pre-Flight Checks

**1A: Project Detection**
```javascript
const cwd = process.cwd();
const PROJECT_PATH = cwd;
const PROJECT_NAME = cwd.split('/').pop().toUpperCase(); // e.g., "HEXTRACKR"
const PROJECT_INSTANCE = detectInstance(); // DEV, PROD, or empty string

function detectInstance() {
  const host = os.hostname();
  if (host.includes('prod') || host.includes('192.168.1.80')) return 'PROD';
  if (host.includes('dev') || host.includes('127.0.0.1')) return 'DEV';
  return '';
}
```

**1B: Timestamps**
```bash
date "+%Y-%m-%d %H:%M:%S %Z"
# Extract: TODAY = "2025-10-11", TIME = "14:30:00", WEEK = "week-41-2025"
```

**1C: Git Baseline**
```bash
git log --oneline -5       # Last 5 commits
git status --short         # Uncommitted changes
git branch --show-current  # Current branch
```

**1D: Index Refresh (MANDATORY)**
```javascript
// ALWAYS re-index at prime start
mcp__claude-context__index_codebase({
  path: PROJECT_PATH,
  splitter: "ast",
  force: false
})

// Wait for completion before launching agents
// Verify: mcp__claude-context__get_indexing_status
```

---

## Phase 2: Parallel Agent Launch (CRITICAL)

**MUST execute all 3 agents in SINGLE message for parallel execution**

### Agent 1: linear-librarian
**Prompt**:
```
Provide comprehensive Linear intelligence for ${PROJECT_NAME}:

1. **Active Work** (In Progress issues):
   - Full details with file:line references from descriptions
   - Current status and next actions
   - Blockers and dependencies

2. **Todo Issues**:
   - Top 5 priority items with estimates
   - Requirements and acceptance criteria

3. **Recent Completions** (last 7 days):
   - What shipped with impact summary
   - Lessons learned from implementations

4. **Backlog** (top 10):
   - Future work pipeline
   - Priority and complexity estimates

Return compressed tables with issue IDs, titles, and actionable context.
Use team: "${PROJECT_NAME}-Dev" for queries.
```

**Expected**: 15-20K tokens internal → 1.5-2K compressed return

---

### Agent 2: memento-oracle
**Prompt**:
```
Extract intelligence from Memento knowledge graph for ${PROJECT_NAME}:

**Time Window**: Last 30 days (focus on ${WEEK})

1. **Recent Breakthroughs** (last 30 days):
   - Key insights and wins with entity IDs
   - Decision rationale and outcomes

2. **Active Patterns**:
   - Development patterns currently in use
   - Code examples and integration points

3. **Lessons Learned**:
   - Anti-patterns discovered and avoided
   - Best practices established

4. **Technical Baselines**:
   - Performance metrics and standards
   - Quality benchmarks

Search strategy:
- Semantic: "${PROJECT_NAME} breakthrough pattern lesson week-41-2025"
- Entity search: Sessions and Insights from last 30 days
- Cross-project: Reusable patterns tagged "reusable"

Return compressed bullets with entity IDs and timestamps.
```

**Expected**: 10-15K tokens internal → 1-1.5K compressed return

---

### Agent 3: codebase-navigator
**Prompt**:
```
Provide comprehensive codebase intelligence for ${PROJECT_NAME} at ${PROJECT_PATH}:

**Index Status**: Freshly indexed (verified in Phase 1D)

1. **Architecture Overview**:
   - Core design patterns (MVC, service layer, etc.)
   - Entry points and initialization flow
   - Module organization and responsibilities

2. **Core Services**:
   - List all services with file:line references
   - Service responsibilities and dependencies
   - Integration patterns

3. **Database Schema**:
   - Database type and location
   - Core tables with purposes
   - Key relationships and constraints

4. **Integration Points** (where to add new features):
   - Route registration points
   - Middleware chain locations
   - Service instantiation patterns
   - Frontend-backend communication points

5. **Recent Changes** (last 7 days from git):
   - Modified files with change summaries
   - Active development areas
   - Refactoring patterns

6. **Development Environment**:
   - Runtime requirements
   - Docker configuration
   - Environment variables
   - Key npm commands

Return structured sections with file:line references for ALL code locations.
Use claude-context semantic search extensively.
```

**Expected**: 15-25K tokens internal → 2-3K compressed return

---

**Parallel Execution Pattern**:
```javascript
// Single message with 3 Task tool calls:
Task({
  subagent_type: "linear-librarian",
  description: "Linear intelligence gathering",
  prompt: [Agent 1 prompt above]
})

Task({
  subagent_type: "memento-oracle",
  description: "Memento pattern extraction",
  prompt: [Agent 2 prompt above]
})

Task({
  subagent_type: "codebase-navigator",
  description: "Codebase architecture analysis",
  prompt: [Agent 3 prompt above]
})

// All 3 execute concurrently, return in 20-30 seconds
```

---

## Phase 3: Synthesize Prime Report

**Combine agent outputs into structured report**:

```markdown
## 📋 ${PROJECT_NAME}${PROJECT_INSTANCE} Prime Context

**Generated**: ${TIMESTAMP}
**Week**: ${WEEK}
**Branch**: ${currentBranch}
**Index**: ✅ ${files} files, ${chunks} chunks (re-indexed at session start)
**Uncommitted**: ${uncommittedCount} files

---

## 🎯 Active Work (file:line references)

### In Progress (${inProgressCount} issues)

| Issue | Title | Location | Next Action |
|-------|-------|----------|-------------|
| [${issue1.id}] | ${issue1.title} | \`${issue1.location}\` | ${issue1.nextAction} |
| [${issue2.id}] | ${issue2.title} | \`${issue2.location}\` | ${issue2.nextAction} |

**Blockers**: ${blockers || "None"}

### Todo (${todoCount} issues)

| Issue | Title | Estimate | Priority |
|-------|-------|----------|----------|
| [${todo1.id}] | ${todo1.title} | ${todo1.estimate} | ${todo1.priority} |

### Recent Wins (Last 7 Days)

- [${win1.id}]: ${win1.title} → ${win1.impact}
- [${win2.id}]: ${win2.title} → ${win2.impact}

---

## 🔧 Code-Ready Integration Points

**Where to add new features**:
- **Routes**: Register at \`server.js:157\` (after middleware chain)
- **Services**: Create \`services/newService.js\` (use DatabaseService pattern from \`services/databaseService.js:23\`)
- **Controllers**: Initialize at \`server.js:89\` (singleton pattern with \`initialize(db, progressTracker)\`)
- **Frontend**: Add pages at \`public/*.html\`, scripts at \`public/scripts/pages/\`

**Active Patterns**:
- **Service Layer**: \`services/vulnerabilityService.js:45-67\` returns \`{success, data, error}\`
- **Transaction Management**: \`services/databaseService.js:123\` uses \`runInTransaction()\`
- **Error Handling**: \`middleware/errorHandler.js:15\` centralizes error responses
- **WebSocket Updates**: \`server.js:234\` broadcasts progress to connected clients

**Critical TODOs** (from active issues):
- \`${todo1.location}\`: ${todo1.description} (priority: ${todo1.priority})

---

## 📊 Technical Baseline

**Architecture**: Modular MVC (controllers → services → database)
**Runtime**: ${runtime} | **Docker**: ${dockerStatus} on port ${port}
**Database**: ${dbType} at \`${dbLocation}\` | **Tables**: ${tableCount}
**Services**: ${serviceCount} services | **Routes**: ${routeCount} route files

**Core Services**:
${services.map(s => `- **${s.name}**: \`${s.location}\` (${s.purpose})`).join('\n')}

**Database Tables**:
${tables.map(t => `- **${t.name}**: ${t.purpose} (${t.columns} columns)`).join('\n')}

**Quality**: ESLint ${eslintStatus} | Codacy ${codacyIssues} issues

**Key Commands**:
- Dev: \`${commands.dev}\`
- Prod: \`${commands.prod}\`
- Test: \`${commands.test}\`
- Lint: \`${commands.lint}\`

---

## 🧠 Memento Intelligence

**Breakthroughs** (last 30 days):
${breakthroughs.map(b => `- **${b.title}**: ${b.summary} ([${b.entityId}] at ${b.timestamp})`).join('\n')}

**Active Patterns**:
${patterns.map(p => `- **${p.name}**: Implemented in \`${p.example}\` (use for: ${p.useCase})`).join('\n')}

**Lessons Learned**:
${lessons.map(l => `- **${l.title}**: ${l.lesson} (avoid: ${l.antiPattern})`).join('\n')}

**Technical Baselines**:
${baselines.map(b => `- **${b.metric}**: ${b.value} ${b.unit}`).join('\n')}

**Query for full context**: \`mcp__memento__search_nodes({ query: "TAG: session:prime-${TODAY}" })\`

**Saved Entities** (agent research archived):
- Prime-Linear-${PROJECT_NAME}-${TIMESTAMP}
- Prime-Memento-${PROJECT_NAME}-${TIMESTAMP}
- Prime-Codebase-${PROJECT_NAME}-${TIMESTAMP}

---

## 📝 Next Actions

1. **[${action1.issue}]**: ${action1.action} at \`${action1.location}\` (pattern: ${action1.pattern})
2. **[${action2.issue}]**: ${action2.action} at \`${action2.location}\` (depends: ${action2.dependency})
3. **Other**: ${action3.description}

---

## 📖 Development Context

${synthesis1}

${synthesis2}

${synthesis3}

---

**Prime Log ID**: ${PRIME_LOG_ID}
**Refresh**: Run \`/context\` in subsequent sessions (5-8K tokens vs 40-60K for re-prime)
**Re-Prime**: Run \`/fastprime\` again when baseline is stale (>24h) or major architecture changes occur
```

---

## Phase 4: Save to Prime Logs Team

```javascript
mcp__linear-server__create_issue({
  team: "Prime Logs",
  title: `${PROJECT_NAME}${PROJECT_INSTANCE}_PRIMELOG_${YYYY-MM-DD-HH-MM-SS}`,
  description: [synthesized_report_above],
  labels: ["prime-log", PROJECT_NAME.toLowerCase()],
  priority: 0
})
```

**Terminal Output**:
```
✅ Prime baseline created
📊 Prime Log: ${PRIME_LOG_ID}
🔗 URL: ${primeIssue.url}
⏱️  Time: ${executionTime} seconds
💾 Agents consumed: ~${agentTokens}K tokens
📦 Compressed to: ~${reportSize}K tokens in Linear
⏭️  Next session: Run /context (5-8K tokens, ~5 seconds)
```

---

## Phase 5: Save Agent Research to Memento

**CRITICAL**: Agents already saved their full research to Memento during execution.

Verify entities were created:
```javascript
mcp__memento__search_nodes({
  query: `TAG: session:prime-${TODAY} ${PROJECT_NAME.toLowerCase()}`
})

// Should find 3 entities:
// - Prime-Linear-${PROJECT_NAME}-${TIMESTAMP} (Agent 1 research)
// - Prime-Memento-${PROJECT_NAME}-${TIMESTAMP} (Agent 2 research)
// - Prime-Codebase-${PROJECT_NAME}-${TIMESTAMP} (Agent 3 research)
```

If missing, agents failed to save. Log warning but don't block prime completion.


