#!/usr/bin/osascript

(*
HexTrackr Memory Import Launcher
Launches memory-importer.js in external Terminal.app for background processing
Ensures proper environment variables and working directory setup for Neo4j import
*)

-- Configuration
set projectPath to "/Volumes/DATA/GitHub/HexTrackr"
set scriptName to "memory-importer.js"
set scriptPath to projectPath & "/.rMemory/core/" & scriptName

-- Verify script exists
try
    set scriptFile to POSIX file scriptPath as alias
on error
    display dialog "Error: " & scriptName & " not found at " & scriptPath buttons {"OK"} default button "OK"
    return
end try

-- Build command with proper environment setup
set terminalCommand to "cd " & quoted form of projectPath & " && "
set terminalCommand to terminalCommand & "echo '🧠 Starting HexTrackr Memory Import to Neo4j...' && "
set terminalCommand to terminalCommand & "echo '📁 Project: " & projectPath & "' && "
set terminalCommand to terminalCommand & "echo '🔧 Script: " & scriptName & "' && "
set terminalCommand to terminalCommand & "echo '🗄️ Target: Neo4j via Memento MCP' && "
set terminalCommand to terminalCommand & "echo '' && "

-- Check for .env file and load environment variables
set terminalCommand to terminalCommand & "if [ ! -f .env ]; then "
set terminalCommand to terminalCommand & "echo '❌ Error: .env file not found!'; "
set terminalCommand to terminalCommand & "echo 'Please ensure .env file exists with required API keys'; "
set terminalCommand to terminalCommand & "echo 'Required: ANTHROPIC_API_KEY'; "
set terminalCommand to terminalCommand & "exit 1; "
set terminalCommand to terminalCommand & "fi && "

-- Load environment variables from .env file
set terminalCommand to terminalCommand & "echo '🔧 Loading environment variables from .env...' && "
set terminalCommand to terminalCommand & "export $(grep -v '^#' .env | xargs) && "
set terminalCommand to terminalCommand & "echo '✅ Environment loaded successfully' && "

-- Check for required API key after loading
set terminalCommand to terminalCommand & "if [ -z \"$ANTHROPIC_API_KEY\" ]; then "
set terminalCommand to terminalCommand & "echo '❌ Error: ANTHROPIC_API_KEY not found in environment!'; "
set terminalCommand to terminalCommand & "echo 'Please add ANTHROPIC_API_KEY to your .env file'; "
set terminalCommand to terminalCommand & "exit 1; "
set terminalCommand to terminalCommand & "fi && "
set terminalCommand to terminalCommand & "echo '🔑 API Key loaded: '${ANTHROPIC_API_KEY:0:10}'...'${ANTHROPIC_API_KEY: -4} && "

-- Launch the memory import process
set terminalCommand to terminalCommand & "echo '🚀 Launching memory import process...' && "
set terminalCommand to terminalCommand & "echo '⏳ This will run in background - safe to close this terminal' && "
set terminalCommand to terminalCommand & "echo '' && "
set terminalCommand to terminalCommand & "node " & quoted form of scriptPath & " && "
set terminalCommand to terminalCommand & "echo '' && "
set terminalCommand to terminalCommand & "echo '✅ Memory import complete!' && "
set terminalCommand to terminalCommand & "echo '🎉 All extracted memories uploaded to Neo4j' && "
set terminalCommand to terminalCommand & "echo '' && "
set terminalCommand to terminalCommand & "echo 'Press any key to close this terminal...' && "
set terminalCommand to terminalCommand & "read -n 1"

-- Create new Terminal window and execute command
tell application "Terminal"
    activate
    
    -- Create new window with custom title
    set newWindow to do script terminalCommand
    
    -- Set window title for easy identification
    set custom title of newWindow to "HexTrackr Memory Import - " & (current date as string)
    
    -- Set window properties for better visibility
    tell newWindow
        set background color to {0, 0, 0} -- Black background
        set normal text color to {0, 65535, 0} -- Green text
        set cursor color to {65535, 65535, 0} -- Yellow cursor
    end tell
    
end tell

-- Show success notification
display notification "Memory import process started in Terminal.app" with title "HexTrackr Memory Import" subtitle "Running in background" sound name "Glass"

-- Optional: Return focus to VS Code (if running)
try
    tell application "Visual Studio Code" to activate
on error
    -- VS Code might not be running, ignore error
end try
