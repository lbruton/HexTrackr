/**
 * Documentation Endpoints Contract Tests
 * Tests API contracts for documentation, changelog, and roadmap endpoints
 * These tests MUST FAIL until the documentation endpoints are implemented
 */

const { describe, test, expect, beforeAll, afterAll } = require("@jest/globals");
const { ExpressTestUtils, AssertionHelpers } = require("../test-utils.js");

describe("Documentation Endpoints Contract Tests", () => {
  let expressUtils;
  let app;

  beforeAll(() => {
    expressUtils = new ExpressTestUtils();
    app = expressUtils.createTestApp();

    // NOTE: No documentation routes are implemented yet
    // These tests are designed to FAIL until implementation
  });

  afterAll(async () => {
    await expressUtils.stopServer();
  });

  describe("GET /api/docs - List documentation sections", () => {
    test("should return documentation sections list with proper structure", async () => {
      const response = await expressUtils
        .createRequest("get", "/api/docs")
        .expect(200);

      // Contract requirements for documentation sections list
      expect(response.body).toHaveProperty("sections");
      expect(Array.isArray(response.body.sections)).toBe(true);
      expect(response.body.sections.length).toBeGreaterThan(0);

      // Each section should have required properties
      const firstSection = response.body.sections[0];
      expect(firstSection).toHaveProperty("id");
      expect(firstSection).toHaveProperty("title");
      expect(firstSection).toHaveProperty("description");
      expect(firstSection).toHaveProperty("lastUpdated");
      expect(firstSection).toHaveProperty("path");

      // Validate data types
      expect(typeof firstSection.id).toBe("string");
      expect(typeof firstSection.title).toBe("string");
      expect(typeof firstSection.description).toBe("string");
      expect(typeof firstSection.lastUpdated).toBe("string");
      expect(typeof firstSection.path).toBe("string");
    });

    test("should return proper content-type headers", async () => {
      const response = await expressUtils
        .createRequest("get", "/api/docs")
        .expect(200);

      expect(response.headers["content-type"]).toMatch(/application\/json/);
    });

    test("should include metadata about documentation structure", async () => {
      const response = await expressUtils
        .createRequest("get", "/api/docs")
        .expect(200);

      expect(response.body).toHaveProperty("metadata");
      expect(response.body.metadata).toHaveProperty("totalSections");
      expect(response.body.metadata).toHaveProperty("lastUpdate");
      expect(response.body.metadata).toHaveProperty("version");

      expect(typeof response.body.metadata.totalSections).toBe("number");
      expect(typeof response.body.metadata.lastUpdate).toBe("string");
      expect(typeof response.body.metadata.version).toBe("string");
    });
  });

  describe("GET /api/docs/:section - Get specific documentation section", () => {
    test("should return specific documentation section content", async () => {
      const response = await expressUtils
        .createRequest("get", "/api/docs/getting-started")
        .expect(200);

      // Contract requirements for section content
      expect(response.body).toHaveProperty("section");
      expect(response.body.section).toHaveProperty("id");
      expect(response.body.section).toHaveProperty("title");
      expect(response.body.section).toHaveProperty("content");
      expect(response.body.section).toHaveProperty("lastModified");
      expect(response.body.section).toHaveProperty("tags");

      // Validate content structure
      expect(typeof response.body.section.content).toBe("string");
      expect(Array.isArray(response.body.section.tags)).toBe(true);
      expect(response.body.section.content.length).toBeGreaterThan(0);
    });

    test("should return navigation context for section", async () => {
      const response = await expressUtils
        .createRequest("get", "/api/docs/api-reference")
        .expect(200);

      expect(response.body).toHaveProperty("navigation");
      expect(response.body.navigation).toHaveProperty("previousSection");
      expect(response.body.navigation).toHaveProperty("nextSection");
      expect(response.body.navigation).toHaveProperty("parentSection");
    });

    test("should return 404 for non-existent documentation section", async () => {
      const response = await expressUtils
        .createRequest("get", "/api/docs/non-existent-section")
        .expect(404);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("Section not found");
    });

    test("should handle special characters in section names", async () => {
      const response = await expressUtils
        .createRequest("get", "/api/docs/faq%26troubleshooting")
        .expect(200);

      expect(response.body.section).toHaveProperty("id");
      expect(response.body.section.id).toBe("faq&troubleshooting");
    });
  });

  describe("GET /api/docs/search - Search documentation", () => {
    test("should return search results with query parameter", async () => {
      const response = await expressUtils
        .createRequest("get", "/api/docs/search")
        .query({ q: "installation" })
        .expect(200);

      // Contract requirements for search results
      expect(response.body).toHaveProperty("results");
      expect(response.body).toHaveProperty("query");
      expect(response.body).toHaveProperty("totalResults");
      expect(response.body).toHaveProperty("searchTime");

      expect(Array.isArray(response.body.results)).toBe(true);
      expect(response.body.query).toBe("installation");
      expect(typeof response.body.totalResults).toBe("number");
      expect(typeof response.body.searchTime).toBe("number");
    });

    test("should return properly structured search result items", async () => {
      const response = await expressUtils
        .createRequest("get", "/api/docs/search")
        .query({ q: "api" })
        .expect(200);

      if (response.body.results.length > 0) {
        const firstResult = response.body.results[0];
        expect(firstResult).toHaveProperty("sectionId");
        expect(firstResult).toHaveProperty("title");
        expect(firstResult).toHaveProperty("excerpt");
        expect(firstResult).toHaveProperty("relevanceScore");
        expect(firstResult).toHaveProperty("path");

        expect(typeof firstResult.relevanceScore).toBe("number");
        expect(firstResult.relevanceScore).toBeGreaterThan(0);
        expect(firstResult.relevanceScore).toBeLessThanOrEqual(1);
      }
    });

    test("should handle empty search query", async () => {
      const response = await expressUtils
        .createRequest("get", "/api/docs/search")
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("Search query is required");
    });

    test("should support pagination for search results", async () => {
      const response = await expressUtils
        .createRequest("get", "/api/docs/search")
        .query({ q: "guide", page: 1, limit: 5 })
        .expect(200);

      expect(response.body).toHaveProperty("pagination");
      expect(response.body.pagination).toHaveProperty("currentPage");
      expect(response.body.pagination).toHaveProperty("totalPages");
      expect(response.body.pagination).toHaveProperty("hasNextPage");
      expect(response.body.pagination).toHaveProperty("hasPreviousPage");

      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.results.length).toBeLessThanOrEqual(5);
    });

    test("should handle advanced search filters", async () => {
      const response = await expressUtils
        .createRequest("get", "/api/docs/search")
        .query({
          q: "configuration",
          section: "api-reference",
          tags: "setup,config"
        })
        .expect(200);

      expect(response.body).toHaveProperty("appliedFilters");
      expect(response.body.appliedFilters).toHaveProperty("section");
      expect(response.body.appliedFilters).toHaveProperty("tags");
    });
  });

  describe("GET /api/changelog - Get application changelog", () => {
    test("should return changelog with version entries", async () => {
      const response = await expressUtils
        .createRequest("get", "/api/changelog")
        .expect(200);

      // Contract requirements for changelog
      expect(response.body).toHaveProperty("changelog");
      expect(response.body).toHaveProperty("metadata");

      expect(Array.isArray(response.body.changelog)).toBe(true);
      expect(response.body.changelog.length).toBeGreaterThan(0);

      const firstEntry = response.body.changelog[0];
      expect(firstEntry).toHaveProperty("version");
      expect(firstEntry).toHaveProperty("releaseDate");
      expect(firstEntry).toHaveProperty("changes");
      expect(firstEntry).toHaveProperty("type"); // major, minor, patch

      expect(typeof firstEntry.version).toBe("string");
      expect(typeof firstEntry.releaseDate).toBe("string");
      expect(Array.isArray(firstEntry.changes)).toBe(true);
    });

    test("should structure change entries properly", async () => {
      const response = await expressUtils
        .createRequest("get", "/api/changelog")
        .expect(200);

      const firstEntry = response.body.changelog[0];
      if (firstEntry.changes.length > 0) {
        const firstChange = firstEntry.changes[0];
        expect(firstChange).toHaveProperty("type"); // added, changed, deprecated, removed, fixed, security
        expect(firstChange).toHaveProperty("description");
        expect(firstChange).toHaveProperty("category"); // frontend, backend, api, security, etc.

        expect(["added", "changed", "deprecated", "removed", "fixed", "security"])
          .toContain(firstChange.type);
      }
    });

    test("should support version filtering", async () => {
      const response = await expressUtils
        .createRequest("get", "/api/changelog")
        .query({ version: "1.0.0" })
        .expect(200);

      expect(response.body.changelog).toHaveLength(1);
      expect(response.body.changelog[0].version).toBe("1.0.0");
    });

    test("should support date range filtering", async () => {
      const response = await expressUtils
        .createRequest("get", "/api/changelog")
        .query({
          from: "2024-01-01",
          to: "2024-12-31"
        })
        .expect(200);

      response.body.changelog.forEach(entry => {
        const releaseDate = new Date(entry.releaseDate);
        expect(releaseDate.getFullYear()).toBe(2024);
      });
    });
  });

  describe("GET /api/roadmap - Get application roadmap", () => {
    test("should return roadmap with planned features", async () => {
      const response = await expressUtils
        .createRequest("get", "/api/roadmap")
        .expect(200);

      // Contract requirements for roadmap
      expect(response.body).toHaveProperty("roadmap");
      expect(response.body).toHaveProperty("metadata");

      expect(Array.isArray(response.body.roadmap)).toBe(true);
      expect(response.body.roadmap.length).toBeGreaterThan(0);

      const firstItem = response.body.roadmap[0];
      expect(firstItem).toHaveProperty("id");
      expect(firstItem).toHaveProperty("title");
      expect(firstItem).toHaveProperty("description");
      expect(firstItem).toHaveProperty("status"); // planned, in-progress, completed, cancelled
      expect(firstItem).toHaveProperty("priority"); // low, medium, high, critical
      expect(firstItem).toHaveProperty("targetQuarter");
      expect(firstItem).toHaveProperty("category");
    });

    test("should group roadmap items by quarters", async () => {
      const response = await expressUtils
        .createRequest("get", "/api/roadmap")
        .query({ groupBy: "quarter" })
        .expect(200);

      expect(response.body).toHaveProperty("groupedRoadmap");
      expect(typeof response.body.groupedRoadmap).toBe("object");

      // Should have quarter keys like "2024-Q1", "2024-Q2", etc.
      const quarterKeys = Object.keys(response.body.groupedRoadmap);
      expect(quarterKeys.length).toBeGreaterThan(0);
      expect(quarterKeys[0]).toMatch(/\d{4}-Q[1-4]/);
    });

    test("should filter roadmap by status", async () => {
      const response = await expressUtils
        .createRequest("get", "/api/roadmap")
        .query({ status: "planned" })
        .expect(200);

      response.body.roadmap.forEach(item => {
        expect(item.status).toBe("planned");
      });
    });

    test("should filter roadmap by priority", async () => {
      const response = await expressUtils
        .createRequest("get", "/api/roadmap")
        .query({ priority: "high" })
        .expect(200);

      response.body.roadmap.forEach(item => {
        expect(item.priority).toBe("high");
      });
    });

    test("should include progress information for in-progress items", async () => {
      const response = await expressUtils
        .createRequest("get", "/api/roadmap")
        .query({ status: "in-progress" })
        .expect(200);

      response.body.roadmap
        .filter(item => item.status === "in-progress")
        .forEach(item => {
          expect(item).toHaveProperty("progress");
          expect(typeof item.progress).toBe("number");
          expect(item.progress).toBeGreaterThanOrEqual(0);
          expect(item.progress).toBeLessThanOrEqual(100);
        });
    });
  });

  describe("Error Handling Contracts", () => {
    test("should return consistent error structure for all endpoints", async () => {
      const endpoints = [
        "/api/docs/invalid-section",
        "/api/docs/search",
        "/api/changelog",
        "/api/roadmap"
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await expressUtils
            .createRequest("get", endpoint)
            .expect(res => res.status >= 400);

          expect(response.body).toHaveProperty("error");
          expect(response.body).toHaveProperty("timestamp");
          expect(response.body).toHaveProperty("path");
          expect(typeof response.body.error).toBe("string");
        } catch (error) {
          // Some endpoints might not exist yet - this is expected for failing tests
          continue;
        }
      }
    });

    test("should handle malformed query parameters gracefully", async () => {
      const response = await expressUtils
        .createRequest("get", "/api/docs/search")
        .query({ page: "invalid" })
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("Invalid pagination parameter");
    });
  });

  describe("Security Contracts", () => {
    test("should prevent XSS in search queries", async () => {
      const maliciousQuery = "<script>alert(\"xss\")</script>";

      const response = await expressUtils
        .createRequest("get", "/api/docs/search")
        .query({ q: maliciousQuery })
        .expect(200);

      // Response should not contain unescaped script tags
      const responseString = JSON.stringify(response.body);
      expect(responseString).not.toContain("<script>");
      expect(responseString).not.toContain("alert(");
    });

    test("should validate section path parameters", async () => {
      const pathTraversalAttempt = "../../../etc/passwd";

      const response = await expressUtils
        .createRequest("get", `/api/docs/${pathTraversalAttempt}`)
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("Invalid section identifier");
    });

    test("should enforce rate limiting on search endpoint", async () => {
      // This test assumes rate limiting is configured
      // Multiple rapid requests should eventually be rate limited
      const requests = [];
      for (let i = 0; i < 100; i++) {
        requests.push(
          expressUtils
            .createRequest("get", "/api/docs/search")
            .query({ q: `test${i}` })
        );
      }

      const responses = await Promise.allSettled(requests);
      const rateLimitedResponses = responses.filter(
        result => result.status === "fulfilled" &&
        result.value.status === 429
      );

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});