# Project Architecture Analysis

*Generated automatically from FileScopeMCP analysis on 2025-08-31*

## Overview

This document provides a comprehensive analysis of the HexTrackr project architecture, including file importance scoring, dependency mapping, and structural insights derived from automated codebase analysis.

## Project Statistics

| Metric | Value |
|--------|-------|
| Total Files | 247 |
| Total Directories | 39 |
| Critical Files (7-10) | 1 |
| High Importance (5-6) | 0 |
| Medium Importance (3-4) | 17 |
| Average Importance | 0.70/10 |

## File Type Distribution

- **.md**: 60 files
- **.png**: 47 files
- **.html**: 47 files
- **.js**: 23 files
- **No extension**: 15 files
- **.json**: 11 files
- **.yaml**: 8 files
- **.sh**: 6 files
- **.zip**: 6 files
- **.css**: 6 files

## Critical Files Analysis

These files have the highest importance scores and represent the core architecture components:

### server.js

- **Importance Score**: 7/10 (CRITICAL)
- **Path**: `/Volumes/DATA/GitHub/HexTrackr/server.js`
- **Dependencies**: 2 files
- **Package Dependencies**: 9 packages
- **Dependents**: 0 files

**Key Package Dependencies**:

- `express` (^4.18.2)
- `path`
- `cors` (^2.8.5)
- `compression` (^1.7.4)
- `sqlite3` (^5.1.7)

### package.json

- **Importance Score**: 4/10 (MEDIUM)
- **Path**: `/Volumes/DATA/GitHub/HexTrackr/package.json`
- **Dependencies**: 0 files
- **Package Dependencies**: 0 packages
- **Dependents**: 1 files

### init-database.js

- **Importance Score**: 4/10 (MEDIUM)
- **Path**: `/Volumes/DATA/GitHub/HexTrackr/scripts/init-database.js`
- **Dependencies**: 0 files
- **Package Dependencies**: 2 packages
- **Dependents**: 1 files

**Key Package Dependencies**:

- `sqlite3` (^5.1.7)
- `path`

## Dependency Relationships

The following files have significant dependency relationships:

### server.js (2)

- **Importance**: 7/10
- **File Dependencies**: 2
- **Package Dependencies**: 9
- **Depends on**: `package.json`, `init-database.js`

## Directory Analysis

### Scripts Directory

- **Total Files**: 25
- **File Types**: no-ext: 1, .md: 1, .js: 14, .sh: 4, .sql: 1, .cypher: 1, .html: 3
- **Importance Distribution**: 0 high, 5 medium, 20 low

**Top Files by Importance**:

- `init-database.js` (4/10)
- `docs-mapping-analyzer.js` (3/10)
- `docs-repair-generator.js` (3/10)
- `fix-markdown.js` (3/10)
- `version-manager.js` (3/10)

### Documentation Source

- **Total Files**: 33
- **File Types**: no-ext: 1, .md: 32
- **Importance Distribution**: 0 high, 8 medium, 25 low

**Top Files by Importance**:

- `index.md` (3/10)
- `index.md` (3/10)
- `index.md` (3/10)
- `index.md` (3/10)
- `index.md` (3/10)

## Architecture Insights

### Code Quality Indicators

- **Low Complexity**: Average importance score of 0.70/10 indicates well-organized project structure
- **Focused Architecture**: Only 1 critical file(s) suggest clear separation of concerns
- **Modular Design**: Distribution across 39 directories shows good organization

### Recommendations

1. **Focus Code Reviews**: Prioritize reviews of critical files (importance ≥ 7)
2. **Monitor Dependencies**: Track changes to files with high dependency counts
3. **Architectural Stability**: Maintain low complexity by avoiding over-centralization
4. **Documentation Updates**: Keep architecture docs synchronized with code changes

### Risk Assessment

- **Single Points of Failure**: 1 critical file(s) require careful change management
- **Dependency Impact**: Files with multiple dependencies need coordinated updates
- **Maintenance Burden**: 17 medium-importance files may need periodic review

## Related Documentation

- [System Architecture Overview](./overview.md)
- [Database Schema](./database.md)
- [API Architecture](../api-reference/overview.md)
- [Deployment Architecture](./deployment.md)

---

*This analysis is automatically generated from codebase structure. For questions about specific architectural decisions, refer to the development team or project documentation.*
