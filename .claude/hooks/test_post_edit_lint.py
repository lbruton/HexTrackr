#!/usr/bin/env python3
"""Contract tests for post-edit-lint.py (DEVS-90).

Run: python3 -m unittest discover -s .claude/hooks -p 'test_*.py'

Claude Code drops plain stdout from PostToolUse hooks, so findings must come
back as hookSpecificOutput.additionalContext JSON, and clean edits must print
nothing. Scratch files go in a temp dir inside the repo, because the hook
skips files outside the repo root.
"""

import json
import os
import shutil
import subprocess
import tempfile
import unittest

HOOK = os.path.join(os.path.dirname(os.path.realpath(__file__)), "post-edit-lint.py")
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))


def run_hook(payload, raw=None):
    res = subprocess.run(
        ["python3", HOOK],
        input=raw if raw is not None else json.dumps(payload),
        capture_output=True,
        text=True,
        cwd=ROOT,
        timeout=90,
    )
    assert res.returncode == 0, f"hook exited {res.returncode}: {res.stderr}"
    return res.stdout.strip()


def context_of(stdout):
    assert stdout, "expected JSON output, got nothing"
    out = json.loads(stdout)["hookSpecificOutput"]
    assert out["hookEventName"] == "PostToolUse"
    return out["additionalContext"]


class PostEditLintTest(unittest.TestCase):
    def setUp(self):
        # Not a dot-dir or tmp/: .markdownlintignore excludes both
        self.dir = tempfile.mkdtemp(prefix="hooktest-scratch-", dir=ROOT)

    def tearDown(self):
        shutil.rmtree(self.dir, ignore_errors=True)

    def scratch(self, name, body):
        path = os.path.join(self.dir, name)
        with open(path, "w") as f:
            f.write(body)
        return path

    def edit(self, path, tool="Edit"):
        return run_hook({"tool_name": tool, "tool_input": {"file_path": path}})

    def test_markdown_violation_is_reported(self):
        ctx = context_of(self.edit(self.scratch("bad.md", "#  Heading with two spaces\n")))
        self.assertRegex(ctx, r"MD\d{3}")

    def test_clean_markdown_is_silent(self):
        self.assertEqual(self.edit(self.scratch("clean.md", "# Clean heading\n\nSome text.\n"), "Write"), "")

    def test_markdownlintignore_is_respected(self):
        hidden = os.path.join(self.dir, ".hidden")
        os.makedirs(hidden)
        path = os.path.join(hidden, "bad.md")
        with open(path, "w") as f:
            f.write("#  Heading with two spaces\n")
        self.assertEqual(self.edit(path), "")

    def test_js_syntax_error_is_reported(self):
        ctx = context_of(self.edit(self.scratch("broken.js", "const = ;\n")))
        self.assertIn("syntax error", ctx)

    def test_css_violation_is_reported(self):
        ctx = context_of(self.edit(self.scratch("bad.css", "a {\n  color: #fff;\n}\n")))
        self.assertIn("stylelint", ctx)

    def test_file_outside_repo_is_skipped(self):
        outside = tempfile.mkdtemp(prefix="hooktest-outside-")
        try:
            path = os.path.join(outside, "bad.md")
            with open(path, "w") as f:
                f.write("#  Heading with two spaces\n")
            self.assertEqual(self.edit(path), "")
        finally:
            shutil.rmtree(outside, ignore_errors=True)

    def test_unrelated_tool_and_malformed_payload_are_silent(self):
        self.assertEqual(run_hook({"tool_name": "Bash", "tool_input": {"command": "ls"}}), "")
        self.assertEqual(run_hook(None, raw="not json"), "")


if __name__ == "__main__":
    unittest.main()
