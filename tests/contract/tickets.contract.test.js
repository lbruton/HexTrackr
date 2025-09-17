/**
 * Tickets API Contract Tests
 * TDD Implementation - These tests MUST FAIL initially as implementation is not complete
 * Tests the contract (request/response structure) for all ticket endpoints
 */

const { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } = require("@jest/globals");
const request = require("supertest");
const express = require("express");
const {
  DatabaseTestUtils,
  ExpressTestUtils,
  MockFactories,
  AssertionHelpers
} = require("../test-utils");

describe("Tickets API Contract Tests", () => {
  let dbUtils;
  let expressUtils;
  let app;
  let testTicket;

  beforeAll(async () => {
    // Initialize test database and Express app
    dbUtils = new DatabaseTestUtils();
    expressUtils = new ExpressTestUtils();

    await dbUtils.createTestDatabase("tickets-contract");
    await dbUtils.initializeSchema();

    // Create test app (this will fail until actual implementation exists)
    app = expressUtils.createTestApp();

    // Create mock ticket data for testing
    testTicket = MockFactories.createMockTicket({
      id: "TEST-001",
      xt_number: "XT-001",
      location: "Test Building",
      status: "Open",
      tech: "Test Tech"
    });
  });

  afterAll(async () => {
    await dbUtils.cleanup();
    await expressUtils.stopServer();
  });

  beforeEach(async () => {
    await dbUtils.beginTransaction();
  });

  afterEach(async () => {
    await dbUtils.rollbackTransaction();
  });

  describe("GET /api/tickets", () => {
    test("should return 200 with array of tickets", async () => {
      // This test WILL FAIL - endpoint not implemented yet
      const response = await request(app)
        .get("/api/tickets")
        .expect(200);

      // Contract validation
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.headers["content-type"]).toMatch(/json/);

      // Response structure validation
      if (response.body.length > 0) {
        const ticket = response.body[0];
        expect(ticket).toHaveProperty("id");
        expect(ticket).toHaveProperty("xt_number");
        expect(ticket).toHaveProperty("location");
        expect(ticket).toHaveProperty("status");
        expect(ticket).toHaveProperty("created_at");
        expect(ticket).toHaveProperty("updated_at");
      }
    });

    test("should handle empty database gracefully", async () => {
      const response = await request(app)
        .get("/api/tickets")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    test("should handle database errors with 500 status", async () => {
      // This would test database error scenarios
      // Implementation will fail until error handling is added
      const response = await request(app)
        .get("/api/tickets")
        .expect("Content-Type", /json/);

      if (response.status === 500) {
        expect(response.body).toHaveProperty("error");
        expect(typeof response.body.error).toBe("string");
      }
    });
  });

  describe("GET /api/tickets/:id", () => {
    test("should return 200 with single ticket when ticket exists", async () => {
      // This endpoint WILL FAIL - not implemented yet
      const ticketId = "TEST-001";

      const response = await request(app)
        .get(`/api/tickets/${ticketId}`)
        .expect(200);

      // Contract validation
      expect(response.body).toHaveProperty("id", ticketId);
      expect(response.body).toHaveProperty("xt_number");
      expect(response.body).toHaveProperty("location");
      expect(response.body).toHaveProperty("status");
      expect(response.body).toHaveProperty("created_at");
      expect(response.body).toHaveProperty("updated_at");
      expect(response.headers["content-type"]).toMatch(/json/);
    });

    test("should return 404 when ticket does not exist", async () => {
      const response = await request(app)
        .get("/api/tickets/NON-EXISTENT")
        .expect(404);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("not found");
    });

    test("should validate ticket ID parameter format", async () => {
      const response = await request(app)
        .get("/api/tickets/") // empty ID
        .expect(404); // Should be 404 for empty path

      // Could also test invalid ID formats if validation exists
    });
  });

  describe("POST /api/tickets", () => {
    test("should create ticket and return 201 with success response", async () => {
      const newTicket = {
        id: "NEW-001",
        xtNumber: "XT-NEW-001",
        dateSubmitted: "2025-01-15",
        dateDue: "2025-01-22",
        hexagonTicket: "HEX-001",
        serviceNowTicket: "INC0001",
        location: "Test Location",
        devices: ["Device1", "Device2"],
        supervisor: "Test Supervisor",
        tech: "Test Technician",
        status: "Open",
        notes: "Test ticket creation",
        attachments: [],
        site: "Test Site",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const response = await request(app)
        .post("/api/tickets")
        .send(newTicket)
        .expect(201);

      // Contract validation
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("id", newTicket.id);
      expect(response.body).toHaveProperty("message");
      expect(response.headers["content-type"]).toMatch(/json/);
    });

    test("should validate required fields and return 400 for invalid input", async () => {
      const invalidTicket = {
        // Missing required fields like location, status, etc.
        xtNumber: "XT-INVALID"
      };

      const response = await request(app)
        .post("/api/tickets")
        .send(invalidTicket)
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(typeof response.body.error).toBe("string");
    });

    test("should handle duplicate ticket IDs", async () => {
      const duplicateTicket = {
        id: "DUPLICATE-001",
        xtNumber: "XT-DUP-001",
        location: "Test Location",
        status: "Open",
        tech: "Test Tech"
      };

      // First creation should succeed
      await request(app)
        .post("/api/tickets")
        .send(duplicateTicket)
        .expect(201);

      // Second creation with same ID should fail
      const response = await request(app)
        .post("/api/tickets")
        .send(duplicateTicket)
        .expect(409); // Conflict

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("already exists");
    });

    test("should validate JSON content-type header", async () => {
      const response = await request(app)
        .post("/api/tickets")
        .set("Content-Type", "text/plain")
        .send("invalid data")
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    test("should handle malformed JSON gracefully", async () => {
      const response = await request(app)
        .post("/api/tickets")
        .set("Content-Type", "application/json")
        .send("{\"invalid\": json}")
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("PUT /api/tickets/:id", () => {
    test("should update existing ticket and return 200", async () => {
      const ticketId = "UPDATE-001";

      // First create a ticket
      const originalTicket = {
        id: ticketId,
        xtNumber: "XT-UPDATE-001",
        location: "Original Location",
        status: "Open",
        tech: "Original Tech"
      };

      await request(app)
        .post("/api/tickets")
        .send(originalTicket)
        .expect(201);

      // Then update it
      const updatedTicket = {
        ...originalTicket,
        location: "Updated Location",
        status: "In Progress",
        tech: "Updated Tech",
        updatedAt: new Date().toISOString()
      };

      const response = await request(app)
        .put(`/api/tickets/${ticketId}`)
        .send(updatedTicket)
        .expect(200);

      // Contract validation
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("id", ticketId);
      expect(response.body).toHaveProperty("message");
      expect(response.headers["content-type"]).toMatch(/json/);
    });

    test("should return 404 when updating non-existent ticket", async () => {
      const updateData = {
        location: "Updated Location",
        status: "Closed"
      };

      const response = await request(app)
        .put("/api/tickets/NON-EXISTENT")
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("not found");
    });

    test("should validate update data structure", async () => {
      const response = await request(app)
        .put("/api/tickets/TEST-001")
        .send({ invalidField: "invalid" })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("DELETE /api/tickets/:id", () => {
    test("should delete existing ticket and return 200", async () => {
      const ticketId = "DELETE-001";

      // First create a ticket
      const ticketToDelete = {
        id: ticketId,
        xtNumber: "XT-DELETE-001",
        location: "Test Location",
        status: "Open",
        tech: "Test Tech"
      };

      await request(app)
        .post("/api/tickets")
        .send(ticketToDelete)
        .expect(201);

      // Then delete it
      const response = await request(app)
        .delete(`/api/tickets/${ticketId}`)
        .expect(200);

      // Contract validation
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("deleted");
      expect(response.body.deleted).toBeGreaterThan(0);
      expect(response.headers["content-type"]).toMatch(/json/);

      // Verify ticket is actually deleted
      await request(app)
        .get(`/api/tickets/${ticketId}`)
        .expect(404);
    });

    test("should return 404 when deleting non-existent ticket", async () => {
      const response = await request(app)
        .delete("/api/tickets/NON-EXISTENT")
        .expect(404);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("not found");
    });

    test("should handle database errors during deletion", async () => {
      // Test would verify proper error handling
      const response = await request(app)
        .delete("/api/tickets/ERROR-TEST")
        .expect("Content-Type", /json/);

      if (response.status === 500) {
        expect(response.body).toHaveProperty("error");
      }
    });
  });

  describe("POST /api/tickets/import-csv", () => {
    test("should import tickets from CSV data and return 200", async () => {
      const csvData = {
        data: [
          {
            id: "CSV-001",
            xt_number: "XT-CSV-001",
            date_submitted: "2025-01-15",
            location: "CSV Location 1",
            status: "Open",
            tech: "CSV Tech 1"
          },
          {
            id: "CSV-002",
            xt_number: "XT-CSV-002",
            date_submitted: "2025-01-16",
            location: "CSV Location 2",
            status: "In Progress",
            tech: "CSV Tech 2"
          }
        ]
      };

      const response = await request(app)
        .post("/api/tickets/import-csv")
        .send(csvData)
        .expect(200);

      // Contract validation
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("imported");
      expect(response.body).toHaveProperty("total");
      expect(response.body.imported).toBe(2);
      expect(response.body.total).toBe(2);
      expect(response.headers["content-type"]).toMatch(/json/);
    });

    test("should handle empty CSV data", async () => {
      const response = await request(app)
        .post("/api/tickets/import-csv")
        .send({ data: [] })
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("No data provided");
    });

    test("should validate CSV data structure", async () => {
      const invalidCsvData = {
        data: [
          { invalidField: "invalid" } // Missing required fields
        ]
      };

      const response = await request(app)
        .post("/api/tickets/import-csv")
        .send(invalidCsvData)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    test("should handle partial import failures", async () => {
      const mixedCsvData = {
        data: [
          {
            id: "VALID-001",
            xt_number: "XT-VALID-001",
            location: "Valid Location",
            status: "Open",
            tech: "Valid Tech"
          },
          {
            // Invalid record missing required fields
            id: "INVALID-001"
          }
        ]
      };

      const response = await request(app)
        .post("/api/tickets/import-csv")
        .send(mixedCsvData)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("imported");
      expect(response.body).toHaveProperty("total");
      expect(response.body).toHaveProperty("errors");
      expect(response.body.imported).toBeLessThan(response.body.total);
      expect(Array.isArray(response.body.errors)).toBe(true);
    });
  });

  describe("GET /api/tickets/export-csv", () => {
    test("should export tickets as CSV data and return 200", async () => {
      // First create some test tickets
      const testTickets = [
        {
          id: "EXPORT-001",
          xtNumber: "XT-EXPORT-001",
          location: "Export Location 1",
          status: "Open",
          tech: "Export Tech 1"
        },
        {
          id: "EXPORT-002",
          xtNumber: "XT-EXPORT-002",
          location: "Export Location 2",
          status: "Closed",
          tech: "Export Tech 2"
        }
      ];

      for (const ticket of testTickets) {
        await request(app)
          .post("/api/tickets")
          .send(ticket)
          .expect(201);
      }

      const response = await request(app)
        .get("/api/tickets/export-csv")
        .expect(200);

      // Contract validation
      expect(response.body).toHaveProperty("type", "tickets");
      expect(response.body).toHaveProperty("count");
      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("exported_at");
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThan(0);
      expect(response.headers["content-type"]).toMatch(/json/);
    });

    test("should handle empty database for export", async () => {
      const response = await request(app)
        .get("/api/tickets/export-csv")
        .expect(200);

      expect(response.body).toHaveProperty("type", "tickets");
      expect(response.body).toHaveProperty("count", 0);
      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    test("should include proper CSV headers in export data", async () => {
      const response = await request(app)
        .get("/api/tickets/export-csv")
        .expect(200);

      if (response.body.data.length > 0) {
        const ticket = response.body.data[0];
        expect(ticket).toHaveProperty("id");
        expect(ticket).toHaveProperty("xt_number");
        expect(ticket).toHaveProperty("location");
        expect(ticket).toHaveProperty("status");
        expect(ticket).toHaveProperty("created_at");
        expect(ticket).toHaveProperty("updated_at");
      }
    });
  });

  describe("Error Handling Contract Tests", () => {
    test("should return 404 for non-existent endpoints", async () => {
      await request(app)
        .get("/api/tickets/non-existent-endpoint")
        .expect(404);

      await request(app)
        .post("/api/tickets/invalid-action")
        .expect(404);
    });

    test("should validate HTTP methods for each endpoint", async () => {
      // Test unsupported methods
      await request(app)
        .patch("/api/tickets")
        .expect(405); // Method Not Allowed

      await request(app)
        .put("/api/tickets") // Should require ID parameter
        .expect(404);
    });

    test("should handle rate limiting for import/export endpoints", async () => {
      // This would test rate limiting if implemented
      // Multiple rapid requests to import/export endpoints
      const promises = Array(10).fill().map(() =>
        request(app)
          .get("/api/tickets/export-csv")
      );

      const responses = await Promise.all(promises);

      // Check if any responses indicate rate limiting
      const rateLimited = responses.some(res => res.status === 429);
      if (rateLimited) {
        const limitedResponse = responses.find(res => res.status === 429);
        expect(limitedResponse.body).toHaveProperty("error");
        expect(limitedResponse.headers).toHaveProperty("retry-after");
      }
    });

    test("should handle database connection errors", async () => {
      // This would test database connection failure scenarios
      // Implementation depends on database connection management
      const response = await request(app)
        .get("/api/tickets")
        .expect("Content-Type", /json/);

      if (response.status === 503) {
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toContain("database");
      }
    });
  });

  describe("Data Validation Contract Tests", () => {
    test("should validate ticket data types and formats", async () => {
      const invalidTicket = {
        id: 123, // Should be string
        xtNumber: null, // Should be string
        dateSubmitted: "invalid-date", // Should be valid date format
        location: "", // Should be non-empty
        status: "InvalidStatus", // Should be valid status
        tech: 123 // Should be string
      };

      const response = await request(app)
        .post("/api/tickets")
        .send(invalidTicket)
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("validation");
    });

    test("should validate date formats in requests", async () => {
      const ticketWithInvalidDates = {
        id: "DATE-TEST-001",
        xtNumber: "XT-DATE-001",
        dateSubmitted: "2025-13-45", // Invalid date
        dateDue: "not-a-date", // Invalid format
        location: "Test Location",
        status: "Open",
        tech: "Test Tech"
      };

      const response = await request(app)
        .post("/api/tickets")
        .send(ticketWithInvalidDates)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    test("should validate string length limits", async () => {
      const ticketWithLongStrings = {
        id: "LONG-TEST-001",
        xtNumber: "X".repeat(1000), // Very long string
        location: "L".repeat(1000), // Very long string
        notes: "N".repeat(10000), // Very long notes
        status: "Open",
        tech: "Test Tech"
      };

      const response = await request(app)
        .post("/api/tickets")
        .send(ticketWithLongStrings)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("Performance Contract Tests", () => {
    test("should respond to GET /api/tickets within acceptable time", async () => {
      const startTime = Date.now();

      await request(app)
        .get("/api/tickets")
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(5000); // 5 seconds max
    });

    test("should handle large dataset exports efficiently", async () => {
      // This would test performance with large datasets
      // Skip if not in performance test environment
      if (process.env.TEST_PERFORMANCE !== "true") {
        return;
      }

      const startTime = Date.now();

      const response = await request(app)
        .get("/api/tickets/export-csv")
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(30000); // 30 seconds max for export

      // Verify response size is reasonable
      const responseSize = JSON.stringify(response.body).length;
      expect(responseSize).toBeLessThan(50 * 1024 * 1024); // 50MB max
    });
  });
});