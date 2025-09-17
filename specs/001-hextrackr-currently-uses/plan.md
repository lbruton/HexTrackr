# Implementation Plan: Backend Modularization

**Branch**: `001-hextrackr-currently-uses` | **Date**: 2025-09-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-hextrackr-currently-uses/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, CLAUDE.md
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Transform HexTrackr's monolithic backend (server.js ~3800 lines) into a modular Express.js architecture to improve maintainability, testability, and AI agent accessibility. The modularization will separate concerns into logical modules (routes, controllers, services, middleware) while maintaining all existing functionality, API contracts, and performance characteristics per Constitution v7.0.0 requirements.

## Technical Context

**Language/Version**: Node.js 18.x / JavaScript ES6+
**Primary Dependencies**: Express.js 4.18.2, SQLite3 5.1.7, Socket.io 4.8.1, Multer 1.4.5, Jest 30.1.3
**Storage**: SQLite database (data/hextrackr.db)
**Testing**: Jest for unit/integration/contract tests, Playwright for E2E
**Target Platform**: Docker container (Linux) - Port 8989 ONLY
**Project Type**: web (backend API server)
**Performance Goals**: <2s API response time (Article IX), 10k records/min CSV import
**Constraints**: 10% max startup time increase, 5% max memory increase (<512MB), 500 lines max per module
**Scale/Scope**: ~3800 lines to modularize, ~30 API endpoints, 5 main feature areas

## Constitution Check v7.0.0

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Article I: Docker-First Infrastructure ✅

- [x] All Node.js operations via Docker containers
- [x] Application runs on port 8989 exclusively
- [x] npm commands via docker-compose exec
- [x] Testing in containerized environments
- [x] No direct host system Node.js execution

### Article II: Test-First Development Doctrine ✅

- [x] Tests written before implementation (T006-T015 complete)
- [x] BEFORE STATE documentation in test files
- [x] AFTER STATE documentation in test files
- [x] EXPECTATIONS defined in all tests
- [ ] Visual validation screenshots (backend-only, N/A for this spec)

### Article III: Memory and Context Governance ✅

- [x] Context bundles checked first
- [x] Memento searched for patterns
- [x] CLAUDE.md to be updated
- [x] Recent commits reviewed
- [x] Session will be saved to Memento

### Article IV: Git Standards and Branch Discipline ✅

- [x] Feature branch: 001-hextrackr-currently-uses
- [x] No direct main/master commits
- [x] Branch naming follows [number]-[description]
- [x] Commit standards will be enforced
- [x] No operations without user permission

### Article V: Documentation and Changelog Mandate ⚠️

- [ ] Feature documentation in /app/public/docs-source required
- [ ] CHANGELOG.md updates required for current version
- [ ] Markdown format with code examples
- [ ] API documentation for modularized endpoints
- [ ] Version-specific documentation

### Article VI: Operational Safety Protocols ✅

- [x] No destructive operations without approval
- [x] Backup strategy for refactoring
- [x] Rollback capability maintained
- [x] Safe operations identified

### Article VII: Tool Usage and Efficiency ✅

- [x] Specialized agents for domain tasks
- [x] Parallel execution for [P] tasks
- [x] TodoWrite for task management
- [x] Batch operations for efficiency

### Article VIII: Agent Coordination ✅

- [x] Parallel [P] task marking implemented
- [x] File conflict prevention planned
- [x] Clear task boundaries defined
- [x] Agent quality standards enforced

### Article IX: Quality Gates ⚠️

- [ ] 80% test coverage requirement
- [x] Performance benchmarks (<2s API, 10k/min CSV)
- [ ] ESLint configuration needed
- [ ] Security scanning required
- [x] WCAG AA compliance (backend API, limited applicability)

### Article X: CI/CD ⚠️

- [ ] Pre-commit hooks needed
- [ ] Lint checks required
- [ ] Security scan integration
- [x] Docker image building
- [ ] Pipeline configuration needed

### Article XI: Spec Workflow ✅

- [x] /specify completed
- [x] /plan in progress
- [x] /tasks to follow
- [x] [P] parallel marking used
- [x] No implementation without specification

## Project Structure

### Documentation (this feature)

```
specs/001-hextrackr-currently-uses/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (existing, to be updated)
├── data-model.md        # Phase 1 output (existing, to be updated)
├── quickstart.md        # Phase 1 output (existing, to be updated)
├── contracts/           # Phase 1 output (to be created)
└── tasks.md             # Phase 2 output (/tasks command - existing, to be updated)
```

### Source Code (repository root)

```
# Current Structure (Monolithic):
app/
└── public/
    └── server.js        # ~3800 lines to modularize

# Target Structure (Modular) - Already created in T001:
app/
├── server.js           # Main entry (~200 lines)
├── config/             # ✅ Created
│   ├── database.js     # Database configuration
│   ├── middleware.js   # Middleware setup
│   ├── server.js       # Server configuration
│   └── websocket.js    # WebSocket configuration
├── routes/             # ✅ Created
│   ├── tickets.js      # Ticket endpoints
│   ├── vulnerabilities.js # Vulnerability endpoints
│   ├── backup.js       # Backup/restore endpoints
│   ├── docs.js         # Documentation endpoints
│   └── health.js       # Health check endpoints
├── controllers/        # ✅ Created
│   ├── ticketsController.js
│   ├── vulnerabilitiesController.js
│   ├── backupController.js
│   ├── docsController.js
│   └── healthController.js
├── services/           # ✅ Created
│   ├── databaseService.js
│   ├── fileService.js
│   ├── progressService.js
│   ├── validationService.js
│   └── [domain]Service.js
├── middleware/         # ✅ Created
│   ├── auth.js         # Future authentication
│   ├── validation.js   # Request validation
│   ├── errorHandler.js # Error handling
│   └── rateLimit.js    # Rate limiting
└── utils/              # ✅ Created
    ├── PathValidator.js # Path security
    ├── ProgressTracker.js # Import progress
    ├── helpers.js      # Utility functions
    └── constants.js    # Application constants

tests/                  # ✅ Created in T004
├── contract/          # ✅ T006-T011 complete
├── integration/       # ✅ T012-T015 complete
└── unit/             # To be created during implementation
```

