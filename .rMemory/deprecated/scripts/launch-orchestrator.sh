#!/bin/bash
# HexTrackr Semantic Orchestrator Launcher
# Runs the memory processing in a separate terminal to avoid blocking

echo "🚀 Starting HexTrackr Semantic Memory Orchestrator..."
echo "This will process 2.5 weeks of chat history + rEngine backups"
echo ""

# Make sure the script is executable
chmod +x .rMemory/core/semantic-orchestrator.js

# Create log file for monitoring
LOG_FILE=".rMemory/logs/orchestrator-$(date +%Y%m%d-%H%M%S).log"
mkdir -p .rMemory/logs

echo "📝 Logging to: $LOG_FILE"
echo "🖥️  You can monitor progress with: tail -f $LOG_FILE"
echo ""

# Run in background with logging
nohup node .rMemory/core/semantic-orchestrator.js > "$LOG_FILE" 2>&1 &
ORCHESTRATOR_PID=$!

echo "🔄 Orchestrator started with PID: $ORCHESTRATOR_PID"
echo "📊 Processing will take several minutes due to Ollama analysis..."
echo ""
echo "🔍 Commands to monitor:"
echo "   tail -f $LOG_FILE                    # Watch live output"
echo "   ps aux | grep semantic-orchestrator  # Check if running"
echo "   kill $ORCHESTRATOR_PID              # Stop if needed"
echo ""
echo "📁 Results will be saved to:"
echo "   .rMemory/json/chat-evidence.json     # All evidence items"
echo "   .rMemory/json/canonical-notes.json   # Reconciled notes"
echo "   .rMemory/json/symbols-table.json     # Complete codebase symbols"
echo "   .rMemory/json/time-summaries.json    # 10/30/60 min summaries"
echo "   .rMemory/json/memento-import.json    # Ready for Memento MCP"
echo ""

# Wait a moment to see if it starts successfully
sleep 2

if ps -p $ORCHESTRATOR_PID > /dev/null; then
    echo "✅ Orchestrator is running successfully!"
    echo "🔄 Processing large dataset - this will take several minutes..."
    echo ""
    echo "📈 Expected processing:"
    echo "   - VS Code chat logs (all history)"
    echo "   - rEngine backup files from docs/agents/"
    echo "   - Complete HexTrackr symbols table"
    echo "   - Ollama reconciliation with qwen2.5-coder:7b"
    echo "   - Time-based summaries generation"
    echo ""
    echo "🎯 When complete, memory system will be HUGE!"
else
    echo "❌ Failed to start orchestrator"
    echo "🔧 Check the log file for details: $LOG_FILE"
    exit 1
fi
