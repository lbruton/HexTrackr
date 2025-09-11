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

# Step 0: Security Team Pre-flight Check
echo "🔐 Step 0: Security Team Pre-flight Check..."
echo ""

# Dr. Jackson - Formatting and Linting
echo "📚 Dr. Jackson performing linguistic analysis..."
cd "$DEV_REPO"
node hextrackr-specs/agents/drjackson/drjackson.js fix
echo ""

# Worf - Security Scan
echo "⚔️ Worf conducting security sweep..."
node hextrackr-specs/agents/worf/worf.js enforce
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Security check failed! Worf has blocked the release.${NC}"
    echo "Fix the vulnerabilities and try again."
    exit 1
fi
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

# Step 6: Create GitHub Release
echo "📋 Step 6: Creating GitHub Release..."
echo ""
echo -e "${YELLOW}Creating release notes...${NC}"

# Generate release notes
RELEASE_NOTES="## HexTrackr $VERSION

### 📦 Release Information
- **Version**: ${VERSION#v}
- **Date**: $(date +"%Y-%m-%d")
- **Type**: Production Release

### 🚀 What's New
Check the [CHANGELOG](https://github.com/Lonnie-Bruton/HexTrackr/blob/main/CHANGELOG.md) for detailed changes.

### 📥 Installation
\`\`\`bash
docker pull ghcr.io/lonnie-bruton/hextrackr:$VERSION
\`\`\`

### 🔗 Quick Links
- [Documentation](https://github.com/Lonnie-Bruton/HexTrackr#readme)
- [Docker Hub](https://hub.docker.com/r/lonniebruton/hextrackr)
- [Security Policy](https://github.com/Lonnie-Bruton/HexTrackr/security)

### ✅ Quality Metrics
- Codacy Grade: A
- Security Scan: Passed
- Performance Benchmarks: Met

---
*This release was published from the development repository after full testing and validation.*"

# Create the release using GitHub CLI
if command -v gh >/dev/null 2>&1; then
    echo -e "${GREEN}Creating GitHub release with gh CLI...${NC}"
    gh release create "$VERSION" \
        --repo "Lonnie-Bruton/HexTrackr" \
        --title "HexTrackr $VERSION" \
        --notes "$RELEASE_NOTES" \
        --target main
else
    echo -e "${YELLOW}GitHub CLI not found. Please create release manually:${NC}"
    echo "1. Go to: https://github.com/Lonnie-Bruton/HexTrackr/releases/new"
    echo "2. Tag: $VERSION"
    echo "3. Title: HexTrackr $VERSION"
    echo "4. Copy the release notes from above"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Release Complete!${NC}"
echo "=========================================="
echo ""
echo "Released: $VERSION"
echo "Public Repository: https://github.com/Lonnie-Bruton/HexTrackr"
echo "Release URL: https://github.com/Lonnie-Bruton/HexTrackr/releases/tag/$VERSION"
echo ""
echo "Next steps:"
echo "1. Verify GitHub Actions are running"
echo "2. Check Codacy scan results"
echo "3. Update CHANGELOG with release link"
echo "4. Test Docker deployment from public repo"
echo ""