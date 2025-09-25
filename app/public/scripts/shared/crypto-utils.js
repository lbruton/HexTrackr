/**
 * @fileoverview Cryptographic utility functions with automatic fallback for non-HTTPS environments
 * @module crypto-utils
 * @description Provides secure random ID generation with graceful degradation for environments
 * without Web Crypto API support (HTTP, WebViews, older browsers)
 * @since 1.0.31
 * @version 1.0.0
 */

/* eslint-env browser */
/* global performance, module */

"use strict";

/**
 * Generate a cryptographically secure random ID with automatic fallback
 * Uses Web Crypto API when available (HTTPS) and falls back to timestamp-based IDs
 * for non-secure contexts, maintaining functionality across all environments
 *
 * @param {string} prefix - The prefix for the ID (e.g., 'import', 'toast', 'modal')
 * @param {number} [randomBytes=2] - Number of random Uint32 elements to generate (1 or 2)
 * @returns {string} A unique ID with the format: prefix-timestamp-random
 *
 * @example
 * // Generate a session ID for CSV imports
 * const sessionId = generateSecureId('import', 2);
 * // Returns: "import-1735088423891-a3b2c1d4e5"
 *
 * @example
 * // Generate a toast notification ID
 * const toastId = generateSecureId('toast', 2);
 * // Returns: "toast-1735088423891-f6g7h8i9j0"
 *
 * @example
 * // Generate a modal operation ID with single random element
 * const operationId = generateSecureId('show', 1);
 * // Returns: "show-1735088423891-k1l2m3"
 */
function generateSecureId(prefix, randomBytes = 2) {
    const timestamp = Date.now();

    if (window.crypto?.getRandomValues) {
        // Secure: Use Web Crypto API when available (HTTPS environments)
        const arraySize = randomBytes === 1 ? 1 : 2;
        const randomArray = new Uint32Array(arraySize);
        window.crypto.getRandomValues(randomArray);

        // Convert to base36 string for compact representation
        const randomString = arraySize === 1
            ? randomArray[0].toString(36)
            : randomArray[0].toString(36) + randomArray[1].toString(36);

        return `${prefix}-${timestamp}-${randomString.substr(0, 9)}`;
    } else {
        // Fallback: Use timestamp + performance.now() for non-HTTPS environments
        // This provides reasonable uniqueness for UI operations while maintaining functionality
        console.warn(`crypto.getRandomValues not available, using timestamp fallback for ${prefix} ID`);

        // performance.now() provides microsecond precision, adding entropy to timestamp
        const random = performance.now().toString(36).replace(".", "");
        return `${prefix}-${timestamp}-${random.substr(0, 9)}`;
    }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
    // Node.js environment (CommonJS compatibility for potential future use)
    module.exports = { generateSecureId };
} else if (typeof window !== "undefined") {
    // Browser environment - make function globally available
    window.generateSecureId = generateSecureId;
}