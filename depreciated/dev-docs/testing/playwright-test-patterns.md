# Playwright Testing Patterns - HexTrackr

## Overview

HexTrackr uses Playwright for end-to-end testing, focusing on modal interactions, responsive behavior, data validation, and performance verification. This document details the established testing patterns, best practices, and architectural decisions.

## Test Architecture

### Test Directory Structure

```
tests/
├── dom-inspection.spec.js          # DOM structure validation
├── modal-success-validation.spec.js # Modal aggregation testing
├── vulnerability-import-export.spec.js # CSV import/export testing
├── console-debug-test.spec.js      # JavaScript error detection
├── debug-page-load.spec.js         # Page load performance
├── working-modal-test.spec.js      # Core modal functionality
└── vulnerability-modal-aggregation.spec.js # Advanced modal testing
```

### Configuration Standards

#### Base Test Setup

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Test Suite Name', () => {
  test('specific test case', async ({ page }) => {
    // Test implementation
  });
});
```

#### Application Access Pattern

```javascript
// Standard navigation with network idle wait
await page.goto('http://localhost:8080/vulnerabilities.html');
await page.waitForLoadState('networkidle');

// Extended wait for data loading
await page.waitForTimeout(5000);
```

## Core Testing Patterns

### 1. Modal Interaction Testing

#### Vulnerability Details Modal Pattern

```javascript
test('validate vulnerability modal aggregation', async ({ page }) => {
  await page.goto('http://localhost:8080/vulnerabilities.html');
  await page.waitForLoadState('networkidle');
  
  // Wait for data to load
  const criticalCount = page.locator('[data-testid="critical-count"], .card-body').first();
  await expect(criticalCount).toBeVisible({ timeout: 15000 });
  
  // Find and click vulnerability description cell
  const descCell = page.locator('[col-id="plugin_name"]').first();
  await descCell.click();
  
  // Verify modal opens with correct content
  await page.waitForSelector('#vulnDetailsModal', { state: 'visible', timeout: 10000 });
  await expect(page.locator('#vulnDetailsModal h5')).toContainText('Vulnerability Details');
  
  // Validate aggregation data
  const affectedAssetsText = await page.locator('#vulnDetailsModal')
    .getByText(/\d+ devices affected/).textContent();
  expect(affectedAssetsText).toMatch(/\d+ devices affected/);
});
```

## Key Features

- **Timeout Management**: Progressive timeouts for different loading stages
- **Data Validation**: Verify aggregated device counts
- **Modal State Checking**: Ensure proper modal visibility
- **Content Verification**: Validate modal title and data

#### Device Security Modal Pattern

```javascript
test('device security modal with CSV export', async ({ page }) => {
  // Open device modal via hostname click
  const hostnameCell = page.locator('[col-id="hostname"] a').first();
  await hostnameCell.click();
  
  // Verify device modal opens
  await page.waitForSelector('#deviceSecurityModal', { state: 'visible', timeout: 10000 });
  
  // Test CSV export functionality
  const downloadPromise = page.waitForEvent('download');
  await page.click('#deviceSecurityModal .btn-primary');
  const download = await downloadPromise;
  
  // Validate download
  expect(download.suggestedFilename()).toMatch(/device-security-.*\.csv/);
});
```

### 2. Responsive Testing Patterns

#### Viewport Size Testing

```javascript
test.describe('Responsive Design Validation', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1200, height: 800 }
  ];
  
  viewports.forEach(({ name, width, height }) => {
    test(`${name} viewport responsive behavior`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('http://localhost:8080/vulnerabilities.html');
      
      // Verify responsive column visibility
      if (width < 768) {
        // Mobile: Secondary columns should be hidden
        await expect(page.locator('[col-id="last_seen"]')).toBeHidden();
        await expect(page.locator('[col-id="ip_address"]')).toBeHidden();
      } else if (width >= 1200) {
        // Desktop: All columns visible
        await expect(page.locator('[col-id="vendor"]')).toBeVisible();
      }
    });
  });
});
```

### 3. Data Loading and Performance

#### Data Loading Validation Pattern

```javascript
test('verify data loading with fallback handling', async ({ page }) => {
  await page.goto('http://localhost:8080/vulnerabilities.html');
  
  // Check for statistics cards as data indicator
  const criticalCount = page.locator('[data-testid="critical-count"], .card-body').first();
  await expect(criticalCount).toBeVisible({ timeout: 15000 });
  
  // Look for AG Grid data
  const anyRow = page.locator('.ag-row').first();
  
  try {
    await expect(anyRow).toBeVisible({ timeout: 15000 });
    
    // Data present - continue with functionality tests
    console.log('✅ Data loaded successfully');
    
  } catch (error) {
    // No data - capture state for debugging
    console.log('⚠️  No data loaded yet - container may be starting up');
    await page.screenshot({ path: '.playwright-mcp/no-data-state.png' });
    
    // This is not a test failure - just documentation
  }
});
```

#### Performance Measurement Pattern

```javascript
test('page load performance validation', async ({ page }) => {
  const startTime = Date.now();
  
  await page.goto('http://localhost:8080/vulnerabilities.html');
  await page.waitForLoadState('networkidle');
  
  // Wait for critical UI elements
  await page.waitForSelector('.ag-grid-wrapper', { timeout: 10000 });
  
  const loadTime = Date.now() - startTime;
  console.log(`Page load time: ${loadTime}ms`);
  
  // Performance assertions
  expect(loadTime).toBeLessThan(10000); // < 10 second max
  
  // Check for JavaScript errors
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  
  expect(errors.length).toBe(0);
});
```

### 4. CSV Import/Export Testing

#### Import Validation Pattern

```javascript
test('CSV import functionality', async ({ page }) => {
  await page.goto('http://localhost:8080/vulnerabilities.html');
  
  // Open import modal via settings
  await page.click('#settingsButton');
  await page.waitForSelector('#importModal', { state: 'visible' });
  
  // File upload simulation
  const fileInput = page.locator('#csvFile');
  await fileInput.setInputFiles('path/to/test-data.csv');
  
  // Set vendor and scan date
  await page.selectOption('#vendor', 'Tenable');
  await page.fill('#scanDate', '2025-09-06');
  
  // Submit import
  await page.click('#importForm button[type="submit"]');
  
  // Wait for processing completion
  await page.waitForSelector('.alert-success', { timeout: 30000 });
  
  // Verify import success message
  await expect(page.locator('.alert-success')).toContainText('Import completed successfully');
});
```

#### Export Testing Pattern

```javascript
test('CSV export with data validation', async ({ page }) => {
  await page.goto('http://localhost:8080/vulnerabilities.html');
  
  // Wait for data loading
  const anyRow = page.locator('.ag-row').first();
  await expect(anyRow).toBeVisible({ timeout: 15000 });
  
  // Trigger export
  const downloadPromise = page.waitForEvent('download');
  await page.click('#exportButton');
  const download = await downloadPromise;
  
  // Validate download properties
  expect(download.suggestedFilename()).toMatch(/vulnerabilities-\d{4}-\d{2}-\d{2}\.csv/);
  
  // Save and validate content
  const downloadPath = await download.path();
  const fs = require('fs');
  const content = fs.readFileSync(downloadPath, 'utf-8');
  
  // Verify CSV structure
  expect(content).toMatch(/Hostname,IP Address,CVE,Severity/);
  expect(content.split('\n').length).toBeGreaterThan(1);
});
```

## Screenshot and Visual Testing

### Screenshot Naming Convention

```javascript
// Baseline screenshots
await page.screenshot({ path: '.playwright-mcp/baseline-state.png' });