**Structure Decision**: Web application (backend API) - modular Express.js architecture

## Phase 0: Outline & Research

### Research Tasks Identified

1. **Docker-first execution patterns** for all npm/node commands
2. **Jest configuration** for 80% coverage enforcement
3. **ESLint/Prettier setup** for code quality gates
4. **Pre-commit hooks** implementation strategy
5. **Documentation generation** for /app/public/docs-source
6. **Performance monitoring** for <2s API response validation
7. **Security scanning** integration options
8. **CHANGELOG.md automation** best practices

### Research Consolidation Approach

Each research item will be documented in `research.md` with:

- Decision: Selected approach
- Rationale: Why chosen for HexTrackr
- Alternatives: Other options considered
- Constitutional compliance: How it meets v7.0.0 requirements

**Output**: research.md with constitutional compliance strategies

## Phase 1: Design & Contracts

*Prerequisites: research.md complete*

### Data Model Extraction (data-model.md)

From the monolithic server.js, extract and document:

- **Tickets**: Entity structure, validation rules, state transitions
- **Vulnerabilities**: Fields, relationships, import/export schemas
- **Imports**: Progress tracking, batch processing structures
- **Backups**: Metadata, restore validation schemas
- **Configuration**: Settings, environment variables

### API Contract Generation (/contracts/)

Generate OpenAPI specifications for:

- Ticket endpoints (6 endpoints)
- Vulnerability endpoints (8 endpoints)
- Backup/restore endpoints (4 endpoints)
- Import/export endpoints (4 endpoints)
- Documentation endpoints (5 endpoints)
- Health endpoints (4 endpoints)

### Contract Test Validation

- ✅ T006-T011: Contract tests already created (failing as expected)
- Tests cover all API endpoints with proper TDD approach
- BEFORE/AFTER states documented in test files

### Quickstart Documentation (quickstart.md)

- Docker-first execution commands
- Module verification steps
- Performance validation (<2s API, 10k/min CSV)
- Test coverage verification (80% target)

### CLAUDE.md Updates

- Add modular architecture patterns
- Include Docker execution requirements
- Document test coverage expectations
- Add performance benchmarks

**Output**: Updated data-model.md, /contracts/*, quickstart.md, CLAUDE.md

## Phase 2: Task Planning Approach

*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy with Constitutional Compliance**:

- Load existing tasks.md (T001-T065 already defined)
- Add constitutional compliance tasks:
  - Documentation tasks (Article V)
  - Quality gate setup (Article IX)
  - CI/CD configuration (Article X)
  - Performance validation (Article IX)
- Each new task follows Docker-first execution (Article I)
- Maintain [P] marking for parallel execution (Article VIII)

**Constitutional Enhancement Tasks to Add**:

- T066-T072: Quality gates and documentation
- T073-T080: CI/CD and performance monitoring
- All tasks include docker-compose exec prefix

**Ordering Strategy**:

- Infrastructure and quality gates first
- TDD maintained (tests before implementation)
- Documentation alongside implementation
- Performance validation last

**Estimated Output**: Original 65 tasks + 15 constitutional compliance tasks = 80 total tasks

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (enhanced tasks.md with constitutional compliance)
**Phase 4**: Implementation (Docker-first, TDD, quality gates)
**Phase 5**: Validation (80% coverage, <2s API, documentation complete)

## Complexity Tracking

*Constitutional compliance requires additional complexity*

| Requirement | Why Needed | Impact |
|------------|------------|---------|
| Docker-first execution | Article I mandate | All commands prefixed with docker-compose exec |
| 80% test coverage | Article IX quality gate | Additional unit tests beyond contract/integration |
| Documentation generation | Article V requirement | Extra tasks for docs-source updates |
| Pre-commit hooks | Article X CI/CD | Setup and configuration overhead |
| Performance monitoring | Article IX benchmarks | Runtime validation framework needed |

## Progress Tracking

*This checklist is updated during execution flow*

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - approach defined)
- [ ] Phase 3: Tasks generated (/tasks command - to be enhanced)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS (with documentation/quality tasks needed)
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

**Constitutional Compliance Status**:

- [x] Article I: Docker-first enforced
- [x] Article II: TDD implemented
- [x] Article III: Memory/context managed
- [x] Article IV: Git standards followed
- [⚠️] Article V: Documentation tasks needed
- [x] Article VI: Safety protocols in place
- [x] Article VII: Tool efficiency optimized
- [x] Article VIII: Agent coordination ready
- [⚠️] Article IX: Quality gates partial
- [⚠️] Article X: CI/CD setup needed
- [x] Article XI: Spec workflow complete

---
*Based on Constitution v7.0.0 - See `.specify/memory/constitution.md`*
*Previous plan enhanced with full constitutional compliance*
