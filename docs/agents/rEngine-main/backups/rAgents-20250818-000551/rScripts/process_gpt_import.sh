#!/bin/bash

# StackTrackr GPT Import Processor
# Handles modified files returned from ChatGPT/GPT5
# Safely integrates changes back into project

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

log "🔄 GPT Import Processor - Processing returned files"

# Function to detect import type
detect_import_type() {
    if [ -f "$EXCHANGE_DIR"/*.zip ]; then
        echo "zip"
    elif [ -d "$EXCHANGE_DIR"/StackTrackr* ]; then
        echo "folder"
    elif [ -f "$EXCHANGE_DIR"/*.js ] || [ -f "$EXCHANGE_DIR"/*.json ] || [ -f "$EXCHANGE_DIR"/*.css ]; then
        echo "files"
    else
        echo "unknown"
    fi
}

# Function to process zip import
process_zip_import() {
    log "Processing zip file import..."
    
    local zip_file=$(find "$EXCHANGE_DIR" -name "*.zip" -type f | head -1)
    if [ -z "$zip_file" ]; then
        error "No zip file found in portable_exchange/"
        return 1
    fi
    
    local temp_dir="$EXCHANGE_DIR/temp_extract"
    mkdir -p "$temp_dir"
    
    log "Extracting: $(basename "$zip_file")"
    unzip -q "$zip_file" -d "$temp_dir"
    
    # Find the extracted project directory
    local extracted_project=$(find "$temp_dir" -name "StackTrackr*" -type d | head -1)
    if [ -z "$extracted_project" ]; then
        extracted_project="$temp_dir"
    fi
    
    success "Extracted to temporary location"
    echo "$extracted_project"
}

# Function to process folder import
process_folder_import() {
    log "Processing folder import..."
    
    local folder=$(find "$EXCHANGE_DIR" -name "StackTrackr*" -type d | head -1)
    if [ -z "$folder" ]; then
        error "No StackTrackr folder found in portable_exchange/"
        return 1
    fi
    
    success "Found folder: $(basename "$folder")"
    echo "$folder"
}

# Function to validate changes
validate_changes() {
    local source_dir="$1"
    
    log "Validating changes..."
    
    local errors=0
    
    # Check JSON files
    for json_file in "$source_dir/agents"/*.json; do
        if [ -f "$json_file" ]; then
            if ! python3 -m json.tool "$json_file" > /dev/null 2>&1; then
                error "Invalid JSON: $(basename "$json_file")"
                ((errors++))
            fi
        fi
    done
    
    # Check critical files exist
    for critical_file in "index.html" "agents/memory.json" "agents/bugs.json"; do
        if [ ! -f "$source_dir/$critical_file" ]; then
            warn "Missing critical file: $critical_file"
        fi
    done
    
    if [ $errors -eq 0 ]; then
        success "Validation passed"
        return 0
    else
        error "Validation failed with $errors errors"
        return 1
    fi
}

# Function to create backup
create_backup() {
    log "Creating backup before import..."
    
    local backup_dir="$PROJECT_ROOT/agents/backups/pre_gpt_import_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup key directories
    cp -r "$PROJECT_ROOT/agents"/*.json "$backup_dir/" 2>/dev/null || true
    cp -r "$PROJECT_ROOT/js" "$backup_dir/" 2>/dev/null || true
    cp -r "$PROJECT_ROOT/css" "$backup_dir/" 2>/dev/null || true
    cp "$PROJECT_ROOT/index.html" "$backup_dir/" 2>/dev/null || true
    
    success "Backup created: $(basename "$backup_dir")"
}

# Function to merge changes intelligently
merge_changes() {
    local source_dir="$1"
    
    log "Merging changes from GPT modifications..."
    
    local changes_detected=0
    
    # Compare and update key files
    for file_type in "js" "css" "agents"; do
        if [ -d "$source_dir/$file_type" ]; then
            log "Processing $file_type/ directory..."
            
            # Copy modified files
            find "$source_dir/$file_type" -type f | while read -r file; do
                local rel_path="${file#$source_dir/}"
                local target_file="$PROJECT_ROOT/$rel_path"
                
                if [ -f "$target_file" ]; then
                    # Compare files
                    if ! cmp -s "$file" "$target_file"; then
                        log "📝 Updated: $rel_path"
                        cp "$file" "$target_file"
                        ((changes_detected++))
                    fi
                else
                    log "➕ New file: $rel_path"
                    mkdir -p "$(dirname "$target_file")"
                    cp "$file" "$target_file"
                    ((changes_detected++))
                fi
            done
        fi
    done
    
    # Handle special files
    for special_file in "index.html" "package.json"; do
        if [ -f "$source_dir/$special_file" ]; then
            if [ -f "$PROJECT_ROOT/$special_file" ]; then
                if ! cmp -s "$source_dir/$special_file" "$PROJECT_ROOT/$special_file"; then
                    log "📝 Updated: $special_file"
                    cp "$source_dir/$special_file" "$PROJECT_ROOT/$special_file"
                    ((changes_detected++))
                fi
            fi
        fi
    done
    
    success "Merge completed - $changes_detected changes applied"
}

# Function to update timestamps
update_timestamps() {
    log "Updating import timestamps..."
    
    local current_time=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    
    for json_file in "$PROJECT_ROOT/agents"/{memory,bugs,roadmap,tasks}.json; do
        if [ -f "$json_file" ]; then
            python3 -c "
import json
try:
    with open('$json_file', 'r') as f:
        data = json.load(f)
    if 'metadata' in data:
        data['metadata']['last_updated'] = '$current_time'
        data['metadata']['gpt_import_processed'] = True
        data['metadata']['import_date'] = '$current_time'
    with open('$json_file', 'w') as f:
        json.dump(data, f, indent=2)
except: pass
" 2>/dev/null || true
        fi
    done
    
    success "Timestamps updated"
}

# Function to show git status
show_git_status() {
    log "Checking git status..."
    
    if [ -d "$PROJECT_ROOT/.git" ]; then
        cd "$PROJECT_ROOT"
        
        if git diff --quiet && git diff --staged --quiet; then
            success "No git changes detected"
        else
            warn "Git changes detected:"
            git status --short
            echo
            log "💡 Consider reviewing and committing these changes"
        fi
    fi
}

# Function to cleanup
cleanup() {
    log "Cleaning up temporary files..."
    
    # Remove temp extraction directory
    rm -rf "$EXCHANGE_DIR/temp_extract" 2>/dev/null || true
    
    # Optionally archive processed files
    local archive_dir="$EXCHANGE_DIR/processed_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$archive_dir"
    
    # Move processed files to archive
    mv "$EXCHANGE_DIR"/*.zip "$archive_dir/" 2>/dev/null || true
    mv "$EXCHANGE_DIR"/StackTrackr* "$archive_dir/" 2>/dev/null || true
    
    success "Cleanup completed"
}

# Main execution
main() {
    log "🔄 Starting GPT import processing..."
    
    # Check if exchange directory exists
    if [ ! -d "$EXCHANGE_DIR" ]; then
        error "portable_exchange/ directory not found"
        log "💡 Tip: Run 'npm run package-gpt' first to create the directory"
        exit 1
    fi
    
    # Detect import type
    local import_type=$(detect_import_type)
    log "Import type detected: $import_type"
    
    local source_dir=""
    
    case $import_type in
        "zip")
            source_dir=$(process_zip_import)
            ;;
        "folder")
            source_dir=$(process_folder_import)
            ;;
        "files")
            warn "Individual files detected - this mode is not yet implemented"
            log "💡 Tip: Use zip or folder import for best results"
            exit 1
            ;;
        *)
            error "No valid import files found in portable_exchange/"
            log "💡 Expected: .zip file or StackTrackr folder"
            exit 1
            ;;
    esac
    
    if [ -z "$source_dir" ]; then
        error "Failed to process import"
        exit 1
    fi
    
    # Validate changes
    if ! validate_changes "$source_dir"; then
        error "Import validation failed"
        exit 1
    fi
    
    # Create backup
    create_backup
    
    # Merge changes
    merge_changes "$source_dir"
    
    # Update timestamps
    update_timestamps
    
    # Show git status
    show_git_status
    
    # Cleanup
    cleanup
    
    success "🎉 GPT import processing completed!"
    echo
    log "📋 Summary:"
    echo "   ✅ Changes validated and merged"
    echo "   ✅ Backup created in agents/backups/"
    echo "   ✅ Memory system timestamps updated"
    echo "   ✅ Temporary files cleaned up"
    echo
    log "🚀 Your project is ready to continue!"
}

# Run main function
main "$@"
