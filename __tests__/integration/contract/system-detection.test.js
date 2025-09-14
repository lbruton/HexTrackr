/**
 * Contract tests for GET /api/preferences/theme/system
 *
 * Validates:
 * 1) 200 success with system preference detection
 * 2) Proper HTTP request/response semantics
 * 3) Browser user agent parsing for system capabilities
 *
 * Note: This spec intentionally fails initially since the endpoint
 * is not yet implemented.
 */

const fetch = require("node-fetch");

const BASE_URL = process.env.API_BASE_URL || "http://localhost:8989";
const ENDPOINT = "/api/preferences/theme/system";

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

describe("GET /api/preferences/theme/system (contract)", () => {
  describe("Success 200", () => {
    it("detects system preference with browser capabilities", async () => {
      const res = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "GET",
        headers: { 
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        },
      });

      expect(res.status).toBe(200);
      
      const body = await expectJsonBody(res);
      expect(body).toEqual(
        expect.objectContaining({
          prefersDark: expect.any(Boolean),
          supported: expect.any(Boolean),
          userAgent: expect.any(String),
        })
      );

      // Validate boolean fields
      expect(typeof body.prefersDark).toBe("boolean");
      expect(typeof body.supported).toBe("boolean");
      
      // User agent should be present and non-empty
      expect(body.userAgent.length).toBeGreaterThan(0);
    });

    it("handles requests without user agent gracefully", async () => {
      const res = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "GET",
        headers: { 
          "Accept": "application/json"
        },
      });

      expect(res.status).toBe(200);
      
      const body = await expectJsonBody(res);
      expect(body).toEqual(
        expect.objectContaining({
          prefersDark: expect.any(Boolean),
          supported: expect.any(Boolean),
          userAgent: expect.any(String),
        })
      );

      // Should still provide sensible defaults
      expect(typeof body.supported).toBe("boolean");
    });
  });

  describe("HTTP semantics", () => {
    it("responds with appropriate headers for system detection", async () => {
      const res = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "GET",
        headers: { "Accept": "application/json" },
      });

      const ct = res.headers.get("content-type") || "";
      expect(ct.toLowerCase()).toContain("application/json");
      
      // System detection might be cacheable for short periods
      // Implementation detail - but should not cache user-specific data
    });
  });
});