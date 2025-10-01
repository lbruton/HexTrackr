# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## HexTrackr Overview

HexTrackr is a vulnerability management system for tracking security vulnerabilities, tickets, and Known Exploited Vulnerabilities (KEV). The system uses a modular Node.js/Express backend with SQLite database and vanilla JavaScript frontend.

## Project Constitution

When working on this project the AI Agent SHALL follow the CONSTITUTION.md

## Documentation Hierarchy

This project uses a multi-layered documentation system with clear precedence:

1. **CONSTITUTION.md**: Authoritative requirements and mandates (MUST follow - constitutional law)
2. **CLAUDE.md**: Project guidance, architecture overview, and development patterns (HOW to work)
3. **prime.md**: Session initialization procedure (context loading at startup)
4. **Linear DOCS-*** issues**: Shared knowledge accessible across all Claude instances (cross-instance documentation)

**When in doubt**: CONSTITUTION.md takes precedence over all other documentation.

**Anti-Duplication Policy**: Tool usage requirements, code quality standards, and MCP integration details are defined once in CONSTITUTION.md. This document references the constitution rather than duplicating requirements.

## Multi-Claude Development Architecture

### Claude Instance Roles

HexTrackr development uses three distinct Claude instances with specific responsibilities:

1. **Claude (Desktop Mode)**
   - **Role**: Project Management & Planning
   - **Location**: Claude.ai web interface
   - **Responsibilities**:
     - High-level planning and architecture decisions
     - Linear issue creation and task delegation
     - Coordination between Claude-Dev and Claude-Prod
     - Strategic workflow design
   - **Tools**: Linear MCP, Memento, Web Search

2. **Claude-Dev (Claude Code CLI on Mac)**
   - **Role**: Primary Development
   - **Location**: Mac M4 Mini development machine
   - **Project Path**: `/Volumes/DATA/GitHub/HexTrackr/`
   - **Responsibilities**:
     - Active feature development and coding
     - Managing private GitHub repository
     - Docker development environment (port 8989)
     - Testing and quality assurance
   - **Works With**: Claude Desktop for task assignments

3. **Claude-Prod (Claude Code CLI on Ubuntu)**
   - **Role**: Production Management & Clean Releases
   - **Location**: Ubuntu 24.04 LTS server (192.168.1.80)
   - **Project Path**: `/home/lbruton/HexTrackr-Dev/`
   - **Responsibilities**:
     - Security fixes and hardening
     - Linux-specific implementation and porting from Mac
     - Test production environment before actual deployment
     - Docker management and deployment optimization
     - Production server management
     - Neo4j database administration
     - Clean public GitHub releases
     - Final cleanup and production readiness
   - **Works With**: Claude Desktop for coordination

### Linear Teams Structure

- **HexTrackr-Dev Team** (HEX-XX): General development issues (Claude-Dev primary focus)
- **HexTrackr-Prod Team** (HEXP-XX): Production-specific tasks (Claude-Prod primary focus)
- **HexTrackr-Docs Team** (DOCS-XX): Shared project documentation accessible by all instances

### Workflow Integration

- **Task Flow**: Claude Desktop creates Linear issues → Delegates to Claude-Dev for implementation → Claude-Prod handles production deployment
- **Shared Resources**:
  - Linear teams (HexTrackr-Dev, HexTrackr-Prod, HexTrackr-Docs)
  - Memento knowledge graph (Neo4j Enterprise 5.13 at 192.168.1.80)
  - Claude-context codebase indexing (shared across all instances)
  - HexTrackr-Docs team as shared knowledge repository
- **Communication**: Reference instances by name ("Claude", "Claude-Dev", "Claude-Prod") for clarity

### Communication Patterns

- **Prime Boot Sequence**: Each instance loads context via Memento and Linear at session start
- **Save/Recall Commands**: Use Memento to persist and retrieve session context
- **Handoffs Between Instances**:
  - Document decisions and context in Linear issues
  - Use Linear comments for implementation details
  - Tag relevant instance in Linear when handing off
- **Linear as Communication Hub**: All inter-instance communication flows through Linear issues and comments
- **Instance Naming**: Always specify which Claude instance when referencing work or decisions

## Instance-Specific Guidelines

### For Claude-Dev (This Instance)
**Primary Responsibilities**:
- Feature development and bug fixes on Mac environment
- Managing private GitHub repository and branches
- Docker development testing (port 8989)
- Code quality and linting enforcement
- Creating Pull Requests for main branch

