#!/bin/bash

# StackTrackr Development Container Setup
# This script builds and starts a development container to avoid host permission issues

set -e

echo "🐳 StackTrackr Development Container Setup"
echo "=========================================="

# Get current user ID to avoid permission issues
USER_ID=$(id -u)
GROUP_ID=$(id -g)

echo "📋 Using User ID: $USER_ID, Group ID: $GROUP_ID"

# Navigate to the serverless plugin directory
cd "$(dirname "$0")"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Build the development container with correct user permissions
echo "🔨 Building development container..."
docker-compose -f docker-compose.dev.yml build \
    --build-arg USER_ID=$USER_ID \
    --build-arg GROUP_ID=$GROUP_ID \
    stacktrackr-dev

# Start the services
echo "🚀 Starting development environment..."
docker-compose -f docker-compose.dev.yml up -d

echo "⏳ Waiting for services to start..."
sleep 5

# Test database connection
echo "🔍 Testing services..."
if docker-compose -f docker-compose.dev.yml exec -T postgres pg_isready -U stacktrackr > /dev/null 2>&1; then
    echo "✅ PostgreSQL: ready"
else
    echo "❌ PostgreSQL: not ready"
fi

# Test Redis connection
if docker-compose -f docker-compose.dev.yml exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis: ready"
else
    echo "❌ Redis: not ready"
fi

echo ""
echo "🎉 Development container is ready!"
echo ""
echo "🔧 Available Commands:"
echo "   • Enter container: docker-compose -f docker-compose.dev.yml exec stacktrackr-dev bash"
echo "   • Start API server: start-api (inside container)"
echo "   • Start web server: start-web (inside container)"
echo "   • Connect to DB: db-connect (inside container)"
echo "   • Connect to Redis: redis-connect (inside container)"
echo ""
echo "📁 Your StackTrackr workspace is mounted at /workspace inside the container"
echo "   All file operations inside the container will have correct permissions!"
echo ""
echo "🚀 Quick Start:"
echo "   1. docker-compose -f docker-compose.dev.yml exec stacktrackr-dev bash"
echo "   2. cd /workspace/agents/lab/serverless-plugin/docker-serverless"
echo "   3. Copy .env.example to .env and add your API keys"
echo "   4. start-api (to run the Node.js API)"
echo "   5. start-web (in another terminal to serve StackTrackr)"
echo ""
echo "🛑 To stop: docker-compose -f docker-compose.dev.yml down"
