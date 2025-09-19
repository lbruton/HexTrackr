# SUBAGENT.md - HexTrackr Project Truth Document

This document serves as the single source of truth for all HexTrackr subagents. It provides comprehensive project knowledge to ensure agents make informed, consistent decisions aligned with project architecture and standards.

## Project Overview

**HexTrackr** is a network administrator's toolkit for tracking maintenance tickets and vulnerability management. Built by a network admin for network admins, it provides a unified dashboard for ServiceNow tickets, Hexagon maintenance windows, and vulnerability reports.

- **Current Version**: 1.0.16
- **Architecture**: Modular monolith with separated frontend/backend
- **Database**: SQLite (embedded, no external dependencies)
- **Deployment**: Docker Compose
- **Port Mapping**: External 8989 → Internal 8080

## Technology Stack

### Frontend (Vanilla JavaScript)

```
CRITICAL: This is NOT a React application!
```

- **Core**: Vanilla JavaScript with ES6 modules
- **CSS Framework**: Tabler.io (Bootstrap-based)
- **Data Tables**: AG-Grid Community Edition
- **Charts**: ApexCharts (dynamic theming)
- **Icons**: Font Awesome 6.4.0
- **Build**: No bundler - native ES6 modules
- **Sanitization**: DOMPurify for XSS prevention

### Backend (Node.js/Express)

- **Server**: Express 4.18.2 (modularized to 205 lines)
- **Database**: SQLite3 with runtime schema evolution
- **File Uploads**: Multer
- **CSV Parsing**: PapaParse
- **WebSockets**: Socket.io for real-time updates
- **Compression**: compression middleware
- **Security**: PathValidator class, rate limiting
- **CORS**: Configured for development

## Architecture Patterns

### Frontend Architecture

```
scripts/
├── shared/          # Reusable components (loaded first)
│   ├── theme-controller.js        # Dark/light mode
│   ├── ag-grid-responsive-config.js # Grid theming
│   ├── settings-modal.js          # Global operations
│   └── vulnerability-*.js         # Domain modules
├── pages/           # Page-specific managers
│   ├── vulnerabilities.js         # ModernVulnManager
│   └── tickets.js                 # TicketManager
└── utils/           # Security and helpers
```

### CRITICAL: Hybrid Module Loading Pattern

```
⚠️ HexTrackr uses BOTH ES6 modules AND traditional script loading!
```

#### ES6 Modules (use export/import)
- `vulnerability-chart-manager.js` - Exports VulnerabilityChartManager
- `vulnerability-grid.js` - Exports VulnerabilityGridManager
- `vulnerability-core.js` - Imports the above modules

#### Traditional Scripts (global variables via <script> tags)
- `vulnerability-data.js` - Defines global VulnerabilityDataManager
- `vulnerability-statistics.js` - Defines global VulnerabilityStatisticsManager
- `vulnerability-search.js` - Defines global VulnerabilitySearchManager
- `vulnerability-cards.js` - Defines global VulnerabilityCardsManager

**Never add ES6 imports for classes loaded as global scripts!**

### Module Pattern (Frontend)

```javascript
// All page managers follow this pattern
export class ModernVulnManager {
    constructor() {
        this.initializeModules();
    }

    async initializeModules() {
        this.coreOrchestrator = new VulnerabilityCoreOrchestrator();
        await this.coreOrchestrator.initializeAllModules(this);
    }
}
```

### Backend Module Structure

```
app/
├── controllers/     # Business logic (singleton pattern)
├── services/        # Data access layer
├── routes/          # Express route definitions
├── config/          # Configuration modules
├── middleware/      # Express middleware
└── utils/           # PathValidator, helpers
```

### Controller Patterns (Backend)

```javascript
// Singleton pattern (3 controllers use this)
class VulnerabilityController {
    static instance = null;

    static initialize(database, progressTracker) {
        if (!VulnerabilityController.instance) {
            VulnerabilityController.instance = new VulnerabilityController();
        }
        VulnerabilityController.instance.db = database;
        VulnerabilityController.instance.progressTracker = progressTracker;
        return VulnerabilityController.instance;
    }

    static getInstance() {
        if (!VulnerabilityController.instance) {
            throw new Error("Controller not initialized");
        }
        return VulnerabilityController.instance;
    }
}

// Functional pattern (ImportController uses this)
module.exports = {
    handleImport: async (req, res) => { /* ... */ },
    getProgress: async (req, res) => { /* ... */ }
};
```

