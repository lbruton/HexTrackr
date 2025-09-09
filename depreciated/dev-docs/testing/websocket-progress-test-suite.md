# WebSocket Progress Tracking - Comprehensive Test Suite

## Test Categories Overview

This test suite covers all aspects of the WebSocket progress tracking implementation, from unit tests to end-to-end integration scenarios.

## Unit Tests

### Backend Unit Tests

#### Socket.io Server Integration Tests

```javascript
// Test file: tests/websocket-server.spec.js
describe('WebSocket Server Integration', () => {
  test('should initialize Socket.io server with Express', async () => {
    // Test Socket.io server starts correctly
    // Verify CORS configuration
    // Check connection handler registration
  });

  test('should handle client connections and disconnections', async () => {
    // Test client connection establishment
    // Verify connection cleanup on disconnect
    // Test multiple concurrent connections
  });

  test('should emit progress events correctly', async () => {
    // Test progress event structure
    // Verify event data accuracy
    // Test event throttling
  });
});
```

#### Progress Event System Tests

```javascript
// Test file: tests/progress-events.spec.js
describe('Progress Event System', () => {
  test('should calculate progress percentage accurately', () => {
    // Test progress calculation for various batch sizes
    // Verify percentage accuracy (0-100%)
    // Test ETA calculation logic
  });

  test('should emit events during bulk loading', async () => {
    // Mock bulkLoadToStagingTable function
    // Verify progress events are emitted
    // Test event frequency throttling
  });

  test('should handle batch processing progress', async () => {
    // Mock processStagingToFinalTables function
    // Test batch completion events
    // Verify final completion event
  });
});
```

### Frontend Unit Tests

#### WebSocket Client Tests

```javascript
// Test file: tests/websocket-client.spec.js
describe('WebSocket Client', () => {
  test('should establish connection to server', () => {
    // Test connection establishment
    // Verify connection state management
    // Test connection timeout handling
  });

  test('should handle automatic reconnection', () => {
    // Test reconnection on connection drop
    // Verify exponential backoff
    // Test reconnection limit
  });

  test('should process progress events correctly', () => {
    // Test progress event parsing
    // Verify UI updates on progress events
    // Test error event handling
  });
});
```

#### Progress UI Component Tests

```javascript
// Test file: tests/progress-ui.spec.js
describe('Progress UI Components', () => {
  test('should display progress bar correctly', () => {
    // Test progress bar rendering
    // Verify percentage display
    // Test progress bar animation
  });

  test('should show accurate progress information', () => {
    // Test progress percentage display
    // Verify ETA calculation display
    // Test status message updates
  });

  test('should handle cancel functionality', () => {
    // Test cancel button functionality
    // Verify import cancellation
    // Test UI state reset after cancel
  });
});
```

## Integration Tests

### Full Import Flow Tests

```javascript
// Test file: tests/import-flow-integration.spec.js
describe('Import Flow with Progress Tracking', () => {
  test('should track progress through complete CSV import', async () => {
    // Upload test CSV file
    // Monitor progress events throughout import
    // Verify final completion status
    // Validate imported data accuracy
  });

  test('should handle multiple concurrent imports', async () => {
    // Start multiple CSV imports simultaneously
    // Verify each has unique session ID
    // Test progress tracking for each import
    // Ensure no progress event crossover
  });

  test('should recover from server restart during import', async () => {
    // Start CSV import
    // Simulate server restart
    // Verify graceful progress tracking recovery
    // Test import completion after restart
  });
});
```

### Error Handling Integration Tests

```javascript
// Test file: tests/error-handling-integration.spec.js
describe('Error Handling Integration', () => {
  test('should handle WebSocket connection failures', async () => {
    // Start import with WebSocket disabled
    // Verify fallback behavior
    // Test progress tracking fallback
  });

  test('should handle malformed CSV files', async () => {
    // Upload invalid CSV file
    // Verify error event emission
    // Test error message display
    // Ensure progress tracking stops gracefully
  });

  test('should handle database errors during import', async () => {
    // Simulate database connection failure
    // Verify error event emission
    // Test recovery and retry mechanisms
  });
});
```

## Browser Tests (Playwright)

### End-to-End Progress Tracking Tests

```javascript
// Test file: tests/websocket-progress-e2e.spec.js
describe('WebSocket Progress Tracking E2E', () => {
  test('should display real-time progress during CSV import', async ({ page }) => {
    // Navigate to vulnerabilities page
    // Upload CSV file
    // Verify progress modal appears
    // Monitor progress bar updates
    // Confirm completion notification
  });

  test('should show accurate progress information', async ({ page }) => {
    // Upload medium-sized CSV file
    // Verify progress percentage increases
    // Check ETA display updates
    // Validate final completion time
  });

  test('should handle cancel import functionality', async ({ page }) => {
    // Start large CSV import
    // Click cancel button during progress
    // Verify import stops
    // Confirm UI resets to ready state
  });
});
```

### Responsive UI Tests

