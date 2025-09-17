# Backend Modularization Rollback Procedure

## Overview

This document provides instructions for rolling back from the modular backend architecture to the original monolithic `server.js` if issues arise.

## Quick Rollback (Emergency)

If you need to immediately rollback to the monolithic version:

```bash
# 1. Navigate to server directory
cd /Volumes/DATA/GitHub/HexTrackr/app/public

# 2. Backup current modular server (optional)
cp server.js server-modular-$(date +%Y%m%d).js

# 3. Restore monolithic version
cp server-monolithic-backup.js server.js

# 4. Restart Docker
cd ../..
docker-compose restart

# 5. Verify health
curl http://localhost:8989/health
```

## Available Backup Files

| File | Description | Status |
|------|-------------|--------|
| `server-monolithic-backup.js` | Original working monolithic server (~3,805 lines) | ✅ Tested & Working |
| `server-modular-fixed.js` | Fixed modular version (~205 lines) | ✅ Current Production |
| `server-broken-modular.js` | Failed modularization attempt (for reference) | ❌ Do Not Use |

## Verification Steps After Rollback

### 1. Check Server Health
```bash
curl http://localhost:8989/health | jq
```

Expected response:
```json
{
  "status": "ok",
  "version": "1.0.13",
  "db": true,
  "uptime": 10.123
}
```

### 2. Test Core Endpoints
```bash
# Vulnerability stats
curl http://localhost:8989/api/vulnerabilities/stats | jq 'length'

# Tickets
curl http://localhost:8989/api/tickets | jq 'length'

# Backup stats
curl http://localhost:8989/api/backup/stats | jq

# Import history
curl http://localhost:8989/api/imports | jq 'length'
```

### 3. Check Frontend
- Navigate to http://localhost:8989/vulnerabilities.html
- Verify dashboard cards show data
- Test export functionality
- Check table loading

## Rollback Decision Tree

```
Is the application completely broken?
├─ YES → Emergency rollback (use Quick Rollback above)
└─ NO → Continue diagnosis
    │
    Are API endpoints returning errors?
    ├─ YES → Check specific issues
    │   ├─ "Controller not initialized" → Initialization order issue
    │   ├─ "Cannot find module" → File naming case sensitivity
    │   └─ 404 errors → Route mounting problem
    └─ NO → Check frontend issues
        │
        Is data not loading in UI?
        ├─ YES → Check browser console for errors
        └─ NO → Application is working (no rollback needed)
```

## Common Issues & Fixes (Before Rollback)

### Issue: "Controller not initialized"
**Fix**: Controllers must be initialized before routes are imported
```javascript
// In server.js startServer() function
await initDb(); // Initialize database first
VulnerabilityController.initialize(db, progressTracker); // Then controllers
const vulnerabilityRoutes = require("../routes/vulnerabilities"); // Then routes
```

### Issue: Module not found errors
**Fix**: Check file name case sensitivity
- Controllers use lowercase: `vulnerabilityController.js`
- Require with exact case: `require("../controllers/vulnerabilityController")`

### Issue: Routes returning 404
**Fix**: Check route mounting paths
```javascript
// Incorrect (creates /api/imports/imports)
app.use("/api/imports", importRoutes);
router.get("/imports", handler);

// Correct
app.use("/api/imports", importRoutes);
router.get("/", handler);
```

## Re-attempting Modularization

If you want to try modularization again after rollback:

1. **Study the broken attempt**: Review `server-broken-modular.js` to understand what went wrong
2. **Check the fixed version**: Compare with `server-modular-fixed.js` to see corrections
3. **Key lessons learned**:
   - Initialize controllers BEFORE importing routes
   - Use consistent file naming (all lowercase)
   - Use class references in routes, not instances
   - Test each endpoint after changes
   - Keep backups at each stage

## File Locations Reference

```
/Volumes/DATA/GitHub/HexTrackr/
├── app/
│   ├── public/
│   │   ├── server.js (current active server)
│   │   ├── server-monolithic-backup.js (rollback target)
│   │   ├── server-modular-fixed.js (working modular version)
│   │   └── server-broken-modular.js (reference only)
│   ├── controllers/
│   ├── services/
│   ├── routes/
│   ├── config/
│   └── utils/
└── docker-compose.yml
```

## Post-Rollback Actions

After successful rollback:

1. **Document the issue** that caused the rollback
2. **Update this procedure** with any new findings
3. **Notify team members** about the rollback
4. **Plan fixes** before re-attempting modularization

## Rollforward (Re-apply Modularization)

To re-apply the modular architecture after fixing issues:

```bash
# 1. Backup monolithic (if changes were made)
cp server.js server-monolithic-$(date +%Y%m%d).js

# 2. Apply fixed modular version
cp server-modular-fixed.js server.js

# 3. Restart and test
docker-compose restart
curl http://localhost:8989/health
```

## Contact & Support

If rollback fails or you encounter issues:
1. Check Docker logs: `docker-compose logs -f hextrackr`
2. Review error messages in browser console
3. Verify database integrity: `sqlite3 data/hextrackr.db "SELECT COUNT(*) FROM vulnerabilities;"`
4. Check file permissions: `ls -la app/public/`

---
*Document created as part of T063 - Backend Modularization Project*