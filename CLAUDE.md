# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## HexTrackr Overview

HexTrackr is a vulnerability management system for tracking security vulnerabilities, tickets, and Known Exploited Vulnerabilities (KEV). The system uses a modular Node.js/Express backend with SQLite database and vanilla JavaScript frontend.

## Project Constitution

When working on this project the AI Agent SHALL follow the CONSTITUTION.md

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

- **HexTrackr Team**: General development issues (Claude-Dev primary focus)
- **HexTrackr-Prod Team**: Production-specific tasks (Claude-Prod primary focus)
- **Documentation Team**: Shared project documentation (DOCS- prefix) accessible by all instances

### Workflow Integration

- **Task Flow**: Claude Desktop creates Linear issues → Delegates to Claude-Dev for implementation → Claude-Prod handles production deployment
- **Shared Resources**:
  - Linear teams (HexTrackr, HexTrackr-Prod, Documentation)
  - Memento knowledge graph (Neo4j Enterprise 5.13 at 192.168.1.80)
  - Claude-context codebase indexing (shared across all instances)
  - Documentation team as shared knowledge repository
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

### For Claude Desktop
**Primary Responsibilities**:
- Strategic planning and architecture decisions
- Linear issue creation and prioritization
- Task delegation to Dev/Prod instances
- Cross-instance coordination
- High-level workflow design

**When to Engage Other Instances**:
- Implementation ready → Claude-Dev
- Production deployment → Claude-Prod
- Technical research needed → Claude-Dev or Claude-Prod

**Best Practices**:
- Create comprehensive Linear issues with clear requirements
- Use Documentation team for shared knowledge
- Maintain project roadmap and priorities
- Coordinate releases between Dev and Prod

### For Claude-Prod
**Primary Responsibilities**:
- Production environment management on Ubuntu
- Security hardening and Linux-specific fixes
- Test production deployment before going live
- Docker optimization for production
- Clean public releases to GitHub

**When to Handoff**:
- Development bugs found → Claude-Dev
- Architecture decisions needed → Claude Desktop
- Feature requests from production → Claude Desktop

**Best Practices**:
- Focus on HexTrackr-Prod team issues
- Test thoroughly in production-like environment
- Document Linux-specific solutions
- Maintain production security standards
- Coordinate with Claude-Dev for compatibility

## Development Workflow (SIMPLIFIED)

### Linear-Only Workflow
HexTrackr uses a simplified workflow with Linear as the single source of truth:

1. **Work Assignment**: User describes what needs to be done
2. **Linear Issue**: Create/update Linear issue with task breakdown
3. **Implementation**: Execute work with progress updates in Linear comments
4. **Completion**: Update Linear status and commit changes

### Key Principles
- **Casual Approach**: Natural conversation flow, no rigid modes
- **Linear-Centric**: All planning, research, and progress tracking in Linear
- **Quality Focus**: Maintain code quality standards without bureaucracy
- **No Dual Tracking**: Eliminate markdown planning files

### Linear Issue Format
```
Title: v1.0.XX: [Feature/Bug Name]
Team: [HexTrackr|HexTrackr-Prod|Documentation]
Status: Backlog → Todo → In Progress → In Review → Done
Labels: [Type: Bug/Feature/Enhancement] + [Priority: High/Medium/Low]
```

**Team Selection Guidelines**:
- **HexTrackr**: Development features, bug fixes, general enhancements
- **HexTrackr-Prod**: Production deployment, security hardening, Linux-specific issues
- **Documentation**: Shared knowledge, architecture decisions, cross-instance documentation

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
     - **Fallback**: `/memento/TAXONOMY.md` if Linear is unavailable
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
The project uses Linear MCP tools for issue tracking:
- `linear_create_issue`: Create new tickets
- `linear_update_issue`: Update status and details
- `linear_search_issues`: Find existing issues
- `linear_add_comment`: Add progress updates

### Linear Issue Creation Guidelines

When creating Linear issues, please follow these practices for better organization:

1. **Project Assignment**: Always assign issues to the "HexTrackr" team/project
   - This ensures all work is properly tracked within the project scope
   - For future non-HexTrackr work, update this guidance accordingly

