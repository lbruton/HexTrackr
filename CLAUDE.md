# CLAUDE - HexTrackr AI Development Assistant

## Project Overview

HexTrackr is a production-ready vulnerability and ticket management system featuring:

- **Core Stack**: Express.js (port 8989), Socket.io, SQLite3, AG-Grid Community, Tabler Core
- **Performance**: 100+ rows/second import with staging tables and batch processing
- **Architecture**: Monolithic Express app with rollover database design
- **Methodology**: S-R-P-T workflow (Specification→Research→Planning→Tasks)

## Quick Start

```bash
# Development
docker-compose up -d         # Start containers (port 8989)
npm run dev                  # Development with nodemon
npm run init-db              # Initialize database

# Testing & Quality
npm run eslint               # JavaScript linting
npm run stylelint            # CSS linting
npm run security:check       # Security audit
npm run test                 # Jest unit tests
npm run test:e2e            # Playwright E2E tests

# Git Workflow
git checkout copilot         # Working branch (never use main)
git commit -m "type: message" # Small, focused commits
```

## S-R-P-T Development Methodology

### Boot Commands

- `/specify [feature]` - Create specification (WHAT/WHY)
- `/research [spec]` - Technical analysis (HOW to validate)
- `/plan [spec] [research]` - Implementation plan (HOW to build)
- `/tasks [plan]` - Execution tasks (DO)

### Workflow Pattern

```
Planning/
├── Specification/   # S001-xxx.md (Requirements)
├── Research/        # R001-xxx.md (Technical analysis)
├── Plans/           # P001-xxx.md (Implementation)
└── Tasks/           # T001-xxx.md (Execution)
```

## Database Architecture

### Core Tables

- `vulnerabilities_current` - Active vulnerabilities with lifecycle states
- `vulnerability_snapshots` - Historical records for all scans
- `vulnerability_staging` - Temporary import processing (batch of 1000)
- `vulnerability_daily_totals` - Aggregated metrics per scan date
- `tickets` - Support ticket management

### Import Pipeline

1. **Bulk Load**: CSV → Staging table (transaction wrapped)
2. **Batch Process**: Staging → Current/Snapshots (1000 records/batch)
3. **Deduplication**: Enhanced unique keys with confidence scoring
4. **Lifecycle**: active → grace_period → resolved states

## API Architecture

```javascript
// Core Endpoints
GET    /api/vulnerabilities        // List with pagination
GET    /api/vulnerabilities/stats  // Statistics dashboard
POST   /api/vulnerabilities/import // CSV import (WebSocket progress)
GET    /api/tickets                // Ticket management
GET    /health                     // Health check

// Real-time via Socket.io
- progress-update    // Import progress
- progress-complete  // Import finished
- progress-error     // Import failed
```

## Key Technologies

### Frontend

- **AG-Grid Community** - Advanced data tables
- **Tabler Core** - UI design system
- **Chart.js & ApexCharts** - Visualizations
- **DOMPurify** - XSS protection
- **SortableJS** - Drag & drop

### Backend

- **Express.js** - Web framework
- **Socket.io** - Real-time WebSocket
- **SQLite3** - Database
- **Multer** - File uploads (100MB limit)
- **Express Rate Limit** - API throttling

## File Structure

```
/app/public/
├── server.js              # Express server
├── *.html                 # Pages
├── scripts/
│   ├── shared/            # Reusable components
│   ├── pages/             # Page-specific logic
│   └── utils/             # Utilities
├── styles/
│   ├── shared/            # Global styles
│   ├── pages/             # Page styles
│   └── utils/             # Responsive utilities
└── vendor/                # Third-party libraries

/Planning/                 # S-R-P-T Methodology
├── Specification/         # Requirements (WHAT/WHY)
├── Research/              # Analysis (HOW to validate)
├── Plans/                 # Implementation (HOW to build)
└── Tasks/                 # Execution (DO)

/data/hextrackr.db         # SQLite database
```

## Performance Optimizations

### Import Pipeline

- **Staging Tables**: Bulk load with transactions
- **Batch Processing**: 1000 records per batch
- **Progress Tracking**: Real-time WebSocket updates
- **Deduplication**: Multi-tier unique key generation

### Key Functions

- `bulkLoadToStagingTable()` - Transaction-wrapped bulk insert
- `processStagingToFinalTables()` - Batch processor
- `generateEnhancedUniqueKey()` - Confidence-based deduplication
- `ProgressTracker` - WebSocket session management

## Security Features

- `PathValidator` class for path traversal protection
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- File upload restrictions

## Tool Integration

### Memory & Context

- **Memento**: Semantic search for project knowledge
- **Context7**: Framework documentation
- **Ref**: GitHub repository patterns

### Analysis & Testing

- **Zen Suite**: Code review, debugging, security audit
- **Codacy**: Static code analysis
- **Playwright**: E2E browser testing
- **ESLint/Stylelint**: Code quality

## Development Patterns

### Error Handling

```javascript
try {
    // Operation with progress tracking
    progressTracker.updateProgress(sessionId, progress, message);
} catch (error) {
    progressTracker.errorSession(sessionId, error.message);
}
```

### Database Queries

```javascript
// Always use parameterized queries
db.run("UPDATE table SET field = ? WHERE id = ?", [value, id]);
```

### Real-time Updates

```javascript
// Socket.io progress events
io.to(`progress-${sessionId}`).emit("progress-update", data);
```

## Current Version

**1.0.13** - Production ready with enhanced import pipeline

## Strategic Recommendations

- Consider PostgreSQL migration for better concurrency
- Implement Redis caching layer
- Add API versioning
- Consider microservices for scaling

---
*Optimized for rapid development with systematic S-R-P-T methodology*
