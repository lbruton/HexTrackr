#!/bin/bash

# rEngine Directory Structure Reorganization Script
# Fixes the nested rEngine/rEngine/ issue and cleans up orphaned files

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Timestamp for backups
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/Volumes/DATA/GitHub/rEngine/backups/directory-reorganization-$TIMESTAMP"

echo -e "${BLUE}🔄 rEngine Directory Structure Reorganization${NC}"
echo "Timestamp: $TIMESTAMP"
echo ""

# Create backup directory
echo -e "${YELLOW}📦 Creating backup directory...${NC}"
mkdir -p "$BACKUP_DIR"
echo "Backup location: $BACKUP_DIR"

# Step 1: Backup all memory files (active and inactive)
echo -e "${YELLOW}💾 Backing up all memory files...${NC}"
cp -r "/Volumes/DATA/GitHub/rEngine/rMemory" "$BACKUP_DIR/rMemory_backup" 2>/dev/null || echo "rMemory not found"
cp -r "/Volumes/DATA/GitHub/rEngine/memory-backups" "$BACKUP_DIR/memory-backups_backup" 2>/dev/null || echo "memory-backups not found"

# Step 2: Backup the problematic nested directory
echo -e "${YELLOW}📁 Backing up nested rEngine directory...${NC}"
cp -r "/Volumes/DATA/GitHub/rEngine/rEngine" "$BACKUP_DIR/nested_rEngine_backup"

# Step 3: Identify and list files in nested directory
echo -e "${BLUE}🔍 Analyzing nested rEngine directory contents...${NC}"
NESTED_DIR="/Volumes/DATA/GitHub/rEngine/rEngine"

if [ -d "$NESTED_DIR" ]; then
    echo "Files found in nested rEngine directory:"
    find "$NESTED_DIR" -type f -name "*.js" -o -name "*.cjs" -o -name "*.json" -o -name "*.md" | while read file; do
        echo "  📄 $(basename "$file")"
    done
    echo ""
else
    echo "❌ Nested rEngine directory not found!"
    exit 1
fi

# Step 4: Check for conflicts before moving
echo -e "${YELLOW}⚠️  Checking for file conflicts...${NC}"
conflicts=0

find "$NESTED_DIR" -type f | while read nested_file; do
    filename=$(basename "$nested_file")
    root_file="/Volumes/DATA/GitHub/rEngine/$filename"
    
    if [ -f "$root_file" ]; then
        echo "  ⚠️  CONFLICT: $filename exists in both locations"
        
        # Compare file sizes and modification times
        nested_size=$(stat -f%z "$nested_file" 2>/dev/null || echo "0")
        root_size=$(stat -f%z "$root_file" 2>/dev/null || echo "0")
        nested_time=$(stat -f%m "$nested_file" 2>/dev/null || echo "0")
        root_time=$(stat -f%m "$root_file" 2>/dev/null || echo "0")
        
        echo "    📊 Nested: ${nested_size} bytes, modified $(date -r $nested_time 2>/dev/null || echo 'unknown')"
        echo "    📊 Root:   ${root_size} bytes, modified $(date -r $root_time 2>/dev/null || echo 'unknown')"
        
        # Keep the newer/larger file
        if [ "$nested_time" -gt "$root_time" ] || [ "$nested_size" -gt "$root_size" ]; then
            echo "    ✅ Will use NESTED version (newer/larger)"
            cp "$root_file" "$BACKUP_DIR/conflicted_root_$filename"
        else
            echo "    ✅ Will keep ROOT version (newer/larger)"
            cp "$nested_file" "$BACKUP_DIR/conflicted_nested_$filename"
        fi
        conflicts=$((conflicts + 1))
    fi
done

# Step 5: Essential files to move up
echo -e "${BLUE}📋 Essential files to move to root directory:${NC}"
ESSENTIAL_FILES=(
    "memory-bridge.cjs"
    "vscode-mcp-bridge.js"
    "recall.js"
    "enhanced-scribe-console.js"
    "scribe-console.js"
    "scribe-system-test.js"
    "standalone-mcp-manager.cjs"
    "integrated-mcp-manager.cjs"
    "smart-scribe.js"
    "split-scribe-console.js"
)

for file in "${ESSENTIAL_FILES[@]}"; do
    if [ -f "$NESTED_DIR/$file" ]; then
        echo "  ✅ Found: $file"
    else
        echo "  ❌ Missing: $file"
    fi
