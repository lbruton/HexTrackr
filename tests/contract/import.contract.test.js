/**
 * Import/Export Contract Tests for HexTrackr
 *
 * These contract tests verify the API interface for CSV import/export operations.
 * Tests are designed to FAIL initially (TDD approach) until implementation is complete.
 *
 * Endpoints under test:
 * - POST /api/import/validate - Validate CSV before import
 * - GET /api/import/progress/:importId - Get import progress
 * - POST /api/export/generate - Generate export with filters
 * - GET /api/export/download/:exportId - Download generated export
 */

const { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } = require("@jest/globals");
const request = require("supertest");
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { Server } = require("socket.io");
const Client = require("socket.io-client");
const http = require("http");

const {
  DatabaseTestUtils,
  ExpressTestUtils,
  SocketTestUtils,
  MockFactories,
  AssertionHelpers,
  GeneralTestUtils
} = require("../test-utils.js");

// Test data and utilities
let dbUtils;
let expressUtils;
let socketUtils;
let testApp;
let socketServer;
let socketClient;
let testPort;

// Mock CSV data for testing
const VALID_CSV_CONTENT = `Hostname,IP Address,CVE,Severity,CVSS Score,First Seen,Last Seen
test-host-01,192.168.1.100,CVE-2023-0001,Critical,9.8,2023-01-01,2023-01-15
test-host-02,192.168.1.101,CVE-2023-0002,High,7.5,2023-01-02,2023-01-16
test-host-03,192.168.1.102,CVE-2023-0003,Medium,5.4,2023-01-03,2023-01-17`;

const INVALID_CSV_CONTENT = `Invalid,Headers,Missing,Required,Fields
data1,data2,data3,data4,data5
incomplete,row
malformed,"data"with"issues`;

const LARGE_CSV_CONTENT = Array.from({ length: 1000 }, (_, i) =>
  `test-host-${i.toString().padStart(3, "0")},192.168.1.${(i % 254) + 1},CVE-2023-${i.toString().padStart(4, "0")},Medium,5.0,2023-01-01,2023-01-15`
).join("\n");

// Create test CSV files
const createTestCsvFile = (content, filename = "test.csv") => {
  const filepath = path.join(__dirname, filename);
  fs.writeFileSync(filepath, content);
  return filepath;
};

const cleanupTestFiles = (filepaths) => {
  filepaths.forEach(filepath => {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  });
};

// Mock Express app with import/export routes
const createImportExportApp = () => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Configure multer for file uploads
  const upload = multer({
    dest: path.join(__dirname, "uploads/"),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
      files: 1
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
        cb(null, true);
      } else {
        cb(new Error("Only CSV files are allowed"));
      }
    }
  });

  // Import validation endpoint - WILL FAIL until implemented
  app.post("/api/import/validate", upload.single("csvFile"), (req, res) => {
    // This endpoint does not exist yet - test should fail
    res.status(501).json({ error: "Not implemented" });
  });

  // Import progress endpoint - WILL FAIL until implemented
  app.get("/api/import/progress/:importId", (req, res) => {
    // This endpoint does not exist yet - test should fail
    res.status(501).json({ error: "Not implemented" });
  });

  // Export generation endpoint - WILL FAIL until implemented
  app.post("/api/export/generate", (req, res) => {
    // This endpoint does not exist yet - test should fail
    res.status(501).json({ error: "Not implemented" });
  });

  // Export download endpoint - WILL FAIL until implemented
  app.get("/api/export/download/:exportId", (req, res) => {
    // This endpoint does not exist yet - test should fail
    res.status(501).json({ error: "Not implemented" });
  });

  // Error handling middleware
  app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ error: "File too large" });
      }
      if (error.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({ error: "Unexpected file field" });
      }
    }
    res.status(500).json({ error: error.message });
  });

  return app;
};

