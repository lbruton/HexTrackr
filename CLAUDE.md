# CLAUDE.md

## HexTrackr Overview

HexTrackr is a vulnerability management system for tracking security vulnerabilities, tickets, and Known Exploited Vulnerabilities (KEV). The system uses a modular Node.js/Express backend with SQLite database and vanilla JavaScript frontend.

## Documentation Hierarchy

This project uses a multi-layered documentation system with clear precedence:

**CONSTITUTION.md**: Authoritative requirements and mandates (MUST follow - constitutional law)

**Linear DOCS-**: Shared knowledge accessible across all Claude instances

**Memento MCP**: Shared Knowlaged accessable accross all Claude instances (Refer to /TAXONOMY.md) 

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
- **Project Path**: `/Volumes/DATA/GitHub/HexTrackr/`
- **Responsibilities**:
  - Active feature development and coding
  - Managing private GitHub repository
  - Docker development environment (nginx reverse proxy on localhost:80/443)
  - Testing and quality assurance
- **Works With**: Claude Desktop for task assignments

### 3. Claude-Prod (Production Management & Clean Releases)
- **Location**: Ubuntu 24.04 LTS server (192.168.1.80)
- **Project Path**: `/home/lbruton/HexTrackr-Dev/`
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
- **Reports** (REP-XX): Shared project daily, weekly, and combined reports.
- **StackTrackr** (STACK-XX): Sister Project, pet project of the developer (Lonnie Bruton), unrelated to hextrackr.
- **Lonnie Bruton** (LDB-XX): Personal Notes for the Developer, unrelated to hextrackr

## Workflow Integration

- **Shared Resources**:
  - Linear teams (HexTrackr-Dev, HexTrackr-Prod, HexTrackr-Docs)
  - Memento knowledge graph with semantic search capabilities
  - Claude-Context codebase indexing (shared across all instances)
  - Linear MCP with organized teams for project management and as shared knowledge repository

- **Communication**: All inter-instance communication flows through Linear issues and comments and memento memory insights

---

# Section 2: Development Workflow

## Linear-Only Workflow (SIMPLIFIED)

HexTrackr uses a simplified workflow with Linear as the primary source of truth:

1. **Work Assignment**: User describes what needs to be done
2. **Linear Issue**: Create/update Linear issue with task breakdown
3. **Implementation**: Commit and open a new feature branch then execute work with checklists and progress updates in Linear comments
4. **Completion**: Update project /app/public/docs-source/CHANGELOG.md, as well as the Linear status and commit changes
5. **Test and Verify**: Consult user for final approval to push to GH for Codacy scans.

## Key Principles

- **Casual Development**: Natural conversation flow after initialization completes
- **Linear-Centric**: All planning, research, and progress tracking in Linear issues
- **Quality Focus**: Maintain code quality standards without bureaucratic overhead
- **No Session Plans**: Eliminate per-session markdown planning files (infrastructure command files like prime.md are acceptable)

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

# Section 3: Tool Usage & Specialized Agents

## Subagent Usage for Deep Dives

When you need detailed context beyond initialization, use specialized agents:

### codebase-navigator (Architecture & Code Analysis)

**When to Use**:
- Before refactoring (map dependencies)
- Before database migrations (find all schema references)
- Architecture analysis (understand module structure)
- Integration planning (find where new features connect)
- File discovery (locate implementations)

**What It Returns**:
- File:line references for navigation
- Integration points (middleware, routes, services)
- Recent changes from git with context
- Architecture overview with actual code structure

**Example**:
```
Task: "Refactor the vulnerability import service"
→ Launch codebase-navigator to map all import dependencies
→ Returns: Files that reference importService, integration points, recent changes
→ Proceed with refactoring using complete dependency map
```

### memento-oracle (Historical Context & Decisions)

**When to Use**:
- Before architecture decisions (what have we learned before?)
- Debugging recurring issues (has this happened before?)
- Pattern discovery (how did we solve similar problems?)
- Cross-instance coordination (what did Claude-Prod discover?)
- Performance optimization (what patterns worked?)

**What It Returns**:
- Past breakthroughs with entity IDs
- Anti-patterns and lessons learned
- Historical decisions with Linear issue references
- Cross-instance handoff context

