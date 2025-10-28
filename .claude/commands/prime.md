---
description: Original comprehensive prime context loading process (legacy version)
allowed-tools: Read, Bash, mcp__memento__*, mcp__linear-server__*, mcp__claude-context__*, 
---
# Prime Instructions - Universal Project Context Loading

**Purpose**: Load complete project context through a strict, sequential discovery process to provide effective development assistance.

**Project Detection**: Auto-detects project from working directory path.

The prime sequence uses a layered discovery approach - temporal context (git) → tool
status (index) → keyword extraction (Linear) → knowledge retrieval (Memento) → code search (Claude-Context) →
governance (Constitution). This builds a progressively richer understanding where each phase informs the next.

## STRICT EXECUTION REQUIREMENTS

You MUST follow these phases in exact order. Each phase builds on the previous one.

### Phase 1: Temporal & Git Context + Index Refresh (REQUIRED)

Execute these exact commands in order:

#### 1A: Basic Context (using Bash tool)
1. Run: `date "+%Y-%m-%d %H:%M:%S %Z"` to get current date/time
2. Run: `git log --oneline -3` to see the last 3 commits with messages
3. Run: `git status --short` to see uncommitted changes
4. Run: 'git branch --show-current' (Learn the current working branch)

#### 1B: Project Detection & Claude-Context Re-indexing (using MCP tools)

5. **Detect current project from working directory**:
   ```javascript
   // Extract project path from current working directory
   const cwd = process.cwd();
   const PROJECT_PATH = cwd; // e.g., "/Volumes/DATA/GitHub/HexTrackr"
   const PROJECT_NAME = cwd.split('/').pop().toUpperCase(); // e.g., "HEXTRACKR"
   ```

6. **ALWAYS re-index at session start**: `mcp__claude-context__index_codebase` with:
   - path: `${PROJECT_PATH}` (auto-detected from working directory)
   - splitter: "ast" (uses AST-based code splitting)
   - force: false (set to true only if re-indexing needed)

   ***IF CODE IS OLDER THAN 1 HOUR PLEASE RE-INDEX AND MONITOR TO COMPLETION BEFORE CONTINUING TO PHASE 3***

### Phase 3: Keyword Compilation (REQUIRED)

**DO NOT SKIP THIS PHASE**. Manually extract and compile keywords from Phases 1-2:

From git commits, extract:
- Feature names (e.g., "CSV import", "VPR scoring", "documentation")
- Fix targets (e.g., "pipeline", "modal", "WebSocket")
- Component names (e.g., "importService", "dashboardController")

From date, note:
- Current month-year (e.g., "2025-09", "September 2025")
- Day of week (for recent session context)


### Phase 3.5: Linear Context Discovery (COMPREHENSIVE - REQUIRED)

**Comprehensive Linear context gathering to provide rich keywords for Memento and code searches**:

**Note**: Linear team name should match project name. Common patterns:
- HexTrackr → "HexTrackr-Dev" team
- StackTrackr → "StackTrackr-Dev" team
- For production work → "[Project]-Prod" team
- Skip this phase if Linear integration is not available for the current project

#### 1. Recent Activity Query
Query for recent work to understand project momentum:
- Tool: `mcp__linear__list_issues`
- team: `"${PROJECT_NAME}-Dev"` (auto-detected from working directory)
1. Query "In Progress" issues: `list_issues({state: "In Progress", includeArchived: false})`
2. Query "Todo" issues: `list_issues({state: "Todo", includeArchived: false})`
3. Query "Backlog" issues (limit 10): `list_issues({state: "Backlog", includeArchived: false, limit: 10})`
4. Query recent completions (7 days): `list_issues({state: "Done", updatedAt: "-P7D", includeArchived: false, limit: 10})`


