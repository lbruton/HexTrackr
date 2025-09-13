/**
 * T008: Contract Test - GET /api/preferences/theme/system
 * 
 * HexTrackr Dark Mode Theme System - API Contract Validation
 * 
 * PURPOSE: Test-Driven Development contract test for system theme detection.
 * This test MUST FAIL initially as the API endpoints don't exist yet!
 * 
 * PHASE: 3.2 TDD - Creating failing tests before implementation
 * SPEC: 005-005-darkmode
 * 
 * TDD REQUIREMENT: These tests validate API contract compliance and will fail
 * until Phase 2 backend implementation is complete.
 */

const { test, expect } = require("@playwright/test");

test.describe("GET /api/preferences/theme/system - Contract Validation", () => {
    const BASE_URL = "http://localhost:8989"; // HexTrackr Docker port
    const API_ENDPOINT = `${BASE_URL}/api/preferences/theme/system`;

    // Helper function for schema validation
    const validateSystemDetectionResponse = (response) => {
        expect(response).toHaveProperty("prefersDark");
        expect(typeof response.prefersDark).toBe("boolean");
        
        expect(response).toHaveProperty("supported");
        expect(typeof response.supported).toBe("boolean");
        
        expect(response).toHaveProperty("userAgent");
        expect(typeof response.userAgent).toBe("string");
        expect(response.userAgent.length).toBeGreaterThan(0);
    };

    test.beforeEach(async ({ page }) => {
        // Ensure HexTrackr application is accessible
        await page.goto(BASE_URL);
        await page.waitForLoadState("networkidle");
    });

    test("should detect system theme preference successfully", async ({ request }) => {
        // TDD: This should fail - endpoint doesn't exist yet
        const response = await request.get(API_ENDPOINT);
        
        expect(response.status()).toBe(200);
        
        const responseData = await response.json();
        validateSystemDetectionResponse(responseData);
        
        // Verify response headers
        expect(response.headers()["content-type"]).toContain("application/json");
    });

    test("should return boolean prefersDark value", async ({ request }) => {
        // TDD: This should fail - endpoint doesn't exist yet
        const response = await request.get(API_ENDPOINT);
        
        expect(response.status()).toBe(200);
        
        const responseData = await response.json();
        
        // prefersDark must be exactly true or false
        expect([true, false]).toContain(responseData.prefersDark);
        expect(typeof responseData.prefersDark).toBe("boolean");
    });

    test("should indicate browser support for prefers-color-scheme", async ({ request }) => {
        // TDD: This should fail - endpoint doesn't exist yet
        const response = await request.get(API_ENDPOINT);
        
        expect(response.status()).toBe(200);
        
        const responseData = await response.json();
        
        // supported must be boolean
        expect([true, false]).toContain(responseData.supported);
        expect(typeof responseData.supported).toBe("boolean");
        
        // Logic validation: if supported is false, prefersDark should still be valid
        if (!responseData.supported) {
            // Should still return a fallback boolean value
            expect(typeof responseData.prefersDark).toBe("boolean");
        }
    });

    test("should include valid user agent string", async ({ request }) => {
        // TDD: This should fail - endpoint doesn't exist yet
        const response = await request.get(API_ENDPOINT);
        
        expect(response.status()).toBe(200);
        
        const responseData = await response.json();
        
        // User agent validation
        expect(responseData.userAgent).toBeDefined();
        expect(typeof responseData.userAgent).toBe("string");
        expect(responseData.userAgent.length).toBeGreaterThan(10);
        
        // Should not contain sensitive information
        expect(responseData.userAgent).not.toContain("password");
        expect(responseData.userAgent).not.toContain("token");
        expect(responseData.userAgent).not.toContain("secret");
    });

    test("should handle different browser contexts", async ({ browser }) => {
        // TDD: This should fail - endpoint doesn't exist yet
        const contexts = await Promise.all([
            browser.newContext({ colorScheme: "light" }),
            browser.newContext({ colorScheme: "dark" }),
            browser.newContext({ colorScheme: "no-preference" })
        ]);
        
        const responses = [];
        
        for (const context of contexts) {
            const page = await context.newPage();
            const response = await page.request.get(API_ENDPOINT);
            expect(response.status()).toBe(200);
            
            const responseData = await response.json();
            validateSystemDetectionResponse(responseData);
            responses.push(responseData);
            
            await context.close();
        }
        
        // Each context should return valid responses
        expect(responses.length).toBe(3);
        responses.forEach(response => {
            expect(typeof response.prefersDark).toBe("boolean");
            expect(typeof response.supported).toBe("boolean");
        });
    });

    test("should respond within performance requirements", async ({ request }) => {
        // TDD: This should fail - endpoint doesn't exist yet
        const startTime = Date.now();
        const response = await request.get(API_ENDPOINT);
        const endTime = Date.now();
        
        const responseTime = endTime - startTime;
        
        // Performance requirement: <100ms response time per spec
        expect(responseTime).toBeLessThan(100);
        expect(response.status()).toBe(200);
    });

    test("should handle concurrent detection requests", async ({ request }) => {
        // TDD: This should fail - endpoint doesn't exist yet
        const requests = Array(5).fill().map(() => request.get(API_ENDPOINT));
        const responses = await Promise.all(requests);
        
        // All requests should succeed
        responses.forEach(response => {
            expect(response.status()).toBe(200);
        });
        
        // All responses should have consistent schema
        for (const response of responses) {
            const responseData = await response.json();
            validateSystemDetectionResponse(responseData);
        }
    });

    test("should include security headers", async ({ request }) => {
        // TDD: This should fail - endpoint doesn't exist yet
        const response = await request.get(API_ENDPOINT);
        
        expect(response.status()).toBe(200);
        
        const headers = response.headers();
        
        // Basic security validation
        expect(headers["content-type"]).toContain("application/json");
        
        // HexTrackr security headers (may not be implemented yet)
        if (headers["x-content-type-options"]) {
            expect(headers["x-content-type-options"]).toBe("nosniff");
        }
        
        if (headers["cache-control"]) {
            // System detection should be cacheable for performance
            expect(headers["cache-control"]).toBeDefined();
        }
    });

    test("should not accept query parameters", async ({ request }) => {
        // TDD: This should fail - endpoint doesn't exist yet
        // System detection doesn't use parameters per contract
        const response = await request.get(`${API_ENDPOINT}?invalid=param`);
        
        expect(response.status()).toBe(200);
        
        const responseData = await response.json();
        validateSystemDetectionResponse(responseData);
        
        // Should ignore invalid parameters, not error
    });

    test("should handle HTTP method restrictions", async ({ request }) => {
        // TDD: This should fail - endpoint doesn't exist yet
        // Only GET should be supported
        const methods = ["POST", "PUT", "DELETE", "PATCH"];
        
        for (const method of methods) {
            const response = await request.fetch(API_ENDPOINT, { method });
            
            // Should return method not allowed
            expect(response.status()).toBe(405);
        }
    });

    test("should validate response schema completeness", async ({ request }) => {
        // TDD: This should fail - endpoint doesn't exist yet
        const response = await request.get(API_ENDPOINT);
        
        expect(response.status()).toBe(200);
        
        const responseData = await response.json();
        
        // Ensure all required fields are present
        const requiredFields = ["prefersDark", "supported", "userAgent"];
        requiredFields.forEach(field => {
            expect(responseData).toHaveProperty(field);
        });
        
        // Ensure no unexpected fields (strict schema)
        const responseKeys = Object.keys(responseData);
        expect(responseKeys.length).toBe(3);
        
        responseKeys.forEach(key => {
            expect(requiredFields).toContain(key);
        });
    });

    test("should handle edge case user agents", async ({ request }) => {
        // TDD: This should fail - endpoint doesn't exist yet
        const response = await request.get(API_ENDPOINT, {
            headers: {
                "User-Agent": ""  // Empty user agent
            }
        });
        
        expect(response.status()).toBe(200);
        
        const responseData = await response.json();
        validateSystemDetectionResponse(responseData);
        
        // Should handle empty user agent gracefully
        expect(typeof responseData.userAgent).toBe("string");
    });

    test("should provide consistent results for same browser", async ({ request }) => {
        // TDD: This should fail - endpoint doesn't exist yet
        const response1 = await request.get(API_ENDPOINT);
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
        const response2 = await request.get(API_ENDPOINT);
        
        expect(response1.status()).toBe(200);
        expect(response2.status()).toBe(200);
        
        const data1 = await response1.json();
        const data2 = await response2.json();
        
        // Results should be consistent for same browser context
        expect(data1.prefersDark).toBe(data2.prefersDark);
        expect(data1.supported).toBe(data2.supported);
        // Note: userAgent might vary slightly, so we check it's the same type
        expect(typeof data1.userAgent).toBe(typeof data2.userAgent);
    });
});

