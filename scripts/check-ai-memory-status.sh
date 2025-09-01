#!/bin/bash
# Script to check the status of AI Memory components

echo "🔍 Checking AI Memory Services Status..."

# Check Ollama
echo -n "1. Ollama Service: "
if curl -s http://localhost:11434/api/version > /dev/null 2>&1; then
    echo "✅ RUNNING"
    OLLAMA_VERSION=$(curl -s http://localhost:11434/api/version | grep -o '"version":"[^"]*"' | cut -d '"' -f 4)
    echo "   Version: $OLLAMA_VERSION"
    
    # Check if nomic-embed-text is available
    echo -n "   nomic-embed-text model: "
    if curl -s -X POST http://localhost:11434/api/embeddings -d '{"model":"nomic-embed-text:latest","prompt":"test"}' | grep -q "embedding"; then
        echo "✅ AVAILABLE"
    else
        echo "❌ NOT AVAILABLE"
        echo "   Try running: ollama pull nomic-embed-text:latest"
    fi
else
    echo "❌ NOT RUNNING"
    echo "   Start Ollama first"
fi

# Check Embedding Proxy
echo -n "2. Ollama Embedding Proxy: "
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ RUNNING"
    PROXY_INFO=$(curl -s http://localhost:3001/health)
    EMBEDDING_DIMENSIONS=$(echo $PROXY_INFO | grep -o '"dimensions":[0-9]*' | cut -d ':' -f 2)
    echo "   Embedding dimensions: $EMBEDDING_DIMENSIONS"
    echo "   Endpoint: http://localhost:3001/v1/embeddings"
else
    echo "❌ NOT RUNNING"
    echo "   Run: /Volumes/DATA/GitHub/HexTrackr/scripts/start-ai-memory-services.sh"
fi

# Check PAM MCP Server
echo -n "3. Persistent AI Memory MCP: "
PAM_PROCESS=$(ps aux | grep mcp_server.py | grep -v grep)
if [ -n "$PAM_PROCESS" ]; then
    echo "✅ RUNNING"
    PAM_PID=$(echo $PAM_PROCESS | awk '{print $2}')
    PAM_RUNTIME=$(ps -o etime= -p $PAM_PID)
    echo "   PID: $PAM_PID (Running for: $PAM_RUNTIME)"
else
    echo "❌ NOT RUNNING"
    echo "   Run: /Volumes/DATA/GitHub/HexTrackr/scripts/start-ai-memory-services.sh"
fi

# Check VS Code Extension Configuration
echo -n "4. VS Code PAM Configuration: "
VSCODE_SETTINGS_DIR="$HOME/Library/Application Support/Code/User"
if [ -f "$VSCODE_SETTINGS_DIR/settings.json" ]; then
    if grep -q "persistent-ai-memory" "$VSCODE_SETTINGS_DIR/settings.json"; then
        echo "✅ CONFIGURED"
        echo "   PAM extension is configured in VS Code settings"
    else
        echo "⚠️ NOT FOUND"
        echo "   No PAM configuration found in VS Code settings"
    fi
else
    echo "⚠️ SETTINGS NOT FOUND"
    echo "   VS Code settings.json not found"
fi

# Try to test PAM tools
echo -e "\n📡 Testing PAM MCP Tools...\n"
echo "Reminder creation test:"
REMINDER_TEST=$(curl -s -X POST http://localhost:3001/v1/embeddings \
  -H "Content-Type: application/json" \
  -d '{"input":"This is a test reminder for PAM"}')

if [[ $REMINDER_TEST == *"embedding"* ]]; then
    echo "✅ Embedding service is working properly"
    echo "   PAM tools should now be ENABLED in VS Code"
else
    echo "❌ Embedding service test failed"
    echo "   PAM tools may still show as DISABLED in VS Code"
fi

echo -e "\n🔧 Troubleshooting Tips:"
echo "1. Restart VS Code after services are running"
echo "2. Check logs in /Volumes/DATA/GitHub/HexTrackr/logs/"
echo "3. Ensure Ollama is running with nomic-embed-text model installed"
echo "4. Run the install script: ./install-ai-memory-service.sh"
