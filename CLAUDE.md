# CLAUDE.md

> **IMPORTANT**: This is a FALLBACK document. The primary source of truth is **Linear DOCS-22**.
> Only use this file if Linear is unavailable. Always check DOCS-22 first for the latest guidance.
> **Last Updated**: 2025-10-02 | **Version**: 2.0.0 (DOCS-22 restructure)

---

## HexTrackr Overview

HexTrackr is a vulnerability management system for tracking security vulnerabilities, tickets, and Known Exploited Vulnerabilities (KEV). The system uses a modular Node.js/Express backend with SQLite database and vanilla JavaScript frontend.

**Current Version**: v1.0.43 (git reality) / v1.0.41 (package.json - needs sync)

## Documentation Hierarchy

This project uses a multi-layered documentation system with clear precedence:

1. **CONSTITUTION.md**: Authoritative requirements and mandates (MUST follow - constitutional law)
2. **Linear DOCS-22**: This document's primary source (project guidance, patterns, workflows)
3. **CLAUDE.md**: Fallback when Linear unavailable
4. **prime.md**: Session initialization procedure (Prime v2.0 with agent delegation)
5. **Linear DOCS-*** issues**: Shared knowledge accessible across all Claude instances

**When in doubt**: CONSTITUTION.md takes precedence over all other documentation.

**Anti-Duplication Policy**: Tool usage requirements, code quality standards, and MCP integration details are defined once in CONSTITUTION.md. This document references the constitution rather than duplicating requirements.

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
  - Docker development environment (port 8989)
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

- **HexTrackr-Dev Team** (HEX-XX): General development issues (Claude-Dev primary focus)
- **HexTrackr-Prod Team** (HEXP-XX): Production-specific tasks (Claude-Prod primary focus)
- **HexTrackr-Docs Team** (DOCS-XX): Shared project documentation accessible by all instances

## Workflow Integration

- **Task Flow**: Claude Desktop creates Linear issues → Claude-Dev implements → Claude-Prod deploys
- **Shared Resources**:
  - Linear teams (HexTrackr-Dev, HexTrackr-Prod, HexTrackr-Docs)
  - Memento knowledge graph (Neo4j Enterprise 5.13 at 192.168.1.80)
  - Claude-Context codebase indexing (shared across all instances)
  - HexTrackr-Docs team as shared knowledge repository
- **Communication**: All inter-instance communication flows through Linear issues and comments

## Communication Patterns

- **Prime Boot Sequence**: Each instance loads context via Prime v2.0 (agent delegation)
- **Handoffs Between Instances**:
  - Document decisions and context in Linear issues
  - Use Linear comments for implementation details
  - Tag relevant instance in Linear when handing off
- **Linear as Communication Hub**: Primary coordination mechanism
- **Instance Naming**: Always specify which Claude instance when referencing work

---

# Section 2: Development Workflow

## Linear-Only Workflow (SIMPLIFIED)

HexTrackr uses a simplified workflow with Linear as the primary source of truth:

1. **Work Assignment**: User describes what needs to be done
2. **Linear Issue**: Create/update Linear issue with task breakdown
3. **Implementation**: Execute work with progress updates in Linear comments
4. **Completion**: Update Linear status and commit changes

## Key Principles

- **Structured Initialization**: Use `/prime` command for comprehensive context loading at session start (Prime v2.0)
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

## CRITICAL: Protected Branch Workflow

**GitHub main is protected** - You CANNOT push directly to main branch on GitHub.

**Key Constraint**: Local main and GitHub main are NOT synchronized automatically.

**Data Loss Prevention Pattern**:
1. ✅ Commit ALL changes to local main FIRST
2. ✅ Create feature branch FROM committed local main
3. ✅ Feature branch inherits all commits (nothing lost)
4. ✅ Push feature branch and create PR
5. ✅ PR merges to GitHub main (Codacy approval)
6. ✅ Pull from GitHub to sync local main

