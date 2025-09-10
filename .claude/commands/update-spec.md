Update an existing specification while preserving unchanged sections and maintaining spec-kit compliance.

This command allows iterative refinement of specifications as requirements evolve, supporting Article VII of the constitution (specs as living documents).

Given the spec number/name and updated feature description provided as arguments, do this:

1. Run the script `hextrackr-specs/scripts/update-spec.sh "$SPEC" "$ARGUMENTS"` from repo root and parse its JSON output for status confirmation.
2. Load the updated spec.md to verify changes were applied correctly.
3. Check if related documents (research.md, plan.md, tasks.md) need updates based on the changes.
4. Report completion with spec name, updated sections, and recommendations for next steps.

Note: The script preserves existing user scenarios, requirements, and execution status while updating the feature description and metadata. Creates automatic backups for safety.

Examples:
- `/update-spec 023 "Enhanced vulnerability table with real-time filtering and advanced export options"`
- `/update-spec 023-enhance-hextrackr-vulnerability "Updated to include mobile responsiveness requirements"`