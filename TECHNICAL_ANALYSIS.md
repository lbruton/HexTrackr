# HexTrackr Technical Forensic Analysis & Recovery Plan

*Generated: September 2, 2025*

## EXECUTIVE SUMMARY

This analysis identifies the root causes of the trending and statistics display issues in HexTrackr after rollover architecture implementation. The system shows empty trends despite having data, and statistics cards display incomplete date information.

---

## ROOT CAUSE ANALYSIS

### Issue #1: Empty Trends API Response

**SYMPTOM**: `/api/vulnerabilities/trends` returns `[]` (empty array)
**ROOT CAUSE**: Date filter mismatch in trends query

**TECHNICAL DETAILS**:

```sql
-- Current trends query (line 531 in server.js)
WHERE scan_date >= DATE('now', '-14 days')

-- Current date: 2025-09-02
-- 14-day filter range: 2025-08-19 to 2025-09-02
-- Actual data range: 2025-08-11 to 2025-08-18
-- RESULT: No overlap = empty response
```

**DATA ANALYSIS**:

```
Available daily totals in vulnerability_daily_totals:
2025-08-18|4953  ← Latest data
2025-08-17|4948
2025-08-16|4935
2025-08-15|4921
2025-08-14|4892
2025-08-13|4849
2025-08-12|4798
2025-08-11|4738  ← Earliest data

14-day filter starts: 2025-08-19 (no data exists)
```

### Issue #2: Missing Earliest/Latest Dates in Stats API

**SYMPTOM**: Stats API returns empty strings for `earliest` and `latest` fields
**ROOT CAUSE**: `first_seen` and `last_seen` fields are NULL in rollover tables

**TECHNICAL DETAILS**:

```sql
-- Current stats query (line 419 in server.js)
SELECT 
  MIN(first_seen) as earliest,  -- Returns NULL
  MAX(last_seen) as latest      -- Returns NULL
FROM vulnerabilities_current

-- Database inspection shows:
-- first_seen: NULL for all records
-- last_seen:  NULL for all records
```

**FUNCTION ANALYSIS - mapVulnerabilityRow()**:

```javascript
// Line 75-90 in server.js
firstSeen: row["first_seen"] || row["First Seen"] || "",
lastSeen: row["last_seen"] || row["Last Seen"] || "",

// CSV MAPPING ISSUE: Cisco CSV uses different field names
// Cisco actual fields: 'first_found', 'last_found' (not 'first_seen'/'last_seen')
```

---

## DATABASE ARCHITECTURE ANALYSIS

### Rollover Implementation Status

✅ **CORRECTLY IMPLEMENTED**:

- `vulnerability_snapshots`: 4,953 records (historical data)
- `vulnerabilities_current`: 1,651 records (current state)  
- `vulnerability_daily_totals`: 8 records (trending aggregates)
- Proper indexes and constraints in place

✅ **ROLLOVER LOGIC WORKING**:

- `processVulnerabilityRowsWithRollover()` function operational
- `calculateAndStoreDailyTotals()` function generating aggregates
- No duplicate prevention issues found

❌ **FIELD MAPPING INCOMPLETE**:

- CSV field mapping doesn't handle Cisco-specific date fields
- Missing fallback date extraction from import metadata

### Table Schemas

```sql
-- vulnerability_daily_totals (WORKING CORRECTLY)
CREATE TABLE vulnerability_daily_totals (
  scan_date TEXT NOT NULL UNIQUE,           -- ✅ Populated
  critical_count INTEGER DEFAULT 0,         -- ✅ Populated  
  critical_total_vpr REAL DEFAULT 0,        -- ✅ Populated
  total_vulnerabilities INTEGER DEFAULT 0   -- ✅ Populated
);

-- vulnerabilities_current (MISSING DATE FIELDS)
CREATE TABLE vulnerabilities_current (
  first_seen TEXT,     -- ❌ NULL (mapping issue)
  last_seen TEXT,      -- ❌ NULL (mapping issue)
  scan_date TEXT,      -- ✅ Populated correctly
  vpr_score REAL       -- ✅ Populated correctly
);
```

---

## FUNCTION-BY-FUNCTION ANALYSIS

### 1. `processVulnerabilityRowsWithRollover()` (Lines 147-226)

**PURPOSE**: Process CSV rows using rollover architecture  
**STATUS**: ✅ WORKING CORRECTLY
**FUNCTIONALITY**:

- Generates unique keys based on hostname + description + VPR
- Inserts into both snapshots and current tables
- Calls `calculateAndStoreDailyTotals()` on completion

