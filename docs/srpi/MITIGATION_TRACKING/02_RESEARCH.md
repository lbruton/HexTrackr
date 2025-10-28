# Mitigation Tracking Feature - Research Phase

**Research Date**: October 28, 2025
**Researcher**: Claude Code + Plan Subagent
**Status**: Research Complete, Ready for Planning Phase
**Next Phase**: Architecture Decision Document + Implementation Roadmap

---

## Executive Summary

HexTrackr has **strong architectural foundations** for implementing vulnerability mitigation tracking. Key findings:

✅ **Existing Infrastructure Reusable**:
- Lifecycle management pattern (`lifecycle_state` enum)
- Ticket-vulnerability junction table (`ticket_vulnerabilities`)
- Staging + batch processing for bulk operations
- Soft delete + audit trail patterns

✅ **CVSS Data Already Available**:
- Imported from Tenable CSV, stored in all vulnerability tables
- Currently underutilized (only on vulnerability cards)
- NO API enrichment needed - ready for immediate use

⚠️ **Gaps Requiring New Infrastructure**:
- No mitigation status tracking
- No bulk vulnerability lifecycle operations
- No whitelist/exclusion system
- No mitigation verification workflow

**Recommended Approach**: Create new `vulnerability_mitigations` table (Option B) for flexibility and audit trail capabilities.

---

## 1. Vulnerability Data Model & Import Pipeline

### Database Schema Analysis

**Primary Table**: `vulnerabilities_current`

**Core Fields**:
- **Identifiers**: `id`, `hostname`, `ip_address`, `cve`, `plugin_id`
- **Risk Scores**: `vpr_score`, `cvss_score`, `cvss_base_score`, `severity`
- **Lifecycle**: `lifecycle_state` (active/reopened/grace_period/resolved), `resolution_reason`, `resolved_date`
- **Timestamps**: `first_seen`, `last_seen`, `scan_date`
- **Vendor Data**: `vendor`, `vendor_reference`, `operating_system`, `solution_text`
- **Deduplication**: `unique_key`, `enhanced_unique_key`, `confidence_score`, `dedup_tier`

**Related Tables**:
- `vulnerability_imports`: CSV import metadata tracking
- `vulnerability_snapshots`: Historical data (3 scan dates retention via HEX-219)
- `vulnerability_staging`: High-performance bulk import staging
- `vulnerability_daily_totals`: Aggregated severity/VPR statistics
- `vendor_daily_totals`: Vendor-specific trend data (permanent storage)

### CSV Import Process

**Flow**: File Upload → Parse → Staging → Batch Processing → Final Tables → Aggregation

1. **Validation**: PapaParse header detection, empty line filtering, row count validation
2. **Metadata Extraction**: Vendor and scan date from filename patterns
3. **Staging Load**: Transaction-wrapped bulk INSERT (1000-row batches)
4. **Processing**: Enhanced unique key generation, multi-tier deduplication
5. **Upsert**: `vulnerabilities_current` with COALESCE for field preservation
6. **Lifecycle Management**: Grace period tracking, resolve missing vulnerabilities
7. **Aggregation**: Daily totals by severity, VPR summation, vendor rollups

**Key Fields Captured**:
- Full CSV mapping: hostname, IP, CVE, severity, VPR/CVSS scores, plugin ID/name, description, solution
- Vendor enrichment: Automatic detection from filename or CSV data
- Operating system + solution text (preserved via COALESCE on update)

**Fields NOT Currently Captured** (potential future enhancements):
- CVSS v3.1 temporal/environmental scores
- CVSS v2.0 scores
- Asset UUID/Tenable asset ID
- Vulnerability output/proof
- Exploit framework indicators (Metasploit/CANVAS/D2)
- Patch publication dates

---

## 2. Device-Vulnerability Relationships

### Current Architecture

**Junction Table**: `ticket_vulnerabilities`
- Links tickets to vulnerabilities for remediation tracking
- Fields: `ticket_id` (FK → tickets), `vulnerability_id` (FK → vulnerabilities), `relationship_type`, `notes`, `created_at`

**Device Correlation** (hostname-based):
- NO explicit device table - devices identified by `hostname` field
- Location parsing via HostnameParserService (Pattern 1/2/3)
- Aggregation via LocationService (group by parsed location)

### Data Flow

