/**
 * T007: Contract Test - POST /api/preferences/theme
 * 
 * HexTrackr Dark Mode Theme System - API Contract Validation
 * 
 * PURPOSE: Test-Driven Development contract test for theme preference updates.
 * This test MUST FAIL initially as the API endpoints don't exist yet!
 * 
 * PHASE: 3.2 TDD - Creating failing tests before implementation  
 * SPEC: 005-005-darkmode
 * 
 * TDD REQUIREMENT: These tests validate API contract compliance and will fail
 * until Phase 2 backend implementation is complete.
 */

const { test, expect } = require("@playwright/test");

test.describe("POST /api/preferences/theme - Contract Validation", () => {
    const BASE_URL = "http://localhost:8989"; // HexTrackr Docker port
    const API_ENDPOINT = `${BASE_URL}/api/preferences/theme`;

    // Helper function for response schema validation
    const validateThemeUpdateResponse = (response) => {
        expect(response).toHaveProperty("theme");
        expect(["light", "dark", "system"]).toContain(response.theme);
        
        expect(response).toHaveProperty("timestamp");
        expect(response.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        expect(Date.parse(response.timestamp)).not.toBeNaN();
        
        expect(response).toHaveProperty("message");
        expect(typeof response.message).toBe("string");
    };

    // Helper function for error response validation
    const validateErrorResponse = (response, expectedProperties = []) => {
        expect(response).toHaveProperty("error");
        expect(typeof response.error).toBe("string");
        
        expectedProperties.forEach(prop => {
            expect(response).toHaveProperty(prop);
        });
    };

    test.beforeEach(async ({ page }) => {
        // Ensure HexTrackr application is accessible
        await page.goto(BASE_URL);
        await page.waitForLoadState("networkidle");
    });

    test("should successfully update theme preference - light", async ({ request }) => {
        // TDD: This should fail - endpoint doesn't exist yet
        const response = await request.post(API_ENDPOINT, {
            data: {
                theme: "light",
                source: "user"
            }
        });
        
        expect(response.status()).toBe(200);
        
        const responseData = await response.json();
        validateThemeUpdateResponse(responseData);
        expect(responseData.theme).toBe("light");
        
        // Verify response headers
        expect(response.headers()["content-type"]).toContain("application/json");
    });

    test("should successfully update theme preference - dark", async ({ request }) => {
        // TDD: This should fail - endpoint doesn't exist yet
        const response = await request.post(API_ENDPOINT, {
            data: {
                theme: "dark",
                source: "user"
            }
        });
        
        expect(response.status()).toBe(200);
        
        const responseData = await response.json();
        validateThemeUpdateResponse(responseData);
        expect(responseData.theme).toBe("dark");
    });

    test("should successfully update theme preference - system", async ({ request }) => {
        // TDD: This should fail - endpoint doesn't exist yet
        const response = await request.post(API_ENDPOINT, {
            data: {
                theme: "system",
                source: "user"
            }
        });
        
        expect(response.status()).toBe(200);
        
        const responseData = await response.json();
        validateThemeUpdateResponse(responseData);
        expect(responseData.theme).toBe("system");
    });

    test("should include session_id in request body", async ({ request }) => {
        // TDD: This should fail - endpoint doesn't exist yet
        const sessionId = "test-session-67890";
        const response = await request.post(API_ENDPOINT, {
            data: {
                theme: "dark",
                session_id: sessionId,
                source: "user"
            }
        });
        
        expect(response.status()).toBe(200);
        
        const responseData = await response.json();
        validateThemeUpdateResponse(responseData);
    });

    test("should default source to 'user' when not specified", async ({ request }) => {
        // TDD: This should fail - endpoint doesn't exist yet
        const response = await request.post(API_ENDPOINT, {
            data: {
                theme: "light"
            }
        });
        
        expect(response.status()).toBe(200);
        
        const responseData = await response.json();
        validateThemeUpdateResponse(responseData);
    });

    test("should return 400 for invalid theme value", async ({ request }) => {
        // TDD: This should fail - endpoint doesn't exist yet
        const response = await request.post(API_ENDPOINT, {
            data: {
                theme: "invalid-theme"
            }
        });
        
        expect(response.status()).toBe(400);
        
        const responseData = await response.json();
        validateErrorResponse(responseData, ["validValues"]);
        
        expect(Array.isArray(responseData.validValues)).toBe(true);
        expect(responseData.validValues).toEqual(["light", "dark", "system"]);
    });

    test("should return 400 for missing theme field", async ({ request }) => {
        // TDD: This should fail - endpoint doesn't exist yet
        const response = await request.post(API_ENDPOINT, {
            data: {
                source: "user"
            }
        });
        
        expect(response.status()).toBe(400);
        
        const responseData = await response.json();
        validateErrorResponse(responseData);
        expect(responseData.error).toContain("theme");
    });

    test("should return 400 for malformed JSON", async ({ request }) => {
        // TDD: This should fail - endpoint doesn't exist yet  
        const response = await request.post(API_ENDPOINT, {
            data: "invalid json data"
        });
        
        expect(response.status()).toBe(400);
        
        const responseData = await response.json();
        validateErrorResponse(responseData);
    });

    test("should validate source field enum values", async ({ request }) => {
        // TDD: This should fail - endpoint doesn't exist yet
        const response = await request.post(API_ENDPOINT, {
            data: {
                theme: "light",
                source: "invalid-source"
            }
        });
        
        expect(response.status()).toBe(400);
        
        const responseData = await response.json();
        validateErrorResponse(responseData);
        expect(responseData.error).toContain("source");
    });

    test("should handle XSS prevention in theme field", async ({ request }) => {
        // TDD: This should fail - endpoint doesn't exist yet
        const xssPayload = "<script>alert('xss')</script>";
        const response = await request.post(API_ENDPOINT, {
            data: {
                theme: xssPayload
            }
        });
        
        expect(response.status()).toBe(400);
        
        const responseData = await response.json();
        validateErrorResponse(responseData);
        
        // Ensure XSS payload not reflected in response
        const responseString = JSON.stringify(responseData);
        expect(responseString).not.toContain("<script>");
        expect(responseString).not.toContain("alert");
    });

    test("should handle XSS prevention in session_id field", async ({ request }) => {
        // TDD: This should fail - endpoint doesn't exist yet
        const xssPayload = "<img src=x onerror=alert('xss')>";
        const response = await request.post(API_ENDPOINT, {
            data: {
                theme: "light",
                session_id: xssPayload
            }
        });
        
        // Should process without reflecting XSS
        expect([200, 400]).toContain(response.status());
        
        const responseData = await response.json();
        const responseString = JSON.stringify(responseData);
        expect(responseString).not.toContain("<img");
        expect(responseString).not.toContain("onerror");
        expect(responseString).not.toContain("alert");
    });

    test("should enforce rate limiting (429)", async ({ request }) => {
        // TDD: This should fail - endpoint doesn't exist yet
        // Per contract: Maximum 10 theme changes per minute
        const requests = Array(12).fill().map(() => 
            request.post(API_ENDPOINT, {
                data: { theme: "light" }
            })
        );
        
        const responses = await Promise.all(requests);
        
        // At least one request should be rate limited
        const rateLimitedResponses = responses.filter(r => r.status() === 429);
        expect(rateLimitedResponses.length).toBeGreaterThan(0);
        
        // Check rate limit response structure
        if (rateLimitedResponses.length > 0) {
            const rateLimitResponse = await rateLimitedResponses[0].json();
            expect(rateLimitResponse).toHaveProperty("error");
            expect(rateLimitResponse).toHaveProperty("retryAfter");
            expect(typeof rateLimitResponse.retryAfter).toBe("number");
        }
    });

    test("should validate Content-Type header", async ({ request }) => {
        // TDD: This should fail - endpoint doesn't exist yet
        const response = await request.post(API_ENDPOINT, {
            headers: {
                "Content-Type": "text/plain"
            },
            data: "theme=light"
        });
        
        expect(response.status()).toBe(400);
        
        const responseData = await response.json();
        validateErrorResponse(responseData);
    });

    test("should handle large payload gracefully", async ({ request }) => {
        // TDD: This should fail - endpoint doesn't exist yet
        const largePayload = {
            theme: "light",
            session_id: "x".repeat(10000), // 10KB session ID
            source: "user"
        };
        
        const response = await request.post(API_ENDPOINT, {
            data: largePayload
        });
        
        // Should reject or handle gracefully, not crash
        expect([200, 400, 413]).toContain(response.status());
        
        const responseData = await response.json();
        expect(typeof responseData).toBe("object");
    });

    test("should respond within performance requirements", async ({ request }) => {
        // TDD: This should fail - endpoint doesn't exist yet
        const startTime = Date.now();
        const response = await request.post(API_ENDPOINT, {
            data: {
                theme: "dark"
            }
        });
        const endTime = Date.now();
        
        const responseTime = endTime - startTime;
        
        // Performance requirement: <100ms response time per spec
        expect(responseTime).toBeLessThan(100);
        expect([200, 400]).toContain(response.status());
    });

    test("should include required security headers", async ({ request }) => {
        // TDD: This should fail - endpoint doesn't exist yet
        const response = await request.post(API_ENDPOINT, {
            data: {
                theme: "light"
            }
        });
        
        const headers = response.headers();
        
        // Basic security headers validation
        expect(headers["content-type"]).toContain("application/json");
        
        // HexTrackr should implement security headers
        if (headers["x-content-type-options"]) {
            expect(headers["x-content-type-options"]).toBe("nosniff");
        }
    });
});

test.describe("POST /api/preferences/theme - Error Handling", () => {
    const BASE_URL = "http://localhost:8989";
    const API_ENDPOINT = `${BASE_URL}/api/preferences/theme`;

    test("should return 404 when endpoint doesn't exist (TDD validation)", async ({ request }) => {
        // This test validates the TDD requirement
        // During Phase 3.2, this endpoint should not exist yet!
        const response = await request.post(API_ENDPOINT, {
            data: {
                theme: "light"
            }
        });
        
        // Expected during TDD phase: endpoint not implemented
        expect(response.status()).toBe(404);
        
        // The 404 should be from Express (route not found), not our API contract 404
        const responseText = await response.text();
        expect(responseText).toContain("Cannot POST");
    });

    test("should handle server errors gracefully", async ({ request }) => {
        // TDD: Test server error scenarios
        const response = await request.post(API_ENDPOINT, {
            data: {
                theme: "light"
            }
        });
        
        if (response.status() >= 500) {
            const responseData = await response.json();
            expect(responseData).toHaveProperty("error");
            expect(typeof responseData.error).toBe("string");
        }
    });

    test("should validate timestamp format in responses", async ({ request }) => {
        // TDD: This should fail - endpoint doesn't exist yet
        const response = await request.post(API_ENDPOINT, {
            data: {
                theme: "system"
            }
        });
        
        if (response.status() === 200) {
            const responseData = await response.json();
            
            // Timestamp validation per contract
            expect(responseData.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/);
            
            // Should be valid ISO 8601
            const parsedDate = new Date(responseData.timestamp);
            expect(parsedDate.toISOString()).toBe(responseData.timestamp);
        }
    });
});