**NO ISSUES FOUND**: Rollover logic is sound

### 2. `calculateAndStoreDailyTotals()` (Lines 228-295)

**PURPOSE**: Generate aggregate statistics for trending  
**STATUS**: ✅ WORKING CORRECTLY
**FUNCTIONALITY**:

- Calculates totals by severity from current table
- Stores in `vulnerability_daily_totals` with INSERT OR REPLACE
- Provides data for trending charts

**EVIDENCE**: 8 daily total records exist with proper counts

### 3. `mapVulnerabilityRow()` (Lines 74-92)

**PURPOSE**: Map CSV fields to database schema  
**STATUS**: ⚠️ PARTIALLY BROKEN
**ISSUES**:

```javascript
// Current mapping (INCOMPLETE)
firstSeen: row["first_seen"] || row["First Seen"] || "",
lastSeen: row["last_seen"] || row["Last Seen"] || "",

// Cisco CSV actual fields (MISSING)
// row["first_found"] → firstSeen mapping needed
// row["last_found"] → lastSeen mapping needed
```

### 4. API Endpoints Analysis

#### `/api/vulnerabilities/trends` (Lines 520-560)

**STATUS**: ❌ BROKEN (Date Filter Issue)
**FIX REQUIRED**:

```javascript
// CURRENT (broken for August data)
WHERE scan_date >= DATE('now', '-14 days')

// PROPOSED FIX
WHERE scan_date >= DATE('now', '-30 days')  -- Extend range
// OR make configurable with query parameter
```

#### `/api/vulnerabilities/stats` (Lines 418-436)

**STATUS**: ⚠️ PARTIALLY BROKEN (Missing Dates)
**FIX REQUIRED**:

```javascript
// CURRENT (returns NULL dates)
MIN(first_seen) as earliest,
MAX(last_seen) as latest

// PROPOSED FIX  
MIN(COALESCE(first_seen, scan_date)) as earliest,
MAX(COALESCE(last_seen, scan_date)) as latest
```

---

## CSV IMPORT WORKFLOW ANALYSIS

### Current Import Flow (WORKING)

1. **File Upload**: `/api/vulnerabilities/import` receives CSV
2. **Papa.parse**: Parses CSV with headers
3. **Import Record**: Creates entry in `vulnerability_imports`  
4. **Rollover Processing**: Calls `processVulnerabilityRowsWithRollover()`
5. **Data Storage**: Inserts into snapshots + current tables
6. **Aggregation**: Calculates daily totals for trending

### Missing CVE Column Handling (WORKING CORRECTLY)

```javascript
// Line 80 in mapVulnerabilityRow()
cve: row["definition.cve"] || row["cve"] || row["CVE"] || "",

// ANALYSIS: This correctly handles missing CVE columns
// Falls back to empty string when CVE not present
// NO ISSUES with August CSV missing CVE
```

### Duplicate Prevention (WORKING CORRECTLY)

```javascript
// Lines 180-210 in processVulnerabilityRowsWithRollover()
INSERT OR REPLACE INTO vulnerabilities_current

// ANALYSIS: Uses unique_key constraint for deduplication
// Same CSV uploaded twice would replace, not duplicate
// NO ISSUES with duplicate prevention
```

---

## SAMPLE CSV FILE ANALYSIS

### Available Test Files

1. `cisco-vulnerabilities-08_19_2025_-09_02_16-cdt.csv` (62MB)
2. `vulnerabilities-cisco-sept01.csv` (3MB)  
3. `vulnerabilities-cisco-sept02.csv` (3MB)
4. `vulnerabilities-cisco.csv` (3MB, untagged)

### Expected CSV Structure (Cisco)

```csv
asset.display_ipv4_address,asset.name,definition.family,definition.vpr.score,severity,first_found,last_found,definition.cve
10.1.1.100,server01,Windows,7.4,High,2025-08-01,2025-08-15,CVE-2023-1234
```

### Field Mapping Gaps

❌ **MISSING MAPPINGS**:

- `first_found` → `first_seen` (dates missing in stats)
- `last_found` → `last_seen` (dates missing in stats)

✅ **WORKING MAPPINGS**:

- `asset.display_ipv4_address` → `ip_address`
- `asset.name` → `hostname`
- `definition.vpr.score` → `vpr_score`
- `definition.cve` → `cve` (with fallbacks)

---

## RECOVERY PLAN

### Phase 1: Quick Fixes (1 Chat Session)

**Objective**: Restore trending functionality immediately

#### Fix 1.1: Extend Trends Date Range

