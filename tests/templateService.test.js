/**
 * Template Service Unit Tests
 * Tests for the v1.0.21 Template Editor processing engine
 *
 * @module TemplateServiceTests
 * @version 1.0.21
 */

const TemplateService = require('../app/services/templateService');

// Mock ticket data for testing
const mockTicketData = {
    id: '123',
    xt_number: 'XT#123',
    site: 'Test Site',
    location: 'Building A',
    supervisor: 'John Smith',
    hexagonTicket: 'HX456',
    serviceNowTicket: 'INC789',
    devices: ['switch01', 'switch02', 'router01'],
    dateDue: '2025-10-01',
    dateSubmitted: '2025-09-21'
};

// Mock vulnerability data for testing
const mockVulnerabilityData = [
    { hostname: 'switch01', severity: 'Critical' },
    { hostname: 'switch01', severity: 'High' },
    { hostname: 'switch02', severity: 'Medium' },
    { hostname: 'router01', severity: 'Critical' }
];

/**
 * Simple test runner (since we don't have Jest/Mocha configured)
 */
class SimpleTestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    test(name, testFn) {
        this.tests.push({ name, testFn });
    }

    async run() {
        console.log('🧪 Running Template Service Tests...\n');

        for (const { name, testFn } of this.tests) {
            try {
                await testFn();
                console.log(`✅ ${name}`);
                this.passed++;
            } catch (error) {
                console.log(`❌ ${name}: ${error.message}`);
                this.failed++;
            }
        }

        console.log(`\n📊 Results: ${this.passed} passed, ${this.failed} failed`);
        return this.failed === 0;
    }

    assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    }

    assertEquals(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `Expected ${expected}, got ${actual}`);
        }
    }

    assertTrue(condition, message) {
        this.assert(condition === true, message || 'Expected true');
    }

    assertFalse(condition, message) {
        this.assert(condition === false, message || 'Expected false');
    }
}

// Create test instance
const runner = new SimpleTestRunner();
const templateService = new TemplateService();

// Test 1: Variable mapping configuration
runner.test('Variable mapping contains all expected variables', () => {
    const mapping = templateService.getVariableMapping();
    const expectedVariables = [
        '[GREETING]', '[SITE_NAME]', '[LOCATION]', '[HEXAGON_NUM]',
        '[SERVICENOW_NUM]', '[XT_NUMBER]', '[DEVICE_COUNT]', '[DEVICE_LIST]',
        '[DATE_DUE]', '[DATE_SUBMITTED]', '[VULNERABILITY_SUMMARY]'
    ];

    for (const variable of expectedVariables) {
        runner.assert(mapping[variable], `Missing variable: ${variable}`);
        runner.assert(mapping[variable].description, `Missing description for: ${variable}`);
        runner.assert(mapping[variable].processor, `Missing processor for: ${variable}`);
    }
});

// Test 2: Basic variable substitution
runner.test('Basic variable substitution works correctly', () => {
    const template = 'Hello [GREETING], site: [SITE_NAME], devices: [DEVICE_COUNT]';
    const result = templateService.substituteVariables(template, mockTicketData);

    runner.assert(result.includes('Hello John'), 'Greeting not substituted correctly');
    runner.assert(result.includes('site: Test Site'), 'Site name not substituted correctly');
    runner.assert(result.includes('devices: 3'), 'Device count not substituted correctly');
});

// Test 3: Device list generation
runner.test('Device list generation formats correctly', () => {
    const deviceList = templateService.generateDeviceList(mockTicketData.devices);
    const expected = '1. switch01\n2. switch02\n3. router01';

    runner.assertEquals(deviceList, expected, 'Device list format incorrect');
});

