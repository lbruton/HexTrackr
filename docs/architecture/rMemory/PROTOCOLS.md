
# Memory MCP – Protocols

## Examples

### backup-before-write

- Before `writeFile` → run `git commit` and `git tag backup/<timestamp>`.

### plan-before-expensive

- Before `writeFile`, `scribeReport` → ensure plan exists for topic_key.
- If missing, auto-generate plan and save.

### summarize-on-commit

- After commit, run reconcile on affected topic.

### limit-hourly-ingest

- Cap evidence/todos per hour.
- Reject or queue excess.

### guard-dup-summaries

- Compute simhash on new summaries.
- Block near-duplicates.