## CSS Architecture

### Surface Hierarchy (Dark Mode)

```css
:root {
    /* Elevation-based surfaces */
    --hextrackr-surface-base: #0f172a;  /* Page background */
    --hextrackr-surface-1: #1a2332;     /* Cards */
    --hextrackr-surface-2: #253241;     /* Tables */
    --hextrackr-surface-3: #2f3f50;     /* Modals */
    --hextrackr-surface-4: #526880;     /* Modal containers */
}
```

### VPR Severity Colors

```css
:root {
    /* Single source of truth for vulnerability colors */
    --vpr-critical: #dc2626;  /* Red */
    --vpr-high: #d97706;      /* Orange (WCAG adjusted) */
    --vpr-medium: #2563eb;    /* Blue */
    --vpr-low: #16a34a;       /* Green */
}
```

## Critical Patterns

### Module Initialization Sequence (Backend)

```javascript
// CRITICAL: Order matters for dependency injection!
async function startServer() {
    // 1. Initialize database FIRST
    await initDb();

    // 2. Initialize controllers with dependencies
    VulnerabilityController.initialize(db, progressTracker);
    TicketController.initialize(db);

    // 3. NOW import routes (after controllers ready)
    const vulnerabilityRoutes = require("../routes/vulnerabilities");

    // 4. Mount routes
    app.use("/api/vulnerabilities", vulnerabilityRoutes);

    // 5. Start listening
    server.listen(PORT);
}
```

### File Security Pattern

```javascript
// ALWAYS use PathValidator for file operations
const { PathValidator } = require("../utils/PathValidator");

const validatedPath = PathValidator.validatePath(filePath);
const content = PathValidator.safeReadFileSync(validatedPath);
```

### Theme Integration (Frontend)

```javascript
// AG-Grid requires both CSS class AND API call
const currentTheme = localStorage.getItem("theme") || "light";
gridDiv.className = currentTheme === "dark"
    ? "ag-theme-quartz-dark"
    : "ag-theme-quartz";

// Also update grid API
gridApi.setGridTheme(currentTheme === "dark"
    ? "ag-theme-quartz-dark"
    : "ag-theme-quartz");
```

### WebSocket Progress Tracking

```javascript
// Import operations use WebSocket for real-time progress
this.websocketClient = new WebSocketClient();
this.websocketClient.on("importProgress", (data) => {
    progressModal.updateProgress(data);
});
```

## API Patterns

### Consistent Error Handling

```javascript
try {
    const result = await operation();
    res.json({ success: true, data: result });
} catch (error) {
    console.error("Operation failed:", error);
    res.status(500).json({
        success: false,
        error: "Operation failed",
        details: error.message
    });
}
```

### Import Pipeline

```
Upload (Multer) → Parse (PapaParse) → Stage (SQLite) →
Process (mapVulnerabilityRow) → Batch Insert → WebSocket Updates
```

## Database Schema

### Runtime Evolution Pattern

```javascript
// Schema changes use idempotent ALTER TABLE statements
const migrations = [
    "ALTER TABLE vulnerabilities ADD COLUMN lifecycle_state TEXT DEFAULT 'active'",
    "ALTER TABLE vulnerability_imports ADD COLUMN total_processed INTEGER DEFAULT 0"
];

// Applied at startup, safe to run multiple times
migrations.forEach(sql => {
    try {
        db.run(sql);
    } catch (e) {
        // Column already exists, safe to ignore
    }
});
```

### Key Tables

- `tickets` - Maintenance ticket tracking
- `vulnerabilities` - Vulnerability records with VPR scores
- `vulnerability_imports` - Import session metadata
- `vulnerability_snapshots` - Historical snapshots

## Testing Requirements

### Environment Setup

```bash
# ALWAYS use Docker for testing
docker-compose up -d
docker-compose restart  # Required before Playwright tests

# Never run locally
# BAD: node server.js
# GOOD: docker-compose up
```

### Test Patterns

