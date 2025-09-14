# Compliance & Audit Tests

This directory contains E2E tests for Compliance Officer workflows and audit trail functionality.

## Test Coverage (FR-018 to FR-021)

- **audit-trail.spec.js** - Comprehensive audit logging (FR-018)
- **retention.spec.js** - Data retention policy enforcement (FR-019)
- **backup-restore.spec.js** - Backup and restore procedures (FR-020)
- **security.spec.js** - Security measures (path traversal, rate limiting) (FR-021)

## Running These Tests

```bash
# Run all compliance tests
npx playwright test compliance

# Run specific test
npx playwright test compliance/audit-trail.spec.js
```