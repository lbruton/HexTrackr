#!/bin/bash
# HexTrackr Memory System - 5 Minute Startup
# Gets memory system operational quickly

echo "🚀 HexTrackr Memory System - 5 Minute Startup"
echo "=============================================="

# Check prerequisites
echo ""
echo "🔍 Checking prerequisites..."

# Check if Ollama is running
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama not found. Please install Ollama first."
    exit 1
fi

# Check if models are available
echo "📋 Checking Ollama models..."
ollama list

# Check if qwen2.5-coder is available
if ! ollama list | grep -q "qwen2.5-coder"; then
    echo "⚠️  qwen2.5-coder model not found."
    echo "Installing qwen2.5-coder:7b (this may take a few minutes)..."
    ollama pull qwen2.5-coder:7b
fi

# Check if embedding model is available  
if ! ollama list | grep -q "nomic-embed-text"; then
    echo "⚠️  nomic-embed-text model not found."
    echo "Installing nomic-embed-text (this may take a minute)..."
    ollama pull nomic-embed-text
fi

echo "✅ Prerequisites checked"

# Make sure output directory exists
mkdir -p .rMemory/json

# Make scripts executable
chmod +x .rMemory/core/memory-launcher.js
chmod +x .rMemory/core/chat-scanner.js

echo ""
echo "🎯 Starting memory analysis pipeline..."

# Run the memory launcher
cd "$(dirname "$0")/../.."
node .rMemory/core/memory-launcher.js

# Check if analysis was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Memory system startup complete!"
    echo ""
    echo "📊 Results available in:"
    echo "   📁 .rMemory/json/chat-history.json    - Raw chat data"
    echo "   📁 .rMemory/json/extracted-entities.json - Entities for Memento"
    echo "   📁 .rMemory/json/ollama-analysis.txt - Full analysis text"
    echo ""
    echo "📋 Next steps:"
    echo "1. Review the extracted entities"
    echo "2. Import into Memento MCP using VS Code"
    echo "3. Verify storage in Neo4j database"
    echo ""
    echo "🔧 Quick commands:"
    echo "   View entities: cat .rMemory/json/extracted-entities.json | jq"
    echo "   Check chat data: ls -la .rMemory/json/"
    echo "   Neo4j status: docker ps | grep neo4j"
else
    echo ""
    echo "❌ Memory startup failed. Check the output above for details."
    echo ""
    echo "🔧 Common fixes:"
    echo "   - Ensure Ollama is running: ollama serve"
    echo "   - Restart this script: ./.rMemory/scripts/quick-start.sh"
    echo "   - Check VS Code logs exist in ~/Library/Application Support/Code/"
fi
