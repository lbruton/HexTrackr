# CISA KEV Integration Test Plan

## Overview

This document outlines the comprehensive testing strategy for the CISA Known Exploited Vulnerabilities (KEV) integration in HexTrackr. The plan covers unit testing, integration testing, performance validation, user acceptance testing, and security verification.

---

## Testing Objectives

### Primary Goals
1. **Functional Correctness**: All KEV features work as specified
2. **Performance Compliance**: Meet defined response time targets
3. **Data Integrity**: KEV synchronization maintains accuracy
4. **User Experience**: Intuitive and accessible interface
5. **System Reliability**: Graceful handling of edge cases

### Success Criteria
- **100% test coverage** for KEV service modules
- **<50ms response time** for KEV status lookups
- **99.9% accuracy** in KEV data synchronization
- **WCAG AA compliance** for all KEV UI components
- **Zero data corruption** during sync operations

---

## Test Environment Setup

### Test Data Requirements

```sql
-- Test database with sample KEV data
INSERT INTO kev_status (cve_id, date_added, vulnerability_name, vendor_project,
                       product, required_action, due_date, known_ransomware_use) VALUES
('CVE-2024-TEST-001', '2024-09-01', 'Test Buffer Overflow', 'Test Vendor', 'Test Product',
 'Apply test patches', '2024-10-01', 0),
('CVE-2024-TEST-002', '2024-08-15', 'Test RCE Vulnerability', 'Another Vendor', 'Web Server',
 'Update immediately', '2024-09-14', 1), -- Overdue KEV
('CVE-2024-TEST-003', '2024-09-20', 'Test Auth Bypass', 'Security Corp', 'Auth System',
 'Update to latest version', '2024-10-20', 0); -- Due soon KEV
```

### Mock API Responses

```javascript
// Mock CISA KEV API responses for testing
const mockKevCatalog = {
    "title": "CISA Catalog of Known Exploited Vulnerabilities",
    "catalogVersion": "2024.09.21",
    "dateReleased": "2024-09-21T16:30:00.000Z",
    "count": 3,
    "vulnerabilities": [
        {
            "cveID": "CVE-2024-TEST-001",
            "vendorProject": "Test Vendor",
            "product": "Test Product",
            "vulnerabilityName": "Test Buffer Overflow",
            "dateAdded": "2024-09-01",
            "shortDescription": "Buffer overflow in test component",
            "requiredAction": "Apply test patches",
            "dueDate": "2024-10-01",
            "knownRansomwareCampaignUse": "Unknown",
            "notes": "Test vulnerability for unit testing"
        }
    ]
};

// Mock API server for testing
const mockServer = {
    start: () => {
        // Serve mock responses
    },
    setResponse: (catalogVersion, data) => {
        // Configure test responses
    },
    simulateError: (errorType) => {
        // Simulate API failures
    }
};
```

### Test Environment Configuration

```javascript
// Test configuration
const testConfig = {
    database: {
        path: ':memory:', // In-memory SQLite for tests
        migrations: ['./planning/kev-database-schema.sql']
    },
    api: {
        kevUrl: 'http://localhost:3001/mock-kev-api',
        timeout: 5000
    },
    cache: {
        enabled: false // Disable cache for deterministic tests
    }
};
```

---

## Unit Testing Strategy

### KEV Service Module Tests

