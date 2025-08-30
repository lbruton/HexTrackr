#!/bin/bash

# rEngineMCP Quick Restart Script
# Stops any running rEngineMCP processes and starts a new one

echo "🔄 rEngineMCP Restart"
echo "===================="

# Kill any existing rEngineMCP processes
echo "Stopping existing rEngineMCP processes..."
pkill -f "node.*rEngineMCP.*index\.js" 2>/dev/null

# Wait a moment for cleanup
sleep 2

# Start fresh rEngineMCP instance
echo "Starting rEngineMCP with Mac Mini optimizations..."
cd /Volumes/DATA/GitHub/rEngine/rEngineMCP

# Start in background with logging
nohup /opt/homebrew/bin/node /Volumes/DATA/GitHub/rEngine/rEngineMCP/index.js > rengine.log 2>&1 &
RENGINE_PID=$!

echo "✅ rEngineMCP started with PID: $RENGINE_PID"
echo "📋 Log file: /Volumes/DATA/GitHub/rEngine/rEngineMCP/rengine.log"

# Give it a moment to initialize
sleep 3

# Check if it's running properly
if kill -0 $RENGINE_PID 2>/dev/null; then
    echo "✅ rEngineMCP is running successfully"
    echo ""
    echo "🎯 Next Steps:"
    echo "   1. Restart VS Code to connect to MCP server"
    echo "   2. Use MCP tools like 'rengine_tag_in_ollama'"
    echo "   3. Test with: 'Hello Ollama, remember this test!'"
else
    echo "❌ rEngineMCP failed to start - check rengine.log for errors"
fi
