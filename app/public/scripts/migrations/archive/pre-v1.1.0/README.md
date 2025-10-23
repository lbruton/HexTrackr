# Pre-v1.1.0 Migration Archive

This directory contains migration scripts that were **consolidated into the v1.1.0 baseline** and are **no longer needed for fresh installations**.

## Archived Migrations

### 007-normalize-cisco-fixed-versions.sql

- **Issue**: HEX-287 - Fix data corruption from multi-OS-family CVEs
- **Version**: v1.0.79
- **Date**: 2025-10-18
- **Purpose**: Create `cisco_fixed_versions` table (3NF normalization)
- **Consolidation**: Table now created by `init-database-v1.1.0.js`
- **Status**: Obsolete for v1.1.0+ fresh installs

**When to Reference**:

- Understanding historical schema evolution
- Debugging v1.0.x databases (if rollback needed)
- Investigating cisco_fixed_versions table design decisions

**DO NOT RUN** on fresh v1.1.0+ installations (table already in baseline).

---

### 012-create-audit-logs.sql

- **Issue**: HEX-254 - Unified logging system with audit trail
- **Version**: v1.0.67+
- **Date**: 2025-10-16
- **Purpose**: Create `audit_logs` and `audit_log_config` tables
- **Consolidation**: Tables now created by `init-database-v1.1.0.js`
- **Status**: Obsolete for v1.1.0+ fresh installs

**When to Reference**:

- Understanding audit log encryption architecture
- Reviewing retention policy design
- Debugging v1.0.x audit log issues

**DO NOT RUN** on fresh v1.1.0+ installations (tables already in baseline).

---

## Version Consolidation Strategy

HexTrackr follows a **periodic consolidation pattern**:

| Version | Migration Strategy |
|---------|-------------------|
| v1.0.0 - v1.0.99 | Incremental migrations (001-015) |
| v1.1.0 | **Consolidation Point** - All migrations → baseline |
| v1.1.1 - v1.1.99 | Incremental migrations (016+) |
| v1.2.0 | **Next Consolidation** - All v1.1.x migrations → baseline |

**Benefits**:

- Fresh installs get complete schema from one script
- Existing databases upgrade via incremental migrations
- Migration history preserved for forensics
- Developer onboarding simplified (one file to read)

**Post-v1.1.0 Migration Pattern**:

- New tables/columns → Create `016-add-feature.sql`
- No need to update `init-database-v1.1.0.js` until v1.2.0
- Migrations run automatically on application startup

---

## Historical Context

**v1.0.x Initialization Fragmentation**:

- Base schema: `init-database.js` (16 tables)
- Runtime tables: `ciscoAdvisoryService`, `paloAltoService` (3 tables)
- Migrations: 007, 012 (2 more tables)
- **Total**: 21 tables via 3 different pathways

**v1.1.0 Consolidation**:

- Single script: `init-database-v1.1.0.js` (21 tables)
- Service refactoring: Remove `initializeTables()` methods
- Clear migration path: Fresh install vs upgrade

**Developer Impact**:

- Before v1.1.0: Must read 3+ files to understand schema
- After v1.1.0: Read one file (`init-database-v1.1.0.js`)

---

## Related Documentation

- **SRPI Documents**: `/docs/srpi/HEX-324/` (SPECIFICATION, RESEARCH, PLAN)
- **Schema Evolution**: `/docs/SCHEMA_EVOLUTION.md`
- **Data Model**: `/app/public/docs-source/architecture/data-model.md`
- **Linear Issue**: [HEX-324](https://linear.app/hextrackr/issue/HEX-324)
