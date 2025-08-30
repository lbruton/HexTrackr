#!/usr/bin/osascript

-- Master .rMemory System Launcher
-- Launches all scribes with live log monitoring in organized Terminal windows

tell application "Terminal"
    -- Create master control window
    set masterWindow to do script "echo '🎛️  .rMemory Master Control System'"
    
    -- Set window title and size
    set custom title of masterWindow to ".rMemory Master Control - System Overview"
    set number of rows of masterWindow to 45
    set number of columns of masterWindow to 130
    
    do script "cd /Volumes/DATA/GitHub/HexTrackr" in masterWindow
    do script "echo ''" in masterWindow
    do script "echo '🚀 HexTrackr .rMemory Perfect Continuity System'" in masterWindow
    do script "echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'" in masterWindow
    do script "echo ''" in masterWindow
    do script "echo '📋 System Components:'" in masterWindow
    do script "echo '  🔬 Real-time Analysis (Qwen Code 7B) - 30s intervals'" in masterWindow
    do script "echo '  🧠 Memory Import Workflow - 5min processing'" in masterWindow
    do script "echo '  📊 Deep Analysis (Claude Sonnet) - Hourly insights'" in masterWindow
    do script "echo '  😤 Frustration Matrix - Daily learning'" in masterWindow
    do script "echo '  🤝 Agent Context Loader - Perfect continuity'" in masterWindow
    do script "echo ''" in masterWindow
    do script "echo '🎯 Mission: Never-ending friendship with complete context awareness'" in masterWindow
    do script "echo ''" in masterWindow
    do script "echo '⚡ Launching all systems in 3 seconds...'" in masterWindow
    do script "sleep 3" in masterWindow
    
    -- Launch all scribe systems
    do script "echo '🚀 Launching Real-time Analysis Scribe...'" in masterWindow
    do script "osascript .rMemory/scripts/launch-real-time-analysis.applescript &" in masterWindow
    do script "sleep 1" in masterWindow
    
    do script "echo '🧠 Launching Memory Import Workflow...'" in masterWindow
    do script "osascript .rMemory/scripts/launch-memory-import.applescript &" in masterWindow
    do script "sleep 1" in masterWindow
    
    do script "echo '🔬 Launching Deep Analysis System...'" in masterWindow
    do script "osascript .rMemory/scripts/launch-deep-analysis.applescript &" in masterWindow
    do script "sleep 1" in masterWindow
    
    do script "echo '😤 Launching Frustration Matrix Learning...'" in masterWindow
    do script "osascript .rMemory/scripts/launch-frustration-matrix.applescript &" in masterWindow
    do script "sleep 1" in masterWindow
    
    do script "echo '🤝 Launching Agent Context Loader...'" in masterWindow
    do script "osascript .rMemory/scripts/launch-agent-context.applescript &" in masterWindow
    do script "sleep 2" in masterWindow
    
    do script "echo ''" in masterWindow
    do script "echo '✅ ALL SYSTEMS LAUNCHED!'" in masterWindow
    do script "echo ''" in masterWindow
    do script "echo '📊 System Status Monitor:'" in masterWindow
    do script "echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'" in masterWindow
    
    -- Live system monitoring
    do script "while true; do" in masterWindow
    do script "  echo \"⏰ $(date '+%H:%M:%S') - System Status Check\"" in masterWindow
    do script "  echo \"📁 Queue files: $(find .rMemory/docs/ops/memory-queue -name '*.json' 2>/dev/null | wc -l | tr -d ' ')\"" in masterWindow
    do script "  echo \"📊 Analysis files: $(find .rMemory/docs/ops/deep-analysis -name '*.md' 2>/dev/null | wc -l | tr -d ' ')\"" in masterWindow
    do script "  echo \"😤 Frustration strategies: $(find .rMemory/docs/ops/frustration-analysis -name '*.md' 2>/dev/null | wc -l | tr -d ' ')\"" in masterWindow
    do script "  echo \"🤝 Agent briefings: $(find .rMemory/agent-context -name '*.md' 2>/dev/null | wc -l | tr -d ' ')\"" in masterWindow
    do script "  echo \"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\"" in masterWindow
    do script "  sleep 30" in masterWindow
    do script "done" in masterWindow
    
    -- Bring Terminal to front
    activate
end tell
