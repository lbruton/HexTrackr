#!/bin/bash

# Path Migration Script: StackTrackr → rEngine
# Updates all references from old StackTrackr path to new rEngine path

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 rEngine Path Migration Script${NC}"
echo -e "${YELLOW}Updating all StackTrackr paths to rEngine paths...${NC}"

cd "$(dirname "$0")"

OLD_PATH="/Volumes/DATA/GitHub/rEngine"
NEW_PATH="/Volumes/DATA/GitHub/rEngine"

# Function to update paths in files
update_paths() {
    local file="$1"
    if [[ -f "$file" ]]; then
        sed -i '' "s|$OLD_PATH|$NEW_PATH|g" "$file"
        echo -e "${GREEN}✅ Updated: $file${NC}"
    fi
}

echo -e "${YELLOW}📋 Updating shell scripts...${NC}"

# Update all shell scripts
find . -name "*.sh" -type f | while read -r file; do
    update_paths "$file"
done

echo -e "${YELLOW}📋 Updating JSON configuration files...${NC}"

# Update all JSON files
find . -name "*.json" -type f | while read -r file; do
    update_paths "$file"
done

echo -e "${YELLOW}📋 Updating other configuration files...${NC}"

# Update other config files
find . -name "*.md" -type f | while read -r file; do
    update_paths "$file"
done

find . -name "*.js" -type f | while read -r file; do
    update_paths "$file"
done

find . -name "*.yml" -type f | while read -r file; do
    update_paths "$file"
done

find . -name "*.yaml" -type f | while read -r file; do
    update_paths "$file"
done

echo -e "${GREEN}✅ Path migration complete!${NC}"
echo -e "${YELLOW}🔍 Verifying changes...${NC}"

# Quick verification
REMAINING=$(grep -r "$OLD_PATH" . 2>/dev/null | wc -l)
echo -e "${BLUE}Remaining StackTrackr references: $REMAINING${NC}"

if [ "$REMAINING" -gt 0 ]; then
    echo -e "${YELLOW}📋 Files that still contain old paths:${NC}"
    grep -r "$OLD_PATH" . 2>/dev/null | head -10
fi

echo -e "${GREEN}🚀 Migration script completed!${NC}"
