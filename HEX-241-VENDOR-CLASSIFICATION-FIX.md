# HEX-241 Vendor Classification Fix Plan

**Date**: 2025-10-15
**Status**: Phase 1 (Import Config Fix) - In Progress
**Linear Issue**: HEX-241

---

## Problem Statement

Backend import config (`/config/import.config.json`) is missing 15 device hostname patterns that we added to the frontend config. This causes devices to be classified as "Other" during CSV import instead of being correctly identified as CISCO or Palo Alto.

---

## Architecture Overview

### Current Flow (CORRECT - Already Implemented)

```
CSV Import → helpers.normalizeVendor(plugin_name, hostname)
           → app/config/importConfig.js (reads /config/import.config.json)
           → Applies patterns from JSON file
           → Stores vendor in database
```

### Two-Layer Vendor Detection (As Designed)

1. **Layer 1**: Tenable CSV provides `plugin_name` with vendor hints ("cisco", "palo alto")
2. **Layer 2**: Hostname patterns in config act as **OVERRIDES** for customer-specific naming conventions

### Two Separate Config Files (Different Purposes)

- **`/config/import.config.json`**: Backend vendor classification during import (**ACTIVE USE**)
- **`/config/device-naming-patterns.json`**: Frontend site mapping/location extraction (**FUTURE FEATURE**)

**Important**: These serve different purposes and should not be conflated.

---

## Phase 1: Update Import Config (Tonight)

### Goal
Add 15 missing hostname patterns to `/config/import.config.json`

### New Palo Alto Patterns (6)

| Pattern | Description | Example Hostname |
|---------|-------------|------------------|
| `nfscada` | SCADA firewall | nfscada01 |
| `papan` | PA firewall | papan02 |
| `extpan` | External firewall | extpan01 |
| `intpan` | Internal firewall | intpan03 |
| `campuspan` | Campus firewall | campuspan01 |
| `devpan` | Development firewall | devpan02 |

### New Cisco Patterns (9)

| Pattern | Description | Example Hostname | Notes |
|---------|-------------|------------------|-------|
| `swan` | Switch | swan01 | Broader than nswan |
| `nrwan` | Network Router WAN | nrwan02 | |
| `rtr` | Router | rtr01 | |
| `ns` | Network Switch | tulns31com01 | Needs word boundary |
| `com` | Communication interface | tulns31com01-vlan31 | Needs word boundary |
| `fw` | Firewall | fw01 | |
| `asa` | ASA Firewall | asa02 | |
| `sw` | Switch | sw03 | Needs word boundary |
| `newan` | Edge device | newan01 | |

### Pattern Regex Considerations

Use word boundaries or lookahead/lookbehind for short patterns to avoid false positives:

- `ns` → `\\bns\\d+` or `(?:^|\\D)ns\\d+` (matches "tulns31com01" but not "pensacola")
- `com` → `\\bcom\\d+` or `(?:^|\\D)com\\d+` (matches "com01" but not "common")
- `sw` → `\\bsw\\d+` or `(?:^|\\D)sw\\d+` (matches "sw01" but not "answer")

### Updated Config Structure

```json
{
  "familyVendorPatterns": [
    { "pattern": "cisco", "vendor": "CISCO" },
    { "pattern": "palo\\s*alto", "vendor": "Palo Alto" }
  ],
  "hostnameVendorPatterns": [
    { "pattern": "nswan", "vendor": "CISCO" },
    { "pattern": "swan", "vendor": "CISCO" },
    { "pattern": "nrwan", "vendor": "CISCO" },
    { "pattern": "rtr", "vendor": "CISCO" },
    { "pattern": "\\bns\\d+", "vendor": "CISCO" },
    { "pattern": "\\bcom\\d+", "vendor": "CISCO" },
    { "pattern": "\\bfw\\d+", "vendor": "CISCO" },
    { "pattern": "asa", "vendor": "CISCO" },
    { "pattern": "\\bsw\\d+", "vendor": "CISCO" },
    { "pattern": "newan", "vendor": "CISCO" },
    { "pattern": "nfpan", "vendor": "Palo Alto" },
    { "pattern": "nfscada", "vendor": "Palo Alto" },
    { "pattern": "papan", "vendor": "Palo Alto" },
    { "pattern": "extpan", "vendor": "Palo Alto" },
    { "pattern": "intpan", "vendor": "Palo Alto" },
    { "pattern": "campuspan", "vendor": "Palo Alto" },
    { "pattern": "devpan", "vendor": "Palo Alto" }
  ]
}
```

---

## Phase 2: Fix Existing Database Records (Future)

### Goal
Re-classify existing database records that were imported before the config update.

### Approach Options

**Option A: One-Time Migration Script**
- Create `app/migrations/fix-vendor-classification.js`
- Read all records from `vulnerabilities_current`
- Re-run `normalizeVendor(plugin_name, hostname)` with updated config
- Batch update `vendor` column for misclassified records
- Log changes: "Updated X records from 'Other' to 'CISCO', Y to 'Palo Alto'"

**Option B: Admin API Endpoint**
- Create `POST /api/admin/reclassify-vendors`
- Allows manual trigger from UI
- Returns: `{ updated: 1234, unchanged: 5678 }`
- Can be run multiple times safely (idempotent)

**Recommended**: Implement both - script for automation, endpoint for manual re-runs

### SQL Query Pattern

```sql
UPDATE vulnerabilities_current
SET vendor = ?
WHERE hostname = ?
  AND vendor = 'Other';
```

### Tables to Update

