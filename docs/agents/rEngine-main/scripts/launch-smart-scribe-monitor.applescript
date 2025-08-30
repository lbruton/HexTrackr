#!/usr/bin/osascript

-- Smart Scribe Docker Monitor - External Terminal Console
-- Connects to Docker Smart Scribe and displays logs in Terminal.app

tell application "Terminal"
    activate
    
    -- Create new terminal window for Smart Scribe monitoring
    set newWindow to do script "cd /Volumes/DATA/GitHub/rEngine"
    
    -- Add visual branding
    do script "clear && echo '🐳 rEngine Smart Scribe - Docker Monitor'" in newWindow
    do script "echo '================================================'" in newWindow
    do script "echo '📍 Location: Docker Container'" in newWindow
    do script "echo '⚡ Monitoring Docker Smart Scribe logs...'" in newWindow
    do script "echo ''" in newWindow
    
    -- Check if Docker containers are running
    do script "echo '🔍 Checking Docker container status...'" in newWindow
    do script "if docker ps --format 'table {{.Names}}' | grep -q 'development\\|scribe'; then
        echo '✅ Docker containers detected'
    else
        echo '⚠️  No Docker containers running - starting them...'
        ./bin/launch-rEngine-services.sh
        echo '⏳ Waiting for containers to start...'
        sleep 10
    fi" in newWindow
    
    -- Wait a moment for container check
    delay 5
    
    -- Start continuous Docker log monitoring
    do script "echo ''" in newWindow
    do script "echo '📊 Starting Docker Smart Scribe log monitoring...'" in newWindow
    do script "echo ''" in newWindow
    
    -- Create monitoring loop that follows Docker logs
    set monitorScript to "while true; do
        clear
        echo '🐳 rEngine Smart Scribe - Docker Monitor'
        echo '================================================'
        echo '⏰ Last updated: '$(date)
        echo '� Container status: '$(docker ps --format 'table {{.Names}}\\t{{.Status}}' | grep -E 'development|scribe' | head -1 || echo 'Not running')
        echo ''
        
        # Try to get Smart Scribe logs from Docker container
        CONTAINER_NAME=$(docker ps --format '{{.Names}}' | grep -E 'development|stacktrackr' | head -1)
        
        if [ ! -z \"$CONTAINER_NAME\" ]; then
            echo '📋 Latest Smart Scribe Activity (Docker logs):'
            echo '------------------------------------------------'
            docker logs $CONTAINER_NAME --tail 10 2>/dev/null | grep -E 'Smart Scribe|🤖|🧠|📋|⚡|✅' || echo 'No Smart Scribe logs found'
            echo ''
            echo '📋 General Container Activity:'
            echo '------------------------------------------------'
            docker logs $CONTAINER_NAME --tail 5 2>/dev/null || echo 'No container logs available'
        else
            echo '❌ No Docker containers running Smart Scribe'
            echo 'Run: ./bin/launch-rEngine-services.sh to start'
        fi
        
        echo ''
        echo '🔄 Refreshing in 10 seconds... (Ctrl+C to stop monitoring)'
        sleep 10
    done"
    
    do script monitorScript in newWindow
    
    -- Set window title
    set custom title of newWindow to "🐳 Docker Smart Scribe Monitor"
    
    -- Position the window
    set bounds of window 1 to {100, 100, 900, 700}
    
end tell
