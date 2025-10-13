---
type: research
issue_id: "HEX-XXX"         # parent issue
title: "RESEARCH: <short name>"
status: draft               # draft → ready
owner: "<your name>"
created: "2025-10-08"
reviewers: []
related_issues: []
mcp_tools: [linear, memento, codebase, context7]
affected_modules: []
risk_level: low             # low | medium | high
db_touch: false             # true if schema/data touched
ui_touch: false             # true if UI/UX changes expected
outputs: ["Current State Summary", "Change Proposal", "Risk Assessment", "References"]
---

# Objective
One paragraph describing **why** we’re considering this change and the expected outcome.

# Current State (from code + memory)
Summarize the present behavior and structure. Focus on entry points, public APIs, data flow, and storage.
- **Entrypoints/Endpoints**: …
- **Key classes/modules**: …
- **Data model**: …
- **Feature flags/config**: …

> Auto‑Action (Agent): Use Codebase MCP (semantic+AST) to list impacted files, functions, and APIs. Cross‑check with Memento memory for historical decisions.

# Standards & Constraints (Context7 snapshot)
- Framework/library versions in use: …
- Relevant official guidelines or best practices: …
- Security/Privacy constraints: …
- Performance targets (latency, throughput), SLOs: …

> Auto‑Action (Agent): Fetch and cite relevant Context7 docs (URLs/versions). Attach short notes on how each applies.

# Proposed Change
- **What** will change: …
- **Why** it matters: …
- **Non‑goals**: …

# Impact Analysis
- **UI/UX**: screens & flows impacted; accessibility implications
- **Database/Storage**: migrations, data integrity, backup/rollback considerations
- **Security/Privacy**: auth, authz, secrets, logging/PII
- **Performance**: expected impact, safeguards
- **Ops/Telemetry**: logs/metrics/traces to add, dashboards/alerts

# Risks & Safeguards
- Top risks (e.g., DB corruption, data loss, outage, UX regressions)
- Safeguards: feature flag, canary, backup/restore plan, error budgets

# Tooling & MCP Usage
- Linear: parent/child issue linkage plan
- Memento (Neo4j): nodes/relations to read/write
- Codebase MCP: where to generate maps & impact lists
- Context7: doc sets to snapshot

# References
- Links to prior PRs/designs/issues
- Context7 pages, internal docs

---

## Readiness Gate (must be **all** ✅ before planning)
- [ ] Current state is documented with **impacted files/functions list** (from Codebase MCP)
- [ ] Context7 standards **reviewed and noted** with applicability
- [ ] Risks & rollback strategy are **outlined**
- [ ] Affected modules **enumerated**; unknowns called out
- [ ] Open questions list is **empty** or explicitly deferred

## Auto‑Quiz (Agent → ask me; block planning until answered)
1. What are the **acceptance criteria** (observable, testable)?
2. What **won’t** we change (non‑goals, protected areas)?
3. Any **data migrations**? Size, downtime tolerance, backfill strategy?
4. What are the **security/privacy** concerns? Any secrets/keys involved?
5. What are the **UX success criteria** (A11y, responsive behavior, empty/error states)?
6. What’s the **rollback** trigger and exact steps?
7. What **environments** are in scope (dev/stage/prod)?
8. What **telemetry** do we need for validation?

*When Readiness Gate is ✅, create `PLAN:` child issue and start the Plan.*
