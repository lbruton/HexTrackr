#!/usr/bin/osascript

-- Real-time Analysis Scribe Launcher with Live Logs
-- Launches the Qwen Code-powered real-time scribe in background with live tail

tell application "Terminal"
    -- Create new window for real-time scribe
    set realTimeWindow to do script "echo '🚀 Starting Real-time Analysis Scribe (Qwen Code 7B)...'"
    
    -- Set window title and size
    set custom title of realTimeWindow to "Real-time Analysis Scribe - Live Logs"
    set number of rows of realTimeWindow to 40
    set number of columns of realTimeWindow to 120
    
    -- Navigate to project directory and start scribe
    do script "cd /Volumes/DATA/GitHub/HexTrackr" in realTimeWindow
    do script "echo '📍 Starting Qwen Code-powered real-time analysis...'" in realTimeWindow
    do script "echo '⚡ Monitoring interval: 30 seconds'" in realTimeWindow
    do script "echo '🧠 Model: qwen2.5-coder:7b'" in realTimeWindow
    do script "echo ''" in realTimeWindow
    
    -- Start the real-time scribe in background and tail its logs
    do script ".rMemory/scripts/launch-real-time-monitor.sh &" in realTimeWindow
    do script "sleep 2" in realTimeWindow
    do script "echo '👀 Live log stream starting...'" in realTimeWindow
    do script "echo ''" in realTimeWindow
    
    -- Tail the live logs
    do script "tail -f .rMemory/docs/ops/logs/realtime-monitor-*.log" in realTimeWindow
    
    -- Bring Terminal to front
    activate
end tell
