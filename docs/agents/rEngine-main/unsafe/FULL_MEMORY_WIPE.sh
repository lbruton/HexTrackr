#!/bin/bash

# ⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️
# ██████████████████████████████████████████████████████████████████████████████████████████████████████
# ██                                                                                                  ██
# ██  ███████ ██    ██ ██      ██           ███    ███ ███████ ███    ███  ██████  ██████  ██    ██  ██
# ██  ██      ██    ██ ██      ██           ████  ████ ██      ████  ████ ██    ██ ██   ██  ██  ██   ██
# ██  █████   ██    ██ ██      ██           ██ ████ ██ █████   ██ ████ ██ ██    ██ ██████    ████    ██
# ██  ██      ██    ██ ██      ██           ██  ██  ██ ██      ██  ██  ██ ██    ██ ██   ██    ██     ██
# ██  ██       ██████  ███████ ███████      ██      ██ ███████ ██      ██  ██████  ██   ██    ██     ██
# ██                                                                                                  ██
# ██  ██     ██ ██ ██████  ███████     ██    ██ ████████ ██ ██      ██ ████████ ██    ██            ██
# ██  ██     ██ ██ ██   ██ ██          ██    ██    ██    ██ ██      ██    ██     ██  ██             ██
# ██  ██  █  ██ ██ ██████  █████       ██    ██    ██    ██ ██      ██    ██      ████              ██
# ██  ██ ███ ██ ██ ██      ██          ██    ██    ██    ██ ██      ██    ██       ██               ██
# ██   ███ ███  ██ ██      ███████      ██████     ██    ██ ███████ ██    ██       ██               ██
# ██                                                                                                  ██
# ██████████████████████████████████████████████████████████████████████████████████████████████████████
# ⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️

# rEngine FULL MEMORY WIPE Utility
# Version: 1.0.0
# Purpose: Complete memory reset for new user onboarding
# 
# ⚠️  WARNING: THIS SCRIPT WILL PERMANENTLY DELETE ALL AI MEMORIES AND USER DATA!
# 
# Use case: Fresh installation for new users who don't want previous memories
# Security: Script is intentionally non-executable by default

set -euo pipefail

# Color codes for dramatic output
RED='\033[0;31m'
BRIGHT_RED='\033[1;91m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Script metadata
SCRIPT_NAME="FULL_MEMORY_WIPE.sh"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARENT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${PARENT_DIR}/backups/MEMORY_WIPE_BACKUP_$(date +%Y%m%d_%H%M%S)"
LOG_FILE="${PARENT_DIR}/logs/memory-wipe.log"

# Ensure logs directory exists
mkdir -p "${PARENT_DIR}/logs"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] MEMORY_WIPE: $1" | tee -a "$LOG_FILE"
}

# Print functions with dramatic effect
print_danger() {
    echo ""
    echo -e "${BRIGHT_RED}${BOLD}⚠️⚠️⚠️  DANGER  ⚠️⚠️⚠️${NC}"
    echo -e "${RED}$1${NC}"
    echo -e "${BRIGHT_RED}${BOLD}⚠️⚠️⚠️  DANGER  ⚠️⚠️⚠️${NC}"
    echo ""
    log "DANGER: $1"
}

print_warning() {
    echo -e "${YELLOW}${BOLD}🚨 WARNING: $1${NC}"
    log "WARNING: $1"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
    log "INFO: $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
    log "SUCCESS: $1"
}

print_error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
    log "ERROR: $1"
}

