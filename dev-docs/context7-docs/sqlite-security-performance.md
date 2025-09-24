# SQLite3 Security & Performance Guide for HexTrackr

## Table of Contents

- [Overview](#overview)
- [Security Best Practices](#security-best-practices)
- [Performance Optimization](#performance-optimization)
- [Database Design Patterns](#database-design-patterns)
- [Transaction Management](#transaction-management)
- [Connection Management](#connection-management)
- [Backup & Recovery](#backup--recovery)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [HexTrackr-Specific Implementation](#hextrackr-specific-implementation)

## Overview

SQLite3 is HexTrackr's primary database engine, providing reliable, serverless, and high-performance data storage. This guide covers security hardening and performance optimization specific to HexTrackr's vulnerability management requirements.

## Security Best Practices

### Prepared Statements (SQL Injection Prevention)

```javascript
const sqlite3 = require('sqlite3').verbose()

class SecureDatabase {
  constructor(dbPath) {
    this.db = new sqlite3.Database(dbPath)
    this.preparedStatements = new Map()
  }

  // CORRECT: Using prepared statements
  async getVulnerabilityById(id) {
    const query = 'SELECT * FROM vulnerabilities_current WHERE id = ?'
    return new Promise((resolve, reject) => {
      this.db.get(query, [id], (err, row) => {
        if (err) reject(err)
        else resolve(row)
      })
    })
  }

  // CORRECT: Prepared statement for complex queries
  async searchVulnerabilities(filters) {
    const conditions = []
    const params = []

    if (filters.severity) {
      conditions.push('severity = ?')
      params.push(filters.severity)
    }

    if (filters.vprScore) {
      conditions.push('vpr_score >= ?')
      params.push(filters.vprScore)
    }

    if (filters.dateFrom) {
      conditions.push('scan_date >= ?')
      params.push(filters.dateFrom)
    }

    const query = `
      SELECT * FROM vulnerabilities_current
      WHERE ${conditions.length ? conditions.join(' AND ') : '1=1'}
      ORDER BY vpr_score DESC, scan_date DESC
      LIMIT ?
    `
    params.push(filters.limit || 100)

    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }

  // NEVER DO THIS - String concatenation (vulnerable to SQL injection)
  // async unsafeQuery(userInput) {
  //   const query = `SELECT * FROM vulnerabilities WHERE title LIKE '%${userInput}%'`
  //   return this.db.all(query) // DANGEROUS!
  // }

  // CORRECT: Safe LIKE queries
  async searchVulnerabilitiesByTitle(searchTerm) {
    const query = 'SELECT * FROM vulnerabilities_current WHERE title LIKE ? ESCAPE \'\\\\\''
    const safeSearchTerm = `%${searchTerm.replace(/[%_\\]/g, '\\$&')}%`

    return new Promise((resolve, reject) => {
      this.db.all(query, [safeSearchTerm], (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }
}
```

### Database File Security

```javascript
const fs = require('fs')
const path = require('path')

class SecureDatabaseSetup {
  static setupDatabaseSecurity(dbPath) {
    try {
      // Ensure database directory has proper permissions
      const dbDir = path.dirname(dbPath)

      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true, mode: 0o700 })
      }

      // Set restrictive permissions on database file
      if (fs.existsSync(dbPath)) {
        fs.chmodSync(dbPath, 0o600) // Read/write for owner only
      }

      // Set permissions on database directory
      fs.chmodSync(dbDir, 0o700) // Full access for owner only

      console.log('Database security permissions set')
    } catch (error) {
      console.error('Failed to set database security:', error)
      throw error
    }
  }

  static validateDatabasePath(dbPath) {
    const resolvedPath = path.resolve(dbPath)
    const allowedBasePath = path.resolve('./app/public/data')

    // Prevent path traversal attacks
    if (!resolvedPath.startsWith(allowedBasePath)) {
      throw new Error('Database path not allowed')
    }

    return resolvedPath
  }
}

// Initialize secure database
const initializeSecureDatabase = (dbPath) => {
  const safePath = SecureDatabaseSetup.validateDatabasePath(dbPath)
  SecureDatabaseSetup.setupDatabaseSecurity(safePath)

  return new sqlite3.Database(safePath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE)
}
```

### SQLCipher Integration (Encryption at Rest)

```javascript
// Building with SQLCipher support
// npm install sqlite3 --build-from-source --sqlite_libname=sqlcipher

class EncryptedDatabase {
  constructor(dbPath, encryptionKey) {
    this.db = new sqlite3.Database(dbPath)

    // Set encryption key (must be done immediately after opening)
    this.db.serialize(() => {
      this.db.run(`PRAGMA key = '${encryptionKey}'`)

      // Verify encryption is working
      this.db.get('PRAGMA cipher_version', (err, row) => {
        if (err) {
          throw new Error('SQLCipher not available')
        }
        console.log('Database encrypted with SQLCipher:', row.cipher_version)
      })
    })
  }

  // Change encryption key
  rekeyDatabase(oldKey, newKey) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run(`PRAGMA key = '${oldKey}'`)
        this.db.run(`PRAGMA rekey = '${newKey}'`, (err) => {
          if (err) {
            reject(new Error('Failed to rekey database: ' + err.message))
          } else {
            resolve()
          }
        })
      })
    })
  }
}

// Environment-based encryption setup
const initializeEncryptedDatabase = () => {
  const dbPath = process.env.DB_PATH
  const encryptionKey = process.env.DB_ENCRYPTION_KEY

  if (!encryptionKey && process.env.NODE_ENV === 'production') {
    throw new Error('Database encryption key required in production')
  }

  return encryptionKey
    ? new EncryptedDatabase(dbPath, encryptionKey)
    : new sqlite3.Database(dbPath)
}
```

### Input Validation & Sanitization

```javascript
const validator = require('validator')

class DatabaseValidator {
  static validateVulnerabilityInput(data) {
    const errors = []

    // Validate required fields
    if (!data.title || data.title.trim().length === 0) {
      errors.push('Title is required')
    }

    if (data.title && data.title.length > 1000) {
      errors.push('Title too long (max 1000 characters)')
    }

    // Validate severity
    const validSeverities = ['Critical', 'High', 'Medium', 'Low']
    if (data.severity && !validSeverities.includes(data.severity)) {
      errors.push('Invalid severity level')
    }

    // Validate VPR score
    if (data.vpr_score !== undefined) {
      const score = parseFloat(data.vpr_score)
      if (isNaN(score) || score < 0 || score > 10) {
        errors.push('VPR score must be between 0 and 10')
      }
    }

    // Validate IP addresses
    if (data.ip_address && !validator.isIP(data.ip_address)) {
      errors.push('Invalid IP address format')
    }

    // Validate ports
    if (data.port) {
      const port = parseInt(data.port)
      if (isNaN(port) || port < 1 || port > 65535) {
        errors.push('Invalid port number')
      }
    }

    // Validate dates
    if (data.scan_date && !validator.isISO8601(data.scan_date)) {
      errors.push('Invalid scan date format')
    }

    return errors
  }

  static sanitizeInput(data) {
    const sanitized = {}

    Object.keys(data).forEach(key => {
      let value = data[key]

      if (typeof value === 'string') {
        // Trim whitespace
        value = value.trim()

        // Remove null bytes
        value = value.replace(/\0/g, '')

        // Limit string length based on database schema
        const maxLengths = {
          title: 1000,
          description: 5000,
          solution: 5000,
          ip_address: 45, // IPv6 max length
          hostname: 255,
          port: 5,
          severity: 20,
          status: 20
        }

        if (maxLengths[key]) {
          value = value.substring(0, maxLengths[key])
        }
      }

      sanitized[key] = value
    })

    return sanitized
  }
}
```

## Performance Optimization

### Database Configuration

```javascript
class OptimizedDatabase {
  constructor(dbPath) {
    this.db = new sqlite3.Database(dbPath)
    this.setupPragmas()
    this.preparedStatements = new Map()
  }

  setupPragmas() {
    // Performance-focused SQLite configuration
    const pragmas = [
      // Enable WAL mode for better concurrency
      'PRAGMA journal_mode = WAL',

      // Optimize synchronization for better performance
      'PRAGMA synchronous = NORMAL',

      // Increase cache size (in KB) - adjust based on available memory
      'PRAGMA cache_size = -64000', // 64MB cache

      // Memory-mapped I/O for faster reads
      'PRAGMA mmap_size = 268435456', // 256MB

      // Optimize temp store
      'PRAGMA temp_store = MEMORY',

      // Auto-vacuum to prevent database bloat
      'PRAGMA auto_vacuum = INCREMENTAL',

      // Optimize page size for better performance
      'PRAGMA page_size = 4096',

      // Increase busy timeout
      'PRAGMA busy_timeout = 30000',

      // Optimize query planning
      'PRAGMA optimize'
    ]

    this.db.serialize(() => {
      pragmas.forEach(pragma => {
        this.db.run(pragma, (err) => {
          if (err) {
            console.error(`Failed to set pragma: ${pragma}`, err)
          }
        })
      })
    })

    console.log('Database optimizations applied')
  }

  // Prepared statement caching for frequently used queries
  getOrCreateStatement(queryKey, sql) {
    if (!this.preparedStatements.has(queryKey)) {
      this.preparedStatements.set(queryKey, this.db.prepare(sql))
    }
    return this.preparedStatements.get(queryKey)
  }

  // Optimized batch operations
  async batchInsertVulnerabilities(vulnerabilities) {
    return new Promise((resolve, reject) => {
      const stmt = this.getOrCreateStatement('insertVulnerability',
        `INSERT OR REPLACE INTO vulnerabilities_current
         (title, severity, vpr_score, ip_address, port, hostname,
          description, solution, scan_date, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )

      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION')

        let completed = 0
        let hasError = false

        vulnerabilities.forEach(vuln => {
          stmt.run([
            vuln.title, vuln.severity, vuln.vpr_score,
            vuln.ip_address, vuln.port, vuln.hostname,
            vuln.description, vuln.solution, vuln.scan_date, vuln.status
          ], (err) => {
            if (err && !hasError) {
              hasError = true
              this.db.run('ROLLBACK')
              reject(err)
              return
            }

            completed++
            if (completed === vulnerabilities.length && !hasError) {
              this.db.run('COMMIT', (err) => {
                if (err) reject(err)
                else resolve(completed)
              })
            }
          })
        })
      })
    })
  }

  // Cleanup prepared statements
  cleanup() {
    this.preparedStatements.forEach(stmt => {
      stmt.finalize()
    })
    this.preparedStatements.clear()
    this.db.close()
  }
}
```

### Indexing Strategy

```sql
-- Core indexes for HexTrackr performance
-- These should be in your schema initialization

-- Primary search indexes
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_severity
ON vulnerabilities_current(severity);

CREATE INDEX IF NOT EXISTS idx_vulnerabilities_vpr_score
ON vulnerabilities_current(vpr_score DESC);

CREATE INDEX IF NOT EXISTS idx_vulnerabilities_scan_date
ON vulnerabilities_current(scan_date DESC);

CREATE INDEX IF NOT EXISTS idx_vulnerabilities_status
ON vulnerabilities_current(status);

-- Compound indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_severity_vpr
ON vulnerabilities_current(severity, vpr_score DESC);

CREATE INDEX IF NOT EXISTS idx_vulnerabilities_status_date
ON vulnerabilities_current(status, scan_date DESC);

CREATE INDEX IF NOT EXISTS idx_vulnerabilities_ip_port
ON vulnerabilities_current(ip_address, port);

-- Full-text search index for titles and descriptions
CREATE VIRTUAL TABLE IF NOT EXISTS vulnerabilities_fts USING fts5(
  title, description,
  content='vulnerabilities_current',
  content_rowid='id'
);

-- Triggers to keep FTS table synchronized
CREATE TRIGGER IF NOT EXISTS vulnerabilities_fts_insert
AFTER INSERT ON vulnerabilities_current
BEGIN
  INSERT INTO vulnerabilities_fts(rowid, title, description)
  VALUES (new.id, new.title, new.description);
END;

CREATE TRIGGER IF NOT EXISTS vulnerabilities_fts_delete
AFTER DELETE ON vulnerabilities_current
BEGIN
  INSERT INTO vulnerabilities_fts(vulnerabilities_fts, rowid, title, description)
  VALUES('delete', old.id, old.title, old.description);
END;

CREATE TRIGGER IF NOT EXISTS vulnerabilities_fts_update
AFTER UPDATE ON vulnerabilities_current
BEGIN
  INSERT INTO vulnerabilities_fts(vulnerabilities_fts, rowid, title, description)
  VALUES('delete', old.id, old.title, old.description);
  INSERT INTO vulnerabilities_fts(rowid, title, description)
  VALUES (new.id, new.title, new.description);
END;

-- Indexes for tickets and relationships
CREATE INDEX IF NOT EXISTS idx_tickets_status
ON tickets(status);

CREATE INDEX IF NOT EXISTS idx_tickets_priority
ON tickets(priority);

CREATE INDEX IF NOT EXISTS idx_tickets_created_date
ON tickets(created_date DESC);

CREATE INDEX IF NOT EXISTS idx_ticket_vulnerabilities_ticket_id
ON ticket_vulnerabilities(ticket_id);

CREATE INDEX IF NOT EXISTS idx_ticket_vulnerabilities_vulnerability_id
ON ticket_vulnerabilities(vulnerability_id);

-- KEV catalog indexes
CREATE INDEX IF NOT EXISTS idx_kev_catalog_cve_id
ON kev_catalog(cve_id);

CREATE INDEX IF NOT EXISTS idx_kev_catalog_date_added
ON kev_catalog(date_added DESC);

-- Import tracking indexes
CREATE INDEX IF NOT EXISTS idx_vulnerability_imports_timestamp
ON vulnerability_imports(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_vulnerability_imports_status
ON vulnerability_imports(status);
```

### Query Optimization Examples

```javascript
class OptimizedQueries {

  // Efficient pagination with OFFSET/LIMIT optimization
  async getVulnerabilitiesPaginated(page, limit, filters = {}) {
    // Use cursor-based pagination for better performance on large datasets
    const offset = (page - 1) * limit

    let query = `
      SELECT v.*,
             COUNT(*) OVER() as total_count
      FROM vulnerabilities_current v
    `

    const conditions = []
    const params = []

    if (filters.severity) {
      conditions.push('severity = ?')
      params.push(filters.severity)
    }

    if (filters.minVprScore) {
      conditions.push('vpr_score >= ?')
      params.push(filters.minVprScore)
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`
    }

    // Use index-friendly ordering
    query += ` ORDER BY vpr_score DESC, id`
    query += ` LIMIT ? OFFSET ?`

    params.push(limit, offset)

    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }

  // Optimized aggregation queries
  async getVulnerabilityStatistics() {
    const query = `
      WITH severity_counts AS (
        SELECT severity, COUNT(*) as count
        FROM vulnerabilities_current
        WHERE status = 'active'
        GROUP BY severity
      ),
      vpr_ranges AS (
        SELECT
          CASE
            WHEN vpr_score >= 9.0 THEN 'critical'
            WHEN vpr_score >= 7.0 THEN 'high'
            WHEN vpr_score >= 4.0 THEN 'medium'
            ELSE 'low'
          END as vpr_range,
          COUNT(*) as count
        FROM vulnerabilities_current
        WHERE status = 'active'
        GROUP BY vpr_range
      )
      SELECT
        (SELECT json_object(
          'Critical', COALESCE((SELECT count FROM severity_counts WHERE severity = 'Critical'), 0),
          'High', COALESCE((SELECT count FROM severity_counts WHERE severity = 'High'), 0),
          'Medium', COALESCE((SELECT count FROM severity_counts WHERE severity = 'Medium'), 0),
          'Low', COALESCE((SELECT count FROM severity_counts WHERE severity = 'Low'), 0)
        )) as severity_counts,
        (SELECT json_object(
          'critical', COALESCE((SELECT count FROM vpr_ranges WHERE vpr_range = 'critical'), 0),
          'high', COALESCE((SELECT count FROM vpr_ranges WHERE vpr_range = 'high'), 0),
          'medium', COALESCE((SELECT count FROM vpr_ranges WHERE vpr_range = 'medium'), 0),
          'low', COALESCE((SELECT count FROM vpr_ranges WHERE vpr_range = 'low'), 0)
        )) as vpr_counts,
        (SELECT COUNT(*) FROM vulnerabilities_current WHERE status = 'active') as total_active,
        (SELECT COUNT(*) FROM vulnerabilities_current WHERE status = 'resolved') as total_resolved
    `

    return new Promise((resolve, reject) => {
      this.db.get(query, (err, row) => {
        if (err) reject(err)
        else {
          resolve({
            severityCounts: JSON.parse(row.severity_counts),
            vprCounts: JSON.parse(row.vpr_counts),
            totalActive: row.total_active,
            totalResolved: row.total_resolved
          })
        }
      })
    })
  }

  // Full-text search with ranking
  async searchVulnerabilitiesFullText(searchTerm, limit = 50) {
    const query = `
      SELECT v.*,
             bm25(vulnerabilities_fts) as rank
      FROM vulnerabilities_fts
      JOIN vulnerabilities_current v ON v.id = vulnerabilities_fts.rowid
      WHERE vulnerabilities_fts MATCH ?
      ORDER BY rank
      LIMIT ?
    `

    return new Promise((resolve, reject) => {
      this.db.all(query, [searchTerm, limit], (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }
}
```

## Database Design Patterns

### Rollover Architecture Implementation

```javascript
class RolloverManager {
  constructor(database) {
    this.db = database
  }

  // Move current vulnerabilities to snapshots and clear current table
  async performRollover() {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION')

        // Create snapshot entry
        const snapshotDate = new Date().toISOString().split('T')[0]

        // Move current data to snapshots
        this.db.run(`
          INSERT INTO vulnerability_snapshots
          SELECT *, ? as snapshot_date
          FROM vulnerabilities_current
        `, [snapshotDate], (err) => {
          if (err) {
            this.db.run('ROLLBACK')
            reject(err)
            return
          }

          // Update daily totals
          this.db.run(`
            INSERT OR REPLACE INTO vulnerability_daily_totals
            (scan_date, total_vulnerabilities, critical_count, high_count,
             medium_count, low_count, total_vpr_score)
            SELECT
              scan_date,
              COUNT(*) as total_vulnerabilities,
              SUM(CASE WHEN severity = 'Critical' THEN 1 ELSE 0 END) as critical_count,
              SUM(CASE WHEN severity = 'High' THEN 1 ELSE 0 END) as high_count,
              SUM(CASE WHEN severity = 'Medium' THEN 1 ELSE 0 END) as medium_count,
              SUM(CASE WHEN severity = 'Low' THEN 1 ELSE 0 END) as low_count,
              AVG(vpr_score) as avg_vpr_score
            FROM vulnerabilities_current
            GROUP BY scan_date
          `, (err) => {
            if (err) {
              this.db.run('ROLLBACK')
              reject(err)
              return
            }

            // Clear current table
            this.db.run('DELETE FROM vulnerabilities_current', (err) => {
              if (err) {
                this.db.run('ROLLBACK')
                reject(err)
              } else {
                this.db.run('COMMIT', (err) => {
                  if (err) reject(err)
                  else resolve()
                })
              }
            })
          })
        })
      })
    })
  }

  // Cleanup old snapshots (keep last N days)
  async cleanupOldSnapshots(retentionDays = 90) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)
    const cutoffString = cutoffDate.toISOString().split('T')[0]

    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM vulnerability_snapshots WHERE snapshot_date < ?',
        [cutoffString],
        function(err) {
          if (err) reject(err)
          else resolve(this.changes)
        }
      )
    })
  }
}
```

## Transaction Management

### ACID Transaction Patterns

```javascript
class TransactionManager {
  constructor(database) {
    this.db = database
  }

  // Generic transaction wrapper
  async executeTransaction(operations) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION')

        const rollback = (error) => {
          this.db.run('ROLLBACK', () => {
            reject(error)
          })
        }

        try {
          // Execute all operations
          Promise.all(operations.map(op => op()))
            .then(results => {
              this.db.run('COMMIT', (err) => {
                if (err) rollback(err)
                else resolve(results)
              })
            })
            .catch(rollback)
        } catch (error) {
          rollback(error)
        }
      })
    })
  }

  // Example: Create vulnerability with ticket atomically
  async createVulnerabilityWithTicket(vulnerabilityData, ticketData) {
    const operations = [
      () => this.insertVulnerability(vulnerabilityData),
      (vulnId) => this.insertTicket({ ...ticketData, vulnerabilityId: vulnId }),
      (vulnId, ticketId) => this.linkVulnerabilityToTicket(vulnId, ticketId)
    ]

    return this.executeTransaction(operations)
  }

  // Bulk import with progress tracking
  async bulkImportWithProgress(vulnerabilities, progressCallback) {
    const batchSize = 1000
    let processed = 0

    for (let i = 0; i < vulnerabilities.length; i += batchSize) {
      const batch = vulnerabilities.slice(i, i + batchSize)

      await this.executeTransaction([
        () => this.insertVulnerabilityBatch(batch)
      ])

      processed += batch.length
      if (progressCallback) {
        progressCallback({
          processed,
          total: vulnerabilities.length,
          percentage: Math.round((processed / vulnerabilities.length) * 100)
        })
      }
    }

    return processed
  }
}
```

## Connection Management

### Connection Pooling & Lifecycle

```javascript
class DatabaseConnectionManager {
  constructor(dbPath, options = {}) {
    this.dbPath = dbPath
    this.options = {
      maxConnections: options.maxConnections || 10,
      busyTimeout: options.busyTimeout || 30000,
      ...options
    }
    this.connections = []
    this.availableConnections = []
    this.waitingQueue = []
  }

  async initialize() {
    // Create connection pool
    for (let i = 0; i < this.options.maxConnections; i++) {
      const connection = new sqlite3.Database(this.dbPath)

      // Configure connection
      connection.run('PRAGMA busy_timeout = ?', [this.options.busyTimeout])
      connection.run('PRAGMA journal_mode = WAL')

      this.connections.push(connection)
      this.availableConnections.push(connection)
    }

    console.log(`Database pool initialized with ${this.connections.length} connections`)
  }

  async getConnection() {
    return new Promise((resolve, reject) => {
      if (this.availableConnections.length > 0) {
        const connection = this.availableConnections.pop()
        resolve(connection)
      } else {
        this.waitingQueue.push({ resolve, reject })
      }
    })
  }

  releaseConnection(connection) {
    // Return connection to pool
    this.availableConnections.push(connection)

    // Serve waiting requests
    if (this.waitingQueue.length > 0) {
      const { resolve } = this.waitingQueue.shift()
      const availableConnection = this.availableConnections.pop()
      resolve(availableConnection)
    }
  }

  async executeWithConnection(query, params = []) {
    const connection = await this.getConnection()

    try {
      return await new Promise((resolve, reject) => {
        connection.all(query, params, (err, rows) => {
          if (err) reject(err)
          else resolve(rows)
        })
      })
    } finally {
      this.releaseConnection(connection)
    }
  }

  async close() {
    // Close all connections
    const closePromises = this.connections.map(conn =>
      new Promise((resolve) => conn.close(resolve))
    )

    await Promise.all(closePromises)
    console.log('Database pool closed')
  }
}
```

## Backup & Recovery

### Automated Backup Strategy

```javascript
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')

class DatabaseBackupManager {
  constructor(dbPath, backupDir) {
    this.dbPath = dbPath
    this.backupDir = backupDir
    this.ensureBackupDirectory()
  }

  ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true, mode: 0o700 })
    }
  }

  // Create backup using SQLite's backup API
  async createBackup(backupName = null) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = backupName || `hextrackr_backup_${timestamp}.db`
    const backupPath = path.join(this.backupDir, filename)

    return new Promise((resolve, reject) => {
      const sourceDb = new sqlite3.Database(this.dbPath, sqlite3.OPEN_READONLY)
      const backupDb = new sqlite3.Database(backupPath)

      sourceDb.backup(backupDb, (err, totalPages) => {
        sourceDb.close()
        backupDb.close()

        if (err) {
          reject(err)
        } else {
          // Compress backup
          this.compressBackup(backupPath)
            .then(() => {
              resolve({
                filename,
                path: backupPath + '.gz',
                size: fs.statSync(backupPath + '.gz').size,
                pages: totalPages,
                timestamp: new Date().toISOString()
              })
            })
            .catch(reject)
        }
      })
    })
  }

  // Compress backup using gzip
  async compressBackup(backupPath) {
    return new Promise((resolve, reject) => {
      const gzip = spawn('gzip', [backupPath])

      gzip.on('close', (code) => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`Compression failed with code ${code}`))
        }
      })

      gzip.on('error', reject)
    })
  }

  // Restore from backup
  async restoreFromBackup(backupFilename) {
    const backupPath = path.join(this.backupDir, backupFilename)

    if (!fs.existsSync(backupPath)) {
      throw new Error('Backup file not found')
    }

    // Create backup of current database
    const currentBackup = await this.createBackup('pre_restore_backup')

    try {
      // Decompress if needed
      let sourceBackup = backupPath
      if (backupPath.endsWith('.gz')) {
        sourceBackup = await this.decompressBackup(backupPath)
      }

      // Verify backup integrity
      await this.verifyBackupIntegrity(sourceBackup)

      // Copy backup to main database location
      fs.copyFileSync(sourceBackup, this.dbPath)

      // Clean up temporary decompressed file
      if (sourceBackup !== backupPath) {
        fs.unlinkSync(sourceBackup)
      }

      return {
        success: true,
        restoredFrom: backupFilename,
        currentBackup: currentBackup.filename
      }
    } catch (error) {
      // If restore fails, keep original database intact
      throw new Error(`Restore failed: ${error.message}`)
    }
  }

  async decompressBackup(compressedPath) {
    const decompressedPath = compressedPath.replace('.gz', '')

    return new Promise((resolve, reject) => {
      const gunzip = spawn('gunzip', ['-c', compressedPath])
      const writeStream = fs.createWriteStream(decompressedPath)

      gunzip.stdout.pipe(writeStream)

      gunzip.on('close', (code) => {
        if (code === 0) {
          resolve(decompressedPath)
        } else {
          reject(new Error(`Decompression failed with code ${code}`))
        }
      })

      gunzip.on('error', reject)
    })
  }

  async verifyBackupIntegrity(backupPath) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(backupPath, sqlite3.OPEN_READONLY)

      db.run('PRAGMA integrity_check', (err, result) => {
        db.close()

        if (err) {
          reject(new Error(`Backup integrity check failed: ${err.message}`))
        } else {
          resolve(result)
        }
      })
    })
  }

  // List available backups
  listBackups() {
    const backupFiles = fs.readdirSync(this.backupDir)
      .filter(file => file.startsWith('hextrackr_backup_'))
      .map(file => {
        const filepath = path.join(this.backupDir, file)
        const stats = fs.statSync(filepath)

        return {
          filename: file,
          size: stats.size,
          created: stats.mtime,
          path: filepath
        }
      })
      .sort((a, b) => b.created - a.created)

    return backupFiles
  }

  // Cleanup old backups (keep last N backups)
  cleanupOldBackups(keepCount = 10) {
    const backups = this.listBackups()
    const toDelete = backups.slice(keepCount)

    toDelete.forEach(backup => {
      fs.unlinkSync(backup.path)
      console.log(`Deleted old backup: ${backup.filename}`)
    })

    return toDelete.length
  }
}
```

## Monitoring & Maintenance

### Database Health Monitoring

```javascript
class DatabaseHealthMonitor {
  constructor(database) {
    this.db = database
    this.metrics = {
      queryCount: 0,
      slowQueries: [],
      errors: [],
      connections: 0
    }
  }

  // Monitor query performance
  monitorQuery(query, params, startTime) {
    const duration = Date.now() - startTime
    this.metrics.queryCount++

    if (duration > 1000) { // Queries taking > 1 second
      this.metrics.slowQueries.push({
        query: query.substring(0, 100) + '...',
        duration,
        timestamp: new Date().toISOString(),
        params: params ? params.length : 0
      })

      // Keep only last 50 slow queries
      if (this.metrics.slowQueries.length > 50) {
        this.metrics.slowQueries = this.metrics.slowQueries.slice(-50)
      }
    }
  }

  // Database statistics
  async getDatabaseStats() {
    const stats = {}

    try {
      // Database size
      const sizeResult = await this.executeQuery('PRAGMA page_count')
      const pageSizeResult = await this.executeQuery('PRAGMA page_size')
      stats.databaseSize = sizeResult[0].page_count * pageSizeResult[0].page_size

      // Schema version
      const schemaVersion = await this.executeQuery('PRAGMA schema_version')
      stats.schemaVersion = schemaVersion[0].schema_version

      // WAL information
      const walInfo = await this.executeQuery('PRAGMA wal_checkpoint(PASSIVE)')
      stats.walCheckpoint = walInfo[0]

      // Table statistics
      stats.tables = {}
      const tables = ['vulnerabilities_current', 'vulnerability_snapshots', 'tickets', 'kev_catalog']

      for (const table of tables) {
        try {
          const count = await this.executeQuery(`SELECT COUNT(*) as count FROM ${table}`)
          stats.tables[table] = count[0].count
        } catch (error) {
          stats.tables[table] = 'error'
        }
      }

      // Index usage statistics
      const indexStats = await this.executeQuery(`
        SELECT name, tbl_name
        FROM sqlite_master
        WHERE type = 'index' AND tbl_name LIKE 'vulnerabilities%'
      `)
      stats.indexes = indexStats.length

      return stats
    } catch (error) {
      console.error('Error getting database stats:', error)
      return { error: error.message }
    }
  }

  // Run database maintenance
  async runMaintenance() {
    const results = {}

    try {
      // Analyze tables for query optimization
      await this.executeQuery('ANALYZE')
      results.analyze = 'completed'

      // Optimize database
      await this.executeQuery('PRAGMA optimize')
      results.optimize = 'completed'

      // Incremental vacuum
      const vacuumResult = await this.executeQuery('PRAGMA incremental_vacuum(1000)')
      results.vacuum = 'completed'

      // WAL checkpoint
      const walResult = await this.executeQuery('PRAGMA wal_checkpoint(TRUNCATE)')
      results.walCheckpoint = walResult[0]

      // Integrity check (quick)
      const integrityResult = await this.executeQuery('PRAGMA quick_check(10)')
      results.integrity = integrityResult[0].quick_check === 'ok' ? 'passed' : 'failed'

      return results
    } catch (error) {
      console.error('Maintenance error:', error)
      return { error: error.message }
    }
  }

  executeQuery(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }

  // Get health report
  getHealthReport() {
    return {
      metrics: { ...this.metrics },
      timestamp: new Date().toISOString()
    }
  }
}
```

## HexTrackr-Specific Implementation

### Import Processing Optimization

```javascript
class OptimizedImportProcessor {
  constructor(database) {
    this.db = database
    this.batchSize = 1000
    this.progressCallback = null
  }

  async processCsvImport(filePath, options = {}) {
    const { progressCallback, validateData = true } = options
    this.progressCallback = progressCallback

    // Use streaming for large files
    const stream = fs.createReadStream(filePath)
    const csvParser = csv.parse({
      headers: true,
      skipEmptyLines: true
    })

    const results = {
      processed: 0,
      errors: [],
      startTime: Date.now()
    }

    let batch = []
    let totalProcessed = 0

    return new Promise((resolve, reject) => {
      stream
        .pipe(csvParser)
        .on('data', async (row) => {
          try {
            // Validate and sanitize data if required
            if (validateData) {
              const errors = DatabaseValidator.validateVulnerabilityInput(row)
              if (errors.length > 0) {
                results.errors.push({ row: totalProcessed + 1, errors })
                return
              }
              row = DatabaseValidator.sanitizeInput(row)
            }

            batch.push(row)

            if (batch.length >= this.batchSize) {
              csvParser.pause()

              try {
                await this.processBatch(batch)
                totalProcessed += batch.length
                batch = []

                if (this.progressCallback) {
                  this.progressCallback({
                    processed: totalProcessed,
                    errors: results.errors.length,
                    status: 'processing'
                  })
                }
              } catch (error) {
                results.errors.push({ batch: true, error: error.message })
              }

              csvParser.resume()
            }
          } catch (error) {
            results.errors.push({
              row: totalProcessed + batch.length + 1,
              error: error.message
            })
          }
        })
        .on('end', async () => {
          try {
            // Process remaining batch
            if (batch.length > 0) {
              await this.processBatch(batch)
              totalProcessed += batch.length
            }

            results.processed = totalProcessed
            results.endTime = Date.now()
            results.duration = results.endTime - results.startTime

            resolve(results)
          } catch (error) {
            reject(error)
          }
        })
        .on('error', reject)
    })
  }

  async processBatch(batch) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO vulnerabilities_current
        (title, severity, vpr_score, ip_address, port, hostname,
         description, solution, scan_date, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `)

      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION')

        let completed = 0
        let hasError = false

        batch.forEach(row => {
          stmt.run([
            row.title,
            row.severity,
            parseFloat(row.vpr_score) || null,
            row.ip_address,
            parseInt(row.port) || null,
            row.hostname,
            row.description,
            row.solution,
            row.scan_date,
            row.status || 'active'
          ], (err) => {
            if (err && !hasError) {
              hasError = true
              this.db.run('ROLLBACK')
              reject(err)
              return
            }

            completed++
            if (completed === batch.length && !hasError) {
              this.db.run('COMMIT', (err) => {
                if (err) reject(err)
                else {
                  stmt.finalize()
                  resolve(completed)
                }
              })
            }
          })
        })
      })
    })
  }
}
```

### KEV Synchronization Performance

```javascript
class OptimizedKEVSync {
  constructor(database) {
    this.db = database
  }

