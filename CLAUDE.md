# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## HexTrackr Overview

HexTrackr is a vulnerability management system for tracking security vulnerabilities, tickets, and Known Exploited Vulnerabilities (KEV). The system uses a modular Node.js/Express backend with SQLite database and vanilla JavaScript frontend.

## Project Constitution

When working on this project the AI Agent SHALL follow the CONSTITUTION.md

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
   - Use Claude-Context for codebase searching (verify index is current)
   - Use Memento MCP for project knowledge graph (semantic search preferred)
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
   - Development work sourced from 'copilot' branch
   - Main branch is 'main'
   - Protected branches require Pull Requests (no direct pushes)

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

- The system follows a migration from monolithic to modular architecture
- Controllers use singleton pattern for consistency
- Services use functional exports for stateless operations
- WebSocket rooms are used for targeted progress updates
- Database uses WAL mode for concurrent access
- Frontend uses vanilla JavaScript (no framework dependencies)
- Bootstrap 5 and Tabler.io for UI components