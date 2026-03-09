# Project Structure

## Directory Organization

```
hextrackr/
├── app/                          # Application root
│   ├── config/                   # Server & feature configuration
│   │   ├── database.js           # SQLite connection config
│   │   ├── importConfig.js       # CSV import field mappings
│   │   ├── logging.config.json   # Logging categories & levels
│   │   ├── middleware.js          # Express middleware setup
│   │   ├── server.js             # Server bootstrap config
│   │   └── websocket.js          # Socket.IO configuration
│   ├── controllers/              # Request handlers (14 controllers)
│   │   ├── auditLogController.js
│   │   ├── authController.js
│   │   ├── backupController.js
│   │   ├── ciscoController.js
│   │   ├── docsController.js
│   │   ├── hostnameController.js
│   │   ├── importController.js
│   │   ├── kevController.js
│   │   ├── locationController.js
│   │   ├── paloAltoController.js
│   │   ├── preferencesController.js
│   │   ├── templateController.js
│   │   ├── ticketController.js
│   │   └── vulnerabilityController.js
│   ├── data/                     # SQLite database (Docker volume mount)
│   ├── dev-docs-html/            # JSDoc-generated API reference (build artifact)
│   ├── middleware/               # Express middleware (5 files)
│   │   ├── auth.js               # Session authentication
│   │   ├── errorHandler.js       # Global error handler
│   │   ├── logging.js            # Request logging
│   │   ├── security.js           # Helmet, CSRF, rate limiting
│   │   └── validation.js         # Input validation
│   ├── modules/                  # Shared domain modules
│   ├── public/                   # Static frontend assets (Express static root)
│   │   ├── config/               # Client-side configuration
│   │   ├── docs-html/            # Generated documentation HTML (build artifact)
│   │   ├── docs-source/          # Markdown documentation source (editable)
│   │   │   └── changelog/versions/  # Per-version changelog files
│   │   ├── fonts/                # Web fonts
│   │   ├── scripts/              # Frontend JavaScript files
│   │   ├── styles/               # CSS stylesheets
│   │   ├── uploads/              # User file uploads
│   │   ├── vendor/               # Third-party frontend libraries
│   │   ├── index.html            # Main dashboard SPA
│   │   ├── login.html            # Login page
│   │   ├── tickets.html          # Ticketing Bridge page
│   │   ├── vulnerabilities.html  # Vulnerability management page
│   │   └── server.js             # Express server entry point
│   ├── routes/                   # Route modules (18 files)
│   ├── scripts/                  # Build/utility scripts
│   ├── services/                 # Business logic (20+ service files)
│   ├── uploads/                  # Server-side upload staging
│   └── utils/                    # Shared utilities
│       ├── constants.js          # Application-wide constants
│       ├── helpers.js            # General helper functions
│       ├── httpHelpers.js        # HTTP request utilities
│       ├── PathValidator.js      # File path security validation
│       ├── ProgressTracker.js    # Import progress tracking
│       └── seedEmailTemplates.js # Default email template data
├── docs/                         # Developer documentation (markdown)
├── devops/                       # Version lock, deployment config
├── backups/                      # Database backups (git-ignored)
├── .codacy/                      # Codacy quality gate configuration
├── .spec-workflow/               # Spec workflow steering & specs
├── docker-compose.yml            # Container orchestration
├── Dockerfile                    # Container build definition
├── package.json                  # Dependencies & scripts
├── eslint.config.mjs             # ESLint v9 flat config
├── .stylelintrc.json             # Stylelint CSS rules
├── .markdownlint.json            # Markdown lint rules
└── jsdoc.dev.json                # JSDoc generation config
```

## Naming Conventions

### Files

- **Controllers**: `camelCase` with `Controller` suffix (e.g., `ticketController.js`)
- **Services**: `camelCase` with `Service` suffix (e.g., `ticketService.js`)
- **Routes**: `kebab-case` or single-word (e.g., `palo-alto.js`, `tickets.js`)
- **Middleware**: `camelCase` single-word (e.g., `auth.js`, `security.js`)
- **Utilities**: `camelCase` or `PascalCase` for classes (e.g., `helpers.js`, `PathValidator.js`)
- **Backup files**: `.bak` suffix — retained for rollback reference, not loaded at runtime

### Code

- **Classes**: `PascalCase` (e.g., `DatabaseService`, `PathValidator`)
- **Functions/Methods**: `camelCase` (e.g., `getVulnerabilities`, `parseCsvRow`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `CACHE_TTL`, `MAX_RETRIES`)
- **Variables**: `camelCase` (e.g., `ticketData`, `advisoryList`)
- **Database columns**: `snake_case` (e.g., `created_at`, `kev_status`)

## Import Patterns

### Import Order

1. Node.js built-in modules (`path`, `fs`, `crypto`)
2. External npm dependencies (`express`, `better-sqlite3`)
3. Internal config (`../config/database`)
4. Internal services (`../services/databaseService`)
5. Internal utilities (`../utils/helpers`)

### Module Organization

- CommonJS throughout (`require`/`module.exports`)
- Relative imports within the `app/` tree
- Services instantiated as singletons — one instance shared across the application
- Controllers receive service instances via constructor or direct require

## Code Structure Patterns

### Service Pattern

```
class FooService {
    constructor() {
        this.db = null;        // Set during init
        this._log = null;      // LoggingService reference
    }

    initialize(db, loggingService) {
        this.db = db;
        this._log = loggingService;
    }

    // Public methods
    async getFoo(id) { ... }

    // Private helpers prefixed with _
    _validateFoo(data) { ... }
}

module.exports = new FooService();  // Singleton export
```

### Controller Pattern

```
// Controllers are plain objects with handler methods
const fooController = {
    async getAll(req, res) {
        try {
            const data = await fooService.getAll();
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
};
```

### Route Pattern

```
const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");

router.get("/", requireAuth, fooController.getAll);

module.exports = router;
```

### SQLite Callback `this` Context

When using `sqlite3` (async driver) with `db.run()` callbacks, capture `const self = this` before the callback. Regular function callbacks rebind `this` to the SQLite Statement object (`this.lastID`, `this.changes`), so service methods like `this._log()` become undefined. Arrow functions would fix `this` but break access to Statement properties.

## Code Organization Principles

1. **Single Responsibility**: Each service owns one domain (tickets, vulnerabilities, auth, etc.)
2. **Layered Architecture**: Routes → Controllers → Services → Database. No layer-skipping.
3. **Singleton Services**: Services are instantiated once and initialized with shared dependencies (db, logger)
4. **Frontend Simplicity**: Vanilla JS with direct DOM manipulation — no virtual DOM, no state management library

## Module Boundaries

- **Backend vs Frontend**: Backend in `app/` (Node.js), frontend in `app/public/` (browser JS). No shared code between them.
- **Services vs Controllers**: Services contain business logic and database access. Controllers handle HTTP concerns only (parsing request, formatting response).
- **Vendor Integrations**: Each vendor (Cisco, Palo Alto, CISA KEV) has its own dedicated service + controller + route module.
- **Documentation**: Source in `docs-source/` (editable markdown), output in `docs-html/` (generated HTML, never edit directly).

## Code Size Guidelines

- **File size**: Services can be large (500-1000+ lines) due to comprehensive domain logic. Keep controllers lean (under 200 lines).
- **Function size**: Prefer functions under 50 lines. Extract helpers for complex logic.
- **Nesting depth**: Maximum 3 levels of nesting. Use early returns to reduce depth.

## Documentation Standards

- All public service methods should have JSDoc comments
- Complex business logic should include inline comments explaining "why"
- Developer docs in `/docs/` folder (markdown)
- User docs in `app/public/docs-source/` (markdown, rendered to HTML)
- API reference auto-generated via JSDoc to `app/dev-docs-html/`
