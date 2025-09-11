#!/bin/bash

# HexTrackr Spec Renumbering Script
# Creates a prioritized, numbered specification system
# Run from hextrackr-specs directory

set -e

SPECS_DIR="./specs"
ARCHIVED_DIR="./specs/archived"

echo "═══════════════════════════════════════════════════════════════"
echo "  HexTrackr Specification Renumbering System"
echo "  Establishing Test-Driven Development Foundation"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Create archived directory if it doesn't exist
mkdir -p "$ARCHIVED_DIR"

# Function to move spec safely
move_spec() {
    local OLD_NUM=$1
    local NEW_NUM=$2
    local OLD_NAME=$3
    local NEW_NAME=$4
    
    OLD_PATH="$SPECS_DIR/${OLD_NUM}-${OLD_NAME}"
    NEW_PATH="$SPECS_DIR/${NEW_NUM}-${NEW_NAME}"
    
    if [ -d "$OLD_PATH" ]; then
        if [ -d "$NEW_PATH" ]; then
            echo "  ⚠️  Target exists: ${NEW_NUM}-${NEW_NAME} (skipping)"
        else
            mv "$OLD_PATH" "$NEW_PATH"
            echo "  ✅ Moved: ${OLD_NUM}-${OLD_NAME} → ${NEW_NUM}-${NEW_NAME}"
        fi
    else
        echo "  ⏭️  Not found: ${OLD_NUM}-${OLD_NAME} (may already be moved)"
    fi
}

# Function to archive duplicate spec
archive_spec() {
    local NUM=$1
    local NAME=$2
    
    SPEC_PATH="$SPECS_DIR/${NUM}-${NAME}"
    
    if [ -d "$SPEC_PATH" ]; then
        mv "$SPEC_PATH" "$ARCHIVED_DIR/"
        echo "  📦 Archived: ${NUM}-${NAME}"
    fi
}

echo "Phase 1: Archiving Duplicates"
echo "─────────────────────────────────────────────"
# Archive duplicate unified-application-framework (we keep cross-page-ticket-integration)
archive_spec "019" "unified-application-framework"
echo ""

echo "Phase 2: Priority 1 - Testing & Quality (001-009)"
echo "─────────────────────────────────────────────"
move_spec "018" "001" "testing-infrastructure" "testing-infrastructure"
# 002-004 will be created as new specs
echo "  📝 To create: 002-playwright-e2e-tests (NEW)"
echo "  📝 To create: 003-unit-test-coverage (NEW)"
echo "  📝 To create: 004-performance-benchmarks (NEW)"
echo ""

echo "Phase 3: Priority 2 - Current Bugs & Fixes (010-019)"
echo "─────────────────────────────────────────────"
move_spec "004" "010" "cve-link-system-fix" "cve-link-system-fix"
move_spec "005" "011" "modal-system-enhancement" "modal-system-enhancement"
move_spec "006" "012" "responsive-layout-completion" "responsive-layout-completion"
echo ""

echo "Phase 4: Priority 3 - Security & Hardening (020-029)"
echo "─────────────────────────────────────────────"
move_spec "008" "020" "security-hardening-foundation" "security-hardening-foundation"
echo "  📝 To create: 021-authentication-system (NEW)"
echo "  📝 To create: 022-audit-logging (NEW)"
echo ""

echo "Phase 5: Priority 4 - Data & Integration (030-049)"
echo "─────────────────────────────────────────────"
move_spec "015" "030" "database-schema-standardization" "database-schema-standardization"
move_spec "007" "031" "kev-integration" "kev-integration"
move_spec "009" "032" "epss-scoring-integration" "epss-scoring-integration"
move_spec "012" "033" "cisco-api-integration" "cisco-api-integration"
move_spec "013" "034" "tenable-api-integration" "tenable-api-integration"
move_spec "017" "035" "mitre-attack-mapping" "mitre-attack-mapping"
move_spec "003" "036" "ticket-bridging" "ticket-bridging"
move_spec "019" "037" "cross-page-ticket-integration" "cross-page-ticket-integration"
echo ""

echo "Phase 6: Priority 5 - Architecture & Infrastructure (050-069)"
echo "─────────────────────────────────────────────"
move_spec "010" "050" "backend-modularization" "backend-modularization"
move_spec "016" "051" "typescript-migration" "typescript-migration"
move_spec "014" "052" "pwa-implementation" "pwa-implementation"
move_spec "022" "053" "documentation-portal-rebuild" "documentation-portal"
echo ""

echo "Phase 7: Priority 6 - UI/UX Enhancements (070-089)"
echo "─────────────────────────────────────────────"
move_spec "011" "070" "dark-mode-implementation" "dark-mode-implementation"
move_spec "023" "071" "enhance-hextrackr-vulnerability" "ag-grid-enhancements"
echo "  📝 To create: 072-template-system (NEW)"
echo "  📝 To create: 073-email-notifications (NEW)"
echo ""

echo "Phase 8: Priority 7 - Future Vision (090-099)"
echo "─────────────────────────────────────────────"
move_spec "021" "090" "network-mapping-visualization" "network-mapping-visualization"
move_spec "020" "091" "snmp-inventory-system" "snmp-inventory-system"
echo "  📝 To create: 092-config-management (NEW)"
echo "  📝 To create: 093-network-wiki (NEW)"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "  Renumbering Complete!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Next Steps:"
echo "1. Create missing specs (002, 003, 004, 021, 022, 072, 073, 092, 093)"
echo "2. Update cross-references in all specs"
echo "3. Update .active-spec if needed"
echo "4. Commit changes with constitutional compliance"
echo ""
echo "Priority Focus: 001-testing-infrastructure is your next target!"