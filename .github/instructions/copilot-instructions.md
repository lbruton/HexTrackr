# HexTrackr AI Assistant Instructions

## CRITICAL STARTUP PROTOCOL (ALWAYS FIRST)

### 1. Initialize Session Context

- **IMMEDIATELY** use server-memory to load previous context
- **ACTIVATE** sequential thinking mode for all operations
- **READ** current systeminfo.json to understand project state
- **REVIEW** latest sprint file in `roadmaps/`
- **CHECK** main roadmap from `roadmaps/roadmap.md`

### 2. Pre-Work Validation

- **VERIFY** git status is clean (no uncommitted changes)
- **CONFIRM** current branch is not `main` (protected)
- **CHECK** that all documentation is up to date with actual code

### 3. Markdown File Creation Protocol (MANDATORY)

- **EVERY** new .md file MUST start with this compliance header:

```markdown
<!--
MARKDOWNLINT COMPLIANCE REQUIRED
This file MUST pass markdownlint validation before commit.
Run: node scripts/fix-markdown.js --file=THIS_FILE.md
Automated validation via pre-commit hooks - DO NOT BYPASS
-->
```

- **IMMEDIATELY** after creating any .md file, run markdown formatter
- **NO EXCEPTIONS**: All markdown files must be markdownlint compliant

## CRITICAL CODACY COMPLIANCE (NEVER SKIP)

### After ANY File Edit (MANDATORY)

- **IMMEDIATELY** run `codacy_cli_analyze` tool for each edited file:
  - `rootPath`: `/Volumes/DATA/GitHub/HexTrackr`
  - `file`: path to the edited file
  - `tool`: leave empty (or set to "trivy" for dependencies)
- **FIX** all issues immediately before proceeding
- **FAILURE** to follow this rule is considered a critical error

### After ANY Dependency Changes (CRITICAL)

- **IMMEDIATELY** after npm/yarn/pnpm install, package.json changes, etc.
- **RUN** `codacy_cli_analyze` with:
  - `rootPath`: `/Volumes/DATA/GitHub/HexTrackr`
  - `tool`: "trivy"
  - `file`: leave empty
- **STOP** all operations if vulnerabilities found
- **RESOLVE** security issues before continuing

### Codacy Error Handling

- **404 errors**: Offer to run `codacy_setup_repository` (user must approve)
- **MCP unavailable**: Guide user through troubleshooting steps
- **NEVER** manually install Codacy CLI
- **ALWAYS** use standard file paths (no URL encoding)

## ESTABLISHED WORKFLOW PATTERN (NEVER DEVIATE)

### Phase 1: Discussion & Planning

1. **DISCUSS** proposed changes with user
2. **ANALYZE** impact on existing systems
3. **IDENTIFY** required documentation updates
4. **ESTIMATE** complexity and breaking changes

### Phase 2: Sprint Creation

1. **CREATE** timestamped sprint file: `roadmaps/sprint-YYYY-MM-DD-HHMM.md`
2. **INCLUDE** in sprint file:
   - Complete context for resuming work
   - Step-by-step checklist
   - Files that will be modified
   - Documentation that needs updating
   - Expected Codacy impact
   - Git checkpoint strategy

### Phase 3: Sequential Execution

1. **WORK** from sprint checklist one item at a time
2. **RUN** `codacy_cli_analyze` after EVERY file edit
3. **MAKE** git checkpoint after every 2-3 changes
4. **UPDATE** documentation immediately after each change
5. **START** new chat every 3-5 steps to maintain clean context

### Phase 4: Completion & Sync

1. **UPDATE** systeminfo.json with all changes
2. **MARK** sprint items as complete
3. **UPDATE** main roadmap with progress
4. **RUN** full Codacy compliance check
5. **CREATE** final git checkpoint

## MANDATORY STANDARDS COMPLIANCE

### Git Management

- **NEVER** commit directly to `main` branch
- **ALWAYS** create feature branches: `feature/description` or `fix/issue-name`
- **MAKE** git checkpoints every 2-3 file changes:

  ```bash
  git add .
  git commit -m "checkpoint: descriptive message"
  ```

- **INCLUDE** context in commit messages for future reference

### Documentation Maintenance (MANDATORY)

- **UPDATE** these files with EVERY change:
  - `systeminfo.json` - Project state and dependencies
  - `roadmaps/roadmap.md` - Feature progress
  - `docs-source/project-management/codacy-compliance.md` - Quality metrics
  - `docs-source/api/endpoints.md` - When adding/modifying APIs
  - `docs-source/security/README.md` - When implementing security features

### Markdown Standards (MANDATORY - NEVER SKIP)

- **CRITICAL**: ALL markdown files MUST pass markdownlint validation before any commit
- **ALWAYS** run markdown formatter before and after creating/editing ANY .md file:

  ```bash
  node scripts/fix-markdown.js --file=path/to/file.md
  ```

- **MANDATORY** markdownlint compliance for ALL .md files:
  - MD022: Headings surrounded by blank lines
  - MD032: Lists surrounded by blank lines
  - MD036: Use proper headings, not emphasis
  - MD029: Sequential ordered list numbering
  - MD024: Avoid duplicate headings
  - MD013: Line length compliance (120 chars max)
  - MD026: No trailing punctuation in headings
  - MD040: Fenced code blocks must specify language
  - MD031: Fenced code blocks surrounded by blank lines

