# HexTrackr Constitution

## Core Principles

### I. Context-First Development
Every work session begins with context gathering through the prime command. We check Context Bundles for tactical details (files touched, commands run), then search Memento for strategic context (decisions made, patterns established). This prevents the meta pain point of "implementing features without understanding existing context" - we look first, understand second, act third.

### II. S-R-P-T Methodology (Specification-Research-Planning-Task)
All feature development follows our four-phase workflow. Specification defines WHAT and WHY with clear requirements. Research validates assumptions through multi-agent analysis. Planning synthesizes findings into technical implementation. Tasks execute with complete context. No guessing games - requirements drive everything.

### III. Three-Tier Memory Architecture
We maintain institutional knowledge through: Context Bundles (automatic tactical logging, 7-day retention), Memento (curated strategic knowledge, permanent), and Claude JSONL (complete archive). Every session builds on the last through enforced memory searches, preventing "learning the same lessons twice."

### IV. Security-First Operations
All file operations use PathValidator validation. Docker-only deployment ensures consistent environments. We follow the principle of least privilege and validate all user inputs. Security is not optional - it's foundational to every operation.

### V. Monolithic Simplicity with Modular Organization
Backend remains intentionally monolithic (server.js) for simplicity while frontend follows modular architecture (shared/pages/utils). We start simple and refactor only when complexity demands it. YAGNI principles guide architectural decisions.

## Development Workflow

### Sequential Thinking for Complex Tasks
When facing complexity, we break down problems using Sequential Thinking tools for powerful reasoning capabilities. Complex tasks get systematic analysis, not quick assumptions.

### Semantic Search Efficiency
Memento searches prioritize semantic mode (3.5KB) over keyword mode (20KB) for 5-10x faster context retrieval. Include timestamps and dates for precise session recovery.

### Test-First When Critical
While not mandatory for all changes, critical functionality requires test coverage. Playwright tests for UI, integration tests for APIs, validation for data integrity.

## Quality Standards

### Code Style Enforcement
- Double quotes for strings
- Semicolons always required
- const by default, let when needed, never var
- Strict equality (===, !==) always
- kebab-case for files, PascalCase for classes, camelCase for functions

### Documentation Requirements
- S-R-P-T documents for all major features
- CHANGELOG.md updates for user-facing changes
- Inline comments only when logic is non-obvious
- README updates for new dependencies or setup changes

### Git Workflow
- Descriptive commit messages focusing on "why" not "what"
- Branch from main for features
- Docker restart before Playwright tests
- Linting before commits

## Operational Constraints

### Technology Boundaries
- Docker-only deployment (no local Node.js execution)
- SQLite database (no external database dependencies)
- Vanilla JavaScript frontend (no framework dependencies)
- Port 8989 external → 8080 internal mapping

### Performance Standards
- Page load under 2 seconds
- Table rendering under 500ms
- CSV import ~1000 rows/second
- No memory leaks in continuous operation

## Governance

### Constitutional Authority
This constitution supersedes all other practices and conventions. CLAUDE.md provides runtime guidance within constitutional bounds. Amendments require documented rationale and migration plan.

### Compliance Verification
- All implementations must align with S-R-P-T methodology
- Context gathering (prime) is mandatory for work sessions
- Security validations cannot be bypassed
- Complexity must be justified by user needs

### Amendment Process
Constitutional changes require:
1. Specification document outlining the change
2. Research validating the need
3. Planning for migration
4. User approval before implementation

**Version**: 1.0.0 | **Ratified**: 2025-09-16 | **Last Amended**: N/A