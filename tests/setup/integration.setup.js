/**
 * Integration Test Setup
 * Runs before each integration test suite
 */

const path = require("path");
const sqlite3 = require("sqlite3").verbose();

// Set up test database for integration tests
let testDb;

// Make testDb available globally
global.getTestDb = () => testDb;

beforeAll(async () => {
  // Create a test database
  const testDbPath = process.env.TEST_DB_PATH || path.join(__dirname, "../temp/integration-test.db");

  return new Promise((resolve, reject) => {
    testDb = new sqlite3.Database(testDbPath, (err) => {
      if (err) {
        console.error("Error creating test database:", err);
        reject(err);
      } else {
        console.log("Test database created for integration tests");

        // Initialize test database schema (if needed)
        // This should mirror your actual database initialization
        testDb.serialize(() => {
          // Add your table creation statements here
          testDb.run(`CREATE TABLE IF NOT EXISTS test_table (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
      }
    });
  });
});

afterAll(async () => {
  // Clean up test database
  if (testDb) {
    return new Promise((resolve) => {
      testDb.close((err) => {
        if (err) {
          console.error("Error closing test database:", err);
        } else {
          console.log("Test database closed");
        }
        resolve();
      });
    });
  }
});

beforeEach(() => {
  // Clear test data before each test
  if (testDb) {
    return new Promise((resolve, reject) => {
      testDb.run("DELETE FROM test_table", (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
});

// Mock Socket.IO with a more realistic implementation for integration tests
jest.mock("socket.io", () => {
  const mockServer = {
    on: jest.fn(),
    emit: jest.fn(),
    to: jest.fn(() => mockServer),
    sockets: {
      emit: jest.fn()
    },
    close: jest.fn()
  };

  return {
    Server: jest.fn(() => mockServer)
  };
});

// Set test environment
process.env.NODE_ENV = "test";

console.log("Integration test setup completed");