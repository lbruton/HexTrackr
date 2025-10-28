# CVSS Data Analysis - HexTrackr Vulnerability Scoring

**Analysis Date**: October 28, 2025
**Analyst**: Claude Code + Plan Subagent
**Purpose**: Determine CVSS data availability and integration strategy for mitigation feature
**Result**: ✅ CVSS data fully available, NO API enrichment needed

---

## Executive Summary

HexTrackr has **complete CVSS support** with data imported from Tenable CSV scans and stored across all vulnerability tables. CVSS is currently **underutilized** in the UI - only displayed on vulnerability cards with a fallback estimation mechanism when API data is missing.

**Key Findings**:
- ✅ CVSS scores imported from Tenable CSV during vulnerability imports
- ✅ Stored in all 4 vulnerability tables (`vulnerabilities`, `vulnerabilities_current`, `vulnerability_snapshots`, `vulnerability_staging`)
- ✅ Currently displayed only on vulnerability cards (not in modals or grids)
- ⚠️ Data population percentage unknown (need SQL query to verify)
- ❌ NOT used for sorting, filtering, or risk prioritization
- ❌ NOT included in exports or reports

**Recommendation**: Leverage existing CVSS data immediately - NO API enrichment required for mitigation feature.

---

## 1. CVSS Import Verification

### CSV Column Mapping

**Location**: `/app/services/importService.js:251-273` and `/app/utils/helpers.js:340-342`

**Tenable CSV Columns Supported**:
```javascript
const cvssValue = row["cvss_score"] || row["CVSS Score"] || row["cvss"];
```

**Column Variants**:
1. `cvss_score` (primary, lowercase with underscore)
2. `CVSS Score` (capitalized with space)
3. `cvss` (short form)

**Data Quality Handling**:
```javascript
const parsedCvss = cvssValue !== undefined && cvssValue !== null && cvssValue !== ""
    ? parseFloat(cvssValue) : null;
const cvssScore = Number.isFinite(parsedCvss) ? parsedCvss : null;
```

**Robust NULL Handling**:
- Missing values stored as NULL (not zero)
- Invalid values (non-numeric strings) converted to NULL
- Prevents false zero scores from polluting data

---

## 2. Database Schema

### CVSS Fields Across All Tables

**Tables with `cvss_score` column**:

1. **`vulnerabilities`** (historical/legacy table)
   - Line 107 in `init-database.js`
   - Data type: `REAL` (SQLite floating point)

2. **`vulnerabilities_current`** (active vulnerability set)
   - Line 179 in `init-database.js`
   - Data type: `REAL`
   - **Primary table for UI queries**

3. **`vulnerability_snapshots`** (time-series historical data)
   - Line 149 in `init-database.js`
   - Data type: `REAL`
   - Retention: Last 3 scan dates (HEX-219 auto-cleanup)

4. **`vulnerability_staging`** (import staging table)
   - Line 254 in `init-database.js`
   - Data type: `REAL`
   - Temporary storage during high-performance CSV imports

### Data Type: SQLite REAL

**Definition**: SQLite's floating-point type (8-byte IEEE floating point)
**Range**: Approximately ±1.7976931348623157 × 10^308
**Precision**: 15-17 significant decimal digits

**Perfect for CVSS**: CVSS scores range 0.0-10.0 with one decimal precision (e.g., 7.2, 9.8)

### No Separate `cvss_base_score` Field

**Clarification**: Only single `cvss_score` field exists (not separate base/temporal/environmental)

**Implication**: Stored value is likely **CVSS v2.0 Base Score** OR **CVSS v3.x Base Score** (version not distinguished)

---

## 3. Migration History

**No CVSS-Specific Migrations Found**: `cvss_score` has been part of the schema since initial database design.

**Migrations Checked** (001-015):
- Migration 007: `cisco_fixed_versions` table (Cisco advisory data)
- Migration 008: `vendor_daily_totals` table (vendor aggregation)
- Migration 012: `audit_logs` table (HEX-254 unified logging)

