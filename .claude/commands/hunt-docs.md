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
   - **Broken internal links** - References to moved/renamed files
   - **Incorrect code examples** - Verify against actual codebase using claude-context
   - **Missing information** - Features that exist but aren't documented
   - **Inaccurate descriptions** - Claims that don't match implementation
   - **Deprecated information** - References to removed features

3. **Verify the inaccuracy:**
   - **CRITICAL**: For frontend component claims, ALWAYS check entry point first (HTML files, index.js imports) to see what's actually loaded in production
   - **Entry Point Verification Order**:
     1. Check HTML `<script>` tags or module imports to see what files load
     2. Trace method override chain if extension pattern is used (base + override)
     3. Verify active implementation against documentation claims
   - **Anti-Pattern**: Never assume commented-out code or base class methods represent active implementation without checking runtime loading
   - Use claude-context search or Read tool to verify current implementation
   - Confirm the documentation doesn't match reality
   - Research what the correct information should be
   - **Example**: If docs claim "uses AG-Grid", check the HTML file to confirm AG-Grid scripts are loaded (not just that AG-Grid code exists somewhere in the codebase)

4. **Check Memento for duplicate work:**
   - Use semantic search: `mcp__memento__semantic_search({ query: "[topic] documentation accuracy [filename]", entity_types: ["HEXTRACKR:DOCUMENTATION:ISSUE"], limit: 5 })`
   - Check for similar issues already logged
   - If duplicate found, skip to next file
   - This prevents recreating already-identified issues (e.g., version numbers, technology stack items)

5. **Create Linear issue in HexTrackr-Docs:**
   - Title: "DOCS CONTENT FIX: [brief description of inaccuracy]"
   - Include:
     - File path and line numbers
     - Current (incorrect) content
     - Verified correct information
     - Suggested fix with updated markdown
   - Labels: ["documentation", "accuracy"]
   - Priority: Low (unless critical user-facing error, then Medium)

6. **Save to Memento:**
   - Create entity:
     - Name: "Documentation Issue: [ISSUE-ID] - [brief description]"
     - Type: `HEXTRACKR:DOCUMENTATION:ISSUE`
     - Observations:
       - `TIMESTAMP: [ISO 8601 format]`
       - `ABSTRACT: [One-line summary of inaccuracy]`
       - `SUMMARY: File: [path]:[lines]. Issue: [what's wrong]. Current: [incorrect info]. Correct: [verified info]. Source: [how verified]`
       - `ISSUE_ID: [DOCS-XXX]`
       - `FILE_PATH: [full file path]`
       - `ISSUE_TYPE: content-accuracy`
     - Tags:
       - `TAG: project:hextrackr`
       - `TAG: documentation`
       - `TAG: [ISSUE-ID]`
       - `TAG: content-accuracy`
       - `TAG: week-[XX]-2025`
       - `TAG: identified`

7. **Report:**
   - Issue number and link
   - What was wrong and why it matters
   - How you verified the correct information

Only create ONE issue per hunt - focus on quality over quantity.
