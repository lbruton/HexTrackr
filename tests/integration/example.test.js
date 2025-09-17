/**
 * Example Integration Test
 * Demonstrates integration testing setup and patterns
 */

const { describe, test, expect } = require("@jest/globals");

describe("Example Integration Test Suite", () => {
  test("should demonstrate integration testing setup", () => {
    expect(process.env.NODE_ENV).toBe("test");
  });

  test("should have access to test database", () => {
    // The testDb is available via global.getTestDb() from integration.setup.js
    expect(global.getTestDb()).toBeDefined();
  });

  test("should handle database operations", async () => {
    const testData = { name: "Test Item" };

    // Insert test data
    await new Promise((resolve, reject) => {
      global.getTestDb().run(
        "INSERT INTO test_table (name) VALUES (?)",
        [testData.name],
        function(err) {
          if (err) {reject(err);}
          else {resolve(this.lastID);}
        }
      );
    });

    // Verify data was inserted
    const result = await new Promise((resolve, reject) => {
      global.getTestDb().get(
        "SELECT * FROM test_table WHERE name = ?",
        [testData.name],
        (err, row) => {
          if (err) {reject(err);}
          else {resolve(row);}
        }
      );
    });

    expect(result).toBeDefined();
    expect(result.name).toBe(testData.name);
  });

  test("should clean up between tests", async () => {
    // Data should be clean due to beforeEach in setup
    const count = await new Promise((resolve, reject) => {
      global.getTestDb().get(
        "SELECT COUNT(*) as count FROM test_table",
        (err, row) => {
          if (err) {reject(err);}
          else {resolve(row.count);}
        }
      );
    });

    expect(count).toBe(0);
  });

  test("should handle Socket.IO mocking", () => {
    const { Server } = require("socket.io");
    const io = new Server();

    expect(Server).toHaveBeenCalled();
    expect(typeof io.on).toBe("function");
    expect(typeof io.emit).toBe("function");
  });
});