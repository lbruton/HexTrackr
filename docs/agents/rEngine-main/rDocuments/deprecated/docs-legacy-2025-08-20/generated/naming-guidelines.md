# rEngine Core: Agent Directory Structure & Naming Guidelines

## Purpose & Overview

This document outlines the standardized directory structure and naming conventions for all agent-related development activities within the rEngine Core platform. It serves as a comprehensive guide for organizing and managing agent-specific files, including debugging logs, test cases, prototypes, and documentation.

The goal of these guidelines is to ensure a consistent, searchable, and maintainable codebase across the rEngine Core ecosystem. By following these conventions, agents can easily navigate, collaborate, and reference relevant files throughout the development lifecycle.

## Key Directories

The core directory structure for agent-related files is as follows:

```
agents/
├── debug/          # Debugging files, logs, diagnostic info
├── lab/            # Experimental HTML files, prototypes, demos
├── notes/          # Documentation, guides, reference materials  
├── test/           # Test files, validation scripts, test data
├── scripts/        # Automation scripts and utilities
└── tasks/          # Task-specific coordination files
```

Additionally, the following JSON files are maintained at the root level of the `agents/` directory:

```
agents/
├── agents.json         # Agent capabilities and profiles
├── decisions.json      # Decision patterns and learning
├── errors.json         # Error signatures and prevention
├── functions.json      # Function registry with dependencies
├── handoff.json        # Agent-to-agent context transfer system
├── memory.json         # Structured MCP memory
├── performance.json    # Real-time metrics and optimization
├── preferences.json    # User preferences and convenience
├── recentissues.json   # Issue tracking with diffs/rollbacks
├── structure.json      # Codebase structure mapping
├── styles.json         # UI/UX patterns and guidelines
├── tasks.json          # Unified task management
├── tools.json          # Available tools and capabilities
├── variables.json      # Global variables and constants
└── unified-workflow.md # Primary agent workflow
```

## Naming Conventions

The rEngine Core platform follows a consistent set of naming conventions for agent-related files. These guidelines ensure easy identification and organization of content based on its purpose and context.

### File Naming Standards

The general format for file names is: `category-specific-description.extension`.

The supported categories include:

- `debug-*` - Debugging and diagnostic files
- `test-*` - Testing related files  
- `note-*` - Documentation and notes
- `guide-*` - Comprehensive guides
- `template-*` - Reusable templates
- `config-*` - Configuration files
- `script-*` - Automation scripts

Examples:

```
debug/
├── debug-filter-chip-investigation.md
├── debug-performance-analysis.json
└── debug-memory-usage-report.txt

test/
├── test-bulk-edit-functionality.js
├── test-filter-performance.json
└── test-mobile-responsiveness.md

notes/
├── note-api-integration-research.md
├── guide-mobile-optimization.md
└── template-bug-investigation.md
```

### Content Type Guidelines

The following guidelines provide more details on the expected content within each subdirectory:

#### `/debug/` Content

- **Bug investigation logs**: `debug-[bug-id]-investigation.md`
- **Performance analysis**: `debug-performance-[feature].json`
- **Memory dumps**: `debug-memory-[timestamp].json`
- **Error traces**: `debug-error-[error-type].log`

#### `/test/` Content  

- **Feature tests**: `test-[feature-name].js`
- **Performance benchmarks**: `test-performance-[component].json`
- **Validation scripts**: `test-validation-[area].py`
- **Test data**: `test-data-[scenario].json`

#### `/lab/` Content

- **Experimental HTML**: `demo-[feature-name].html`
- **Prototype pages**: `prototype-[component].html`
- **Feature demos**: `[feature-name]-demo.html`
- **Settings pages**: `[module]-settings.html`

#### `/notes/` Content

- **Research notes**: `note-[topic]-research.md`
- **Implementation guides**: `guide-[feature]-implementation.md`
- **Architecture docs**: `note-[system]-architecture.md`
- **Templates**: `template-[purpose].md`

