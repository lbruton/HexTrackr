# Ticket Creation Tests

This directory contains E2E tests for the Network Administrator workflow related to ticket creation and management.

## Test Coverage (FR-007 to FR-011)

- **create-ticket.spec.js** - Basic ticket creation with markdown (FR-007)
- **servicenow.spec.js** - ServiceNow integration workflow (FR-008)
- **hexagon.spec.js** - Hexagon integration workflow (FR-008)
- **zip-generation.spec.js** - ZIP package with documentation (FR-009)
- **email-template.spec.js** - Email notifications (FR-010)
- **audit-trail.spec.js** - Ticket state change tracking (FR-011)

## Running These Tests

```bash
# Run all ticket creation tests
npx playwright test ticket-creation

# Run specific test
npx playwright test ticket-creation/servicenow.spec.js
```