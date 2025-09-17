#!/bin/bash

# HexTrackr Security Scanner Hook
# Runs security checks on sensitive files after modifications

set -e

PROJECT_DIR="$CLAUDE_PROJECT_DIR"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}[Security Scan]${NC} Running security analysis..."

# Change to project directory
cd "$PROJECT_DIR"

# Security patterns to check for
declare -A SECURITY_PATTERNS=(
    ["eval_usage"]="eval\s*\("
    ["innerHTML_usage"]="\.innerHTML\s*="
    ["document_write"]="document\.write\s*\("
    ["unsafe_regex"]="new\s+RegExp\s*\([^)]*\$[^)]*\)"
    ["sql_injection"]="(SELECT|INSERT|UPDATE|DELETE).*\+.*"
    ["hardcoded_secrets"]="(password|secret|key|token)\s*[:=]\s*['\"][^'\"]{8,}['\"]"
    ["unsafe_eval"]="(Function\s*\(|new\s+Function\s*\()"
    ["xss_vectors"]="(location\.href|window\.location|document\.location).*="
)

SECURITY_ISSUES=0
SCAN_LOG="/tmp/hextrackr-security-scan.log"

# Initialize scan log
echo "HexTrackr Security Scan - $(date)" > "$SCAN_LOG"
echo "========================================" >> "$SCAN_LOG"

# Read the file path from stdin (Claude Code hook input)
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [[ -n "$FILE_PATH" && -f "$FILE_PATH" ]]; then
    echo -e "${BLUE}[Security]${NC} Scanning: $(basename "$FILE_PATH")"
    echo "Scanning: $FILE_PATH" >> "$SCAN_LOG"

    # Check each security pattern
    for pattern_name in "${!SECURITY_PATTERNS[@]}"; do
        pattern="${SECURITY_PATTERNS[$pattern_name]}"

        if grep -qE "$pattern" "$FILE_PATH"; then
            echo -e "${YELLOW}[Security]${NC} ⚠️  Potential issue: $pattern_name"
            echo "  ⚠️  $pattern_name found in $FILE_PATH" >> "$SCAN_LOG"
            grep -nE "$pattern" "$FILE_PATH" | head -3 >> "$SCAN_LOG"
            ((SECURITY_ISSUES++))
        fi
    done
else
    # Run general security scan on key files
    echo -e "${BLUE}[Security]${NC} Running general security scan..."

    # Scan server.js and scripts directory
    SCAN_FILES=(
        "app/public/server.js"
        "app/public/scripts/shared/*.js"
        "app/public/scripts/pages/*.js"
    )

    for file_pattern in "${SCAN_FILES[@]}"; do
        for file in $file_pattern; do
            if [[ -f "$file" ]]; then
                echo "Scanning: $file" >> "$SCAN_LOG"

                for pattern_name in "${!SECURITY_PATTERNS[@]}"; do
                    pattern="${SECURITY_PATTERNS[$pattern_name]}"

                    if grep -qE "$pattern" "$file"; then
                        echo -e "${YELLOW}[Security]${NC} ⚠️  $pattern_name in $(basename "$file")"
                        echo "  ⚠️  $pattern_name found in $file" >> "$SCAN_LOG"
                        grep -nE "$pattern" "$file" | head -2 >> "$SCAN_LOG"
                        ((SECURITY_ISSUES++))
                    fi
                done
            fi
        done
    done
fi

# Run ESLint with security rules if available
if command -v npm >/dev/null && [[ -f "package.json" ]]; then
    echo -e "${BLUE}[Security]${NC} Running ESLint security checks..."

    # Run ESLint focusing on security-related rules
    if npm run eslint 2>&1 | grep -i "security\|vulnerability\|dangerous" > /tmp/eslint-security.log; then
        echo -e "${YELLOW}[Security]${NC} ESLint security warnings found"
        cat /tmp/eslint-security.log >> "$SCAN_LOG"
        ((SECURITY_ISSUES++))
    fi
fi

# Check for Codacy CLI if available
if command -v codacy-analysis-cli >/dev/null; then
    echo -e "${BLUE}[Security]${NC} Running Codacy security analysis..."
    # Note: This would require Codacy CLI setup
    echo "Codacy CLI detected but not configured" >> "$SCAN_LOG"
fi

# Report results
echo "" >> "$SCAN_LOG"
echo "========================================" >> "$SCAN_LOG"
echo "Security issues found: $SECURITY_ISSUES" >> "$SCAN_LOG"
echo "Scan completed: $(date)" >> "$SCAN_LOG"

if [[ $SECURITY_ISSUES -eq 0 ]]; then
    echo -e "${GREEN}[Security]${NC} ✅ No security issues detected"
else
    echo -e "${YELLOW}[Security]${NC} ⚠️  Found $SECURITY_ISSUES potential security issue(s)"
    echo -e "${BLUE}[Security]${NC} Check detailed log: $SCAN_LOG"
fi

# Clean up old scan logs (keep last 5)
find /tmp -name "hextrackr-security-scan-*.log" -mtime +1 -delete 2>/dev/null || true

echo -e "${BLUE}[Security]${NC} Security scan complete"