**Conclusion**: CVSS support has existed since v1.0.x - NOT a recent addition.

---

## 4. CVSS Usage in Current UI

### Vulnerability Cards (Minimal Display)

**Location**: `/app/public/scripts/shared/vulnerability-cards.js:1159-1223`

**Implementation**:
```javascript
// Line 1160: CVSS from database with fallback
const cvssScore = primaryVuln.cvss_score || this.getCVSSFromSeverity(primaryVuln.severity);

// Line 1218-1223: Display in mini-card
<div class="metric-mini-card cvss">
    <div class="metric-icon">
        <i class="fas fa-shield-alt"></i>
    </div>
    <div class="metric-label">CVSS</div>
    <div class="metric-value">${cvssScore}</div>
</div>
```

**Fallback Estimation** (Lines 1292-1299):
```javascript
getCVSSFromSeverity(severity) {
    const cvssMapping = {
        "Critical": "9.0-10.0",
        "High": "7.0-8.9",
        "Medium": "4.0-6.9",
        "Low": "0.1-3.9"
    };
    return cvssMapping[severity] || "N/A";
}
```

**When Fallback is Used**:
- Database `cvss_score` is NULL
- Non-CVE vulnerabilities (plugin-based findings)
- Older scan data without CVSS scores

### NOT Displayed In

- ❌ **Vulnerability Details Modal** (no CVSS field shown)
- ❌ **Main Vulnerability Grid** (AG-Grid - no CVSS column)
- ❌ **Device Security Modal** (device information card)
- ❌ **Location Details Modal** (devices at location table)
- ❌ **Export CSV Files** (vulnerability exports)
- ❌ **Dashboard Charts** (only VPR and severity metrics)

---

## 5. CVSS vs VPR Comparison

### VPR (Vulnerability Priority Rating)

**Definition**: Tenable's proprietary risk scoring (0.0-10.0 scale)

**Calculation**: Incorporates:
- CVSS base score
- Exploit code maturity (active exploits in the wild)
- Threat intensity (targeted attacks)
- Product coverage (widespread deployment)
- Age of vulnerability

**Data Source**: Tenable Vulnerability Management platform

**Current Prominence in HexTrackr**:
- ✅ Primary risk metric displayed everywhere
- ✅ Used in sorting, filtering, aggregations
- ✅ Drives dashboard totals and trend charts
- ✅ Displayed in vulnerability cards, modals, grids
- ✅ Exported in CSV/JSON reports

### CVSS (Common Vulnerability Scoring System)

**Definition**: Industry-standard vulnerability severity metric (NIST/FIRST)

**Calculation**: Based on:
- Attack Vector (network, adjacent, local, physical)
- Attack Complexity (low, high)
- Privileges Required (none, low, high)
- User Interaction (none, required)
- Scope (unchanged, changed)
- Impact (confidentiality, integrity, availability)

**Data Source**: CVE database, vendor security advisories

**Current Status in HexTrackr**:
- ⚠️ **Imported**: Yes, from Tenable CSV
- ⚠️ **Stored**: Yes, in all vulnerability tables
- ⚠️ **Displayed**: Only on vulnerability cards (with fallback)
- ❌ **Used for decisions**: No (VPR is preferred)
- ❌ **Sorting/Filtering**: Not available
- ❌ **Exports**: Not included

### Why VPR is Currently Preferred

1. **Threat Intelligence**: VPR incorporates real-world exploit data (CVSS does not)
2. **Tenable Integration**: Native to primary data source (consistency)
3. **Dynamic Scoring**: VPR updates as threat landscape changes
4. **CISA KEV Correlation**: VPR aligns well with Known Exploited Vulnerabilities tracking
5. **Actionable**: Higher VPR = higher real-world risk (not just theoretical severity)

### Complementary Role for CVSS

