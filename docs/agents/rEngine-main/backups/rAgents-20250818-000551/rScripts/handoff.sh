#!/bin/bash

# StackTrackr Environment Handoff Script
# Safely coordinate between VS Code local work and Codex remote work

set -e  # Exit on any error

REPO_ROOT="/Volumes/DATA/GitHub/rEngine"
HANDOFF_LOG="$REPO_ROOT/agents/handoff.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$HANDOFF_LOG"
    echo -e "${BLUE}[HANDOFF]${NC} $1"
}

error() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - ERROR: $1" >> "$HANDOFF_LOG"
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

warning() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - WARNING: $1" >> "$HANDOFF_LOG"
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

success() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - SUCCESS: $1" >> "$HANDOFF_LOG"
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check if we're in the right directory
check_repo() {
    if [[ ! -d "$REPO_ROOT/.git" ]]; then
        error "Not in StackTrackr repository root"
    fi
    cd "$REPO_ROOT"
}

# Check Git status
check_git_status() {
    local status=$(git status --porcelain)
    if [[ -n "$status" ]]; then
        warning "Repository has uncommitted changes:"
        git status --short
        return 1
    fi
    return 0
}

# Prepare for Codex handoff
prepare_for_codex() {
    log "Starting handoff preparation for Codex session..."
    
    check_repo
    
    # Check for uncommitted changes
    if ! check_git_status; then
        echo -e "${YELLOW}Uncommitted changes detected. Options:${NC}"
        echo "1) Commit all changes and proceed"
        echo "2) Stash changes and proceed" 
        echo "3) Cancel handoff"
        read -p "Choose option (1-3): " choice
        
        case $choice in
            1)
                read -p "Enter commit message: " commit_msg
                git add -A
                git commit -m "Pre-Codex handoff: $commit_msg"
                success "Changes committed successfully"
                ;;
            2)
                git stash push -m "Pre-Codex handoff stash $(date)"
                success "Changes stashed successfully"
                ;;
            3)
                log "Handoff cancelled by user"
                exit 0
                ;;
            *)
                error "Invalid option selected"
                ;;
        esac
    fi
    
    # Push to remote
    log "Pushing changes to GitHub..."
    git push origin main || error "Failed to push to remote"
    
    # Update handoff timestamp
    echo "$(date '+%Y-%m-%d %H:%M:%S')" > "$REPO_ROOT/agents/.last_handoff_to_codex"
    
    # Create safety backup
    local backup_branch="backup-before-codex-$(date '+%Y%m%d-%H%M%S')"
    git branch "$backup_branch"
    log "Created safety backup branch: $backup_branch"
    
    success "Repository ready for Codex session!"
    echo -e "${GREEN}✅ Safe to work with Codex${NC}"
    echo -e "${YELLOW}⚠️  Do NOT work locally until Codex session is complete${NC}"
}

# Prepare for local work after Codex
prepare_for_local() {
    log "Starting preparation for local work after Codex session..."
    
    check_repo
    
    # Check if there's a handoff timestamp
    if [[ ! -f "$REPO_ROOT/agents/.last_handoff_to_codex" ]]; then
        warning "No Codex handoff timestamp found - proceeding with caution"
    fi
    
    # Fetch latest changes
    log "Fetching latest changes from GitHub..."
    git fetch origin || error "Failed to fetch from remote"
    
    # Check if remote has new commits
    local local_commit=$(git rev-parse HEAD)
    local remote_commit=$(git rev-parse origin/main)
    
    if [[ "$local_commit" != "$remote_commit" ]]; then
        log "Remote repository has new commits from Codex"
        
        # Check for local uncommitted changes
        if ! check_git_status; then
            error "Cannot pull remote changes - local repository has uncommitted work"
        fi
        
        # Pull changes
        log "Pulling Codex changes..."
        git pull origin main || error "Failed to pull remote changes"
        
        # Show what changed
        echo -e "${BLUE}Changes from Codex session:${NC}"
        git log --oneline HEAD~5..HEAD
        
        success "Successfully synchronized with Codex changes"
    else
        log "Local and remote repositories are in sync"
    fi
    
    # Update timestamp
    echo "$(date '+%Y-%m-%d %H:%M:%S')" > "$REPO_ROOT/agents/.last_handoff_to_local"
    
    success "Repository ready for local work!"
    echo -e "${GREEN}✅ Safe to work locally in VS Code${NC}"
}

