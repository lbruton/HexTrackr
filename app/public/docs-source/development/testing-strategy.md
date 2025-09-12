# Testing Strategy and Playwright Integration

HexTrackr uses a comprehensive testing strategy that emphasizes browser automation and user workflow validation. This guide covers the testing infrastructure and methodologies used to ensure application reliability and user experience.

## Testing Philosophy

HexTrackr follows a **test-first development philosophy** where functionality is validated both before and after changes to prevent regression bugs and ensure consistent behavior:

1. **Before Making Changes**: Write Playwright test capturing current behavior
2. **Plan the Change**: Write test for expected behavior after changes  
3. **Implement Changes**: Make minimal changes to pass the new test
4. **Verify Both Tests Pass**: Ensure original test still passes (no regressions)

## Playwright Browser Automation

### Core Testing Infrastructure

HexTrackr uses Playwright for comprehensive browser automation testing, providing real-time validation of user workflows and UI functionality.

**Prerequisites**:

- Docker container must be restarted before running tests: `docker-compose restart`
- Tests expect `http://localhost:8989` when using Docker (external port mapping)
- All tests designed to be idempotent and handle existing data gracefully

**Running Tests**:

```bash

# From inside or outside container

npx playwright test
```

### Modal Workflow Testing

The modal system receives extensive testing to ensure proper aggregation and user experience:

#### Vulnerability Modal Testing

```javascript
// Test vulnerability modal aggregation
test('vulnerability modal shows all affected devices', async ({ page }) => {
  // Navigate to vulnerability view
  await page.click('[data-test="vulnerabilities-view"]');
  
  // Click on vulnerability (e.g., CVE-2017-3881)
  await page.click('.vulnerability-description');
  
  // Verify all 24 devices are shown
  const devices = await page.locator('.affected-assets-grid tr').count();
  expect(devices).toBe(24);
});
```

#### Device Modal Testing

```javascript
// Test device modal aggregation  
test('device modal shows all vulnerabilities for device', async ({ page }) => {
  // Navigate to devices view
  await page.click('[data-test="devices-view"]');
  
  // Click on device details (e.g., grimesnswan03)
  await page.click('[data-test="view-device-details"]');
  
  // Verify all 12 vulnerabilities are shown
  const vulnerabilities = await page.locator('.device-vulnerabilities-grid tr').count();
  expect(vulnerabilities).toBe(12);
});
```

#### Modal Layering Testing

```javascript
// Test proper modal transitions
test('modal layering works correctly', async ({ page }) => {
  // Open vulnerability modal
  await page.click('.vulnerability-description');
  
  // Click hostname link within vulnerability modal
  await page.click('.hostname-link');
  
  // Verify device modal opens and vulnerability modal closes
  await expect(page.locator('[data-modal="device"]')).toBeVisible();
  await expect(page.locator('[data-modal="vulnerability"]')).not.toBeVisible();
});
```

### Data Import/Export Testing

Comprehensive testing of the CSV import pipeline and export functionality:

#### Large Dataset Performance Testing

```javascript
// Test import performance with 10,000+ records
test('handles large CSV imports efficiently', async ({ page }) => {
  // Upload large CSV file
  await page.setInputFiles('input[type="file"]', 'test-data/large-dataset-10k.csv');
  
  // Monitor processing progress
  await page.waitForSelector('.import-progress', { timeout: 60000 });
  
  // Verify successful completion
  await expect(page.locator('.import-success')).toBeVisible();
});
```

#### CSV Format Validation

```javascript
// Test multiple CSV format support
test('processes different CSV formats correctly', async ({ page }) => {
  const formats = ['cisco-legacy.csv', 'cisco-standard.csv', 'tenable-full.csv'];
  
  for (const format of formats) {
    await page.setInputFiles('input[type="file"]', `test-data/${format}`);
    await expect(page.locator('.import-success')).toBeVisible();
  }
});
```

### Responsive Design Testing

Validation of UI behavior across different viewport sizes:

#### Mobile Responsiveness

```javascript
// Test modal behavior on mobile devices
test('modals work correctly on mobile', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  
  // Test vulnerability modal
  await page.click('.vulnerability-description');
  
  // Verify modal displays properly
  await expect(page.locator('.modal')).toBeVisible();
  await expect(page.locator('.modal')).toHaveCSS('width', '100%');
});
```

#### Tablet and Desktop Testing

```javascript
// Test across different screen sizes
test('UI adapts to different screen sizes', async ({ page }) => {
  const viewports = [
    { width: 768, height: 1024 },  // Tablet
    { width: 1920, height: 1080 }, // Desktop
  ];
  
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    // Verify layout adjustments
    await expect(page.locator('.dashboard-container')).toBeVisible();
  }
});
```

### Performance and Accessibility Testing

#### Console Error Monitoring

```javascript
// Monitor for JavaScript errors
test('application runs without console errors', async ({ page }) => {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  
  // Perform typical user workflow
  await page.click('.vulnerability-view');
  await page.click('.device-view');
  
  // Verify no errors occurred
  expect(errors).toHaveLength(0);
});
```

#### Network Request Validation

