#!/bin/bash

# rScribe Search Matrix Integration Startup
# Launches the search matrix manager for automatic function documentation

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🔍 Starting rScribe Search Matrix Manager..."
echo "📂 Project Root: $PROJECT_ROOT"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not found"
    exit 1
fi

# Change to script directory
cd "$SCRIPT_DIR"

# Create logs directory if it doesn't exist
mkdir -p logs

# Function to run full scan
run_scan() {
    echo "🔍 Performing full project scan..."
    node search-matrix-manager.js --scan
    echo "✅ Full scan complete"
}

# Function to start file watcher
start_watcher() {
    echo "👀 Starting file watcher..."
    node search-matrix-manager.js --watch &
    WATCHER_PID=$!
    echo "📝 Watcher PID: $WATCHER_PID"
    echo "$WATCHER_PID" > logs/watcher.pid
    echo "✅ File watcher started"
}

# Function to stop file watcher
stop_watcher() {
    if [ -f logs/watcher.pid ]; then
        local pid=$(cat logs/watcher.pid)
        if ps -p $pid > /dev/null 2>&1; then
            echo "🛑 Stopping file watcher (PID: $pid)..."
            kill $pid
            rm logs/watcher.pid
            echo "✅ File watcher stopped"
        else
            echo "⚠️  Watcher process not found"
            rm logs/watcher.pid
        fi
    else
        echo "⚠️  No watcher PID file found"
    fi
}

# Function to check status
check_status() {
    if [ -f logs/watcher.pid ]; then
        local pid=$(cat logs/watcher.pid)
        if ps -p $pid > /dev/null 2>&1; then
            echo "✅ Search matrix watcher is running (PID: $pid)"
        else
            echo "❌ Search matrix watcher is not running (stale PID file)"
            rm logs/watcher.pid
        fi
    else
        echo "❌ Search matrix watcher is not running"
    fi
    
    # Check search matrix file
    if [ -f "../rMemory/search-matrix/context-matrix.json" ]; then
        local entries=$(jq '. | length' "../rMemory/search-matrix/context-matrix.json" 2>/dev/null || echo "unknown")
        echo "📊 Search matrix entries: $entries"
    else
        echo "📊 Search matrix: not initialized"
    fi
}

# Main command handling
case "${1:-help}" in
    "scan")
        run_scan
        ;;
    "watch")
        start_watcher
        ;;
    "stop")
        stop_watcher
        ;;
    "restart")
        stop_watcher
        sleep 2
        start_watcher
        ;;
    "status")
        check_status
        ;;
    "init")
        echo "🚀 Initializing rScribe Search Matrix..."
        run_scan
        start_watcher
        echo "✅ Initialization complete"
        ;;
    "help"|*)
        echo "rScribe Search Matrix Manager"
        echo ""
        echo "Commands:"
        echo "  scan     - Perform full project scan to build search matrix"
        echo "  watch    - Start file watcher for automatic updates"
        echo "  stop     - Stop the file watcher"
        echo "  restart  - Restart the file watcher"
        echo "  status   - Check watcher status and matrix stats"
        echo "  init     - Full initialization (scan + watch)"
        echo "  help     - Show this help message"
        echo ""
        echo "Integration with rEngine MCP:"
        echo "  The search matrix integrates with rEngine's rapid_context_search tool"
        echo "  Automatic function documentation updates the context clues"
        echo "  Use 'init' for first-time setup"
        ;;
esac
