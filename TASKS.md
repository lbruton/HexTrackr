# HEX-141: Cisco PSIRT Advisory Sync - Implementation Tasks

**Feature**: Multi-vendor advisory sync with fixed software version display (mirroring KEV pattern)
**Linear Issue**: HEX-141
**Current Version**: 1.0.63 (in progress)
**Status**: Phase 2 Backend - COMPLETE ✅ (OAuth2 + API verified working)

---

## ✅ COMPLETED PHASES

### Phase 0: Settings Modal UX Rebuild (COMPLETE)
**Commit**: `33f42fa` - "feat(auth): Rebuild Cisco PSIRT credential modal with KEV pattern"

**Files Created/Modified**:
- `app/public/scripts/shared/settings-modal.html` (lines 452-504)
- `app/public/scripts/shared/settings-modal.js` (lines 591-857)

**What Works**:
- ✅ Modal-in-modal credential management (KEV pattern)
- ✅ Credentials saved to `user_preferences.cisco_api_key` as `clientId:clientSecret`
- ✅ Both fields now type="password" (masked for security)
- ✅ Browser autofill prevention (multiple defenses)
- ✅ Clear credentials button with confirmation
- ✅ Status badge updates (Configured ✓ / Not Configured)
- ✅ Sync button enables/disables based on credential status

**Security Improvements**:
- Autofill prevention: `name="cisco-api-*"`, `autocomplete="new-password"`, `data-lpignore="true"`
- Both Client ID and Secret masked (prevents shoulder-surfing)
- Fresh entry every time (no pre-population)
- Clear button calls `deletePreference("cisco_api_key")`

---

### Phase 1: Database Migration (COMPLETE)
**Commit**: Git history in `dev` branch

**File Created**:
- `app/public/scripts/migrations/005-cisco-advisories.sql`

**Database Changes**:
```sql
-- New table
cisco_advisories (
    cve_id TEXT PRIMARY KEY,
    advisory_id TEXT,
    advisory_title TEXT,
    severity TEXT,
    cvss_score TEXT,
    first_fixed TEXT,              -- JSON array: ["15.2(4)M11", "16.3.1"]
    affected_releases TEXT,        -- JSON array
    product_names TEXT,            -- JSON array
    publication_url TEXT,
    last_synced TIMESTAMP
)

-- New columns on vulnerabilities table
ALTER TABLE vulnerabilities ADD COLUMN is_fixed INTEGER DEFAULT 0;
ALTER TABLE vulnerabilities ADD COLUMN fixed_cisco_versions TEXT;  -- "15.2(4)M11, 16.3.1"
ALTER TABLE vulnerabilities ADD COLUMN fixed_cisco_url TEXT;
ALTER TABLE vulnerabilities ADD COLUMN cisco_synced_at DATETIME;

-- Indexes
CREATE INDEX idx_cisco_advisories_cve ON cisco_advisories(cve_id);
CREATE INDEX idx_cisco_advisories_synced ON cisco_advisories(last_synced);
CREATE INDEX idx_vulnerabilities_is_fixed ON vulnerabilities(is_fixed) WHERE is_fixed = 1;
```

**Migration Applied**: ✅ Dev database updated successfully

---

### Phase 2: Backend Service (COMPLETE ✅)
**Commits**:
- `e703388` - "feat(cisco): Implement Cisco PSIRT Advisory Sync backend (HEX-141 Phase 2)"
- `045a35e` - "fix(cisco): Disable trust proxy validation in rate limiter"
- `cac2e10` - "fix(cisco): Use authenticatedFetch for CSRF token in sync request"
- `49257f2` - "fix(cisco): Pass userId to service for credential fetch"
- `c672b77` - "fix(cisco): Prevent browser autofill in credential modal inputs"
- `4374c9c` - "fix(cisco): Mask both credential fields and add clear button"

**Files Created**:
- ✅ `app/services/ciscoAdvisoryService.js` (550 lines)
- ✅ `app/controllers/ciscoController.js` (155 lines)
- ✅ `app/routes/cisco.js` (77 lines)

