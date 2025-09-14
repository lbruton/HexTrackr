# Dashboard Tests

This directory contains E2E tests for the Manager dashboard and analytics features.

## Test Coverage (FR-012 to FR-017)

- **chart-performance.spec.js** - Chart rendering <200ms (FR-012)
- **statistics.spec.js** - Statistics accuracy with 25K+ records (FR-013)
- **trends.spec.js** - Trend analysis calculations (FR-014)
- **export.spec.js** - Export to CSV/PDF/Excel (FR-015)
- **mobile.spec.js** - Mobile responsive design (FR-017)

## Running These Tests

```bash
# Run all dashboard tests
npx playwright test dashboard

# Run specific test
npx playwright test dashboard/statistics.spec.js
```