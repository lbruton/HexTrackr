/**
 * HexTrackr Validation Middleware
 * Extracted from server.js for better modularity and reusability
 * Provides validation middleware functions for request parameters, bodies, and files
 */

const multer = require("multer");
const ValidationService = require("../services/validationService");

// Initialize validation service
const validationService = new ValidationService();

// =============================================================================
// MIDDLEWARE FACTORY FUNCTIONS
// =============================================================================

/**
 * Generic validation middleware factory
 * @param {Function} validatorFn - Validation function that returns {success, errors, warnings}
 * @param {string} sourceProperty - Request property to validate ("body", "query", "params")
 * @returns {Function} Express middleware function
 */
function createValidationMiddleware(validatorFn, sourceProperty = "body") {
    return (req, res, next) => {
        try {
            const dataToValidate = req[sourceProperty];
            const validation = validatorFn(dataToValidate);

            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    error: "Validation failed",
                    details: validation.errors.join(", "),
                    warnings: validation.warnings || []
                });
            }

            // Attach warnings to request for logging
            if (validation.warnings && validation.warnings.length > 0) {
                req.validationWarnings = validation.warnings;
            }

            next();
        } catch (error) {
            console.error("Validation middleware error:", error);
            return res.status(500).json({
                success: false,
                error: "Internal validation error",
                details: error.message
            });
        }
    };
}

// =============================================================================
// FILE UPLOAD VALIDATION MIDDLEWARE
// =============================================================================

/**
 * Multer configuration for CSV file uploads
 * Limits file size and validates file types
 */
const csvUpload = multer({
    dest: "uploads/",
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
        files: 1 // Only one file per request
    },
    fileFilter: (req, file, cb) => {
        // Validate MIME type and extension
        const allowedMimeTypes = [
            "text/csv",
            "application/csv",
            "text/plain",
            "application/vnd.ms-excel"
        ];

        const allowedExtensions = [".csv", ".txt"];
        const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf("."));

        if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type. Only CSV files are allowed."), false);
        }
    }
});

/**
 * JSON file upload configuration for data restoration
 */
const jsonUpload = multer({
    dest: "uploads/",
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
        files: 1
    },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            "application/json",
            "text/json",
            "text/plain"
        ];

        const allowedExtensions = [".json"];
        const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf("."));

        if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type. Only JSON files are allowed."), false);
        }
    }
});

/**
 * File upload validation middleware
 * Validates that a file was uploaded and checks basic file properties
 * Used after multer middleware to ensure file upload succeeded and meets requirements
 *
 * @param {Object} req - Express request object
 * @param {Object} req.file - Multer file object (added by csvUpload or jsonUpload middleware)
 * @param {string} req.file.originalname - Original filename from client
 * @param {number} req.file.size - File size in bytes
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Sends JSON response on validation failure:
 *   - 400: {success: false, error: string, details: string} if:
 *     - No file uploaded (req.file missing)
 *     - Invalid filename (empty or missing originalname)
 *     - Empty file (size === 0)
 *   - Calls next() on successful validation
 * @throws {never} Does not throw - errors returned as 400 JSON responses
 *
 * @example
 * // Use with CSV upload endpoint
 * router.post("/api/import/csv",
 *   csvUpload.single("file"),
 *   validateFileUpload,
 *   importController.handleCSV
 * );
 *
 * @example
 * // Use with JSON restore endpoint
 * router.post("/api/backup/restore",
 *   jsonUpload.single("file"),
 *   validateFileUpload,
 *   backupController.restore
 * );
 */
const validateFileUpload = (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            error: "No file uploaded",
            details: "A file is required for this operation"
        });
    }

    // Validate filename
    if (!req.file.originalname || req.file.originalname.trim() === "") {
        return res.status(400).json({
            success: false,
            error: "Invalid filename",
            details: "File must have a valid name"
        });
    }

    // Check file size (additional check beyond multer)
    if (req.file.size === 0) {
        return res.status(400).json({
            success: false,
            error: "Empty file",
            details: "Uploaded file is empty"
        });
    }

    next();
};

