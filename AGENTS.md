# Agent Guidelines for HexTrackr

This document provides essential guidelines for AI agents operating within the HexTrackr repository.

## Build, Lint, and Test Commands

- **Run Development Server**: `npm run dev`
- **Run Production Server**: `npm start`
- **Lint All Files**: `npm run lint:all`
- **Fix All Lint Issues**: `npm run fix:all`
- **Run Tests**: `npm run test:stagehand`
- **Run a Single Test**: No specific command for single tests. Use `npm run test:stagehand` and review the output.
- **Generate Documentation**: `npm run docs:all`

## Code Style and Conventions

- **Formatting**: 4-space indentation. Use `npm run fix:all` to auto-format.
- **Imports**: Use CommonJS (`require`) for backend modules. ES Modules (`import`/`export`) are used for frontend vulnerability management scripts (`vulnerability-*.js`).
- **Naming**:
  - `camelCase` for functions and variables.
  - `PascalCase` for classes.
- **Types**: JSDoc is required for all functions in the `app/` directory (`@description`, `@param`, `@returns`).
- **Error Handling**: Use standard `try...catch` blocks for error handling.
- **Strings**: Use double quotes (`"`).
- **Variables**: Prefer `const` over `let`. Avoid `var`.
- **Semicolons**: Mandatory.
- **Equality**: Use strict equality (`===`).