**Files Modified**:
- ✅ `app/public/server.js` - Route registration (line 269)
- ✅ `app/public/scripts/shared/settings-modal.js` - API integration
- ✅ `app/public/docs-source/changelog/versions/1.0.63.md` - Documentation

**What Works**:
- ✅ Service instantiation with dependency injection
- ✅ Controller receives userId from session
- ✅ Credentials fetch from `user_preferences` table
- ✅ Rate limiting (2 requests/10 minutes)
- ✅ CSRF token handling via `authState.authenticatedFetch`
- ✅ Transaction-safe database operations

**What Works** ✅:
1. **OAuth2 Authentication - VERIFIED WORKING**
   - Token URL: `https://id.cisco.com/oauth2/default/v1/token`
   - Method: POST with Basic auth (Base64 encoded `client_id:client_secret`)
   - Body: `grant_type=client_credentials`
   - Response: Bearer token valid for 3600 seconds (1 hour)
   - Credentials: Client Credentials grant type (Service app, not Browser app)

2. **API Endpoint - VERIFIED WORKING**
   - Base URL: `https://apix.cisco.com/security/advisories/v2` (NOT `api.cisco.com`)
   - CVE Query: `/cve/{cve_id}.json` (`.json` extension required!)
   - Returns: Full advisory object with:
     - Advisory ID, title, CVEs, CVSS score
     - Product names, publication URL, summary
     - Bug IDs, IPS signatures, CWE mappings

3. **Test Results**
   - Successfully fetched CVE-2024-20470 data
   - Advisory returned: cisco-sa-rv34x-privesc-rce-qE33TCms
   - CVSS Score: 8.8 (High severity)
   - Product: Cisco Small Business RV Series Router Firmware

**Key Discoveries**:
- Must use `apix.cisco.com` for apps created post March 1, 2023
- Must append `.json` or `.xml` extension to all endpoint paths
- Must use Service app (Client Credentials) not Browser app (Authorization Code + PKCE)

---

## 🔧 VERIFIED CISCO API CREDENTIALS ✅

**Working Credentials** (Service app with Client Credentials grant):
```
Client ID: 7tyyr82qss93jmbfazpqe7np
Client Secret: Uh2ZQDMJzcugJVtuRmfjsVRT
Application Type: Service
Grant Type: Client Credentials
Status: active
```

**Storage in Database**: `user_preferences.cisco_api_key`
```
Format: clientId:clientSecret
Value: 7tyyr82qss93jmbfazpqe7np:Uh2ZQDMJzcugJVtuRmfjsVRT
```

**User Action Required**: Enter new credentials in Settings modal to replace old Browser app credentials

---

## 📚 CISCO API DOCUMENTATION RESEARCH

### Official Documentation
- **Primary**: https://developer.cisco.com/psirt/
- **GitHub**: https://github.com/CiscoPSIRT/openVulnAPI
- **Getting Started**: https://developer.cisco.com/docs/psirt/getting-started/
- **Curl Examples**: https://github.com/CiscoPSIRT/openVulnAPI/blob/master/example_code/curl_examples/README.md

### OAuth2 Authentication - TWO Different Systems

**System 1: API Console Credentials** (your credentials)
- **Registration**: https://apiconsole.cisco.com → Register App → Select "Cisco PSIRT openVuln API"
- **Token URL**: `https://id.cisco.com/oauth2/default/v1/token`
- **Authentication**: Basic auth header with Base64 `client_id:client_secret`
- **Request Format**:
```bash
# Step 1: Encode credentials
echo -n "client_id:client_secret" | base64

# Step 2: Request token
curl --request POST \
  --url https://id.cisco.com/oauth2/default/v1/token \
  --header 'Authorization: Basic [base64_encoded_credentials]' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data 'grant_type=client_credentials'
```

