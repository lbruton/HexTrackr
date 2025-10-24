# Cisco PSIRT Advisory Integration

> Comprehensive vendor-specific patch intelligence for Cisco IOS vulnerabilities with automatic background synchronization

## Overview

HexTrackr's Cisco PSIRT (Product Security Incident Response Team) integration provides actionable patch guidance by automatically fetching fixed software versions for Cisco IOS/IOS XE vulnerabilities in your environment. This feature transforms generic CVE descriptions into concrete upgrade paths, answering the critical question: **"What version do I need to upgrade to?"**

---

## What is Cisco PSIRT?

The Cisco Product Security Incident Response Team (PSIRT) manages security vulnerability information for Cisco products. Their API provides:

- **Advisory metadata** for each CVE affecting Cisco products
- **Fixed software versions** - specific IOS/IOS XE versions that patch the vulnerability
- **Product information** - which Cisco devices/platforms are affected
- **Security Impact Ratings** - Cisco's severity assessment
- **Publication dates** and advisory URLs

---

## Key Features

### 🎯 Automatic Patch Intelligence

- **Background Synchronization**: Automatic sync on server startup + every 24 hours
- **Two-Stage API Lookup**: Intelligent OS type detection → fixed version retrieval
- **Zero-Click Operation**: Sync happens automatically after credentials configured
- **Resilient Processing**: Per-CVE commits survive container restarts
- **Rate-Limit Compliant**: Conservative 3-second delays prevent API throttling

### 🔍 Actionable Upgrade Guidance

- **Minimum Fixed Version**: See "Upgrade to 12.2(22)S1 or later" at a glance
- **Complete Version List**: Access all 20-30 patched versions for flexibility
- **Advisory Links**: Direct access to official Cisco security advisories
- **Database Storage**: Fast lookups without API calls during vulnerability analysis

### 📊 Comprehensive Architecture

- **90-Day TTL**: Automatic refresh of stale advisory data
- **Vendor-Neutral Design**: `is_fix_available` flag works across all vendors
- **User-Controllable**: Toggle background sync on/off via Settings
- **Extended Timeouts**: Nginx configured for 10-minute sync operations
- **Progress Tracking**: Real-time sync progress every 10 CVEs

---

## Setup Guide

### Prerequisites

