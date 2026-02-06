# Work Item: CVSS Data Enhancement - Surface Existing Database Fields

**Type**: Enhancement / Data Visibility
**Priority**: Normal (prerequisite for mitigation feature)
**Status**: Research Complete → Ready for Implementation
**Estimated Effort**: 1-2 sessions (8-12 hours)

---

## Summary

Surface existing CVSS scores throughout the application UI. Research discovered that CVSS data is already imported from Tenable CSV and stored in the database, but is currently only displayed on vulnerability cards.

**CRITICAL DISCOVERY**: NO API enrichment needed - all data ready for immediate use!

---

## Research Findings ✅

**Full Research Document**: `/docs/srpi/MITIGATION_TRACKING/03_CVSS_DATA_ANALYSIS.md`

### CVSS Data Fully Available

**Import Source**: Tenable CSV vulnerability scans
**Column Variants Supported**: `cvss_score`, `CVSS Score`, `cvss`
**Storage**: All 4 vulnerability tables (vulnerabilities, vulnerabilities_current, vulnerability_snapshots, vulnerability_staging)
**Data Type**: SQLite REAL (floating point, 0.0-10.0 range)

### Currently Underutilized

**Where CVSS IS displayed**:
- ✅ Vulnerability cards (with fallback estimation when NULL)

**Where CVSS is NOT displayed**:
- ❌ Main vulnerability grid (AG-Grid)
- ❌ Vulnerability Details Modal
- ❌ Device Security Modal (Active Vulnerabilities table)
- ❌ Location Details Modal (Devices at Location table)
- ❌ Dashboard charts
- ❌ Export files (CSV/JSON)
- ❌ Sorting/filtering options

### Fallback Pattern Exists

**Function**: `getCVSSFromSeverity(severity)` in `vulnerability-cards.js:1292-1299`

**Mapping**:
- Critical → "9.0-10.0"
- High → "7.0-8.9"
- Medium → "4.0-6.9"
- Low → "0.1-3.9"

**Used when**: Database `cvss_score` is NULL (non-CVE vulnerabilities, older scan data)

---

## Implementation Plan

### Phase 1: Surface in UI (1 session - 4-6 hours)

**Tasks**:
- [ ] Add CVSS column to main vulnerability grid (AG-Grid)
  - File: `app/public/scripts/pages/vulnerabilities.js`
  - Column config: Display format, sorting, width
  - Show actual score vs estimated score (e.g., "7.2" vs "~7.5")

- [ ] Add CVSS to Vulnerability Details Modal
  - File: `app/public/scripts/shared/vulnerability-details-modal.js`
  - Risk metrics section: Display VPR + CVSS + Severity side-by-side

- [ ] Add CVSS to Device Security Modal - Active Vulnerabilities table
  - File: `app/public/scripts/shared/device-security-modal.js`
  - Add column to existing table (aligns with UI refinement work item)

- [ ] Add CVSS to Location Details Modal - Devices at Location table
  - File: `app/public/scripts/shared/location-details-modal.js`
  - **Note**: This aligns with UI Refinement work item Change 6

- [ ] Update vulnerability cards to distinguish estimates from actual scores
  - File: `app/public/scripts/shared/vulnerability-cards.js`
  - Display: "7.2" for database values, "~7.5" for estimates

**Deliverables**: CVSS displayed in all major UI components

---

### Phase 2: Sorting & Filtering (1 session - 4-6 hours)

**Tasks**:
- [ ] Add backend CVSS sorting to `GET /api/vulnerabilities`
  - File: `app/services/vulnerabilityService.js`
  - Add `sortBy=cvss` option to query builder

- [ ] Add backend CVSS filtering
  - File: `app/services/vulnerabilityService.js`
  - Add `cvssMin` and `cvssMax` query parameters
  - Example: `?cvssMin=7.0` (NIST high/critical threshold)

- [ ] Add CVSS sorting option to vulnerability grid
  - File: `app/public/scripts/pages/vulnerabilities.js`
  - Dropdown: "Sort by CVSS" (alternative to VPR sorting)