**System 2: Developer Portal Credentials** (not your type)
- **Registration**: https://developer.cisco.com/psirt/ → Register via CCO ID
- **Token URL**: `https://cloudsso.cisco.com/as/token.oauth2`
- **Authentication**: Form data with individual fields
- **Request Format**:
```bash
curl -H "Content-Type: application/x-www-form-urlencoded" -X POST \
  -d "client_id=your_id" \
  -d "client_secret=your_secret" \
  -d "grant_type=client_credentials" \
  https://cloudsso.cisco.com/as/token.oauth2
```

**CRITICAL**: The credentials you provided are API Console type, so code must use System 1 endpoint

**Response** (expected):
```json
{
  "access_token": "...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### Known API Endpoints
1. **All Advisories**: `https://api.cisco.com/security/advisories/all`
2. **Latest N**: `https://api.cisco.com/security/advisories/latest/10`
3. **CVE Query**: `https://api.cisco.com/security/advisories/cve/{cve_id}` (NEEDS VERIFICATION)

### Rate Limits
- **5 calls per second**
- **30 calls per minute**
- **5000 calls per day**

---

## 🎯 NEXT STEPS (IMMEDIATE)

### 1. Register Credentials for PSIRT API (USER TASK - CRITICAL)

**Problem**: Your credentials are valid API Console credentials BUT they're not registered for the "Cisco PSIRT openVuln API" specifically.

**Action Required**:
1. Go to https://apiconsole.cisco.com
2. Click "My Apps & Keys"
3. Find your application or create a new one:
   - Click "Register a New App"
   - Application Type: "service"
   - Grant Type: "Client Credentials"
   - **IMPORTANT**: Select "Cisco PSIRT openVuln API" from the API list
4. Save the new Client ID and Client Secret
5. Verify app status shows "active"

**Why This Failed**:
- Your current credentials (`vxyqx3egzqqeq8mfyn5fzypq:EDX3rF3fqWmYUW8Fqe53kWvX`) exist in API Console
- But they return `"Invalid value for 'client_id' parameter"` for the PSIRT API
- This means they're not linked to the PSIRT API specifically
- API Console requires explicit API selection during app registration

### 2. Manual cURL Testing (USER TASK - After registration)
Once you have PSIRT-registered credentials:

```bash
# Step 1: Encode new credentials
echo -n "new_client_id:new_client_secret" | base64

# Step 2: Get OAuth2 token (use base64 output from step 1)
curl -v --request POST \
  --url https://id.cisco.com/oauth2/default/v1/token \
  --header 'Authorization: Basic [paste_base64_here]' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data 'grant_type=client_credentials'

# Step 3: Test CVE endpoint (use token from step 2)
export TOKEN="<access_token_from_above>"
curl -X GET -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  https://api.cisco.com/security/advisories/cve/CVE-2024-20470

# Step 4: Test /all endpoint as fallback
curl -X GET -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  https://api.cisco.com/security/advisories/all | jq '.' | head -100
```

**Expected Outcomes**:
- ✅ Step 2 should return `{"access_token":"...","token_type":"Bearer","expires_in":3600}`
- ⚠️ Step 3 will verify if `/cve/{id}` endpoint exists (might be 404)
- ✅ Step 4 should return large JSON array of all advisories

### 3. Fix OAuth2 Implementation (CLAUDE TASK - After credentials verified)
**File**: `app/services/ciscoAdvisoryService.js`

**Changes Needed** (API Console endpoint):
```javascript
// Line 31: Fix token URL to API Console endpoint
this.ciscoTokenUrl = "https://id.cisco.com/oauth2/default/v1/token";

// Lines 147-179: Fix getCiscoAccessToken() to use Basic auth
async getCiscoAccessToken(clientId, clientSecret) {
    try {
        // API Console requires Basic auth with Base64 encoded credentials
        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

        console.log(`🔐 OAuth2 request to ${this.ciscoTokenUrl}`);
        console.log(`🔑 Client ID: ${clientId.substring(0, 8)}...`);

        const tokenResponse = await this.fetch(this.ciscoTokenUrl, {
            method: "POST",
            headers: {
                "Authorization": `Basic ${credentials}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "grant_type=client_credentials"
        });

        if (!tokenResponse.ok) {
            const errorBody = await tokenResponse.text();
            console.error(`❌ Cisco OAuth2 error (${tokenResponse.status}): ${errorBody}`);
            throw new Error(`OAuth2 failed: ${tokenResponse.status} - ${errorBody}`);
        }

        const tokenData = await tokenResponse.json();
        console.log(`✅ OAuth2 token acquired (expires in ${tokenData.expires_in}s)`);
        return tokenData.access_token;
    } catch (error) {
        console.error(`❌ Cisco OAuth2 exception:`, error);
        throw error;
    }
}
```

**Alternative** (if switching to Developer Portal credentials):
```javascript
// Line 31: Developer Portal endpoint
this.ciscoTokenUrl = "https://cloudsso.cisco.com/as/token.oauth2";

