# Performance Tests

This directory contains E2E performance benchmark tests to validate system performance requirements.

## Test Coverage (FR-025 and Performance Targets)

- **load-times.spec.js** - Page load times <500ms
- **large-dataset.spec.js** - Handling 25,000+ records
- **memory.spec.js** - Memory usage and heap limits
- **websocket.spec.js** - WebSocket 100ms interval validation

## Performance Targets

- Table loads: <500ms
- Chart renders: <200ms
- WebSocket updates: 100ms intervals
- Large dataset processing: Stable with 25K+ records

## Running These Tests

```bash
# Run all performance tests
npx playwright test performance

# Run specific test
npx playwright test performance/load-times.spec.js

# Run with performance reporter
npx playwright test performance --reporter=./utils/performance-reporter.js
```