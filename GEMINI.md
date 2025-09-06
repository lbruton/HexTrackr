# HexTrackr Project Guide for Gemini CLI

Project-specific guidance for HexTrackr vulnerability management system when using Gemini CLI.

## Your Role: Large Context Analysis (2+ hours)

You handle tasks requiring deep codebase analysis that exceed other tools' context limits:

- Major refactoring requiring full codebase analysis  
- Complex architectural changes across multiple files
- Performance optimization requiring deep system understanding
- Security audits and comprehensive code reviews
- Large-scale code migrations and modernization

## Project Overview

HexTrackr is a vulnerability and ticket management system with:

- **Version**: See package.json (current: September 2025)
- **Stack**: Node.js/Express, SQLite, AG Grid, ApexCharts, Bootstrap 5, Tabler.io
- **Port**: 8080 (Docker only)

## Architecture

### Backend (`server.js`)

- Monolithic Express server (~1,200+ lines)
- SQLite with runtime schema evolution
- File uploads via multer (100MB limit)
- PathValidator for security
- JSON storage for complex fields

### Database Schema

```
data/hextrackr.db
├── tickets                    # Ticket data with JSON devices/attachments
├── vulnerabilities_current    # Deduplicated current state
├── vulnerability_snapshots    # Historical imports
├── vulnerability_daily_totals # Trend analysis
└── vulnerability_imports      # Audit trail
```

### Frontend Structure

```
scripts/
├── shared/     # Reusable components (modals, settings)
├── pages/      # Page-specific logic (vulnerability-manager.js)
└── utils/      # Helpers (security.js, data processing)
```

## Critical Patterns

### Vulnerability Rollover

- **Dedup Key**: `normalizeHostname(hostname) + CVE` or fallback to `plugin_id + description`
- **Process**: CSV → Papa.parse → `processVulnerabilityRowsWithRollover()` → DB
- **Sequential Processing**: Use loops, not parallel processing to prevent race conditions

### API Endpoints

```javascript
// Vulnerabilities
GET  /api/vulnerabilities          // List with pagination
POST /api/vulnerabilities/import   // CSV import
GET  /api/vulnerabilities/export   // Export data

// Tickets  
GET  /api/tickets                  // List tickets
POST /api/tickets                  // Create ticket
PUT  /api/tickets/:id             // Update ticket
```

### Inter-Module Communication

```javascript
// Refresh data across modules
window.refreshPageData('vulnerabilities');
window.refreshPageData('tickets');
```

## Development Commands

```bash

# Development (Docker Only)

docker-compose up -d               # Start services
npm run dev                        # Development server with nodemon
npm run init-db                   # Initialize database

# Documentation

npm run docs:generate             # Update HTML docs
npm run docs:analyze             # Architecture analysis

# Quality

npm run lint:all                 # Run all linters
npm run fix:all                 # Fix all issues

# Testing

docker-compose restart           # ALWAYS before testing
npx playwright test             # Browser automation
```

## Session Handoff Protocol

**At Session Start**:

1. Check `/dev-docs/session-handoff.json` for current project state
2. Review recent changes and priorities
3. Understand what task is being handed off

**At Session End**:

1. Update `/dev-docs/session-handoff.json` with progress
2. Document architectural decisions discovered
3. Note next steps for other tools

## Current Sprint Priorities

1. **Security Hardening**: JWT auth, rate limiting, CORS
2. **Testing Infrastructure**: Jest framework, coverage reporting
3. **Database Security**: SQL injection prevention, input validation

## Key Files

- `server.js` - Main server with all routes
- `scripts/init-database.js` - Database initialization
- `scripts/shared/settings-modal.js` - Global utilities
- `scripts/pages/vulnerability-manager.js` - Main UI logic
- `docs-source/` - Documentation source

## Integration Points

- **ServiceNow**: Ticket integration via settings
- **Security Scanners**: CSV import support
- **Backup/Restore**: Complete data export/import

## Performance Requirements

- Table loads: <500ms
- Chart updates: <200ms  
- Card transitions: <100ms
- Initial page load: <2s
- Animations: 60fps

## Common Pitfalls

1. Settings modal expects `/api/import` but server uses specific endpoints
2. Ticket schema evolution - some deployments lack newer columns
3. Always `unlink()` temp files after processing
4. SQLite needs write permissions in `data/`
5. File uploads hard-limited to 100MB

## Agent Boundaries

**UI Changes Only**: CSS, HTML, animations, responsive design
**Data Processing**: Import logic, aggregation, database operations
**Integration Work**: API connections, external system mapping

**Critical**: ALWAYS use Docker containers - never run Node.js locally. Use `docker-compose restart` before Playwright tests.
