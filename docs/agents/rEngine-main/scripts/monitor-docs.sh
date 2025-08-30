#!/bin/bash

# Live Documentation Generation Monitor
# Monitor all aspects of the overnight documentation process

echo "🔍 StackTrackr Documentation Generation Monitor"
echo "=============================================="
echo ""

# Function to show current status
show_status() {
    echo "📊 CURRENT STATUS ($(date))"
    echo "----------------------------------------"
    
    # Check if batch processor is running
    if pgrep -f "overnight-batch-processor" > /dev/null; then
        echo "✅ Batch Processor: RUNNING"
    else
        echo "❌ Batch Processor: STOPPED"
    fi
    
    # Check if document generator is running
    if pgrep -f "smart-document-generator" > /dev/null; then
        echo "✅ Document Generator: RUNNING"
    else
        echo "❌ Document Generator: STOPPED"
    fi
    
    # Show Groq rate limiter stats
    if [ -f ".rate-limiter-groq.json" ]; then
        echo "📈 Groq Rate Limiter Stats:"
        echo "   $(cat .rate-limiter-groq.json | jq -r '.requestHistory | length') total requests logged"
        echo "   Last request: $(cat .rate-limiter-groq.json | jq -r '.requestHistory[-1].timestamp // "never"' | xargs -I {} date -r {} 2>/dev/null || echo "never")"
    fi
    
    echo ""
}

# Function to show recent log entries
show_recent_logs() {
    echo "📋 RECENT ACTIVITY (Last 10 lines)"
    echo "----------------------------------------"
    if [ -f "rEngine/logs/batch-processing-$(date +%Y-%m-%d).log" ]; then
        tail -10 "rEngine/logs/batch-processing-$(date +%Y-%m-%d).log"
    else
        echo "No log file found for today."
    fi
    echo ""
}

# Function to show generated documentation
show_progress() {
    echo "📚 DOCUMENTATION PROGRESS"
    echo "----------------------------------------"
    
    # Count generated files
    css_docs=$(find docs/generated -name "*css*" -type f 2>/dev/null | wc -l | tr -d ' ')
    js_docs=$(find docs/generated -name "*js*" -type f 2>/dev/null | wc -l | tr -d ' ')
    total_docs=$(find docs/generated -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
    
    echo "   CSS Documentation Files: $css_docs"
    echo "   JavaScript Documentation Files: $js_docs"
    echo "   Total Documentation Files: $total_docs"
    
    # Show latest generated file
    latest_doc=$(find docs/generated -name "*.md" -type f -exec stat -f "%m %N" {} \; 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2-)
    if [ -n "$latest_doc" ]; then
        echo "   Latest Generated: $(basename "$latest_doc")"
        echo "   Generated At: $(stat -f "%Sm" "$latest_doc" 2>/dev/null)"
    fi
    echo ""
}

# Main monitoring loop
if [ "$1" = "--watch" ]; then
    echo "🔄 Starting live monitor (Press Ctrl+C to exit)..."
    echo ""
    
    while true; do
        clear
        echo "🔍 StackTrackr Documentation Generation Monitor"
        echo "=============================================="
        echo ""
        
        show_status
        show_progress
        show_recent_logs
        
        echo "🔄 Refreshing in 30 seconds... (Press Ctrl+C to exit)"
        sleep 30
    done
else
    # Single status check
    show_status
    show_progress
    show_recent_logs
    
    echo "💡 AVAILABLE LOGS TO TAIL:"
    echo "----------------------------------------"
    echo "   Main batch log: tail -f rEngine/logs/batch-processing-$(date +%Y-%m-%d).log"
    echo "   Rate limiter state: cat .rate-limiter-groq.json | jq"
    echo "   Live monitor: ./monitor-docs.sh --watch"
    echo ""
fi
