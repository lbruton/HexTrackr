#!/bin/bash

# Release to Public Repository Script
# Syncs production files from dev repo to public repo

set -e

# Configuration
DEV_REPO="/Volumes/DATA/GitHub/HexTrackr"
PUBLIC_REPO="/Volumes/DATA/GitHub/HexTrackr-Public"
VERSION=${1:-""}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "📦 HexTrackr Release to Public Repository"
echo "=========================================="
echo ""

# Check if version provided
if [ -z "$VERSION" ]; then
    echo -e "${RED}Error: Version required${NC}"
    echo "Usage: $0 <version>"
    echo "Example: $0 v1.0.13"
    exit 1
fi

# Check if repos exist
if [ ! -d "$DEV_REPO" ]; then
    echo -e "${RED}Error: Dev repository not found at $DEV_REPO${NC}"
    exit 1
fi

if [ ! -d "$PUBLIC_REPO" ]; then
    echo -e "${RED}Error: Public repository not found at $PUBLIC_REPO${NC}"
    exit 1
fi

echo -e "${YELLOW}Releasing version: $VERSION${NC}"
echo ""

# Step 1: Sync files
echo "📁 Step 1: Syncing files..."
rsync -av --delete \
    --include="app/***" \
    --include="docker-compose.yml" \
    --include="Dockerfile.node" \
    --include="package.json" \
    --include="package-lock.json" \
    --include=".codacy*" \
    --include=".github/***" \
    --include=".env.example" \
    --exclude=".git" \
    --exclude=".DS_Store" \
    --exclude="*.db" \
    --exclude="*.log" \
    --exclude="node_modules" \
    --exclude="*" \
    "$DEV_REPO/" "$PUBLIC_REPO/"

# Step 2: Update README version
echo "📝 Step 2: Updating README version..."
cd "$PUBLIC_REPO"
sed -i '' "s/\*\*Version\*\*: .*/\*\*Version\*\*: ${VERSION#v}/" README.md

# Step 3: Commit changes
echo "💾 Step 3: Committing changes..."
git add -A

if git diff --staged --quiet; then
    echo -e "${YELLOW}No changes to commit${NC}"
else
    git commit -m "Release $VERSION

- Synced from development repository
- Updated documentation
- Version bump to ${VERSION#v}"
fi

# Step 4: Tag version
echo "🏷️ Step 4: Creating version tag..."
git tag -a "$VERSION" -m "Release $VERSION"

# Step 5: Push to GitHub
echo "🚀 Step 5: Pushing to GitHub..."
git push origin main
git push origin "$VERSION"

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Release Complete!${NC}"
echo "=========================================="
echo ""
echo "Released: $VERSION"
echo "Public Repository: https://github.com/Lonnie-Bruton/HexTrackr"
echo ""
echo "Next steps:"
echo "1. Verify GitHub Actions are running"
echo "2. Check Codacy scan results"
echo "3. Test Docker deployment from public repo"
echo ""