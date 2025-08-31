#!/bin/bash

# Function to start an MCP server
start_mcp_server() {
    local server_dir=$1
    local server_name=$2
    local port=$3

    if [ -d "/mcp-servers/$server_dir" ]; then
        echo "Starting $server_name on port $port..."
        cd "/mcp-servers/$server_dir"
        
        # Install dependencies if needed
        if [ ! -d "node_modules" ]; then
            echo "Installing dependencies for $server_name..."
            npm install
        fi
        
        # Build if needed
        if [ -f "package.json" ] && grep -q "build" "package.json"; then
            echo "Building $server_name..."
            npm run build
        fi
        
        # Start the server
        PORT=$port npm start &
    fi
}

# Start each MCP server
start_mcp_server "filescope-mcp" "FileScopeMCP" 3500
# Add more servers here as needed

# Keep container running
tail -f /dev/null