1. CSV Import → `vulnerability_staging` (raw data)
2. Batch Processing → `vulnerabilities_current` (deduplicated, lifecycle-managed)
3. Hostname Parsing → Location extraction
4. Frontend Aggregation:
   - Device cards: `VulnerabilityService.getDeviceStatistics()`
   - Location cards: LocationService aggregates by location code
   - Vulnerability grid: AG-Grid with pagination

---

## 3. Ticket System Architecture

### Tickets Table Schema

**Core Fields**:
- **Identifiers**: `id` (UUID), `xt_number` (4-digit normalized)
- **Dates**: `date_submitted`, `date_due`, `created_at`, `updated_at`
- **External Refs**: `hexagon_ticket`, `service_now_ticket`
- **Location**: `location`, `site`, `site_id`, `location_id`
- **Devices**: `devices` (JSON array of hostnames)
- **Assignments**: `supervisor`, `tech`
- **Status**: `status` (Open/In Progress/Completed/Cancelled/Overdue)
- **Job Type**: `job_type` (Upgrade/Maintenance/Repair)
- **Mitigation Fields**: `software_versions`, `mitigation_details`, `installed_versions`, `device_status`
- **Soft Delete**: `deleted` (0/1), `deleted_at`, `deletion_reason`, `deleted_by`

### Ticket-Device Linking

**JSON Array Storage**:
- Devices stored as JSON array of hostname strings
- Device lookup via `json_each()` SQL function
- Bidirectional navigation: Device → Tickets, Location → Tickets

### Bulk Operations

**Current Ticket Operations**:
- `createTicket()`: XT# uniqueness validation
- `updateTicket()`: Partial updates with COALESCE
- `deleteTicket()`: Soft delete with audit trail
- `importTicketsFromCSV()`: Bulk import with UPSERT

**NO Existing Bulk Operations for Vulnerabilities**:
- No batch delete/update/lifecycle management
- No bulk ticket creation from vulnerability selection
- Client-side filtering only (no server-side exclusion rules)

---

## 4. Filtering & Search Patterns

### Server-Side Filters

**API**: `GET /api/vulnerabilities`

**Supported Filters**:
- `severity`: Critical/High/Medium/Low/KEV
- `vendor`: Vendor name (indexed column)
- `search`: Hostname/CVE/plugin name LIKE query
- `isKev`: Boolean filter for CISA KEV correlation
- `page`/`limit`: Pagination (default 50 per page)

**Implementation**:
- WHERE clause builder with parameterized queries
- KEV join: `LEFT JOIN kev_status k ON v.cve = k.cve_id`
- Lifecycle filter: `WHERE lifecycle_state IN ('active', 'reopened')`
- Sorting: KEV DESC → Severity ASC → VPR DESC → Last Seen DESC

### Client-Side Filters

**Filter UI Bindings**:
- `#searchInput`: Real-time search
- `#severityFilter`: Severity dropdown
- `#vendorFilter`: Vendor dropdown
- `#locationFilter`: Location filter (also updates location cards)

**NO Whitelist/Exclusion Infrastructure**:
- No "ignored vulnerabilities" table or field
- No "accepted risk" status in lifecycle_state
- No bulk "mark as false positive" operation
- No persistent filter rules (all filters are session-based)

---

## 5. Vendor API Integrations

### CISA KEV Integration (Model for Mitigation)

**Pattern**: Background sync + correlation table + JOIN-based enrichment

**Implementation**:
- 24-hour background sync from CISA API
- `kev_status` table: `cve_id`, `date_added`, `due_date`, `known_ransomware_use`, `required_action`
- JOIN pattern: `LEFT JOIN kev_status k ON v.cve = k.cve_id`
- Enrichment fields: `isKev`, `kev_due_date`, `kev_required_action`

**Applicable to Mitigation**:
- Similar correlation table pattern (`vulnerability_mitigations`)
- Background sync not needed (user-driven mitigation tracking)
- JOIN-based enrichment at query time

### Cisco PSIRT API

**OAuth2 Integration**:
- Client credentials flow
- Advisory parsing via PSIRT API
- Fixed version tracking (Migration 007: `cisco_fixed_versions` table)
- CVE correlation with Cisco Security Advisories

### Palo Alto Security Bulletins

**Web Scraping**:
- Security bulletin parsing
- Version matching
- Advisory correlation

**Potential for CVSS Enrichment**: Both vendor APIs could supplement CVSS data, but research shows Tenable CSV already provides CVSS scores (API enrichment not needed).

