# HEX-186 Backend Migration - PLAN Issues

**Parent**: HEX-186 (RESEARCH: Vulnerabilities Workspace Backend Migration)
**Created**: 2025-10-10
**Purpose**: Complete PLAN issue specifications for all 7 phases

---

## Phase 0: Database Index Prerequisites

**Parent**: HEX-186
**Title**: PLAN: Phase 0 - Database Index Prerequisites
**Status**: Draft
**Branch**: feature/hex-186-phase0-indexes
**Duration**: 1 week
**Blocker for**: All subsequent phases

### Summary

Create missing database indexes and establish performance baselines before any backend migration work begins. This is a **blocker** for all subsequent phases - without proper indexes, the <100ms query performance targets are unachievable.

From HEX-186 Research: Current indexes are compound-only (lifecycle+scan, lifecycle+severity). Missing standalone indexes on hostname and vpr_score will cause table scans at 100k+ record scale.

### Task Breakdown

| ID | Step | Est (min) | Files/Modules | Validation | Risk |
|----|------|-----------|---------------|------------|------|
| 0.1 | Capture performance baseline with EXPLAIN QUERY PLAN | 30 | `app/data/hextrackr.db` | Save EXPLAIN output | low |
| 0.2 | Create missing standalone indexes | 45 | `app/public/scripts/migrations/004-add-standalone-indexes.sql` | Verify with `.indexes` | medium |
| 0.3 | Load test Phase 1 device aggregation query | 60 | Test SQL queries | <100ms @ 100k records | medium |
| 0.4 | Load test Phase 2 CVE aggregation query | 60 | Test SQL queries | <100ms @ 100k records | medium |
| 0.5 | Document performance results | 20 | HEX-186 comment | Baseline comparison | low |

**Total**: ~3.5 hours

### Critical Indexes to Create

```sql
-- Device aggregation GROUP BY optimization
CREATE INDEX IF NOT EXISTS idx_current_hostname
  ON vulnerabilities_current(hostname);

-- Top device/CVE sorting by VPR
CREATE INDEX IF NOT EXISTS idx_current_vpr_score
  ON vulnerabilities_current(vpr_score DESC);

-- Severity filtering optimization
CREATE INDEX IF NOT EXISTS idx_current_severity
  ON vulnerabilities_current(severity);
```

### Validation Queries

**Device Aggregation (Phase 1, 3, 4):**
```sql
SELECT
  hostname,
  COUNT(*) as total_vulns,
  SUM(CASE WHEN severity = 'Critical' THEN 1 ELSE 0 END) as critical_count,
  ROUND(SUM(vpr_score), 2) as total_vpr
FROM vulnerabilities_current
WHERE lifecycle_state IN ('active', 'reopened')
GROUP BY hostname
ORDER BY critical_count DESC, total_vpr DESC
LIMIT 20
```
**Target**: <100ms with 100k records

**CVE Aggregation (Phase 2, 4):**
```sql
SELECT
  cve,
  COUNT(DISTINCT hostname) as affected_device_count,
  SUM(vpr_score) as total_vpr
FROM vulnerabilities_current
WHERE lifecycle_state IN ('active', 'reopened')
  AND cve IS NOT NULL
GROUP BY cve
ORDER BY total_vpr DESC
LIMIT 20
```
**Target**: <100ms with 100k records

---

## Phase 1: Device Details Modal Backend

**Parent**: HEX-186
**Title**: PLAN: Phase 1 - Device Details Modal Backend
**Status**: Draft
**Branch**: feature/hex-186-phase1-device-modal
**Duration**: 2 weeks
**Depends on**: Phase 0

### Summary

Create `/api/devices/:hostname/vulnerabilities` endpoint and wire the device modal AG-Grid to fetch data on-demand. **Smallest scope, easiest win** - proof of concept for backend migration.

Device modal already has AG-Grid with pagination. Just need to change data source from client-side array to server-side endpoint.

### Task Breakdown

