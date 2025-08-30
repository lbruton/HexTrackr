#!/bin/bash

# StackTrackr Portable Sync Tool
# Dynamically detects project paths - works after zip/unzip

set -e

# Detect project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
AGENTS_DIR="$PROJECT_ROOT/agents"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ✅ $1"; }
warn() { echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ⚠️ $1"; }
error() { echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ❌ $1"; }

log "Portable sync tool - Project root: $PROJECT_ROOT"

# Basic memory file validation
validate_memory_files() {
    log "Validating memory files..."
    local errors=0
    
    for json_file in "$AGENTS_DIR"/*.json; do
        if [ -f "$json_file" ]; then
            if python3 -m json.tool "$json_file" > /dev/null 2>&1; then
                log "✓ $(basename "$json_file") - valid JSON"
            else
                error "✗ $(basename "$json_file") - invalid JSON"
                ((errors++))
            fi
        fi
    done
    
    if [ $errors -eq 0 ]; then
        success "All memory files are valid"
    else
        error "Found $errors invalid JSON files"
    fi
}

# Main function
case "${1:-validate}" in
    "validate")
        validate_memory_files
        ;;
    *)
        echo "Usage: $0 [validate]"
        echo "  validate - Check JSON file integrity"
        ;;
esac
