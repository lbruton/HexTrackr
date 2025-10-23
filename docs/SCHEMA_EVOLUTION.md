# HexTrackr Schema Evolution History

This document tracks the progression of HexTrackr's database schema from v1.0.0 to present, showing consolidation points and migration patterns.

## Version History

### v1.0.0 - v1.0.62: Base Schema (16 tables)

**Initialization**: `init-database.js` (single script)

**Tables**:
1. tickets
2. vulnerability_imports
3. vulnerabilities
4. ticket_vulnerabilities
5. vulnerability_snapshots
6. vulnerabilities_current
7. vulnerability_daily_totals
8. vulnerability_staging
9. email_templates
10. kev_status
11. sync_metadata
12. ticket_templates
13. vulnerability_templates
14. users
15. user_preferences
16. vendor_daily_totals (added in Migration 008)

**Indexes**: 49

**Key Features**:
- Vulnerability rollover architecture (snapshots, current, daily totals)
- KEV integration (CISA Known Exploited Vulnerabilities)
- Template system (email, ticket, vulnerability)
- User authentication with Argon2id hashing

---

### v1.0.63: Vendor Intelligence (+ 2 tables)

**Changes**:
- Added `cisco_advisories` table (ciscoAdvisoryService runtime initialization)
- Added `palo_alto_advisories` table (paloAltoService runtime initialization)
- Migration 005: Cisco advisory infrastructure
- Migration 006: Palo Alto advisory infrastructure

**Total Tables**: 18
**Indexes**: 59

**Initialization Pathways**: 2 (init-database.js + service constructors)

**Impact**: Schema drift begins - documentation claims 16 tables, production has 18.

---

### v1.0.67: Audit Logging (+ 2 tables)

**Changes**:
- Migration 012: Added `audit_logs` table
- Migration 012: Added `audit_log_config` table
- HEX-254: Unified logging system with AES-256-GCM encryption
- Retention policy enforcement (default: 30 days)

**Total Tables**: 20
**Indexes**: 65

**Initialization Pathways**: 3 (init-database.js + services + migrations)

**Impact**: Developer onboarding requires reading 3+ files to understand schema.

---

### v1.0.79: Cisco Fix Normalization (+ 1 table)

**Changes**:
- Migration 007: Added `cisco_fixed_versions` table
- HEX-287: Fix data corruption from multi-OS-family CVEs
- 3NF normalization of Cisco fix versions
- Foreign key relationship to `cisco_advisories`

**Total Tables**: 21
**Indexes**: 68

**Initialization Pathways**: 3 (unchanged, complexity peak)

**Impact**: Multi-OS-family CVEs (e.g., CVE-2025-20352 affecting both IOS and IOS XE) now store separate rows per OS family, preventing data overwrites.

---

### v1.1.0: CONSOLIDATION BASELINE (21 tables)

**Major Change**: All tables consolidated into `init-database-v1.1.0.js`

**Rationale**:
- Eliminate schema drift (3 initialization pathways → 1)
- Fix documentation accuracy (claimed 15-16 tables, actually 21)
- Simplify developer onboarding (single source of truth)
- Establish clear migration path for v1.1.x releases

**Consolidated Tables** (previously runtime-created):
- `cisco_advisories` (from ciscoAdvisoryService constructor)
- `palo_alto_advisories` (from paloAltoService constructor)
- `cisco_fixed_versions` (from Migration 007)
- `audit_logs` (from Migration 012)
- `audit_log_config` (from Migration 012)

**Archived Migrations**:
- `007-normalize-cisco-fixed-versions.sql` → `migrations/archive/pre-v1.1.0/`
- `012-create-audit-logs.sql` → `migrations/archive/pre-v1.1.0/`

**Service Refactoring**:
- Removed `ciscoAdvisoryService.initializeTables()` method
- Removed `paloAltoService.initializeTables()` method
- Removed `kevService.initializeTables()` method (redundant)

**Schema Organization** (6 functional categories):
- Core Business: 3 tables (tickets, ticket_templates, ticket_vulnerabilities)
- Vulnerability Management: 9 tables
- Vendor Intelligence: 3 tables (cisco_advisories, cisco_fixed_versions, palo_alto_advisories)
- CISA Integration: 2 tables (kev_status, sync_metadata)
- Authentication & Preferences: 2 tables (users, user_preferences)
- Security & Audit: 2 tables (audit_logs, audit_log_config)

