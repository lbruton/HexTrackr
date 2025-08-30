#!/usr/bin/osascript

(*
HexTrackr Chat Log Archaeology Terminal Launcher
Launches chat-log-archaeology.js in external Terminal.app for background processing
Ensures proper environment variables and working directory setup
*)

-- Configuration
set projectPath to "/Volumes/DATA/GitHub/HexTrackr"
set scriptName to "chat-log-archaeology.js"
set scriptPath to projectPath & "/scripts/" & scriptName

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
set terminalCommand to terminalCommand & "node " & quoted form of ("./scripts/" & scriptName) & "; "

-- Add completion message
set terminalCommand to terminalCommand & "echo '' && "
set terminalCommand to terminalCommand & "echo '🏁 Archaeology process completed.' && "
set terminalCommand to terminalCommand & "echo '📊 Check docs/ops/recovered-memories/ for results' && "
set terminalCommand to terminalCommand & "echo '💾 Memory entities can be imported to Memento MCP' && "
set terminalCommand to terminalCommand & "echo '' && "
set terminalCommand to terminalCommand & "echo 'Press any key to close terminal...' && "
set terminalCommand to terminalCommand & "read -n 1"

-- Launch Terminal.app with the command
tell application "Terminal"
    activate
    
    -- Create new window/tab
    set newTab to do script terminalCommand
    
    -- Set window title
    set custom title of newTab to "HexTrackr Chat Log Archaeology"
    
    -- Bring Terminal to front
    set frontmost to true
end tell

-- Display notification
display notification "Chat Log Archaeology started in Terminal.app" with title "HexTrackr" subtitle "Background processing initiated"

-- Optional: Show brief info dialog
set dialogText to "🏺 Chat Log Archaeology Started

The archaeology script is now running in Terminal.app and will:

• Process VS Code chat sessions (found 20 sessions)
• Extract project insights using Claude API
• Generate memory entities for Memento MCP
• Save results to docs/ops/recovered-memories/

You can continue working in VS Code while it runs in the background."

display dialog dialogText buttons {"Continue"} default button "Continue" with title "HexTrackr Archaeology" giving up after 8
