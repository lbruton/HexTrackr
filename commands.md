# HexTrackr Command Reference

Simple prompts that trigger Claude to use Memento and other tools effectively.

## Memory Management Commands

### Save Commands

These commands trigger Claude to save information to Memento:

#### `/save-handoff`

**Prompt**: "Save the current session state to Memento for handoff"
**Action**: Creates `HEXTRACKR:SESSION:HANDOFF` entity with:

- Current task context
- Pending items
- Key decisions made
- Next steps

#### `/save-conversation`

**Prompt**: "Save this conversation's key points to Memento"
**Action**: Creates `HEXTRACKR:SESSION:CONVERSATION` entity with:

- Important Q&A exchanges
- Decisions made
- Solutions discovered

#### `/save-insights`

**Prompt**: "Save discoveries and insights from this session"
**Action**: Creates `HEXTRACKR:KNOWLEDGE:INSIGHTS` entity with:

- Technical discoveries
- Pattern recognitions
- Architectural decisions
- Bug fixes and solutions

### Recall Commands

These commands trigger Claude to search Memento:

#### `/recall-handoff`

**Prompt**: "Search for recent session handoffs in Memento"
**Action**: Searches for `HEXTRACKR:SESSION:HANDOFF` entities

- Returns most recent by timestamp
- Shows context and pending tasks

#### `/recall-insights`

**Prompt**: "Find relevant insights and discoveries in Memento"
**Action**: Searches `HEXTRACKR:KNOWLEDGE:*` namespace

- Uses semantic search for relevance
- Returns technical patterns and solutions

#### `/recall-conversation`

**Prompt**: "Retrieve past conversation points from Memento"
**Action**: Searches `HEXTRACKR:SESSION:CONVERSATION` entities

- Helps reconstruct past decisions
- Shows historical context

## Session Management

### `/athena`

**Type**: Script (not just a prompt)
**Purpose**: Session log management and MD file generation
**Action**: Processes Claude session logs and creates markdown documentation

## Usage Examples

```
User: /save-handoff
Claude: [Saves current session state with all context to Memento]

User: /recall-insights theme system
Claude: [Searches for theme system insights in Memento knowledge base]

User: We need to continue from yesterday. /recall-handoff
Claude: [Retrieves most recent handoff to restore context]
```

## Notes

- These are simple prompts, not complex scripts
- Claude handles the actual Memento tool usage
- All saves include ISO 8601 timestamps as first observation
- Searches use semantic mode for better relevance