done

# Ask for confirmation
echo ""
echo -e "${YELLOW}🤔 Ready to proceed with reorganization?${NC}"
echo "This will:"
echo "1. Move essential files from rEngine/rEngine/ to rEngine/"
echo "2. Rename rEngine/rEngine/ to rEngine/rCore/"
echo "3. Preserve all memory files and backups"
echo ""
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted by user"
    exit 1
fi

# Step 6: Move essential files
echo -e "${GREEN}🚀 Moving essential files to root directory...${NC}"
for file in "${ESSENTIAL_FILES[@]}"; do
    if [ -f "$NESTED_DIR/$file" ]; then
        root_file="/Volumes/DATA/GitHub/rEngine/$file"
        
        # If conflict, handle based on our earlier analysis
        if [ -f "$root_file" ]; then
            nested_time=$(stat -f%m "$NESTED_DIR/$file" 2>/dev/null || echo "0")
            root_time=$(stat -f%m "$root_file" 2>/dev/null || echo "0")
            nested_size=$(stat -f%z "$NESTED_DIR/$file" 2>/dev/null || echo "0")
            root_size=$(stat -f%z "$root_file" 2>/dev/null || echo "0")
            
            if [ "$nested_time" -gt "$root_time" ] || [ "$nested_size" -gt "$root_size" ]; then
                echo "  🔄 Replacing $file (nested version is newer/larger)"
                mv "$root_file" "$BACKUP_DIR/replaced_$file"
                mv "$NESTED_DIR/$file" "$root_file"
            else
                echo "  ⏭️  Keeping existing $file (root version is newer/larger)"
                mv "$NESTED_DIR/$file" "$BACKUP_DIR/skipped_nested_$file"
            fi
        else
            echo "  ✅ Moving $file to root"
            mv "$NESTED_DIR/$file" "$root_file"
        fi
    fi
done

# Step 7: Handle remaining files
echo -e "${BLUE}📁 Processing remaining files in nested directory...${NC}"
if [ "$(find "$NESTED_DIR" -type f | wc -l)" -gt 0 ]; then
    echo "Remaining files will be preserved in rCore/"
    find "$NESTED_DIR" -type f | while read file; do
        echo "  📄 $(basename "$file")"
    done
fi

# Step 8: Rename nested directory to rCore
echo -e "${GREEN}🏷️  Renaming nested rEngine directory to rCore...${NC}"
if [ -d "$NESTED_DIR" ]; then
    mv "$NESTED_DIR" "/Volumes/DATA/GitHub/rEngine/rCore"
    echo "✅ Renamed rEngine/rEngine/ → rEngine/rCore/"
else
    echo "❌ Nested directory no longer exists"
fi

# Step 9: Update file permissions
echo -e "${BLUE}🔧 Setting file permissions...${NC}"
find "/Volumes/DATA/GitHub/rEngine" -name "*.sh" -exec chmod +x {} \; 2>/dev/null
find "/Volumes/DATA/GitHub/rEngine" -name "*.cjs" -exec chmod +x {} \; 2>/dev/null
find "/Volumes/DATA/GitHub/rEngine" -name "*.js" -exec chmod +x {} \; 2>/dev/null

# Step 10: Verify new structure
echo -e "${GREEN}✅ Reorganization complete!${NC}"
echo ""
echo -e "${BLUE}📊 New directory structure:${NC}"
echo "/Volumes/DATA/GitHub/rEngine/"
echo "├── Essential files (moved from nested dir)"
for file in "${ESSENTIAL_FILES[@]}"; do
    if [ -f "/Volumes/DATA/GitHub/rEngine/$file" ]; then
        echo "│   ✅ $file"
    fi
done
echo "├── rCore/ (renamed from rEngine/)"
echo "├── rMemory/ (preserved)"
echo "├── rScribe/ (preserved)"
echo "└── backups/directory-reorganization-$TIMESTAMP/"

echo ""
echo -e "${GREEN}🎉 Directory structure reorganization complete!${NC}"
echo -e "${YELLOW}💾 All original files backed up to: $BACKUP_DIR${NC}"
echo ""
echo "Next steps:"
echo "1. Test memory bridge: cd /Volumes/DATA/GitHub/rEngine && node memory-bridge.cjs"
echo "2. Check rScribe connections"
echo "3. Verify all memory files are intact"
echo "4. Clean up rCore/ directory as needed"
