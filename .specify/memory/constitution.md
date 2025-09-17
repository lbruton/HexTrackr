HexTrackr Development Constitution

Established September 16, 2025 | Version 7.1.0 (Simplified)

Core Principles
   1. Docker-First
   •  All application code and tests SHALL run inside Docker containers.
   •  Direct host execution of node, npm, or npx SHALL NOT occur.
   2. Test-First (TDD/SDD)
   •  Production code SHALL NOT be written without a failing test first.
   •  All features SHALL be verified through structured tests before merge.
   3. Context Accuracy
   •  Work SHALL NOT begin until relevant context is gathered and confirmed accurate.
   •  Context sources include Memento history, branch status, and framework docs.
   4. Memory Governance
   •  Significant sessions SHALL be recorded to Memento.
   •  Summaries and outcomes SHALL be stored for future recall.
   5. Framework Documentation
   •  Context7 SHALL be used to fetch and store authoritative framework documentation.
   •  Developers SHALL NOT proceed using stale or unverified references.
   6. Spec-Kit Workflow
   •  All new features SHALL follow the /specify → /plan → /tasks workflow.
   •  No implementation SHALL begin without a written specification.
   7. Branch Discipline
   •  Work SHALL occur only on feature or copilot branches.
   •  Direct commits to main SHALL NOT occur.

⸻

Bill of Rights (Non-Negotiables)
   1. Right to Context – Code SHALL NOT be suggested without full context.
   2. Right to Testing – No untested code SHALL exist in the project.
   3. Right to Memory – All sessions SHALL be preserved in Memento.
   4. Right to Rollback – All operations SHALL be reversible.
   5. Right to Review – Significant changes SHALL require explicit approval.