- `vulnerabilities_current` (active vulnerabilities)
- `vulnerability_snapshots` (historical data)
- Consider: `vendor_daily_totals` (may need recalculation)

---

## Phase 3: Frontend Cleanup (Future)

### Goal
Remove unnecessary hostname re-classification from frontend code.

### Files to Modify

**`app/public/scripts/shared/vulnerability-data.js`**:
- Remove `detectVendorFromHostname()` method
- Simplify `normalizeVendor()` to just return database vendor field
- Frontend should **display** vendor, not re-classify it

**Before** (complex):
```javascript
normalizeVendor(pluginName, hostname) {
    // Try hostname detection first
    if (hostname) {
        const vendor = this.detectVendorFromHostname(hostname);
        if (vendor !== "Other") return vendor;
    }
    // Fall back to plugin_name
    return this.detectVendorFromPluginName(pluginName);
}
```

**After** (simple):
```javascript
normalizeVendor(pluginName, hostname, databaseVendor) {
    // Frontend just uses what's in the database
    // No re-classification needed
    return databaseVendor || "Other";
}
```

---

## Implementation Checklist

### Phase 1 (Tonight) ✅
- [x] Research complete architecture
- [x] Document plan in this file
- [ ] Update `/config/import.config.json` with 15 new patterns
- [ ] Test: Verify config loads without errors
- [ ] Test: Import sample CSV and check vendor classification
- [ ] Commit changes with detailed message

### Phase 2 (Next Session) ⏳
- [ ] Create migration script for database re-classification
- [ ] Create admin API endpoint for manual trigger
- [ ] Test migration on dev database
- [ ] Run migration on production database
- [ ] Verify vendor counts before/after

### Phase 3 (Future) 📋
- [ ] Simplify `vulnerability-data.js` to use database vendor only
- [ ] Remove `detectVendorFromHostname()` method
- [ ] Update tests if needed
- [ ] Document in code comments

---

## Testing Strategy

### Phase 1 Testing
1. **Config Loading**: Verify `getImportConfig()` loads updated patterns
2. **Pattern Matching**: Test sample hostnames against patterns
3. **Import Test**: Import sample CSV and verify vendor distribution
4. **Spot Check**: Manually verify problematic hostnames (e.g., "tulns31com01-vlan31" → CISCO)

### Phase 2 Testing
1. **Migration Dry Run**: Count records that would change
2. **Sample Verification**: Check 10-20 random records manually
3. **Vendor Distribution**: Compare before/after vendor counts
4. **Idempotency**: Run migration twice, verify no changes on 2nd run

### Phase 3 Testing
1. **UI Filters**: Verify vendor filter still works correctly
2. **Device Cards**: Verify vendor badges display correctly
3. **Performance**: Verify no performance regression
4. **AG-Grid**: Verify vendor column displays correctly

---

## Known Issues & Edge Cases

### Word Boundary Issues
- **Problem**: Patterns like `ns`, `sw`, `com` can match inside words
- **Solution**: Use `\b` word boundaries or lookahead/lookbehind assertions
- **Example**: `\bns\d+` matches "ns01" but not "pensacola"

### VLAN Interfaces
- **Pattern**: `tulns31com01-vlan31`
- **Should Match**: Both "ns" AND "com" patterns
- **Vendor**: CISCO (first match wins)

### Mixed Case Hostnames
- **Pattern Flags**: All patterns use `flags: "i"` for case-insensitive matching
- **Example**: "STROUDNSWAN03" matches `nswan` pattern

### Hostname Variations
- **With Domain**: `hostname.domain.com` → strip domain before matching
- **With Underscores**: `host_name_01` → patterns should handle
- **With Hyphens**: `host-name-01` → patterns should handle

---

## Rollback Plan

If Phase 1 breaks imports:
1. Revert `/config/import.config.json` to previous version
2. Restart server to clear config cache
3. Re-import affected CSVs

If Phase 2 migration fails:
1. Database backup exists (taken before migration)
2. Restore from backup
3. Fix migration script
4. Retry

---

## Success Criteria

### Phase 1
- ✅ Next CSV import shows fewer "Other" vendors
- ✅ Sample hostnames classified correctly
- ✅ No import errors or crashes

### Phase 2
- ✅ 90%+ of misclassified records corrected
- ✅ Vendor filter shows realistic distribution (not 80% "Other")
- ✅ Historical trend data remains intact

### Phase 3
- ✅ Frontend code simpler and faster
- ✅ No UI regressions
- ✅ Vendor classification remains accurate

---

## Related Files

### Backend (Import Time)
- `/config/import.config.json` - Vendor patterns configuration
- `app/config/importConfig.js` - Config loader with caching
- `app/utils/helpers.js` - `normalizeVendor()` function (lines 50-82)
- `app/services/importService.js` - CSV import logic

### Frontend (Display Time)
- `app/public/scripts/shared/vulnerability-data.js` - Data manager
- `app/public/scripts/pages/tickets-aggrid.js` - Tickets grid
- `app/public/scripts/shared/vulnerability-cards.js` - Device cards

### Database
- `vulnerabilities_current` - Active vulnerabilities
- `vulnerability_snapshots` - Historical data
- `vendor_daily_totals` - Aggregated trend data

---

## Notes

- Config is cached in memory - server restart may be needed to pick up changes
- Use `refreshImportConfig()` to reload config without restart
- Vendor field is indexed (`idx_current_vendor`) for fast filtering
- Frontend config (`device-naming-patterns.json`) is for future site mapping features

---

**Last Updated**: 2025-10-15
**Author**: Claude Code (HEX-241 Implementation)
