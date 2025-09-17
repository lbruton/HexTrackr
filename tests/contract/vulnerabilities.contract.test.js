/**
 * HexTrackr Vulnerabilities API Contract Tests
 *
 * These are contract tests that define the expected API behavior for vulnerability endpoints.
 * Following TDD principles - these tests MUST FAIL initially since no implementation exists yet.
 *
 * Endpoints to test:
 * - GET /api/vulnerabilities - List vulnerabilities with pagination
 * - GET /api/vulnerabilities/:id - Get single vulnerability
 * - POST /api/vulnerabilities - Create vulnerability
 * - PUT /api/vulnerabilities/:id - Update vulnerability
 * - DELETE /api/vulnerabilities/:id - Delete vulnerability
 * - POST /api/vulnerabilities/import-csv - Import from CSV with progress tracking
 * - GET /api/vulnerabilities/export-csv - Export to CSV
 * - GET /api/vulnerabilities/stats - Get statistics
 */

const {
  DatabaseTestUtils,
  ExpressTestUtils,
  SocketTestUtils,
  MockFactories,
  AssertionHelpers
} = require("../test-utils");

describe("Vulnerabilities API Contract Tests", () => {
  let dbUtils;
  let appUtils;
  let socketUtils;
  let app;
  let testDb;

  beforeAll(async () => {
    // Initialize test utilities
    dbUtils = new DatabaseTestUtils();
    appUtils = new ExpressTestUtils();
    socketUtils = new SocketTestUtils();

    // Create test database
    testDb = await dbUtils.createTestDatabase("vulnerabilities-contract");
    await dbUtils.initializeSchema();

    // Create test Express app (simulating the modularized vulnerabilities module)
    app = appUtils.createTestApp({
      enableCors: true,
      enableJson: true
    });

    // NOTE: In TDD, these routes don't exist yet - tests should fail
    // This is just defining the contract expectations
  });

  afterAll(async () => {
    await dbUtils.cleanup();
    await appUtils.stopServer();
    await socketUtils.cleanup();
  });

  beforeEach(async () => {
    await dbUtils.beginTransaction();
  });

  afterEach(async () => {
    await dbUtils.rollbackTransaction();
  });

  describe("GET /api/vulnerabilities - List vulnerabilities with pagination", () => {
    it("should return paginated vulnerabilities with default pagination", async () => {
      // Seed test data
      await dbUtils.seedDatabase({
        vulnerabilityImports: [MockFactories.createMockVulnerabilityImport()],
        vulnerabilities: [
          MockFactories.createMockVulnerability({ severity: "Critical" }),
          MockFactories.createMockVulnerability({ severity: "High" }),
          MockFactories.createMockVulnerability({ severity: "Medium" })
        ]
      });

      const response = await appUtils.createRequest("get", "/api/vulnerabilities");

      // Contract: Should return 200 with proper pagination structure
      AssertionHelpers.assertApiResponse(response, 200, {
        data: expect.any(Array),
        pagination: {
          page: 1,
          limit: 50,
          total: expect.any(Number),
          pages: expect.any(Number)
        }
      });

      // Contract: Data should be sorted by VPR score descending
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            hostname: expect.any(String),
            ip_address: expect.any(String),
            cve: expect.any(String),
            severity: expect.any(String),
            vpr_score: expect.any(Number),
            cvss_score: expect.any(Number)
          })
        ])
      );
    });

    it("should support custom pagination parameters", async () => {
      const response = await appUtils.createRequest("get", "/api/vulnerabilities")
        .query({ page: 2, limit: 25 });

      AssertionHelpers.assertApiResponse(response, 200, {
        pagination: {
          page: 2,
          limit: 25,
          total: expect.any(Number),
          pages: expect.any(Number)
        }
      });
    });

    it("should support search filtering", async () => {
      const response = await appUtils.createRequest("get", "/api/vulnerabilities")
        .query({ search: "CVE-2023" });

      AssertionHelpers.assertApiResponse(response, 200);

      // Contract: All returned vulnerabilities should match search term
      response.body.data.forEach(vuln => {
        expect(
          vuln.hostname.includes("CVE-2023") ||
          vuln.cve.includes("CVE-2023") ||
          vuln.plugin_name.includes("CVE-2023")
        ).toBe(true);
      });
    });

    it("should support severity filtering", async () => {
      const response = await appUtils.createRequest("get", "/api/vulnerabilities")
        .query({ severity: "Critical" });

      AssertionHelpers.assertApiResponse(response, 200);

      // Contract: All returned vulnerabilities should have Critical severity
      response.body.data.forEach(vuln => {
        expect(vuln.severity).toBe("Critical");
      });
    });

    it("should support sorting by different fields", async () => {
      const response = await appUtils.createRequest("get", "/api/vulnerabilities")
        .query({ sort: "hostname", order: "asc" });

      AssertionHelpers.assertApiResponse(response, 200);

      // Contract: Should be sorted by hostname ascending
      const hostnames = response.body.data.map(v => v.hostname);
      const sortedHostnames = [...hostnames].sort();
      expect(hostnames).toEqual(sortedHostnames);
    });

    it("should handle invalid pagination parameters gracefully", async () => {
      const response = await appUtils.createRequest("get", "/api/vulnerabilities")
        .query({ page: -1, limit: 0 });

      // Contract: Should use defaults for invalid parameters
      AssertionHelpers.assertApiResponse(response, 200, {
        pagination: {
          page: 1,
          limit: 50
        }
      });
    });
  });

  describe("GET /api/vulnerabilities/:id - Get single vulnerability", () => {
    it("should return a single vulnerability by ID", async () => {
      // Seed test data
      await dbUtils.seedDatabase({
        vulnerabilityImports: [MockFactories.createMockVulnerabilityImport()],
        vulnerabilities: [MockFactories.createMockVulnerability()]
      });

      const response = await appUtils.createRequest("get", "/api/vulnerabilities/1");

      AssertionHelpers.assertApiResponse(response, 200, {
        id: 1,
        hostname: expect.any(String),
        ip_address: expect.any(String),
        cve: expect.any(String),
        severity: expect.any(String),
        vpr_score: expect.any(Number),
        cvss_score: expect.any(Number),
        first_seen: expect.any(String),
        last_seen: expect.any(String),
        plugin_id: expect.any(String),
        plugin_name: expect.any(String),
        description: expect.any(String),
        solution: expect.any(String)
      });
    });

    it("should return 404 for non-existent vulnerability", async () => {
      const response = await appUtils.createRequest("get", "/api/vulnerabilities/99999");

      AssertionHelpers.assertApiResponse(response, 404, {
        error: "Vulnerability not found"
      });
    });

    it("should return 400 for invalid ID format", async () => {
      const response = await appUtils.createRequest("get", "/api/vulnerabilities/invalid");

      AssertionHelpers.assertApiResponse(response, 400, {
        error: "Invalid vulnerability ID"
      });
    });
  });

  describe("POST /api/vulnerabilities - Create vulnerability", () => {
    it("should create a new vulnerability", async () => {
      const newVuln = {
        hostname: "test-server-01",
        ip_address: "192.168.1.100",
        cve: "CVE-2023-1234",
        severity: "High",
        vpr_score: 8.5,
        cvss_score: 7.2,
        plugin_id: "12345",
        plugin_name: "Test Plugin",
        description: "Test vulnerability description",
        solution: "Apply security patch"
      };

      const response = await appUtils.createRequest("post", "/api/vulnerabilities")
        .send(newVuln);

      AssertionHelpers.assertApiResponse(response, 201, {
        id: expect.any(Number),
        ...newVuln,
        created_at: expect.any(String)
      });

      // Contract: Should be persisted in database
      await AssertionHelpers.assertDatabaseRecord(
        testDb,
        "vulnerabilities",
        { hostname: "test-server-01" },
        newVuln
      );
    });

    it("should validate required fields", async () => {
      const incompleteVuln = {
        hostname: "test-server"
        // Missing required fields
      };

      const response = await appUtils.createRequest("post", "/api/vulnerabilities")
        .send(incompleteVuln);

      AssertionHelpers.assertApiResponse(response, 400, {
        error: "Missing required fields",
        missing: expect.arrayContaining(["ip_address", "cve", "severity"])
      });
    });

    it("should validate severity values", async () => {
      const invalidVuln = MockFactories.createMockVulnerability({
        severity: "Invalid"
      });

      const response = await appUtils.createRequest("post", "/api/vulnerabilities")
        .send(invalidVuln);

      AssertionHelpers.assertApiResponse(response, 400, {
        error: "Invalid severity value",
        validValues: ["Critical", "High", "Medium", "Low"]
      });
    });

    it("should validate VPR and CVSS scores", async () => {
      const invalidVuln = MockFactories.createMockVulnerability({
        vpr_score: 15.5, // Invalid: should be 0-10
        cvss_score: -2.1 // Invalid: should be 0-10
      });

      const response = await appUtils.createRequest("post", "/api/vulnerabilities")
        .send(invalidVuln);

      AssertionHelpers.assertApiResponse(response, 400, {
        error: "Invalid score values",
        details: expect.objectContaining({
          vpr_score: "Must be between 0 and 10",
          cvss_score: "Must be between 0 and 10"
        })
      });
    });
  });

  describe("PUT /api/vulnerabilities/:id - Update vulnerability", () => {
    it("should update an existing vulnerability", async () => {
      // Seed test data
      await dbUtils.seedDatabase({
        vulnerabilityImports: [MockFactories.createMockVulnerabilityImport()],
        vulnerabilities: [MockFactories.createMockVulnerability()]
      });

      const updates = {
        severity: "Critical",
        vpr_score: 9.5,
        description: "Updated description"
      };

      const response = await appUtils.createRequest("put", "/api/vulnerabilities/1")
        .send(updates);

      AssertionHelpers.assertApiResponse(response, 200, {
        id: 1,
        ...updates,
        updated_at: expect.any(String)
      });

      // Contract: Should be updated in database
      await AssertionHelpers.assertDatabaseRecord(
        testDb,
        "vulnerabilities",
        { id: 1 },
        updates
      );
    });

    it("should return 404 for non-existent vulnerability", async () => {
      const response = await appUtils.createRequest("put", "/api/vulnerabilities/99999")
        .send({ severity: "Critical" });

      AssertionHelpers.assertApiResponse(response, 404, {
        error: "Vulnerability not found"
      });
    });

    it("should validate update data", async () => {
      await dbUtils.seedDatabase({
        vulnerabilityImports: [MockFactories.createMockVulnerabilityImport()],
        vulnerabilities: [MockFactories.createMockVulnerability()]
      });

      const invalidUpdates = {
        severity: "Invalid",
        vpr_score: "not-a-number"
      };

      const response = await appUtils.createRequest("put", "/api/vulnerabilities/1")
        .send(invalidUpdates);

      AssertionHelpers.assertApiResponse(response, 400, {
        error: "Validation failed"
      });
    });

    it("should support partial updates", async () => {
      await dbUtils.seedDatabase({
        vulnerabilityImports: [MockFactories.createMockVulnerabilityImport()],
        vulnerabilities: [MockFactories.createMockVulnerability({ severity: "Medium" })]
      });

      const partialUpdate = { severity: "High" };

      const response = await appUtils.createRequest("put", "/api/vulnerabilities/1")
        .send(partialUpdate);

      AssertionHelpers.assertApiResponse(response, 200);
      expect(response.body.severity).toBe("High");
      // Contract: Other fields should remain unchanged
      expect(response.body.hostname).toBeDefined();
      expect(response.body.ip_address).toBeDefined();
    });
  });

  describe("DELETE /api/vulnerabilities/:id - Delete vulnerability", () => {
    it("should delete an existing vulnerability", async () => {
      // Seed test data
      await dbUtils.seedDatabase({
        vulnerabilityImports: [MockFactories.createMockVulnerabilityImport()],
        vulnerabilities: [MockFactories.createMockVulnerability()]
      });

      const response = await appUtils.createRequest("delete", "/api/vulnerabilities/1");

      AssertionHelpers.assertApiResponse(response, 200, {
        message: "Vulnerability deleted successfully",
        id: 1
      });

      // Contract: Should be removed from database
      const checkResponse = await appUtils.createRequest("get", "/api/vulnerabilities/1");
      expect(checkResponse.status).toBe(404);
    });

    it("should return 404 for non-existent vulnerability", async () => {
      const response = await appUtils.createRequest("delete", "/api/vulnerabilities/99999");

      AssertionHelpers.assertApiResponse(response, 404, {
        error: "Vulnerability not found"
      });
    });

    it("should handle cascade deletion of related records", async () => {
      // Seed vulnerability with ticket relationships
      await dbUtils.seedDatabase({
        vulnerabilityImports: [MockFactories.createMockVulnerabilityImport()],
        vulnerabilities: [MockFactories.createMockVulnerability()],
        tickets: [MockFactories.createMockTicket()],
        ticketVulnerabilities: [{
          ticket_id: "test-ticket-id",
          vulnerability_id: 1,
          relationship_type: "remediation"
        }]
      });

      const response = await appUtils.createRequest("delete", "/api/vulnerabilities/1");

      AssertionHelpers.assertApiResponse(response, 200);

      // Contract: Related ticket_vulnerabilities records should also be deleted
      const relatedRecords = await new Promise((resolve, reject) => {
        testDb.all(
          "SELECT * FROM ticket_vulnerabilities WHERE vulnerability_id = ?",
          [1],
          (err, rows) => {
            if (err) {reject(err);}
            else {resolve(rows);}
          }
        );
      });

      expect(relatedRecords).toHaveLength(0);
    });
  });

  describe("POST /api/vulnerabilities/import-csv - Import from CSV with progress tracking", () => {
    beforeEach(async () => {
      // Setup Socket.io server for progress tracking
      await socketUtils.createSocketServer();
    });

    it("should accept CSV file upload and return session ID", async () => {
      const csvContent = `hostname,ip_address,cve,severity,cvss_score
test-host,192.168.1.100,CVE-2023-1234,Critical,9.1
test-host2,192.168.1.101,CVE-2023-5678,High,7.5`;

      const response = await appUtils.createRequest("post", "/api/vulnerabilities/import-csv")
        .attach("csvFile", Buffer.from(csvContent), "test-vulnerabilities.csv")
        .field("vendor", "test-vendor")
        .field("scanDate", "2023-12-01");

      AssertionHelpers.assertApiResponse(response, 200, {
        success: true,
        sessionId: expect.any(String),
        message: "CSV import started",
        filename: "test-vulnerabilities.csv",
        vendor: "test-vendor",
        scanDate: "2023-12-01"
      });
    });

    it("should track import progress via WebSocket events", async () => {
      const client = await socketUtils.createClient();
      const progressEvents = [];

      // Listen for progress events
      client.on("import-progress", (data) => {
        progressEvents.push(data);
      });

      const csvContent = `hostname,ip_address,cve,severity,cvss_score
test-host,192.168.1.100,CVE-2023-1234,Critical,9.1`;

      const response = await appUtils.createRequest("post", "/api/vulnerabilities/import-csv")
        .attach("csvFile", Buffer.from(csvContent), "test.csv");

      const sessionId = response.body.sessionId;

      // Wait for progress events
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Contract: Should receive progress updates
      expect(progressEvents.length).toBeGreaterThan(0);
      expect(progressEvents[0]).toMatchObject({
        sessionId,
        progress: expect.any(Number),
        message: expect.any(String),
        step: expect.any(String)
      });
    });

    it("should validate CSV file format", async () => {
      const invalidCsv = "invalid,csv,content";

      const response = await appUtils.createRequest("post", "/api/vulnerabilities/import-csv")
        .attach("csvFile", Buffer.from(invalidCsv), "invalid.csv");

      AssertionHelpers.assertApiResponse(response, 400, {
        error: "Invalid CSV format",
        missingColumns: expect.arrayContaining(["hostname", "ip_address", "cve", "severity"])
      });
    });

    it("should handle large CSV files with batch processing", async () => {
      // Generate large CSV content
      let csvContent = "hostname,ip_address,cve,severity,cvss_score\n";
      for (let i = 0; i < 1000; i++) {
        csvContent += `host-${i},192.168.1.${i % 254 + 1},CVE-2023-${i.toString().padStart(4, "0")},Medium,5.0\n`;
      }

      const client = await socketUtils.createClient();
      const progressEvents = [];
      client.on("import-progress", (data) => progressEvents.push(data));

      const response = await appUtils.createRequest("post", "/api/vulnerabilities/import-csv")
        .attach("csvFile", Buffer.from(csvContent), "large-import.csv")
        .timeout(10000); // Extended timeout for large import

      AssertionHelpers.assertApiResponse(response, 200);

      // Contract: Should process in batches with progress updates
      await new Promise(resolve => setTimeout(resolve, 3000));
      expect(progressEvents.length).toBeGreaterThan(5); // Multiple progress updates for large file
    });

    it("should handle duplicate CVE detection", async () => {
      const csvWithDuplicates = `hostname,ip_address,cve,severity,cvss_score
host1,192.168.1.100,CVE-2023-1234,Critical,9.1
host2,192.168.1.101,CVE-2023-1234,High,7.5
host3,192.168.1.102,CVE-2023-1234,Medium,5.0`;

      const response = await appUtils.createRequest("post", "/api/vulnerabilities/import-csv")
        .attach("csvFile", Buffer.from(csvWithDuplicates), "duplicates.csv");

      AssertionHelpers.assertApiResponse(response, 200);

      // Contract: Should handle duplicates according to business rules
      // (e.g., keep highest severity, or track all instances)
    });

    it("should return 400 when no file is uploaded", async () => {
      const response = await appUtils.createRequest("post", "/api/vulnerabilities/import-csv");

      AssertionHelpers.assertApiResponse(response, 400, {
        error: "No file uploaded"
      });
    });
  });

  describe("GET /api/vulnerabilities/export-csv - Export to CSV", () => {
    it("should export vulnerabilities as CSV", async () => {
      // Seed test data
      await dbUtils.seedDatabase({
        vulnerabilityImports: [MockFactories.createMockVulnerabilityImport()],
        vulnerabilities: [
          MockFactories.createMockVulnerability({ hostname: "host1", severity: "Critical" }),
          MockFactories.createMockVulnerability({ hostname: "host2", severity: "High" })
        ]
      });

      const response = await appUtils.createRequest("get", "/api/vulnerabilities/export-csv");

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("text/csv");
      expect(response.headers["content-disposition"]).toContain("attachment");
      expect(response.headers["content-disposition"]).toContain("vulnerabilities-export");

      // Contract: CSV should contain proper headers and data
      const csvContent = response.text;
      expect(csvContent).toContain("hostname,ip_address,cve,severity,cvss_score");
      expect(csvContent).toContain("host1");
      expect(csvContent).toContain("host2");
      expect(csvContent).toContain("Critical");
      expect(csvContent).toContain("High");
    });

    it("should support filtered export", async () => {
      await dbUtils.seedDatabase({
        vulnerabilityImports: [MockFactories.createMockVulnerabilityImport()],
        vulnerabilities: [
          MockFactories.createMockVulnerability({ severity: "Critical" }),
          MockFactories.createMockVulnerability({ severity: "Medium" })
        ]
      });

      const response = await appUtils.createRequest("get", "/api/vulnerabilities/export-csv")
        .query({ severity: "Critical" });

      expect(response.status).toBe(200);
      const csvContent = response.text;
      expect(csvContent).toContain("Critical");
      expect(csvContent).not.toContain("Medium");
    });

    it("should handle empty result set", async () => {
      const response = await appUtils.createRequest("get", "/api/vulnerabilities/export-csv");

      expect(response.status).toBe(200);
      const csvContent = response.text;
      expect(csvContent).toContain("hostname,ip_address,cve,severity,cvss_score"); // Headers only
    });

    it("should include custom columns in export", async () => {
      const response = await appUtils.createRequest("get", "/api/vulnerabilities/export-csv")
        .query({
          columns: "hostname,cve,severity,first_seen,last_seen",
          includeMetadata: "true"
        });

      expect(response.status).toBe(200);
      const csvContent = response.text;
      expect(csvContent).toContain("first_seen");
      expect(csvContent).toContain("last_seen");
    });
  });

  describe("GET /api/vulnerabilities/stats - Get statistics", () => {
    it("should return vulnerability statistics", async () => {
      // Seed test data with various severities
      await dbUtils.seedDatabase({
        vulnerabilityImports: [MockFactories.createMockVulnerabilityImport()],
        vulnerabilities: [
          MockFactories.createMockVulnerability({ severity: "Critical" }),
          MockFactories.createMockVulnerability({ severity: "Critical" }),
          MockFactories.createMockVulnerability({ severity: "High" }),
          MockFactories.createMockVulnerability({ severity: "Medium" }),
          MockFactories.createMockVulnerability({ severity: "Low" })
        ]
      });

      const response = await appUtils.createRequest("get", "/api/vulnerabilities/stats");

      AssertionHelpers.assertApiResponse(response, 200, {
        total: 5,
        by_severity: {
          Critical: 2,
          High: 1,
          Medium: 1,
          Low: 1
        },
        top_cves: expect.any(Array),
        recent_trends: expect.any(Object),
        average_scores: {
          cvss: expect.any(Number),
          vpr: expect.any(Number)
        }
      });
    });

    it("should support date range filtering for statistics", async () => {
      const response = await appUtils.createRequest("get", "/api/vulnerabilities/stats")
        .query({
          startDate: "2023-01-01",
          endDate: "2023-12-31"
        });

      AssertionHelpers.assertApiResponse(response, 200, {
        total: expect.any(Number),
        date_range: {
          start: "2023-01-01",
          end: "2023-12-31"
        }
      });
    });

    it("should include top affected hosts", async () => {
      const response = await appUtils.createRequest("get", "/api/vulnerabilities/stats");

      AssertionHelpers.assertApiResponse(response, 200, {
        top_hosts: expect.arrayContaining([
          expect.objectContaining({
            hostname: expect.any(String),
            vulnerability_count: expect.any(Number)
          })
        ])
      });
    });

    it("should calculate risk scores and distributions", async () => {
      const response = await appUtils.createRequest("get", "/api/vulnerabilities/stats");

      AssertionHelpers.assertApiResponse(response, 200, {
        risk_distribution: {
          critical_risk: expect.any(Number),
          high_risk: expect.any(Number),
          medium_risk: expect.any(Number),
          low_risk: expect.any(Number)
        },
        compliance_metrics: expect.any(Object)
      });
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle database connection errors gracefully", async () => {
      // Simulate database error by closing connection
      await testDb.close();

      const response = await appUtils.createRequest("get", "/api/vulnerabilities");

      AssertionHelpers.assertApiResponse(response, 500, {
        error: "Database connection error"
      });

      // Restore connection for other tests
      testDb = await dbUtils.createTestDatabase("vulnerabilities-contract-restore");
    });

    it("should handle malformed JSON in request body", async () => {
      const response = await appUtils.createRequest("post", "/api/vulnerabilities")
        .set("Content-Type", "application/json")
        .send("{ invalid json }");

      AssertionHelpers.assertApiResponse(response, 400, {
        error: "Invalid JSON format"
      });
    });

    it("should implement rate limiting for API endpoints", async () => {
      // Make multiple rapid requests
      const promises = Array.from({ length: 101 }, () =>
        appUtils.createRequest("get", "/api/vulnerabilities")
      );

      const responses = await Promise.all(promises);

      // Contract: Should rate limit after 100 requests
      const tooManyRequests = responses.filter(r => r.status === 429);
      expect(tooManyRequests.length).toBeGreaterThan(0);
    });

    it("should validate Content-Type for file uploads", async () => {
      const response = await appUtils.createRequest("post", "/api/vulnerabilities/import-csv")
        .attach("csvFile", Buffer.from("test"), "test.txt"); // Wrong file type

      AssertionHelpers.assertApiResponse(response, 400, {
        error: "Invalid file type. Only CSV files are allowed."
      });
    });

    it("should handle concurrent database operations safely", async () => {
      // Test concurrent creation of vulnerabilities
      const concurrentCreations = Array.from({ length: 10 }, (_, i) =>
        appUtils.createRequest("post", "/api/vulnerabilities")
          .send(MockFactories.createMockVulnerability({ hostname: `concurrent-host-${i}` }))
      );

      const responses = await Promise.all(concurrentCreations);

      // Contract: All should succeed or fail gracefully
      responses.forEach(response => {
        expect([200, 201, 409, 500]).toContain(response.status);
      });
    });
  });

  describe("Performance and Scalability Contracts", () => {
    it("should handle large result sets with efficient pagination", async () => {
      // This test defines the performance contract
      const startTime = Date.now();

      const response = await appUtils.createRequest("get", "/api/vulnerabilities")
        .query({ limit: 1000 });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Contract: Should respond within 2 seconds for 1000 records
      expect(responseTime).toBeLessThan(2000);
      AssertionHelpers.assertApiResponse(response, 200);
    });

    it("should implement efficient search indexing", async () => {
      const startTime = Date.now();

      const response = await appUtils.createRequest("get", "/api/vulnerabilities")
        .query({ search: "CVE-2023" });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Contract: Search should be fast even with complex queries
      expect(responseTime).toBeLessThan(1000);
      AssertionHelpers.assertApiResponse(response, 200);
    });

    it("should handle memory efficiently during large imports", async () => {
      // This test would measure memory usage during import
      // Contract: Memory usage should not exceed reasonable limits
      const initialMemory = process.memoryUsage().heapUsed;

      // Simulate large import
      const largeCSV = "hostname,ip_address,cve,severity,cvss_score\n" +
        Array.from({ length: 10000 }, (_, i) =>
          `host-${i},192.168.1.${i % 254 + 1},CVE-2023-${i},Medium,5.0`
        ).join("\n");

      const response = await appUtils.createRequest("post", "/api/vulnerabilities/import-csv")
        .attach("csvFile", Buffer.from(largeCSV), "large.csv")
        .timeout(30000);

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Contract: Memory increase should be reasonable (< 100MB for 10k records)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });
  });

  describe("Security Contracts", () => {
    it("should sanitize input to prevent SQL injection", async () => {
      const maliciousInput = "'; DROP TABLE vulnerabilities; --";

      const response = await appUtils.createRequest("get", "/api/vulnerabilities")
        .query({ search: maliciousInput });

      // Contract: Should not crash and should sanitize input
      expect(response.status).not.toBe(500);
      AssertionHelpers.assertApiResponse(response, 200);
    });

    it("should validate file upload security", async () => {
      const maliciousContent = "<script>alert(\"xss\")</script>";

      const response = await appUtils.createRequest("post", "/api/vulnerabilities/import-csv")
        .attach("csvFile", Buffer.from(maliciousContent), "malicious.csv");

      // Contract: Should reject malicious content
      AssertionHelpers.assertApiResponse(response, 400, {
        error: expect.stringContaining("Invalid CSV")
      });
    });

    it("should implement proper authentication for sensitive operations", async () => {
      const response = await appUtils.createRequest("delete", "/api/vulnerabilities/1");

      // Contract: Destructive operations should require authentication
      // (This will fail until auth is implemented)
      AssertionHelpers.assertApiResponse(response, 401, {
        error: "Authentication required"
      });
    });

    it("should implement proper authorization for data access", async () => {
      // Test with different user roles/permissions
      const response = await appUtils.createAuthenticatedRequest("get", "/api/vulnerabilities", "limited-user-token");

      // Contract: Should respect user permissions
      // (This will fail until authorization is implemented)
      expect(response.status).toBe(200); // Or 403 based on user permissions
    });
  });
});