```javascript
// Test file: tests/progress-ui-responsive.spec.js
describe('Progress UI Responsive Behavior', () => {
  test('should display correctly on mobile devices', async ({ page }) => {
    // Set mobile viewport
    // Upload CSV file
    // Verify progress modal fits screen
    // Test touch interaction with cancel button
  });

  test('should work correctly on tablet devices', async ({ page }) => {
    // Set tablet viewport
    // Test progress tracking functionality
    // Verify all UI elements are accessible
  });

  test('should handle window resize during progress', async ({ page }) => {
    // Start CSV import with progress
    // Resize browser window
    // Verify progress UI adapts correctly
  });
});
```

## Performance Tests

### Load Testing

```javascript
// Test file: tests/websocket-performance.spec.js
describe('WebSocket Performance Tests', () => {
  test('should handle high-frequency progress events', async () => {
    // Simulate rapid progress events
    // Monitor memory usage
    // Verify no event queue overflow
    // Test event throttling effectiveness
  });

  test('should maintain performance with multiple clients', async () => {
    // Connect multiple WebSocket clients
    // Start concurrent imports
    // Monitor server resource usage
    // Verify acceptable response times
  });

  test('should not impact import speed significantly', async () => {
    // Compare import times with/without progress tracking
    // Verify performance impact < 5%
    // Test with various file sizes
  });
});
```

## Security Tests

### WebSocket Security Tests

```javascript
// Test file: tests/websocket-security.spec.js
describe('WebSocket Security', () => {
  test('should validate CORS configuration', async () => {
    // Test cross-origin connection attempts
    // Verify only allowed origins can connect
    // Test CORS header validation
  });

  test('should handle malicious WebSocket messages', async () => {
    // Send malformed progress events
    // Test injection attempt handling
    // Verify server stability
  });

  test('should limit concurrent connections per client', async () => {
    // Attempt multiple connections from same client
    // Verify connection limit enforcement
    // Test rate limiting functionality
  });
});
```

## Test Data and Fixtures

### CSV Test Files

```javascript
// Test data: tests/fixtures/csv-test-files/
// small-test.csv (100 rows) - Quick testing
// medium-test.csv (5,000 rows) - Progress tracking validation
// large-test.csv (50,000 rows) - Performance and cancel testing
// malformed-test.csv - Error handling testing
// empty-test.csv - Edge case testing
```

### Mock Data

```javascript
// Test file: tests/fixtures/mock-data.js
export const mockProgressEvents = [
  { type: 'parsing', progress: 10, message: 'Parsing CSV file...' },
  { type: 'loading', progress: 25, message: 'Loading to staging table...' },
  { type: 'processing', progress: 50, message: 'Processing batch 1/4...' },
  { type: 'finalizing', progress: 90, message: 'Finalizing import...' },
  { type: 'complete', progress: 100, message: 'Import completed successfully' }
];

export const mockErrorEvents = [
  { type: 'error', error: 'Database connection failed', progress: 30 },
  { type: 'error', error: 'Invalid CSV format', progress: 5 },
  { type: 'error', error: 'File too large', progress: 0 }
];
```

## Test Configuration

### Jest Configuration

```javascript
// jest.config.js additions for WebSocket testing
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup/websocket-setup.js'],
  testTimeout: 30000, // Longer timeout for WebSocket tests
  collectCoverageFrom: [
    'server.js',
    'scripts/shared/websocket-client.js',
    'scripts/shared/progress-ui.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Test Environment Setup

```javascript
// tests/setup/websocket-setup.js
import { Server } from 'socket.io';
import { createServer } from 'http';

export const setupTestWebSocketServer = () => {
  const httpServer = createServer();
  const io = new Server(httpServer, {
    cors: { origin: '*' }
  });
  
  return { httpServer, io };
};

export const teardownTestWebSocketServer = (httpServer) => {
  httpServer.close();
};
```

## Test Execution Strategy

### Test Phases

1. **Unit Tests** (10 minutes)
   - Backend function testing
   - Frontend component testing
   - Isolated functionality validation

1. **Integration Tests** (15 minutes)
   - Full import flow testing
   - Error handling validation
   - Multi-client scenarios

1. **Browser Tests** (20 minutes)
   - End-to-end functionality
   - UI/UX validation
   - Responsive behavior

1. **Performance Tests** (10 minutes)
   - Load testing
   - Memory usage validation
   - Import speed impact

### Continuous Integration

```yaml

# .github/workflows/websocket-tests.yml

name: WebSocket Progress Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:

      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:websocket
      - run: npm run test:e2e:websocket

```

## Success Criteria

### Functional Requirements

- ✅ All unit tests pass (100% pass rate)
- ✅ Integration tests validate complete flow
- ✅ Browser tests confirm UI functionality
- ✅ Error handling tests validate resilience

### Performance Requirements

- ✅ WebSocket implementation adds < 5% to import time
- ✅ Memory usage remains stable during long imports
- ✅ UI remains responsive during progress updates
- ✅ Event throttling prevents UI overwhelming

### Coverage Requirements

- ✅ Code coverage > 80% for new WebSocket functionality
- ✅ All critical paths covered by tests
- ✅ Error scenarios thoroughly tested
- ✅ Edge cases validated
