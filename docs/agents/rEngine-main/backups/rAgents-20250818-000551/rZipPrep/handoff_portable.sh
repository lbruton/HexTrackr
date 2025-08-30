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
