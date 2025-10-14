# Deployment Workflow

**Last Updated**: 2025-10-14

## Deployment Philosophy

**Test Production** (Ubuntu server 192.168.1.80) is a **single-user testing environment**, NOT public production. It serves three purposes:

1. **Daily use**: Real-world testing with actual vulnerability data
2. **Pre-release validation**: Final testing before potential public release
3. **Stable fallback**: Ensures at least one working version exists

**User (Lonnie)**: Network engineer who uses HexTrackr daily for day job. Management approval pending for team rollout.

## Environment Overview

| Environment | Hardware | Purpose | Claude Instance | Deployment Method |
|------------|----------|---------|----------------|-------------------|
| **Development** | Mac M4 Mac Mini | Primary development | Claude Code | `npm run dev` (nodemon) |
| **Test Production** | N100 Mini PC (Proxmox/Ubuntu VM) | Pre-release testing | claude-prod | SCP bundle → Docker restart |

## Normal Deployment (Recommended)

**Use for**: Regular releases, feature deployments, multiple file changes

### Workflow

1. **Commit changes** to dev branch on Mac development environment
   ```bash
   git add .
   git commit -m "feat: description"
   git push origin dev
   ```

2. **GitHub Codacy review** (automatic webhook, 1-5 minutes)
   - Dashboard: https://app.codacy.com/gh/Lonnie-Bruton/HexTrackr-Dev/dashboard
   - Tools: ESLint, Trivy (security), Pylint, Lizard

3. **Create deployment bundle** (tar/zip of changed files)
   ```bash
   # Option 1: Specific files
   tar -czf hextrackr-v1.0.66.tar.gz \
     app/services/databaseService.js \
     app/services/cacheService.js \
     app/controllers/vulnerabilityController.js

   # Option 2: All uncommitted changes
   git diff --name-only | tar -czf deployment-$(date +%Y%m%d).tar.gz -T -

   # Option 3: All changes since last tag
   git diff v1.0.65..HEAD --name-only | tar -czf v1.0.66-delta.tar.gz -T -
   ```

4. **SCP bundle to Ubuntu** test production server
   ```bash
   scp hextrackr-v1.0.66.tar.gz user@192.168.1.80:/path/to/HexTrackr/
   ```

5. **SSH to server**, claude-prod unzips bundle
   ```bash
   ssh user@192.168.1.80
   cd /path/to/HexTrackr
   tar -xzf hextrackr-v1.0.66.tar.gz
   rm hextrackr-v1.0.66.tar.gz
   ```

6. **claude-prod restarts Docker** containers
   ```bash
   docker-compose restart
   ```

7. **Test** on https://hextrackr.com

### Advantages
- Version controlled
- Codacy quality gate
- Atomic deployments
- Full changelog in git history

---

## Hotfix Deployment (Emergency Only)

**Use for**: Critical bugs, production-down scenarios, 1-3 file changes

**⚠️ WARNING**: Bypasses version control and code review. Always commit hotfix afterward.

### Workflow

1. **SSH to Ubuntu** test production server
   ```bash
   ssh user@192.168.1.80
   cd /path/to/HexTrackr
   ```

2. **Create .bak copies** of files to be changed
   ```bash
   cp app/services/databaseService.js app/services/databaseService.js.bak
   cp app/services/cacheService.js app/services/cacheService.js.bak
   ```

3. **SCP individual files** directly to server
   ```bash
   # From Mac
   scp app/services/databaseService.js user@192.168.1.80:/path/to/HexTrackr/app/services/
   scp app/services/cacheService.js user@192.168.1.80:/path/to/HexTrackr/app/services/
   ```

4. **Restart Docker** and test changes
   ```bash
   docker-compose restart

   # Test immediately
   curl -k https://localhost/health
   ```

5. **Rollback if issues occur**
   ```bash
   mv app/services/databaseService.js.bak app/services/databaseService.js
   docker-compose restart
   ```

6. **Later: Commit hotfix** to dev branch for version control
   ```bash
   # On Mac
   git add app/services/databaseService.js
   git commit -m "hotfix: emergency fix for [issue]"
   git push origin dev
   ```

### Advantages
- Fast deployment (5-10 minutes)
- Easy rollback with .bak files
- No dependency on git/GitHub

### Disadvantages
- Bypasses code review
- Manual process (error-prone)
- Must remember to commit later

---

## Development Commands

### Mac Development Environment