```javascript
// Contract tests for all API endpoints
describe("GET /api/vulnerabilities", () => {
    it("should return vulnerability list", async () => {
        const response = await request(app).get("/api/vulnerabilities");
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });
});
```

## Common Operations

### Adding a New Feature

1. Create specification: `/specify [feature description]`
2. Generate plan: `/plan`
3. Create tasks: `/tasks`
4. Follow TDD: Write tests first
5. Implement following patterns above
6. Update documentation: `npm run docs:generate`

### Updating Styles

1. Use CSS variables for consistency
2. Support both light and dark themes
3. Test with `docker-compose up`
4. Check WCAG compliance for colors

### Adding API Endpoints

1. Create controller method (singleton pattern)
2. Add service layer function
3. Define route in routes file
4. Write contract test first
5. Document in `docs-source/api-reference/`

## Performance Requirements

### Response Times

- Page loads: < 2 seconds
- API responses: < 500ms
- Database queries: < 100ms
- WebSocket messages: < 50ms

### Processing Benchmarks

- CSV imports: 1000+ rows/second
- Batch operations: 100+ concurrent items
- Search operations: < 200ms
- Export streaming: Start within 1 second

### Resource Constraints

- Memory usage: < 512MB normal operation
- CPU usage: < 80% standard load
- Database monitoring at 80% capacity
- Log rotation at 100MB

## Constitutional Compliance

### Development Framework (Article I)

- ✅ Context accuracy before work begins
- ✅ Memento for session recording
- ✅ Documentation updates required
- ✅ All linting must pass (ESLint, Stylelint)
- ✅ Docker-only development (port 8989)
- ✅ PathValidator for file operations
- ✅ Protected branches use PRs

### Spec-Kit Framework (Article II)

- ✅ Follow /specify → /plan → /tasks workflow
- ✅ No implementation without specification
- ✅ Test-first development mandatory

### Code Quality Standards

- **Quotes**: Always double quotes ("")
- **Semicolons**: Always required
- **Variables**: const default, let when needed, never var
- **Equality**: Always strict (===, !==)
- **File names**: kebab-case
- **Classes**: PascalCase
- **Functions**: camelCase

## Common Pitfalls to Avoid

1. **Module Loading**: Some modules are ES6, others are global scripts - CHECK FIRST!
2. **Port Confusion**: External 8989 maps to internal 8080
3. **Theme Variables**: Use --hextrackr-surface-* not Bootstrap
4. **Running Locally**: Never run `node server.js` directly
5. **Playwright Tests**: Must restart Docker first
6. **Path Security**: Always use PathValidator class
7. **Modal Z-Index**: Known issue with nested modals
8. **Controller Init**: Database MUST be ready before routes
9. **AG-Grid Themes**: Requires both CSS class AND API update

## Project Files Quick Reference

### Core Entry Points

- `app/public/server.js` - Main backend server (205 lines)
- `app/public/vulnerabilities.html` - Vulnerability dashboard
- `app/public/tickets.html` - Ticket management
- `app/public/scripts/pages/vulnerabilities.js` - Frontend orchestrator

### Configuration Files

- `CLAUDE.md` - AI assistant instructions
- `.specify/memory/constitution.md` - Project constitution
- `.specify/memory/spec-kit.md` - Spec-Kit methodology
- `docker-compose.yml` - Docker configuration
- `package.json` - Dependencies and scripts

### Documentation

- `app/public/docs-source/` - Markdown documentation
- `app/public/docs-html/` - Generated HTML docs
- `specs/` - Feature specifications

## Agent Communication Patterns

### Cross-Component Updates

```javascript
// Use global refresh function for data updates
window.refreshPageData("vulnerabilities");

// Settings modal provides hooks
window.settingsModal.onDataOperation = async (operation) => {
    // Handle backup, restore, clear operations
};
```

### Event-Driven Updates

```javascript
// Components extend EventTarget for communication
class VulnerabilityChartManager extends EventTarget {
    updateChart(data) {
        // Update logic
        this.dispatchEvent(new CustomEvent("chartUpdated", {
            detail: data
        }));
    }
}
```

---

*This document is the authoritative source for HexTrackr project knowledge. All agents should reference this for accurate implementation details.*
