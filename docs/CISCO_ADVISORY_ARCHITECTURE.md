# Cisco Advisory Architecture

**Authority**: HEX-287 (v1.0.79)
**Last Updated**: 2025-10-17
**Status**: Production

---

## Overview

HexTrackr's Cisco advisory system retrieves fixed software versions from the Cisco PSIRT OpenVuln API and displays them per-device, per-CVE. This document explains the complete architecture to prevent future regressions.

**Critical Rule**: NEVER change the train filtering logic without understanding the full data flow from API → Database → Frontend.

---

## The Problem We Solved (HEX-287)

### Initial Bug (Pre-HEX-287)

**Symptom**: Cisco advisory data disappearing on every sync. Device with IOS showing IOS XE fixed versions.

**Root Cause**: Multi-OS-family CVEs (affecting both IOS and IOS XE) stored in denormalized JSON array:

```javascript
// Table: cisco_advisories
{
  cve_id: "CVE-2025-20352",
  first_fixed: ["15.2(8)E8"]  // ❌ Last write wins - IOS XE data lost!
}
```

When sync processed IOS XE versions for same CVE, it **overwrote** the IOS data:
```javascript
// After IOS sync
first_fixed: ["15.2(8)E8"]  // IOS E-train

// After IOS XE sync (OVERWRITES previous)
first_fixed: ["17.12.6"]    // IOS XE - IOS data GONE!
```

### The Solution: Normalized Schema

Created separate table for one-to-many relationship:

```sql
-- Table: cisco_advisories (one row per CVE)
CREATE TABLE cisco_advisories (
    cve_id TEXT PRIMARY KEY,
    advisory_id TEXT,
    advisory_title TEXT,
    -- ... metadata only
);

-- Table: cisco_fixed_versions (many rows per CVE)
CREATE TABLE cisco_fixed_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cve_id TEXT NOT NULL,
    os_family TEXT NOT NULL,      -- "ios", "iosxe", "iosxr", "nxos"
    fixed_version TEXT NOT NULL,
    FOREIGN KEY (cve_id) REFERENCES cisco_advisories(cve_id),
    UNIQUE(cve_id, os_family, fixed_version)  -- Prevents duplicates
);
```

Now CVE-2025-20352 has multiple rows:
```
cve_id            | os_family | fixed_version
------------------|-----------|---------------
CVE-2025-20352    | ios       | 15.2(8)E8
CVE-2025-20352    | ios       | 15.9(3)M11
CVE-2025-20352    | ios       | 15.1(2)SG8
CVE-2025-20352    | iosxe     | 17.12.6
CVE-2025-20352    | iosxe     | 17.9.4a
```

**Result**: No more overwrites! Each OS family's data preserved independently.

---

## Architecture Layers

### Layer 1: Cisco PSIRT API

**Endpoint**: `GET /security/advisories/v2/OSType/{osType}?version={version}`

**Response Structure**:
```json
{
  "advisories": [
    {
      "advisoryId": "cisco-sa-20250101-ios-rce",
      "cveId": "CVE-2025-20352",
      "sir": "High",
      "firstFixed": ["15.2(8)E8", "15.9(3)M11", "15.1(2)SG8"],  // All trains!
      "iosRelease": "15.2(4)E8",
      "productNames": ["Cisco IOS 15.2(4)E8", "Cisco IOS 15.2(5)E7"]
    }
  ]
}
```

**Key Insight**: `firstFixed` is an **array** containing fixes for ALL trains within that OS family.

---

### Layer 2: Backend Service (ciscoAdvisoryService.js)

**File**: `app/services/ciscoAdvisoryService.js`

#### Sync Logic (lines 665-743)

**Three-Step Process**:

