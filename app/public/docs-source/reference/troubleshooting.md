# Troubleshooting Guide

**Version**: v1.1.12
**Last Updated**: 2025-10-09

This guide covers common issues, solutions, and diagnostic steps for HexTrackr. Issues are organized by category for quick reference.

---

## Docker & Environment Issues

### Container Won't Start

**Problem**: Docker container fails to start or immediately exits

**Solutions**:

1. **Check Docker daemon is running**:
   ```bash
   docker info
   ```

2. **Verify both containers are running**:
   ```bash
   docker ps
   # Should see: hextrackr-app (Node.js) and hextrackr-nginx (HTTPS proxy)
   ```

3. **Check container logs**:
   ```bash
   # App logs
   docker logs hextrackr-app

   # Nginx logs
   docker logs hextrackr-nginx

   # All logs
   docker-compose logs
   ```

4. **Rebuild containers**:
   ```bash
   ./docker-rebuild.sh
   # Or manually:
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

### Port Already in Use

**Problem**: Error "bind: address already in use"

**Typical Causes**:
- Port 443 (HTTPS) is used by nginx for SSL termination
- Port 8080 (HTTP) is used by Express internally
- Port 8989 (alternative) may be mapped in some configurations

**Solution**:

```bash
# Find process using port 443 (nginx HTTPS)
sudo lsof -i :443

# Find process using port 8080 (Express app)
lsof -i :8080

# Kill the process if it's not HexTrackr
sudo kill -9 <PID>

# Restart Docker
docker-compose restart
```

**Note**: On macOS, port 443 may require `sudo` for `lsof`.

### Docker Helper Scripts

**Available Scripts** (project root):

```bash
# Start HexTrackr with health checks
./docker-start.sh

# Stop HexTrackr gracefully
./docker-stop.sh

# Rebuild after code changes
./docker-rebuild.sh

# View real-time logs
./docker-logs.sh
```

**When to use `docker-rebuild.sh`**:
- After modifying server code
- After updating dependencies (`npm install`)
- After changing environment variables
- After updating Docker configuration

### Environment Variable Issues

**Problem**: Server refuses to start or crashes immediately

**Check**: `SESSION_SECRET` validation

**Solution**:

```bash
# Server requires SESSION_SECRET with 32+ characters
# Generate secure secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env file:
echo "SESSION_SECRET=<generated-secret>" >> .env

# Restart containers:
docker-compose restart
```

**Required Environment Variables**:
- `SESSION_SECRET`: 32+ characters (REQUIRED, server exits without it)
- `TRUST_PROXY`: Must be `true` (ALWAYS for nginx reverse proxy)
- `NODE_ENV`: `development` or `production`

---

## Database Issues

### Database Locked Error

**Problem**: "SQLITE_BUSY: database is locked"

**Causes**:
- Long-running transaction not committed
- Multiple processes accessing database
- Database file permission issues

**Solutions**:

1. **Restart the application**:
   ```bash
   docker-compose restart hextrackr-app
   ```

2. **Check file permissions**:
   ```bash
   ls -la app/data/hextrackr.db
   # Should be writable by Docker user (often node or www-data)
   ```

3. **Verify WAL mode is enabled** (Write-Ahead Logging for better concurrency):
   ```bash
   sqlite3 app/data/hextrackr.db "PRAGMA journal_mode;"
   # Should return: wal
   ```

4. **Check for orphaned WAL files**:
   ```bash
   ls -la app/data/hextrackr.db-*
   # If present: hextrackr.db-wal, hextrackr.db-shm
   ```

### Missing Data After Import

**Problem**: Imported data doesn't appear in dashboard

**Checklist**:

1. **Verify import completed successfully**:
   ```bash
   docker logs hextrackr-app | grep -i "import"
   ```

2. **Check vendor filter** (HEX-156):
   - Dashboard filter dropdown shows "All Vendors" (default)
   - Try switching between CISCO, Palo Alto, Other
   - Vendor normalization may categorize data differently

3. **Check lifecycle state filtering**:
   - Resolved vulnerabilities are hidden by default
   - Use dashboard filters to show resolved items

4. **Verify scan date was set correctly**:
   - Import assigns scan date to all vulnerabilities
   - Dashboard may filter by date range

5. **Check duplicate detection**:
   - Deduplication engine removes duplicates (5-tier confidence scoring)
   - Check logs for "duplicate detected" messages

### Database Schema Issues

**Problem**: Schema errors after updating HexTrackr version

**Solution**: Use migration scripts (DO NOT run `npm run init-db` on existing database)

```bash
# Apply migration manually
sqlite3 app/data/hextrackr.db < app/public/scripts/migrations/XXX-description.sql