---

## 6. Reporting Infrastructure

### Historical Trends

**Aggregation Tables**:
- `vulnerability_daily_totals`: Overall severity/VPR by scan date (365-day retention)
- `vendor_daily_totals`: Vendor-specific trends (permanent storage)

**Aggregation Logic**:
- Deduplication via `GROUP BY hostname, dedup_key`
- Severity breakdown (count + total VPR per severity)
- Resolved/reopened counts
- Calculated automatically after each import

### Export Functionality

**Streaming Exports**:
- CSV/JSON format support
- Row-by-row streaming (prevents memory exhaustion)
- CSV injection protection: `escapeCSV()` + `safeCSV()`
- Filter preservation: severity/vendor/search/isKev

**Ticket Exports**:
- JSON export for backup
- Includes soft-deleted tickets
- Timestamp metadata

---

## 7. Architecture Patterns Reusable for Mitigation Tracking

### ✅ Patterns to Reuse

1. **Lifecycle Management** (`lifecycle_state` enum):
   - Pattern: active → grace_period → resolved
   - Audit trail: `resolved_date` + `resolution_reason`
   - Grace period for "pending mitigation" status

2. **Staging + Batch Processing**:
   - Staging table for large imports
   - 1000-row batches with progress tracking
   - Transaction-wrapped atomicity

3. **Junction Table Relationships** (`ticket_vulnerabilities`):
   - Already exists for remediation tracking
   - Additional fields: `relationship_type`, `notes`

4. **JSON Array Storage** (ticket devices pattern):
   - Flexible multi-value storage
   - `json_each()` queries for searching
   - Batch lookup optimization

5. **Vendor API Enrichment** (KEV model):
   - Background sync jobs
   - Separate correlation table
   - JOIN-based enrichment at query time

6. **Soft Delete Pattern** (ticket deletion):
   - `deleted` flag + `deleted_at` timestamp
   - `deletion_reason` + `deleted_by` audit trail
   - Filter excluded records in queries

7. **Aggregation + Caching** (daily totals):
   - Pre-calculated statistics for performance
   - Automatic refresh on data changes

---

## 8. Data Model Gaps to Address

### ⚠️ Missing Infrastructure

1. **No Mitigation Status Tracking**:
   - Add `mitigation_status` field to `vulnerabilities_current`?
   - Or create new `vulnerability_mitigations` table? (Recommended)

2. **No CVSS Temporal/Environmental Scores**:
   - Missing temporal scores (exploit availability, remediation level)
   - Missing environmental scores (confidentiality requirement, etc.)
   - Missing CVSS vector strings (breakdown of attack complexity, privilege required)

3. **No Exclusion/Whitelist Infrastructure**:
   - No "accepted risk" status
   - No bulk ignore operations
   - No persistent filter rules

4. **Limited Bulk Operations**:
   - No batch vulnerability lifecycle updates
   - No bulk ticket creation from vulnerability selection

5. **No Mitigation Action Tracking**:
   - No workflow: vulnerability → mitigation plan → ticket → verification
   - No "mitigation effective date" tracking
   - No "verified by" user tracking

---

## 9. Architecture Options for Mitigation Tracking

### Option A: Extend `vulnerabilities_current` Table

**Add Fields**:
- `mitigation_status` (enum: not_mitigated/planned/in_progress/mitigated/verified)
- `mitigation_date` (timestamp)
- `mitigation_method` (enum: patched/configuration_change/compensating_control/accepted_risk)
- `mitigation_notes` (text)
- `verified_date` (timestamp)
- `verified_by` (user who verified)

**Pros**:
- ✅ Simple implementation
- ✅ No additional JOINs
- ✅ Follows existing `lifecycle_state` pattern
- ✅ Fast queries (single table)

**Cons**:
- ❌ Tight coupling to vulnerability records
- ❌ Cannot track multiple mitigation attempts
- ❌ Limited audit trail (only current state)
- ❌ Difficult to revert mitigations
- ❌ No history of mitigation changes

---

### Option B: New `vulnerability_mitigations` Table (RECOMMENDED)

