#!/bin/bash

# Stop HexTrackr Docker container
echo "Stopping HexTrackr application..."

# Detect docker compose command
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
elif docker-compose version &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    echo "❌ Docker Compose is not installed"
    exit 1
fi

$DOCKER_COMPOSE down

if [ $? -eq 0 ]; then
    echo "✅ HexTrackr has been stopped successfully."
else
    echo "❌ Failed to stop HexTrackr. Please check the error messages above."
    exit 1
fi