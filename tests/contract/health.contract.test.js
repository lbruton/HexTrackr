/**
 * Contract Tests for Health/Monitoring Endpoints
 * TDD Implementation - These tests MUST FAIL initially
 *
 * Tests cover:
 * - GET /api/health - Basic health check
 * - GET /api/health/detailed - Detailed health with DB status
 * - GET /api/metrics - System metrics
 * - GET /api/version - Version information
 */

const { describe, test, expect, beforeAll, afterAll, beforeEach } = require("@jest/globals");
const request = require("supertest");
const {
  ExpressTestUtils,
  DatabaseTestUtils,
  AssertionHelpers,
  GeneralTestUtils
} = require("../test-utils.js");

describe("Health/Monitoring Contract Tests", () => {
  let expressUtils;
  let dbUtils;
  let app;

  beforeAll(async () => {
    expressUtils = new ExpressTestUtils();
    dbUtils = new DatabaseTestUtils();

    // Create test app (this will fail until actual endpoints are implemented)
    app = expressUtils.createTestApp();

    // Initialize test database
    await dbUtils.createTestDatabase("health-contract");
    await dbUtils.initializeSchema();
  });

  afterAll(async () => {
    await dbUtils.cleanup();
    await expressUtils.stopServer();
  });

  beforeEach(async () => {
    // Clear database state between tests
    await dbUtils.clearAllTables();
  });

  describe("GET /api/health - Basic Health Check", () => {
    test("should return basic health status with correct contract", async () => {
      // This test WILL FAIL until endpoint is implemented
      const response = await request(app)
        .get("/api/health")
        .expect("Content-Type", /json/)
        .expect(200);

      // Contract requirements
      expect(response.body).toHaveProperty("status");
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("service");
      expect(response.body).toHaveProperty("version");

      // Status should be enum: 'healthy', 'degraded', 'unhealthy'
      expect(["healthy", "degraded", "unhealthy"]).toContain(response.body.status);

      // Timestamp should be ISO 8601 format
      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);

      // Service name should be present
      expect(response.body.service).toBe("hextrackr");

      // Version should follow semantic versioning
      expect(response.body.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    test("should return consistent response structure on multiple calls", async () => {
      // This test WILL FAIL until endpoint is implemented
      const responses = await Promise.all([
        request(app).get("/api/health"),
        request(app).get("/api/health"),
        request(app).get("/api/health")
      ]);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("status");
        expect(response.body).toHaveProperty("timestamp");
        expect(response.body).toHaveProperty("service", "hextrackr");
      });

      // Timestamps should be different (within reason)
      const timestamps = responses.map(r => new Date(r.body.timestamp));
      expect(timestamps[1].getTime()).toBeGreaterThanOrEqual(timestamps[0].getTime());
      expect(timestamps[2].getTime()).toBeGreaterThanOrEqual(timestamps[1].getTime());
    });

    test("should respond within acceptable time limits", async () => {
      // This test WILL FAIL until endpoint is implemented
      const startTime = Date.now();

      const response = await request(app)
        .get("/api/health")
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Health check should respond within 100ms
      expect(responseTime).toBeLessThan(100);
      expect(response.body.status).toBeDefined();
    });

    test("should handle high concurrent requests gracefully", async () => {
      // This test WILL FAIL until endpoint is implemented
      const concurrentRequests = Array.from({ length: 10 }, () =>
        request(app).get("/api/health")
      );

      const responses = await Promise.all(concurrentRequests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("status");
      });
    });
  });

  describe("GET /api/health/detailed - Detailed Health Check", () => {
    test("should return detailed health status with database information", async () => {
      // This test WILL FAIL until endpoint is implemented
      const response = await request(app)
        .get("/api/health/detailed")
        .expect("Content-Type", /json/)
        .expect(200);

      // Extended contract requirements
      expect(response.body).toHaveProperty("status");
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("service", "hextrackr");
      expect(response.body).toHaveProperty("version");
      expect(response.body).toHaveProperty("database");
      expect(response.body).toHaveProperty("uptime");
      expect(response.body).toHaveProperty("memory");
      expect(response.body).toHaveProperty("checks");

      // Database status
      expect(response.body.database).toHaveProperty("status");
      expect(response.body.database).toHaveProperty("connection_time_ms");
      expect(["connected", "disconnected", "error"]).toContain(response.body.database.status);
      expect(typeof response.body.database.connection_time_ms).toBe("number");

      // Uptime should be a number in seconds
      expect(typeof response.body.uptime).toBe("number");
      expect(response.body.uptime).toBeGreaterThan(0);

      // Memory usage
      expect(response.body.memory).toHaveProperty("used");
      expect(response.body.memory).toHaveProperty("total");
      expect(typeof response.body.memory.used).toBe("number");
      expect(typeof response.body.memory.total).toBe("number");

      // Health checks array
      expect(Array.isArray(response.body.checks)).toBe(true);
    });

    test("should report degraded status when database is slow", async () => {
      // This test WILL FAIL until endpoint is implemented
      // Simulate slow database by adding delay to connection
      // Note: This test expects the endpoint to detect slow DB responses

      const response = await request(app)
        .get("/api/health/detailed")
        .expect(200);

      // If database connection takes >50ms, status should be degraded
      if (response.body.database.connection_time_ms > 50) {
        expect(response.body.status).toBe("degraded");
      }
    });

    test("should include individual health check results", async () => {
      // This test WILL FAIL until endpoint is implemented
      const response = await request(app)
        .get("/api/health/detailed")
        .expect(200);

      expect(response.body.checks).toBeInstanceOf(Array);

      // Should include at least database and filesystem checks
      const checkNames = response.body.checks.map(check => check.name);
      expect(checkNames).toContain("database");
      expect(checkNames).toContain("filesystem");

      response.body.checks.forEach(check => {
        expect(check).toHaveProperty("name");
        expect(check).toHaveProperty("status");
        expect(check).toHaveProperty("duration_ms");
        expect(["pass", "fail", "warn"]).toContain(check.status);
        expect(typeof check.duration_ms).toBe("number");
      });
    });
  });

  describe("GET /api/metrics - System Metrics", () => {
    test("should return system metrics in correct format", async () => {
      // This test WILL FAIL until endpoint is implemented
      const response = await request(app)
        .get("/api/metrics")
        .expect("Content-Type", /json/)
        .expect(200);

      // Metrics contract
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("service", "hextrackr");
      expect(response.body).toHaveProperty("metrics");

      const metrics = response.body.metrics;

      // System metrics
      expect(metrics).toHaveProperty("system");
      expect(metrics.system).toHaveProperty("cpu_usage");
      expect(metrics.system).toHaveProperty("memory_usage");
      expect(metrics.system).toHaveProperty("disk_usage");
      expect(metrics.system).toHaveProperty("load_average");

      // Application metrics
      expect(metrics).toHaveProperty("application");
      expect(metrics.application).toHaveProperty("requests_total");
      expect(metrics.application).toHaveProperty("requests_per_minute");
      expect(metrics.application).toHaveProperty("response_time_avg");
      expect(metrics.application).toHaveProperty("active_connections");

      // Database metrics
      expect(metrics).toHaveProperty("database");
      expect(metrics.database).toHaveProperty("connections_active");
      expect(metrics.database).toHaveProperty("queries_total");
      expect(metrics.database).toHaveProperty("queries_per_minute");
      expect(metrics.database).toHaveProperty("slow_queries");

      // Validate data types
      expect(typeof metrics.system.cpu_usage).toBe("number");
      expect(typeof metrics.system.memory_usage).toBe("number");
      expect(typeof metrics.application.requests_total).toBe("number");
      expect(typeof metrics.database.connections_active).toBe("number");
    });

    test("should return metrics within valid ranges", async () => {
      // This test WILL FAIL until endpoint is implemented
      const response = await request(app)
        .get("/api/metrics")
        .expect(200);

      const { system, application, database } = response.body.metrics;

      // CPU usage should be between 0-100
      expect(system.cpu_usage).toBeGreaterThanOrEqual(0);
      expect(system.cpu_usage).toBeLessThanOrEqual(100);

      // Memory usage should be between 0-100 (percentage)
      expect(system.memory_usage).toBeGreaterThanOrEqual(0);
      expect(system.memory_usage).toBeLessThanOrEqual(100);

      // Application metrics should be non-negative
      expect(application.requests_total).toBeGreaterThanOrEqual(0);
      expect(application.requests_per_minute).toBeGreaterThanOrEqual(0);
      expect(application.response_time_avg).toBeGreaterThanOrEqual(0);
      expect(application.active_connections).toBeGreaterThanOrEqual(0);

      // Database metrics should be non-negative
      expect(database.connections_active).toBeGreaterThanOrEqual(0);
      expect(database.queries_total).toBeGreaterThanOrEqual(0);
      expect(database.queries_per_minute).toBeGreaterThanOrEqual(0);
      expect(database.slow_queries).toBeGreaterThanOrEqual(0);
    });

    test("should track request metrics accurately", async () => {
      // This test WILL FAIL until endpoint is implemented
      // Get initial metrics
      const initial = await request(app).get("/api/metrics").expect(200);
      const initialRequests = initial.body.metrics.application.requests_total;

      // Make some requests to increment counter
      await request(app).get("/api/health");
      await request(app).get("/api/health");
      await request(app).get("/api/health");

      // Get updated metrics
      const updated = await request(app).get("/api/metrics").expect(200);
      const updatedRequests = updated.body.metrics.application.requests_total;

      // Should have increased by at least 3 (the health check requests)
      expect(updatedRequests).toBeGreaterThanOrEqual(initialRequests + 3);
    });
  });

  describe("GET /api/version - Version Information", () => {
    test("should return version information with correct format", async () => {
      // This test WILL FAIL until endpoint is implemented
      const response = await request(app)
        .get("/api/version")
        .expect("Content-Type", /json/)
        .expect(200);

      // Version contract
      expect(response.body).toHaveProperty("service", "hextrackr");
      expect(response.body).toHaveProperty("version");
      expect(response.body).toHaveProperty("build");
      expect(response.body).toHaveProperty("environment");
      expect(response.body).toHaveProperty("node_version");
      expect(response.body).toHaveProperty("dependencies");

      // Version should follow semantic versioning
      expect(response.body.version).toMatch(/^\d+\.\d+\.\d+$/);

      // Build information
      expect(response.body.build).toHaveProperty("date");
      expect(response.body.build).toHaveProperty("commit");
      expect(response.body.build.date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);

      // Environment should be valid
      expect(["development", "test", "staging", "production"]).toContain(response.body.environment);

      // Node version should be present
      expect(response.body.node_version).toMatch(/^v?\d+\.\d+\.\d+$/);

      // Dependencies should be an object
      expect(typeof response.body.dependencies).toBe("object");
    });

    test("should include key dependency versions", async () => {
      // This test WILL FAIL until endpoint is implemented
      const response = await request(app)
        .get("/api/version")
        .expect(200);

      const deps = response.body.dependencies;

      // Critical dependencies should be present
      expect(deps).toHaveProperty("express");
      expect(deps).toHaveProperty("sqlite3");
      expect(deps).toHaveProperty("socket.io");

      // Each dependency version should follow semantic versioning
      Object.values(deps).forEach(version => {
        expect(version).toMatch(/^\d+\.\d+\.\d+/);
      });
    });
  });

  describe("Error Handling and Edge Cases", () => {
    test("should handle malformed health check requests gracefully", async () => {
      // This test WILL FAIL until endpoint is implemented
      const response = await request(app)
        .get("/api/health")
        .set("Accept", "text/plain") // Wrong accept header
        .expect(200); // Should still return JSON

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.body).toHaveProperty("status");
    });

    test("should return appropriate status during database degradation", async () => {
      // This test WILL FAIL until endpoint is implemented
      // Simulate database issues by closing connection
      await dbUtils.cleanup();

      const response = await request(app)
        .get("/api/health/detailed")
        .expect(200); // Should still respond, but with degraded status

      expect(["degraded", "unhealthy"]).toContain(response.body.status);
      expect(response.body.database.status).toBe("disconnected");
    });

    test("should cache metrics appropriately to prevent overload", async () => {
      // This test WILL FAIL until endpoint is implemented
      const startTime = Date.now();

      // Make rapid successive requests
      const responses = await Promise.all([
        request(app).get("/api/metrics"),
        request(app).get("/api/metrics"),
        request(app).get("/api/metrics")
      ]);

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should respond quickly due to caching
      expect(totalTime).toBeLessThan(200);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.metrics).toBeDefined();
      });

      // Timestamps might be the same due to caching (within 1 second)
      const timestamps = responses.map(r => new Date(r.body.timestamp));
      const timeDiff = Math.abs(timestamps[2].getTime() - timestamps[0].getTime());
      expect(timeDiff).toBeLessThan(1000);
    });

    test("should validate CORS headers for health endpoints", async () => {
      // This test WILL FAIL until endpoint is implemented
      const response = await request(app)
        .options("/api/health")
        .set("Origin", "http://localhost:3000")
        .set("Access-Control-Request-Method", "GET")
        .expect(200);

      expect(response.headers["access-control-allow-origin"]).toBeDefined();
      expect(response.headers["access-control-allow-methods"]).toContain("GET");
    });
  });

  describe("Security and Performance", () => {
    test("should not expose sensitive information in health checks", async () => {
      // This test WILL FAIL until endpoint is implemented
      const response = await request(app)
        .get("/api/health/detailed")
        .expect(200);

      // Should not contain sensitive data
      const responseString = JSON.stringify(response.body);
      expect(responseString).not.toMatch(/password/i);
      expect(responseString).not.toMatch(/secret/i);
      expect(responseString).not.toMatch(/key/i);
      expect(responseString).not.toMatch(/token/i);
    });

    test("should implement rate limiting on metrics endpoint", async () => {
      // This test WILL FAIL until endpoint is implemented
      // Make many rapid requests to test rate limiting
      const requests = Array.from({ length: 100 }, () =>
        request(app).get("/api/metrics")
      );

      const responses = await Promise.allSettled(requests);

      // Some requests should be rate limited (429 status)
      const rateLimitedResponses = responses.filter(
        result => result.status === "fulfilled" && result.value.status === 429
      );

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    test("should validate input parameters for health endpoints", async () => {
      // This test WILL FAIL until endpoint is implemented
      const maliciousInputs = [
        "/api/health?evil=<script>alert(1)</script>",
        "/api/health?test=../../../../etc/passwd",
        "/api/health?param=SELECT * FROM tickets"
      ];

      for (const input of maliciousInputs) {
        const response = await request(app)
          .get(input)
          .expect(200);

        // Should sanitize and not reflect malicious input
        const responseString = JSON.stringify(response.body);
        expect(responseString).not.toContain("<script>");
        expect(responseString).not.toContain("../../../../");
        expect(responseString).not.toContain("SELECT");
      }
    });
  });
});