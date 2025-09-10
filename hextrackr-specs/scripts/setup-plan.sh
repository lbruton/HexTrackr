#!/usr/bin/env bash
# Setup implementation plan structure for a specific spec
# Returns paths needed for implementation plan generation
# Usage: ./setup-plan.sh [spec-name-or-number] [--json]
#        ./setup-plan.sh 023 --json
#        ./setup-plan.sh 023-enhance-vulnerability --json
#        ./setup-plan.sh --json  (uses active spec)

set -e

# Parse arguments
SPEC_ARG=""
JSON_MODE=false

for arg in "$@"; do
    case "$arg" in
        --json) 
            JSON_MODE=true 
            ;;
        --help|-h) 
            echo "Usage: $0 [spec-name-or-number] [--json]"
            echo "  spec-name-or-number: e.g., '023' or '023-enhance-vulnerability'"
            echo "  --json: Output in JSON format"
            echo ""
            echo "If no spec is provided, uses the active spec from .active-spec"
            exit 0 
            ;;
        *)
            SPEC_ARG="$arg" 
            ;;
    esac
done

# Source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Get repository root
REPO_ROOT=$(get_repo_root)

# Get spec paths (handles spec number or name)
if ! eval $(get_spec_paths "$SPEC_ARG"); then
    exit 1
fi

# Verify spec exists
if ! spec_exists "$REPO_ROOT" "$SPEC_NAME"; then
    echo "ERROR: Spec '$SPEC_NAME' does not exist" >&2
    echo "Available specs:" >&2
    list_specs "$REPO_ROOT" >&2
    exit 1
fi

# Set as active spec
set_active_spec "$REPO_ROOT" "$SPEC_NAME"

# Create specs directory if it doesn't exist (shouldn't be needed but safety)
mkdir -p "$SPEC_DIR"

# Copy plan template if it doesn't exist yet
TEMPLATE="$REPO_ROOT/hextrackr-specs/templates/plan-template.md"
if [[ ! -f "$IMPL_PLAN" ]] && [[ -f "$TEMPLATE" ]]; then
    cp "$TEMPLATE" "$IMPL_PLAN"
    echo "Plan template copied to $IMPL_PLAN" >&2
fi

# Check what documents already exist
if ! $JSON_MODE; then
    echo "" >&2
    check_spec_documents "$SPEC_DIR" >&2
    echo "" >&2
fi

if $JSON_MODE; then
    printf '{"SPEC_NAME":"%s","SPEC_NUM":"%s","FEATURE_SPEC":"%s","IMPL_PLAN":"%s","SPEC_DIR":"%s","BRANCH":"%s"}\n' \
        "$SPEC_NAME" "$SPEC_NUM" "$FEATURE_SPEC" "$IMPL_PLAN" "$SPEC_DIR" "$CURRENT_BRANCH"
else
    # Output all paths for LLM use
    echo "SPEC_NAME: $SPEC_NAME"
    echo "SPEC_NUM: $SPEC_NUM"
    echo "FEATURE_SPEC: $FEATURE_SPEC"
    echo "IMPL_PLAN: $IMPL_PLAN"
    echo "SPEC_DIR: $SPEC_DIR"
    echo "BRANCH: $CURRENT_BRANCH"
    echo ""
    echo "Active spec set to: $SPEC_NAME"
fi