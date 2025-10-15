#!/bin/bash
# HexTrackr Production Deployment Package Creator
# Creates a clean deployment package for production server
# Excludes environment-specific configs and dev artifacts

set -e  # Exit on error

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
PACKAGE_NAME="hextrackr-deployment-${TIMESTAMP}"
PACKAGE_DIR="${PROJECT_ROOT}/../${PACKAGE_NAME}"

echo "📦 Creating HexTrackr Deployment Package"
echo "========================================"
echo ""
echo "Project Root: ${PROJECT_ROOT}"
echo "Package Dir:  ${PACKAGE_DIR}"
echo ""

# Create package directory
mkdir -p "${PACKAGE_DIR}"

# Copy application code
echo "📁 Copying application code..."
cp -R "${PROJECT_ROOT}/app" "${PACKAGE_DIR}/"

# Copy scripts (including new backfill script)
echo "📁 Copying scripts..."
mkdir -p "${PACKAGE_DIR}/scripts"
cp "${PROJECT_ROOT}/scripts/backfill-vendor-daily-totals.js" "${PACKAGE_DIR}/scripts/"
cp "${PROJECT_ROOT}/scripts/db-snapshot-cleanup.js" "${PACKAGE_DIR}/scripts/"

# Copy package files for npm install
echo "📁 Copying package files..."
cp "${PROJECT_ROOT}/package.json" "${PACKAGE_DIR}/"
cp "${PROJECT_ROOT}/package-lock.json" "${PACKAGE_DIR}/"

# Copy reference configs (renamed to avoid overwriting prod)
echo "📁 Copying reference configs..."
cp "${PROJECT_ROOT}/docker-compose.yml" "${PACKAGE_DIR}/docker-compose.yml.reference"
cp "${PROJECT_ROOT}/nginx.conf" "${PACKAGE_DIR}/nginx.conf.reference"
cp "${PROJECT_ROOT}/.env.example" "${PACKAGE_DIR}/.env.example"

# Copy documentation
echo "📁 Copying documentation..."
cp "${PROJECT_ROOT}/README.md" "${PACKAGE_DIR}/" 2>/dev/null || true
cp "${PROJECT_ROOT}/CLAUDE.md" "${PACKAGE_DIR}/" 2>/dev/null || true

# Clean up dev artifacts from package
echo "🧹 Cleaning dev artifacts..."
rm -rf "${PACKAGE_DIR}/app/data/hextrackr.db"* 2>/dev/null || true
rm -rf "${PACKAGE_DIR}/app/data/sessions.db"* 2>/dev/null || true
rm -rf "${PACKAGE_DIR}/node_modules" 2>/dev/null || true
rm -rf "${PACKAGE_DIR}/.git" 2>/dev/null || true
rm -rf "${PACKAGE_DIR}/.github" 2>/dev/null || true

# Create migration guide
echo "📝 Creating migration guide..."
cat > "${PACKAGE_DIR}/MIGRATION-GUIDE.md" << 'EOF'
# HexTrackr Production Migration Guide

**Target**: Ubuntu Production Server (192.168.1.80)
**Version**: 1.0.66 → 1.0.67 (Migration 008: Vendor Daily Totals)

## Overview

This deployment adds the `vendor_daily_totals` table to fix vendor-filtered VPR trends only showing last 3 scan dates. The new table provides permanent storage for vendor-specific trend data that survives database cleanup operations.

## Pre-Deployment Checklist

- [ ] Current version running: 1.0.66
- [ ] Docker containers running normally
- [ ] No active CSV imports in progress
- [ ] Backup created and verified

---

## Step 1: Backup (CRITICAL)

```bash
# Stop Docker containers
cd /opt/hextrackr
docker-compose down

# Create timestamped backup
BACKUP_DATE=$(date +%Y%m%d-%H%M%S)
cd /opt
sudo tar -czf "hextrackr-backup-${BACKUP_DATE}.tar.gz" hextrackr/

# Verify backup
ls -lh "hextrackr-backup-${BACKUP_DATE}.tar.gz"

# Also backup just the database
cp /opt/hextrackr/app/data/hextrackr.db "/opt/hextrackr/app/data/hextrackr.db.backup-${BACKUP_DATE}"
```

---

## Step 2: Deploy Application Code

**DO NOT overwrite these files** (they have production-specific values):
- `.env` (production SESSION_SECRET, ports, paths)
- `docker-compose.yml` (production ports, volumes)
- `nginx.conf` (production SSL certs, server_name)
- `app/data/hextrackr.db` (production database!)

