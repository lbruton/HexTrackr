#!/bin/bash

# HexTrackr Lint-on-Save Hook
# Automatically runs appropriate linters after file edits

set -e

# Get the file type from argument
FILE_TYPE="${1:-unknown}"
PROJECT_DIR="$CLAUDE_PROJECT_DIR"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}[HexTrackr Lint]${NC} Running ${FILE_TYPE} linter..."

# Change to project directory
cd "$PROJECT_DIR"

case "$FILE_TYPE" in
    "js")
        echo -e "${BLUE}[ESLint]${NC} Checking JavaScript files..."

        # Run ESLint with auto-fix
        if npm run eslint:fix > /tmp/hextrackr-eslint.log 2>&1; then
            echo -e "${GREEN}[ESLint]${NC} ✅ JavaScript files passed linting"
        else
            echo -e "${YELLOW}[ESLint]${NC} ⚠️  Issues found and auto-fixed where possible"
            # Show only the summary, not full output
            tail -n 10 /tmp/hextrackr-eslint.log | grep -E "(error|warning|✖|✓)" || true
        fi
        ;;

    "css")
        echo -e "${BLUE}[Stylelint]${NC} Checking CSS files..."

        # Run Stylelint with auto-fix
        if npm run stylelint:fix > /tmp/hextrackr-stylelint.log 2>&1; then
            echo -e "${GREEN}[Stylelint]${NC} ✅ CSS files passed linting"
        else
            echo -e "${YELLOW}[Stylelint]${NC} ⚠️  Issues found and auto-fixed where possible"
            # Show only the summary
            tail -n 10 /tmp/hextrackr-stylelint.log | grep -E "(error|warning|✖|✓)" || true
        fi
        ;;

    *)
        echo -e "${RED}[Lint]${NC} Unknown file type: $FILE_TYPE"
        exit 1
        ;;
esac

# Clean up log files older than 1 day
find /tmp -name "hextrackr-*lint.log" -mtime +1 -delete 2>/dev/null || true

echo -e "${BLUE}[HexTrackr Lint]${NC} Linting complete"