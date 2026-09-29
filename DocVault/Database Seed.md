---
tags: []
doc_type: reference
project: hextrackr
source: manual
created: "2026-03-12"
updated: "2026-03-12"
sourceFiles:
  - docs/DATABASE_SEED.md
---

# Database Seed

**Issue**: HEX-348
**Purpose**: Bundle a clean, pre-initialized SQLite database with each release for instant deployments

---

## Overview

HexTrackr ships with a **pre-seeded database file** (`hextrackr.seed.db`) instead of running initialization scripts during deployment. This provides:

- **Instant Deployment**: Copy file instead of running SQL scripts
- **Reliability**: Database validated before release, not during deployment
- **Consistency**: Every install gets identical schema
- **No Script Failures**: Eliminates runtime SQL execution errors
- **Production-Proven**: Seed created from your battle-tested dev database

---

## When to Create a Seed Database

**Create a new seed when:**
1. Preparing for a production release (major/minor version bump)
2. Schema changes were made (new tables, columns, indexes)
3. Default templates were updated
4. Before deploying to a new environment

**Frequency:**
- Every major release
- After significant schema changes
- At minimum, quarterly

---

## Quick Start: 5-Step Seed Creation

```bash
# 1. Backup your dev database
npm run db:backup

# 2. Clear user data via UI
# Settings -> System -> Clear All Data

# 3. Create seed database
npm run db:seed:create

# 4. Restore your dev data
npm run db:restore backups/hextrackr-dev-backup-YYYYMMDD-HHMMSS.db

# 5. Validate seed
npm run db:seed:validate
```

**That's it!** The seed database is ready to commit and deploy.

---

## Detailed Workflow

### Step 1: Backup Your Dev Database (CRITICAL!)

**Always backup first** - this protects your development data.

```bash
npm run db:backup
```

**Output:**
```
Creating backup of hextrackr.db...
Backup created: backups/hextrackr-dev-backup-20251027-154530.db
File size: 156.23 KB
Backup complete!
```

**Important:** Note the backup filename - you'll need it in Step 4!

---

### Step 2: Clear User Data via UI

**Go to the HexTrackr UI:**
1. Log in as admin
2. Click **Settings** (gear icon, top right)
3. Navigate to **System** tab
4. Click **"Clear All Data"** button
5. Confirm the action

**What Gets Cleared:**
- All tickets
- All vulnerabilities (current, snapshots, daily totals)
- All imports
- All audit logs (optional - you can keep these)

**What Gets Preserved:**
- Admin user account
- Email templates
- Ticket templates
- Vulnerability templates
- Database schema (all tables)

---

### Step 3: Create Seed Database

```bash
npm run db:seed:create
```

**The tool will:**
1. Prompt you to confirm backup exists
2. Prompt you to confirm data was cleared
3. Validate database state (table count, admin user, no user data)
4. Copy database to `app/data/hextrackr.seed.db`
5. Run VACUUM to minimize file size (typically 40-100 KB)
6. Generate SHA-256 checksum for integrity validation
7. Display summary with file sizes and next steps

---

### Step 4: Restore Your Dev Data

**IMPORTANT:** Restore your development data immediately after seed creation!

```bash
npm run db:restore backups/hextrackr-dev-backup-20251027-154530.db
```

Replace the filename with the backup from Step 1.

---

### Step 5: Validate Seed Database

```bash
npm run db:seed:validate
```

**7 Validation Tests:**
1. File exists and has reasonable size
2. Checksum matches (integrity check)
3. All required tables present (18+ tables)
4. Admin user exists
5. Templates seeded (email, ticket, vulnerability)
6. No user data present (0 tickets, 0 vulnerabilities)
7. Audit log encryption configured

---

## Optional: Test Fresh Install

**Test the seed database works in a clean environment:**

```bash
# Test with Docker (recommended)
docker run --rm \
  -v $(pwd)/app/data/hextrackr.seed.db:/app/data/hextrackr.db \
  hextrackr

# Verify:
# - App starts successfully
# - Admin login works
# - No errors in console
```

---

## Commit Seed Files

```bash
# Add seed database and checksum to git
git add app/data/hextrackr.seed.db
git add app/data/hextrackr.seed.db.sha256

# Commit with descriptive message
git commit -m "feat: Add seed database for clean installs (HEX-348)"

# Push to repository
git push origin dev
```

---

## Production Deployment

### Fresh Install (No Existing Database)

```bash
# 1. Database is copied from seed automatically
# deploy-hextrackr.sh checks if database exists
# If not found, copies app/data/hextrackr.seed.db -> data/hextrackr.db

# 2. Checksum validated
sha256sum -c app/data/hextrackr.seed.db.sha256

# 3. Permissions set
chown hextrackr:hextrackr data/hextrackr.db
chmod 640 data/hextrackr.db

# 4. App starts with clean database
```

### Upgrade (Existing Database)

```bash
# Seed is NOT used - existing database preserved
# Migrations run automatically if schema changed
npm run db:migrate
```

---

## Safety Features

### Data Loss Prevention

**Multiple Safety Layers:**
1. Tool prompts for backup confirmation
2. Tool prompts for data clearing confirmation
3. Validation checks database state before proceeding
4. Source database (`data/hextrackr.db`) and seed (`app/data/hextrackr.seed.db`) are separate files
5. Tool reminds you to restore dev data immediately after

