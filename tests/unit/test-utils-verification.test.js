/**
 * Test utilities verification - ensures all utilities work correctly
 */

const {
  DatabaseTestUtils,
  ExpressTestUtils,
  SocketTestUtils,
  MockFactories,
  AssertionHelpers,
  GeneralTestUtils
} = require('../test-utils');

describe('Test Utilities Verification', () => {
  it('should import all utility classes successfully', () => {
    expect(DatabaseTestUtils).toBeDefined();
    expect(ExpressTestUtils).toBeDefined();
    expect(SocketTestUtils).toBeDefined();
    expect(MockFactories).toBeDefined();
    expect(AssertionHelpers).toBeDefined();
    expect(GeneralTestUtils).toBeDefined();
  });

  it('should create mock ticket data with MockFactories', () => {
    const ticket = MockFactories.createMockTicket();

    expect(ticket).toHaveProperty('id');
    expect(ticket).toHaveProperty('xt_number');
    expect(ticket).toHaveProperty('location');
    expect(ticket).toHaveProperty('status');
    expect(ticket.status).toBe('Open');
    expect(ticket.location).toBe('Test Building A');

    // Test with overrides
    const customTicket = MockFactories.createMockTicket({
      location: 'Custom Location',
      status: 'Closed'
    });

    expect(customTicket.location).toBe('Custom Location');
    expect(customTicket.status).toBe('Closed');
  });

  it('should create mock vulnerability data', () => {
    const vuln = MockFactories.createMockVulnerability();

    expect(vuln).toHaveProperty('hostname');
    expect(vuln).toHaveProperty('cve');
    expect(vuln).toHaveProperty('severity');
    expect(['Critical', 'High', 'Medium', 'Low']).toContain(vuln.severity);
    expect(vuln.cvss_score).toBeGreaterThanOrEqual(0);
    expect(vuln.cvss_score).toBeLessThanOrEqual(10);
  });

  it('should generate random test data with GeneralTestUtils', () => {
    const randomString = GeneralTestUtils.generateRandomData('string', { length: 12 });
    expect(typeof randomString).toBe('string');
    expect(randomString.length).toBe(12);

    const randomNumber = GeneralTestUtils.generateRandomData('number', { min: 5, max: 15 });
    expect(randomNumber).toBeGreaterThanOrEqual(5);
    expect(randomNumber).toBeLessThanOrEqual(15);

    const randomIP = GeneralTestUtils.generateRandomData('ip');
    expect(randomIP).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);

    const randomHostname = GeneralTestUtils.generateRandomData('hostname');
    expect(randomHostname).toMatch(/^host-[a-z0-9]+$/);
  });

  it('should create Express test utilities', () => {
    const expressUtils = new ExpressTestUtils();

    expect(expressUtils).toBeDefined();
    expect(typeof expressUtils.createTestApp).toBe('function');
    expect(typeof expressUtils.createRequest).toBe('function');
    expect(typeof expressUtils.createAuthenticatedRequest).toBe('function');
    expect(typeof expressUtils.startServer).toBe('function');
    expect(typeof expressUtils.stopServer).toBe('function');
  });

  it('should create database test utilities', () => {
    const dbUtils = new DatabaseTestUtils();

    expect(dbUtils).toBeDefined();
    expect(typeof dbUtils.createTestDatabase).toBe('function');
    expect(typeof dbUtils.initializeSchema).toBe('function');
    expect(typeof dbUtils.seedDatabase).toBe('function');
    expect(typeof dbUtils.beginTransaction).toBe('function');
    expect(typeof dbUtils.rollbackTransaction).toBe('function');
    expect(typeof dbUtils.cleanup).toBe('function');
  });

  it('should create Socket.io test utilities', () => {
    const socketUtils = new SocketTestUtils();

    expect(socketUtils).toBeDefined();
    expect(typeof socketUtils.createSocketServer).toBe('function');
    expect(typeof socketUtils.createClient).toBe('function');
    expect(typeof socketUtils.waitForEvent).toBe('function');
    expect(typeof socketUtils.emitAndWait).toBe('function');
    expect(typeof socketUtils.cleanup).toBe('function');
  });

  it('should validate AssertionHelpers functionality', () => {
    // Test error assertion
    const testError = new TypeError('Test error message');
    expect(() => {
      AssertionHelpers.assertError(testError, 'Test error', 'TypeError');
    }).not.toThrow();

    // Test with wrong error type should throw
    expect(() => {
      AssertionHelpers.assertError(testError, 'Test error', 'ReferenceError');
    }).toThrow();
  });

  it('should handle performance measurement', async () => {
    const testOperation = async () => {
      await GeneralTestUtils.sleep(50); // Sleep for 50ms
      return 'test complete';
    };

    const { result, duration } = await GeneralTestUtils.measurePerformance(testOperation);

    expect(result).toBe('test complete');
    expect(duration).toBeGreaterThan(40); // Should be around 50ms with some tolerance
    expect(duration).toBeLessThan(200);   // Upper bound with generous tolerance
  });

  it('should handle retry operations', async () => {
    let attempts = 0;

    const flakyOperation = async () => {
      attempts++;
      if (attempts < 2) {
        throw new Error('Flaky operation failed');
      }
      return 'success';
    };

    const result = await GeneralTestUtils.retryOperation(flakyOperation, 3, 10);

    expect(result).toBe('success');
    expect(attempts).toBe(2);
  });

  it('should create mock Express objects', () => {
    const mockReq = MockFactories.createMockRequest({
      method: 'POST',
      url: '/api/test',
      body: { test: 'data' }
    });

    expect(mockReq.method).toBe('POST');
    expect(mockReq.url).toBe('/api/test');
    expect(mockReq.body).toEqual({ test: 'data' });

    const mockRes = MockFactories.createMockResponse();
    expect(mockRes.status).toBeDefined();
    expect(mockRes.json).toBeDefined();
    expect(typeof mockRes.status).toBe('function');
    expect(typeof mockRes.json).toBe('function');
  });

  it('should create mock Socket.io objects', () => {
    const mockSocket = MockFactories.createMockSocket({
      connected: false
    });

    expect(mockSocket.id).toBeDefined();
    expect(mockSocket.emit).toBeDefined();
    expect(mockSocket.connected).toBe(false);
    expect(typeof mockSocket.emit).toBe('function');
  });
});