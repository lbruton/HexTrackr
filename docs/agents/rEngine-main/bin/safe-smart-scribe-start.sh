#!/bin/bash

# Safe Smart Scribe Startup Script with Memory and Process Monitoring
# Created to prevent multiple scribe instances and memory conflicts

# Set Ollama to use external drive storage and enforce single instance
export OLLAMA_MODELS="/Volumes/DATA/ollama"
echo "📁 Using Ollama models directory: $OLLAMA_MODELS"

# Ensure only one Ollama instance using singleton manager
echo "🔒 Ensuring single Ollama instance..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/ollama-singleton.sh" ]; then
    "$SCRIPT_DIR/ollama-singleton.sh" status
    if ! "$SCRIPT_DIR/ollama-singleton.sh" status | grep -q "🟢 Ollama is RUNNING"; then
        echo "🚀 Starting Ollama singleton..."
        "$SCRIPT_DIR/ollama-singleton.sh" start
    fi
else
    echo "⚠️  Ollama singleton manager not found - using basic setup"
    export OLLAMA_MODELS="/Volumes/DATA/ollama"
fi

echo "🔍 Checking for existing Smart Scribe processes..."

# Check for existing scribe processes (including Docker containers)
EXISTING_SCRIBE=$(ps aux | grep -E "smart-scribe\.js|scribe-summary\.js|node.*smart-scribe" | grep -v grep | grep -v "safe-smart-scribe-start.sh" | head -1)
DOCKER_SCRIBE=$(docker ps --format "table {{.Names}}" | grep -E "scribe|development" | head -1)

if [ ! -z "$EXISTING_SCRIBE" ]; then
    echo "⚠️  Smart Scribe is already running locally:"
    echo "$EXISTING_SCRIBE"
    echo ""
    echo "Options:"
    echo "1. Continue with existing scribe (recommended)"
    echo "2. Kill existing and start new one"
    read -p "Choose (1 or 2): " choice
    
    if [ "$choice" = "2" ]; then
        echo "🛑 Killing existing scribe processes..."
        pkill -f "smart-scribe"
        pkill -f "scribe-summary"
        sleep 2
    else
        echo "✅ Continuing with existing Smart Scribe process"
        exit 0
    fi
fi

if [ ! -z "$DOCKER_SCRIBE" ]; then
    echo "⚠️  Docker container with Smart Scribe is running: $DOCKER_SCRIBE"
    echo "⚠️  This may conflict with local Smart Scribe"
    echo ""
    echo "Options:"
    echo "1. Use Docker Smart Scribe (recommended)"
    echo "2. Stop Docker and start local Smart Scribe"
    read -p "Choose (1 or 2): " choice
    
    if [ "$choice" = "1" ]; then
        echo "✅ Using Docker Smart Scribe - local startup cancelled"
        exit 0
    else
        echo "🛑 Please stop Docker containers first with: docker-compose down"
        exit 1
    fi
fi

echo "📊 Checking system memory usage..."

# Get memory usage percentage (macOS specific)
MEMORY_USAGE=$(memory_pressure | grep "System-wide memory free percentage:" | awk '{print 100-$5}' | cut -d'%' -f1)

# If memory_pressure doesn't work, fall back to vm_stat
if [ -z "$MEMORY_USAGE" ]; then
    FREE_BLOCKS=$(vm_stat | grep "Pages free:" | awk '{print $3}' | sed 's/\.//')
    INACTIVE_BLOCKS=$(vm_stat | grep "Pages inactive:" | awk '{print $3}' | sed 's/\.//')
    SPECULATIVE_BLOCKS=$(vm_stat | grep "Pages speculative:" | awk '{print $3}' | sed 's/\.//')
    
    FREE_MB=$((($FREE_BLOCKS + $INACTIVE_BLOCKS + $SPECULATIVE_BLOCKS) * 4096 / 1048576))
    TOTAL_MB=$(system_profiler SPHardwareDataType | grep "Memory:" | awk '{print $2}' | sed 's/GB//' | awk '{print $1*1024}')
    
    MEMORY_USAGE=$(echo "scale=0; 100 - ($FREE_MB * 100 / $TOTAL_MB)" | bc 2>/dev/null || echo "75")
fi

echo "💾 Current memory usage: ${MEMORY_USAGE}%"

# Warn if memory usage is high
if [ "$MEMORY_USAGE" -ge 80 ]; then
    echo "⚠️  WARNING: Memory usage is at ${MEMORY_USAGE}%"
    echo "⚠️  Running Smart Scribe may cause system slowdown"
    echo "⚠️  Consider closing other applications first"
    echo ""
    read -p "Continue anyway? (y/N): " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        echo "❌ Smart Scribe startup cancelled"
        exit 1
    fi
fi

echo "🚀 Starting Smart Scribe..."

# Change to the correct directory
cd /Volumes/DATA/GitHub/rEngine

# Start the smart scribe in background
nohup node rEngine/smart-scribe.js > rEngine/logs/smart-scribe.log 2>&1 &
SCRIBE_PID=$!

echo "✅ Smart Scribe started with PID: $SCRIBE_PID"
echo "📋 Logs available at: rEngine/logs/smart-scribe.log"
echo "🔍 Monitor with: tail -f rEngine/logs/smart-scribe.log"

# Save PID for future reference
echo $SCRIBE_PID > rEngine/logs/smart-scribe.pid

echo "✅ Smart Scribe startup complete!"
