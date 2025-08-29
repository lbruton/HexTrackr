# Changelog

All notable changes to HexTrackr will be documented in this file.

[![Keep a Changelog](https://img.shields.io/badge/Keep%20a%20Changelog-v1.0.0-orange)](https://keepachangelog.com/en/1.0.0/)
[![Semantic Versioning](https://img.shields.io/badge/Semantic%20Versioning-v2.0.0-blue)](https://semver.org/spec/v2.0.0.html)

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned

### Fixed

### Added

- Docs: Dynamic overview statistics loaded from new `/api/docs/stats` endpoint; falls back to existing static counts

  if API unavailable

- Ticket modal enhancements (v1.1.0)
  - XT# read-only field display
  - Site/location separation and validation
  - Status workflow updates (remove In-Progress, add Staged/Failed/Overdue)
  - Drag-drop UX improvements with accessibility features
  - Auto-status updates for overdue tickets

## [1.0.1] - 2025-08-27

### Fixed (2)

- **Device Management UI**: Fixed button order from + - to - + for consistent positioning
  - Resolved button position switching that caused UX friction during rapid clicking
  - Updated both initial template (tickets.html) and dynamic generation (tickets.js)
  - Enables efficient "tap tap tap" workflow without mouse repositioning

### Improved

- **Drag-and-Drop System**: Comprehensive bug fixes for device reordering
  - Fixed drag-to-top insertion logic to work repeatedly
  - Preserved reverse button visibility during drag operations
  - Fixed reverse toggle functionality to properly toggle state
  - Enhanced feedback system to maintain UI consistency during operations

## [1.0.0] - 2025-08-27

### Summary

Stable baseline release of HexTrackr cybersecurity ticket and vulnerability management system.

### Features

- **Dual-Purpose Management System**
  - Ticket management with full CRUD operations
  - Vulnerability tracking and analysis
  - Real-time statistics dashboard

- **Database Management**
  - SQLite backend with 17 tickets and 100,553+ vulnerabilities
  - Comprehensive backup/restore system (ZIP format)
  - CSV import/export functionality
  - Web-based data management (no technical knowledge required)

- **ServiceNow Integration**
  - Configurable ServiceNow instance URL
  - Clickable ticket number links
  - Settings modal configuration

- **User Interface**
  - Bootstrap 5 (tickets) + Tabler.io (vulnerabilities) frameworks
  - Responsive design with modular CSS architecture
  - Dark/light theme support
  - Settings modal with tabbed interface

- **Development Infrastructure**
  - Docker-only deployment with Docker Compose
  - Modular JavaScript architecture (shared/pages separation)
  - Comprehensive documentation system
  - Git-based version control with systematic backups

### Technical Stack

- **Backend**: Node.js/Express with SQLite database
- **Frontend**: HTML5, JavaScript (ES6+), Bootstrap 5, Tabler.io
- **Deployment**: Docker + Docker Compose
- **Storage**: SQLite with localStorage fallback
- **Port**: localhost:8080

### Recent Fixes (Leading to v1.0.0)

- ✅ **Field Mapping Fix**: Resolved backend/frontend field mapping preventing ticket saves
- ✅ **ServiceNow Integration Restoration**: Fixed ID mismatches and exposed global functions
- ✅ **Modular CSS Architecture**: Eliminated font inconsistencies with proper CSS organization
- ✅ **Settings Modal Enhancement**: Added Papa Parse 5.4.1 and JSZip 3.10.1 for robust file handling

### Database Statistics (v1.0.0)

- Tickets: 17 total (9 open, 5 overdue, 8 completed)
- Vulnerabilities: 100,553 total
- Total Records: 100,570

### Known Limitations

- Manual XT# assignment (auto-generation planned for v1.1.0)
- Basic drag-drop interface (accessibility improvements planned)
- Status workflow needs refinement (updates planned for v1.1.0)

---

## Version History Notes

### Pre-v1.0.0 Development

- Extensive data recovery and restoration work
- Multiple architecture improvements and bug fixes
- Database corruption recovery with complete data restoration
- Progressive enhancement of import/export functionality

### Development Methodology

- Git-based development with systematic backup commits
- Docker-only deployment strategy
- Modular code organization (scripts/shared/, scripts/pages/)
- Comprehensive documentation maintenance

---

## Release Process

### Version Numbering

- **Major (X.0.0)**: Breaking changes or major architectural updates
- **Minor (1.X.0)**: New features and enhancements (backward compatible)
- **Patch (1.1.X)**: Bug fixes and minor improvements

### Release Cycle

1. Feature development on main branch with backup commits
2. Version tag creation with comprehensive release notes
3. Docker image updates with version tags
4. Documentation updates and roadmap adjustments
5. GitHub release with change summary

### Development Workflow

- All changes documented with descriptive commit messages
- Pre-work backup commits for safety
- Step-by-step implementation with verification
- Comprehensive testing before version tags
