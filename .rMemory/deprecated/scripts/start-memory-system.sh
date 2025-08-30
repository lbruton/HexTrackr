#!/bin/bash

# Simple HexTrackr Memory System Startup
# Based on working deep-chat-analysis.js API setup

echo "🧠 HexTrackr Memory System"
echo "========================="
echo "� $(date)"
echo ""

# Check for .env file and API keys
if [ ! -f ".env" ]; then
    echo "❌ No .env file found!"
    echo "Create .env with: ANTHROPIC_API_KEY=your_key_here"
    exit 1
fi

# Load environment
source .env

if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "❌ ANTHROPIC_API_KEY not set in .env"
    exit 1
fi

echo "✅ API Key: ${ANTHROPIC_API_KEY:0:10}...${ANTHROPIC_API_KEY: -4}"
echo ""

# Check if Ollama is running
if ! pgrep -x "ollama" > /dev/null; then
    echo "⚠️  Ollama not running. Starting now..."
    echo "Run: ollama serve"
    echo ""
else
    echo "✅ Ollama is running"
fi

# Create log directories
mkdir -p .rMemory/logs/{real-time,deep-analysis,prompts,responses}

# Start real-time monitor with verbose logging
LOG_FILE=".rMemory/logs/real-time/monitor-$(date +%Y%m%d-%H%M%S).log"
echo "🚀 Starting real-time monitor with full logging..."
echo "📝 Log file: $LOG_FILE"

# Background process with full output capture
nohup node .rMemory/scribes/real-time-scribe.js 2>&1 | tee "$LOG_FILE" &
MONITOR_PID=$!

echo "✅ Real-time monitor started (PID: $MONITOR_PID)"
echo "� Process: $MONITOR_PID saved to .rMemory/logs/monitor.pid"
echo "$MONITOR_PID" > .rMemory/logs/monitor.pid

echo ""
echo "� To view live logs:"
echo "   tail -f $LOG_FILE"
echo ""
echo "🛑 To stop:"
echo "   kill $MONITOR_PID"
echo ""
echo "⚙️  To setup hourly deep analysis:"
echo "   ./.rMemory/scripts/setup-cron.sh"
