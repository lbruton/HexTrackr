#!/usr/bin/osascript

# Smart Documentation Generator Launcher
# Creates a dedicated terminal window that won't close accidentally

tell application "Terminal"
    # Create new terminal window
    set newWindow to do script "cd '/Volumes/DATA/GitHub/rEngine'"
    
    # Set window properties
    set current settings of newWindow to settings set "Homebrew"
    set custom title of newWindow to "🤖 Smart Documentation Generator"
    
    # Set window size and position
    set bounds of window 1 to {100, 100, 900, 600}
    
    # Run the documentation generator
    do script "echo '🚀 Starting Smart Documentation Generator...'" in newWindow
    do script "echo '📊 This window will stay open to keep the generator running'" in newWindow
    do script "echo '🔄 Documentation will auto-update when files change'" in newWindow
    do script "echo ''" in newWindow
    do script "node smart-doc-generator.js" in newWindow
    
    # Bring Terminal to front
    activate
end tell

# Also create a quick launcher for the Enhanced Scribe Console
tell application "Terminal"
    set scribeWindow to do script "cd '/Volumes/DATA/GitHub/rEngine'"
    
    set current settings of scribeWindow to settings set "Novel"
    set custom title of scribeWindow to "🌸 Enhanced Scribe Console"
    set bounds of window 1 to {950, 100, 1750, 600}
    
    do script "echo '🌸 Enhanced Scribe Console with AI Analysis'" in scribeWindow
    do script "echo '🤖 Qwen2.5-Coder 7B Ready'" in scribeWindow
    do script "echo '📋 Session tracking active'" in scribeWindow
    do script "echo ''" in scribeWindow
    do script "node enhanced-scribe-console.js" in scribeWindow
end tell
