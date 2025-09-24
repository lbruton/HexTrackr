/**
 * PathValidator - Security utility for path validation
 * Prevents directory traversal attacks and validates file paths
 */

const fs = require("fs");
const path = require("path");

class PathValidator {
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

    static safeReadFileSync(filePath, options = "utf8") {
        const validatedPath = this.validatePath(filePath);
        return fs.readFileSync(validatedPath, options);
    }

    static safeWriteFileSync(filePath, data, options = "utf8") {
        const validatedPath = this.validatePath(filePath);
        return fs.writeFileSync(validatedPath, data, options);
    }

    static safeReaddirSync(dirPath, options = {}) {
        const validatedPath = this.validatePath(dirPath);
        return fs.readdirSync(validatedPath, options);
    }

    static safeStatSync(filePath) {
        const validatedPath = this.validatePath(filePath);
        return fs.statSync(validatedPath);
    }

    static safeExistsSync(filePath) {
        try {
            const validatedPath = this.validatePath(filePath);
            return fs.existsSync(validatedPath);
        } catch {
            return false;
        }
    }

    static safeUnlinkSync(filePath) {
        const validatedPath = this.validatePath(filePath);
        return fs.unlinkSync(validatedPath);
    }
}

module.exports = PathValidator;