// =============================================================================
// REQUEST BODY VALIDATORS
// =============================================================================

/**
 * Ticket input validation middleware
 */
const validateTicketInput = createValidationMiddleware(
    (data) => validationService.validateTicketInput(data),
    "body"
);

/**
 * Vulnerability input validation middleware
 */
const validateVulnerabilityInput = createValidationMiddleware(
    (data) => validationService.validateVulnerabilityInput(data),
    "body"
);

/**
 * CSV import data validation middleware
 */
const validateCSVImportData = (type) => {
    return (req, res, next) => {
        try {
            const csvData = req.body.data || [];

            if (!Array.isArray(csvData)) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid data format",
                    details: "Data must be an array of objects"
                });
            }

            if (csvData.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: "No data provided",
                    details: "CSV data array is empty"
                });
            }

            const validation = validationService.validateImportData(csvData, type);

            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    error: "Import data validation failed",
                    details: validation.errors.join(", "),
                    warnings: validation.warnings || [],
                    stats: validation.stats
                });
            }

            // Attach validation results to request
            req.validationResults = validation;

            next();
        } catch (error) {
            console.error("CSV import validation error:", error);
            return res.status(500).json({
                success: false,
                error: "Internal validation error",
                details: error.message
            });
        }
    };
};

// =============================================================================
// QUERY PARAMETER VALIDATORS
// =============================================================================

/**
 * Pagination parameters validation middleware
 */
const validatePaginationParams = (req, res, next) => {
    try {
        const { page, limit } = req.query;
        const sanitized = validationService.sanitizePaginationParams(page, limit);

        // Replace query parameters with sanitized values
        req.query.page = sanitized.page;
        req.query.limit = sanitized.limit;
        req.pagination = sanitized; // Add convenience property

        next();
    } catch (error) {
        console.error("Pagination validation error:", error);
        return res.status(400).json({
            success: false,
            error: "Invalid pagination parameters",
            details: error.message
        });
    }
};

/**
 * Date range parameters validation middleware
 */
const validateDateRangeParams = (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        if (startDate && !validationService.validateDateFormat(startDate)) {
            return res.status(400).json({
                success: false,
                error: "Invalid start date format",
                details: "Start date must be a valid date"
            });
        }

        if (endDate && !validationService.validateDateFormat(endDate)) {
            return res.status(400).json({
                success: false,
                error: "Invalid end date format",
                details: "End date must be a valid date"
            });
        }

        // Validate date range logic
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            if (start > end) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid date range",
                    details: "Start date must be before end date"
                });
            }
        }

        next();
    } catch (error) {
        console.error("Date range validation error:", error);
        return res.status(400).json({
            success: false,
            error: "Invalid date parameters",
            details: error.message
        });
    }
};

// =============================================================================
// ID PARAMETER VALIDATORS
// =============================================================================

/**
 * Creates Express middleware for validating numeric ID parameters
 * Higher-order function that returns middleware to validate and sanitize
 * route parameters as positive integers, replacing string values with numeric IDs
 *
 * @param {string} [paramName="id"] - The route parameter name to validate (defaults to "id")
 * @returns {Function} Express middleware function (req, res, next) => void that:
 *   - Validates parameter exists and is a positive integer
 *   - Sanitizes by replacing req.params[paramName] with parsed numeric value
 *   - Returns 400 JSON error if validation fails
 *   - Calls next() on successful validation
 * @throws {never} Does not throw - errors caught internally and returned as 400 JSON responses
 *
 * @example
 * // Validate default "id" parameter
 * router.get("/api/tickets/:id", validateNumericId(), ticketController.getById);
 *
 * @example
 * // Validate custom parameter name
 * router.delete("/api/users/:userId/posts/:postId",
 *   validateNumericId("userId"),
 *   validateNumericId("postId"),
 *   postController.delete
 * );
 */