# Check schema version
sqlite3 app/data/hextrackr.db "SELECT * FROM schema_version;"
```

**⚠️ CRITICAL**: `npm run init-db` is ONLY for fresh installations. Running it on existing databases may cause schema conflicts.

---

## Authentication & Session Issues

### Login Fails Silently

**Problem**: Login form submits but user remains logged out

**Causes**:
1. **Trust proxy not configured** (HEX-128 bug):
   - Express doesn't detect HTTPS from nginx
   - Secure cookies are rejected by browser
   - Session appears to work (frontend) but fails (backend)

2. **Using HTTP instead of HTTPS**:
   - Session cookies have `secure: true` flag
   - Browsers reject cookies over HTTP

**Solutions**:

1. **Always use HTTPS URLs**:
   ```text
   ✅ https://dev.hextrackr.com
   ✅ https://hextrackr.com
   ✅ https://localhost
   ❌ http://localhost (BROKEN - returns empty API responses)
   ❌ http://localhost:8080 (BROKEN - app runs on 8080 but requires HTTPS)
   ```

2. **Verify trust proxy is enabled** (should ALWAYS be true):
   ```bash
   docker logs hextrackr-app | grep -i "trust proxy"
   # Should see: "Trust proxy: enabled"
   ```

3. **Check nginx is running and forwarding headers**:
   ```bash
   docker logs hextrackr-nginx | grep -i "x-forwarded-proto"
   ```

### Account Locked After Failed Logins

**Problem**: User locked out after too many failed attempts

**Behavior**: 5 failed attempts trigger 15-minute lockout

**Solution**:

```bash
# Wait 15 minutes (lockout expires automatically)
# OR manually reset in database:

sqlite3 app/data/hextrackr.db
UPDATE users SET failed_attempts = 0, failed_login_timestamp = NULL WHERE username = 'username';
```

### CSRF Token Invalid

**Problem**: "CSRF token validation failed" error

**Causes**:
- Token not included in request
- Token expired (tied to session)
- Session expired (24 hours default)

**Solutions**:

1. **Refresh CSRF token before protected requests**:
   ```javascript
   // Get fresh CSRF token
   const response = await fetch('/api/auth/csrf');
   const { csrfToken } = await response.json();

   // Include in request header
   headers: { 'X-CSRF-Token': csrfToken }
   ```

2. **Check session is still valid**:
   ```bash
   # Check session database
   sqlite3 app/data/sessions.db "SELECT * FROM sessions WHERE expired < strftime('%s', 'now');"
   ```

3. **Verify CSRF middleware is not blocking login**:
   - Login endpoint (`/api/auth/login`) is EXEMPT from CSRF
   - CSRF token endpoint (`/api/auth/csrf`) is EXEMPT
   - Status endpoint (`/api/auth/status`) is EXEMPT

### Session Expires Too Quickly

**Problem**: User logged out after short period

**Check Session TTL**:

```bash
# Session TTL is 24 hours by default (86400000 ms)
docker logs hextrackr-app | grep -i "session"
```

**"Remember Me" Feature**:
- Standard login: 24 hours
- "Remember Me": 30 days
- Check if "Remember Me" checkbox is working

---

## HTTPS & SSL Issues

### Self-Signed Certificate Warning

**Problem**: Browser shows "Your connection is not private" warning

**Expected Behavior**: This is NORMAL with self-signed development certificates

**Solution**:

1. **Bypass warning** (development only):
   - Click anywhere in browser window
   - Type `thisisunsafe` (no spaces)
   - Page loads automatically

2. **For production**: Replace self-signed certificates with valid certificates:
   ```bash
   # Replace certificates in nginx/certs/
   cp your-cert.pem nginx/certs/cert.pem
   cp your-key.pem nginx/certs/key.pem

   # Restart nginx
   docker-compose restart hextrackr-nginx
   ```

### Empty API Responses Over HTTP

**Problem**: API calls return empty responses or `{}` when using HTTP

**Cause**: Authentication system requires HTTPS (secure cookies)

**Solution**: ALWAYS use HTTPS URLs

```text
❌ http://localhost           → Empty responses
❌ http://localhost:8080      → Empty responses
✅ https://localhost          → Works
✅ https://dev.hextrackr.com  → Works
✅ https://hextrackr.com      → Works (production)
```

### Mixed Content Errors

**Problem**: "Mixed content blocked" errors in browser console

**Cause**: HTTPS page loading HTTP resources

**Solution**: Verify all resources use HTTPS or relative URLs

```javascript
// BAD: Hard-coded HTTP
<script src="http://example.com/script.js"></script>

