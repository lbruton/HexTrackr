module.exports = {
  // Test environment - use different environments for different test types
  projects: [
    {
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/__tests__/unit/**/*.test.js', '<rootDir>/__tests__/integration/**/*.test.js']
    },
    {
      displayName: 'jsdom',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/__tests__/shared/**/*.test.js', '<rootDir>/__tests__/pages/**/*.test.js']
    }
  ],
  
  // Root directory for tests
  rootDir: './',
  
  // Test file patterns
  testMatch: [
    '<rootDir>/__tests__/**/*.test.js',
    '<rootDir>/__tests__/**/*.spec.js'
  ],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/__tests__/tests/' // Playwright E2E tests
  ],
  
  // Coverage settings
  collectCoverage: true,
  coverageDirectory: '__tests__/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Coverage paths
  collectCoverageFrom: [
    'scripts/**/*.js',
    'server.js',
    '!scripts/**/*.min.js',
    '!scripts/temp/**',
    '!**/*.config.js'
  ],
  
  // Module paths for easier imports
  moduleDirectories: ['node_modules', '<rootDir>'],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  
  // Timeout for tests
  testTimeout: 10000,
  
  // Verbose output
  verbose: true
};