1. **Cisco API Credentials** (Required)
   - Sign up at: [https://apiconsole.cisco.com](https://apiconsole.cisco.com)
   - Create an application in "My Apps & Keys"
   - Copy your **Client ID** and **Client Secret**
   - Credentials use OAuth2 authentication (no IP restrictions)

### Configuration Steps

#### Step 1: Configure Credentials

1. Navigate to **Settings → API Configuration**
2. Locate the **Cisco PSIRT** card
3. Click **"Manage Credentials"** button
4. Enter your **Client ID** and **Client Secret**
5. Click **"Save Credentials"**

✅ Status badge changes to **"Configured ✓"**

#### Step 2: Enable Background Sync (Optional)

By default, background sync is **enabled**. To control it:

1. In the Cisco PSIRT card, find the **"Enable background sync"** toggle
2. Check = Enabled (default), Uncheck = Disabled
3. Setting is stored in database (survives server restarts)

**When Enabled**:
- Sync runs on server startup (after **5-minute initialization delay** to prevent database corruption)
- Sync repeats every 24 hours automatically
- Automatically refreshes advisories older than 90 days

**When Disabled**:
- Background worker skips Cisco sync (no errors logged)
- Manual sync still available via "Sync Now" button

#### Step 3: Initial Sync

**Option A: Automatic** (Recommended)
- Restart Docker container: `docker-compose restart`
- Background worker runs within **5 minutes** (prevents database corruption on rapid restarts)
- Check logs: `docker-compose logs -f hextrackr-app`

**Option B: Manual**
- Click **"Sync Now"** button in Settings
- Sync time varies based on your Cisco CVE count (typically 5-15 minutes)
- Statistics update automatically when complete

---

## How It Works

### Two-Stage API Integration

Cisco's API requires a two-stage lookup pattern:

#### Stage 1: CVE Endpoint → Parse OS Context
```
GET /v2/security/advisories/cve/{cveId}

Returns: Advisory data with productNames array
Example: ["Cisco IOS 12.2(20)S6a", "Cisco IOS XE 16.3.1", ...]

Parse: Extract OS type and version
  "Cisco IOS 12.2(20)S6a" → os_type="ios", version="12.2(20)S6a"
```

#### Stage 2: Software Checker → Fetch Fixed Versions
```
GET /v2/security/advisories/OSType/{osType}?version={version}

Returns: Array of fixed software versions
Example: ["12.2(22)S1", "12.2(30)S", "15.3(3)S8", ...]
```

**Why Two Stages?**
- CVE endpoint doesn't include fixed versions directly
- Software Checker requires OS type + version as input
- Parsing product names provides the context needed for Stage 2

### Rate Limiting Strategy

**Sequential Processing**:
- Processes CVEs one at a time (no parallel batching)
- 3-second delay between each CVE
- Each CVE requires 2 API calls (6 seconds total per CVE)
- Sync time varies based on Cisco CVE count in your environment

**Why Not Parallel?**
- Parallel batch processing triggered 429 errors after ~19 CVEs
- Two-stage pattern amplifies API call volume (2x)
- Conservative delay ensures reliability over speed

### Resilience Pattern

**Per-CVE Auto-Commits**:
```javascript
for (let cveId of cveIds) {
    // Fetch advisory from Cisco API
    // Parse OS type and fixed versions
    db.prepare("INSERT OR REPLACE INTO cisco_advisories ...").run();
    // ✅ Auto-commits here - progress persists
    await delay(3000); // Rate limiting
}
```

**Benefits**:
- Container restarts don't lose progress
- Network failures only affect current CVE
- Database always reflects latest successful sync
- No "all or nothing" transaction risk

### 90-Day TTL (Time-To-Live)

The background worker automatically refreshes stale advisory data:

```sql
-- Query finds CVEs needing sync:
SELECT DISTINCT vc.cve
FROM vulnerabilities_current vc
LEFT JOIN cisco_advisories ca ON vc.cve = ca.cve_id
WHERE vc.lifecycle_state IN ('active', 'reopened')
  AND (
      ca.cve_id IS NULL  -- Never synced
      OR julianday('now') - julianday(ca.last_synced) > 90  -- Stale
  )
```

**Why 90 Days?**
- Cisco advisories can be updated with new fixed versions
- Balances freshness with API usage
- Automatic refresh requires zero user intervention

---

## Database Schema

### cisco_advisories Table (Advisory Metadata)

Stores Cisco PSIRT advisory metadata (one row per CVE).

```sql
CREATE TABLE cisco_advisories (
    cve_id TEXT PRIMARY KEY,
    advisory_id TEXT,
    advisory_title TEXT,
    severity TEXT,
    cvss_score TEXT,
    first_fixed TEXT,              -- Deprecated: Use cisco_fixed_versions instead
    affected_releases TEXT,
    product_names TEXT,
    publication_url TEXT,
    last_synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### cisco_fixed_versions Table (Normalized Fixed Versions)

Stores fixed software versions (many rows per CVE, one per OS family).

**Why Normalized?** Multi-OS-family CVEs (affecting both IOS and IOS XE) need separate rows to prevent data overwrites. See [HEX-287](https://linear.app/hextrackr/issue/HEX-287) for details.

```sql
CREATE TABLE cisco_fixed_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cve_id TEXT NOT NULL,
    os_family TEXT NOT NULL,       -- "ios", "iosxe", "iosxr", "nxos"
    fixed_version TEXT NOT NULL,
    affected_version TEXT,
    last_synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cve_id) REFERENCES cisco_advisories(cve_id) ON DELETE CASCADE,
    UNIQUE(cve_id, os_family, fixed_version)
);
```

**Example Data:**

```
cve_id            | os_family | fixed_version
------------------|-----------|---------------
CVE-2025-20352    | ios       | 15.2(8)E8
CVE-2025-20352    | ios       | 15.9(3)M11
CVE-2025-20352    | iosxe     | 17.12.6
CVE-2025-20352    | iosxe     | 17.9.4a
```

### vulnerabilities_current Table (Extended)

```sql
ALTER TABLE vulnerabilities_current
ADD COLUMN is_fix_available INTEGER DEFAULT 0;

CREATE INDEX idx_vulnerabilities_is_fix_available
ON vulnerabilities_current(is_fix_available);
```

**Vendor-Neutral Flag**:
- `is_fix_available`: Boolean (0/1) for fast filtering
- Set to `1` when ANY vendor (Cisco, Microsoft, etc.) has a fix
- Allows queries like: `WHERE is_fix_available = 1` (instant, indexed)

---

## UI Integration (Phase 3 - Coming Soon)

### Vulnerability Details Modal

When viewing a vulnerability with Cisco advisory data:

```
┌─────────────────────────────────────┐
│ 📦 Cisco Advisory Info              │
│ ✅ Fix Available                    │
│ Minimum Fixed: 12.2(22)S1           │
│                (or any later version)│
│ All Fixed Versions: 20 available    │
│ Advisory: cisco-sa-20170317-cmp     │
│ [View Full Advisory →]              │
└─────────────────────────────────────┘
```

**Query Pattern**:
```javascript
const advisory = await fetch(`/api/cisco/advisory/${cveId}`);

