# HexTrackr Copilot Instructions

## Project Overview
HexTrackr is a dual-purpose cybersecurity management system:
1. **Ticket Management** (`tickets.html` + `app.js`) - Security ticket workflow 
2. **Vulnerability Management** (`vulnerabilities.html`) - **Time-series trend tracking** with modern Tabler.io UI

## Architecture
- **Deployment**: **DOCKER-ONLY** - Uses Docker Compose for containerized deployment
- **Backend**: Node.js/Express + SQLite (`data/hextrackr.db`) running in Docker container
- **Frontend**: Tabler.io + vanilla JavaScript (vulnerabilities), Bootstrap 5 (tickets)
- **Storage**: Database-first with localStorage fallback
- **Data Model**: **Time-series vulnerability tracking** (CSV imports track changes over time, not duplicates)
- **Port**: Application runs on `localhost:8080` via Docker port mapping (8080:8080)

## Development Rules
1. **Always backup first**: `git add . && git commit -m "🔄 Pre-work backup"`
2. **Update instructions FIRST**: Before any development work, update both:
   - `.github/copilot-instructions.md` (AI workflow & technical details)
   - `README.md` (Human overview & quick start)
3. **🐳 DOCKER-ONLY DEPLOYMENT**: 
   - **NEVER run `node server.js` or `npm start` directly**
   - **NEVER install local Node.js servers**
   - **ONLY use Docker Compose**: `docker-compose up -d` for deployment
   - **Access via**: `localhost:8080` (Docker port mapping)
   - **Container management**: Use `docker ps`, `docker-compose logs`, etc.
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

## CRITICAL: Mandatory MCP Memory Usage
**ENFORCE THESE RULES AT ALL TIMES:**
1. **AFTER EVERY TASK COMPLETION** - You MUST write session progress to MCP Memory
2. **BEFORE ANY DESTRUCTIVE CHANGES** - You MUST verify MCP Memory is accessible
3. **IF MCP MEMORY FAILS** - You MUST halt immediately and warn the user
4. **NO DESTRUCTIVE CHANGES WITHOUT MEMORY** - File edits, deletions, moves require working MCP Memory
5. **SESSION PERSISTENCE** - All task outcomes, decisions, and context MUST be stored in memory
6. **FAILURE PROTOCOL** - If memory tools are unavailable, inform user and request they restore MCP servers before proceeding

**Memory Storage Requirements:**
- Task completion status and outcomes
- File changes and their purposes  
- Decision rationale and context
- Error states and recovery actions
- Project state and next steps

## Key Patterns
- **Ticket IDs**: `Date.now().toString()`
- **Required fields**: Only `location` is mandatory for tickets
- **Device naming**: Smart auto-increment (e.g., `host01` → `host02`)
- **Data persistence**: API-first with localStorage fallback
- **Vulnerability Tracking**: Time-series model - CSV date field = last_updated, track VPR changes over time
- **Import Logic**: UPSERT based on `hostname + cve + scan_date` (no duplicates)

## File Structure
- `server.js` - Express API server (runs in Docker container)
- `tickets.html` + `app.js` - Ticket management (Bootstrap 5)
- `vulnerabilities.html` - Vulnerability dashboard (Tabler.io modern UI)
- `data/hextrackr.db` - SQLite database (Docker volume mount)
- `styles/` - CSS files
- `scripts/` - JavaScript modules
- `docker-compose.yml` - Container orchestration
- `Dockerfile` - Node.js container configuration

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
