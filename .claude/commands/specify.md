
Start a new feature by creating a formal specification from a refined prompt.

This is the second step in the Spec-Driven Development lifecycle (after /planspec ideation).

Given the feature description provided as an argument (typically from /planspec output), do this:

## Specification Creation
1. Run the script `hextrackr-specs/scripts/create-new-spec.sh --json "$ARGUMENTS"` from repo root and parse its JSON output for SPEC_NAME and SPEC_FILE. All file paths must be absolute.
2. Load `hextrackr-specs/templates/spec-template.md` to understand required sections.
3. Write the specification to SPEC_FILE using the template structure, ensuring:
   - Concrete metrics replace vague terms (from planspec discussion)
   - All user stories have 3+ specific acceptance criteria
   - Success criteria are measurable and testable
   - Mark any remaining unknowns with [NEEDS CLARIFICATION: specific question]
   - DO NOT guess or fill in technical details not provided

## Quality Enforcement
- Every "performance" mention must have metrics (e.g., "<500ms response")
- Every "scale" mention must have numbers (e.g., "100k records")
- Every "user" mention must identify who (e.g., "network administrators")
- Include "Context from Existing System" section if relevant
- Reference existing system components that will be affected

## Post-Specification
1. Save to Memento: Create entity "HEXTRACKR:SPEC:[number]:[name]" with key observations
2. Extract and save any architectural decisions or constraints identified
3. Report completion with spec name, spec file path, and any [NEEDS CLARIFICATION] items

Note: The script creates the spec directory and sets it as active but does NOT create any git branches. Branch management is handled manually by the user.
