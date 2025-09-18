/**
 * PathValidator - Security utility for path validation
 * Prevents directory traversal attacks and validates file paths
 */

const fs = require("fs");
const path = require("path");

class PathValidator {
    /**
     * Validates a file path to prevent directory traversal attacks.
     * @param {string} filePath - The file path to validate.
     * @returns {string} The normalized and validated file path.
     * @throws {Error} If the file path is invalid or contains traversal attempts.
     */
    static validatePath(filePath) {
        if (!filePath || typeof filePath !== "string") {
            throw new Error("Invalid file path");
        }

        const normalizedPath = path.normalize(filePath);

        // Check for path traversal attempts
        if (normalizedPath.includes("../") || normalizedPath.includes("..\\")) {
            throw new Error("Path traversal detected");
        }

        // Validate path components
        const pathComponents = normalizedPath.split(path.sep);
        for (const component of pathComponents) {
            if (component === ".." || (component === "." && pathComponents.length > 1)) {
                throw new Error("Invalid path component");
            }
        }

        return normalizedPath;
    }

    /**
     * Safely reads the content of a file after validating the path.
     * @param {string} filePath - The path to the file to read.
     * @param {string} [options="utf8"] - The encoding to use.
     * @returns {string|Buffer} The content of the file.
     */
    static safeReadFileSync(filePath, options = "utf8") {
        const validatedPath = this.validatePath(filePath);
        return fs.readFileSync(validatedPath, options);
    }

    /**
     * Safely writes data to a file after validating the path.
     * @param {string} filePath - The path to the file to write to.
     * @param {string|Buffer} data - The data to write.
     * @param {string} [options="utf8"] - The encoding to use.
     */
    static safeWriteFileSync(filePath, data, options = "utf8") {
        const validatedPath = this.validatePath(filePath);
        return fs.writeFileSync(validatedPath, data, options);
    }

    /**
     * Safely reads the contents of a directory after validating the path.
     * @param {string} dirPath - The path to the directory to read.
     * @param {object} [options={}]
     * @returns {string[]} An array of file and directory names.
     */
    static safeReaddirSync(dirPath, options = {}) {
        const validatedPath = this.validatePath(dirPath);
        return fs.readdirSync(validatedPath, options);
    }

    /**
     * Safely gets file status after validating the path.
     * @param {string} filePath - The path to the file.
     * @returns {fs.Stats} The file status.
     */
    static safeStatSync(filePath) {
        const validatedPath = this.validatePath(filePath);
        return fs.statSync(validatedPath);
    }

    /**
     * Safely checks if a file exists after validating the path.
     * @param {string} filePath - The path to the file.
     * @returns {boolean} True if the file exists, false otherwise.
     */
    static safeExistsSync(filePath) {
        try {
            const validatedPath = this.validatePath(filePath);
            return fs.existsSync(validatedPath);
        } catch {
            return false;
        }
    }

    /**
     * Safely deletes a file after validating the path.
     * @param {string} filePath - The path to the file to delete.
     */
    static safeUnlinkSync(filePath) {
        const validatedPath = this.validatePath(filePath);
        return fs.unlinkSync(validatedPath);
    }
}

module.exports = PathValidator;