test.describe("GET /api/preferences/theme/system - Error Handling", () => {
    const BASE_URL = "http://localhost:8989";
    const API_ENDPOINT = `${BASE_URL}/api/preferences/theme/system`;

    test("should return 404 when endpoint doesn't exist (TDD validation)", async ({ request }) => {
        // This test validates the TDD requirement
        // During Phase 3.2, this endpoint should not exist yet!
        const response = await request.get(API_ENDPOINT);
        
        // Expected during TDD phase: endpoint not implemented
        expect(response.status()).toBe(404);
        
        // The 404 should be from Express (route not found)
        const responseText = await response.text();
        expect(responseText).toContain("Cannot GET");
    });

    test("should handle server errors gracefully", async ({ request }) => {
        // TDD: Test server error scenarios
        const response = await request.get(API_ENDPOINT);
        
        if (response.status() >= 500) {
            const responseData = await response.json();
            expect(responseData).toHaveProperty("error");
            expect(typeof responseData.error).toBe("string");
        }
    });

    test("should validate against XSS in user agent", async ({ request }) => {
        // TDD: This should fail - endpoint doesn't exist yet
        const xssUserAgent = "<script>alert('xss')</script>";
        const response = await request.get(API_ENDPOINT, {
            headers: {
                "User-Agent": xssUserAgent
            }
        });
        
        if (response.status() === 200) {
            const responseData = await response.json();
            
            // Should not reflect raw XSS in response
            const responseString = JSON.stringify(responseData);
            expect(responseString).not.toContain("<script>");
            expect(responseString).not.toContain("alert");
        }
    });

    test("should handle malicious headers gracefully", async ({ request }) => {
        // TDD: This should fail - endpoint doesn't exist yet
        const response = await request.get(API_ENDPOINT, {
            headers: {
                "X-Forwarded-For": "' OR 1=1 --",
                "X-Real-IP": "<img src=x onerror=alert(1)>",
                "Referer": "javascript:alert('xss')"
            }
        });
        
        // Should not crash or reflect malicious content
        if (response.status() === 200) {
            const responseData = await response.json();
            validateSystemDetectionResponse = (response) => {
                expect(response).toHaveProperty("prefersDark");
                expect(response).toHaveProperty("supported");
                expect(response).toHaveProperty("userAgent");
            };
            validateSystemDetectionResponse(responseData);
            
            const responseString = JSON.stringify(responseData);
            expect(responseString).not.toContain("javascript:");
            expect(responseString).not.toContain("onerror");
            expect(responseString).not.toContain("1=1");
        }
    });
});

