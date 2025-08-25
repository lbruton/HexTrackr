# HexTrackr Copilot Instruct## JavaScript Organization**: **Each HTML page MUST use its own dedicated JS file**
   - `tickets.html` → `tickets.js` (✅ CORRECTLY ORGANIZED)
   - `vulnerabilities.html` → `vulnerabilities.js` (📋 INCREMENTAL MIGRATION STRATEGY)
   - **NEVER load `app.js` in HTML pages** - Use dedicated files only
   - **JSDoc Documentation**: All JS files should have proper headers like `tickets.js`

### Vulnerabilities JavaScript Migration Strategy
**Discovery (2025-08-25)**: All vulnerabilities JavaScript (~1860 lines) is embedded in `vulnerabilities.html`, NOT in `app.js`
- **Current State**: ModernVulnManager class and all functions are in HTML `<script>` section (lines 1098-2958)
- **Migration Approach**: **INCREMENTAL** - Too much code to move at once
- **New Development**: All NEW vulnerabilities JavaScript goes directly in `vulnerabilities.js`
- **Modifications**: When modifying existing embedded JS, comment out in HTML and move to `vulnerabilities.js`
- **Timeline**: Migrate code organically as we work through features over time
- **No Rush**: System works perfectly with embedded JS - migrate only when touching code

### Migration Process
1. **New Features**: Write directly in `vulnerabilities.js`
2. **Modifying Existing**: Comment out in HTML, move to `vulnerabilities.js`, test thoroughly
3. **Documentation**: Add proper JSDoc headers for all migrated functions
4. **Testing**: Ensure functionality works after each migration step
5. **Gradual**: Only migrate code when actively working on that feature
## Project Overview
HexTrackr is a dual-purpose cybersecurity management system:
1. **Ticket Management** (`tickets.html` + `tickets.js`) - Security ticket workflow 
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
3. **ROADMAP DISCIPLINE**: Work ONLY from the 3-file structure in `/roadmaps/` folder:
   - Strategic changes → Update `roadmaps/ROADMAP.md`
   - Technical tasks → Update `roadmaps/UI_UX_ROADMAP.md`  
   - Sprint status → Update `roadmaps/CURRENT_STATUS.md`
   - **NEVER create roadmap files in repository root**
4. **🐳 DOCKER-ONLY DEPLOYMENT**: 
   - **NEVER run `node server.js` or `npm start` directly**
   - **NEVER install local Node.js servers**
   - **ONLY use Docker Compose**: `docker-compose up -d` for deployment
   - **Access via**: `localhost:8080` (Docker port mapping)
   - **Container management**: Use `docker ps`, `docker-compose logs`, etc.
5. **Database operations**: Use API endpoints, not direct DB access
6. **No cross-contamination**: Tickets and vulnerabilities are separate systems
7. **JavaScript Organization**: **Each HTML page MUST use its own dedicated JS file**
   - `tickets.html` → `tickets.js` (✅ CORRECTLY ORGANIZED)
   - `vulnerabilities.html` → `vulnerabilities.js` (if separate JS needed)
   - **NEVER load `app.js` in HTML pages** - Use dedicated files only
   - **JSDoc Documentation**: All JS files should have proper headers like `tickets.js`

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
- `server.js` - Express API server (runs in Docker container)
- `tickets.html` + `tickets.js` - Ticket management (Bootstrap 5) ✅ **CORRECTLY ORGANIZED**
- `app.js` - **LEGACY FILE** - Tickets functionality moved to `tickets.js`
- `vulnerabilities.html` - Vulnerability dashboard (Tabler.io modern UI) with **embedded JavaScript**
- `vulnerabilities.js` - **TARGET FILE** for incremental migration of vulnerabilities JS
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
- **Strategic Roadmap**: `roadmaps/ROADMAP.md` - Long-term project vision and feature planning
- **Tactical Roadmap**: `roadmaps/UI_UX_ROADMAP.md` - Current technical implementation tasks and sprints
- **Sprint Status**: `roadmaps/CURRENT_STATUS.md` - Current progress and handoff information
- **When to update**: EVERY conversation that changes architecture, adds features, or modifies workflows
- **Prevent framework confusion**: Always check current instructions before starting development work

## Roadmap Structure Enforcement
**MANDATORY**: Use ONLY the 3-file roadmap structure in `/roadmaps/` folder:
1. **`roadmaps/ROADMAP.md`** - Strategic project roadmap and long-term planning
2. **`roadmaps/UI_UX_ROADMAP.md`** - Technical implementation details and tactical tasks
3. **`roadmaps/CURRENT_STATUS.md`** - Sprint handoff and current progress tracking

**FORBIDDEN**: 
- ❌ **NEVER create roadmap files in repository root** (e.g., `CURRENT_ROADMAP.md`)
- ❌ **NEVER create temporary roadmap documents** outside the `/roadmaps/` folder
- ❌ **NEVER duplicate roadmap content** in multiple files
- ❌ **Always work from the existing 3-file structure** - if content needs updating, modify the appropriate existing file

**Process**: When roadmap changes are needed:
1. **Identify correct file**: Strategic (`ROADMAP.md`) vs Tactical (`UI_UX_ROADMAP.md`) vs Status (`CURRENT_STATUS.md`)
2. **Update in place**: Modify the existing file directly
3. **No temporary files**: Never create working documents that might get left behind
4. **Commit immediately**: Update and commit roadmap changes to prevent confusion
