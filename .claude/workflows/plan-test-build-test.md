# Plan-Test-Build-Test Workflow Templates

Standard workflow patterns for agent coordination with Zen MCP integration and quality gates.

## Core Workflow Pattern (All Agents)

```

1. RECEIVE → Memento save + Git backup + TodoWrite
2. PLAN → Zen analyze/testgen + agent domain validation  
3. PRE-TEST → Testing-specialist creates & runs baseline tests
4. BUILD → Agent executes with minimal permissions (analysis/recommendations)
5. POST-TEST → Testing-specialist validates changes
6. SUBMIT → Quality gates (Codacy, ref.tools) + return to user

```

## Multi-AI Orchestration Templates

### Zen MCP vs CLI Orchestrator Decision Matrix

**Use Zen MCP (Cloud Models) for**:

```javascript
zen analyze --model o3          // Complex reasoning, architecture analysis
zen consensus --models "o3,grok,claude"  // Multi-model consensus
zen secaudit --model grok       // Web-aware security research
```

**Use local-cli-orchestrator for**:

```javascript
Task(local-cli-orchestrator): "Research generic design patterns via Gemini CLI"
Task(local-cli-orchestrator): "Generate sanitized test patterns via Codex CLI"
// Privacy-sensitive analysis, local file processing
```

### Parallel Multi-AI Execution Patterns

**Comprehensive Analysis Workflow**:

```javascript
// Launch multiple AI analyses simultaneously
const zen_task = zen.analyze({model: "o3", focus: "architecture"})
const gemini_task = Task(local-cli-orchestrator): "Research [sanitized_topic] via Gemini CLI"
const codex_task = Task(local-cli-orchestrator): "Generate test patterns via Codex CLI"

// Use background execution for long-running tasks
Bash("zen analyze --comprehensive", {run_in_background: true, timeout: 600000})
Bash("Task local-cli-orchestrator: 'Extended research task'", {run_in_background: true})

// Monitor and collect results
BashOutput(zen_task_id)
BashOutput(orchestrator_task_id)
```

**Multi-Model Consensus Building**:

```javascript
// Get perspectives from different AI systems
zen_perspective = zen.consensus({models: "o3,grok", question: "[sanitized_question]"})
local_perspective = Task(local-cli-orchestrator): "Get Gemini+Codex perspective on [sanitized_question]"

// Synthesize final recommendation
```

## Agent Handoff Templates

### Enhanced UI Enhancement Workflow

## Step 1: Multi-AI Research Phase

```javascript
// Save user request to Memento
mcp__memento-mcp__create_entities([{
  name: "UI Enhancement Request - [Date]",
  entityType: "ui_development",
  observations: ["User request: [details]", "Expected outcome: [goals]"]
}])

// Launch UI analysis
Task(ui-design-specialist): "Analyze UI enhancement request: [user_request]"
```

## Step 2: UI Agent Planning Phase

```javascript
// Zen MCP analysis
zen analyze --type architecture --focus ui_components
zen testgen --focus ui_interactions --model flash

// Create test scenarios for testing-specialist
Task(testing-specialist): "Execute baseline UI tests: [scenarios from Zen testgen]"
```

## Step 3: Testing Agent Baseline

```bash

# Docker environment setup

docker-compose restart

# Execute baseline tests

npx playwright test --project=baseline
ls .playwright-mcp/  # Document captured screenshots
```

## Step 4: UI Agent Implementation Planning

```javascript
// Generate recommendations (no direct code modification)
// Create detailed implementation specifications
// Document design decisions and rationale
```

## Step 5: Testing Agent Validation

```javascript
Task(testing-specialist): "Validate UI recommendations: [specific scenarios]"
// Ensure visual regression tests would pass
// Verify performance benchmarks maintained
```

### Integration Analysis Workflow

## Step 1: Integration Request

```javascript  
mcp__memento-mcp__create_entities([{
  name: "Integration Analysis - [Platform] - [Date]",
  entityType: "integration_analysis",
  observations: ["Platform: [Cisco/Tenable/etc]", "Scope: [specific requirements]"]
}])

Task(cisco-integration-specialist): "Research [platform] integration requirements"
```

## Step 2: Integration Planning

```javascript
zen planner --focus integration --model o3
zen secaudit --focus api_security

// Research via ref.tools
ref.tools search "[platform] API integration best practices 2025"
```

## Step 3: Test Scenario Generation

```javascript
zen testgen --focus integration_testing
Task(testing-specialist): "Prepare integration test environment"
```

## Quality Gate Templates

### Pre-Change Validation

```bash

# Codacy quality analysis

codacy_cli_analyze --tool eslint

# Performance benchmarks

npm run test:performance

# Security validation  

zen secaudit --comprehensive
```

### Post-Change Validation

```bash

# Complete test suite

npx playwright test
npm test

# Quality metrics comparison

codacy_cli_analyze --compare baseline

# Performance regression check

npm run test:performance --compare
```

## Background Execution Patterns

### Long-Running Agent Tasks

```javascript
// Start agent work in background
Bash("Task ui-design-specialist: 'Complex UI analysis'", {run_in_background: true, timeout: 600000})

// Continue conversation while agent works
// Check progress periodically
BashOutput(bash_id) // Monitor agent output

// Collect results when complete
Task(testing-specialist): "Validate agent recommendations"
```

### Parallel Agent Coordination

```javascript
// Launch multiple agents in parallel
const ui_task = Bash("Task ui-design-specialist: 'UI analysis'", {run_in_background: true})
const integration_task = Bash("Task cisco-integration-specialist: 'API research'", {run_in_background: true})

// Coordinate results
// Both agents feed into testing-specialist for validation
```

## Error Handling Templates

### Agent Permission Violations

```javascript
if (agent_attempted_write_operation) {
  // Log violation to Memento
  mcp__memento-mcp__create_entities([{
    name: "Permission Violation - [Agent] - [Date]",
    entityType: "security_incident",
    observations: ["Agent attempted unauthorized operation", "Action blocked"]
  }])
  
  // Redirect to analysis-only mode
  "Agent permissions restrict direct modifications. Providing recommendations instead."
}
```

### Quality Gate Failures

```javascript
if (quality_gate_failed) {
  Task(testing-specialist): "Generate failure analysis report"
  // Do not proceed with implementation
  // Return detailed failure analysis to user
}
```

## Success Metrics Tracking

### Workflow Completion Validation

```javascript
mcp__memento-mcp__create_entities([{
  name: "Workflow Completion - [Type] - [Date]",  
  entityType: "workflow_success",
  observations: [
    "All quality gates passed",
    "Zero unauthorized operations",
    "Complete test coverage achieved",
    "User approval obtained"
  ]
}])
```

## Usage Examples

### Complete UI Enhancement

```javascript
// 1. User requests UI improvements
Task(ui-design-specialist): "Enhance table responsiveness"

// 2. UI agent plans with Zen, hands off to testing
// 3. Testing agent captures baseline
// 4. UI agent generates recommendations  
// 5. Testing agent validates recommendations
// 6. Results returned to user with evidence

// Total timeline: ~10-15 minutes with background execution
```

### Integration Research Project

```javascript
// 1. User wants Cisco SecureX integration
Task(cisco-integration-specialist): "Research SecureX API integration"

// 2. Integration agent uses Zen + ref.tools for research
// 3. Testing agent prepares integration test scenarios
// 4. Complete integration specification returned
// 5. Quality gates ensure security compliance

// Total timeline: ~15-20 minutes with comprehensive research
```

This template system ensures consistent, secure, and high-quality agent coordination while maintaining the Plan-Test-Build-Test workflow integrity.