// GOOD: Protocol-relative or HTTPS
<script src="//example.com/script.js"></script>
<script src="https://example.com/script.js"></script>

// BEST: Relative URL
<script src="/vendor/script.js"></script>
```

---

## Import/Export Issues

### CSV Import Fails

**Problem**: CSV import returns error or no data imported

**Solutions**:

1. **Verify CSV format matches supported columns**:
   - Required columns documented in User Guide
   - Column headers must match exactly (case-sensitive)

2. **Check file encoding**:
   ```bash
   file -I your-file.csv
   # Should be: charset=utf-8

   # Convert if needed:
   iconv -f ISO-8859-1 -t UTF-8 input.csv > output.csv
   ```

3. **Remove special characters from headers**:
   - PapaParse sanitizes headers: `[^a-zA-Z0-9_-]` → `_`
   - Avoid spaces, symbols, Unicode in column names

4. **Check file size**:
   - Maximum: 100MB
   - Large files process server-side (may take time)
   - Monitor progress in browser console

5. **Verify MIME type**:
   ```bash
   file --mime-type your-file.csv
   # Should be: text/csv, application/csv, or text/plain
   ```

### Export Generates Empty File

**Problem**: Export buttons create empty or corrupted files

**Solutions**:

1. **Verify data exists in current view**:
   - Check AG-Grid has rows visible
   - Verify filters aren't hiding all data
   - Try resetting filters

2. **Check browser console for errors**:
   ```text
   F12 → Console tab
   Look for: "Export failed", "No data", "CSV generation error"
   ```

3. **Clear browser cache and retry**:
   ```javascript
   // In browser console
   localStorage.clear();
   location.reload();
   ```

4. **Try different export format**:
   - Standard CSV export
   - Vendor breakdown CSV export (Cmd+Shift+Click on VPR card)
   - Weekly summary CSV export

### Vendor CSV Export Issues (HEX-149)

**Problem**: Vendor breakdown CSV export (Cmd+Shift+Click) not working

**Checklist**:

1. **Keyboard shortcut**: Cmd+Shift+Click (macOS) or Ctrl+Shift+Click (Windows/Linux)
2. **Click target**: VPR card (Critical, High, Medium, Low)
3. **Data required**: Must have vulnerabilities loaded in dashboard
4. **Vendor filtering**: Works with any vendor filter (All, CISCO, Palo Alto, Other)

**Expected Output**: CSV with vendor breakdown sections and aggregate totals

---

## Frontend Issues

### Blank Page or Loading Forever

**Problem**: Application shows blank page or infinite loading

**Solutions**:

1. **Check browser console for JavaScript errors**:
   ```text
   F12 → Console tab
   Look for: "Uncaught", "TypeError", "Failed to fetch"
   ```

2. **Verify API endpoints are responding**:
   ```text
   F12 → Network tab
   Filter: XHR/Fetch
   Check: /api/vulnerabilities, /api/statistics, /api/auth/status
   ```

3. **Clear browser cache and cookies**:
   ```javascript
   // Complete reset
   localStorage.clear();
   sessionStorage.clear();
   // Then: Ctrl+Shift+R (hard reload)
   ```

4. **Verify WebSocket connection**:
   ```text
   F12 → Network tab → WS filter
   Look for: Socket.io connection to wss://...
   Status: 101 Switching Protocols (success)
   ```

5. **Try incognito/private browsing mode** (rules out extension conflicts)

### Theme Not Switching

**Problem**: Dark/light theme toggle not working

**Solutions**:

1. **Clear theme localStorage**:
   ```javascript
   localStorage.removeItem('hextrackr-theme');
   location.reload();
   ```

2. **Check for CSS conflicts**:
   ```text
   F12 → Elements tab → Inspect <body> tag
   Should have: data-theme="dark" or data-theme="light"
   ```

3. **Verify AG-Grid theme sync** (HEX-140+):
   ```javascript
   // In browser console
   console.log(localStorage.getItem('hextrackr-theme'));
   // Should match visual theme
   ```

4. **Cross-tab sync not working**:
   - Open multiple tabs
   - Change theme in one tab
   - Other tabs should update automatically (localStorage events)
   - If not: Check browser allows cross-tab storage events

### Vendor Filter Not Working (HEX-156, HEX-158)

**Problem**: Vendor dropdown doesn't filter vulnerabilities

**Recent Changes** (v1.0.53-v1.0.54):
- Vendor filtering integrated across dashboard, dropdown, and VPR cards
- Bidirectional synchronization (dropdown ↔ top toggles)

**Solutions**:

1. **Verify vendor filter synchronization**:
   - Change vendor dropdown → top toggles should update
   - Click top toggle → dropdown should update
   - Both should filter AG-Grid table

2. **Check vendor normalization**:
   ```javascript
   // In browser console
   fetch('/api/vulnerabilities').then(r => r.json()).then(data => {
       console.log('Vendors:', [...new Set(data.map(v => v.vendor))]);
   });
   // Should show: ["CISCO", "Palo Alto", "Other"]
   ```

3. **Verify import.config.json vendor patterns**:
   - Family vendor patterns (vendor name matching)
   - Hostname vendor patterns (hostname prefix matching)
   - Default fallback to "Other"

4. **Clear filter cache**:
   ```javascript
   localStorage.removeItem('hextrackr-vendor-filter');
   location.reload();
   ```

---

## API & WebSocket Issues

### WebSocket Connection Failed

**Problem**: Real-time updates not working

**Solutions**:

1. **Check WebSocket URL in browser console**:
   ```text
   F12 → Network → WS filter
   Connection URL: wss://dev.hextrackr.com or wss://localhost
   Status: Should be 101 Switching Protocols
   ```

2. **Verify firewall/proxy allows WebSocket**:
   - Some corporate firewalls block WebSocket
   - Test with: `wscat -c wss://dev.hextrackr.com`

