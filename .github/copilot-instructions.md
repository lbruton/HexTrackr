# GitHub Copilot Instructions for HexTrackr

This file provides guidance to GitHub Copilot when working with the HexTrackr codebase.

## Project Context

HexTrackr is a vulnerability and ticket management system built with:

- **Backend**: Node.js/Express monolithic server (`server.js`)
- **Database**: SQLite with rollover architecture (`data/hextrackr.db`)
- **Frontend**: Modular JavaScript with AG Grid, ApexCharts, Bootstrap 5, Tabler.io
- **Documentation**: Markdown-first with HTML generation
- **Testing**: Playwright browser automation

## Current Version: 1.0.4 (September 5, 2025)

### Recent Achievements

- ✅ Modal layering bug fix with Bootstrap Modal.getInstance()
- ✅ Working table resizing and card pagination (6-card default)
- ✅ Version badge synchronization across all components
- ✅ Enhanced UI Design Specialist agent with Playwright testing

## Unified AI Development Workflow

### Your Role in the Ecosystem

**GitHub Copilot** - Quick Tasks (5-30 minutes):

- Single-file modifications and bug fixes
- Code completion and inline improvements  
- Unit test writing and simple refactoring
- Small feature additions and optimizations

### Memory System Access

You have access to **PAM (Persistent AI Memory)** for session continuity:

- All your interactions are automatically recorded
- Context is shared with Claude Code (central orchestrator)
- Previous solutions and patterns are available for reference

### Task Delegation Boundaries

**Stay in your lane for**:

- Quick fixes and code completion
- Single-function modifications
- Unit test creation
- Simple refactoring

**Escalate to Claude Code for**:

- Multi-file architectural changes
- Complex UI/UX improvements
- Database schema migrations
- Cross-system integrations
- Documentation updates

**Hand off to specialized agents for**:

- `vulnerability-data-processor`: CSV import issues
- `ui-design-specialist`: UI enhancements needing browser testing
- `docs-portal-maintainer`: Documentation portal updates
- `database-schema-manager`: Complex schema changes
- `cisco-integration-specialist`: API integration work

## Code Conventions

### Security Requirements

- Use PathValidator class for all file operations
- Never expose sensitive data in logs or responses
- Validate all user inputs, especially file uploads and CSV data
- Implement proper error handling without information disclosure

### Database Patterns

- All schema changes must be idempotent ALTER statements
- Handle nullable columns for schema evolution compatibility
- **Use sequential processing for vulnerability data** (avoid race conditions)
- Store complex data as JSON strings with proper parsing/validation

### JavaScript Architecture

- **Modular pattern**: `scripts/shared/` (reusable), `scripts/pages/` (specific), `scripts/utils/` (helpers)
- **Communication**: Use `window.refreshPageData(type)` for inter-module updates
- **Error handling**: Consistent patterns with user-friendly messages
- **Performance**: Lazy loading for large datasets, pagination for card views

### API Conventions

- **Success responses**: JSON arrays/objects or `{ success: true, ...data }`
- **Error responses**: Status 400/500 with `{ error: "message" }`
- **Date formats**: ISO `YYYY-MM-DD` for scan dates
- **Pagination**: Support `page`, `limit`, `search`, and filtering parameters

## Development Commands

### Core Commands

- `npm start` - Production server (Docker only)
- `npm run dev` - Development server with nodemon
- `npm run init-db` - Initialize SQLite database

### Quality Assurance  

- `npm run lint:all` - Run all linters
- `npm run fix:all` - Fix all linting issues
- `npm run eslint:fix` - Fix JavaScript issues
- `npm run stylelint:fix` - Fix CSS issues

### Testing & Documentation

- `npm run docs:generate` - Update HTML documentation
- Docker restart required before Playwright tests
- Always test in Docker container (port 8080)

## Critical Patterns

### Vulnerability Rollover System

- **Current data**: `vulnerabilities_current` table (deduplicated)
- **Historical snapshots**: `vulnerability_snapshots` (complete history)
- **Dedup key**: `normalizeHostname(hostname) + CVE`
- **Process flow**: CSV → temp file → Papa.parse → `processVulnerabilityRowsWithRollover()`

### File Upload Handling

- 100MB limit enforced by multer
- Always `unlink()` temporary files after processing
- Use PathValidator for secure file system operations
- Store uploads in `uploads/` directory

### Modal Management (Recent Fix)

```javascript
// Always check for existing modals before opening new ones
const existingModal = bootstrap.Modal.getInstance(document.getElementById('vulnerabilityModal'));
if (existingModal) {
    existingModal.hide();
}
// Then open new modal
```

## Session Integration

Your work integrates with the broader AI development ecosystem:

1. **Context Sharing**: PAM records all your contributions for Claude Code
2. **Quality Gates**: Your changes contribute to <50 Codacy issues goal
3. **Testing Integration**: UI changes should consider Playwright test impact
4. **Documentation Impact**: Code changes may trigger doc updates via other agents

## Version Strategy

- **Current**: v1.0.4 (major UI improvements)  
- **Next**: v1.0.5 (hostname normalization, chart improvements)
- **Quality gates**: <50 Codacy issues, zero critical vulnerabilities
- **Release process**: Version sync via `scripts/version-manager.js`

## Getting Help

When encountering complex issues outside your scope:

1. Document the issue clearly in code comments
2. The central Claude Code orchestrator will pick up and address
3. PAM system ensures no context is lost between sessions
4. Feel free to suggest architectural improvements in comments

Remember: You're part of a coordinated AI development team. Focus on your strengths (quick, precise code improvements) while the orchestration layer handles complex planning and cross-system coordination.
