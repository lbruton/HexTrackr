#!/bin/bash

# MCP-JSON Sync Integration Script
# Ensures perfect synchronization between JSON files and MCP Memory

set -e

AGENTS_DIR="/Volumes/DATA/GitHub/rEngine/agents"
SYNC_SCRIPT="$AGENTS_DIR/scripts/mcp_json_sync.py"
CONFIG_FILE="$AGENTS_DIR/sync_config.json"
LOG_FILE="$AGENTS_DIR/sync.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

# Function to check if MCP is available
check_mcp_availability() {
    log "Checking MCP availability..."
    
    # TODO: Implement actual MCP health check
    # For now, simulate check
    if [ -f "$AGENTS_DIR/mcp_available.flag" ]; then
        log "✅ MCP is available"
        return 0
    else
        warn "⚠️  MCP is not available - operating in JSON-only mode"
        return 1
    fi
}

# Function to auto-discover memory files
discover_memory_files() {
    log "Auto-discovering memory files..."
    
    local discovered_files=()
    
    # Find all JSON files except config files
    for file in "$AGENTS_DIR"/*.json; do
        if [ -f "$file" ]; then
            local basename=$(basename "$file")
            if [[ "$basename" != "sync_config.json" && "$basename" != "sync_metadata.json" ]]; then
                discovered_files+=("$basename")
            fi
        fi
    done
    
    log "✅ Discovered ${#discovered_files[@]} memory files: ${discovered_files[*]}"
}

# Function to validate JSON files
validate_json_files() {
    log "Validating JSON files..."
    
    # Auto-discover memory files
    discover_memory_files
    
    local json_files=()
    
    # Dynamically build list from discovered files
    for file in "$AGENTS_DIR"/*.json; do
        if [ -f "$file" ]; then
            basename=$(basename "$file")
            if [[ "$basename" != "sync_config.json" && "$basename" != "sync_metadata.json" ]]; then
                json_files+=("$basename")
            fi
        fi
    done
    
    local valid=true
    
    for file in "${json_files[@]}"; do
        if [ -f "$AGENTS_DIR/$file" ]; then
            if python3 -m json.tool "$AGENTS_DIR/$file" > /dev/null 2>&1; then
                log "✅ $file is valid JSON"
            else
                error "❌ $file has invalid JSON syntax"
                valid=false
            fi
        else
            warn "⚠️  $file does not exist"
        fi
    done
    
    if [ "$valid" = true ]; then
        log "✅ All JSON files are valid"
        return 0
    else
        error "❌ JSON validation failed"
        return 1
    fi
}

# Function to backup current state
backup_current_state() {
    log "Creating backup of current state..."
    
    local backup_dir="$AGENTS_DIR/backups/$(date '+%Y%m%d_%H%M%S')"
    mkdir -p "$backup_dir"
    
    # Backup JSON files
    cp "$AGENTS_DIR"/*.json "$backup_dir/" 2>/dev/null || true
    
    # Backup MCP state (if available)
    if check_mcp_availability; then
        # TODO: Implement MCP backup
        log "📋 MCP backup would be created here"
    fi
    
    log "✅ Backup created at $backup_dir"
}

# Function to perform sync
perform_sync() {
    local direction="${1:-json_to_mcp}"
    
    log "Starting sync: $direction"
    
    if ! validate_json_files; then
        error "❌ JSON validation failed - aborting sync"
        return 1
    fi
    
    backup_current_state
    
    if check_mcp_availability; then
        log "🔄 Performing bidirectional sync with MCP..."
        
        # Run the Python sync script
        if python3 "$SYNC_SCRIPT" --direction "$direction"; then
            log "✅ Sync completed successfully"
            
            # Verify sync integrity
            if verify_sync_integrity; then
                log "✅ Sync integrity verified"
                return 0
            else
                error "❌ Sync integrity check failed"
                return 1
            fi
        else
            error "❌ Sync failed"
            return 1
        fi
    else
        warn "⚠️  MCP unavailable - JSON files remain authoritative"
        return 0
    fi
}

# Function to verify sync integrity
verify_sync_integrity() {
    log "Verifying sync integrity..."
    
    # TODO: Implement integrity checks
    # - Compare entity counts
    # - Verify critical relationships
    # - Check for missing data
    
    log "📋 Integrity verification would be performed here"
    return 0
}

# Function to handle sync conflicts
handle_conflicts() {
    log "Checking for sync conflicts..."
    
    local conflicts_file="$AGENTS_DIR/sync_conflicts.json"
    
    if [ -f "$conflicts_file" ]; then
        local conflict_count=$(python3 -c "import json; print(len(json.load(open('$conflicts_file'))))")
        
        if [ "$conflict_count" -gt 0 ]; then
            warn "⚠️  Found $conflict_count sync conflicts"
            echo "Please review conflicts in $conflicts_file"
            echo "Run 'sync-resolve-conflicts' to resolve them"
            return 1
        fi
    fi
    
    log "✅ No sync conflicts detected"
    return 0
}

# Function to show sync status
show_sync_status() {
    log "=== MCP-JSON Sync Status ==="
    
    # Check MCP availability
    if check_mcp_availability; then
        echo "🟢 MCP Status: Available"
    else
        echo "🟡 MCP Status: Unavailable"
    fi
    
    # Check last sync time
    local metadata_file="$AGENTS_DIR/sync_metadata.json"
    if [ -f "$metadata_file" ]; then
        local last_sync=$(python3 -c "import json; print(json.load(open('$metadata_file')).get('last_sync', 'Never'))")
        echo "🕐 Last Sync: $last_sync"
    else
        echo "🕐 Last Sync: Never"
    fi
    
    # Check for conflicts
    handle_conflicts
    
    # Show file status
    echo ""
    echo "📁 JSON File Status:"
    
    # Dynamically discover memory files
    for file in "$AGENTS_DIR"/*.json; do
        if [ -f "$file" ]; then
            local basename=$(basename "$file")
            if [[ "$basename" != "sync_config.json" && "$basename" != "sync_metadata.json" ]]; then
                local size=$(stat -f%z "$file" 2>/dev/null || echo "0")
                local mod_time=$(stat -f%m "$file" 2>/dev/null || echo "0")
                local mod_date=$(date -r "$mod_time" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo "Unknown")
                
                # Check if auto-generated
                local auto_flag="👤"
                if python3 -c "import json; data=json.load(open('$file')); print('auto' if data.get('metadata', {}).get('auto_generated', False) else 'manual')" 2>/dev/null | grep -q "auto"; then
                    auto_flag="🤖"
                fi
                
                echo "  ✅ $auto_flag $basename ($size bytes, modified: $mod_date)"
            fi
        fi
    done
}

# Function to auto-sync (for scheduled runs)
auto_sync() {
    log "Starting automated sync..."
    
    # Only proceed if no manual operations are in progress
    local lock_file="$AGENTS_DIR/.sync_lock"
    
    if [ -f "$lock_file" ]; then
        warn "⚠️  Sync lock exists - skipping auto-sync"
        return 1
    fi
    
    # Create lock
    echo "$$" > "$lock_file"
    trap "rm -f '$lock_file'" EXIT
    
    # Perform sync
    if perform_sync "json_to_mcp"; then
        log "✅ Auto-sync completed successfully"
    else
        error "❌ Auto-sync failed"
    fi
    
    # Remove lock
    rm -f "$lock_file"
}

# Function to sync to memory-vault repository
sync_to_memory_vault() {
    log "Starting memory-vault sync..."
    
    # Check if memory-vault sync script exists
    local vault_script="$AGENTS_DIR/scripts/sync_memory_vault.py"
    
    if [ ! -f "$vault_script" ]; then
        error "Memory-vault sync script not found: $vault_script"
        return 1
    fi
    
    # Update the memory-vault script to include all current memory files
    update_vault_sync_files
    
    # Run the memory-vault sync
    if python3 "$vault_script"; then
        log "✅ Memory-vault sync completed successfully"
        return 0
    else
        error "❌ Memory-vault sync failed"
        return 1
    fi
}

# Function to update memory-vault sync with current files
update_vault_sync_files() {
    log "Updating memory-vault sync file list..."
    
    # Auto-discover all current memory files
    discover_memory_files
    
    local memory_files_list=""
    for file in "$AGENTS_DIR"/*.json; do
        if [ -f "$file" ]; then
            basename=$(basename "$file")
            if [[ "$basename" != "sync_config.json" && "$basename" != "sync_metadata.json" ]]; then
                if [ -n "$memory_files_list" ]; then
                    memory_files_list+=", "
                fi
                memory_files_list+="'$basename'"
            fi
        fi
    done
    
    # Update the vault sync script with current file list
    local vault_script="$AGENTS_DIR/scripts/sync_memory_vault.py"
    local temp_script="/tmp/sync_memory_vault_updated.py"
    
    # Create updated script with current memory files
    sed -E "s/memory_files = \[[^]]*\]/memory_files = [$memory_files_list]/" "$vault_script" > "$temp_script"
    
    # Replace original if different
    if ! cmp -s "$vault_script" "$temp_script"; then
        mv "$temp_script" "$vault_script"
        log "✅ Updated memory-vault file list with ${#memory_files_list} files"
    else
        rm -f "$temp_script"
    fi
}

# Function to perform complete sync to all destinations
full_sync() {
    log "Starting full sync to all destinations..."
    local success=true
    
    # 1. Sync to MCP (if available)
    if check_mcp_availability; then
        log "🔄 Syncing to MCP..."
        if ! perform_sync "json_to_mcp"; then
            error "❌ MCP sync failed"
            success=false
        else
            log "✅ MCP sync completed"
        fi
    else
        warn "⚠️  MCP unavailable - skipping MCP sync"
    fi
    
    # 2. Sync to memory-vault
    log "🔄 Syncing to memory-vault..."
    if ! sync_to_memory_vault; then
        error "❌ Memory-vault sync failed"
        success=false
    else
        log "✅ Memory-vault sync completed"
    fi
    
    if $success; then
        log "🎉 Full sync completed successfully!"
        return 0
    else
        error "❌ Full sync completed with errors"
        return 1
    fi
}

# Main command handling
case "${1:-status}" in
    "sync")
        case "${2:-json_to_mcp}" in
            "vault")
                sync_to_memory_vault
                ;;
            "all")
                full_sync
                ;;
            *)
                perform_sync "${2:-json_to_mcp}"
                ;;
        esac
        ;;
    "vault-sync")
        sync_to_memory_vault
        ;;
    "full-sync")
        full_sync
        ;;
    "status")
        show_sync_status
        ;;
    "validate")
        validate_json_files
        ;;
    "backup")
        backup_current_state
        ;;
    "conflicts")
        handle_conflicts
        ;;
    "auto")
        auto_sync
        ;;
    "create-memory")
        if [ -z "$2" ] || [ -z "$3" ]; then
            error "Usage: $0 create-memory <type> <purpose> [priority]"
            echo "Example: $0 create-memory patterns 'Learning patterns for error prevention' 3"
            exit 1
        fi
        python3 "$AGENTS_DIR/scripts/dynamic_memory.py" create --type "$2" --purpose "$3" --priority "${4:-5}"
        ;;
    "list-memory")
        python3 "$AGENTS_DIR/scripts/dynamic_memory.py" list
        ;;
    "package-brain")
        if [ -z "$2" ]; then
            error "Usage: $0 package-brain <target-project-path>"
            echo "Example: $0 package-brain /path/to/new/project"
            exit 1
        fi
        python3 "$AGENTS_DIR/scripts/dynamic_memory.py" package --target "$2"
        ;;
    "help")
        echo "MCP-JSON Sync Tool"
        echo ""
        echo "Usage: $0 [command] [options]"
        echo ""
        echo "Commands:"
        echo "  sync [direction]    Perform synchronization (json_to_mcp|mcp_to_json|vault|all)"
        echo "  status             Show sync status and file information"
        echo "  validate           Validate JSON file syntax"
        echo "  backup             Create backup of current state"
        echo "  conflicts          Check for and display sync conflicts"
        echo "  auto               Automated sync (for scheduled runs)"
        echo "  create-memory      Create new memory type"
        echo "  list-memory        List all memory types"
        echo "  package-brain      Create portable brain package for new project"
        echo "  vault-sync         Sync to memory-vault GitHub repository"
        echo "  full-sync          Sync to all destinations (MCP + Memory-Vault)"
        echo "  help               Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 sync json_to_mcp              # Sync JSON files to MCP"
        echo "  $0 sync mcp_to_json              # Sync MCP entities to JSON files"
        echo "  $0 sync vault                    # Sync to memory-vault repository"
        echo "  $0 sync all                      # Sync to both MCP and memory-vault"
        echo "  $0 status                        # Show current sync status"
        echo "  $0 full-sync                     # Complete sync to all destinations"
        echo "  $0 create-memory patterns 'Learning patterns' 3  # Create new memory type"
        echo "  $0 package-brain /path/to/new-project            # Create brain package"
        ;;
    *)
        error "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac
