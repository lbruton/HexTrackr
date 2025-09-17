/**
 * HexTrackr Test Utilities
 * Comprehensive testing utilities for unit, integration, and contract tests
 * Supports Express.js, SQLite, Socket.io, and mock data generation
 */

const express = require('express');
const request = require('supertest');
// Handle both real and mocked sqlite3 environments
let sqlite3;
try {
  // In test environment, sqlite3 is mocked and doesn't have .verbose()
  const sqlite3Module = require('sqlite3');
  sqlite3 = sqlite3Module.verbose ? sqlite3Module.verbose() : sqlite3Module;
} catch (error) {
  sqlite3 = require('sqlite3');
}
const path = require('path');
const fs = require('fs');
const { Server } = require('socket.io');
const Client = require('socket.io-client');
const http = require('http');
const crypto = require('crypto');

// =============================================================================
// DATABASE UTILITIES
// =============================================================================

class DatabaseTestUtils {
  constructor() {
    this.testDbPath = null;
    this.db = null;
    this.transactions = [];
  }

  /**
   * Create a test database with a unique name
   * @param {string} testName - Name of the test for unique database naming
   * @returns {Promise<sqlite3.Database>}
   */
  async createTestDatabase(testName = 'test') {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    this.testDbPath = path.join(__dirname, `test-db-${testName}-${timestamp}-${randomId}.db`);

    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.testDbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(this.db);
        }
      });
    });
  }

  /**
   * Initialize test database with schema
   * @returns {Promise<void>}
   */
  async initializeSchema() {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Tickets table
        this.db.run(`CREATE TABLE IF NOT EXISTS tickets (
          id TEXT PRIMARY KEY,
          xt_number TEXT UNIQUE,
          date_submitted TEXT,
          date_due TEXT,
          hexagon_ticket TEXT,
          service_now_ticket TEXT,
          location TEXT NOT NULL,
          devices TEXT,
          supervisor TEXT,
          tech TEXT,
          status TEXT DEFAULT 'Open',
          notes TEXT,
          attachments TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          site TEXT,
          site_id TEXT,
          location_id TEXT
        )`);

        // Vulnerability imports table
        this.db.run(`CREATE TABLE IF NOT EXISTS vulnerability_imports (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          filename TEXT NOT NULL,
          import_date TEXT NOT NULL,
          row_count INTEGER NOT NULL,
          vendor TEXT,
          file_size INTEGER,
          processing_time INTEGER,
          raw_headers TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Vulnerabilities table
        this.db.run(`CREATE TABLE IF NOT EXISTS vulnerabilities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          import_id INTEGER NOT NULL,
          hostname TEXT,
          ip_address TEXT,
          cve TEXT,
          severity TEXT,
          vpr_score REAL,
          cvss_score REAL,
          first_seen TEXT,
          last_seen TEXT,
          plugin_id TEXT,
          plugin_name TEXT,
          description TEXT,
          solution TEXT,
          vendor_reference TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (import_id) REFERENCES vulnerability_imports (id)
        )`);

        // Junction table for ticket-vulnerability relationships
        this.db.run(`CREATE TABLE IF NOT EXISTS ticket_vulnerabilities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ticket_id TEXT NOT NULL,
          vulnerability_id INTEGER NOT NULL,
          relationship_type TEXT DEFAULT 'remediation',
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (ticket_id) REFERENCES tickets (id),
          FOREIGN KEY (vulnerability_id) REFERENCES vulnerabilities (id)
        )`, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });

        // Create indexes
        this.db.run("CREATE INDEX IF NOT EXISTS idx_vulnerabilities_hostname ON vulnerabilities (hostname)");
        this.db.run("CREATE INDEX IF NOT EXISTS idx_vulnerabilities_severity ON vulnerabilities (severity)");
        this.db.run("CREATE INDEX IF NOT EXISTS idx_vulnerabilities_cve ON vulnerabilities (cve)");
        this.db.run("CREATE INDEX IF NOT EXISTS idx_vulnerabilities_import ON vulnerabilities (import_id)");
        this.db.run("CREATE INDEX IF NOT EXISTS idx_ticket_vulns_ticket ON ticket_vulnerabilities (ticket_id)");
      });
    });
  }

  /**
   * Start a database transaction for test isolation
   * @returns {Promise<void>}
   */
  async beginTransaction() {
    return new Promise((resolve, reject) => {
      this.db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
          reject(err);
        } else {
          this.transactions.push('TRANSACTION_STARTED');
          resolve();
        }
      });
    });
  }

  /**
   * Rollback transaction to restore database state
   * @returns {Promise<void>}
   */
  async rollbackTransaction() {
    return new Promise((resolve, reject) => {
      this.db.run('ROLLBACK', (err) => {
        if (err) {
          reject(err);
        } else {
          this.transactions.pop();
          resolve();
        }
      });
    });
  }

  /**
   * Seed the database with test data
   * @param {Object} seedData - Object containing arrays of data for each table
   * @returns {Promise<void>}
   */
  async seedDatabase(seedData = {}) {
    const {
      tickets = [],
      vulnerabilityImports = [],
      vulnerabilities = [],
      ticketVulnerabilities = []
    } = seedData;

    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Seed tickets
        const ticketStmt = this.db.prepare(`
          INSERT INTO tickets (id, xt_number, location, status, tech, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        tickets.forEach(ticket => {
          ticketStmt.run(
            ticket.id || crypto.randomUUID(),
            ticket.xt_number || `XT-${Math.floor(Math.random() * 10000)}`,
            ticket.location || 'Test Location',
            ticket.status || 'Open',
            ticket.tech || 'Test Tech',
            ticket.created_at || new Date().toISOString()
          );
        });
        ticketStmt.finalize();

        // Seed vulnerability imports
        const importStmt = this.db.prepare(`
          INSERT INTO vulnerability_imports (filename, import_date, row_count, vendor)
          VALUES (?, ?, ?, ?)
        `);

        vulnerabilityImports.forEach(importData => {
          importStmt.run(
            importData.filename || 'test-import.csv',
            importData.import_date || new Date().toISOString(),
            importData.row_count || 100,
            importData.vendor || 'test-vendor'
          );
        });
        importStmt.finalize();

        // Seed vulnerabilities
        const vulnStmt = this.db.prepare(`
          INSERT INTO vulnerabilities (import_id, hostname, ip_address, cve, severity, cvss_score)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        vulnerabilities.forEach(vuln => {
          vulnStmt.run(
            vuln.import_id || 1,
            vuln.hostname || 'test-host',
            vuln.ip_address || '192.168.1.100',
            vuln.cve || 'CVE-2023-0001',
            vuln.severity || 'Medium',
            vuln.cvss_score || 5.0
          );
        });
        vulnStmt.finalize((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  }

  /**
   * Clean up test database
   * @returns {Promise<void>}
   */
  async cleanup() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close(() => {
          if (this.testDbPath && fs.existsSync(this.testDbPath)) {
            fs.unlinkSync(this.testDbPath);
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Clear all data from test database tables
   * @returns {Promise<void>}
   */
  async clearAllTables() {
    const tables = ['ticket_vulnerabilities', 'vulnerabilities', 'vulnerability_imports', 'tickets'];

    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        tables.forEach(table => {
          this.db.run(`DELETE FROM ${table}`);
        });
        this.db.run('VACUUM', (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  }
}

// =============================================================================
// EXPRESS APP HELPERS
// =============================================================================

class ExpressTestUtils {
  constructor() {
    this.app = null;
    this.server = null;
  }

  /**
   * Create a test Express app with common middleware
   * @param {Object} options - Configuration options
   * @returns {express.Application}
   */
  createTestApp(options = {}) {
    const {
      enableCors = true,
      enableCompression = false,
      enableJson = true,
      customMiddleware = []
    } = options;

    this.app = express();

    if (enableCors) {
      const cors = require('cors');
      this.app.use(cors());
    }

    if (enableCompression) {
      const compression = require('compression');
      this.app.use(compression());
    }

    if (enableJson) {
      this.app.use(express.json());
      this.app.use(express.urlencoded({ extended: true }));
    }

    // Add custom middleware
    customMiddleware.forEach(middleware => {
      this.app.use(middleware);
    });

    return this.app;
  }

  /**
   * Create a request builder with common headers and authentication
   * @param {string} method - HTTP method (get, post, put, delete, etc.)
   * @param {string} path - Request path
   * @returns {request.Test}
   */
  createRequest(method = 'get', path = '/') {
    if (!this.app) {
      throw new Error('App not created. Call createTestApp() first.');
    }

    return request(this.app)[method](path)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
  }

  /**
   * Create an authenticated request (placeholder for future auth system)
   * @param {string} method - HTTP method
   * @param {string} path - Request path
   * @param {string} token - Auth token
   * @returns {request.Test}
   */
  createAuthenticatedRequest(method = 'get', path = '/', token = 'test-token') {
    return this.createRequest(method, path)
      .set('Authorization', `Bearer ${token}`);
  }

  /**
   * Start test server on a random port
   * @returns {Promise<number>} Port number
   */
  async startServer() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(0, (err) => {
        if (err) {
          reject(err);
        } else {
          const port = this.server.address().port;
          resolve(port);
        }
      });
    });
  }

  /**
   * Stop test server
   * @returns {Promise<void>}
   */
  async stopServer() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

// =============================================================================
// SOCKET.IO TEST HELPERS
// =============================================================================

class SocketTestUtils {
  constructor() {
    this.server = null;
    this.io = null;
    this.clients = [];
    this.port = null;
  }

  /**
   * Create Socket.io test server
   * @param {Object} options - Socket.io server options
   * @returns {Promise<number>} Port number
   */
  async createSocketServer(options = {}) {
    const httpServer = http.createServer();
    this.server = httpServer;

    this.io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
      ...options
    });

    return new Promise((resolve, reject) => {
      httpServer.listen(0, (err) => {
        if (err) {
          reject(err);
        } else {
          this.port = httpServer.address().port;
          resolve(this.port);
        }
      });
    });
  }

  /**
   * Create a test client connection
   * @param {Object} options - Client options
   * @returns {Promise<Socket>} Client socket
   */
  async createClient(options = {}) {
    if (!this.port) {
      throw new Error('Socket server not started. Call createSocketServer() first.');
    }

    const client = Client(`http://localhost:${this.port}`, {
      transports: ['websocket'],
      ...options
    });

    return new Promise((resolve, reject) => {
      client.on('connect', () => {
        this.clients.push(client);
        resolve(client);
      });

      client.on('connect_error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Wait for a specific event on a socket
   * @param {Socket} socket - Socket to listen on
   * @param {string} event - Event name
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<any>} Event data
   */
  waitForEvent(socket, event, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timeout waiting for event: ${event}`));
      }, timeout);

      socket.once(event, (data) => {
        clearTimeout(timer);
        resolve(data);
      });
    });
  }

  /**
   * Emit event and wait for response
   * @param {Socket} socket - Socket to use
   * @param {string} event - Event to emit
   * @param {any} data - Data to send
   * @param {string} responseEvent - Event to wait for
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<any>} Response data
   */
  async emitAndWait(socket, event, data, responseEvent, timeout = 5000) {
    const responsePromise = this.waitForEvent(socket, responseEvent, timeout);
    socket.emit(event, data);
    return responsePromise;
  }

  /**
   * Clean up all socket connections and server
   * @returns {Promise<void>}
   */
  async cleanup() {
    // Close all client connections
    this.clients.forEach(client => {
      if (client.connected) {
        client.disconnect();
      }
    });
    this.clients = [];

    // Close Socket.io server
    if (this.io) {
      this.io.close();
    }

    // Close HTTP server
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          resolve();
        });
      });
    }
  }
}

// =============================================================================
// MOCK FACTORIES
// =============================================================================

class MockFactories {
  /**
   * Generate mock ticket data
   * @param {Object} overrides - Properties to override
   * @returns {Object} Mock ticket
   */
  static createMockTicket(overrides = {}) {
    const defaultTicket = {
      id: crypto.randomUUID(),
      xt_number: `XT-${Math.floor(Math.random() * 10000)}`,
      date_submitted: new Date().toISOString().split('T')[0],
      date_due: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      hexagon_ticket: `HEX-${Math.floor(Math.random() * 10000)}`,
      service_now_ticket: `INC${Math.floor(Math.random() * 1000000)}`,
      location: 'Test Building A',
      devices: JSON.stringify(['Server-01', 'Workstation-02']),
      supervisor: 'Test Supervisor',
      tech: 'Test Technician',
      status: 'Open',
      notes: 'Test ticket for automated testing',
      attachments: JSON.stringify([]),
      site: 'Test Site',
      site_id: 'TS-001',
      location_id: 'TL-001'
    };

    return { ...defaultTicket, ...overrides };
  }

  /**
   * Generate mock vulnerability data
   * @param {Object} overrides - Properties to override
   * @returns {Object} Mock vulnerability
   */
  static createMockVulnerability(overrides = {}) {
    const severities = ['Critical', 'High', 'Medium', 'Low'];
    const defaultVuln = {
      import_id: 1,
      hostname: `test-host-${Math.floor(Math.random() * 100)}`,
      ip_address: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
      cve: `CVE-2023-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      severity: severities[Math.floor(Math.random() * severities.length)],
      vpr_score: Math.random() * 10,
      cvss_score: Math.random() * 10,
      first_seen: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      last_seen: new Date().toISOString(),
      plugin_id: Math.floor(Math.random() * 100000).toString(),
      plugin_name: 'Test Security Plugin',
      description: 'Test vulnerability for automated testing',
      solution: 'Apply security patches and updates',
      vendor_reference: 'https://test-vendor.com/advisory/123'
    };

    return { ...defaultVuln, ...overrides };
  }

  /**
   * Generate mock vulnerability import data
   * @param {Object} overrides - Properties to override
   * @returns {Object} Mock import
   */
  static createMockVulnerabilityImport(overrides = {}) {
    const vendors = ['tenable', 'qualys', 'rapid7', 'nessus'];
    const defaultImport = {
      filename: `test-scan-${Date.now()}.csv`,
      import_date: new Date().toISOString(),
      row_count: Math.floor(Math.random() * 1000) + 50,
      vendor: vendors[Math.floor(Math.random() * vendors.length)],
      file_size: Math.floor(Math.random() * 1000000) + 10000,
      processing_time: Math.floor(Math.random() * 5000) + 500,
      raw_headers: JSON.stringify(['Hostname', 'IP Address', 'CVE', 'Severity', 'CVSS Score'])
    };

    return { ...defaultImport, ...overrides };
  }

  /**
   * Generate mock Express request object
   * @param {Object} overrides - Properties to override
   * @returns {Object} Mock request
   */
  static createMockRequest(overrides = {}) {
    const defaultReq = {
      method: 'GET',
      url: '/',
      headers: {
        'content-type': 'application/json',
        'user-agent': 'Test Agent'
      },
      body: {},
      params: {},
      query: {},
      cookies: {}
    };

    return { ...defaultReq, ...overrides };
  }

  /**
   * Generate mock Express response object
   * @param {Object} overrides - Properties to override
   * @returns {Object} Mock response
   */
  static createMockResponse(overrides = {}) {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      header: jest.fn().mockReturnThis(),
      redirect: jest.fn().mockReturnThis(),
      statusCode: 200,
      ...overrides
    };

    return res;
  }

  /**
   * Generate mock Socket.io socket object
   * @param {Object} overrides - Properties to override
   * @returns {Object} Mock socket
   */
  static createMockSocket(overrides = {}) {
    const socket = {
      id: crypto.randomUUID(),
      emit: jest.fn(),
      on: jest.fn(),
      once: jest.fn(),
      off: jest.fn(),
      join: jest.fn(),
      leave: jest.fn(),
      disconnect: jest.fn(),
      connected: true,
      rooms: new Set(),
      handshake: {
        address: '127.0.0.1',
        headers: {},
        query: {}
      },
      ...overrides
    };

    return socket;
  }
}

