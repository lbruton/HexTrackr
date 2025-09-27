#!/bin/bash

# Start HexTrackr Docker container
echo "Starting HexTrackr application..."

# Detect docker compose command
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
elif docker-compose version &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    echo "❌ Docker Compose is not installed"
    exit 1
fi

# Build and start the container
$DOCKER_COMPOSE up -d --build

# Check if container started successfully
if [ $? -eq 0 ]; then
    echo "✅ HexTrackr is starting up..."
    echo ""
    echo "Waiting for application to be ready..."

    # Wait for health check
    for i in {1..30}; do
        if $DOCKER_COMPOSE ps | grep -q "healthy"; then
            echo "✅ HexTrackr is ready!"
            echo ""
            echo "🌐 Access the application at: http://localhost:8989"
            echo ""
            echo "📋 View logs with: ./docker-logs.sh"
            echo "🛑 Stop with: ./docker-stop.sh"
            exit 0
        fi
        echo -n "."
        sleep 2
    done

    echo ""
    echo "⚠️  Application is taking longer than expected to start."
    echo "Check logs with: $DOCKER_COMPOSE logs -f"
else
    echo "❌ Failed to start HexTrackr. Please check the error messages above."
    exit 1
fi