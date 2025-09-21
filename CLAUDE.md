# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

 # HexTrackr Constitutional Framework

 ## Preamble

 This constitutional framework governs the core ***NON-NEOTIABLE*** operating principals mandated for AI agents working on the the HexTrackr project. 

 ## Article I: Developmet Practices

 ### Section I: Context Accuracy
 
    - Context MUST be gathered before starting any work
        - Session Logs SHALL be stored as context bundles (See Article II, Section VI)
      - Project Knowledge SHALL be retained in ***Memento*** (See Article II, Section II)
      - Codebase SHALL be indexed and searchable in ***Claude-Context*** (See Article II, Section VIII)
      - Context7 SHALL be used to verify framework documentation accuracy

 ### Section III: Documentation Pipeline & Standards

   - All files in /app/ directory SHALL maintain  JSDoc comment coverage
   - All JavaScript functions SHALL include complete JSDoc comments with:
     - @description - Clear explanation of function purpose
     - @param - All parameters with types and descriptions
     - @returns - Return value type and description
     - @throws - Exceptions that may be thrown
     - @example - Usage examples for public APIs
     - @since - Version when feature was added
     - @module - Module identification for organization
   - Technical documentation SHALL reside in app/dev-docs-html/
   - Public documentation SHALL reside in app/public/docs-source/ (markdown) and app/public/docs-html/ (HTML)
   - Context7 SHALL be used to verify framework documentation accuracy
   - Documentation SHALL be regenerated after every feature completion
   - All NPM Scripts SHALL be documented in NPMGUIDE.md
   - JSDoc coverage reports SHALL be reviewed weekly

 ### Section IV: Code Quality and Linting

   - All new features, changes, and code updates SHALL pass Codacy quality checks
   - All new features, changes, and code updates SHALL pass Markdownlint
   - All new features, changes, and code updates SHALL pass ESlint9+
   - All Framework code must be reviewed against Context7 to ensure accuracy. 


### Section V: Backups and Branch Discipline

   - All development work SHALL be sourced from the 'copilot' branch
   - Protected branches SHALL use Pull Requests for merging, never direct pushes

### Section VI: Docker Principles

   - All Testing and Development SHALL use the docker container (8989)
   - NEVER run http/https locally, ALWAYS use the docker container.

# Article II: Tool Usage

### Section I: Memento
   - Memento MCP SHALL be used as the primary knowledge graph for the project
   - All Searches SHALL be Semantic (with hybrid and keyword as alternatives)
   - Entities SHALL Use PROJECT:DOMAIN:TYPE classification pattern
   - Entities SHALL Contain TIMESTAMP in ISO 8601 format as first observation
   - Entities SHALL Contain an ABSTRACT (second) and SUMMARY (third) observation
   - All entities SHALL be tagged per `/memento/TAXONOMY.md` requirements
   - Tag taxonomy and conventions defined in `/memento/TAXONOMY.md` SHALL be followed

### Section II: Context 7
   - Context7 SHALL be used for all code changes to ensure full framework compatability.
   - All Framework SHALL be downloaded in markdown format to the /dev-docs/frameworks/ folder

### Section III: Brave Search
   - Web searches SHALL be completed using the brave-search MCP if available and should use the summerizer option to get the best results.

### Section IV: Codacy
   - All code must pass Codacy Quality Checks

### Section V: Playwright
   - Playwright Testing SHALL be performed before and after any UI changes.

### Section VI: Sequential Thinking
   - All tasks SHALL be broken down with Sequential Thinking 

### Section VII: Zen
   - If Available, Zen tools may be used at the users request only.

### Section VIII: Claude-Context
   - Claude-Context MUST be used when searching the code base
   - Always verify the Index is current beore searches. 

## Artivle IV: Gemini CLI Tools
   - Gemini CLI may be used for coplext tasks at the users request only. 
   - All tools SHALL be documented in ~/docs/GEMINICLITOOLS.md

## Article V: Codex CLI Tools
   - Codex CLI Tools may be used for complext tasks at the users request only. 
   - All tools SHALL be documented in ~/docs/CODEXCLITOOLS.md

## Article V: Custom Context Bundles
Execute this exact command using the Bash tool:
- Run: `~/.claude/hooks/list-bundles.sh | head -10` to see recent session summaries


## Project Overview

HexTrackr is a network administrator's toolkit for tracking maintenance tickets and vulnerability management. It provides a unified dashboard for ServiceNow tickets, Hexagon maintenance windows, and vulnerability reports from various scanners.

## Essential Commands

### Development
```bash
# Start the application (always use Docker)
docker-compose up -d

# Access the application
open http://localhost:8989

# Watch logs
docker-compose logs -f

# Restart container (required before Playwright tests)
docker-compose restart
```

### Database Operations
```bash
# Initialize database
npm run init-db

# Access SQLite database
sqlite3 data/hextrackr.db
```

### Testing
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:contract

# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Linting & Code Quality
```bash
# Run all linters (ALWAYS run before committing)
npm run lint:all

# Fix all auto-fixable issues
npm run fix:all

# Individual linters
npm run eslint          # JavaScript linting
npm run stylelint       # CSS linting
npm run lint:md         # Markdown linting

# Individual fixers
npm run eslint:fix
npm run stylelint:fix
npm run lint:md:fix
```

