// Jest setup file for HexTrackr tests
// This file runs before all tests

// Increase timeout for database operations
jest.setTimeout(10000);

// Mock environment variables if needed
process.env.NODE_ENV = 'test';
process.env.DATABASE_PATH = ':memory:'; // Use in-memory SQLite for tests

// Global test utilities
global.testUtils = {
  // Helper to create test CSV data
  generateTestCSV: (rows = 100) => {
    const headers = ['hostname', 'cve', 'plugin_name', 'severity', 'description'];
    let csv = headers.join(',') + '\n';
    
    for (let i = 1; i <= rows; i++) {
      csv += `device-${i},CVE-2024-${i.toString().padStart(4, '0')},Test Plugin ${i},Critical,Test vulnerability ${i}\n`;
    }
    
    return csv;
  },
  
  // Helper to mock vulnerability data
  generateTestVulnerabilities: (count = 10) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      hostname: `device-${i + 1}`,
      cve: `CVE-2024-${(i + 1).toString().padStart(4, '0')}`,
      plugin_name: `Test Plugin ${i + 1}`,
      severity: ['Critical', 'High', 'Medium', 'Low'][i % 4],
      description: `Test vulnerability description ${i + 1}`,
      first_detected: new Date().toISOString(),
      last_seen: new Date().toISOString(),
      state: 'ACTIVE'
    }));
  }
};

// Mock console methods for cleaner test output (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn()
// };