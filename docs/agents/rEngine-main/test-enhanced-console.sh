#!/bin/bash
# Quick test of Enhanced Scribe Console functionality

echo "🧪 Testing Enhanced Scribe Console Components..."
echo ""

# Check if rEngine is in the right directory
if [ -f "/Volumes/DATA/GitHub/rEngine/enhanced-scribe-console.js" ]; then
    echo "✅ Enhanced Scribe Console found"
else
    echo "❌ Enhanced Scribe Console not found"
    exit 1
fi

# Check if memory directory exists
if [ -d "/Volumes/DATA/GitHub/rEngine/rMemory" ]; then
    echo "✅ Memory directory exists"
    file_count=$(ls -1 /Volumes/DATA/GitHub/rEngine/rMemory/*.json 2>/dev/null | wc -l)
    echo "   📁 Contains $file_count JSON files"
else
    echo "❌ Memory directory missing"
fi

# Check if VS Code chat logs exist
if [ -d "$HOME/Library/Application Support/Code/logs" ]; then
    echo "✅ VS Code logs directory found"
    log_count=$(find "$HOME/Library/Application Support/Code/logs" -name "*.log" 2>/dev/null | wc -l)
    echo "   📊 Contains $log_count log files"
else
    echo "❌ VS Code logs directory not found"
fi

# Check if Enhanced Scribe Console process is running
if pgrep -f "enhanced-scribe-console.js" > /dev/null; then
    echo "✅ Enhanced Scribe Console is running"
    pid=$(pgrep -f "enhanced-scribe-console.js")
    echo "   🔧 Process ID: $pid"
else
    echo "⚠️  Enhanced Scribe Console not currently running"
fi

# Check VS Code chat integration framework
if grep -q "CHAT_INTEGRATION" "/Volumes/DATA/GitHub/rEngine/enhanced-scribe-console.js"; then
    echo "✅ VS Code chat integration framework detected"
    
    # Check if specific methods exist
    if grep -q "scanVSCodeChatLogs" "/Volumes/DATA/GitHub/rEngine/enhanced-scribe-console.js"; then
        echo "   📡 VS Code chat scanning methods found"
    fi
    
    if grep -q "queryRollingContext" "/Volumes/DATA/GitHub/rEngine/enhanced-scribe-console.js"; then
        echo "   🔍 Rolling context query system found"
    fi
else
    echo "❌ VS Code chat integration not found"
fi

echo ""
echo "🎯 Integration Status Summary:"
echo "   The Enhanced Scribe Console should now have:"
echo "   • Improved memory sync error handling"
echo "   • VS Code chat log scanning every 30 seconds"
echo "   • Rolling context commands (chat, chat10, chat100, chat1000)"
echo "   • Multi-IDE expansion framework with comments"
echo ""
echo "To test the new commands, type them in the running console:"
echo "   memory     - Check memory status"
echo "   chat       - Show last conversation"
echo "   chat10     - Show last 10 conversations"
echo "   help       - Show all available commands"
