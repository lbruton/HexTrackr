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
- All NPM Scripts SHALL be documented in NPMGUIDE.md (see root directory)
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

HexTrackr is a cybersecurity vulnerability and ticket management system with a modular Node.js/Express backend and vanilla JavaScript frontend. The system has been refactored from a monolithic ~3,800 line server.js to a modular architecture while maintaining backward compatibility.

**Key Technologies:**

- Backend: Node.js/Express with modular controllers and services
- Database: SQLite3 with runtime schema evolution
- Frontend: Vanilla JavaScript with modular architecture
- UI Framework: Tabler.io (primary) + Bootstrap (legacy migration)
- WebSockets: Socket.io for real-time progress tracking
- Testing: Manual testing workflow with Playwright MCP for automation when needed

## Common Development Commands

### Running the Application

```bash
# Start development server with auto-restart
npm run dev

# Start production server
npm start

# Initialize/reset database
npm run init-db
```

### Linting and Code Quality

```bash
# Run all linting
npm run lint:all

# Fix all linting issues
npm run fix:all

# Individual linters
npm run eslint
npm run eslint:fix
npm run stylelint
npm run stylelint:fix
npm run lint:md
npm run lint:md:fix
```

### Documentation

```bash
# Generate all documentation
npm run docs:all

# Generate development docs
npm run docs:dev

# Watch docs during development
npm run docs:dev:watch

# Generate all documentation
npm run docs:all
```

### Git Hooks and Development Tools

```bash
# Install git hooks
npm run hooks:install
```

### Development Environment

**CRITICAL**: Always use Docker for development - never run Node.js locally

```bash
# Start containerized environment
docker-compose up

# Restart container
docker-compose restart

# Check container status
docker-compose ps

# View container logs
docker-compose logs
```

## Architecture Overview

### Backend Architecture (Modular Design)

HexTrackr has transitioned from a monolithic server.js to a modular architecture:

**Core Structure:**

- `app/public/server.js` - Main Express application with route registration
- `app/controllers/` - Business logic controllers (VulnerabilityController, TicketController, BackupController, ImportController, DocsController, TemplateController, KevController)
- `app/services/` - Service layer (12 services total)
- `app/routes/` - Express route definitions
- `app/middleware/` - Custom middleware (errorHandler, logging, security, validation)
- `app/utils/` - Utility classes (PathValidator, ProgressTracker, helpers, constants)

**Complete Service Layer:**

- `backupService` - Database backup and restore operations
- `databaseService` - SQLite connection and transaction management
- `docsService` - Documentation generation and management
- `fileService` - File system operations and management
- `importService` - CSV import/export functionality with progress tracking
- `kevService` - Known Exploited Vulnerabilities (KEV) integration
- `progressService` - Real-time progress tracking for long operations
- `templateService` - Email, ticket, and vulnerability template management
- `ticketService` - Ticket CRUD operations and device management
- `validationService` - Input validation and data sanitization
- `vulnerabilityService` - Vulnerability data management and operations
- `vulnerabilityStatsService` - Vulnerability statistics and analytics

**Key Utilities:**

- `PathValidator` - Security utility preventing path traversal attacks
- `ProgressTracker` - WebSocket-based progress tracking for long operations
- `helpers` - Common utility functions
- `constants` - Application-wide constants

### Frontend Architecture (Modular JavaScript)

The frontend follows a modular pattern with clear separation of concerns:

**Directory Structure:**

```
app/public/scripts/
├── shared/        # Reusable components (settings-modal.js, etc.)
├── pages/         # Page-specific logic (tickets.js, vulnerabilities.js)
└── utils/         # Utility functions
```

**Integration Pattern:**

1. Load shared components first
2. Load page-specific code second
3. Communication via `window.refreshPageData(type)` callbacks

### Database Architecture

**Runtime Schema Evolution:**

- SQLite3 with idempotent ALTER TABLE statements
- Schema changes applied during server startup
- Rollover architecture for vulnerability data management

**Key Tables:**

- `tickets` - Ticket management with JSON device fields
- `vulnerabilities` - Current vulnerability data
- `vulnerability_imports` - Import tracking
- `vulnerability_snapshots` - Historical rollover data
- `vulnerabilities_current` - Active vulnerability state management
- `vulnerability_daily_totals` - Daily statistics tracking
- `vulnerability_staging` - Import staging area
- `email_templates` - Email notification templates
- `ticket_templates` - Ticket template management
- `ticket_vulnerabilities` - Links between tickets and vulnerabilities
- `kev_status` - Known Exploited Vulnerabilities tracking
- `sync_metadata` - Synchronization metadata
- `vulnerability_templates` - Vulnerability template storage

## Coding Standards

### JavaScript Style (Enforced by ESLint)

- **Quotes**: Always use double quotes ("")
- **Semicolons**: Required at end of statements
- **Variables**: Use `const` by default, `let` when reassignment needed
- **Equality**: Always use strict equality (`===` and `!==`)
- **Braces**: Always use curly braces for control structures

