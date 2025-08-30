# .rMemory Scribes System

The **Scribes System** is a standardized approach to memory processing within HexTrackr's .rMemory architecture. It provides two complementary analysis modes for different use cases and performance requirements.

## Overview

The scribes system consists of specialized analysis tools that process VS Code chat sessions and development activities to extract insights and maintain project memory.

## Architecture

```
.rMemory/scribes/
├── deep-chat-analysis.js      # High-quality retrospective analysis
├── real-time-analysis.js      # Fast continuous monitoring
├── frustration-matrix.js      # Pain point analysis and learning
└── README.md                  # Comprehensive system documentation
```

## Scribes

### Deep Chat Analysis Scribe

**File**: `deep-chat-analysis.js`  
**Purpose**: High-quality retrospective analysis using Claude Opus  
**Model**: `claude-3-opus-20240229`  
**Mode**: Batch processing for comprehensive insights

**Features**:

- Maximum quality analysis using Claude Opus
- Comprehensive insight extraction
- Detailed memory reconstruction
- Batch processing for thoroughness
- Rich structured output

**Use Cases**:

- End-of-day memory consolidation
- Project milestone analysis
- Deep code archaeology
- Comprehensive project understanding

**Usage**:

```bash

# Single analysis run

node .rMemory/scribes/deep-chat-analysis.js

# Via AppleScript launcher (background execution)

osascript .rMemory/launchers/launch-archaeology-terminal.applescript
```

### Real-time Analysis Scribe

**File**: `real-time-analysis.js`  
**Purpose**: Fast continuous analysis using Ollama  
**Model**: `llama3.1` (or available Ollama model)  
**Mode**: Continuous monitoring with real-time insights

**Features**:

- Low-latency processing
- Continuous monitoring (30-second intervals)
- Real-time development context
- Live activity detection
- Efficient batch processing

**Use Cases**:

- Active development monitoring
- Real-time context awareness
- Live insights during coding sessions
- Continuous memory updates

**Usage**:

```bash

# Single analysis run (2)

node .rMemory/scribes/real-time-analysis.js

# Continuous monitoring mode

node .rMemory/scribes/real-time-analysis.js --monitor
```

### Frustration Matrix Scribe

**File**: `frustration-matrix.js`  
**Purpose**: Pain point analysis and learning from frustrations  
**Model**: `claude-3-opus-20240229`  
**Mode**: Specialized frustration pattern analysis

**Features**:

- Identifies and categorizes development frustrations
- Analyzes recurring pain points and blockers
- Tracks productivity impact and time lost
- Generates prevention strategies
- Creates institutional memory of what causes problems
- Builds frustration matrix reports for learning

**Use Cases**:

- Understanding what slows down development
- Identifying recurring frustration patterns
- Building knowledge to prevent repeated issues
- Improving development workflows
- Training gap analysis

**Usage**:

```bash

# Analyze frustrations across all sessions

node .rMemory/scribes/frustration-matrix.js
```

## Terminology Standards

### Scribes vs Tools

- **Scribes**: Specialized analysis components with specific AI models and purposes
- **Tools**: Utility functions and supporting infrastructure

### Analysis Types

- **Deep Analysis**: High-quality, comprehensive retrospective processing
- **Real-time Analysis**: Fast, continuous monitoring and immediate insights

### Processing Modes

- **Retrospective**: Complete analysis of historical data
- **Live/Real-time**: Continuous monitoring of current activity

## Integration Points

### .rMemory Core Integration

Both scribes integrate with the core .rMemory system:

- Read from VS Code chat history
- Output to `.rMemory/docs/ops/` directories
- Support Memento MCP bridge architecture
- Maintain SQLite symbol indexing compatibility

### Model Selection

- **Claude Opus**: For maximum quality and comprehensive analysis
- **Ollama Models**: For speed and continuous processing
- **Automatic Fallback**: Real-time scribe adapts to available Ollama models

### Output Formats

- **Deep Analysis**: Structured markdown reports with comprehensive insights
- **Real-time Analysis**: JSONL streaming format for continuous monitoring

## Configuration

### Environment Requirements

- **Deep Analysis**: Requires `ANTHROPIC_API_KEY` environment variable
- **Real-time Analysis**: Requires local Ollama installation and running service

### Model Configuration

```javascript
// Deep Analysis
this.model = "claude-3-opus-20240229";
this.batchSize = 1; // Quality over speed

// Real-time Analysis  
this.model = "llama3.1"; // Or auto-detected
this.batchSize = 5; // Speed over individual quality
```

## Monitoring and Logging

### Deep Analysis Logging

- Comprehensive progress logs
- Batch processing status
- Memory reconstruction progress
- Error handling with context

### Real-time Analysis Logging

- Activity detection logs
- Continuous monitoring status
- Model availability checks
- Performance metrics

## Best Practices

### When to Use Deep Analysis

- End of development sessions
- Project milestone reviews
- Complex problem analysis
- Memory archaeology needs

### When to Use Real-time Analysis

- Active development sessions
- Continuous context awareness
- Live collaboration monitoring
- Real-time decision support

### Performance Considerations

- **Deep Analysis**: Higher API costs, longer processing time, maximum quality
- **Real-time Analysis**: Local processing, minimal latency, good enough quality

## Future Extensions

The scribes system is designed for extensibility:

- Additional AI model integrations
- Specialized analysis types
- Custom processing workflows
- Enhanced output formats

## Maintenance

### Updates

- Model version updates
- Performance optimizations
- Feature enhancements
- Integration improvements

### Monitoring

- API usage tracking
- Performance metrics
- Error rate monitoring
- Output quality assessment
