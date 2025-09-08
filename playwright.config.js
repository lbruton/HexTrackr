// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  // Test directory - align with Jest config
  testDir: '__tests__/tests',
  
  // Timeout for each test
  timeout: 30000,
  
  // Global test timeout
  globalTimeout: 600000,
  
  // Expect timeout for assertions
  expect: {
    timeout: 5000,
  },
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Reporter configuration
  reporter: [
    ['html', { open: 'never', outputFolder: '__tests__/playwright-report' }],
    ['json', { outputFile: '__tests__/test-results.json' }],
    ['list']
  ],
  
  // Shared settings for all tests
  use: {
    // Base URL for tests - HexTrackr runs on port 8080
    baseURL: 'http://localhost:8080',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Capture screenshot on failure
    screenshot: 'only-on-failure',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Navigation timeout
    navigationTimeout: 30000,
    
    // Action timeout
    actionTimeout: 10000,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Use headed mode for debugging when not in CI
        headless: !!process.env.CI,
      },
    },
    
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        headless: !!process.env.CI,
      },
    },

    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        headless: !!process.env.CI,
      },
    },

    // Mobile testing
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        headless: !!process.env.CI,
      },
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        headless: !!process.env.CI,
      },
    },
  ],

  // Output directories
  outputDir: '__tests__/test-results/',
  
  // Run your local dev server before starting the tests
  webServer: {
    command: 'docker-compose up -d',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  
  // Global setup/teardown
  globalSetup: require.resolve('./__tests__/global-setup.js'),
  globalTeardown: require.resolve('./__tests__/global-teardown.js'),
});