**Schema**:
```sql
CREATE TABLE vulnerability_mitigations (
    id TEXT PRIMARY KEY,
    vulnerability_id TEXT NOT NULL,
    ticket_id TEXT,  -- Optional FK to tickets
    mitigation_status TEXT NOT NULL,  -- planned/in_progress/completed/verified
    mitigation_method TEXT NOT NULL,  -- patched/config_change/compensating_control/accepted_risk
    mitigation_date DATETIME,
    plan_date DATETIME,
    execution_date DATETIME,
    verification_date DATETIME,
    planned_by TEXT,
    executed_by TEXT,
    verified_by TEXT,
    notes TEXT,
    attachments TEXT,  -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vulnerability_id) REFERENCES vulnerabilities_current(id),
    FOREIGN KEY (ticket_id) REFERENCES tickets(id)
);
```

**Pros**:
- ✅ Flexible: Supports multiple mitigation attempts per vulnerability
- ✅ Complete audit trail (track all changes over time)
- ✅ Workflow tracking (planned → executed → verified)
- ✅ User attribution (who planned, executed, verified)
- ✅ Optional ticket linking (not required for all mitigations)
- ✅ Attachments support (evidence of mitigation)
- ✅ Easy to query mitigation history

**Cons**:
- ❌ Requires JOINs (slightly more complex queries)
- ❌ Additional table to maintain
- ❌ More complex data model

**Why Recommended**:
- Matches HexTrackr's audit trail patterns (similar to `audit_logs` table)
- Provides flexibility for both ticket-based and whitelist-based mitigations
- Supports future enhancements (re-opening mitigations, effectiveness tracking)
- Clean separation of concerns (vulnerability data vs mitigation workflow)

---

### Option C: Enhance `ticket_vulnerabilities` Junction Table

**Add Fields**:
- `mitigation_status`, `mitigation_date`, `mitigation_method`
- Track mitigation workflow: vulnerability → ticket → resolution

**Pros**:
- ✅ Leverages existing relationship table
- ✅ Ties mitigation directly to tickets
- ✅ No new tables needed

**Cons**:
- ❌ Requires ticket creation for ALL mitigations (not flexible)
- ❌ Cannot support whitelist-based mitigations (no ticket)
- ❌ Limited workflow tracking (tied to ticket lifecycle)
- ❌ Difficult to track mitigations without tickets

**Why NOT Recommended**:
- Too ticket-centric (team wants flexibility for config-based mitigations)
- Doesn't support "global mitigation" use case (whitelist without ticket)
- Inflexible for future enhancements

---

## 10. Mitigation Workflow Design

### Proposed Workflow States

**Lifecycle**:
1. **Not Mitigated** (default state)
2. **Planned** (mitigation strategy identified, not yet executed)
3. **In Progress** (actively being mitigated, ticket may be open)
4. **Completed** (mitigation applied, waiting verification)
5. **Verified** (mitigation confirmed effective)

**State Transitions**:
```
Not Mitigated → Planned → In Progress → Completed → Verified
     ↓                                        ↓
  Accepted Risk                            Reopened (if mitigation failed)
```

### Mitigation Methods

**Enum Values**:
- `patched`: Software/firmware update applied
- `configuration_change`: Security configuration modified (disable protocol, change settings)
- `compensating_control`: Workaround implemented (firewall rule, access restriction)
- `accepted_risk`: Risk acknowledged, no action taken (business decision)
- `vendor_fix_pending`: Waiting for vendor patch (tracked but not yet available)

### Bulk vs Individual Mitigations

**Bulk Mitigation** (CVE-level):
- Mark all devices with CVE-2024-1234 as mitigated
- Single ticket, single note
- Example: "Disabled TLS 1.0 globally via configuration management"

**Individual Mitigation** (Device-level):
- Mark specific hostname as mitigated
- Individual notes per device
- Example: "Device ABC-001: Patched manually, others pending approval"

**Implementation**:
- `vulnerability_mitigations` table supports both patterns
- Filter by `vulnerability_id` (bulk) or `vulnerability_id + hostname` (individual)
- UI provides both bulk and individual action buttons

---

## 11. Ticket Integration Strategy

### Mitigation Ticket Workflow

**Option 1: New Ticket Type**
- Add "Mitigation" to `job_type` enum
- Create tickets specifically for vulnerability mitigation
- Track mitigation progress via ticket status

**Option 2: Extend Existing Ticket Types**
- Use existing "Maintenance" or "Repair" job types
- Add mitigation-specific fields to tickets table
- Link via `ticket_vulnerabilities` junction table

**Recommended**: Option 1 (new ticket type) for clarity and separation of concerns.

### Ticket Creation Patterns