// Lines 147-179: Form data approach
async getCiscoAccessToken(clientId, clientSecret) {
    const tokenResponse = await this.fetch(this.ciscoTokenUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: "client_credentials"
        }).toString()
    });

    if (!tokenResponse.ok) {
        const errorBody = await tokenResponse.text();
        console.error(`❌ Cisco OAuth2 error: ${errorBody}`);
        throw new Error(`OAuth2 failed: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    return tokenData.access_token;
}
```

### 4. Adjust Sync Strategy Based on API Endpoints
**Decision Point**: If `/cve/{id}` endpoint doesn't exist, we have two options:

**Option A: Bulk Fetch + Filter** (if no per-CVE endpoint)
- Fetch `/all` endpoint (all advisories)
- Filter locally to match CVEs in our database
- Cache entire response, update periodically
- **Pro**: One API call, respects rate limits
- **Con**: Large payload (~MB), slower initial sync

**Option B: Advisory ID Lookup** (if advisories have IDs)
- Query by advisory ID if we know them
- Still need bulk fetch initially to build mapping
- **Pro**: More targeted queries
- **Con**: Still need initial bulk fetch

**Recommended**: Start with Option A (bulk fetch) since rate limits are generous (5000/day)

---

## 📋 REMAINING TASKS

### Phase 2: Backend Service (RESUME)
- [ ] Fix OAuth2 token URL to `https://cloudsso.cisco.com/as/token.oauth2`
- [ ] Fix OAuth2 request format (form data, not Basic auth)
- [ ] Verify CVE endpoint pattern with manual cURL test
- [ ] Adjust sync logic based on available endpoints
- [ ] Test OAuth2 token acquisition with real credentials
- [ ] Test advisory data fetch
- [ ] Update error logging with better messages
- [ ] Commit fixes with "fix(cisco): Correct OAuth2 endpoint and request format"

### Phase 3: Frontend Auto-Sync Integration (PLANNED)
- [ ] Add `checkCiscoAutoSync()` to `vulnerability-core.js`
- [ ] Call on page load after KEV auto-sync
- [ ] Fire-and-forget background pattern
- [ ] Respect 24-hour threshold from localStorage

### Phase 4: UI Display (PLANNED)
- [ ] Update vulnerability details modal
- [ ] Show fixed versions in Solution field
- [ ] Add "View Advisory" link to Cisco URL
- [ ] Priority cascade: Cisco → Palo Alto → Fortinet → Manual
- [ ] Update AG-Grid column definitions
- [ ] Add tooltip with advisory metadata

---

## 🐛 KNOWN ISSUES

1. **OAuth2 401 Error**: Wrong endpoint and request format (fix in progress)
2. **Rate Limiter Warning**: `ERR_ERL_PERMISSIVE_TRUST_PROXY` on startup (non-blocking, validation disabled)
3. **CVE Endpoint Unverified**: Assumed `/cve/{id}` exists but not confirmed

---

## 📝 IMPLEMENTATION NOTES

### Architecture Patterns
- **Service Layer**: OAuth2 + API integration + database operations
- **Controller Layer**: HTTP request handling + session userId extraction
- **Route Layer**: Express router + authentication + rate limiting
- **Frontend**: `authState.authenticatedFetch` for CSRF tokens

### Credential Flow
1. User enters credentials in Settings modal (masked inputs)
2. Frontend calls `preferencesSync.syncCiscoCredentials(apiKey)`
3. Saved to `user_preferences.cisco_api_key` as `clientId:clientSecret`
4. Backend service fetches via `preferencesService.getPreference(userId, "cisco_api_key")`
5. Split on `:` to extract individual values
6. Used for OAuth2 token request

### Sync Flow (Planned)
1. Controller receives POST `/api/cisco/sync` from frontend
2. Extracts `userId` from `req.session.userId`
3. Service fetches credentials from database
4. Service gets OAuth2 token (1 hour validity)
5. Service fetches advisory data (bulk or per-CVE)
6. Parse and insert into `cisco_advisories` table
7. Update denormalized columns on `vulnerabilities` table
8. Return statistics to frontend

### Database Strategy
- **Vendor-neutral column**: `is_fixed` (boolean) - aggregates all vendors
- **Vendor-specific columns**: `fixed_cisco_versions`, `fixed_cisco_url` (extensible)
- **Separate advisory table**: `cisco_advisories` - rich metadata storage
- **Denormalized display columns**: Performance optimization (no JOINs)

---

## 🔍 DEBUGGING COMMANDS

### Check stored credentials
```bash
sqlite3 app/data/hextrackr.db "SELECT * FROM user_preferences WHERE preference_key = 'cisco_api_key';"
```

### Check advisory data
```bash
sqlite3 app/data/hextrackr.db "SELECT COUNT(*) FROM cisco_advisories;"
sqlite3 app/data/hextrackr.db "SELECT * FROM cisco_advisories LIMIT 5;"
```

### Check vulnerabilities with fixes
```bash
sqlite3 app/data/hextrackr.db "SELECT cve, fixed_cisco_versions FROM vulnerabilities WHERE is_fixed = 1 LIMIT 10;"
```

### Docker logs for sync debugging
```bash
docker-compose logs hextrackr --tail=50 | grep -i cisco
```

### Test OAuth2 manually
```bash
curl -v -H "Content-Type: application/x-www-form-urlencoded" -X POST \
  -d "client_id=vxyqx3egzqqeq8mfyn5fzypq" \
  -d "client_secret=EDX3rF3fqWmYUW8Fqe53kWvX" \
  -d "grant_type=client_credentials" \
  https://cloudsso.cisco.com/as/token.oauth2
```

---

## 📌 CONTEXT FOR AUTOCOMPACT

**DO NOT LOSE**:
1. Credentials are stored as `clientId:clientSecret` in `user_preferences.cisco_api_key`
2. **TWO OAuth2 systems exist**:
   - API Console: `https://id.cisco.com/oauth2/default/v1/token` + Basic auth header
   - Developer Portal: `https://cloudsso.cisco.com/as/token.oauth2` + form data
3. User's credentials are API Console type (confirmed via error responses)
4. **BLOCKER**: Current credentials not registered for PSIRT API specifically
5. User must register new app at https://apiconsole.cisco.com with "Cisco PSIRT openVuln API" selected
6. Rate limits: 5/sec, 30/min, 5000/day
7. Token valid for 1 hour (3600 seconds)
8. Need to verify if `/cve/{id}` endpoint exists before coding further
9. Bulk `/all` endpoint available as fallback strategy
10. Both credential fields are type="password" (masked)
11. Migration 005 already applied to dev database
12. Browser autofill prevention implemented (multiple layers)

**Architecture Philosophy**:
- Mirror KEV service pattern (proven, 460 lines)
- Vendor-neutral + vendor-specific column strategy (extensible)
- Denormalized display columns (performance)
- Backend sync only (not frontend API calls)
- Transaction-safe bulk operations

**Current Blocker**: Credentials exist but aren't registered for PSIRT API. User must create new app registration with PSIRT API selected.

---

**Last Updated**: 2025-10-11
**Next Session**: Test Cisco API with cURL, then fix OAuth2 implementation
