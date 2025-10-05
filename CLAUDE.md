# CLAUDE.md

## HexTrackr Overview

HexTrackr is a vulnerability management system for tracking security vulnerabilities, tickets, and Known Exploited Vulnerabilities (KEV). The system uses a modular Node.js/Express backend with SQLite database and vanilla JavaScript frontend.

## Documentation Hierarchy

This project uses a multi-layered documentation system with clear precedence:

**CONSTITUTION.md**: Authoritative requirements and mandates (MUST follow - constitutional law)

**Linear DOCS-**: Shared knowledge accessible across all Claude instances

**Memento MCP**: Shared knowledge accessible across all Claude instances (Refer to /TAXONOMY.md)

---

# Section 1: Core Identity & Multi-Claude Architecture

## Claude Instance Roles

HexTrackr development uses three distinct Claude instances with specific responsibilities:

### 1. Claude Desktop (Project Management & Planning)
- **Location**: Claude.ai web interface
- **Responsibilities**:
  - High-level planning and architecture decisions
  - Linear issue creation and task delegation
  - Coordination between Claude-Dev and Claude-Prod
  - Strategic workflow design
- **Tools**: Linear MCP, Memento, Web Search

### 2. Claude-Dev (Primary Development) ← YOU ARE HERE
- **Location**: Mac M4 Mini development machine
- **Responsibilities**:
  - Active feature development and coding
  - Managing private GitHub repository
  - Docker development environment (nginx reverse proxy on localhost:80/443)
  - Testing and quality assurance
- **Works With**: Claude Desktop for task assignments

### 3. Claude-Prod (Production Management & Clean Releases)
- **Location**: Ubuntu 24.04 LTS server (192.168.1.80)
- **Responsibilities**:
  - Security fixes and hardening
  - Linux-specific implementation and porting from Mac
  - Production environment testing
  - Docker management and deployment optimization
  - Neo4j database administration (Memento backend)
  - Clean public GitHub releases
- **Works With**: Claude Desktop for coordination

## Linear Teams Structure

- **HexTrackr-Dev** (HEX-XX): General development issues (Claude-Dev primary focus) (This Session)
- **HexTrackr-Prod Team** (HEXP-XX): Production-specific tasks (Claude-Prod primary focus)
- **HexTrackr-Docs Team** (DOCS-XX): Shared project documentation accessible by all instances
- **Prime Logs** (PRIME-XX): Session intelligence snapshots from /prime-test runs
- **Reports** (REP-XX): Shared project daily, weekly, and combined reports
- **StackTrackr** (STACK-XX): Sister Project, pet project of the developer (Lonnie Bruton), unrelated to hextrackr
- **Lonnie Bruton** (LDB-XX): Personal Notes for the Developer, unrelated to hextrackr

## Workflow Integration

- **Shared Resources**:
  - Linear teams (HexTrackr-Dev, HexTrackr-Prod, HexTrackr-Docs, Prime Logs)
  - Memento knowledge graph with semantic search capabilities
  - Claude-Context codebase indexing (shared across all instances)
  - Linear MCP with organized teams for project management and as shared knowledge repository

- **Communication**: All inter-instance communication flows through Linear issues and comments and memento memory insights

---

# Section 2: User Tools (Slash Commands)

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
```
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

---

# Section 3: MCP Tools

## Core MCP Servers

### memento (Knowledge Graph)
**Purpose**: Persistent project memory, cross-instance knowledge sharing
**Backend**: Neo4j Enterprise 5.13 at 192.168.1.80
**Taxonomy**: Linear DOCS-14 or `/TAXONOMY.md`
**Shared**: All Claude instances use same graph

**Key Tools**:
- `create_entities` - Create knowledge nodes
- `create_relations` - Link entities with relationships
- `add_observations` - Add facts to entities
- `search_nodes` - Keyword search
- `semantic_search` - Natural language search (preferred)
- `open_nodes` - Retrieve specific entities by name
- `read_graph` - Get entire graph structure

**Common Patterns**:
```javascript
// Find authentication patterns
mcp__memento__semantic_search({
  query: "authentication session middleware Argon2id",
  entity_types: ["HEXTRACKR:INTELLIGENCE:PRIME-CODEBASE"],
  min_similarity: 0.6
})

