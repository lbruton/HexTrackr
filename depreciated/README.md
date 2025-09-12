# HexTrackr - Vulnerability Management System

HexTrackr is a comprehensive vulnerability management system designed to aggregate, track, and manage security vulnerabilities across multiple scanning tools and environments.

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

The application will be available at `http://localhost:8989`

## 🧪 End-to-End Testing

### Test Suite Overview

The E2E test suite validates all critical user workflows using Playwright. Tests are organized by user role and functional area:

- **Role-Based Tests**: Security Analyst, Network Admin, Manager, Compliance Officer
- **Performance Tests**: Load testing, response times, concurrent users
- **Cross-Browser Tests**: Chrome, Firefox, Safari compatibility
- **Mobile Tests**: Responsive design across devices

### Running Tests Locally

#### Prerequisites

```bash
# Install Playwright and dependencies
npm install

# Install browsers
npx playwright install --with-deps
```

#### Running All Tests

```bash
# Start test environment
docker-compose -f docker-compose.test.yml up -d

# Run all E2E tests
npm run test:e2e

# Run with UI mode for debugging
npm run test:e2e:ui
```

#### Running Specific Test Suites

```bash
# Run role-based tests only
npm run test:e2e -- --grep "@role"

# Run critical tests only
npm run test:e2e -- --grep "@critical"

# Run performance tests
npm run test:e2e -- --grep "@performance"

# Run mobile tests
npm run test:e2e -- --grep "@mobile"

# Run tests for specific role
npm run test:e2e -- tests/e2e/specs/security-analyst.spec.js
```

#### Running Tests in Different Browsers

```bash
# Chrome only
npm run test:e2e -- --project=chromium

# Firefox only
npm run test:e2e -- --project=firefox

# Safari only
npm run test:e2e -- --project=webkit

# All browsers
npm run test:e2e -- --project=chromium --project=firefox --project=webkit
```

### CI/CD Testing

#### Using Docker Compose with CI Profile

```bash
# Run tests in CI mode with Playwright container
docker-compose -f docker-compose.test.yml --profile ci up --abort-on-container-exit

# View test results
cat test-results/results.json
```

#### GitHub Actions Workflow

Tests run automatically on:
- Push to `main` or `copilot` branches
- Pull requests to `main`
- Daily at 2 AM UTC
- Manual workflow dispatch

```yaml
# Manually trigger with specific suite
gh workflow run playwright.yml -f test-suite=smoke
```

### Test Environment Options

#### With Performance Monitoring

```bash
# Start with Grafana monitoring
docker-compose -f docker-compose.test.yml --profile monitoring up -d

# Access Grafana at http://localhost:3001
# Default credentials: admin/admin
```

#### With Redis Cache

```bash
# Start with Redis for caching tests
docker-compose -f docker-compose.test.yml --profile cache up -d
```

### Test Data

The test suite includes pre-generated CSV files with 25,000 records each:

- `tests/e2e/fixtures/csv-samples/tenable-25k.csv` - Tenable.sc format
- `tests/e2e/fixtures/csv-samples/cisco-25k.csv` - Cisco format
- `tests/e2e/fixtures/csv-samples/qualys-25k.csv` - Qualys format

### Test Reports

#### View HTML Report

```bash
# After test run, open report
npx playwright show-report
```

#### Generate Coverage Report

```bash
# Generate test coverage report
npm run test:coverage

# View coverage details
open coverage/index.html
```

### Performance Benchmarks

Expected performance targets:
- Table loads: <500ms
- Chart renders: <200ms
- Page transitions: <100ms
- CSV import (25k records): <60s
- Concurrent users: 50+

### Debugging Tests

#### Run in Debug Mode

```bash
# Debug specific test
npx playwright test --debug tests/e2e/specs/security-analyst.spec.js

# Run with browser visible
npx playwright test --headed

# Slow down execution
npx playwright test --headed --slow-mo=1000
```

#### View Test Traces

```bash
# Run with trace on
npx playwright test --trace on

# View trace
npx playwright show-trace test-results/trace.zip
```

### Test Organization

```
tests/e2e/
├── fixtures/
│   ├── csv-samples/       # Test CSV files
│   ├── test-data.js       # Test data constants
│   └── csv-generator.js   # CSV generation utility
├── pages/
│   ├── base.page.js       # Base page object
│   ├── dashboard.page.js  # Dashboard page object
│   ├── import.page.js     # Import page object
│   └── ...                # Other page objects
├── specs/
│   ├── security-analyst.spec.js  # Role: Security Analyst
│   ├── network-admin.spec.js     # Role: Network Admin
│   ├── manager.spec.js           # Role: Manager
│   ├── compliance.spec.js        # Role: Compliance Officer
│   ├── api-contract.spec.js      # API contract validation
│   ├── performance.spec.js       # Performance benchmarks
│   ├── load-test.spec.js         # Load testing
│   ├── cross-browser.spec.js     # Browser compatibility
│   ├── mobile-responsive.spec.js # Mobile responsive
│   └── viewport-sizes.spec.js    # Viewport testing
└── utils/
    ├── websocket-helper.js  # WebSocket utilities
    └── test-helpers.js      # Common test utilities
```

### Troubleshooting

#### Tests Failing on Timeout

1. Ensure Docker containers are running: `docker-compose ps`
2. Check application health: `curl http://localhost:8989/health`
3. Increase timeout in playwright-e2e.config.js

#### Browser Not Installed

```bash
# Install specific browser
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit
```

#### Port Already in Use

```bash
# Stop conflicting service or change port
docker-compose down
lsof -i :8989  # Find process using port
```

## 📊 Test Coverage

Current test coverage includes:

- ✅ 100% of user role workflows
- ✅ All CRUD operations
- ✅ CSV import with 25k+ records
- ✅ Real-time WebSocket updates
- ✅ API contract validation
- ✅ Performance benchmarks
- ✅ Cross-browser compatibility
- ✅ Mobile responsive design
- ✅ Accessibility (WCAG 2.1 Level AA)

For detailed coverage report, run `npm run test:coverage`

## 🔧 Development

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git

### Setup

```bash
# Clone repository
git clone https://github.com/your-org/hextrackr.git
cd hextrackr

# Install dependencies
npm install

# Initialize database
docker-compose exec hextrackr node /app/public/scripts/init-database.js

# Start development
docker-compose up
```

## 📝 License

[License information here]

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.