# Dramatic header
show_dramatic_warning() {
    clear
    echo ""
    echo -e "${BRIGHT_RED}${BOLD}"
    echo "████████████████████████████████████████████████████████████████████████████████"
    echo "██                                                                            ██"
    echo "██  ███████ ██    ██ ██      ██           ███    ███ ███████ ███    ███      ██"
    echo "██  ██      ██    ██ ██      ██           ████  ████ ██      ████  ████      ██"
    echo "██  █████   ██    ██ ██      ██           ██ ████ ██ █████   ██ ████ ██      ██"
    echo "██  ██      ██    ██ ██      ██           ██  ██  ██ ██      ██  ██  ██      ██"
    echo "██  ██       ██████  ███████ ███████      ██      ██ ███████ ██      ██      ██"
    echo "██                                                                            ██"
    echo "██  ██     ██ ██ ██████  ███████     ██    ██ ████████ ██ ██      ██         ██"
    echo "██  ██     ██ ██ ██   ██ ██          ██    ██    ██    ██ ██      ██         ██"
    echo "██  ██  █  ██ ██ ██████  █████       ██    ██    ██    ██ ██      ██         ██"
    echo "██  ██ ███ ██ ██ ██      ██          ██    ██    ██    ██ ██      ██         ██"
    echo "██   ███ ███  ██ ██      ███████      ██████     ██    ██ ███████ ██         ██"
    echo "██                                                                            ██"
    echo "████████████████████████████████████████████████████████████████████████████████"
    echo -e "${NC}"
    echo ""
    echo -e "${RED}${BOLD}⚠️  THIS SCRIPT WILL PERMANENTLY DELETE ALL AI MEMORIES AND USER DATA!${NC}"
    echo ""
    echo -e "${WHITE}Purpose: Fresh rEngine installation for new users${NC}"
    echo -e "${WHITE}Use case: When onboarding someone who doesn't want previous memories${NC}"
    echo ""
    print_danger "ALL CONVERSATIONS, LEARNING, AND MEMORIES WILL BE LOST FOREVER!"
    echo ""
}

# What gets deleted
show_deletion_list() {
    echo -e "${YELLOW}${BOLD}🗑️  THE FOLLOWING WILL BE PERMANENTLY DELETED:${NC}"
    echo ""
    echo -e "${RED}AI Memory Systems:${NC}"
    echo "  • rMemory/ - All AI conversations and learning"
    echo "  • memory-backups/ - Previous memory backups"
    echo "  • persistent-memory.json - Core memory data"
    echo "  • memory-consolidation-report.json - Memory analysis"
    echo "  • agents/memory - Agent-specific memories"
    echo ""
    echo -e "${RED}User Data:${NC}"
    echo "  • rAgents/ - All agent configurations and data"
    echo "  • rProjects/ - User projects (StackTrackr, HexTrackr, etc.)"
    echo "  • rScribe/ - Scribe conversation history"
    echo "  • logs/ - All system logs and activity"
    echo ""
    echo -e "${RED}External Storage:${NC}"
    echo "  • ~/.rengine/mobile-scribe/ - Mobile app data"
    echo "  • ~/.rengine/secrets/api-keys.env - API keys (WILL NEED RECONFIGURATION)"
    echo ""
    echo -e "${GREEN}${BOLD}✅ PRESERVED (Configuration only):${NC}"
    echo "  • Docker Compose configurations"
    echo "  • VS Code settings"
    echo "  • Scripts and templates"
    echo "  • Documentation"
    echo ""
}

# Safety checks
perform_safety_checks() {
    print_info "Performing safety checks..."
    
    # Check if we're in the right directory
    if [[ ! -f "${PARENT_DIR}/docker-compose-enhanced.yml" ]]; then
        print_error "Not in rEngine directory! Aborting for safety."
        exit 1
    fi
    
    # Check if this is actually the unsafe directory
    if [[ "$(basename "$SCRIPT_DIR")" != "unsafe" ]]; then
        print_error "Script not in 'unsafe' directory! Security violation."
        exit 1
    fi
    
    # Verify script permissions (should be non-executable initially)
    if [[ -x "$0" ]] && [[ ! -f "${PARENT_DIR}/.memory-wipe-unlocked" ]]; then
        print_warning "Script has execute permissions but not unlocked."
        print_info "To unlock this script, first run:"
        echo -e "${CYAN}  touch ${PARENT_DIR}/.memory-wipe-unlocked${NC}"
        echo -e "${CYAN}  chmod +x $0${NC}"
        echo -e "${CYAN}  ./unsafe/$(basename "$0")${NC}"
        exit 1
    fi
    
    print_success "Safety checks passed"
}

