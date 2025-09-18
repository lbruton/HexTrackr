# Developer Documentation

## Overview

This directory contains auto-generated developer documentation created from JSDoc comments in the source code. This is for **internal development use only** and is separate from the public documentation portal.

## Directory Structure

```
app/
├── dev-docs-html/          # Auto-generated JSDoc HTML (git-ignored)
├── public/
│   ├── docs-html/          # Public documentation portal
│   └── docs-source/        # Manual markdown for public docs
```

## Usage

### Generate Developer Documentation

```bash
# Generate JSDoc HTML
npm run docs:dev

# Watch mode (auto-regenerates on file changes)
npm run docs:dev:watch

# Generate both developer and public docs
npm run docs:all
```

### Access Developer Documentation

After generation, access the developer docs at:

- **Local Development**: <http://localhost:8989/dev-docs/>
- **Docker**: <http://localhost:8989/dev-docs/>

This route is **not linked** in the main application navigation and is intended for developers only.

## Key Differences

### Developer Documentation (This)

- **Auto-generated** from JSDoc comments
- **Technical reference** with all functions, parameters, returns
- **Includes private methods** and internal implementation details
- **Not version controlled** (git-ignored)
- **For developers** working on HexTrackr code

### Public Documentation (`/docs-html/`)

- **Manually curated** markdown → HTML
- **User-focused** guides and tutorials
- **Public API only** with practical examples
- **Version controlled** for quality assurance
- **For end users** of HexTrackr

## JSDoc Best Practices

When writing JSDoc comments in code:

```javascript
/**
 * @description Brief description of the function
 * @param {string} paramName - Parameter description
 * @param {Object} options - Options object
 * @param {boolean} options.flag - Option flag description
 * @returns {Promise<Array>} Description of return value
 * @throws {Error} When something goes wrong
 * @example
 * // Example usage
 * const result = await myFunction('test', { flag: true });
 * @since 1.0.0
 * @see {@link OtherClass#relatedMethod}
 */
```

## Configuration

The JSDoc configuration is in `jsdoc.dev.json` and includes:

- All controllers, services, routes, utilities
- Frontend scripts (pages, shared, utils)
- Excludes test files and minified code
- Excludes node_modules

## Troubleshooting

### Documentation not updating?

1. Make sure you've saved your files
2. Run `npm run docs:dev` to regenerate
3. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

### Missing documentation?

- Check that your file is included in `jsdoc.dev.json` source paths
- Ensure you have JSDoc comments (/** */) not regular comments (/* */)
- Verify the file doesn't match exclusion patterns

### Warnings during generation?

- `@type` tag warnings can usually be ignored
- Check JSDoc syntax if other warnings appear

## Notes

- The `app/dev-docs-html/` directory is git-ignored
- Documentation regenerates completely each time (no incremental builds)
- Use `@private` tag to mark internal methods
- Use `@ignore` tag to exclude from documentation
