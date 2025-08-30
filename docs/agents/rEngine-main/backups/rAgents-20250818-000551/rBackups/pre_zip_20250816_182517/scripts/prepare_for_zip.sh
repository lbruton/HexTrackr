#!/bin/bash

# StackTrackr Zip Preparation Script
# Prepares project for ChatGPT/GPT5 zip workflow
# Handles path normalization and creates portable versions

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() { echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ✅ $1"; }
warn() { echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ⚠️ $1"; }
error() { echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ❌ $1"; }

# Detect project root dynamically
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
AGENTS_DIR="$PROJECT_ROOT/agents"
ZIP_PREP_DIR="$AGENTS_DIR/zip_prep"

log "Starting zip preparation for StackTrackr project"
log "Project root detected: $PROJECT_ROOT"

# Create zip preparation directory
mkdir -p "$ZIP_PREP_DIR"

# Function to create portable script versions
create_portable_scripts() {
    log "Creating portable script versions..."
    
    # Create portable handoff script
    if [ -f "$AGENTS_DIR/scripts/handoff.sh" ]; then
        log "Creating portable handoff.sh..."
        cat > "$ZIP_PREP_DIR/handoff_portable.sh" << 'EOF'
#!/bin/bash

# StackTrackr Portable Handoff Script
# Dynamically detects project root - works after zip/unzip

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Detect project root dynamically
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Logging functions
log() { echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ✅ $1"; }
warn() { echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ⚠️ $1"; }
error() { echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ❌ $1"; exit 1; }

log "Portable handoff script - Project root: $PROJECT_ROOT"

# Check if we're in a git repository
if [ ! -d "$PROJECT_ROOT/.git" ]; then
    warn "Not in a git repository - some features may not work"
else
    log "Git repository detected"
    cd "$PROJECT_ROOT"
    
    # Show git status
    git status --short
    
    # Basic git operations
    if git diff --quiet && git diff --staged --quiet; then
        success "Working directory is clean"
    else
        warn "Working directory has changes"
        echo "Would you like to commit these changes? (y/n)"
        read -r response
        if [ "$response" = "y" ]; then
            git add -A
            echo "Enter commit message:"
            read -r commit_msg
            git commit -m "$commit_msg"
            success "Changes committed"
        fi
    fi
fi

success "Portable handoff completed"
EOF
        chmod +x "$ZIP_PREP_DIR/handoff_portable.sh"
        success "Created portable handoff script"
    fi
    
    # Create portable sync tool
    if [ -f "$AGENTS_DIR/scripts/sync_tool.sh" ]; then
        log "Creating portable sync_tool.sh..."
        cat > "$ZIP_PREP_DIR/sync_tool_portable.sh" << 'EOF'
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
EOF
        chmod +x "$ZIP_PREP_DIR/sync_tool_portable.sh"
        success "Created portable sync tool"
    fi
}

# Function to create restoration metadata
create_restoration_metadata() {
    log "Creating restoration metadata..."
    
    cat > "$ZIP_PREP_DIR/restoration_metadata.json" << EOF
{
  "metadata": {
    "created": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "original_project_root": "$PROJECT_ROOT",
    "zip_preparation_version": "1.0",
    "platform": "$(uname -s)",
    "user": "$(whoami)"
  },
  "executable_files": [
$(find "$PROJECT_ROOT" -name "*.sh" -type f -executable | sed 's|'"$PROJECT_ROOT"'/||' | sed 's/.*/"&"/' | paste -sd, -)
  ],
  "critical_paths": {
    "agents_dir": "agents/",
    "scripts_dir": "agents/scripts/",
    "project_root": "./"
  },
  "restoration_checklist": [
    "Restore executable permissions on shell scripts",
    "Validate JSON file integrity",
    "Update any absolute paths if needed",
    "Run portable sync validation",
    "Verify git repository status"
  ]
}
EOF
    success "Created restoration metadata"
}

# Function to create backup
create_backup() {
    log "Creating backup before zip preparation..."
    
    local backup_dir="$AGENTS_DIR/backups/pre_zip_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup agents directory
    cp -r "$AGENTS_DIR"/*.json "$backup_dir/" 2>/dev/null || true
    cp -r "$AGENTS_DIR/scripts" "$backup_dir/" 2>/dev/null || true
    
    success "Backup created at $backup_dir"
}

# Function to run memory sync
run_memory_sync() {
    log "Running memory system sync..."
    
    # Update timestamps in key memory files
    for json_file in "$AGENTS_DIR"/{memory,decisions,tasks,patterns}.json; do
        if [ -f "$json_file" ]; then
            # Use a simple approach to update last_updated timestamp
            python3 -c "
import json
import sys
from datetime import datetime

try:
    with open('$json_file', 'r') as f:
        data = json.load(f)
    
    if 'metadata' in data:
        data['metadata']['last_updated'] = datetime.utcnow().isoformat() + 'Z'
        data['metadata']['zip_prep_sync'] = True
    
    with open('$json_file', 'w') as f:
        json.dump(data, f, indent=2)
    
    print('✓ Updated $json_file')
except Exception as e:
    print(f'✗ Error updating $json_file: {e}')
" 2>/dev/null || warn "Could not update $(basename "$json_file")"
        fi
    done
    
    success "Memory sync completed"
}

# Function to create .zipignore instructions
create_zip_instructions() {
    log "Creating zip instructions..."
    
    cat > "$PROJECT_ROOT/ZIP_INSTRUCTIONS.md" << 'EOF'
# 🚀 StackTrackr → ChatGPT/GPT5 Workflow Instructions

## 📦 **What to Include in Zip**
✅ All source code files (js/, css/, etc.)
✅ Complete agents/ directory (all JSON memory files)
✅ Documentation files (README.md, docs/, etc.)
✅ Configuration files (package.json, index.html)
✅ agents/zip_prep/ directory (portable scripts)

## 🚫 **What to Exclude from Zip**
❌ node_modules/ (if it exists)
❌ .git/ directory (optional - can include for context)
❌ agents/backups/ with old data
❌ Large log files
❌ OS temporary files (.DS_Store, etc.)

## 🎯 **For ChatGPT/GPT5**
This project includes a complete memory system in the agents/ directory.
All previous decisions, patterns, and context are stored in JSON files.
Use the portable scripts in agents/zip_prep/ for any operations.

## 🔄 **After Getting Modified Zip Back**
1. Unzip to desired location
2. Run: `./agents/zip_prep/restore_from_zip.sh`
3. Validate changes with: `./agents/zip_prep/sync_tool_portable.sh validate`

## 💡 **Memory System Files**
- `agents/memory.json` - Core agent memories
- `agents/decisions.json` - Previous decisions and rationale
- `agents/tasks.json` - Task tracking and dependencies
- `agents/bugs.json` - Bug tracking with priorities
- `agents/roadmap.json` - Feature planning and milestones
- `agents/prompts.json` - Reusable prompt library

The portable memory system ensures seamless collaboration! 🎉
EOF
    
    success "Created ZIP_INSTRUCTIONS.md"
}

# Main execution
main() {
    log "🚀 Starting StackTrackr zip preparation workflow"
    
    # Run preparation steps
    create_backup
    run_memory_sync
    create_portable_scripts
    create_restoration_metadata
    create_zip_instructions
    
    success "🎉 Zip preparation completed successfully!"
    echo
    log "📋 Next steps:"
    echo "1. Create zip file excluding node_modules, .git, and large backups"
    echo "2. Include the ZIP_INSTRUCTIONS.md file in your upload"
    echo "3. After getting modified zip back, run restore_from_zip.sh"
    echo
    log "📁 Portable scripts created in: agents/zip_prep/"
    log "📖 Instructions created: ZIP_INSTRUCTIONS.md"
}

# Run main function
main "$@"
