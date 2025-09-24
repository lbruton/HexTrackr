/**
 * FileService - Centralized file operations using PathValidator
 * Handles file uploads, CSV processing, backup operations, and temporary files
 */

const fs = require("fs");
const path = require("path");
const multer = require("multer");
const Papa = require("papaparse");
const PathValidator = require("../utils/PathValidator");

class FileService {
    constructor() {
        // Configure upload middleware with Multer
        this.upload = multer({
            dest: "uploads/",
            limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
        });
    }

    /**
     * Read file contents safely using PathValidator
     * @param {string} filePath - Path to file to read
     * @param {string} options - File read options (default: 'utf8')
     * @returns {string|Buffer} File contents
     */
    readFile(filePath, options = "utf8") {
        try {
            return PathValidator.safeReadFileSync(filePath, options);
        } catch (error) {
            throw new Error(`Failed to read file ${filePath}: ${error.message}`);
        }
    }

    /**
     * Write file contents safely using PathValidator
     * @param {string} filePath - Path to file to write
     * @param {string|Buffer} content - Content to write
     * @param {string} options - File write options (default: 'utf8')
     */
    writeFile(filePath, content, options = "utf8") {
        try {
            return PathValidator.safeWriteFileSync(filePath, content, options);
        } catch (error) {
            throw new Error(`Failed to write file ${filePath}: ${error.message}`);
        }
    }

    /**
     * Delete file safely using PathValidator
     * @param {string} filePath - Path to file to delete
     */
    deleteFile(filePath) {
        try {
            if (this.fileExists(filePath)) {
                return PathValidator.safeUnlinkSync(filePath);
            }
        } catch (error) {
            throw new Error(`Failed to delete file ${filePath}: ${error.message}`);
        }
    }

    /**
     * Check if file exists safely
     * @param {string} filePath - Path to check
     * @returns {boolean} True if file exists
     */
    fileExists(filePath) {
        return PathValidator.safeExistsSync(filePath);
    }

    /**
     * Get file stats safely using PathValidator
     * @param {string} filePath - Path to file
     * @returns {fs.Stats} File statistics
     */
    getFileStats(filePath) {
        try {
            return PathValidator.safeStatSync(filePath);
        } catch (error) {
            throw new Error(`Failed to get stats for ${filePath}: ${error.message}`);
        }
    }

    /**
     * Create directory safely
     * @param {string} dirPath - Directory path to create
     * @param {object} options - mkdir options (default: { recursive: true })
     */
    createDirectory(dirPath, options = { recursive: true }) {
        try {
            const validatedPath = PathValidator.validatePath(dirPath);
            if (!fs.existsSync(validatedPath)) {
                fs.mkdirSync(validatedPath, options);
            }
        } catch (error) {
            throw new Error(`Failed to create directory ${dirPath}: ${error.message}`);
        }
    }

    /**
     * List directory contents safely using PathValidator
     * @param {string} dirPath - Directory path to list
     * @param {object} options - readdir options (default: {})
     * @returns {Array} Directory contents
     */
    listDirectory(dirPath, options = {}) {
        try {
            return PathValidator.safeReaddirSync(dirPath, options);
        } catch (error) {
            throw new Error(`Failed to list directory ${dirPath}: ${error.message}`);
        }
    }

    /**
     * Move file from source to destination
     * @param {string} source - Source file path
     * @param {string} destination - Destination file path
     */
    moveFile(source, destination) {
        try {
            const sourceValidated = PathValidator.validatePath(source);
            const destValidated = PathValidator.validatePath(destination);

            // Read source file
            const content = PathValidator.safeReadFileSync(sourceValidated);

            // Write to destination
            PathValidator.safeWriteFileSync(destValidated, content);

            // Delete source file
            PathValidator.safeUnlinkSync(sourceValidated);
        } catch (error) {
            throw new Error(`Failed to move file from ${source} to ${destination}: ${error.message}`);
        }
    }