```bash
# Start production server
npm start                         # Port 8080 (behind nginx)

# Development with auto-reload
npm run dev                       # Uses nodemon

# Initialize database (DESTRUCTIVE - only for fresh installs)
npm run init-db

# Version management (2-step process)
# 1. Manual: Edit package.json version + create changelog
vim package.json                  # Change version
vim app/public/docs-source/changelog/versions/X.X.X.md

# 2. Automated: Sync version + generate docs
npm run release                   # Syncs to 5 files + generates 79 HTML docs

# Code quality
npm run lint:all                  # All linters (markdown, ESLint, stylelint)
npm run fix:all                   # Auto-fix all issues

# Documentation
npm run docs:generate             # Generate HTML docs from markdown
npm run docs:dev                  # Generate JSDoc API reference
npm run docs:all                  # Generate both
```

### Docker Management

```bash
# Management scripts
./docker-start.sh                 # Start containers
./docker-stop.sh                  # Stop containers
./docker-rebuild.sh               # Rebuild and restart
./docker-logs.sh                  # Follow logs

# Raw docker-compose
docker-compose up -d              # Start detached
docker-compose logs -f            # Follow logs
docker-compose restart            # Restart after code changes
docker-compose down               # Stop and remove containers
```

**Container Architecture**:
- `hextrackr-app`: Node.js application (8989:8080)
- `hextrackr-nginx`: Reverse proxy with SSL termination (80:80, 443:443)

---

## Version Automation

**Source of Truth**: Root `package.json` version field

**Auto-Synced Files** (via `npm run release`):
1. `app/public/package.json`
2. `app/public/scripts/shared/footer.html`
3. `README.md`
4. `docker-compose.yml` (HEXTRACKR_VERSION env var)
5. `app/public/server.js` (reads from env var)

**NEVER manually edit version in these files** - always edit root `package.json` and run `npm run release`.

### Changelog Process

```bash
# 1. Create new version changelog
vim app/public/docs-source/changelog/versions/1.0.66.md

# 2. Document changes
# - New Features
# - Improvements
# - Bug Fixes
# - Performance
# - Technical Details

# 3. Update version in package.json
vim package.json  # Update "version": "1.0.66"

# 4. Run release automation
npm run release  # Syncs version + generates docs

# 5. Commit and deploy
git add .
git commit -m "chore(release): v1.0.66"
git push origin dev
```

---

## Database Operations

### Safe Migration Pattern

```bash
# 1. Create migration file
echo "ALTER TABLE vulnerabilities ADD COLUMN new_field TEXT;" > \
  app/public/scripts/migrations/008-add-new-field.sql

# 2. Apply manually
sqlite3 app/data/hextrackr.db < \
  app/public/scripts/migrations/008-add-new-field.sql

# 3. Update init-database.js schema for fresh installs
vim app/public/scripts/init-database.js
```

### NEVER Run on Existing Database

```bash
# ❌ DESTROYS ALL DATA
npm run init-db

# Git hooks will block commits that change init-database.js
# to prevent accidental data loss
```

---

## Git Hooks

Hooks are auto-installed via `.githooks/`:

```bash
# Install hooks
npm run hooks:install             # Sets core.hooksPath to .githooks

# Pre-commit behavior
# ✅ Auto-fixes: Markdown, CSS (safe formatting only)
# ⚠️  Warns: ESLint issues (requires manual review)
# 🛡️  Blocks: init-database.js commits (data loss prevention)

# Bypass hooks (emergency only)
git commit --no-verify -m "emergency: critical hotfix"
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing locally
- [ ] ESLint/stylelint clean (`npm run lint:all`)
- [ ] Documentation updated (if API/features changed)
- [ ] Changelog created (new version)
- [ ] Version bumped in `package.json`
- [ ] Committed to dev branch
- [ ] Pushed to GitHub
- [ ] Codacy review passed

### Deployment
- [ ] Create deployment bundle (tar/zip)
- [ ] SCP to test production server
- [ ] SSH and extract bundle
- [ ] Restart Docker containers
- [ ] Verify health endpoint: `curl -k https://localhost/health`
- [ ] Test critical flows (login, vulnerability load, import)

### Post-Deployment
- [ ] Monitor Docker logs: `docker-compose logs -f`
- [ ] Check browser console for errors
- [ ] Verify performance (load times, query speeds)
- [ ] Test on real use case (import CSV, generate reports)
- [ ] Tag release in git: `git tag v1.0.66 && git push origin v1.0.66`

### Rollback (If Issues)
- [ ] SSH to server
- [ ] Restore .bak files (if hotfix) or previous bundle
- [ ] Restart Docker: `docker-compose restart`
- [ ] Verify rollback successful
- [ ] Investigate issue in dev environment
- [ ] Fix and re-deploy

---

**Related Documentation**:
- Environment: `/docs/ENVIRONMENT_ARCHITECTURE.md`
- Code Patterns: `/docs/DEVELOPMENT_PATTERNS.md`
- MCP Tools: `/docs/MCP_TOOLS.md`
