# HexTrackr AI Coding Agent Instructions

## Project Overview

**HexTrackr** is an enterprise vulnerability management system built with Node.js/Express backend and vanilla JavaScript frontend. It tracks security vulnerabilities, maintenance tickets, and CISA KEV (Known Exploited Vulnerabilities) with real-time updates via WebSocket.

**Architecture**: Docker-based deployment with Nginx reverse proxy, SQLite database, session-based auth (Argon2id), and AG-Grid powered interfaces.

---

## MANDATORY: Search-First Workflow

**CRITICAL**: Claude Context and Memento are your PRIMARY discovery tools. Always search before building.

### Investigation Order (REQUIRED)

1. **Check Claude Context Index** (30 seconds)
   ```javascript
   // Ensure fresh index before searching
   mcp__claude-context__get_indexing_status({
     path: "/Volumes/DATA/GitHub/HexTrackr"
   })
   
   // If stale (>1 hour), re-index
   mcp__claude-context__index_codebase({
     path: "/Volumes/DATA/GitHub/HexTrackr",
     splitter: "ast",
     force: false
   })
   ```

2. **Search Existing Code** (1-2 minutes)
   ```javascript
   // ALWAYS search for existing solutions first
   mcp__claude-context__search_code({
     path: "/Volumes/DATA/GitHub/HexTrackr",
     query: "API endpoint [feature] controller method service",
     limit: 15,
     extensionFilter: [".js"]
   })
   ```

3. **Search Memento for Patterns** (1-2 minutes)
   ```javascript
   // Check for similar work, insights, anti-patterns
   mcp__memento__semantic_search({
     query: "[feature/problem] architecture pattern implementation",
     limit: 10,
     min_similarity: 0.6,
     entity_types: ["HEXTRACKR:DEVELOPMENT:SESSION", "HEXTRACKR:ARCHITECTURE:PATTERN"]
   })
   ```

4. **Verify with Route Files** (if needed)
   - Use Claude Context to search `/app/routes/*.js`
   - Only read files if search results are ambiguous

5. **Identify Solution**
   - ✅ Existing endpoint + query params? → USE IT
   - ✅ Data in memory but unmapped? → FIX MAPPING
   - ✅ Need transformation? → ADD HELPER
   - ⚠️ Truly new? → BUILD ENDPOINT

**Anti-Pattern Example**: HEX-204 almost created database endpoint for vendor/CVE fields. Claude Context search found data already in frontend memory, just needed field mapping.

**Key Principle**: Don't waste time reading files manually. Claude Context has the answers.

---

## Architecture Patterns (Core Knowledge)

**Use Claude Context to discover details on-demand. This section has only the "must-know" patterns.**

### Backend: Modular MVC with Singleton Controllers

**Controllers** MUST be initialized before routing:
```javascript
class VulnerabilityController {
    constructor() {
        this.vulnerabilityService = null;
    }
    
    initialize(db, progressTracker) {  // REQUIRED before routing
        this.vulnerabilityService = new VulnerabilityService(db, progressTracker);
    }
}
```

**Services** return standardized objects:
```javascript
// ALL services return {success, data, error}
const {success, data, error} = await service.getVulnerabilities(filters);
if (!success) return res.status(500).json({error});
```

**Database**: `better-sqlite3` (synchronous API), CommonJS only

### Frontend: Component-Based Vanilla JS

**Key Components** (search Claude Context for usage):
- `auth-state.js` - Authentication state
- `websocket-client.js` - Real-time updates
- `vulnerability-grid.js` - AG-Grid integration
- `preferences-service.js` - User settings
- `toast-manager.js` - Notifications

**Data Flow Pattern**: Check `dataManager.currentData` before creating backend endpoints

---

## Testing Workflow

**Manual Testing** (current approach):
- Chrome DevTools MCP - Browser automation for UI testing
- Playwright MCP - Headless browser testing
- Ask user to test - When manual verification needed

**Not ready for automated testing yet** - No test suite infrastructure

Example testing request:
```javascript
// After implementing feature:
"Can you test the new vulnerability filter using Chrome DevTools?"
// or
"Please test this endpoint and verify the response format"
```

---

## Development Workflow (Search Claude Context for Details)

### Essential Commands (Most Common)
```bash
npm run dev                    # Development with hot-reload
./docker-start.sh              # Start Docker (nginx + app)
./docker-stop.sh               # Stop containers

npm run lint:all               # All linters
npm run fix:all                # Auto-fix issues

# ⚠️ NEVER: npm run init-db (DESTRUCTIVE on existing database)
# ✅ INSTEAD: Use /app/public/scripts/migrations/*.sql
```

### Docker & HTTPS (Required for Auth)
- Nginx reverse proxy on ports 80/443
- Node.js backend on port 8080 (internal)
- Dev direct access: port 8989
- **Must use HTTPS** - Session cookies require `secure: true` flag
- Setup: `./scripts/setup-ssl.sh` (one-time)
- Access: `https://dev.hextrackr.com` or `https://localhost`

## Critical Pitfalls to Avoid

