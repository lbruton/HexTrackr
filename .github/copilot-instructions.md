# GitHub Copilot Instructions for HexTrackr

## Essential Context

HexTrackr is a vulnerability management platform with a Docker-first architecture using Express.js backend and modular frontend components. Understanding these key patterns will make you immediately productive in this codebase.

## Architecture Overview

### Backend: Monolithic Express Server with Planned Modularization
- **Main server**: `app/public/server.js` (3,810 lines) - handles ALL APIs, WebSocket, static files
- **Database**: SQLite with custom schema at `data/hextrackr.db` 
- **File uploads**: CSV processing via Multer + PapaParse for vulnerability imports
- **Security**: Custom `PathValidator` class for file system security
- **Port configuration**: Docker maps 8989→8080, WebSocket planned for 8988

### Frontend: Modular JavaScript + CSS Architecture
- **Framework**: Tabler.io (Bootstrap 5) with AG Grid for tables, ApexCharts for visualizations
- **Module structure**: `scripts/shared/` (reusable) + `scripts/pages/` (page-specific)
- **CSS hierarchy**: `styles/shared/` → `styles/pages/` → `styles/utils/responsive.css`
- **Theme system**: Full dark/light mode with CSS custom properties and WCAG compliance

## Critical Development Patterns

### Docker-Only Development
```bash
# ALWAYS use Docker - never run Node directly
docker-compose up -d              # Start development environment
docker-compose restart           # Required before Playwright tests
curl http://localhost:8989/health # Verify application is running
```

### P-R-T Planning Methodology (Project-Specific)
The codebase uses a unique planning system in `/Planning/`:
- **P001-xxx.md**: Plans (WHAT/WHY) - problem statements and goals
- **R001-xxx.md**: Research (HOW) - technical analysis and solutions  
- **T001-xxx.md**: Tasks (DO) - implementation breakdown

Example: When adding features, create P001 first, then R001 for technical design, finally T001 for implementation tasks.

### JavaScript Module Patterns
```javascript
// All page managers follow this class-based pattern
class ModernVulnManager {
    constructor() {
        this.dataManager = new VulnerabilityDataManager();
        this.paginationController = new PaginationController();
        this.init();
    }
    
    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.initializeComponents();
    }
}
```

### CSS Surface Hierarchy System
```css
/* Dark theme uses specific surface elevation system */
--hextrackr-surface-base: #0f172a;    /* Page background */
--hextrackr-surface-1: #1a2332;       /* Cards - low elevation */
--hextrackr-surface-2: #253241;       /* Tables - medium elevation */
--hextrackr-surface-3: #2f3f50;       /* Modals - higher elevation */
--hextrackr-surface-4: #526880;       /* Modal containers */
```

## Testing & Quality Assurance

### Playwright E2E Testing (Critical)
```bash
# Always restart Docker before tests
docker-compose restart
npx playwright test                    # Run all tests
npx playwright test --grep "modal"    # Run specific test suites
```

### Linting Pipeline
```bash
npm run lint:all      # Run ESLint + Stylelint + Markdownlint
npm run fix:all       # Auto-fix all linting issues
npm run eslint        # JavaScript only (uses @stylistic/eslint-plugin)
npm run stylelint     # CSS only
```

## File Organization Conventions

### Backend API Endpoints
All in `server.js` with plans to extract to `routes/` directory:
- `/api/vulnerabilities/*` - CRUD operations, CSV import/export
- `/api/tickets/*` - Ticket management
- `/api/backup/*` - Database backup/restore
- WebSocket on port 8988 (planned)

### Frontend Module Loading
```javascript
// Shared components loaded dynamically
import { ThemeController } from '../shared/theme-controller.js';
import { ConfigLoader } from '../shared/config-loader.js';
import { AGGridResponsiveConfig } from '../shared/ag-grid-responsive-config.js';
```

### Documentation System
- **Source**: `docs-source/` (Markdown)
- **Generated**: `docs-html/` (HTML via custom generator)
- **Portal**: Dynamic navigation in `docs-html/js/docs-portal-v2.js`

## Integration Points

### CSV Processing Pipeline
```javascript
// Vulnerability import follows this pattern:
Multer upload → PapaParse → mapVulnerabilityRow() → SQLite batch insert
// Custom hostname normalization and CVE extraction logic
```

### AG Grid + Theme Integration
```javascript
// All grids use responsive config from shared module
const gridOptions = AGGridResponsiveConfig.getVulnerabilityGridConfig();
// Automatically handles theme changes and responsive breakpoints
```

### WebSocket Progress Tracking (Planned)
Architecture designed for real-time import progress via Socket.io on port 8988.

## Common Gotchas

1. **Port Confusion**: External 8989 maps to internal 8080 - always use 8989 for local access
2. **Theme Variables**: Use `--hextrackr-surface-*` variables, not Bootstrap defaults for dark mode
3. **AG Grid Theming**: Requires both CSS class changes AND JavaScript API calls
4. **CSV Import**: Uses staging mode for large files - check `importVulnerabilitiesCSV()` function
5. **Modal Z-Index**: Known issue with nested modals - see surface hierarchy system
6. **Path Security**: Always use `PathValidator` class for file operations

## Quick Commands Reference

```bash
# Development workflow
docker-compose up -d && docker-compose logs -f

# Database reset
node scripts/init-database.js

# Generate documentation  
npm run docs:generate

# Full quality check
npm run lint:all && npx playwright test

# Generate roadmap portal
npm run roadmap
```

This codebase prioritizes Docker consistency, modular architecture, and comprehensive testing. When in doubt, check existing patterns in `scripts/shared/` or follow the P-R-T methodology for complex features.
