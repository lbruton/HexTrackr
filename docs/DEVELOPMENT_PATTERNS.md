# Development Patterns

**Last Updated**: 2025-10-14

This document covers code style, common pitfalls, security patterns, and development best practices for HexTrackr.

---

## Code Style

### Module System
- **Pattern**: CommonJS (`require`/`module.exports`)
- **Why**: Node.js backend compatibility, synchronous database operations

```javascript
// ✅ Good
const express = require('express');
const VulnerabilityService = require('./services/vulnerabilityService');

module.exports = VulnerabilityController;

// ❌ Avoid (not supported)
import express from 'express';
export default VulnerabilityController;
```

### JSDoc Documentation
- **Required**: All functions must have JSDoc comments
- **Include**: Description, parameters, return types, examples

```javascript
/**
 * Get vulnerabilities with optional filtering
 *
 * @param {object} filters - Filter criteria
 * @param {string} [filters.severity] - Filter by severity level
 * @param {string} [filters.vendor] - Filter by vendor
 * @returns {Promise<{success: boolean, data: array, error: string}>}
 * @example
 * const result = await service.getVulnerabilities({severity: 'critical'});
 */
async getVulnerabilities(filters = {}) {
    // Implementation
}
```

### Async Patterns
- **Standard**: Promises with async/await
- **Error Handling**: Try/catch blocks in services, propagate to controllers

```javascript
// ✅ Good - Clean async/await
async function loadVulnerabilities() {
    try {
        const response = await fetch('/api/vulnerabilities');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('❌ Failed to load:', error);
        throw error;
    }
}

// ❌ Avoid - Promise chains
function loadVulnerabilities() {
    return fetch('/api/vulnerabilities')
        .then(res => res.json())
        .then(data => data)
        .catch(error => console.error(error));
}
```

### Error Messages
- **User-friendly**: Explain what went wrong and how to fix it
- **Actionable**: Provide next steps or recovery options

```javascript
// ✅ Good
throw new Error('Failed to import CSV: File size exceeds 100MB limit. Please reduce file size and try again.');

// ❌ Avoid
throw new Error('Import failed');
```

### Logging
- **Console with emoji indicators** for visual scanning:
  - 🔍 - Investigation/search
  - ✅ - Success
  - ❌ - Error
  - ⚠️ - Warning
  - 🗑️ - Cleanup/deletion
  - 📊 - Statistics/metrics
  - 🔧 - Configuration

```javascript
console.log('🔍 Searching for vulnerabilities...');
console.log('✅ Import completed: 1,234 vulnerabilities processed');
console.error('❌ Database connection failed');
console.warn('⚠️ Cache hit rate below 50%');
```

---

## Common Pitfalls

### 1. HTTP vs HTTPS
**Problem**: Auth cookies require `secure` flag, only work on HTTPS

```javascript
// ❌ WRONG - Will fail authentication
fetch('http://localhost/api/vulnerabilities')

// ✅ RIGHT - Use HTTPS even in development
fetch('https://dev.hextrackr.com/api/vulnerabilities')
fetch('https://localhost/api/vulnerabilities')
```

**Why**: Session cookies have `secure: true` flag set. Without HTTPS, browser won't send cookies → 401 Unauthorized.

### 2. Trust Proxy Configuration
**Problem**: Express behind nginx needs trust proxy enabled

```javascript
// ❌ WRONG - Authentication will break
app.set("trust proxy", false);

// ✅ RIGHT - ALWAYS enabled for nginx
app.set("trust proxy", true);
```

**Why**: nginx terminates SSL and forwards requests to Express. Without trust proxy, Express:
- Can't detect HTTPS from `X-Forwarded-Proto` header
- Won't set `secure: true` cookies
- Authentication fails

### 3. init-database.js Danger
**Problem**: Running init-database.js destroys all existing data

```bash
# ❌ DESTRUCTIVE - Only for fresh installs
npm run init-db

# ✅ RIGHT - Use migrations for existing databases
sqlite3 app/data/hextrackr.db < app/public/scripts/migrations/008-new-feature.sql
```

**Protection**: Git hooks block commits that modify `init-database.js` to prevent accidental data loss.

### 4. Version Sync Automation
**Problem**: Version must be consistent across 5 files

```bash
# ❌ WRONG - Manual editing causes inconsistencies
vim app/public/package.json  # Change version
vim docker-compose.yml       # Change version
# ... (3 more files)

# ✅ RIGHT - Automated sync
vim package.json             # Change version in ROOT package.json only
npm run release              # Syncs to all 5 files + generates docs
```

**Files synced by `npm run release`**:
1. `app/public/package.json`
2. `app/public/scripts/shared/footer.html`
3. `README.md`
4. `docker-compose.yml` (HEXTRACKR_VERSION env var)
5. `app/public/server.js` (reads from env var)

### 5. Controller Initialization
**Problem**: Controllers are singletons that need initialization

