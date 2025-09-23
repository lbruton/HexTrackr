# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

HexTrackr is a vulnerability tracking and ticket management system built with Node.js, Express, and SQLite. The application has been refactored from a monolithic ~3,800 line server into a modular architecture with separate controllers, services, routes, and utilities.

This constitutional framework governs the core operating principles for AI agents working on the HexTrackr project.

## Development Commands

<<<<<<< HEAD
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
=======
### Essential Commands
>>>>>>> v1.0.24-vuln-card-view
```bash
# Development (preferred)
docker-compose up                 # Start with Docker on port 8989
npm run dev                       # Development with nodemon hot-reload
npm start                         # Production server directly

# Database
npm run init-db                   # Initialize/reset SQLite database

# Code Quality (run before commits)
npm run lint:all                  # Check all linters (markdown, JS, CSS)
npm run fix:all                   # Auto-fix all linting issues
npm run eslint                    # JavaScript linting only
npm run stylelint                 # CSS linting only
npm run lint:md                   # Markdown linting only

# Documentation
npm run docs:generate             # Convert markdown docs to HTML
npm run docs:dev                  # Generate JSDoc HTML documentation
npm run docs:all                  # Complete documentation regeneration

# Testing (optional)
npm run test:stagehand            # AI-powered browser automation tests
```

### Git Hooks
```bash
<<<<<<< HEAD
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

# Generate all documentation
npm run docs:all
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
=======
npm run hooks:install             # Configure git hooks (run after clone)
>>>>>>> v1.0.24-vuln-card-view
```

## Architecture Overview

### Core Structure
- **app/public/server.js**: Main entry point that wires routes, middleware, and WebSocket
- **app/controllers/**: Request handling and HTTP response logic
- **app/services/**: Reusable business logic and data operations
- **app/routes/**: Express router definitions and endpoint mounting
- **app/utils/**: Shared utilities like ProgressTracker and constants
- **app/config/**: Configuration modules for middleware, database, WebSocket
- **data/**: SQLite database files and schema definitions

### Key Components
1. **Modular Route System**: Separated from monolithic server into focused route files
2. **Service Layer**: Business logic abstracted into dedicated service classes
3. **WebSocket Integration**: Real-time progress tracking via Socket.IO
4. **Documentation Pipeline**: JSDoc extraction to markdown, then HTML generation

### Database
- **Type**: SQLite with schema defined in `data/schema.sql`
- **Location**: `data/hextrackr.db` (created by `npm run init-db`)
- **Key Tables**: tickets, vulnerabilities, templates, settings
- **Service**: DatabaseService handles connections and queries

### Frontend Architecture
- **Location**: `app/public/` directory
- **Scripts**: Modular JavaScript in `scripts/pages/`, `scripts/shared/`, `scripts/utils/`
- **Styles**: CSS organized in `styles/pages/`, `styles/shared/`, `styles/utils/`
- **Vendor Libraries**: AG-Grid, Chart.js, Socket.IO, DOMPurify, Highlight.js

## Code Style & Standards

### JavaScript
- **ESLint Config**: Uses `@stylistic/eslint-plugin` with custom rules
- **Style**: Double quotes, semicolons, 4-space indentation
- **ES6 Modules**: Vulnerability management files use import/export syntax
- **Variables**: Prefer `const`/`let`, avoid unused variables
- **File Size**: Keep controllers/services under 300 lines for readability

### CSS
- **Linter**: Stylelint with standard config
- **Architecture**: Component-based with shared utilities

<<<<<<< HEAD
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

### Vulnerability Data Management
- Vulnerability imports create snapshots for historical tracking
- Rollover functionality manages data retention
- CSV import/export via Papa Parse library with 100MB file limits
=======
### File Naming
- **Folders**: kebab-case (e.g., `modules/ticket-tracker`)
- **Classes**: PascalCase exports
- **Helpers**: camelCase functions

## Development Workflow

### Docker Development (Recommended)
```bash
docker-compose up                 # Starts on localhost:8989
```
The Docker setup mounts the entire `/app` directory for hot-reloading and persists the database in `/data`.

### Local Development
```bash
npm run dev                       # Uses nodemon for auto-restart
```

### Before Committing
1. Run `npm run lint:all` to check all code quality
2. Run `npm run fix:all` to auto-fix issues
3. Ensure documentation is current with `npm run docs:generate`
4. Verify database migrations if schema changes were made

## Key Integration Points

### WebSocket Communication
- **ProgressTracker**: Utility class for real-time progress updates
- **Socket.IO**: Configured in `app/config/websocket.js`
- **Usage**: Import operations and backup processes use progress tracking

### Route-Controller Pattern
Controllers are initialized in `server.js` and referenced by route modules:
```javascript
// In server.js
const VulnerabilityController = require("../controllers/vulnerabilityController");
const vulnerabilityRoutes = require("../routes/vulnerabilities");

// Routes use initialized controllers
app.use("/api/vulnerabilities", vulnerabilityRoutes);
```

### Service Dependencies
Services often depend on DatabaseService and may use ProgressTracker:
```javascript
const DatabaseService = require("./databaseService");
// Services handle business logic, controllers handle HTTP concerns
```

## Testing

### Optional AI Testing
- **Stagehand**: Natural language browser automation (`npm run test:stagehand`)
- **Requirements**: Docker container running on localhost:8080
- **Use Case**: Tests ticket creation, vulnerability import, settings functionality
- **Benefits**: Adapts to UI changes automatically, no brittle selectors

## Documentation System
>>>>>>> v1.0.24-vuln-card-view

### Source and Output Structure
- **Source**: `app/public/docs-source/` (markdown files)
- **Output**: `app/public/docs-html/` (generated HTML)
- **JSDoc**: Extracted to markdown via unified pipeline
- **Generation**: `npm run docs:generate` converts markdown to HTML

### Documentation Commands
- `docs:generate`: Markdown to HTML conversion
- `docs:dev`: JSDoc HTML generation
- `docs:all`: Complete pipeline regeneration

## Environment & Configuration

### Environment Variables
- Copy `.env.example` to `.env` for local development
- Docker uses environment variables defined in `docker-compose.yml`
- **Port**: Defaults to 8080 internally, 8989 externally (Docker)

### Security Considerations
- Rate limiting configured in `app/config/middleware.js`
- CORS origins, methods, and headers defined in constants
- Avoid committing secrets or local database files
- File upload restrictions via multer configuration

## Common Tasks

### Adding New Features
1. Create controller in `app/controllers/`
2. Create service in `app/services/` for business logic
3. Create route module in `app/routes/`
4. Update `server.js` to wire controller and routes
5. Add frontend components in `app/public/scripts/`

### Database Changes
1. Update schema in `data/schema.sql`
2. Test with `npm run init-db`
3. Update relevant services for new table/column access
4. Document migration steps in PR

### Performance Considerations
- SQLite database suitable for small to medium deployments
- WebSocket connections for real-time updates
- Compression middleware enabled
- AG-Grid for efficient data table rendering