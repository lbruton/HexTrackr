#!/bin/bash

# Smart Scribe System Startup Script
# Installs cron job and starts the Smart Scribe system

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KEEPALIVE_SCRIPT="$SCRIPT_DIR/scribe-keepalive.sh"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🤖 Smart Scribe System Setup${NC}"
echo ""

# Install dependencies if needed
echo "📦 Checking dependencies..."
cd "$SCRIPT_DIR"

if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install fs-extra axios chokidar
fi

# Install cron job for keep-alive (every 5 minutes)
echo "⏰ Installing cron job..."

# Create cron entry
CRON_ENTRY="*/5 * * * * $KEEPALIVE_SCRIPT keepalive >> /tmp/scribe-keepalive.log 2>&1"

# Check if cron entry already exists
if crontab -l 2>/dev/null | grep -q "scribe-keepalive"; then
    echo "⚠️  Cron job already exists, updating..."
    # Remove old entry and add new one
    (crontab -l 2>/dev/null | grep -v "scribe-keepalive"; echo "$CRON_ENTRY") | crontab -
else
    echo "➕ Adding new cron job..."
    (crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -
fi

# Verify cron installation
if crontab -l 2>/dev/null | grep -q "scribe-keepalive"; then
    echo -e "${GREEN}✅ Cron job installed successfully${NC}"
    echo "   Keep-alive runs every 5 minutes"
    echo "   Logs: /tmp/scribe-keepalive.log"
else
    echo "❌ Failed to install cron job"
    exit 1
fi

echo ""

# Start Smart Scribe
echo "🚀 Starting Smart Scribe..."
nohup node "$SCRIPT_DIR/smart-scribe.js" > /tmp/smart-scribe.log 2>&1 &
SCRIBE_PID=$!

sleep 3

if kill -0 $SCRIBE_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Smart Scribe started successfully${NC}"
    echo "   PID: $SCRIBE_PID"
    echo "   Logs: /tmp/smart-scribe.log"
else
    echo "❌ Failed to start Smart Scribe"
    exit 1
fi

echo ""

# Test the system
echo "🧪 Testing keep-alive system..."
if "$KEEPALIVE_SCRIPT" test; then
    echo -e "${GREEN}✅ Keep-alive test successful${NC}"
else
    echo "⚠️  Keep-alive test failed, but system is running"
fi

echo ""
echo -e "${YELLOW}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   🎉 Smart Scribe System Fully Operational!${NC}"
echo -e "${YELLOW}════════════════════════════════════════════════════════════${NC}"
echo ""
echo "📋 System Status:"
echo "   • Smart Scribe: Running (PID $SCRIBE_PID)"
echo "   • Keep-alive: Every 5 minutes via cron"
echo "   • Model: qwen2.5-coder:3b"
echo "   • Knowledge DB: rEngine/technical-knowledge.json"
echo "   • Search Tables: rEngine/search-optimization.json"
echo ""
echo "📝 Log Files:"
echo "   • Smart Scribe: /tmp/smart-scribe.log"
echo "   • Keep-alive: /tmp/scribe-keepalive.log"
echo ""
echo "🎮 Manual Commands:"
echo "   • Test keep-alive: $KEEPALIVE_SCRIPT test"
echo "   • Check status: $KEEPALIVE_SCRIPT status"
echo "   • View logs: tail -f /tmp/smart-scribe.log"
echo ""
