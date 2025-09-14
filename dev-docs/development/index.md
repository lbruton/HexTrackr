# Development

This section provides resources for developers working on HexTrackr.

## Core Development Guides

- **[Getting Started](../getting-started/index.md)**: This guide contains all the information you need to set up a local development environment.
- **[Contribution Guidelines](./contributing.md)**: How to contribute to the HexTrackr project.
- **[Coding Standards](./coding-standards.md)**: Guidelines for writing code for the project.
- **[Testing Strategy](./testing-strategy.md)**: Comprehensive testing methodology with Playwright browser automation.
- **[Comprehensive Testing Guide](./testing-comprehensive.md)**: A comprehensive guide to testing in the HexTrackr application.
- **[Playwright E2E Testing Guide](./playwright-guide.md)**: A guide to writing and running Playwright E2E tests.
- **[Jest Unit Testing Patterns](./jest-patterns.md)**: A guide to writing Jest unit tests.
- **[Pre-commit Hooks](./pre-commit-hooks.md)**: An overview of the automated code quality enforcement system.

## Migrations

- **[Migration Framework](./migration-framework.md)**: An overview of the migration framework.
- **[Database Migrations](./database-migrations.md)**: How to perform database migrations.
- **[Version Upgrades](./version-upgrades.md)**: Guides for upgrading to new versions of the application.
- **[Rollback Procedures](./rollback-procedures.md)**: Procedures for rolling back to a previous version.

## Code Quality and Architecture

- **[Code Quality Standards](./code-quality-standards.md)**: Comprehensive code quality enforcement using Codacy and automated analysis.
- **[Refactoring Plan](../architecture/refactoring-plan.md)**: Modular architecture roadmap for server.js complexity reduction.

### Recent Quality Improvements

**September 2025 - Codacy Resolution**: Successfully resolved 320 code quality issues through systematic parallel agent execution:

- **SQL Schema Compliance**: Fixed syntax errors in `data/schema.sql` including comment formatting, AUTOINCREMENT syntax, and OR clause structures
- **JavaScript Complexity**: Analyzed server.js complexity (116 → target <12) with comprehensive modular refactoring plan
- **CSS Standards**: Achieved full color notation compliance (rgba/rgb standards) across all stylesheets  
- **Markdown Quality**: Resolved formatting inconsistencies across `docs-source/` documentation files
- **Configuration Management**: Enhanced `.codacy/codacy.yaml` with optimized exclusion patterns
- **Pre-commit Enhancement**: Improved markdown processing validation in commit hooks

## Documentation and AI Systems

- **[Memory System](./memory-system.md)**: An overview of the Persistent AI Memory integration.
- **[Docs Portal Guide](./docs-portal-guide.md)**: A guide to the documentation generation and management system.
- **[Gemini Documentation Integration](./gemini-docs-integration.md)**: An explanation of the AI-powered documentation enhancement system.
