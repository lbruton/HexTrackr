# ADR-0002: Shields.io Badge Integration and Documentation Auto-Discovery

## Status

Accepted

## Context

The HexTrackr documentation needed visual indicators of compliance with industry standards and a unified system for accessing project management documents scattered across multiple directories. Users needed clear signals that the project follows established conventions like Keep a Changelog and Semantic Versioning, while also having seamless access to roadmaps, sprints, and changelog information from a single navigation interface.

## Decision

We implemented a two-part enhancement to the documentation portal:

### 1. Shields.io Badge Integration

- Added Keep a Changelog and Semantic Versioning badges to CHANGELOG.md
- Enhanced marked.js renderer in `docs-html/html-content-updater.js` to properly handle badge image links
- Badges link to respective standard websites (keepachangelog.com and semver.org)
- Professional visual indicators: orange for Keep a Changelog, blue for Semantic Versioning

### 2. Auto-Discovery Navigation System

- Enhanced `docs-html/js/docs-portal-v2.js` to automatically discover external files
- System scans `/roadmaps/` directory and root-level files like `CHANGELOG.md`
- Renamed `docs-source/project-management/roadmap.md` to `strategic-roadmap.md` to avoid conflicts
- Dynamic navigation expansion under "Project Management" section
- External file loading with proper path resolution using '../' detection

## Consequences

### Positive

- **Professional Appearance**: Documentation now displays industry-standard compliance visually
- **Unified Navigation**: All project management documents accessible from single portal
- **Standards Compliance**: Clear visual indicators of adherence to Keep a Changelog and Semantic Versioning
- **Maintainability**: Auto-discovery means new roadmaps/documents automatically appear in navigation
- **User Experience**: Seamless navigation between internal docs and external project files

### Negative

- **Browser Caching**: Development workflow affected by JavaScript caching (requires hard refresh for updates)
- **Complexity**: Added marked.js renderer complexity for badge processing
- **File Organization**: Requires specific directory structure for auto-discovery to work

### Risks Mitigated

- **Token Handling**: Fixed marked.js renderer to properly process token objects vs parameters
- **Path Resolution**: Robust detection of external files with '../' prefix handling
- **Navigation Conflicts**: Resolved roadmap naming conflicts between internal and external files

## Implementation Notes

### Key Files Modified

- `CHANGELOG.md`: Added shields.io badge markdown
- `docs-html/js/docs-portal-v2.js`: Enhanced with auto-discovery and external file loading
- `docs-html/html-content-updater.js`: Fixed marked.js renderer token handling
- `docs-source/project-management/roadmap.md` → `strategic-roadmap.md`: Renamed to avoid conflicts

### Technical Details

- Shields.io badges use markdown image syntax: `[![Label](URL)](LINK)`
- Auto-discovery scans predefined file lists in both `/roadmaps/` and root directories
- External file loading detects path patterns and fetches content appropriately
- Navigation structure uses collapsible sections with proper expansion logic

## Future Considerations

1. **Cache-Busting**: Implement development-time cache-busting for JavaScript updates
2. **Badge Automation**: Consider automated badge URL generation based on project version
3. **Discovery Enhancement**: Extend auto-discovery to scan directories dynamically
4. **Performance**: Monitor impact of external file loading on page load times

## Related ADRs

- ADR-0001: Memory Backend Selection (established project memory patterns)

---

**Date**: 2025-08-29  
**Authors**: GitHub Copilot with Memento MCP Integration  
**Tags**: documentation, badges, auto-discovery, navigation, marked.js