```javascript
// Step 1: Insert/update advisory metadata (ONE row per CVE)
await db.run(`
    INSERT INTO cisco_advisories (cve_id, advisory_id, advisory_title, ...)
    VALUES (?, ?, ?, ...)
    ON CONFLICT(cve_id) DO UPDATE SET
        advisory_id = COALESCE(excluded.advisory_id, cisco_advisories.advisory_id),
        ...
`, [cveId, advisoryId, title, ...]);

// Step 2: Insert fixed versions (MANY rows per CVE)
for (const version of fixedVersionsArray) {
    await db.run(`
        INSERT INTO cisco_fixed_versions (
            cve_id, os_family, fixed_version, affected_version, last_synced
        ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(cve_id, os_family, fixed_version) DO UPDATE SET
            last_synced = CURRENT_TIMESTAMP
    `, [cveId, osInfo.osType, version, osInfo.version]);
}

// Step 3: Update flags (is_cisco_advisory, etc.)
await db.run(`UPDATE cisco_advisories SET is_cisco_advisory = 1 WHERE cve_id = ?`, [cveId]);
```

**Critical**: Uses `ON CONFLICT ... DO UPDATE` (NOT `INSERT OR REPLACE`) to prevent data loss.

#### API Endpoint (ciscoController.js)

**Route**: `GET /api/cisco/fixed-versions/:cveId?os_family=ios`

```javascript
async getFixedVersions(req, res) {
    const { cveId } = req.params;
    const { os_family } = req.query;  // Optional filter

    const versions = await ciscoAdvisoryService.getFixedVersions(cveId, os_family);
    res.json(versions);  // Returns array of { id, cve_id, os_family, fixed_version, ... }
}
```

**Example Response** (with `?os_family=ios`):
```json
[
  { "cve_id": "CVE-2025-20352", "os_family": "ios", "fixed_version": "15.2(8)E8" },
  { "cve_id": "CVE-2025-20352", "os_family": "ios", "fixed_version": "15.9(3)M11" },
  { "cve_id": "CVE-2025-20352", "os_family": "ios", "fixed_version": "15.1(2)SG8" }
]
```

**Without `os_family` parameter**:
```json
[
  { "cve_id": "CVE-2025-20352", "os_family": "ios", "fixed_version": "15.2(8)E8" },
  { "cve_id": "CVE-2025-20352", "os_family": "ios", "fixed_version": "15.9(3)M11" },
  { "cve_id": "CVE-2025-20352", "os_family": "iosxe", "fixed_version": "17.12.6" }
]
```

---

### Layer 3: Frontend Helper (cisco-advisory-helper.js)

**File**: `app/public/scripts/shared/cisco-advisory-helper.js`

#### Main Workflow

```javascript
async getFixedVersion(cveId, vendor, installedVersion = null) {
    // 1. Parse OS type from installed version
    const osType = this.parseOSType(installedVersion);  // "IOS", "IOS XE", etc.
    const osFamily = this.mapOSToAPIFormat(osType);     // "ios", "iosxe", etc.

    // 2. Build API URL with OS family filter
    let apiUrl = `/api/cisco/fixed-versions/${cveId}`;
    if (osFamily) {
        apiUrl += `?os_family=${osFamily}`;
    }

    // 3. Fetch from API (with 5-min cache)
    const response = await fetch(apiUrl);
    const versions = await response.json();

    // 4. Extract version strings and sort semantically
    const fixedVersionStrings = versions.map(v => v.fixed_version);
    fixedVersionStrings.sort((a, b) => this.compareVersions(a, b));  // Descending

    // 5. Filter by train if installed version provided
    if (installedVersion && fixedVersionStrings.length > 1) {
        return this.matchFixedVersion(installedVersion, fixedVersionStrings);
    }

    // 6. Return highest version
    return fixedVersionStrings[0];
}
```

#### Train Filtering Logic (THE CRITICAL PART)

**Function**: `matchFixedVersion(installedVersion, fixedVersionsArray)`

**Example**: Device with `"CISCO IOS 15.2(4)SE5"` (SE-train)

```javascript
// Step 1: Extract train from installed version
const installedTrain = this.extractTrain("CISCO IOS 15.2(4)SE5");
// Result: "SE"

// Step 2: Normalize train to base family
const installedFamily = this.normalizeTrainFamily("SE");
// Result: "E" (SE is Switching Enterprise, part of E family)

// Step 3: Filter array by matching train family
const fixedVersionsArray = ["15.2(8)E8", "15.9(3)M11", "15.1(2)SG8"];

const trainMatches = fixedVersionsArray.filter(v => {
    const fixTrain = this.extractTrain(v);        // "E", "M", "SG"
    const fixFamily = this.normalizeTrainFamily(fixTrain);  // "E", "M", "E"
    return fixFamily === installedFamily;  // Match "E" family
});

// Result: ["15.2(8)E8", "15.1(2)SG8"]  // Only E-family versions

// Step 4: Return highest matching version
return trainMatches[0];  // "15.2(8)E8"
```

#### Train Family Normalization

**Function**: `normalizeTrainFamily(train)`

**Mapping**:
```javascript
// Enterprise family variants
"E"   → "E"
"EA"  → "E"  // Early Adoption
"ED"  → "E"  // Extended Delivery
"SE"  → "E"  // ⚠️ Switching Enterprise (NOT Service Provider!)
"SG"  → "E"  // Security Gateway

// Mainline family variants
"M"   → "M"
"MA"  → "M"  // Mainline Advanced

// Service Provider family variants
"S"   → "S"  // ⚠️ NOT "SE" or "SG"!
"SA"  → "S"  // Service Provider Advanced

// Others
"T"   → "T"  // Throttle (legacy)
```

**CRITICAL RULE**: SE and SG are **Enterprise** trains, NOT Service Provider!

#### Version Comparison

**Function**: `compareVersions(a, b)`

**Handles Two Formats**:

1. **IOS Train Notation**: `15.2(8)E8`
   ```javascript
   // Parse: major.minor(maintenance[letter])TRAIN[subrelease]
   {
     major: 15,
     minor: 2,
     maint: 8,
     maintLetter: "",
     train: "E",
     subrelease: "8"
   }
   ```

2. **IOS XE Clean Format**: `17.12.6` or `17.12.4a`
   ```javascript
   // Parse: major.minor.patch[letter]
   {
     major: 17,
     minor: 12,
     maint: 6,
     maintLetter: "",
     train: "",
     subrelease: ""
   }
   ```

**Comparison Order** (descending - highest first):
1. Major version
2. Minor version
3. Maintenance/patch version
4. Maintenance letter (e.g., `7b` > `7a` > `7`)
5. Train identifier (alphabetical)
6. Subrelease number

---

## Data Flow Example

### Scenario: Device with IOS 15.2(4)SE5 affected by CVE-2025-20352

**Step 1: Backend Sync** (ciscoAdvisoryService.js)

Query Cisco API:
```
GET /security/advisories/v2/OSType/ios?version=15.2(4)SE5
```

Response includes CVE-2025-20352 with:
```json
{
  "firstFixed": ["15.2(8)E8", "15.9(3)M11", "15.1(2)SG8"]
}
```

Store in database:
```sql
INSERT INTO cisco_fixed_versions VALUES
  (1, 'CVE-2025-20352', 'ios', '15.2(8)E8', '15.2(4)SE5', '2025-10-17 12:00:00'),
  (2, 'CVE-2025-20352', 'ios', '15.9(3)M11', '15.2(4)SE5', '2025-10-17 12:00:00'),
  (3, 'CVE-2025-20352', 'ios', '15.1(2)SG8', '15.2(4)SE5', '2025-10-17 12:00:00');
```

**Step 2: Frontend Request** (cisco-advisory-helper.js)

Device card calls:
```javascript
ciscoAdvisoryHelper.getFixedVersion(
  "CVE-2025-20352",
  "Cisco Systems",
  "CISCO IOS 15.2(4)SE5"
);
```

**Step 3: Parse OS Type**
```javascript
parseOSType("CISCO IOS 15.2(4)SE5")  // → "IOS"
mapOSToAPIFormat("IOS")              // → "ios"
```

**Step 4: Fetch from API**
```
GET /api/cisco/fixed-versions/CVE-2025-20352?os_family=ios
```

Response:
```json
[
  { "fixed_version": "15.2(8)E8" },
  { "fixed_version": "15.9(3)M11" },
  { "fixed_version": "15.1(2)SG8" }
]
```

**Step 5: Sort Versions**
```javascript
// After compareVersions() sort (descending):
["15.9(3)M11", "15.2(8)E8", "15.1(2)SG8"]
```

**Step 6: Filter by Train**
```javascript
extractTrain("CISCO IOS 15.2(4)SE5")  // → "SE"
normalizeTrainFamily("SE")            // → "E"

// Filter array:
"15.9(3)M11" → train="M", family="M" → ❌ NO MATCH
"15.2(8)E8"  → train="E", family="E" → ✅ MATCH
"15.1(2)SG8" → train="SG", family="E" → ✅ MATCH

// Result after filtering:
["15.2(8)E8", "15.1(2)SG8"]
```

**Step 7: Return Result**
```javascript
return "15.2(8)E8"  // Highest E-family version
```

**Step 8: Display in UI**

Device card shows:
```
Fixed Version: 15.2(8)E8+
```

---

## Common Pitfalls & How to Avoid Them

### ❌ Pitfall 1: Using First-Letter Train Matching

**Wrong**:
```javascript
const installedFirstLetter = installedTrain.charAt(0);  // "SE" → "S"
return fixTrain.charAt(0) === installedFirstLetter;     // Matches S-family!
```

**Why Wrong**: SE-train devices would match S-family (Service Provider) instead of E-family (Enterprise).

**Correct**:
```javascript
const installedFamily = this.normalizeTrainFamily(installedTrain);  // "SE" → "E"
const fixFamily = this.normalizeTrainFamily(fixTrain);
return fixFamily === installedFamily;  // Matches E-family ✅
```

### ❌ Pitfall 2: OS Filtering Instead of Train Filtering

**Wrong**:
```javascript
// Only filter by OS type
const matchingVersions = fixedVersionsArray.filter(v =>
    this.parseOSType(v) === installedOS
);
```

**Why Wrong**: This worked BEFORE HEX-287 because database bug meant only one train per CVE. Now database has ALL trains, so you'll get wrong results (M-train devices showing E-train fixes).

**Correct**:
```javascript
// Filter by BOTH OS (via API parameter) AND train (via normalizeTrainFamily)
// OS filtering: ?os_family=ios (backend)
// Train filtering: normalizeTrainFamily() (frontend)
```

### ❌ Pitfall 3: Using INSERT OR REPLACE

**Wrong**:
```sql
INSERT OR REPLACE INTO cisco_advisories (cve_id, first_fixed)
VALUES (?, ?);
```

**Why Wrong**: Replaces entire row, losing other columns. With normalized schema, would delete all related `cisco_fixed_versions` rows due to foreign key CASCADE.

**Correct**:
```sql
INSERT INTO cisco_advisories (cve_id, ...)
VALUES (?, ...)
ON CONFLICT(cve_id) DO UPDATE SET
    advisory_id = COALESCE(excluded.advisory_id, cisco_advisories.advisory_id);
```

### ❌ Pitfall 4: Not Sorting Before Filtering

**Wrong**:
```javascript
const trainMatches = fixedVersionsArray.filter(...);
return trainMatches[0];  // Might return oldest version!
```

**Why Wrong**: Backend returns ASCII-sorted versions (`"15.1..."` before `"15.9..."`), not semantically sorted.

**Correct**:
```javascript
fixedVersionStrings.sort((a, b) => this.compareVersions(a, b));  // Sort first!
const trainMatches = fixedVersionStrings.filter(...);
return trainMatches[0];  // Now guaranteed highest
```

---

## Testing Checklist

When modifying Cisco advisory code, test these scenarios:

### Test 1: Multi-OS-Family CVE
- ✅ IOS device shows IOS fixed version
- ✅ IOS XE device shows IOS XE fixed version
- ✅ Data persists after re-sync (no overwrites)

### Test 2: Multi-Train CVE (IOS only)
- ✅ E-train device shows E-family version (E, EA, ED, SE, SG)
- ✅ M-train device shows M-family version (M, MA)
- ✅ S-train device shows S-family version (S, SA)

### Test 3: SE Train Specifically
- ✅ Device with `15.2(4)SE5` shows E-family fixes, NOT S-family
- ✅ SE versions match with E/EA/ED/SG versions
- ✅ SE versions DO NOT match with S/SA versions

### Test 4: Version Sorting
- ✅ `15.9(3)M11` ranks higher than `15.2(8)E8` (major.minor comparison)
- ✅ `17.12.6` ranks higher than `17.12.4a` (IOS XE format)
- ✅ `15.2(8)E8` ranks higher than `15.2(7)E13` (maintenance number)

### Test 5: Cache Behavior
- ✅ Second device with same CVE doesn't re-fetch (cache hit)
- ✅ Cache differentiates by OS family (`CVE:ios` vs `CVE:iosxe`)
- ✅ Train filtering applied to cached results

---

## File Reference

### Backend
- **Service**: `app/services/ciscoAdvisoryService.js` (lines 665-860)
- **Controller**: `app/controllers/ciscoController.js` (getFixedVersions method)
- **Routes**: `app/routes/cisco.js` (line 39-41)
- **Migration**: `app/public/scripts/migrations/007-normalize-cisco-fixed-versions.sql`

### Frontend
- **Helper**: `app/public/scripts/shared/cisco-advisory-helper.js` (445 lines)
  - `parseOSType()` - lines 45-81
  - `extractTrain()` - lines 180-186
  - `normalizeTrainFamily()` - lines 199-219
  - `compareVersions()` - lines 114-172
  - `matchFixedVersion()` - lines 234-270
  - `getFixedVersion()` - lines 277-377

### Documentation
- **User Guide**: `app/public/docs-source/guides/cisco-psirt-integration.md`
- **Architecture**: `docs/CISCO_ADVISORY_ARCHITECTURE.md` (this file)

---

## Quick Reference: Train Families

| Train Code | Full Name | Family | Common Use Case |
|------------|-----------|--------|-----------------|
| E | Enterprise | E | General enterprise switching/routing |
| EA | Early Adoption | E | New features, less testing |
| ED | Extended Delivery | E | Long-term support, stable |
| SE | Switching Enterprise | E | Catalyst switches, Layer 2/3 |
| SG | Security Gateway | E | ISR routers with security features |
| M | Mainline | M | General-purpose, balanced features |
| MA | Mainline Advanced | M | Enhanced mainline features |
| S | Service Provider | S | Carrier-grade, SP features |
| SA | Service Provider Advanced | S | Enhanced SP features |
| T | Throttle | T | Legacy train (deprecated) |

**Memory Aid**:
- **E**nterprise family: E, EA, ED, S**E**, S**G** (anything with Enterprise in the name)
- **M**ainline family: M, MA
- **S**ervice Provider family: S, SA (NOT SE/SG!)

---

## Version History

- **v1.0.79** (2025-10-17): Initial documentation after HEX-287 fix
  - Normalized schema implementation
  - Train family normalization (SE→E fix)
  - Multi-OS-family support

---

## Contact

**Maintainer**: HexTrackr Development Team
**Linear Issue**: HEX-287
**Related Issues**: HEX-282, HEX-204, HEX-141
