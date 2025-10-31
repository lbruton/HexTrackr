# HEX-324 SPECIFICATION: Consolidate init-database.js for v1.1.0 Baseline

## WHY - Problem Statement

### Core Issue: Schema Drift Between Fresh Installs and Production

The current database initialization architecture creates **schema drift** where fresh installations don't match production reality:

- **init-database.js creates**: 16 base tables
- **Production database contains**: 22 tables (21 application + 1 SQLite artifact)
- **Gap created by**: Service-level initialization + migration scripts running at different lifecycle stages

This architectural fragmentation creates **three critical problems**:

### Problem 1: Developer Onboarding Complexity

New developers analyzing the codebase encounter **multiple sources of truth**:

1. `/app/public/scripts/init-database.js` - Claims to create "all tables"
2. Service constructors (`ciscoAdvisoryService.js:60`, `paloAltoService.js:56`, `kevService.js:44`) - Create additional tables
3. Migration scripts (`007-normalize-cisco-fixed-versions.sql`, `012-create-audit-logs.sql`) - Add more tables

**Impact**: Developer must understand 3+ initialization pathways to grasp the full schema. Documentation claims 15-16 tables, production has 22.

### Problem 2: Fresh Install vs Upgrade Inconsistency

**Fresh installation sequence**:
1. Run `init-database.js` → 16 tables created
2. Start application → Services create 3 more tables (cisco_advisories, palo_alto_advisories, kev_status)
3. Run migrations → 2 more tables (audit_logs, audit_log_config, cisco_fixed_versions)
4. **Final state**: 21 tables, initialized across multiple stages

**Existing database upgrade**:
1. Tables already exist from previous versions
2. Services detect existing tables (IF NOT EXISTS)
3. Migrations run idempotently
4. **Final state**: Same 21 tables, but different initialization path

**Impact**: Testing fresh installs requires understanding runtime table creation. Schema state depends on initialization order.

### Problem 3: Documentation vs Reality Mismatch

**Current documentation claims** (`init-database.js:459`):
```javascript
console.log("All 15 tables and 37 indexes created successfully!");
```

**Production reality** (verified via Docker exec):
- **22 total tables** (21 application + 1 SQLite artifact)
- **68 indexes** (not 37 as documented)

**Files with outdated counts**:
- `/app/public/scripts/init-database.js:459` - "All 15 tables"
- `/app/public/docs-source/architecture/data-model.md` - Missing 6 tables
- Linear issue descriptions - Inconsistent table counts

---

## User Requirements

### Primary Stakeholder: Development Team (Single Developer Context)

**User Story**: As a developer, I need a **single source of truth** for database schema so I can understand the complete data model without hunting through service constructors and migration scripts.

### Functional Requirements

#### FR-1: Single Initialization Script
**Requirement**: All application tables (21 tables) MUST be created by a single `init-database-v1.1.0.js` script.

**Rationale**: Eliminates schema drift, simplifies onboarding, provides clear audit trail.

**Acceptance Criteria**:
- Fresh Docker installation creates all 21 tables from one script
- Service constructors NO LONGER create tables (remove `initializeTables()` methods)
- Migration scripts 007 and 012 archived as "pre-v1.1.0" (tables now in baseline)

#### FR-2: Backward Compatibility
**Requirement**: Existing databases MUST continue working without data loss or schema changes.

**Rationale**: Single-user production environment cannot tolerate downtime or data loss.

**Acceptance Criteria**:
- Script detects existing database and skips table creation (IF NOT EXISTS)
- Upgrade from v1.0.x to v1.1.0 is a no-op (schema already complete)
- Backup/restore workflow continues working

#### FR-3: Accurate Documentation
**Requirement**: Documentation MUST reflect production reality (21 tables, 68 indexes).

**Rationale**: Developers need accurate reference material for architectural decisions.