**When to Handoff**:
- Production deployment readiness → Claude-Prod
- High-level planning needed → Claude Desktop
- Security hardening for Linux → Claude-Prod
- Cross-platform compatibility issues → Claude-Prod

**Best Practices**:
- Always test in Docker container (port 8989)
- Run `npm run lint:all` before committing
- Document implementation details in Linear comments
- Use Claude-Context MCP for code searches
- Create feature branches following naming convention

## Development Workflow (SIMPLIFIED)

### Linear-Only Workflow
HexTrackr uses a simplified workflow with Linear as the primary source of truth:

1. **Work Assignment**: User describes what needs to be done
2. **Linear Issue**: Create/update Linear issue with task breakdown
3. **Implementation**: Execute work with progress updates in Linear comments
4. **Completion**: Update Linear status and commit changes

### Key Principles
- **Structured Initialization**: Use `/prime` command for comprehensive context loading at session start
- **Casual Development**: Natural conversation flow after initialization completes
- **Linear-Centric**: All planning, research, and progress tracking in Linear issues
- **Quality Focus**: Maintain code quality standards without bureaucratic overhead
- **No Session Plans**: Eliminate per-session markdown planning files (infrastructure command files like prime.md are acceptable)

### Linear Issue Format
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

## Essential Commands

### Development
```bash
npm start          # Start production server on port 8080
npm run dev        # Start development server with nodemon on port 8080
npm run init-db    # Initialize database schema
```

### Testing & Quality
```bash
npm run lint:all     # Run all linters (markdown, eslint, stylelint)
npm run fix:all      # Auto-fix all linting issues
npm run eslint       # Run ESLint on all JS files
npm run eslint:fix   # Auto-fix ESLint issues
npm run stylelint    # Run Stylelint on all CSS files
npm run stylelint:fix # Auto-fix CSS issues
npm run lint:md      # Run Markdownlint
npm run lint:md:fix  # Auto-fix markdown issues
```

### Documentation
```bash
npm run docs:dev     # Generate JSDoc documentation
npm run docs:all     # Generate all documentation (JSDoc + HTML)
npm run docs:generate # Update HTML documentation
```

### Docker Development
- **IMPORTANT**: Always use Docker container for testing (port 8989)
- Never run HTTP/HTTPS locally - always use the Docker container
- Docker setup: `docker-compose up -d` (configuration in root)

## Architecture Overview

### Backend Structure
```
app/
├── controllers/     # Route controllers (vulnerabilityController.js, ticketController.js, etc.)
├── routes/         # Express route definitions
├── services/       # Business logic services
│   ├── databaseService.js           # SQLite database operations
│   ├── vulnerabilityService.js      # Vulnerability CRUD operations
│   ├── vulnerabilityStatsService.js # Statistics and aggregations
│   ├── ticketService.js            # Ticket management
│   ├── importService.js            # CSV/JSON import handling
│   ├── backupService.js            # Backup/restore operations
│   ├── kevService.js               # CISA KEV integration (v1.0.22+)
│   ├── progressService.js          # WebSocket progress tracking
│   ├── fileService.js              # File system operations
│   ├── validationService.js        # Input validation and sanitization
│   ├── docsService.js              # Documentation statistics
│   └── templateService.js          # Template management
├── middleware/     # Express middleware
├── utils/          # Utility functions (ProgressTracker.js)
└── public/
    ├── server.js   # Main Express server (entry point)
    └── data/       # SQLite database location (hextrackr.db)
```

### Frontend Structure
```
app/public/
├── index.html              # Landing page
├── vulnerabilities.html    # Vulnerability management
├── tickets.html           # Ticket management
├── kev.html              # KEV dashboard
├── scripts/
│   ├── shared/           # Shared components
│   │   ├── settings-modal.js  # Unified settings modal
│   │   └── progress-modal.js  # Import progress tracking
│   └── pages/            # Page-specific JavaScript
│       ├── tickets.js
│       └── vulnerabilities.js
└── styles/
    ├── shared/           # Shared CSS modules
    └── pages/            # Page-specific styles
```

### Key Design Patterns

1. **Modular JavaScript Architecture**: Shared components in `scripts/shared/` are reused across pages. Page-specific code registers callbacks via `window` object.

2. **Service Layer Pattern**: Business logic is separated into service modules that handle database operations, external API calls, and data processing.

