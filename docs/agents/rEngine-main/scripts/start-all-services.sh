#!/bin/bash

echo "🚀 Starting StackTrackr Memory System..."

# Start Memory Scribe Service
echo "📝 Starting Memory Scribe..."
cd /Volumes/DATA/GitHub/rEngine/memory-scribe && nohup node dashboard-server.js > scribe.log 2>&1 &

# Wait for Memory Scribe to initialize
sleep 2

# Check if Ollama is running (rEngine) and avoid duplicates
echo "🔌 Checking Ollama/rEngine..."

# If Ollama API responds, do nothing
if curl -f http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "🟢 Ollama already online at :11434"
else
    # If port is in use but API fails, assume another instance/container is binding it
    if command -v lsof >/dev/null 2>&1 && lsof -i :11434 -sTCP:LISTEN >/dev/null 2>&1; then
        echo "⚠️ Port 11434 is in use but API not ready. Skipping local start to avoid duplicates."
    else
        # Prefer singleton-managed start; also skip if Docker container exposes 11434
        if command -v docker >/dev/null 2>&1 && docker ps --format '{{.Ports}} {{.Names}}' 2>/dev/null | grep -qE '11434->|ollama|openwebui'; then
            echo "🟡 Docker appears to provide Ollama/OpenWebUI. Skipping local start."
        else
            echo "⚠️ Starting Ollama via singleton guard..."
            /Volumes/DATA/GitHub/rEngine/bin/ollama-singleton.sh start
            sleep 3
        fi
    fi
fi

# Health checks
echo "🏥 Running health checks..."

# Test Memory Scribe
curl -f http://localhost:3002/ > /dev/null 2>&1 && echo "✅ Memory Scribe: ONLINE" || echo "❌ Memory Scribe: FAILED"

# Test Ollama/rEngine
curl -f http://localhost:11434/api/tags > /dev/null 2>&1 && echo "✅ Ollama/rEngine: ONLINE" || echo "❌ Ollama/rEngine: FAILED"

echo "🎯 StackTrackr Memory System startup complete!"
echo "📊 Dashboard: http://localhost:3002"
echo "🤖 Ollama API: http://localhost:11434"

# Display agent status
echo ""
echo "🤖 Agent Status Check:"
echo "- Agent: GitHub Copilot"
echo "- Memory File: rAgents/github_copilot_memories.json"
echo "- Current Task: Memory system restored"
echo "- Status: ✅ READY FOR QUERIES"
