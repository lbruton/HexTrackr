# HEX-350 Research: Improve Ticket Creation with Parsed Locations

**Linear Issue**: [HEX-350](https://linear.app/hextrackr/issue/HEX-350)
**Type**: Research Spike → Enhancement
**Priority**: Medium
**Status**: Research Complete → Ready for Planning
**Estimated Effort**: 1-2 sessions (backend + frontend changes)

---

## Objective

Replace simple substring extraction (first 4 chars = site, first 5 chars = location) with sophisticated HostnameParserService logic and intelligent site field population based on existing tickets database.

**Current Problem**: Ticket creation ignores the improved hostname parsing system that powers location cards, leading to inconsistent location data and duplicate site entries.

---

## Research Complete ✅

**Research Date**: October 28, 2025
**Researcher**: Claude Code + Plan Subagent
**Methodology**: Semantic codebase search + targeted file reads

---

## 1. CURRENT IMPLEMENTATION

### 1.1 Ticket Creation Entry Points

**Vulnerabilities Page - Device Cards**:
- File: `app/public/scripts/shared/vulnerability-cards.js:197-282`
- Handler: `handleCreateTicketClick(event, button)`
- Current logic (lines 225-227):
  ```javascript
  const site = hostname.substring(0, 4).toUpperCase();
  const location = hostname.substring(0, 5).toUpperCase();
  ```

**Device Security Modal**:
- File: `app/public/scripts/shared/device-security-modal.js:1039-1145`
- Same substring extraction pattern (lines 1064-1065)

**Location Details Modal**:
- File: `app/public/scripts/shared/location-details-modal.js:1135-1194`
- **Already uses HostnameParserService!** (line 1144-1146)
- Good reference implementation

### 1.2 Data Flow

1. User clicks "Create Ticket" button
2. Handler extracts site/location via substring (4 chars / 5 chars)
3. Builds `options` object with devices array, site, location, mode
4. Stores data in `sessionStorage.createTicketData` as JSON
5. Navigates to `/tickets.html`
6. Ticket modal auto-opens and reads sessionStorage (tickets.js:4046-4154)
7. Populates site field from `ticketData.site` (line 4096-4098)
8. Populates location field from `ticketData.location` (line 4102-4103)

---

## 2. HOSTNAMEPARSER SERVICE

### 2.1 Backend Service

**Location**: `app/services/hostnameParserService.js`
**Method**: `parseHostname(hostname)` (lines 76-91)

**Returns**:
```javascript
{
  hostname: "tulsatowernswan01",
  location: "tulsatower",           // Parsed using device type patterns
  site_code: "TULS",                // Derived from location
  device_type: "switch",            // Extracted from pattern matching
  parsing_method: "regex_pattern",  // or "substring_fallback"
  confidence: 0.95                  // 0.5-1.0 confidence score
}
```

**Pattern Matching** (lines 97-148):
- Tries regex patterns first (e.g., "nswan", "nrwan", "nfpan")
- Falls back to substring extraction if no pattern matches
- Supports site code mappings from `config/device-naming-patterns.json`
- Normalizes locations (e.g., "wtuls" → "wtulsa")

**Fallback Behavior** (lines 155-169):
- If pattern matching fails, uses substring extraction
- Returns 4-char site and 5-char location (same as current logic)
- Confidence: 0.5 (indicates low confidence parse)

### 2.2 Current Limitation

**HostnameParserService is backend-only** - not exposed to frontend JavaScript directly.

**Solution**: Create API endpoint to expose parsing functionality.

---

## 3. SITE LOOKUP STRATEGY

### 3.1 Goal

**Leave site field blank UNLESS** there's already a matching location in tickets database.

**Why**: Prevents creating duplicate site entries. Users can manually populate site for new locations.

### 3.2 SQL Query

```sql
SELECT DISTINCT site
FROM tickets
WHERE LOWER(location) = LOWER(?)
  AND deleted = 0
  AND site IS NOT NULL
  AND site != ''
LIMIT 1
```

**Handles**:
- Case-insensitive matching (`LOWER()`)
- Excludes deleted tickets (`deleted = 0`)
- Excludes null/empty sites
- Returns first match if multiple sites exist

### 3.3 Edge Cases

**Multiple sites for same location**: Use `LIMIT 1` (arbitrary but consistent)
**No matching tickets**: Return null (leave site field blank)
**Case sensitivity**: Normalize with `LOWER()`

---

## 4. RECOMMENDED IMPLEMENTATION

### 4.1 Backend Changes

#### New API Endpoint: Hostname Parsing

**File**: `app/routes/vulnerabilities.js` or new `app/routes/hostname.js`

```javascript
router.get("/hostname/parse/:hostname", (req, res) => {
  try {
    const { hostname } = req.params;
    const parsed = hostnameParserService.parseHostname(hostname);
    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**Response Format**:
```json
{
  "hostname": "tulsatowernswan01",
  "location": "tulsatower",
  "site_code": "TULS",
  "device_type": "switch",
  "parsing_method": "regex_pattern",
  "confidence": 0.95
}
```

#### New TicketService Method

**File**: `app/services/ticketService.js` (after line 300)

```javascript
async getSiteByLocation(location) {
  return new Promise((resolve, reject) => {
    this.db.get(
      `SELECT DISTINCT site
       FROM tickets
       WHERE LOWER(location) = LOWER(?)
         AND deleted = 0
         AND site IS NOT NULL
         AND site != ''
       LIMIT 1`,
      [location],
      (err, row) => {
        if (err) return reject(err);
        resolve(row?.site || null);
      }
    );
  });
}
```

#### New API Endpoint: Site Lookup

**File**: `app/routes/tickets.js`

```javascript
router.get("/site-by-location/:location", async (req, res) => {
  try {
    const { location } = req.params;
    const site = await ticketService.getSiteByLocation(location);
    res.json({ success: true, site: site || null });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### 4.2 Frontend Changes

#### Vulnerability Cards

**File**: `app/public/scripts/shared/vulnerability-cards.js:225-227`

**Replace**:
```javascript
const site = hostname.substring(0, 4).toUpperCase();
const location = hostname.substring(0, 5).toUpperCase();
```

**With**:
```javascript
// Parse hostname using HostnameParserService
const parseResponse = await fetch(`/api/hostname/parse/${encodeURIComponent(hostname)}`);
const parsed = await parseResponse.json();

const location = parsed.confidence >= 0.5
  ? parsed.location
  : hostname.substring(0, 5).toUpperCase(); // Fallback

// Query existing tickets for site value
const siteResponse = await fetch(`/api/tickets/site-by-location/${encodeURIComponent(location)}`);
const siteData = await siteResponse.json();

const site = siteData.site || ""; // Leave blank if no match
```

#### Device Security Modal

**File**: `app/public/scripts/shared/device-security-modal.js:1064-1065`

Apply same changes as vulnerability cards.

#### Location Details Modal

**File**: `app/public/scripts/shared/location-details-modal.js:1144-1146`

**Already uses HostnameParserService!** - Only add site lookup logic.

---

## 5. IMPLEMENTATION PLAN

### Phase 1: Backend Infrastructure (1 session)

**Tasks**:
- [ ] Add `getSiteByLocation()` method to TicketService
- [ ] Add GET `/api/tickets/site-by-location/:location` endpoint
- [ ] Add GET `/api/hostname/parse/:hostname` endpoint (or `/api/vulnerabilities/hostname/parse/:hostname`)
- [ ] Test endpoints with curl/Postman
- [ ] Add error handling and validation

**Files**:
- `app/services/ticketService.js`
- `app/routes/tickets.js`
- `app/routes/vulnerabilities.js` (or new `app/routes/hostname.js`)

**Validation**:
```bash
# Test hostname parsing
curl http://localhost:8989/api/hostname/parse/tulsatowernswan01

# Test site lookup
curl http://localhost:8989/api/tickets/site-by-location/WTULSA
```

---

### Phase 2: Frontend Integration (1 session)

**Tasks**:
- [ ] Update `vulnerability-cards.js` handleCreateTicketClick (lines 225-227)
- [ ] Update `device-security-modal.js` handleCreateTicketClick (lines 1064-1065)
- [ ] Update `location-details-modal.js` createTicket (add site lookup only - parsing already done)
- [ ] Add loading indicators during API calls (optional)
- [ ] Add error handling for failed API calls

**Files**:
- `app/public/scripts/shared/vulnerability-cards.js`
- `app/public/scripts/shared/device-security-modal.js`
- `app/public/scripts/shared/location-details-modal.js`

**Validation**:
- Click "Create Ticket" on device card → verify parsed location
- Click "Create Ticket" on device modal → verify parsed location
- Click "Create Ticket" on location modal → verify parsed location
- Test with existing location → verify site populated
- Test with new location → verify site blank

---

## 6. TESTING CHECKLIST

### 6.1 Hostname Parsing Tests

- [ ] Test with Pattern 1 hostnames (e.g., "tulsatowernswan01")
- [ ] Test with Pattern 2 hostnames (e.g., "STRO-RTR-01")
- [ ] Test with Pattern 3 hostnames (e.g., "WTULSA_SW_01")
- [ ] Test with unparseable hostnames (fallback to substring)
- [ ] Verify confidence scores (0.5-1.0 range)

### 6.2 Site Lookup Tests

- [ ] Test with existing location (returns site from tickets)
- [ ] Test with new location (returns null, site blank)
- [ ] Test with multiple sites for same location (returns first)
- [ ] Test case-insensitive matching (WTULSA vs wtulsa vs WTulsa)
- [ ] Test with deleted tickets (should not return)

### 6.3 Integration Tests

- [ ] Test ticket creation from device card (vulnerabilities page)
- [ ] Test ticket creation from device modal
- [ ] Test ticket creation from location modal
- [ ] Test ticket modal population (site and location fields)
- [ ] Test with various hostname patterns (nswan, nrwan, nfpan)

### 6.4 Edge Case Tests

- [ ] Test with hostname that has no pattern match (confidence < 0.5)
- [ ] Test with location that has no tickets (site should be blank)
- [ ] Test with location that has multiple sites (first site returned)
- [ ] Test with special characters in hostname
- [ ] Test API error handling (500 response, network failure)

---

## 7. EDGE CASES & SOLUTIONS

### 7.1 Multiple Sites for Same Location

**Scenario**: Location "WTULSA" has tickets with sites "TULS" and "WTUL"

**Solution**: Use `LIMIT 1` to return first match (arbitrary but consistent)

**Alternative**: Use `GROUP BY` with `COUNT(*)` to find most common site:
```sql
SELECT site, COUNT(*) as count
FROM tickets
WHERE LOWER(location) = LOWER(?)
  AND deleted = 0
  AND site IS NOT NULL
GROUP BY site
ORDER BY count DESC
LIMIT 1
```

### 7.2 Location Not Parseable

**Scenario**: Hostname doesn't match any patterns, HostnameParserService returns low confidence

**Solution**: Use fallback substring extraction (same as current behavior)
```javascript
const location = parsed.confidence >= 0.5
  ? parsed.location
  : hostname.substring(0, 5).toUpperCase();
```

### 7.3 No Existing Tickets for Location

**Scenario**: New location with no historical tickets

**Solution**: Leave site field blank (empty string)
- User can manually populate site
- Future tickets at this location will have site data to reference

### 7.4 API Request Failures

**Scenario**: Backend API unavailable or returns error

**Solution**: Graceful degradation to substring extraction
```javascript
try {
  const parseResponse = await fetch(`/api/hostname/parse/${hostname}`);
  const parsed = await parseResponse.json();
  // ... use parsed data
} catch (error) {
  console.error("Hostname parsing failed, using fallback:", error);
  // Fall back to substring extraction
  const location = hostname.substring(0, 5).toUpperCase();
  const site = ""; // Leave blank if parse fails
}
```

---

## 8. SUCCESS CRITERIA

### 8.1 Functional

- [ ] Ticket creation uses HostnameParserService for location parsing
- [ ] Site field populated from existing tickets database
- [ ] Site field left blank for new locations
- [ ] Fallback to substring extraction for unparseable hostnames
- [ ] All three entry points (device cards, device modal, location modal) work correctly

### 8.2 User Experience

- [ ] No noticeable delay in ticket creation (API calls < 100ms)
- [ ] Loading indicators show during API calls (optional)
- [ ] Error messages clear if API fails
- [ ] Graceful degradation if backend unavailable

### 8.3 Data Quality

- [ ] Location data consistent with location cards
- [ ] Site field prevents duplicate entries
- [ ] Hostname patterns correctly recognized (nswan, nrwan, nfpan, etc.)
- [ ] Confidence scores accurate (high for pattern match, low for fallback)

---

## 9. RISKS & SAFEGUARDS

### 9.1 Risks

**Risk 1**: API latency adds delay to ticket creation
- **Probability**: Low (backend parsing is fast, < 50ms)
- **Impact**: Minor (users wait slightly longer)
- **Safeguard**: Add timeout to fetch calls, fall back to substring on timeout

**Risk 2**: Breaking change for users expecting old behavior
- **Probability**: Low (new behavior is improvement, not breaking)
- **Impact**: Minor (some users may notice different location format)
- **Safeguard**: Test thoroughly, document changes in changelog

**Risk 3**: Site lookup returns wrong site (multiple sites for location)
- **Probability**: Medium (some locations have multiple sites)
- **Impact**: Minor (user can manually correct)
- **Safeguard**: Use most common site (GROUP BY COUNT), document behavior

### 9.2 Rollback Plan

**If issues arise**:
1. Revert frontend changes (vulnerability-cards.js, device-security-modal.js)
2. Keep backend endpoints (no harm if unused)
3. Users fall back to substring extraction (same as before)
4. No data loss (only affects new tickets)

---

## 10. DEPENDENCIES

**Blocks**:
- None (standalone improvement)

**Blocked By**:
- None (HostnameParserService already exists and working)

**Related**:
- Location cards already use HostnameParserService (reference implementation)
- Future: Could use same parsing for other features (vulnerability filtering, device search)

---

## 11. OPEN QUESTIONS

1. **Should we cache parsed hostnames** to reduce API calls?
   - Pros: Faster, reduces backend load
   - Cons: More complex, cache invalidation issues
   - **Recommendation**: Not needed for MVP (parsing is fast)

2. **Should we expose full HostnameParserService configuration** (patterns, mappings)?
   - Pros: More powerful API
   - Cons: More complex, security concerns
   - **Recommendation**: Keep simple for MVP (just parsing)

3. **Should we log hostname parsing** for analytics/debugging?
   - Pros: Helps identify unparseable patterns
   - Cons: More logging overhead
   - **Recommendation**: Yes, log confidence < 0.7 for investigation

4. **Should we pre-fetch site data** on page load vs on demand?
   - Pros: Faster ticket creation (no wait for API)
   - Cons: Unnecessary API calls if user doesn't create ticket
   - **Recommendation**: On demand (users don't always create tickets)

---

## 12. NEXT STEPS

1. **Planning Phase** (30-60 minutes):
   - Create task breakdown (backend tasks + frontend tasks)
   - Estimate time per task (15-90 minutes each)
   - Define validation steps per task
   - Create HEX-350-PLAN Linear issue or documentation

2. **Implementation** (1-2 sessions):
   - Phase 1: Backend endpoints (1 session)
   - Phase 2: Frontend integration (1 session)
   - Testing and validation throughout

3. **Verification** (30 minutes):
   - Run full testing checklist
   - Manual testing in dev environment
   - Update changelog and documentation

---

## 13. REFERENCES

### Code References

- **HostnameParserService**: `app/services/hostnameParserService.js:76-169`
- **Current substring extraction**: `vulnerability-cards.js:225-227`, `device-security-modal.js:1064-1065`
- **Location modal (good example)**: `location-details-modal.js:1144-1146`
- **Ticket modal population**: `tickets.js:4046-4154`

### Related Issues

- **Location cards** (uses HostnameParserService) - good reference implementation
- **Ticket system** - core functionality being improved

### Documentation

- **SRPI Process**: `/docs/SRPI_PROCESS.md` (follow RPI for this enhancement)
- **Documentation + Linear Workflow**: `/docs/DOCUMENTATION_PLUS_LINEAR_WORKFLOW.md`

---

**Created**: October 28, 2025
**Last Updated**: October 28, 2025
**Status**: Research Complete → Ready for Planning Phase
