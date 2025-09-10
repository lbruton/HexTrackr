#!/usr/bin/env bash
# Check that implementation plan exists and find optional design documents
# Usage: ./check-task-prerequisites.sh [spec-name-or-number] [--json]
#        ./check-task-prerequisites.sh 023 --json
#        ./check-task-prerequisites.sh --json  (uses active spec)

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

# Check if spec directory exists
if [[ ! -d "$SPEC_DIR" ]]; then
    echo "ERROR: Spec directory not found: $SPEC_DIR"
    echo "Available specs:" >&2
    list_specs "$REPO_ROOT" >&2
    exit 1
fi

# Check for implementation plan (required)
if [[ ! -f "$IMPL_PLAN" ]]; then
    echo "ERROR: plan.md not found in $SPEC_DIR"
    echo "Run /plan first to create the plan."
    exit 1
fi

if $JSON_MODE; then
    # Build JSON array of available docs that actually exist
    docs=()
    [[ -f "$RESEARCH" ]] && docs+=("research.md")
    [[ -f "$DATA_MODEL" ]] && docs+=("data-model.md")
    ([[ -d "$CONTRACTS_DIR" ]] && [[ -n "$(ls -A "$CONTRACTS_DIR" 2>/dev/null)" ]]) && docs+=("contracts/")
    [[ -f "$QUICKSTART" ]] && docs+=("quickstart.md")
    # join array into JSON
    json_docs=$(printf '"%s",' "${docs[@]}")
    json_docs="[${json_docs%,}]"
    printf '{"SPEC_NAME":"%s","SPEC_DIR":"%s","AVAILABLE_DOCS":%s}\n' "$SPEC_NAME" "$SPEC_DIR" "$json_docs"
else
    # List available design documents (optional)
    echo "SPEC_NAME: $SPEC_NAME"
    echo "SPEC_DIR: $SPEC_DIR"
    echo "AVAILABLE_DOCS:"

    # Use common check functions
    check_file "$RESEARCH" "research.md"
    check_file "$DATA_MODEL" "data-model.md"
    check_dir "$CONTRACTS_DIR" "contracts/"
    check_file "$QUICKSTART" "quickstart.md"
fi

# Always succeed - task generation should work with whatever docs are available