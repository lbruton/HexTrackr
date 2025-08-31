#!/bin/bash

# FileScopeMCP Startup Script for HexTrackr
# Usage: ./start-filescope-mcp.sh

FILESCOPE_DIR="/Volumes/DATA/GitHub/FileScopeMCP-evaluation"
HEXTRACKR_DIR="/Volumes/DATA/GitHub/HexTrackr"
LOG_DIR="$HOME/.filescope-mcp/logs"

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

echo "Starting FileScopeMCP server..."
echo "FileScopeMCP Directory: $FILESCOPE_DIR"
echo "HexTrackr Project Directory: $HEXTRACKR_DIR"
echo "Logs will be written to: $LOG_DIR"

# Check if directories exist
if [ ! -d "$FILESCOPE_DIR" ]; then
    echo "Error: FileScopeMCP directory not found at $FILESCOPE_DIR"
    exit 1
fi

if [ ! -d "$HEXTRACKR_DIR" ]; then
    echo "Error: HexTrackr directory not found at $HEXTRACKR_DIR"
    exit 1
fi

# Check if the MCP server file exists
if [ ! -f "$FILESCOPE_DIR/dist/mcp-server.js" ]; then
    echo "Error: MCP server not found at $FILESCOPE_DIR/dist/mcp-server.js"
    echo "Please run 'npm run build' in the FileScopeMCP directory first."
    exit 1
fi

echo "Starting FileScopeMCP server with base directory: $HEXTRACKR_DIR"
echo "Press Ctrl+C to stop the server"
echo "----------------------------------------"

# Start the server
cd "$FILESCOPE_DIR"
node dist/mcp-server.js --base-dir="$HEXTRACKR_DIR"
