#!/bin/bash

# rEngine System Launcher
# Clean wrapper for rEngine one-click startup system

# Get the absolute path to the project directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🚀 rEngine System Launcher"
echo "📁 Project: $PROJECT_DIR"
echo ""

# Change to project directory
cd "$PROJECT_DIR" || {
    echo "❌ Error: Could not change to project directory"
    exit 1
}

# Check if rEngine exists
if [ ! -d "rEngine" ]; then
    echo "❌ Error: rEngine directory not found"
    exit 1
fi

# Check if one-click startup exists
if [ ! -f "rEngine/one-click-startup.js" ]; then
    echo "❌ Error: one-click-startup.js not found in rEngine/"
    exit 1
fi

echo "➡️ Launching rEngine one-click startup system..."
echo ""

# Execute the core startup system
node rEngine/one-click-startup.js "$@"

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ System startup completed successfully!"
else
    echo "❌ Startup failed with exit code: $EXIT_CODE"
fi

exit $EXIT_CODE
