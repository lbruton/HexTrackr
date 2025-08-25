# HexTrackr Copilot Instructions

## Project Overview
HexTrackr is a dual-purpose cybersecurity management system:
1. **Ticket Management** (`tickets.html` + `app.js`) - Security ticket workflow 
2. **Vulnerability Management** (`vulnerabilities.html`) - **Time-series trend tracking** with modern Tabler.io UI

## Architecture
- **Backend**: Node.js/Express + SQLite (`data/hextrackr.db`)
- **Frontend**: Tabler.io + vanilla JavaScript (vulnerabilities), Bootstrap 5 (tickets)
- **Storage**: Database-first with localStorage fallback
- **Data Model**: **Time-series vulnerability tracking** (CSV imports track changes over time, not duplicates)

## Development Rules
1. **Always backup first**: `git add . && git commit -m "🔄 Pre-work backup"`
2. **Update instructions FIRST**: Before any development work, update both:
   - `.github/copilot-instructions.md` (AI workflow & technical details)
   - `README.md` (Human overview & quick start)
3. **Test locally**: Use `localhost:8080` via Docker
4. **Database operations**: Use API endpoints, not direct DB access
5. **No cross-contamination**: Tickets and vulnerabilities are separate systems

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
- **Vulnerability Tracking**: Time-series model - CSV date field = last_updated, track VPR changes over time
- **Import Logic**: UPSERT based on `hostname + cve + scan_date` (no duplicates)

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

## Documentation Maintenance
**CRITICAL**: Keep these files synchronized across conversations:
- **AI Instructions**: `.github/copilot-instructions.md` - Technical architecture, MCP requirements, development patterns
- **Human README**: `README.md` - Project overview, quick start, user-facing information
- **When to update**: EVERY conversation that changes architecture, adds features, or modifies workflows
- **Prevent framework confusion**: Always check current instructions before starting development work
