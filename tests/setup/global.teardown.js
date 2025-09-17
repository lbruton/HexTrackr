/**
 * Global Jest Teardown
 * Runs once after all test suites
 */

const path = require("path");
const fs = require("fs").promises;

module.exports = async () => {
  // Clean up test temporary files
  const testTempDir = path.join(__dirname, "../temp");

  try {
    const files = await fs.readdir(testTempDir);
    const cleanupPromises = files.map(file => {
      const filePath = path.join(testTempDir, file);
      return fs.unlink(filePath).catch(err => {
        // Ignore errors for files that might be in use
        if (err.code !== "ENOENT" && err.code !== "EBUSY") {
          console.warn(`Warning: Could not clean up ${filePath}:`, err.message);
        }
      });
    });

    await Promise.all(cleanupPromises);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn("Warning: Could not clean up test temp directory:", error.message);
    }
  }

  console.log("Global Jest teardown completed");
};