// =============================================================================
// ASSERTION HELPERS
// =============================================================================

class AssertionHelpers {
  /**
   * Assert that response has expected structure
   * @param {Object} response - Supertest response
   * @param {number} expectedStatus - Expected status code
   * @param {Object} expectedShape - Expected response shape
   */
  static assertApiResponse(response, expectedStatus = 200, expectedShape = {}) {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toMatchObject(expectedShape);
  }

  /**
   * Assert that database record exists with expected properties
   * @param {sqlite3.Database} db - Database instance
   * @param {string} table - Table name
   * @param {Object} whereClause - WHERE conditions
   * @param {Object} expectedFields - Expected field values
   * @returns {Promise<void>}
   */
  static async assertDatabaseRecord(db, table, whereClause, expectedFields = {}) {
    const whereKeys = Object.keys(whereClause);
    const whereValues = Object.values(whereClause);
    const whereClauseStr = whereKeys.map(key => `${key} = ?`).join(' AND ');

    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM ${table} WHERE ${whereClauseStr}`,
        whereValues,
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }

          expect(row).toBeDefined();
          if (Object.keys(expectedFields).length > 0) {
            expect(row).toMatchObject(expectedFields);
          }
          resolve();
        }
      );
    });
  }

  /**
   * Assert that Socket.io event was emitted with expected data
   * @param {Object} mockSocket - Mock socket object
   * @param {string} event - Event name
   * @param {any} expectedData - Expected event data
   */
  static assertSocketEmission(mockSocket, event, expectedData = undefined) {
    expect(mockSocket.emit).toHaveBeenCalled();

    if (expectedData !== undefined) {
      expect(mockSocket.emit).toHaveBeenCalledWith(event, expectedData);
    } else {
      expect(mockSocket.emit).toHaveBeenCalledWith(expect.stringContaining(event), expect.anything());
    }
  }

  /**
   * Assert that error has expected properties
   * @param {Error} error - Error object
   * @param {string} expectedMessage - Expected error message
   * @param {string} expectedType - Expected error type/name
   */
  static assertError(error, expectedMessage = '', expectedType = 'Error') {
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe(expectedType);

    if (expectedMessage) {
      expect(error.message).toContain(expectedMessage);
    }
  }
}

// =============================================================================
// GENERAL UTILITIES
// =============================================================================

class GeneralTestUtils {
  /**
   * Wait for a specified amount of time
   * @param {number} ms - Milliseconds to wait
   * @returns {Promise<void>}
   */
  static async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Measure execution time of an async function
   * @param {Function} fn - Async function to measure
   * @returns {Promise<{result: any, duration: number}>}
   */
  static async measurePerformance(fn) {
    const startTime = performance.now();
    const result = await fn();
    const endTime = performance.now();
    const duration = endTime - startTime;

    return { result, duration };
  }

  /**
   * Retry an async operation with exponential backoff
   * @param {Function} operation - Async operation to retry
   * @param {number} maxAttempts - Maximum number of attempts
   * @param {number} baseDelay - Base delay in milliseconds
   * @returns {Promise<any>}
   */
  static async retryOperation(operation, maxAttempts = 3, baseDelay = 100) {
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === maxAttempts) {
          break;
        }

        const delay = baseDelay * Math.pow(2, attempt - 1);
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Generate random test data
   * @param {string} type - Type of data to generate
   * @param {Object} options - Generation options
   * @returns {any}
   */
  static generateRandomData(type, options = {}) {
    switch (type) {
      case 'string':
        const length = options.length || 10;
        let result = '';
        while (result.length < length) {
          result += Math.random().toString(36).substring(2);
        }
        return result.substring(0, length);

      case 'number':
        const min = options.min || 0;
        const max = options.max || 100;
        return Math.floor(Math.random() * (max - min + 1)) + min;

      case 'boolean':
        return Math.random() < 0.5;

      case 'date':
        const start = options.start || new Date(2020, 0, 1);
        const end = options.end || new Date();
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

      case 'ip':
        return Array.from({length: 4}, () => Math.floor(Math.random() * 256)).join('.');

      case 'hostname':
        return `host-${this.generateRandomData('string', {length: 8})}`;

      default:
        throw new Error(`Unknown data type: ${type}`);
    }
  }

  /**
   * Clean up test artifacts
   * @param {Array<string>} filePaths - File paths to clean up
   * @returns {Promise<void>}
   */
  static async cleanupFiles(filePaths) {
    const promises = filePaths.map(filePath => {
      return new Promise(resolve => {
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, () => resolve());
        } else {
          resolve();
        }
      });
    });

    await Promise.all(promises);
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  DatabaseTestUtils,
  ExpressTestUtils,
  SocketTestUtils,
  MockFactories,
  AssertionHelpers,
  GeneralTestUtils
};