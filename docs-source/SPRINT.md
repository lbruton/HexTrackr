# HexTrackr v1.0.4 Combined Sprint

## Overview

Comprehensive plan combining documentation updates with critical UI performance improvements for v1.0.4 release. This sprint addresses both the documentation gap identified by docs-portal-maintainer assessment and the card pagination performance issues in the vulnerability management interface.

## Pre-Work Completed

- ✅ Documentation assessment completed
- ✅ docs-temp/ folder reviewed (24 files with substantial content ready to integrate)
- ✅ Card pagination requirements specified (6/12/24/48 options for 3-card rows)
- ✅ Performance issue identified (infinite card rendering)

## Sprint Goals

1. Fix all critical documentation issues for v1.0.4 release
2. Integrate useful content from docs-temp/ folder
3. Implement card pagination system to resolve performance issues
4. Ensure version consistency across all documentation
5. Create missing user guides and API documentation

---

## Phase 1: Critical Issues (Day 1) - Must Complete

### API Documentation Updates

- [ ] **Create API overview.md**
  - Location: `docs-source/api-reference/overview.md`
  - Document: `/health`, `/docs-html`, `/` endpoints
  - Source: Check docs-temp/ for existing API content to merge

- [ ] **Review and update existing API docs**
  - Check docs-temp/api-reference/ files against docs-source/
  - Merge any new or updated endpoint documentation
  - Ensure all server.js endpoints are documented

### Missing User Guide Files

- [ ] **Create data-import-export.md**
  - Location: `docs-source/user-guides/data-import-export.md`
  - Check docs-temp/ for existing content to use as base
  - Cover CSV import, JSON import, and export functionality

- [ ] **Create backup-restore.md**
  - Location: `docs-source/user-guides/backup-restore.md`
  - Document database backup/restore procedures
  - Include data export/import via API endpoints

### Version Consistency

- [ ] **Update CHANGELOG.md**
  - Add v1.0.4 section with recent changes
  - Ensure consistency with package.json version

- [ ] **Update package.json version**
  - Bump to 1.0.4 if not already done
  - Ensure all references match

---

## Phase 2: High Priority Fixes (Day 2)

### Fix Broken References

- [ ] **Update index.md**
  - Fix version reference from "v1.0.1" to current version
  - Remove broken `/content/project-management/` references
  - Update navigation links

- [ ] **Correct ticket documentation**
  - Location: `docs-source/user-guides/ticket-management.md`
  - Fix XT# generation description (manual vs auto)
  - Align with actual current behavior

### Documentation Structure

- [ ] **Review docs-temp integration opportunities**
  - Identify files that can be directly moved
  - Plan merges for existing files
  - Note gaps that still need addressing

---

## Phase 3: Essential Additions (Day 3)

### Root Documentation

- [ ] **Create README.md**
  - Location: Project root `/README.md`
  - Include quick start instructions
  - Point to documentation portal
  - Add badges for version, build status

### Configuration Documentation

- [ ] **Create configuration guide**
  - Location: `docs-source/development/configuration.md`
  - Cover environment variables
  - ServiceNow integration setup
  - File upload limits and settings

### Testing Documentation

- [ ] **Add testing guide**
  - Location: `docs-source/development/testing.md`
  - Playwright setup and execution
  - Docker restart requirement
  - Test writing guidelines

---

## Phase 4: UI Performance Improvements

### Card Pagination System

- [ ] **Add pagination to Device Cards**
  - Location: `vulnerabilities.html` - Device Cards section (#deviceCards)
  - Implement pagination controls for 3-card row layout
  - Options: 6, 12, 24, 48 cards per page (multiples of 3)
  - Default: 6 cards per page
  - Fix infinite card rendering performance issue

- [ ] **Add pagination to Vulnerability Cards**
  - Location: `vulnerabilities.html` - Vulnerability Cards section (#vulnerabilityCards)
  - Implement matching pagination system
  - Same options: 6, 12, 24, 48 cards per page
  - Consistent UI with Device Cards pagination

- [ ] **Create PaginationController component**
  - Location: `scripts/shared/pagination-controller.js`
  - Reusable pagination logic for card views
  - Handle page navigation, size changes, and state management
  - Integrate with existing card rendering functions

### Performance Optimization

- [ ] **Fix infinite card rendering issue**
  - Identify root cause of continuous card creation
  - Implement proper card lifecycle management
  - Add performance monitoring for card operations

### Core Engine Improvements (Future Considerations)

- [ ] **Hostname normalization enhancement**
  - Note: Planned improvement for normalizeHostname() function
  - Better handling of edge cases and subdomain variations
  - Deferred to future sprint for full testing

- [ ] **Dual Y-axis chart visualization**
  - Note: Advanced charting enhancement planned
  - Implementation requires Chart.js version evaluation
  - Deferred to maintain focus on critical performance issues

---

## Phase 5: Quality Assurance

### Documentation Pipeline

- [ ] **Run documentation generation**

  ```bash
  npm run docs:analyze
  npm run docs:generate
  npm run lint:md
  ```

### Review and Validation

- [ ] **Cross-reference with codebase**
  - Verify all documented endpoints exist in server.js
  - Check database schema matches documentation
  - Validate code examples work

- [ ] **Test documentation portal**
  - Ensure all links work
  - Verify navigation functions properly
  - Check responsive design

---

## Files from docs-temp/ to Review and Integrate

### Direct Moves (5 files)

- `troubleshooting.md` → `docs-source/user-guides/`
- `roadmap.md` → `docs-source/`
- `testing.md` → `docs-source/development/`
- `deployment.md` → `docs-source/development/`
- `changelog-detailed.md` → merge with existing `CHANGELOG.md`

### Files Needing Merge/Update

- Multiple API reference files
- Architecture documentation updates
- Enhanced security documentation
- Updated getting started guides

---

## Success Criteria

### Must Have for v1.0.4 Release

- ✅ All broken references fixed
- ✅ Missing API endpoints documented  
- ✅ User guide files exist and are complete
- ✅ Version consistency across all files
- ✅ README.md created

### Should Have

- ✅ docs-temp/ content integrated where valuable
- ✅ Configuration documentation complete
- ✅ Testing documentation available
- ✅ Documentation pipeline runs cleanly

### Nice to Have

- Enhanced API response examples
- Architecture diagrams
- Expanded security documentation

---

## Notes

- Focus on accuracy over completeness for v1.0.4
- docs-temp/ folder contains substantial work already done
- Use `npm run docs:generate` after each major change
- Test documentation portal locally before considering complete

## Estimated Time

- Phase 1: 2-3 hours (Documentation Integration)
- Phase 2: 1-2 hours (High Priority Fixes)
- Phase 3: 1-2 hours (Essential Additions)
- Phase 4: 2-3 hours (UI Performance Improvements)
- Phase 5: 30 minutes (Quality Assurance)

**Total: 6.5-10.5 hours** (perfect for a full development session)
