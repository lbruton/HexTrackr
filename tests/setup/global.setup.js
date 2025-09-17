/**
 * Global Jest Setup
 * Runs once before all test suites
 */

const path = require("path");
const fs = require("fs").promises;

module.exports = async () => {
  // Set NODE_ENV to test
  process.env.NODE_ENV = "test";

  // Create test-specific directories if they don't exist
  const testDirs = [
    path.join(__dirname, "../fixtures"),
    path.join(__dirname, "../temp"),
    path.join(__dirname, "../coverage")
  ];

  for (const dir of testDirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      // Directory might already exist
      if (error.code !== "EEXIST") {
        console.warn(`Warning: Could not create directory ${dir}:`, error.message);
      }
    }
  }

  // Set up test database path
  process.env.TEST_DB_PATH = path.join(__dirname, "../temp/test.db");

  // Set up test environment variables
  process.env.PORT = "0"; // Use random available port for tests
  process.env.SOCKET_IO_CORS_ORIGIN = "http://localhost:3000";

  console.log("Global Jest setup completed");
};