3. **WebSocket Progress Tracking**: Import operations use Socket.io for real-time progress updates. The `ProgressTracker` utility manages WebSocket communications.

4. **Transaction Management**: Database operations use SQLite transactions for data integrity. Pattern: `beginTransaction()` → operations → `commit()`/`rollback()`.

5. **Error Handling**: Comprehensive error handling with specific error types and user-friendly messages. All API endpoints return structured error responses.

## Database Schema

### Core Tables
- **vulnerabilities**: Legacy table for compatibility (being phased out)
- **vulnerabilities_current**: Active vulnerabilities with lifecycle tracking
- **vulnerability_snapshots**: Historical vulnerability data for trends
- **vulnerability_daily_totals**: Aggregated metrics by scan date
- **tickets**: Support ticket management linked to vulnerabilities
- **ticket_vulnerabilities**: Junction table for ticket-vulnerability relationships
- **templates**: Reusable templates for vulnerability responses
- **kev_catalog**: CISA Known Exploited Vulnerabilities catalog
- **vulnerability_imports**: Import metadata and tracking
- **import_summaries**: Detailed import operation results

### Rollover Architecture
The system uses a sophisticated rollover pipeline:
- Snapshots capture point-in-time vulnerability states
- Current table maintains only active vulnerabilities
- Daily totals provide pre-aggregated metrics for performance
- Lifecycle states: active, resolved, reopened

## API Endpoints

### Vulnerabilities
- `GET /api/vulnerabilities/stats` - Statistics with VPR totals
- `GET /api/vulnerabilities/recent-trends` - Dashboard trend cards
- `GET /api/vulnerabilities/trends` - Historical trending data
- `GET /api/vulnerabilities` - List with pagination/filters
- `POST /api/vulnerabilities` - Create vulnerability
- `PUT /api/vulnerabilities/:id` - Update vulnerability
- `DELETE /api/vulnerabilities/:id` - Delete specific vulnerability
- `POST /api/vulnerabilities/import` - Standard CSV import
- `POST /api/vulnerabilities/import-staging` - Staged import for large files (>10K rows)
- `DELETE /api/vulnerabilities/clear` - Clear all vulnerability data

### Tickets
- `GET /api/tickets` - List all tickets
- `GET /api/tickets/:id` - Get specific ticket
- `POST /api/tickets` - Create new ticket
- `PUT /api/tickets/:id` - Update ticket
- `PUT /api/tickets/:id/devices` - Update associated devices
- `DELETE /api/tickets/:id` - Delete ticket
- `POST /api/tickets/migrate` - Migrate legacy tickets

### KEV
- `GET /api/kev` - Fetch KEV catalog
- `POST /api/kev/sync` - Manual KEV synchronization
- `GET /api/kev/status` - Sync status and statistics
- `GET /api/kev/vulnerability/:cveId` - KEV details for specific CVE

### Backup/Restore
- `POST /api/backup/create` - Create new backup
- `GET /api/backup/list` - List available backups
- `POST /api/backup/restore` - Restore from backup
- `DELETE /api/backup/:filename` - Delete backup file
- `GET /api/backup/stats` - Backup statistics

## Critical Development Requirements

### From CONSTITUTION.md

1. **Context Management**:
   - Use Claude-Context MCP for codebase searching (high-performance semantic search with 2200+ chunks)
   - Use Memento MCP for project knowledge graph (semantic search preferred)
     - **Primary Source**: Linear DOCS-14 for Memento taxonomy and conventions
     - **Fallback**: `/TAXONOMY.md` if Linear is unavailable
   - Context7 for framework documentation verification

2. **Quality Standards**:
   - All code MUST pass Codacy quality checks
   - All code MUST pass ESLint 9+ checks
   - All markdown MUST pass Markdownlint
   - All JavaScript functions MUST have complete JSDoc comments

3. **Documentation Requirements**:
   - JSDoc comments required for ALL functions in `/app/` directory
   - Documentation regenerated after every feature completion
   - Technical docs in `app/dev-docs-html/`
   - Public docs in `app/public/docs-source/` (markdown) and `app/public/docs-html/` (HTML)

4. **Branch Management**:
   - Development work branches from 'main' (NOT copilot)
   - Main branch is protected with Codacy checks
   - Feature branches: `feature/v1.0.XX-feature-name`
   - Bug fix branches: `fix/v1.0.XX-bug-name`
   - All changes to main require Pull Requests

