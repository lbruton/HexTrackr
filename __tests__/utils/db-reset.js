/**
 * Database Reset Utility
 * Resets database to clean state between tests for isolation
 * 
 * Operations:
 * - Clear all vulnerability data
 * - Reset auto-increment counters
 * - Restore default settings
 * - Create fresh test data if needed
 * 
 * @module db-reset
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs').promises;

/**
 * Execute SQL query as a Promise
 * @param {Database} db - SQLite database instance
 * @param {string} sql - SQL query to execute
 * @param {Array} params - Query parameters
 * @returns {Promise<void>}
 */
function runQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

/**
 * Get all rows from a query as a Promise
 * @param {Database} db - SQLite database instance
 * @param {string} sql - SQL query to execute
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>}
 */
function allQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

/**
 * Reset database to clean state
 * @param {string} dbPath - Path to database file
 * @returns {Promise<void>}
 */
async function resetDatabase(dbPath = path.join(__dirname, '../../data/hextrackr.db')) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, async (err) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        // Begin transaction for atomic reset
        await runQuery(db, 'BEGIN TRANSACTION');

        // Clear all data from tables (in correct order due to foreign keys)
        await runQuery(db, 'DELETE FROM ticket_vulnerabilities');
        await runQuery(db, 'DELETE FROM vulnerabilities');
        await runQuery(db, 'DELETE FROM vulnerability_imports');
        await runQuery(db, 'DELETE FROM tickets');

        // Reset auto-increment counters
        await runQuery(db, "DELETE FROM sqlite_sequence WHERE name='vulnerability_imports'");
        await runQuery(db, "DELETE FROM sqlite_sequence WHERE name='vulnerabilities'");
        await runQuery(db, "DELETE FROM sqlite_sequence WHERE name='ticket_vulnerabilities'");

        // Vacuum to optimize database
        await runQuery(db, 'COMMIT');
        await runQuery(db, 'VACUUM');

        // Close database
        db.close((closeErr) => {
          if (closeErr) {
            reject(closeErr);
          } else {
            resolve();
          }
        });
      } catch (error) {
        // Rollback on error
        await runQuery(db, 'ROLLBACK').catch(() => {});
        db.close();
        reject(error);
      }
    });
  });
}

/**
 * Seed database with test data
 * @param {string} dbPath - Path to database file
 * @param {Object} seedData - Test data to insert
 * @returns {Promise<void>}
 */
async function seedDatabase(dbPath, seedData = {}) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, async (err) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        await runQuery(db, 'BEGIN TRANSACTION');

        // Seed vulnerability imports if provided
        if (seedData.imports && seedData.imports.length > 0) {
          for (const importData of seedData.imports) {
            await runQuery(db, `
              INSERT INTO vulnerability_imports 
              (filename, import_date, row_count, vendor, file_size, processing_time, raw_headers)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
              importData.filename || 'test-import.csv',
              importData.import_date || new Date().toISOString(),
              importData.row_count || 100,
              importData.vendor || 'generic',
              importData.file_size || 10000,
              importData.processing_time || 500,
              JSON.stringify(importData.raw_headers || ['CVE', 'Device', 'Severity'])
            ]);
          }
        }

        // Seed vulnerabilities if provided
        if (seedData.vulnerabilities && seedData.vulnerabilities.length > 0) {
          for (const vuln of seedData.vulnerabilities) {
            await runQuery(db, `
              INSERT INTO vulnerabilities 
              (import_id, hostname, ip_address, cve, severity, vpr_score, description)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
              vuln.import_id || 1,
              vuln.hostname || 'test-device',
              vuln.ip_address || '192.168.1.1',
              vuln.cve || 'CVE-2024-0001',
              vuln.severity || 'High',
              vuln.vpr_score || 7.5,
              vuln.description || 'Test vulnerability'
            ]);
          }
        }

        // Seed tickets if provided
        if (seedData.tickets && seedData.tickets.length > 0) {
          for (const ticket of seedData.tickets) {
            await runQuery(db, `
              INSERT INTO tickets 
              (id, location, devices, description, urgency, category, status, created_date)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              ticket.id || `TICK-${Date.now()}`,
              ticket.location || 'Test Location',
              JSON.stringify(ticket.devices || ['test-device']),
              ticket.description || 'Test ticket',
              ticket.urgency || 'Medium',
              ticket.category || 'Security',
              ticket.status || 'Open',
              ticket.created_date || new Date().toISOString()
            ]);
          }
        }

        await runQuery(db, 'COMMIT');

        db.close((closeErr) => {
          if (closeErr) {
            reject(closeErr);
          } else {
            resolve();
          }
        });
      } catch (error) {
        await runQuery(db, 'ROLLBACK').catch(() => {});
        db.close();
        reject(error);
      }
    });
  });
}

/**
 * Get database statistics for validation
 * @param {string} dbPath - Path to database file
 * @returns {Promise<Object>} Statistics object
 */
async function getDatabaseStats(dbPath = path.join(__dirname, '../../data/hextrackr.db')) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, async (err) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        const stats = {};
        
        // Get record counts
        const tables = ['tickets', 'vulnerability_imports', 'vulnerabilities', 'ticket_vulnerabilities'];
        for (const table of tables) {
          const result = await allQuery(db, `SELECT COUNT(*) as count FROM ${table}`);
          stats[table] = result[0].count;
        }

        db.close((closeErr) => {
          if (closeErr) {
            reject(closeErr);
          } else {
            resolve(stats);
          }
        });
      } catch (error) {
        db.close();
        reject(error);
      }
    });
  });
}

module.exports = {
  resetDatabase,
  seedDatabase,
  getDatabaseStats
};