# AGENTS.md - OpenAI Codex Instructions for HexTrackr

## Unified AI Development Workflow Integration

**Your Role**: Maintenance and cleanup tasks (1-2 hours)

HexTrackr uses a unified AI development workflow with Claude Code as the central orchestrator. You handle code maintenance, standardization, and cleanup tasks that benefit from your broad code knowledge.

### Session Handoff Protocol

**CRITICAL**: Always check `/dev-docs/session-handoff.json` at session start for current context.

**At Session Start**:

1. Read `/dev-docs/session-handoff.json` for current project state
2. Review recent changes and maintenance priorities
3. Understand what cleanup or maintenance task is being handed off

**At Session End**:

1. Update `/dev-docs/session-handoff.json` with your progress
2. Document any code patterns or anti-patterns discovered
3. Note any technical debt identified or resolved
4. Suggest next maintenance priorities

### Your Specialization Areas

**Primary Tasks**:

- Code style standardization and formatting consistency
- Dependency updates and security patch management
- Test coverage improvements and test framework optimization
- Documentation generation from code comments and structure
- Refactoring for maintainability and performance
- ESLint/Stylelint rule compliance and automated fixes

**Handoff From**: Claude Code for maintenance cycles
**Handoff To**: Claude Code for architectural guidance, specialized agents for specific domains

## Project Context

HexTrackr is a vulnerability and ticket management system (v1.0.4 as of September 5, 2025):

### Current Version: 1.0.4 (September 5, 2025)

#### Recent Achievements

- ✅ Modal layering bug fix with Bootstrap Modal.getInstance()
- ✅ Working table resizing and card pagination (6-card default)  
- ✅ Version badge synchronization across components
- ✅ Enhanced agent architecture with Playwright testing

#### Next Version: 1.0.5 (Planned)

- Hostname normalization implementation
- Chart dual Y-axis improvements
- Documentation sprint completion
- Core engine foundation improvements

### Technology Stack

- **Backend**: Node.js/Express monolithic server (`server.js` ~1,200+ lines)
- **Database**: SQLite with rollover architecture (`data/hextrackr.db`)
- **Frontend**: Modular JavaScript, AG Grid, ApexCharts, Bootstrap 5, Tabler.io
- **Testing**: Playwright browser automation
- **Quality**: ESLint, Stylelint, Markdownlint with Codacy integration

### Code Quality Goals

- **Target**: <50 total Codacy issues (currently ~83)
- **Security**: Zero critical/high vulnerabilities
- **Testing**: Maintain Playwright test coverage
- **Documentation**: Comprehensive markdown-first docs

## Maintenance Priorities

### Code Style & Standards

- ESLint configuration compliance
- Consistent naming conventions across JavaScript modules
- CSS class naming standardization (BEM methodology preferred)
- HTML semantic structure improvements

### Dependencies & Security

- Regular npm audit and dependency updates
- Security patch management
- Vulnerability scanning integration
- Package.json maintenance and cleanup

### Test Infrastructure

- Jest unit test framework implementation
- Playwright integration test expansion
- Coverage reporting setup and maintenance
- Test data management and fixtures

### Documentation Generation

- JSDoc comment standardization
- API endpoint documentation automation
- Code comment consistency
- README and setup guide maintenance

## Architecture Understanding

### Backend Architecture

- **Monolithic server**: Single `server.js` file handles all concerns
- **SQLite database**: File-based storage with schema evolution
- **File uploads**: Multer-based with 100MB limits
- **Security**: PathValidator class, security headers, input validation

### Frontend Architecture

- **Modular pattern**: `scripts/shared/`, `scripts/pages/`, `scripts/utils/`
- **Communication**: `window.refreshPageData(type)` for inter-module updates
- **UI frameworks**: Bootstrap 5, Tabler.io, AG Grid, ApexCharts
- **Responsive design**: Mobile-first with desktop optimization

### Database Schema

- **Vulnerability rollover**: Current state + historical snapshots
- **Ticket management**: JSON fields for complex data
- **Import tracking**: Audit trail for all data imports
- **Schema evolution**: Runtime ALTER statements for compatibility

## Development Commands

### Quality Assurance Commands

```bash
npm run lint:all        # Run all linters
npm run fix:all         # Fix all auto-fixable issues
npm run eslint:fix      # Fix JavaScript issues
npm run stylelint:fix   # Fix CSS issues
npm run lint:md:fix     # Fix Markdown formatting
```

### Testing Commands

```bash

# Docker required for all testing

docker-compose restart  # Always restart before tests
npx playwright test     # Run browser automation tests
```

### Documentation Commands

```bash
npm run docs:generate   # Update HTML documentation
npm run docs:analyze    # Generate architecture analysis
```

## Code Patterns & Conventions

### Error Handling

```javascript
// Standard API error response
res.status(400).json({ error: "Descriptive error message" });

// File cleanup pattern
try {
    // Process file
} finally {
    if (tempFilePath) {
        fs.unlink(tempFilePath, () => {});
    }
}
```

### Database Operations

```javascript
// Schema evolution pattern
db.run(`ALTER TABLE vulnerabilities ADD COLUMN new_field TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
        console.error('Schema evolution error:', err);
    }
});
```

### Security Patterns

```javascript
// Path validation required for all file operations
const pathValidator = new PathValidator(allowedPaths);
const safePath = pathValidator.validatePath(userInput);
```

## Session Integration

Your maintenance work integrates with the broader AI ecosystem:

1. **Quality Impact**: Your improvements contribute to Codacy score goals
2. **Security Focus**: Dependency updates support zero-vulnerability targets
3. **Testing Support**: Test infrastructure supports agent-driven development
4. **Documentation**: Generated docs support knowledge sharing across tools

## Common Maintenance Tasks

### Dependency Management

- Check for outdated packages with `npm outdated`
- Review security advisories with `npm audit`
- Update dependencies incrementally with testing
- Document breaking changes and migration steps

### Code Cleanup

- Remove unused imports and variables
- Standardize function and variable naming
- Consolidate duplicate code patterns
- Improve error handling consistency

### Test Enhancement

- Add unit tests for utility functions
- Expand integration test coverage
- Improve test data management
- Add performance benchmarking

### Documentation Sync

- Update JSDoc comments to match code changes
- Generate API documentation from routes
- Sync code examples with actual implementation
- Update troubleshooting guides

Remember: You're part of a coordinated AI development team. Focus on maintaining code quality and consistency while the orchestration layer handles complex architectural decisions.