**Total Tables**: 21 (baseline)
**Total Indexes**: 68 (67 user-created + 1 auto-generated)
**Total Triggers**: 1 (user_preferences_updated_at)

**Initialization Pathway**: 1 (init-database-v1.1.0.js)

**Linear Issue**: [HEX-324](https://linear.app/hextrackr/issue/HEX-324/consolidate-init-databasejs-with-all-runtime-tables-for-v110-baseline)

---

## Migration Philosophy

HexTrackr follows a **periodic consolidation pattern**:

```
v1.0.0 ──┐
         ├─> Incremental migrations (001-015)
v1.0.99 ──┘

v1.1.0 ───> CONSOLIDATION (all migrations → baseline)

v1.1.1 ──┐
         ├─> Incremental migrations (016+)
v1.1.99 ──┘

v1.2.0 ───> CONSOLIDATION (all v1.1.x migrations → baseline)
```

**Benefits**:
- **Fresh installs**: Complete schema from one script (no migration execution)
- **Existing databases**: Incremental migration path preserved
- **Migration history**: Archived for forensic analysis and upgrade paths
- **Developer onboarding**: Single source of truth reduces cognitive load

**Post-v1.1.0 Pattern**:
1. New feature requires table/column → Create `016-add-feature.sql`
2. Run migration: `npm run db:migrate`
3. Migration applied automatically on deployment
4. At v1.2.0: Consolidate 016+ migrations into `init-database-v1.2.0.js`

---

## Schema Statistics

| Version | Tables | Indexes | Triggers | Initialization Method |
|---------|--------|---------|----------|-----------------------|
| v1.0.0 | 15 | 37 | 1 | init-database.js |
| v1.0.62 | 16 | 49 | 1 | init-database.js + Migration 008 |
| v1.0.63 | 18 | 59 | 1 | init-database.js + Services |
| v1.0.67 | 20 | 65 | 1 | init-database.js + Services + Migration 012 |
| v1.0.79 | 21 | 68 | 1 | init-database.js + Services + Migrations 007/012 |
| **v1.1.0** | **21** | **68** | **1** | **init-database-v1.1.0.js (consolidated)** |

**Index Breakdown (v1.1.0)**:
- Vulnerability tables: 25 indexes
- Vendor intelligence: 7 indexes
- Ticket management: 10 indexes
- Audit logging: 6 indexes
- KEV integration: 4 indexes
- Templates: 9 indexes
- Authentication: 4 indexes
- Other (junction, sync): 3 indexes
- **Total**: 68 indexes

---

## Future Consolidation Plan

**v1.2.0 Consolidation** (projected):
- Consolidate v1.1.x migrations (016+) into baseline
- Archive v1.1.x migrations to `migrations/archive/pre-v1.2.0/`
- Update init script to `init-database-v1.2.0.js`
- Pattern repeats for v1.3.0, v2.0.0, etc.

**Triggers for Consolidation**:
- Major/minor version milestones (v1.1.0, v1.2.0, v2.0.0)
- 10+ migrations accumulated since last consolidation
- Significant architectural refactoring
- Documentation refresh cycles

**Consolidation Checklist**:
1. Export production schema: `sqlite3 hextrackr.db .schema > schema-v1.x.sql`
2. Create new baseline script: `init-database-vX.Y.0.js`
3. Archive incremental migrations: `migrations/archive/pre-vX.Y.0/`
4. Remove service `initializeTables()` methods (if any)
5. Update documentation: `data-model.md`, `SCHEMA_EVOLUTION.md`
6. Test fresh install: Delete DB, run init script, verify 100% schema match
7. Test upgrade path: Run migrations on v1.x database, verify no errors

---

## Related Documentation

- **Data Model**: [/app/public/docs-source/architecture/data-model.md](/app/public/docs-source/architecture/data-model.md)
- **Database Architecture**: [/app/public/docs-source/architecture/database.md](/app/public/docs-source/architecture/database.md)
- **SRPI Documents**: [/docs/srpi/HEX-324/](/docs/srpi/HEX-324/) (SPECIFICATION, RESEARCH, PLAN)
- **Linear Issue**: [HEX-324](https://linear.app/hextrackr/issue/HEX-324)
- **Cisco PSIRT Integration**: [/app/public/docs-source/guides/cisco-psirt-integration.md](/app/public/docs-source/guides/cisco-psirt-integration.md)

---

*Last Updated: 2025-10-22 | Schema Version: v1.1.0 | Issue: HEX-324*