    /**
     * Copy file from source to destination
     * @param {string} source - Source file path
     * @param {string} destination - Destination file path
     */
    copyFile(source, destination) {
        try {
            const sourceValidated = PathValidator.validatePath(source);
            const destValidated = PathValidator.validatePath(destination);

            // Read source file
            const content = PathValidator.safeReadFileSync(sourceValidated);

            // Write to destination
            PathValidator.safeWriteFileSync(destValidated, content);
        } catch (error) {
            throw new Error(`Failed to copy file from ${source} to ${destination}: ${error.message}`);
        }
    }

    /**
     * Handle file upload using configured Multer instance
     * @returns {multer} Configured upload middleware
     */
    getUploadMiddleware() {
        return this.upload;
    }

    /**
     * Process uploaded file and clean up temporary file
     * @param {object} file - Multer file object
     * @param {boolean} keepOriginal - Whether to keep the original uploaded file
     * @returns {object} File processing result
     */
    handleUpload(file, keepOriginal = false) {
        try {
            if (!file) {
                throw new Error("No file provided");
            }

            const result = {
                originalName: file.originalname,
                fileName: file.filename,
                path: file.path,
                size: file.size,
                mimetype: file.mimetype
            };

            // Clean up temporary file if not keeping original
            if (!keepOriginal) {
                // Note: File cleanup should be handled by calling code after processing
                result.cleanup = () => this.cleanupUploadedFile(file.path);
            }

            return result;
        } catch (error) {
            throw new Error(`Failed to handle upload: ${error.message}`);
        }
    }

    /**
     * Clean up uploaded temporary file
     * @param {string} filePath - Path to temporary file
     */
    cleanupUploadedFile(filePath) {
        try {
            if (filePath && this.fileExists(filePath)) {
                this.deleteFile(filePath);
            }
        } catch (error) {
            console.error("Error cleaning up uploaded file:", error);
        }
    }

    /**
     * Process CSV file using PapaParse
     * @param {string} filePath - Path to CSV file
     * @param {object} options - PapaParse options
     * @returns {Promise} Promise resolving to parsed CSV data
     */
    processCSV(filePath, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                const csvData = this.readFile(filePath, "utf8");

                const defaultOptions = {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        // Filter out empty rows
                        const filteredData = results.data.filter(row =>
                            Object.values(row).some(val => val && val.toString().trim())
                        );
                        resolve({
                            data: filteredData,
                            meta: results.meta,
                            errors: results.errors
                        });
                    },
                    error: (error) => {
                        reject(new Error(`CSV parsing failed: ${error.message}`));
                    }
                };

