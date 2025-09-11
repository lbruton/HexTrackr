#!/bin/bash

# HexTrackr Sequential Spec Renumbering Script
# Creates a clean 001, 002, 003... progression
# Run from hextrackr-specs directory

set -e

SPECS_DIR="./specs"
ARCHIVED_DIR="./specs/archived"
TEMP_DIR="./specs/.temp-rename"

echo "═══════════════════════════════════════════════════════════════"
echo "  HexTrackr Clean Sequential Renumbering"
echo "  Creating organized 001, 002, 003... progression"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Create directories
mkdir -p "$ARCHIVED_DIR"
mkdir -p "$TEMP_DIR"

# Function to move spec to temp with new number
stage_spec() {
    local OLD_PATH=$1
    local NEW_NUM=$2
    local NEW_NAME=$3
    
    if [ -d "$OLD_PATH" ]; then
        NEW_PATH="$TEMP_DIR/${NEW_NUM}-${NEW_NAME}"
        cp -r "$OLD_PATH" "$NEW_PATH"
        echo "  📋 Staged: $(basename $OLD_PATH) → ${NEW_NUM}-${NEW_NAME}"
    fi
}

# Function to archive spec
archive_spec() {
    local SPEC_PATH=$1
    local REASON=$2
    
    if [ -d "$SPEC_PATH" ]; then
        cp -r "$SPEC_PATH" "$ARCHIVED_DIR/"
        echo "  📦 Archived: $(basename $SPEC_PATH) - Reason: $REASON"
    fi
}

echo "Phase 1: Archiving Long-term/Questionable Specs"
echo "─────────────────────────────────────────────"
# These are very long-term or may not be needed
archive_spec "$SPECS_DIR/035-mitre-attack-mapping" "Long-term vision - not immediate priority"
archive_spec "$SPECS_DIR/090-network-mapping-visualization" "Long-term vision - focus on core first"
archive_spec "$SPECS_DIR/091-snmp-inventory-system" "Long-term vision - focus on core first"
archive_spec "$SPECS_DIR/051-typescript-migration" "May not be needed - evaluate later"
archive_spec "$SPECS_DIR/052-pwa-implementation" "Nice-to-have - not critical path"
echo ""

echo "Phase 2: Staging Sequential Renumbering"
echo "─────────────────────────────────────────────"

# TESTING FOUNDATION (001-004)
stage_spec "$SPECS_DIR/001-testing-infrastructure" "001" "testing-infrastructure"
# 002-004 will be created new

# CRITICAL FIXES (005-007)
stage_spec "$SPECS_DIR/010-cve-link-system-fix" "005" "cve-link-system-fix"
stage_spec "$SPECS_DIR/011-modal-system-enhancement" "006" "modal-system-enhancement"
stage_spec "$SPECS_DIR/012-responsive-layout-completion" "007" "responsive-layout-completion"

# SECURITY & AUTH (008-010)
stage_spec "$SPECS_DIR/020-security-hardening-foundation" "008" "security-hardening"
# 009 authentication-system will be created new
# 010 audit-logging will be created new

# DATA INTEGRATION (011-015)
stage_spec "$SPECS_DIR/030-database-schema-standardization" "011" "database-optimization"
stage_spec "$SPECS_DIR/033-cisco-api-integration" "012" "cisco-api-integration"
stage_spec "$SPECS_DIR/034-tenable-api-integration" "013" "tenable-api-integration"
stage_spec "$SPECS_DIR/031-kev-integration" "014" "kev-integration"
stage_spec "$SPECS_DIR/032-epss-scoring-integration" "015" "epss-scoring"

# WORKFLOW ENHANCEMENTS (016-019)
stage_spec "$SPECS_DIR/036-ticket-bridging" "016" "ticket-bridging"
stage_spec "$SPECS_DIR/037-cross-page-ticket-integration" "017" "cross-page-tickets"
# 018 template-system will be created new
# 019 email-notifications will be created new

# ARCHITECTURE (020-022)
stage_spec "$SPECS_DIR/050-backend-modularization" "020" "backend-modularization"
# Skip TypeScript migration - archived
# Skip PWA - archived
stage_spec "$SPECS_DIR/053-documentation-portal" "021" "documentation-portal"

# UI/UX (022-023)
stage_spec "$SPECS_DIR/070-dark-mode-implementation" "022" "dark-mode"
stage_spec "$SPECS_DIR/071-ag-grid-enhancements" "023" "ag-grid-enhancements"

echo ""
echo "Phase 3: Clearing Old Specs"
echo "─────────────────────────────────────────────"
# Remove all old numbered specs (except 000)
for dir in $SPECS_DIR/[0-9][0-9][1-9]-*; do
    if [ -d "$dir" ]; then
        rm -rf "$dir"
        echo "  🗑️  Removed: $(basename $dir)"
    fi
done

echo ""
echo "Phase 4: Moving from Temp to Final"
echo "─────────────────────────────────────────────"
# Move all staged specs to final location
for dir in $TEMP_DIR/*; do
    if [ -d "$dir" ]; then
        BASENAME=$(basename "$dir")
        mv "$dir" "$SPECS_DIR/$BASENAME"
        echo "  ✅ Final: $BASENAME"
    fi
done

# Clean up temp directory
rm -rf "$TEMP_DIR"

echo ""
echo "Phase 5: Specs to Create"
echo "─────────────────────────────────────────────"
echo "  📝 002-playwright-e2e-tests - User workflow tests"
echo "  📝 003-unit-test-coverage - Component testing"
echo "  📝 004-performance-benchmarks - Load testing"
echo "  📝 009-authentication-system - Phase 1-4 auth"
echo "  📝 010-audit-logging - Compliance tracking"
echo "  📝 018-template-system - Markdown/email templates"
echo "  📝 019-email-notifications - Automated alerts"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  Sequential Renumbering Complete!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Current Sequence:"
echo "  000: Master truth (production state)"
echo "  001-004: Testing foundation"
echo "  005-007: Critical fixes"
echo "  008-010: Security & auth"
echo "  011-015: Data integration"
echo "  016-019: Workflow enhancements"
echo "  020-021: Architecture"
echo "  022-023: UI/UX"
echo ""
echo "Next Steps:"
echo "1. Update master spec roadmap with new numbers"
echo "2. Create missing specs (002-004, 009-010, 018-019)"
echo "3. Update .active-spec to 001-testing-infrastructure"
echo "4. Commit with constitutional compliance"