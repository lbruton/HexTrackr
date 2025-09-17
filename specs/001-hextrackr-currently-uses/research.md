# Research: Backend Modularization

**Date**: 2025-09-16
**Feature**: Backend Modularization
**Research Status**: Complete

## Executive Summary

Analysis of the monolithic server.js (3,809 lines) reveals a well-structured but tightly coupled Express application with 29 API endpoints across 5 main feature areas. The modularization strategy will use a layered architecture pattern (routes → controllers → services) to achieve the required separation of concerns while maintaining all existing functionality.

## 1. Module Boundary Analysis

### Decision: Feature-Based Module Boundaries

**Rationale**: Natural cohesion exists around business features
**Alternatives Considered**:

- Technical layer separation (all routes together) - rejected for poor cohesion
- Microservices - rejected as overkill for current scale

### Identified Boundaries

1. **Tickets Module** (7 endpoints, ~500 lines)
   - CRUD operations for maintenance tickets
   - Device management within tickets
   - Import/export functionality

2. **Vulnerabilities Module** (9 endpoints, ~1200 lines)
   - CRUD operations for vulnerabilities
   - Statistics and trending
   - CSV import with staging
   - Bulk operations

3. **Backup/Restore Module** (6 endpoints, ~400 lines)
   - Data export functionality
   - Restore operations
   - Statistics reporting

4. **Documentation Module** (3 endpoints, ~200 lines)
   - Documentation serving
   - Stats generation
   - HTML rendering

5. **Core/Shared Module** (~1500 lines)
   - Database initialization
   - Common middleware
   - Utility functions
   - PathValidator

## 2. Dependency Mapping

### Decision: Layered Architecture with Dependency Injection

**Rationale**: Prevents circular dependencies through unidirectional flow
**Alternatives Considered**:

- Event-driven architecture - rejected as unnecessary complexity
- Direct imports - rejected for tight coupling

### Dependency Flow

```
Routes → Controllers → Services → Database
         ↓              ↓
      Middleware    Utilities
```

### Shared Dependencies

- **PathValidator**: Used by 8+ endpoints (extract to utils)
- **Database connection**: Used by all modules (extract to services)
- **Progress tracking**: Used by import operations (extract to utils)
- **Error handling**: Used globally (extract to middleware)

## 3. API Contract Analysis

### Decision: Preserve All Existing Contracts

**Rationale**: Zero breaking changes requirement
**Alternatives Considered**:

- API versioning - rejected as unnecessary
- Contract evolution - rejected for backward compatibility

### Endpoint Inventory (29 total)

```
GET    /health
GET    /api/vulnerabilities/stats
GET    /api/vulnerabilities/recent-trends
GET    /api/vulnerabilities/trends
GET    /api/vulnerabilities
GET    /api/vulnerabilities/resolved
POST   /api/vulnerabilities/import
POST   /api/vulnerabilities/import-staging
DELETE /api/vulnerabilities/clear
GET    /api/imports
GET    /api/tickets
POST   /api/tickets
PUT    /api/tickets/:id
DELETE /api/tickets/:id
POST   /api/tickets/migrate
POST   /api/import/tickets
POST   /api/import/vulnerabilities
GET    /api/sites
GET    /api/locations
GET    /api/backup/stats
GET    /api/backup/vulnerabilities
GET    /api/backup/tickets
GET    /api/backup/all
POST   /api/restore
DELETE /api/backup/clear/:type
GET    /docs-html
GET    /docs-html/*.html
GET    /api/docs/stats
GET    / (redirect)
```

## 4. Database Operation Patterns

### Decision: Repository Pattern for Data Access

**Rationale**: Centralizes database logic, enables testing
**Alternatives Considered**:

- ORM (Sequelize) - rejected for added complexity
- Direct SQL in controllers - rejected for poor separation

### Common Patterns Identified

1. **Transaction wrapper** - Used for multi-statement operations
2. **Prepared statements** - Used for all parameterized queries
3. **Batch inserts** - Used for import operations
4. **Streaming queries** - Used for large result sets
5. **Schema migrations** - Runtime ALTER TABLE statements

### Database Service Structure

```javascript
class DatabaseService {
  runTransaction(callback)
  prepare(sql, params)
  batchInsert(table, records)
  stream(sql, params, onRow)
}
```

## 5. Middleware Extraction Strategy

### Decision: Centralized Middleware Configuration

**Rationale**: Single source of truth for cross-cutting concerns
**Alternatives Considered**:

- Inline middleware - rejected for duplication
- Module-specific middleware - rejected for inconsistency

### Identified Middleware

1. **Security Headers** - Applied globally
2. **CORS Configuration** - Applied globally
3. **Body Parsing** - JSON and URL-encoded
4. **File Upload** - Multer for CSV imports
5. **Static File Serving** - For frontend assets
6. **Error Handling** - Global error catcher
7. **Request Logging** - Morgan for access logs
8. **Compression** - gzip for responses

## 6. Testing Strategy

### Decision: Contract-First Testing with Jest

**Rationale**: Ensures API compatibility during refactoring
**Alternatives Considered**:

- Unit-only testing - rejected as insufficient
- E2E-only testing - rejected as too slow

### Test Structure

```
tests/
├── contract/        # API contract tests (first priority)
│   ├── tickets.test.js
│   ├── vulnerabilities.test.js
│   └── backup.test.js
├── integration/     # Service integration tests
│   ├── database.test.js
│   └── import.test.js
└── unit/           # Unit tests for utilities
    ├── PathValidator.test.js
    └── helpers.test.js
```

### Test Execution Order

1. Write contract tests that verify current API behavior
2. Run tests against monolithic server (should pass)
3. Refactor to modules
4. Run same tests against modular server (must pass)

## 7. Performance Considerations

### Decision: Lazy Loading with Module Caching

**Rationale**: Minimizes startup time impact
**Alternatives Considered**:

- Eager loading all modules - rejected for startup penalty
- Dynamic imports - rejected for complexity

### Optimization Strategies

1. **Module caching** - Load once, reuse instances
2. **Connection pooling** - Reuse database connections
3. **Route indexing** - Fast route matching
4. **Middleware ordering** - Static assets before dynamic

## 8. Migration Strategy

### Decision: Incremental Module Extraction

**Rationale**: Reduces risk, allows validation at each step
**Alternatives Considered**:

- Big bang refactoring - rejected as too risky
- Parallel implementation - rejected for maintenance burden

### Migration Order

1. Extract utilities and helpers (low risk)
2. Extract middleware configuration
3. Extract documentation module (isolated)
4. Extract backup module (few dependencies)
5. Extract tickets module
6. Extract vulnerabilities module (largest)
7. Wire up modular server.js

## Resolved Clarifications

All NEEDS CLARIFICATION items from the specification have been resolved through research:

1. **Module size limit (500 lines)**: Achievable with proposed boundaries
2. **Performance threshold (10%)**: Lazy loading strategy ensures compliance
3. **Memory overhead (5%)**: Module caching minimizes duplication
4. **Circular dependencies**: Layered architecture prevents cycles

## Next Steps

Proceed to Phase 1 (Design & Contracts) to generate:

- Data model documentation
- API contracts in OpenAPI format
- Contract test specifications
- Quickstart guide for developers

---

*Research complete. All technical decisions documented with rationale.*
