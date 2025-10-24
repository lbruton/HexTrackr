#!/bin/bash
# ============================================================================
# DEPRECATED as of v1.1.5 (2025-10-24)
# ============================================================================
# This script is no longer used in the documentation workflow.
# Theme injection is now handled by html-content-updater.js (Step 9).
#
# Migration: Use `npm run release` for complete documentation generation.
# The theme injection now runs automatically as part of the unified workflow.
#
# Removal: Scheduled for deletion in v1.2.0
# Reference: HEX-341
# ============================================================================

# Wrapper script to handle problematic app/package.json
# NOTE: This functionality is preserved for manual execution only

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_PKG_JSON="$SCRIPT_DIR/../package.json"

# Display deprecation warning
echo "⚠️  WARNING: This script is DEPRECATED as of v1.1.5"
echo "   Use 'npm run release' instead for automated theme injection"
echo "   Continuing with manual execution..."
echo ""

# Check if app/package.json exists and is problematic
if [ -f "$APP_PKG_JSON" ]; then
    # Check if it's empty or invalid
    if [ ! -s "$APP_PKG_JSON" ] || ! node -e "JSON.parse(require('fs').readFileSync('$APP_PKG_JSON', 'utf8'))" 2>/dev/null; then
        # Temporarily move it
        mv "$APP_PKG_JSON" "$APP_PKG_JSON.bak" 2>/dev/null
        node "$SCRIPT_DIR/inject-jsdoc-theme.js"
        EXIT_CODE=$?
        mv "$APP_PKG_JSON.bak" "$APP_PKG_JSON" 2>/dev/null
        exit $EXIT_CODE
    fi
fi

# Normal execution if package.json is valid or doesn't exist
node "$SCRIPT_DIR/inject-jsdoc-theme.js"