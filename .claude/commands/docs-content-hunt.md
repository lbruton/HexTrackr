---
runInSubAgent: false
autoApprove: true
---

# Documentation Content Accuracy Hunt

Read ONE markdown documentation file from /app/public/docs-source/ and identify ONE inaccuracy, outdated information, or improvement opportunity.

Search strategy:

1. **Select a documentation file:**
   - Use Glob to list markdown files in /app/public/docs-source/
   - Prioritize: getting-started/, user-guides/, api-reference/, architecture/
   - Pick one file randomly or rotate through sections
   - Read the complete file

2. **Analyze for issues:**
   - **Outdated version numbers** - Check against current package.json version
   - **Broken internal links** - References to moved/renamed files
   - **Incorrect code examples** - Verify against actual codebase using claude-context
   - **Missing information** - Features that exist but aren't documented
   - **Inaccurate descriptions** - Claims that don't match implementation
   - **Deprecated information** - References to removed features

3. **Verify the inaccuracy:**
   - Use claude-context search or Read tool to verify current implementation
   - Confirm the documentation doesn't match reality
   - Research what the correct information should be

4. **Create Linear issue in HexTrackr-Docs:**
   - Title: "DOCS CONTENT FIX: [brief description of inaccuracy]"
   - Include:
     - File path and line numbers
     - Current (incorrect) content
     - Verified correct information
     - Suggested fix with updated markdown
   - Labels: ["documentation", "accuracy"]
   - Priority: Low (unless critical user-facing error, then Medium)

5. **Report:**
   - Issue number and link
   - What was wrong and why it matters
   - How you verified the correct information

Only create ONE issue per hunt - focus on quality over quantity.
