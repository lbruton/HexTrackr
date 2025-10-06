#!/usr/bin/env node

/**
 * Set Admin Password to Magellan123!
 *
 * Updates the admin user password with Argon2id hashing
 */

const argon2 = require('argon2');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../app/data/hextrackr.db');
const NEW_PASSWORD = 'Magellan123!';

async function setAdminPassword() {
    console.log('🔐 Setting admin password to Magellan123!...\n');

    // Open database
    const db = new sqlite3.Database(DB_PATH);

    try {
        // Hash the new password with Argon2id (matching init-database.js settings)
        const passwordHash = await argon2.hash(NEW_PASSWORD, {
            type: argon2.argon2id,
            memoryCost: 19456,  // Match init-database.js
            timeCost: 2,
            parallelism: 1
        });

        console.log('✅ Password hashed successfully');
        console.log('   Hash:', passwordHash.substring(0, 50) + '...\n');

        // Update admin password and reset failed attempts
        db.run(
            `UPDATE users
             SET password_hash = ?,
                 failed_attempts = 0,
                 failed_login_timestamp = NULL
             WHERE username = 'admin'`,
            [passwordHash],
            function(err) {
                if (err) {
                    console.error('❌ Error updating password:', err.message);
                    process.exit(1);
                }

                if (this.changes === 0) {
                    console.error('❌ No admin user found to update');
                    process.exit(1);
                }

                console.log('✅ Admin password updated successfully!\n');

                // Verify admin user
                db.get(
                    'SELECT id, username, email, role FROM users WHERE username = ?',
                    ['admin'],
                    (err, user) => {
                        if (err) {
                            console.error('❌ Error verifying user:', err.message);
                            process.exit(1);
                        }

                        console.log('═══════════════════════════════════════════════════════');
                        console.log('👤 ADMIN USER VERIFIED');
                        console.log('═══════════════════════════════════════════════════════');
                        console.log('ID:', user.id);
                        console.log('Username:', user.username);
                        console.log('Email:', user.email);
                        console.log('Role:', user.role);
                        console.log('═══════════════════════════════════════════════════════');
                        console.log('');
                        console.log('🔑 NEW ADMIN CREDENTIALS');
                        console.log('═══════════════════════════════════════════════════════');
                        console.log('Username: admin');
                        console.log('Password: Magellan123!');
                        console.log('═══════════════════════════════════════════════════════\n');

                        db.close();
                        process.exit(0);
                    }
                );
            }
        );

    } catch (error) {
        console.error('❌ Password update failed:', error.message);
        db.close();
        process.exit(1);
    }
}

setAdminPassword();