**NEVER**:
- ❌ Create feature branch from uncommitted changes (stash risks data loss)
- ❌ Make changes directly to local main without creating feature branch
- ❌ Attempt to push local main to GitHub (will fail)

**Why This Matters**: Any work committed to local main that isn't in a feature branch will be orphaned when you pull from GitHub main after PR merge. Always: commit to local main → branch → PR → merge → pull.

## Quality Gates (From CONSTITUTION.md)

- All code MUST pass Codacy quality checks
- All code MUST pass ESLint 9+ checks
- All markdown MUST pass Markdownlint
- All JavaScript functions MUST have complete JSDoc comments
- All testing done via Docker container (port 8989)
- Never run HTTP/HTTPS locally

---

# Section 3: Tool Usage & Specialized Agents

## Subagent Usage for Deep Dives

When you need detailed context beyond Prime v2.0 initialization, use specialized agents:

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

## Agent vs Direct Tool Decision Tree

```
Need architecture understanding? → codebase-navigator
Need historical context? → memento-oracle
Need Linear deep dive? → linear-librarian
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
docker-compose up -d    # Start container (port 8989 HTTPS)
docker-compose logs -f  # Follow container logs
```

**IMPORTANT**: Always test in Docker container (port 8989). Never run HTTP/HTTPS locally.

## Git Workflow Cheat Sheet

```bash
# Safe feature start
git checkout main && git pull
git add . && git commit -m "message"  # Commit to local main FIRST
git checkout -b feature/v1.0.XX-name
git push -u origin feature/v1.0.XX-name

# Create PR (via gh cli or web)
gh pr create --title "..." --body "..."

# After PR merge
git checkout main && git pull  # Sync with GitHub
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
6. **Quality check**: Docker test (port 8989), `npm run lint:all`
7. **Create PR** and merge to main
8. **Update Linear** status to Done

## Context Loading Strategy

**Session Start**: Run `/prime` for Prime v2.0 initialization
- Loads temporal/git context
- Launches 3 agents in parallel (Linear, Memento, Codebase)
- Returns ~56k token comprehensive context
- Leaves 20-25k tokens free for work

**During Work**: Just-in-time context loading
- Launch subagents when you need deep dives
- Read specific files when you know what you need
- Use Claude-Context search for code patterns
- Keep Linear updated for context preservation

---

## Development Philosophy

- **Keep It Simple**: Linear for tracking, natural conversation for planning
- **Quality First**: Maintain code standards without bureaucratic overhead
- **Research Thoroughly**: Use subagents and MCP tools when needed
- **Test Continuously**: Docker container on port 8989
- **Document in Code**: JSDoc comments and Linear comments for context
- **Trust Subagents**: They burn tokens so you don't have to

---

## Instance-Specific Guidance (Claude-Dev)

**Primary Responsibilities**:
- Feature development and bug fixes on Mac environment
- Managing private GitHub repository and branches
- Docker development testing (port 8989)
- Code quality and linting enforcement
- Creating Pull Requests for main branch

**When to Handoff**:
- Production deployment readiness → Claude-Prod (via Linear HEXP-XX issue)
- High-level planning needed → Claude Desktop (via Linear comment)
- Security hardening for Linux → Claude-Prod (via Linear HEXP-XX issue)
- Cross-platform compatibility issues → Claude-Prod (via Linear comment)

**Best Practices**:
- Always test in Docker container (port 8989)
- Run `npm run lint:all` before committing
- Document implementation details in Linear comments
- Use codebase-navigator for code discovery
- Create feature branches following naming convention: `feature/v1.0.XX-name`
- Launch memento-oracle when facing architectural decisions

---

**For detailed implementation examples, code patterns, and architecture deep dives**: Launch the appropriate subagent or check Linear DOCS-22 comments.

**Remember**: This file is a fallback. Linear DOCS-22 is the authoritative source.
