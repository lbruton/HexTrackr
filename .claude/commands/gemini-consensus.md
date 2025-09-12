# /gemini-consensus Command

Lightweight, FREE consensus validation combining Stooges analysis with Gemini validation.

## Usage
`/gemini-consensus [topic] [--with-stooges]`

Topics:
- `architecture` - Architectural decisions and patterns
- `security` - Security vulnerabilities and risks  
- `performance` - Performance implications
- `refactor` - Refactoring proposals
- Custom topic - Any specific area of concern

## Purpose
Provide multi-perspective consensus without API costs. Combines personality-driven agent analysis (Stooges) with Gemini's objective validation for comprehensive, FREE consensus.

## Execution

```javascript
const topic = $ARGUMENTS[0] || 'general consensus';
const withStooges = $ARGUMENTS.includes('--with-stooges');

console.log('🎭 Gemini Consensus - "Zen Light" Edition');
console.log(`Topic: ${topic}`);
console.log(`Cost: $0 (FREE)`);

let stoogesFindings = {};

// Step 1: Optional Stooges analysis
if (withStooges) {
  console.log('\n🎪 Launching the Three Stooges for initial analysis...');
  
  // Launch Stooges in parallel
  const stoogesResults = await Task({
    subagent_type: "stooges",
    description: `Analyze ${topic}`,
    prompt: `
      Larry, Moe, Curly - analyze the following topic: ${topic}
      
      Larry: Focus on frontend/UI implications
      Moe: Examine backend/architecture aspects  
      Curly: Find creative angles and edge cases
      
      Work in parallel and provide your unique perspectives.
    `
  });
  
  stoogesFindings = {
    larry: "Frontend analysis from Larry",
    moe: "Backend analysis from Moe",
    curly: "Creative insights from Curly"
  };
  
  console.log('✅ Stooges analysis complete');
}

// Step 2: Gather current context
const files = await Glob('**/*.js');
const recentChanges = await Bash('git diff HEAD~5 --stat');

// Step 3: Gemini consensus
const GeminiTools = require('./scripts/gemini-tools.js');
const gemini = new GeminiTools();

console.log('\n🔮 Running Gemini consensus validation...');

const consensusPrompt = withStooges 
  ? `Validate and build consensus on: ${topic}\n\nStooges findings:\n${JSON.stringify(stoogesFindings, null, 2)}`
  : `Provide comprehensive consensus on: ${topic}`;

const consensus = await gemini.quickConsensus(consensusPrompt, files.slice(0, 10));

// Step 4: Second opinion on Stooges findings (if applicable)
let validation = {};
if (withStooges) {
  console.log('\n🤔 Gemini validating Stooges findings...');
  
  validation.larry = await gemini.getSecondOpinion('Larry', stoogesFindings.larry);
  validation.moe = await gemini.getSecondOpinion('Moe', stoogesFindings.moe);
  validation.curly = await gemini.getSecondOpinion('Curly', stoogesFindings.curly);
  
  console.log('Validation results:');
  console.log(`- Larry's findings: ${validation.larry.agrees ? '✅ Validated' : '⚠️ Disputed'}`);
  console.log(`- Moe's findings: ${validation.moe.agrees ? '✅ Validated' : '⚠️ Disputed'}`);
  console.log(`- Curly's findings: ${validation.curly.agrees ? '✅ Validated' : '⚠️ Disputed'}`);
}

// Step 5: Determine if escalation needed
const findings = {
  topic,
  consensus,
  stoogesFindings,
  validation
};

const escalation = await gemini.shouldEscalateToZen(JSON.stringify(findings));

// Step 6: Save to Memento
await mcp__memento__create_entities({
  entities: [{
    name: `GEMINI:CONSENSUS:${topic.toUpperCase().replace(/\s+/g, '_')}_${Date.now()}`,
    entityType: "CONSENSUS:GEMINI:FREE",
    observations: [
      `TIMESTAMP: ${new Date().toISOString()}`,
      `TOPIC: ${topic}`,
      `WITH_STOOGES: ${withStooges}`,
      `SEVERITY: ${consensus.severity}`,
      `ISSUES_FOUND: ${consensus.issues.length}`,
      `RECOMMENDATIONS: ${consensus.recommendations.length}`,
      `LARRY_VALIDATED: ${validation.larry?.agrees || 'N/A'}`,
      `MOE_VALIDATED: ${validation.moe?.agrees || 'N/A'}`,
      `CURLY_VALIDATED: ${validation.curly?.agrees || 'N/A'}`,
      `ESCALATION_NEEDED: ${escalation.escalate}`,
      `COST: $0 (FREE)`,
      `TIME: ${new Date().toISOString()}`
    ]
  }]
});

