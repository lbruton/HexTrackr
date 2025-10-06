#!/usr/bin/env node

/**
 * Test Password Verification
 */

const argon2 = require('argon2');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../app/data/hextrackr.db');
const TEST_PASSWORD = '***REMOVED***';

async function testPasswordVerify() {
    console.log('🔍 Testing password verification...\n');

    const db = new sqlite3.Database(DB_PATH);

    db.get('SELECT password_hash FROM users WHERE username = ?', ['admin'], async (err, row) => {
        if (err) {
            console.error('❌ Database error:', err.message);
            process.exit(1);
        }

        if (!row) {
            console.error('❌ Admin user not found');
            process.exit(1);
        }

        console.log('📋 Password hash from database:');
        console.log(row.password_hash);
        console.log('\n🔐 Testing password: ' + TEST_PASSWORD);
        console.log('');

        try {
            const isValid = await argon2.verify(row.password_hash, TEST_PASSWORD);

            if (isValid) {
                console.log('✅ PASSWORD VERIFICATION SUCCESSFUL!');
                console.log('   The password "***REMOVED***" is correct\n');
            } else {
                console.log('❌ PASSWORD VERIFICATION FAILED');
                console.log('   The password "***REMOVED***" does not match\n');
            }

        } catch (error) {
            console.error('❌ Verification error:', error.message);
        }

        db.close();
    });
}

testPasswordVerify();
