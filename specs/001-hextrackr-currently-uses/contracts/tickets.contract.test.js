/**
 * Contract Tests for Tickets API
 * These tests verify the API contracts remain unchanged after modularization
 */

const request = require("supertest");
const app = require("../../../app/server");

describe("Tickets API Contract", () => {
  let server;

  beforeAll(() => {
    server = app.listen(8989);
  });

  afterAll(() => {
    server.close();
  });

  describe("GET /api/tickets", () => {
    it("should return list of tickets with correct structure", async () => {
      const response = await request(server)
        .get("/api/tickets")
        .expect(200)
        .expect("Content-Type", /json/);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);

      if (response.body.data.length > 0) {
        const ticket = response.body.data[0];
        expect(ticket).toHaveProperty("id");
        expect(ticket).toHaveProperty("title");
        expect(ticket).toHaveProperty("status");
        expect(["open", "in_progress", "resolved", "closed"]).toContain(ticket.status);
      }
    });
  });

  describe("POST /api/tickets", () => {
    it("should create a new ticket and return id", async () => {
      const newTicket = {
        title: "Test Ticket",
        description: "Contract test ticket",
        status: "open",
        priority: "medium",
        devices: []
      };

      const response = await request(server)
        .post("/api/tickets")
        .send(newTicket)
        .expect(200)
        .expect("Content-Type", /json/);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("ticketId");
      expect(typeof response.body.ticketId).toBe("number");
    });

    it("should reject invalid ticket data", async () => {
      const invalidTicket = {
        // Missing required 'title' field
        status: "open"
      };

      const response = await request(server)
        .post("/api/tickets")
        .send(invalidTicket)
        .expect(400);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("PUT /api/tickets/:id", () => {
    it("should update an existing ticket", async () => {
      // First create a ticket
      const createResponse = await request(server)
        .post("/api/tickets")
        .send({
          title: "Ticket to Update",
          status: "open",
          priority: "low"
        });

      const ticketId = createResponse.body.ticketId;

      // Then update it
      const updateResponse = await request(server)
        .put(`/api/tickets/${ticketId}`)
        .send({
          title: "Updated Ticket",
          status: "in_progress",
          priority: "high"
        })
        .expect(200);

      expect(updateResponse.body).toHaveProperty("success", true);
      expect(updateResponse.body).toHaveProperty("message");
    });

    it("should return 404 for non-existent ticket", async () => {
      const response = await request(server)
        .put("/api/tickets/999999")
        .send({
          title: "Updated Ticket",
          status: "open"
        })
        .expect(404);

      expect(response.body).toHaveProperty("success", false);
    });
  });

  describe("DELETE /api/tickets/:id", () => {
    it("should delete an existing ticket", async () => {
      // First create a ticket
      const createResponse = await request(server)
        .post("/api/tickets")
        .send({
          title: "Ticket to Delete",
          status: "open"
        });

      const ticketId = createResponse.body.ticketId;

      // Then delete it
      const deleteResponse = await request(server)
        .delete(`/api/tickets/${ticketId}`)
        .expect(200);

      expect(deleteResponse.body).toHaveProperty("success", true);

      // Verify it's deleted
      await request(server)
        .get(`/api/tickets/${ticketId}`)
        .expect(404);
    });
  });
});

/**
 * These tests MUST pass against both:
 * 1. The current monolithic server.js
 * 2. The new modularized architecture
 *
 * This ensures zero breaking changes during refactoring.
 */