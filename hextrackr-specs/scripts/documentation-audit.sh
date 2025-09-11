#!/bin/bash

# Documentation Audit Script
# Summons Merlin to audit and optionally update documentation
# Can be integrated into CI/CD or run manually

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SPECS_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "═══════════════════════════════════════════════════"
echo "🧙‍♂️ MERLIN'S DOCUMENTATION TRUTH AUDIT"
echo "═══════════════════════════════════════════════════"
echo ""
echo "Usage: $0 [command] [options]"
echo ""
echo "Commands:"
echo "  audit [scope]    : Perform documentation audit"
echo "  update [target]  : Update documentation based on findings"
echo "  prophecy [time]  : Predict future documentation drift"
echo "  full            : Audit, update, and prophecy (complete ritual)"
echo ""
echo "Audit Scopes:"
echo "  all             : Complete documentation audit (default)"
echo "  architecture    : Architecture documentation only"
echo "  api            : API documentation only"
echo "  guides         : User guides only"
echo "  security       : Security documentation only"
echo "  recent         : Only files changed in last 7 days"
echo ""
echo "Options:"
echo "  --dry-run      : Preview changes without applying"
echo "  --parallel     : Use all Stooges simultaneously"
echo "  --ci          : CI/CD mode (fail on critical issues)"
echo ""
echo "Examples:"
echo "  $0 audit                    # Full audit"
echo "  $0 audit api               # API docs only"
echo "  $0 update audit-findings   # Fix recent audit issues"
echo "  $0 prophecy week          # Predict next week's drift"
echo "  $0 full --ci              # Complete CI/CD check"
echo ""

# Parse command line arguments
COMMAND="${1:-audit}"
SCOPE="${2:-all}"
DRY_RUN=false
PARALLEL=true
CI_MODE=false

# Check for flags
for arg in "$@"; do
    case $arg in
        --dry-run)
            DRY_RUN=true
            echo "🔍 DRY RUN MODE: No changes will be applied"
            ;;
        --parallel)
            PARALLEL=true
            echo "⚡ PARALLEL MODE: Stooges will work simultaneously"
            ;;
        --ci)
            CI_MODE=true
            echo "🤖 CI/CD MODE: Will fail on critical issues"
            ;;
    esac
done

# Function to run Merlin audit
run_audit() {
    local scope="${1:-all}"
    echo ""
    echo "🔮 Phase 1: Documentation Audit"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Summoning Merlin to audit ${scope} documentation..."
    echo ""
    
    # Export variables for Merlin
    export MERLIN_AUDIT_SCOPE="$scope"
    export MERLIN_PROJECT_ROOT="$PROJECT_ROOT"
    
    # In real implementation, this would call Merlin via Claude Code
    # For now, we'll simulate with Node.js if agent exists
    if [ -f "$SPECS_ROOT/agents/merlin/merlin.js" ]; then
        node "$SPECS_ROOT/agents/merlin/merlin.js" audit "$scope"
    else
        echo "📜 Merlin audit for scope: $scope"
        echo "   (Agent implementation pending)"
    fi
    
    # Check for audit results
    AUDIT_FILE=$(ls -t MERLIN_AUDIT_*.md 2>/dev/null | head -1)
    if [ -n "$AUDIT_FILE" ]; then
        echo ""
        echo "✅ Audit complete: $AUDIT_FILE"
        
        # Extract critical issues count
        CRITICAL_COUNT=$(grep -c "CRITICAL" "$AUDIT_FILE" 2>/dev/null || echo "0")
        
        if [ "$CI_MODE" = true ] && [ "$CRITICAL_COUNT" -gt 0 ]; then
            echo "❌ CRITICAL documentation issues found: $CRITICAL_COUNT"
            echo "   CI/CD check failed - documentation needs updating"
            exit 1
        fi
    fi
}