```javascript
// File: server.js, Line: 531
// CHANGE FROM:
WHERE scan_date >= DATE('now', '-14 days')

// CHANGE TO:
WHERE scan_date >= DATE('now', '-30 days')
```

#### Fix 1.2: Fix Stats API Date Fields  

```javascript
// File: server.js, Lines: 425-426
// CHANGE FROM:
MIN(first_seen) as earliest,
MAX(last_seen) as latest

// CHANGE TO:
MIN(COALESCE(first_seen, scan_date)) as earliest,
MAX(COALESCE(last_seen, scan_date)) as latest
```

### Phase 2: CSV Field Mapping Enhancement (1 Chat Session)

**Objective**: Fix missing date fields in future imports

#### Fix 2.1: Enhance mapVulnerabilityRow()

```javascript
// File: server.js, Lines: 83-84
// CHANGE FROM:
firstSeen: row["first_seen"] || row["First Seen"] || "",
lastSeen: row["last_seen"] || row["Last Seen"] || "",

// CHANGE TO:
firstSeen: row["first_seen"] || row["First Seen"] || row["first_found"] || row["First Found"] || "",
lastSeen: row["last_seen"] || row["Last Seen"] || row["last_found"] || row["Last Found"] || "",
```

### Phase 3: Data Cleanup (1 Chat Session)

**Objective**: Populate missing date fields in existing data

#### Fix 3.1: Backfill Missing Dates

```sql
-- Update existing records to use scan_date as fallback
UPDATE vulnerabilities_current 
SET first_seen = scan_date, last_seen = scan_date 
WHERE first_seen IS NULL OR first_seen = '';
```

---

## COMMIT ANALYSIS

### Key Commits Examined

1. **ad273fd** - "IMPLEMENT: Database rollover architecture"
   - **IMPACT**: Introduced rollover tables (GOOD)
   - **ISSUE**: No field mapping updates for Cisco CSV dates

1. **b64c938** - "BACKUP: Complete rollover architecture before data migration"  
   - **IMPACT**: Data migration completed (GOOD)
   - **ISSUE**: Preserved broken date field mapping

### No Breaking Changes Found

- Rollover architecture implementation is sound
- CSV import logic correctly handles missing CVE
- Duplicate prevention working as designed
- Issue is simple date filter + field mapping problem

---

## TESTING VERIFICATION PLAN

### Phase 1 Testing (After Quick Fixes)

```bash

# Test 1: Verify trends API returns data

curl "http://localhost:8080/api/vulnerabilities/trends"

# EXPECT: Array with 8 entries (Aug 11-18 data)

# Test 2: Verify stats API shows dates  

curl "http://localhost:8080/api/vulnerabilities/stats"

# EXPECT: earliest/latest populated with scan_date values

```

### Phase 2 Testing (After Field Mapping)

```bash

# Test 3: Import new CSV with date fields

# Upload vulnerabilities-cisco-sept01.csv

# EXPECT: first_seen/last_seen populated from first_found/last_found

```

### Phase 3 Testing (After Data Cleanup)

```bash

# Test 4: Verify all records have date fields

sqlite3 data/hextrackr.db "SELECT COUNT(*) FROM vulnerabilities_current WHERE first_seen IS NULL"

# EXPECT: 0 (no NULL dates)

```

---

## IMPLEMENTATION COMPLEXITY

### Simple Fixes (30 minutes total)

- ✅ Trends date range: Change one number (14 → 30)
- ✅ Stats date fallback: Add COALESCE() functions  
- ✅ Field mapping: Add 2 additional fallback patterns

### No Complex Changes Required

- ❌ Database schema changes: NOT NEEDED
- ❌ Rollover architecture changes: NOT NEEDED  
- ❌ CSV import workflow changes: NOT NEEDED
- ❌ Frontend changes: NOT NEEDED

---

## RISK ASSESSMENT

### Zero Risk Changes

- Extending date range in trends query (backward compatible)
- Adding COALESCE() fallbacks in stats query (backward compatible)
- Adding field mapping patterns (backward compatible)

### Data Integrity

- All changes preserve existing data
- No destructive operations required
- Rollover architecture remains intact

---

## CONCLUSION

The HexTrackr system is fundamentally sound. The rollover architecture is working correctly, and CSV import is processing data properly. The issues are minor configuration problems:

1. **Date filter too restrictive** (14 days vs actual data range)
2. **Missing field mappings** for Cisco CSV date fields
3. **NULL date handling** in stats calculations

**TOTAL EFFORT**: 3 simple code changes, implementable in 1 chat session

**EXPECTED OUTCOME**: Fully functional trending charts and complete statistics display with minimal risk.