### Security Requirements

- Always use `PathValidator.validatePath()` for file operations
- Sanitize user inputs with DOMPurify for HTML rendering
- Use parameterized queries for database operations
- Set security headers on all API responses

### Module Patterns

**Backend Controllers:**

```javascript
class ExampleController {
    static initialize(db, progressTracker) {
        this.db = db;
        this.progressTracker = progressTracker;
    }

    static async handleRequest(req, res) {
        try {
            // Business logic here
            res.json({ success: true, data: result });
        } catch (error) {
            console.error("Operation failed:", error);
            res.status(500).json({
                success: false,
                error: "Operation failed",
                details: error.message
            });
        }
    }
}
```

**Frontend Page Integration:**

```javascript
// Required integration functions for pages
window.refreshPageData = function(type) {
    // Refresh page data when shared components complete operations
};

window.showToast = function(message, type) {
    // Show notifications using page's toast system
};
```

## Development Workflow

### Docker-Only Development

- Never run Node.js locally - always use Docker
- Use `docker-compose up` for development
- Restart container with `docker-compose restart` before running Playwright tests
- All testing and development must happen in containerized environment

### Testing Strategy

**Note: Manual testing workflow with optional AI automation**

- Manual testing preferred for UI validation and bug discovery
- Stagehand available for AI-powered browser automation using natural language
- Playwright MCP available for traditional browser automation when needed
- Screenshots and visual testing for UI verification
- Focus on functional testing through actual usage

#### Stagehand AI Testing (Optional)

```bash
# Install Stagehand dependencies (if needed)
npm install

# Run AI-powered tests
npm run test:stagehand
```

**Stagehand Benefits:**

- Natural language test descriptions instead of brittle CSS selectors
- AI adapts automatically when UI changes
- Perfect bridge between manual testing and automation
- Local development support without cloud dependencies

### File Operations Security

All file system operations must use the PathValidator class:

```javascript
try {
    const validatedPath = PathValidator.validatePath(filePath);
    const content = PathValidator.safeReadFileSync(validatedPath);
} catch (error) {
    console.error("File operation failed:", error);
    // Handle error appropriately
}
```

### Database Operations

Use the DatabaseService for all database interactions:

```javascript
const query = "SELECT * FROM table WHERE id = ?";
databaseService.db.all(query, [id], (err, rows) => {
    if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database operation failed" });
    }
    res.json({ success: true, data: rows });
});
```

## Project-Specific Patterns

### Progress Tracking

For long-running operations, use the ProgressTracker with WebSocket communication:

```javascript
const sessionId = progressTracker.createSession();
progressTracker.updateProgress(sessionId, 50, "Processing...");
// WebSocket clients automatically receive updates
```

### Vulnerability Data Management

- Vulnerability imports create snapshots for historical tracking
- Rollover functionality manages data retention
- CSV import/export via Papa Parse library with 100MB file limits

### KEV (Known Exploited Vulnerabilities) Integration

- Automated synchronization with CISA's Known Exploited Vulnerabilities catalog
- KEV status tracking for vulnerabilities (Active/Not Active)
- Sync metadata management for tracking last update times
- REST API endpoints for KEV status queries and manual sync triggers

### Template System

- **Email Templates**: Customizable email notifications with variable substitution
- **Ticket Templates**: Pre-configured ticket creation templates with markdown support
- **Vulnerability Templates**: Standardized vulnerability reporting templates
- **Variable System**: Dynamic content insertion using `{{variable}}` syntax
- **Markdown Editor**: Full-featured markdown editor with live preview for template editing
- **Database Storage**: Templates stored in dedicated database tables (email_templates, ticket_templates, vulnerability_templates)

### Modular Frontend Architecture

- Shared components are loaded first in HTML
- Page-specific JavaScript loaded second
- Communication between modules via window object callbacks
- No build process - direct script loading

## Important Files and Locations

**Configuration:**

- `eslint.config.mjs` - ESLint configuration
- `.markdownlint.json` - Markdown linting rules
- `package.json` - Dependencies and scripts
- `docker-compose.yml` - Containerization setup
- Note: .cursorrules file not present (development rules in CLAUDE.md instead)

**Core Application:**

- `app/public/server.js` - Main Express server
- `app/services/databaseService.js` - Database abstraction layer
- `app/utils/PathValidator.js` - Security utility for file operations
- `app/public/scripts/shared/settings-modal.js` - Global settings component

**Database:**

- `app/public/data/hextrackr.db` - SQLite database file
- `app/public/scripts/init-database.js` - Database initialization

**Testing:**

- Manual testing workflow with visual verification
- Playwright MCP for browser automation when needed

## Port and Environment

- Application runs on internal port 8080 (Docker container)
- External Docker port mapping: 8989 → 8080 (prevents test conflicts)
- Always use `http://localhost:8989` for testing and development when using Docker
- Docker-only environment - no local Node.js execution allowed
