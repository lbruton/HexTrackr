#!/bin/bash

# Smart Documentation System Launcher
# Launches both the documentation generator and enhanced scribe console

echo "🚀 Launching Smart Documentation System..."

# Check if Ollama is running
if ! pgrep -x "ollama" > /dev/null; then
    echo "⚠️  Ollama not running. Starting Ollama..."
    ollama serve &
    sleep 3
fi

# Launch the AppleScript that opens dedicated terminals
osascript launch-smart-docs.applescript

echo "✅ Smart Documentation System launched!"
echo "📖 Documentation will be available at: technical-docs/index.html"
echo "🌸 Enhanced Scribe Console is running in dedicated terminals"
