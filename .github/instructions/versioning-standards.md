# Versioning Standards

## HexTrackr Versioning System

HexTrackr follows established industry standards for version management and changelog documentation.

## Semantic Versioning (SemVer 2.0.0)

### Version Format: MAJOR.MINOR.PATCH

- **MAJOR**: Incompatible API changes
- **MINOR**: Added functionality (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Current Version: 1.0.2

### Version Increment Guidelines

- **Patch (1.0.2 → 1.0.3)**: Bug fixes, security patches, minor improvements
- **Minor (1.0.2 → 1.1.0)**: New features, enhanced functionality, new endpoints
- **Major (1.0.2 → 2.0.0)**: Breaking changes, API restructuring, major architecture changes

## Keep a Changelog (v1.0.0)

### Changelog Format

All notable changes are documented in `CHANGELOG.md` following Keep a Changelog principles:

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be-removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Vulnerability fixes

### Example Entry Format

```markdown

## [1.0.2] - 2024-01-15

### Added

- New vulnerability import functionality
- Enhanced security scanning

### Fixed

- Fixed file upload validation
- Resolved memory leak in CSV processing

### Security

- Updated dependencies with security patches

```

## Release Process

### Pre-Release Checklist

1. **Code Quality**: Maintain <50 Codacy issues
2. **Security**: Zero critical/high vulnerabilities
3. **Testing**: All Playwright tests passing
4. **Documentation**: Updated API docs and user guides

### Version Update Process

1. Update version in `package.json`
2. Add entry to `CHANGELOG.md`
3. Create git tag with version number
4. Deploy to production environment

### Tagging Convention

- Format: `v1.0.2` (with 'v' prefix)
- Annotated tags with release notes
- Consistent with GitHub releases

## Documentation Versioning

### Version References

- Main documentation includes current version
- API documentation specifies supported versions
- Migration guides for major version changes

### Backward Compatibility

- Maintain compatibility for at least one major version
- Deprecation warnings before removing features
- Clear migration paths for breaking changes

## Security Versioning

### Security Patches

- **Critical/High**: Immediate patch release
- **Medium**: Next scheduled minor release
- **Low**: Next major release cycle

### Vulnerability Disclosure

- Follow responsible disclosure practices
- Document security fixes in changelog
- Provide upgrade recommendations

## Branch Strategy

### Version Branches

- **main**: Current stable version
- **develop**: Next minor version development
- **hotfix/**: Emergency patches for current version
- **feature/**: New features for next version

### Release Branches

- Created from develop for release preparation
- Merged to main and tagged for release
- Back-merged to develop for continued development