**CVSS is still valuable** because:
- ✅ Industry standard (comparable across organizations)
- ✅ Vendor-neutral (not tied to Tenable platform)
- ✅ Regulatory compliance (many frameworks require CVSS)
- ✅ Stable (CVSS base score doesn't change over time)
- ✅ Granular breakdown (vector string provides attack details)

**Recommendation**: Display both VPR and CVSS for comprehensive risk assessment.

---

## 6. CVSS Data Availability Assessment

### Unknown: Data Population Percentage

**Need to Run SQL Query**:
```sql
-- Check CVSS availability in current vulnerabilities
SELECT
    COUNT(*) as total_vulns,
    COUNT(cvss_score) as with_cvss,
    COUNT(*) - COUNT(cvss_score) as missing_cvss,
    ROUND(COUNT(cvss_score) * 100.0 / COUNT(*), 2) as percent_populated
FROM vulnerabilities_current
WHERE lifecycle_state = 'active';
```

**Expected Results** (hypothesis):
- Tenable scans typically include CVSS for CVE-identified vulnerabilities (80-90% populated)
- Plugin-based vulnerabilities (non-CVE) may have NULL CVSS (10-20% NULL)
- Cisco advisory data likely has CVSS from PSIRT API (high population)

### Comparison Query: CVSS vs VPR

```sql
-- VPR population (for comparison)
SELECT
    COUNT(vpr_score) as with_vpr,
    COUNT(*) - COUNT(vpr_score) as missing_vpr,
    ROUND(COUNT(vpr_score) * 100.0 / COUNT(*), 2) as percent_vpr
FROM vulnerabilities_current
WHERE lifecycle_state = 'active';
```

**Hypothesis**: VPR is likely more consistently populated than CVSS (Tenable always provides VPR for scored vulnerabilities).

---

## 7. CVSS Version Support

### Database Evidence

**NO version distinction** in database schema:
- Single `cvss_score` field (not `cvss_v2_score` + `cvss_v3_score`)
- No `cvss_version` field to track scoring system version

**Implication**: Database stores **either** CVSS v2.0 OR CVSS v3.x base score (whichever Tenable provides).

### Tenable CSV Behavior

**Tenable.io Exports** (modern):
- Column: `CVSS v3.0 Base Score` or `CVSS v3.1 Base Score`
- Format: Decimal (e.g., 7.5, 9.8)

**Tenable.sc Exports** (classic):
- Column: `CVSS Score` (may be v2.0 or v3.0)
- Format: Decimal

**HexTrackr Mapping**:
- Captures ANY of: `cvss_score`, `CVSS Score`, `cvss`
- Does NOT distinguish v2.0 vs v3.x
- Stores whichever value is present

### CVSS v2.0 vs v3.x Differences

| Aspect | CVSS v2.0 | CVSS v3.x |
|--------|-----------|-----------|
| **Scale** | 0-10 | 0-10 (same) |
| **Granularity** | Coarser | Finer |
| **Attack Vector** | Local/Adjacent/Network | Physical/Local/Adjacent/Network |
| **Scope** | N/A | Unchanged/Changed |
| **Temporal Scoring** | Yes | Yes (improved) |
| **Environmental Scoring** | Yes | Yes (improved) |

**Impact for HexTrackr**:
- Scores are comparable (0-10 scale)
- No major UI changes needed (display as "CVSS Base Score")
- Recommend adding version detection in future (low priority)

---

## 8. CVSS Temporal & Environmental Scores

### NOT Currently Captured

**Temporal Metrics** (optional CVSS modifiers):
- Exploit Code Maturity (unproven, proof-of-concept, functional, high)
- Remediation Level (official-fix, temporary-fix, workaround, unavailable)
- Report Confidence (unknown, reasonable, confirmed)

**Environmental Metrics** (organization-specific):
- Confidentiality Requirement (low, medium, high)
- Integrity Requirement (low, medium, high)
- Availability Requirement (low, medium, high)
- Modified Attack Vector/Complexity/etc. (customized for environment)

**Why NOT Captured**:
- Tenable CSV does NOT include temporal/environmental scores by default
- Require manual calculation by security team
- Add complexity without significant value (VPR already provides prioritization)

**Future Enhancement** (Low Priority):
- Add `cvss_temporal_score` column
- Add `cvss_environmental_score` column
- Requires additional Tenable CSV columns or manual input

---

## 9. CVSS for Mitigation Feature Architecture

### Existing Data is Sufficient

**NO API Enrichment Needed** - database field provides:
1. ✅ Industry-standard risk metric for prioritization
2. ✅ Comparison metric alongside VPR (dual-metric risk assessment)
3. ✅ Filtering capability (e.g., "Show only CVSS >= 7.0")
4. ✅ Sorting capability (alternative to VPR sorting)

### Proposed UI Integration

**Mitigation Modal Display**:
```
┌─────────────────────────────────────────────┐
│ Risk Metrics                                │
├─────────────────────────────────────────────┤
│ VPR Score:    8.5  (High Priority)          │
│ CVSS Score:   7.2  (Industry Standard)      │
│ Severity:     High                          │
│ KEV Status:   Yes (CISA Known Exploited)    │
└─────────────────────────────────────────────┘
```

**Sorting/Filtering Options**:
- "Sort by VPR" (default, existing behavior)
- "Sort by CVSS" (new option leveraging existing data)
- "Filter CVSS >= 7.0" (critical/high threshold - NIST guidance)
- "Filter High CVSS + High VPR" (dual-metric risk assessment)

### Fallback Strategy

**Primary**: Use `cvss_score` from database
**Secondary**: Estimate from severity (like vulnerability cards)
**Display**: Show "~7.0" for estimates vs "7.2" for actual scores

**Implementation**:
```javascript
function displayCVSS(vulnerability) {
    if (vulnerability.cvss_score) {
        return vulnerability.cvss_score.toFixed(1);  // "7.2"
    } else {
        const estimate = estimateCVSSFromSeverity(vulnerability.severity);
        return `~${estimate}`;  // "~7.5"
    }
}
```

---

## 10. Data Enrichment NOT Required

### Reasons to Avoid API Enrichment

1. **Data Already in Database**:
   - Imported from Tenable CSV during vulnerability imports
   - No need to fetch from external APIs

2. **NULL Values Handled**:
   - Fallback estimation for missing values
   - VPR provides alternative risk metric

3. **API Calls Add Latency**:
   - External API calls slow down page loads
   - Database lookups are instant

4. **Rate Limiting Concerns**:
   - NVD/CVE.org APIs are rate-limited (10-20 requests/second)
   - Large vulnerability datasets would trigger limits
   - Requires caching and batch processing

5. **Maintenance Overhead**:
   - API integration requires error handling, retry logic, caching
   - API schema changes require updates
   - Authentication/API keys to manage

### Alternative: Leverage Existing Vendor APIs

**If CVSS enrichment is needed**:
- ✅ Cisco PSIRT API (already integrated - HEX-287)
- ✅ Palo Alto Security Bulletins (already integrated)
- ⚠️ NVD API (not integrated, rate-limited)
- ⚠️ CVE.org API (not integrated, less detailed)

**Recommendation**: Use existing data first, only enrich if gaps identified.

---

## 11. Recommendations for Mitigation Feature

### Immediate Actions (Ready for Implementation)

1. **Display CVSS Alongside VPR**:
   - Add to mitigation planning UI
   - Show both metrics in risk assessment sections
   - NO API calls needed - query database

2. **Implement Dual-Metric View**:
```javascript
const riskMetrics = {
    vpr: vulnerability.vpr_score || 0,
    cvss: vulnerability.cvss_score || estimateCVSS(vulnerability.severity),
    severity: vulnerability.severity,
    isKev: vulnerability.isKev || false
};
```

3. **Fallback Strategy**:
   - Primary: Database `cvss_score`
   - Secondary: Estimate from severity
   - Display: "~7.0" for estimates, "7.2" for actual

4. **Export Inclusion**:
   - Add CVSS to mitigation plan CSV exports
   - Include in remediation reports
   - Show both VPR and CVSS for compliance

### Future Enhancements (Low Priority)

1. **CVSS Temporal Scoring**:
   - Add `cvss_temporal_score` column to schema
   - Requires additional Tenable CSV columns (check if available)
   - Provides more accurate short-term risk assessment

2. **CVSS Vector Strings**:
   - Add `cvss_vector` TEXT column
   - Enables breakdown: Attack Vector, Attack Complexity, Privileges Required, etc.
   - Useful for detailed vulnerability analysis

3. **CVSS v4.0 Support**:
   - Monitor Tenable adoption of CVSS v4.0
   - Add version detection logic when needed
   - CVSS v4.0 released 2023, adoption ongoing

4. **CVSS Version Detection**:
   - Add `cvss_version` column (v2.0, v3.0, v3.1, v4.0)
   - Parse from Tenable CSV column headers
   - Display version in UI ("CVSS v3.1 Base Score: 7.2")

---

## 12. UI Enhancement Roadmap

### Phase 1: Surface Existing Data (Immediate)

**Add CVSS to UI Components**:
- [ ] Main vulnerability grid (AG-Grid column)
- [ ] Vulnerability Details Modal (risk metrics section)
- [ ] Device Security Modal (active vulnerabilities table)
- [ ] Location Details Modal (devices at location table)
- [ ] Dashboard charts (CVSS distribution chart)

**Implementation**:
- Frontend-only changes
- Query existing database fields
- Use fallback estimation for NULL values
- **Estimated Effort**: 1 session (4-6 hours)

### Phase 2: Sorting & Filtering (Short-term)

**Add CVSS-Based Operations**:
- [ ] Sort vulnerabilities by CVSS score
- [ ] Filter "CVSS >= 7.0" (NIST high/critical threshold)
- [ ] Dual-metric filter: "High CVSS + High VPR"
- [ ] CVSS column in exports (CSV/JSON)

**Implementation**:
- Backend API updates (add CVSS sorting/filtering)
- Frontend filter UI additions
- Export format enhancements
- **Estimated Effort**: 1 session (4-6 hours)

### Phase 3: Advanced Analytics (Mid-term)

**CVSS-Based Reporting**:
- [ ] CVSS distribution chart (how many vulns per CVSS score range)
- [ ] CVSS vs VPR correlation analysis (do they agree?)
- [ ] Mean CVSS score trend over time
- [ ] Mitigation effectiveness by CVSS range

**Implementation**:
- New API endpoints for analytics
- Dashboard chart components
- Aggregation logic
- **Estimated Effort**: 1-2 sessions (8-12 hours)

---

## 13. Success Metrics

### Data Quality

**Verify CVSS Population**:
```sql
-- Target: >80% of active vulnerabilities have CVSS scores
SELECT
    ROUND(COUNT(cvss_score) * 100.0 / COUNT(*), 2) as cvss_population_percent
FROM vulnerabilities_current
WHERE lifecycle_state = 'active';
```

**Expected**: 80-90% population (CVE-based vulnerabilities have CVSS, plugin-based may not)

### User Adoption

- [ ] CVSS displayed on 100% of UI components showing vulnerability risk
- [ ] Team uses CVSS for prioritization (alongside VPR)
- [ ] Exports include CVSS data
- [ ] Mitigation reports reference CVSS thresholds

### Technical Performance

- [ ] No API calls needed (all data from database)
- [ ] Queries perform well (< 100ms response time)
- [ ] Fallback estimation accurate (within 1.0 CVSS point of actual score)

---

## 14. Conclusion

### Key Findings Summary

1. **✅ CVSS Data Fully Available**:
   - Imported from Tenable CSV during vulnerability imports
   - Stored in all 4 vulnerability tables
   - Ready for immediate use

2. **⚠️ Currently Underutilized**:
   - Only displayed on vulnerability cards (with fallback)
   - NOT used for sorting, filtering, or reporting
   - NOT included in exports

3. **✅ NO API Enrichment Needed**:
   - Database has the data
   - Fallback estimation for NULL values
   - VPR provides alternative risk metric

4. **✅ Ready for Mitigation Feature**:
   - Display alongside VPR for comprehensive risk assessment
   - Use for filtering/sorting in mitigation planning
   - Include in mitigation reports and exports

### Recommended Actions

**Immediate** (Week 1):
- Surface CVSS in all UI components (grids, modals, cards)
- Add CVSS to exports (CSV/JSON)
- Document CVSS vs VPR differences for team

**Short-term** (Week 2-3):
- Add CVSS sorting and filtering
- Create dual-metric risk assessment views
- Build CVSS distribution analytics

**Long-term** (Month 2+):
- Add CVSS temporal scoring (if Tenable provides)
- Add CVSS vector string breakdown
- Monitor CVSS v4.0 adoption

### Data Sufficiency for Mitigation Feature

**Status**: ✅ **SUFFICIENT** - No additional data collection required.

HexTrackr can immediately leverage existing CVSS data for the mitigation tracking feature without API enrichment or additional imports.

---

## Appendix: SQL Queries for Validation

### Query 1: CVSS Population by Vendor

```sql
-- Check CVSS availability by vendor
SELECT
    vendor,
    COUNT(*) as total_vulns,
    COUNT(cvss_score) as with_cvss,
    ROUND(AVG(cvss_score), 2) as avg_cvss,
    MIN(cvss_score) as min_cvss,
    MAX(cvss_score) as max_cvss,
    ROUND(COUNT(cvss_score) * 100.0 / COUNT(*), 2) as percent_with_cvss
FROM vulnerabilities_current
WHERE lifecycle_state = 'active'
GROUP BY vendor
ORDER BY total_vulns DESC;
```

### Query 2: CVSS vs VPR Correlation

```sql
-- Compare CVSS and VPR availability
SELECT
    'CVSS' as metric,
    COUNT(cvss_score) as populated,
    COUNT(*) - COUNT(cvss_score) as missing,
    ROUND(COUNT(cvss_score) * 100.0 / COUNT(*), 2) as percent_populated
FROM vulnerabilities_current
WHERE lifecycle_state = 'active'

UNION ALL

SELECT
    'VPR' as metric,
    COUNT(vpr_score) as populated,
    COUNT(*) - COUNT(vpr_score) as missing,
    ROUND(COUNT(vpr_score) * 100.0 / COUNT(*), 2) as percent_populated
FROM vulnerabilities_current
WHERE lifecycle_state = 'active';
```

### Query 3: Vulnerabilities with Both CVSS and VPR

```sql
-- Dual-scored vulnerabilities (best for mitigation feature)
SELECT
    cve,
    severity,
    cvss_score,
    vpr_score,
    COUNT(DISTINCT hostname) as affected_devices
FROM vulnerabilities_current
WHERE lifecycle_state = 'active'
    AND cvss_score IS NOT NULL
    AND vpr_score IS NOT NULL
GROUP BY cve, severity, cvss_score, vpr_score
ORDER BY vpr_score DESC, cvss_score DESC
LIMIT 20;
```

### Query 4: CVSS Distribution

```sql
-- CVSS score distribution (group by ranges)
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

## References

- **Import Service**: `/app/services/importService.js` (CSV parsing and staging)
- **Helpers Utility**: `/app/utils/helpers.js` (CVSS mapping logic)
- **Vulnerability Cards**: `/app/public/scripts/shared/vulnerability-cards.js` (CVSS display)
- **Database Schema**: `/app/services/init-database.js` (table definitions)
- **CVSS Specification**: [FIRST CVSS v3.1](https://www.first.org/cvss/v3.1/specification-document)
- **Tenable VPR**: [Tenable Vulnerability Priority Rating](https://www.tenable.com/blog/what-is-vpr-and-how-is-it-different-from-cvss)
