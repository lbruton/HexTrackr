# HexTrackr Project CLAUDE.md (Context-Optimized)

Project-specific guidance for HexTrackr vulnerability management system.
For universal tool discovery patterns, see Personal CLAUDE.md.

## 🔍 HexTrackr-Specific Tool Discovery

**Use Memento semantic search for HexTrackr-specific patterns**:

```javascript
// HexTrackr refactoring patterns
mcp__memento__search_nodes({
  query: "hextrackr refactor module extraction vulnerability statistics",
  mode: "hybrid", topK: 10
})

// HexTrackr security patterns  
mcp__memento__search_nodes({
  query: "hextrackr security vulnerability rollover deduplication cve",
  mode: "hybrid", topK: 10
})

// HexTrackr UI patterns
mcp__memento__search_nodes({
  query: "hextrackr ui charts tooltip apex grid responsive",
  mode: "hybrid", topK: 10
})
```

## 🚨 CRITICAL GIT WORKFLOW - NEVER VIOLATE 🚨

## MAIN BRANCH IS PROTECTED - NEVER WORK IN MAIN

- **ALWAYS** work from the `copilot` branch
- **NEVER** checkout main branch
- **NEVER** commit to main branch  
- **NEVER** merge to main branch
- The `copilot` branch is our primary development branch
- All work happens in feature branches off `copilot`
- Workflow: feature branch → PR → merge to `copilot` → eventual release to main

**Violation of this rule is a MAJOR breach of trust and can cause loss of work**

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

## Project Commands

```bash

# Development

npm run dev                    # Development server with nodemon
npm run init-db               # Initialize database

# Documentation

npm run docs:generate         # Update HTML docs
npm run docs:analyze         # Architecture analysis

# Quality

npm run lint:all             # Run all linters
npm run fix:all             # Fix all issues
```

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

## Testing Approach

```bash

# Always restart Docker first

docker-compose restart

# Run Playwright tests

npx playwright test

# Check screenshots

ls .playwright-mcp/
```

## Common Pitfalls

1. Settings modal expects `/api/import` but server uses specific endpoints
2. Ticket schema evolution - some deployments lack newer columns
3. Always `unlink()` temp files after processing
4. SQLite needs write permissions in `data/`
5. File uploads hard-limited to 100MB

## 🎯 HexTrackr Agent Discovery Patterns

### Domain Data Processing

```javascript
// Instead of hardcoded tools, use semantic search:
// Search: "vulnerability data processor csv import rollover deduplication"
// Returns: Patterns for PapaParse, rollover logic, database operations

Task(vulnerability-data-processor): "Use Memento search for 'hextrackr rollover deduplication cve hostname' to verify logic patterns"
```

### Security Integration

```javascript
// Search: "cisco integration specialist tenable security scanner api"
// Returns: Integration patterns, API mappings, security protocols

Task(cisco-integration-specialist): "Search 'cisco psirt api v2 vulnerability enrichment' for integration patterns"
Task(tenable-integration-specialist): "Search 'tenable plugin_id mapping io integration' for data mapping"
```

### UI Design & Testing

```javascript
// Search: "ui design specialist playwright browser automation testing"  
// Returns: UI patterns, responsive design, testing workflows

Task(ui-design-specialist): "Search 'hextrackr ui charts responsive ag-grid tooltip' for visual patterns and fixes"
```

### Research Patterns

```javascript
// HexTrackr repository access via ref.tools (discovered through semantic search)
// Search: "ref documentation search private repository" to get ref.tools functions
// Then: ref_search_documentation("HexTrackr vulnerability rollover", {ref_src: "private"})
```

## 🔧 Context-Optimized Development Workflow

### Pattern-Based Discovery

Instead of listing every tool, use these discovery patterns:

**For Analysis Tasks**:

```javascript
// Search: "zen analysis debug architecture hextrackr vulnerability"
// Get zen analyze, zen debug, zen secaudit for HexTrackr-specific analysis
```

**For Database Operations**:

```javascript  
// Search: "database schema sqlite vulnerability rollover deduplication"
// Get patterns for SQLite operations, schema evolution, data integrity
```

**For UI Development**:

```javascript
// Search: "ui playwright testing responsive charts apex grid tabler"
// Get UI testing patterns, chart fixes, responsive design solutions
```

**For Security & Integration**:

```javascript
// Search: "security integration cisco tenable api authentication csv"
// Get security patterns, API integration guides, data validation
```

For universal MCP tool discovery patterns and Docker workflows, refer to Personal CLAUDE.md.