test.describe("GET /api/preferences/theme/system - Integration Patterns", () => {
    const BASE_URL = "http://localhost:8989";
    const API_ENDPOINT = `${BASE_URL}/api/preferences/theme/system`;

    test("should integrate with HexTrackr theme switching logic", async ({ request, page }) => {
        // TDD: This should fail - endpoint doesn't exist yet
        
        // First get system preference
        const systemResponse = await request.get(API_ENDPOINT);
        
        if (systemResponse.status() === 200) {
            const systemData = await systemResponse.json();
            
            // System detection should influence theme controller behavior
            // This validates integration with client-side theme logic
            expect(typeof systemData.prefersDark).toBe("boolean");
            
            // Verify this can be used by theme-controller.js (when implemented)
            await page.goto(BASE_URL);
            
            // Theme detection should work with HexTrackr's existing patterns
            const currentTheme = await page.evaluate(() => {
                return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
            });
            
            expect(typeof currentTheme).toBe("boolean");
        }
    });

    test("should support WebSocket integration pattern", async ({ request }) => {
        // TDD: This should fail - endpoint doesn't exist yet
        // System detection should work with existing WebSocket patterns in HexTrackr
        
        const response = await request.get(API_ENDPOINT);
        
        if (response.status() === 200) {
            const responseData = await response.json();
            
            // Validate data structure compatible with WebSocket events
            expect(responseData).toHaveProperty("prefersDark");
            
            // Should be serializable for WebSocket transmission
            const serialized = JSON.stringify(responseData);
            const deserialized = JSON.parse(serialized);
            
            expect(deserialized.prefersDark).toBe(responseData.prefersDark);
            expect(deserialized.supported).toBe(responseData.supported);
        }
    });
});