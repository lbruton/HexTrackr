# NPM Scripts Guide for HexTrackr

This guide provides a comprehensive overview of all npm scripts available in the HexTrackr project, organized by category for easy reference.

**📝 Last Updated**: 2025-09-22 - Removed testing infrastructure and cleaned up broken script references

## Table of Contents
- [Development](#development)
- [Documentation](#documentation)
- [Linting & Code Quality](#linting--code-quality)
- [Database & Setup](#database--setup)
- [Git Hooks](#git-hooks)
- [Quick Reference](#quick-reference)

---

## Development

### `npm start`
- **Purpose**: Starts the HexTrackr application server
- **Command**: `node app/public/server.js`
- **When to use**: Starting the application locally (though Docker is preferred)
- **Note**: Always prefer `docker-compose up` instead of running locally

### `npm run dev`
- **Purpose**: Starts the application in development mode with auto-reload
- **Command**: `nodemon app/public/server.js`
- **When to use**: During active development when you need hot-reloading
- **Requires**: nodemon (installed as devDependency)

---

## Documentation

### Core Documentation Scripts

#### `npm run docs:generate`
- **Purpose**: Converts markdown documentation to HTML for the portal
- **Command**: `node app/public/docs-html/html-content-updater.js`
- **When to use**: After editing any markdown files in `app/public/docs-source/`
- **Output**: HTML files in `app/public/docs-html/`

#### `npm run docs:pipeline` 🆕
- **Purpose**: Runs the unified documentation pipeline (JSDoc extraction + markdown generation)
- **Command**: `node app/public/scripts/unified-docs-pipeline.js`
- **When to use**: To extract JSDoc comments and generate API documentation
- **Output**: Markdown files in `app/public/docs-source/api-reference/`

### Combination Scripts


#### `npm run docs:sync` 🆕
- **Purpose**: Syncs JSDoc to markdown AND generates HTML
- **Command**: `npm run docs:jsdoc-md && npm run docs:generate`
- **When to use**: Complete JSDoc to HTML pipeline
- **Note**: Runs pipeline then HTML generation

#### `npm run docs:full` 🆕
- **Purpose**: Complete documentation regeneration with architecture analysis
- **Command**: `npm run docs:pipeline && npm run docs:analyze`
- **When to use**: Major documentation updates or releases
- **Output**: Complete documentation refresh

### Specialized Documentation

#### `npm run docs:jsdoc` 🆕
- **Purpose**: Generates JSDoc HTML documentation
- **Command**: `npx jsdoc -c jsdoc.config.json`
- **When to use**: To generate standalone JSDoc HTML docs
- **Output**: HTML in `app/public/docs-html/api/`
- **Note**: Currently has dependency issues (tslib)

#### `npm run docs:jsdoc-md` 🆕
- **Purpose**: Alias for docs:pipeline
- **Command**: `node app/public/scripts/unified-docs-pipeline.js`
- **Note**: Redundant with `docs:pipeline`



---

## Linting & Code Quality

### JavaScript Linting

#### `npm run eslint`
- **Purpose**: Checks JavaScript files for ESLint violations
- **Command**: `eslint '**/*.js' --ignore-pattern '**/*.min.js' --config eslint.config.mjs`
- **When to use**: Before commits to check code quality
- **Note**: Ignores minified files

#### `npm run eslint:fix`
- **Purpose**: Auto-fixes ESLint violations where possible
- **Command**: `eslint '**/*.js' --ignore-pattern '**/*.min.js' --config eslint.config.mjs --fix`
- **When to use**: To automatically fix formatting and simple issues
- **⚠️ Caution**: Review changes, especially with unused variables

### CSS Linting

#### `npm run stylelint`
- **Purpose**: Checks CSS files for style violations
- **Command**: `stylelint '**/*.css'`
- **When to use**: Before commits to ensure CSS consistency
- **Config**: Uses `.stylelintrc.json`

#### `npm run stylelint:fix`
- **Purpose**: Auto-fixes CSS style violations
- **Command**: `stylelint '**/*.css' --fix`
- **When to use**: To automatically fix CSS formatting
- **Safe**: Generally safe for auto-fixing

### Markdown Linting

#### `npm run lint:md`
- **Purpose**: Checks markdown files for formatting issues
- **Command**: `markdownlint --config .markdownlint.json --ignore-path .markdownlintignore '**/*.md'`
- **When to use**: Before documentation updates
- **Config**: Uses `.markdownlint.json`

#### `npm run lint:md:fix`
- **Purpose**: Auto-fixes markdown formatting issues
- **Command**: `node app/public/scripts/fix-markdown.js`
- **When to use**: To fix markdown link and formatting issues
- **Note**: Custom script for specific fixes

### Combined Linting

#### `npm run lint:all`
- **Purpose**: Runs ALL linters (markdown, JavaScript, CSS)
- **Command**: `npm run lint:md && npm run eslint && npm run stylelint`
- **When to use**: Comprehensive code quality check
- **Note**: Fails fast on first error

#### `npm run fix:all`
- **Purpose**: Auto-fixes ALL linting issues
- **Command**: `npm run lint:md:fix && npm run eslint:fix && npm run stylelint:fix`
- **When to use**: Quick cleanup of all auto-fixable issues
- **⚠️ Caution**: Review all changes before committing

---


## Database & Setup

#### `npm run init-db`
- **Purpose**: Initializes the SQLite database
- **Command**: `node app/public/scripts/init-database.js`
- **When to use**: First-time setup or database reset
- **Creates**: `data/hextrackr.db`
- **⚠️ Warning**: May overwrite existing database

---

## Git Hooks

#### `npm run hooks:install`
- **Purpose**: Configures Git to use custom hooks
- **Command**: `git config core.hooksPath .githooks`
- **When to use**: After cloning the repository
- **Effect**: Enables pre-commit linting and checks
- **Location**: Hooks stored in `.githooks/`

---

## Quick Reference

### Most Used Commands
```bash
# Development
docker-compose up        # Start with Docker (preferred)
npm run dev              # Development with hot-reload

# Documentation
npm run docs:generate    # Markdown to HTML
npm run docs:dev         # Generate JSDoc HTML docs
npm run docs:all         # Complete documentation update

# Quality
npm run lint:all         # Check all code quality
npm run fix:all          # Auto-fix all issues

# Database
npm run init-db          # Initialize SQLite database

# Testing (Optional)
npm run test:stagehand    # AI-powered browser automation tests
```

### Workflow Combinations
```bash
# Before committing
npm run lint:all

# After making documentation changes
npm run docs:all

# Quick fixes
npm run fix:all && npm run docs:generate

# Full validation
npm run lint:all && npm run docs:all
```

---

## Redundancies Identified

1. **`docs:jsdoc-md` and `docs:pipeline`** - Both run the same command
   - Recommendation: Keep only `docs:pipeline` as it's more descriptive

2. **`docs:sync` and `docs:full`** - Similar purposes with slight differences
   - `docs:sync`: JSDoc → Markdown → HTML
   - `docs:full`: JSDoc → Markdown → Architecture Analysis → HTML
   - Recommendation: Consider consolidating or clarifying naming

3. **Multiple documentation generation paths**
   - Direct: `docs:generate`
   - With JSDoc: `docs:pipeline`
   - With analysis: `docs:analyze`
   - Full: `docs:full`
   - Recommendation: Document when to use each

---

## Testing

### `npm run test:stagehand` 🆕
- **Purpose**: Runs AI-powered browser automation tests using natural language
- **Command**: `node tests/stagehand-examples.js`
- **When to use**: Optional testing with AI automation instead of manual clicking
- **Requirements**: Docker container running on localhost:8080
- **Features**:
  - Natural language test descriptions (no CSS selectors)
  - Tests ticket creation, vulnerability import, settings modal
  - AI adapts automatically when UI changes
  - Local development without cloud dependencies

**Example Test Scenarios:**
- Ticket creation workflow
- Vulnerability import process
- Settings modal functionality
- Navigation between pages

**Note**: This is an optional testing approach that bridges manual testing and automation. The AI describes interactions naturally ("click on the tickets navigation link") rather than using brittle selectors.

---

## Missing/Potential Scripts

Consider adding:
- `precommit`: Combined linting checks
- `build`: Production build process
- `clean`: Remove generated files
- `validate`: Full validation suite
- `docs:watch`: Auto-regenerate docs on changes

---

*Last updated: 2025-09-22*
*Total scripts: 25*