```javascript
describe('KevService', () => {
    let kevService;
    let mockDb;
    let mockLogger;

    beforeEach(() => {
        mockDb = new MockDatabase();
        mockLogger = new MockLogger();
        kevService = new KevService(mockDb, mockLogger);
    });

    describe('isKevVulnerability', () => {
        test('returns true for known KEV', async () => {
            // Given
            await mockDb.insert('kev_status', {
                cve_id: 'CVE-2024-TEST-001',
                date_added: '2024-09-01'
            });

            // When
            const result = await kevService.isKevVulnerability('CVE-2024-TEST-001');

            // Then
            expect(result).toBe(true);
        });

        test('returns false for non-KEV', async () => {
            // When
            const result = await kevService.isKevVulnerability('CVE-2024-NONKEV');

            // Then
            expect(result).toBe(false);
        });

        test('handles malformed CVE IDs gracefully', async () => {
            // When/Then
            await expect(kevService.isKevVulnerability('INVALID-CVE'))
                .rejects.toThrow('Invalid CVE ID format');
        });

        test('meets performance target (<50ms)', async () => {
            // Given
            await mockDb.insert('kev_status', {
                cve_id: 'CVE-2024-TEST-001',
                date_added: '2024-09-01'
            });

            // When
            const start = performance.now();
            await kevService.isKevVulnerability('CVE-2024-TEST-001');
            const duration = performance.now() - start;

            // Then
            expect(duration).toBeLessThan(50);
        });
    });

    describe('syncKevData', () => {
        test('successfully syncs new KEV data', async () => {
            // Given
            mockApiServer.setResponse('2024.09.21', mockKevCatalog);

            // When
            const result = await kevService.syncKevData();

            // Then
            expect(result.success).toBe(true);
            expect(result.kevsAdded).toBe(3);
            expect(result.catalogVersion).toBe('2024.09.21');
        });

        test('handles API timeout gracefully', async () => {
            // Given
            mockApiServer.simulateError('timeout');

            // When/Then
            await expect(kevService.syncKevData())
                .rejects.toThrow('KEV API request timeout');
        });

        test('maintains data integrity during partial failures', async () => {
            // Given
            const partiallyCorruptedData = { ...mockKevCatalog };
            partiallyCorruptedData.vulnerabilities[1] = null; // Corrupt entry

            mockApiServer.setResponse('2024.09.21', partiallyCorruptedData);

            // When
            const result = await kevService.syncKevData();

            // Then
            expect(result.success).toBe(true);
            expect(result.kevsAdded).toBe(2); // Only valid entries
            expect(result.errors).toContain('Skipped corrupt entry');
        });

        test('performs batch processing for large datasets', async () => {
            // Given
            const largeKevCatalog = generateMockKevData(5000);
            mockApiServer.setResponse('2024.09.21', largeKevCatalog);

            // When
            const result = await kevService.syncKevData();

            // Then
            expect(result.success).toBe(true);
            expect(result.kevsAdded).toBe(5000);
            expect(result.batchesProcessed).toBeGreaterThan(1);
        });
    });

    describe('getKevStatistics', () => {
        test('returns correct statistics', async () => {
            // Given
            await seedTestKevData(mockDb);

            // When
            const stats = await kevService.getKevStatistics();

            // Then
            expect(stats).toEqual({
                totalKevs: 3,
                ransomwareKevs: 1,
                overdueKevs: 1,
                dueSoonKevs: 1,
                recentKevs: 2
            });
        });

        test('handles empty KEV database', async () => {
            // When
            const stats = await kevService.getKevStatistics();

            // Then
            expect(stats.totalKevs).toBe(0);
            expect(stats.ransomwareKevs).toBe(0);
        });
    });
});
```

### Database Operation Tests