**Deployment from Mac M4 (run on dev machine):**

```bash
# SCP deployment package to production
scp -r hextrackr-deployment-TIMESTAMP/ lonnie@192.168.1.80:/tmp/

# SSH to production
ssh lonnie@192.168.1.80
```

**On Production Server:**

```bash
# Navigate to production directory
cd /opt/hextrackr

# Remove old app code (keep data and configs!)
sudo rm -rf app/controllers app/services app/routes app/utils app/middleware app/config
sudo rm -rf app/public/scripts

# Copy new application code
sudo cp -R /tmp/hextrackr-deployment-TIMESTAMP/app/* app/
sudo cp -R /tmp/hextrackr-deployment-TIMESTAMP/scripts/* scripts/ 2>/dev/null || mkdir -p scripts && sudo cp -R /tmp/hextrackr-deployment-TIMESTAMP/scripts/* scripts/

# Update package files
sudo cp /tmp/hextrackr-deployment-TIMESTAMP/package.json .
sudo cp /tmp/hextrackr-deployment-TIMESTAMP/package-lock.json .

# Install dependencies (in case of new packages)
sudo npm install --production
```

---

## Step 3: Database Migration

Apply Migration 008 to create `vendor_daily_totals` table:

```bash
cd /opt/hextrackr

# Apply migration
sqlite3 app/data/hextrackr.db < app/public/scripts/migrations/008-vendor-daily-totals.sql

# Verify table created
sqlite3 app/data/hextrackr.db "SELECT name FROM sqlite_master WHERE type='table' AND name='vendor_daily_totals';"
# Expected output: vendor_daily_totals

# Verify indexes created
sqlite3 app/data/hextrackr.db "SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='vendor_daily_totals';"
# Expected output:
# idx_vendor_daily_scan_date
# idx_vendor_daily_vendor
# idx_vendor_daily_composite
```

---

## Step 4: Configuration Updates

**Review reference files and merge changes** (do NOT blindly overwrite):

### 4.1 Docker Compose (if needed)

```bash
# Compare reference to production
diff docker-compose.yml docker-compose.yml.reference

# Manually merge any new environment variables or service configs
# KEEP production ports and volume paths!
```

### 4.2 Nginx Config (if needed)

```bash
# Compare reference to production
diff nginx.conf nginx.conf.reference

# Manually merge any new proxy settings or routes
# KEEP production SSL cert paths and server_name!
```

### 4.3 Environment Variables (if needed)

```bash
# Compare to example
diff .env .env.example

# Ensure these production values are set:
# - SESSION_SECRET (32+ character production secret)
# - TRUST_PROXY=true
# - NODE_ENV=production
```

---

## Step 5: Optional Backfill

**IF you want historical vendor trend data** (recommended):

```bash
cd /opt/hextrackr

# Check what dates are in your backup
sqlite3 app/data/hextrackr.db.backup-TIMESTAMP "SELECT DISTINCT scan_date FROM vulnerability_snapshots ORDER BY scan_date;"

# Dry-run backfill
node scripts/backfill-vendor-daily-totals.js \
  --backup app/data/hextrackr.db.backup-TIMESTAMP \
  --dry-run

# Execute backfill (if dry-run looks good)
node scripts/backfill-vendor-daily-totals.js \
  --backup app/data/hextrackr.db.backup-TIMESTAMP \
  --execute

# Verify backfill
sqlite3 app/data/hextrackr.db "SELECT vendor, COUNT(*) as dates, MIN(scan_date), MAX(scan_date) FROM vendor_daily_totals GROUP BY vendor;"
```

**IF you skip backfill**: New table will populate automatically on next CSV import. Historical trends will only show data from that point forward.

---

## Step 6: Start Services

```bash
cd /opt/hextrackr

# Start Docker containers
docker-compose up -d

# Follow logs
docker-compose logs -f

# Wait for "Server running on port 8080" message
# Ctrl+C to exit logs
```

---

## Step 7: Verification

### 7.1 Basic Health Check

```bash
# Check containers running
docker-compose ps

# Check application logs for errors
docker-compose logs hextrackr-app | tail -50

# Test HTTPS endpoint
curl -k https://192.168.1.80/api/auth/status
# Expected: {"authenticated":false}
```

### 7.2 Database Verification

