/**
 * @fileoverview Comprehensive validation and error handling utilities for HexTrackr.
 * This library provides functions to validate common data formats (CVE, IP, VPR score),
 * normalize data, and handle errors gracefully across the application, particularly
 * for CSV imports and database operations.
 *
 * @version 1.0.41
 * @author HexTrackr Team
 * @date 2025-10-01
 */

/* global process, console, module */

// =================================================================================================
// VALIDATION UTILITIES
// =================================================================================================

/**
 * Validates a CVE identifier format (e.g., CVE-YYYY-NNNNN).
 * @param {string} cve - The CVE string to validate.
 * @returns {boolean} True if the format is valid, otherwise false.
 * @example
 * isValidCVE('CVE-2023-12345'); // true
 * isValidCVE('cve-2023-1234'); // true
 * isValidCVE('CVE-2023-123'); // true
 * isValidCVE('invalid-cve'); // false
 */
function isValidCVE(cve) {
    if (typeof cve !== "string") {return false;}
    // Matches 'CVE-' followed by 4 digits (year) and 4 or more digits (sequence). Case-insensitive.
    const cveRegex = /^CVE-\d{4}-\d{4,}$/i;
    return cveRegex.test(cve.trim());
}

/**
 * Validates an IP address (both IPv4 and IPv6).
 * @param {string} ip - The IP address string to validate.
 * @returns {boolean} True if the format is valid, otherwise false.
 * @example
 * isValidIP('192.168.1.1'); // true
 * isValidIP('2001:0db8:85a3:0000:0000:8a2e:0370:7334'); // true
 * isValidIP('999.999.999.999'); // false
 */
function isValidIP(ip) {
    if (typeof ip !== "string") {return false;}
    // This regex is a simplified check and may not cover all edge cases,
    // but is generally sufficient for typical IPv4 and IPv6 formats.
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/;
    return ipv4Regex.test(ip.trim()) || ipv6Regex.test(ip.trim());
}

/**
 * Validates a VPR (Vulnerability Priority Rating) score.
 * @param {number|string} score - The VPR score to validate.
 * @returns {boolean} True if the score is between 0.0 and 10.0 (inclusive).
 * @example
 * isValidVPR(7.5); // true
 * isValidVPR('9.9'); // true
 * isValidVPR(11); // false
 * isValidVPR(-1); // false
 */
function isValidVPR(score) {
    const numScore = parseFloat(score);
    return !isNaN(numScore) && numScore >= 0.0 && numScore <= 10.0;
}

/**
 * Validates and normalizes a date string into ISO 8601 format (YYYY-MM-DD).
 * @param {string|Date} dateInput - The date string or Date object to validate.
 * @returns {string|null} The normalized date string or null if invalid.
 * @example
 * normalizeDate('2023-01-01'); // "2023-01-01"
 * normalizeDate('01/01/2023'); // "2023-01-01"
 * normalizeDate(new Date('2023-01-01')); // "2023-01-01"
 * normalizeDate('invalid date'); // null
 */
function normalizeDate(dateInput) {
    if (!dateInput) {return null;}
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
        return null;
    }
    // Pad month and day with a leading zero if necessary
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

/**
 * Validates a hostname based on DNS rules.
 * @param {string} hostname - The hostname to validate.
 * @returns {boolean} True if the hostname is valid.
 * @example
 * isValidHostname('my-server-01.example.com'); // true
 * isValidHostname('localhost'); // true
 * isValidHostname('invalid_hostname'); // false
 */
function isValidHostname(hostname) {
    if (typeof hostname !== "string" || hostname.length > 253) {
        return false;
    }
    // Matches valid hostnames, allowing for segments separated by dots.
    const hostnameRegex = /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z0-9-]{1,63})*$/;
    return hostnameRegex.test(hostname.trim());
}

/**
 * Validates a severity level against a predefined list.
 * @param {string} severity - The severity string to validate.
 * @returns {boolean} True if the severity is valid.
 * @example
 * isValidSeverity('Critical'); // true
 * isValidSeverity('high'); // true (case-insensitive)
 * isValidSeverity('Urgent'); // false
 */
function isValidSeverity(severity) {
    if (typeof severity !== "string") {return false;}
    const validSeverities = ["critical", "high", "medium", "low", "info"];
    return validSeverities.includes(severity.trim().toLowerCase());
}


// =================================================================================================
// ERROR HANDLING UTILITIES
// =================================================================================================

/**
 * A custom error class for application-specific errors.
 */