```javascript
describe('KEV Database Operations', () => {
    let db;

    beforeEach(async () => {
        db = await setupTestDatabase();
    });

    test('KEV table creation', async () => {
        const tables = await db.getTables();
        expect(tables).toContain('kev_status');
        expect(tables).toContain('kev_sync_log');
    });

    test('KEV indexes exist and perform well', async () => {
        // Insert test data
        await insertTestKevData(db, 1000);

        // Test index usage
        const queryPlan = await db.explain('SELECT * FROM kev_status WHERE cve_id = ?');
        expect(queryPlan).toContain('USING INDEX idx_kev_status_cve_id');

        // Test performance
        const start = performance.now();
        await db.get('SELECT * FROM kev_status WHERE cve_id = ?', ['CVE-2024-TEST-001']);
        const duration = performance.now() - start;

        expect(duration).toBeLessThan(10); // Should be very fast with index
    });

    test('Foreign key constraints work correctly', async () => {
        // Attempt to insert KEV with non-existent CVE
        await expect(
            db.run('INSERT INTO kev_status (cve_id, date_added) VALUES (?, ?)',
                   ['CVE-NONEXISTENT', '2024-09-21'])
        ).rejects.toThrow('FOREIGN KEY constraint failed');
    });

    test('KEV views return correct data', async () => {
        // Given
        await seedTestData(db);

        // When
        const kevStats = await db.get('SELECT * FROM kev_statistics');
        const vulnsWithKev = await db.all('SELECT * FROM vulnerabilities_with_kev WHERE is_kev = 1');

        // Then
        expect(kevStats.total_kevs).toBeGreaterThan(0);
        expect(vulnsWithKev.length).toBeGreaterThan(0);
        expect(vulnsWithKev[0]).toHaveProperty('is_kev', true);
    });
});
```

---

## Integration Testing

### API Endpoint Tests

```javascript
describe('KEV API Endpoints', () => {
    let app;
    let request;

    beforeAll(async () => {
        app = await setupTestApp();
        request = supertest(app);
    });

    describe('GET /api/kev/stats', () => {
        test('returns KEV statistics', async () => {
            // Given
            await seedTestKevData();

            // When
            const response = await request
                .get('/api/kev/stats')
                .expect(200);

            // Then
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('totalKevs');
            expect(response.body.data).toHaveProperty('kevPercentage');
            expect(response.body.data).toHaveProperty('lastSync');
        });

        test('handles unauthorized access', async () => {
            // When/Then
            await request
                .get('/api/kev/stats')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);
        });

        test('meets performance requirements', async () => {
            // When
            const start = Date.now();
            await request.get('/api/kev/stats').expect(200);
            const duration = Date.now() - start;

            // Then
            expect(duration).toBeLessThan(500); // <500ms requirement
        });
    });

    describe('GET /api/vulnerabilities/:cveId/kev', () => {
        test('returns KEV metadata for known KEV', async () => {
            // Given
            await insertTestKev('CVE-2024-TEST-001');

            // When
            const response = await request
                .get('/api/vulnerabilities/CVE-2024-TEST-001/kev')
                .expect(200);

            // Then
            expect(response.body.data.isKev).toBe(true);
            expect(response.body.data.cveId).toBe('CVE-2024-TEST-001');
            expect(response.body.data).toHaveProperty('dateAdded');
            expect(response.body.data).toHaveProperty('dueDate');
        });

        test('returns non-KEV status for unknown CVE', async () => {
            // When
            const response = await request
                .get('/api/vulnerabilities/CVE-2024-UNKNOWN/kev')
                .expect(200);

            // Then
            expect(response.body.data.isKev).toBe(false);
            expect(response.body.data.cveId).toBe('CVE-2024-UNKNOWN');
        });

        test('validates CVE ID format', async () => {
            // When/Then
            await request
                .get('/api/vulnerabilities/INVALID-CVE/kev')
                .expect(400);
        });
    });

    describe('POST /api/kev/bulk-status', () => {
        test('returns bulk KEV status', async () => {
            // Given
            await insertTestKev('CVE-2024-TEST-001');
            const cveIds = ['CVE-2024-TEST-001', 'CVE-2024-UNKNOWN'];

            // When
            const response = await request
                .post('/api/kev/bulk-status')
                .send({ cveIds })
                .expect(200);

            // Then
            expect(response.body.data.results).toHaveProperty('CVE-2024-TEST-001');
            expect(response.body.data.results['CVE-2024-TEST-001'].isKev).toBe(true);
            expect(response.body.data.results['CVE-2024-UNKNOWN'].isKev).toBe(false);
        });

        test('handles large bulk requests efficiently', async () => {
            // Given
            const cveIds = generateTestCveIds(1000);

            // When
            const start = Date.now();
            const response = await request
                .post('/api/kev/bulk-status')
                .send({ cveIds })
                .expect(200);
            const duration = Date.now() - start;

            // Then
            expect(response.body.data.processed).toBe(1000);
            expect(duration).toBeLessThan(2000); // <2s for 1000 CVEs
        });

        test('validates bulk request limits', async () => {
            // Given
            const tooManyCveIds = generateTestCveIds(1001); // Over limit

            // When/Then
            await request
                .post('/api/kev/bulk-status')
                .send({ cveIds: tooManyCveIds })
                .expect(400);
        });
    });

    describe('POST /api/kev/sync', () => {
        test('triggers manual KEV sync', async () => {
            // Given
            setupMockCisaApi();

            // When
            const response = await request
                .post('/api/kev/sync')
                .set('Authorization', 'Bearer admin-token')
                .expect(200);

            // Then
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('syncId');
            expect(response.body.data).toHaveProperty('status', 'started');
        });

        test('prevents concurrent syncs', async () => {
            // Given
            await startSyncOperation();

            // When/Then
            await request
                .post('/api/kev/sync')
                .set('Authorization', 'Bearer admin-token')
                .expect(429); // Too Many Requests
        });

        test('requires admin authorization', async () => {
            // When/Then
            await request
                .post('/api/kev/sync')
                .set('Authorization', 'Bearer user-token')
                .expect(403); // Forbidden
        });
    });
});
```

