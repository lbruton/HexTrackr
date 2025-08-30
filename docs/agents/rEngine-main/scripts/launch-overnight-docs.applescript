#!/usr/bin/osascript

-- AppleScript to launch overnight documentation generation in a new Terminal window
-- This allows monitoring the process while continuing other work

tell application "Terminal"
    -- Activate Terminal app
    activate
    
    -- Create new window with custom title and settings
    set newWindow to do script ""
    
    -- Wait a moment for window to initialize
    delay 1
    
    -- Navigate to the project directory and start the process
    do script "cd '/Volumes/DATA/GitHub/rEngine'" in newWindow
    delay 1
    
    -- Show startup banner
    do script "echo '🌙 StackTrackr Overnight Documentation Generator'" in newWindow
    do script "echo '📅 Starting at: '$(date)" in newWindow
    do script "echo '📂 Working directory: '$(pwd)" in newWindow
    do script "echo ''" in newWindow
    do script "echo '⚡ Using Groq API with optimized rate limiting'" in newWindow
    do script "echo '📊 Processing files with 200-line chunks and 75-second delays'" in newWindow
    do script "echo '🎯 Target files: CSS, JavaScript, and configuration files'" in newWindow
    do script "echo ''" in newWindow
    do script "echo '🚀 Starting documentation generation...'" in newWindow
    do script "echo ''" in newWindow
    
    delay 2
    
    -- Start the main process
    do script "node rEngine/overnight-batch-processor.js" in newWindow
    
end tell

-- Show notification that the process has started
display notification "Overnight documentation generation started in new Terminal window" with title "StackTrackr" subtitle "Monitor progress in Terminal"
