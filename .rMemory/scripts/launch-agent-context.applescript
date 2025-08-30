#!/usr/bin/osascript

-- Agent Context Loader Launcher with Live Logs
-- Launches daily briefing generation system for perfect continuity

tell application "Terminal"
    -- Create new window for agent context
    set contextWindow to do script "echo '🤝 Starting Agent Context Loader System...'"
    
    -- Set window title and size
    set custom title of contextWindow to "Agent Context Loader - Perfect Continuity"
    set number of rows of contextWindow to 25
    set number of columns of contextWindow to 90
    
    -- Navigate to project directory
    do script "cd /Volumes/DATA/GitHub/HexTrackr" in contextWindow
    do script "echo '🎯 Perfect Continuity System'" in contextWindow
    do script "echo '📋 Purpose: Generate daily agent briefings'" in contextWindow
    do script "echo '🧠 Source: Frustrations + bugs + roadmap + habits + history'" in contextWindow
    do script "echo '⏰ Schedule: Daily morning generation'" in contextWindow
    do script "echo ''" in contextWindow
    
    -- Run agent context loader
    do script "echo '⚡ Generating today\\'s agent briefing...'" in contextWindow
    do script "node .rMemory/scribes/agent-context-loader.js" in contextWindow
    do script "echo ''" in contextWindow
    do script "echo '✅ Agent briefing generated!'" in contextWindow
    do script "ls -la .rMemory/agent-context/agent-briefing-*.md | tail -1" in contextWindow
    do script "echo ''" in contextWindow
    do script "echo '👀 Monitoring agent context updates...'" in contextWindow
    
    -- Monitor agent context directory
    do script "fswatch -r .rMemory/agent-context/ | while read file; do echo \"📝 Context updated: $(basename $file)\"; done" in contextWindow
    
    -- Bring Terminal to front
    activate
end tell
