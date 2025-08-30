#!/usr/bin/osascript

-- Deep Analysis Scribe Launcher with Live Logs
-- Launches comprehensive chat analysis with Claude for deep insights

tell application "Terminal"
    -- Create new window for deep analysis
    set deepWindow to do script "echo '🔬 Starting Deep Analysis Scribe System...'"
    
    -- Set window title and size
    set custom title of deepWindow to "Deep Analysis Scribe - Claude Insights"
    set number of rows of deepWindow to 30
    set number of columns of deepWindow to 100
    
    -- Navigate to project directory
    do script "cd /Volumes/DATA/GitHub/HexTrackr" in deepWindow
    do script "echo '🧠 Deep Chat Analysis System'" in deepWindow
    do script "echo '🤖 Model: claude-3-5-sonnet-20241022'" in deepWindow
    do script "echo '⏱️  Processing: Hourly comprehensive analysis'" in deepWindow
    do script "echo '📈 Output: High-quality architectural insights'" in deepWindow
    do script "echo ''" in deepWindow
    
    -- Run initial deep analysis
    do script "echo '⚡ Running initial deep analysis...'" in deepWindow
    do script "node .rMemory/scribes/deep-chat-analysis.js" in deepWindow
    do script "echo ''" in deepWindow
    do script "echo '✅ Deep analysis complete! Check .rMemory/docs/ops/deep-analysis/ for insights'" in deepWindow
    do script "echo ''" in deepWindow
    do script "echo '👀 Monitoring for future deep analysis runs...'" in deepWindow
    
    -- Monitor the deep analysis directory for changes
    do script "echo 'Watching .rMemory/docs/ops/deep-analysis/ for new insights...'" in deepWindow
    do script "fswatch -r .rMemory/docs/ops/deep-analysis/ | while read file; do echo \"📊 New insight: $file\"; done" in deepWindow
    
    -- Bring Terminal to front
    activate
end tell