**From Vulnerability Grid**:
1. User selects multiple vulnerabilities (AG-Grid row selection)
2. Clicks "Create Mitigation Ticket" button
3. Modal opens with pre-filled data:
   - Devices: All hostnames affected by selected CVEs
   - Location: Most common location (or prompt to select)
   - Vulnerabilities: Selected CVE list
   - Mitigation notes: Template with CVE details
4. User completes ticket form, submits
5. `vulnerability_mitigations` records created (linked to ticket)

**From Device/Location Modals**:
1. User views device or location details
2. Sees list of vulnerabilities
3. Clicks "Create Mitigation Ticket" for specific vulnerability
4. Modal pre-fills with device/location context
5. Submit creates ticket + mitigation records

### Ticket Status Synchronization

**Ticket Status → Mitigation Status Mapping**:
- Ticket "Open" → Mitigation "Planned"
- Ticket "In Progress" → Mitigation "In Progress"
- Ticket "Completed" → Mitigation "Completed" (triggers verification prompt)
- Ticket "Cancelled" → Mitigation "Not Mitigated" (revert)

**Implementation**:
- Webhook/listener on ticket status changes
- Automatic update of linked `vulnerability_mitigations` records
- Optional: Require manual verification after ticket completion

---

## 12. Alternative Approach: Configuration Whitelist

### Whitelist Pattern (No Tickets)

**Use Case**: Global mitigations without individual tickets

**Example Scenarios**:
- "All CVE-2023-1234 vulnerabilities mitigated via global config change"
- "False positive: CVE-2024-5678 does not apply to our environment"
- "Accepted risk: CVE-2022-9999 - business decision to delay patching"

**Implementation**:
- Settings UI: "Mitigation Rules" section
- Add rule: CVE + mitigation method + notes
- Filter vulnerabilities matching rule from active list
- Export mitigated vulnerabilities separately (for reporting)

**Database**:
- Use `vulnerability_mitigations` table with `ticket_id = NULL`
- `mitigation_method = 'accepted_risk'` or `'configuration_change'`
- Global flag: `applies_globally = 1` (affects all devices with CVE)

**Pros**:
- ✅ Simple for global mitigations
- ✅ No ticket overhead
- ✅ Fast implementation

**Cons**:
- ❌ Less audit trail (no ticket history)
- ❌ Difficult to track verification
- ❌ May bypass formal approval process

**Recommendation**: Support BOTH patterns - use `vulnerability_mitigations` table for both ticket-based and whitelist-based mitigations.

---

## 13. Filtering & Reporting Requirements

### UI Filtering Enhancements

**New Filter Options**:
- "Show Mitigated" (default: hidden)
- "Show Only Mitigated" (for verification)
- "Show Pending Mitigation" (planned/in progress)
- "Show Accepted Risk" (business decisions)

**Implementation**:
- Add `mitigation_status` filter to API
- Frontend: Dropdown or checkbox toggles
- Persist filter state in localStorage

### Reporting Metrics

**Mean Time to Mitigate (MTTM)**:
```sql
SELECT
    AVG(JULIANDAY(mitigation_date) - JULIANDAY(first_seen)) as mttm_days
FROM vulnerability_mitigations vm
JOIN vulnerabilities_current v ON vm.vulnerability_id = v.id
WHERE vm.mitigation_status = 'verified'
  AND vm.mitigation_date BETWEEN date('now', '-30 days') AND date('now');
```

**Mitigation Effectiveness** (re-opened vulnerabilities):
```sql
SELECT
    COUNT(*) as total_mitigations,
    COUNT(CASE WHEN v.lifecycle_state = 'reopened' THEN 1 END) as reopened,
    ROUND(COUNT(CASE WHEN v.lifecycle_state = 'reopened' THEN 1 END) * 100.0 / COUNT(*), 2) as reopen_rate
FROM vulnerability_mitigations vm
JOIN vulnerabilities_current v ON vm.vulnerability_id = v.id
WHERE vm.mitigation_status = 'verified';
```

**Monthly Mitigation Report**:
- Total mitigations by method (patched, config change, etc.)
- MTTM by severity (Critical/High/Medium/Low)
- Top 10 mitigated CVEs
- Users with most mitigations (gamification opportunity)

---

## 14. CVSS Data Utilization

### Current State (From Separate Research)