**Acceptance Criteria**:
- `data-model.md` documents all 21 application tables with source annotations
- Success messages report accurate counts
- `SCHEMA_EVOLUTION.md` created showing historical progression

### Non-Functional Requirements

#### NFR-1: Safety
**Requirement**: Consolidation MUST NOT risk data loss or corruption.

**Constraints**:
- Only runs on fresh installs (empty database)
- Existing databases skip schema creation entirely
- All operations use IF NOT EXISTS safety checks
- Backup verification before any production changes

#### NFR-2: Maintainability
**Requirement**: Future schema changes MUST follow clear migration pattern.

**Pattern**:
- v1.1.0 = Baseline (21 tables)
- v1.1.x = Incremental migrations (013+)
- v1.2.0 = Next consolidation point (all v1.1.x migrations → baseline)

#### NFR-3: Performance
**Requirement**: Schema initialization MUST NOT increase application startup time.

**Constraints**:
- Table creation uses IF NOT EXISTS (instant if exists)
- Index creation idempotent
- No data migrations during v1.1.0 upgrade (schema only)

---

## Success Criteria

### Primary Success Metrics

#### SC-1: Single Source of Truth ✅
**Metric**: Fresh installation creates complete schema from one script.

**Validation**:
```bash
docker volume rm hextrackr-database
docker-compose up -d
docker exec hextrackr sqlite3 /app/data/hextrackr.db \
  "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
# Expected output: 22 (21 application + 1 lost_and_found artifact)
```

#### SC-2: Zero Data Loss on Upgrade ✅
**Metric**: Existing databases upgrade without schema changes or data loss.

**Validation**:
```bash
# Pre-upgrade
docker exec hextrackr sqlite3 /app/data/hextrackr.db "SELECT COUNT(*) FROM tickets;"
# Upgrade to v1.1.0
docker-compose down && docker-compose up -d
# Post-upgrade
docker exec hextrackr sqlite3 /app/data/hextrackr.db "SELECT COUNT(*) FROM tickets;"
# Expected: Same row count, no errors in logs
```

#### SC-3: Documentation Accuracy ✅
**Metric**: All documentation reflects production reality.

**Validation**:
- `data-model.md` lists 21 tables with complete column definitions
- `init-database-v1.1.0.js` success message: "All 21 tables and 68 indexes created"
- `SCHEMA_EVOLUTION.md` documents historical progression

### Secondary Success Metrics

#### SC-4: Service Simplification
**Metric**: Service constructors no longer manage schema.

**Validation**:
```bash
grep -r "initializeTables" app/services/
# Expected: No matches (methods removed)
```

#### SC-5: Migration Clarity
**Metric**: Pre-v1.1.0 migrations clearly archived.

**Validation**:
- Migration 007 and 012 moved to `migrations/archive/pre-v1.1.0/`
- README in archive explains consolidation point
- New migrations start at 016+ (continuing sequence)

---

## Scope Boundaries

### In Scope ✅

1. **Schema Consolidation**:
   - Create `init-database-v1.1.0.js` with all 21 tables
   - Remove service-level `initializeTables()` methods
   - Archive migrations 007 and 012

2. **Documentation Updates**:
   - Update `data-model.md` with complete 21-table schema
   - Create `SCHEMA_EVOLUTION.md` showing historical progression
   - Fix success message counts

3. **Testing**:
   - Fresh install test (clean Docker volume)
   - Upgrade test (existing database, no-op verification)
   - Backup/restore verification

4. **Investigation**:
   - `lost_and_found` table analysis (81,805 rows)
   - Determine if SQLite recovery artifact or active data
   - Document findings and cleanup decision

### Out of Scope ❌

1. **Data Migrations**: No data transformations, schema structure only
2. **Index Optimization**: Use existing index definitions (68 indexes)
3. **Column Refactoring**: No column renames/drops/type changes
4. **Multi-Database Support**: SQLite-only (no PostgreSQL/MySQL variants)
5. **Migration Reruns**: Pre-v1.1.0 migrations archived, not rerun
6. **Service Architecture Changes**: Only remove `initializeTables()`, no other refactoring

