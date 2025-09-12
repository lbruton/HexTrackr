# Test Fixtures

This directory contains test data fixtures used across all E2E tests.

## Directory Structure

- **csv/** - Sample CSV files for vulnerability import testing
  - Various sizes (small: 100, medium: 5K, large: 25K, xlarge: 100K records)
  - Different vendor formats (Tenable, Cisco, Qualys)
  
- **users/** - User role fixtures for authentication testing
  - roles.json - Security Analyst, Network Admin, Manager, Compliance Officer
  
- **devices/** - Device inventory fixtures
  - inventory.json - Sample network devices with various types and vendors
  
- **api/** - Mock API response fixtures
  - WebSocket messages, REST responses, error scenarios

## Usage

```javascript
// Import fixtures in tests
const users = require('../fixtures/users/roles.json');
const devices = require('../fixtures/devices/inventory.json');
```

## Fixture Generation

Some fixtures are generated programmatically:
- CSV files: Use `__tests__/utils/data-generator.js`
- Large datasets: Generated on-the-fly to avoid repository bloat