# Function to run documentation updates
run_update() {
    local target="${1:-audit-findings}"
    echo ""
    echo "📝 Phase 2: Documentation Update"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Directing Stooges to update documentation..."
    echo ""
    
    if [ "$DRY_RUN" = true ]; then
        echo "🔍 DRY RUN: Showing what would be updated..."
        export MERLIN_DRY_RUN=true
    fi
    
    # Export variables for Merlin
    export MERLIN_UPDATE_TARGET="$target"
    export MERLIN_PARALLEL="$PARALLEL"
    
    # In real implementation, this would call Merlin
    if [ -f "$SPECS_ROOT/agents/merlin/merlin.js" ]; then
        node "$SPECS_ROOT/agents/merlin/merlin.js" update "$target"
    else
        echo "📜 Merlin update for target: $target"
        echo "   (Agent implementation pending)"
    fi
    
    # Check for update results
    UPDATE_FILE=$(ls -t MERLIN_UPDATE_*.md 2>/dev/null | head -1)
    if [ -n "$UPDATE_FILE" ]; then
        echo ""
        echo "✅ Updates complete: $UPDATE_FILE"
        
        if [ "$DRY_RUN" = false ]; then
            echo "   Documentation has been updated"
            echo "   Run '/generatedocs' to regenerate HTML"
        fi
    fi
}

# Function to run prophecy
run_prophecy() {
    local timeframe="${1:-week}"
    echo ""
    echo "🌟 Phase 3: Documentation Prophecy"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Merlin gazes into the future..."
    echo ""
    
    # Export variables for Merlin
    export MERLIN_PROPHECY_TIMEFRAME="$timeframe"
    
    # In real implementation, this would call Merlin
    if [ -f "$SPECS_ROOT/agents/merlin/merlin.js" ]; then
        node "$SPECS_ROOT/agents/merlin/merlin.js" prophecy "$timeframe"
    else
        echo "🔮 Merlin prophecy for timeframe: $timeframe"
        echo "   (Agent implementation pending)"
    fi
    
    # Check for prophecy results
    PROPHECY_FILE=$(ls -t MERLIN_PROPHECY_*.md 2>/dev/null | head -1)
    if [ -n "$PROPHECY_FILE" ]; then
        echo ""
        echo "✅ Prophecy revealed: $PROPHECY_FILE"
        
        # Extract high risk count
        HIGH_RISK=$(grep -c "High Risk" "$PROPHECY_FILE" 2>/dev/null || echo "0")
        if [ "$HIGH_RISK" -gt 0 ]; then
            echo "⚠️  Warning: $HIGH_RISK documents at high risk of drift"
        fi
    fi
}

# Function to run full documentation ritual
run_full() {
    echo "🎭 Performing Complete Documentation Ritual"
    echo "═══════════════════════════════════════════════════"
    
    # Step 1: Audit
    run_audit "all"
    
    # Step 2: Update (unless dry-run)
    if [ "$DRY_RUN" = false ]; then
        run_update "audit-findings"
    else
        echo ""
        echo "⏭️  Skipping updates in dry-run mode"
    fi
    
    # Step 3: Prophecy
    run_prophecy "week"
    
    echo ""
    echo "═══════════════════════════════════════════════════"
    echo "✨ Documentation ritual complete!"
    echo ""
    echo "Summary:"
    echo "  • Audit performed"
    [ "$DRY_RUN" = false ] && echo "  • Documentation updated"
    echo "  • Future drift predicted"
    echo ""
    echo "Next steps:"
    echo "  1. Review generated reports"
    echo "  2. Run '/generatedocs' to update HTML"
    echo "  3. Schedule next audit based on prophecy"
}

# Main execution
case "$COMMAND" in
    audit)
        run_audit "$SCOPE"
        ;;
    update)
        run_update "$SCOPE"
        ;;
    prophecy)
        run_prophecy "$SCOPE"
        ;;
    full)
        run_full
        ;;
    *)
        echo "❌ Unknown command: $COMMAND"
        echo "   Use: audit, update, prophecy, or full"
        exit 1
        ;;
esac

echo ""
echo "═══════════════════════════════════════════════════"
echo "🧙‍♂️ Merlin's work is complete"
echo ""

# Exit with appropriate code for CI/CD
if [ "$CI_MODE" = true ]; then
    # Check for any critical issues in latest reports
    LATEST_AUDIT=$(ls -t MERLIN_AUDIT_*.md 2>/dev/null | head -1)
    if [ -n "$LATEST_AUDIT" ]; then
        CRITICAL_COUNT=$(grep -c "CRITICAL" "$LATEST_AUDIT" 2>/dev/null || echo "0")
        if [ "$CRITICAL_COUNT" -gt 0 ]; then
            echo "❌ CI/CD Check: FAILED (Critical documentation issues)"
            exit 1
        else
            echo "✅ CI/CD Check: PASSED"
            exit 0
        fi
    fi
fi

echo "*\"Truth is the most powerful magic, young apprentice.\"*"
exit 0