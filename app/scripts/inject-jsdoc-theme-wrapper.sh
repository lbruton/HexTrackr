#!/bin/bash
# Wrapper script to handle problematic app/package.json

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_PKG_JSON="$SCRIPT_DIR/../package.json"

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