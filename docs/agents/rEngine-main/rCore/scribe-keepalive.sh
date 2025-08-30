#!/bin/bash

# Smart Scribe Keep-Alive and System Health Check
# Sends the "Cool Runnings" keep-alive message and reinitializes system prompts

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OLLAMA_ENDPOINT="http://localhost:11434"
MODEL="qwen2.5-coder:3b"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date '+%H:%M:%S')] ERROR:${NC} $1"
}

success() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')] SUCCESS:${NC} $1"
}

# Function to send keep-alive message
send_keepalive() {
    log "Sending keep-alive message to Smart Scribe..."
    
    # Prepare the keep-alive message
    local message="sanka ya dead mon"
    local system_prompt="You are a cheerful Jamaican AI assistant monitoring system health. When someone says 'sanka ya dead mon', always respond EXACTLY with: 'ya mon'. This confirms you're alive and well. After responding, reinitialize your system prompts and clear any conversation context to ensure optimal performance."
    
    # Send to Ollama
    local response=$(curl -s -X POST "$OLLAMA_ENDPOINT/api/chat" \
        -H "Content-Type: application/json" \
        -d "{
            \"model\": \"$MODEL\",
            \"messages\": [
                {\"role\": \"system\", \"content\": \"$system_prompt\"},
                {\"role\": \"user\", \"content\": \"$message\"}
            ],
            \"stream\": false
        }" 2>/dev/null)
    
    if [ $? -eq 0 ] && [ -n "$response" ]; then
        # Extract the response content
        local ai_response=$(echo "$response" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('message', {}).get('content', '').strip())
except:
    print('parse_error')
" 2>/dev/null)
        
        if [[ "$ai_response" == *"ya mon"* ]]; then
            success "Smart Scribe is alive and responded: '$ai_response'"
            return 0
        else
            error "Unexpected response from Smart Scribe: '$ai_response'"
            return 1
        fi
    else
        error "Failed to communicate with Smart Scribe"
        return 1
    fi
}

# Function to check Ollama service
check_ollama() {
    log "Checking Ollama service health..."
    
    local status=$(curl -s "$OLLAMA_ENDPOINT/api/ps" 2>/dev/null)
    if [ $? -eq 0 ]; then
        success "Ollama service is running"
        
        # Check if our model is loaded
        local model_loaded=$(echo "$status" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    models = data.get('models', [])
    for model in models:
        if model.get('name') == '$MODEL':
            print('true')
            exit()
    print('false')
except:
    print('false')
" 2>/dev/null)
        
        if [ "$model_loaded" = "true" ]; then
            success "Model $MODEL is loaded and ready"
        else
            log "Model $MODEL not loaded, keep-alive will load it"
        fi
        
        return 0
    else
        error "Ollama service is not responding"
        return 1
    fi
}

# Function to trigger smart scribe health check
trigger_scribe_healthcheck() {
    log "Triggering Smart Scribe health check..."
    
    # Check if smart-scribe.js process is running
    local scribe_pid=$(pgrep -f "smart-scribe.js" 2>/dev/null)
    
    if [ -n "$scribe_pid" ]; then
        success "Smart Scribe process running (PID: $scribe_pid)"
    else
        log "Smart Scribe process not found, attempting to start..."
        
        # Try to start Smart Scribe in background
        cd "$SCRIPT_DIR"
        nohup node smart-scribe.js > /tmp/smart-scribe.log 2>&1 &
        local new_pid=$!
        
        sleep 2
        
        if kill -0 $new_pid 2>/dev/null; then
            success "Smart Scribe started successfully (PID: $new_pid)"
        else
            error "Failed to start Smart Scribe"
            return 1
        fi
    fi
    
    return 0
}

# Function to create status report
create_status_report() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local status_file="/tmp/smart-scribe-status.json"
    
    cat > "$status_file" << EOF
{
  "timestamp": "$timestamp",
  "keepalive_check": "$(date '+%Y-%m-%d %H:%M:%S')",
  "ollama_status": "$(check_ollama > /dev/null 2>&1 && echo 'healthy' || echo 'error')",
  "model": "$MODEL",
  "scribe_process": "$(pgrep -f smart-scribe.js > /dev/null 2>&1 && echo 'running' || echo 'stopped')",
  "last_response": "$(send_keepalive 2>&1 | tail -1)"
}
EOF
    
    log "Status report saved to: $status_file"
}

# Main execution
main() {
    echo ""
    echo -e "${YELLOW}════════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}   🤖 Smart Scribe Keep-Alive & Health Check $(date)   ${NC}"
    echo -e "${YELLOW}════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    # Check Ollama first
    if ! check_ollama; then
        error "Ollama service check failed, cannot proceed"
        exit 1
    fi
    
    # Check/start Smart Scribe process
    if ! trigger_scribe_healthcheck; then
        error "Smart Scribe health check failed"
        exit 1
    fi
    
    # Send keep-alive message
    if send_keepalive; then
        success "Keep-alive cycle completed successfully"
        
        # Create status report
        create_status_report
        
        echo ""
        echo -e "${GREEN}✅ All systems operational${NC}"
        echo ""
        
        exit 0
    else
        error "Keep-alive cycle failed"
        exit 1
    fi
}

# Handle arguments
case "${1:-}" in
    "keepalive"|"")
        main
        ;;
    "status")
        check_ollama
        trigger_scribe_healthcheck
        create_status_report
        ;;
    "start")
        trigger_scribe_healthcheck
        ;;
    "test")
        send_keepalive
        ;;
    *)
        echo "Usage: $0 {keepalive|status|start|test}"
        echo ""
        echo "Commands:"
        echo "  keepalive (default) - Full health check and keep-alive"
        echo "  status             - Check system status only"
        echo "  start              - Start Smart Scribe if not running"
        echo "  test               - Test keep-alive message only"
        exit 1
        ;;
esac
