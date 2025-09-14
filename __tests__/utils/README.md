# Test Utilities

This directory contains reusable utility functions for the E2E test suite.

## Structure

### Core Utilities

- **auth.js** - Authentication helpers for different user roles
- **db-reset.js** - Database reset and isolation utilities
- **validators.js** - Data validation helpers for CVE, severity, VPR

### Performance & Monitoring

- **performance.js** - Performance measurement and benchmark validation
- **websocket-monitor.js** - WebSocket progress tracking validation
- **screenshots.js** - Screenshot capture for debugging

### Data Generation

- **data-generator.js** - CSV fixture generation for various sizes
- **generators/** - Vendor-specific CSV generators (to be created)
  - tenable.js
  - cisco.js
  - qualys.js

## Usage

```javascript
// Authentication
const { loginAs } = require('./auth');
await loginAs(page, 'securityAnalyst');

// Performance monitoring
const PerformanceMonitor = require('./performance');
const monitor = new PerformanceMonitor();
monitor.startTimer('tableLoad');
// ... perform action
monitor.stopTimer('tableLoad', 500); // Validate <500ms

// Data validation
const { isValidCVE, isValidSeverity } = require('./validators');
expect(isValidCVE('CVE-2024-0001')).toBe(true);
expect(isValidSeverity('Critical')).toBe(true);
```

## Implementation Status

All utilities are currently placeholder implementations pending completion of their respective tasks (T006-T018).