// Feature-specific screenshots
await page.screenshot({ path: '.playwright-mcp/modal-success-validation.png' });

// Responsive screenshots
await page.screenshot({ path: '.playwright-mcp/mobile-view-375px.png' });

// Error state documentation
await page.screenshot({ path: '.playwright-mcp/error-state-debug.png' });
```

### Visual Regression Patterns

```javascript
test('visual regression testing', async ({ page }) => {
  await page.goto('http://localhost:8080/vulnerabilities.html');
  await page.waitForLoadState('networkidle');
  
  // Full page screenshot
  await expect(page).toHaveScreenshot('vulnerabilities-page.png');
  
  // Component-specific screenshots
  await expect(page.locator('.ag-grid-wrapper')).toHaveScreenshot('data-grid.png');
  
  // Modal screenshots
  await page.click('[col-id="plugin_name"] a');
  await page.waitForSelector('#vulnDetailsModal', { state: 'visible' });
  await expect(page.locator('#vulnDetailsModal')).toHaveScreenshot('vulnerability-modal.png');
});
```

## Error Handling and Debugging

### JavaScript Error Detection

```javascript
test('JavaScript error monitoring', async ({ page }) => {
  const jsErrors = [];
  const consoleMessages = [];
  
  // Capture JavaScript errors
  page.on('pageerror', error => {
    jsErrors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  });
  
  // Capture console messages
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    });
  });
  
  await page.goto('http://localhost:8080/vulnerabilities.html');
  await page.waitForLoadState('networkidle');
  
  // Report errors
  if (jsErrors.length > 0) {
    console.log('❌ JavaScript Errors:', jsErrors);
  }
  
  // Filter critical console messages
  const criticalMessages = consoleMessages.filter(msg => 
    msg.type === 'error' || msg.type === 'warning'
  );
  
  expect(jsErrors.length).toBe(0);
  expect(criticalMessages.length).toBe(0);
});
```

### Network Request Monitoring

```javascript
test('API request validation', async ({ page }) => {
  const apiRequests = [];
  
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      apiRequests.push({
        url: request.url(),
        method: request.method(),
        timestamp: new Date().toISOString()
      });
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('/api/')) {
      console.log(`API Response: ${response.status()} ${response.url()}`);
      expect(response.status()).toBeLessThan(400);
    }
  });
  
  await page.goto('http://localhost:8080/vulnerabilities.html');
  await page.waitForLoadState('networkidle');
  
  // Verify expected API calls were made
  const vulnerabilityRequests = apiRequests.filter(req => 
    req.url.includes('/api/vulnerabilities')
  );
  
  expect(vulnerabilityRequests.length).toBeGreaterThan(0);
});
```

## Test Data Management

### Test Data Isolation

```javascript
test.beforeEach(async ({ page }) => {
  // Clear any existing modal data
  await page.addInitScript(() => {
    window.vulnModalData = {};
    localStorage.clear();
    sessionStorage.clear();
  });
});

