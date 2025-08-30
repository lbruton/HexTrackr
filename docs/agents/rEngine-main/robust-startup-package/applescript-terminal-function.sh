#!/bin/bash

# ============================================================================
# 🍎 Universal AppleScript Terminal Launcher Function
# ============================================================================
# Add this function to any script to make it auto-launch in AppleScript Terminal
# Usage: Just call ensure_applescript_terminal at the top of your script

ensure_applescript_terminal() {
    local SCRIPT_PATH="$1"
    local WINDOW_TITLE="$2"
    local SCRIPT_ARGS="${@:3}"  # All arguments after the second
    
    # Default values
    SCRIPT_PATH="${SCRIPT_PATH:-$0}"
    WINDOW_TITLE="${WINDOW_TITLE:-🌸 rEngine Terminal}"
    
    # Check if we're already running in an AppleScript terminal
    if [[ -z "$APPLESCRIPT_TERMINAL" ]]; then
        echo "🍎 Launching in AppleScript Terminal..."
        
        # Get the directory of the script
        local SCRIPT_DIR="$(cd "$(dirname "${SCRIPT_PATH}")" && pwd)"
        local SCRIPT_NAME="$(basename "${SCRIPT_PATH}")"
        
        # Build the command to run
        local COMMAND="export APPLESCRIPT_TERMINAL=1 && cd '$SCRIPT_DIR' && "
        
        # Check if it's a bash script or node script
        if [[ "$SCRIPT_NAME" == *.js ]]; then
            COMMAND+="node '$SCRIPT_NAME'"
        else
            COMMAND+="chmod +x '$SCRIPT_NAME' && ./'$SCRIPT_NAME'"
        fi
        
        # Add any additional arguments
        if [[ -n "$SCRIPT_ARGS" ]]; then
            COMMAND+=" $SCRIPT_ARGS"
        fi
        
        # Use AppleScript to launch in a new Terminal window
        osascript << EOF
tell application "Terminal"
    activate
    set newTab to do script "$COMMAND"
    
    -- Set window properties
    set custom title of newTab to "$WINDOW_TITLE"
    set background color of newTab to {65535, 52428, 58982}  -- Light pink background
    set normal text color of newTab to {0, 0, 0}             -- Black text
    
    -- Set window to a comfortable size (width x height in pixels)
    set bounds of window 1 to {100, 100, 1000, 700}         -- Large, comfortable window
end tell
EOF
        
        echo "✅ Launched in AppleScript Terminal"
        exit 0
    else
        echo "✅ Already running in AppleScript Terminal"
        return 0  # Continue with the script
    fi
}

# Example usage:
# ensure_applescript_terminal "$0" "🌸 My Script Title" "$@"