### End-to-End Testing

```javascript
describe('KEV End-to-End Workflows', () => {
    test('complete KEV sync and display workflow', async () => {
        // Given
        const browser = await setupPlaywrightBrowser();
        const page = await browser.newPage();
        await setupMockCisaApi();

        // When - Trigger sync
        await page.goto('/settings');
        await page.click('[data-testid="kev-tab"]');
        await page.click('[data-testid="sync-now-button"]');

        // Then - Verify sync success
        await page.waitForSelector('[data-testid="sync-success-message"]');

        // When - Navigate to vulnerabilities page
        await page.goto('/vulnerabilities');

        // Then - Verify KEV badges appear
        const kevBadges = page.locator('.kev-badge');
        await expect(kevBadges).toHaveCount(3);

        // When - Filter by KEV
        await page.click('[data-testid="kev-filter"]');

        // Then - Verify only KEV vulnerabilities shown
        const visibleCards = page.locator('.vulnerability-card:visible');
        await expect(visibleCards).toHaveCount(3);

        // When - Click KEV details
        await page.click('.vulnerability-card.kev:first-child');

        // Then - Verify KEV modal opens
        const modal = page.locator('[data-testid="kev-detail-modal"]');
        await expect(modal).toBeVisible();
        await expect(modal.locator('.kev-due-date')).toContainText('Due:');

        await browser.close();
    });

    test('KEV dashboard widget updates correctly', async () => {
        // Given
        const browser = await setupPlaywrightBrowser();
        const page = await browser.newPage();

        // When - Load dashboard
        await page.goto('/dashboard');

        // Then - Verify KEV widget shows correct stats
        const kevWidget = page.locator('[data-testid="kev-widget"]');
        await expect(kevWidget.locator('.total-kevs')).toContainText('15');
        await expect(kevWidget.locator('.overdue-kevs')).toContainText('3');

        // When - Sync new data
        await triggerKevSync();

        // Then - Verify widget updates
        await page.waitForFunction(() => {
            const widget = document.querySelector('[data-testid="kev-widget"]');
            return widget?.querySelector('.total-kevs')?.textContent === '18';
        });

        await browser.close();
    });
});
```

---

## Performance Testing

### Load Testing