### Dependencies

**Upstream Dependencies**:
- Migration 007 (`cisco_fixed_versions` table schema)
- Migration 012 (`audit_logs`, `audit_log_config` table schema)
- Service schema definitions (Cisco, Palo Alto, KEV)

**Downstream Impact**:
- Future migrations (013+) will reference v1.1.0 baseline
- Developer onboarding documentation references single init script
- Backup/restore processes unchanged

---

## Risk Assessment

### Risk 1: Production Database Corruption 🔴 HIGH
**Likelihood**: Low (single-user, Docker named volume)
**Impact**: Critical (data loss unacceptable)

**Mitigation Strategy**:
1. **NO direct production testing** - test on clean Docker volume first
2. Backup verification before v1.1.0 upgrade
3. IF NOT EXISTS safety checks prevent duplicate table creation
4. Rollback plan: Restore from backup if issues detected

**Contingency**: Keep v1.0.x Docker image available for instant rollback

### Risk 2: Schema Drift During Development 🟡 MEDIUM
**Likelihood**: Medium (development may add tables before consolidation complete)
**Impact**: Medium (consolidation script becomes stale)

**Mitigation Strategy**:
1. Freeze schema changes during consolidation implementation
2. Complete consolidation in single session (4-6 hours)
3. Verify production schema dump immediately before implementation

**Contingency**: Re-export production schema if tables added during implementation

### Risk 3: Migration Script Confusion 🟡 MEDIUM
**Likelihood**: Low (single developer)
**Impact**: Low (documentation clarifies)

**Mitigation Strategy**:
1. Clear archive documentation: "Pre-v1.1.0 migrations - DO NOT RUN on fresh installs"
2. `SCHEMA_EVOLUTION.md` explains consolidation points
3. Migration numbering continues (016+), no renumbering

**Contingency**: README in archive directory explains when to reference archived migrations

### Risk 4: Lost and Found Table Mystery 🟢 LOW
**Likelihood**: N/A (already exists)
**Impact**: Low (81,805 rows, unknown purpose)

**Mitigation Strategy**:
1. Separate investigation task before consolidation
2. Sample 10 rows to identify data structure
3. Cross-reference with application logs (past corruption event?)
4. Document findings before DROP decision

**Contingency**: If data is critical, export to CSV before cleanup

---

## Definition of Done

### Implementation Complete ✅
- [ ] `init-database-v1.1.0.js` created with all 21 tables
- [ ] Service `initializeTables()` methods removed
- [ ] Migrations 007 and 012 archived with documentation
- [ ] `data-model.md` updated with complete schema
- [ ] `SCHEMA_EVOLUTION.md` created
- [ ] Success messages report accurate counts
- [ ] `lost_and_found` table investigated and documented

### Testing Complete ✅
- [ ] Fresh install test passes (21 tables created)
- [ ] Upgrade test passes (no-op, no errors)
- [ ] Backup test passes (restore creates all tables)
- [ ] Docker restart test passes (no schema changes)

### Documentation Complete ✅
- [ ] All files reference v1.1.0 as baseline
- [ ] Migration strategy documented for v1.1.x → v1.2.0
- [ ] Linear issue HEX-324 closed with summary
- [ ] Changelog entry created for v1.1.0

### Production Ready ✅
- [ ] Code review complete (self-review with checklist)
- [ ] Backup verified before deployment
- [ ] Rollback plan tested (Docker image revert)
- [ ] Monitoring in place (log analysis for errors)

---

## Timeline & Effort Estimate

**Target Completion**: Before v1.1.0 release
**Estimated Effort**: 4-6 hours (implementation + testing)
**Breakdown**:
- Schema consolidation: 1 hour
- Service refactoring: 1 hour
- Documentation updates: 1 hour
- Testing (fresh + upgrade): 1 hour
- `lost_and_found` investigation: 0.5 hour
- Buffer for unexpected issues: 1.5 hours