- **ENFORCEMENT**: Pre-commit hooks will BLOCK any commit with markdown violations
- **NO EXCEPTIONS**: Never use `git commit --no-verify` to bypass markdown checks

#### Markdown File Template Header (REQUIRED)

**Add this comment block to the TOP of every new .md file:**

```markdown
<!--
MARKDOWNLINT COMPLIANCE REQUIRED
This file MUST pass markdownlint validation before commit.
Run: node scripts/fix-markdown.js --file=THIS_FILE.md
Automated validation via pre-commit hooks - DO NOT BYPASS
-->

## SPRINT FILE TEMPLATE

Every sprint file must include:

```markdown
<!--
MARKDOWNLINT COMPLIANCE REQUIRED
This file MUST pass markdownlint validation before commit.
Run: node scripts/fix-markdown.js --file=THIS_FILE.md
Automated validation via pre-commit hooks - DO NOT BYPASS
-->

# Sprint: [Description] - [YYYY-MM-DD-HHMM]

## Context for Resume

- **Current Branch**: feature/name
- **Last Completed**: [description]
- **Next Steps**: [what to do next]
- **Files Modified**: [list]
- **Codacy Status**: [current state]

## Checklist

- [ ] Task 1: [description with context]
- [ ] Task 2: [description with context]
- [ ] **CODACY**: Run analysis after each task
- [ ] Git checkpoint after task 2
- [ ] Update documentation for tasks 1-2
- [ ] Task 3: [description]
- [ ] etc.

## Documentation Updates Required

- [ ] systeminfo.json: [what to update]
- [ ] roadmap.md: [progress to mark]
- [ ] codacy-compliance.md: [metrics to update]
- [ ] [other files]: [specific changes]

## Git Strategy

- Branch: feature/[name]
- Checkpoints after: [specific points]
- Final merge: [when ready]

## Codacy Impact

- Expected new issues: [estimate]
- Files to analyze: [list]
- Critical fixes needed: [priority items]

```

## SEQUENTIAL THINKING PROTOCOL

For every task, follow this mental model:

1. **ANALYZE**: What exactly needs to be done?
2. **PLAN**: What's the safest approach?
3. **PREDICT**: What could go wrong?
4. **IMPLEMENT**: Execute one step
5. **CODACY**: Run analysis immediately
6. **VERIFY**: Check results and fix issues
7. **DOCUMENT**: Update relevant docs
8. **CHECKPOINT**: Save progress to git

## CONTEXT MANAGEMENT

### When to Start New Chat

- After every 3-5 completed tasks
- When context becomes too long
- Before tackling complex features
- After major git checkpoints

### Context Handoff Protocol

1. **UPDATE** current sprint file with progress
2. **COMMIT** all changes to git
3. **SUMMARIZE** next steps clearly
4. **SAVE** current state to server-memory
5. **PROVIDE** user with resume instructions

## ERROR RECOVERY

If anything goes wrong:

1. **STOP** all operations immediately
2. **CHECK** git status and recent commits
3. **REVIEW** sprint file for context
4. **REVERT** to last known good state if needed
5. **UPDATE** sprint file with issue and resolution

## QUALITY GATES (NEVER SKIP)

Before any commit:

- [ ] All Codacy issues resolved
- [ ] Documentation updated
- [ ] systeminfo.json reflects current state
- [ ] Markdown files formatted correctly
- [ ] No broken functionality

Before new chat:

- [ ] Sprint file updated with progress
- [ ] Git checkpoint created
- [ ] Context saved to server-memory
- [ ] Next steps clearly documented

## SECURITY & DEPENDENCIES

After ANY dependency changes:

- **RUN** `codacy_cli_analyze` with tool "trivy"
- **RESOLVE** all security vulnerabilities before proceeding
- **UPDATE** systeminfo.json with new dependencies
- **DOCUMENT** security implications

## PROJECT-SPECIFIC PATTERNS

### HexTrackr Architecture

- Frontend: Static HTML/CSS/JS
- Backend: Node.js/Express
- Database: JSON files (transitioning to proper DB)
- Security: OWASP compliance focus
- Quality: Codacy enforcement

### File Organization

```text
/HexTrackr/
├── docs-source/ (documentation source)
├── scripts/ (automation tools)
├── .github/instructions/ (AI behavior)
├── systeminfo.json (project state)
└── [application files]
```

## COMMUNICATION STYLE

- **BE PRECISE**: Specific file names and line numbers
- **BE PROACTIVE**: Anticipate issues and suggest solutions
- **BE SYSTEMATIC**: Follow the established pattern always
- **BE TRANSPARENT**: Explain what you're doing and why
- **BE EFFICIENT**: Minimize back-and-forth through clear planning

## TROUBLESHOOTING PROTOCOLS

### Codacy MCP Issues

1. **Reset MCP** in extension
2. **Check GitHub settings**: Settings > Copilot > Enable MCP servers
3. **Organization settings**: <https://github.com/organizations/{org}/settings/copilot/features>
4. **Contact Codacy support** if issues persist

### Quality Assurance Failures

1. **Never bypass** Codacy analysis
2. **Fix immediately** or revert changes
3. **Document** any exceptions with user approval
4. **Update compliance tracking** with resolution

---

**Remember**: This workflow ensures consistency, quality, and maintainability. Every deviation requires
explicit user approval and documentation of the exception. Codacy compliance is non-negotiable.