```javascript
describe('KEV Performance Tests', () => {
    test('KEV status lookup performance', async () => {
        // Given
        await seedLargeKevDataset(10000);

        // When - Perform 1000 concurrent lookups
        const promises = Array.from({ length: 1000 }, (_, i) =>
            kevService.isKevVulnerability(`CVE-2024-${i.toString().padStart(4, '0')}`)
        );

        const start = Date.now();
        await Promise.all(promises);
        const duration = Date.now() - start;

        // Then
        expect(duration).toBeLessThan(5000); // All 1000 lookups in <5s
        expect(duration / 1000).toBeLessThan(50); // <50ms average per lookup
    });

    test('bulk KEV status performance', async () => {
        // Given
        const cveIds = generateTestCveIds(1000);

        // When
        const start = Date.now();
        const results = await kevService.bulkKevStatus(cveIds);
        const duration = Date.now() - start;

        // Then
        expect(duration).toBeLessThan(200); // <200ms for 1000 CVEs
        expect(results.size).toBe(1000);
    });

    test('KEV sync performance with large dataset', async () => {
        // Given
        const largeCatalog = generateMockKevData(5000);
        mockApiServer.setResponse('2024.09.21', largeCatalog);

        // When
        const start = Date.now();
        const result = await kevService.syncKevData();
        const duration = Date.now() - start;

        // Then
        expect(duration).toBeLessThan(120000); // <2 minutes for 5000 KEVs
        expect(result.kevsAdded).toBe(5000);
    });

    test('dashboard statistics performance', async () => {
        // Given
        await seedLargeVulnerabilityDataset(100000);

        // When
        const start = Date.now();
        const stats = await kevService.getKevStatistics();
        const duration = Date.now() - start;

        // Then
        expect(duration).toBeLessThan(500); // <500ms for dashboard stats
        expect(stats).toHaveProperty('totalKevs');
    });
});
```

### Memory Usage Testing

```javascript
describe('KEV Memory Usage', () => {
    test('sync operation memory efficiency', async () => {
        // Given
        const initialMemory = process.memoryUsage().heapUsed;
        const largeCatalog = generateMockKevData(10000);

        // When
        await kevService.syncKevData(largeCatalog);

        // Then
        const finalMemory = process.memoryUsage().heapUsed;
        const memoryIncrease = finalMemory - initialMemory;
        expect(memoryIncrease).toBeLessThan(200 * 1024 * 1024); // <200MB increase
    });

    test('bulk operations memory efficiency', async () => {
        // Given
        const cveIds = generateTestCveIds(10000);
        const initialMemory = process.memoryUsage().heapUsed;

        // When
        await kevService.bulkKevStatus(cveIds);

        // Then
        const finalMemory = process.memoryUsage().heapUsed;
        const memoryIncrease = finalMemory - initialMemory;
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // <50MB increase
    });
});
```

---

## User Acceptance Testing

### Test Scenarios

#### Scenario 1: Network Administrator Daily Workflow

```gherkin
Feature: Daily KEV Review
  As a network administrator
  I want to quickly identify KEV vulnerabilities
  So that I can prioritize critical security issues

  Scenario: Morning KEV review
    Given I log into HexTrackr
    When I navigate to the dashboard
    Then I should see the KEV status widget
    And I should see the count of total KEVs
    And I should see the count of overdue KEVs

    When I click "View All KEVs"
    Then I should see only KEV vulnerabilities
    And they should be sorted by due date
    And each KEV should show a red badge

    When I click on an overdue KEV
    Then I should see the KEV detail modal
    And I should see the CISA remediation deadline
    And I should see the required action
```

#### Scenario 2: Security Team Incident Response

```gherkin
Feature: KEV Incident Response
  As a security analyst
  I want to quickly assess KEV impact
  So that I can coordinate emergency patching

  Scenario: New KEV alert
    Given a new KEV is added to CISA catalog
    When the daily sync runs
    Then I should receive an email alert
    And the new KEV should appear in HexTrackr
    And it should be marked with a "NEW" indicator

    When I filter vulnerabilities by "KEV Only"
    Then I should see all KEV vulnerabilities
    And the new KEV should be at the top

    When I create a ticket from the KEV
    Then the ticket should include KEV metadata
    And the due date should match CISA deadline
```