```javascript
// Test API endpoint responses
test('API endpoints respond correctly', async ({ page }) => {
  // Monitor network requests
  const responses = [];
  page.on('response', response => {
    if (response.url().includes('/api/')) {
      responses.push(response);
    }
  });
  
  // Trigger API calls
  await page.click('[data-test="refresh-data"]');
  
  // Verify successful responses
  expect(responses.every(r => r.status() < 400)).toBeTruthy();
});
```

#### Accessibility Testing

```javascript
// Test accessibility compliance
test('application meets accessibility standards', async ({ page }) => {
  // Use Playwright's accessibility features
  const snapshot = await page.accessibility.snapshot();
  
  // Verify accessible elements exist
  expect(snapshot).toHaveProperty('role');
  expect(snapshot.children).toBeDefined();
});
```

## Testing Data Management

### Test Data Organization

**Test Data Location**: `/test-data/`

- `large-dataset-10k.csv` - Performance testing dataset
- `cisco-legacy.csv` - Legacy format validation
- `cisco-standard.csv` - Standard format validation  
- `tenable-full.csv` - Comprehensive format validation

### Screenshot and Visual Evidence

**Screenshot Management**: `.playwright-mcp/`

- Automated screenshot capture for test validation
- Before/after comparison images for UI changes
- Mobile/tablet/desktop responsive testing evidence
- Modal workflow visual verification

### Database State Management

```javascript
// Reset database state between tests
test.beforeEach(async ({ page }) => {
  // Clear any existing modals
  await page.evaluate(() => {
    document.querySelectorAll('.modal').forEach(modal => {
      if (modal.classList.contains('show')) {
        bootstrap.Modal.getInstance(modal)?.hide();
      }
    });
  });
});
```

## Modal Architecture Testing Patterns

### Universal Aggregation Key Testing

The modal system uses description field as the universal aggregation key. Tests validate this pattern:

```javascript
// Test description-based aggregation
test('modal aggregation uses description field consistently', async ({ page }) => {
  // Get vulnerability description from table
  const description = await page.locator('.vulnerability-description').first().textContent();
  
  // Open modal
  await page.click('.vulnerability-description');
  
  // Verify all devices with same description are shown
  const modalDescription = await page.locator('.modal-vulnerability-description').textContent();
  expect(modalDescription).toBe(description);
  
  // Count should match aggregated total
  const deviceCount = await page.locator('.affected-device-row').count();
  expect(deviceCount).toBeGreaterThan(1); // Should be aggregated
});
```

### Bootstrap Modal Instance Testing

Validation of proper modal state management:

```javascript
// Test Bootstrap modal instance management
test('modal transitions use proper Bootstrap integration', async ({ page }) => {
  // Inject modal state monitoring
  await page.addInitScript(() => {
    window.modalTransitions = [];
    const originalGetInstance = bootstrap.Modal.getInstance;
    bootstrap.Modal.getInstance = function(element) {
      window.modalTransitions.push({
        action: 'getInstance',
        element: element.id || element.className,
        timestamp: Date.now()
      });
      return originalGetInstance(element);
    };
  });
  
  // Perform modal transition
  await page.click('.vulnerability-description');
  await page.click('.hostname-link');
  
  // Verify proper modal management occurred
  const transitions = await page.evaluate(() => window.modalTransitions);
  expect(transitions.length).toBeGreaterThan(0);
});
```

## Integration with Development Workflow

### Pre-commit Testing

Tests run automatically as part of the development workflow:

```bash

# Run all tests before commits

npm run test

# Run specific test suites

npx playwright test --grep "modal"
npx playwright test --grep "import"
npx playwright test --grep "responsive"
```

### Continuous Integration

**Docker Integration**:

- All tests run in Docker containers for consistency
- Container restart required before test runs
- Clean state guaranteed for reproducible results

**Test Reporting**:

- HTML test reports generated in `test-results/`
- Screenshot evidence for failed tests
- Console output captured for debugging

## Best Practices

### Test Organization

1. **Group by Feature**: Organize tests by major application features (modals, imports, exports)
2. **Descriptive Names**: Use clear, descriptive test names that explain expected behavior
3. **Idempotent Design**: Tests should work regardless of existing data state
4. **Isolation**: Each test should be independent and not rely on others

### Debugging Failed Tests

1. **Screenshot Evidence**: Playwright automatically captures screenshots on failure
2. **Console Logs**: Monitor browser console for JavaScript errors
3. **Network Monitoring**: Track API calls and responses during test execution
4. **Step-by-Step Traces**: Use Playwright's trace recording for detailed debugging

### Performance Considerations

1. **Parallel Execution**: Run tests in parallel when possible
2. **Resource Cleanup**: Clean up test data and browser state between tests
3. **Timeout Management**: Set appropriate timeouts for different types of operations
4. **Memory Management**: Monitor memory usage during large dataset tests

## Future Testing Enhancements

### Planned Improvements

- **API Testing**: Direct endpoint testing without browser overhead
- **Load Testing**: Stress testing with thousands of concurrent users
- **Cross-Browser Testing**: Firefox, Safari, and Chrome compatibility
- **Visual Regression Testing**: Automated UI change detection

### Integration Opportunities

- **CI/CD Pipeline**: Automated testing on code commits
- **Performance Monitoring**: Real-time performance metrics during tests
- **Security Testing**: Automated vulnerability scanning of test environments

---

*This testing strategy ensures HexTrackr maintains high quality and reliability while supporting rapid development and feature enhancement.*
