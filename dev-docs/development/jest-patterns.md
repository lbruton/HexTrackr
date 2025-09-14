# Jest Unit Testing Patterns

This document provides a guide to writing Jest unit tests for the HexTrackr application.

---

## Overview

Jest is used for unit testing individual components and functions.

---

## Writing Tests

- **Test Files**: Jest unit tests are located in the `__tests__/unit/` directory.
- **Mocking**: Jest's built-in mocking capabilities are used to mock dependencies.
- **Best Practices**:
    - Use descriptive test names.
    - Test one thing at a time.
    - Use `beforeEach` and `afterEach` for setup and teardown.

---

## Running Tests

To run the Jest unit tests, use the following npm script:

```bash
npm run test
```
