#!/bin/bash

# StackTrackr GPT Export Packager
# Quick command: "package me an export for GPT" 
# Creates ready-to-upload zip in portable_exchange/ directory

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log() { echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} ✅ $1"; }
warn() { echo -e "${YELLOW}[$(date '+%H:%M:%S')]${NC} ⚠️ $1"; }
error() { echo -e "${RED}[$(date '+%H:%M:%S')]${NC} ❌ $1"; }

# Detect project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
EXCHANGE_DIR="$PROJECT_ROOT/portable_exchange"

log "📦 GPT Export Packager - Creating portable exchange package"

# Create exchange directory
mkdir -p "$EXCHANGE_DIR"

# Quick prep (lightweight version)
quick_prep() {
    log "Running quick memory sync..."
    
    # Update key timestamps
    current_time=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    
    for json_file in "$PROJECT_ROOT/agents"/{memory,bugs,roadmap,tasks}.json; do
        if [ -f "$json_file" ]; then
            python3 -c "
import json
try:
    with open('$json_file', 'r') as f:
        data = json.load(f)
    if 'metadata' in data:
        data['metadata']['last_updated'] = '$current_time'
        data['metadata']['gpt_export_prep'] = True
    with open('$json_file', 'w') as f:
        json.dump(data, f, indent=2)
except: pass
" 2>/dev/null || true
        fi
    done
    
    success "Memory sync completed"
}

# Create the export package
create_export_package() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local export_name="StackTrackr_GPT_Export_$timestamp.zip"
    local export_path="$EXCHANGE_DIR/$export_name"
    
    log "Creating export package: $export_name"
    
    # Create zip with optimized exclusions
    cd "$PROJECT_ROOT"
    zip -r "$export_path" . \
        -x "node_modules/*" \
        -x ".git/*" \
        -x "agents/backups/*" \
        -x "portable_exchange/*" \
        -x ".DS_Store" \
        -x "*.log" \
        -x ".vscode/*" \
        -x "*.tmp" \
        > /dev/null 2>&1
    
    if [ -f "$export_path" ]; then
        local size=$(du -h "$export_path" | cut -f1)
        success "Export created: $export_name ($size)"
        return 0
    else
        error "Failed to create export package"
        return 1
    fi
}

# Create instruction card for ChatGPT
create_instruction_card() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    
    cat > "$EXCHANGE_DIR/GPT_INSTRUCTIONS_$timestamp.md" << 'EOF'
# 🤖 ChatGPT/GPT5 - StackTrackr Project Context

## 📋 **What You're Looking At**
This is **StackTrackr** - a comprehensive coin collection management application with a sophisticated multi-agent memory system.

## 🧠 **Memory System (Your Superpower!)**
The `agents/` directory contains complete project intelligence:
- `agents/memory.json` - Core memories and decisions
- `agents/bugs.json` - Current bugs with priorities  
- `agents/roadmap.json` - Feature planning and milestones
- `agents/tasks.json` - Task tracking with dependencies
- `agents/prompts.json` - Reusable prompt library

## 🎯 **Current Focus Areas**
1. **Filter System Issues** - BUG-006 (filter chips styling/colors)
2. **UI Polish** - Table styling consistency
3. **Performance** - Planning virtual scrolling for large datasets

## 🚀 **What You Can Do**
- Reference previous decisions from JSON memory files
- Continue existing tasks and roadmap items
- Maintain consistency with established patterns
- Use portable scripts in `agents/zip_prep/` if needed

## 💡 **Pro Tips**
- Check `agents/decisions.json` for previous technical choices
- Review `agents/patterns.json` for coding standards
- Use `agents/prompts.json` for common task templates
- All context is preserved - jump right in!

**You have complete project intelligence. Let's build! 🎉**
EOF
    
    success "Created instruction card: GPT_INSTRUCTIONS_$timestamp.md"
}

# Main execution
main() {
    log "🚀 Starting GPT export package creation..."
    
    # Run preparation steps
    quick_prep
    
    # Create the package
    if create_export_package; then
        create_instruction_card
        
        success "🎉 GPT export package ready!"
        echo
        log "📁 Location: portable_exchange/"
        log "📋 Files created:"
        ls -la "$EXCHANGE_DIR"/*.zip "$EXCHANGE_DIR"/*.md 2>/dev/null | tail -2 | while read line; do
            echo "   📄 $(basename "$(echo "$line" | awk '{print $NF}')")"
        done
        echo
        log "🎯 Next steps:"
        echo "   1. Drag the .zip file to ChatGPT/GPT5"
        echo "   2. Include the instruction card for context"
        echo "   3. When done, drag modified files back to portable_exchange/"
        echo "   4. Run: npm run process-gpt-import (or use import script)"
        
    else
        error "Export package creation failed"
        exit 1
    fi
}

# Check if we're in the right directory
if [ ! -d "$PROJECT_ROOT/agents" ]; then
    error "Not in StackTrackr project directory"
    exit 1
fi

# Run main function
main "$@"