### CRITICAL: Protected Branch Workflow

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

5. **Testing Requirements**:
   - Playwright testing before/after UI changes
   - All testing done via Docker container (port 8989)
   - Never run HTTP/HTTPS locally

## Security Considerations

- API endpoints use rate limiting (configurable in `config/middleware.js`)
- Input validation on all user inputs via `validationService.js`
- SQL injection prevention via parameterized queries
- XSS prevention through DOMPurify sanitization
- CORS configuration for cross-origin requests
- Environment variables for sensitive configuration (`.env` file)
- Path traversal protection in `fileService.js`

## Import/Export Features

- **CSV Import**: Supports vulnerability data with progress tracking
- **JSON Import**: Structured vulnerability data import
- **Staging Import**: For large files (>10,000 rows) using staging tables
- **Export Formats**: CSV, JSON, PDF, HTML
- **Progress Tracking**: Real-time WebSocket updates during import operations
- **Import Summaries**: Detailed reports saved for each import operation
- **Smart Date Extraction**: Automatic scan date detection from filenames
- **Multi-vendor Support**: Tenable, Cisco, Qualys, and more

## Performance Targets

- Response time: <2s for all API endpoints
- Import processing: ~1000 records/minute (standard), ~10,000 records/minute (staging)
- Database queries optimized with indexes on frequently filtered columns
- Compression enabled for all responses
- Static file caching configured
- Staging tables for atomic imports
- Pre-aggregated daily totals for dashboard performance

## Common Development Tasks

### Starting a New Feature (SIMPLIFIED WORKFLOW)
1. **Discuss with User**: Understand what needs to be built/fixed
2. **Create/Update Linear Issue**: Brief description with task breakdown in comments
3. **Create Branch**:
   ```bash
   git checkout main && git pull
   git checkout -b feature/v1.0.XX-feature-name
   ```
4. **Implement**: Work naturally with progress updates in Linear comments
5. **Quality Check**: Test in Docker (port 8989), run `npm run lint:all`
6. **Complete**: Update Linear status, create PR, merge to main

### Adding a New API Endpoint
1. Create controller in `app/controllers/`
2. Define routes in `app/routes/`
3. Implement service logic in `app/services/`
4. Add JSDoc documentation
5. Test via Docker container

### Modifying Database Schema
1. Update schema in `app/public/scripts/init-database.js`
2. Add ALTER statements in `databaseService._initializeSchema()`
3. Run `npm run init-db` to apply changes
4. Update relevant services and controllers
5. Test data migrations if needed

### Adding Frontend Features
1. Create/modify files in `app/public/scripts/`
2. Follow modular JavaScript pattern
3. Add shared components to `scripts/shared/`
4. Register page-specific callbacks via `window` object:
   - `window.refreshPageData(type)` - Refresh data after operations
   - `window.showToast(message, type)` - Display notifications
5. Test in Docker container on port 8989

## Linear Integration & Progress Tracking

### Simple Progress Pattern
1. **Work Updates**: Add comments to Linear issues as work progresses
2. **Status Changes**: Update Linear status (Todo → In Progress → Done)
3. **Context Preservation**: Use Linear comments for research findings and decisions
4. **Handoff Ready**: All context lives in Linear - no separate files to maintain

### Linear MCP Integration

**For Requirements**: See CONSTITUTION.md Article II Section VII

The project uses Linear MCP tools for issue tracking:
- `mcp__linear__create_issue`: Create new tickets
- `mcp__linear__update_issue`: Update status and details
- `mcp__linear__list_issues`: Find and list existing issues
- `mcp__linear__get_issue`: Get full issue details
- `mcp__linear__create_comment`: Add progress updates and comments

### Linear Issue Creation Guidelines

When creating Linear issues, please follow these practices for better organization:

1. **Project Assignment**: Always assign issues to the "HexTrackr" team/project
   - This ensures all work is properly tracked within the project scope
   - For future non-HexTrackr work, update this guidance accordingly

2. **Label Usage**: Apply at least one type label to every issue

   **Team-Specific Labels** (HexTrackr-Dev team):
   - **Security** (red): Security vulnerabilities, Codacy issues, crypto improvements
   - **Enhancement** (purple): UI polish, UX improvements, non-critical enhancements

   **Workspace-Inherited Labels**:
   - **Bug**: Defects, errors, or unexpected behavior
   - **Feature**: New functionality or major capabilities
   - **Improvement**: Enhancements to existing functionality (similar to Enhancement)

