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
