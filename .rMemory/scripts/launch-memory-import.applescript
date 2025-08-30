#!/usr/bin/osascript

-- Memory Import Workflow Launcher with Live Logs
-- Launches the automated memory import system with beautiful live monitoring

tell application "Terminal"
    -- Create new window for memory import
    set memoryWindow to do script "echo '🧠 Starting Automated Memory Import Workflow...'"
    
    -- Set window title and size
    set custom title of memoryWindow to "Memory Import Workflow - Live Processing"
    set number of rows of memoryWindow to 35
    set number of columns of memoryWindow to 110
    
    -- Navigate to project directory
    do script "cd /Volumes/DATA/GitHub/HexTrackr" in memoryWindow
    do script "echo '📋 Memory Import Automation System'" in memoryWindow
    do script "echo '🔄 Processing interval: 5 minutes'" in memoryWindow
    do script "echo '📊 Queue processing: real-time → chat-updates → deep-analysis → frustration-data'" in memoryWindow
    do script "echo '💾 Target: Memento MCP Neo4j storage'" in memoryWindow
    do script "echo ''" in memoryWindow
    
    -- Show queue status
    do script "echo '📁 Current queue status:'" in memoryWindow
    do script "find .rMemory/docs/ops/memory-queue -name '*.json' 2>/dev/null | wc -l | xargs echo 'Files in queue:'" in memoryWindow
    do script "echo ''" in memoryWindow
    
    -- Manual first run
    do script "echo '⚡ Running initial memory import...'" in memoryWindow
    do script ".rMemory/scripts/launch-memory-import.sh" in memoryWindow
    do script "echo ''" in memoryWindow
    do script "echo '👀 Starting live log monitoring...'" in memoryWindow
    do script "echo ''" in memoryWindow
    
    -- Tail the import logs
    do script "tail -f .rMemory/docs/ops/logs/memory-import-*.log" in memoryWindow
    
    -- Bring Terminal to front
    activate
end tell
