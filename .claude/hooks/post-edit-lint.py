#!/usr/bin/env python3
"""Post-edit lint hook for Claude Code (DEVS-90).

Reads the PostToolUse payload from stdin and lints the edited file:
- .js: node --check, then ESLint
- .css: stylelint
- .md: markdownlint (markdownlint-cli, same config and ignore file as lint:md)

Claude Code drops plain stdout from PostToolUse hooks, so findings are
emitted as hookSpecificOutput.additionalContext JSON. Clean edits and files
outside the repo print nothing. Always exits 0 (non-blocking).

Also accepts Codex apply_patch payloads (patch text in tool_input.command)
so the same script can back a .codex/hooks.json if one is added.
"""

import json
import os
import re
import subprocess
import sys

# .claude/hooks/post-edit-lint.py -> repo root, so worktrees lint their own tree
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))
TIMEOUT = 15
MAX_LINES = 10

PATCH_PATH_RE = re.compile(r"^\*\*\* (?:Add File|Update File|Move to): (.+)$")


def run_cmd(args, timeout=TIMEOUT):
    """Run a command from the repo root. Returns (returncode, output); never raises."""
    try:
        result = subprocess.run(
            args,
            capture_output=True,
            text=True,
            cwd=PROJECT_ROOT,
            timeout=timeout,
        )
        return result.returncode, (result.stdout + result.stderr).strip()
    except (subprocess.TimeoutExpired, OSError):
        return 0, ""


def truncate(text, max_lines=MAX_LINES):
    """Limit output to max_lines."""
    lines = text.splitlines()
    if len(lines) > max_lines:
        return "\n".join(lines[:max_lines]) + f"\n... ({len(lines) - max_lines} more lines)"
    return text


def edited_files(tool_name, tool_input, cwd):
    """Absolute paths of the files the tool call wrote."""
    if tool_name in ("Edit", "Write", "MultiEdit"):
        path = tool_input.get("file_path", "")
        return [path] if path else []
    if tool_name == "apply_patch":
        lines = str(tool_input.get("command", "")).splitlines()
        paths = []
        for i, line in enumerate(lines):
            m = PATCH_PATH_RE.match(line)
            if not m:
                continue
            # An Update followed by Move to only exists at the destination
            if line.startswith("*** Update File:") and i + 1 < len(lines) and lines[i + 1].startswith("*** Move to:"):
                continue
            paths.append(os.path.join(cwd, m.group(1).strip()))
        return paths
    return []


def in_repo(path):
    return os.path.realpath(path).startswith(PROJECT_ROOT + os.sep)


def lint_file(file_path):
    """Return a list of findings for one file."""
    rel = os.path.relpath(os.path.realpath(file_path), PROJECT_ROOT)
    ext = os.path.splitext(file_path)[1].lower()
    findings = []

    if ext == ".js":
        rc, output = run_cmd(["node", "--check", file_path])
        if rc != 0:
            findings.append(f"syntax error ({rel}):\n{truncate(output)}")
        else:
            rc, output = run_cmd([
                "npx", "--no-install", "eslint",
                "--no-warn-ignored",
                "--config", "eslint.config.mjs",
                rel,
            ])
            if rc != 0 and output:
                findings.append(f"eslint ({rel}):\n{truncate(output)}")

    elif ext == ".css":
        rc, output = run_cmd(["npx", "--no-install", "stylelint", rel])
        if rc != 0 and output:
            findings.append(f"stylelint ({rel}):\n{truncate(output)}")

    elif ext == ".md":
        rc, output = run_cmd([
            "npx", "--no-install", "markdownlint",
            "--config", ".markdownlint.json",
            "--ignore-path", ".markdownlintignore",
            rel,
        ])
        if rc != 0 and output:
            findings.append(f"markdownlint ({rel}):\n{truncate(output)}")

    return findings


def main():
    try:
        data = json.loads(sys.stdin.read())
    except (json.JSONDecodeError, ValueError):
        return
    if not isinstance(data, dict):
        return

    tool_input = data.get("tool_input") or {}
    cwd = data.get("cwd") or os.getcwd()
    findings = []
    for path in dict.fromkeys(edited_files(data.get("tool_name", ""), tool_input, cwd)):
        if os.path.isfile(path) and in_repo(path):
            findings.extend(lint_file(path))

    if findings:
        print(json.dumps({
            "hookSpecificOutput": {
                "hookEventName": "PostToolUse",
                "additionalContext": "[lint] " + "\n[lint] ".join(findings),
            }
        }))


if __name__ == "__main__":
    main()
    sys.exit(0)