3. **Enable debug mode**:
   ```javascript
   localStorage.hextrackr_debug = "true";
   location.reload();
   // Check console for WebSocket connection details
   ```

4. **Check Docker logs for Socket.io errors**:
   ```bash
   docker logs hextrackr-app | grep -i "socket"
   docker logs hextrackr-app | grep -i "websocket"
   ```

5. **Verify session authentication** (WebSocket requires valid session):
   ```javascript
   fetch('/api/auth/status').then(r => r.json()).then(console.log);
   // Should show: { authenticated: true }
   ```

### API Returns 404

**Problem**: API calls return 404 errors

**Solutions**:

1. **Verify API base URL is correct**:
   ```javascript
   // All API endpoints start with /api/
   fetch('/api/vulnerabilities')  // ✅ Correct
   fetch('api/vulnerabilities')   // ❌ Wrong (missing leading slash)
   ```

2. **Check route exists in server.js**:
   ```bash
   # List all API routes
   grep -r "app\.\(get\|post\|put\|delete\)" app/routes/ | grep "/api/"
   ```

3. **Verify Docker container is running**:
   ```bash
   docker ps | grep hextrackr-app
   # Should show: Up (status)
   ```

4. **Check for typos in API endpoint**:
   - `/api/vulnerabilities` (plural, not singular)
   - `/api/statistics` (not /api/stats)
   - `/api/auth/login` (not /api/login)

