#!/bin/bash

# One-Click Startup Script for StackTrackr
# Launches all necessary components in separate terminal windows.

# Get the absolute path to the project directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Starting the entire StackTrackr development environment..."
echo "This will open multiple terminal windows."

# 1. Launch Docker Environment
echo "➡️ Launching Docker environment..."
"$SCRIPT_DIR/start-environment.sh"
sleep 3 # Give the system time to process the first osascript command

# 2. Launch Split Scribe Console (Verbose Log)
echo "➡️ Launching Split Scribe console..."
"$SCRIPT_DIR/rEngine/auto-launch-split-scribe.sh"
sleep 3 # Give the system time to process the second osascript command

echo "✅ All systems launched! Please check the new Terminal windows."
