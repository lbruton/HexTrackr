#!/bin/bash
# StackTrackr Automated Document Sweep Script
# Runs the AI-powered documentation generation system
# Generated: August 18, 2025
# Purpose: Fix CRIT-002 - Document Sweep Automation Failed

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_ROOT/logs"
DOCUMENT_SWEEP_SCRIPT="$PROJECT_ROOT/rEngine/document-sweep.js"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
LOG_FILE="$LOG_DIR/document-sweep-$TIMESTAMP.log"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to check prerequisites
check_prerequisites() {
    log "🔍 Checking prerequisites..."
    
    # Check if Node.js is available
    if ! command -v node &> /dev/null; then
        log "❌ ERROR: Node.js is not installed or not in PATH"
        exit 1
    fi
    
    # Check if document-sweep.js exists
    if [[ ! -f "$DOCUMENT_SWEEP_SCRIPT" ]]; then
        log "❌ ERROR: Document sweep script not found at $DOCUMENT_SWEEP_SCRIPT"
        exit 1
    fi
    
    # Check if we're in the right directory
    if [[ ! -d "$PROJECT_ROOT/rEngine" ]]; then
        log "❌ ERROR: Not in StackTrackr project directory"
        exit 1
    fi
    
    log "✅ Prerequisites check passed"
}

# Function to run document sweep
run_document_sweep() {
    log "🚀 Starting automated document sweep..."
    log "📂 Project root: $PROJECT_ROOT"
    log "📄 Log file: $LOG_FILE"
    
    cd "$PROJECT_ROOT"
    
    # Run the document sweep with timeout protection
    if timeout 1800 node "$DOCUMENT_SWEEP_SCRIPT" >> "$LOG_FILE" 2>&1; then
        log "✅ Document sweep completed successfully"
        
        # Check if any files were generated
        local generated_count
        generated_count=$(find "$PROJECT_ROOT/docs/generated" -name "*.md" -newer "$LOG_FILE" 2>/dev/null | wc -l)
        log "📊 Generated $generated_count new documentation files"
        
    else
        local exit_code=$?
        if [[ $exit_code -eq 124 ]]; then
            log "⚠️  Document sweep timed out after 30 minutes"
        else
            log "❌ Document sweep failed with exit code $exit_code"
        fi
        return $exit_code
    fi
}

# Function to cleanup old logs
cleanup_old_logs() {
    log "🧹 Cleaning up old log files..."
    
    # Keep only the last 10 log files
    cd "$LOG_DIR"
    ls -t document-sweep-*.log 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
    
    log "✅ Log cleanup completed"
}

# Function to generate summary
generate_summary() {
    log "📊 Generating execution summary..."
    
    # Count total documentation files
    local total_docs
    total_docs=$(find "$PROJECT_ROOT/docs/generated" -name "*.md" 2>/dev/null | wc -l)
    
    # Get disk usage of generated docs
    local docs_size
    docs_size=$(du -sh "$PROJECT_ROOT/docs/generated" 2>/dev/null | cut -f1 || echo "Unknown")
    
    log "📈 Documentation Summary:"
    log "   📄 Total documentation files: $total_docs"
    log "   💾 Total size: $docs_size"
    log "   📅 Last run: $(date)"
    log "   📝 Log file: $LOG_FILE"
}

# Main execution
main() {
    log "🚀 StackTrackr Automated Document Sweep Started"
    log "═══════════════════════════════════════════════"
    
    # Run all functions
    check_prerequisites
    run_document_sweep
    cleanup_old_logs
    generate_summary
    
    log "✅ Automated document sweep completed successfully"
    log "═══════════════════════════════════════════════"
}

# Execute main function
main "$@"