2. **Label Usage**: Apply at least one type label to every issue

   **Team-Specific Labels** (HexTrackr team):
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

### Overview
Claude-Context MCP provides high-performance semantic code search across the HexTrackr codebase with intelligent chunking and natural language query support.

### Key Features
- **Automatic Indexing**: 130+ files, 2200+ semantic chunks
- **Natural Language Queries**: Search with concepts, not just keywords
- **Ranked Results**: Returns most relevant code snippets first
- **File Location Tracking**: Exact file paths and line numbers
- **Multi-format Support**: JavaScript, HTML, CSS, Markdown, JSON

### Best Practices for Claude-Context

#### 1. Index Management
```bash
# Check index status at session start
mcp__claude-context__get_indexing_status("/Volumes/DATA/GitHub/HexTrackr")

# Re-index if needed (force=true for refresh)
mcp__claude-context__index_codebase({
  path: "/Volumes/DATA/GitHub/HexTrackr",
  force: false
})
```

#### 2. Effective Search Patterns

#### Architecture & Initialization
- Query: "Express server initialization middleware routes controllers"
- Finds: Server setup, route configuration, controller initialization

#### Security Patterns
- Query: "XSS SQL injection CORS sanitize validate"
- Finds: Security middleware, validation functions, sanitization code

#### Documentation & TODOs
- Query: "TODO FIXME BUG HACK"
- Finds: Technical debt, known issues, temporary workarounds

#### JSDoc Patterns
- Query: "@param @returns @description @module"
- Finds: Well-documented functions with complete JSDoc

#### Feature Implementation
- Query: "CSV import WebSocket progress staging"
- Finds: Import pipeline, progress tracking, staging table logic

#### 3. Search Tips
- Use conceptual terms for semantic matching
- Combine related keywords for focused results
- Default limit is 10 results; adjust as needed
- Extension filter available but rarely needed
- Results include surrounding context for better understanding

### Claude-Context vs Other Search Tools

| Feature | Claude-Context | Grep/Glob | Code-Indexer-Ollama |
|---------|---------------|-----------|---------------------|
| Semantic Search | ✅ Excellent | ❌ No | ✅ Good |
| Speed | ✅ Fast | ✅ Very Fast | ⚠️ Slower |
| Natural Language | ✅ Yes | ❌ No | ✅ Yes |
| Context Snippets | ✅ Yes | ⚠️ Limited | ✅ Yes |
| Line Numbers | ✅ Exact | ✅ Yes | ✅ Yes |
| Ranking | ✅ Intelligent | ❌ No | ✅ Good |
| Index Required | ✅ Yes | ❌ No | ✅ Yes |

### When to Use Claude-Context
- **Primary Use**: All code searches during development
- **Best For**: Finding implementations, patterns, TODOs, documentation
- **Limitations**: Requires indexing; not for simple file existence checks

## Memento Knowledge Graph

### Taxonomy Source of Truth
- **Primary Reference**: Linear DOCS-14 - Memento Knowledge Graph Taxonomy & Conventions v1.1.0
- **Fallback**: `/memento/TAXONOMY.md` (local file if Linear unavailable)

### Key Memento Updates (2025-09-27)
- Tags are added using `mcp__memento__add_observations` with "TAG: " prefix
- No separate add_tags function exists
- Neo4j Enterprise 5.13 backend at 192.168.1.80
- All entity naming follows PROJECT:DOMAIN:TYPE pattern
- Required observations: TIMESTAMP, ABSTRACT, SUMMARY, ID (in that order)
- Never use `read_graph` for large graphs - always use search functions

### Quick Reference
```javascript
// Create entity
mcp__memento__create_entities([{
  name: "Session: PROJECT-TOPIC-YYYYMMDD-HHMMSS",
  entityType: "PROJECT:DOMAIN:TYPE",
  observations: [/* required observations */]
}])

// Add tags (using add_observations)
mcp__memento__add_observations({
  observations: [{
    entityName: "Session: ...",
    contents: ["TAG: project:name", "TAG: category", ...]
  }]
})

// Search (preferred)
mcp__memento__search_nodes({ query: "search terms" })
```

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