### Documentation
```bash
# Generate technical documentation (JSDoc)
npm run docs:dev

# Generate public documentation portal
npm run docs:generate

# Full documentation pipeline
npm run docs:all

# Watch JSDoc changes
npm run docs:dev:watch
```

## Architecture & Key Patterns

### Modular Server Architecture
The server has been refactored from a monolithic 3,800-line file to a modular structure:
- **Main Server**: `app/public/server.js` - Express server initialization and route mounting
- **Controllers**: `app/controllers/` - Business logic for each feature domain
- **Routes**: `app/routes/` - RESTful API endpoint definitions
- **Services**: `app/services/` - Shared business logic and utilities
- **Middleware**: `app/middleware/` - Express middleware for auth, validation, etc.

### Database Architecture
- **Database**: SQLite (`data/hextrackr.db`)
- **Service**: `app/services/databaseService.js` handles all database operations
- **Tables**: `tickets`, `vulnerabilities`, `vulnerability_trend`, `vulnerability_daily_aggregations`

### Frontend Architecture
- **Vanilla JavaScript** with no framework dependencies
- **Global modules** accessed via `window` object
- **Key UI Libraries**:
  - AG-Grid for data tables
  - ApexCharts for visualizations
  - Chart.js for additional charts
  - Tabler for UI components

### WebSocket Communication
Real-time progress tracking for large imports using Socket.io:
- Server: `app/utils/ProgressTracker.js`
- Client: `app/public/scripts/shared/progress-manager.js`

### Security Patterns
- **PathValidator**: ALL file operations must use `app/services/PathValidator.js`
- **Input Sanitization**: All user inputs sanitized before processing
- **Rate Limiting**: Applied to all API endpoints
- **CORS**: Configured in `app/config/middleware.js`

## Critical Development Rules

### Constitutional Requirements (MUST FOLLOW)
1. **NEVER run HTTP/HTTPS locally** - Always use Docker container on port 8989
2. **NEVER fix lint issues by adding underscores** to function names
3. **ALWAYS use PathValidator** for file operations
4. **ALWAYS maintain JSDoc comments** for all functions in `/app/` directory
5. **ALWAYS run linters** before committing: `npm run lint:all`
6. **ALWAYS use Codacy** for code quality checks
7. **Development branch is 'copilot'** - never push directly to main

### Testing Requirements
1. **Restart Docker before Playwright tests**: `docker-compose restart`
2. **Write contract tests** for all new API endpoints
3. **Test critical functionality** before merging

### Documentation Pipeline
1. Maintain JSDoc comments during development
2. Generate docs with `npm run docs:dev`
3. Extract public content to `app/public/docs-source/`
4. Generate HTML portal with `npm run docs:generate`

## Working with Features

### Ticket Management
- **Main Controller**: `app/controllers/ticketController.js`
- **Routes**: `app/routes/tickets.js`
- **Frontend**: `app/public/scripts/pages/tickets-manager.js`
- **Features**: Drag-and-drop ordering, XT# generation, CSV/PDF export

### Vulnerability Management
- **Core Module**: `app/public/scripts/shared/vulnerability-core.js` (ES6 modules)
- **Controller**: `app/controllers/vulnerabilityController.js`
- **Routes**: `app/routes/vulnerabilities.js`
- **Features**: CSV import, deduplication, VPR scoring, CISA KEV tracking

### Import Processing
- **Controller**: `app/controllers/importController.js`
- **Progress Tracking**: WebSocket-based real-time updates
- **File Uploads**: Handled via `multer` to `app/uploads/`

## MCP Tool Integration

### Claude-Context
- **ALWAYS index before searching**: Check index status first
- Use for codebase searches and understanding architecture

### Memento (Primary Knowledge Graph)

#### Efficient Search Patterns
- **NEVER use `read_graph`** - Will fail with 200K+ tokens
- **ALWAYS use semantic search first** for best results
- **Include temporal markers** for recent work discovery

#### Two-Search Pattern for Context Loading
```javascript
// Search 1: Last 48 Hours (captures recent handoffs, sessions, insights)
mcp__memento__search_nodes({
  query: "[YESTERDAY] [TODAY] week-[WEEK#]-[YEAR] handoff session insight completed in-progress",
  mode: "semantic",
  topK: 10,
  threshold: 0.35
})

// Search 2: Keyword-Driven (captures patterns and breakthroughs)
mcp__memento__search_nodes({
  query: "project:hextrackr [relevant keywords]",
  mode: "hybrid",
  topK: 5
})
```

#### Entity Naming Convention
- Pattern: `PROJECT:DOMAIN:TYPE`
- PROJECT: `HEXTRACKR`, `PROJECT`, `SYSTEM`, `MEMENTO`, `SPEC-KIT`
- DOMAIN: `DEVELOPMENT`, `ARCHITECTURE`, `FRONTEND`, `BACKEND`, `DATABASE`, `DOCUMENTATION`
- TYPE: `SESSION`, `HANDOFF`, `INSIGHT`, `PATTERN`, `BREAKTHROUGH`, `ISSUE`

