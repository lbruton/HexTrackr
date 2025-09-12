# /stooges Command

Execute parallel research operations using Three Stooges context router agents to prevent context overflow.

## Usage
`/stooges [larry|moe|curly|shemp|all] "task"`

## Agent Mapping

**LARRY** - General Purpose Context Router
- Role: Wild-haired parallel execution worker
- Tools: ALL available (zen, ref, memento, grep, bash, etc.)
- Approach: Deep, thorough research
- Output: `LARRY_[timestamp].md`

**MOE** - General Purpose Context Router  
- Role: Bossy, organized parallel execution worker
- Tools: ALL available (zen, ref, memento, grep, bash, etc.)
- Approach: Systematic, methodical research
- Output: `MOE_[timestamp].md`

**CURLY** - General Purpose Context Router
- Role: Creative, energetic parallel execution worker
- Tools: ALL available (zen, ref, memento, grep, bash, etc.)
- Approach: Experimental, pattern-seeking research
- Output: `CURLY_[timestamp].md`

**SHEMP** - Overflow Context Router
- Role: Reliable backup and meta-analysis specialist
- Tools: ALL available + cross-stooge aggregation
- Approach: Overflow handling and result synthesis
- Output: `SHEMP_[timestamp].md`

## Execution

1. Launch requested stooge agent(s) using Task tool
2. Each agent chooses appropriate tools (zen, ref, etc.) for their approach
3. Agents write COMPLETE results to timestamped files  
4. Agents return ONLY 300-token summaries with key findings

## Key Benefits

- **Context Preservation**: Full results saved to disk, summaries returned
- **Parallel Execution**: Multiple stooges can work simultaneously
- **Tool Flexibility**: Each agent chooses best tools for the task
- **Persistent Results**: Research available for later consumption
- **Background Operations**: Continue main work while stooges research

## Example Usage

### Single Stooge
Input: `/stooges larry "analyze server.js architecture"`

Claude Code executes:
```
Task(
  subagent_type: "larry",
  description: "Analyze server architecture", 
  prompt: "analyze server.js architecture using any tools needed"
)
```

Larry chooses tools (might use zen:analyze + grep + ref), writes full results to `LARRY_20250109T160000.md`, returns:
```
✅ LARRY Research Complete
• Server is 2000+ line monolith with clear module boundaries
• PathValidator and ProgressTracker ready for extraction  
• Recommended modular monolith approach over microservices
Full: ./LARRY_20250109T160000.md
```

### Multiple Stooges  
Input: `/stooges all "research React performance patterns"`

Launches Larry, Moe, and Curly in parallel:
- Larry: Deep performance analysis
- Moe: Systematic best practices research  
- Curly: Creative optimization discoveries

All work simultaneously, return separate summaries + files.

### Overflow Handling
Input: `/stooges shemp "synthesize previous stooge research on auth"`

Shemp reads previous LARRY/MOE/CURLY files, creates meta-analysis in `SHEMP_[timestamp].md`