```javascript
// ❌ WRONG - Controller not initialized
const controller = new VulnerabilityController();
app.use('/api/vulnerabilities', vulnerabilityRoutes);
// Routes will fail - vulnerabilityService is null

// ✅ RIGHT - Initialize before routing
const controller = new VulnerabilityController();
controller.initialize(db, progressTracker);
app.use('/api/vulnerabilities', vulnerabilityRoutes);
```

**Pattern**: All controllers have `initialize(db, progressTracker)` method that must be called after instantiation.

### 6. Service Return Pattern
**Problem**: Services return standardized object structure

```javascript
// ❌ WRONG - Inconsistent return handling
const vulnerabilities = await service.getVulnerabilities(filters);
if (vulnerabilities.length > 0) { // Will crash if error occurred
    // ...
}

// ✅ RIGHT - Always destructure {success, data, error}
const {success, data, error} = await service.getVulnerabilities(filters);
if (!success) {
    return res.status(500).json({error});
}
res.json(data);
```

**Standard Service Return**:
```javascript
{
    success: boolean,  // true if operation succeeded
    data: any,        // Result data (null if error)
    error: string     // Error message (null if success)
}
```

---

## Security Patterns

### Authentication Flow

**Full cycle**:
1. **Login**: `POST /api/auth/login` with username/password
2. **Verification**: Argon2id password hash comparison
3. **Session**: Server creates session, returns cookie (`hextrackr.sid`)
4. **Storage**: SQLite session store (`app/data/sessions.db`)
5. **Protected Routes**: Use `requireAuth` middleware
6. **WebSocket Auth**: Handshake verifies session before upgrade

**Middleware Example**:
```javascript
// routes/vulnerabilities.js
const { requireAuth } = require('../middleware/auth');

router.get('/vulnerabilities', requireAuth, vulnerabilityController.getAll);
```

### Input Validation Layers

**1. Path Traversal Protection**
```javascript
// Use PathValidator for all file operations
const PathValidator = require('./utils/PathValidator');

// ❌ DANGEROUS
const filePath = req.body.filename;
fs.readFileSync(filePath);  // Can access /etc/passwd

// ✅ SAFE
const validator = new PathValidator('/app/uploads');
const filePath = validator.validate(req.body.filename);
if (!filePath) {
    throw new Error('Invalid file path');
}
fs.readFileSync(filePath);
```

**2. SQL Injection Prevention**
```javascript
// ❌ WRONG - String concatenation
const query = `SELECT * FROM vulnerabilities WHERE vendor = '${vendor}'`;
const results = db.prepare(query).all();

// ✅ RIGHT - Parameterized queries
const query = `SELECT * FROM vulnerabilities WHERE vendor = ?`;
const results = db.prepare(query).all(vendor);
```

**3. CSV Injection Prevention**
```javascript
// Use safeCSV() function for exports
function safeCSV(value) {
    if (typeof value === 'string' && /^[=+\-@]/.test(value)) {
        return `'${value}`;  // Prefix with single quote
    }
    return value;
}

// Excel will render '=SUM(A1:A10) as literal text, not formula
```

**4. XSS Prevention**
```javascript
// Frontend: Use DOMPurify for markdown rendering
import DOMPurify from 'dompurify';
import { marked } from 'marked';

const dirty = marked.parse(userInput);
const clean = DOMPurify.sanitize(dirty);
element.innerHTML = clean;
```

### CSRF Protection Pattern

**When writing frontend code that calls POST/PUT/DELETE/PATCH endpoints:**

**Option 1: Use existing wrappers** (handles CSRF automatically)
```javascript
// Authenticated pages
import { authState } from './auth-state.js';

const response = await authState.authenticatedFetch('/api/vulnerabilities', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
});

// Preferences
import { preferencesService } from './preferences-service.js';

const response = await preferencesService.authenticatedFetch('/api/preferences/theme', {
    method: 'PUT',
    body: JSON.stringify({theme: 'dark'})
});
```

**Option 2: Manual implementation** (if wrappers unavailable)
```javascript
// Step 1: Fetch CSRF token
const res = await fetch('/api/auth/csrf', {credentials: 'include'});
const {csrfToken} = await res.json();

// Step 2: Use token in request
fetch('/api/vulnerabilities', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken  // REQUIRED
    },
    credentials: 'include',  // REQUIRED - sends session cookie
    body: JSON.stringify(data)
});
```

**Key Facts**:
- **Token endpoint**: `GET /api/auth/csrf` (public, no auth needed)
- **Token storage**: Session-based (`req.session.csrfToken`)
- **Required header**: `X-CSRF-Token`
- **GET requests**: No CSRF token needed
- **Excluded paths**: `/api/auth/login`, `/api/auth/csrf`, `/api/auth/status`
- **Implementation**: `csrf-sync` package, configured in `server.js:187-220`

### Security Headers (Helmet.js)

Applied via `middlewareConfig`:
```javascript
helmet({
    contentSecurityPolicy: false,  // Disabled for inline scripts
    crossOriginEmbedderPolicy: false
})
```

**Headers set**:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

---

## Database Patterns

### Transaction Management

**Use `runInTransaction()` for multi-step operations**:
```javascript
// services/databaseService.js
runInTransaction(callback) {
    this.db.prepare('BEGIN').run();
    try {
        callback();
        this.db.prepare('COMMIT').run();
    } catch (error) {
        this.db.prepare('ROLLBACK').run();
        throw error;
    }
}