#### 2. Deep Dive on Active Work
For EACH in-progress issue found in step 1:
- Use `mcp__linear__get_issue` with the issue `id` to read full details
- Extract comprehensive context:
  - Technical keywords (file paths, component names, functions mentioned)
  - Problem descriptions (what's broken, what needs fixing)
  - Implementation details (what's being built, approach being taken)
  - Blockers or challenges mentioned
  - Technologies and frameworks referenced

### Phase 4: Project Knowledge Graph Search 

**DO NOT SKIP THIS PHASE**. Execute optimized searches for comprehensive context:

#### Search 1: Recent Activity Search (semantic with temporal focus)
Using current week from Phase 1 and PROJECT_NAME from Phase 1B, search for recent work:
- Tool: `mcp__memento__semantic_search`
- query: `"${PROJECT_NAME} Session Insight week-[CURRENT_WEEK]-[YEAR] completed in-progress breakthrough"`
- limit: 10
- min_similarity: 0.4
- hybrid_search: true (combines semantic + keyword for tags)

Example for HexTrackr: "HEXTRACKR Session Insight week-39-2025 completed in-progress breakthrough"
Example for StackTrackr: "STACKTRACKR Session Insight week-39-2025 completed in-progress breakthrough"

#### Search 2: Project Context & Insights (semantic for concepts)
Include keywords from Linear issues found in Phase 3.5 and project-specific tech stack:
- Tool: `mcp__memento__semantic_search`
- query: `"${PROJECT_NAME.toLowerCase()} [LINEAR_KEYWORDS] [PROJECT_TECH_STACK]"`
- limit: 10
- min_similarity: 0.4
- hybrid_search: false (pure semantic for conceptual matching)

Example for HexTrackr: "hextrackr docker authentication security migration memento neo4j"
Example for StackTrackr: "stacktrackr vulnerability tracking cve database sqlite"

**Tag Patterns to Watch** (per /memento/TAXONOMY.md):
- Temporal: week-XX-YYYY, YYYY-MM-DD
- Status: completed, in-progress, handoff
- Learning: lesson-learned, pattern, breakthrough, insight

**Store results** - Recent work patterns and insights inform Phase 5 searches.

### Phase 5: Codebase Semantic Search (REQUIRED)

**Note**: Index was refreshed in Phase 1B, so all searches will include the latest code changes.

Using keywords from Phase 3, 3.5, and 4, execute these searches with `mcp__claude-context__search_code`:

1. **Architecture Search** (path: `${PROJECT_PATH}`, limit: 3):
   Query: Project-specific architecture keywords
   - For web apps: "server initialization middleware routes controllers"
   - For libraries: "exports modules API public interface"
   - Adapt based on project type discovered in Phase 1

2. **Recent Feature Search** (path: `${PROJECT_PATH}`, limit: 5):
   Query: Combine git features (Phase 1) + Linear issues (Phase 3.5)
   Example: "CSV import pipeline deduplication WebSocket progress [LINEAR_FEATURES]"

3. **Problem Area Search** (path: `${PROJECT_PATH}`, limit: 5):
   Query: Combine issues from git/Linear + Memento insights (Phase 4)
   Example: "modal initialization dataManager corruption backup restore [MEMENTO_INSIGHTS]"

**If searches return unexpected results**: The index should be fresh from Phase 1, but if you encounter issues, verify the index timestamp matches today's date.

### Phase 6: Documentation (REQUIRED)

Read project governance and development guidelines (if they exist):


1. **Read package.json** at `${PROJECT_PATH}/package.json` (if Node.js project)
   - Extract current released version
   - Note project type and dependencies
   - For non-Node projects, check equivalent (Cargo.toml, setup.py, etc.)

2. **Check for CHANGELOG** at common locations:

   - `${PROJECT_PATH}/app/public/docs-source/changelog/index.md`

   - Extract recent changes and version history

3. **Check for TAXONOMY.md** at `${PROJECT_PATH}/TAXONOMY.md`
   - If exists: Note Memento tagging conventions for this project
   - If not: Use default taxonomy from Linear DOCS-14 (if available)

***Note**: Version numbers in package.json may lag behind CHANGELOG during active development. Document any drift in final report.* 

### Phase 7: Synthesis & Reports (REQUIRED)
You MUST produce this summary to confirm context loading:

Combine context from all phases into comprehensive summary:

1. **Save to Linear MCP**: Use `mcp__linear-server__create_issue` to save complete summary:
   - **Team**: "Prime Logs" ⚠️ **CRITICAL**: Use exact team name "Prime Logs" - NOT "Reports" or any other team
   - **Title**: `${PROJECT_NAME}${INSTANCE_TYPE}_PRIMELOG_${YYYY-MM-DD-HH-MM-SS}` (e.g., "HEXTRACKRDEV_PRIMELOG_2025-10-04-10-42-06" or "HEXTRACKRPROD_PRIMELOG_2025-10-04-15-30-00")
   - **Description**: [Complete report using template below]
   - **Labels**: ["prime-log", "${PROJECT_NAME.toLowerCase()}"]
   - **Priority**: 0 (no priority for logs)


### Linear Report Template

```markdown
## 📋 ${PROJECT_NAME} Prime Context (v2.2)

**Metadata**: ${PROJECT_NAME} v[version] | [branch] | ${CURRENT_DATE} | Index: [X files, Y chunks]

---

## 🎯 Active Work (file:line references)

**In Progress** ([count] issues):
- [HEX-XX]: [title] → `file.js:123` (next: [specific action])
- [HEX-YY]: [title] → `file.js:456` (blocked by: [dependency])

**Todo** ([count] issues):
- [HEX-ZZ]: [title] (estimated: [timeframe])

**Backlog** (top 3):
- [HEX-AA], [HEX-BB], [HEX-CC] (future work)

**Recent Wins** (last 7 days):
- [HEX-DD]: [title] ([impact in 5 words])

---

## 🔧 Code-Ready Integration Points

**Where to add new features**:
- [Feature type]: Start at `server.js:157` (initialization sequence)
- [Feature type]: Create `services/newService.js` (use [Pattern] from `existingService.js:23`)

**Active Patterns**:
- **[Pattern Name]**: Implemented in `file.js:45-67` (use for: [use case])
- **[Pattern Name]**: See `file.js:123` (avoid: [anti-pattern])

**Critical TODOs** (from active issues):
- `file.js:234` - [TODO description] (priority: [high/medium])

---

## 📊 Technical Baseline

**Services**: [count] services | **Database**: [type] at [location] | **Tables**: [count]
**Runtime**: [Node.js version] | **Docker**: [yes/no] on port [X]
**Quality**: ESLint [pass/fail] | Codacy [issues count]

**Key Commands**:
- Dev: `npm run dev` | Test: `npm test` | Lint: `npm run lint:all`

---

## 🧠 Memento Intelligence

**Query for full context**: `TAG: session:prime-${YYYY-MM-DD}`

**Saved Entities**:
- Prime-Linear-${PROJECT_NAME}-${TIMESTAMP} (active issues)
- Prime-Memento-${PROJECT_NAME}-${TIMESTAMP} (patterns/lessons)
- Prime-Codebase-${PROJECT_NAME}-${TIMESTAMP} (architecture)
- Prime-Technical-${PROJECT_NAME}-${TIMESTAMP} (environment)

---

## 📝 Next Actions

1. **[HEX-XX]**: [Action] at `file.js:line` (pattern: [reference])
2. **[HEX-YY]**: [Action] at `file.js:line` (depends: [dependency])
3. **Other**: [Any non-tracked work]

[3 paragraphs summarizing the current state of the project, recent work, and any important patterns or issues discovered.]

```

## CLI Report

Use the following template to summarize your understanding and confirm readiness:

```markdown

## 📋 Project Summary:

- **Project**: [PROJECT_NAME] v[Most recent version from package.json or CHANGELOG.md]
- **Project Path**: [PROJECT_PATH from working directory]
- **Version Drift**: [If package.json is out of sync with CHANGELOG and/or git, note here]
- **Branch**: [from git status]
- **Current Time**: [from Phase 1]
- **Index Status**: ✅ Re-indexed at session start with Claude-Context ([X] files, [Y] chunks)
- **Recent Commits**: [count] commits analyzed
- **Linear Team**: [PROJECT_NAME-Dev] (or "N/A" if not using Linear)
- **Session History**: [count] recent sessions found in Memento
- **Uncommitted Changes**: [Yes/No with count from git status]
- **Documentation**: [List which docs were found: CONSTITUTION.md, TAXONOMY.md, CHANGELOG.md, etc.]

### Keywords Extracted for Context

- **Git Keywords**: [list 3-5 from Phase 3]
- **Session Keywords**: [list 3-5 from Phase 3]
- **Active Features**: [list from discoveries]

[3 Paragraphs summarizing the frameworks used, database schema, authentication methods, and any other technical details.]

[3 paragraphs summarizing the current state of the project, recent work, and any important patterns or issues discovered.]



```

---