- [ ] Add CVSS filtering UI
  - File: `app/public/scripts/pages/vulnerabilities.js`
  - Filter options: "CVSS >= 7.0", "CVSS >= 4.0", "Custom range"
  - Dual-metric filter: "High CVSS + High VPR"

- [ ] Add CVSS to CSV/JSON exports
  - File: `app/controllers/vulnerabilityController.js`
  - Update `exportVulnerabilities` to include `cvss_score` column

**Deliverables**: CVSS sorting, filtering, and exports functional

---

### Phase 3: Analytics (Optional - Future)

**Tasks** (Deferred to later release):
- [ ] CVSS distribution chart on dashboard
- [ ] CVSS vs VPR correlation analysis
- [ ] Mean CVSS score trend over time
- [ ] Mitigation effectiveness by CVSS range

---

## Display Strategy

### Dual-Metric Risk Assessment

**Pattern**:
```
┌─────────────────────────────────────────────┐
│ Risk Metrics                                │
├─────────────────────────────────────────────┤
│ VPR Score:    8.5  (Tenable Priority)       │
│ CVSS Score:   7.2  (Industry Standard)      │
│ Severity:     High                          │
│ KEV Status:   Yes (CISA Known Exploited)    │
└─────────────────────────────────────────────┘
```

**Why Both Metrics?**:
- **VPR**: Real-world exploit data, threat intelligence, dynamic scoring
- **CVSS**: Industry standard, vendor-neutral, regulatory compliance, stable over time

### Fallback Implementation

**JavaScript Pattern**:
```javascript
function displayCVSS(vulnerability) {
    if (vulnerability.cvss_score) {
        // Actual database value
        return vulnerability.cvss_score.toFixed(1);  // "7.2"
    } else {
        // Estimated from severity
        const estimate = estimateCVSSFromSeverity(vulnerability.severity);
        return `~${estimate}`;  // "~7.5"
    }
}
```

**Tooltip on estimates**: "Estimated from severity (actual CVSS not available)"

---

## Files to Modify

### Frontend
- `app/public/scripts/pages/vulnerabilities.js` - Grid column + filters
- `app/public/scripts/shared/vulnerability-details-modal.js` - Risk metrics display
- `app/public/scripts/shared/device-security-modal.js` - Active vulns table
- `app/public/scripts/shared/location-details-modal.js` - Devices table (overlaps with UI refinement)
- `app/public/scripts/shared/vulnerability-cards.js` - Distinguish estimates from actuals

### Backend
- `app/services/vulnerabilityService.js` - Add CVSS sorting/filtering to queries
- `app/controllers/vulnerabilityController.js` - Update exports to include CVSS

---

## Testing Checklist

**Data Validation**:
- [ ] Run SQL query to check CVSS population percentage (expect 80-90%)
- [ ] Verify CVSS values are reasonable (0.0-10.0 range)
- [ ] Test fallback estimation for NULL CVSS values

**UI Display**:
- [ ] CVSS column displays in vulnerability grid
- [ ] Sorting by CVSS works correctly (NULL values handled)
- [ ] Filtering by CVSS range functional (e.g., >= 7.0)
- [ ] Risk metrics section shows VPR + CVSS side-by-side
- [ ] Estimated scores clearly marked (~ prefix)
- [ ] Tooltips explain estimates vs actual values

**Backend**:
- [ ] `GET /api/vulnerabilities?sortBy=cvss` returns correctly sorted results
- [ ] `GET /api/vulnerabilities?cvssMin=7.0` filters correctly
- [ ] Export CSV includes CVSS column with accurate data
- [ ] Export JSON includes `cvss_score` field

**Performance**:
- [ ] No query performance degradation (all data from database)
- [ ] No UI lag when sorting/filtering by CVSS
- [ ] Export file generation time unchanged

---

## SQL Validation Queries

### Check CVSS Population Percentage
```sql
SELECT
    COUNT(*) as total_vulns,
    COUNT(cvss_score) as with_cvss,
    COUNT(*) - COUNT(cvss_score) as missing_cvss,
    ROUND(COUNT(cvss_score) * 100.0 / COUNT(*), 2) as percent_populated
FROM vulnerabilities_current
WHERE lifecycle_state = 'active';
```

