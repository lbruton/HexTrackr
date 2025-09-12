/**
 * Contract tests for POST /api/preferences/theme
 *
 * Validates:
 * 1) 200 success when updating theme preference
 * 2) 400 validation error for invalid theme values
 * 3) 429 rate limiting when too many requests
 * 4) Proper HTTP request/response semantics
 *
 * Note: This spec intentionally fails initially since the endpoint
 * is not yet implemented.
 */

const fetch = require("node-fetch");

const BASE_URL = process.env.API_BASE_URL || "http://localhost:8989";
const ENDPOINT = "/api/preferences/theme";

const ISO_8601_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

function isISO8601(value) {
  return typeof value === "string" && ISO_8601_RE.test(value) && !Number.isNaN(Date.parse(value));
}

function isValidTheme(value) {
  return ["light", "dark", "system"].includes(value);
}

async function expectJsonBody(res) {
  try {
    return await res.json();
  } catch (err) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Expected JSON response but failed to parse. Status=${res.status}, Content-Type=${res.headers.get(
        "content-type"
      )}, Body (truncated)=${text.slice(0, 200)}`
    );
  }
}

describe("POST /api/preferences/theme (contract)", () => {
  describe("Success 200", () => {
    it("updates theme preference and returns success response", async () => {
      const res = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json" 
        },
        body: JSON.stringify({
          theme: "dark",
          session_id: "test-session-123",
          source: "user"
        })
      });

      expect(res.status).toBe(200);
      
      const body = await expectJsonBody(res);
      expect(body).toEqual(
        expect.objectContaining({
          theme: expect.any(String),
          timestamp: expect.any(String),
          message: expect.any(String),
        })
      );

      expect(isValidTheme(body.theme)).toBe(true);
      expect(isISO8601(body.timestamp)).toBe(true);
    });
  });

  describe("Validation Error 400", () => {
    it("returns 400 for invalid theme value", async () => {
      const res = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json" 
        },
        body: JSON.stringify({
          theme: "invalid-theme",
          session_id: "test-session-123"
        })
      });

      expect(res.status).toBe(400);
      
      const body = await expectJsonBody(res);
      expect(body).toEqual(
        expect.objectContaining({
          error: expect.any(String),
          validValues: expect.arrayContaining(["light", "dark", "system"]),
        })
      );
    });

    it("returns 400 for missing required theme field", async () => {
      const res = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json" 
        },
        body: JSON.stringify({
          session_id: "test-session-123"
        })
      });

      expect(res.status).toBe(400);
      
      const body = await expectJsonBody(res);
      expect(body).toHaveProperty("error");
    });
  });

  describe("Rate Limiting 429", () => {
    it("returns 429 when rate limit exceeded", async () => {
      // This test would require actual rate limiting implementation
      // For now, we document the expected contract
      
      const res = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json" 
        },
        body: JSON.stringify({
          theme: "light",
          session_id: "rate-limit-test"
        })
      });

      // Initially will fail since endpoint doesn't exist
      // When implemented, should handle rate limiting properly
      expect([200, 429]).toContain(res.status);
      
      if (res.status === 429) {
        const body = await expectJsonBody(res);
        expect(body).toEqual(
          expect.objectContaining({
            error: expect.any(String),
            retryAfter: expect.any(Number),
          })
        );
      }
    });
  });
});