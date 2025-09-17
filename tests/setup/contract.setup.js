/**
 * Contract Test Setup
 * Runs before each contract test suite
 */

const request = require("supertest");
const path = require("path");

// Set up for API contract testing
let testServer;
let testApp;

beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = "test";
  process.env.PORT = 0; // Use random available port
  process.env.TEST_DB_PATH = path.join(__dirname, "../temp/contract-test.db");

  // Mock console methods to reduce test output noise
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "info").mockImplementation(() => {});

  // Allow errors and warnings to show
  const originalError = console.error;
  const originalWarn = console.warn;
  console.error = originalError;
  console.warn = originalWarn;
});

afterAll(async () => {
  // Clean up server if it was started
  if (testServer && testServer.close) {
    return new Promise((resolve) => {
      testServer.close(() => {
        console.log("Test server closed");
        resolve();
      });
    });
  }

  // Restore console methods
  if (console.log.mockRestore) {
    console.log.mockRestore();
  }
  if (console.info.mockRestore) {
    console.info.mockRestore();
  }
});

beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up any test-specific state
  jest.restoreAllMocks();
});

// Helper function to create test request
global.createTestRequest = (app) => {
  return request(app);
};

// Mock external services for contract tests
jest.mock("socket.io", () => {
  const mockIo = {
    on: jest.fn(),
    emit: jest.fn(),
    to: jest.fn(() => mockIo),
    sockets: {
      emit: jest.fn()
    },
    close: jest.fn()
  };

  return {
    Server: jest.fn(() => mockIo)
  };
});

// Partial mock of SQLite for contract tests (allow real connections but mock problematic parts)
jest.mock("sqlite3", () => {
  const mockOriginalSqlite3 = jest.requireActual("sqlite3");
  return {
    ...mockOriginalSqlite3,
    Database: class MockDatabase extends mockOriginalSqlite3.Database {
      constructor(filename, ...args) {
        // Use in-memory database for contract tests
        super(":memory:", ...args);
      }
    }
  };
});

console.log("Contract test setup completed");