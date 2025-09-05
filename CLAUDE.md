# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm run init-db` - Initialize the SQLite database

### Linting and Code Quality

- `npm run lint:all` - Run all linters (markdown, ESLint, Stylelint)
- `npm run fix:all` - Fix all linting issues automatically
- `npm run eslint` - Run ESLint on JavaScript files
- `npm run eslint:fix` - Fix ESLint issues
- `npm run stylelint` - Run Stylelint on CSS files
- `npm run stylelint:fix` - Fix Stylelint issues
- `npm run lint:md` - Run markdownlint on documentation
- `npm run lint:md:fix` - Fix markdown formatting issues

### Documentation and Analysis

- `npm run docs:generate` - Update HTML documentation
- `npm run docs:analyze` - Generate architecture analysis and update docs
- `npm run roadmap` - Generate project roadmap portal

### Important Notes

- **NEVER run Node.js locally** - Always use Docker containers
- Use `Dockerfile.node` (not the main Dockerfile)
- Server runs on port 8080 in Docker
- **Always restart Docker container before running Playwright tests**

## Architecture Overview

### Backend Architecture

HexTrackr uses a monolithic Node.js/Express server pattern:

- **Main Entry Point**: `server.js` (~1,200+ lines) - Handles both API routes and static file serving
- **Database**: SQLite with runtime schema evolution (`data/hextrackr.db`)
- **File Uploads**: Handled via multer, stored in `uploads/` directory with 100MB limit
- **Security**: PathValidator class prevents path traversal attacks, security headers on all responses
- **Middleware Stack**: CORS, compression, JSON/form parsing (100mb limits), multer for file uploads

### Vulnerability Rollover Architecture

Critical pattern for vulnerability data management:

- **Current Data**: `vulnerabilities_current` table holds deduplicated current state
- **Historical Snapshots**: `vulnerability_snapshots` preserves all import history  
- **Daily Aggregation**: `vulnerability_daily_totals` for trend analysis
- **Dedup Key**: `normalizeHostname(hostname) + CVE` (or `plugin_id + description` fallback)
- **Process Flow**: CSV import → temp file → Papa.parse → `processVulnerabilityRowsWithRollover()` → DB updates

### Frontend Architecture

Modular JavaScript pattern with clear separation:

- **Shared Components**: `scripts/shared/` - Reusable UI components and utilities
- **Page-Specific Code**: `scripts/pages/` - Individual page functionality  
- **Utilities**: `scripts/utils/` - Helper functions and data processing
- **Communication**: Pages use `window.refreshPageData(type)` for inter-module updates

### Database Schema

- **Location**: `data/hextrackr.db`
- **Initialization**: `scripts/init-database.js` for bootstrap, runtime evolution in `server.js`
- **Key Tables**:
  - `tickets` - Primary ticket data with JSON fields for devices/attachments
  - `vulnerabilities_current` - Deduplicated current vulnerability state
  - `vulnerability_snapshots` - Complete historical import records
  - `vulnerability_daily_totals` - Aggregated data for trend analysis
  - `vulnerability_imports` - Import metadata and audit trail
- **Evolution**: Idempotent ALTER statements handle schema changes
- **JSON Storage**: Complex fields stored as JSON strings (e.g., devices in tickets, attachments)

## Key Workflows

### Data Import System

Two primary import flows:

1. **CSV Upload**: Multipart form → temp file → Papa.parse → DB insert → cleanup
2. **JSON Import**: Direct JSON payload → DB insert (client-parsed CSV)

Both flows update `vulnerability_imports` table for audit trail and `vulnerabilities` table for active data.

### Integration Points

- **ServiceNow**: Configurable ticket integration via settings modal
- **Security Scanners**: CSV import support for various vulnerability scanners
- **Backup/Restore**: Complete data export/import system via API endpoints
- **Settings Modal**: Global configuration interface (`scripts/shared/settings-modal.js`)

## File Organization

### Critical Files

- `server.js:1-2000` - Main server implementation with all API routes
- `scripts/init-database.js` - Database schema and initialization logic
- `scripts/shared/settings-modal.js` - Global frontend utilities and data operations
- `docs-source/` - Source documentation (generates to `docs-html/`)

### Directory Structure

```
├── scripts/
│   ├── shared/     # Reusable components and utilities
│   ├── pages/      # Page-specific functionality
│   └── utils/      # Helper functions
├── data/           # SQLite database location
├── uploads/        # File upload storage
└── docs-source/    # Documentation source files
```

## Error Handling Patterns

### HTTP Response Conventions

- **400**: Bad input (missing files, invalid data)
- **500**: Database or processing errors
- **Success**: Always include `{ success: true }` with additional data

### Common Pitfalls

- `settings-modal.js` expects generic `/api/import` but server uses specific endpoints
- Ticket schema evolution means some deployments may lack newer columns
- File uploads have 100MB hard limit
- Always `unlink()` temporary files after processing
- SQLite file requires write permissions in `data/` directory

## Testing

### Playwright Tests

- **Prerequisites**: Docker container must be restarted before running tests (`docker-compose restart`)
- **Configuration**: Uses `@playwright/test` framework  
- **Requirements**: Tests expect `http://localhost:8080` and clean container state
- **Design**: Tests should be idempotent and handle existing data gracefully
- **Command**: `npx playwright test` (run inside or outside container)

## Code Conventions

### Security Requirements

- Use PathValidator class for all file operations
- Never expose sensitive data in logs or responses
- Validate all user inputs, especially file uploads and CSV data
- Implement proper error handling without information disclosure

### Database Interactions

- All schema changes must be idempotent ALTER statements in `server.js`
- Handle nullable columns for schema evolution compatibility
- **Sequential Processing**: Use sequential loops for row iteration to prevent race conditions (see `processVulnerabilityRowsWithRollover`)
- Store complex data as JSON strings with proper parsing/validation
- Use proper transaction handling for multi-table operations

### Documentation Updates

- When adding new docs sections, update the whitelist in `/docs-html` deep-link routing
- Run `npm run docs:generate` to update HTML documentation after markdown changes
- Use `npm run docs:analyze` to regenerate architecture analysis

### API Response Patterns  

- **Success**: Return JSON arrays/objects or `{ success: true, ...additional_data }`
- **Errors**: Use status 400 (bad input) or 500 (server errors) with `{ error: "message" }`
- **Dates**: Use ISO `YYYY-MM-DD` format for scan dates
- **Pagination**: Support `page`, `limit`, `search`, and filtering parameters
