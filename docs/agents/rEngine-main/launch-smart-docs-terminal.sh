#!/bin/bash

# Launch Smart Documentation Generator in Apple Terminal
# This script ensures proper environment setup for Terminal execution

echo "🚀 Launching Smart Documentation Generator in Apple Terminal..."

# Launch in a new Terminal window using AppleScript
osascript << 'EOF'
tell application "Terminal"
    activate
    
    -- Create new window for Smart Documentation Generator
    set newWindow to do script "cd /Volumes/DATA/GitHub/rEngine"
    
    -- Position window on right side
    set bounds of front window to {950, 100, 1800, 700}
    
    -- Set window title
    set custom title of front window to "rEngine Smart Documentation Generator"
    
    -- Start the documentation generator with proper error handling
    do script "echo '📚 Starting Smart Documentation Generator...' && echo '=================================' && node smart-doc-generator.js 2>&1 | tee docs-generation.log" in newWindow
    
end tell
EOF

echo "✅ Smart Documentation Generator launched in Terminal.app"
echo "📝 Output will be logged to docs-generation.log"