**Expected**: 80-90% populated (CVE-based vulnerabilities have CVSS)

### CVSS vs VPR Comparison
```sql
SELECT
    'CVSS' as metric,
    COUNT(cvss_score) as populated,
    ROUND(COUNT(cvss_score) * 100.0 / COUNT(*), 2) as percent
FROM vulnerabilities_current
WHERE lifecycle_state = 'active'

UNION ALL

SELECT
    'VPR' as metric,
    COUNT(vpr_score) as populated,
    ROUND(COUNT(vpr_score) * 100.0 / COUNT(*), 2) as percent
FROM vulnerabilities_current
WHERE lifecycle_state = 'active';
```

### CVSS Distribution
```sql
SELECT
    CASE
        WHEN cvss_score >= 9.0 THEN 'Critical (9.0-10.0)'
        WHEN cvss_score >= 7.0 THEN 'High (7.0-8.9)'
        WHEN cvss_score >= 4.0 THEN 'Medium (4.0-6.9)'
        WHEN cvss_score > 0 THEN 'Low (0.1-3.9)'
        ELSE 'No CVSS'
    END as cvss_range,
    COUNT(*) as vuln_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM vulnerabilities_current WHERE lifecycle_state = 'active'), 2) as percent
FROM vulnerabilities_current
WHERE lifecycle_state = 'active'
GROUP BY cvss_range
ORDER BY MIN(cvss_score) DESC;
```

---

## Success Criteria

**Data Quality**:
- [ ] >80% of active vulnerabilities have CVSS scores
- [ ] All CVSS values in valid range (0.0-10.0)
- [ ] Fallback estimation within 1.0 CVSS point of actual score

**User Adoption**:
- [ ] CVSS displayed on 100% of UI components showing vulnerability risk
- [ ] Team uses CVSS for prioritization alongside VPR
- [ ] Exports include CVSS data
- [ ] Mitigation reports reference CVSS thresholds

**Technical Performance**:
- [ ] No API calls needed (all data from database)
- [ ] Queries perform well (< 100ms response time)
- [ ] No UI lag when toggling CVSS display
- [ ] Export file size increase negligible (<5%)

---

## Dependencies

**Blocks**:
- None (standalone enhancement)

**Blocked By**:
- None (all data already in database)

**Overlaps With**:
- UI Refinements work item (Change 6: Add CVSS column to Location Details Modal)
- **Coordination**: Implement CVSS column in Location Details as part of UI refinements OR as part of this work item (avoid duplicate effort)

**Supports**:
- Mitigation Tracking feature (will leverage CVSS for risk assessment)

---

## Notes

**Why This Matters**:
- **Regulatory Compliance**: Many frameworks require CVSS scoring (not just VPR)
- **Vendor Neutrality**: CVSS is industry standard (not tied to Tenable)
- **Dual-Metric Assessment**: VPR + CVSS provides comprehensive risk view
- **No Cost**: Data already in database, just needs to be surfaced

**Future Enhancements** (Low Priority):
- Add CVSS temporal scoring (requires additional Tenable CSV columns)
- Add CVSS vector string breakdown (attack complexity, privileges required, etc.)
- Support CVSS v4.0 when Tenable adopts it
- Add CVSS version detection (v2.0 vs v3.x display)

---

## References

- **Research Document**: `/docs/srpi/MITIGATION_TRACKING/03_CVSS_DATA_ANALYSIS.md`
- **Import Mapping**: `/app/utils/helpers.js:340-342` (CSV column mapping)
- **Current Display**: `/app/public/scripts/shared/vulnerability-cards.js:1159-1223`
- **Fallback Function**: `/app/public/scripts/shared/vulnerability-cards.js:1292-1299`
- **Database Schema**: `/app/services/init-database.js` (CVSS field definitions)
- **CVSS Specification**: [FIRST CVSS v3.1](https://www.first.org/cvss/v3.1/specification-document)

---

**Created**: October 28, 2025
**Last Updated**: October 28, 2025
**Status**: Ready for Implementation (Phase 1 + Phase 2)