| ID | Step | Est (min) | Files/Modules | Validation | Risk |
|----|------|-----------|---------------|------------|------|
| 1.1 | Create backend endpoint | 60 | `vulnerabilityService.js`, `vulnerabilityController.js`, `routes/devices.js` | curl test | medium |
| 1.2 | Add feature flag check | 30 | `device-security-modal.js` | Toggle test | low |
| 1.3 | Wire modal AG-Grid to endpoint | 75 | `device-security-modal.js` | Modal load test | medium |
| 1.4 | Add loading/error handling | 45 | `device-security-modal.js` | Offline test | low |
| 1.5 | Test with chrome-devtools | 30 | Dev environment | <200ms verify | low |

**Total**: ~4 hours

### New Endpoint Specification

**Route**: `GET /api/devices/:hostname/vulnerabilities`

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 100)
- `sortBy` (default: 'severity')
- `order` (default: 'asc')

**Response**:
```json
{
  "data": [
    {
      "id": 12345,
      "hostname": "server-01",
      "cve": "CVE-2023-12345",
      "severity": "Critical",
      "vpr_score": 9.8,
      "isKev": "Yes",
      "last_seen": "2025-10-10"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 245,
    "pages": 3
  }
}
```

### Feature Flag

**Key**: `hextrackr_deviceModalBackend`
**Values**: `"true"` | `"false"`
**Default**: `"false"` (legacy mode)

**Enable**: `localStorage.setItem("hextrackr_deviceModalBackend", "true")`
**Rollback**: `localStorage.setItem("hextrackr_deviceModalBackend", "false")`

---

## Phase 2: Vulnerability Details Modal Backend

**Parent**: HEX-186
**Title**: PLAN: Phase 2 - Vulnerability Details Modal Backend
**Status**: Draft
**Branch**: feature/hex-186-phase2-vuln-modal
**Duration**: 2 weeks
**Depends on**: Phase 0

### Summary

Create `/api/vulnerabilities/:cve/affected-devices` endpoint to replace client-side CVE aggregation. Removes dependency on loading full 100k dataset for modal rendering.

### Task Breakdown

| ID | Step | Est (min) | Files/Modules | Validation | Risk |
|----|------|-----------|---------------|------------|------|
| 2.1 | Create CVE affected-devices endpoint | 75 | `vulnerabilityService.js`, `vulnerabilityController.js`, `routes/vulnerabilities.js` | curl test | medium |
| 2.2 | Add feature flag check | 30 | `vulnerability-details-modal.js` | Toggle test | low |
| 2.3 | Replace client-side aggregation | 90 | `vulnerability-details-modal.js` | Modal test | high |
| 2.4 | Handle edge cases (no CVE, empty results) | 45 | `vulnerability-details-modal.js` | Error states | medium |
| 2.5 | Test with chrome-devtools | 30 | Dev environment | <200ms verify | low |

**Total**: ~4.5 hours

### New Endpoint Specification

**Route**: `GET /api/vulnerabilities/:cve/affected-devices`

**Query Parameters**:
- `limit` (optional, default: 100)
- `sortBy` (optional: 'vpr_score' | 'last_seen' | 'hostname')

**Response**:
```json
{
  "cve": "CVE-2023-12345",
  "devices": [
    {
      "hostname": "server-01",
      "ip_address": "192.168.1.10",
      "vpr_score": 9.8,
      "severity": "Critical",
      "last_seen": "2025-10-10",
      "first_seen": "2025-09-15"
    }
  ],
  "count": 24,
  "totalVpr": 235.2
}
```

### Feature Flag

**Key**: `hextrackr_vulnModalBackend`
**Values**: `"true"` | `"false"`
**Default**: `"false"` (legacy mode)

---

## Phase 3: Device Cards Fast Load (THE BIG WIN)

**Parent**: HEX-186
**Title**: PLAN: Phase 3 - Device Cards Fast Load
**Status**: Draft
**Branch**: feature/hex-186-phase3-device-cards
**Duration**: 2 weeks
**Depends on**: Phase 1, Phase 2

### Summary