**Discovery**: CVSS scores are already in the database!
- Imported from Tenable CSV (`cvss_score` field)
- Stored in all vulnerability tables
- Currently only displayed on vulnerability cards (with fallback estimation)

**Completeness**: Unknown (need to run SQL query to check % populated)

**Version**: Single `cvss_score` field (no version distinction)
- Likely CVSS v2.0 or v3.x base scores
- NO temporal/environmental scores
- NO CVSS vector strings

### Integration with Mitigation Feature

**Display Pattern**:
```
┌─────────────────────────────────────────────┐
│ Risk Assessment                             │
├─────────────────────────────────────────────┤
│ VPR Score:    8.5  (Tenable Priority)       │
│ CVSS Score:   7.2  (Industry Standard)      │
│ Severity:     High                          │
│ KEV Status:   Yes (CISA Known Exploited)    │
└─────────────────────────────────────────────┘
```

**Sorting/Filtering**:
- "Show CVSS >= 7.0" (critical/high threshold)
- "Sort by CVSS" (alternative to VPR sorting)
- "Filter High CVSS + High VPR" (dual-metric risk assessment)

**NO API Enrichment Needed**:
- Data already in database
- NULL values fall back to VPR or severity estimation
- Fast queries (no external API calls)

**Future Enhancement** (Low Priority):
- Add `cvss_temporal_score` field (requires additional Tenable CSV columns)
- Add `cvss_vector` TEXT field (breakdown of attack complexity, etc.)
- Support CVSS v4.0 when Tenable adopts it

---

## 15. Recommended Implementation Roadmap

### Phase 1: Data Model & Backend (Week 1)

**Tasks**:
1. Create database migration: Add `vulnerability_mitigations` table
2. Implement `MitigationService` with CRUD operations
3. Add mitigation filtering to `GET /api/vulnerabilities`
4. Create bulk mitigation endpoints (mark CVE as mitigated)
5. Add mitigation reporting endpoints (MTTM, effectiveness)

**Deliverables**:
- Database schema ready
- API endpoints functional
- Unit tests passing

---

### Phase 2: Ticket Integration (Week 2)

**Tasks**:
1. Add "Mitigation" job type to tickets
2. Implement bulk ticket creation from vulnerability selection
3. Add ticket-mitigation status synchronization
4. Create verification workflow (ticket completion → prompt verification)

**Deliverables**:
- Ticket creation from vulnerability grid working
- Status sync functional
- Verification workflow complete

---

### Phase 3: UI & Filtering (Week 3)

**Tasks**:
1. Add mitigation status filters to vulnerability grid
2. Create bulk mitigation action modal (mark as mitigated, accept risk)
3. Update device/location modals to show mitigation status
4. Add "Create Mitigation Ticket" buttons to modals

**Deliverables**:
- Filtering UI complete
- Bulk actions working
- Modal enhancements deployed

---

### Phase 4: Reporting & Analytics (Week 4)

**Tasks**:
1. Implement mitigation trends chart (daily totals expansion)
2. Add MTTM calculations to dashboard
3. Create mitigation effectiveness reports
4. Enhance exports to include mitigation data

**Deliverables**:
- Reporting dashboard complete
- Exports include mitigation status
- Analytics functional

---

### Phase 5: Configuration Whitelist (Week 5 - Optional)

**Tasks**:
1. Add "Mitigation Rules" section to Settings modal
2. Implement global mitigation rule engine
3. Add whitelist filtering to vulnerability queries
4. Create mitigation rule management UI

**Deliverables**:
- Whitelist system functional
- Settings UI complete
- Rule engine tested

---

## 16. Open Questions for Planning Phase

### Architecture Decisions

1. **Database Schema**: Confirm Option B (new `vulnerability_mitigations` table) as recommended approach?
2. **Ticket Integration**: New "Mitigation" job type vs extend existing types?
3. **Whitelist Support**: Implement in Phase 5 or defer to later release?

### Workflow Decisions

4. **Verification Required**: Should mitigations require manual verification or auto-verify on ticket completion?
5. **Bulk Mitigation**: Should bulk actions allow individual device notes or single global note?
6. **Accepted Risk**: Should "accepted risk" mitigations have expiration dates (re-review annually)?

### UI/UX Decisions

7. **Filter Default**: Should mitigated vulnerabilities be hidden by default or visible?
8. **Mitigation Badge**: Add visual indicator to vulnerability cards showing mitigation status?
9. **Mitigation History**: Show full mitigation timeline in vulnerability details modal?