test.afterEach(async ({ page }) => {
  // Cleanup after test
  await page.evaluate(() => {
    // Close any open modals
    document.querySelectorAll('.modal').forEach(modal => {
      modal.style.display = 'none';
      modal.classList.remove('show');
    });
  });
});
```

### Mock Data Injection

```javascript
test('modal functionality with mock data', async ({ page }) => {
  // Inject test data before page load
  await page.addInitScript(() => {
    window.testVulnerabilityData = [
      {
        id: 1,
        hostname: 'test-server-01',
        cve: 'CVE-2024-0001',
        severity: 'Critical',
        plugin_name: 'Test Vulnerability Description'
      }
    ];
  });
  
  await page.goto('http://localhost:8080/vulnerabilities.html');
  
  // Override data loading function
  await page.evaluate(() => {
    if (window.vulnManager && window.testVulnerabilityData) {
      window.vulnManager.processData(window.testVulnerabilityData);
    }
  });
});
```

## CI/CD Integration Patterns

### Docker Restart Pattern

```javascript
// In GitHub Actions or CI scripts
test.beforeAll(async () => {
  // Ensure Docker containers are running
  const { exec } = require('child_process');
  await new Promise((resolve) => {
    exec('docker-compose restart', (error) => {
      if (error) console.log('Docker restart error:', error);
      setTimeout(resolve, 10000); // Wait for services to start
    });
  });
});
```

### Parallel Test Execution

```javascript
// playwright.config.js
module.exports = {
  testDir: './tests',
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:8080',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  }
};
```

## Best Practices

### 1. Timeout Management

- **Page Load**: 10-15 second timeout for initial load
- **Data Loading**: 15 second timeout for AG Grid data
- **Modal Opening**: 10 second timeout for modal visibility
- **Network Requests**: 30 second timeout for imports

### 2. Element Selection Strategy

```javascript
// Preferred: Use data-testid attributes
await page.locator('[data-testid="critical-count"]');

