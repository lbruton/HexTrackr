# Quick Start: E2E Testing Suite with Playwright

## Prerequisites

### System Requirements

1. **Node.js 18+** installed
2. **Docker Desktop** running
3. **Minimum 8GB RAM** available
4. **10GB free disk space** for test artifacts

### Initial Setup

```bash
# 1. Install Playwright and dependencies
npm install

# 2. Install browsers (if not already installed)
npx playwright install

# 3. Verify Docker is running
docker-compose ps

# 4. Start HexTrackr application
docker-compose up -d

# 5. Wait for application to be ready
./scripts/wait-for-ready.sh
```

## Running Tests

### Quick Test Commands

```bash
# Run all tests
npx playwright test

# Run specific workflow tests
npx playwright test vulnerability-import
npx playwright test ticket-creation
npx playwright test dashboard
npx playwright test compliance

# Run performance tests only
npx playwright test performance/

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run tests in debug mode
npx playwright test --debug

# Run single test file
npx playwright test tests/vulnerability-import/csv-upload.spec.js
```

### Browser-Specific Testing

```bash
# Chrome only
npx playwright test --project=chromium

# Firefox only
npx playwright test --project=firefox

# Safari only
npx playwright test --project=webkit

# Mobile testing
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"

# All browsers (parallel)
npx playwright test --project=chromium --project=firefox --project=webkit
```

### Performance Testing

```bash
# Run performance benchmarks
npx playwright test performance/load-times.spec.js

# Run with performance reporter
npx playwright test --reporter=./utils/performance-reporter.js

# Large dataset testing (25,000+ records)
npx playwright test performance/large-dataset.spec.js

# Concurrent user testing
npx playwright test performance/concurrent-users.spec.js
```

## Test Data Generation

### Generate Test Fixtures

```bash
# Generate small CSV (100 records)
node utils/data-generator.js --size=small --output=fixtures/csv/small.csv

# Generate large CSV (25,000 records)
node utils/data-generator.js --size=large --output=fixtures/csv/large.csv

# Generate specific vendor format
node utils/data-generator.js --vendor=tenable --size=medium
node utils/data-generator.js --vendor=cisco --size=medium
node utils/data-generator.js --vendor=qualys --size=medium

# Generate all test data
npm run generate:fixtures
```

### Reset Test Database

```bash
# Reset to clean state
docker-compose exec hextrackr npm run db:reset

# Seed with test data
docker-compose exec hextrackr npm run db:seed

# Full reset and seed
npm run test:reset-db
```

## Debugging Failed Tests

### View Test Reports

```bash
# Open HTML report
npx playwright show-report

# View last test run report
open __tests__/playwright-report/index.html

# View trace for failed test
npx playwright show-trace __tests__/test-results/*/trace.zip
```

### Debug Specific Test

```bash
# Run test with inspector
npx playwright test vulnerability-import --debug

# Run with verbose logging
DEBUG=pw:api npx playwright test

# Pause on failure
npx playwright test --pause-on-failure

# Record video for all tests
npx playwright test --video=on
```

### Common Debug Commands

```javascript
// In test file - pause execution
await page.pause();

// Take screenshot during test
await page.screenshot({ path: 'debug.png' });

// Log page content
console.log(await page.content());

// Wait for debugger
await page.evaluate(() => { debugger; });
```

## CI/CD Integration

### GitHub Actions

```bash
# Run tests in CI mode
CI=true npx playwright test

# Run with sharding (parallel CI)
npx playwright test --shard=1/4
npx playwright test --shard=2/4
npx playwright test --shard=3/4
npx playwright test --shard=4/4
```

### Jenkins

```groovy
pipeline {
    stages {
        stage('E2E Tests') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install'
                sh 'docker-compose up -d'
                sh 'npx playwright test'
            }
        }
    }
    post {
        always {
            publishHTML([
                reportDir: '__tests__/playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Report'
            ])
        }
    }
}
```

## Test Suites

### Security Analyst Workflow

```bash
# Full workflow test
npx playwright test tests/vulnerability-import/full-workflow.spec.js

# Individual components
npx playwright test tests/vulnerability-import/csv-upload.spec.js
npx playwright test tests/vulnerability-import/vendor-detection.spec.js
npx playwright test tests/vulnerability-import/deduplication.spec.js
npx playwright test tests/vulnerability-import/progress-tracking.spec.js
```

### Network Administrator Workflow

```bash
# Ticket creation suite
npx playwright test tests/ticket-creation/

# Specific ticket tests
npx playwright test tests/ticket-creation/servicenow.spec.js
npx playwright test tests/ticket-creation/hexagon.spec.js
npx playwright test tests/ticket-creation/markdown-generation.spec.js
```

### Manager Dashboard

```bash
# Dashboard suite
npx playwright test tests/dashboard/

# Specific dashboard tests
npx playwright test tests/dashboard/statistics.spec.js
npx playwright test tests/dashboard/charts.spec.js
npx playwright test tests/dashboard/export.spec.js
```

### Compliance Audit

```bash
# Compliance suite
npx playwright test tests/compliance/

# Specific compliance tests
npx playwright test tests/compliance/audit-trail.spec.js
npx playwright test tests/compliance/data-retention.spec.js
npx playwright test tests/compliance/reports.spec.js
```

## Performance Benchmarks

### Validate Performance Targets

```bash
# Check all performance requirements
npm run test:performance

# Specific performance checks
npx playwright test performance/table-load.spec.js    # <500ms
npx playwright test performance/chart-render.spec.js  # <200ms
npx playwright test performance/websocket.spec.js     # 100ms intervals
```

### Generate Performance Report

```bash
# Run with performance metrics
npx playwright test --reporter=./utils/performance-reporter.js

# View performance trends
open __tests__/performance-report/trends.html

# Export metrics to JSON
npx playwright test --reporter=json > performance-metrics.json
```

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Tests timeout | Increase timeout in playwright.config.js |
| Docker not running | `docker-compose up -d` |
| Port 8080 in use | Change port in playwright.config.js |
| Browser not installed | `npx playwright install` |
| Out of memory | Reduce workers in config or increase Docker memory |
| WebSocket tests fail | Ensure Docker container has WebSocket support |

### Reset Everything

```bash
# Complete reset
docker-compose down -v
docker-compose up -d
npm ci
npx playwright install --force
npm run test:reset-db
npx playwright test
```

## Best Practices

### Before Running Tests

1. ✅ Ensure Docker is running
2. ✅ Reset database to known state
3. ✅ Clear browser cache/cookies
4. ✅ Close other applications (for performance tests)
5. ✅ Use consistent test data

### Writing New Tests

1. Follow workflow-based organization
2. Use data-testid attributes for selectors
3. Include performance assertions
4. Add proper error messages
5. Clean up after tests

### Test Maintenance

```bash
# Update Playwright
npm update @playwright/test

# Update snapshots
npx playwright test --update-snapshots

# Check for deprecated features
npx playwright test --check
```

## Quick Reference

### Essential Commands

```bash
# Most common commands
npx playwright test                    # Run all tests
npx playwright test --headed          # See browser
npx playwright test --debug           # Debug mode
npx playwright show-report            # View report
npx playwright codegen                # Generate test code

# Project specific
npm run test:e2e                      # Run E2E suite
npm run test:performance              # Run performance tests
npm run test:reset-db                 # Reset database
npm run generate:fixtures             # Generate test data
```

---
*Quick start guide for E2E testing suite - Spec 001*