### API Returns 429 (Rate Limit Exceeded)

**Problem**: "Too many requests" error

**Rate Limits**:
- **Production**: 100 requests per 15 minutes per IP
- **Development**: 10,000 requests per 1 minute per IP

**Solutions**:

1. **Wait for rate limit window to reset**:
   ```text
   Check response headers:
   RateLimit-Reset: <timestamp>
   ```

2. **If in development, verify NODE_ENV**:
   ```bash
   docker logs hextrackr-app | grep -i "node_env"
   # Should show: development (for higher limits)
   ```

3. **Check if legitimate traffic is being blocked**:
   ```bash
   docker logs hextrackr-app | grep -i "rate limit"
   ```

---

## Performance Issues

### Slow Dashboard Loading

**Problem**: Dashboard takes too long to load

**Solutions**:

1. **Check vulnerability count**:
   ```sql
   sqlite3 app/data/hextrackr.db "SELECT COUNT(*) FROM vulnerabilities;"
   ```
   - If > 10,000: Consider pagination or filtering
   - AG-Grid handles large datasets well, but 50k+ may slow down

2. **Clear browser cache**:
   ```javascript
   localStorage.clear();
   location.reload();
   ```

3. **Verify database indexes exist**:
   ```sql
   sqlite3 app/data/hextrackr.db ".indexes vulnerabilities"
   ```

4. **Monitor Docker container resources**:
   ```bash
   docker stats hextrackr-app
   # Check: CPU%, MEM%
   ```

5. **Check AG-Grid performance settings**:
   - Row virtualization enabled (default)
   - Pagination enabled
   - Deferred rendering for large datasets

### Import Takes Forever

**Problem**: CSV import appears stuck

**Solutions**:

1. **Check file size**:
   ```bash
   ls -lh your-file.csv
   # Large files (>50MB) process server-side
   ```

2. **Monitor progress in browser console**:
   ```text
   F12 → Console
   Look for: "Import progress: X%", "Processing rows..."
   ```

3. **Check Docker logs for processing status**:
   ```bash
   docker logs -f hextrackr-app | grep -i "import"
   ```

4. **Verify deduplication isn't removing too many rows**:
   ```bash
   docker logs hextrackr-app | grep -i "duplicate"
   # Deduplication engine logs duplicates found
   ```

5. **Consider staging import for very large files** (if implemented):
   - Split large CSV into smaller chunks
   - Import incrementally

### Chart Rendering Issues (HEX-158 Bug Fix)

**Problem**: VPR/Vuln totals chart doesn't maintain vendor filter

**Fixed in**: v1.0.54

**Behavior**:
- Toggle between VPR Sum and Vuln Sum buttons
- Chart should maintain current vendor filter (CISCO, Palo Alto, Other)

**If still broken**:

1. **Verify you're on v1.0.54+**:
   ```bash
   docker logs hextrackr-app | grep -i "version"
   ```

2. **Check chart update order**:
   ```javascript
   // In browser console
   localStorage.hextrackr_debug = "true";
   // Then toggle chart buttons and watch console
   ```

3. **Clear chart cache**:
   ```javascript
   localStorage.removeItem('hextrackr-chart-type');
   location.reload();
   ```

