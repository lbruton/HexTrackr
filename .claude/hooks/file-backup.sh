#!/bin/bash

# HexTrackr File Backup Hook
# Creates timestamped backups before file modifications

set -e

PROJECT_DIR="$CLAUDE_PROJECT_DIR"
BACKUP_DIR="$PROJECT_DIR/.claude/backups"

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Read the file path from stdin (Claude Code hook input)
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Exit if no file path provided
if [[ -z "$FILE_PATH" ]]; then
    echo -e "${YELLOW}[Backup]${NC} No file path provided, skipping backup"
    exit 0
fi

# Skip backup for certain file types and patterns
if [[ "$FILE_PATH" =~ \.(log|tmp|cache|DS_Store)$ ]] ||
   [[ "$FILE_PATH" =~ /tmp/ ]] ||
   [[ "$FILE_PATH" =~ /node_modules/ ]] ||
   [[ "$FILE_PATH" =~ /.claude/backups/ ]]; then
    echo -e "${BLUE}[Backup]${NC} Skipping backup for temporary/system file: $(basename "$FILE_PATH")"
    exit 0
fi

# Only backup if file exists
if [[ ! -f "$FILE_PATH" ]]; then
    echo -e "${BLUE}[Backup]${NC} File doesn't exist yet, skipping backup: $(basename "$FILE_PATH")"
    exit 0
fi

# Create backup directory structure
RELATIVE_PATH="${FILE_PATH#$PROJECT_DIR/}"
BACKUP_FILE_DIR="$BACKUP_DIR/$(dirname "$RELATIVE_PATH")"
mkdir -p "$BACKUP_FILE_DIR"

# Generate timestamp
TIMESTAMP=$(date "+%Y%m%d_%H%M%S")
FILENAME=$(basename "$FILE_PATH")
BACKUP_NAME="${FILENAME%.ext}_${TIMESTAMP}.backup"

# Create backup
BACKUP_PATH="$BACKUP_FILE_DIR/$BACKUP_NAME"
cp "$FILE_PATH" "$BACKUP_PATH"

echo -e "${GREEN}[Backup]${NC} ✅ Created backup: .claude/backups/$RELATIVE_PATH/$BACKUP_NAME"

# Clean up old backups (keep last 10 per file)
BACKUP_PATTERN="${FILENAME%.*}_*.backup"
BACKUP_COUNT=$(find "$BACKUP_FILE_DIR" -name "$BACKUP_PATTERN" | wc -l)

if [[ $BACKUP_COUNT -gt 10 ]]; then
    # Remove oldest backups, keep 10 most recent
    find "$BACKUP_FILE_DIR" -name "$BACKUP_PATTERN" -print0 | \
    xargs -0 ls -1t | \
    tail -n +11 | \
    xargs rm -f

    REMOVED_COUNT=$((BACKUP_COUNT - 10))
    echo -e "${BLUE}[Backup]${NC} Cleaned up $REMOVED_COUNT old backup(s)"
fi

# Show backup statistics
TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "*.backup" | wc -l)
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
echo -e "${BLUE}[Backup]${NC} Total backups: $TOTAL_BACKUPS, Size: $BACKUP_SIZE"