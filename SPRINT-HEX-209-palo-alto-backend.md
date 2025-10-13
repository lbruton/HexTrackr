# SPRINT: Palo Alto Backend Implementation (HEX-209)

**Linear Issue**: [HEX-209](https://linear.app/hextrackr/issue/HEX-209)
**Parent**: [HEX-208](https://linear.app/hextrackr/issue/HEX-208) (PLAN)
**Started**: 2025-10-13
**Status**: In Progress
**Git Checkpoint**: `873f6874` - Can rollback if needed

---

## Objective

Build Palo Alto advisory sync backend by mirroring Cisco implementation. Get database populated with fixed version data before touching frontend.

**API Endpoint**: `https://security.paloaltonetworks.com/json/{CVE-ID}` (0.17s response)

---

## Implementation Checklist

### ✅ Task 1: Database Migration (15 min)

**Reference**: `app/public/scripts/migrations/005-cisco-advisories.sql`

- [ ] Read Cisco migration to understand schema
- [ ] Create `app/public/scripts/migrations/006-palo-alto-advisories.sql`
- [ ] Mirror Cisco table schema (change table name only)
- [ ] Add indexes: `idx_palo_advisories_cve`, `idx_palo_advisories_synced`
- [ ] Add columns to `vulnerabilities` table (already planned in migration 005):
  - `fixed_palo_versions TEXT`
  - `fixed_palo_url TEXT`
  - `palo_synced_at DATETIME`
- [ ] Apply migration: `sqlite3 app/data/hextrackr.db < migrations/006-palo-alto-advisories.sql`
- [ ] Verify table created: `sqlite3 app/data/hextrackr.db ".schema palo_alto_advisories"`

**Files Created**:
- `app/public/scripts/migrations/006-palo-alto-advisories.sql`

---

### ✅ Task 2: Service Layer (45 min)

**Reference**: `app/services/ciscoAdvisoryService.js` (773 lines)

- [ ] Copy `ciscoAdvisoryService.js` to `paloAltoService.js`
- [ ] Global find/replace in new file:
  - `Cisco` → `Palo Alto`
  - `cisco` → `palo`
  - `CISCO` → `PALO`
  - `ciscoAdvisoryService` → `paloAltoService`
  - `cisco_advisories` → `palo_alto_advisories`
- [ ] Update API endpoint:
  - OLD: `https://apix.cisco.com/security/advisories/v2`
  - NEW: `https://security.paloaltonetworks.com/json`
- [ ] Modify `syncPaloAdvisories()` method:
  - Remove OAuth2 logic (Palo Alto API is public, no auth)
  - Change CVE fetch to: `GET /json/${cveId}`
  - Keep same error handling and caching patterns
- [ ] Update `parseAdvisoryData()` for CVE 5.0 format:
  - Extract from `containers.cna.metrics[0].cvssV4_0`
  - Parse `affected[].versions[].changes[]` for fixed versions
  - Handle `x_affectedList` array
- [ ] Keep same database transaction pattern
- [ ] Verify ESLint passes: `npm run eslint app/services/paloAltoService.js`

**Key Changes**:
```javascript
// OLD (Cisco - OAuth2)
const tokenResponse = await fetch(this.ciscoTokenUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
});

// NEW (Palo Alto - Public API)
const response = await fetch(`https://security.paloaltonetworks.com/json/${cveId}`);
```

**Files Created**:
- `app/services/paloAltoService.js`

---

### ✅ Task 3: Controller (20 min)

**Reference**: `app/controllers/ciscoController.js` (131 lines)

- [ ] Copy `ciscoController.js` to `paloAltoController.js`
- [ ] Global find/replace:
  - `Cisco` → `Palo Alto`
  - `cisco` → `palo`
  - `CiscoController` → `PaloAltoController`
  - `ciscoAdvisoryService` → `paloAltoService`
- [ ] Update require statement: `require('../services/paloAltoService')`
- [ ] Keep same singleton pattern
- [ ] Keep same HTTP methods (sync, status, getAdvisory, health)
- [ ] Verify ESLint passes: `npm run eslint app/controllers/paloAltoController.js`

**No logic changes** - just rename references

**Files Created**:
- `app/controllers/paloAltoController.js`

---

### ✅ Task 4: Routes (20 min)

**Reference**: `app/routes/cisco.js` (82 lines)

- [ ] Copy `cisco.js` to `palo-alto.js`
- [ ] Global find/replace:
  - `cisco` → `palo`
  - `Cisco` → `Palo Alto`
  - `/api/cisco` → `/api/palo`
- [ ] Update require: `require('../controllers/paloAltoController')`
- [ ] Keep same rate limiting (10 requests per 10 minutes on POST /sync)
- [ ] Keep same authentication middleware (`requireAuth`)
- [ ] Verify ESLint passes: `npm run eslint app/routes/palo-alto.js`

**Routes Created**:
- `POST /api/palo/sync` (auth + rate limit)
- `GET /api/palo/status` (auth)
- `GET /api/palo/advisory/:cveId` (auth)
- `GET /api/palo/health` (auth)

**Files Created**:
- `app/routes/palo-alto.js`

---

### ✅ Task 5: Register Routes in Server (10 min)

**Reference**: `app/public/server.js` (search for Cisco router registration)

- [ ] Open `app/public/server.js`
- [ ] Find Cisco router registration (around line with `/api/cisco`)
- [ ] Add Palo Alto router immediately after:
  ```javascript
  // Palo Alto advisory routes (HEX-209)
  const paloRouter = require('../routes/palo-alto');
  app.use('/api/palo', paloRouter);
  ```
- [ ] Find Cisco controller initialization
- [ ] Add Palo Alto controller initialization:
  ```javascript
  const paloController = require('../controllers/paloAltoController');
  paloController.initialize(db, progressTracker);
  ```
- [ ] Verify syntax: `npm run eslint app/public/server.js`
- [ ] Restart Docker: `docker-compose restart`
- [ ] Check logs: `docker-compose logs -f hextrackr-app | grep -i palo`

**Files Modified**:
- `app/public/server.js`

---

### ✅ Task 6: Test Sync Endpoint (30 min)

**Prerequisites**: Docker running, logged into HexTrackr

- [ ] Get session cookie:
  ```bash
  # Log in via browser at https://dev.hextrackr.com
  # Open DevTools → Application → Cookies → Copy hextrackr.sid value
  ```
- [ ] Test health check first:
  ```bash
  curl https://dev.hextrackr.com/api/palo/health \
    -H "Cookie: hextrackr.sid=<your-cookie>" \
    -v
  ```
  - Expected: `{"success": true, "data": {"apiReachable": true, "responseTime": <200}}`
- [ ] Test sync endpoint:
  ```bash
  curl -X POST https://dev.hextrackr.com/api/palo/sync \
    -H "Cookie: hextrackr.sid=<your-cookie>" \
    -v
  ```
  - Expected: `{"success": true, "data": {"totalCvesChecked": X, "matchedCount": Y}}`
- [ ] Check console logs for sync progress:
  ```bash
  docker-compose logs -f hextrackr-app | tail -50
  ```
  - Should see: "✅ Palo Alto sync complete"
- [ ] Test status endpoint:
  ```bash
  curl https://dev.hextrackr.com/api/palo/status \
    -H "Cookie: hextrackr.sid=<your-cookie>"
  ```
  - Expected: `{"success": true, "data": {"totalAdvisories": X, "lastSyncTime": "..."}}`

**Success Criteria**:
- All endpoints return 200 status
- Sync completes without errors
- Console logs show advisory processing

---

### ✅ Task 7: Verify Database Data (15 min)

**Check database was populated correctly**

- [ ] Count advisories:
  ```bash
  sqlite3 app/data/hextrackr.db "SELECT COUNT(*) FROM palo_alto_advisories;"
  ```
  - Expected: >0 rows
- [ ] Sample data quality:
  ```bash
  sqlite3 app/data/hextrackr.db "
    SELECT cve_id, severity, cvss_score, product_name,
           substr(first_fixed, 1, 50) as fixed_versions
    FROM palo_alto_advisories
    LIMIT 5;
  "
  ```
  - Verify: CVE IDs correct, severity values, fixed versions JSON array
- [ ] Check fixed versions format:
  ```bash
  sqlite3 app/data/hextrackr.db "
    SELECT cve_id, first_fixed
    FROM palo_alto_advisories
    WHERE first_fixed IS NOT NULL
    LIMIT 3;
  "
  ```
  - Expected: JSON array like `["10.2.0-h3", "10.2.1-h2"]`
- [ ] Verify product filtering:
  ```bash
  sqlite3 app/data/hextrackr.db "
    SELECT DISTINCT product_name
    FROM palo_alto_advisories;
  "
  ```
  - Expected: Only "PAN-OS" (per research scope)
- [ ] Check indexes exist:
  ```bash
  sqlite3 app/data/hextrackr.db ".schema palo_alto_advisories"
  ```
  - Verify: `idx_palo_advisories_cve` and `idx_palo_advisories_synced`

**Success Criteria**:
- Database has advisory data
- Fixed versions are valid JSON arrays
- Only PAN-OS products (v1 scope)
- Indexes created

---

## Validation Checklist

**Before marking backend complete**:

- [ ] All 4 API endpoints return 200 status
- [ ] Sync endpoint populates database (row count >0)
- [ ] Fixed versions are valid JSON arrays
- [ ] ESLint passes on all new files
- [ ] Docker restarts without errors
- [ ] Console logs show no errors during sync
- [ ] Rate limiting works (11th sync request returns 429)

---

## Files Created/Modified

**New Files**:
- `app/public/scripts/migrations/006-palo-alto-advisories.sql`
- `app/services/paloAltoService.js`
- `app/controllers/paloAltoController.js`
- `app/routes/palo-alto.js`

**Modified Files**:
- `app/public/server.js` (route registration, controller init)

---

## Common Issues & Solutions

### Issue: Migration fails with "table already exists"
**Solution**:
```bash
sqlite3 app/data/hextrackr.db "DROP TABLE IF EXISTS palo_alto_advisories;"
# Then re-run migration
```

### Issue: Sync endpoint returns 401 Unauthorized
**Solution**:
- Verify session cookie is valid (log in again)
- Check `requireAuth` middleware is working
- Test with curl verbose mode: `-v`

### Issue: Sync endpoint returns 500 Internal Server Error
**Solution**:
- Check Docker logs: `docker-compose logs -f hextrackr-app`
- Verify Palo Alto API is reachable: `curl https://security.paloaltonetworks.com/json/CVE-2024-3400`
- Check service initialization in server.js

### Issue: Database empty after sync
**Solution**:
- Check if CVEs exist for Palo Alto devices: `SELECT COUNT(*) FROM vulnerabilities WHERE vendor LIKE '%Palo Alto%';`
- Verify API endpoint in service: `https://security.paloaltonetworks.com/json/${cveId}`
- Check parseAdvisoryData() handles CVE 5.0 format correctly

---

## Git Commits

**Pattern**: Commit after every 2 tasks

```bash
# After Task 1-2
git add -A && git commit -m "feat(palo-alto): Add database migration and service layer (HEX-209 Tasks 1-2)"

# After Task 3-4
git add -A && git commit -m "feat(palo-alto): Add controller and routes (HEX-209 Tasks 3-4)"

# After Task 5-7
git add -A && git commit -m "feat(palo-alto): Register routes and verify sync works (HEX-209 Tasks 5-7)"
```

---

## Rollback Command

If implementation fails:
```bash
git reset --hard 873f6874
docker-compose restart
```

---

## Next Phase (After Backend Complete)

**Frontend (HEX-210)**: Wire UI to read from `palo_alto_advisories` table
- Copy `cisco-advisory-helper.js` → `palo-advisory-helper.js`
- Add vendor routing in 5 UI files
- Test in browser

**DO NOT START FRONTEND** until database is verified with correct data!

---

## ✅ SPRINT COMPLETE

**Completion Summary**:
- All 7 backend tasks completed successfully
- Sync tested: 9.7 seconds, 20 advisories synced (19 with fixes)
- Database verified: Valid JSON arrays, indexes created, hotfix notation preserved
- All files ESLint clean
- Docker restart successful, services initialized

**Test Results**:
```json
{
  "totalPaloCves": 31,
  "totalAdvisories": 20,
  "matchedCount": 19,
  "lastSync": "2025-10-13T01:51:03.177Z"
}
```

**Files Created**:
- `app/public/scripts/migrations/006-palo-alto-advisories.sql`
- `app/services/paloAltoService.js` (595 lines)
- `app/controllers/paloAltoController.js` (161 lines)
- `app/routes/palo-alto.js` (82 lines)

**Files Modified**:
- `app/public/server.js` (added imports + route registration)

**Git Checkpoint**: Ready for commit

**Next Steps**:
1. Add background sync scheduler (mirror Cisco pattern in server.js)
2. Create Settings modal Third Party Integrations page
3. Add Palo Alto card to Settings UI
4. Wire frontend to read from `palo_alto_advisories` table

---

**Status**: ✅ COMPLETE
**Updated**: 2025-10-13
