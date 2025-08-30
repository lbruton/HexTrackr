#!/bin/bash
# HexTrackr Memory System - Installation Script
# Sets up system-level startup and cron jobs

PROJECT_ROOT="/Volumes/DATA/GitHub/HexTrackr"
MEMORY_DIR="$PROJECT_ROOT/.rMemory"
SCRIPT_DIR="$MEMORY_DIR/scripts"
CONFIG_DIR="$MEMORY_DIR/config"

echo "🔧 HexTrackr Memory System - Installation"
echo "========================================="
echo

# Make scripts executable
echo "📝 Making scripts executable..."
chmod +x "$SCRIPT_DIR/memory-system.sh"
chmod +x "$MEMORY_DIR/core/semantic-orchestrator.js"
chmod +x "$MEMORY_DIR/core/embedding-indexer.js"
echo "✅ Scripts are now executable"

# Function to install launchd service (macOS startup)
install_launchd() {
    local plist_source="$CONFIG_DIR/com.hextrackr.memory-system.plist"
    local plist_target="$HOME/Library/LaunchAgents/com.hextrackr.memory-system.plist"
    
    echo
    echo "🍎 Installing macOS LaunchAgent (startup service)..."
    
    # Copy plist to LaunchAgents
    cp "$plist_source" "$plist_target"
    echo "📄 Copied plist to: $plist_target"
    
    # Load the service
    launchctl unload "$plist_target" 2>/dev/null  # Unload if exists
    launchctl load "$plist_target"
    echo "🚀 LaunchAgent loaded and will start on login"
    
    echo "✅ macOS startup service installed"
    echo "   • Service: com.hextrackr.memory-system"
    echo "   • Will auto-start on login"
    echo "   • Runs every 5 minutes to ensure processes are alive"
}

# Function to install cron job
install_cron() {
    echo
    echo "⏰ Installing cron job (alternative to LaunchAgent)..."
    
    # Create cron entry
    local cron_entry="*/10 * * * * $SCRIPT_DIR/memory-system.sh start >/dev/null 2>&1"
    
    # Check if cron entry already exists
    if crontab -l 2>/dev/null | grep -q "memory-system.sh"; then
        echo "⚠️  Cron job already exists"
    else
        # Add to crontab
        (crontab -l 2>/dev/null; echo "$cron_entry") | crontab -
        echo "✅ Cron job installed"
        echo "   • Runs every 10 minutes"
        echo "   • Ensures memory system is running"
    fi
}

# Function to create desktop launcher
create_launcher() {
    local launcher_script="$SCRIPT_DIR/desktop-launcher.sh"
    
    echo
    echo "🖥️  Creating desktop launcher..."
    
    cat > "$launcher_script" << 'EOF'
#!/bin/bash
# HexTrackr Memory System - Desktop Launcher

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MEMORY_SCRIPT="$SCRIPT_DIR/memory-system.sh"

# Function to show menu
show_menu() {
    echo "🧠 HexTrackr Memory System"
    echo "=========================="
    echo "1) Start system"
    echo "2) Stop system"
    echo "3) Show status"
    echo "4) Restart system"
    echo "5) View logs"
    echo "6) Exit"
    echo
    read -p "Choose option (1-6): " choice
}

# Function to view logs
view_logs() {
    echo "📝 Available logs:"
    echo "1) Orchestrator logs"
    echo "2) Indexer logs"
    echo "3) Ollama logs"
    echo "4) Back to main menu"
    echo
    read -p "Choose log (1-4): " log_choice
    
    case $log_choice in
        1) find "$(dirname "$SCRIPT_DIR")/logs" -name "orchestrator-*.log" -exec tail -f {} \; ;;
        2) find "$(dirname "$SCRIPT_DIR")/logs" -name "embedding-indexer-*.log" -exec tail -f {} \; ;;
        3) find "$(dirname "$SCRIPT_DIR")/logs" -name "ollama-*.log" -exec tail -f {} \; ;;
        4) return ;;
        *) echo "Invalid option" ;;
    esac
}

# Main loop
while true; do
    clear
    show_menu
    
    case $choice in
        1)
            echo "🚀 Starting memory system..."
            "$MEMORY_SCRIPT" start
            read -p "Press Enter to continue..."
            ;;
        2)
            echo "🛑 Stopping memory system..."
            "$MEMORY_SCRIPT" stop
            read -p "Press Enter to continue..."
            ;;
        3)
            "$MEMORY_SCRIPT" status
            read -p "Press Enter to continue..."
            ;;
        4)
            echo "🔄 Restarting memory system..."
            "$MEMORY_SCRIPT" restart
            read -p "Press Enter to continue..."
            ;;
        5)
            view_logs
            ;;
        6)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please try again."
            sleep 2
            ;;
    esac
done
EOF

    chmod +x "$launcher_script"
    echo "✅ Desktop launcher created: $launcher_script"
}

# Main installation
main() {
    echo "Available installation options:"
    echo "1) macOS LaunchAgent (recommended)"
    echo "2) Cron job"
    echo "3) Desktop launcher only"
    echo "4) All of the above"
    echo
    read -p "Choose installation type (1-4): " install_type
    
    case $install_type in
        1)
            install_launchd
            create_launcher
            ;;
        2)
            install_cron
            create_launcher
            ;;
        3)
            create_launcher
            ;;
        4)
            install_launchd
            install_cron
            create_launcher
            ;;
        *)
            echo "❌ Invalid option"
            exit 1
            ;;
    esac
    
    echo
    echo "🎉 Installation complete!"
    echo "========================"
    echo
    echo "📋 Quick commands:"
    echo "  Start:   $SCRIPT_DIR/memory-system.sh start"
    echo "  Stop:    $SCRIPT_DIR/memory-system.sh stop"
    echo "  Status:  $SCRIPT_DIR/memory-system.sh status"
    echo "  Desktop: $SCRIPT_DIR/desktop-launcher.sh"
    echo
    echo "📝 Logs located in: $MEMORY_DIR/logs/"
    echo
    echo "🚀 To start now: $SCRIPT_DIR/memory-system.sh start"
}

main "$@"
