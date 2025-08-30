#!/bin/bash

# StackTrackr Serverless - Quick Start Script
# This script sets up and starts the local Docker development environment

set -e

echo "🚀 StackTrackr Serverless Phase 1 Setup"
echo "========================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Navigate to docker directory
cd "$(dirname "$0")"

# Check for .env file
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  IMPORTANT: Edit .env file and add your API keys before continuing!"
    echo "   Required: METALS_DEV_API_KEY (get from https://metals.dev)"
    echo ""
    read -p "Press Enter when you've added your API keys..."
fi

# Verify API key is set
if grep -q "your_metals_dev_api_key_here" .env; then
    echo "❌ Please edit .env file and replace 'your_metals_dev_api_key_here' with your actual API key"
    exit 1
fi

echo "🔧 Building Docker containers..."
docker-compose build

echo "🚀 Starting StackTrackr serverless stack..."
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 10

# Test services
echo "🔍 Testing service health..."

# Test API health
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ API service: healthy"
else
    echo "❌ API service: not responding"
fi

# Test web server
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Web service: healthy"
else
    echo "❌ Web service: not responding"
fi

echo ""
echo "🎉 StackTrackr Serverless is running!"
echo ""
echo "📱 Access Points:"
echo "   • Web App: http://localhost:3000"
echo "   • API: http://localhost:3001/api/prices"
echo "   • Health: http://localhost:3001/health"
echo ""
echo "📊 Monitoring:"
echo "   • View logs: docker-compose logs -f"
echo "   • API logs: docker-compose logs -f stacktrackr-api"
echo "   • Price fetcher: docker-compose logs -f price-fetcher"
echo ""
echo "🛑 To stop: docker-compose down"
echo ""

# Check if prices are being fetched
echo "🔄 Waiting for first price fetch (this may take a few minutes)..."
sleep 30

# Check database for price data
price_count=$(docker-compose exec -T postgres psql -U stacktrackr -d stacktrackr_prices -t -c "SELECT COUNT(*) FROM price_snapshots;" 2>/dev/null | tr -d ' ' || echo "0")

if [ "$price_count" -gt 0 ]; then
    echo "✅ Price data: $price_count records stored"
else
    echo "⏳ Price data: Still fetching... Check logs with: docker-compose logs price-fetcher"
fi

echo ""
echo "🎯 Next Steps:"
echo "   1. Open http://localhost:3000 in your browser"
echo "   2. Look for 'Enhanced API Active' indicator"
echo "   3. Check that spot prices are updating automatically"
echo "   4. Review logs to ensure everything is working"
echo ""
echo "Happy tracking! 📈"
