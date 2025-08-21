#!/bin/bash

# HexTrackr Docker Quick Start Script
# This script builds and runs the HexTrackr container with SQLite database

echo "🚀 Starting HexTrackr Docker Build & Run..."

# Create necessary directories
mkdir -p data uploads

# Build the Docker image
echo "📦 Building Docker image..."
docker build -t hextrackr:latest .

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully!"
    
    # Run the container
    echo "🏃 Starting HexTrackr container..."
    docker run -d \
        --name hextrackr \
        -p 3000:3000 \
        -v $(pwd)/data:/app/data \
        -v $(pwd)/uploads:/app/uploads \
        -e NODE_ENV=development \
        -e JWT_SECRET=dev-secret-key-change-in-production \
        --restart unless-stopped \
        hextrackr:latest

    if [ $? -eq 0 ]; then
        echo "✅ HexTrackr is now running!"
        echo ""
        echo "🌐 Access your application at:"
        echo "   http://localhost:3000"
        echo ""
        echo "📊 API Documentation:"
        echo "   http://localhost:3000/api"
        echo ""
        echo "🔐 Default login:"
        echo "   Username: admin"
        echo "   Password: admin123"
        echo ""
        echo "📋 Container Management Commands:"
        echo "   Stop:    docker stop hextrackr"
        echo "   Start:   docker start hextrackr"
        echo "   Logs:    docker logs -f hextrackr"
        echo "   Remove:  docker rm -f hextrackr"
        echo ""
        echo "💾 Database location: ./data/hextrackr.db"
        echo "📁 Upload directory: ./uploads/"
    else
        echo "❌ Failed to start container!"
        exit 1
    fi
else
    echo "❌ Docker build failed!"
    exit 1
fi