// Returns:
{
    "advisory_id": "cisco-sa-20170317-cmp",
    "minimum_fixed_version": "12.2(22)S1",  // first_fixed[0]
    "total_fixed_versions": 20,
    "has_fix": 1,
    "advisory_url": "https://sec.cloudapps.cisco.com/...",
    "last_synced": "2025-10-12 00:49:53"
}
```

---

## Troubleshooting

### Sync Not Running

**Check 1: Credentials Configured?**
```bash
sqlite3 app/data/hextrackr.db "SELECT * FROM user_preferences WHERE preference_key = 'cisco_api_key';"
```

**Check 2: Background Sync Enabled?**
```bash
sqlite3 app/data/hextrackr.db "SELECT * FROM user_preferences WHERE preference_key = 'cisco_background_sync_enabled';"
# Should return: "true" or no row (defaults to enabled)
```

**Check 3: Check Logs**
```bash
docker-compose logs -f hextrackr-app | grep -i cisco
```

### 429 Rate Limiting Errors

If you see "429 Too Many Requests" in logs:
- This is expected if you manually trigger sync multiple times rapidly
- Background worker is configured conservatively (3s delays) to avoid this
- Wait 10 minutes before trying again (rate limit window)

### 504 Gateway Timeout

If sync times out in browser but continues in background:
- This is normal for the first sync (typically 5-15 minutes depending on CVE count)
- Nginx configured for 10-minute timeout
- Check logs to see sync completion: `docker-compose logs hextrackr-app`

### No Fixed Versions Found

**Some CVEs don't have fixed versions** (by design):
- Some vulnerabilities are configuration issues (no software patch)
- Some affect end-of-life products (no fix available)
- Cisco's Software Checker API returns empty array

---

## Technical Details

### OAuth2 Authentication Flow

1. User configures credentials in Settings modal
2. Credentials stored in `user_preferences` table as `cisco_api_key`
3. On sync, service fetches credentials from database
4. Service requests OAuth2 token from Cisco Identity Services:
   ```
   POST https://id.cisco.com/oauth2/default/v1/token
   Headers: Authorization: Basic {base64(clientId:clientSecret)}
   Body: grant_type=client_credentials
   ```
5. Token used for all PSIRT API requests in sync batch
6. Token discarded after sync completes (not cached for security)

### Nginx Configuration

Extended timeout for long-running syncs:

```nginx
location ~ ^/api/(cisco|kev)/sync$ {
    proxy_pass http://hextrackr_backend;

    # Extended timeouts for rate-limited API syncs (10 minutes)
    proxy_connect_timeout 60s;
    proxy_send_timeout 600s;    # 2min → 10min
    proxy_read_timeout 600s;    # 2min → 10min
}
```

### Background Worker Architecture

```javascript
function startCiscoBackgroundSync(db) {
    const SYNC_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
    const STARTUP_DELAY = 5 * 60 * 1000; // 5 minutes - prevent database corruption on rapid Docker restarts
    const ADMIN_USER_ID = "00000000-0000-0000-0000-000000000001";

    // Run on startup (5 minute delay to prevent database corruption on rapid restarts)
    console.log("Cisco advisory background sync scheduled (runs 5 min after startup + every 24 hours)");
    setTimeout(() => {
        runSync();
    }, STARTUP_DELAY);

    // Repeat every 24 hours
    setInterval(runSync, SYNC_INTERVAL);
}
```

---

## Future Enhancements

### Phase 3: API Endpoint (Next Release)
- Create `/api/cisco/advisory/:cveId` endpoint
- Test manual sync flow from Settings
- Verify background worker runs on container restart

### Phase 4: UI Display
- Update Vulnerability Details Modal with Cisco fix info
- Add "Fixed in: X.X.X or later" display
- Link to Cisco advisory URL
- Test responsive layout

### Multi-Vendor Expansion
- Microsoft Update Catalog integration
- Juniper SIRT advisories
- Fortinet PSIRT
- Palo Alto security advisories

**Vendor-Neutral Design**: Adding new vendors requires no schema redesign - just create new advisory table and service class following the same pattern.

---

## Related Documentation

- [KEV Integration Guide](./kev-integration.md) - Similar auto-sync pattern
- [Getting Started Guide](./getting-started.md) - Initial HexTrackr setup
- [User Guide](./user-guide.md) - General HexTrackr usage
- [API Reference](../api-reference/index.md) - Backend API documentation

---

## Support

### Linear Issue
- [HEX-141: Cisco PSIRT Advisory Sync](https://linear.app/hextrackr/issue/HEX-141)

### Changelog
- [v1.0.63 Release Notes](../changelog/versions/1.0.63.md) - Complete implementation details

### Memento Insight
- Insight ID: `HEXTRACKR-INSIGHT-20251012-010900`
- Recall: `/recall-insight id:HEXTRACKR-INSIGHT-20251012-010900`
- Tags: `two-stage-api`, `rate-limiting`, `resilience`, `background-worker`

---

**Version**: 1.0.101 (Schema: 1.0.79+)
**Last Updated**: 2025-10-22
**Status**: Production - Normalized architecture (HEX-287)
