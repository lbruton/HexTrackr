# Documentation Portal Spec-Kit Integration - Data Model

**Spec**: 022-documentation-portal-spec-kit-integration  
**Created**: 2025-09-10

## Entity Definitions

### ActiveSpec

- **Purpose**: Track currently active specification
- **Storage**: File-based (`.active-spec`)
- **Format**: Plain text spec ID

### SpecTask

- **Source**: `specs/*/tasks.md` files
- **Attributes**:
  - spec_id: string
  - task_id: string (T001 format)
  - description: string
  - status: enum ['pending', 'completed']
  - is_parallel: boolean ([P] marker)

### SpecProgress

- **Calculated**: Runtime aggregation
- **Attributes**:
  - spec_id: string
  - total_tasks: number
  - completed_tasks: number
  - percentage: number
  - pending_tasks: array

## Database Schema

**Note**: This specification uses file-based storage, no database tables required.

## File Structure

```
/
├── .active-spec                    # Current active specification ID
├── hextrackr-specs/
│   └── specs/
│       └── [spec-id]/
│           ├── spec.md            # Specification document
│           ├── plan.md            # Implementation plan
│           ├── tasks.md           # Task breakdown (parsed)
│           ├── research.md        # Technical research
│           ├── data-model.md      # Data definitions
│           ├── contracts/         # API specifications
│           └── quickstart.md      # Testing guide
└── app/public/
    ├── docs-source/
    │   └── ROADMAP.md            # Auto-generated content
    └── docs-html/
        └── content/
            └── ROADMAP.html      # Generated HTML
```

## Validation Rules

1. **Active Spec**: Must match existing spec directory
2. **Task Format**: Must follow T001 pattern
3. **Status Markers**: Only [ ] or [x] valid
4. **Spec ID**: Lowercase with hyphens only

## Performance Constraints

- File reads cached during generation cycle
- No real-time file watching (regeneration required)
- Parse once, use multiple times pattern

## Integration Mappings

### Input Sources

- `.active-spec` → Active specification ID
- `specs/*/tasks.md` → Task status and progress
- `CHANGELOG.md` → Version information

### Output Targets

- `ROADMAP.md` → Specification progress table
- `CHANGELOG.html` → Active spec banner
- `footer.html` → Version badge

## Data Flow

1. **Read Phase**: Collect spec data from files
2. **Parse Phase**: Extract task status
3. **Calculate Phase**: Compute progress percentages
4. **Generate Phase**: Create markdown/HTML output
5. **Inject Phase**: Add active spec banner

## Notes

- No database required for this specification
- All data derived from existing markdown files
- File-based approach chosen for simplicity
- Real-time updates not required (static generation)