3. **Priority Labels**: Consider adding priority when relevant
   - High: Critical issues blocking work or affecting users
   - Medium: Important but not blocking
   - Low: Nice-to-have improvements

4. **Issue Title Format**: Continue using `v1.0.XX: [Description]` format
   - Helps track which version includes the change
   - Makes changelog generation easier

**Note**: This is guidance, not constitutional law. Adapt as needed for different projects or contexts, but maintaining consistent project assignment and labeling helps with issue discovery and tracking.

### Issue Templates

**Template Repository**: HEX-62 contains our evolving issue templates as Linear comments:
- Universal Metadata Template
- Security Issue Template
- Feature Request Template
- Bug Report Template
- Enhancement Template

To use templates:
1. Copy from HEX-62 comments (preserves Linear formatting)
2. Paste into new issue description
3. Fill in placeholders

To update templates:
- Add new comment to HEX-62 with revised version
- Previous versions remain in comment history for reference
- Once patterns solidify, templates can be promoted to Linear UI

## Claude-Context Code Search

HexTrackr uses Claude-Context MCP for high-performance semantic code search across the codebase with intelligent chunking and natural language query support.

**For Requirements**: See CONSTITUTION.md Article II Section VIII
**For Execution**: See prime.md Phase 5 for index refresh and search patterns
**Current Status**: 131 files, 2250 chunks indexed at session start
**Primary Use**: All code searches during development (semantic search with natural language queries)

## Memento Knowledge Graph

HexTrackr uses Memento MCP as the primary knowledge graph for persistent project memory and cross-instance context sharing.

**Taxonomy Source**: Linear DOCS-14 (Memento Knowledge Graph Taxonomy & Conventions v1.1.0)
**Fallback**: `/TAXONOMY.md` if Linear unavailable
**For Requirements**: See CONSTITUTION.md Article II Section I
**Backend**: Neo4j Enterprise 5.13 at 192.168.1.80
**Shared Access**: All Claude instances (Desktop, Dev, Prod) share the same knowledge graph

## Environment Configuration

Required `.env` variables:
```
PORT=8080
NODE_ENV=development|production
DB_PATH=./app/public/data/hextrackr.db
```

See `.env.example` for complete configuration options.

## Service Layer Details

### Core Services
- **databaseService**: Connection pooling, transactions, schema management
- **vulnerabilityService**: CRUD operations for vulnerabilities
- **vulnerabilityStatsService**: Analytics, trends, VPR calculations
- **ticketService**: Ticket lifecycle, device management
- **importService**: CSV parsing, staging, lifecycle management
- **backupService**: Database export/import, compression
- **kevService**: CISA KEV sync, CVE matching
- **progressService**: Real-time operation tracking
- **fileService**: Secure file operations, upload handling
- **validationService**: Input sanitization, type checking
- **docsService**: Documentation statistics and coverage

## Additional Notes

### Development Philosophy
- **Keep It Simple**: Linear for tracking, natural conversation for planning
- **Quality First**: Maintain code standards without bureaucratic overhead
- **Research Thoroughly**: Use Claude-Context and Context7 when needed
- **Test Continuously**: Docker container on port 8989
- **Document in Code**: JSDoc comments and Linear comments for context

### Technical Architecture
- The system follows a migration from monolithic to modular architecture
- Controllers use singleton pattern for consistency
- Services use functional exports for stateless operations
- WebSocket rooms are used for targeted progress updates
- Database uses WAL mode for concurrent access
- Frontend uses vanilla JavaScript (no framework dependencies)
- Bootstrap 5 and Tabler.io for UI components
- Code search uses Claude-Context MCP for high-performance semantic search
- HexTrackr uses protected branch workflows with Codacy integration. The main branch cannot accept direct pushes - all changes must go
through Pull Requests that pass Codacy's quality gates. This enforces code quality standards (complexity, duplication, security issues) and prevents technical debt accumulation.
- 1. The Problem Pattern: Container appears healthy but returns "Empty reply from server"
  2. The Root Cause: Protocol mismatch (testing HTTP when container serves HTTPS)
  3. The Solution: Use curl -k https://localhost:[PORT] for local HTTPS testing
  4. The Broader Application: Applies to any Dockerized service with SSL/TLS