### Reporting Decisions

10. **MTTM Calculation**: Should MTTM be calculated from `first_seen` or from vulnerability discovery date?
11. **Dashboard Placement**: Add mitigation metrics to main dashboard or create separate page?
12. **Export Format**: Include mitigation data in existing exports or create separate mitigation report export?

---

## 17. Success Criteria

### Technical

- [ ] Database schema supports both ticket-based and whitelist-based mitigations
- [ ] API endpoints handle bulk operations efficiently (1000+ vulnerabilities)
- [ ] Filtering system performs well (no UI lag)
- [ ] Reporting calculations are accurate (MTTM, effectiveness metrics)

### User Experience

- [ ] Mitigation workflow is intuitive (3 clicks or less to mark as mitigated)
- [ ] Bulk actions save time (vs individual device mitigation)
- [ ] Reporting provides actionable insights (not just raw data)
- [ ] Documentation clear enough for team to use without training

### Business Value

- [ ] Reduced time spent tracking mitigations manually (spreadsheet elimination)
- [ ] Improved audit trail (who mitigated what, when, how)
- [ ] Better risk visibility (separate active threats from mitigated items)
- [ ] Measurable improvement (MTTM trending downward over time)

---

## 18. Next Steps

### Planning Phase Deliverables

1. **Architecture Decision Document** (ADD):
   - Finalize Option B schema design
   - Define API endpoint specifications
   - Design UI component wireframes

2. **Implementation Roadmap**:
   - Break phases into 2-4 day sessions
   - Assign priority (Phase 1-2 required, Phase 3-5 as needed)
   - Estimate effort per session

3. **Testing Strategy**:
   - Unit test requirements
   - Integration test scenarios
   - User acceptance testing plan

### Team Review Points

- [ ] Review architecture decision (Option A vs B vs C)
- [ ] Validate workflow design (planned → executed → verified)
- [ ] Confirm reporting requirements (metrics needed)
- [ ] Discuss whitelist approach (Phase 5 priority)

---

## 19. Conclusion

**Research Status**: ✅ Complete

**Key Findings**:
- HexTrackr has strong foundations for mitigation tracking
- CVSS data already available (no API enrichment needed)
- Recommended approach: New `vulnerability_mitigations` table (Option B)
- Implementation roadmap: 5 phases over 5 weeks (Phase 1-4 required, Phase 5 optional)

**Ready for Planning Phase**: Yes - proceed with Architecture Decision Document and detailed implementation plan.

**Estimated Total Effort**: 3-4 weeks of development (assuming 1-2 sessions per day)

---

## Appendix A: SQL Queries for Validation

### Check CVSS Data Population

```sql
-- Current vulnerabilities CVSS availability
SELECT
    vendor,
    COUNT(*) as total_vulns,
    COUNT(cvss_score) as with_cvss,
    ROUND(AVG(cvss_score), 2) as avg_cvss,
    MIN(cvss_score) as min_cvss,
    MAX(cvss_score) as max_cvss
FROM vulnerabilities_current
WHERE lifecycle_state = 'active'
GROUP BY vendor
ORDER BY total_vulns DESC;
```

### Compare CVSS vs VPR Availability

```sql
-- Data completeness comparison
SELECT
    'CVSS' as metric,
    COUNT(cvss_score) as populated,
    COUNT(*) - COUNT(cvss_score) as missing,
    ROUND(COUNT(cvss_score) * 100.0 / COUNT(*), 2) as percent
FROM vulnerabilities_current
WHERE lifecycle_state = 'active'

UNION ALL

SELECT
    'VPR' as metric,
    COUNT(vpr_score) as populated,
    COUNT(*) - COUNT(vpr_score) as missing,
    ROUND(COUNT(vpr_score) * 100.0 / COUNT(*), 2) as percent
FROM vulnerabilities_current
WHERE lifecycle_state = 'active';
```

---

## Appendix B: References

- **HexTrackr Database Schema**: `/app/services/init-database.js`
- **Import Service**: `/app/services/importService.js`
- **Ticket Service**: `/app/services/ticketService.js`
- **Vulnerability Service**: `/app/services/vulnerabilityService.js`
- **KEV Integration**: `/app/services/kevService.js`
- **SRPI Process Guide**: `/docs/SRPI_PROCESS.md`
- **Schema Evolution**: `/docs/SCHEMA_EVOLUTION.md`
