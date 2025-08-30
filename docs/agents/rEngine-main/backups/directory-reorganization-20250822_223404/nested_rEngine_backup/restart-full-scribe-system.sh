#!/bin/bash

# StackTrackr Full Scribe System Restart
# Ensures both Smart Scribe (Ollama) and Split Console are running

echo "🔄 Restarting Full Scribe System..."
echo "═══════════════════════════════════════════════════════════"

# Kill existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "smart-scribe.js" 2>/dev/null
pkill -f "split-scribe-console.js" 2>/dev/null
pkill -f "scribe-console.js" 2>/dev/null
sleep 2

# Start Smart Scribe (Ollama agent) in background
echo "🤖 Starting Smart Scribe (Ollama/Qwen2.5-Coder)..."
cd /Volumes/DATA/GitHub/rEngine/rEngine
nohup node smart-scribe.js > smart-scribe-startup.log 2>&1 &
SMART_SCRIBE_PID=$!
echo "   ✅ Smart Scribe PID: $SMART_SCRIBE_PID"

# Wait a moment for Smart Scribe to initialize
sleep 3

# Start Split Console (Visual monitoring)
echo "📺 Starting Split Console (Visual monitoring)..."
./auto-launch-split-scribe.sh

# Verify both are running
echo ""
echo "🔍 Verification:"
if ps -p $SMART_SCRIBE_PID > /dev/null 2>&1; then
    echo "   ✅ Smart Scribe: Running (PID: $SMART_SCRIBE_PID)"
else
    echo "   ❌ Smart Scribe: Failed to start"
fi

CONSOLE_PID=$(pgrep -f "split-scribe-console.js")
if [ ! -z "$CONSOLE_PID" ]; then
    echo "   ✅ Split Console: Running (PID: $CONSOLE_PID)"
else
    echo "   ❌ Split Console: Failed to start"
fi

echo ""
echo "🎉 Full Scribe System Restart Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 What's Running:"
echo "   🤖 Smart Scribe: Conversation logging, memory optimization, knowledge graphs"
echo "   📺 Split Console: Real-time visual monitoring of memory operations"
echo "   🔗 Integration: Both systems work together for complete agent intelligence"
echo ""
echo "💡 You should now see:"
echo "   • Memory JSON files being updated in real-time"
echo "   • Conversation analysis and optimization"
echo "   • Visual console showing all agent activity"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
