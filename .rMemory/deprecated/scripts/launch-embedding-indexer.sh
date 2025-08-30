#!/bin/bash
# HexTrackr Embedding Indexer Launcher
# Runs nomic-embed-text indexer alongside semantic-orchestrator.js

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
INDEXER_SCRIPT="$PROJECT_ROOT/.rMemory/core/embedding-indexer.js"
LOG_DIR="$PROJECT_ROOT/.rMemory/logs"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
LOG_FILE="$LOG_DIR/embedding-indexer-$TIMESTAMP.log"

echo "🧠 HexTrackr Embedding Indexer Launcher"
echo "======================================"
echo "📁 Project Root: $PROJECT_ROOT"
echo "🔧 Indexer Script: $INDEXER_SCRIPT"
echo "📝 Log File: $LOG_FILE"
echo

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Check if nomic-embed-text is available
echo "🔍 Checking nomic-embed-text availability..."
if ! ollama list | grep -q "nomic-embed-text"; then
    echo "⚠️  nomic-embed-text not found. Installing..."
    ollama pull nomic-embed-text:latest
    echo "✅ nomic-embed-text installed"
fi

# Check if Ollama is running
if ! pgrep -f "ollama serve" > /dev/null; then
    echo "❌ Ollama is not running. Please start Ollama first."
    exit 1
fi

echo "🚀 Starting embedding indexer in background..."

# Start the indexer in background
cd "$PROJECT_ROOT"
nohup node "$INDEXER_SCRIPT" > "$LOG_FILE" 2>&1 &
INDEXER_PID=$!

echo "✅ Embedding indexer started!"
echo "📊 Process ID: $INDEXER_PID"
echo "📝 Log file: $LOG_FILE"
echo "📈 Monitor with: tail -f $LOG_FILE"
echo
echo "🔄 This indexer will run continuously alongside the orchestrator"
echo "🧠 Using: nomic-embed-text:latest for vector embeddings"
echo "📊 Building: search-matrix/ with similarity indexes"
echo
echo "⌨️  To stop: kill $INDEXER_PID"

# Save PID for monitoring
echo "$INDEXER_PID" > "$LOG_DIR/embedding-indexer.pid"
echo "💾 PID saved to: $LOG_DIR/embedding-indexer.pid"
