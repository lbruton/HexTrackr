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
Query for recent work to understand project momentum by looking at both recently updated and recently created issues.
- Tool: `mcp__linear__list_issues`
- team: `"${PROJECT_NAME}-Dev"` (auto-detected from working directory)
- limit: 10
- orderBy: "updatedAt"

- Tool: `mcp__linear__list_issues`
- team: `"${PROJECT_NAME}-Dev"` (auto-detected from working directory)
- limit: 10
- orderBy: "createdAt"

#### 2. Active Work Query
Query for currently active work to understand immediate focus. This includes work that is in progress, in review, or planned to be started.
- Tool: `mcp__linear__list_issues`
- team: `"${PROJECT_NAME}-Dev"` (auto-detected from working directory)
- state: "In Progress"
- limit: 5
- orderBy: "updatedAt"

- Tool: `mcp__linear__list_issues`
- team: `"${PROJECT_NAME}-Dev"` (auto-detected from working directory)
- state: "In Review"
- limit: 5
- orderBy: "updatedAt"

- Tool: `mcp__linear__list_issues`
- team: `"${PROJECT_NAME}-Dev"` (auto-detected from working directory)
- state: "Todo"
- limit: 5
- orderBy: "updatedAt"

#### 3. Deep Dive on Active Work
For EACH in-progress issue found in step 2:
- Use `mcp__linear__get_issue` with the issue `id` to read full details
- Extract comprehensive context:
  - Technical keywords (file paths, component names, functions mentioned)
  - Problem descriptions (what's broken, what needs fixing)
  - Implementation details (what's being built, approach being taken)
  - Blockers or challenges mentioned
  - Technologies and frameworks referenced

### Phase 4: Project Knowledge Graph Search (REQUIRED)

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

1. **Check for CONSTITUTION.md** at `${PROJECT_PATH}/CONSTITUTION.md`
   - If exists: Extract mandatory development practices, tool usage requirements, code quality standards
   - If not: Note absence in report

2. **Read package.json** at `${PROJECT_PATH}/package.json` (if Node.js project)
   - Extract current released version
   - Note project type and dependencies
   - For non-Node projects, check equivalent (Cargo.toml, setup.py, etc.)

3. **Check for CHANGELOG** at common locations:
   - `${PROJECT_PATH}/CHANGELOG.md`
   - `${PROJECT_PATH}/docs-source/CHANGELOG.md`
   - `${PROJECT_PATH}/docs/CHANGELOG.md`
   - Extract recent changes and version history

4. **Check for TAXONOMY.md** at `${PROJECT_PATH}/TAXONOMY.md`
   - If exists: Note Memento tagging conventions for this project
   - If not: Use default taxonomy from Linear DOCS-14 (if available)

***Note**: Version numbers in package.json may lag behind CHANGELOG during active development. Document any drift in final report.* 

### Phase 7: Synthesis & Report (REQUIRED)
You MUST produce this summary to confirm context loading:

## Report

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

[5 paragraphs summarizing the current state of the project, recent work, and any important patterns or issues discovered]

```
