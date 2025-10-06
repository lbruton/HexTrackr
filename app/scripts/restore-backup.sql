-- Database Restoration SQL Script
-- Attach backup database and copy all tables except users

-- .echo on (SQLite shell command - comment out for standard SQL compatibility)
-- .mode column (SQLite shell command - comment out for standard SQL compatibility)

-- Attach the backup database
ATTACH DATABASE '/Volumes/DATA/GitHub/HexTrackr/app/data/hextrackr-backup-20250929-235802.db' AS backup;

SELECT '═══════════════════════════════════════════════════════';
SELECT '📥 RESTORING DATA FROM BACKUP';
SELECT '═══════════════════════════════════════════════════════';
SELECT '';

-- tickets table
SELECT '📋 Restoring tickets table...';
DELETE FROM tickets;
INSERT INTO tickets SELECT * FROM backup.tickets;
SELECT '   ✅ Restored ' || COUNT(*) || ' tickets' FROM tickets;
SELECT '';

-- vulnerability_imports table
SELECT '📋 Restoring vulnerability_imports table...';
DELETE FROM vulnerability_imports;
INSERT INTO vulnerability_imports SELECT * FROM backup.vulnerability_imports;
SELECT '   ✅ Restored ' || COUNT(*) || ' imports' FROM vulnerability_imports;
SELECT '';

-- vulnerabilities table (legacy)
SELECT '📋 Restoring vulnerabilities table...';
DELETE FROM vulnerabilities;
INSERT INTO vulnerabilities SELECT * FROM backup.vulnerabilities;
SELECT '   ✅ Restored ' || COUNT(*) || ' legacy vulnerabilities' FROM vulnerabilities;
SELECT '';

-- ticket_vulnerabilities junction table
SELECT '📋 Restoring ticket_vulnerabilities junction table...';
DELETE FROM ticket_vulnerabilities;
INSERT INTO ticket_vulnerabilities SELECT * FROM backup.ticket_vulnerabilities;
SELECT '   ✅ Restored ' || COUNT(*) || ' ticket-vulnerability links' FROM ticket_vulnerabilities;
SELECT '';

-- vulnerability_snapshots table
SELECT '📋 Restoring vulnerability_snapshots table...';
DELETE FROM vulnerability_snapshots;
INSERT INTO vulnerability_snapshots SELECT * FROM backup.vulnerability_snapshots;
SELECT '   ✅ Restored ' || COUNT(*) || ' snapshots' FROM vulnerability_snapshots;
SELECT '';

-- vulnerabilities_current table (CRITICAL)
SELECT '📋 Restoring vulnerabilities_current table...';
DELETE FROM vulnerabilities_current;
INSERT INTO vulnerabilities_current SELECT * FROM backup.vulnerabilities_current;
SELECT '   ✅ Restored ' || COUNT(*) || ' current vulnerabilities' FROM vulnerabilities_current;
SELECT '';

-- vulnerability_daily_totals table
SELECT '📋 Restoring vulnerability_daily_totals table...';
DELETE FROM vulnerability_daily_totals;
INSERT INTO vulnerability_daily_totals SELECT * FROM backup.vulnerability_daily_totals;
SELECT '   ✅ Restored ' || COUNT(*) || ' daily totals' FROM vulnerability_daily_totals;
SELECT '';

-- vulnerability_staging table
SELECT '📋 Restoring vulnerability_staging table...';
DELETE FROM vulnerability_staging;
INSERT INTO vulnerability_staging SELECT * FROM backup.vulnerability_staging;
SELECT '   ✅ Restored ' || COUNT(*) || ' staging records' FROM vulnerability_staging;
SELECT '';

-- email_templates table
SELECT '📋 Restoring email_templates table...';
DELETE FROM email_templates;
INSERT INTO email_templates SELECT * FROM backup.email_templates;
SELECT '   ✅ Restored ' || COUNT(*) || ' email templates' FROM email_templates;
SELECT '';

-- kev_status table
SELECT '📋 Restoring kev_status table...';
DELETE FROM kev_status;
INSERT INTO kev_status SELECT * FROM backup.kev_status;
SELECT '   ✅ Restored ' || COUNT(*) || ' KEV records' FROM kev_status;
SELECT '';

-- sync_metadata table
SELECT '📋 Restoring sync_metadata table...';
DELETE FROM sync_metadata;
INSERT INTO sync_metadata SELECT * FROM backup.sync_metadata;
SELECT '   ✅ Restored ' || COUNT(*) || ' sync metadata' FROM sync_metadata;
SELECT '';

-- ticket_templates table
SELECT '📋 Restoring ticket_templates table...';
DELETE FROM ticket_templates;
INSERT INTO ticket_templates SELECT * FROM backup.ticket_templates;
SELECT '   ✅ Restored ' || COUNT(*) || ' ticket templates' FROM ticket_templates;
SELECT '';

-- vulnerability_templates table
SELECT '📋 Restoring vulnerability_templates table...';
DELETE FROM vulnerability_templates;
INSERT INTO vulnerability_templates SELECT * FROM backup.vulnerability_templates;
SELECT '   ✅ Restored ' || COUNT(*) || ' vulnerability templates' FROM vulnerability_templates;
SELECT '';

-- Detach backup
DETACH backup;

SELECT '';
SELECT '═══════════════════════════════════════════════════════';
SELECT '✅ DATA RESTORATION COMPLETE';
SELECT '═══════════════════════════════════════════════════════';
SELECT '';

-- Verify admin user exists
SELECT '👤 Admin User Status:';
SELECT '   Username: ' || username, '   Email: ' || email, '   Role: ' || role FROM users WHERE username = 'admin';
SELECT '';