**Remove processDevices() client-side processing** entirely. With modals now fetching their own data (Phases 1 & 2), we can delete the HEX-120 workaround and use `/api/devices/stats` directly.

**This is the performance breakthrough**: 2-3 second page freeze → <200ms card render.

### Task Breakdown

| ID | Step | Est (min) | Files/Modules | Validation | Risk |
|----|------|-----------|---------------|------------|------|
| 3.1 | Add master feature flag check | 30 | `vulnerability-core.js` | Flag test | low |
| 3.2 | Remove processDevices() call | 45 | `vulnerability-core.js:595-630` | Verify no errors | medium |
| 3.3 | Update device card rendering | 60 | `vulnerability-cards.js` | Top 6 cards render | medium |
| 3.4 | Remove HEX-120 workaround code | 30 | `vulnerability-core.js` | Code cleanup | low |
| 3.5 | Performance validation | 45 | Chrome DevTools | <200ms verify | low |

**Total**: ~3.5 hours

### Code Changes

**Before (vulnerability-core.js:595-630)**:
```javascript
async loadDevicesData() {
    // HEX-120 WORKAROUND: Must process ALL 100k records
    this.dataManager.processDevices();  // ← 2-3 second freeze!

    const response = await fetch("/api/devices/stats");
    // ... merge client + server data
}
```

**After**:
```javascript
async loadDevicesData() {
    // NO MORE client-side processing!
    // Modals fetch their own data on-demand

    const response = await fetch("/api/devices/stats");
    const result = await response.json();

    // Cards render instantly from server stats
    this.cards.renderDeviceCards(result.devices.slice(0, 6));
}
```

### Feature Flag

**Key**: `hextrackr_deviceCardsBackend`
**Values**: `"true"` | `"false"`
**Default**: `"false"` (legacy mode)

**Dependencies**:
- Requires `hextrackr_deviceModalBackend=true` (Phase 1)
- Requires `hextrackr_vulnModalBackend=true` (Phase 2)

---

## Phase 4: Vulnerability Cards Backend

**Parent**: HEX-186
**Title**: PLAN: Phase 4 - Vulnerability Cards Backend
**Status**: Draft
**Branch**: feature/hex-186-phase4-vuln-cards
**Duration**: 2 weeks
**Depends on**: Phase 2

### Summary

Create `/api/vulnerabilities/grouped-by-cve` endpoint to replace client-side CVE grouping. Renders top 20 vulnerability cards from backend aggregation.

### Task Breakdown

| ID | Step | Est (min) | Files/Modules | Validation | Risk |
|----|------|-----------|---------------|------------|------|
| 4.1 | Create grouped-by-cve endpoint | 90 | `vulnerabilityService.js`, `vulnerabilityController.js`, `routes/vulnerabilities.js` | curl test | high |
| 4.2 | Add feature flag check | 30 | `vulnerability-cards.js` | Toggle test | low |
| 4.3 | Replace groupVulnerabilitiesByCVE() | 75 | `vulnerability-cards.js` | Card render test | medium |
| 4.4 | Update pagination logic | 45 | `vulnerability-cards.js` | Page navigation | medium |
| 4.5 | Performance validation | 30 | Chrome DevTools | <200ms verify | low |

**Total**: ~4.5 hours

### New Endpoint Specification

**Route**: `GET /api/vulnerabilities/grouped-by-cve`

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 20)
- `sortBy` (default: 'vpr')
- `order` (default: 'desc')

**Response**:
```json
{
  "cves": [
    {
      "cve": "CVE-2023-12345",
      "affectedDeviceCount": 24,
      "totalVpr": 235.2,
      "maxSeverity": "Critical",
      "hasKev": true,
      "vulnerabilities": [
        {
          "hostname": "server-01",
          "severity": "Critical",
          "vpr_score": 9.8
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1523,
    "pages": 77
  }
}
```

### Feature Flag

**Key**: `hextrackr_vulnCardsBackend`
**Values**: `"true"` | `"false"`
**Default**: `"false"` (legacy mode)