**You Cannot Lose Data If You:**
- Create backup before clearing (Step 1)
- Restore from backup after seed creation (Step 4)

---

## Troubleshooting

### "Seed database not found" Error

**Cause:** Seed file doesn't exist or is in wrong location

**Fix:**
```bash
# Ensure you're in project root
pwd
# Should output: /Volumes/DATA/GitHub/HexTrackr

# Create seed
npm run db:seed:create
```

### "Checksum mismatch" Error

**Cause:** Seed file was modified after checksum generation

**Fix:**
```bash
# Rebuild seed and checksum
npm run db:seed:create
```

### "Users table is empty" Error

**Cause:** Admin user was deleted during data clearing

**Fix:**
```bash
# Restore dev database
npm run db:restore backups/hextrackr-dev-backup-YYYYMMDD-HHMMSS.db

# Create new admin user via UI (if needed)
# Settings -> Users -> Add User (role: admin)

# Clear ONLY tickets and vulnerabilities (not users!)
# Then rebuild seed
npm run db:seed:create
```

### "Tickets table has rows" Error

**Cause:** User data wasn't fully cleared via UI

**Fix:**
```bash
# Manually clear tickets via SQLite
sqlite3 data/hextrackr.db "DELETE FROM tickets;"
sqlite3 data/hextrackr.db "DELETE FROM vulnerabilities_current;"
sqlite3 data/hextrackr.db "DELETE FROM vulnerability_snapshots;"
sqlite3 data/hextrackr.db "DELETE FROM vulnerability_imports;"

# Rebuild seed
npm run db:seed:create
```

### "File size is large (> 500 KB)" Warning

**Cause:** Seed contains user data or large audit log

**Fix:**
```bash
# Verify user data cleared
sqlite3 app/data/hextrackr.seed.db "SELECT COUNT(*) FROM tickets;"
sqlite3 app/data/hextrackr.seed.db "SELECT COUNT(*) FROM vulnerabilities_current;"

# If counts > 0, restore and re-clear
npm run db:restore backups/hextrackr-dev-backup-YYYYMMDD-HHMMSS.db
# Clear data via UI
npm run db:seed:create
```

---

## File Locations

```
HexTrackr/
├── data/
│   └── hextrackr.db                        # Your dev database (source)
├── app/
│   ├── data/
│   │   ├── hextrackr.seed.db              # Seed database (clean)
│   │   └── hextrackr.seed.db.sha256       # Checksum file
│   └── scripts/
│       ├── build-seed-database.js          # Creation tool
│       └── validate-seed-database.js       # Validation tool
├── backups/
│   └── hextrackr-dev-backup-*.db          # Your backups
└── package.json                            # npm scripts
```

---

## Seed Database Lifecycle

```
Production-Validated Dev Database (data/hextrackr.db)
    |
    | 1. npm run db:backup
    v
Backup Created (backups/hextrackr-dev-backup-YYYYMMDD-HHMMSS.db)
    |
    | 2. Clear data via UI (Settings -> System)
    v
Clean Dev Database (0 tickets, 0 vulns, 1 admin user)
    |
    | 3. npm run db:seed:create
    v
Seed Database Created (app/data/hextrackr.seed.db + checksum)
    |
    | 4. npm run db:restore backups/...
    v
Dev Database Restored (back to normal with all your data)
    |
    | 5. npm run db:seed:validate
    v
Seed Validated - Ready for git commit and deployment
```

---

## Pro Tips

### Before Creating Seed

- **Run on Friday**: Do seed creation at end of week when you have time
- **Test locally first**: Always test seed on local Docker before deploying
- **Multiple backups**: Keep 2-3 recent backups, not just one
- **Verify templates**: Check that email/ticket/vuln templates are up to date

### During Deployment

- **Checksum validation**: Always validate checksum before deploying
- **Keep old seed**: Don't delete previous seed until new one is validated
- **Test admin login**: First thing to test after fresh install

---

## Pre-Deployment Checklist

- [ ] Backed up dev database (`npm run db:backup`)
- [ ] Cleared user data via UI
- [ ] Created seed database (`npm run db:seed:create`)
- [ ] Restored dev data (`npm run db:restore backups/...`)
- [ ] Validated seed (`npm run db:seed:validate` - all tests passed)
- [ ] Tested fresh install (Docker test passed)
- [ ] Committed seed files to git (`hextrackr.seed.db` + `.sha256`)
- [ ] Updated changelog with seed creation note
- [ ] Production deployment script updated (if needed)

---

## FAQ

**Q: Can I skip the backup step?**
A: **NO!** Always backup first. If seed creation fails, you need the backup to restore your data.

**Q: What if I forget to restore my dev data?**
A: Just run `npm run db:restore backups/hextrackr-dev-backup-YYYYMMDD-HHMMSS.db` - it's never too late!

**Q: Can I create seed from production database?**
A: Yes, but dev database is recommended because it's the one you actively develop on. Production database may have user data you don't want in the seed.

**Q: How often should I rebuild the seed?**
A: Every major release, after schema changes, or at minimum quarterly.

**Q: The seed file is in git - isn't that large?**
A: No! After VACUUM, seed is typically 40-100 KB. That's tiny for git. And it's a binary file, so git stores it efficiently.

---

## Related

- [[Database Schema]]
- [[Database Architecture]]
- [[Schema Evolution]]
- [[Data Model]]
