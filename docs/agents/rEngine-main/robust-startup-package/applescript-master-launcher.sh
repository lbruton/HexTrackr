#!/bin/bash

# ============================================================================
# 🍎 AppleScript Auto-Launcher for rEngine Master Launcher
# ============================================================================
# This script automatically launches itself in an AppleScript Terminal window
# ensuring the pink flower emoji terminal is always used

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAUNCHER_SCRIPT="${SCRIPT_DIR}/master-launcher.sh"

# Check if we're already running in an AppleScript terminal
# We can detect this by checking if we have the APPLESCRIPT_TERMINAL env var
if [[ -z "$APPLESCRIPT_TERMINAL" ]]; then
    echo "🍎 Launching in AppleScript Terminal..."
    
    # Use AppleScript to launch the master launcher in a new Terminal window
    osascript << EOF
tell application "Terminal"
    activate
    set newTab to do script "export APPLESCRIPT_TERMINAL=1 && cd '$SCRIPT_DIR' && chmod +x master-launcher.sh && ./master-launcher.sh"
    
    -- Set window properties for rEngine
    set custom title of newTab to "🌸 rEngine Master Launcher"
    set background color of newTab to {65535, 52428, 58982}  -- Light pink background
    set normal text color of newTab to {0, 0, 0}             -- Black text
    
    -- Set window to a comfortable size (width x height in pixels)
    set bounds of window 1 to {100, 100, 1000, 700}         -- Large, comfortable window
end tell
EOF
    
    echo "✅ Launched in AppleScript Terminal with pink flower theme"
    exit 0
else
    echo "✅ Already running in AppleScript Terminal"
    exec "${LAUNCHER_SCRIPT}"
fi
