#!/bin/bash
# Real-time monitor for semantic orchestrator
# Shows live output in Apple Terminal

echo "📺 HexTrackr Memory Orchestrator - Real-time Monitor"
echo "=================================================="
echo ""

# Find the latest log file
LATEST_LOG=$(ls -t .rMemory/logs/orchestrator-*.log 2>/dev/null | head -n1)

if [ -z "$LATEST_LOG" ]; then
    echo "❌ No orchestrator log files found"
    echo "🚀 Start the orchestrator first with: ./.rMemory/scripts/launch-orchestrator.sh"
    exit 1
fi

echo "📝 Monitoring: $LATEST_LOG"
echo "⌨️  Press Ctrl+C to stop monitoring"
echo ""

# Show real-time output with colors
tail -f "$LATEST_LOG" | while IFS= read -r line; do
    # Color coding for different types of output
    if [[ $line == *"✅"* ]]; then
        echo -e "\033[32m$line\033[0m"  # Green for success
    elif [[ $line == *"❌"* ]] || [[ $line == *"⚠️"* ]]; then
        echo -e "\033[31m$line\033[0m"  # Red for errors/warnings
    elif [[ $line == *"🔍"* ]] || [[ $line == *"📖"* ]] || [[ $line == *"🔄"* ]]; then
        echo -e "\033[34m$line\033[0m"  # Blue for processing
    elif [[ $line == *"📊"* ]] || [[ $line == *"📈"* ]] || [[ $line == *"📋"* ]]; then
        echo -e "\033[33m$line\033[0m"  # Yellow for stats
    else
        echo "$line"  # Default color
    fi
done
