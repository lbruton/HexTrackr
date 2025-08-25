# HexTrackr Copilot Instructions

## Project Overview
HexTrackr is a dual-purpose cybersecurity management system:
1. **Ticket Management** (`tickets.html` + `app.js`) - Security ticket workflow 
2. **Vulnerability Management** (`vulnerabilities.html`) - Multi-vendor vulnerability analysis with modern Tabler.io UI

## Architecture
- **Backend**: Node.js/Express + SQLite (`data/hextrackr.db`)
- **Frontend**: Tabler.io + vanilla JavaScript (vulnerabilities), Bootstrap 5 (tickets)
- **Storage**: Database-first with localStorage fallback

## Development Rules
1. **Always backup first**: `git add . && git commit -m "🔄 Pre-work backup"`
2. **Test locally**: Use `localhost:8080` via Docker
3. **Database operations**: Use API endpoints, not direct DB access
4. **No cross-contamination**: Tickets and vulnerabilities are separate systems

## MCP Server Requirements
**ALWAYS verify these MCP servers are available and use them when appropriate:**
- **Memory Server** - CRITICAL for session persistence and context tracking
- **Sequential Thinking** - REQUIRED for complex problem solving and planning
- **GitHub Tools** - Use for repository management and issue tracking
- **Codacy Tools** - MANDATORY after any code changes for quality analysis
- **Playwright Browser** - Use for testing UI changes at `localhost:8080`
- **Any other available MCP tools** - Leverage all available capabilities

## Key Patterns
- **Ticket IDs**: `Date.now().toString()`
- **Required fields**: Only `location` is mandatory for tickets
- **Device naming**: Smart auto-increment (e.g., `host01` → `host02`)
- **Data persistence**: API-first with localStorage fallback

## File Structure
- `server.js` - Express API server
- `tickets.html` + `app.js` - Ticket management (Bootstrap 5)
- `vulnerabilities.html` - Vulnerability dashboard (Tabler.io modern UI)
- `data/hextrackr.db` - SQLite database
- `styles/` - CSS files
- `scripts/` - JavaScript modules

## Common Tasks
- **Add ticket fields**: Update HTML → `saveTicket()` → `renderTickets()` → PDF generation
- **CSV import/export**: Follow `sample-data.js` structure
- **Modal management**: Use Bootstrap 5 with `data-ticket-id` attributes