const validateNumericId = (paramName = "id") => {
    return (req, res, next) => {
        try {
            const id = req.params[paramName];

            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: "Missing ID parameter",
                    details: `${paramName} parameter is required`
                });
            }

            const numericId = parseInt(id, 10);
            if (isNaN(numericId) || numericId <= 0) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid ID format",
                    details: `${paramName} must be a positive integer`
                });
            }

            // Replace with sanitized numeric value
            req.params[paramName] = numericId;

            next();
        } catch (error) {
            console.error("ID validation error:", error);
            return res.status(400).json({
                success: false,
                error: "Invalid ID parameter",
                details: error.message
            });
        }
    };
};

// =============================================================================
// DATA TYPE VALIDATORS
// =============================================================================

/**
 * Import type validation middleware
 */
const validateImportType = (req, res, next) => {
    try {
        const type = req.body.type || req.query.type;

        if (!type) {
            return res.status(400).json({
                success: false,
                error: "Missing import type",
                details: "Type parameter is required"
            });
        }

        const validTypes = ["tickets", "vulnerabilities", "all"];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                error: "Invalid import type",
                details: `Type must be one of: ${validTypes.join(", ")}`
            });
        }

        next();
    } catch (error) {
        console.error("Import type validation error:", error);
        return res.status(400).json({
            success: false,
            error: "Invalid import type parameter",
            details: error.message
        });
    }
};

/**
 * Vendor parameter validation middleware
 */
const validateVendorParam = (req, res, next) => {
    try {
        const vendor = req.body.vendor || req.query.vendor || "unknown";

        // Sanitize vendor name
        const sanitizedVendor = validationService.sanitizeInput(vendor);

        if (sanitizedVendor.length === 0) {
            req.body.vendor = "unknown";
        } else {
            req.body.vendor = sanitizedVendor;
        }

        next();
    } catch (error) {
        console.error("Vendor validation error:", error);
        return res.status(400).json({
            success: false,
            error: "Invalid vendor parameter",
            details: error.message
        });
    }
};

// =============================================================================
// SPECIALIZED VALIDATORS
// =============================================================================

/**
 * Search query validation middleware
 */
const validateSearchQuery = (req, res, next) => {
    try {
        const search = req.query.search || "";

        // Sanitize search query
        const sanitizedSearch = validationService.sanitizeInput(search);
        req.query.search = sanitizedSearch;

        // Validate search length
        if (sanitizedSearch.length > 200) {
            return res.status(400).json({
                success: false,
                error: "Search query too long",
                details: "Search query must be 200 characters or less"
            });
        }

        next();
    } catch (error) {
        console.error("Search validation error:", error);
        return res.status(400).json({
            success: false,
            error: "Invalid search query",
            details: error.message
        });
    }
};

/**
 * Filter parameters validation middleware
 */
const validateFilterParams = (req, res, next) => {
    try {
        const { severity, status, vendor } = req.query;

        // Validate severity filter
        if (severity && !validationService.validateSeverity(severity)) {
            return res.status(400).json({
                success: false,
                error: "Invalid severity filter",
                details: "Severity must be one of: Critical, High, Medium, Low, Info"
            });
        }

        // Validate status filter for tickets
        if (status && !validationService.validateTicketStatus(status)) {
            return res.status(400).json({
                success: false,
                error: "Invalid status filter",
                details: "Status must be one of: Open, In Progress, Pending, Resolved, Closed"
            });
        }

        // Sanitize vendor filter
        if (vendor) {
            req.query.vendor = validationService.sanitizeInput(vendor);
        }

        next();
    } catch (error) {
        console.error("Filter validation error:", error);
        return res.status(400).json({
            success: false,
            error: "Invalid filter parameters",
            details: error.message
        });
    }
};

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
    // Factory function
    createValidationMiddleware,

    // File upload middleware
    csvUpload,
    jsonUpload,
    validateFileUpload,

    // Request body validators
    validateTicketInput,
    validateVulnerabilityInput,
    validateCSVImportData,

    // Query parameter validators
    validatePaginationParams,
    validateDateRangeParams,
    validateSearchQuery,
    validateFilterParams,

    // ID validators
    validateNumericId,

    // Data type validators
    validateImportType,
    validateVendorParam,

    // Validation service access
    validationService
};