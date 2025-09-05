# Changelog

All notable changes to HexTrackr will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### In Progress - Phase 2: JavaScript Modularization

- **ModernVulnManager Refactoring**: Splitting 2,429-line class into 8 widget-ready modules
- **Widget Architecture Foundation**: Establishing standards for future dashboard platform
- **AI Development Optimization**: All modules targeting <400 lines for context compatibility

### Planned - v1.0.6

- **Documentation Sprint Resumption**: Complete API overview and user guides after modularization
- **Dashboard Implementation**: Begin widget-based customizable dashboard development
- **Ticket System Modularization**: Apply lessons learned to tickets.js refactoring

## [1.0.5] - 2025-09-05

### Added

- **JavaScript Modularization Architecture**: Established foundation for widget-based dashboard development
  - Created `/dev-docs/architecture/` documentation system with symbol tables and module boundaries
  - Implemented unified AI development workflow with Memento MCP and PAM integration
  - Designed comprehensive dashboard vision for drag-drop widget customization

- **PaginationController Module**: Successfully extracted first reusable component (216 lines)
  - Reduced vulnerability-manager.js from 2,614 to 2,429 lines (185 line reduction)
  - Established modularization patterns for future extractions
  - Validated zero-regression refactoring process

### Enhanced

- **Development Workflow**: Synchronized agent instruction files across all AI tools
  - Updated CLAUDE.md, copilot-instructions.md, GEMINI.md, AGENTS.md with delegation strategies
  - Implemented session handoff system for non-memory AI tools
  - Created architectural documentation for coordinated development

- **Project Documentation**: Updated roadmap and sprint priorities to reflect modularization focus
  - Moved JavaScript refactoring to top priority status
  - Deferred documentation sprint until modularization completion
  - Established 4-week Phase 2 timeline for ModernVulnManager splitting

## [1.0.4] - 2025-09-05

### Added (2)

- **UI Design Specialist Agent Enhancement**: Integrated Playwright MCP for live browser testing and visual validation
  - Enhanced agent capabilities with real-time browser automation for design verification
  - Added comprehensive visual testing for UI improvements and changes
  - Implemented before/after screenshot comparison for design changes

### Fixed

- **Version Badge Synchronization**: Fixed version inconsistency across application components
  - Resolved version badge displaying v1.0.1 while package.json showed v1.0.3
  - Enhanced version-manager.js to include footer badge URL synchronization
  - Added automated version sync command: `node scripts/version-manager.js <new-version>`
  - Implemented production safety with timestamped backups and comprehensive file manifest

- **Modal Layering Bug**: Fixed critical modal interaction issue in vulnerability management
  - Resolved hostname links within vulnerability modal opening device modal behind existing modal
  - Added proper Bootstrap Modal.getInstance() check to close existing modals before opening new ones
  - Implemented clean modal transitions: vulnerability modal → closes → device modal opens
  - Comprehensive Playwright testing confirms smooth modal workflows without layering issues

- **Table Resizing and Pagination**: Implemented working table resizing and card pagination system
  - Added responsive table column resizing functionality
  - Implemented complete pagination system with 6-card default for optimal viewing
  - Fixed incomplete pagination code that previously broke card display functionality
  - Restored comprehensive card functionality across all views

### Enhanced (2)

- **User Experience Improvements**
  - Professional modal behavior with proper state management
  - Improved visual consistency with synchronized version badges across all components
  - Enhanced table interaction with responsive design and pagination controls
  - Streamlined vulnerability-to-device navigation workflow

### Technical Improvements

- **Agent Architecture**: Enhanced documentation and testing agents with advanced MCP integrations
  - Added Playwright MCP for live browser validation of UI changes
  - Integrated Memento MCP for persistent knowledge management across development sessions
  - Improved documentation pipeline with automated visual verification

- **Version Management**: Comprehensive version synchronization system
  - Enhanced version-manager.js with footer badge support and backup safety
  - Added regex pattern matching for badge URL updates: `/HexTrackr-v[\\d.]+(-blue\\?style=flat)/g`
  - Implemented automated backup system with timestamps and rollback capabilities

## [1.0.3] - 2025-09-03

### Fixed (2)

- **Documentation Accuracy**: Comprehensive documentation review and fixes
  - Updated API reference to include missing `/api/restore` endpoint
  - Clarified difference between `/api/vulnerabilities/import` and `/api/import/vulnerabilities` endpoints
  - Fixed formatting and consistency issues across documentation
  - Ensured all user guides are complete and accurate

### Enhanced (3)

- **Documentation Improvements**:
  - Added explanatory section on import API options
  - Expanded backup and restore documentation with clearer examples
  - Improved navigation and cross-references between related documentation

### Enhanced (Infrastructure)

- **Documentation Infrastructure**: Enhanced automation and quality assurance
  - Improved documentation generation pipeline with AI-powered analysis
  - Added comprehensive documentation review standards and metrics
  - Enhanced cross-reference validation and content accuracy checking

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
