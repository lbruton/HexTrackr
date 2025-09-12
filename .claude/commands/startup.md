# /startup - HexTrackr Session Initialization

Initialize your Claude session with full HexTrackr context, including active spec, pending tasks, and recent work patterns.

## Usage

```
/startup
```

## What It Does

1. **Displays Current State**:
   - Active specification number and name
   - Pending tasks count
   - Current git branch
   - HexTrackr version

2. **Searches Recent Context**:
   - Active spec patterns in Memento
   - Recent bug fixes and solutions
   - Last session handoff (if available)

3. **Loads Configuration**:
   - Available agents and their specialties
   - Common commands for current spec
   - Constitutional requirements

4. **Provides Quick Actions**:
   - Next pending task from active spec
   - Suggested agents for task type
   - Relevant documentation links

## Implementation

```javascript
async function startup() {
  // Step 1: Check active spec
  const activeSpec = await bash("cat .active-spec 2>/dev/null || echo 'none'");
  
  // Step 2: Count pending tasks
  const pendingTasks = await bash(`grep -c "\\[ \\]" hextrackr-specs/specs/${activeSpec}/tasks.md 2>/dev/null || echo 0`);
  
  // Step 3: Get git status
  const branch = await bash("git branch --show-current");
  
  // Step 4: Get version
  const version = await bash("grep version package.json | head -1 | awk -F: '{ print $2 }' | sed 's/[\",]//g' | tr -d ' '");
  
  // Step 5: Search Memento for context
  await mcp__memento__search_nodes({
    mode: "semantic",
    query: `HexTrackr active spec ${activeSpec} recent work session handoff`,
    topK: 5
  });
  
  // Step 6: Display startup summary
  console.log(`
# HexTrackr Session Initialized

## Current State
- **Version**: ${version}
- **Branch**: ${branch}
- **Active Spec**: ${activeSpec}
- **Pending Tasks**: ${pendingTasks}

## Quick Actions
- Resume work: Review pending tasks in spec ${activeSpec}
- Check status: \`grep "\\[ \\]" hextrackr-specs/specs/${activeSpec}/tasks.md | head -5\`
- Run tests: \`npm test\` or \`npx playwright test\`
- View logs: \`docker-compose logs -f hextrackr\`

## Available Agents
- **/stooges all** - Parallel analysis with Larry, Moe, Curly
- **/security-team** - Security audit with Worf
- **/generatedocs** - Documentation pipeline
- **/specs-validate** - Constitutional compliance check

## Constitutional Reminders
- ⚠️ ALWAYS search Memento FIRST
- 📝 Work on copilot branch (NEVER main)
- ✅ Create git checkpoint before changes
- 💾 Save discoveries to Memento
  `);
  
  // Step 7: Show next task if spec is active
  if (activeSpec !== 'none') {
    const nextTask = await bash(`grep "\\[ \\]" hextrackr-specs/specs/${activeSpec}/tasks.md | head -1`);
    if (nextTask) {
      console.log(`\n## Next Task\n${nextTask}`);
    }
  }
}
```

## Example Output

```
# HexTrackr Session Initialized

## Current State
- **Version**: v1.0.12
- **Branch**: copilot
- **Active Spec**: 001-e2e-playwright-test-suite
- **Pending Tasks**: 37

## Quick Actions
- Resume work: Review pending tasks in spec 001
- Check status: `grep "\\[ \\]" hextrackr-specs/specs/001-e2e-playwright-test-suite/tasks.md | head -5`
- Run tests: `npm test` or `npx playwright test`
- View logs: `docker-compose logs -f hextrackr`

## Available Agents
- **/stooges all** - Parallel analysis with Larry, Moe, Curly
- **/security-team** - Security audit with Worf
- **/generatedocs** - Documentation pipeline
- **/specs-validate** - Constitutional compliance check

## Constitutional Reminders
- ⚠️ ALWAYS search Memento FIRST
- 📝 Work on copilot branch (NEVER main)
- ✅ Create git checkpoint before changes
- 💾 Save discoveries to Memento

## Next Task
- [ ] T014 Create authentication helper at `__tests__/utils/auth.js` with `loginAs(page, userRole)` function
```

## Benefits

1. **Instant Context**: No need to manually check multiple files
2. **Memory Integration**: Automatically searches relevant patterns
3. **Task Awareness**: Shows exactly where you left off
4. **Agent Guidance**: Suggests appropriate agents for current work
5. **Constitutional Compliance**: Reminds of critical rules

## Related Commands

- `/recall-handoff` - Load previous session state
- `/save-handoff` - Save current session state
- `/specs-validate` - Check spec compliance
- `/stooges all` - Run parallel analysis

## Notes

- Run at the start of each session for optimal context
- Integrates with Memento for pattern recognition
- Respects .active-spec for task tracking
- Works with all 11 personality-driven agents