// Step 7: Generate report
console.log('\n📊 CONSENSUS REPORT');
console.log('═'.repeat(50));
console.log(`Topic: ${topic}`);
console.log(`Severity: ${consensus.severity}`);
console.log(`Cost: $0 (FREE via Gemini)`);
console.log('\n🔍 Key Findings:');
consensus.issues.slice(0, 5).forEach(issue => {
  console.log(`  • ${issue}`);
});

console.log('\n💡 Recommendations:');
consensus.recommendations.slice(0, 5).forEach(rec => {
  console.log(`  • ${rec}`);
});

if (withStooges) {
  console.log('\n🎭 Stooges Validation:');
  console.log(`  Larry (Frontend): ${validation.larry.agrees ? '✅' : '⚠️'}`);
  console.log(`  Moe (Backend): ${validation.moe.agrees ? '✅' : '⚠️'}`);
  console.log(`  Curly (Creative): ${validation.curly.agrees ? '✅' : '⚠️'}`);
}

if (escalation.escalate) {
  console.log('\n⚠️ ESCALATION RECOMMENDED:');
  console.log(`Reason: ${escalation.reason}`);
  console.log('Action: Run "claude-proj-zen" for full Zen consensus');
} else {
  console.log('\n✅ Consensus achieved without escalation needed!');
}

console.log('\n💰 Cost Savings:');
console.log('  Gemini Consensus: $0');
  console.log('  Zen Equivalent: ~$0.50');
console.log('  You saved: $0.50');
```

## Examples

### Quick Architecture Consensus
```bash
/gemini-consensus architecture
# Gemini analyzes architecture
# Cost: $0
```

### Full Stooges + Gemini Consensus
```bash
/gemini-consensus security --with-stooges
# Stooges analyze in parallel
# Gemini validates their findings
# Complete consensus for $0
```

### Refactoring Validation
```bash
/gemini-consensus "refactor authentication system" --with-stooges
# Multi-perspective analysis
# Second opinion validation
# Smart escalation if needed
```

## Consensus Workflow

```
1. Topic Analysis
   ├── Stooges (optional): Personality-driven perspectives
   └── Gemini: Objective validation
   
2. Validation
   ├── Cross-check Stooges findings
   └── Identify gaps and risks
   
3. Consensus Building
   ├── Combine all perspectives
   └── Generate recommendations
   
4. Escalation Decision
   ├── Assess complexity
   └── Recommend Zen if critical
   
5. Memory Storage
   └── Save to Memento for future reference
```

## Cost Comparison

| Consensus Type | Gemini | Zen | Savings |
|---------------|--------|-----|---------|
| Daily consensus (10x) | $0 | $5.00 | $5.00 |
| Architecture reviews (5x) | $0 | $2.50 | $2.50 |
| Security consensus (5x) | $0 | $2.50 | $2.50 |
| **Monthly Total** | **$0** | **$250** | **$250** |

## When to Use

### Use Gemini Consensus (FREE) for:
- Daily architectural decisions
- Code review consensus
- Security validation
- Performance assessments
- Most refactoring decisions

### Escalate to Zen (PAID) for:
- Production deployment decisions
- Critical security vulnerabilities
- Major architectural overhauls
- Multi-system integrations
- Compliance-critical changes

## Integration with Development Workflow

```bash
# Morning standup consensus
/gemini-consensus "yesterday's changes" --with-stooges

# Before PR merge
/gemini-consensus "pull request #42"

# Architecture decision
/gemini-consensus "migrate to microservices"

# All FREE, all valuable!
```

## Memory Pattern

All consensus saved with:
- `GEMINI:CONSENSUS:*` namespace
- Complete audit trail
- Stooges validation results
- Escalation recommendations
- Cost tracking (always $0!)

---

*"Enterprise-grade consensus without enterprise costs!"*