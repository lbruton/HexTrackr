/**
 * Example Contract Test
 * Demonstrates API contract testing setup and patterns
 */

const { describe, test, expect } = require("@jest/globals");
const request = require("supertest");
const express = require("express");

// Example Express app for testing
const createTestApp = () => {
  const app = express();
  app.use(express.json());

  // Example routes for testing
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/api/test", (req, res) => {
    res.json({ message: "Test endpoint" });
  });

  app.post("/api/echo", (req, res) => {
    res.json({ received: req.body });
  });

  // Error handling
  app.use((err, req, res, next) => {
    res.status(500).json({ error: err.message });
  });

  return app;
};

describe("Example Contract Test Suite", () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  test("should demonstrate contract testing setup", () => {
    expect(process.env.NODE_ENV).toBe("test");
    expect(global.createTestRequest).toBeDefined();
  });

  test("should test health endpoint contract", async () => {
    const response = await request(app)
      .get("/api/health")
      .expect(200);

    expect(response.body).toHaveProperty("status", "ok");
    expect(response.body).toHaveProperty("timestamp");
    expect(typeof response.body.timestamp).toBe("string");
  });

  test("should test GET endpoint contract", async () => {
    const response = await request(app)
      .get("/api/test")
      .expect(200);

    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("Test endpoint");
  });

  test("should test POST endpoint contract", async () => {
    const testData = { test: "data", number: 42 };

    const response = await request(app)
      .post("/api/echo")
      .send(testData)
      .expect(200);

    expect(response.body).toHaveProperty("received");
    expect(response.body.received).toEqual(testData);
  });

  test("should handle invalid routes", async () => {
    await request(app)
      .get("/api/nonexistent")
      .expect(404);
  });

  test("should validate content-type headers", async () => {
    const response = await request(app)
      .get("/api/health")
      .expect(200);

    expect(response.headers["content-type"]).toMatch(/json/);
  });

  test("should handle malformed JSON", async () => {
    await request(app)
      .post("/api/echo")
      .set("Content-Type", "application/json")
      .send("{\"invalid\": json}")
      .expect(500); // Express returns 500 for JSON parsing errors by default
  });
});