describe("Import/Export Contract Tests", () => {
  const testFiles = [];

  beforeAll(async () => {
    // Initialize test utilities
    dbUtils = new DatabaseTestUtils();
    expressUtils = new ExpressTestUtils();
    socketUtils = new SocketTestUtils();

    // Create test database
    await dbUtils.createTestDatabase("import-export-contract");
    await dbUtils.initializeSchema();

    // Create test app
    testApp = createImportExportApp();

    // Start socket server for progress tracking tests
    testPort = await socketUtils.createSocketServer();

    // Setup socket event handlers for import progress
    socketUtils.io.on("connection", (socket) => {
      socket.on("subscribe-import-progress", (importId) => {
        socket.join(`import-${importId}`);
      });

      socket.on("subscribe-export-progress", (exportId) => {
        socket.join(`export-${exportId}`);
      });
    });
  });

  afterAll(async () => {
    // Cleanup test utilities
    await dbUtils.cleanup();
    await socketUtils.cleanup();

    // Cleanup test files
    cleanupTestFiles(testFiles);

    // Cleanup uploads directory
    const uploadsDir = path.join(__dirname, "uploads");
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(uploadsDir, file));
      });
      fs.rmdirSync(uploadsDir);
    }
  });

  beforeEach(async () => {
    // Start fresh transaction for each test
    await dbUtils.beginTransaction();
  });

  afterEach(async () => {
    // Rollback transaction to isolate tests
    await dbUtils.rollbackTransaction();
  });

  describe("CSV Import Validation Contract", () => {
    test("should validate CSV file upload format", async () => {
      const csvFile = createTestCsvFile(VALID_CSV_CONTENT, "valid-test.csv");
      testFiles.push(csvFile);

      const response = await request(testApp)
        .post("/api/import/validate")
        .attach("csvFile", csvFile)
        .expect(200); // This will FAIL - endpoint returns 501

      // Contract: Response should contain validation results
      expect(response.body).toHaveProperty("valid");
      expect(response.body).toHaveProperty("rowCount");
      expect(response.body).toHaveProperty("headers");
      expect(response.body).toHaveProperty("preview");
      expect(response.body).toHaveProperty("issues");

      // Specific validation for valid CSV
      expect(response.body.valid).toBe(true);
      expect(response.body.rowCount).toBe(3);
      expect(response.body.headers).toEqual([
        "Hostname", "IP Address", "CVE", "Severity", "CVSS Score", "First Seen", "Last Seen"
      ]);
      expect(response.body.preview).toHaveLength(3);
      expect(response.body.issues).toHaveLength(0);
    });

    test("should reject invalid CSV file format", async () => {
      const csvFile = createTestCsvFile(INVALID_CSV_CONTENT, "invalid-test.csv");
      testFiles.push(csvFile);

      const response = await request(testApp)
        .post("/api/import/validate")
        .attach("csvFile", csvFile)
        .expect(200); // This will FAIL - endpoint returns 501

      // Contract: Response should contain validation errors
      expect(response.body).toHaveProperty("valid");
      expect(response.body).toHaveProperty("issues");

      expect(response.body.valid).toBe(false);
      expect(response.body.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "missing_headers",
            message: expect.stringContaining("required headers")
          }),
          expect.objectContaining({
            type: "row_length_mismatch",
            row: expect.any(Number)
          })
        ])
      );
    });

    test("should handle large CSV files with streaming validation", async () => {
      const csvFile = createTestCsvFile(
        `Hostname,IP Address,CVE,Severity,CVSS Score,First Seen,Last Seen\n${LARGE_CSV_CONTENT}`,
        "large-test.csv"
      );
      testFiles.push(csvFile);

      const response = await request(testApp)
        .post("/api/import/validate")
        .attach("csvFile", csvFile)
        .expect(200); // This will FAIL - endpoint returns 501

      // Contract: Should handle large files efficiently
      expect(response.body).toHaveProperty("valid");
      expect(response.body).toHaveProperty("rowCount");
      expect(response.body.rowCount).toBe(1000);
      expect(response.body).toHaveProperty("estimatedProcessingTime");
      expect(response.body.estimatedProcessingTime).toBeGreaterThan(0);
    });

    test("should reject non-CSV files", async () => {
      const txtFile = createTestCsvFile("This is not a CSV file", "test.txt");
      testFiles.push(txtFile);

      await request(testApp)
        .post("/api/import/validate")
        .attach("csvFile", txtFile)
        .expect(400); // Should fail with file type error
    });

    test("should reject files exceeding size limit", async () => {
      // Create a file larger than 10MB (if possible in test environment)
      const largeContent = "x".repeat(11 * 1024 * 1024); // 11MB
      const largeFile = createTestCsvFile(largeContent, "large.csv");
      testFiles.push(largeFile);

      await request(testApp)
        .post("/api/import/validate")
        .attach("csvFile", largeFile)
        .expect(413); // File too large
    });

    test("should validate required CSV headers", async () => {
      const csvWithMissingHeaders = createTestCsvFile(
        "Host,IP,Vuln,Sev\ntest,192.168.1.1,CVE-123,High",
        "missing-headers.csv"
      );
      testFiles.push(csvWithMissingHeaders);

      const response = await request(testApp)
        .post("/api/import/validate")
        .attach("csvFile", csvWithMissingHeaders)
        .expect(200); // This will FAIL - endpoint returns 501

      expect(response.body.valid).toBe(false);
      expect(response.body.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "missing_headers",
            missing: expect.arrayContaining(["Hostname", "CVE", "Severity"])
          })
        ])
      );
    });
  });

  describe("Import Progress Tracking Contract", () => {
    test("should return import progress via REST API", async () => {
      const importId = "test-import-123";

      const response = await request(testApp)
        .get(`/api/import/progress/${importId}`)
        .expect(200); // This will FAIL - endpoint returns 501

      // Contract: Progress response structure
      expect(response.body).toHaveProperty("importId", importId);
      expect(response.body).toHaveProperty("status");
      expect(response.body).toHaveProperty("progress");
      expect(response.body).toHaveProperty("totalRows");
      expect(response.body).toHaveProperty("processedRows");
      expect(response.body).toHaveProperty("errors");
      expect(response.body).toHaveProperty("startTime");
      expect(response.body).toHaveProperty("estimatedCompletion");

      // Status should be one of: pending, processing, completed, failed
      expect(["pending", "processing", "completed", "failed"]).toContain(response.body.status);

      // Progress should be between 0 and 100
      expect(response.body.progress).toBeGreaterThanOrEqual(0);
      expect(response.body.progress).toBeLessThanOrEqual(100);
    });

    test("should provide real-time progress updates via WebSocket", async () => {
      const importId = "test-import-websocket-456";

      // Create WebSocket client
      socketClient = await socketUtils.createClient();

      // Subscribe to import progress
      socketClient.emit("subscribe-import-progress", importId);

      // Wait for progress update (this will timeout/fail until implemented)
      const progressUpdate = await socketUtils.waitForEvent(
        socketClient,
        "import-progress",
        2000
      );

      // Contract: WebSocket progress update structure
      expect(progressUpdate).toHaveProperty("importId", importId);
      expect(progressUpdate).toHaveProperty("status");
      expect(progressUpdate).toHaveProperty("progress");
      expect(progressUpdate).toHaveProperty("processedRows");
      expect(progressUpdate).toHaveProperty("currentRow");
      expect(progressUpdate).toHaveProperty("timestamp");
    });

    test("should handle non-existent import ID", async () => {
      const nonExistentId = "non-existent-import-999";

      const response = await request(testApp)
        .get(`/api/import/progress/${nonExistentId}`)
        .expect(404); // Should return 404 for non-existent import

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("Import not found");
    });

    test("should provide detailed error information for failed imports", async () => {
      const failedImportId = "failed-import-789";

      const response = await request(testApp)
        .get(`/api/import/progress/${failedImportId}`)
        .expect(200); // This will FAIL - endpoint returns 501

      // Assuming this import has failed
      if (response.body.status === "failed") {
        expect(response.body).toHaveProperty("errors");
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              row: expect.any(Number),
              column: expect.any(String),
              message: expect.any(String),
              value: expect.any(String)
            })
          ])
        );
      }
    });
  });

  describe("Export Generation Contract", () => {
    beforeEach(async () => {
      // Seed test data for export
      await dbUtils.seedDatabase({
        vulnerabilityImports: [
          MockFactories.createMockVulnerabilityImport({ id: 1 })
        ],
        vulnerabilities: [
          MockFactories.createMockVulnerability({ import_id: 1, severity: "Critical" }),
          MockFactories.createMockVulnerability({ import_id: 1, severity: "High" }),
          MockFactories.createMockVulnerability({ import_id: 1, severity: "Medium" })
        ]
      });
    });

    test("should generate export with basic filters", async () => {
      const exportRequest = {
        format: "csv",
        filters: {
          severity: ["Critical", "High"],
          dateRange: {
            start: "2023-01-01",
            end: "2023-12-31"
          }
        },
        columns: ["hostname", "ip_address", "cve", "severity", "cvss_score"]
      };

      const response = await request(testApp)
        .post("/api/export/generate")
        .send(exportRequest)
        .expect(202); // This will FAIL - endpoint returns 501

      // Contract: Export generation response
      expect(response.body).toHaveProperty("exportId");
      expect(response.body).toHaveProperty("status", "pending");
      expect(response.body).toHaveProperty("estimatedRows");
      expect(response.body).toHaveProperty("estimatedSize");
      expect(response.body).toHaveProperty("estimatedCompletion");
      expect(response.body).toHaveProperty("downloadUrl");

      // Export ID should be valid UUID format
      expect(response.body.exportId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    test("should support multiple export formats", async () => {
      const formats = ["csv", "json", "xlsx"];

      for (const format of formats) {
        const exportRequest = {
          format: format,
          filters: { severity: ["Critical"] },
          columns: ["hostname", "cve", "severity"]
        };

        const response = await request(testApp)
          .post("/api/export/generate")
          .send(exportRequest)
          .expect(202); // This will FAIL - endpoint returns 501

        expect(response.body).toHaveProperty("exportId");
        expect(response.body).toHaveProperty("format", format);
      }
    });

    test("should validate export request parameters", async () => {
      const invalidRequest = {
        format: "invalid-format",
        filters: {
          severity: ["InvalidSeverity"]
        },
        columns: ["invalid_column"]
      };

      const response = await request(testApp)
        .post("/api/export/generate")
        .send(invalidRequest)
        .expect(400); // Should validate and reject invalid parameters

      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("validationErrors");
      expect(response.body.validationErrors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "format",
            message: expect.stringContaining("Invalid format")
          }),
          expect.objectContaining({
            field: "filters.severity",
            message: expect.stringContaining("Invalid severity")
          }),
          expect.objectContaining({
            field: "columns",
            message: expect.stringContaining("Invalid column")
          })
        ])
      );
    });

    test("should handle complex filtering scenarios", async () => {
      const complexExportRequest = {
        format: "csv",
        filters: {
          severity: ["Critical", "High"],
          cvssRange: { min: 7.0, max: 10.0 },
          hostnames: ["test-host-01", "test-host-02"],
          dateRange: {
            start: "2023-01-01",
            end: "2023-06-30"
          },
          hasTicket: true,
          vendor: "tenable"
        },
        columns: ["hostname", "ip_address", "cve", "severity", "cvss_score", "ticket_id"],
        sortBy: "cvss_score",
        sortOrder: "desc",
        limit: 1000
      };

      const response = await request(testApp)
        .post("/api/export/generate")
        .send(complexExportRequest)
        .expect(202); // This will FAIL - endpoint returns 501

      expect(response.body).toHaveProperty("exportId");
      expect(response.body).toHaveProperty("appliedFilters");
      expect(response.body.appliedFilters).toMatchObject(complexExportRequest.filters);
    });

    test("should provide export progress via WebSocket", async () => {
      const exportRequest = {
        format: "csv",
        filters: { severity: ["Critical"] },
        columns: ["hostname", "cve"]
      };

      // Start export
      const exportResponse = await request(testApp)
        .post("/api/export/generate")
        .send(exportRequest)
        .expect(202); // This will FAIL - endpoint returns 501

      const exportId = exportResponse.body.exportId;

      // Create WebSocket client for progress tracking
      if (!socketClient) {
        socketClient = await socketUtils.createClient();
      }

      // Subscribe to export progress
      socketClient.emit("subscribe-export-progress", exportId);

      // Wait for progress update
      const progressUpdate = await socketUtils.waitForEvent(
        socketClient,
        "export-progress",
        3000
      );

      // Contract: Export progress update structure
      expect(progressUpdate).toHaveProperty("exportId", exportId);
      expect(progressUpdate).toHaveProperty("status");
      expect(progressUpdate).toHaveProperty("progress");
      expect(progressUpdate).toHaveProperty("processedRows");
      expect(progressUpdate).toHaveProperty("totalRows");
      expect(progressUpdate).toHaveProperty("currentPhase");
    });
  });

  describe("Export Download Contract", () => {
    test("should download completed export file", async () => {
      const exportId = "completed-export-123";

      const response = await request(testApp)
        .get(`/api/export/download/${exportId}`)
        .expect(200); // This will FAIL - endpoint returns 501

      // Contract: File download response
      expect(response.headers["content-type"]).toContain("text/csv");
      expect(response.headers["content-disposition"]).toContain("attachment");
      expect(response.headers["content-disposition"]).toContain(`filename="export-${exportId}.csv"`);
      expect(response.headers["content-length"]).toBeDefined();

      // Response body should contain CSV data
      expect(typeof response.text).toBe("string");
      expect(response.text).toContain("hostname"); // Should contain header
    });

    test("should handle different export formats for download", async () => {
      const formats = [
        { exportId: "csv-export-456", format: "csv", contentType: "text/csv" },
        { exportId: "json-export-789", format: "json", contentType: "application/json" },
        { exportId: "xlsx-export-101", format: "xlsx", contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
      ];

      for (const { exportId, format, contentType } of formats) {
        const response = await request(testApp)
          .get(`/api/export/download/${exportId}`)
          .expect(200); // This will FAIL - endpoint returns 501

        expect(response.headers["content-type"]).toContain(contentType);
        expect(response.headers["content-disposition"]).toContain(`filename="export-${exportId}.${format}"`);
      }
    });

    test("should return 404 for non-existent export", async () => {
      const nonExistentExportId = "non-existent-export-999";

      const response = await request(testApp)
        .get(`/api/export/download/${nonExistentExportId}`)
        .expect(404);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("Export not found");
    });

    test("should return 409 for incomplete export", async () => {
      const incompleteExportId = "processing-export-111";

      const response = await request(testApp)
        .get(`/api/export/download/${incompleteExportId}`)
        .expect(409); // Conflict - export not ready

      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("status");
      expect(response.body.error).toContain("Export not ready");
      expect(["pending", "processing", "failed"]).toContain(response.body.status);
    });

    test("should handle expired export downloads", async () => {
      const expiredExportId = "expired-export-222";

      const response = await request(testApp)
        .get(`/api/export/download/${expiredExportId}`)
        .expect(410); // Gone - export expired

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("Export expired");
      expect(response.body).toHaveProperty("expirationDate");
    });

    test("should support range requests for large files", async () => {
      const largeExportId = "large-export-333";

      // Request partial content
      const response = await request(testApp)
        .get(`/api/export/download/${largeExportId}`)
        .set("Range", "bytes=0-1023")
        .expect(206); // This will FAIL - endpoint returns 501

      expect(response.headers["content-range"]).toBeDefined();
      expect(response.headers["accept-ranges"]).toBe("bytes");
      expect(response.headers["content-length"]).toBe("1024");
    });
  });

  describe("Import/Export Integration Scenarios", () => {
    test("should complete full import-to-export workflow", async () => {
      // 1. Validate CSV
      const csvFile = createTestCsvFile(VALID_CSV_CONTENT, "workflow-test.csv");
      testFiles.push(csvFile);

      const validationResponse = await request(testApp)
        .post("/api/import/validate")
        .attach("csvFile", csvFile)
        .expect(200); // This will FAIL - endpoint returns 501

      expect(validationResponse.body.valid).toBe(true);

      // 2. Start import (would be a separate endpoint)
      // This represents the complete workflow integration

      // 3. Generate export of imported data
      const exportRequest = {
        format: "csv",
        filters: {
          importId: validationResponse.body.importId
        },
        columns: ["hostname", "ip_address", "cve", "severity"]
      };

      const exportResponse = await request(testApp)
        .post("/api/export/generate")
        .send(exportRequest)
        .expect(202); // This will FAIL - endpoint returns 501

      expect(exportResponse.body).toHaveProperty("exportId");
    });

    test("should handle concurrent import/export operations", async () => {
      const concurrentOperations = [];

      // Start multiple import validations
      for (let i = 0; i < 3; i++) {
        const csvFile = createTestCsvFile(VALID_CSV_CONTENT, `concurrent-${i}.csv`);
        testFiles.push(csvFile);

        const validationPromise = request(testApp)
          .post("/api/import/validate")
          .attach("csvFile", csvFile)
          .expect(200); // This will FAIL - endpoint returns 501

        concurrentOperations.push(validationPromise);
      }

      // Start multiple export generations
      for (let i = 0; i < 2; i++) {
        const exportPromise = request(testApp)
          .post("/api/export/generate")
          .send({
            format: "csv",
            filters: { severity: ["High"] },
            columns: ["hostname", "cve"]
          })
          .expect(202); // This will FAIL - endpoint returns 501

        concurrentOperations.push(exportPromise);
      }

      // Wait for all operations to complete
      const results = await Promise.all(concurrentOperations);

      // Verify all operations succeeded
      results.forEach((response, index) => {
        if (index < 3) {
          // Validation responses
          expect(response.body).toHaveProperty("valid");
        } else {
          // Export responses
          expect(response.body).toHaveProperty("exportId");
        }
      });
    });

    test("should enforce rate limiting on import/export endpoints", async () => {
      const requests = [];

      // Make multiple rapid requests
      for (let i = 0; i < 10; i++) {
        const exportRequest = request(testApp)
          .post("/api/export/generate")
          .send({
            format: "csv",
            filters: { severity: ["Critical"] },
            columns: ["hostname"]
          });

        requests.push(exportRequest);
      }

      const responses = await Promise.allSettled(requests);

      // At least some requests should be rate limited (429)
      const rateLimitedResponses = responses.filter(
        result => result.status === "fulfilled" && result.value.status === 429
      );

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe("Error Handling and Edge Cases", () => {
    test("should handle malformed CSV with graceful degradation", async () => {
      const malformedCsv = createTestCsvFile(
        "Hostname,IP,CVE\n\"unclosed quote,192.168.1.1,CVE-123\n,missing data,\n",
        "malformed.csv"
      );
      testFiles.push(malformedCsv);

      const response = await request(testApp)
        .post("/api/import/validate")
        .attach("csvFile", malformedCsv)
        .expect(200); // This will FAIL - endpoint returns 501

      expect(response.body.valid).toBe(false);
      expect(response.body.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "parsing_error",
            message: expect.stringContaining("malformed")
          })
        ])
      );
    });

    test("should handle server errors gracefully", async () => {
      // Force a server error scenario
      const response = await request(testApp)
        .post("/api/export/generate")
        .send({
          format: "csv",
          filters: { forceError: true }, // Hypothetical error trigger
          columns: ["hostname"]
        })
        .expect(500);

      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("requestId");
    });

    test("should validate file size constraints", async () => {
      // Test with empty file
      const emptyFile = createTestCsvFile("", "empty.csv");
      testFiles.push(emptyFile);

      const response = await request(testApp)
        .post("/api/import/validate")
        .attach("csvFile", emptyFile)
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("empty");
    });

    test("should handle invalid UUID formats in URLs", async () => {
      const invalidUuids = ["invalid-uuid", "123", "", "not-a-uuid-at-all"];

      for (const invalidUuid of invalidUuids) {
        await request(testApp)
          .get(`/api/import/progress/${invalidUuid}`)
          .expect(400);

        await request(testApp)
          .get(`/api/export/download/${invalidUuid}`)
          .expect(400);
      }
    });
  });
});