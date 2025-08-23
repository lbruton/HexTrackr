#!/bin/bash

# HexTrackr Local Server Startup Script
# This starts a simple HTTP server to avoid CORS issues

echo "🚀 Starting HexTrackr Local Server..."
echo "📁 Directory: $(pwd)"
echo "🌐 URL: http://localhost:8000"
echo "⏹️  Press Ctrl+C to stop"
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "Using Python 3..."
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "Using Python..."
    python -m http.server 8000
else
    echo "❌ Python not found. Please install Python or use another method."
    echo "Alternative: Install Node.js and run: npx http-server -p 8000"
fi