### Usability Testing Checklist

#### Navigation & Discovery
- [ ] Users can find KEV features without training
- [ ] KEV badges are clearly visible and understandable
- [ ] Filtering and sorting by KEV status is intuitive
- [ ] Dashboard KEV widget provides useful at-a-glance info

#### Information Architecture
- [ ] KEV metadata is comprehensive but not overwhelming
- [ ] Relationship between KEV and vulnerability data is clear
- [ ] Due dates and remediation requirements are prominent
- [ ] Historical KEV trend data is meaningful

#### Workflow Integration
- [ ] KEV status integrates seamlessly with existing workflows
- [ ] Creating tickets from KEVs is straightforward
- [ ] Bulk operations with KEVs are efficient
- [ ] Settings and configuration are accessible but not intrusive

---

## Accessibility Testing

### WCAG Compliance Tests

```javascript
describe('KEV Accessibility', () => {
    test('KEV badges meet contrast requirements', async () => {
        const page = await setupAccessibilityTest();
        await page.goto('/vulnerabilities');

        const contrastResults = await page.evaluate(() => {
            const badge = document.querySelector('.kev-badge');
            const styles = getComputedStyle(badge);
            const bg = styles.backgroundColor;
            const text = styles.color;

            return { backgroundColor: bg, color: text };
        });

        const contrastRatio = calculateContrastRatio(
            contrastResults.color,
            contrastResults.backgroundColor
        );

        expect(contrastRatio).toBeGreaterThanOrEqual(4.5); // WCAG AA standard
    });

    test('KEV elements are keyboard navigable', async () => {
        const page = await setupAccessibilityTest();
        await page.goto('/vulnerabilities');

        // Tab through KEV elements
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');

        const focusedElement = await page.evaluate(() =>
            document.activeElement.className
        );

        expect(focusedElement).toContain('kev');
    });

    test('KEV information is screen reader accessible', async () => {
        const page = await setupAccessibilityTest();
        await page.goto('/vulnerabilities');

        const ariaLabels = await page.$$eval('.kev-badge', badges =>
            badges.map(badge => badge.getAttribute('aria-label'))
        );

        ariaLabels.forEach(label => {
            expect(label).toContain('Known Exploited Vulnerability');
        });
    });
});
```

### Screen Reader Testing

Manual testing checklist with screen readers:
- [ ] **NVDA**: KEV badges announce correctly
- [ ] **JAWS**: KEV status is read in proper context
- [ ] **VoiceOver**: KEV details modal is navigable
- [ ] **TalkBack**: Mobile KEV indicators work properly

---

## Security Testing

### Input Validation Tests

```javascript
describe('KEV Security', () => {
    test('CVE ID validation prevents injection', async () => {
        const maliciousInputs = [
            "CVE-2024-1234'; DROP TABLE kev_status; --",
            "<script>alert('xss')</script>",
            "../../etc/passwd",
            "CVE-2024-1234 UNION SELECT * FROM users"
        ];

        for (const input of maliciousInputs) {
            await expect(kevService.isKevVulnerability(input))
                .rejects.toThrow('Invalid CVE ID format');
        }
    });

    test('bulk request size limits enforced', async () => {
        const oversizedRequest = generateTestCveIds(10000); // Over limit

        await expect(kevService.bulkKevStatus(oversizedRequest))
            .rejects.toThrow('Request exceeds maximum size limit');
    });

    test('API rate limiting works correctly', async () => {
        const requests = Array.from({ length: 101 }, () =>
            request(app).get('/api/kev/stats')
        );

        const responses = await Promise.allSettled(requests);
        const rateLimitedResponses = responses.filter(
            r => r.value?.status === 429
        );

        expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
});
```

### Data Integrity Tests