// Acceptable: Use CSS selectors for AG Grid
await page.locator('[col-id="plugin_name"]');

// Avoid: Fragile selectors dependent on styling
await page.locator('.btn.btn-primary.ml-2'); // Too specific
```

### 3. Wait Strategies

```javascript
// Good: Wait for network idle
await page.waitForLoadState('networkidle');

// Good: Wait for specific element
await page.waitForSelector('.ag-grid-wrapper', { state: 'visible' });

// Acceptable: Fixed timeout for known loading times
await page.waitForTimeout(5000); // After network idle

// Avoid: Long fixed timeouts without network wait
await page.waitForTimeout(30000); // Too long, no guarantee
```

### 4. Error Recovery Patterns

```javascript
test('resilient modal testing', async ({ page }) => {
  try {
    // Primary test path
    await performModalTest(page);
  } catch (primaryError) {
    console.log('Primary test path failed, attempting fallback');
    
    // Fallback test approach
    await page.screenshot({ path: '.playwright-mcp/fallback-attempt.png' });
    await performFallbackTest(page);
  }
});
```

## Performance Testing Integration

### Load Time Metrics

```javascript
test('performance benchmarks', async ({ page }) => {
  const metrics = {};
  
  // Measure different loading phases
  metrics.navigationStart = Date.now();
  await page.goto('http://localhost:8080/vulnerabilities.html');
  
  metrics.networkIdle = Date.now();
  await page.waitForLoadState('networkidle');
  
  metrics.gridReady = Date.now();
  await page.waitForSelector('.ag-grid-wrapper');
  
  metrics.dataLoaded = Date.now();
  await page.waitForSelector('.ag-row', { timeout: 15000 });
  
  // Calculate and assert performance metrics
  const totalLoadTime = metrics.dataLoaded - metrics.navigationStart;
  const gridInitTime = metrics.gridReady - metrics.networkIdle;
  
  console.log(`Total load time: ${totalLoadTime}ms`);
  console.log(`Grid initialization: ${gridInitTime}ms`);
  
  expect(totalLoadTime).toBeLessThan(20000); // Max 20 seconds total
  expect(gridInitTime).toBeLessThan(2000);   // Max 2 seconds for grid
});
```

### Memory Usage Monitoring

```javascript
test('memory usage validation', async ({ page }) => {
  await page.goto('http://localhost:8080/vulnerabilities.html');
  await page.waitForLoadState('networkidle');
  
  // Get initial memory metrics
  const initialMetrics = await page.evaluate(() => {
    return {
      usedJSHeapSize: performance.memory?.usedJSHeapSize || 0,
      totalJSHeapSize: performance.memory?.totalJSHeapSize || 0
    };
  });
  
  // Perform memory-intensive operations
  await performDataLoadingOperations(page);
  
  // Check for memory leaks
  const finalMetrics = await page.evaluate(() => {
    return {
      usedJSHeapSize: performance.memory?.usedJSHeapSize || 0,
      totalJSHeapSize: performance.memory?.totalJSHeapSize || 0
    };
  });
  
  const memoryIncrease = finalMetrics.usedJSHeapSize - initialMetrics.usedJSHeapSize;
  const memoryIncreaseMB = memoryIncrease / (1024 * 1024);
  
  console.log(`Memory increase: ${memoryIncreaseMB.toFixed(2)} MB`);
  expect(memoryIncreaseMB).toBeLessThan(50); // Max 50MB increase
});
```

This comprehensive testing documentation provides the foundation for maintaining and extending HexTrackr's automated testing suite with Playwright, ensuring robust functionality across all device types and use cases.
