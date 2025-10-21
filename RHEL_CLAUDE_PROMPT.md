# HexTrackr RHEL Deployment - Troubleshooting Task

## Context
I'm deploying HexTrackr v1.0.92 on Red Hat Enterprise Linux 10 in `/opt/hextrackr/`. The deployment is 95% complete but the application container is crash-looping with a database error.

## Current Status

**What Works:**
- ✅ RHEL 10 system configured (static IP, firewall, Docker installed)
- ✅ All files in `/opt/hextrackr/` (app, config, certs, docker-compose.yml)
- ✅ Docker images built successfully (`hextrackr-hextrackr:latest`)
- ✅ Database backup restored to Docker volume `hextrackr-database` (837MB)
- ✅ Database has all correct tables including `audit_log_config` (verified with sqlite3)
- ✅ `.env` file configured with session secret
- ✅ SSL certificates valid (hextrackr.com, expires Nov 2026)

**What's Broken:**
- ❌ Application container crashes on startup with error:
  ```
  Failed to initialize LoggingService: Failed to query encryption key:
  SQLITE_ERROR: no such table: audit_log_config
  ```
- The container is in a restart loop (exit code 1)

## The Mystery

The database **definitely has** the `audit_log_config` table:
```bash
docker run --rm -v hextrackr-database:/data alpine sh -c \
  "apk add sqlite && sqlite3 /data/hextrackr.db '.tables'"
# Shows: audit_log_config, audit_logs, etc. (all tables present)
```

But the Node.js app using `sqlite3` npm package (v3.44.2) can't find it.

## Key Files Location
- Working directory: `/opt/hextrackr/`
- Database volume: `hextrackr-database` mounted at `/app/data/`
- Database path in app: `DATABASE_PATH=data/hextrackr.db`
- App code: `/opt/hextrackr/app/`

## Deployment Guide
The full deployment guide is at `/opt/hextrackr/DEPLOYMENT_RHEL10.md` - we're stuck at Phase 6 (Deployment), Step 6.5.

## Your Mission

1. **Diagnose** why the app can't see the `audit_log_config` table that definitely exists
2. **Fix** the database connection issue
3. **Start** the containers successfully with `docker compose up -d`
4. **Verify** the app is accessible at https://192.168.1.80

## Possible Issues to Check

1. **SQLite version mismatch** - Alpine sqlite3 CLI vs sqlite3 npm package
2. **Database locking/WAL files** - Check for .db-wal or .db-shm files
3. **Volume mount issues** - Verify `/app/data` is correctly mounted
4. **Database file corruption** - Despite correct size, file may be corrupted
5. **Permissions** - Database file owned by root, app runs as node user
6. **Code issue** - LoggingService may be looking at wrong database path

## Quick Start Commands

```bash
cd /opt/hextrackr

# Check current status
docker compose ps

# View logs
docker compose logs hextrackr | tail -50

# Check database in volume
docker run --rm -v hextrackr-database:/data alpine ls -lh /data/

# Check database tables
docker run --rm -v hextrackr-database:/data alpine sh -c \
  "apk add sqlite && sqlite3 /data/hextrackr.db '.tables'"
```

## Expected Outcome

After your fix:
- `docker compose ps` shows both containers running and healthy
- https://192.168.1.80 serves the HexTrackr application
- No crash loops or restart errors

## Additional Context

- This is a lab/test environment for an upcoming production deployment
- User has a presentation Monday, so time-sensitive
- The database backup contains presentation-ready data (3000+ vulnerabilities)
- This is the user's first RHEL deployment (coming from Ubuntu/macOS)

---

## CRITICAL: Documentation Requirements

After you successfully fix the issue:

1. **Create a detailed fix report** at `/opt/hextrackr/FIX_REPORT.md` that includes:
   - Root cause analysis (what was actually wrong)
   - Step-by-step fix procedure (exact commands used)
   - Why the issue occurred
   - How to prevent it in future deployments

2. **Update the deployment guide** `/opt/hextrackr/DEPLOYMENT_RHEL10.md`:
   - Add the fix steps to the appropriate phase
   - Include warnings/notes about this gotcha
   - Update troubleshooting section with this issue

3. **Test and document verification**:
   - Confirm application starts successfully
   - Document how to verify the fix worked
   - Include any monitoring/health check commands

The fix report and guide updates are JUST AS IMPORTANT as fixing the issue itself, since this deployment guide will be used for production deployment next week!

---

**Please diagnose and fix the database connection issue, then document everything for the deployment guide!**
