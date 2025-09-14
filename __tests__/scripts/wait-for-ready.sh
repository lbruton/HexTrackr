#!/bin/bash

# HexTrackr Docker Health Check Script
# Waits for HexTrackr to be ready on port 8989 before running tests
# 
# Usage: ./wait-for-ready.sh [timeout_seconds]
# Default timeout: 30 seconds

set -e

# Configuration
HOST="localhost"
PORT="8989"
TIMEOUT="${1:-30}"
RETRY_INTERVAL=2

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔍 Checking HexTrackr availability on ${HOST}:${PORT}...${NC}"
echo -e "${YELLOW}⏱  Timeout: ${TIMEOUT} seconds${NC}"

# Start time for timeout calculation
START_TIME=$(date +%s)

# Health check function
check_health() {
    # Try to connect to the port
    if nc -z "$HOST" "$PORT" 2>/dev/null; then
        # Port is open, now check HTTP response
        if curl -s -o /dev/null -w "%{http_code}" "http://${HOST}:${PORT}" | grep -q "200\|301\|302"; then
            return 0
        fi
    fi
    return 1
}

# Wait loop
while true; do
    CURRENT_TIME=$(date +%s)
    ELAPSED=$((CURRENT_TIME - START_TIME))
    
    if [ $ELAPSED -ge $TIMEOUT ]; then
        echo -e "${RED}❌ Timeout reached after ${TIMEOUT} seconds${NC}"
        echo -e "${RED}   HexTrackr is not responding on ${HOST}:${PORT}${NC}"
        echo ""
        echo "Troubleshooting steps:"
        echo "1. Check if Docker is running: docker ps"
        echo "2. Check HexTrackr logs: docker-compose logs hextrackr"
        echo "3. Verify port 8989 is not in use: lsof -i :8989"
        echo "4. Restart Docker: docker-compose restart"
        exit 1
    fi
    
    if check_health; then
        echo -e "${GREEN}✅ HexTrackr is ready on ${HOST}:${PORT}${NC}"
        echo -e "${GREEN}   Time taken: ${ELAPSED} seconds${NC}"
        
        # Additional checks for critical endpoints
        echo -e "${YELLOW}🔍 Verifying critical endpoints...${NC}"
        
        # Check main page
        if curl -s -f "http://${HOST}:${PORT}/" > /dev/null 2>&1; then
            echo -e "${GREEN}   ✓ Main page accessible${NC}"
        else
            echo -e "${YELLOW}   ⚠ Main page not accessible (may be normal)${NC}"
        fi
        
        # Check vulnerabilities page
        if curl -s -f "http://${HOST}:${PORT}/vulnerabilities.html" > /dev/null 2>&1; then
            echo -e "${GREEN}   ✓ Vulnerabilities page accessible${NC}"
        else
            echo -e "${YELLOW}   ⚠ Vulnerabilities page not accessible${NC}"
        fi
        
        echo -e "${GREEN}🚀 Ready to run tests!${NC}"
        exit 0
    fi
    
    # Show progress
    echo -n "."
    sleep $RETRY_INTERVAL
done