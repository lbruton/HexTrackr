Update an existing implementation plan while preserving technical context and progress tracking.

This command allows refinement of implementation plans when specifications change, supporting constitutional Article VII (living documents) while maintaining spec-kit compliance.

Given the spec number/name provided as an argument, do this:

1. Run the script `hextrackr-specs/scripts/update-plan.sh "$ARGUMENTS"` from repo root and parse its JSON output for status confirmation.
2. Load the updated plan.md to verify changes were applied correctly.
3. Check if the plan has NEEDS CLARIFICATION markers that require attention.
4. Recommend next steps based on the current state of the plan and related documents.

Note: The script preserves existing technical context, constitution checks, project structure, and progress tracking while updating metadata and feature references. Creates automatic backups for existing plans.

Examples:
- `/update-plan 023`
- `/update-plan 023-enhance-hextrackr-vulnerability`