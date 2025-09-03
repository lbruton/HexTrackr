# HexTrackr AI Assistant Instructions

## Project Overview

HexTrackr is a vulnerability and ticket management system with a monolithic Node.js/Express backend and browser-based frontend. It uses SQLite for persistence and follows a modular JavaScript architecture pattern.

## Key Architecture Patterns

### Backend Architecture

- Monolithic Express server (`server.js`) handling both API and static file serving
- SQLite database with runtime schema evolution
- Core middleware: CORS, compression, JSON/form parsing (100MB limits), security headers
- File uploads handled via multer in `uploads/` directory
- PathValidator class for secure file operations

### Frontend Architecture

- Modular pattern with shared components (`scripts/shared/`), page-specific code (`scripts/pages/`), and utilities (`scripts/utils/`)
- Page initialization flow:
  1. Load shared components (e.g., `settings-modal.js`)
  2. Load page-specific code (e.g., `tickets.js`)
- Inter-module communication via `window.refreshPageData(type)` pattern

### Database Schema

- Located at `data/hextrackr.db`, initialized by `scripts/init-database.js`
- Key tables: tickets, vulnerabilities, vulnerability_imports
- Schema evolution happens at runtime with idempotent ALTERs
- JSON fields stored as strings (e.g., devices in tickets table)

## Critical Workflows

### Development Setup

- **NEVER** run node.js locally for this project, always run in Docker container

## Docker Configuration

- Uses `Dockerfile.node` (not the main `Dockerfile`)
- Single container setup on port 8080
- **Important:** Restart Docker container before running Playwright tests

### Testing Setup

## Playwright Testing

- Requires Docker container restart: `docker-compose restart`
- Browser automation tests need clean container state
- All tests run against `http://localhost:8080`

### Data Import Flows

1. CSV Upload:
   - Multipart form upload → temp file storage → Papa.parse → DB insert → cleanup
1. JSON Import (client-parsed CSV):
   - Direct JSON payload → DB insert
   - Both flows update both vulnerability_imports and vulnerabilities tables

### Integration Points

- ServiceNow ticket integration via configurable settings
- CSV imports from various vulnerability scanners
- Backup/restore system for all data types
- Settings modal provides global data operation hooks

## Project-Specific Conventions

### File Organization

- Frontend modules follow strict shared/pages/utils separation
- API endpoints grouped by domain (tickets, vulnerabilities, backup)
- Database initialization split between runtime (server.js) and bootstrap (init-database.js)

### Error Handling

- HTTP 400 for bad input (missing files/data)
- HTTP 500 for DB/processing errors
- Success responses always include `{ success: true }` with additional data

### Data Validation

- CSV imports validate required fields per vendor
- Ticket fields allow schema evolution (nullable new columns)
- File paths validated through PathValidator class

## Common Pitfalls

- settings-modal.js expects generic `/api/import` but server uses specific endpoints
- Ticket schema has evolved - some deployments may lack newer columns
- File uploads must not exceed 100MB limit
- Remember to unlink temporary files after processing
- SQLite file requires write permissions in `data/` directory

## Key Files for Context

- `server.js`: Main backend entry point
- `scripts/init-database.js`: DB schema and initialization
- `scripts/shared/settings-modal.js`: Global frontend utilities
- `docs-source/architecture/`: Detailed architecture documentation

## Persistent AI Memory Integration

### Memory System Usage (MANDATORY)

HexTrackr uses a persistent AI memory system to maintain context across sessions and ensure project continuity. The following memory practices are REQUIRED:

#### Session Initialization

- **ALWAYS** check recent context at the start of any session: `get_recent_context`
- **SEARCH** for relevant memories when resuming work: `search_memories`
- **REVIEW** active reminders for pending tasks: `get_reminders`

#### Memory Creation (CRITICAL)

- **CREATE MEMORY** for all significant project decisions and status changes
- **STORE CONVERSATIONS** at key decision points and milestone achievements
- **SET REMINDERS** for time-sensitive tasks and security fixes
- **CREATE APPOINTMENTS** for planned releases and important deadlines

#### Memory Management Standards

- Use **importance levels 8-10** for security issues and release blockers
- Tag memories with **project-specific tags**: ["hextrackr", "security", "codacy", "release"]
- Use **memory types**: "security-issue", "project-status", "user-preference", "architectural-decision"
- **UPDATE MEMORIES** when status changes (e.g., issues resolved, milestones completed)

#### Required Memory Events

1. **After any security fix**: Update memory with resolution status
2. **After Codacy analysis**: Store results and remaining issues count
3. **At sprint completion**: Document achievements and next priorities
4. **Before context switches**: Store current state and next steps
5. **After critical decisions**: Record rationale and chosen approach

### Memory Tool Integration

- Memory tools available in `.prompts/` directory with full documentation
- Use semantic search to find previous solutions to similar problems
- Maintain audit trail of all security-related decisions and implementations
- Store user preferences and coding standards for consistency

## Versioning Standards

### Keep a Changelog

- **Format**: Follow [Keep a Changelog v1.0.0](https://keepachangelog.com/en/1.0.0/) format
- **File**: `CHANGELOG.md` must be updated for ALL releases
- **Sections**: Unreleased, Added, Changed, Deprecated, Removed, Fixed, Security
- **Badges**: [![Keep a Changelog](https://img.shields.io/badge/Keep%20a%20Changelog-v1.0.0-orange)](https://keepachangelog.com/en/1.0.0/)

### Semantic Versioning

- **Standard**: Follow [Semantic Versioning v2.0.0](https://semver.org/spec/v2.0.0.html)
- **Format**: MAJOR.MINOR.PATCH (e.g., 1.0.2)
- **Current Version**: 1.0.2 (in package.json)
- **Rules**:
  - **MAJOR**: Breaking changes or major architectural updates
  - **MINOR**: New features and enhancements (backward compatible)  
  - **PATCH**: Bug fixes and minor improvements
- **Badges**: [![Semantic Versioning](https://img.shields.io/badge/Semantic%20Versioning-v2.0.0-blue)](https://semver.org/spec/v2.0.0.html)

### Release Process

1. Update CHANGELOG.md with new version section
2. Update package.json version number
3. Commit with descriptive message following SemVer
4. Create Git tag matching version number
5. Push changes and tags to GitHub

## Documentation

Full documentation available in `docs-source/` with architecture diagrams and API references.