// Usage in service
runInTransaction(() => {
    db.prepare('INSERT INTO vulnerabilities ...').run(vuln1);
    db.prepare('INSERT INTO vulnerabilities ...').run(vuln2);
    db.prepare('UPDATE daily_totals ...').run();
});
```

### Performance Optimization

**SQLite PRAGMA settings** (applied at startup in `databaseService.js`):
```javascript
this.db.run("PRAGMA cache_size = -64000");      // 64MB cache (32x default)
this.db.run("PRAGMA mmap_size = 268435456");    // 256MB memory-mapped I/O
this.db.run("PRAGMA temp_store = MEMORY");      // Temp tables in RAM
this.db.run("PRAGMA page_size = 4096");         // Optimal page size
```

**Result**: 5-6x query performance improvement (v1.0.66)

### Migration Pattern

**For existing databases, NEVER use `init-database.js`**:

```bash
# 1. Create migration file
cat > app/public/scripts/migrations/008-vendor-daily-totals.sql << 'EOF'
CREATE TABLE IF NOT EXISTS vendor_daily_totals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    vendor TEXT NOT NULL,
    total_count INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_vendor_daily_totals_date ON vendor_daily_totals(date);
EOF

# 2. Apply migration
sqlite3 app/data/hextrackr.db < app/public/scripts/migrations/008-vendor-daily-totals.sql

# 3. Update init-database.js for fresh installs
vim app/public/scripts/init-database.js
# Add CREATE TABLE statement to schema initialization
```

---

## Frontend Patterns

### Data Loading Strategy

**Current Architecture**: Legacy pattern loads all 95K vulnerabilities at once
```javascript
// vulnerability-data.js _loadDataLegacy()
const response = await fetch('/api/vulnerabilities?limit=100000');
const data = await response.json();
```

**Performance** (Mac M4): ~100ms (localhost + ARM64)
**Performance** (Ubuntu N100): ~3s (network + disk I/O)

**Future**: HEX-112 pagination (80% complete)

### AG-Grid Virtual Scrolling

**Already implemented** - handles large datasets efficiently:
```javascript
// vulnerability-grid.js
const gridOptions = {
    rowModelType: 'clientSide',  // All data in memory
    pagination: false,           // Virtual scrolling instead
    enableCellTextSelection: true,
    domLayout: 'normal'
};
```

**Performance**: Renders 95K rows with ~60ms scroll latency

### WebSocket Real-Time Updates

**Pattern**: Socket.io for progress tracking
```javascript
// Frontend
import { websocketClient } from './websocket-client.js';

websocketClient.on('import-progress', (data) => {
    progressModal.update(data.current, data.total, data.message);
});

// Backend
progressTracker.emit('import-progress', {
    current: 1000,
    total: 95000,
    message: 'Processing vulnerabilities...'
});
```

### Theme Management

**Pattern**: CSS variables + preference persistence
```javascript
// preferences-service.js
async setTheme(theme) {
    document.documentElement.setAttribute('data-bs-theme', theme);
    await this.savePreference('theme', theme);
}
```

**CSS Variables**:
```css
[data-bs-theme="dark"] {
    --hextrackr-surface-base: #1e293b;
    --hextrackr-text-primary: #f8fafc;
}

.card {
    background-color: var(--hextrackr-surface-base);
    color: var(--hextrackr-text-primary);
}
```

---

## Testing Patterns

### Manual Testing Checklist

**After code changes**:
1. ✅ Clear Docker cache: `docker-compose restart`
2. ✅ Hard refresh browser: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)
3. ✅ Check console for errors
4. ✅ Verify authentication flow (login/logout)
5. ✅ Test modified feature
6. ✅ Check Docker logs: `docker-compose logs -f`

### Performance Testing

**Load time benchmarks**:
- Development (Mac M4): < 500ms
- Test Production (Ubuntu N100): < 2s (target after v1.0.66 optimizations)

**Measure with Network tab**:
```javascript
// Chrome DevTools → Network → Filter: XHR/Fetch
// Look for /api/vulnerabilities request
// Timing breakdown: DNS, Connect, TLS, TTFB, Content Download
```

---

**Related Documentation**:
- Environment: `/docs/ENVIRONMENT_ARCHITECTURE.md`
- Deployment: `/docs/DEPLOYMENT_WORKFLOW.md`
- MCP Tools: `/docs/MCP_TOOLS.md`
