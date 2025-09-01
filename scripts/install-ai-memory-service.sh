#!/bin/bash
# Installation script for AI Memory Services launchd service

set -e

echo "📥 Installing AI Memory Services launchd service..."

# Variables
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLIST_FILE="com.hextrackr.aimemory.plist"
LAUNCHD_DIR="$HOME/Library/LaunchAgents"

# Make scripts executable
chmod +x "$SCRIPT_DIR/start-ai-memory-services.sh"
chmod +x "$SCRIPT_DIR/install-ai-memory-service.sh"

# Ensure logs directory exists
mkdir -p "$SCRIPT_DIR/../logs"

# Check if service is already loaded
if launchctl list | grep -q com.hextrackr.aimemory; then
    echo "🔄 Unloading existing service..."
    launchctl unload "$LAUNCHD_DIR/$PLIST_FILE" 2>/dev/null || true
fi

# Copy plist to LaunchAgents directory
echo "📋 Copying plist to $LAUNCHD_DIR..."
cp "$SCRIPT_DIR/$PLIST_FILE" "$LAUNCHD_DIR/"

# Load the service
echo "🚀 Loading service..."
launchctl load "$LAUNCHD_DIR/$PLIST_FILE"

# Verify service is loaded
if launchctl list | grep -q com.hextrackr.aimemory; then
    echo "✅ AI Memory Services installed successfully and will start automatically on system boot."
    echo "🔍 You can check logs at:"
    echo "   - $SCRIPT_DIR/../logs/ai-memory-services.log"
    echo "   - $SCRIPT_DIR/../logs/ai-memory-services-error.log"
else
    echo "❌ Failed to install AI Memory Services."
    exit 1
fi

# Add Memento MCP relationship
echo "🔄 Recording installation in Memento Knowledge Graph..."

# Check if the MementoMCP tool is available through VS Code
MEMENTO_AVAILABLE=$(curl -s http://localhost:3502/health 2>/dev/null || echo "")

if [ -n "$MEMENTO_AVAILABLE" ]; then
    # Create entity and relationships using curl
    curl -s -X POST http://localhost:3502/api/entity \
         -H "Content-Type: application/json" \
         -d '{"entity_type":"Configuration","name":"AI Memory Service LaunchAgent","properties":{"path":"'"$LAUNCHD_DIR/$PLIST_FILE"'","autostart":"true","version":"1.0"}}' > /dev/null
    
    curl -s -X POST http://localhost:3502/api/relationship \
         -H "Content-Type: application/json" \
         -d '{"source_entity":"AI Memory Service LaunchAgent","target_entity":"Ollama Embedding Proxy","relationship_type":"MANAGES","properties":{"description":"LaunchAgent starts and manages the embedding proxy"}}' > /dev/null
    
    curl -s -X POST http://localhost:3502/api/relationship \
         -H "Content-Type: application/json" \
         -d '{"source_entity":"AI Memory Service LaunchAgent","target_entity":"PAM MCP Server","relationship_type":"MANAGES","properties":{"description":"LaunchAgent starts and manages the PAM server"}}' > /dev/null
    
    echo "✅ Installation recorded in Memento Knowledge Graph."
else
    echo "⚠️ Memento MCP not available. Skipping relationship recording."
fi

echo ""
echo "🔧 Management commands:"
echo "   Start:    launchctl start com.hextrackr.aimemory"
echo "   Stop:     launchctl stop com.hextrackr.aimemory"
echo "   Unload:   launchctl unload ~/Library/LaunchAgents/com.hextrackr.aimemory.plist"
echo "   Reload:   launchctl unload ~/Library/LaunchAgents/com.hextrackr.aimemory.plist && launchctl load ~/Library/LaunchAgents/com.hextrackr.aimemory.plist"
