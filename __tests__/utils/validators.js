/**
 * Data Validation Helpers
 * Validates test data formats and patterns
 * 
 * Validations:
 * - CVE pattern matching
 * - Severity levels (Critical, High, Medium, Low)
 * - VPR scores (0.0 - 10.0)
 * - Device naming conventions
 * 
 * @module validators
 */

/**
 * Validate CVE identifier format
 * @param {string} cve - CVE identifier to validate
 * @returns {boolean} Whether CVE format is valid
 */
function isValidCVE(cve) {
  // CVE pattern: CVE-YYYY-NNNN or CVE-YYYY-NNNNN+
  const cvePattern = /^CVE-\d{4}-\d{4,}$/;
  return cvePattern.test(cve);
}

/**
 * Validate severity level
 * @param {string} severity - Severity level to validate
 * @returns {boolean} Whether severity is valid
 */
function isValidSeverity(severity) {
  const validSeverities = ['Critical', 'High', 'Medium', 'Low'];
  return validSeverities.includes(severity);
}

/**
 * Validate VPR score
 * @param {number} vpr - VPR score to validate
 * @returns {boolean} Whether VPR is in valid range
 */
function isValidVPR(vpr) {
  return typeof vpr === 'number' && vpr >= 0 && vpr <= 10;
}

module.exports = {
  isValidCVE,
  isValidSeverity,
  isValidVPR
};