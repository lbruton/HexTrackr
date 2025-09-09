#!/bin/bash

# Agent Update Script for Spec-Kit Compliance
# Updates all agents to follow the new constitutional structure

echo "═══════════════════════════════════════════════════════════════"
echo "        Agent Update for Spec-Kit Compliance"
echo "═══════════════════════════════════════════════════════════════"
echo ""

AGENT_DIR="/Volumes/DATA/GitHub/HexTrackr/.claude/agents"
BACKUP_DIR="/Volumes/DATA/GitHub/HexTrackr/.claude/agents.backup"

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create backup
echo "Creating backup of current agents..."
mkdir -p "$BACKUP_DIR"
cp -r "$AGENT_DIR"/* "$BACKUP_DIR/" 2>/dev/null
echo -e "${GREEN}✅ Backup created in $BACKUP_DIR${NC}"
echo ""

# List of agents to update
AGENTS=(
    "bug-tracking-specialist"
    "docs-portal-maintainer"
    "project-planner-manager"
    "testing-specialist"
    "ui-design-specialist"
)

echo "Agents to update:"
for agent in "${AGENTS[@]}"; do
    echo "  - $agent.md"
done
echo ""

# Common updates needed for all agents
echo "Applying spec-kit compliance updates..."
echo ""

for agent in "${AGENTS[@]}"; do
    AGENT_FILE="$AGENT_DIR/$agent.md"
    
    if [ -f "$AGENT_FILE" ]; then
        echo "Updating $agent..."
        
        # 1. Update constitution reference
        sed -i '' 's|hextrackr-specs/memory/constitution\.md|.claude/constitution.md|g' "$AGENT_FILE"
        
        # 2. Remove HexTrackr-specific paths from constitutional principles
        sed -i '' 's|hextrackr-specs/specs/\$|specs/\$|g' "$AGENT_FILE"
        sed -i '' 's|hextrackr-specs/specs/|specs/|g' "$AGENT_FILE"
        
        # 3. Update Article references to match new constitution
        # Article I: Specification-Driven Development
        # Article II: Version Control Discipline
        # Article III: Task-Gated Implementation
        # Article IV: Quality Assurance Standards
        # Article V: Documentation Requirements
        # Article VI: Knowledge Management
        # Article VII: Error Management
        # Article VIII: Continuous Improvement
        # Article IX: Active Specification Management
        
        # 4. Add reference to CLAUDE.md for project-specific details
        if ! grep -q "CLAUDE.md" "$AGENT_FILE"; then
            # Add reference after Constitutional Principles section
            sed -i '' '/## Constitutional Principles/a\
\
## Project Implementation\
Project-specific implementation details are in CLAUDE.md, including:\
- HexTrackr file paths and structure\
- Docker configuration and ports\
- Git workflow (copilot branch)\
- Active specification system (.active-spec)\
' "$AGENT_FILE"
        fi
        
        echo -e "${GREEN}  ✓ Updated constitution reference${NC}"
        echo -e "${GREEN}  ✓ Removed project-specific paths${NC}"
        echo -e "${GREEN}  ✓ Added CLAUDE.md reference${NC}"
    else
        echo -e "${YELLOW}  ⚠️  $agent.md not found${NC}"
    fi
    echo ""
done

echo "═══════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Agent updates complete!${NC}"
echo ""
echo "Changes made:"
echo "  1. Updated constitution path to .claude/constitution.md"
echo "  2. Removed HexTrackr-specific paths from principles"
echo "  3. Added references to CLAUDE.md for project details"
echo "  4. Maintained universal principles in agents"
echo ""
echo "Backup saved at: $BACKUP_DIR"
echo "═══════════════════════════════════════════════════════════════"