// Open specific prime intelligence
mcp__memento__open_nodes({
  names: ["Prime-Codebase-HEXTRACKR-2025-10-04-12-42-00"]
})
```

---

### claude-context (Codebase Search)
**Purpose**: Semantic code search across indexed files
**Index**: Re-indexes at session start if >1 hour old

**Key Tools**:
- `index_codebase` - Create/update semantic index
- `search_code` - Natural language code search
- `get_indexing_status` - Check index status
- `clear_index` - Remove index

**Usage**:
```javascript
// Find Express middleware patterns
mcp__claude-context__search_code({
  path: "/Volumes/DATA/GitHub/HexTrackr",
  query: "express session middleware configuration",
  limit: 10
})
```

**Note**: Get current project info (file counts, architecture) via `/prime-test` or `/quickprime-test`, not from static documentation.

---

### linear-server (Issue Tracking)
**Purpose**: Task tracking, planning, progress updates, shared documentation
**Teams**: HexTrackr-Dev (HEX-XX), HexTrackr-Prod (HEXP-XX), HexTrackr-Docs (DOCS-XX), Prime Logs (PRIME-XX)

**Key Tools**:
- `list_issues` - Query issues with filters
- `get_issue` - Retrieve issue details
- `create_issue` - Create new issue
- `update_issue` - Modify existing issue
- `create_comment` - Add comment to issue
- `list_comments` - Get issue comments
- `list_teams` - Get all teams
- `get_team` - Team details

**Pattern**: Issues are source of truth, not markdown files

---

### context7 (Library Documentation)
**Purpose**: Up-to-date framework and library documentation
**Mandatory**: CONSTITUTION.md Article II Section II requires Context7 verification for all framework code

**Two-Step Process**:
```javascript
// Step 1: Resolve library ID
mcp__context7__resolve-library-id({ libraryName: "express" })
→ Returns: /expressjs/express

// Step 2: Get documentation
mcp__context7__get-library-docs({
  context7CompatibleLibraryID: "/expressjs/express",
  topic: "middleware",
  tokens: 5000
})
```

**When to Use**:
- Before implementing features with Express, AG-Grid, ApexCharts, Socket.io
- Verifying API patterns and best practices
- Debugging framework-specific issues
- Before upgrading dependencies

**Trust Scores**: Prioritize libraries with scores 7-10 for production use

---

### chrome-devtools (Browser Testing)
**Purpose**: Browser automation, UI testing, performance profiling
**Mandatory**: CONSTITUTION.md Article II Section V requires testing before and after UI changes

**Testing Environment**:
- ✅ **ALWAYS use HTTPS**: `https://localhost` (nginx reverse proxy on port 443)
- ❌ **NEVER use HTTP**: `http://localhost` returns empty API responses
- 🔒 **SSL Bypass**: Type `thisisunsafe` on certificate warning page

**Key Tool Categories**:
- **Page Management**: `list_pages`, `new_page`, `navigate_page`, `select_page`
- **Interaction**: `click`, `fill`, `hover`, `drag`, `upload_file`
- **Inspection**: `take_snapshot`, `take_screenshot`, `list_console_messages`
- **Network**: `list_network_requests`, `get_network_request`
- **Performance**: `performance_start_trace`, `performance_stop_trace`

**Common Pattern**:
```javascript
// Navigate and capture screenshot
navigate_page("https://localhost/vulnerabilities.html")
Bash: sleep 3  // Wait for data load
take_screenshot({
  fullPage: true,
  filePath: "/path/to/screenshot.png"
})
```

---

### brave-search (Web Research)
**Purpose**: Web, news, video, image, local search + AI summarization

**Key Tools**:
- `brave_web_search` - General web search
- `brave_news_search` - Recent news articles
- `brave_video_search` - Video content
- `brave_image_search` - Image search
- `brave_local_search` - Location-based businesses/places
- `brave_summarizer` - AI-generated summaries

**Usage**: Primarily accessed through `the-brain` agent for integrated research

---

### sequential-thinking
**Purpose**: Multi-step problem analysis with structured reasoning

**Tool**: `sequentialthinking` - Break down complex problems into thought steps

**Usage**: Accessed via `/think` command or `the-brain` agent

---

# Section 4: Specialized Agents

## When to Use Agents vs Direct Tools

**Key Principle**: Agents burn 10-50k tokens internally, return 800-1.5k compressed. Use them for research, not simple lookups.