**Dependencies**: No blocking dependencies
**Parallel Work**: Can proceed immediately

---

## Related Issues & Context

### Linear Issues
- **HEX-324** (this issue): Schema consolidation for v1.1.0
- **DOCS-67**: Fixed table categorization (revealed schema drift)
- **HEX-254**: Unified logging system (Migration 012 - audit_logs)
- **HEX-287**: Cisco fixed versions normalization (Migration 007)

### Historical Context
- **v1.0.0-v1.0.62**: 16 base tables in `init-database.js`
- **v1.0.63**: Added `cisco_advisories` (service initialization)
- **v1.0.63**: Added `palo_alto_advisories` (service initialization)
- **v1.0.67**: Added `audit_logs`, `audit_log_config` (Migration 012)
- **v1.0.79**: Added `cisco_fixed_versions` (Migration 007)
- **v1.1.0**: Consolidation point (all 21 tables in baseline)

### Migration Philosophy
HexTrackr uses **incremental migrations** with **periodic consolidation**:
- Minor versions (v1.0.x, v1.1.x): Incremental migrations
- Major/minor milestones (v1.1.0, v1.2.0): Consolidate migrations into baseline
- Keeps init script manageable while preserving migration history

---

## Appendix: Production Schema Verification

**Verification Method**: Docker exec on production database
**Date**: 2025-10-22
**Database Location**: Docker named volume `hextrackr-database:/app/data/hextrackr.db`

**Command Used**:
```bash
docker exec hextrackr sqlite3 /app/data/hextrackr.db ".schema" > /tmp/hextrackr-production-schema.sql
docker exec hextrackr sqlite3 /app/data/hextrackr.db \
  "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;" > /tmp/hextrackr-tables.txt
```

**Results**:
- **22 tables total** (21 application + 1 SQLite artifact)
- **68 indexes** (includes composite and partial indexes)
- **1 trigger** (`user_preferences_updated_at`)

**Table List** (`/tmp/hextrackr-tables.txt`):
1. audit_log_config
2. audit_logs
3. cisco_advisories
4. cisco_fixed_versions
5. email_templates
6. kev_status
7. lost_and_found ⚠️
8. palo_alto_advisories
9. sync_metadata
10. ticket_templates
11. ticket_vulnerabilities
12. tickets
13. user_preferences
14. users
15. vendor_daily_totals
16. vulnerabilities
17. vulnerabilities_current
18. vulnerability_daily_totals
19. vulnerability_imports
20. vulnerability_snapshots
21. vulnerability_staging
22. vulnerability_templates

**Index Count Verification**:
```bash
docker exec hextrackr sqlite3 /app/data/hextrackr.db \
  "SELECT COUNT(*) FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%';"
# Output: 68
```

---

## Notes

### Why v1.1.0 vs v1.0.x?
Following semantic versioning, this is a **minor version bump** because:
- **Backward compatible**: Existing databases continue working
- **New baseline**: Establishes clean schema foundation
- **No breaking changes**: API and functionality unchanged
- **Semantic milestone**: Clean slate for v1.1.x feature development

### Why Not Data Migrations?
This consolidation is **schema-only** because:
- All tables already exist in production (no structural changes)
- Service initialization creates tables idempotently (IF NOT EXISTS)
- Migrations 007 and 012 already ran in production
- Goal is consolidation, not transformation

### Post-v1.1.0 Development Pattern
After consolidation, new tables follow this pattern:
1. Create migration script: `016-add-feature.sql`
2. Run in development: `npm run db:migrate`
3. Test in staging
4. Deploy to production (migration runs automatically)
5. At v1.2.0, consolidate 016+ migrations into baseline
6. Repeat cycle

This keeps baseline clean while preserving detailed migration history.
