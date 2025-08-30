#!/bin/bash

# ============================================================================
# 🍎 AppleScript Auto-Launcher for Enhanced Scribe Console
# ============================================================================
# This script automatically launches the Enhanced Scribe Console in an AppleScript Terminal
# ensuring the pink flower emoji terminal is always used

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONSOLE_SCRIPT="${SCRIPT_DIR}/enhanced-scribe-console.js"

# Check if we're already running in an AppleScript terminal
if [[ -z "$APPLESCRIPT_TERMINAL" ]]; then
    echo "🍎 Launching Enhanced Scribe Console in AppleScript Terminal..."
    
    # Use AppleScript to launch the console in a new Terminal window
    osascript << EOF
tell application "Terminal"
    activate
    set newTab to do script "export APPLESCRIPT_TERMINAL=1 && cd '$SCRIPT_DIR' && node enhanced-scribe-console.js"
    
    -- Set window properties for Enhanced Scribe Console
    set custom title of newTab to "🌸 Enhanced Scribe Console - rEngine"
    set background color of newTab to {65535, 52428, 58982}  -- Light pink background
    set normal text color of newTab to {0, 0, 0}             -- Black text
    
    -- Set window to a comfortable size for console interface
    set bounds of window 1 to {100, 100, 1200, 800}         -- Extra large window for console
end tell
EOF
    
    echo "✅ Enhanced Scribe Console launched in AppleScript Terminal"
    exit 0
else
    echo "✅ Already running in AppleScript Terminal - Starting Enhanced Scribe Console..."
    exec node "${CONSOLE_SCRIPT}"
fi