# Create backup before deletion
create_final_backup() {
    print_info "Creating final backup before memory wipe..."
    
    mkdir -p "$BACKUP_DIR"
    
    # List of everything that will be deleted
    local items_to_backup=(
        "rMemory"
        "memory-backups"
        "persistent-memory.json"
        "memory-consolidation-report.json"
        "agents/memory"
        "rAgents"
        "rProjects"
        "rScribe"
        "logs"
    )
    
    for item in "${items_to_backup[@]}"; do
        if [[ -e "${PARENT_DIR}/${item}" ]]; then
            cp -r "${PARENT_DIR}/${item}" "$BACKUP_DIR/" 2>/dev/null || true
            print_success "Backed up: $item"
        fi
    done
    
    # Backup external storage
    if [[ -d "$HOME/.rengine" ]]; then
        mkdir -p "${BACKUP_DIR}/external-storage"
        cp -r "$HOME/.rengine" "${BACKUP_DIR}/external-storage/" 2>/dev/null || true
        print_success "Backed up: ~/.rengine"
    fi
    
    # Create manifest
    cat > "${BACKUP_DIR}/FINAL_BACKUP_MANIFEST.txt" << EOF
🗑️ rEngine FULL MEMORY WIPE - Final Backup
Created: $(date)
Source: ${PARENT_DIR}
Backup Directory: ${BACKUP_DIR}

⚠️  THIS IS THE FINAL BACKUP BEFORE COMPLETE MEMORY DELETION!

Backed Up Items:
$(ls -la "$BACKUP_DIR")

To restore any of this data later:
1. Copy items from this backup directory
2. Place them back in the rEngine root directory
3. Run the master installer to rebuild configuration

Original User: $(whoami)
Original System: $(uname -a)
Git State: $(cd "$PARENT_DIR" && git log --oneline -1 2>/dev/null || echo "No git repository")
EOF
    
    print_success "Final backup created at: $BACKUP_DIR"
}

# The actual memory wipe function
execute_memory_wipe() {
    print_info "🗑️  Beginning FULL MEMORY WIPE..."
    
    # Stop any running services first
    print_info "Stopping Docker services..."
    cd "$PARENT_DIR"
    docker-compose -f docker-compose-enhanced.yml down 2>/dev/null || true
    
    # Delete memory systems
    print_info "Deleting AI memory systems..."
    rm -rf "rMemory" 2>/dev/null || true
    rm -rf "memory-backups" 2>/dev/null || true
    rm -f "persistent-memory.json" 2>/dev/null || true
    rm -f "memory-consolidation-report.json" 2>/dev/null || true
    rm -rf "agents/memory" 2>/dev/null || true
    
    # Delete user data
    print_info "Deleting user data..."
    rm -rf "rAgents" 2>/dev/null || true
    rm -rf "rProjects" 2>/dev/null || true
    rm -rf "rScribe" 2>/dev/null || true
    rm -rf "logs" 2>/dev/null || true
    
    # Delete external storage
    print_info "Deleting external storage..."
    rm -rf "$HOME/.rengine/mobile-scribe" 2>/dev/null || true
    
    # Clear API keys but leave directory structure
    if [[ -f "$HOME/.rengine/secrets/api-keys.env" ]]; then
        cat > "$HOME/.rengine/secrets/api-keys.env" << 'EOF'
# API keys cleared during memory wipe
# Replace with your actual API keys
OPENAI_API_KEY=your-key-here
ANTHROPIC_API_KEY=your-key-here
GOOGLE_AI_API_KEY=your-key-here
GROQ_API_KEY=your-key-here
EOF
        print_success "API keys cleared (template recreated)"
    fi
    
    # Recreate essential directories
    mkdir -p "rMemory"
    mkdir -p "memory-backups"
    mkdir -p "rAgents"
    mkdir -p "rProjects"
    mkdir -p "rScribe"
    mkdir -p "logs"
    mkdir -p "agents/memory"
    
    # Create fresh memory files
    echo "{}" > "persistent-memory.json"
    
    # Create wipe completion marker
    cat > "logs/memory-wipe-complete.log" << EOF
🗑️ FULL MEMORY WIPE COMPLETED
Date: $(date)
Performed by: $(whoami)
Backup location: ${BACKUP_DIR}
Original data can be restored from backup if needed.

Fresh installation ready for new user onboarding.
EOF
    
    print_success "🎉 FULL MEMORY WIPE COMPLETED!"
}

