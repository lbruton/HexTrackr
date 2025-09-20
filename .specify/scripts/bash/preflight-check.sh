#!/usr/bin/env bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Spec-Kit Preflight Check for HexTrackr${NC}"
echo "=========================================="
echo ""

# Get feature name from argument
FEATURE_NAME="$1"
if [[ -z "$FEATURE_NAME" ]]; then
  echo -e "${YELLOW}⚠️  No feature name provided${NC}"
  echo "Usage: $0 <feature-name>"
  echo ""
fi

# Check Claude Context index age (informational only)
echo -e "${BLUE}📊 Claude Context Index Status${NC}"
echo "   ℹ️  Manual check required via MCP:"
echo "   mcp__claude-context__get_indexing_status({"
echo "     path: \"/Volumes/DATA/GitHub/HexTrackr\""
echo "   })"
echo ""
echo -e "   ${YELLOW}If index > 1 hour old, re-index first!${NC}"
echo ""

# Check git status
echo -e "${BLUE}📝 Git Status${NC}"
echo -n "   Latest commit: "
git log --oneline -1 --format="%h %ar: %s"

# Check for uncommitted changes
UNCOMMITTED=$(git status --short | wc -l | xargs)
if [[ "$UNCOMMITTED" -gt 0 ]]; then
  echo -e "   ${YELLOW}⚠️  Uncommitted changes: ${UNCOMMITTED} files${NC}"
  git status --short | head -5 | sed 's/^/      /'
  if [[ "$UNCOMMITTED" -gt 5 ]]; then
    echo "      ... and $((UNCOMMITTED - 5)) more"
  fi
else
  echo -e "   ${GREEN}✓ No uncommitted changes${NC}"
fi
echo ""

# Check for existing features if feature name provided
if [[ -n "$FEATURE_NAME" ]]; then
  echo -e "${BLUE}🔎 Searching for existing '${FEATURE_NAME}' implementations${NC}"

  # Search in JavaScript files
  echo "   In JavaScript files:"
  JS_MATCHES=$(grep -r "$FEATURE_NAME" app/ --include="*.js" 2>/dev/null | wc -l | xargs)
  if [[ "$JS_MATCHES" -gt 0 ]]; then
    echo -e "   ${YELLOW}Found ${JS_MATCHES} matches in JS files:${NC}"
    grep -r "$FEATURE_NAME" app/ --include="*.js" | head -3 | cut -c1-80 | sed 's/^/      /'
    if [[ "$JS_MATCHES" -gt 3 ]]; then
      echo "      ... and $((JS_MATCHES - 3)) more"
    fi
  else
    echo -e "   ${GREEN}✓ No existing JS implementations${NC}"
  fi

  # Search in HTML files
  echo "   In HTML files:"
  HTML_MATCHES=$(grep -r "$FEATURE_NAME" app/public/ --include="*.html" 2>/dev/null | wc -l | xargs)
  if [[ "$HTML_MATCHES" -gt 0 ]]; then
    echo -e "   ${YELLOW}Found ${HTML_MATCHES} matches in HTML files${NC}"
  else
    echo -e "   ${GREEN}✓ No existing HTML implementations${NC}"
  fi
  echo ""
fi

# HexTrackr constants reminder
echo -e "${BLUE}📌 HexTrackr Project Constants${NC}"
echo "   Language:    JavaScript ES6+, Node.js 18+"
echo "   Backend:     Express.js + SQLite"
echo "   Frontend:    Vanilla JS (NO React/Vue/Angular)"
echo "   UI:          Tabler.io, AG-Grid v33+"
echo "   Docker Port: 8989 (maps to internal 8080)"
echo "   Testing:     Playwright (E2E), Jest (unit)"
echo "   Database:    data/hextrackr.db"
echo ""

echo -e "${BLUE}📁 HexTrackr Directory Structure${NC}"
echo "   app/"
echo "   ├── controllers/  # Singleton controllers"
echo "   ├── services/     # Business logic"
echo "   ├── routes/       # Express routes"
echo "   ├── middleware/   # Express middleware"
echo "   ├── utils/        # PathValidator, etc."
echo "   └── public/"
echo "       ├── scripts/  # JS modules"
echo "       ├── styles/   # CSS modules"
echo "       └── *.html    # Page files"
echo ""

# Discovery reminder
echo -e "${BLUE}⚠️  MANDATORY Before /specify${NC}"
echo "   1. Run discovery-template.md FIRST"
echo "   2. Complete at least 3 semantic searches"
echo "   3. Identify existing code to modify"
echo "   4. Document integration points"
echo ""

# Final status
echo "=========================================="
if [[ "$UNCOMMITTED" -gt 0 ]]; then
  echo -e "${YELLOW}⚠️  Preflight check complete with warnings${NC}"
  echo "   Consider committing changes before starting new feature"
else
  echo -e "${GREEN}✅ Preflight check complete${NC}"
fi
echo ""
echo "Next steps:"
echo "1. Check Claude Context index age (must be < 1 hour)"
echo "2. Complete discovery-template.md"
echo "3. Run /specify with discovery results"
echo ""