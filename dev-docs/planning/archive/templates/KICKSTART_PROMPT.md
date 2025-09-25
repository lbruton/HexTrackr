# HexTrackr Kickstart Prompt Templates

## Purpose

These templates ensure consistent workflow initiation that follows the mandatory HexTrackr development process. Use these exact prompts to guarantee agents follow the proper sequence: Linear Issue → SESSION_PLAN.md → Research → Implementation.

## 🚀 Primary Kickstart Prompt (Comprehensive)

```
Start HexTrackr v1.0.XX [feature/bug] work: "[Brief description]". Follow mandatory workflow: 1) Create Linear issue titled "v1.0.XX: [Name]" with team HexTrackr, 2) Create planning folder at /dev-docs/planning/active/v1.0.XX-[name]/ with SESSION_PLAN.md from template, 3) Enter Plan Mode to research using Claude-Context and Context7, documenting all findings in SESSION_PLAN.md, 4) Complete implementation plan with checkboxes before any coding, 5) Only after plan approval, create feature branch from main and begin implementation. This is a [High/Medium/Low] priority [Bug/Feature/Enhancement].
```

## 🎯 Concise Kickstart Prompt (Quick)

```
New HexTrackr work: [description]. MANDATORY: Create Linear issue "v1.0.XX: [name]", setup /dev-docs/planning/active/v1.0.XX-[name]/SESSION_PLAN.md, research in Plan Mode, complete implementation checkboxes, then exit Plan Mode for approval before any coding.
```

## 🔄 Continuation Prompt (Existing Work)

```
Continue HexTrackr work on v1.0.XX: [feature name]. Load context from /dev-docs/planning/active/v1.0.XX-[name]/SESSION_PLAN.md, check Linear issue status, review last session notes, and continue from last completed checkbox. Follow all workflow enforcement requirements.
```

## 📋 Template Variables

When using these prompts, replace the following variables:

| Variable | Example | Description |
|----------|---------|-------------|
| `[description]` | "Fix CSV import progress modal hanging" | Brief problem/feature description |
| `[name]` | "fix-csv-progress-modal" | Kebab-case feature/bug name |
| `v1.0.XX` | "v1.0.25" | Next available version number |
| `[Priority]` | "High/Medium/Low" | Issue priority level |
| `[Type]` | "Bug/Feature/Enhancement" | Issue classification |

## 🎨 Usage Examples

### Example 1: New Bug Fix
```
Start HexTrackr v1.0.25 bug work: "CSV import modal shows stale data from previous import". Follow mandatory workflow: 1) Create Linear issue titled "v1.0.25: Fix CSV Import Modal Stale Data" with team HexTrackr, 2) Create planning folder at /dev-docs/planning/active/v1.0.25-fix-csv-modal-stale-data/ with SESSION_PLAN.md from template, 3) Enter Plan Mode to research using Claude-Context and Context7, documenting all findings in SESSION_PLAN.md, 4) Complete implementation plan with checkboxes before any coding, 5) Only after plan approval, create feature branch from main and begin implementation. This is a High priority Bug.
```

### Example 2: New Feature
```
Start HexTrackr v1.0.26 feature work: "Add vulnerability risk scoring dashboard widget". Follow mandatory workflow: 1) Create Linear issue titled "v1.0.26: Vulnerability Risk Scoring Dashboard" with team HexTrackr, 2) Create planning folder at /dev-docs/planning/active/v1.0.26-risk-scoring-dashboard/ with SESSION_PLAN.md from template, 3) Enter Plan Mode to research using Claude-Context and Context7, documenting all findings in SESSION_PLAN.md, 4) Complete implementation plan with checkboxes before any coding, 5) Only after plan approval, create feature branch from main and begin implementation. This is a Medium priority Feature.
```

### Example 3: Enhancement
```
Start HexTrackr v1.0.27 enhancement work: "Improve dark mode theme color contrast for accessibility". Follow mandatory workflow: 1) Create Linear issue titled "v1.0.27: Improve Dark Mode Accessibility" with team HexTrackr, 2) Create planning folder at /dev-docs/planning/active/v1.0.27-dark-mode-accessibility/ with SESSION_PLAN.md from template, 3) Enter Plan Mode to research using Claude-Context and Context7, documenting all findings in SESSION_PLAN.md, 4) Complete implementation plan with checkboxes before any coding, 5) Only after plan approval, create feature branch from main and begin implementation. This is a Medium priority Enhancement.
```

## 🔍 Validation Checklist

After using a kickstart prompt, verify the agent:

- [ ] Created Linear issue with correct title format
- [ ] Created planning folder structure with SESSION_PLAN.md
- [ ] Entered Plan Mode for research phase
- [ ] Documented Claude-Context and Context7 research findings
- [ ] Completed implementation plan with specific checkboxes
- [ ] Called ExitPlanMode for user approval

## 📚 Reference Documentation

- **Enforcement Checklist**: `/dev-docs/planning/ENFORCEMENT_CHECKLIST.md`
- **Complete Workflow**: `/dev-docs/planning/HEXTRACKR_LINEAR_WORKFLOW.md`
- **Quick Commands**: `/dev-docs/planning/QUICK_REFERENCE.md`
- **Agent Guide**: `/AGENTS.md`

---

**These prompts are designed to prevent workflow violations and ensure consistent, documented development across all HexTrackr sessions.**