```bash
# Check vendor_daily_totals exists and has data
sqlite3 app/data/hextrackr.db "SELECT COUNT(*) FROM vendor_daily_totals;"
# Expected: 0 (if no backfill) or 27+ (if backfilled)

# Check vulnerabilities table still intact
sqlite3 app/data/hextrackr.db "SELECT COUNT(*) FROM vulnerabilities;"
# Expected: Your current vulnerability count
```

### 7.3 UI Testing

1. Navigate to `https://hextrackr.com` or `https://192.168.1.80`
2. Login with credentials
3. **Test VPR Trends**:
   - Go to vulnerabilities page
   - Check "All Vendors" trend chart (should show historical data)
   - Check "CISCO" vendor filter (should show same date range)
   - Check "Palo Alto" vendor filter (should show same date range)
   - Check "Other" vendor filter (should show same date range)
4. **Test CSV Export** (optional):
   - Click a VPR card with Cmd+Shift (or Ctrl+Shift)
   - Should download CSV with vendor breakdown
5. **Test CSV Import** (optional):
   - Upload a test CSV
   - Verify `vendor_daily_totals` gets populated

---

## Step 8: Monitor First Import

On next CSV import, verify automatic population:

```bash
# Before import - check current row count
sqlite3 app/data/hextrackr.db "SELECT COUNT(*) FROM vendor_daily_totals;"

# After import - check new rows added
sqlite3 app/data/hextrackr.db "SELECT COUNT(*) FROM vendor_daily_totals;"
# Should increase by 3 (CISCO, Palo Alto, Other)

# Check latest data
sqlite3 app/data/hextrackr.db "SELECT scan_date, vendor, total_vulnerabilities, ROUND(total_vpr, 2) FROM vendor_daily_totals ORDER BY scan_date DESC LIMIT 3;"
```

---

## Rollback Plan (If Needed)

If critical issues arise:

```bash
cd /opt/hextrackr

# Stop containers
docker-compose down

# Restore from backup
cd /opt
sudo rm -rf hextrackr
sudo tar -xzf hextrackr-backup-TIMESTAMP.tar.gz

# Restart old version
cd hextrackr
docker-compose up -d
```

---

## Key Changes Summary

**Database:**
- ✅ New table: `vendor_daily_totals` (permanent vendor trend storage)
- ✅ New indexes: 3 indexes for optimal query performance
- ✅ Migration 008 applied

**Backend:**
- ✅ `importService.js`: Auto-populates vendor_daily_totals on CSV import
- ✅ `vulnerabilityStatsService.js`: Queries vendor_daily_totals instead of vulnerability_snapshots
- ✅ `databaseService.js`: Schema updated for fresh installs
- ✅ `init-database.js`: Includes new table for new deployments

**Scripts:**
- ✅ New: `backfill-vendor-daily-totals.js` (optional historical data backfill)
- ✅ Existing: `db-snapshot-cleanup.js` (verified to never touch vendor_daily_totals)

**Frontend:**
- ✅ No changes required (uses same API endpoints)
- ✅ VPR trends now show complete history for vendor filters

---

## Support

If issues arise during migration:
1. Check Docker logs: `docker-compose logs -f`
2. Check database: `sqlite3 app/data/hextrackr.db`
3. Verify migration applied: `SELECT name FROM sqlite_master WHERE name='vendor_daily_totals';`
4. Rollback if needed (see Rollback Plan above)

Migration prepared by: Claude Code (Dev Instance)
Migration date: $(date)
Target version: 1.0.67
EOF

# Create checksums
echo "🔒 Creating checksums..."
cd "${PACKAGE_DIR}"
find . -type f -not -path "*/\.*" -exec sha256sum {} \; > CHECKSUMS.txt

# Create archive
echo "📦 Creating archive..."
cd "${PROJECT_ROOT}/.."
tar -czf "${PACKAGE_NAME}.tar.gz" "${PACKAGE_NAME}/"

# Cleanup temp directory
rm -rf "${PACKAGE_DIR}"

echo ""
echo "✅ Deployment package created successfully!"
echo ""
echo "Package: ${PACKAGE_NAME}.tar.gz"
echo "Size:    $(du -h "${PACKAGE_NAME}.tar.gz" | cut -f1)"
echo ""
echo "Next steps:"
echo "1. Review MIGRATION-GUIDE.md in the archive"
echo "2. SCP package to production: scp ${PACKAGE_NAME}.tar.gz lonnie@192.168.1.80:/tmp/"
echo "3. SSH to production and follow migration guide"
echo ""