**Decision Tree**:
```
Need expert research combining web + codebase? → the-brain
Need architecture understanding? → codebase-navigator
Need historical context? → memento-oracle
Need Linear deep dive? → linear-librarian
Need config file changes? → config-guardian
Need documentation audit? → docs-guardian
Need complex feature implementation? → hextrackr-fullstack-dev
Need Docker container restart? → docker-restart
Need UI testing/screenshots? → chrome-devtools MCP tools (direct)
Know exact file to read? → Read tool (direct)
Know exact search term? → Grep tool (direct)
Need quick Linear lookup? → mcp__linear-server__get_issue (direct)
```

---

## Agent Catalog

### the-brain
**Model**: Opus (maximum intelligence)
**Purpose**: Expert web research + codebase analysis + framework documentation verification
**Token Cost**: 30-50k internal → 1-2k compressed output

**4-Phase Research Methodology**:
1. **Context** - Sequential thinking to structure research plan
2. **Internal** - Claude-Context to analyze current codebase
3. **External** - Brave Search + Context7 for best practices and docs
4. **Synthesis** - Combine findings with Memento persistence

**When to Use**:
- Research implementation patterns or best practices
- Encountering errors requiring external solution research
- Verify framework/library compatibility
- Performance optimization research
- Security vulnerability analysis

**Returns**:
- Comprehensive intelligence report with executive summary
- Project-aware recommendations specific to architecture
- Integration strategies considering existing patterns
- Source citations (Brave Search, Context7, Claude-Context)
- Confidence levels
- Permanent research archive saved to Memento

---

### codebase-navigator
**Purpose**: Architecture analysis and code discovery
**Token Cost**: 10-20k internal → 800-1.2k compressed output

**When to Use**:
- Before refactoring (map dependencies)
- Before database migrations (find schema references)
- Architecture analysis (understand module structure)
- Integration planning (find connection points)
- File discovery (locate implementations)

**Returns**:
- File:line references for navigation
- Integration points (middleware, routes, services)
- Recent git changes with context
- Architecture overview with actual code structure

---

### memento-oracle
**Purpose**: Historical context and pattern discovery from knowledge graph
**Token Cost**: 10-15k internal → 800-1k compressed output

**When to Use**:
- Before architecture decisions (what have we learned?)
- Debugging recurring issues (has this happened before?)
- Pattern discovery (how did we solve similar problems?)
- Cross-instance coordination (what did Claude-Prod discover?)
- Performance optimization (what patterns worked?)

**Returns**:
- Past breakthroughs with entity IDs
- Anti-patterns and lessons learned
- Historical decisions with Linear references
- Cross-instance handoff context

---

### linear-librarian
**Purpose**: Deep Linear issue research and cross-team coordination
**Token Cost**: 15-20k internal → 1-1.5k compressed output