**Example**:
```
Task: "Optimize database query performance"
→ Launch memento-oracle to find past optimization patterns
→ Returns: HEX-117 surgical optimization pattern, performance baselines
→ Apply proven pattern instead of guessing
```

### linear-librarian (Deep Issue Research)

**When to Use**:
- Complex issue relationships (dependencies, blockers)
- Cross-team coordination (handoffs between Dev/Prod)
- Planning context (what's in the pipeline?)
- Sprint/cycle analysis (current workload)
- Issue history (complete context with comments)

**What It Returns**:
- Compressed activity summaries
- Issue details with all comments
- Cross-team dependencies
- Current cycle/sprint status
- Blocker analysis

**Example**:
```
Task: "Understand authentication implementation status"
→ Launch linear-librarian for HEX-76 series issues
→ Returns: All auth issues, dependencies, current status, comments
→ Start work with complete context
```

### config-guardian (Configuration File Management)

**When to Use**:
- Before modifying any linting/quality configuration files
- When adding new linting rules or configs
- When debugging "why is this warning appearing?" questions
- During project setup or config consolidation efforts
- Periodically (monthly) to audit config drift
- When you discover a config file without Linear documentation

**What It Returns**:
- Linear DOCS-XX issue tracking for each config file
- Timestamped comments documenting config changes
- Configuration audit reports with drift detection
- Proper documentation preventing future confusion

**Example**:
```
Task: "Add new ESLint rule for unused variables"
→ Launch config-guardian to modify .eslintrc with Linear tracking
→ Returns: Updated config with DOCS-XX issue comment explaining change
→ Future debugging references Linear issue for context
```

### docs-guardian (Documentation Accuracy Audit)

**When to Use**:
- After significant feature additions or refactoring
- Periodically (weekly/monthly) to detect documentation drift
- Before major releases to ensure user-facing docs are current
- When users report documentation inconsistencies
- To identify missing documentation for new features
- To find and remove orphaned documentation for deprecated features

**What It Returns**:
- Documentation accuracy audit report
- Linear DOCS issues for discrepancies
- Missing documentation identified
- Orphaned documentation flagged
- Prioritized recommendations for updates

**Example**:
```
Task: "Finished refactoring vulnerability import service"
→ Launch docs-guardian to verify API docs are still accurate
→ Returns: 3 outdated endpoints, 1 missing feature, 2 orphaned sections
→ Linear DOCS issues created for each discrepancy
```

### hextrackr-fullstack-dev (Complex Feature Implementation)

**When to Use**:
- Implementing complex features requiring deep architecture understanding
- Refactoring code across multiple files/layers
- Building new UI components with AG-Grid or Apex Charts
- Creating new API endpoints with service layer integration
- When transitioning from planning to implementation
- Long-form coding tasks requiring 30+ minutes of focused work

**What It Returns**:
- Complete feature implementation with all layers (routes, services, frontend)
- Code following HexTrackr patterns and conventions
- Proper error handling and validation
- JSDoc documentation for all functions
- Testing recommendations

**Example**:
```
Task: "Implement new dashboard page with AG-Grid and charts"
→ Launch hextrackr-fullstack-dev with feature specification
→ Returns: Complete implementation (routes, services, frontend, styles)
→ All code follows project patterns, passes linters, ready for testing
```

### docker-restart (Docker Container Management)

**When to Use**:
- After modifying JavaScript files that require server restart
- After updating environment variables in `.env` file
- After installing new npm dependencies
- After configuration changes that require container restart
- When the development container becomes unresponsive
- Proactively after completing code changes that modify server-side behavior

**What It Returns**:
- Container stop confirmation
- Container restart status
- Health check verification (nginx reverse proxy accessible on localhost:80/443)
- Startup log analysis for errors
- Ready-to-test confirmation

**Example**:
```
Task: "Just finished updating vulnerability-chart-manager.js"
→ Launch docker-restart to apply changes
→ Returns: ✅ Container restarted, nginx accessible on localhost:80/443, no errors
→ Changes are now live and ready for testing
```

**Model**: Uses Haiku (lightweight) for fast, cost-efficient operational tasks

**Proactive Usage**: Invoke this agent automatically after:
- Server-side JavaScript modifications
- Environment variable changes
- Dependency installations (npm install)
- Configuration file updates requiring restart
- Any changes to files in `/app/` that affect server behavior

### the-brain (Expert Research & Intelligence Gathering)

**When to Use**:
- Need to research implementation patterns or best practices
- Encountering errors that require external solution research
- Verifying framework/library compatibility
- Need to combine codebase analysis with web research
- Require authoritative documentation verification
- Performance optimization research
- Security vulnerability analysis

**What It Returns**:
- Comprehensive intelligence report with executive summary
- Project-aware recommendations specific to HexTrackr architecture
- Integration strategies considering existing codebase patterns
- Source citations (Brave Search, Context7, Claude-Context)
- Confidence levels for all recommendations
- Permanent research archive saved to Memento knowledge graph

**Example**:
```
Task: "How do I implement WebSocket authentication in Node.js?"
→ Launch the-brain for comprehensive research
→ Returns:
  • Current HexTrackr Socket.io implementation analysis
  • Industry best practices from Brave Search
  • Socket.io v4.7+ documentation from Context7
  • Specific integration plan for HexTrackr's architecture
  • Research saved to Memento for future reference
```

**Model**: Uses Opus (maximum intelligence) for comprehensive research and synthesis

**Research Methodology** (4-Phase Approach):
1. **Context** - Sequential Thinking to structure research plan
2. **Internal** - Claude-Context to analyze current HexTrackr implementation
3. **External** - Brave Search + Context7 for best practices and documentation
4. **Synthesis** - Combine findings with Memento persistence for permanent knowledge archive

**Proactive Usage**: Invoke when you need authoritative answers that combine:
- Project-specific codebase context (what exists now)
- Industry best practices (what should be done)
- Framework-specific verification (how to do it correctly)
- Permanent knowledge capture (save for future sessions)

**Key MCP Integrations**:
- Brave Search PRO (web, news, video, image, local search + summarizer)
- Context7 (framework documentation verification)
- Claude-Context (codebase semantic search)
- Memento (permanent research archive with TAXONOMY.md v1.2.0+ compliance)

## Agent vs Direct Tool Decision Tree

```
Need expert research combining web + codebase? → the-brain
Need architecture understanding? → codebase-navigator
Need historical context? → memento-oracle
Need Linear deep dive? → linear-librarian
Need config file changes? → config-guardian
Need documentation audit? → docs-guardian
Need complex feature implementation? → hextrackr-fullstack-dev
Need Docker container restart? → docker-restart
Need UI testing/screenshots/interaction testing? → mcp__chrome-devtools__* (direct)
Know exact file to read? → Read tool
Know exact search term? → Grep tool
Need quick Linear lookup? → mcp__linear-server__get_issue
```

**Key Insight**: Agents burn 10-50k tokens internally, return 800-1.5k compressed. Use them for research, not simple lookups.

## MCP Tool Integration

### Claude-Context (Code Search)
- **Primary Use**: Semantic code search across codebase
- **Index Status**: Check with `mcp__claude-context__get_indexing_status`
- **Re-index**: Prime v2.0 re-indexes at session start if >1 hour old
- **Search**: Natural language queries for code patterns
- **Current**: 133 files, 2259 chunks indexed

### Memento (Knowledge Graph)
- **Primary Use**: Persistent project memory, cross-instance context
- **Taxonomy**: Linear DOCS-14 (primary) or `/TAXONOMY.md` (fallback)
- **Backend**: Neo4j Enterprise 5.13 at 192.168.1.80
- **Search**: Semantic search preferred over keyword search
- **Shared**: All Claude instances use same graph

### Linear (Issue Tracking)
- **Primary Use**: Task tracking, planning, progress updates
- **Tools**: `list_issues`, `get_issue`, `create_issue`, `update_issue`, `create_comment`
- **Pattern**: Issues are source of truth, not markdown files
- **Teams**: HexTrackr-Dev (HEX-XX), HexTrackr-Prod (HEXP-XX), HexTrackr-Docs (DOCS-XX)

### Context7 (Library Documentation)
- **Primary Use**: Up-to-date framework and library documentation
- **Mandatory**: CONSTITUTION.md Article II Section II requires Context7 verification for all framework code
- **Two-Step Process**:
  1. **Resolve Library ID**: `mcp__context7__resolve-library-id` with library name (e.g., "express", "ag-grid")
  2. **Get Documentation**: `mcp__context7__get-library-docs` with resolved library ID
- **When to Use**:
  - Before implementing features with Express, AG-Grid, ApexCharts, Socket.io
  - When verifying API patterns and best practices
  - When debugging framework-specific issues
  - Before upgrading dependencies to check breaking changes
- **Example**:
  ```javascript
  // Step 1: Resolve library ID
  resolve-library-id("express") → Returns: /expressjs/express

  // Step 2: Get docs for specific topic
  get-library-docs("/expressjs/express", topic: "middleware")
  → Returns: Current Express middleware patterns and examples
  ```
- **Trust Scores**: Prioritize libraries with scores 7-10 for production use
- **Code Snippets**: Higher counts indicate better documentation coverage

### chrome-devtools (Browser Testing & Automation)
- **Primary Use**: Browser-based testing, debugging, and UI verification
- **Mandatory**: CONSTITUTION.md Article II Section V requires chrome-devtools testing before and after UI changes
- **Available Tools**:
  - **Page Management**: `list_pages`, `new_page`, `close_page`, `select_page`, `navigate_page`
  - **Interaction**: `click`, `fill`, `fill_form`, `hover`, `drag`, `upload_file`
  - **Inspection**: `take_snapshot`, `take_screenshot`, `list_console_messages`
  - **Network**: `list_network_requests`, `get_network_request`
  - **Performance**: `performance_start_trace`, `performance_stop_trace`, `performance_analyze_insight`
  - **Emulation**: `emulate_cpu`, `emulate_network`, `resize_page`
  - **Scripting**: `evaluate_script`, `wait_for`, `handle_dialog`

- **When to Use**:
  - Before and after any UI changes (mandatory)
  - Testing user interactions and workflows
  - Debugging frontend JavaScript errors
  - Verifying responsive design and layout
  - Performance profiling and Core Web Vitals measurement
  - Network request inspection and API debugging
  - Screenshot capture for documentation or bug reports
  - Capturing UI baseline screenshots before major refactors

- **Testing Environment**:
  - ✅ **ALWAYS use HTTPS**: `https://localhost` (nginx reverse proxy on port 443)
  - ❌ **NEVER use HTTP**: `http://localhost` returns empty API responses (pages load but no data)
  - 🔒 **SSL Certificate Bypass**: Self-signed certificates require manual bypass

- **SSL Certificate Warning Bypass**:
  ```javascript
  // Step 1: Navigate to HTTPS URL (will show certificate warning)
  navigate_page("https://localhost/vulnerabilities.html")
  // Error: net::ERR_CERT_AUTHORITY_INVALID

  // Step 2: Click "Advanced" button to reveal proceed link
  take_snapshot()  // Find "Advanced" button UID
  click(uid: "X_Y")  // Click Advanced button

  // Step 3: Click "Proceed to localhost (unsafe)" link
  take_snapshot()  // Find proceed link UID
  click(uid: "X_Y")  // Click proceed link

  // Page now loads successfully with data
  ```

  **Alternative**: Type `thisisunsafe` on the certificate warning page (browser keyboard shortcut)

- **Screenshot Best Practices**:
  ```javascript
  // Full-page screenshot (captures entire page including scroll area)
  take_screenshot({
    fullPage: true,
    filePath: "/absolute/path/to/screenshot.png"
  })

  // Viewport screenshot (visible area only)
  take_screenshot({
    fullPage: false,
    filePath: "/absolute/path/to/screenshot.png"
  })

  // Element screenshot (specific element only)
  take_screenshot({
    uid: "element_uid",
    filePath: "/absolute/path/to/screenshot.png"
  })
  ```

- **Snapshot Usage for Element Targeting**:
  ```javascript
  // Take snapshot to get accessibility tree with UIDs
  take_snapshot()
  // Returns: uid=5_4 link "Open user menu" (identifies interactive elements)

  // Use UID to interact with specific element
  click(uid: "5_4")  // Opens user menu

  // Take another snapshot to see updated DOM
  take_snapshot()  // Shows dropdown menu items with new UIDs
  ```

- **Practical Workflow Example** (HEX-130 UI Baseline):
  ```javascript
  // 1. Navigate to page (handle SSL warning first time)
  navigate_page("https://localhost/vulnerabilities.html")

  // 2. Wait for charts/data to load
  Bash: sleep 3

  // 3. Capture full-page baseline screenshot
  take_screenshot({
    fullPage: true,
    filePath: "/path/to/screenshots/vulnerabilities-page.png"
  })

  // 4. Open dropdown menu for UI element capture
  take_snapshot()  // Get user menu UID
  click(uid: "4_4")  // Open settings dropdown

  // 5. Capture dropdown state
  take_screenshot({
    filePath: "/path/to/screenshots/settings-dropdown.png"
  })

  // 6. Click modal trigger
  click(uid: "5_19")  // Open settings modal

  // 7. Capture modal state
  take_screenshot({
    filePath: "/path/to/screenshots/settings-modal.png"
  })
  ```

- **Integration with Authentication UI Development**:
  - **Before Implementation**: Capture baseline screenshots showing current navbar, user menu, settings modal
  - **During Development**: Test login page rendering, session state changes, protected route redirects
  - **After Implementation**: Capture comparison screenshots showing authenticated UI elements
  - **Regression Testing**: Compare before/after screenshots to verify no unintended UI changes
  - **Documentation**: Screenshot captures serve as visual PRD validation

- **Common Patterns**:
  ```javascript
  // Pattern 1: Multi-page screenshot capture session
  navigate_page("https://localhost/page1.html")
  Bash: sleep 3
  take_screenshot({ fullPage: true, filePath: "page1.png" })

  navigate_page("https://localhost/page2.html")
  Bash: sleep 3
  take_screenshot({ fullPage: true, filePath: "page2.png" })

  // Pattern 2: Interactive element testing
  take_snapshot()  // Identify button UID
  click(uid: "button_uid")
  wait_for("Success message")
  take_screenshot({ filePath: "after-click.png" })

  // Pattern 3: Form filling and submission
  take_snapshot()  // Get form field UIDs
  fill(uid: "username_field", value: "admin")
  fill(uid: "password_field", value: "secure_password")
  click(uid: "submit_button")
  wait_for("Dashboard")
  take_screenshot({ fullPage: true, filePath: "logged-in.png" })
  ```

- **Troubleshooting**:
  - **Empty data on page**: Using HTTP instead of HTTPS (API returns empty responses)
  - **Certificate error persists**: Need to manually click "Advanced" → "Proceed to localhost (unsafe)"
  - **Element not found**: Take fresh `take_snapshot()` after any DOM changes (UIDs update)
  - **Screenshot too small**: Use `fullPage: true` to capture entire scrollable content
  - **Timing issues**: Add `Bash: sleep 3` before screenshots to allow charts/async data to load

---

# Section 4: Quick Reference

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

## Where to Find What

**Don't duplicate - point to sources:**

| What You Need | Where to Find It | How to Get It |
|---------------|------------------|---------------|
| **Architecture details** | Codebase | Launch codebase-navigator agent |
| **Database schema** | `app/public/scripts/init-database.js` | Read tool |
| **API reference** | Linear DOCS-12 or generated docs | Linear or `app/dev-docs-html/` |
| **Historical decisions** | Memento knowledge graph | Launch memento-oracle agent |
| **Recent work context** | Linear issues | Launch linear-librarian agent |
| **Code patterns** | Codebase | `mcp__claude-context__search_code` |
| **Tool requirements** | CONSTITUTION.md Article II | Read tool |
| **Quality standards** | CONSTITUTION.md Article I Section III-IV | Read tool |
| **Service details** | Service files in `app/services/` | Read or codebase-navigator |
| **Frontend structure** | Files in `app/public/scripts/shared/` | Read or codebase-navigator |

## Starting a New Feature (Quick Steps)

1. **Understand task** from user
2. **Create Linear issue** with task breakdown (or update existing)
3. **Launch subagents if needed**:
   - codebase-navigator for architecture context
   - memento-oracle for historical patterns
   - linear-librarian for related issues
4. **Create feature branch** (commit to local main first!)
5. **Implement** with Linear comment updates
6. **Quality check**: Docker test (nginx reverse proxy on localhost:80/443), `npm run lint:all`
7. **Create PR** and merge to main
8. **Update Linear** status to Done

---



