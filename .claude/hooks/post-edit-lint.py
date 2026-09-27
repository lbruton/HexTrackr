#!/usr/bin/env python3
"""Post-edit lint hook for Claude Code.

Reads tool invocation JSON from stdin and runs the appropriate linter
for the edited file. Non-blocking (always exits 0).
"""

import json
import os
import subprocess
import sys

PROJECT_ROOT = "/Volumes/DATA/GitHub/HexTrackr"
TIMEOUT = 15
MAX_LINES = 10


def run_cmd(args):
    """Run a command, return (returncode, output) with timeout."""
    try:
        result = subprocess.run(
            args,
            capture_output=True,
            text=True,
            cwd=PROJECT_ROOT,
            timeout=TIMEOUT,
        )
        output = (result.stdout + result.stderr).strip()
        return result.returncode, output
    except subprocess.TimeoutExpired:
        return 1, f"Command timed out after {TIMEOUT}s: {' '.join(args)}"
    except Exception as e:
        return 1, str(e)


def truncate(text, max_lines=MAX_LINES):
    """Limit output to max_lines."""
    lines = text.splitlines()
    if len(lines) > max_lines:
        return "\n".join(lines[:max_lines]) + f"\n... ({len(lines) - max_lines} more lines)"
    return text


def main():
    try:
        data = json.load(sys.stdin)
    except (json.JSONDecodeError, EOFError):
        return

    tool_name = data.get("tool_name", "")
    if tool_name not in ("Edit", "Write"):
        return

    tool_input = data.get("tool_input", {})
    file_path = tool_input.get("file_path", "")
    if not file_path or not os.path.isfile(file_path):
        return

    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".js":
        # Syntax check first
        rc, output = run_cmd(["node", "--check", file_path])
        if rc != 0:
            print(f"[lint] syntax error:\n{truncate(output)}")
            return

        # ESLint
        rc, output = run_cmd([
            "npx", "eslint",
            "--no-warn-ignored",
            "--config", "eslint.config.mjs",
            file_path,
        ])
        if rc != 0 and output:
            print(f"[lint] eslint:\n{truncate(output)}")

    elif ext == ".css":
        rc, output = run_cmd(["npx", "stylelint", file_path])
        if rc != 0 and output:
            print(f"[lint] stylelint:\n{truncate(output)}")

    elif ext == ".md":
        rc, output = run_cmd([
            "npx", "markdownlint",
            "--config", ".markdownlint.json",
            file_path,
        ])
        if rc != 0 and output:
            print(f"[lint] markdownlint:\n{truncate(output)}")


if __name__ == "__main__":
    main()
    sys.exit(0)
