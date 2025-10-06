#!/usr/bin/env node

/**
 * Database Restoration Script
 *
 * Restores data from backup database to fresh database, excluding users table.
 * Then sets admin password to ***REMOVED***
 *
 * Usage: node app/scripts/restore-from-backup.js
 */

const Database = require('better-sqlite3');
const argon2 = require('argon2');
const path = require('path');

const BACKUP_DB = path.join(__dirname, '../../app/data/hextrackr-backup-20250929-235802.db');
const TARGET_DB = path.join(__dirname, '../../app/data/hextrackr.db');
const NEW_PASSWORD = '***REMOVED***';

async function restoreDatabase() {
    console.log('🔄 Starting database restoration...\n');

    // Open both databases
    const backup = new Database(BACKUP_DB, { readonly: true });
    const target = new Database(TARGET_DB);

    try {
        // Get list of tables from backup (excluding users)
        const tables = backup.prepare(`
            SELECT name FROM sqlite_master
            WHERE type='table'
            AND name NOT LIKE 'sqlite_%'
            AND name != 'users'
            ORDER BY name
        `).all();

        console.log(`📋 Found ${tables.length} tables to restore:\n`);

        for (const { name } of tables) {
            try {
                // Get row count from backup
                const backupCount = backup.prepare(`SELECT COUNT(*) as count FROM ${name}`).get();

                if (backupCount.count === 0) {
                    console.log(`⏭️  Skipping empty table: ${name}`);
                    continue;
                }

                console.log(`📥 Restoring table: ${name} (${backupCount.count} rows)`);

                // Clear target table
                target.prepare(`DELETE FROM ${name}`).run();

                // Get column info
                const columns = backup.prepare(`PRAGMA table_info(${name})`).all();
                const columnNames = columns.map(c => c.name).join(', ');
                const placeholders = columns.map(() => '?').join(', ');

                // Prepare insert statement
                const insertStmt = target.prepare(`INSERT INTO ${name} (${columnNames}) VALUES (${placeholders})`);

                // Copy data in batches
                const batchSize = 1000;
                const allRows = backup.prepare(`SELECT * FROM ${name}`).all();

                const insertMany = target.transaction((rows) => {
                    for (const row of rows) {
                        const values = columns.map(c => row[c.name]);
                        insertStmt.run(...values);
                    }
                });

                // Process in batches
                for (let i = 0; i < allRows.length; i += batchSize) {
                    const batch = allRows.slice(i, i + batchSize);
                    insertMany(batch);
                }

                // Verify
                const targetCount = target.prepare(`SELECT COUNT(*) as count FROM ${name}`).get();
                console.log(`   ✅ Restored ${targetCount.count} rows\n`);

            } catch (error) {
                console.error(`   ❌ Error restoring ${name}:`, error.message);
            }
        }

        console.log('\n🔐 Setting admin password to ***REMOVED***...\n');

        // Hash the new password with Argon2id
        const passwordHash = await argon2.hash(NEW_PASSWORD, {
            type: argon2.argon2id,
            memoryCost: 19456,
            timeCost: 2,
            parallelism: 1
        });

        // Update admin password
        const updateResult = target.prepare(`
            UPDATE users
            SET password_hash = ?,
                failed_login_count = 0,
                failed_login_timestamp = NULL
            WHERE username = 'admin'
        `).run(passwordHash);

        if (updateResult.changes > 0) {
            console.log('✅ Admin password updated successfully!\n');
        } else {
            console.error('❌ Failed to update admin password - user not found\n');
        }

        // Verify admin user
        const admin = target.prepare('SELECT id, username, email, role FROM users WHERE username = ?').get('admin');
        console.log('👤 Admin User Details:');
        console.log('   ID:', admin.id);
        console.log('   Username:', admin.username);
        console.log('   Email:', admin.email);
        console.log('   Role:', admin.role);
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('🔑 NEW ADMIN CREDENTIALS');
        console.log('═══════════════════════════════════════════════════════');
        console.log('Username: admin');
        console.log('Password: ***REMOVED***');
        console.log('═══════════════════════════════════════════════════════\n');

    } finally {
        backup.close();
        target.close();
        console.log('✅ Database restoration completed!\n');
    }
}

restoreDatabase().catch(error => {
    console.error('❌ Restoration failed:', error);
    process.exit(1);
});