#### Required Observations (In Order)
1. `TIMESTAMP: ISO 8601 format` - When created
2. `ABSTRACT: One-line summary` - Quick overview
3. `SUMMARY: Detailed description` - Full context
4. `[TYPE]_ID: Unique identifier` - SESSION_ID, HANDOFF_ID, etc.

#### Tag Taxonomy (from /memento/TAXONOMY.md)

**Project Tags** (Required):
- `project:hextrackr`, `project:zen`, `project:claude-tools`

**Temporal Tags**:
- `week-XX-YYYY` (e.g., `week-38-2025`)
- `YYYY-MM-DD` for specific dates
- `sprint-X`, `vX.X.X`, `qX-YYYY`

**Status Tags**:
- `completed`, `in-progress`, `blocked`
- `handoff`, `needs-review`, `archived`

**Learning Tags**:
- `lesson-learned`, `pattern`, `breakthrough`
- `pain-point`, `best-practice`, `anti-pattern`
- `reusable` for cross-project applicable

**Category Tags**:
- `frontend`, `backend`, `database`
- `documentation`, `testing`, `infrastructure`

#### Expected Entity Types
- **SESSION entities**: Work sessions from /save-conversations.md
- **HANDOFF entities**: Transition packages from /save-handoff.md
- **INSIGHT entities**: Learned patterns from /save-insights.md
- **PATTERN entities**: Reusable solutions
- **BREAKTHROUGH entities**: Major discoveries

#### Search Strategy Examples
```javascript
// Find recent work
"2025-09-20 week-38-2025 handoff"

// Find specific spec work
"spec:001 backend completed"

// Find cross-project insights
"reusable pattern testing"

// Find active development
"in-progress project:hextrackr frontend"
```

### Context7
- Verify framework documentation accuracy
- Download framework docs to `/dev-docs/frameworks/`

### the-brain Agent (Project-Aware Research Specialist)
- **Primary Use**: Delegate ALL research tasks to save main session tokens
- **Capabilities**: Sequential Thinking + Claude-Context + Context7 + Brave Search + Memento persistence
- **Project Context**: Understands HexTrackr's architecture, tech stack, and constraints
- **Research Flow**: Context → Internal → External → Synthesis (always checks codebase first)

#### Agent-Powered Research Pattern (Token-Saving Strategy)

**Core Principle**: Use the-brain for background research while you focus on implementation in the main session.

**When to Use the-brain**:
- Framework/library compatibility research (AG-Grid, ApexCharts, Socket.io)
- Error investigation and debugging
- Best practice research for specific implementations
- Performance optimization strategies
- Security vulnerability research
- Any research that would consume 5-10K tokens in main session

**Usage Pattern**:
```javascript
// Step 1: Launch the-brain for research (runs on separate token budget)
Task tool → the-brain → "Research WebSocket authentication best practices for HexTrackr"

// Step 2: Continue implementation work in main session
// (Focus high-value tokens on coding, testing, debugging)

// Step 3: Retrieve research findings when needed (100-200 tokens)
mcp__memento__search_nodes({
  query: "research-websocket authentication week-38-2025",
  mode: "semantic"
})
```

**Example Parallel Workflow**:
- **Main Session**: "I'll implement the user management UI while the-brain researches session handling best practices"
- **the-brain**: Analyzes current auth.js, researches Express session patterns, provides HexTrackr-specific integration plan
- **Result**: Implementation proceeds while research happens in background, then integrate findings

**Research Retrieval Patterns**:
```javascript
// Find today's research
"research-* week-38-2025"

// Find specific topic research
"research-websocket", "research-cors", "research-performance"

// Find integration-ready solutions
"integration-ready codebase-analyzed"

// Find critical security research
"research:security-review critical"

// Find implementation guides
"research:implementation-guide verified"
```

**Token Savings**:
- Research tasks: 5-10K tokens → Delegated to the-brain
- Main session: Focus on implementation (high-value token usage)
- Retrieval: 100-200 tokens when findings needed
- **Result**: 95% token efficiency improvement for research-heavy tasks

**Quick Reference Commands**:
```bash
# Launch the-brain for research
Task tool with subagent_type: "the-brain"

# Retrieve research findings
mcp__memento__search_nodes with query: "research-[topic] week-XX-YYYY"

# Check what research is available
mcp__memento__search_nodes with query: "research-* project:hextrackr"
```

### Playwright
- Test UI changes before and after modifications
- Restart Docker before running: `docker-compose restart`

## Common Troubleshooting

### Port Conflicts
- Application runs on external port 8989, internal port 8080
- Check for conflicts: `lsof -i :8989`

### Database Issues
- Database location: `data/hextrackr.db`
- Reset database: `npm run init-db`

### Module Loading Issues
- Vulnerability modules use ES6 syntax but loaded as regular scripts
- Access via `window` object in browser context

### Docker Issues
- Always use `docker-compose` commands, not direct Docker
- Logs: `docker-compose logs -f`
- Full restart: `docker-compose down && docker-compose up -d`