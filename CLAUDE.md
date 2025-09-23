# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

HexTrackr is a vulnerability tracking and ticket management system built with Node.js, Express, and SQLite. The application has been refactored from a monolithic ~3,800 line server into a modular architecture with separate controllers, services, routes, and utilities.

## Development Commands

### Essential Commands
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
npm run hooks:install             # Configure git hooks (run after clone)
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