```javascript
describe('KEV Data Integrity', () => {
    test('sync operation is atomic', async () => {
        // Given
        const corruptedData = { ...mockKevCatalog };
        corruptedData.vulnerabilities.push(null); // Corruption

        // When
        const result = await kevService.syncKevData(corruptedData);

        // Then - Either all data syncs or none
        const kevCount = await db.get('SELECT COUNT(*) as count FROM kev_status');
        expect(kevCount.count).toBeOneOf([0, 2]); // All or nothing
    });

    test('foreign key constraints prevent orphaned records', async () => {
        // When/Then
        await expect(
            db.run('INSERT INTO kev_status (cve_id, date_added) VALUES (?, ?)',
                   ['CVE-NONEXISTENT', '2024-09-21'])
        ).rejects.toThrow('FOREIGN KEY constraint failed');
    });
});
```

---

## Test Automation & CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/kev-tests.yml
name: KEV Integration Tests

on:
  push:
    paths:
      - 'app/services/kevService.js'
      - 'app/routes/kev.js'
      - 'planning/kev-*.sql'
  pull_request:
    paths:
      - 'app/**'

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run KEV unit tests
        run: npm run test:kev:unit

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Start test database
        run: npm run test:db:setup

      - name: Run KEV integration tests
        run: npm run test:kev:integration

      - name: Performance benchmark
        run: npm run test:kev:performance

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install Playwright
        run: npx playwright install

      - name: Start test server
        run: npm run test:server:start

      - name: Run KEV E2E tests
        run: npx playwright test tests/kev-e2e/

      - name: Upload test results
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### Test Scripts

```json
{
  "scripts": {
    "test:kev": "npm run test:kev:unit && npm run test:kev:integration",
    "test:kev:unit": "jest tests/unit/kev --coverage",
    "test:kev:integration": "jest tests/integration/kev",
    "test:kev:performance": "jest tests/performance/kev --runInBand",
    "test:kev:e2e": "playwright test tests/e2e/kev",
    "test:kev:security": "jest tests/security/kev",
    "test:kev:all": "npm run test:kev && npm run test:kev:e2e && npm run test:kev:security"
  }
}
```

---

## Test Data Management

### Test Data Generation

```javascript
// Test data generators
function generateMockKevData(count = 10) {
    return {
        title: "CISA Catalog of Known Exploited Vulnerabilities",
        catalogVersion: "2024.09.21",
        dateReleased: "2024-09-21T16:30:00.000Z",
        count: count,
        vulnerabilities: Array.from({ length: count }, (_, i) => ({
            cveID: `CVE-2024-TEST-${(i + 1).toString().padStart(3, '0')}`,
            vendorProject: `Test Vendor ${i + 1}`,
            product: `Test Product ${i + 1}`,
            vulnerabilityName: `Test Vulnerability ${i + 1}`,
            dateAdded: generateRandomDate(),
            shortDescription: `Test description ${i + 1}`,
            requiredAction: "Apply security updates",
            dueDate: generateFutureDate(),
            knownRansomwareCampaignUse: Math.random() > 0.8 ? "Known" : "Unknown",
            notes: `Test notes ${i + 1}`
        }))
    };
}

function generateTestCveIds(count = 100) {
    return Array.from({ length: count }, (_, i) =>
        `CVE-2024-${(i + 1).toString().padStart(4, '0')}`
    );
}
```

### Test Database Setup

