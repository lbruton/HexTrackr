# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development Setup

```bash
# CRITICAL: Always use Docker - never run Node.js locally
docker-compose up -d              # Start development environment
docker-compose logs -f           # View logs
curl http://localhost:8989/health # Verify app is running (8989→8080)
```

### Testing & Quality

```bash
# Always restart Docker before Playwright tests
docker-compose restart && npx playwright test

# Linting commands
npm run lint:all      # Run all linters (ESLint + Stylelint + Markdownlint)
npm run fix:all       # Auto-fix all linting issues
npm run eslint        # JavaScript linting only
npm run stylelint     # CSS linting only
```

### Database Operations

```bash
node app/public/scripts/init-database.js  # Initialize database
# Database location: data/hextrackr.db (SQLite)
```

### Documentation

```bash
npm run docs:generate  # Update HTML documentation from Markdown
npm run docs:analyze   # Generate architecture analysis + update docs
npm run roadmap        # Generate roadmap portal
```

## Architecture Overview

### Monolithic Express Backend

- **Single server file**: `app/public/server.js` (~3,800 lines) handles ALL functionality:
  - RESTful API endpoints (`/api/*`)
  - File uploads via Multer
  - Static file serving
  - WebSocket support (planned for port 8988)
  - Database operations (SQLite)
- **Security**: Custom `PathValidator` class for all file operations
- **Port mapping**: External 8989 → Internal 8080 (Docker)

### Modular Frontend Architecture

```
scripts/
├── shared/          # Reusable components (loaded first)
│   ├── theme-controller.js
│   ├── ag-grid-responsive-config.js
│   └── settings-modal.js
├── pages/           # Page-specific logic
│   ├── vulnerabilities.js
│   └── tickets.js
└── utils/           # Security utilities
```

### CSS Architecture with Surface Hierarchy

```css
/* Dark mode uses elevation-based surfaces */
--hextrackr-surface-base: #0f172a;  /* Page background */
--hextrackr-surface-1: #1a2332;     /* Cards */
--hextrackr-surface-2: #253241;     /* Tables */
--hextrackr-surface-3: #2f3f50;     /* Modals */
--hextrackr-surface-4: #526880;     /* Modal containers */
```

### Database Schema

- Runtime schema evolution using idempotent ALTER TABLE statements
- Key tables: `tickets`, `vulnerabilities`, `vulnerability_imports`, `vulnerability_snapshots`
- JSON columns stored as text (e.g., devices in tickets)

## Critical Development Patterns

### S-R-P-T Planning Methodology

The project uses a unique planning system in `Planning/`:

1. **S-files** (Specification): WHAT and WHY - requirements
2. **R-files** (Research): HOW to approach - multi-agent analysis
3. **P-files** (Planning): HOW to implement - technical plan
4. **T-files** (Tasks): DO - execution with TodoWrite

Example: `S001-dark-mode.md` → `R001-dark-mode-analysis.md` → `P001-dark-mode-plan.md` → `T001-dark-mode-tasks.md`

### JavaScript Module Pattern

```javascript
// All page managers follow this pattern
class ModernVulnManager {
    constructor() {
        this.dataManager = new VulnerabilityDataManager();
        this.init();
    }
    async init() {
        await this.loadData();
        this.setupEventListeners();
    }
}
```

### API Pattern

```javascript
// Consistent error handling
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

### File Operations Security

```javascript
// Always use PathValidator
const validatedPath = PathValidator.validatePath(filePath);
const content = PathValidator.safeReadFileSync(validatedPath);
```

## Key Integration Points

### CSV Import Pipeline

- Upload via Multer → Parse with PapaParse → Process with `mapVulnerabilityRow()` → Batch insert to SQLite
- Staging mode for large files with progress tracking

### AG Grid Integration

- All grids use `AGGridResponsiveConfig` for consistent theming
- Requires both CSS class changes AND JavaScript API calls for theme switching

### Inter-Module Communication

- Use `window.refreshPageData(type)` for cross-component updates
- Settings modal provides global data operation hooks

## Common Gotchas & Solutions

1. **Port Confusion**: Always use external port 8989 (maps to internal 8080)
2. **Theme Variables**: Use `--hextrackr-surface-*` not Bootstrap defaults
3. **Docker Required**: Never run `node server.js` directly
4. **Playwright Tests**: Must `docker-compose restart` before running
5. **Path Security**: Always validate paths with `PathValidator` class
6. **Modal Z-Index**: Known issue with nested modals - check surface hierarchy

## Code Style Requirements

- **Quotes**: Always double quotes ("")
- **Semicolons**: Always required
- **Variables**: `const` default, `let` when needed, never `var`
- **Equality**: Always strict (`===`, `!==`)
- **File names**: kebab-case
- **Classes**: PascalCase
- **Functions**: camelCase
