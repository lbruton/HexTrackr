#!/bin/bash

# 🔒 rAgents Complete Mirror to Private Repo Script
# Mirror ENTIRE rAgents folder to private repo, then gitignore on public

echo "🔒 rAgents Complete IP Security Migration"
echo "========================================"

# Step 1: Create timestamped archive of complete rAgents folder
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
ARCHIVE_NAME="rAgents-COMPLETE-$TIMESTAMP.tar.gz"

echo "📦 Creating complete archive: $ARCHIVE_NAME"
tar -czf "$ARCHIVE_NAME" rAgents/

echo "📊 Archive contents:"
tar -tzf "$ARCHIVE_NAME" | head -20
echo "   ... ($(tar -tzf "$ARCHIVE_NAME" | wc -l | tr -d ' ') total files)"

# Step 2: Add comprehensive .gitignore for entire rAgents folder
echo "🛡️  Adding rAgents to .gitignore..."

# Create backup of existing .gitignore
cp .gitignore .gitignore.backup 2>/dev/null || true

# Add comprehensive rAgents exclusion
cat >> .gitignore << 'EOF'

# ========================================
# 🔒 rAgents - COMPLETE IP PROTECTION
# ========================================
# Mirror everything to private repo, ignore on public

# Entire rAgents ecosystem
rAgents/

# Any rAgents archives
rAgents-*.tar.gz

# Migration scripts
migrate-*
*-migration*

# Commercial/sensitive files anywhere
*commercial*
*token-economics*
*distribution-strategy*
*confidential*
*master-plan*
*world-domination*

# IP protection patterns
**/*CONFIDENTIAL*
**/*COMMERCIAL*
**/*PRIVATE*
EOF

# Step 3: Verify what will be ignored
echo ""
echo "🔍 Verifying .gitignore effectiveness..."
echo "Files that will be ignored:"
git check-ignore rAgents/* 2>/dev/null | head -10
echo "   ... (and all other rAgents/ contents)"

# Step 4: Show current git status
echo ""
echo "📊 Current git status:"
git status --porcelain | grep rAgents | head -10
echo "   ... (showing first 10 rAgents changes)"

# Step 5: Display manual steps
echo ""
echo "🚀 NEXT STEPS - EXECUTE THESE MANUALLY:"
echo "======================================"
echo ""
echo "1. 🔐 CREATE PRIVATE REPOSITORY:"
echo "   git clone https://github.com/yourusername/rAgents-private.git"
echo "   cd rAgents-private"
echo ""
echo "2. 📁 COPY COMPLETE rAgents FOLDER:"
echo "   cp -r ../StackTrackr/rAgents/* ."
echo "   git add ."
echo "   git commit -m 'Initial mirror of complete rAgents IP'"
echo "   git push origin main"
echo ""
echo "3. 🗑️  CLEAN PUBLIC REPO (BACK IN StackTrackr):"
echo "   git add .gitignore"
echo "   git rm -r rAgents/ (if already tracked)"
echo "   git commit -m 'Move rAgents IP to private repo, add gitignore'"
echo "   git push origin main"
echo ""
echo "4. 🔄 ESTABLISH SYNC WORKFLOW:"
echo "   - Work on rAgents in private repo"
echo "   - Sync changes back to private repo regularly"
echo "   - Only commit public-safe changes to StackTrackr"
echo ""
echo "5. 📝 TEAM COORDINATION:"
echo "   - Share private repo access with trusted team only"
echo "   - Establish 'rAgents' as code name for public discussions"
echo "   - Document sync workflow for team members"
echo ""
echo "📄 Archive created: $(ls -la $ARCHIVE_NAME)"
echo "📁 Total rAgents files: $(find rAgents -type f | wc -l | tr -d ' ')"
echo "💾 Archive size: $(du -h $ARCHIVE_NAME | cut -f1)"
echo ""
echo "🎯 SECURITY BENEFITS:"
echo "   ✅ Complete IP protection"
echo "   ✅ Clean public development environment"  
echo "   ✅ Flexible private development workflow"
echo "   ✅ Easy sync between repos"
echo "   ✅ Zero risk of accidental public commits"
echo ""
echo "🔮 FUTURE WORKFLOW:"
echo "   Private repo = Complete rAgents development"
echo "   Public repo = StackTrackr + public-safe rAgents integration"
echo "   Sync = Manual copy of selected public-safe components"
echo ""
echo "⚠️  REMEMBER: Check git status before commits!"
echo "    The .gitignore will prevent accidents, but always verify!"

# Step 6: Create sync helper script for future use
cat > sync-to-private.sh << 'EOF'
#!/bin/bash
# Helper script to sync rAgents changes to private repo

PRIVATE_REPO_PATH="../rAgents-private"

if [ ! -d "$PRIVATE_REPO_PATH" ]; then
    echo "❌ Private repo not found at: $PRIVATE_REPO_PATH"
    echo "   Clone it first: git clone https://github.com/yourusername/rAgents-private.git"
    exit 1
fi

echo "🔄 Syncing rAgents to private repo..."
rsync -av --delete rAgents/ "$PRIVATE_REPO_PATH/"

echo "✅ Sync complete. Don't forget to commit in private repo:"
echo "   cd $PRIVATE_REPO_PATH"
echo "   git add ."
echo "   git commit -m 'Sync from StackTrackr development'"
echo "   git push"
EOF

chmod +x sync-to-private.sh

echo ""
echo "📝 Created sync-to-private.sh helper script for future syncing"
echo ""
echo "🎊 Migration preparation complete!"
echo "   Execute the manual steps above to complete the security migration."
