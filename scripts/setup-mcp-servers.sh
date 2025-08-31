#!/bin/bash

# Base directory for all MCP servers
BASE_DIR="/Volumes/DATA/GitHub"

# Function to clone/update an MCP server
setup_mcp_server() {
    local repo_url=$1
    local dir_name=$2
    local branch=${3:-main}

    echo "Setting up $dir_name..."
    
    # Clone or update repository
    if [ ! -d "$BASE_DIR/$dir_name" ]; then
        echo "Cloning $dir_name..."
        git clone "$repo_url" "$BASE_DIR/$dir_name"
        cd "$BASE_DIR/$dir_name"
        git checkout $branch
    else
        echo "Updating $dir_name..."
        cd "$BASE_DIR/$dir_name"
        git pull
        git checkout $branch
    fi
}

# Setup each MCP server
setup_mcp_server "https://github.com/admica/FileScopeMCP.git" "FileScopeMCP"
# Add more MCP servers as needed
# setup_mcp_server "https://github.com/org/CodacyMCP.git" "CodacyMCP"

# Start the unified Docker container
echo "Starting unified MCP server container..."
cd "$BASE_DIR/HexTrackr/docker/mcp-server"
docker-compose up --build -d

echo "MCP servers setup complete! Container is running in background."
echo "Available servers:"
echo "- FileScopeMCP: http://localhost:3500"
echo "- CodacyMCP: http://localhost:3501"