# Confirmation prompts
get_user_confirmation() {
    echo ""
    print_danger "YOU ARE ABOUT TO PERMANENTLY DELETE ALL AI MEMORIES AND USER DATA!"
    echo ""
    echo -e "${WHITE}Final backup will be created at:${NC}"
    echo -e "${CYAN}  $BACKUP_DIR${NC}"
    echo ""
    
    # Multiple confirmation prompts
    echo -e "${RED}Type 'DELETE ALL MEMORIES' (case sensitive) to confirm:${NC}"
    read -r confirm1
    
    if [[ "$confirm1" != "DELETE ALL MEMORIES" ]]; then
        print_info "Confirmation failed. Aborting memory wipe."
        exit 0
    fi
    
    echo ""
    echo -e "${RED}Type 'I UNDERSTAND THIS IS PERMANENT' (case sensitive) to confirm:${NC}"
    read -r confirm2
    
    if [[ "$confirm2" != "I UNDERSTAND THIS IS PERMANENT" ]]; then
        print_info "Confirmation failed. Aborting memory wipe."
        exit 0
    fi
    
    echo ""
    echo -e "${RED}Final confirmation - Type 'WIPE NOW' to proceed:${NC}"
    read -r confirm3
    
    if [[ "$confirm3" != "WIPE NOW" ]]; then
        print_info "Confirmation failed. Aborting memory wipe."
        exit 0
    fi
    
    print_success "All confirmations received. Proceeding with memory wipe..."
}

# Post-wipe instructions
show_completion_message() {
    echo ""
    echo -e "${GREEN}${BOLD}🎉 MEMORY WIPE COMPLETED SUCCESSFULLY!${NC}"
    echo ""
    echo -e "${WHITE}What happens next:${NC}"
    echo ""
    echo -e "${CYAN}1. Fresh Start Ready:${NC}"
    echo "   • All AI memories have been cleared"
    echo "   • User data has been reset"
    echo "   • System is ready for new user onboarding"
    echo ""
    echo -e "${CYAN}2. Configuration Required:${NC}"
    echo "   • Set up API keys: ./setup-secure-api-keys.sh"
    echo "   • Start services: docker-compose -f docker-compose-enhanced.yml up -d"
    echo ""
    echo -e "${CYAN}3. Backup Available:${NC}"
    echo "   • Original data backed up to: ${BACKUP_DIR}"
    echo "   • Can be restored if needed"
    echo ""
    echo -e "${YELLOW}4. Security Cleanup:${NC}"
    echo "   • Remove unlock file: rm ${PARENT_DIR}/.memory-wipe-unlocked"
    echo "   • Make script non-executable: chmod -x $0"
    echo ""
    print_success "rEngine is now ready for a fresh start! 🚀"
}

# Main function
main() {
    show_dramatic_warning
    show_deletion_list
    perform_safety_checks
    get_user_confirmation
    create_final_backup
    execute_memory_wipe
    show_completion_message
    
    # Clean up unlock file
    rm -f "${PARENT_DIR}/.memory-wipe-unlocked"
    chmod -x "$0"  # Make script non-executable again
}

# Help function
show_help() {
    echo -e "${RED}${BOLD}⚠️  rEngine FULL MEMORY WIPE Utility${NC}"
    echo ""
    echo "Purpose: Complete memory reset for new user onboarding"
    echo ""
    echo "Usage:"
    echo "  1. Unlock the script:"
    echo "     touch ../.memory-wipe-unlocked"
    echo "     chmod +x $0"
    echo ""
    echo "  2. Run the wipe:"
    echo "     ./$(basename "$0")"
    echo ""
    echo "⚠️  WARNING: This will permanently delete:"
    echo "     • All AI memories and conversations"
    echo "     • All user data and projects"
    echo "     • All logs and history"
    echo "     • External storage data"
    echo ""
    echo "✅ A complete backup will be created before deletion"
    echo ""
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        show_help
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
