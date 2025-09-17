# HexTrackr Module Dependencies

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        server.js (~205 lines)                   │
│                     (Main Application Orchestrator)              │
└───────────┬─────────────────────────────────────────────────────┘
            │
            ├─── Initialization Phase ────────────────┐
            │                                         │
    ┌───────▼────────┐                     ┌─────────▼──────────┐
    │  Configuration │                     │     Utilities      │
    ├────────────────┤                     ├────────────────────┤
    │ • database.js  │                     │ • PathValidator.js │
    │ • middleware.js│                     │ • ProgressTracker  │
    │ • websocket.js │                     │ • helpers.js       │
    └────────┬────────┘                     └─────────┬──────────┘
             │                                        │
             └──────────────┬─────────────────────────┘
                            │
                   ┌────────▼────────┐
                   │  Database Init  │
                   │  SQLite Setup   │
                   └────────┬────────┘
                            │
            ┌───────────────▼──────────────────┐
            │         Controllers              │
            │   (Singleton Initialization)     │
            ├───────────────────────────────────┤
            │ • VulnerabilityController.init() │
            │ • TicketController.init()        │
            │ • BackupController.init()        │
            │ • ImportController.init()        │
            │ • DocsController.init()          │
            └───────────────┬──────────────────┘
                            │
                            │ Dependencies Injected:
                            │ • db connection
                            │ • progressTracker
                            │
                   ┌────────▼────────┐
                   │     Services     │
                   ├─────────────────┤
                   │ • databaseService│
                   │ • vulnerabilityService
                   │ • vulnerabilityStatsService
                   │ • ticketService │
                   └────────┬────────┘
                            │
                   ┌────────▼────────┐
                   │      Routes      │
                   │  (Imported After │
                   │   Controllers)   │
                   ├─────────────────┤
                   │ • /api/vulnerabilities
                   │ • /api/tickets   │
                   │ • /api/backup    │
                   │ • /api/imports   │
                   │ • /api/docs      │
                   └────────┬────────┘
                            │
                   ┌────────▼────────┐
                   │  Server Listen   │
                   │   Port 8080      │
                   └─────────────────┘
```

## Initialization Sequence

The initialization order is **CRITICAL** for proper dependency injection:

### 1. Configuration Loading
```javascript
const { config: dbConfig } = require("../config/database");
const middlewareConfig = require("../config/middleware");
const { getSocketOptions } = require("../config/websocket");
```

### 2. Utility Setup
```javascript
const PathValidator = require("../utils/PathValidator");
const ProgressTracker = require("../utils/ProgressTracker");
const progressTracker = new ProgressTracker(io);
```

### 3. Database Connection
```javascript
const db = new sqlite3.Database(dbPath);
const databaseService = new DatabaseService(dbPath);
await databaseService.initialize();
```

### 4. Controller Initialization
Controllers MUST be initialized before routes are imported:
```javascript
VulnerabilityController.initialize(db, progressTracker);
TicketController.initialize(db);
BackupController.initialize(db);
// ImportController and DocsController don't require initialization
```

### 5. Route Import & Mounting
Routes are imported AFTER controllers are ready:
```javascript
// NOW import route modules (after controllers are initialized)
const vulnerabilityRoutes = require("../routes/vulnerabilities");
const ticketRoutes = require("../routes/tickets");
// ... etc

// Mount routes
app.use("/api/vulnerabilities", vulnerabilityRoutes);
app.use("/api/tickets", ticketRoutes);
// ... etc
```

### 6. Server Start
```javascript
server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 HexTrackr server running on http://localhost:${PORT}`);
});
```

## Module Dependencies

### Controllers → Services
- `VulnerabilityController` → `VulnerabilityService`, `VulnerabilityStatsService`
- `TicketController` → `TicketService`
- `BackupController` → Direct database access
- `ImportController` → `VulnerabilityService`, `TicketService`
- `DocsController` → File system operations

### Routes → Controllers
All route files import their corresponding controller:
- `routes/vulnerabilities.js` → `VulnerabilityController`
- `routes/tickets.js` → `TicketController`
- `routes/backup.js` → `BackupController`
- `routes/imports.js` → `ImportController`
- `routes/docs.js` → `DocsController`

### Services → Database
All services require database initialization:
- `DatabaseService` → SQLite database file
- `VulnerabilityService` → `db` instance
- `VulnerabilityStatsService` → `db` instance
- `TicketService` → `db` instance

## Common Pitfalls

### ❌ Wrong: Import routes before controller initialization
```javascript
// DON'T DO THIS
const vulnerabilityRoutes = require("../routes/vulnerabilities");
VulnerabilityController.initialize(db, progressTracker);
```

### ✅ Correct: Initialize controllers first
```javascript
// DO THIS
VulnerabilityController.initialize(db, progressTracker);
const vulnerabilityRoutes = require("../routes/vulnerabilities");
```

### ❌ Wrong: Use lowercase instance pattern
```javascript
// DON'T DO THIS
const vulnerabilityController = require("../controllers/vulnerabilityController");
router.get("/stats", vulnerabilityController.getStats);
```

### ✅ Correct: Use uppercase class pattern
```javascript
// DO THIS
const VulnerabilityController = require("../controllers/vulnerabilityController");
router.get("/stats", VulnerabilityController.getStats);
```

## File Structure

```
/app
├── /public
│   └── server.js (main orchestrator ~205 lines)
├── /config
│   ├── database.js
│   ├── middleware.js
│   └── websocket.js
├── /controllers (singleton pattern)
│   ├── vulnerabilityController.js
│   ├── ticketController.js
│   ├── backupController.js
│   ├── importController.js
│   └── docsController.js
├── /services (data access layer)
│   ├── databaseService.js
│   ├── vulnerabilityService.js
│   ├── vulnerabilityStatsService.js
│   └── ticketService.js
├── /routes (Express routers)
│   ├── vulnerabilities.js
│   ├── tickets.js
│   ├── backup.js
│   ├── imports.js
│   └── docs.js
└── /utils
    ├── PathValidator.js
    ├── ProgressTracker.js
    └── helpers.js
```

## Migration from Monolithic

The original `server.js` was ~3,805 lines containing all logic. The modular structure:
- Reduces `server.js` to ~205 lines
- Separates concerns into logical modules
- Maintains backward compatibility
- Uses dependency injection for testability
- Follows singleton pattern for controllers

## Testing Considerations

The modular structure enables better testing:
1. Controllers can be unit tested with mock dependencies
2. Services can be tested with in-memory SQLite
3. Routes can be integration tested with supertest
4. Utilities can be tested in isolation