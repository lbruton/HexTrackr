#!/bin/bash
# AI Memory Services Startup Script
# Starts the Ollama embedding proxy and persistent-ai-memory MCP server

set -e

echo "🚀 Starting AI Memory Services..."

# Variables
OLLAMA_PROXY_DIR="/Volumes/DATA/GitHub/persistent-ai-memory/rmem-prototype/core"
OLLAMA_PROXY_SCRIPT="ollama-embedding-proxy.js"
AI_MEMORY_DIR="/Volumes/DATA/GitHub/persistent-ai-memory"
AI_MEMORY_SCRIPT="mcp_server.py"
PROXY_PORT="3001"

# Function to check if a process is running
check_process_running() {
    pgrep -f "$1" >/dev/null
    return $?
}

# Function to wait for a service to be available
wait_for_service() {
    local service_name="$1"
    local url="$2"
    local max_attempts="$3"
    local attempt=0
    
    echo "⏳ Waiting for $service_name to be ready..."
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            echo "✅ $service_name is ready!"
            return 0
        fi
        
        attempt=$((attempt+1))
        sleep 2
    done
    
    echo "❌ $service_name failed to start within $((max_attempts*2)) seconds"
    return 1
}

# Step 1: Check if Ollama is running
if ! check_process_running "ollama serve"; then
    echo "❌ Ollama is not running. Please start Ollama first."
    exit 1
fi

echo "✅ Ollama is running."

# Step 2: Start the Ollama embedding proxy if not already running
if check_process_running "$OLLAMA_PROXY_SCRIPT"; then
    echo "✅ Ollama embedding proxy is already running."
else
    echo "🔄 Starting Ollama embedding proxy..."
    cd "$OLLAMA_PROXY_DIR"
    nohup node "$OLLAMA_PROXY_SCRIPT" > proxy.log 2>&1 &
    PROXY_PID=$!
    echo "   Started with PID: $PROXY_PID"
    
    # Wait for the proxy to be ready
    if ! wait_for_service "Ollama embedding proxy" "http://localhost:$PROXY_PORT/health" 15; then
        echo "❌ Failed to start Ollama embedding proxy. Check logs at $OLLAMA_PROXY_DIR/proxy.log"
        exit 1
    fi
fi

# Step 3: Start the persistent-ai-memory MCP server if not already running
if check_process_running "$AI_MEMORY_SCRIPT"; then
    echo "✅ Persistent AI Memory MCP server is already running."
else
    echo "🔄 Starting Persistent AI Memory MCP server..."
    cd "$AI_MEMORY_DIR"
    nohup python "$AI_MEMORY_SCRIPT" > mcp_server.log 2>&1 &
    MCP_PID=$!
    echo "   Started with PID: $MCP_PID"
    sleep 3
    
    # Check if still running after a brief delay
    if check_process_running "$AI_MEMORY_SCRIPT"; then
        echo "✅ Persistent AI Memory MCP server started successfully."
    else
        echo "❌ Failed to start Persistent AI Memory MCP server. Check logs at $AI_MEMORY_DIR/mcp_server.log"
        exit 1
    fi
fi

# Step 4: Create Memento MCP entity relationships
echo "🔄 Recording relationship in Memento Knowledge Graph..."

# Check if the MementoMCP tool is available through VS Code
MEMENTO_AVAILABLE=$(curl -s http://localhost:3502/health 2>/dev/null || echo "")

if [ -n "$MEMENTO_AVAILABLE" ]; then
    # Create entity relationships using curl
    curl -s -X POST http://localhost:3502/api/entity \
         -H "Content-Type: application/json" \
         -d '{"entity_type":"Service","name":"Ollama Embedding Proxy","properties":{"port":"3001","status":"active","purpose":"Translates OpenAI embedding requests to Ollama nomic-embed-text"}}' > /dev/null
    
    curl -s -X POST http://localhost:3502/api/entity \
         -H "Content-Type: application/json" \
         -d '{"entity_type":"Service","name":"PAM MCP Server","properties":{"status":"active","purpose":"Provides Persistent AI Memory tools"}}' > /dev/null
    
    curl -s -X POST http://localhost:3502/api/relationship \
         -H "Content-Type: application/json" \
         -d '{"source_entity":"Ollama Embedding Proxy","target_entity":"PAM MCP Server","relationship_type":"DEPENDS_ON","properties":{"description":"PAM requires embedding service for semantic search"}}' > /dev/null
    
    echo "✅ Relationships recorded in Memento Knowledge Graph."
else
    echo "⚠️ Memento MCP not available. Skipping relationship recording."
fi

echo "🎉 AI Memory Services are now running!"
echo ""
echo "📋 Service Information:"
echo "   Ollama Embedding Proxy: http://localhost:$PROXY_PORT"
echo "   Persistent AI Memory: Active"
echo ""
echo "🔧 Management commands:"
echo "   Check Proxy Logs:  cat $OLLAMA_PROXY_DIR/proxy.log"
echo "   Check MCP Logs:    cat $AI_MEMORY_DIR/mcp_server.log"