---

## Phase 5: Table Server-Side Model

**Parent**: HEX-186
**Title**: PLAN: Phase 5 - Table Server-Side Model
**Status**: Draft
**Branch**: feature/hex-186-phase5-table-backend
**Duration**: 3 weeks
**Depends on**: Phase 0

### Summary

Build AG-Grid server-side row model from scratch. Replace client-side row model with paginated backend queries. **Most complex technical work** but builds on 4 phases of backend experience.

### Task Breakdown

| ID | Step | Est (min) | Files/Modules | Validation | Risk |
|----|------|-----------|---------------|------------|------|
| 5.1 | Create paginated endpoint with sort/filter | 120 | `vulnerabilityService.js`, `vulnerabilityController.js`, `routes/vulnerabilities.js` | Postman test | high |
| 5.2 | Implement server-side datasource | 90 | `vulnerability-grid.js` | Basic load test | high |
| 5.3 | Add server-side sorting | 60 | `vulnerability-grid.js` | Column sort test | medium |
| 5.4 | Add server-side filtering | 75 | `vulnerability-grid.js` | Filter test | medium |
| 5.5 | Coordinate with search bar | 60 | `vulnerability-search.js` | Search integration | medium |
| 5.6 | Update export functionality | 45 | Export handlers | CSV export test | low |
| 5.7 | Feature flag integration | 30 | `vulnerability-grid.js` | Toggle test | low |
| 5.8 | Performance validation | 45 | Chrome DevTools | <500ms P95 | medium |

**Total**: ~8.75 hours

### New Endpoint Specification

**Route**: `GET /api/vulnerabilities/paginated`

**Query Parameters**:
- `offset` (required)
- `limit` (required)
- `sortBy` (optional: column name)
- `sortOrder` (optional: 'asc' | 'desc')
- `filterModel` (optional: JSON-encoded AG-Grid filter)

**Response**:
```json
{
  "data": [...],
  "total": 95423,
  "offset": 0,
  "limit": 100
}
```

### AG-Grid Server-Side Datasource

```javascript
const serverSideDatasource = {
    getRows: async (params) => {
        const { startRow, endRow, sortModel, filterModel } = params.request;

        const queryParams = new URLSearchParams({
            offset: startRow,
            limit: endRow - startRow,
            sortBy: sortModel[0]?.colId || 'severity',
            sortOrder: sortModel[0]?.sort || 'asc',
            filterModel: JSON.stringify(filterModel)
        });

        const response = await fetch(`/api/vulnerabilities/paginated?${queryParams}`);
        const result = await response.json();

        params.success({
            rowData: result.data,
            rowCount: result.total
        });
    }
};

gridOptions = {
    rowModelType: 'serverSide',
    serverSideDatasource: serverSideDatasource,
    pagination: true,
    paginationPageSize: 100
};
```

### Feature Flag

**Key**: `hextrackr_tableBackend`
**Values**: `"true"` | `"false"`
**Default**: `"false"` (legacy mode)

---

## Phase 6: Tickets Integration

**Parent**: HEX-186
**Title**: PLAN: Phase 6 - Tickets Integration
**Status**: Draft
**Branch**: feature/hex-186-phase6-tickets
**Duration**: 1 week
**Depends on**: Phase 0

### Summary

Create `/api/vulnerabilities/by-devices` (POST) endpoint for tickets.html edge case. Replace client-side filtering with server-side device list query.

### Task Breakdown

| ID | Step | Est (min) | Files/Modules | Validation | Risk |
|----|------|-----------|---------------|------------|------|
| 6.1 | Create by-devices endpoint (POST) | 75 | `vulnerabilityService.js`, `vulnerabilityController.js`, `routes/vulnerabilities.js` | Postman test | medium |
| 6.2 | Update fetchVulnerabilitiesForDevices() | 60 | `app/public/scripts/pages/tickets.js:1979-2007` | Modal test | medium |
| 6.3 | Test bundle generation | 45 | Ticket bundles | ZIP download | low |
| 6.4 | Test email templates | 45 | Email preview | Template render | low |
| 6.5 | Feature flag integration | 30 | `tickets.js` | Toggle test | low |