class AppError extends Error {
    constructor(message, statusCode, isOperational = true) {
        super(message);
        // PMD-disable-next-line GlobalVariable
        this.statusCode = statusCode;
        this.isOperational = isOperational; // Operational errors are expected (e.g., user input)
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Formats an error into a consistent API response object.
 * @param {Error|AppError} err - The error object.
 * @returns {{status: string, message: string, stack?: string}} A formatted error object.
 */
function formatApiError(err) {
    const isDevelopment = process.env.NODE_ENV === "development";
    if (err.isOperational) {
        return {
            status: err.status,
            message: err.message
        };
    }
    // For non-operational errors, log them and send a generic message
    console.error("PROGRAMMING_ERROR:", err);
    return {
        status: "error",
        message: "Something went very wrong!",
        // Only expose stack in development
        ...(isDevelopment && { stack: err.stack })
    };
}

/**
 * A simple logging utility for debugging.
 * @param {string} level - The log level (e.g., 'INFO', 'WARN', 'ERROR').
 * @param {string} message - The message to log.
 * @param {object} [data] - Optional data to include in the log.
 */
function log(level, message, data) {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} [${level}] ${message}`, data || "");
}

/**
 * User-friendly error message templates.
 */
const errorMessages = {
    csv: {
        invalidRow: (rowNumber, error) => `Invalid data in CSV row ${rowNumber}: ${error}`,
        missingHeader: (header) => `CSV file is missing required header: "${header}".`,
        fileReadError: "Could not read the uploaded CSV file."
    },
    db: {
        connection: "Could not connect to the database.",
        constraintViolation: "An item with this identifier already exists.",
        operationFailed: "The database operation failed."
    },
    api: {
        notFound: (resource) => `${resource} not found.`,
        invalidInput: "The data provided is invalid.",
        unauthorized: "You are not authorized to perform this action."
    }
};


// =================================================================================================
// INTEGRATION EXAMPLES & WRAPPERS
// =================================================================================================

/**
 * A pipeline function to validate a single row from a CSV file.
 * @param {object} row - A single row object from PapaParse.
 * @param {number} rowIndex - The index of the row in the file.
 * @returns {{isValid: boolean, errors: string[], validatedData: object}} Result object.
 * @example
 * const csvRow = { Hostname: 'test.com', CVE: 'CVE-2023-12345', 'VPR Score': '8.5' };
 * const result = validateCsvRow(csvRow, 1);
 * // result.isValid will be true
 */
function validateCsvRow(row, rowIndex) {
    const errors = [];
    const validatedData = {};

    // Example validation for a few fields
    if (!row.Hostname || !isValidHostname(row.Hostname)) {
        errors.push(errorMessages.csv.invalidRow(rowIndex, "Invalid or missing Hostname"));
    } else {
        validatedData.hostname = row.Hostname.trim();
    }

    if (!row.CVE || !isValidCVE(row.CVE)) {
        errors.push(errorMessages.csv.invalidRow(rowIndex, "Invalid or missing CVE ID"));
    } else {
        validatedData.cve = row.CVE.trim().toUpperCase();
    }

    if (row["VPR Score"] && !isValidVPR(row["VPR Score"])) {
        errors.push(errorMessages.csv.invalidRow(rowIndex, "VPR Score must be between 0.0 and 10.0"));
    } else {
        validatedData.vpr_score = row["VPR Score"] ? parseFloat(row["VPR Score"]) : null;
    }
    
    // Add more validations for other fields...

    return {
        isValid: errors.length === 0,
        errors,
        validatedData
    };
}

/**
 * A wrapper for database operations to handle errors gracefully.
 * @param {Function} dbOperation - An async function representing the database call.
 * @returns {Promise<[*, null]|[null, Error]>} A tuple with [data, error].
 * @example
 * async function myDbQuery() {
 *   // ... database logic that might throw an error
 * }
 * const [result, error] = await handleDbOperation(myDbQuery);
 * if (error) {
 *   // handle the error
 * } else {
 *   // use the result
 * }
 */
async function handleDbOperation(dbOperation) {
    try {
        const data = await dbOperation();
        return [data, null];
    } catch (err) {
        log("ERROR", "Database operation failed", err);
        // Check for specific database error types (e.g., unique constraint)
        if (err.code === "SQLITE_CONSTRAINT") {
            return [null, new AppError(errorMessages.db.constraintViolation, 409)];
        }
        return [null, new AppError(errorMessages.db.operationFailed, 500)];
    }
}

// Export functions for use in other modules if using a module system
// For browser environment, they are available globally on the window object.
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        isValidCVE,
        isValidIP,
        isValidVPR,
        normalizeDate,
        isValidHostname,
        isValidSeverity,
        AppError,
        formatApiError,
        log,
        errorMessages,
        validateCsvRow,
        handleDbOperation
    };
}
