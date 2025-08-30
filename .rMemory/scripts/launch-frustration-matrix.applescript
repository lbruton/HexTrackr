#!/usr/bin/osascript

-- Frustration Matrix Scribe Launcher with Live Logs
-- Launches pain point learning system with prevention strategy generation

tell application "Terminal"
    -- Create new window for frustration analysis
    set frustrationWindow to do script "echo '😤➡️😊 Starting Frustration Matrix Learning System...'"
    
    -- Set window title and size
    set custom title of frustrationWindow to "Frustration Matrix - Pain Point Learning"
    set number of rows of frustrationWindow to 25
    set number of columns of frustrationWindow to 95
    
    -- Navigate to project directory
    do script "cd /Volumes/DATA/GitHub/HexTrackr" in frustrationWindow
    do script "echo '🧠 Frustration Learning & Prevention System'" in frustrationWindow
    do script "echo '🤖 Model: claude-3-5-sonnet-20241022'" in frustrationWindow
    do script "echo '🎯 Purpose: Learn from pain points, generate prevention strategies'" in frustrationWindow
    do script "echo '📅 Schedule: Daily analysis'" in frustrationWindow
    do script "echo ''" in frustrationWindow
    
    -- Run initial frustration analysis
    do script "echo '⚡ Running initial frustration analysis...'" in frustrationWindow
    do script "node .rMemory/scribes/frustration-matrix.js" in frustrationWindow
    do script "echo ''" in frustrationWindow
    do script "echo '✅ Frustration analysis complete!'" in frustrationWindow
    do script "echo '📊 Check .rMemory/docs/ops/frustration-analysis/ for prevention strategies'" in frustrationWindow
    do script "echo ''" in frustrationWindow
    do script "echo '👀 Monitoring for new frustrations to learn from...'" in frustrationWindow
    
    -- Monitor frustration analysis directory
    do script "fswatch -r .rMemory/docs/ops/frustration-analysis/ | while read file; do echo \"🎯 New prevention strategy: $(basename $file)\"; done" in frustrationWindow
    
    -- Bring Terminal to front
    activate
end tell
