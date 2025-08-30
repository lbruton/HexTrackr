#!/usr/bin/osascript

(*
HexTrackr Deep Chat Analysis Scribe Launcher
Launches deep-chat-analysis.js in external Terminal.app for background processing
Ensures proper environment variables and working directory setup
*)

-- Configuration
set projectPath to "/Volumes/DATA/GitHub/HexTrackr"
set scriptName to "deep-chat-analysis.js"
set scriptPath to projectPath & "/.rMemory/scribes/" & scriptName

-- Verify script exists
try
    set scriptFile to POSIX file scriptPath as alias
on error
    display dialog "Error: " & scriptName & " not found at " & scriptPath buttons {"OK"} default button "OK"
    return
end try

-- Build command with proper environment setup
set terminalCommand to "cd " & quoted form of projectPath & " && "
set terminalCommand to terminalCommand & "echo '🏺 Starting HexTrackr Chat Log Archaeology...' && "
set terminalCommand to terminalCommand & "echo '📁 Project: " & projectPath & "' && "
set terminalCommand to terminalCommand & "echo '🔧 Script: " & scriptName & "' && "
set terminalCommand to terminalCommand & "echo '' && "

-- Check for .env file
set terminalCommand to terminalCommand & "if [ ! -f .env ]; then "
set terminalCommand to terminalCommand & "echo '⚠️  Warning: .env file not found - API keys may not be loaded'; "
set terminalCommand to terminalCommand & "echo '   Create .env with ANTHROPIC_API_KEY=your_key_here'; "
set terminalCommand to terminalCommand & "echo ''; "
set terminalCommand to terminalCommand & "fi && "

-- Check for Node.js
set terminalCommand to terminalCommand & "if ! command -v node &> /dev/null; then "
set terminalCommand to terminalCommand & "echo '❌ Node.js not found in PATH'; "
set terminalCommand to terminalCommand & "echo '   Please install Node.js or check your PATH'; "
set terminalCommand to terminalCommand & "exit 1; "
set terminalCommand to terminalCommand & "fi && "

-- Check for npm dependencies
set terminalCommand to terminalCommand & "if [ ! -d node_modules ]; then "
set terminalCommand to terminalCommand & "echo '📦 Installing dependencies...'; "
set terminalCommand to terminalCommand & "npm install; "
set terminalCommand to terminalCommand & "fi && "

-- Execute the archaeology script
set terminalCommand to terminalCommand & "echo '🚀 Launching archaeology script...' && "
set terminalCommand to terminalCommand & "echo '' && "
set terminalCommand to terminalCommand & "node " & quoted form of ("./.rMemory/scribes/" & scriptName) & " > .rMemory/deep-analysis.log 2>&1 & "

-- Add background process info
set terminalCommand to terminalCommand & "echo '' && "
set terminalCommand to terminalCommand & "echo '🔄 Archaeology process started in background.' && "
set terminalCommand to terminalCommand & "echo '📊 Watch progress: tail -f .rMemory/deep-analysis.log' && "
set terminalCommand to terminalCommand & "echo '💾 Results will be saved to docs/ops/recovered-memories/' && "
set terminalCommand to terminalCommand & "echo '' && "
set terminalCommand to terminalCommand & "echo '✅ You can continue working - process runs independently.' && "
set terminalCommand to terminalCommand & "echo 'Terminal will close in 5 seconds...' && "
set terminalCommand to terminalCommand & "sleep 5 && exit"

-- Launch Terminal.app with the command
tell application "Terminal"
    -- Create new window/tab
    set newTab to do script terminalCommand
    
    -- Set window title
    set custom title of newTab to "HexTrackr Chat Log Archaeology"
    
    -- Bring Terminal to front
    activate
end tell

-- Display notification
display notification "Chat Log Archaeology started in background" with title "HexTrackr" subtitle "Claude Opus processing initiated"

-- Optional: Show brief info dialog
set dialogText to "🏺 Chat Log Archaeology Started (Background)

The archaeology script is now running with Claude Opus and will:

• Process VS Code chat sessions using highest quality analysis
• Extract deep project insights and memory patterns  
• Generate comprehensive memory entities for Memento MCP
• Save results to docs/ops/recovered-memories/

✅ Running in background - you can continue working normally.
📊 Monitor progress: tail -f .rMemory/deep-analysis.log"

display dialog dialogText buttons {"Continue"} default button "Continue" with title "HexTrackr Archaeology (Opus)" giving up after 8
