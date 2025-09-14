# Comprehensive Testing Guide

This document provides a comprehensive guide to testing in the HexTrackr application.

---

## Overview

HexTrackr uses a multi-layered testing strategy to ensure code quality and application stability.

- **Unit Tests**: Jest is used for unit testing individual components and functions.
- **Integration Tests**: The integration tests verify the interactions between different parts of the application.
- **End-to-End (E2E) Tests**: Playwright is used for E2E testing to simulate user interactions and workflows.

---

## Test Organization

The tests are organized into the following directories:

- `__tests__/unit/`: Jest unit tests.
- `__tests__/integration/`: Integration tests.
- `tests/e2e/`: Playwright E2E tests.

---

## Running Tests

The following npm scripts are available for running tests:

- `npm run test`: Runs all Jest unit tests.
- `npm run test:e2e`: Runs all Playwright E2E tests.
- `npm run test:coverage`: Generates a code coverage report.
