#!/bin/bash
# StackTrackr Path Cleanup Script
# Removes all references to old StackTrackr paths and updates them to rEngine

echo "🧹 StackTrackr Path Cleanup - Converting to rEngine"
echo "=================================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

CLEANUP_COUNT=0
BACKUP_DIR="./stacktrackr-cleanup-backup-$(date +%Y%m%d_%H%M%S)"

# Create backup directory
mkdir -p "$BACKUP_DIR"
echo -e "${YELLOW}📁 Created backup directory: $BACKUP_DIR${NC}"

# Function to backup and update file
update_file() {
    local file="$1"
    local description="$2"
    
    if [ -f "$file" ]; then
        # Create backup
        cp "$file" "$BACKUP_DIR/$(basename "$file").backup"
        
        # Count replacements
        local replacements=$(grep -c "/Volumes/DATA/GitHub/StackTrackr" "$file" 2>/dev/null || echo "0")
        
        if [ "$replacements" -gt 0 ]; then
            echo -e "${YELLOW}🔧 Updating $file ($replacements references)${NC}"
            
            # Replace StackTrackr paths with rEngine paths
            sed -i '' 's|/Volumes/DATA/GitHub/StackTrackr|/Volumes/DATA/GitHub/rEngine|g' "$file"
            
            # Also replace any lowercase variants
            sed -i '' 's|/Volumes/DATA/GitHub/stacktrackr|/Volumes/DATA/GitHub/rEngine|g' "$file"
            
            # Replace StackTrackr project name references
            sed -i '' 's|StackTrackr|rEngine|g' "$file"
            sed -i '' 's|stacktrackr|rengine|g' "$file"
            
            ((CLEANUP_COUNT++))
            echo -e "${GREEN}   ✅ Updated $description${NC}"
        fi
    fi
}

# Critical files to update
echo -e "${YELLOW}🎯 Updating critical configuration files...${NC}"

# Package.json and project configs
update_file "package.json" "NPM package configuration"
update_file "package-lock.json" "NPM lock file"
update_file "docker-compose.yml" "Docker Compose configuration"
update_file "Dockerfile" "Docker configuration"

# rEngine specific files
update_file "rEngine/system-config.json" "System configuration"
update_file "rEngine/enhanced-scribe-console.js" "Enhanced Scribe Console"
update_file "rEngine/persistent-memory.json" "Persistent Memory"

# Memory files
if [ -d "rMemory/rAgentMemories" ]; then
    echo -e "${YELLOW}🧠 Updating memory files...${NC}"
    find rMemory/rAgentMemories -name "*.json" -type f | while read -r file; do
        update_file "$file" "Memory file: $(basename "$file")"
    done
fi

# Agent files
if [ -d "rAgents" ]; then
    echo -e "${YELLOW}🤖 Updating agent files...${NC}"
    find rAgents -name "*.json" -type f | while read -r file; do
        update_file "$file" "Agent file: $(basename "$file")"
    done
fi

# VS Code settings
update_file ".vscode/settings.json" "VS Code settings"
update_file ".vscode/launch.json" "VS Code launch configuration"

# Project documentation
update_file "README.md" "README documentation"
update_file "STARTUP_USAGE_GUIDE.md" "Startup usage guide"

# Protocol files
if [ -d "rProtocols" ]; then
    echo -e "${YELLOW}📋 Updating protocol files...${NC}"
    find rProtocols -name "*.md" -type f | while read -r file; do
        update_file "$file" "Protocol: $(basename "$file")"
    done
fi

# Check for remaining symlinks
echo -e "${YELLOW}🔗 Checking for StackTrackr symlinks...${NC}"
find . -type l -ls | grep -i stacktrackr | while read -r symlink_info; do
    echo -e "${RED}⚠️  Found StackTrackr symlink: $symlink_info${NC}"
    echo "   Manual review recommended"
done

# Summary
echo ""
echo -e "${GREEN}✅ StackTrackr Cleanup Complete!${NC}"
echo -e "   Files updated: $CLEANUP_COUNT"
echo -e "   Backup location: $BACKUP_DIR"
echo ""

# Verification
echo -e "${YELLOW}🔍 Verification - Remaining StackTrackr references:${NC}"
remaining=$(find . -type f -name "*.json" -o -name "*.js" -o -name "*.md" | grep -v node_modules | grep -v "$BACKUP_DIR" | xargs grep -l "StackTrackr\|stacktrackr" 2>/dev/null | wc -l)

if [ "$remaining" -eq 0 ]; then
    echo -e "${GREEN}   ✅ No remaining StackTrackr references found${NC}"
else
    echo -e "${YELLOW}   ⚠️  $remaining files still contain StackTrackr references${NC}"
    echo "   Run: grep -r 'StackTrackr\|stacktrackr' . --exclude-dir=node_modules --exclude-dir=$BACKUP_DIR"
fi

echo ""
echo -e "${GREEN}🎉 Project successfully converted from StackTrackr to rEngine!${NC}"
