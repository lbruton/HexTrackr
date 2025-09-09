# Documentation Portal Rebuild Specification

**Branch**: 022-documentation-portal-rebuild  
**Created**: 2025-09-09  
**Status**: Draft

## Overview

The HexTrackr documentation portal requires a complete rebuild to eliminate redundancy, integrate with spec-kit workflow, and provide a modern, maintainable documentation system that dynamically generates content from markdown sources.

## Problem Statement

### Current Issues

1. **Redundant Documentation**: SPRINT.md duplicates spec-kit tasks, causing maintenance overhead and drift risk
2. **Static HTML Generation**: Current portal uses manual HTML generation with outdated styling
3. **Inconsistent Styling**: Documentation portal doesn't match main application's Tabler.io design
4. **Poor Navigation**: No collapsible sections or dynamic category generation
5. **Scattered Sources**: Documentation lives in multiple locations (docs-source/, SPRINT.md, specs/)

### User Impact

- Developers struggle to find current task status (SPRINT.md vs spec-kit confusion)
- Documentation updates require manual HTML regeneration
- Navigation is flat and overwhelming with 30+ pages
- No unified view of active development work

## Requirements

### Functional Requirements

#### FR1: Dynamic Content Generation

- System MUST dynamically generate HTML pages from markdown files in docs-source/
- System MUST auto-detect new markdown files without configuration changes
- System MUST preserve existing URL structure for backward compatibility
- System MUST support hot-reload during development

#### FR2: Unified Navigation

- System MUST generate collapsible navigation categories from folder structure
- System MUST highlight current page in navigation
- System MUST support multi-level navigation (categories → subcategories → pages)
- System MUST remember navigation state (expanded/collapsed) across page loads

#### FR3: Spec-Kit Integration  

- System MUST display current active spec from hextrackr-specs/
- System MUST show task progress from active spec's tasks.md
- System MUST replace SPRINT.md with dynamic spec-kit task view
- System MUST maintain links to full spec documentation

#### FR4: Special Pages

- System MUST generate CHANGELOG page from CHANGELOG.md
- System MUST generate ROADMAP page from ROADMAP.md  
- System MUST generate ACTIVE TASKS page from current spec's tasks.md
- System MUST provide search functionality across all documentation

#### FR5: Shared Components

- System MUST use existing HexTrackr header component
- System MUST use existing HexTrackr footer component
- System MUST use existing authentication/session management
- System MUST use existing settings modal

### Non-Functional Requirements

#### NFR1: Performance

- Page load time MUST be < 500ms for cached content
- Initial documentation index MUST load < 2 seconds
- Search results MUST return < 200ms

#### NFR2: Maintainability  

- System MUST use single source of truth (markdown files only)
- System MUST require zero configuration for new pages
- System MUST support standard markdown with GFM extensions
- System MUST provide clear error messages for invalid markdown

#### NFR3: Design Consistency

- System MUST use Tabler.io CSS framework
- System MUST match HexTrackr color scheme and typography
- System MUST be fully responsive (mobile, tablet, desktop)
- System MUST support dark mode (future consideration)

#### NFR4: Developer Experience

- System MUST provide npm script for local development
- System MUST support markdown linting and validation
- System MUST generate sitemap for documentation
- System MUST provide broken link detection

## User Stories

### Story 1: Developer Finding Current Tasks

**As a** developer working on HexTrackr  
**I want to** see the current active development tasks  
**So that I** know what needs to be worked on without checking multiple files

**Acceptance Criteria:**

- [ ] Single "Active Development" page shows current spec and tasks
- [ ] Tasks show completion status (pending/in-progress/completed)
- [ ] Links provided to full spec documentation
- [ ] No need to check SPRINT.md anymore

### Story 2: Documentation Contributor

**As a** documentation contributor  
**I want to** add new documentation by creating markdown files  
**So that I** don't need to understand HTML generation

**Acceptance Criteria:**