### 1. Database Destruction
- ❌ **NEVER** run `npm run init-db` on existing database
- ✅ Use `/app/public/scripts/migrations/*.sql` for schema changes
- Git hooks block commits to `init-database.js` to prevent data loss

### 2. Version Sync
- ❌ Don't manually edit versions in multiple files
- ✅ Edit `package.json` (root) only, then run `npm run release`
- Syncs 5 files: `app/public/package.json`, `README.md`, `docker-compose.yml`, `footer.html`, `server.js`

### 3. HTTP vs HTTPS
- ❌ `fetch('http://localhost/api/...')` → Auth fails
- ✅ `fetch('https://localhost/api/...')` → Works
- All API calls must use HTTPS in development

### 4. Trust Proxy
- ❌ `app.set("trust proxy", false)` → Breaks auth
- ✅ `app.set("trust proxy", true)` → Required for nginx
- Without this, Express can't detect HTTPS from `X-Forwarded-Proto` header

### 5. Frontend Data Loading
- ❌ Creating new backend endpoints for data already in memory
- ✅ Check `dataManager.currentData` first, add missing fields to mapping
- Example: Device security modal needed vendor/CVE fields, not new endpoint

---

## Code Style (Search for Specifics, Remember These)

### Module System
```javascript
// ✅ CommonJS (required)
const express = require('express');
module.exports = VulnerabilityController;

// ❌ ES modules (not supported)
import express from 'express';
```

### Service Return Pattern
```javascript
// ALL services return {success, data, error}
const {success, data, error} = await service.method();
if (!success) return res.status(500).json({error});
```

### JSDoc Required
```javascript
/**
 * @param {object} filters - Filter criteria
 * @returns {Promise<{success: boolean, data: array, error: string}>}
 */
async getVulnerabilities(filters = {}) { }
```

### Async/Await Only
```javascript
// ✅ Use async/await with try/catch
async function load() {
    try {
        const data = await fetch('/api/data');
        return await data.json();
    } catch (error) { throw error; }
}

// ❌ No promise chains
```

### Logging Emojis
- 🔍 Investigation
- ✅ Success
- ❌ Error
- ⚠️ Warning
- 🗑️ Cleanup

---

## Git Workflow (Dev Branch Strategy)

**Critical**: GitHub `main` is protected. Always work from `dev` branch.

```bash
# Daily workflow
git checkout dev
git pull origin main              # Sync dev with latest merged changes
# ... make changes, test, commit to dev ...
git push origin dev

# Create PR on GitHub: dev → main
# After PR merges, sync dev again
git checkout dev
git pull origin main

# Optional: Feature branch for complex work
git checkout -b feature/hex-124-something
# ... work ...
git checkout dev
git merge feature/hex-124-something
git branch -d feature/hex-124-something
git push origin dev
```

**Never**:
- ❌ Branch from local `main` (it's stale)
- ❌ Push directly to GitHub `main` (protected)
- ❌ Forget to sync `dev` after PR merges

---

## Deployment (Test Production)

**Environment**: Ubuntu VM (192.168.1.80) on N100 Mini PC (Proxmox)
**Purpose**: Single-user testing environment (NOT public production)

### Normal Deployment (Recommended)
```bash
# 1. Create deployment bundle
tar -czf hextrackr-v1.0.XX.tar.gz \
  app/services/databaseService.js \
  app/controllers/vulnerabilityController.js

# 2. SCP to server
scp hextrackr-v1.0.XX.tar.gz user@192.168.1.80:/path/to/HexTrackr/

# 3. SSH and extract
ssh user@192.168.1.80
cd /path/to/HexTrackr
tar -xzf hextrackr-v1.0.XX.tar.gz

# 4. Restart Docker
docker-compose restart
```

### Hotfix (Emergency Only)
⚠️ Bypasses version control - always commit afterward
```bash
ssh user@192.168.1.80
cp app/services/file.js app/services/file.js.bak
# ... edit file directly ...
docker-compose restart
```

---

## Documentation Locations

| Topic | File |
|-------|------|
| Full AI guidance | `/CLAUDE.md` |
| Environment details | `/docs/ENVIRONMENT_ARCHITECTURE.md` |
| Development patterns | `/docs/DEVELOPMENT_PATTERNS.md` |
| Deployment workflow | `/docs/DEPLOYMENT_WORKFLOW.md` |
| Git workflow | `/docs/GIT_WORKFLOW.md` |
| Infrastructure | `/INFRASTRUCTURE.md` |
| API reference | `https://localhost/docs-html/` (after install) |

---

## Quick Reference

**Languages**: JavaScript (Node.js 18+, CommonJS), vanilla JS frontend
**Database**: SQLite (better-sqlite3 synchronous API)
**Authentication**: Session-based (express-session + Argon2id)
**Frontend Framework**: None (vanilla JS + AG-Grid)
**Real-time**: Socket.io WebSocket
**Deployment**: Docker Compose (nginx + node.js containers)
**Ports**: 80 (HTTP), 443 (HTTPS), 8989 (dev backend direct access)