## Usage Guidelines

### File Creation

When creating new files, agents should follow these guidelines:

#### Debugging Activities

```markdown

# Agent should create:

agents/debug/debug-[issue-description]-[timestamp].md

# Example:

agents/debug/debug-filter-chip-color-20250816.md
```

#### Testing Activities  

```markdown

# Agent should create: (2)

agents/test/test-[feature-being-tested].extension

# Examples:

agents/test/test-mobile-table-layout.js
agents/test/test-search-performance.json
```

#### Lab/Prototype Activities

```markdown

# Agent should create: (3)

agents/lab/[type]-[feature-name].html

# Examples: (2)

agents/lab/demo-mobile-optimization.html
agents/lab/prototype-filter-redesign.html
agents/lab/ai-search-demo.html
```

#### Documentation/Notes

```markdown

# Agent should create: (4)

agents/notes/[type]-[topic].md

# Examples: (3)

agents/notes/note-chart-optimization-research.md
agents/notes/guide-responsive-design-patterns.md
agents/notes/template-performance-investigation.md
```

### File Organization Rules

1. **Single Purpose Files**: Each file should have one clear purpose and be named accordingly.
2. **Date Stamping**: For debugging and investigation files, include a date stamp in the format `YYYYMMDD`.
3. **Cross-References**: Always reference related files in other directories.
4. **Cleanup Protocol**: Archive completed investigations, keep test files for regression testing, and consolidate related notes into comprehensive guides.

## Integration Protocol

### File Creation Commands

```bash

# Debug investigation

touch agents/debug/debug-[issue]-$(date +%Y%m%d).md

# Test file  

touch agents/test/test-[feature].js

# Research note

touch agents/notes/note-[topic]-research.md
```

### Template Headers

All files should start with standardized headers:

#### Debug Files

```markdown

# Debug: [Issue Description]

**Date**: $(date +%Y-%m-%d)  
**Agent**: [Agent Name]  
**Issue**: [Brief description]  
**Status**: [Active|Resolved|Archived]

## Investigation Log

[Content here]
```

#### Test Files

```markdown

# Test: [Feature Name]

**Created**: $(date +%Y-%m-%d)  
**Test Type**: [Unit|Integration|Performance|Manual]  
**Target**: [Component/Feature being tested]  
**Status**: [Draft|Active|Passing|Failing]

## Test Details

[Content here]
```

#### Lab Files (HTML)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>[Feature] Demo/Prototype</title>
    <!-- Include relevant CSS and JS -->
</head>
<body>
    <!-- Experimental/demo content -->
</body>
</html>
```

#### Note Files

```markdown

# [Note Type]: [Topic]

**Created**: $(date +%Y-%m-%d)  
**Category**: [Research|Guide|Template|Reference]  
**Related**: [Links to related files/issues]

## Content

[Content here]
```

## Maintenance Guidelines

### Daily

- Agents check appropriate directories before creating new files
- Use standardized naming when creating any files
- Cross-reference related files in different directories
- Create patch notes in `/patchnotes` for version changes

### Patch Notes Integration

- **Location**: `/patchnotes/PATCH-[version].[md|ai]`
- **Triggers**: Version bumps, major features, critical fixes
- **Cross-reference**: Link in `recentissues.json` and `tasks.json`
- **Format**: Follow `agents/notes/patch-notes-guidelines.md`

### Weekly  

- Review and consolidate related debug files
- Archive completed investigations
- Update naming compliance across all files

### Monthly

- Clean up outdated debug files
- Consolidate notes into comprehensive guides
- Review directory structure for optimization opportunities

## Conclusion

These guidelines are essential for maintaining a well-organized, searchable, and maintainable codebase within the rEngine Core platform. By following these conventions, agents can ensure efficient collaboration, easy troubleshooting, and seamless integration across the ecosystem.

All agents must adhere to these guidelines to uphold the integrity and consistency of the rEngine Core development process.
