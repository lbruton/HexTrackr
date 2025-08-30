#!/bin/bash

# rEngineMCP Status Checker
# Checks if the rEngineMCP plugin is running and accessible

echo "🔍 rEngineMCP Status Check"
echo "=========================="

# Check if rEngineMCP process is running
RENGINE_PID=$(ps aux | grep -E "node.*index\.js" | grep -v grep | awk '{print $2}')

if [ -n "$RENGINE_PID" ]; then
    echo "✅ rEngineMCP Plugin: RUNNING (PID: $RENGINE_PID)"
else
    echo "❌ rEngineMCP Plugin: NOT RUNNING"
    echo "   To start: cd /Volumes/DATA/GitHub/rEngine/rEngine && /opt/homebrew/bin/node index.js"
fi

# Check if Ollama is accessible
echo ""
echo "🦙 Ollama Status:"
OLLAMA_RESPONSE=$(curl -s http://localhost:11434/api/tags 2>/dev/null)
if [ $? -eq 0 ]; then
    MODEL_COUNT=$(echo "$OLLAMA_RESPONSE" | jq '.models | length' 2>/dev/null || echo "0")
    echo "✅ Ollama Server: RUNNING ($MODEL_COUNT models available)"
    
    # Test llama3:8b specifically
    LLAMA3_AVAILABLE=$(echo "$OLLAMA_RESPONSE" | jq -r '.models[]? | select(.name=="llama3:8b") | .name' 2>/dev/null)
    if [ "$LLAMA3_AVAILABLE" = "llama3:8b" ]; then
        echo "✅ llama3:8b: AVAILABLE"
    else
        echo "❌ llama3:8b: NOT FOUND"
    fi
else
    echo "❌ Ollama Server: NOT RUNNING"
    echo "   To start: ollama serve"
fi

# Check conversation memory directory
echo ""
echo "🧠 Conversation Memory:"
CONV_DIR="/Volumes/DATA/GitHub/rEngine/rEngine/.rengine/conversations"
if [ -d "$CONV_DIR" ]; then
    CONV_COUNT=$(find "$CONV_DIR" -name "*.json" | wc -l | tr -d ' ')
    echo "✅ Memory Directory: EXISTS ($CONV_COUNT conversation files)"
else
    echo "❌ Memory Directory: MISSING"
fi

# Check VS Code MCP configuration
echo ""
echo "🔧 VS Code MCP Config:"
VSCODE_SETTINGS="/Users/$(whoami)/Library/Application Support/Code/User/settings.json"
if [ -f "$VSCODE_SETTINGS" ]; then
    RENGINE_CONFIG=$(grep -q "rengine" "$VSCODE_SETTINGS" && echo "FOUND" || echo "MISSING")
    if [ "$RENGINE_CONFIG" = "FOUND" ]; then
        echo "✅ VS Code Settings: rEngineMCP configured"
        echo "   ⚠️  Restart VS Code to activate MCP tools"
    else
        echo "❌ VS Code Settings: rEngineMCP NOT configured"
    fi
else
    echo "❌ VS Code Settings: File not found"
fi

echo ""
echo "🎯 Quick Actions:"
echo "   Restart rEngineMCP: cd /Volumes/DATA/GitHub/rEngine/rEngine && /opt/homebrew/bin/node index.js"
echo "   Test Ollama: curl -X POST http://localhost:11434/api/generate -d '{\"model\":\"llama3:8b\",\"prompt\":\"Hi\",\"stream\":false}'"
echo "   Open VS Code Settings: code '/Users/$(whoami)/Library/Application Support/Code/User/settings.json'"