- [ ] Create .md file in docs-source/ automatically appears in portal
- [ ] Folder structure determines navigation categories
- [ ] Front matter (optional) controls page metadata
- [ ] Changes visible immediately in development mode

### Story 3: End User Browsing Docs

**As an** end user reading documentation  
**I want to** navigate through organized categories  
**So that I** can find relevant information quickly

**Acceptance Criteria:**

- [ ] Collapsible navigation sections for each category
- [ ] Visual indicators for expanded/collapsed state  
- [ ] Breadcrumb navigation on each page
- [ ] Search bar to find content across all pages

## Technical Constraints

### Integration Requirements

- MUST integrate with existing Express.js server (no new server)
- MUST work within Docker container environment
- MUST use existing SQLite database for any persistent state
- MUST respect existing authentication middleware

### Migration Requirements  

- MUST provide migration path for existing docs-source/ content
- MUST maintain URL compatibility (redirects if needed)
- MUST preserve git history during folder moves
- MUST update all references in existing code

### Security Requirements

- MUST sanitize markdown to prevent XSS attacks
- MUST validate file paths to prevent directory traversal
- MUST respect existing authentication for admin pages
- MUST not expose system files through documentation routes

## Success Metrics

### Quantitative Metrics

- Documentation update time reduced from 10 minutes to < 1 minute
- Navigation click depth reduced by 50% (measured via analytics)
- Page load time < 500ms (measured via performance API)
- Zero duplicate documentation sources

### Qualitative Metrics  

- Developer feedback on task visibility (survey)
- Documentation contributor ease of use (interviews)
- End user navigation satisfaction (feedback form)
- Reduced confusion about current development status

## Out of Scope

The following items are explicitly OUT of scope for this specification:

- Full-text search implementation (future enhancement)
- Dark mode support (future enhancement)
- Multi-language documentation (not needed currently)
- PDF generation from markdown (not requested)
- Version history/git integration in UI (use git directly)
- Comment system or feedback widgets (not needed)
- Analytics beyond basic metrics (future consideration)

## Dependencies

### External Dependencies

- Tabler.io CSS framework (already in project)
- Marked.js or similar markdown parser
- Prism.js for syntax highlighting (already in project)
- Express.js server (existing)

### Internal Dependencies  

- Shared header/footer components must be modularized
- Settings modal must be accessible from docs
- Authentication middleware must be available
- Existing routes must not conflict

## Risks and Mitigations

### Risk 1: URL Breaking Changes

**Risk**: Existing documentation links break  
**Mitigation**: Implement 301 redirects for any URL changes

### Risk 2: Performance with Large Docs

**Risk**: Many markdown files slow down the portal  
**Mitigation**: Implement caching and lazy loading

### Risk 3: Markdown Rendering Differences

**Risk**: Markdown renders differently than expected  
**Mitigation**: Use same parser as GitHub (marked.js with GFM)

## Open Questions

[NEEDS CLARIFICATION] Should search functionality be included in initial version or deferred?

[NEEDS CLARIFICATION] Should we support custom page ordering or rely on alphabetical?

[NEEDS CLARIFICATION] Should breadcrumbs be generated from folder structure or front matter?

[NEEDS CLARIFICATION] Do we need to support images/assets in documentation?

## Appendix

### Current Documentation Structure

```
docs-source/
├── api-reference/
│   ├── backup-api.md
│   ├── tickets-api.md
│   └── vulnerabilities-api.md
├── architecture/
│   ├── backend.md
│   ├── database.md
│   └── frontend.md
├── getting-started/
│   └── index.md
├── user-guides/
│   ├── ticket-management.md
│   └── vulnerability-management.md
├── CHANGELOG.md
├── ROADMAP.md
└── SPRINT.md (to be deprecated)
```

### Proposed Structure

```
hextrackr-specs/
├── docs-source/          # Moved from /public/
│   └── [existing structure minus SPRINT.md]
├── specs/
│   ├── 001-javascript-module-extraction/
│   └── 002-documentation-portal-rebuild/
└── generated/
    └── active-tasks.md   # Auto-generated from current spec
```