**Total**: ~4.25 hours

### New Endpoint Specification

**Route**: `POST /api/vulnerabilities/by-devices`

**Request Body**:
```json
{
  "hostnames": ["server-01", "server-02", "server-03"],
  "limit": 10000,
  "lifecycle_states": ["active", "reopened"]
}
```

**Response**:
```json
{
  "data": [...],
  "count": 245,
  "hostnames": ["server-01", "server-02", "server-03"]
}
```

### Code Changes

**Before (tickets.js:1979-2007)**:
```javascript
async fetchVulnerabilitiesForDevices(devices) {
    // Fetch ALL 100k records, filter client-side
    const response = await fetch("/api/vulnerabilities?limit=10000");
    const data = await response.json();

    return data.data.filter(vuln =>
        devices.some(device => this.hostnameMatches(vuln.hostname, device))
    );
}
```

**After**:
```javascript
async fetchVulnerabilitiesForDevices(devices) {
    // POST device list, get filtered results from backend
    const response = await fetch("/api/vulnerabilities/by-devices", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostnames: devices, limit: 10000 })
    });

    const result = await response.json();
    return result.data;
}
```

### Feature Flag

**Key**: `hextrackr_ticketsBackend`
**Values**: `"true"` | `"false"`
**Default**: `"false"` (legacy mode)

---

## Phase 7: Master IMPLEMENT Checklist

**Parent**: HEX-186
**Title**: IMPLEMENT: Backend Migration - Master Checklist
**Status**: Draft
**Branch**: N/A (references all feature branches)
**Duration**: 13 weeks total

### Live Checklist

This master IMPLEMENT issue tracks completion of all 7 phases. Each phase has its own feature branch and PLAN issue.

#### Phase 0: Database Index Prerequisites (Week 1)
- [ ] Task 0.1: Capture performance baseline
- [ ] Task 0.2: Create standalone indexes
- [ ] Task 0.3: Load test device aggregation
- [ ] Task 0.4: Load test CVE aggregation
- [ ] Task 0.5: Document results in HEX-186
- [ ] Verify: All queries <100ms @ 100k records

#### Phase 1: Device Details Modal Backend (Weeks 2-3)
- [ ] Task 1.1: Create `/api/devices/:hostname/vulnerabilities` endpoint
- [ ] Task 1.2: Add feature flag check
- [ ] Task 1.3: Wire modal AG-Grid to endpoint
- [ ] Task 1.4: Add loading/error handling
- [ ] Task 1.5: Test with chrome-devtools
- [ ] Verify: Modal loads <200ms, flag toggle works

#### Phase 2: Vulnerability Details Modal Backend (Weeks 4-5)
- [ ] Task 2.1: Create `/api/vulnerabilities/:cve/affected-devices` endpoint
- [ ] Task 2.2: Add feature flag check
- [ ] Task 2.3: Replace client-side aggregation
- [ ] Task 2.4: Handle edge cases
- [ ] Task 2.5: Test with chrome-devtools
- [ ] Verify: Modal loads <200ms, no full dataset dependency

#### Phase 3: Device Cards Fast Load (Weeks 6-7) 🎯
- [ ] Task 3.1: Add master feature flag check
- [ ] Task 3.2: Remove processDevices() call
- [ ] Task 3.3: Update device card rendering
- [ ] Task 3.4: Remove HEX-120 workaround code
- [ ] Task 3.5: Performance validation
- [ ] Verify: 2-3 second freeze → <200ms card render

#### Phase 4: Vulnerability Cards Backend (Weeks 8-9)
- [ ] Task 4.1: Create `/api/vulnerabilities/grouped-by-cve` endpoint
- [ ] Task 4.2: Add feature flag check
- [ ] Task 4.3: Replace groupVulnerabilitiesByCVE()
- [ ] Task 4.4: Update pagination logic
- [ ] Task 4.5: Performance validation
- [ ] Verify: Cards load <200ms from backend

