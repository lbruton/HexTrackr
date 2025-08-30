#!/bin/bash

# Ollama Singleton Manager - Ensures only ONE Ollama instance runs at a time
# Prevents memory issues from multiple concurrent models

OLLAMA_MODELS_DIR="/Volumes/DATA/ollama"
LOCK_FILE="/tmp/ollama.lock"
PID_FILE="/tmp/ollama.pid"
PORT=11434

echo "🔒 Ollama Singleton Manager - Ensuring single instance..."

# Function to kill all Ollama processes
kill_all_ollama() {
    echo "🛑 Killing all existing Ollama processes..."
    pkill -f "ollama" 2>/dev/null
    killall "Ollama" 2>/dev/null
    pkill -f "ollama runner" 2>/dev/null
    sleep 3
    
    # Force kill if still running
    pkill -9 -f "ollama" 2>/dev/null
    killall -9 "Ollama" 2>/dev/null
    sleep 2
    
    # Clean up lock files
    rm -f "$LOCK_FILE" "$PID_FILE"
    echo "✅ All Ollama processes terminated"
}

# Function to check if Ollama is running
is_ollama_running() {
    pgrep -f "ollama" >/dev/null 2>&1
}

# Function to check if Ollama port is already in use (e.g., by Docker)
is_port_in_use() {
    if command -v lsof >/dev/null 2>&1; then
        lsof -nP -iTCP:${PORT} -sTCP:LISTEN >/dev/null 2>&1
    else
        # Fallback: macOS netstat
        netstat -an | grep ".${PORT}" | grep LISTEN >/dev/null 2>&1
    fi
}

# Function to check if Docker is exposing Ollama/OpenWebUI
docker_provides_ollama() {
    if command -v docker >/dev/null 2>&1; then
        docker ps --format '{{.Ports}} {{.Names}}' 2>/dev/null | grep -qE '11434->|ollama|openwebui'
    else
        return 1
    fi
}

# Function to start Ollama safely
start_ollama() {
    echo "🚀 Starting Ollama with external drive models..."
    export OLLAMA_MODELS="$OLLAMA_MODELS_DIR"
    # Guard: if port is already bound or Docker provides Ollama, do not start another instance
    if is_port_in_use; then
        echo "🟡 Port ${PORT} already in use. Skipping local Ollama start to avoid duplicates."
        return 0
    fi
    if docker_provides_ollama; then
        echo "🟡 Docker appears to expose Ollama/OpenWebUI. Skipping local start."
        return 0
    fi
    
    # Start Ollama in background and capture PID
    OLLAMA_MODELS="$OLLAMA_MODELS_DIR" ollama serve &
    local ollama_pid=$!
    
    # Create lock file with PID
    echo "$ollama_pid" > "$PID_FILE"
    touch "$LOCK_FILE"
    
    echo "✅ Ollama started with PID: $ollama_pid"
    echo "📁 Using models directory: $OLLAMA_MODELS_DIR"
    
    # Wait a moment for startup
    sleep 3
}

# Function to run a model safely
run_model() {
    local model_name="$1"
    local prompt="$2"
    
    if [[ -z "$model_name" ]]; then
        echo "❌ Error: No model specified"
        echo "💡 Recommended lightweight models: qwen2.5-coder:3b, gemma2:2b, qwen2.5:3b"
        echo "Usage: $0 run <model_name> [prompt]"
        exit 1
    fi
    
    # Warn if using heavy models
    if [[ "$model_name" == "llama3:8b" || "$model_name" == *"8b"* ]]; then
        echo "⚠️  WARNING: $model_name is a heavy model that uses ~5-6GB VRAM!"
        echo "💡 Consider using: qwen2.5-coder:3b (1.9GB) for better memory efficiency"
        read -p "Continue with heavy model? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "🚫 Cancelled. Use: $0 run qwen2.5-coder:3b"
            exit 0
        fi
    fi
    
    echo "🤖 Running model: $model_name"
    
    if [[ -n "$prompt" ]]; then
        OLLAMA_MODELS="$OLLAMA_MODELS_DIR" ollama run "$model_name" "$prompt"
    else
        OLLAMA_MODELS="$OLLAMA_MODELS_DIR" ollama run "$model_name"
    fi
}

# Function to list models
list_models() {
    echo "📋 Available models:"
    OLLAMA_MODELS="$OLLAMA_MODELS_DIR" ollama list
}

# Function to check status
check_status() {
    echo "📊 Ollama Status Check:"
    echo "Lock file: $([ -f "$LOCK_FILE" ] && echo "EXISTS" || echo "MISSING")"
    echo "PID file: $([ -f "$PID_FILE" ] && echo "EXISTS" || echo "MISSING")"
    
    if is_ollama_running; then
        echo "🟢 Ollama is RUNNING"
        echo "Active processes:"
        ps aux | grep -E "(ollama|Ollama)" | grep -v grep
        echo ""
        echo "Memory usage:"
        ps aux | grep -E "(ollama|Ollama)" | grep -v grep | awk '{sum+=$4} END {printf "Total Ollama RAM: %.1f%%\n", sum}'
    else
        echo "🔴 Ollama is NOT running"
    fi
}

# Main logic
case "${1:-start}" in
    "kill"|"stop")
        kill_all_ollama
        ;;
    "restart")
        kill_all_ollama
        start_ollama
        ;;
    "run")
        # Ensure only one instance before running model
        if is_ollama_running; then
            echo "⚠️  Ollama already running - checking for multiple instances..."
            local running_count=$(pgrep -f "ollama" | wc -l)
            if [[ $running_count -gt 2 ]]; then
                echo "🚨 Multiple Ollama instances detected! Restarting..."
                kill_all_ollama
                start_ollama
            fi
        else
            start_ollama
        fi
        run_model "$2" "$3"
        ;;
    "list")
        if ! is_ollama_running; then
            start_ollama
        fi
        list_models
        ;;
    "status")
        check_status
        ;;
    "start"|*)
    if is_ollama_running || is_port_in_use || docker_provides_ollama; then
            echo "⚠️  Ollama already running"
            check_status
        else
            start_ollama
        fi
        ;;
esac
