# HexTrackr Context Boot Sequence

This command orchestrates the three specialized context agents to perform deep, comprehensive discovery of the HexTrackr project state. Each agent can dig deeper than a monolithic approach, providing richer insights with better token efficiency.

## Usage

Simply tell Claude: "Run the go.md boot sequence" or "Execute go.md"

## Boot Sequence

### Phase 1: Temporal Context (Git & Time Analysis)
Run the `temporal-context-agent` to:
- Analyze git history across multiple time windows (4h, 24h, 7d, 30d)
- Assess branch health and divergence
- Identify file velocity and hot spots
- Discover temporal patterns and rhythms
- Detect hidden context (stashes, worktrees, notes)
- Perform risk assessment

**Expected Output**: Temporal Context Report with patterns, risks, and insights

### Phase 2: Semantic Code Discovery
Run the `semantic-discovery-agent` to:
- Verify/update Claude Context MCP index
- Discover architectural patterns and design principles
- Map feature implementations (CSV import, VPR, AG-Grid, WebSocket)
- Analyze cross-cutting concerns (error handling, security, testing)
- Map component relationships and dependencies
- Identify hot spots and code quality indicators
- Find missing implementations and technical debt

**Expected Output**: Semantic Discovery Report with architectural insights and relationships

### Phase 3: Knowledge Graph Mining
Run the `memento-insights-agent` to:
- Search sessions across multiple time windows
- Mine for critical issues and their resolutions
- Discover breakthroughs and achievements
- Analyze patterns across sessions
- Map knowledge clusters
- Identify blocked/in-progress work
- Extract cross-session insights

**Expected Output**: Memento Insights Report with patterns, issues, and recommendations

## Orchestration Instructions for Claude

When executing this boot sequence:

1. **Run agents sequentially** - Each provides context for the next
2. **Pass keywords forward** - Use discoveries from each phase to enhance subsequent searches
3. **Collect all reports** - Present summaries of each agent's findings
4. **Synthesize final context** - Combine all three reports into a unified understanding

## Advanced Options

### Quick Boot (Minimal Discovery)
- Skip Phase 3 if knowledge graph is sparse
- Limit semantic searches to 5 per category
- Focus temporal analysis on last 7 days only

### Deep Boot (Maximum Discovery)
- Add extra semantic search iterations
- Expand time windows to 90 days
- Mine knowledge graph exhaustively
- Open all critical entities for full context

### Feature-Focused Boot
- Target semantic searches on specific feature (e.g., "AG-Grid implementation")
- Narrow temporal analysis to feature branch
- Filter knowledge graph by feature-related tags

## Example Invocation Script

```markdown
I'll run the HexTrackr boot sequence using the three specialized agents:

1. First, I'll invoke temporal-context-agent for git and time analysis
2. Then, semantic-discovery-agent for deep code understanding
3. Finally, memento-insights-agent for knowledge mining
4. I'll synthesize all findings into a comprehensive project context

Starting Phase 1: Temporal Context Discovery...
[Invoke temporal-context-agent]

Starting Phase 2: Semantic Code Analysis...
[Use keywords from Phase 1 to enhance searches]
[Invoke semantic-discovery-agent]

Starting Phase 3: Knowledge Graph Mining...
[Use discoveries from Phases 1-2 to target searches]
[Invoke memento-insights-agent]

Synthesizing all discoveries...
[Combine all three reports into unified context]
```

## Benefits of This Approach

1. **Token Efficiency**: Each agent can search deeper without token concerns
2. **Parallel Processing**: Agents can be tweaked independently
3. **Richer Context**: More comprehensive discovery than single-pass approach
4. **Flexibility**: Can skip phases, rerun specific agents, or adjust depth
5. **Debugging**: Easier to identify which phase needs adjustment

## Customization

You can modify this file to:
- Change the order of phases
- Add conditional logic (e.g., skip Phase 3 on Mondays)
- Include specific search queries for your current focus
- Add project-specific discovery patterns
- Set different depth levels based on time of day

## Notes

- Each agent has specific tool permissions optimized for its task
- Agents use claude-3-5-sonnet-20241022 model for consistency
- Results are not persisted between sessions (use Memento to save important discoveries)
- Total execution time: ~2-3 minutes for full deep boot

Ready to boot? Just say "go"!