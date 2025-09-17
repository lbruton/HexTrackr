module.exports = {
  // Test environment - use different environments for different test types
  projects: [
    {
      displayName: 'unit',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/unit/**/*.test.js', '<rootDir>/tests/unit/**/*.spec.js'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup/unit.setup.js'],
      clearMocks: true,
      resetMocks: true,
      restoreMocks: true
    },
    {
      displayName: 'integration',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/integration/**/*.test.js', '<rootDir>/tests/integration/**/*.spec.js'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup/integration.setup.js'],
      clearMocks: true,
      resetMocks: true,
      testTimeout: 30000 // Longer timeout for integration tests
    },
    {
      displayName: 'contract',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/contract/**/*.test.js', '<rootDir>/tests/contract/**/*.spec.js'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup/contract.setup.js'],
      clearMocks: true,
      resetMocks: true,
      testTimeout: 15000 // Medium timeout for contract tests
    },
    {
      displayName: 'legacy-frontend',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/__tests__/**/*.test.js', '<rootDir>/__tests__/**/*.spec.js'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup/frontend.setup.js']
    }
  ],

  // Root directory for tests
  rootDir: './',

  // Test file patterns (fallback for non-project runs)
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js',
    '<rootDir>/__tests__/**/*.test.js',
    '<rootDir>/__tests__/**/*.spec.js'
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/__tests__/tests/', // Playwright E2E tests
    '<rootDir>/tests/fixtures/',
    '<rootDir>/tests/temp/'
  ],

  // Coverage settings
  collectCoverage: false, // Enable via command line for better performance
  coverageDirectory: 'tests/coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],

  // Coverage paths - focus on modularized backend code
  collectCoverageFrom: [
    'app/**/*.js',
    'scripts/**/*.js',
    'server.js',
    '!app/public/**', // Exclude frontend assets
    '!scripts/**/*.min.js',
    '!scripts/temp/**',
    '!**/*.config.js',
    '!**/*.spec.js',
    '!**/*.test.js'
  ],

  // Coverage thresholds for modularized backend
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    },
    './app/services/**/*.js': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './app/controllers/**/*.js': {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75
    }
  },

  // Module paths for easier imports
  moduleDirectories: ['node_modules', '<rootDir>', '<rootDir>/app'],

  // Module name mapping for cleaner imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/app/$1',
    '^@config/(.*)$': '<rootDir>/app/config/$1',
    '^@services/(.*)$': '<rootDir>/app/services/$1',
    '^@controllers/(.*)$': '<rootDir>/app/controllers/$1',
    '^@routes/(.*)$': '<rootDir>/app/routes/$1',
    '^@middleware/(.*)$': '<rootDir>/app/middleware/$1',
    '^@utils/(.*)$': '<rootDir>/app/utils/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },

  // Global setup/teardown
  globalSetup: '<rootDir>/tests/setup/global.setup.js',
  globalTeardown: '<rootDir>/tests/setup/global.teardown.js',

  // Timeout for tests
  testTimeout: 10000,

  // Transform configuration for ES modules if needed
  transform: {},

  // Verbose output
  verbose: true,

  // Error handling
  errorOnDeprecated: true,

  // SQLite specific configuration
  testEnvironmentOptions: {
    url: 'http://localhost'
  },

  // Mock patterns
  unmockedModulePathPatterns: [
    'node_modules/(?!(socket\\.io|sqlite3))'
  ]
};