  async syncKEVCatalog(kevData) {
    const startTime = Date.now()
    let newEntries = 0
    let updatedEntries = 0

    return new Promise((resolve, reject) => {
      // Prepare statements for efficiency
      const insertStmt = this.db.prepare(`
        INSERT OR IGNORE INTO kev_catalog
        (cve_id, vendor_project, product, vulnerability_name, date_added,
         short_description, required_action, due_date, known_ransomware, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      const updateStmt = this.db.prepare(`
        UPDATE kev_catalog
        SET vulnerability_name = ?, date_added = ?, short_description = ?,
            required_action = ?, due_date = ?, known_ransomware = ?, notes = ?,
            updated_at = datetime('now')
        WHERE cve_id = ? AND (
          vulnerability_name != ? OR short_description != ? OR
          required_action != ? OR due_date != ? OR known_ransomware != ?
        )
      `)

      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION')

        let completed = 0
        let hasError = false

        kevData.vulnerabilities.forEach(vuln => {
          // First try to insert (new entry)
          insertStmt.run([
            vuln.cveID,
            vuln.vendorProject,
            vuln.product,
            vuln.vulnerabilityName,
            vuln.dateAdded,
            vuln.shortDescription,
            vuln.requiredAction,
            vuln.dueDate,
            vuln.knownRansomwareCampaignUse === 'Known' ? 1 : 0,
            vuln.notes || ''
          ], function(err) {
            if (err && !hasError) {
              hasError = true
              this.db.run('ROLLBACK')
              reject(err)
              return
            }

            if (this.changes > 0) {
              newEntries++
            } else {
              // Try update if insert didn't change anything
              updateStmt.run([
                vuln.vulnerabilityName, vuln.dateAdded, vuln.shortDescription,
                vuln.requiredAction, vuln.dueDate,
                vuln.knownRansomwareCampaignUse === 'Known' ? 1 : 0,
                vuln.notes || '', vuln.cveID,
                vuln.vulnerabilityName, vuln.shortDescription,
                vuln.requiredAction, vuln.dueDate,
                vuln.knownRansomwareCampaignUse === 'Known' ? 1 : 0
              ], function(updateErr) {
                if (updateErr && !hasError) {
                  hasError = true
                  this.db.run('ROLLBACK')
                  reject(updateErr)
                  return
                }

                if (this.changes > 0) {
                  updatedEntries++
                }
              })
            }

            completed++
            if (completed === kevData.vulnerabilities.length && !hasError) {
              this.db.run('COMMIT', (err) => {
                if (err) reject(err)
                else {
                  insertStmt.finalize()
                  updateStmt.finalize()

                  resolve({
                    processed: completed,
                    newEntries,
                    updatedEntries,
                    duration: Date.now() - startTime
                  })
                }
              })
            }
          })
        })
      })
    })
  }
}
```

## Best Practices Summary

1. **Always use prepared statements** - Never concatenate user input into SQL queries
2. **Implement proper indexing** - Create indexes based on query patterns
3. **Use WAL mode** - Better concurrency and performance
4. **Configure appropriate pragmas** - Optimize for your use case
5. **Implement transaction management** - Ensure data consistency
6. **Monitor performance** - Track slow queries and database metrics
7. **Regular maintenance** - ANALYZE, OPTIMIZE, and VACUUM operations
8. **Backup strategy** - Regular automated backups with integrity checks
9. **Security hardening** - File permissions, encryption, input validation
10. **Connection pooling** - Manage database connections efficiently

## Further Reading

- [SQLite Official Documentation](https://www.sqlite.org/docs.html)
- [SQLite Performance Tips](https://www.sqlite.org/speed.html)
- [SQLite Security Guidelines](https://www.sqlite.org/security.html)
- [SQLCipher Documentation](https://www.zetetic.net/sqlcipher/)