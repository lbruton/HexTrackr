// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * E2E Testing Configuration for HexTrackr
 * Spec 001: End-to-End Testing Suite with Playwright
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  // Test directory - new E2E structure
  testDir: 'tests/e2e/specs',
  
  // Test timeout - 30 seconds per test
  timeout: 30000,
  
  // Global test timeout - 10 minutes for full suite
  globalTimeout: 600000,
  
  // Expect timeout for assertions
  expect: {
    timeout: 5000,
  },
  
  // Maximum parallel workers
  workers: process.env.CI ? 4 : 2,
  
  // Fail the build on CI if test.only is left in code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Reporter configuration
  reporter: [
    ['html', { 
      open: 'never', 
      outputFolder: 'tests/e2e/playwright-report' 
    }],
    ['json', { 
      outputFile: 'tests/e2e/test-results.json' 
    }],
    ['junit', { 
      outputFile: 'tests/e2e/junit-results.xml' 
    }],
    ['list']
  ],
  
  // Shared settings for all tests
  use: {
    // Base URL for tests - HexTrackr Docker port
    baseURL: 'http://localhost:8989',
    
    // Collect trace when retrying failed tests
    trace: 'on-first-retry',
    
    // Capture screenshot on failure
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true
    },
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Navigation timeout - 30 seconds
    navigationTimeout: 30000,
    
    // Action timeout - 10 seconds
    actionTimeout: 10000,
    
    // Viewport size for consistent testing
    viewport: { width: 1920, height: 1080 },
    
    // Accept downloads for export testing
    acceptDownloads: true,
    
    // Capture console logs
    ignoreHTTPSErrors: false,
    
    // Locale for testing
    locale: 'en-US',
    
    // Timezone for consistent date/time testing
    timezoneId: 'America/New_York',
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chrome',
      use: { 
        ...devices['Desktop Chrome'],
        // Chrome-specific settings for performance testing
        launchOptions: {
          args: ['--disable-dev-shm-usage', '--no-sandbox']
        }
      },
    },
    
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
      },
    },

    {
      name: 'safari',
      use: { 
        ...devices['Desktop Safari'],
      },
    },

    // Performance testing project
    {
      name: 'performance',
      use: {
        ...devices['Desktop Chrome'],
        // Enable CDP for performance metrics
        launchOptions: {
          args: ['--enable-precise-memory-info']
        }
      },
      grep: /@performance/,
    },

    // Mobile testing
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
      },
    },
    
    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 12'],
      },
    },
    
    // Tablet testing
    {
      name: 'tablet-ipad',
      use: {
        ...devices['iPad Pro'],
      },
    },
  ],

  // Output directories
  outputDir: 'tests/e2e/test-results/',
  
  // Web server configuration - use existing Docker container
  webServer: {
    command: 'echo "Using existing Docker container on port 8989"',
    url: 'http://localhost:8989',
    reuseExistingServer: true,
    timeout: 5000,
  },
  
  // Folder for test artifacts
  preserveOutput: 'failures-only',
  
  // Grep patterns for test filtering
  // Uncomment one of these to filter tests:
  // grep: /@smoke/,      // Run smoke tests
  // grep: /@performance/, // Run performance tests  
  // grep: /@critical/,    // Run critical tests
});