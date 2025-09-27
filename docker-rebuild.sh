#!/bin/bash

# Rebuild and restart HexTrackr Docker container
echo "Rebuilding HexTrackr application..."

# Detect docker compose command
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
elif docker-compose version &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    echo "❌ Docker Compose is not installed"
    exit 1
fi

# Stop existing container
$DOCKER_COMPOSE down

# Remove old image to force rebuild
$DOCKER_COMPOSE build --no-cache

# Start the container
$DOCKER_COMPOSE up -d

if [ $? -eq 0 ]; then
    echo "✅ HexTrackr has been rebuilt and started."
    echo ""
    echo "Waiting for application to be ready..."

    # Wait for health check
    for i in {1..30}; do
        if $DOCKER_COMPOSE ps | grep -q "healthy"; then
            echo "✅ HexTrackr is ready!"
            echo ""
            echo "🌐 Access the application at: http://localhost:8989"
            exit 0
        fi
        echo -n "."
        sleep 2
    done

    echo ""
    echo "⚠️  Application is taking longer than expected to start."
    echo "Check logs with: $DOCKER_COMPOSE logs -f"
else
    echo "❌ Failed to rebuild HexTrackr. Please check the error messages above."
    exit 1
fi