```javascript
async function setupTestDatabase() {
    const db = new Database(':memory:');

    // Load schema
    const schema = await fs.readFile('planning/kev-database-schema.sql', 'utf8');
    await db.exec(schema);

    // Seed basic test data
    await seedBasicTestData(db);

    return db;
}

async function seedBasicTestData(db) {
    // Insert test vulnerabilities
    await db.run(`
        INSERT INTO vulnerabilities (cve_id, severity, vpr_score, description)
        VALUES
            ('CVE-2024-TEST-001', 'Critical', 9.8, 'Test buffer overflow'),
            ('CVE-2024-TEST-002', 'High', 8.2, 'Test RCE vulnerability'),
            ('CVE-2024-TEST-003', 'Medium', 6.5, 'Test auth bypass')
    `);

    // Insert test KEV data
    await db.run(`
        INSERT INTO kev_status (cve_id, date_added, vulnerability_name, due_date, known_ransomware_use)
        VALUES
            ('CVE-2024-TEST-001', '2024-09-01', 'Test Buffer Overflow', '2024-10-01', 0),
            ('CVE-2024-TEST-002', '2024-08-15', 'Test RCE', '2024-09-14', 1)
    `);
}
```

---

## Monitoring & Observability

### Test Metrics Collection

```javascript
class TestMetrics {
    static collectPerformanceMetrics(testName, duration, success) {
        const metric = {
            testName,
            duration,
            success,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'test'
        };

        // Send to monitoring system
        console.log('TEST_METRIC:', JSON.stringify(metric));
    }

    static trackTestCoverage(module, coverage) {
        console.log('COVERAGE_METRIC:', {
            module,
            coverage,
            timestamp: new Date().toISOString()
        });
    }
}

// Usage in tests
afterEach(() => {
    const testName = expect.getState().currentTestName;
    const duration = Date.now() - testStartTime;
    TestMetrics.collectPerformanceMetrics(testName, duration, true);
});
```

### Quality Gates

```javascript
// Quality gate configuration
const qualityGates = {
    unitTestCoverage: 90,      // Minimum 90% unit test coverage
    integrationCoverage: 80,    // Minimum 80% integration coverage
    performanceThreshold: {
        kevLookup: 50,          // <50ms KEV lookups
        kevBulkLookup: 200,     // <200ms bulk lookups
        kevSync: 120000,        // <2 minutes full sync
        dashboardStats: 500     // <500ms dashboard stats
    },
    errorRate: 0.001           // <0.1% error rate
};

function validateQualityGates(testResults) {
    const failures = [];

    if (testResults.coverage.unit < qualityGates.unitTestCoverage) {
        failures.push(`Unit test coverage ${testResults.coverage.unit}% below threshold ${qualityGates.unitTestCoverage}%`);
    }

    Object.entries(qualityGates.performanceThreshold).forEach(([operation, threshold]) => {
        const actualTime = testResults.performance[operation];
        if (actualTime > threshold) {
            failures.push(`${operation} performance ${actualTime}ms exceeds threshold ${threshold}ms`);
        }
    });

    if (failures.length > 0) {
        throw new Error(`Quality gates failed:\n${failures.join('\n')}`);
    }
}
```

---

## Documentation & Reporting

### Test Report Generation

```javascript
// Generate comprehensive test report
async function generateTestReport() {
    const report = {
        summary: {
            totalTests: 0,
            passed: 0,
            failed: 0,
            coverage: 0,
            duration: 0
        },
        categories: {
            unit: { tests: [], coverage: 0 },
            integration: { tests: [], coverage: 0 },
            performance: { tests: [], benchmarks: {} },
            e2e: { tests: [], scenarios: [] },
            security: { tests: [], vulnerabilities: [] },
            accessibility: { tests: [], wcagLevel: 'AA' }
        },
        qualityGates: {
            passed: true,
            failures: []
        }
    };

    // Generate HTML report
    const html = await generateHtmlReport(report);
    await fs.writeFile('test-reports/kev-test-report.html', html);

    return report;
}
```

---

**Document Information:**
- **Created**: 2025-09-21
- **Version**: 1.0
- **Status**: Planning Phase
- **Test Framework**: Jest + Playwright + Supertest
- **Coverage Target**: 90% unit, 80% integration

**Related Documents:**
- `/planning/kev-lookup-plan.md` - Main planning document
- `/planning/kev-database-schema.sql` - Database specifications
- `/planning/kev-api-specification.md` - API architecture
- `/planning/kev-ui-mockup.md` - UI design specifications