**When to Use**:
- Complex issue relationships (dependencies, blockers)
- Cross-team coordination (Dev/Prod handoffs)
- Planning context (what's in pipeline?)
- Sprint/cycle analysis (current workload)
- Issue history (complete context with comments)

**Returns**:
- Compressed activity summaries
- Issue details with all comments
- Cross-team dependencies
- Current cycle/sprint status
- Blocker analysis

---

### config-guardian
**Purpose**: Configuration file management with Linear tracking
**Token Cost**: 8-12k internal → 800-1k compressed output

**When to Use**:
- Before modifying linting/quality config files
- Adding new linting rules or configs
- Debugging "why is this warning appearing?"
- Project setup or config consolidation
- Monthly config drift audits
- Discovering config files without Linear docs

**Returns**:
- Linear DOCS-XX issue tracking for each config
- Timestamped comments documenting changes
- Configuration audit reports with drift detection
- Proper documentation preventing future confusion

---

### docs-guardian
**Purpose**: Documentation accuracy auditing
**Token Cost**: 10-15k internal → 1-1.5k compressed output

**When to Use**:
- After significant feature additions or refactoring
- Periodically (weekly/monthly) to detect drift
- Before major releases (ensure docs current)
- When users report documentation inconsistencies
- Identify missing documentation for new features
- Find orphaned documentation for deprecated features

**Returns**:
- Documentation accuracy audit report
- Linear DOCS issues for discrepancies
- Missing documentation identified
- Orphaned documentation flagged
- Prioritized recommendations for updates

---

### hextrackr-fullstack-dev
**Purpose**: Complex feature implementation across all layers
**Token Cost**: 20-40k internal → 1-2k compressed output

**When to Use**:
- Implementing complex features requiring deep architecture understanding
- Refactoring code across multiple files/layers
- Building new UI components with AG-Grid or Apex Charts
- Creating new API endpoints with service layer integration
- Transitioning from planning to implementation
- Long-form coding tasks requiring 30+ minutes

**Returns**:
- Complete feature implementation (routes, services, frontend)
- Code following HexTrackr patterns and conventions
- Proper error handling and validation
- JSDoc documentation for all functions
- Testing recommendations

---

### docker-restart
**Model**: Haiku (lightweight, cost-efficient)
**Purpose**: Docker container restart management
**Token Cost**: 2-5k internal → 300-500 compressed output

**When to Use**:
- After modifying JavaScript files requiring server restart
- After updating environment variables in `.env`
- After installing new npm dependencies
- After configuration changes requiring restart
- When development container becomes unresponsive

**Proactive Usage**: Invoke automatically after:
- Server-side JavaScript modifications
- Environment variable changes
- Dependency installations (npm install)
- Configuration file updates requiring restart

**Returns**:
- Container stop/restart confirmation
- Health check verification (nginx accessible)
- Startup log analysis for errors
- Ready-to-test confirmation

---

## Prime Intelligence Entities

When `/prime` runs, 4 specialized agents save FULL research to Memento:

**Entity Types Created**:
- `Prime-Linear-[PROJECT]-[Timestamp]` → Linear activity intelligence
- `Prime-Memento-[PROJECT]-[Timestamp]` → Historical patterns & breakthroughs
- `Prime-Codebase-[PROJECT]-[Timestamp]` → Architecture & integration points
- `Prime-Technical-[PROJECT]-[Timestamp]` → Technical baseline & environment

**Classification**: `PROJECT:INTELLIGENCE:PRIME-[TYPE]`

**Tags**: `project:[name]`, `prime-intelligence`, `agent:[type]`, `week-[num]-[year]`, `session:prime-[date]`

**Access**:
```javascript
// Query today's prime session
mcp__memento__search_nodes({ query: "TAG: session:prime-2025-10-04" })

// Semantic search
mcp__memento__semantic_search({
  query: "authentication implementation patterns",
  entity_types: ["HEXTRACKR:INTELLIGENCE:PRIME-CODEBASE"]
})
```

---

# Section 5: Development Workflow

## 🎯 MANDATED WORKFLOW PATTERN

**This workflow is REQUIRED for all development work. Follow it systematically to ensure quality, traceability, and knowledge capture.**

### High-Level Pattern: Research → PRD → Sprint → Task → Pause

```
┌─────────────────────────────────────────────────────────────┐
│  PHASE 1: INITIAL PLANNING ISSUE                            │
│  - Create Linear issue outlining:                           │
│    • The task/change needed                                 │
│    • Proposed fix/implementation                            │
│    • Alternatives considered                                │
│  - For minor tasks: This is sufficient                      │
│  - For major tasks: Continue to Phase 2                     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  PHASE 2: RESEARCH PHASE LINEAR ISSUES (Major Tasks Only)   │
│  - Create separate Linear issues for research               │
│  - Launch research agents:                                  │
│    • the-brain (web research + codebase analysis)           │
│    • codebase-navigator (architecture understanding)        │
│    • memento-oracle (historical patterns)                   │
│    • linear-librarian (related issues/context)              │
│  - ALWAYS verify framework patterns with Context7           │
│  - ALWAYS use Claude-Context (NOT grep) for codebase search │
│  - Review UI implications thoroughly                        │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  PHASE 3: SPRINT PLANNING LINEAR ISSUE (Major Tasks Only)   │
│  - Create NEW Linear issue with:                            │
│    • Detailed task list (Task 1.1, 1.2, etc.)              │
│    • Acceptance criteria per task                           │
│    • Dependencies and integration points                    │
│  - Create MASTER CHECKLIST issue that:                      │
│    • References all sprint issues                           │
│    • Tracks overall progress                                │
│    • Shows dependencies between sprints                     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  PHASE 4: TASK-BY-TASK IMPLEMENTATION                       │
│  ⚠️ ONE TASK AT A TIME - DO NOT BATCH TASKS ⚠️              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 THE CORE TASK LOOP (Execute for EVERY Task)

**This is the heart of the workflow. Execute this loop for every single task, whether it's Task 2.1 or Task 2.6:**

```
         ┌───────────────┐
         │  SINGLE TASK  │
         └───────┬───────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. GIT CHECKPOINT ✅ MANDATORY                               │
│    git commit -m "checkpoint: Before Task X.Y"              │
│    (Create safety point before starting work)               │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. IMPLEMENT USING APPROPRIATE SUBAGENT OR DIRECT TOOLS     │
│    Subagents for complex work:                              │
│    • hextrackr-fullstack-dev (feature implementation)       │
│    • the-brain (if research needed)                         │
│    • config-guardian (config changes)                       │
│    • docs-guardian (documentation updates)                  │
│    • docker-restart (container restarts)                    │
│    Direct tools for simple changes:                         │
│    • Read, Edit, Write (file operations)                    │
│    • Bash (git, npm commands)                               │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. REVIEW WORK FOR ACCURACY                                 │
│    • Verify code meets acceptance criteria                  │
│    • Check for edge cases (Five Whys methodology)           │
│    • Validate integration points                            │
│    • Fix any issues discovered                              │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. SMOKE TEST ✅ MANDATORY                                   │
│    • ALWAYS test via Docker nginx reverse proxy (HTTPS)     │
│    • Use Chrome DevTools for UI changes (before/after)      │
│    • Fix any bugs or issues encountered                     │
│    • Re-test until working correctly                        │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. UPDATE LINEAR ISSUE ✅ MANDATORY                          │
│    • Add comment with progress/results                      │
│    • Check off task in sprint issue                         │
│    • Update master checklist if exists                      │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. UPDATE CHANGELOG ✅ MANDATORY                             │
│    • /app/public/docs-source/CHANGELOG.md                   │
│    • Add detailed entry with what/why/how                   │
│    • Include file:line references                           │
│    • Document testing results                               │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. CREATE MEMENTO MEMORY ✅ MANDATORY (if applicable)        │
│    • Save breakthrough patterns                             │
│    • Document reusable solutions                            │
│    • Tag according to /TAXONOMY.md                          │
│    • Link to Linear issue                                   │
│    • Skip only for trivial changes                          │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. ⏸️  PAUSE AND DISCUSS ⚠️ CRITICAL CHECKPOINT ⚠️           │
│    • Present results to user                                │
│    • Wait for approval/feedback                             │
│    • DO NOT continue to next task without discussion        │
│    • This prevents runaway automation                       │
│    • User stays in control                                  │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
     User decides: Continue to next task?
         │                    │
         ▼                    ▼
    Next Task            Sprint Complete
```

---

## 🛠️ Required Tool Usage

### ALWAYS Use These Tools (NOT Alternatives)

1. **Claude-Context MCP** for codebase lookups
   - ✅ `mcp__claude-context__search_code()`
   - ❌ NOT grep, NOT Read for searching
   - Index if needed (30-60 seconds)
   - Check status before searching

2. **Memento MCP** for knowledge storage
   - ✅ Follow `/TAXONOMY.md` exactly
   - ✅ Tag according to project standards
   - ✅ Link to Linear issues
   - Neo4j relationships mapped between objects

3. **Chrome DevTools MCP** for UI changes
   - ✅ Capture BEFORE screenshot
   - ✅ Capture AFTER screenshot
   - ✅ Test via https://localhost (nginx reverse proxy)
   - ❌ NEVER test via http://localhost (returns empty responses)

4. **Context7** for framework verification
   - ✅ ALWAYS verify framework patterns
   - ✅ Check before implementing features
   - Required by CONSTITUTION.md Article II Section II

---

## 🚫 Critical "NEVER" Rules

- ❌ **NEVER assume** - Always clarify with user when unsure
- ❌ **NEVER batch tasks** - One task at a time, pause after each
- ❌ **NEVER skip the pause** - User approval required after every task
- ❌ **NEVER use grep for codebase search** - Use Claude-Context MCP
- ❌ **NEVER skip CHANGELOG** - Update after every task completion
- ❌ **NEVER skip Memento** - Save patterns for future reference
- ❌ **NEVER skip git checkpoint** - Create safety point before work
- ❌ **NEVER test locally** - Always use Docker nginx reverse proxy

---

## 📊 Real-World Example: HEX-127 Backend Sprint

This shows how the workflow pattern was executed for authentication backend:

```
HEX-125 (Research Issue)
   ↓ (research agents: the-brain, codebase-navigator, memento-oracle)
HEX-126 (PRD from research)
   ↓ (consolidated into implementation plan)
HEX-127, 128, 129 (Sprint Issues with detailed tasks)
   ↓ (each sprint has 4-6 tasks)
HEX-130 (Master Checklist tracking all sprints)
   ↓
Task 2.1: Dependencies
   1. Git checkpoint ✅
   2. npm install 5 packages ✅
   3. Review work ✅
   4. Test: npm list verification ✅
   5. Update Linear HEX-127 comment ✅
   6. Update CHANGELOG ✅
   7. Memento: N/A (simple install)
   8. ⏸️ PAUSE AND DISCUSS ✅
   ↓
Task 2.2: Database Schema
   1. Git checkpoint ✅
   2. Modify init-database.js ✅
   3. Review work ✅
   4. Test: npm run init-db ✅
   5. Update Linear HEX-127 comment ✅
   6. Update CHANGELOG ✅
   7. Memento: N/A (schema only)
   8. ⏸️ PAUSE AND DISCUSS ✅
   ↓
Task 2.4: Auth Service Layer
   1. Git checkpoint ✅
   2. Launch hextrackr-fullstack-dev agent ✅
   3. Review agent output ✅
   4. Test: All 5 endpoints via https://localhost ✅
   5. Update Linear HEX-127 comment ✅
   6. Update CHANGELOG (comprehensive) ✅
   7. Memento: Argon2id pattern saved ✅
   8. ⏸️ PAUSE AND DISCUSS ✅
   ↓
... (continue for all 6 tasks)
```

---

## Key Principles

- **Five Whys Methodology**: Always dig deep when troubleshooting
- **Edge Case Awareness**: Always look for edge cases in implementation
- **Linear as Source of Truth**: All planning, research, and progress in Linear
- **No Session Plans**: No per-session markdown planning files
- **Quality Focus**: Maintain code quality without bureaucratic overhead
- **User Control**: Pause-and-discuss keeps user in control

## Linear Issue Format

```
Title: v1.0.XX: [Feature/Bug Name]
Team: [HexTrackr-Dev|HexTrackr-Prod|HexTrackr-Docs]
Status: Backlog → Todo → In Progress → In Review → Done
Labels: [Type: Bug/Feature/Enhancement] + [Priority: High/Medium/Low]
```

**Team Selection Guidelines**:
- **HexTrackr-Dev** (HEX-XX): Development features, bug fixes, general enhancements
- **HexTrackr-Prod** (HEXP-XX): Production deployment, security hardening, Linux-specific issues
- **HexTrackr-Docs** (DOCS-XX): Shared knowledge, architecture decisions, cross-instance documentation

## CRITICAL: Dev Branch Workflow (Integration Branch Pattern)

**GitHub main is protected** - You CANNOT push directly to main branch on GitHub.

**Solution**: Use `dev` branch as your working baseline instead of local `main`.

### The `dev` Branch Strategy

**`dev` branch** = Your integration/development baseline
- **Protected on GitHub**: Won't be deleted accidentally
- **No Codacy restrictions**: Fast iteration, no review requirements
- **Always current**: Sync with `git pull origin main` after each PR merge
- **Purpose**: Replaces stale local main as branching point

**Workflow Pattern**:
```bash
# Daily work (always from dev)
git checkout dev
git pull origin main          # Sync dev with GitHub main
git checkout -b feature/hex-124-something  # Optional: for complex work
# ... make changes, commit ...
git checkout dev
git merge feature/hex-124-something  # Optional: if using feature branch
# OR just commit directly to dev for simple fixes
git push origin dev

# Create PR on GitHub: dev → main
# After PR merges on GitHub:
git checkout dev
git pull origin main          # Sync dev with merged changes
```

**Key Benefits**:
- ✅ No stale baseline (dev syncs with main after each PR)
- ✅ No branch drift (always branch from current code)
- ✅ No merge conflicts (clean baseline)
- ✅ No data loss (clear branch hierarchy)
- ✅ Local main can stay stale (never used for work)

**Feature Branches** (Optional, for complex/multi-commit work):
- Created from `dev` (not `main`)
- Merged back to `dev` before PR
- Deleted after merge (ephemeral)
- **Simple fixes**: Commit directly to `dev`, skip feature branch

**NEVER**:
- ❌ Create branches from local `main` (it's stale!)
- ❌ Push feature branches to GitHub without merging to `dev` first
- ❌ Forget to sync `dev` with `git pull origin main` after PR merges

**Why This Works**: `dev` branch stays synchronized with GitHub main via pull after each PR merge. Feature branches created from `dev` have the latest code. No drift, no conflicts, no data loss.

**Permissions**: Git push commands are enabled in project `.claude/settings.json` to allow automatic pushes to dev branch. GitHub's branch protection on main provides the real safety net against accidental pushes to protected branches.

## Quality Gates (From CONSTITUTION.md)

- All code MUST pass Codacy quality checks
- All code MUST pass ESLint 9+ checks
- All markdown MUST pass Markdownlint
- All JavaScript functions MUST have complete JSDoc comments
- All testing done via Docker container nginx reverse proxy on localhost:80 (HTTP) and localhost:443 (HTTPS)
- Never run HTTP/HTTPS locally

---

# Section 6: Quick Reference

## Essential Commands

### Development
```bash
npm start          # Start production server on port 8080
npm run dev        # Start development server with nodemon
npm run init-db    # Initialize database schema
```

### Testing & Quality
```bash
npm run lint:all     # Run all linters (markdown, eslint, stylelint)
npm run fix:all      # Auto-fix all linting issues
npm run eslint       # Run ESLint on all JS files
npm run eslint:fix   # Auto-fix ESLint issues
```

### Documentation
```bash
npm run docs:dev     # Generate JSDoc documentation
npm run docs:all     # Generate all documentation (JSDoc + HTML)
```

### Docker
```bash
docker-compose up -d    # Start container (nginx reverse proxy on localhost:80/443)
docker-compose logs -f  # Follow container logs
```

**IMPORTANT**: Always test via nginx reverse proxy (localhost:80 HTTP, localhost:443 HTTPS). Never run HTTP/HTTPS locally or access Docker ports directly.

## Git Workflow Cheat Sheet

```bash
# Daily work pattern (dev branch workflow)
git checkout dev
git pull origin main              # Sync dev with GitHub main
# ... make changes, test, commit to dev ...
git push origin dev

# Create PR on GitHub: dev → main

# After PR merges on GitHub
git checkout dev
git pull origin main              # Sync dev with merged changes

# Optional: Feature branch for complex work
git checkout dev
git checkout -b feature/v1.0.XX-name
# ... work ...
git checkout dev
git merge feature/v1.0.XX-name
git branch -d feature/v1.0.XX-name  # Clean up
git push origin dev
```

## Getting Project Information (Dynamic Context)

**Don't rely on static documentation - use dynamic context tools:**

| What You Need | How to Get It |
|---------------|---------------|
| **Current project state** | `/prime` or `/quickprime` |
| **Architecture details** | `/prime` → codebase-navigator output |
| **Database schema** | `/search-code "database schema"` |
| **Current version/dependencies** | `/prime` → project metadata |
| **Framework stack** | `/prime` → technical baseline |
| **Service descriptions** | `/search-code "service layer pattern"` |
| **Active Linear issues** | `/prime` → linear-librarian output |
| **Historical patterns** | `/prime` → memento-oracle output |
| **Code patterns/locations** | `mcp__claude-context__search_code` |
| **API documentation** | Linear DOCS-12 or `/search-code "API endpoints"` |
| **Recent changes** | `/quickprime` → git delta analysis |

**Workflow**:
1. **Session Start**: Run `/prime` to get complete current state
2. **After Auto-Compact**: Run `/quickprime` to restore context
3. **Find Code**: Use `/search-code` or `mcp__claude-context__search_code`
4. **Understand Patterns**: Check prime output or launch `memento-oracle` agent

## Starting a New Feature (Quick Steps)

1. **Understand task** from user
2. **Create Linear issue** with task breakdown (or update existing)
3. **Get context** via `/prime` (if needed) or `/quickprime`
4. **Launch subagents if needed**:
   - `codebase-navigator` for architecture context
   - `memento-oracle` for historical patterns
   - `linear-librarian` for related issues
5. **Create feature branch** from `dev` (not `main`!)
6. **Implement** with Linear comment updates
7. **Quality check**: Docker test (nginx reverse proxy on localhost:80/443), `npm run lint:all`
8. **Create PR** and merge to main
9. **Update Linear** status to Done

---