#### Phase 5: Table Server-Side Model (Weeks 10-12)
- [ ] Task 5.1: Create paginated endpoint with sort/filter
- [ ] Task 5.2: Implement server-side datasource
- [ ] Task 5.3: Add server-side sorting
- [ ] Task 5.4: Add server-side filtering
- [ ] Task 5.5: Coordinate with search bar
- [ ] Task 5.6: Update export functionality
- [ ] Task 5.7: Feature flag integration
- [ ] Task 5.8: Performance validation
- [ ] Verify: Table handles 100k records, <500ms P95

#### Phase 6: Tickets Integration (Week 13)
- [ ] Task 6.1: Create `/api/vulnerabilities/by-devices` endpoint
- [ ] Task 6.2: Update fetchVulnerabilitiesForDevices()
- [ ] Task 6.3: Test bundle generation
- [ ] Task 6.4: Test email templates
- [ ] Task 6.5: Feature flag integration
- [ ] Verify: Ticket workflow works with backend queries

### Final Verification

- [ ] All 7 phases complete with feature flags tested
- [ ] Performance targets met (cards <200ms, table <500ms P95)
- [ ] No regressions with flags disabled (rollback capability)
- [ ] Documentation updated (CLAUDE.md, API docs)
- [ ] Load test with 100k records successful
- [ ] Ready for production deployment

### Deployment Strategy

**Gradual Rollout**:
1. Week 13: Deploy all code, all flags OFF (no behavior change)
2. Week 14: Enable Phase 0 indexes (prerequisite, low risk)
3. Week 15: Enable Phase 1 (device modal) for testing
4. Week 16: Enable Phase 2 (vuln modal) for testing
5. Week 17: Enable Phase 3 (device cards) - **MAIN PERFORMANCE WIN**
6. Week 18: Enable Phase 4 (vuln cards)
7. Week 19: Enable Phase 5 (table backend)
8. Week 20: Enable Phase 6 (tickets)
9. Week 21: Remove feature flags, delete legacy code

**Rollback Plan**: `localStorage.setItem("hextrackr_*Backend", "false")` + page refresh

---

## Timeline Summary

| Phase | Duration | Cumulative | Priority |
|-------|----------|------------|----------|
| Phase 0: Indexes | 1 week | Week 1 | 🔴 Blocker |
| Phase 1: Device Modal | 2 weeks | Week 3 | 🟡 Foundation |
| Phase 2: Vuln Modal | 2 weeks | Week 5 | 🟡 Foundation |
| Phase 3: Device Cards | 2 weeks | Week 7 | 🟢 **BIG WIN** |
| Phase 4: Vuln Cards | 2 weeks | Week 9 | 🟢 Performance |
| Phase 5: Table Backend | 3 weeks | Week 12 | 🟡 Complex |
| Phase 6: Tickets | 1 week | Week 13 | 🟢 Cleanup |

**Total Development**: 13 weeks
**Total with Deployment**: 21 weeks (includes gradual rollout + legacy code removal)

---

## Success Criteria

### Performance Targets (All must be met)
- ✅ Device cards load <200ms (currently 2-3 seconds)
- ✅ Modals load <200ms (on-demand data fetch)
- ✅ Table first 100 rows <500ms P95
- ✅ All backend queries <100ms @ 100k records
- ✅ Memory usage <150MB (currently 300MB)

### Functionality Targets
- ✅ No regressions with feature flags disabled
- ✅ All modals work with backend data
- ✅ AG-Grid server-side model handles 100k records
- ✅ Search/filter/sort work on backend data
- ✅ Export functionality preserved
- ✅ Ticket workflow unaffected

### Quality Targets
- ✅ Error rate <1% on new endpoints
- ✅ Cache hit rate >80% on stats endpoints
- ✅ Zero data loss during migration
- ✅ Rollback capability tested and documented
- ✅ All feature flags have clear on/off behavior
