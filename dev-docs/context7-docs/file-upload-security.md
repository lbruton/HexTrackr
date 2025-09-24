# File Upload Security Guide for HexTrackr

## Table of Contents

- [Overview](#overview)
- [Multer Configuration](#multer-configuration)
- [File Validation & Security](#file-validation--security)
- [Storage Security](#storage-security)
- [Virus Scanning](#virus-scanning)
- [Content Analysis](#content-analysis)
- [Error Handling](#error-handling)
- [Performance Optimization](#performance-optimization)
- [HexTrackr-Specific Implementation](#hextrackr-specific-implementation)

## Overview

File upload functionality is a common attack vector. This guide covers comprehensive security measures for handling file uploads in HexTrackr, specifically for CSV vulnerability data imports and backup file operations.

## Multer Configuration

### Basic Secure Configuration

```javascript
const multer = require('multer')
const path = require('path')
const crypto = require('crypto')
const fs = require('fs')

// Secure multer configuration for HexTrackr
const createSecureUpload = (options = {}) => {
  const {
    destination = './uploads',
    maxFileSize = 50 * 1024 * 1024, // 50MB
    allowedMimeTypes = ['text/csv', 'text/plain', 'application/csv'],
    allowedExtensions = ['.csv', '.txt'],
    maxFiles = 1
  } = options

  // Ensure upload directory exists with proper permissions
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true, mode: 0o700 })
  }

  const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, destination)
    },
    filename: (req, file, callback) => {
      // Generate cryptographically secure filename
      const uniqueId = crypto.randomUUID()
      const timestamp = Date.now()
      const extension = path.extname(file.originalname).toLowerCase()

      const filename = `upload_${timestamp}_${uniqueId}${extension}`
      callback(null, filename)
    }
  })

  const fileFilter = (req, file, callback) => {
    try {
      // Validate file extension
      const extension = path.extname(file.originalname).toLowerCase()
      if (!allowedExtensions.includes(extension)) {
        return callback(new Error(`File extension ${extension} not allowed`))
      }

      // Validate MIME type
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return callback(new Error(`MIME type ${file.mimetype} not allowed`))
      }

      // Additional filename validation
      if (!isValidFilename(file.originalname)) {
        return callback(new Error('Invalid filename'))
      }

      callback(null, true)
    } catch (error) {
      callback(error)
    }
  }

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxFileSize,
      files: maxFiles,
      fields: 10, // Limit form fields
      fieldSize: 1024 * 1024, // 1MB per field
      parts: 20 // Total parts limit
    }
  })
}

// Filename validation helper
const isValidFilename = (filename) => {
  // Reject dangerous characters and patterns
  const dangerousPatterns = [
    /\.\./,           // Path traversal
    /[<>:"|?*]/,      // Windows invalid chars
    /^\./,            // Hidden files
    /\s$/,            // Trailing space
    /\.$/,            // Trailing dot
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i, // Windows reserved names
    /[\x00-\x1f]/     // Control characters
  ]

  return !dangerousPatterns.some(pattern => pattern.test(filename)) &&
         filename.length <= 255 &&
         filename.length > 0
}

module.exports = { createSecureUpload, isValidFilename }
```

### Environment-Specific Configuration

```javascript
class UploadConfigManager {
  static getConfig(environment = process.env.NODE_ENV) {
    const baseConfig = {
      destination: path.join(process.cwd(), 'uploads'),
      maxFiles: 1,
      allowedExtensions: ['.csv', '.txt'],
      allowedMimeTypes: ['text/csv', 'text/plain', 'application/csv']
    }

    switch (environment) {
      case 'production':
        return {
          ...baseConfig,
          maxFileSize: 100 * 1024 * 1024, // 100MB in production
          virusScanEnabled: true,
          contentValidationStrict: true,
          backupUploadsEnabled: true
        }

      case 'development':
        return {
          ...baseConfig,
          maxFileSize: 50 * 1024 * 1024, // 50MB in development
          virusScanEnabled: false,
          contentValidationStrict: false,
          debugMode: true
        }

      case 'test':
        return {
          ...baseConfig,
          destination: './test-uploads',
          maxFileSize: 10 * 1024 * 1024, // 10MB for tests
          virusScanEnabled: false
        }

      default:
        return baseConfig
    }
  }

  static validateConfig(config) {
    const required = ['destination', 'maxFileSize', 'allowedExtensions']
    const missing = required.filter(key => !config[key])

    if (missing.length > 0) {
      throw new Error(`Missing upload configuration: ${missing.join(', ')}`)
    }

    // Ensure destination directory is secure
    if (!path.isAbsolute(config.destination)) {
      config.destination = path.resolve(config.destination)
    }

    return config
  }
}
```

## File Validation & Security

### Comprehensive File Validation

```javascript
const { createHash } = require('crypto')
const { promisify } = require('util')
const { exec } = require('child_process')
const execPromise = promisify(exec)

class FileValidator {
  constructor(options = {}) {
    this.maxFileSize = options.maxFileSize || 50 * 1024 * 1024
    this.allowedSignatures = {
      'text/csv': [
        [0x2C], // Comma (CSV files often start with comma)
        [0x22], // Quote (CSV with quoted fields)
        [0x54, 0x69, 0x74, 0x6C, 0x65], // "Title" (common CSV header)
        // Allow any ASCII text
      }
    }
  }

  async validateFile(filePath, originalName, mimetype) {
    const validations = [
      () => this.validateFileExists(filePath),
      () => this.validateFileSize(filePath),
      () => this.validateFileSignature(filePath, mimetype),
      () => this.validateFileContent(filePath, mimetype),
      () => this.validateFilename(originalName),
      () => this.checkForMaliciousContent(filePath)
    ]

    for (const validation of validations) {
      const result = await validation()
      if (!result.valid) {
        throw new Error(result.error)
      }
    }

    return {
      valid: true,
      fileHash: await this.calculateFileHash(filePath),
      fileSize: fs.statSync(filePath).size
    }
  }

  validateFileExists(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return { valid: false, error: 'File does not exist' }
      }
      return { valid: true }
    } catch (error) {
      return { valid: false, error: 'File access error' }
    }
  }

  validateFileSize(filePath) {
    try {
      const stats = fs.statSync(filePath)

      if (stats.size === 0) {
        return { valid: false, error: 'File is empty' }
      }

      if (stats.size > this.maxFileSize) {
        return { valid: false, error: `File too large: ${stats.size} bytes` }
      }

      return { valid: true }
    } catch (error) {
      return { valid: false, error: 'Cannot read file stats' }
    }
  }

  async validateFileSignature(filePath, mimetype) {
    try {
      const buffer = Buffer.alloc(512) // Read first 512 bytes
      const fd = fs.openSync(filePath, 'r')
      const bytesRead = fs.readSync(fd, buffer, 0, 512, 0)
      fs.closeSync(fd)

      if (bytesRead === 0) {
        return { valid: false, error: 'Cannot read file signature' }
      }

      // For CSV files, check for text content
      if (mimetype === 'text/csv' || mimetype === 'text/plain') {
        // Check if content is valid UTF-8 text
        try {
          const content = buffer.subarray(0, bytesRead).toString('utf-8')

          // Check for binary content indicators
          if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\xFF]/.test(content)) {
            return { valid: false, error: 'File contains binary data' }
          }

          return { valid: true }
        } catch (error) {
          return { valid: false, error: 'File is not valid UTF-8 text' }
        }
      }

      return { valid: true }
    } catch (error) {
      return { valid: false, error: 'File signature validation failed' }
    }
  }

  async validateFileContent(filePath, mimetype) {
    if (mimetype !== 'text/csv' && mimetype !== 'text/plain') {
      return { valid: true } // Skip content validation for non-CSV files
    }

    try {
      // Read first few lines to validate CSV structure
      const stream = fs.createReadStream(filePath, {
        encoding: 'utf8',
        start: 0,
        end: 4096 // Read first 4KB
      })

      let content = ''

      return new Promise((resolve) => {
        stream.on('data', (chunk) => {
          content += chunk
        })

        stream.on('end', () => {
          try {
            const lines = content.split('\n').slice(0, 10) // Check first 10 lines

            // Basic CSV validation
            if (lines.length === 0) {
              resolve({ valid: false, error: 'File appears to be empty' })
              return
            }

            // Check for consistent column count (basic CSV validation)
            const firstLineColumns = lines[0].split(',').length
            const hasConsistentColumns = lines.slice(1).every(line => {
              const columns = line.split(',').length
              return columns === firstLineColumns || line.trim() === ''
            })

            if (!hasConsistentColumns) {
              resolve({ valid: false, error: 'Inconsistent CSV column structure' })
              return
            }

            // Check for reasonable column count
            if (firstLineColumns > 50) {
              resolve({ valid: false, error: 'Too many columns in CSV file' })
              return
            }

            resolve({ valid: true })
          } catch (error) {
            resolve({ valid: false, error: 'CSV content validation failed' })
          }
        })

        stream.on('error', () => {
          resolve({ valid: false, error: 'Cannot read file content' })
        })
      })
    } catch (error) {
      return { valid: false, error: 'Content validation error' }
    }
  }

  validateFilename(filename) {
    const validationRules = [
      {
        test: (name) => name && name.length > 0,
        error: 'Filename cannot be empty'
      },
      {
        test: (name) => name.length <= 255,
        error: 'Filename too long'
      },
      {
        test: (name) => !/\.\./.test(name),
        error: 'Filename contains path traversal'
      },
      {
        test: (name) => !/[<>:"|?*\x00-\x1f]/.test(name),
        error: 'Filename contains invalid characters'
      },
      {
        test: (name) => !name.startsWith('.'),
        error: 'Hidden files not allowed'
      },
      {
        test: (name) => !/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i.test(name),
        error: 'Reserved filename not allowed'
      }
    ]

    for (const rule of validationRules) {
      if (!rule.test(filename)) {
        return { valid: false, error: rule.error }
      }
    }

    return { valid: true }
  }

  async checkForMaliciousContent(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')

      // Check for suspicious patterns
      const maliciousPatterns = [
        /<script/i,
        /javascript:/i,
        /vbscript:/i,
        /data:.*base64/i,
        /eval\(/i,
        /document\.cookie/i,
        /window\.location/i,
        /__import__/i, // Python import
        /exec\(/i,
        /system\(/i,
        /shell_exec/i,
        /passthru/i
      ]

      for (const pattern of maliciousPatterns) {
        if (pattern.test(content)) {
          return {
            valid: false,
            error: `Potentially malicious content detected: ${pattern.source}`
          }
        }
      }

      // Check for excessive special characters (potential binary content)
      const specialCharCount = (content.match(/[^\w\s\-.,;:'"()[\]{}\n\r\t]/g) || []).length
      const specialCharRatio = specialCharCount / content.length

      if (specialCharRatio > 0.1) { // More than 10% special characters
        return {
          valid: false,
          error: 'File contains excessive special characters'
        }
      }

      return { valid: true }
    } catch (error) {
      return { valid: false, error: 'Cannot scan file for malicious content' }
    }
  }

  async calculateFileHash(filePath) {
    try {
      const fileContent = fs.readFileSync(filePath)
      return createHash('sha256').update(fileContent).digest('hex')
    } catch (error) {
      throw new Error('Cannot calculate file hash')
    }
  }
}
```

## Storage Security

### Secure File Storage Management

```javascript
const path = require('path')
const fs = require('fs').promises

class SecureFileStorage {
  constructor(baseDir = './uploads') {
    this.baseDir = path.resolve(baseDir)
    this.quarantineDir = path.join(this.baseDir, 'quarantine')
    this.processedDir = path.join(this.baseDir, 'processed')
    this.tempDir = path.join(this.baseDir, 'temp')

    this.initializeDirs()
  }

  async initializeDirs() {
    const dirs = [this.baseDir, this.quarantineDir, this.processedDir, this.tempDir]

    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true, mode: 0o700 })
        console.log(`Created/verified directory: ${dir}`)
      } catch (error) {
        console.error(`Failed to create directory ${dir}:`, error)
        throw error
      }
    }
  }

  // Secure file path resolution
  resolveSecurePath(filename, subDir = '') {
    const fullPath = path.resolve(this.baseDir, subDir, filename)

    // Prevent path traversal
    if (!fullPath.startsWith(this.baseDir)) {
      throw new Error('Path traversal attempt detected')
    }

    return fullPath
  }

  // Move file to quarantine
  async quarantineFile(filePath, reason) {
    try {
      const filename = path.basename(filePath)
      const quarantinePath = this.resolveSecurePath(`${Date.now()}_${filename}`, 'quarantine')

      await fs.rename(filePath, quarantinePath)

      // Log quarantine action
      console.warn('File quarantined:', {
        originalPath: filePath,
        quarantinePath,
        reason,
        timestamp: new Date().toISOString()
      })

      return quarantinePath
    } catch (error) {
      console.error('Failed to quarantine file:', error)
      throw error
    }
  }

  // Move processed file to archive
  async archiveFile(filePath) {
    try {
      const filename = path.basename(filePath)
      const archivePath = this.resolveSecurePath(`${Date.now()}_${filename}`, 'processed')

      await fs.rename(filePath, archivePath)
      console.log(`File archived: ${archivePath}`)

      return archivePath
    } catch (error) {
      console.error('Failed to archive file:', error)
      throw error
    }
  }

  // Secure file deletion
  async secureDelete(filePath) {
    try {
      // Verify file is within allowed directory
      const resolvedPath = path.resolve(filePath)
      if (!resolvedPath.startsWith(this.baseDir)) {
        throw new Error('Cannot delete file outside upload directory')
      }

      // Overwrite file before deletion (basic security)
      const stats = await fs.stat(filePath)
      const fileSize = stats.size

      // Overwrite with random data
      const randomData = Buffer.alloc(fileSize).fill(Math.random() * 255)
      await fs.writeFile(filePath, randomData)

      // Delete the file
      await fs.unlink(filePath)
      console.log(`File securely deleted: ${filePath}`)
    } catch (error) {
      console.error('Secure deletion failed:', error)
      throw error
    }
  }

  // Cleanup old files
  async cleanupOldFiles(maxAge = 24 * 60 * 60 * 1000) { // 24 hours default
    const dirs = [this.tempDir, this.quarantineDir, this.processedDir]

    for (const dir of dirs) {
      try {
        const files = await fs.readdir(dir)

        for (const file of files) {
          const filePath = path.join(dir, file)
          const stats = await fs.stat(filePath)
          const age = Date.now() - stats.mtime.getTime()

          if (age > maxAge) {
            await this.secureDelete(filePath)
            console.log(`Cleaned up old file: ${filePath}`)
          }
        }
      } catch (error) {
        console.error(`Cleanup failed for directory ${dir}:`, error)
      }
    }
  }

  // Get storage statistics
  async getStorageStats() {
    const stats = {}
    const dirs = ['uploads', 'quarantine', 'processed', 'temp']

    for (const dirName of dirs) {
      const dirPath = dirName === 'uploads' ? this.baseDir : path.join(this.baseDir, dirName)

      try {
        const files = await fs.readdir(dirPath)
        let totalSize = 0

        for (const file of files) {
          const filePath = path.join(dirPath, file)
          const fileStats = await fs.stat(filePath)
          if (fileStats.isFile()) {
            totalSize += fileStats.size
          }
        }

        stats[dirName] = {
          fileCount: files.length,
          totalSize,
          totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100
        }
      } catch (error) {
        stats[dirName] = { error: error.message }
      }
    }

    return stats
  }
}
```

## Virus Scanning

### ClamAV Integration

```javascript
const { spawn } = require('child_process')
const { promisify } = require('util')

class VirusScanner {
  constructor(options = {}) {
    this.enabled = options.enabled !== false
    this.clamScanPath = options.clamScanPath || 'clamscan'
    this.timeout = options.timeout || 30000 // 30 seconds
    this.quarantineOnDetection = options.quarantineOnDetection !== false
  }

  async isAvailable() {
    if (!this.enabled) return false

    try {
      const result = await this.executeCommand([this.clamScanPath, '--version'])
      return result.exitCode === 0
    } catch (error) {
      console.warn('ClamAV not available:', error.message)
      return false
    }
  }

  async scanFile(filePath) {
    if (!this.enabled || !(await this.isAvailable())) {
      return {
        scanned: false,
        clean: true,
        message: 'Virus scanning disabled or unavailable'
      }
    }

    try {
      const result = await this.executeCommand([
        this.clamScanPath,
        '--no-summary',
        '--infected', // Only show infected files
        filePath
      ])

      if (result.exitCode === 0) {
        return {
          scanned: true,
          clean: true,
          message: 'File is clean'
        }
      } else if (result.exitCode === 1) {
        // Virus detected
        const virusName = this.extractVirusName(result.stderr || result.stdout)

        return {
          scanned: true,
          clean: false,
          virus: virusName,
          message: `Virus detected: ${virusName}`
        }
      } else {
        throw new Error(`ClamAV scan failed with exit code ${result.exitCode}`)
      }
    } catch (error) {
      console.error('Virus scan failed:', error)
      return {
        scanned: false,
        clean: false,
        error: error.message,
        message: 'Virus scan failed'
      }
    }
  }

  async scanFileStream(filePath) {
    // For large files, use stream scanning
    if (!this.enabled || !(await this.isAvailable())) {
      return { scanned: false, clean: true }
    }

    return new Promise((resolve) => {
      const scanner = spawn(this.clamScanPath, ['--stream'], {
        stdio: ['pipe', 'pipe', 'pipe']
      })

      let output = ''
      let errorOutput = ''

      scanner.stdout.on('data', (data) => {
        output += data.toString()
      })

      scanner.stderr.on('data', (data) => {
        errorOutput += data.toString()
      })

      scanner.on('close', (code) => {
        if (code === 0) {
          resolve({
            scanned: true,
            clean: true,
            message: 'File is clean'
          })
        } else if (code === 1) {
          const virusName = this.extractVirusName(output)
          resolve({
            scanned: true,
            clean: false,
            virus: virusName,
            message: `Virus detected: ${virusName}`
          })
        } else {
          resolve({
            scanned: false,
            clean: false,
            error: errorOutput,
            message: 'Virus scan failed'
          })
        }
      })

      scanner.on('error', (error) => {
        resolve({
          scanned: false,
          clean: false,
          error: error.message,
          message: 'Virus scan error'
        })
      })

      // Send file content to scanner
      const fileStream = fs.createReadStream(filePath)
      fileStream.pipe(scanner.stdin)
    })
  }

  executeCommand(args) {
    return new Promise((resolve, reject) => {
      const process = spawn(args[0], args.slice(1), {
        timeout: this.timeout
      })

      let stdout = ''
      let stderr = ''

      process.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      process.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      process.on('close', (exitCode) => {
        resolve({
          exitCode,
          stdout,
          stderr
        })
      })

      process.on('error', reject)
    })
  }

  extractVirusName(output) {
    // Extract virus name from ClamAV output
    const match = output.match(/:\s*([^:]+)\s+FOUND/)
    return match ? match[1] : 'Unknown virus'
  }
}

// Usage in upload middleware
const virusScanner = new VirusScanner({
  enabled: process.env.NODE_ENV === 'production'
})

const scanUploadMiddleware = async (req, res, next) => {
  if (!req.file) {
    return next()
  }

  try {
    const scanResult = await virusScanner.scanFile(req.file.path)

    if (!scanResult.clean) {
      // Quarantine the file
      await secureStorage.quarantineFile(req.file.path, scanResult.message)

      return res.status(400).json({
        error: 'File Upload Rejected',
        message: 'File failed security scan',
        details: scanResult.message
      })
    }

    // Attach scan result to request
    req.file.virusScan = scanResult
    next()
  } catch (error) {
    console.error('Virus scan middleware error:', error)

    // In production, reject on scan failure for security
    if (process.env.NODE_ENV === 'production') {
      return res.status(500).json({
        error: 'Security Scan Failed',
        message: 'Unable to verify file security'
      })
    }

    next()
  }
}
```

## Content Analysis

### CSV Content Validation

```javascript
const csv = require('csv-parser')
const { Transform } = require('stream')

class CSVContentAnalyzer {
  constructor(options = {}) {
    this.maxRows = options.maxRows || 100000
    this.maxColumns = options.maxColumns || 50
    this.requiredColumns = options.requiredColumns || []
    this.allowedColumns = options.allowedColumns || null
    this.maxCellLength = options.maxCellLength || 10000
  }

  async analyzeCSV(filePath) {
    return new Promise((resolve, reject) => {
      const results = {
        valid: true,
        errors: [],
        warnings: [],
        stats: {
          totalRows: 0,
          totalColumns: 0,
          columns: [],
          sampleData: []
        }
      }

      let headerProcessed = false
      let rowCount = 0

      const stream = fs.createReadStream(filePath)
        .pipe(csv({ skipEmptyLines: true }))
        .pipe(new Transform({
          objectMode: true,
          transform: (row, encoding, callback) => {
            try {
              // Process header
              if (!headerProcessed) {
                const columns = Object.keys(row)
                results.stats.columns = columns
                results.stats.totalColumns = columns.length

                // Validate column count
                if (columns.length > this.maxColumns) {
                  results.valid = false
                  results.errors.push(`Too many columns: ${columns.length} (max: ${this.maxColumns})`)
                }

                // Check required columns
                const missingColumns = this.requiredColumns.filter(col => !columns.includes(col))
                if (missingColumns.length > 0) {
                  results.valid = false
                  results.errors.push(`Missing required columns: ${missingColumns.join(', ')}`)
                }

                // Check allowed columns
                if (this.allowedColumns) {
                  const invalidColumns = columns.filter(col => !this.allowedColumns.includes(col))
                  if (invalidColumns.length > 0) {
                    results.warnings.push(`Unexpected columns: ${invalidColumns.join(', ')}`)
                  }
                }

                headerProcessed = true
              }

              // Validate row data
              rowCount++
              results.stats.totalRows = rowCount

              // Check row limit
              if (rowCount > this.maxRows) {
                results.valid = false
                results.errors.push(`Too many rows: ${rowCount} (max: ${this.maxRows})`)
                return callback()
              }

              // Validate cell content
              for (const [column, value] of Object.entries(row)) {
                if (typeof value === 'string') {
                  // Check cell length
                  if (value.length > this.maxCellLength) {
                    results.warnings.push(`Cell too long in column '${column}' at row ${rowCount}`)
                  }

                  // Check for suspicious content
                  if (this.hasSuspiciousContent(value)) {
                    results.warnings.push(`Suspicious content in column '${column}' at row ${rowCount}`)
                  }
                }
              }

              // Store sample data (first 10 rows)
              if (rowCount <= 10) {
                results.stats.sampleData.push({ ...row })
              }

              callback(null, row)
            } catch (error) {
              results.valid = false
              results.errors.push(`Row processing error at line ${rowCount}: ${error.message}`)
              callback()
            }
          }
        }))

      stream.on('end', () => {
        resolve(results)
      })

      stream.on('error', (error) => {
        results.valid = false
        results.errors.push(`CSV parsing error: ${error.message}`)
        resolve(results)
      })
    })
  }

  hasSuspiciousContent(content) {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /data:.*base64/i,
      /eval\(/i,
      /exec\(/i,
      /system\(/i,
      /\${.*}/,  // Template injection
      /\[\[.*\]\]/, // Template injection
      /{{.*}}/ // Template injection
    ]

    return suspiciousPatterns.some(pattern => pattern.test(content))
  }

  // Validate specific HexTrackr vulnerability data
  validateVulnerabilityData(row, rowNumber) {
    const errors = []
    const warnings = []

    // Validate severity
    if (row.severity) {
      const validSeverities = ['Critical', 'High', 'Medium', 'Low']
      if (!validSeverities.includes(row.severity)) {
        warnings.push(`Invalid severity '${row.severity}' at row ${rowNumber}`)
      }
    }

    // Validate VPR score
    if (row.vpr_score) {
      const score = parseFloat(row.vpr_score)
      if (isNaN(score) || score < 0 || score > 10) {
        warnings.push(`Invalid VPR score '${row.vpr_score}' at row ${rowNumber}`)
      }
    }

    // Validate IP address
    if (row.ip_address && !this.isValidIP(row.ip_address)) {
      warnings.push(`Invalid IP address '${row.ip_address}' at row ${rowNumber}`)
    }

    // Validate port
    if (row.port) {
      const port = parseInt(row.port)
      if (isNaN(port) || port < 1 || port > 65535) {
        warnings.push(`Invalid port '${row.port}' at row ${rowNumber}`)
      }
    }

    // Validate dates
    if (row.scan_date && !this.isValidDate(row.scan_date)) {
      warnings.push(`Invalid scan date '${row.scan_date}' at row ${rowNumber}`)
    }

    return { errors, warnings }
  }

  isValidIP(ip) {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/

    return ipv4Regex.test(ip) || ipv6Regex.test(ip)
  }

  isValidDate(dateString) {
    const date = new Date(dateString)
    return !isNaN(date.getTime()) && date.getFullYear() > 1900
  }
}
```

## Error Handling

### Comprehensive Upload Error Handling

```javascript
class UploadErrorHandler {
  static handleMulterError(error, req, res, next) {
    console.error('Multer error:', error)

    // Cleanup uploaded file if it exists
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (unlinkError) => {
        if (unlinkError) {
          console.error('Failed to cleanup uploaded file:', unlinkError)
        }
      })
    }

    let statusCode = 400
    let message = 'File upload error'
    let details = null

    if (error instanceof multer.MulterError) {
      switch (error.code) {
        case 'LIMIT_FILE_SIZE':
          message = 'File too large'
          details = `Maximum file size is ${req.fileUploadConfig?.maxFileSize || '50MB'}`
          break
        case 'LIMIT_FILE_COUNT':
          message = 'Too many files'
          details = 'Only one file allowed per upload'
          break
        case 'LIMIT_FIELD_COUNT':
          message = 'Too many form fields'
          break
        case 'LIMIT_FIELD_KEY':
          message = 'Field name too long'
          break
        case 'LIMIT_FIELD_VALUE':
          message = 'Field value too long'
          break
        case 'LIMIT_UNEXPECTED_FILE':
          message = 'Unexpected file field'
          details = 'File uploaded to unexpected field'
          break
        default:
          message = 'File upload error'
          details = error.message
      }
    } else if (error.message.includes('File extension')) {
      message = 'Invalid file type'
      details = 'Only CSV files are allowed'
    } else if (error.message.includes('MIME type')) {
      message = 'Invalid file format'
      details = 'File format not recognized as CSV'
    } else if (error.message.includes('Invalid filename')) {
      message = 'Invalid filename'
      details = 'Filename contains invalid characters'
    } else {
      statusCode = 500
      message = 'Upload processing failed'
      details = process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }

    res.status(statusCode).json({
      error: message,
      details,
      timestamp: new Date().toISOString()
    })
  }

  static handleValidationError(error, req, res, next) {
    console.error('File validation error:', error)

    // Cleanup file
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {})
    }

    res.status(400).json({
      error: 'File validation failed',
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }

  static handleVirusScanError(error, req, res, next) {
    console.error('Virus scan error:', error)

    // Quarantine file on scan error in production
    if (req.file && req.file.path) {
      if (process.env.NODE_ENV === 'production') {
        secureStorage.quarantineFile(req.file.path, 'Virus scan failed')
          .catch(console.error)
      } else {
        fs.unlink(req.file.path, () => {})
      }
    }

    const statusCode = process.env.NODE_ENV === 'production' ? 500 : 400

    res.status(statusCode).json({
      error: 'Security scan failed',
      message: 'Unable to verify file security',
      timestamp: new Date().toISOString()
    })
  }

  // Generic upload error wrapper
  static wrapUploadHandler(handler) {
    return async (req, res, next) => {
      try {
        await handler(req, res, next)
      } catch (error) {
        // Determine error type and handle appropriately
        if (error instanceof multer.MulterError) {
          return UploadErrorHandler.handleMulterError(error, req, res, next)
        } else if (error.message.includes('validation')) {
          return UploadErrorHandler.handleValidationError(error, req, res, next)
        } else if (error.message.includes('virus') || error.message.includes('scan')) {
          return UploadErrorHandler.handleVirusScanError(error, req, res, next)
        } else {
          // Generic error handler
          console.error('Upload handler error:', error)

          // Cleanup file
          if (req.file && req.file.path) {
            fs.unlink(req.file.path, () => {})
          }

          res.status(500).json({
            error: 'Upload processing failed',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
            timestamp: new Date().toISOString()
          })
        }
      }
    }
  }
}
```

## Performance Optimization

### Streaming and Memory Management

```javascript
class OptimizedUploadProcessor {
  constructor() {
    this.processingQueue = []
    this.maxConcurrentUploads = 3
    this.currentProcessing = 0
  }

  // Stream-based file processing for large files
  async processLargeCSV(filePath, options = {}) {
    const {
      batchSize = 1000,
      progressCallback = null,
      validateRows = true
    } = options

    return new Promise((resolve, reject) => {
      const results = {
        processed: 0,
        errors: 0,
        warnings: [],
        startTime: Date.now()
      }

      let currentBatch = []
      let rowCount = 0

      const processStream = fs.createReadStream(filePath)
        .pipe(csv({ skipEmptyLines: true }))
        .pipe(new Transform({
          objectMode: true,
          transform: async (row, encoding, callback) => {
            try {
              rowCount++

              if (validateRows) {
                const validation = this.validateRow(row, rowCount)
                if (validation.errors.length > 0) {
                  results.errors++
                  results.warnings.push(...validation.errors)
                }
              }

              currentBatch.push(row)

              if (currentBatch.length >= batchSize) {
                processStream.pause()

                try {
                  await this.processBatch(currentBatch)
                  results.processed += currentBatch.length
                  currentBatch = []

                  if (progressCallback) {
                    progressCallback({
                      processed: results.processed,
                      errors: results.errors,
                      percentage: Math.round((results.processed / rowCount) * 100)
                    })
                  }

                  processStream.resume()
                } catch (error) {
                  return callback(error)
                }
              }

              callback()
            } catch (error) {
              results.errors++
              callback() // Continue processing other rows
            }
          }
        }))

      processStream.on('end', async () => {
        try {
          // Process remaining batch
          if (currentBatch.length > 0) {
            await this.processBatch(currentBatch)
            results.processed += currentBatch.length
          }

          results.endTime = Date.now()
          results.duration = results.endTime - results.startTime

          resolve(results)
        } catch (error) {
          reject(error)
        }
      })

      processStream.on('error', reject)
    })
  }

  // Queue management for concurrent uploads
  async queueUpload(uploadFunction) {
    return new Promise((resolve, reject) => {
      this.processingQueue.push({ uploadFunction, resolve, reject })
      this.processQueue()
    })
  }

  async processQueue() {
    if (this.currentProcessing >= this.maxConcurrentUploads || this.processingQueue.length === 0) {
      return
    }

    this.currentProcessing++
    const { uploadFunction, resolve, reject } = this.processingQueue.shift()

    try {
      const result = await uploadFunction()
      resolve(result)
    } catch (error) {
      reject(error)
    } finally {
      this.currentProcessing--
      this.processQueue() // Process next item in queue
    }
  }

  // Memory-efficient batch processing
  async processBatch(batch) {
    // Process batch in chunks to avoid memory issues
    const chunkSize = 100

    for (let i = 0; i < batch.length; i += chunkSize) {
      const chunk = batch.slice(i, i + chunkSize)

      // Process chunk (implementation depends on your needs)
      await this.processChunk(chunk)

      // Force garbage collection hint
      if (global.gc && i % 1000 === 0) {
        global.gc()
      }
    }
  }

  async processChunk(chunk) {
    // Implementation specific to your data processing needs
    // This is where you'd save to database, validate, etc.
    return Promise.resolve()
  }

  validateRow(row, rowNumber) {
    // Implement row validation logic
    return { errors: [], warnings: [] }
  }
}
```

## HexTrackr-Specific Implementation

### Complete Vulnerability Import Handler

```javascript
const express = require('express')
const { createSecureUpload } = require('./secure-upload')
const { FileValidator } = require('./file-validator')
const { VirusScanner } = require('./virus-scanner')
const { CSVContentAnalyzer } = require('./csv-analyzer')
const { SecureFileStorage } = require('./secure-storage')

class HexTrackrUploadHandler {
  constructor(options = {}) {
    this.upload = createSecureUpload({
      destination: './uploads/vulnerabilities',
      maxFileSize: 100 * 1024 * 1024, // 100MB
      allowedExtensions: ['.csv', '.txt'],
      allowedMimeTypes: ['text/csv', 'text/plain', 'application/csv']
    })

    this.fileValidator = new FileValidator()
    this.virusScanner = new VirusScanner({ enabled: process.env.NODE_ENV === 'production' })
    this.csvAnalyzer = new CSVContentAnalyzer({
      maxRows: 500000,
      requiredColumns: ['title', 'severity'],
      allowedColumns: [
        'title', 'severity', 'vpr_score', 'ip_address', 'port',
        'hostname', 'description', 'solution', 'scan_date', 'status'
      ]
    })
    this.storage = new SecureFileStorage('./uploads/vulnerabilities')
  }

  // Main upload endpoint
  handleUpload() {
    return [
      this.upload.single('file'),
      UploadErrorHandler.wrapUploadHandler(this.processUpload.bind(this))
    ]
  }

  async processUpload(req, res) {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a CSV file to upload'
      })
    }

    const uploadId = crypto.randomUUID()
    let processingStage = 'initialization'

    try {
      // Stage 1: File validation
      processingStage = 'file-validation'
      const validationResult = await this.fileValidator.validateFile(
        req.file.path,
        req.file.originalname,
        req.file.mimetype
      )

      // Stage 2: Virus scanning
      processingStage = 'virus-scanning'
      const scanResult = await this.virusScanner.scanFile(req.file.path)

      if (!scanResult.clean) {
        await this.storage.quarantineFile(req.file.path, scanResult.message)
        throw new Error(`File failed security scan: ${scanResult.message}`)
      }

      // Stage 3: Content analysis
      processingStage = 'content-analysis'
      const contentAnalysis = await this.csvAnalyzer.analyzeCSV(req.file.path)

      if (!contentAnalysis.valid) {
        throw new Error(`Invalid CSV content: ${contentAnalysis.errors.join(', ')}`)
      }

      // Stage 4: Data processing
      processingStage = 'data-processing'
      const processingResult = await this.processVulnerabilityData(req.file.path, {
        uploadId,
        userId: req.user?.id,
        originalFilename: req.file.originalname,
        fileHash: validationResult.fileHash,
        contentStats: contentAnalysis.stats
      })

      // Stage 5: Cleanup
      processingStage = 'cleanup'
      await this.storage.archiveFile(req.file.path)

      res.json({
        success: true,
        uploadId,
        results: processingResult,
        fileInfo: {
          originalName: req.file.originalname,
          size: req.file.size,
          hash: validationResult.fileHash
        },
        contentAnalysis: {
          totalRows: contentAnalysis.stats.totalRows,
          columns: contentAnalysis.stats.columns,
          warnings: contentAnalysis.warnings
        },
        scanResult: {
          scanned: scanResult.scanned,
          clean: scanResult.clean
        }
      })

    } catch (error) {
      console.error(`Upload processing failed at stage '${processingStage}':`, error)

      // Cleanup on failure
      try {
        if (error.message.includes('security scan')) {
          // File already quarantined
        } else {
          await this.storage.quarantineFile(req.file.path, `Processing failed: ${error.message}`)
        }
      } catch (cleanupError) {
        console.error('Cleanup failed:', cleanupError)
      }

      res.status(400).json({
        error: 'Upload Processing Failed',
        message: error.message,
        stage: processingStage,
        uploadId
      })
    }
  }

  async processVulnerabilityData(filePath, metadata) {
    // Implement actual vulnerability data processing
    // This would typically involve:
    // 1. Reading CSV data
    // 2. Validating each row
    // 3. Saving to database
    // 4. Updating statistics
    // 5. Broadcasting progress via WebSocket

    const processor = new OptimizedUploadProcessor()

    return processor.processLargeCSV(filePath, {
      batchSize: 1000,
      progressCallback: (progress) => {
        // Broadcast progress to WebSocket clients
        this.broadcastProgress(metadata.uploadId, progress)
      },
      validateRows: true
    })
  }

  broadcastProgress(uploadId, progress) {
    // Implement WebSocket progress broadcasting
    // This would integrate with your Socket.IO setup
    if (global.io) {
      global.io.to(`upload-${uploadId}`).emit('upload-progress', progress)
    }
  }

  // Health check endpoint for upload system
  async getUploadHealth(req, res) {
    try {
      const storageStats = await this.storage.getStorageStats()
      const virusScannerAvailable = await this.virusScanner.isAvailable()

      res.json({
        status: 'healthy',
        components: {
          storage: {
            status: 'ok',
            stats: storageStats
          },
          virusScanner: {
            status: virusScannerAvailable ? 'ok' : 'unavailable',
            enabled: this.virusScanner.enabled
          },
          fileValidator: {
            status: 'ok'
          }
        },
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      res.status(500).json({
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }
}

// Usage in Express app
const uploadHandler = new HexTrackrUploadHandler()

app.post('/api/vulnerabilities/import', uploadHandler.handleUpload())
app.get('/api/upload/health', uploadHandler.getUploadHealth.bind(uploadHandler))

module.exports = { HexTrackrUploadHandler, UploadErrorHandler }
```

## Best Practices Summary

1. **Never trust uploaded files** - Validate everything (filename, size, type, content)
2. **Use secure file storage** - Isolate uploads, use proper permissions
3. **Implement virus scanning** - Essential for production environments
4. **Validate file content** - Don't just check extensions, analyze actual content
5. **Handle errors gracefully** - Provide meaningful error messages, cleanup files
6. **Use streaming for large files** - Avoid memory issues with large uploads
7. **Implement proper cleanup** - Remove temporary files, archive processed files
8. **Monitor upload activity** - Log security events, track suspicious patterns
9. **Use rate limiting** - Prevent abuse of upload endpoints
10. **Test security measures** - Regularly test with malicious files

## Further Reading

- [OWASP File Upload Security](https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload)
- [Multer Documentation](https://github.com/expressjs/multer)
- [ClamAV Documentation](https://docs.clamav.net/)
- [Node.js Stream Documentation](https://nodejs.org/api/stream.html)