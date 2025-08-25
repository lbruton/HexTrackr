/**
 * @fileoverview Unit tests for the validation and error handling utilities.
 * This file provides test cases for each of the validation functions to ensure
 * they work as expected.
 *
 * To run these tests, you would typically use a testing framework like Jest or Mocha.
 * Example with Jest: `npx jest validation-utils.test.js`
 *
 * @version 1.0.0
 * @author GitHub Copilot
 * @date 2025-08-25
 */

// Assuming the utils are in a file that can be required (Node.js environment)
// If running in a browser, you would load the script and the functions would be global.
const {
    isValidCVE,
    isValidIP,
    isValidVPR,
    normalizeDate,
    isValidHostname,
    isValidSeverity,
    validateCsvRow
} = require('./validation-utils'); // Adjust path as needed

// Mock console for cleaner test output
global.console = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
};

// =================================================================================================
// UNIT TESTS
// =================================================================================================

describe('Validation Utilities', () => {

    // --- Test isValidCVE ---
    describe('isValidCVE', () => {
        it('should return true for valid CVE formats', () => {
            expect(isValidCVE('CVE-2023-12345')).toBe(true);
            expect(isValidCVE('cve-2021-9876')).toBe(true);
            expect(isValidCVE('CVE-1999-0001')).toBe(true);
        });
        it('should return false for invalid CVE formats', () => {
            expect(isValidCVE('CVE-2023-123')).toBe(false); // Too short
            expect(isValidCVE('CVE-2023-')).toBe(false);
            expect(isValidCVE('CV-2023-12345')).toBe(false);
            expect(isValidCVE('CVE-ABCD-EFGH')).toBe(false);
            expect(isValidCVE(null)).toBe(false);
            expect(isValidCVE(123)).toBe(false);
        });
    });

    // --- Test isValidIP ---
    describe('isValidIP', () => {
        it('should return true for valid IPv4 addresses', () => {
            expect(isValidIP('192.168.0.1')).toBe(true);
            expect(isValidIP('10.0.0.0')).toBe(true);
            expect(isValidIP('255.255.255.255')).toBe(true);
        });
        it('should return true for valid IPv6 addresses', () => {
            expect(isValidIP('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true);
            expect(isValidIP('::1')).toBe(true);
        });
        it('should return false for invalid IP addresses', () => {
            expect(isValidIP('256.100.50.0')).toBe(false);
            expect(isValidIP('192.168.0')).toBe(false);
            expect(isValidIP('not-an-ip')).toBe(false);
        });
    });

    // --- Test isValidVPR ---
    describe('isValidVPR', () => {
        it('should return true for valid VPR scores', () => {
            expect(isValidVPR(0)).toBe(true);
            expect(isValidVPR(10.0)).toBe(true);
            expect(isValidVPR('5.5')).toBe(true);
        });
        it('should return false for invalid VPR scores', () => {
            expect(isValidVPR(10.1)).toBe(false);
            expect(isValidVPR(-0.1)).toBe(false);
            expect(isValidVPR('high')).toBe(false);
            expect(isValidVPR(null)).toBe(false);
        });
    });

    // --- Test normalizeDate ---
    describe('normalizeDate', () => {
        it('should correctly normalize various date formats to YYYY-MM-DD', () => {
            expect(normalizeDate('2023-05-15')).toBe('2023-05-15');
            expect(normalizeDate('5/15/2023')).toBe('2023-05-15');
            expect(normalizeDate(new Date('2023-05-15T12:00:00Z'))).toBe('2023-05-15');
        });
        it('should return null for invalid date inputs', () => {
            expect(normalizeDate('not a date')).toBe(null);
            expect(normalizeDate(null)).toBe(null);
            expect(normalizeDate(undefined)).toBe(null);
        });
    });

    // --- Test isValidHostname ---
    describe('isValidHostname', () => {
        it('should return true for valid hostnames', () => {
            expect(isValidHostname('example.com')).toBe(true);
            expect(isValidHostname('sub.domain.example.co.uk')).toBe(true);
            expect(isValidHostname('localhost')).toBe(true);
            expect(isValidHostname('my-server-01')).toBe(true);
        });
        it('should return false for invalid hostnames', () => {
            expect(isValidHostname('invalid_hostname')).toBe(false);
            expect(isValidHostname('-invalid.com')).toBe(false);
            expect(isValidHostname('invalid.com-')).toBe(false);
            expect(isValidHostname('.invalid.com')).toBe(false);
        });
    });

    // --- Test isValidSeverity ---
    describe('isValidSeverity', () => {
        it('should return true for valid severity levels, case-insensitive', () => {
            expect(isValidSeverity('Critical')).toBe(true);
            expect(isValidSeverity('high')).toBe(true);
            expect(isValidSeverity('MEDIUM')).toBe(true);
            expect(isValidSeverity('  Low ')).toBe(true); // Test with whitespace
        });
        it('should return false for invalid severity levels', () => {
            expect(isValidSeverity('Very High')).toBe(false);
            expect(isValidSeverity('unknown')).toBe(false);
            expect(isValidSeverity(null)).toBe(false);
        });
    });

    // --- Test validateCsvRow ---
    describe('validateCsvRow', () => {
        it('should return valid with no errors for a correct row', () => {
            const row = { Hostname: 'test.com', CVE: 'CVE-2023-12345', 'VPR Score': '8.5' };
            const result = validateCsvRow(row, 1);
            expect(result.isValid).toBe(true);
            expect(result.errors.length).toBe(0);
            expect(result.validatedData.hostname).toBe('test.com');
            expect(result.validatedData.cve).toBe('CVE-2023-12345');
            expect(result.validatedData.vpr_score).toBe(8.5);
        });

        it('should return invalid with errors for an incorrect row', () => {
            const row = { Hostname: 'invalid_host', CVE: 'bad-cve', 'VPR Score': '99' };
            const result = validateCsvRow(row, 2);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBe(3);
            expect(result.errors[0]).toContain('Invalid or missing Hostname');
            expect(result.errors[1]).toContain('Invalid or missing CVE ID');
            expect(result.errors[2]).toContain('VPR Score must be between 0.0 and 10.0');
        });
    });
});
