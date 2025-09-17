/**
 * CSV Import Pipeline Integration Tests
 *
 * T015: Integration test for CSV import pipeline - TDD Implementation
 *
 * This test suite covers the complete CSV import workflow including:
 * - File upload and validation
 * - CSV parsing and transformation
 * - Database batch insertion
 * - Progress tracking via WebSocket
 * - Error handling and rollback
 * - Large file handling (100k+ rows)
 *
 * Tests are designed to FAIL initially (TDD Red phase) until the
 * implementation is complete.
 */

const { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } = require("@jest/globals");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const express = require("express");
const http = require("http");
const { Server: SocketIOServer } = require("socket.io");
const Client = require("socket.io-client");
const Papa = require("papaparse");

const {
  DatabaseTestUtils,
  ExpressTestUtils,
  SocketTestUtils,
  MockFactories,
  AssertionHelpers,
  GeneralTestUtils
} = require("../test-utils");

describe("CSV Import Pipeline Integration Tests", () => {
  let databaseUtils;
  let expressUtils;
  let socketUtils;
  let testApp;
  let testDb;
  let serverPort;
  let socketClient;
  let testFilePaths = [];

  beforeAll(async () => {
    // Initialize test utilities
    databaseUtils = new DatabaseTestUtils();
    expressUtils = new ExpressTestUtils();
    socketUtils = new SocketTestUtils();

    // Create test database with CSV import schema
    testDb = await databaseUtils.createTestDatabase("csv-import-pipeline");
    await databaseUtils.initializeSchema();

    // Setup Express app with CSV import routes
    testApp = expressUtils.createTestApp({
      enableCors: true,
      enableJson: true
    });

    // Setup Socket.IO server for progress tracking
    const socketPort = await socketUtils.createSocketServer();

    // Mock the CSV import routes that we expect to exist
    setupCSVImportRoutes(testApp, testDb, socketUtils.io);

    // Start the Express server
    serverPort = await expressUtils.startServer();

    // Create Socket.IO client for testing progress tracking
    socketClient = await socketUtils.createClient();
  }, 30000); // Increase timeout to 30 seconds

  afterAll(async () => {
    // Cleanup all connections and test data
    await socketUtils.cleanup();
    await expressUtils.stopServer();
    await databaseUtils.cleanup();

    // Cleanup test files
    await GeneralTestUtils.cleanupFiles(testFilePaths);
  }, 30000); // Increase timeout to 30 seconds

  beforeEach(async () => {
    // Clear all tables and reset state for each test
    await databaseUtils.clearAllTables();
    testFilePaths = [];
  });

  afterEach(async () => {
    // Cleanup any files created during the test
    await GeneralTestUtils.cleanupFiles(testFilePaths);
  });

  describe("File Upload and Validation", () => {
    test("should accept valid CSV file upload", async () => {
      // Create a test CSV file
      const testCsvPath = await createTestCSVFile("valid-vulnerabilities.csv", [
        { hostname: "server-01", ip_address: "192.168.1.100", cve: "CVE-2023-0001", severity: "High" },
        { hostname: "server-02", ip_address: "192.168.1.101", cve: "CVE-2023-0002", severity: "Medium" }
      ]);

      const response = await expressUtils
        .createRequest("post", "/api/vulnerabilities/import")
        .attach("csvFile", testCsvPath)
        .field("vendor", "test-vendor")
        .field("scanDate", "2023-01-01");

      // EXPECTED TO FAIL: Route doesn't exist yet
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.sessionId).toBeDefined();
    });

    test("should reject non-CSV file uploads", async () => {
      // Create a test text file (not CSV)
      const testTxtPath = path.join(__dirname, "../temp/test-file.txt");
      fs.writeFileSync(testTxtPath, "This is not a CSV file");
      testFilePaths.push(testTxtPath);

      const response = await expressUtils
        .createRequest("post", "/api/vulnerabilities/import")
        .attach("csvFile", testTxtPath)
        .field("vendor", "test-vendor");

      // EXPECTED TO FAIL: File validation not implemented
      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Invalid file type");
    });

    test("should reject files exceeding size limit", async () => {
      // Create a large CSV file (over 100MB)
      const largeCsvPath = await createLargeTestCSVFile("large-file.csv", 150 * 1024 * 1024); // 150MB

      const response = await expressUtils
        .createRequest("post", "/api/vulnerabilities/import")
        .attach("csvFile", largeCsvPath);

      // EXPECTED TO FAIL: Size validation not properly configured
      expect(response.status).toBe(400);
      expect(response.body.error).toContain("File too large");
    });

    test("should validate required CSV headers", async () => {
      // Create CSV with invalid headers
      const invalidCsvPath = await createTestCSVFile("invalid-headers.csv", [
        { wrong_header: "value1", another_wrong: "value2" }
      ]);

      const response = await expressUtils
        .createRequest("post", "/api/vulnerabilities/import")
        .attach("csvFile", invalidCsvPath)
        .field("vendor", "test-vendor");

      // EXPECTED TO FAIL: Header validation not implemented
      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Invalid CSV headers");
    });
  });

  describe("CSV Parsing and Transformation", () => {
    test("should parse valid CSV and transform data correctly", async () => {
      const testData = [
        {
          hostname: "web-server-01",
          ip_address: "10.1.1.100",
          cve: "CVE-2023-1234",
          severity: "Critical",
          cvss_score: "9.8",
          plugin_id: "12345",
          first_seen: "2023-01-01",
          last_seen: "2023-01-15"
        },
        {
          hostname: "db-server-01",
          ip_address: "10.1.1.200",
          cve: "CVE-2023-5678",
          severity: "High",
          cvss_score: "7.5",
          plugin_id: "67890",
          first_seen: "2023-01-02",
          last_seen: "2023-01-16"
        }
      ];

      const testCsvPath = await createTestCSVFile("parse-test.csv", testData);

      const response = await expressUtils
        .createRequest("post", "/api/vulnerabilities/import")
        .attach("csvFile", testCsvPath)
        .field("vendor", "tenable")
        .field("scanDate", "2023-01-01");

      // EXPECTED TO FAIL: Parsing logic not complete
      expect(response.status).toBe(200);

      // Wait for processing to complete
      await GeneralTestUtils.sleep(2000);

      // Verify data was transformed and stored correctly
      const vulnerabilities = await getDatabaseRecords("vulnerabilities");
      expect(vulnerabilities).toHaveLength(2);
      expect(vulnerabilities[0].hostname).toBe("web-server-01");
      expect(vulnerabilities[1].cve).toBe("CVE-2023-5678");
    });

    test("should handle malformed CSV data gracefully", async () => {
      // Create CSV with malformed data
      const malformedCsvPath = path.join(__dirname, "../temp/malformed.csv");
      const malformedContent = `hostname,ip_address,cve,severity
web-server-01,10.1.1.100,CVE-2023-1234,Critical
broken line without enough columns
db-server-01,10.1.1.200,"CVE-2023-5678,High`;

      fs.writeFileSync(malformedCsvPath, malformedContent);
      testFilePaths.push(malformedCsvPath);

      const response = await expressUtils
        .createRequest("post", "/api/vulnerabilities/import")
        .attach("csvFile", malformedCsvPath)
        .field("vendor", "test-vendor");

      // EXPECTED TO FAIL: Malformed data handling not implemented
      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Malformed CSV data");
    });

    test("should normalize and validate data types", async () => {
      const testData = [
        {
          hostname: "  WEB-SERVER-01  ", // Extra whitespace
          ip_address: "192.168.1.100",
          cve: "cve-2023-1234", // Lowercase CVE
          severity: "high", // Lowercase severity
          cvss_score: "9.8000", // Extra decimal places
          vpr_score: "invalid_number", // Invalid number
          first_seen: "2023/01/01", // Different date format
          last_seen: "01-15-2023" // Different date format
        }
      ];

      const testCsvPath = await createTestCSVFile("normalize-test.csv", testData);

      const response = await expressUtils
        .createRequest("post", "/api/vulnerabilities/import")
        .attach("csvFile", testCsvPath)
        .field("vendor", "test-vendor");

      // EXPECTED TO FAIL: Data normalization not implemented
      expect(response.status).toBe(200);

      await GeneralTestUtils.sleep(1000);

      const vulnerabilities = await getDatabaseRecords("vulnerabilities");
      expect(vulnerabilities[0].hostname).toBe("WEB-SERVER-01"); // Trimmed and uppercase
      expect(vulnerabilities[0].cve).toBe("CVE-2023-1234"); // Uppercase CVE
      expect(vulnerabilities[0].severity).toBe("High"); // Capitalized severity
      expect(vulnerabilities[0].cvss_score).toBe(9.8); // Normalized number
      expect(vulnerabilities[0].vpr_score).toBeNull(); // Invalid number set to null
    });
  });

  describe("Database Batch Insertion", () => {
    test("should perform batch insertion for large datasets", async () => {
      // Create dataset with 1000 records
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        hostname: `server-${i.toString().padStart(4, "0")}`,
        ip_address: `192.168.${Math.floor(i / 254) + 1}.${(i % 254) + 1}`,
        cve: `CVE-2023-${i.toString().padStart(4, "0")}`,
        severity: ["Critical", "High", "Medium", "Low"][i % 4],
        cvss_score: (Math.random() * 10).toFixed(1)
      }));

      const largeCsvPath = await createTestCSVFile("large-batch.csv", largeDataset);

      const startTime = Date.now();
      const response = await expressUtils
        .createRequest("post", "/api/vulnerabilities/import")
        .attach("csvFile", largeCsvPath)
        .field("vendor", "batch-test");

      // EXPECTED TO FAIL: Batch insertion optimization not implemented
      expect(response.status).toBe(200);

      // Wait for processing
      await GeneralTestUtils.sleep(5000);

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Verify all records were inserted
      const vulnerabilities = await getDatabaseRecords("vulnerabilities");
      expect(vulnerabilities).toHaveLength(1000);

      // Performance check - should complete within reasonable time
      expect(processingTime).toBeLessThan(10000); // 10 seconds max
    });

    test("should use database transactions for atomicity", async () => {
      const testData = [
        { hostname: "server-01", ip_address: "192.168.1.100", cve: "CVE-2023-0001", severity: "High" },
        { hostname: "server-02", ip_address: "192.168.1.101", cve: "CVE-2023-0002", severity: "Medium" },
        { hostname: "server-03", ip_address: "invalid-ip", cve: "INVALID-CVE", severity: "Critical" } // Invalid data
      ];

      const testCsvPath = await createTestCSVFile("transaction-test.csv", testData);

      const response = await expressUtils
        .createRequest("post", "/api/vulnerabilities/import")
        .attach("csvFile", testCsvPath)
        .field("vendor", "transaction-test");

      // EXPECTED TO FAIL: Transaction handling not implemented
      expect(response.status).toBe(400);

      // Verify no partial data was inserted (transaction rolled back)
      const vulnerabilities = await getDatabaseRecords("vulnerabilities");
      expect(vulnerabilities).toHaveLength(0);
    });

    test("should handle database connection failures", async () => {
      const testData = [
        { hostname: "server-01", ip_address: "192.168.1.100", cve: "CVE-2023-0001", severity: "High" }
      ];

      const testCsvPath = await createTestCSVFile("db-failure-test.csv", testData);

      // Simulate database connection failure by closing the database
      await new Promise((resolve) => testDb.close(resolve));

      const response = await expressUtils
        .createRequest("post", "/api/vulnerabilities/import")
        .attach("csvFile", testCsvPath)
        .field("vendor", "failure-test");

      // EXPECTED TO FAIL: Database error handling not implemented
      expect(response.status).toBe(500);
      expect(response.body.error).toContain("Database connection failed");

      // Recreate database for subsequent tests
      testDb = await databaseUtils.createTestDatabase("csv-import-pipeline-restored");
      await databaseUtils.initializeSchema();
    });
  });

  describe("Progress Tracking via WebSocket", () => {
    test("should emit progress updates during import", async () => {
      const testData = Array.from({ length: 100 }, (_, i) => ({
        hostname: `progress-server-${i}`,
        ip_address: `10.0.0.${i + 1}`,
        cve: `CVE-2023-${i.toString().padStart(4, "0")}`,
        severity: "Medium"
      }));

      const progressCsvPath = await createTestCSVFile("progress-test.csv", testData);

      const progressUpdates = [];
      const sessionId = crypto.randomUUID();

      // Listen for progress updates
      socketClient.on("progress-update", (data) => {
        progressUpdates.push(data);
      });

      // Join the progress room
      socketClient.emit("join-progress", sessionId);

      const response = await expressUtils
        .createRequest("post", "/api/vulnerabilities/import-staging")
        .attach("csvFile", progressCsvPath)
        .field("vendor", "progress-test")
        .field("sessionId", sessionId);

      // EXPECTED TO FAIL: Progress tracking not implemented
      expect(response.status).toBe(200);
      expect(response.body.sessionId).toBe(sessionId);

      // Wait for processing and progress updates
      await GeneralTestUtils.sleep(3000);

      // Verify progress updates were emitted
      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates[0].sessionId).toBe(sessionId);
      expect(progressUpdates[progressUpdates.length - 1].progress).toBe(100);
    });

    test("should handle progress tracking for multiple concurrent imports", async () => {
      const dataset1 = Array.from({ length: 50 }, (_, i) => ({
        hostname: `concurrent-1-${i}`,
        ip_address: `10.1.0.${i + 1}`,
        cve: `CVE-2023-1${i.toString().padStart(3, "0")}`,
        severity: "High"
      }));

      const dataset2 = Array.from({ length: 50 }, (_, i) => ({
        hostname: `concurrent-2-${i}`,
        ip_address: `10.2.0.${i + 1}`,
        cve: `CVE-2023-2${i.toString().padStart(3, "0")}`,
        severity: "Low"
      }));

      const csv1Path = await createTestCSVFile("concurrent-1.csv", dataset1);
      const csv2Path = await createTestCSVFile("concurrent-2.csv", dataset2);

      const sessionId1 = crypto.randomUUID();
      const sessionId2 = crypto.randomUUID();

      const progressUpdates1 = [];
      const progressUpdates2 = [];

      // Create separate clients for each session
      const client1 = await socketUtils.createClient();
      const client2 = await socketUtils.createClient();

      client1.on("progress-update", (data) => {
        if (data.sessionId === sessionId1) {progressUpdates1.push(data);}
      });

      client2.on("progress-update", (data) => {
        if (data.sessionId === sessionId2) {progressUpdates2.push(data);}
      });

      client1.emit("join-progress", sessionId1);
      client2.emit("join-progress", sessionId2);

      // Start both imports simultaneously
      const [response1, response2] = await Promise.all([
        expressUtils
          .createRequest("post", "/api/vulnerabilities/import-staging")
          .attach("csvFile", csv1Path)
          .field("vendor", "concurrent-1")
          .field("sessionId", sessionId1),
        expressUtils
          .createRequest("post", "/api/vulnerabilities/import-staging")
          .attach("csvFile", csv2Path)
          .field("vendor", "concurrent-2")
          .field("sessionId", sessionId2)
      ]);

      // EXPECTED TO FAIL: Concurrent progress tracking not implemented
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);

      // Wait for both imports to complete
      await GeneralTestUtils.sleep(5000);

      // Verify both sessions tracked progress independently
      expect(progressUpdates1.length).toBeGreaterThan(0);
      expect(progressUpdates2.length).toBeGreaterThan(0);
      expect(progressUpdates1.every(update => update.sessionId === sessionId1)).toBe(true);
      expect(progressUpdates2.every(update => update.sessionId === sessionId2)).toBe(true);

      // Cleanup clients
      client1.disconnect();
      client2.disconnect();
    });

    test("should handle progress tracking disconnections gracefully", async () => {
      const testData = Array.from({ length: 20 }, (_, i) => ({
        hostname: `disconnect-test-${i}`,
        ip_address: `10.3.0.${i + 1}`,
        cve: `CVE-2023-3${i.toString().padStart(3, "0")}`,
        severity: "Medium"
      }));

      const disconnectCsvPath = await createTestCSVFile("disconnect-test.csv", testData);
      const sessionId = crypto.randomUUID();

      // Create client and immediately disconnect
      const disconnectClient = await socketUtils.createClient();
      disconnectClient.emit("join-progress", sessionId);
      disconnectClient.disconnect();

      const response = await expressUtils
        .createRequest("post", "/api/vulnerabilities/import-staging")
        .attach("csvFile", disconnectCsvPath)
        .field("vendor", "disconnect-test")
        .field("sessionId", sessionId);

      // EXPECTED TO FAIL: Disconnection handling not implemented
      expect(response.status).toBe(200);

      // Import should complete even with disconnected client
      await GeneralTestUtils.sleep(2000);

      const vulnerabilities = await getDatabaseRecords("vulnerabilities");
      expect(vulnerabilities).toHaveLength(20);
    });
  });

  describe("Large File Handling (100k+ Rows)", () => {
    test("should handle 100k+ row CSV files efficiently", async () => {
      // Skip this test if running in CI or with limited resources
      if (process.env.CI === "true" || process.env.SKIP_LARGE_FILE_TESTS === "true") {
        console.log("Skipping large file test in CI environment");
        return;
      }

      console.log("Creating large test dataset with 100k records...");
      const largeDataset = Array.from({ length: 100000 }, (_, i) => ({
        hostname: `large-server-${i.toString().padStart(6, "0")}`,
        ip_address: `10.${Math.floor(i / 65536)}.${Math.floor((i % 65536) / 256)}.${(i % 256)}`,
        cve: `CVE-2023-${i.toString().padStart(6, "0")}`,
        severity: ["Critical", "High", "Medium", "Low"][i % 4],
        cvss_score: (Math.random() * 10).toFixed(1),
        plugin_id: (100000 + i).toString(),
        first_seen: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        last_seen: new Date().toISOString().split("T")[0]
      }));

      const largeCsvPath = await createTestCSVFile("large-100k.csv", largeDataset);
      console.log(`Created CSV file: ${largeCsvPath}`);

      const startTime = Date.now();
      const response = await expressUtils
        .createRequest("post", "/api/vulnerabilities/import-staging")
        .attach("csvFile", largeCsvPath)
        .field("vendor", "large-file-test")
        .timeout(300000); // 5 minute timeout

      // EXPECTED TO FAIL: Large file optimization not implemented
      expect(response.status).toBe(200);

      // Wait for processing with extended timeout
      console.log("Waiting for large file processing...");
      await GeneralTestUtils.sleep(60000); // 1 minute

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      console.log(`Processing time: ${processingTime}ms`);

      // Verify all records were processed
      const vulnerabilities = await getDatabaseRecords("vulnerabilities");
      expect(vulnerabilities).toHaveLength(100000);

      // Performance requirements for large files
      expect(processingTime).toBeLessThan(300000); // 5 minutes max

      // Memory usage should be reasonable (not loading everything into memory)
      const memoryUsage = process.memoryUsage();
      expect(memoryUsage.heapUsed).toBeLessThan(500 * 1024 * 1024); // 500MB max
    }, 600000); // 10 minute test timeout

    test("should stream large files without memory overflow", async () => {
      // Create a moderately large file to test streaming
      const streamDataset = Array.from({ length: 10000 }, (_, i) => ({
        hostname: `stream-server-${i}`,
        ip_address: `172.16.${Math.floor(i / 256)}.${(i % 256)}`,
        cve: `CVE-2023-${(50000 + i).toString()}`,
        severity: "Medium"
      }));

      const streamCsvPath = await createTestCSVFile("stream-test.csv", streamDataset);

      // Monitor memory usage before and during import
      const initialMemory = process.memoryUsage().heapUsed;

      const response = await expressUtils
        .createRequest("post", "/api/vulnerabilities/import-staging")
        .attach("csvFile", streamCsvPath)
        .field("vendor", "stream-test");

      // EXPECTED TO FAIL: Streaming implementation not ready
      expect(response.status).toBe(200);

      await GeneralTestUtils.sleep(5000);

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable for streaming implementation
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // 100MB max increase
    });
  });

  describe("Error Handling and Rollback", () => {
    test("should rollback on validation errors", async () => {
      const mixedData = [
        { hostname: "valid-server-01", ip_address: "192.168.1.100", cve: "CVE-2023-0001", severity: "High" },
        { hostname: "invalid-server", ip_address: "not-an-ip", cve: "NOT-A-CVE", severity: "InvalidSeverity" },
        { hostname: "valid-server-02", ip_address: "192.168.1.101", cve: "CVE-2023-0003", severity: "Low" }
      ];

      const mixedCsvPath = await createTestCSVFile("mixed-validation.csv", mixedData);

      // Insert some existing data to verify rollback doesn't affect it
      await databaseUtils.seedDatabase({
        vulnerabilityImports: [{ filename: "existing.csv", import_date: "2023-01-01", row_count: 1, vendor: "existing" }],
        vulnerabilities: [{ import_id: 1, hostname: "existing-server", ip_address: "192.168.1.50", cve: "CVE-2022-0001", severity: "Medium" }]
      });

      const response = await expressUtils
        .createRequest("post", "/api/vulnerabilities/import")
        .attach("csvFile", mixedCsvPath)
        .field("vendor", "validation-test");

      // EXPECTED TO FAIL: Validation and rollback not implemented
      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Validation failed");

      // Verify original data is intact and no new invalid data was added
      const vulnerabilities = await getDatabaseRecords("vulnerabilities");
      expect(vulnerabilities).toHaveLength(1);
      expect(vulnerabilities[0].hostname).toBe("existing-server");
    });

    test("should handle database constraint violations", async () => {
      // Insert data that will cause constraint violations
      const duplicateData = [
        { hostname: "dup-server", ip_address: "192.168.1.100", cve: "CVE-2023-0001", severity: "High" },
        { hostname: "dup-server", ip_address: "192.168.1.100", cve: "CVE-2023-0001", severity: "High" } // Duplicate
      ];

      const duplicateCsvPath = await createTestCSVFile("duplicate-data.csv", duplicateData);

      const response = await expressUtils
        .createRequest("post", "/api/vulnerabilities/import")
        .attach("csvFile", duplicateCsvPath)
        .field("vendor", "constraint-test");

      // EXPECTED TO FAIL: Constraint violation handling not implemented
      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Constraint violation");
    });

    test("should handle partial failures with detailed error reporting", async () => {
      const partialFailureData = [
        { hostname: "good-server-01", ip_address: "192.168.1.100", cve: "CVE-2023-0001", severity: "High" },
        { hostname: "", ip_address: "192.168.1.101", cve: "CVE-2023-0002", severity: "Medium" }, // Missing hostname
        { hostname: "good-server-02", ip_address: "192.168.1.102", cve: "CVE-2023-0003", severity: "Low" },
        { hostname: "bad-server", ip_address: "", cve: "CVE-2023-0004", severity: "Critical" } // Missing IP
      ];

      const partialCsvPath = await createTestCSVFile("partial-failure.csv", partialFailureData);

      const response = await expressUtils
        .createRequest("post", "/api/vulnerabilities/import")
        .attach("csvFile", partialCsvPath)
        .field("vendor", "partial-test");

      // EXPECTED TO FAIL: Detailed error reporting not implemented
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors).toHaveLength(2);
      expect(response.body.errors[0]).toMatchObject({
        row: 2,
        field: "hostname",
        error: "Required field is empty"
      });
    });

    test("should handle network interruptions during import", async () => {
      const networkTestData = Array.from({ length: 100 }, (_, i) => ({
        hostname: `network-server-${i}`,
        ip_address: `10.4.0.${i + 1}`,
        cve: `CVE-2023-4${i.toString().padStart(3, "0")}`,
        severity: "Medium"
      }));

      const networkCsvPath = await createTestCSVFile("network-test.csv", networkTestData);

      const response = await expressUtils
        .createRequest("post", "/api/vulnerabilities/import-staging")
        .attach("csvFile", networkCsvPath)
        .field("vendor", "network-test");

      expect(response.status).toBe(200);

      // Simulate network interruption by disconnecting Socket.IO
      await socketUtils.cleanup();

      // Wait and verify the import can recover or fail gracefully
      await GeneralTestUtils.sleep(3000);

      // EXPECTED TO FAIL: Network interruption handling not implemented
      const vulnerabilities = await getDatabaseRecords("vulnerabilities");
      expect(vulnerabilities.length).toBeGreaterThan(0); // Some data should be saved
    });
  });

  // Helper functions for test setup
  async function createTestCSVFile(filename, data) {
    const csvPath = path.join(__dirname, "../temp", filename);

    // Ensure temp directory exists
    const tempDir = path.dirname(csvPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const csv = Papa.unparse(data);
    fs.writeFileSync(csvPath, csv);
    testFilePaths.push(csvPath);

    return csvPath;
  }

  async function createLargeTestCSVFile(filename, targetSizeBytes) {
    const csvPath = path.join(__dirname, "../temp", filename);

    // Create a large CSV by repeating a base row structure
    const baseRow = {
      hostname: "large-server-template",
      ip_address: "192.168.1.1",
      cve: "CVE-2023-0000",
      severity: "Medium",
      cvss_score: "5.0",
      description: "Large file test vulnerability with extended description to increase file size"
    };

    let content = Papa.unparse([baseRow]).split("\n")[0] + "\n"; // Header
    const rowTemplate = Papa.unparse([baseRow]).split("\n")[1];

    while (content.length < targetSizeBytes) {
      content += rowTemplate + "\n";
    }

    fs.writeFileSync(csvPath, content);
    testFilePaths.push(csvPath);

    return csvPath;
  }

  async function getDatabaseRecords(table) {
    return new Promise((resolve, reject) => {
      testDb.all(`SELECT * FROM ${table}`, (err, rows) => {
        if (err) {reject(err);}
        else {resolve(rows || []);}
      });
    });
  }

  // Mock CSV import routes for testing (these will need to be implemented)
  function setupCSVImportRoutes(app, db, io) {
    const multer = require("multer");
    const upload = multer({ dest: path.join(__dirname, "../temp/uploads/") });

    // Standard import endpoint
    app.post("/api/vulnerabilities/import", upload.single("csvFile"), (req, res) => {
      // PLACEHOLDER: This route needs to be implemented
      res.status(501).json({ error: "CSV import route not implemented yet" });
    });

    // Staging import endpoint with progress tracking
    app.post("/api/vulnerabilities/import-staging", upload.single("csvFile"), (req, res) => {
      // PLACEHOLDER: This route needs to be implemented
      res.status(501).json({ error: "CSV staging import route not implemented yet" });
    });

    // Progress tracking endpoint
    app.get("/api/progress/:sessionId", (req, res) => {
      // PLACEHOLDER: Progress tracking not implemented
      res.status(501).json({ error: "Progress tracking not implemented yet" });
    });
  }
});