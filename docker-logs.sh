#!/bin/bash

# View HexTrackr Docker container logs

# Detect docker compose command
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
elif docker-compose version &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    echo "❌ Docker Compose is not installed"
    exit 1
fi

echo "📋 Showing HexTrackr logs (press Ctrl+C to exit)..."
echo ""

$DOCKER_COMPOSE logs -f --tail=100