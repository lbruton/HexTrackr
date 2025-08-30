# .rMemory Automated Import Workflow Design

## Overview

The automated memory import system runs on multiple time intervals to capture different types of insights:

## Import Intervals & Purposes

### 1. **Real-time Monitor** (30 seconds)

- **Purpose**: Capture immediate context changes
- **Scribe**: `real-time-analysis.js`
- **Data**: Current session activity, immediate insights
- **Action**: Add to memory queue for light processing

### 2. **Frequent Import** (5 minutes)

- **Purpose**: Process accumulated real-time insights
- **Scribe**: `memory-importer.js`
- **Data**: Memory queue items, recent chat updates
- **Action**: Import to Memento MCP for immediate availability

### 3. **Deep Analysis** (1 hour)

- **Purpose**: Comprehensive chat analysis and learning
- **Scribe**: `deep-chat-analysis.js`
- **Data**: Full chat sessions, architectural decisions
- **Action**: Generate high-quality memories and patterns

### 4. **Frustration Analysis** (Daily)

- **Purpose**: Learn from pain points and generate prevention strategies
- **Scribe**: `frustration-matrix.js`
- **Data**: Development frustrations, recurring issues
- **Action**: Create prevention strategies and searchable knowledge

## Workflow Integration

### Memory Queue System

```text
.rMemory/docs/ops/memory-queue/
├── real-time/           # 30-second insights
├── chat-updates/        # 5-minute chat processing
├── deep-analysis/       # Hourly comprehensive analysis
└── frustration-data/    # Daily pain point learning
```

### Processing Pipeline

1. **Real-time Scribe** → Adds to memory queue
2. **Memory Importer** → Processes queue → Uploads to Memento
3. **Deep Analysis** → Generates comprehensive insights
4. **Agent Context Loader** → Creates daily briefings

## Automated Execution

### Launcher Scripts

- `launch-real-time-monitor.sh` → Runs continuously in background
- `launch-memory-import.sh` → Cron job every 5 minutes
- `launch-deep-analysis.sh` → Hourly analysis
- `launch-frustration-analysis.sh` → Daily learning

### Cron Configuration

```bash

# .rMemory automated processing

*/5 * * * * /path/to/launch-memory-import.sh
0 * * * * /path/to/launch-deep-analysis.sh
0 2 * * * /path/to/launch-frustration-analysis.sh
```

## Benefits

### Immediate Context (30s/5min)

- Never lose current session context
- Immediate availability in next chat
- Real-time sprint status updates

### Deep Learning (1hr/daily)

- Comprehensive architectural insights
- Frustration prevention strategies
- Quality pattern recognition

### Perfect Continuity

- Always current project state
- Zero context loss between sessions
- Proactive issue prevention
- Complete development history
