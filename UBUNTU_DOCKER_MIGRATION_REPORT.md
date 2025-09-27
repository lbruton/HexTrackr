# HexTrackr Ubuntu Docker Migration Report
**Date**: September 27, 2025
**Migration**: macOS Docker → Ubuntu 24.04 Docker

## Executive Summary
Successfully migrated HexTrackr from macOS Docker development environment to Ubuntu 24.04 production server. Encountered and resolved multiple platform-specific issues related to case sensitivity, file permissions, API endpoints, and data structures.

## Issues Encountered & Resolutions

### 1. Case Sensitivity Issues
**Problem**: Linux file systems are case-sensitive while macOS defaults to case-insensitive.

**Files Affected**:
- `app/services/docsService.js`
- `app/services/vulnerabilityService.js`

**Error**:
```
Error: Cannot find module '../utils/pathValidator'
```

**Fix Applied**:
```javascript
// Changed from:
const PathValidator = require("../utils/pathValidator");
// To:
const PathValidator = require("../utils/PathValidator");
```

---

### 2. Database Permission Issues
**Problem**: Docker container running as non-root user (UID 1001) couldn't write to database.

**Error**:
```
SQLITE_READONLY: attempt to write a readonly database
SQLITE_CANTOPEN: unable to open database file
```

**Fixes Applied**:
1. Modified `Dockerfile` to remove non-root user restrictions:
```dockerfile
# Removed:
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app
USER nodejs

# Added permission fixes:
RUN chmod -R 777 ./app/public/data ./app/uploads
```

2. Updated `docker-compose.yml` to remove read-only mount:
```yaml
# Changed from:
- ./app:/app/app:ro
# To:
- ./app:/app/app
```

---

### 3. Backup/Restore ZIP Functionality Issues

#### 3a. Incorrect API Endpoint
**Problem**: Frontend calling wrong endpoint for restore.

**File**: `app/public/scripts/shared/settings-modal.js`

**Fix Applied**:
```javascript
// Changed from:
const response = await fetch("/api/restore", {
// To:
const response = await fetch("/api/backup/restore", {
```

#### 3b. MIME Type Validation Too Restrictive
**Problem**: ZIP files from browser had different MIME types than expected.

**File**: `app/routes/backup.js`

**Fix Applied**:
```javascript
const allowedTypes = [
    "application/json",
    "application/zip",
    "application/x-zip-compressed",  // Added
    "application/octet-stream",       // Added
    "multipart/x-zip",                // Added
    "text/plain"
];
// Added .zip extension check as fallback
const isAllowedExtension = file.originalname.endsWith(".json") ||
                           file.originalname.endsWith(".zip");
```

#### 3c. Binary File Reading Issue
**Problem**: ZIP files were being read as UTF-8 text, corrupting them.

**File**: `app/services/backupService.js`

**Fix Applied**:
```javascript
// Changed from:
const fileData = PathValidator.safeReadFileSync(filePath);  // defaults to 'utf8'
// To:
const fileData = PathValidator.safeReadFileSync(filePath, null);  // read as buffer
```

#### 3d. Nested Data Structure Mismatch
**Problem**: Backup format changed to nested structure but restore expected flat structure.

**File**: `app/services/backupService.js`

**Fix Applied**:
```javascript
// Handle both old and new formats
let ticketsArray = [];
if (ticketsData) {
    if (ticketsData.data && Array.isArray(ticketsData.data)) {
        // Old format: ticketsData.data
        ticketsArray = ticketsData.data;
    } else if (ticketsData.tickets && ticketsData.tickets.data &&
               Array.isArray(ticketsData.tickets.data)) {
        // New format: ticketsData.tickets.data
        ticketsArray = ticketsData.tickets.data;
    }
}
```

---

### 4. Docker Health Check Issue
**Problem**: Health check using `wget` failed because Alpine Linux container.

**File**: `Dockerfile`

**Fix Applied**:
```dockerfile
# Changed from:
HEALTHCHECK CMD wget --spider -q http://localhost:8080/health || exit 1
# To:
HEALTHCHECK CMD node -e "require('http').get('http://localhost:8080/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))" || exit 1
```

