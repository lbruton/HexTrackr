# Codacy Compliance Tracking

<!-- markdownlint-disable-next-line MD013 -->
This page tracks our progress toward resolving all Codacy violations to ensure the codebase meets quality standards before merging to the `main` branch.

## Current Violations Checklist

### `server.js`

- [ ] **Error Prone: Avoid using console** (2 issues)
- [ ] **Code Style: Missing semicolon** (Multiple instances)
- [ ] **Code Style: Use single quotes** (Multiple instances)

### `scripts/pages/tickets.js`

- [ ] **Error Prone: Unused variable 'apiUrl'**
- [ ] **Complexity: Function `loadTickets` has a high complexity score**

### `scripts/pages/vulnerabilities.js`

- [ ] **Error Prone: Avoid using console** (Multiple issues)
- [ ] **Code Style: Inconsistent use of tabs and spaces**

### `docs-prototype/js/docs-tabler.js`

- [ ] **Error Prone: 'console' is not defined** (Linter environment issue, can be configured)
- [ ] **Error Prone: 'document' is not defined** (Linter environment issue, can be configured)
- [ ] **Error Prone: 'fetch' is not defined** (Linter environment issue, can be configured)

## Action Plan

1. Address all "Code Style" issues first, as they are typically the quickest to fix.
2. Refactor complex functions identified by Codacy to improve maintainability.
3. Resolve all "Error Prone" issues, ensuring no unused variables or direct `console` logs remain in production code.
4. Configure the linter to correctly recognize the browser environment for `docs-tabler.js`.
