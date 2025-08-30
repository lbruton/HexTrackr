#!/bin/bash
# HexTrackr Memory System - System Startup Script
# Can be run from terminal, cron, or system startup

# Configuration
PROJECT_ROOT="/Volumes/DATA/GitHub/HexTrackr"
MEMORY_DIR="$PROJECT_ROOT/.rMemory"
LOG_DIR="$MEMORY_DIR/logs"
PID_DIR="$MEMORY_DIR/pids"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")

# Ensure we're in the right directory
cd "$PROJECT_ROOT" || {
    echo "❌ Error: Cannot access project directory: $PROJECT_ROOT"
    exit 1
}

# Create required directories
mkdir -p "$LOG_DIR" "$PID_DIR"

echo "🚀 HexTrackr Memory System - System Startup"
echo "==========================================="
echo "📁 Project: $PROJECT_ROOT"
echo "📝 Logs: $LOG_DIR"
echo "🕐 Started: $(date)"
echo

# Function to check if Ollama is running
check_ollama() {
    if ! pgrep -f "ollama serve" > /dev/null; then
        echo "🔧 Starting Ollama..."
        # Try to start Ollama (works on macOS with Ollama.app)
        if command -v ollama > /dev/null; then
            ollama serve > "$LOG_DIR/ollama-$TIMESTAMP.log" 2>&1 &
            sleep 5
        else
            echo "❌ Ollama not found. Please install Ollama first."
            exit 1
        fi
    else
        echo "✅ Ollama is already running"
    fi
}

# Function to ensure required models are available
check_models() {
    echo "🔍 Checking required Ollama models..."
    
    # Check qwen2.5-coder:7b
    if ! ollama list | grep -q "qwen2.5-coder:7b"; then
        echo "📥 Installing qwen2.5-coder:7b..."
        ollama pull qwen2.5-coder:7b
    fi
    
    # Check nomic-embed-text:latest
    if ! ollama list | grep -q "nomic-embed-text"; then
        echo "📥 Installing nomic-embed-text:latest..."
        ollama pull nomic-embed-text:latest
    fi
    
    echo "✅ All required models available"
}

# Function to start semantic orchestrator
start_orchestrator() {
    local orchestrator_log="$LOG_DIR/orchestrator-$TIMESTAMP.log"
    local orchestrator_pid="$PID_DIR/orchestrator.pid"
    
    echo "🧠 Starting semantic orchestrator..."
    
    # Kill existing orchestrator if running
    if [ -f "$orchestrator_pid" ]; then
        local old_pid=$(cat "$orchestrator_pid")
        if kill -0 "$old_pid" 2>/dev/null; then
            echo "🔄 Stopping existing orchestrator (PID: $old_pid)"
            kill "$old_pid"
            sleep 2
        fi
    fi
    
    # Start new orchestrator
    nohup node "$MEMORY_DIR/core/semantic-orchestrator.js" > "$orchestrator_log" 2>&1 &
    local new_pid=$!
    echo "$new_pid" > "$orchestrator_pid"
    
    echo "✅ Orchestrator started (PID: $new_pid)"
    echo "📝 Log: $orchestrator_log"
}

# Function to start embedding indexer
start_indexer() {
    local indexer_log="$LOG_DIR/embedding-indexer-$TIMESTAMP.log"
    local indexer_pid="$PID_DIR/embedding-indexer.pid"
    
    echo "🔍 Starting embedding indexer..."
    
    # Kill existing indexer if running
    if [ -f "$indexer_pid" ]; then
        local old_pid=$(cat "$indexer_pid")
        if kill -0 "$old_pid" 2>/dev/null; then
            echo "🔄 Stopping existing indexer (PID: $old_pid)"
            kill "$old_pid"
            sleep 2
        fi
    fi
    
    # Start new indexer
    nohup node "$MEMORY_DIR/core/embedding-indexer.js" > "$indexer_log" 2>&1 &
    local new_pid=$!
    echo "$new_pid" > "$indexer_pid"
    
    echo "✅ Indexer started (PID: $new_pid)"
    echo "📝 Log: $indexer_log"
}

# Function to show status
show_status() {
    echo
    echo "📊 System Status:"
    echo "=================="
    
    # Check Ollama
    if pgrep -f "ollama serve" > /dev/null; then
        echo "✅ Ollama: Running"
    else
        echo "❌ Ollama: Not running"
    fi
    
    # Check orchestrator
    local orchestrator_pid="$PID_DIR/orchestrator.pid"
    if [ -f "$orchestrator_pid" ]; then
        local pid=$(cat "$orchestrator_pid")
        if kill -0 "$pid" 2>/dev/null; then
            echo "✅ Orchestrator: Running (PID: $pid)"
        else
            echo "❌ Orchestrator: Stopped"
        fi
    else
        echo "❌ Orchestrator: Not started"
    fi
    
    # Check indexer
    local indexer_pid="$PID_DIR/embedding-indexer.pid"
    if [ -f "$indexer_pid" ]; then
        local pid=$(cat "$indexer_pid")
        if kill -0 "$pid" 2>/dev/null; then
            echo "✅ Indexer: Running (PID: $pid)"
        else
            echo "❌ Indexer: Stopped"
        fi
    else
        echo "❌ Indexer: Not started"
    fi
    
    echo
    echo "📂 Quick Commands:"
    echo "  Monitor orchestrator: tail -f $LOG_DIR/orchestrator-$TIMESTAMP.log"
    echo "  Monitor indexer: tail -f $LOG_DIR/embedding-indexer-$TIMESTAMP.log"
    echo "  Stop system: $MEMORY_DIR/scripts/stop-memory-system.sh"
}

# Main execution
main() {
    case "${1:-start}" in
        "start")
            check_ollama
            check_models
            start_orchestrator
            sleep 2
            start_indexer
            show_status
            ;;
        "stop")
            echo "🛑 Stopping HexTrackr Memory System..."
            
            # Stop orchestrator
            local orchestrator_pid="$PID_DIR/orchestrator.pid"
            if [ -f "$orchestrator_pid" ]; then
                local pid=$(cat "$orchestrator_pid")
                if kill -0 "$pid" 2>/dev/null; then
                    kill "$pid"
                    echo "✅ Stopped orchestrator (PID: $pid)"
                fi
                rm -f "$orchestrator_pid"
            fi
            
            # Stop indexer
            local indexer_pid="$PID_DIR/embedding-indexer.pid"
            if [ -f "$indexer_pid" ]; then
                local pid=$(cat "$indexer_pid")
                if kill -0 "$pid" 2>/dev/null; then
                    kill "$pid"
                    echo "✅ Stopped indexer (PID: $pid)"
                fi
                rm -f "$indexer_pid"
            fi
            ;;
        "status")
            show_status
            ;;
        "restart")
            $0 stop
            sleep 3
            $0 start
            ;;
        *)
            echo "Usage: $0 {start|stop|status|restart}"
            echo
            echo "Commands:"
            echo "  start   - Start the memory system"
            echo "  stop    - Stop the memory system"
            echo "  status  - Show system status"
            echo "  restart - Restart the memory system"
            exit 1
            ;;
    esac
}

main "$@"