# Check current handoff status
check_status() {
    log "Checking current handoff status..."
    
    check_repo
    
    echo -e "${BLUE}=== Repository Status ===${NC}"
    
    # Git status
    if check_git_status; then
        echo -e "${GREEN}✅ Working directory clean${NC}"
    else
        echo -e "${RED}❌ Working directory has uncommitted changes${NC}"
    fi
    
    # Remote status
    git fetch origin &>/dev/null || true
    local local_commit=$(git rev-parse HEAD)
    local remote_commit=$(git rev-parse origin/main)
    
    if [[ "$local_commit" == "$remote_commit" ]]; then
        echo -e "${GREEN}✅ Local and remote in sync${NC}"
    else
        echo -e "${RED}❌ Local and remote are out of sync${NC}"
        echo "Local:  $local_commit"
        echo "Remote: $remote_commit"
    fi
    
    # Last handoff timestamps
    if [[ -f "$REPO_ROOT/agents/.last_handoff_to_codex" ]]; then
        local codex_time=$(cat "$REPO_ROOT/agents/.last_handoff_to_codex")
        echo "Last handoff to Codex: $codex_time"
    fi
    
    if [[ -f "$REPO_ROOT/agents/.last_handoff_to_local" ]]; then
        local local_time=$(cat "$REPO_ROOT/agents/.last_handoff_to_local")
        echo "Last handoff to local: $local_time"
    fi
}

# Emergency conflict resolution
emergency_resolve() {
    log "Starting emergency conflict resolution..."
    
    check_repo
    
    # Create emergency backup
    local emergency_branch="emergency-backup-$(date '+%Y%m%d-%H%M%S')"
    git branch "$emergency_branch" || true
    log "Created emergency backup branch: $emergency_branch"
    
    echo -e "${RED}🚨 EMERGENCY CONFLICT RESOLUTION 🚨${NC}"
    echo "This will help resolve conflicts between local and remote work."
    echo -e "${YELLOW}Backup created at branch: $emergency_branch${NC}"
    
    echo -e "\n${BLUE}Conflict resolution options:${NC}"
    echo "1) Reset local to match remote (DESTROYS local changes)"
    echo "2) Force push local to remote (DESTROYS remote changes)"
    echo "3) Manual merge resolution"
    echo "4) Cancel and seek help"
    
    read -p "Choose option (1-4): " choice
    
    case $choice in
        1)
            echo -e "${RED}⚠️  This will DESTROY all local changes!${NC}"
            read -p "Type 'CONFIRM' to proceed: " confirm
            if [[ "$confirm" == "CONFIRM" ]]; then
                git fetch origin
                git reset --hard origin/main
                success "Local repository reset to match remote"
            else
                log "Reset cancelled"
            fi
            ;;
        2)
            echo -e "${RED}⚠️  This will DESTROY all remote changes!${NC}"
            read -p "Type 'CONFIRM' to proceed: " confirm
            if [[ "$confirm" == "CONFIRM" ]]; then
                git push --force-with-lease origin main
                success "Remote repository updated with local changes"
            else
                log "Force push cancelled"
            fi
            ;;
        3)
            echo -e "${BLUE}Starting manual merge process...${NC}"
            git fetch origin
            git merge origin/main || {
                echo -e "${YELLOW}Merge conflicts detected. Resolve manually and run:${NC}"
                echo "git add -A && git commit"
            }
            ;;
        4)
            log "Emergency resolution cancelled - seeking help"
            echo -e "${BLUE}Backup available at branch: $emergency_branch${NC}"
            exit 0
            ;;
        *)
            error "Invalid option selected"
            ;;
    esac
}

# Main command handling
case "${1:-help}" in
    "to-codex"|"codex")
        prepare_for_codex
        ;;
    "to-local"|"local")
        prepare_for_local
        ;;
    "status"|"check")
        check_status
        ;;
    "emergency"|"resolve")
        emergency_resolve
        ;;
    "help"|*)
        echo -e "${BLUE}StackTrackr Environment Handoff Script${NC}"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  to-codex, codex    Prepare repository for Codex remote work"
        echo "  to-local, local    Prepare repository for local VS Code work"
        echo "  status, check      Check current repository handoff status"
        echo "  emergency, resolve Emergency conflict resolution"
        echo "  help              Show this help message"
        echo ""
        echo -e "${YELLOW}Safety Rule: Never work in multiple environments simultaneously!${NC}"
        ;;
esac
