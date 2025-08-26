# Deprecated Development Files - August 26, 2025

This folder contains all the temporary fix folders, test files, and development artifacts that were used during the HexTrackr development process leading up to the stable v2.0 release.

## Contents Moved Here:

### Fix Folders (Development Artifacts)
- **htmlfixes/** - Responsive layout CSS and HTML fixes
- **javascriptfixes/** - JavaScript migration planning and analysis  
- **cssfixes/** - CSS styling improvements and tests
- **testscripts/** - Validation utilities and test functions
- **backup-tests/** - Sprint testing backups and regression tests

### Individual Fix Files
- **fixes_responsive_layout.css** - Responsive design CSS improvements
- **fixes_responsive_layout.html** - Layout testing HTML
- **fixes_responsive_layout.js** - JavaScript responsive fixes
- **api_update_queries.sql** - Database update scripts
- **safe_migration.sql** - Migration safety scripts
- **codextasks.txt** - CodeX automation task list
- **generate_large_sample.py** - Test data generation script

### Archive Folders
- **archived-roadmaps/** - Old roadmap versions before consolidation

## Why These Were Moved:

1. **Clean Workspace**: Keep active development folder clean and organized
2. **Prevent Confusion**: Avoid mixing deprecated fixes with current codebase
3. **Historical Reference**: Preserve development artifacts for reference
4. **Best Practices**: Follow project organization standards

## Current Active Structure:

After cleanup, the active workspace contains only:
- Core application files (tickets.html, vulnerabilities.html, server.js)
- Production JavaScript (tickets.js, vulnerabilities.js)
- Current documentation (roadmaps/, docs/)
- Active database and configuration files
- Official Docker deployment files

## Development Status:

These files were moved after completing:
- ✅ Time-series database migration
- ✅ Clear Data button bug fix  
- ✅ JavaScript architecture reorganization
- ✅ Responsive layout improvements
- ✅ Production data import (75,407 vulnerabilities)

**Date Moved**: August 26, 2025  
**Moved By**: Development team cleanup process  
**Next Phase**: Live Tracking vs Scheduled Snapshots implementation
