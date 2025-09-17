# HexTrackr Test Utilities

Comprehensive testing utilities for the HexTrackr backend modularization project. These utilities support unit, integration, and contract testing for Express.js applications with SQLite databases and Socket.io real-time communication.

## Directory Structure

```
tests/
├── README.md              # This documentation
├── test-utils.js           # Main utilities file
├── unit/                   # Unit tests
│   └── test-utils.example.test.js
├── integration/            # Integration tests
└── contract/              # Contract tests
```

## Available Utilities

### 1. DatabaseTestUtils

Provides utilities for testing SQLite database operations with proper isolation and cleanup.

**Key Features:**

- Test database creation with unique naming
- Schema initialization with HexTrackr tables
- Transaction support for test isolation
- Data seeding with mock data
- Automatic cleanup after tests

**Example Usage:**

```javascript
const { DatabaseTestUtils, MockFactories } = require('../test-utils');

describe('Database Tests', () => {
  let dbUtils;

  beforeEach(async () => {
    dbUtils = new DatabaseTestUtils();
    await dbUtils.createTestDatabase('my-test');
    await dbUtils.initializeSchema();
  });

  afterEach(async () => {
    await dbUtils.cleanup();
  });

  it('should insert and retrieve tickets', async () => {
    const testTicket = MockFactories.createMockTicket({
      location: 'Test Lab'
    });

    await dbUtils.seedDatabase({
      tickets: [testTicket]
    });

    // Test database operations...
  });
});
```

### 2. ExpressTestUtils

Utilities for testing Express.js applications with request builders and server management.

**Key Features:**

- Test Express app creation with configurable middleware
- Request builders with common headers
- Authentication helpers (future-ready)
- Test server lifecycle management

**Example Usage:**

```javascript
const { ExpressTestUtils } = require('../test-utils');

describe('API Tests', () => {
  let expressUtils;

  beforeEach(() => {
    expressUtils = new ExpressTestUtils();
  });

  afterEach(async () => {
    await expressUtils.stopServer();
  });

  it('should handle API requests', async () => {
    const app = expressUtils.createTestApp();

    app.get('/api/tickets', (req, res) => {
      res.json({ tickets: [] });
    });

    const response = await expressUtils.createRequest('get', '/api/tickets');
    expect(response.status).toBe(200);
  });
});
```

### 3. SocketTestUtils

Comprehensive Socket.io testing utilities for real-time communication testing.

**Key Features:**

- Socket.io server creation with configurable options
- Client connection management
- Event emission and listening helpers
- Multi-client testing support
- Automatic cleanup of connections

**Example Usage:**

```javascript
const { SocketTestUtils } = require('../test-utils');

describe('Socket Tests', () => {
  let socketUtils;

  beforeEach(async () => {
    socketUtils = new SocketTestUtils();
    await socketUtils.createSocketServer();
  });

  afterEach(async () => {
    await socketUtils.cleanup();
  });

  it('should handle real-time events', async () => {
    // Set up server-side handling
    socketUtils.io.on('connection', (socket) => {
      socket.on('progress-update', (data) => {
        socket.emit('progress-response', { status: 'received' });
      });
    });

    const client = await socketUtils.createClient();

    const response = await socketUtils.emitAndWait(
      client,
      'progress-update',
      { progress: 50 },
      'progress-response'
    );

    expect(response.status).toBe('received');
  });
});
```

### 4. MockFactories

Factory functions for generating consistent mock data across tests.

**Available Factories:**

- `createMockTicket(overrides)` - Generate mock ticket data
- `createMockVulnerability(overrides)` - Generate mock vulnerability data
- `createMockVulnerabilityImport(overrides)` - Generate mock import data
- `createMockRequest(overrides)` - Generate mock Express request objects
- `createMockResponse(overrides)` - Generate mock Express response objects
- `createMockSocket(overrides)` - Generate mock Socket.io socket objects

**Example Usage:**

```javascript
const { MockFactories } = require('../test-utils');

const testTicket = MockFactories.createMockTicket({
  location: 'Custom Location',
  status: 'Closed'
});

const testVuln = MockFactories.createMockVulnerability({
  severity: 'Critical',
  cvss_score: 9.8
});
```

### 5. AssertionHelpers

