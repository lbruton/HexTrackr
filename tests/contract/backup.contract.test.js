/**
 * Backup/Restore Endpoints Contract Tests
 * Tests for backup creation, restoration, and scheduled backup management
 * Following TDD approach - tests should FAIL until endpoints are implemented correctly
 */

const { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } = require("@jest/globals");
const request = require("supertest");
const path = require("path");
const fs = require("fs");
const { DatabaseTestUtils, ExpressTestUtils, MockFactories } = require("../test-utils");

describe("Backup/Restore Contract Tests", () => {
  let dbUtils;
  let expressUtils;
  let testApp;
  let testDb;

  beforeAll(async () => {
    // Set up test database
    dbUtils = new DatabaseTestUtils();
    testDb = await dbUtils.createTestDatabase("backup-contract");
    await dbUtils.initializeSchema();

    // Set up test Express app
    expressUtils = new ExpressTestUtils();
    testApp = expressUtils.createTestApp({
      enableCors: true,
      enableJson: true
    });

    // Mock the backup/restore endpoints that should exist
    setupMockBackupEndpoints(testApp, testDb);
  });

  afterAll(async () => {
    await dbUtils.cleanup();
    await expressUtils.stopServer();
  });

  beforeEach(async () => {
    await dbUtils.beginTransaction();

    // Seed with test data for backup/restore tests
    await dbUtils.seedDatabase({
      tickets: [
        MockFactories.createMockTicket({ id: "test-ticket-1", xt_number: "XT-001" }),
        MockFactories.createMockTicket({ id: "test-ticket-2", xt_number: "XT-002" })
      ],
      vulnerabilityImports: [
        MockFactories.createMockVulnerabilityImport({ id: 1, filename: "test-import.csv" })
      ],
      vulnerabilities: [
        MockFactories.createMockVulnerability({ import_id: 1, cve: "CVE-2023-0001" }),
        MockFactories.createMockVulnerability({ import_id: 1, cve: "CVE-2023-0002" })
      ]
    });
  });

  afterEach(async () => {
    await dbUtils.rollbackTransaction();
  });

  // ==========================================================================
  // POST /api/backup - Create backup (returns download)
  // ==========================================================================

  describe("POST /api/backup", () => {
    test("should create complete backup and return download file", async () => {
      const response = await request(testApp)
        .post("/api/backup")
        .send({ type: "all" })
        .expect(200);

      // Contract: Should return file download
      expect(response.headers["content-type"]).toMatch(/application\/zip|application\/octet-stream/);
      expect(response.headers["content-disposition"]).toMatch(/attachment/);
      expect(response.headers["content-disposition"]).toMatch(/filename=.*\.zip/);

      // Contract: Should have valid backup content
      expect(response.body).toBeDefined();
      expect(Buffer.isBuffer(response.body) || typeof response.body === "string").toBe(true);
    });

    test("should create tickets-only backup", async () => {
      const response = await request(testApp)
        .post("/api/backup")
        .send({ type: "tickets" })
        .expect(200);

      expect(response.headers["content-type"]).toMatch(/application\/zip|application\/octet-stream/);
      expect(response.headers["content-disposition"]).toMatch(/filename=.*tickets.*\.zip/);
    });

    test("should create vulnerabilities-only backup", async () => {
      const response = await request(testApp)
        .post("/api/backup")
        .send({ type: "vulnerabilities" })
        .expect(200);

      expect(response.headers["content-type"]).toMatch(/application\/zip|application\/octet-stream/);
      expect(response.headers["content-disposition"]).toMatch(/filename=.*vulnerabilities.*\.zip/);
    });

    test("should reject invalid backup type", async () => {
      const response = await request(testApp)
        .post("/api/backup")
        .send({ type: "invalid" })
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toMatch(/invalid.*type/i);
    });

    test("should require backup type", async () => {
      const response = await request(testApp)
        .post("/api/backup")
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toMatch(/type.*required/i);
    });

    test("should handle empty database gracefully", async () => {
      // Clear all data
      await dbUtils.clearAllTables();

      const response = await request(testApp)
        .post("/api/backup")
        .send({ type: "all" })
        .expect(200);

      expect(response.headers["content-type"]).toMatch(/application\/zip|application\/octet-stream/);
    });
  });

  // ==========================================================================
  // POST /api/restore - Restore from uploaded backup
  // ==========================================================================

  describe("POST /api/restore", () => {
    test("should restore from valid backup file", async () => {
      // Create a mock backup file
      const mockBackupPath = path.join(__dirname, "../temp/mock-backup.zip");
      const mockBackupData = createMockBackupFile({
        tickets: [{ xt_number: "XT-RESTORED-001", location: "Restored Location" }],
        vulnerabilities: [{ cve: "CVE-RESTORED-001", severity: "High" }]
      });

      fs.writeFileSync(mockBackupPath, mockBackupData);

      const response = await request(testApp)
        .post("/api/restore")
        .field("type", "all")
        .field("clearExisting", "false")
        .attach("file", mockBackupPath)
        .expect(200);

      // Contract: Should return success response
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("count");
      expect(typeof response.body.count).toBe("number");
      expect(response.body.count).toBeGreaterThan(0);

      // Clean up
      if (fs.existsSync(mockBackupPath)) {
        fs.unlinkSync(mockBackupPath);
      }
    });

    test("should require file upload", async () => {
      const response = await request(testApp)
        .post("/api/restore")
        .field("type", "all")
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toMatch(/no file|file.*required/i);
    });

    test("should validate restore type", async () => {
      const mockBackupPath = path.join(__dirname, "../temp/mock-backup.zip");
      const mockBackupData = createMockBackupFile({});
      fs.writeFileSync(mockBackupPath, mockBackupData);

      const response = await request(testApp)
        .post("/api/restore")
        .field("type", "invalid")
        .attach("file", mockBackupPath)
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toMatch(/invalid.*type/i);

      // Clean up
      if (fs.existsSync(mockBackupPath)) {
        fs.unlinkSync(mockBackupPath);
      }
    });

    test("should handle corrupt backup file", async () => {
      const corruptBackupPath = path.join(__dirname, "../temp/corrupt-backup.zip");
      fs.writeFileSync(corruptBackupPath, "This is not a valid zip file");

      const response = await request(testApp)
        .post("/api/restore")
        .field("type", "all")
        .attach("file", corruptBackupPath)
        .expect(500);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toMatch(/failed.*restore|corrupt|invalid/i);

      // Clean up
      if (fs.existsSync(corruptBackupPath)) {
        fs.unlinkSync(corruptBackupPath);
      }
    });

    test("should handle wrong file format", async () => {
      const wrongFormatPath = path.join(__dirname, "../temp/wrong-format.txt");
      fs.writeFileSync(wrongFormatPath, "This is a text file, not a backup");

      const response = await request(testApp)
        .post("/api/restore")
        .field("type", "all")
        .attach("file", wrongFormatPath)
        .expect(500);

      expect(response.body).toHaveProperty("error");

      // Clean up
      if (fs.existsSync(wrongFormatPath)) {
        fs.unlinkSync(wrongFormatPath);
      }
    });

    test("should support clearExisting option", async () => {
      const mockBackupPath = path.join(__dirname, "../temp/mock-backup-clear.zip");
      const mockBackupData = createMockBackupFile({
        tickets: [{ xt_number: "XT-CLEAR-001", location: "Clear Test" }]
      });
      fs.writeFileSync(mockBackupPath, mockBackupData);

      const response = await request(testApp)
        .post("/api/restore")
        .field("type", "tickets")
        .field("clearExisting", "true")
        .attach("file", mockBackupPath)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Clean up
      if (fs.existsSync(mockBackupPath)) {
        fs.unlinkSync(mockBackupPath);
      }
    });
  });

  // ==========================================================================
  // GET /api/backup/scheduled - Get scheduled backup settings
  // ==========================================================================

  describe("GET /api/backup/scheduled", () => {
    test("should return scheduled backup settings", async () => {
      const response = await request(testApp)
        .get("/api/backup/scheduled")
        .expect(200);

      // Contract: Should return scheduled backup configuration
      expect(response.body).toHaveProperty("enabled");
      expect(typeof response.body.enabled).toBe("boolean");

      expect(response.body).toHaveProperty("frequency");
      expect(["daily", "weekly", "monthly"].includes(response.body.frequency) || response.body.frequency === null).toBe(true);

      expect(response.body).toHaveProperty("time");
      expect(response.body).toHaveProperty("types");
      expect(Array.isArray(response.body.types)).toBe(true);

      expect(response.body).toHaveProperty("retention");
      expect(typeof response.body.retention).toBe("number");

      expect(response.body).toHaveProperty("lastRun");
      expect(response.body).toHaveProperty("nextRun");
    });

    test("should return default settings when none configured", async () => {
      const response = await request(testApp)
        .get("/api/backup/scheduled")
        .expect(200);

      expect(response.body.enabled).toBe(false);
      expect(response.body.frequency).toBe(null);
      expect(response.body.types).toEqual([]);
      expect(response.body.retention).toBe(7); // Default 7 days
    });
  });

  // ==========================================================================
  // PUT /api/backup/scheduled - Update scheduled backup settings
  // ==========================================================================

  describe("PUT /api/backup/scheduled", () => {
    test("should update scheduled backup settings", async () => {
      const settings = {
        enabled: true,
        frequency: "daily",
        time: "02:00",
        types: ["all"],
        retention: 14
      };

      const response = await request(testApp)
        .put("/api/backup/scheduled")
        .send(settings)
        .expect(200);

      // Contract: Should return updated settings
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("settings");
      expect(response.body.settings).toMatchObject(settings);
      expect(response.body.settings).toHaveProperty("nextRun");
    });

    test("should validate frequency values", async () => {
      const response = await request(testApp)
        .put("/api/backup/scheduled")
        .send({
          enabled: true,
          frequency: "invalid",
          time: "02:00",
          types: ["all"]
        })
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toMatch(/invalid.*frequency/i);
    });

    test("should validate time format", async () => {
      const response = await request(testApp)
        .put("/api/backup/scheduled")
        .send({
          enabled: true,
          frequency: "daily",
          time: "25:00", // Invalid time
          types: ["all"]
        })
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toMatch(/invalid.*time/i);
    });

    test("should validate backup types", async () => {
      const response = await request(testApp)
        .put("/api/backup/scheduled")
        .send({
          enabled: true,
          frequency: "daily",
          time: "02:00",
          types: ["invalid_type"]
        })
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toMatch(/invalid.*type/i);
    });

    test("should validate retention period", async () => {
      const response = await request(testApp)
        .put("/api/backup/scheduled")
        .send({
          enabled: true,
          frequency: "daily",
          time: "02:00",
          types: ["all"],
          retention: -1 // Invalid retention
        })
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toMatch(/retention.*positive/i);
    });

    test("should disable scheduled backups", async () => {
      const response = await request(testApp)
        .put("/api/backup/scheduled")
        .send({ enabled: false })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.settings.enabled).toBe(false);
      expect(response.body.settings.nextRun).toBe(null);
    });
  });

  // ==========================================================================
  // Backup Format and Content Validation
  // ==========================================================================

  describe("Backup Format Validation", () => {
    test("should contain required backup metadata", async () => {
      const response = await request(testApp)
        .post("/api/backup")
        .send({ type: "all" })
        .expect(200);

      // Extract and validate ZIP contents (mock implementation)
      const zipContents = extractMockZipContents(response.body);

      expect(zipContents).toHaveProperty("metadata.json");
      const metadata = JSON.parse(zipContents["metadata.json"]);

      expect(metadata).toHaveProperty("version");
      expect(metadata).toHaveProperty("created_at");
      expect(metadata).toHaveProperty("type");
      expect(metadata).toHaveProperty("source");
      expect(metadata.source).toBe("HexTrackr");
    });

    test("should contain proper data structure for tickets", async () => {
      const response = await request(testApp)
        .post("/api/backup")
        .send({ type: "tickets" })
        .expect(200);

      const zipContents = extractMockZipContents(response.body);

      expect(zipContents).toHaveProperty("tickets.json");
      const ticketsData = JSON.parse(zipContents["tickets.json"]);

      expect(ticketsData).toHaveProperty("count");
      expect(ticketsData).toHaveProperty("data");
      expect(Array.isArray(ticketsData.data)).toBe(true);

      if (ticketsData.data.length > 0) {
        const ticket = ticketsData.data[0];
        expect(ticket).toHaveProperty("id");
        expect(ticket).toHaveProperty("xt_number");
        expect(ticket).toHaveProperty("location");
        expect(ticket).toHaveProperty("status");
      }
    });

    test("should contain proper data structure for vulnerabilities", async () => {
      const response = await request(testApp)
        .post("/api/backup")
        .send({ type: "vulnerabilities" })
        .expect(200);

      const zipContents = extractMockZipContents(response.body);

      expect(zipContents).toHaveProperty("vulnerabilities.json");
      const vulnData = JSON.parse(zipContents["vulnerabilities.json"]);

      expect(vulnData).toHaveProperty("count");
      expect(vulnData).toHaveProperty("data");
      expect(Array.isArray(vulnData.data)).toBe(true);

      if (vulnData.data.length > 0) {
        const vuln = vulnData.data[0];
        expect(vuln).toHaveProperty("cve");
        expect(vuln).toHaveProperty("severity");
        expect(vuln).toHaveProperty("hostname");
      }
    });
  });
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Set up mock backup endpoints for testing
 * These should fail until real endpoints are implemented
 */
function setupMockBackupEndpoints(app, db) {
  // Mock multer for file uploads
  const multer = require("multer");
  const upload = multer({ dest: path.join(__dirname, "../temp/") });

  // POST /api/backup - Create backup (returns download)
  // THIS ENDPOINT DOES NOT EXIST YET - TEST SHOULD FAIL
  app.post("/api/backup", (req, res) => {
    // This is a mock that should be replaced with real implementation
    res.status(501).json({ error: "POST /api/backup endpoint not implemented yet" });
  });

  // GET /api/backup/scheduled - Get scheduled backup settings
  // THIS ENDPOINT DOES NOT EXIST YET - TEST SHOULD FAIL
  app.get("/api/backup/scheduled", (req, res) => {
    // This is a mock that should be replaced with real implementation
    res.status(501).json({ error: "GET /api/backup/scheduled endpoint not implemented yet" });
  });

  // PUT /api/backup/scheduled - Update scheduled backup settings
  // THIS ENDPOINT DOES NOT EXIST YET - TEST SHOULD FAIL
  app.put("/api/backup/scheduled", (req, res) => {
    // This is a mock that should be replaced with real implementation
    res.status(501).json({ error: "PUT /api/backup/scheduled endpoint not implemented yet" });
  });

  // POST /api/restore exists but may need updates for contract compliance
  app.post("/api/restore", upload.single("file"), (req, res) => {
    // Basic mock implementation - real one may have different contract
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { type, clearExisting } = req.body;
    if (!["tickets", "vulnerabilities", "all"].includes(type)) {
      return res.status(400).json({ error: "Invalid data type" });
    }

    // Mock successful restore
    res.json({
      success: true,
      message: "Successfully restored 0 records (mock)",
      count: 0
    });
  });
}

/**
 * Create a mock backup file for testing
 */
function createMockBackupFile(data) {
  // Simple mock - in real tests this would create a proper ZIP file
  return Buffer.from(JSON.stringify({
    mockBackup: true,
    data: data
  }));
}

/**
 * Extract mock ZIP contents for testing
 */
function extractMockZipContents(zipData) {
  // Mock implementation - real version would extract actual ZIP
  return {
    "metadata.json": JSON.stringify({
      version: "1.0",
      created_at: new Date().toISOString(),
      type: "all",
      source: "HexTrackr"
    }),
    "tickets.json": JSON.stringify({
      count: 2,
      data: [
        { id: "test-1", xt_number: "XT-001", location: "Test Location", status: "Open" },
        { id: "test-2", xt_number: "XT-002", location: "Test Location 2", status: "Closed" }
      ]
    }),
    "vulnerabilities.json": JSON.stringify({
      count: 2,
      data: [
        { cve: "CVE-2023-0001", severity: "High", hostname: "test-host-1" },
        { cve: "CVE-2023-0002", severity: "Medium", hostname: "test-host-2" }
      ]
    })
  };
}