// Test 4: Supervisor greeting extraction
runner.test('Supervisor greeting extraction handles various formats', () => {
    // Test normal "First Last" format
    let greeting = templateService.getSupervisorGreeting('John Smith');
    runner.assertEquals(greeting, 'John', 'Normal name format failed');

    // Test "Last, First" format
    greeting = templateService.getSupervisorGreeting('Smith, John');
    runner.assertEquals(greeting, 'John', 'Last, First format failed');

    // Test multiple supervisors
    greeting = templateService.getSupervisorGreeting('John Smith; Jane Doe');
    runner.assertEquals(greeting, 'Team', 'Multiple supervisors should return Team');

    // Test empty/null
    greeting = templateService.getSupervisorGreeting('');
    runner.assertEquals(greeting, '[Supervisor First Name]', 'Empty supervisor should return fallback');
});

// Test 5: Template validation
runner.test('Template validation catches common errors', () => {
    // Valid template
    let result = templateService.validateTemplate('Hello [GREETING], site: [SITE_NAME]');
    runner.assertTrue(result.valid, 'Valid template should pass validation');

    // Unmatched brackets
    result = templateService.validateTemplate('Hello [GREETING, missing bracket');
    runner.assertFalse(result.valid, 'Unmatched brackets should fail validation');
    runner.assert(result.errors.some(e => e.includes('Unmatched brackets')), 'Should detect unmatched brackets');

    // Empty brackets
    result = templateService.validateTemplate('Hello [], empty variable');
    runner.assertFalse(result.valid, 'Empty brackets should fail validation');

    // Unknown variables
    result = templateService.validateTemplate('Hello [UNKNOWN_VAR]');
    runner.assert(result.warnings.some(w => w.includes('Unknown variables')), 'Should warn about unknown variables');
});

// Test 6: Vulnerability summary generation
runner.test('Vulnerability summary generation works correctly', () => {
    const summary = templateService.generateVulnerabilitySummary(mockTicketData, mockVulnerabilityData);

    runner.assert(summary.includes('VULNERABILITY SUMMARY'), 'Should include summary header');
    runner.assert(summary.includes('switch01: 2 vulnerabilities'), 'Should count vulnerabilities per device');
    runner.assert(summary.includes('1 Critical, 1 High'), 'Should break down by severity');
});

// Test 7: Fallback template processing
runner.test('Hardcoded fallback template processes correctly', () => {
    const result = templateService.processHardcodedTemplate(mockTicketData);

    runner.assert(result.includes('Test Site'), 'Fallback should substitute site name');
    runner.assert(result.includes('John'), 'Fallback should substitute greeting');
    runner.assert(result.includes('Fallback Mode'), 'Should indicate fallback mode');
});

// Test 8: Error handling in variable processing
runner.test('Variable processing handles errors gracefully', () => {
    // Test with invalid ticket data
    const invalidData = null;
    const template = 'Hello [GREETING]';

    // Should not throw, should use fallbacks
    const result = templateService.substituteVariables(template, invalidData);
    runner.assert(result.includes('[Supervisor First Name]'), 'Should use fallback for invalid data');
});

// Test 9: Large template handling
runner.test('Large templates are handled correctly', () => {
    const largeTemplate = 'Content: [SITE_NAME]\n'.repeat(1000);
    const result = templateService.substituteVariables(largeTemplate, mockTicketData);

    runner.assert(result.length > 15000, 'Large template should be processed');
    runner.assert(result.includes('Test Site'), 'Variables should still be substituted in large templates');
});

// Test 10: Special characters in data
runner.test('Special characters in ticket data are handled safely', () => {
    const specialData = {
        ...mockTicketData,
        site: 'Site & <script>alert("xss")</script>',
        supervisor: 'O\'Malley, John'
    };

    const template = 'Site: [SITE_NAME], Supervisor: [GREETING]';
    const result = templateService.substituteVariables(template, specialData);

    runner.assert(result.includes('Site & <script>'), 'Should preserve special characters');
    runner.assert(result.includes('John'), 'Should handle apostrophes in names');
});

// Export for potential use in other test files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runner, templateService, mockTicketData, mockVulnerabilityData };
}

// Run tests if this file is executed directly
if (require.main === module) {
    runner.run().then(success => {
        process.exit(success ? 0 : 1);
    });
}