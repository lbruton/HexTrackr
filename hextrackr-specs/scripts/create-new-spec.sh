#!/usr/bin/env bash
# Create a new specification directory with template (no branch creation)
# Usage: ./create-new-spec.sh "feature description"
#        ./create-new-spec.sh --json "feature description"

set -e

JSON_MODE=false

# Collect non-flag args
ARGS=()
for arg in "$@"; do
    case "$arg" in
        --json)
            JSON_MODE=true
            ;;
        --help|-h)
            echo "Usage: $0 [--json] <feature_description>"; exit 0 ;;
        *)
            ARGS+=("$arg") ;;
    esac
done

FEATURE_DESCRIPTION="${ARGS[*]}"
if [ -z "$FEATURE_DESCRIPTION" ]; then
        echo "Usage: $0 [--json] <feature_description>" >&2
        exit 1
fi

# Get repository root
REPO_ROOT=$(git rev-parse --show-toplevel)
SPECS_DIR="$REPO_ROOT/hextrackr-specs/specs"

# Create specs directory if it doesn't exist
mkdir -p "$SPECS_DIR"

# Find the highest numbered feature directory
HIGHEST=0
if [ -d "$SPECS_DIR" ]; then
    for dir in "$SPECS_DIR"/*; do
        if [ -d "$dir" ]; then
            dirname=$(basename "$dir")
            number=$(echo "$dirname" | grep -o '^[0-9]\+' || echo "0")
            number=$((10#$number))
            if [ "$number" -gt "$HIGHEST" ]; then
                HIGHEST=$number
            fi
        fi
    done
fi

# Generate next feature number with zero padding
NEXT=$((HIGHEST + 1))
FEATURE_NUM=$(printf "%03d" "$NEXT")

# Create branch name from description
BRANCH_NAME=$(echo "$FEATURE_DESCRIPTION" | \
    tr '[:upper:]' '[:lower:]' | \
    sed 's/[^a-z0-9]/-/g' | \
    sed 's/-\+/-/g' | \
    sed 's/^-//' | \
    sed 's/-$//')

# Extract 2-3 meaningful words
WORDS=$(echo "$BRANCH_NAME" | tr '-' '\n' | grep -v '^$' | head -3 | tr '\n' '-' | sed 's/-$//')

# Spec directory name (no branch creation)
SPEC_NAME="${FEATURE_NUM}-${WORDS}"

# Create spec directory
SPEC_DIR="$SPECS_DIR/$SPEC_NAME"
mkdir -p "$SPEC_DIR"

# Copy template if it exists
TEMPLATE="$REPO_ROOT/hextrackr-specs/templates/spec-template.md"
SPEC_FILE="$SPEC_DIR/spec.md"

if [ -f "$TEMPLATE" ]; then
    cp "$TEMPLATE" "$SPEC_FILE"
else
    echo "Warning: Template not found at $TEMPLATE" >&2
    touch "$SPEC_FILE"
fi

# Source common functions to set active spec
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Set this as the active spec
set_active_spec "$REPO_ROOT" "$SPEC_NAME"

if $JSON_MODE; then
    printf '{"SPEC_NAME":"%s","SPEC_FILE":"%s","FEATURE_NUM":"%s","SPEC_DIR":"%s"}\n' \
        "$SPEC_NAME" "$SPEC_FILE" "$FEATURE_NUM" "$SPEC_DIR"
else
    # Output results for the LLM to use (legacy key: value format)
    echo "SPEC_NAME: $SPEC_NAME"
    echo "SPEC_FILE: $SPEC_FILE"
    echo "FEATURE_NUM: $FEATURE_NUM"
    echo "SPEC_DIR: $SPEC_DIR"
    echo ""
    echo "Active spec set to: $SPEC_NAME"
fi