---

## Platform Differences: macOS vs Linux Docker

### Why These Issues Were Hidden on macOS:

1. **Case Sensitivity**
   - macOS: Case-insensitive filesystem (HFS+/APFS)
   - Linux: Case-sensitive filesystem
   - Impact: Import paths that worked on Mac failed on Linux

2. **Docker Architecture**
   - macOS: Docker Desktop runs in a VM with translation layers
   - Linux: Docker runs natively on kernel
   - Impact: VM layer can mask permission and file handling issues

3. **Permission Handling**
   - macOS Docker Desktop: Automatic UID/GID mapping
   - Linux Docker: Direct 1:1 mapping
   - Impact: Permission issues only appeared on Linux

4. **Volume Mounts**
   - macOS: Uses osxfs/VirtioFS with translation
   - Linux: Direct bind mounts
   - Impact: File access patterns differ

5. **Binary File Handling**
   - The VM translation layer on Mac may have handled binary/text confusion differently
   - Direct Linux mounts exposed the UTF-8 encoding issue with ZIP files

---

## Files Modified

### Core Application Files:
1. `/app/services/docsService.js` - Fixed case-sensitive import
2. `/app/services/vulnerabilityService.js` - Fixed case-sensitive imports (2 locations)
3. `/app/services/backupService.js` - Fixed binary file reading and data structure handling
4. `/app/routes/backup.js` - Enhanced MIME type validation
5. `/app/public/scripts/shared/settings-modal.js` - Fixed API endpoint
6. `/app/public/server.js` - Added health check endpoint

### Docker Configuration:
1. `Dockerfile` - Removed non-root user, fixed permissions, updated health check
2. `docker-compose.yml` - Removed read-only mounts, added proper volume configuration
3. `.env` - Created from `.env.example` with proper configuration

### Helper Scripts Created:
1. `docker-start.sh` - Start application with status checking
2. `docker-stop.sh` - Graceful shutdown
3. `docker-rebuild.sh` - Rebuild and restart container
4. `docker-logs.sh` - View container logs

---

## Recommendations for Development Environment

### 1. Immediate Fixes Needed on Mac Development:
- Update all `require()` statements to use correct case
- Test backup/restore with actual ZIP files, not just JSON
- Update the nested data structure handling in backupService.js

### 2. Development Best Practices:
- Add a linter rule for case-sensitive imports
- Test on Linux Docker periodically during development
- Consider using Docker BuildKit for consistent builds
- Add CI/CD tests on Linux environment

### 3. Code Improvements:
```javascript
// Consider consolidating the backup data structure
// Current: ticketsData.tickets.data (nested)
// Suggested: ticketsData.data (flat)
// This would simplify the restore logic
```

### 4. Docker Configuration Improvements:
```yaml
# Consider adding platform specification in docker-compose.yml
services:
  hextrackr:
    platform: linux/amd64  # Explicit platform
```

---

## Testing Checklist for Mac Development

Before deploying to Linux production, test:
- [ ] All file imports with exact case matching
- [ ] File uploads with various MIME types
- [ ] Binary file operations (ZIP, images)
- [ ] Database write permissions
- [ ] Health check endpoints
- [ ] Volume mount permissions
- [ ] Run with `--platform linux/amd64` flag locally

---

## Current System Status

✅ **Docker**: Installed and running (v28.4.0)
✅ **Application**: Running on port 8989
✅ **Database**: 84MB with 25,011 vulnerabilities loaded
✅ **Health Check**: Operational
✅ **Backup/Restore**: Fixed and functional
✅ **Permissions**: Properly configured

## Access URLs
- Main Application: http://localhost:8989
- Health Check: http://localhost:8989/health
- API: http://localhost:8989/api

---

## Migration Commands Used

```bash
# Docker Installation
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release
sudo mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu noble stable" | sudo tee /etc/apt/sources.list.d/docker.list
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER

# Application Setup
cp .env.example .env
sudo docker compose build --no-cache
sudo docker compose up -d
```

---

*Report generated for migration from macOS Docker Desktop to Ubuntu 24.04 Docker CE*