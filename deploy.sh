#!/bin/bash
# HexTrackr Quick Deploy Script
# Usage: ./deploy.sh [dev|prod]

set -e

MODE=${1:-dev}
COMPOSE_FILE="docker-compose.yml"

if [ "$MODE" = "prod" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    echo "🚀 Production deployment mode"
else
    echo "🛠️  Development deployment mode"
fi

echo "📦 Pulling latest changes from Git..."
git pull origin main

echo "🔧 Building Docker image..."
docker-compose -f $COMPOSE_FILE build

echo "⬇️  Stopping existing containers..."
docker-compose -f $COMPOSE_FILE down

echo "⬆️  Starting HexTrackr..."
docker-compose -f $COMPOSE_FILE up -d

echo "🔍 Checking container health..."
sleep 5
docker-compose -f $COMPOSE_FILE ps

echo "✅ HexTrackr deployed successfully!"
if [ "$MODE" = "prod" ]; then
    echo "🌐 Access at: http://localhost"
else
    echo "🌐 Access at: http://localhost:3040"
fi

echo "📊 View logs: docker-compose -f $COMPOSE_FILE logs -f"
