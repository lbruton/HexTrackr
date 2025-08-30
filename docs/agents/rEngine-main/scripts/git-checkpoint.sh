#!/bin/bash
set -euo pipefail
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

# Standardized git checkpoint
TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
MSG="Checkpoint: ${TS} (${BRANCH})"

# Stage everything, but do not fail if nothing to commit
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not a git repository: $REPO_DIR" >&2
  exit 1
fi

git add -A || true
if git diff --cached --quiet; then
  echo "No changes to checkpoint. Working tree clean."
  exit 0
fi

git commit -m "$MSG"
echo "✅ Git checkpoint created: $MSG"
