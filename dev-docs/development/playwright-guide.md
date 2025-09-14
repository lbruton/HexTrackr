# Playwright E2E Testing Guide

This document provides a guide to writing and running Playwright E2E tests for the HexTrackr application.

---

## Overview

Playwright is used for E2E testing to simulate user interactions and workflows.

---

## Writing Tests

- **Test Files**: E2E tests are located in the `tests/e2e/` directory.
- **Page Objects**: The tests use the Page Object Model to abstract page details and improve test maintainability.
- **Best Practices**:
    - Use descriptive test names.
    - Use `data-testid` attributes for selecting elements.
    - Avoid using `cy.wait()` for arbitrary waits.

---

## Running Tests

To run the Playwright E2E tests, use the following npm script:

```bash
npm run test:e2e
```