Custom assertion helpers for common testing patterns.

**Available Helpers:**

- `assertApiResponse(response, expectedStatus, expectedShape)` - Validate API responses
- `assertDatabaseRecord(db, table, whereClause, expectedFields)` - Validate database records
- `assertSocketEmission(mockSocket, event, expectedData)` - Validate Socket.io emissions
- `assertError(error, expectedMessage, expectedType)` - Validate error objects

**Example Usage:**

```javascript
const { AssertionHelpers } = require('../test-utils');

// Validate API response
AssertionHelpers.assertApiResponse(response, 200, {
  success: true,
  data: expect.objectContaining({ id: expect.any(Number) })
});

// Validate database record
await AssertionHelpers.assertDatabaseRecord(
  db,
  'tickets',
  { id: 'test-id' },
  { status: 'Open', location: 'Test Lab' }
);
```

### 6. GeneralTestUtils

General-purpose testing utilities for common testing needs.

**Available Utilities:**

- `sleep(ms)` - Async delay for timing tests
- `measurePerformance(fn)` - Measure execution time of async functions
- `retryOperation(operation, maxAttempts, baseDelay)` - Retry failed operations
- `generateRandomData(type, options)` - Generate random test data
- `cleanupFiles(filePaths)` - Clean up test artifacts

**Example Usage:**

```javascript
const { GeneralTestUtils } = require('../test-utils');

// Performance testing
const { result, duration } = await GeneralTestUtils.measurePerformance(async () => {
  return await expensiveOperation();
});

// Random data generation
const testIP = GeneralTestUtils.generateRandomData('ip');
const testHostname = GeneralTestUtils.generateRandomData('hostname');
const testString = GeneralTestUtils.generateRandomData('string', { length: 16 });

// Retry flaky operations
const result = await GeneralTestUtils.retryOperation(
  async () => await unreliableApiCall(),
  3, // max attempts
  100 // base delay ms
);
```

## Testing Best Practices

### Test Isolation

Always use proper setup and teardown to ensure tests don't interfere with each other:

```javascript
describe('Test Suite', () => {
  let dbUtils, expressUtils, socketUtils;

  beforeEach(async () => {
    dbUtils = new DatabaseTestUtils();
    expressUtils = new ExpressTestUtils();
    socketUtils = new SocketTestUtils();

    // Initialize as needed
    await dbUtils.createTestDatabase('test-suite');
    await dbUtils.initializeSchema();
  });

  afterEach(async () => {
    await dbUtils.cleanup();
    await expressUtils.stopServer();
    await socketUtils.cleanup();
  });

  // Your tests here...
});
```

### Database Transactions

Use transactions for better test isolation when testing database operations:

```javascript
it('should rollback changes on error', async () => {
  await dbUtils.beginTransaction();

  // Perform database operations that might fail
  try {
    await dbUtils.seedDatabase(testData);
    // Test operations...
  } finally {
    await dbUtils.rollbackTransaction();
  }
});
```

### Mock Data Consistency

Use the MockFactories for consistent test data across your test suite:

```javascript
const baseTicket = MockFactories.createMockTicket();
const urgentTicket = MockFactories.createMockTicket({
  status: 'Urgent',
  date_due: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
});
```

### Error Testing

Use AssertionHelpers for consistent error validation:

```javascript
it('should throw validation error for invalid input', () => {
  expect(() => {
    validateTicketData(invalidData);
  }).toThrow();

  try {
    validateTicketData(invalidData);
  } catch (error) {
    AssertionHelpers.assertError(error, 'Invalid ticket data', 'ValidationError');
  }
});
```

## Running Tests

Use the npm scripts defined in package.json:

```bash
# Run all tests
npm test

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:contract

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Contributing

When adding new utilities:

1. Follow the existing class-based structure
2. Include comprehensive JSDoc comments
3. Add example usage in the README
4. Create example tests demonstrating usage
5. Ensure proper cleanup in all utilities
6. Use consistent error handling patterns

## Dependencies

These utilities require the following packages (already installed):

- `jest` - Testing framework
- `supertest` - HTTP assertion library
- `socket.io` / `socket.io-client` - WebSocket testing
- `sqlite3` - Database operations
- `jest-mock-extended` - Advanced mocking capabilities
