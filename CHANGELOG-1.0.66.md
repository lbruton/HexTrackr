# HexTrackr v1.0.66 - Device-Level Fixed Version Search

**Release Date**: 2025-10-15
**Type**: Bug Fix
**Linear Issue**: [HEX-234](https://linear.app/hextrackr/issue/HEX-234)

---

## Bug Fix: Fixed Version Search Implementation

### Problem
Search functionality did not query fixed software versions, preventing users from finding devices by their recommended fixed version (e.g., "15.2(4)E4", "No Fix", etc.).

### Root Cause
**Architecture mismatch**: Fixed versions are **device-level properties**, not vulnerability-level properties.

- Individual vulnerabilities don't have `fixed_version` field
- Fixed versions are calculated per-device by querying all CVEs affecting that device
- Device cards already had `device.fixed_version` populated via advisory helpers
- But device filtering used pre-filtered vulnerabilities, excluding devices with only fixed-version matches

### Solution

**3 Files Modified**:

#### 1. `app/public/scripts/shared/vulnerability-data.js`
**Reverted fixed_version from vulnerability-level search**
- Removed `vuln.fixed_version` check (field doesn't exist at vulnerability level)
- Added comment explaining architecture: fixed_version is device-level only
- Device cards handle fixed_version search separately

#### 2. `app/public/scripts/shared/ag-grid-responsive-config.js` (Lines 171, 184, 188, 193)
**Added data sync for AG-Grid compatibility**
- Added `params.data.fixed_version = value` after each advisory lookup
- Syncs AG-Grid's internal model back to source vulnerability objects
- Ensures consistency between AG-Grid display and underlying data

#### 3. `app/public/scripts/shared/vulnerability-cards.js` (Lines 569-620)
**Fixed device filtering to support fixed_version search**

**Changes**:
- **Line 572**: Use `getDevices()` (all devices) when search is active, instead of pre-filtered `getFilteredDevices()`
- **Lines 575-594**: Populate device-level fields (`operating_system`, `vendor`, `ip_address`) from vulnerabilities when using all devices
- **Lines 596-599**: Restore `fixed_version` from cache (persists across device rebuilds)
- **Lines 601-620**: Manually apply severity/vendor filters when using all devices
- **Line 609**: Device-level search now properly checks `device.fixed_version`

### Testing

**Search now works for**:
- ✅ Full version numbers (e.g., "15.2(4)E4")
- ✅ Partial version matches (e.g., "15.2", "E4")
- ✅ "No Fix" keyword
- ✅ "N/A" keyword
- ✅ Case-insensitive matching

**Preserves existing functionality**:
- ✅ Severity filtering (Critical, High, Medium, Low, KEV)
- ✅ Vendor filtering (CISCO, Palo Alto, Other)
- ✅ Device cards show installed and fixed versions
- ✅ Advisory API lookups unchanged (no regressions)

### Technical Details

**Data Flow**:
1. User types search term → `renderDeviceCards()` triggered
2. If search active → use ALL devices (`getDevices()`)
3. Populate device fields from vulnerabilities
4. Restore `fixed_version` from cache (async populated earlier)
5. Apply severity/vendor filters manually
6. Apply search filter (including `device.fixed_version`)
7. Render filtered device cards

**Cache Behavior**:
- Fixed versions cached in `fixedVersionCache` (Map)
- Persists across device rebuilds during filtering
- Cleared on Docker restart or hard refresh
- Advisory API has 5-minute TTL for fresh data

---

## Files Changed

```
M app/public/scripts/shared/vulnerability-data.js     (Lines 699-711)
M app/public/scripts/shared/ag-grid-responsive-config.js (Lines 171, 184, 188, 193)
M app/public/scripts/shared/vulnerability-cards.js    (Lines 569-620)
```

---

## Impact

**User Experience**:
- Users can now search for devices by fixed version recommendations
- Faster triage: "Show me all devices needing version X.Y.Z"
- Security workflow: "Find all devices with no fix available"

**Performance**:
- Minimal impact: Device filtering occurs in-memory
- No additional API calls (uses existing cache)
- Search remains fast (<100ms for typical datasets)

---

## Notes

- Fixed versions are populated asynchronously via Cisco/Palo Alto advisory helpers
- Search may not find recently added devices until advisory lookups complete (~1-2 seconds)
- Advisory cache expires after 5 minutes for fresh data

---

**Tested on**: macOS M4, Docker Desktop, Chrome 130
**Database**: SQLite 3 (~858MB, 26,425 vulnerabilities)
**Deployed**: Development environment (https://dev.hextrackr.com)
