#!/bin/bash

# HexTrackr Memory Import Shell Launcher
# Quick launcher for memory import process in background terminal

PROJECT_PATH="/Volumes/DATA/GitHub/HexTrackr"
APPLESCRIPT_PATH="$PROJECT_PATH/.rMemory/launchers/launch-memory-import.applescript"

echo "🧠 HexTrackr Memory Import Launcher"
echo "📁 Project: $PROJECT_PATH"
echo "🚀 Starting memory import in new Terminal window..."
echo ""

# Verify AppleScript exists
if [ ! -f "$APPLESCRIPT_PATH" ]; then
    echo "❌ Error: AppleScript launcher not found at $APPLESCRIPT_PATH"
    exit 1
fi

# Launch AppleScript in background
osascript "$APPLESCRIPT_PATH" &

echo "✅ Memory import process launched in Terminal.app"
echo "💡 Safe to continue working - import runs in background"
echo "🎯 Check Terminal.app for progress updates"
echo ""
echo "🎉 Launcher complete!"
