#!/bin/bash

# HexTrackr Chat Log Archaeology Terminal Launcher
# Shell wrapper for AppleScript launcher
# Usage: ./launch-archaeology.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
APPLESCRIPT_FILE="$SCRIPT_DIR/launch-archaeology-terminal.applescript"

echo "🏺 HexTrackr Chat Log Archaeology Launcher"
echo "📁 Project: $PROJECT_ROOT"
echo "🍎 AppleScript: $APPLESCRIPT_FILE"
echo ""

# Check if AppleScript file exists
if [ ! -f "$APPLESCRIPT_FILE" ]; then
    echo "❌ Error: AppleScript file not found at $APPLESCRIPT_FILE"
    exit 1
fi

# Check if we're on macOS
if [ "$(uname)" != "Darwin" ]; then
    echo "❌ Error: This launcher requires macOS"
    echo "   On other platforms, run directly: node scripts/chat-log-archaeology.js"
    exit 1
fi

# Execute the AppleScript
echo "🚀 Launching Terminal.app with archaeology script..."
osascript "$APPLESCRIPT_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Terminal.app launched successfully"
    echo "📺 Check Terminal.app for archaeology progress"
else
    echo "❌ Failed to launch Terminal.app"
    echo "🔧 Try running directly: osascript $APPLESCRIPT_FILE"
    exit 1
fi
