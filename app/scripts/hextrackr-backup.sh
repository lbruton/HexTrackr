#!/bin/bash
#
# HexTrackr Automated Backup Script (Dev Environment)
#
# Adapted from production HEXP-7 implementation
# Performs SQLite online backup with integrity verification
# Retention: 30 days
# Execution: Daily via launchd
#

# Configuration
SOURCE_DB="/Volumes/DATA/GitHub/HexTrackr/app/data/hextrackr.db"
BACKUP_DIR="/Volumes/DATA/GitHub/HexTrackr/backups"
LOG_FILE="/Volumes/DATA/GitHub/HexTrackr/backups/hextrackr_backup.log"
RETENTION_DAYS=30

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Timestamp for backup file
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/hextrackr_$TIMESTAMP.db"

# Log start
echo "========================================" >> "$LOG_FILE"
echo "Backup started: $(date)" >> "$LOG_FILE"

# Check if source database exists
if [ ! -f "$SOURCE_DB" ]; then
    echo "ERROR: Source database not found: $SOURCE_DB" >> "$LOG_FILE"
    exit 1
fi

# Perform SQLite backup using .backup command
echo "Creating backup: $BACKUP_FILE" >> "$LOG_FILE"
sqlite3 "$SOURCE_DB" ".backup '$BACKUP_FILE'"

if [ $? -ne 0 ]; then
    echo "ERROR: Backup failed" >> "$LOG_FILE"
    exit 1
fi

# Verify backup integrity
echo "Verifying backup integrity..." >> "$LOG_FILE"
INTEGRITY_CHECK=$(sqlite3 "$BACKUP_FILE" "PRAGMA integrity_check")

if [ "$INTEGRITY_CHECK" != "ok" ]; then
    echo "ERROR: Integrity check failed: $INTEGRITY_CHECK" >> "$LOG_FILE"
    rm -f "$BACKUP_FILE"
    exit 1
fi

echo "Backup integrity verified: ok" >> "$LOG_FILE"

# Compress backup
echo "Compressing backup..." >> "$LOG_FILE"
gzip "$BACKUP_FILE"

if [ $? -ne 0 ]; then
    echo "ERROR: Compression failed" >> "$LOG_FILE"
    exit 1
fi

echo "Backup compressed: ${BACKUP_FILE}.gz" >> "$LOG_FILE"

# Get backup file size
BACKUP_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
echo "Backup size: $BACKUP_SIZE" >> "$LOG_FILE"

# Clean up old backups (older than retention period)
echo "Cleaning up backups older than $RETENTION_DAYS days..." >> "$LOG_FILE"
DELETED_COUNT=$(find "$BACKUP_DIR" -name "hextrackr_*.db.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
echo "Deleted $DELETED_COUNT old backup(s)" >> "$LOG_FILE"

# Log completion
echo "Backup completed successfully: $(date)" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"

exit 0