                const parseOptions = { ...defaultOptions, ...options };
                Papa.parse(csvData, parseOptions);
            } catch (error) {
                reject(new Error(`Failed to process CSV file ${filePath}: ${error.message}`));
            }
        });
    }

    /**
     * Parse CSV with streaming for large files
     * @param {string} filePath - Path to CSV file
     * @param {function} chunkCallback - Callback for each chunk of data
     * @param {object} options - PapaParse options
     * @returns {Promise} Promise resolving when parsing is complete
     */
    processLargeCSV(filePath, chunkCallback, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                const stream = fs.createReadStream(PathValidator.validatePath(filePath));

                const defaultOptions = {
                    header: true,
                    skipEmptyLines: true,
                    chunk: (results, parser) => {
                        try {
                            // Filter out empty rows
                            const filteredData = results.data.filter(row =>
                                Object.values(row).some(val => val && val.toString().trim())
                            );

                            if (filteredData.length > 0) {
                                chunkCallback(filteredData, results.meta);
                            }
                        } catch (error) {
                            parser.abort();
                            reject(error);
                        }
                    },
                    complete: () => {
                        resolve();
                    },
                    error: (error) => {
                        reject(new Error(`Large CSV parsing failed: ${error.message}`));
                    }
                };

                const parseOptions = { ...defaultOptions, ...options };
                Papa.parse(stream, parseOptions);
            } catch (error) {
                reject(new Error(`Failed to process large CSV file ${filePath}: ${error.message}`));
            }
        });
    }

    /**
     * Create backup file with timestamp
     * @param {object} data - Data to backup
     * @param {string} type - Backup type (vulnerabilities, tickets, all)
     * @param {string} format - Format (json, csv)
     * @returns {string} Backup file path
     */
    createBackup(data, type, format = "json") {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const fileName = `${type}-backup-${timestamp}.${format}`;
            const backupDir = "backups";

            // Ensure backup directory exists
            this.createDirectory(backupDir);

            const filePath = path.join(backupDir, fileName);

            if (format === "json") {
                this.writeFile(filePath, JSON.stringify(data, null, 2));
            } else if (format === "csv") {
                // Convert data to CSV format
                const csv = Papa.unparse(data);
                this.writeFile(filePath, csv);
            } else {
                throw new Error(`Unsupported backup format: ${format}`);
            }

            return filePath;
        } catch (error) {
            throw new Error(`Failed to create backup: ${error.message}`);
        }
    }

    /**
     * Restore data from backup file
     * @param {string} filePath - Path to backup file
     * @returns {object} Restored data
     */
    restoreFromBackup(filePath) {
        try {
            const fileExtension = path.extname(filePath).toLowerCase();

            if (fileExtension === ".json") {
                const content = this.readFile(filePath);
                return JSON.parse(content);
            } else if (fileExtension === ".csv") {
                // For CSV files, use processCSV method
                return this.processCSV(filePath);
            } else {
                throw new Error(`Unsupported backup file format: ${fileExtension}`);
            }
        } catch (error) {
            throw new Error(`Failed to restore from backup ${filePath}: ${error.message}`);
        }
    }

    /**
     * Get temporary file path with unique name
     * @param {string} prefix - File prefix
     * @param {string} extension - File extension
     * @returns {string} Temporary file path
     */
    getTempFilePath(prefix = "temp", extension = "tmp") {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2);
        const fileName = `${prefix}-${timestamp}-${random}.${extension}`;
        return path.join("uploads", fileName);
    }

    /**
     * Clean up temporary files older than specified age
     * @param {string} directory - Directory to clean
     * @param {number} maxAge - Maximum age in milliseconds (default: 1 hour)
     */
    cleanupTempFiles(directory = "uploads", maxAge = 60 * 60 * 1000) {
        try {
            const files = this.listDirectory(directory, { withFileTypes: true });
            const now = Date.now();

            for (const file of files) {
                if (file.isFile()) {
                    const filePath = path.join(directory, file.name);
                    const stats = this.getFileStats(filePath);

                    if (now - stats.mtime.getTime() > maxAge) {
                        this.deleteFile(filePath);
                        console.log(`Cleaned up temporary file: ${filePath}`);
                    }
                }
            }
        } catch (error) {
            console.error(`Failed to cleanup temp files in ${directory}:`, error);
        }
    }

    /**
     * Validate file type by extension and mimetype
     * @param {object} file - File object with originalname and mimetype
     * @param {Array} allowedExtensions - Allowed file extensions
     * @param {Array} allowedMimeTypes - Allowed MIME types
     * @returns {boolean} True if file type is valid
     */
    validateFileType(file, allowedExtensions = [], allowedMimeTypes = []) {
        if (!file || !file.originalname) {
            return false;
        }

        const extension = path.extname(file.originalname).toLowerCase();
        const mimetype = file.mimetype;

        const extensionValid = allowedExtensions.length === 0 || allowedExtensions.includes(extension);
        const mimetypeValid = allowedMimeTypes.length === 0 || allowedMimeTypes.includes(mimetype);

        return extensionValid && mimetypeValid;
    }

    /**
     * Get file size in human readable format
     * @param {number} bytes - File size in bytes
     * @returns {string} Human readable file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) {return "0 Bytes";}

        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }
}

module.exports = FileService;