#!/bin/bash

# Constitutional Purity Validator
# Checks for spec-kit violations in constitution

echo "═══════════════════════════════════════════════════════════════"
echo "        Constitutional Purity Validator"
echo "═══════════════════════════════════════════════════════════════"
echo ""

CONSTITUTION="/Volumes/DATA/GitHub/HexTrackr/.claude/constitution.md"
VIOLATIONS=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "Checking: $CONSTITUTION"
echo ""

# Check for project-specific paths
echo "1. Checking for project-specific paths..."
if grep -E "(hextrackr-specs|\.active-spec|app/public|scripts/shared)" "$CONSTITUTION" > /dev/null; then
    echo -e "${RED}❌ VIOLATION: Found project-specific paths${NC}"
    grep -n -E "(hextrackr-specs|\.active-spec|app/public|scripts/shared)" "$CONSTITUTION"
    ((VIOLATIONS++))
else
    echo -e "${GREEN}✅ No project paths found${NC}"
fi
echo ""

# Check for tool/technology names
echo "2. Checking for specific tools/technologies..."
if grep -iE "(docker|playwright|codacy|sqlite|express|node\.js|npm|jest)" "$CONSTITUTION" > /dev/null; then
    echo -e "${RED}❌ VIOLATION: Found specific tool names${NC}"
    grep -n -iE "(docker|playwright|codacy|sqlite|express|node\.js|npm|jest)" "$CONSTITUTION"
    ((VIOLATIONS++))
else
    echo -e "${GREEN}✅ No specific tools found${NC}"
fi
echo ""

# Check for port numbers
echo "3. Checking for port numbers..."
if grep -E "([0-9]{4,5}|port [0-9]+|:[0-9]{4,5})" "$CONSTITUTION" > /dev/null; then
    echo -e "${RED}❌ VIOLATION: Found port numbers${NC}"
    grep -n -E "([0-9]{4,5}|port [0-9]+|:[0-9]{4,5})" "$CONSTITUTION"
    ((VIOLATIONS++))
else
    echo -e "${GREEN}✅ No port numbers found${NC}"
fi
echo ""

# Check for branch names
echo "4. Checking for branch names..."
if grep -E "(main|master|develop|copilot|feature/)" "$CONSTITUTION" > /dev/null; then
    echo -e "${RED}❌ VIOLATION: Found specific branch names${NC}"
    grep -n -E "(main|master|develop|copilot|feature/)" "$CONSTITUTION"
    ((VIOLATIONS++))
else
    echo -e "${GREEN}✅ No branch names found${NC}"
fi
echo ""

# Check for project names
echo "5. Checking for project names..."
if grep -E "(HexTrackr|StackTrackr|hextrackr|stacktrackr)" "$CONSTITUTION" > /dev/null; then
    echo -e "${RED}❌ VIOLATION: Found project names${NC}"
    grep -n -E "(HexTrackr|StackTrackr|hextrackr|stacktrackr)" "$CONSTITUTION"
    ((VIOLATIONS++))
else
    echo -e "${GREEN}✅ No project names found${NC}"
fi
echo ""

# Check for file extensions that are too specific
echo "6. Checking for specific file patterns..."
if grep -E "\.(js|jsx|ts|tsx|py|rb|go|rs|sql|db)" "$CONSTITUTION" > /dev/null; then
    echo -e "${YELLOW}⚠️  WARNING: Found specific file extensions${NC}"
    grep -n -E "\.(js|jsx|ts|tsx|py|rb|go|rs|sql|db)" "$CONSTITUTION"
    echo -e "${YELLOW}   Consider if these are too specific${NC}"
fi
echo ""

# Summary
echo "═══════════════════════════════════════════════════════════════"
if [ $VIOLATIONS -eq 0 ]; then
    echo -e "${GREEN}✅ CONSTITUTION IS PURE - No violations found!${NC}"
    echo ""
    echo "The constitution contains only universal principles."
else
    echo -e "${RED}❌ CONSTITUTION CONTAMINATED - $VIOLATIONS violation(s) found${NC}"
    echo ""
    echo "These items should be moved to CLAUDE.md:"
    echo "- Project-specific paths"
    echo "- Tool/technology names"
    echo "- Port numbers"
    echo "- Branch names"
    echo "- Project names"
    echo ""
    echo "Run: /amend-constitution to properly separate concerns"
fi
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Check if CLAUDE.md exists and has the implementation details
if [ -f "/Volumes/DATA/GitHub/HexTrackr/CLAUDE.md" ]; then
    echo "Checking CLAUDE.md has implementation details..."
    if grep -q "active-spec\|hextrackr-specs\|8989\|docker" "/Volumes/DATA/GitHub/HexTrackr/CLAUDE.md"; then
        echo -e "${GREEN}✅ CLAUDE.md contains project-specific implementation${NC}"
    else
        echo -e "${YELLOW}⚠️  CLAUDE.md may be missing implementation details${NC}"
    fi
fi

exit $VIOLATIONS