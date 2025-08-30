#!/bin/bash
# StackTrackr Path Cleanup Script
# Updates all remaining StackTrackr references to rEngine paths

cd "$(dirname "$0")"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🧹 StackTrackr Path Cleanup Script${NC}"
echo "=================================="

# Current project root
PROJECT_ROOT="/Volumes/DATA/GitHub/rEngine"

# Files that need updating (excluding deprecated/backup directories)
CRITICAL_FILES=(
    "rMemory/rAgentMemories/scripts/sync_memory_vault.py"
    "rMemory/rAgentMemories/scripts/mcp_json_sync.py" 
    "rMemory/rAgentMemories/scripts/dynamic_memory.py"
    "rAgents/rScripts/dynamic_memory.py"
    "rAgents/rScripts/mcp_json_sync.py"
    "rEngine/com.stacktrackr.mcp-servers.plist"
    "rProjects/StackTrackr/js/init.js"
)

# Update Python scripts
update_python_files() {
    echo -e "${YELLOW}📝 Updating Python script paths...${NC}"
    
    # Update sync_memory_vault.py
    if [ -f "rMemory/rAgentMemories/scripts/sync_memory_vault.py" ]; then
        sed -i '' 's|/Volumes/DATA/GitHub/StackTrackr/agents|/Volumes/DATA/GitHub/rEngine/rAgents|g' \
            "rMemory/rAgentMemories/scripts/sync_memory_vault.py"
        echo "   ✅ Updated sync_memory_vault.py"
    fi
    
    # Update mcp_json_sync.py files
    for file in "rMemory/rAgentMemories/scripts/mcp_json_sync.py" "rAgents/rScripts/mcp_json_sync.py"; do
        if [ -f "$file" ]; then
            sed -i '' 's|/Volumes/DATA/GitHub/StackTrackr/agents|/Volumes/DATA/GitHub/rEngine/rAgents|g' "$file"
            echo "   ✅ Updated $file"
        fi
    done
    
    # Update dynamic_memory.py files
    for file in "rMemory/rAgentMemories/scripts/dynamic_memory.py" "rAgents/rScripts/dynamic_memory.py"; do
        if [ -f "$file" ]; then
            sed -i '' 's|/Volumes/DATA/GitHub/StackTrackr/agents|/Volumes/DATA/GitHub/rEngine/rAgents|g' "$file"
            sed -i '' 's|/Volumes/DATA/GitHub/StackTrackr|/Volumes/DATA/GitHub/rEngine|g' "$file"
            echo "   ✅ Updated $file"
        fi
    done
}

# Update plist file for new integrated MCP manager
update_plist_file() {
    echo -e "${YELLOW}📝 Updating launchd plist file...${NC}"
    
    if [ -f "rEngine/com.stacktrackr.mcp-servers.plist" ]; then
        cat > "rEngine/com.rengine.mcp-servers.plist" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.rengine.mcp-servers</string>
    
    <key>ProgramArguments</key>
    <array>
        <string>/Volumes/DATA/GitHub/rEngine/integrated-mcp-manager.sh</string>
        <string>start</string>
    </array>
    
    <key>RunAtLoad</key>
    <true/>
    
    <key>KeepAlive</key>
    <dict>
        <key>SuccessfulExit</key>
        <false/>
    </dict>
    
    <key>StandardOutPath</key>
    <string>/Volumes/DATA/GitHub/rEngine/logs/mcp/launchd.log</string>
    
    <key>StandardErrorPath</key>
    <string>/Volumes/DATA/GitHub/rEngine/logs/mcp/launchd.log</string>
    
    <key>WorkingDirectory</key>
    <string>/Volumes/DATA/GitHub/rEngine</string>
</dict>
</plist>
EOF
        
        # Remove old plist file
        rm -f "rEngine/com.stacktrackr.mcp-servers.plist"
        echo "   ✅ Created new com.rengine.mcp-servers.plist"
        echo "   ✅ Removed old com.stacktrackr.mcp-servers.plist"
    fi
}

# Update JavaScript files
update_javascript_files() {
    echo -e "${YELLOW}📝 Updating JavaScript file paths...${NC}"
    
    if [ -f "rProjects/StackTrackr/js/init.js" ]; then
        sed -i '' 's|/Volumes/DATA/GitHub/StackTrackr/rEngine|/Volumes/DATA/GitHub/rEngine/rEngine|g' \
            "rProjects/StackTrackr/js/init.js"
        echo "   ✅ Updated rProjects/StackTrackr/js/init.js"
    fi
}

# Create updated startup script integration
update_startup_integration() {
    echo -e "${YELLOW}📝 Updating startup script integration...${NC}"
    
    # Update robust startup protocol to use integrated MCP manager
    if [ -f "robust-startup-protocol.sh" ]; then
        # Add integrated MCP manager call
        if ! grep -q "integrated-mcp-manager.sh" "robust-startup-protocol.sh"; then
            echo ""
            echo "# Note: Consider updating robust-startup-protocol.sh to use:"
            echo "#   ./integrated-mcp-manager.sh start"
            echo "#   instead of the current MCP server startup method"
        fi
    fi
}

# Run all updates
main() {
    echo -e "${BLUE}Starting StackTrackr path cleanup...${NC}"
    echo ""
    
    update_python_files
    echo ""
    
    update_plist_file  
    echo ""
    
    update_javascript_files
    echo ""
    
    update_startup_integration
    echo ""
    
    echo -e "${GREEN}🎉 StackTrackr path cleanup complete!${NC}"
    echo ""
    echo -e "${BLUE}Summary of changes:${NC}"
    echo "   • Updated Python scripts to use /Volumes/DATA/GitHub/rEngine paths"
    echo "   • Created new com.rengine.mcp-servers.plist for integrated MCP manager"
    echo "   • Updated JavaScript references"
    echo "   • Prepared for integrated MCP server usage"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "   1. Test integrated MCP manager: ./integrated-mcp-manager.sh start"
    echo "   2. Update robust-startup-protocol.sh to use integrated MCP manager"
    echo "   3. Restart VS Code to load new MCP settings"
}

# Run main function
main