---

## Debug Mode

Enable debug mode for detailed logging:

```javascript
// In browser console
localStorage.hextrackr_debug = "true";
location.reload();
```

**Debug mode enables**:
- Verbose WebSocket logging
- Detailed API request/response logging
- Import processing details
- Theme switching diagnostics
- Vendor filter synchronization logs
- AG-Grid event logging

**Disable debug mode**:

```javascript
localStorage.removeItem('hextrackr_debug');
location.reload();
```

---

## Log Locations

### Application Logs

```bash
# Real-time logs (all containers)
docker-compose logs -f

# App container only
docker logs -f hextrackr-app

# Nginx container only
docker logs -f hextrackr-nginx

# Last 100 lines
docker logs --tail 100 hextrackr-app

# Since specific time
docker logs --since 2025-10-09T10:00:00 hextrackr-app
```

### Browser Logs

```text
F12 → Console tab       # JavaScript errors and logs
F12 → Network tab       # API requests, WebSocket connections
F12 → Application tab   # localStorage, sessionStorage, cookies
```

### Database Logs

```bash
# Query database directly
sqlite3 app/data/hextrackr.db

# Example: Check recent vulnerabilities
sqlite3 app/data/hextrackr.db "SELECT * FROM vulnerabilities ORDER BY created_at DESC LIMIT 10;"

# Example: Check sessions
sqlite3 app/data/sessions.db "SELECT * FROM sessions;"
```

---

## Common Error Messages

### "SESSION_SECRET is missing or too short"

**Error**: Server refuses to start

**Cause**: SESSION_SECRET environment variable not set or < 32 characters

**Solution**:

```bash
# Generate secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env
echo "SESSION_SECRET=<generated-secret>" >> .env

# Restart containers
docker-compose restart
```

### "Only HTTPS connections allowed" (CORS Error)

**Error**: API requests rejected with CORS error

**Cause**: Attempting HTTP cross-origin request (HexTrackr enforces HTTPS-only CORS)

**Solution**: Use HTTPS URLs only

```text
❌ http://dev.hextrackr.com
✅ https://dev.hextrackr.com
```

### "Path traversal detected"

**Error**: File operations fail with path traversal error

**Cause**: PathValidator detected `../` or `..\` in file path

**Solution**: Use absolute paths or sanitized relative paths

```javascript
// BAD: Path traversal attempt
const path = "../../../etc/passwd";

// GOOD: Absolute path
const path = "/app/data/uploads/file.csv";

// GOOD: Sanitized relative path
const path = "data/uploads/file.csv";
```

### "CSRF token validation failed"

**Error**: POST/PUT/DELETE requests fail with 403

**Cause**: CSRF token missing or invalid

**Solution**: Include CSRF token in request

```javascript
// Get token
const response = await fetch('/api/auth/csrf');
const { csrfToken } = await response.json();

// Include in request header
fetch('/api/protected-endpoint', {
    method: 'POST',
    headers: {
        'X-CSRF-Token': csrfToken,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ data })
});
```

---

## Getting Help

If issues persist after trying these solutions:

1. **Check GitHub Issues**: [HexTrackr Issues](https://github.com/Lonnie-Bruton/HexTrackr/issues)

2. **Gather diagnostic information**:
   - Docker logs: `docker-compose logs > logs.txt`
   - Browser console errors (screenshot)
   - Network tab (F12 → Network → Export HAR)
   - Steps to reproduce
   - HexTrackr version: `docker logs hextrackr-app | grep -i version`

3. **Create a detailed issue report**:
   - Title: Concise description of problem
   - Environment: OS, Docker version, browser
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Logs and screenshots

4. **Search existing issues first**:
   - Your issue may already be reported
   - Check closed issues for solutions

---

**Document Version**: 2.0
**Last Updated**: 2025-10-09
**Reviewed By**: hextrackr-fullstack-dev agent
**Next Review**: 2026-01-09 (quarterly review cycle)
