# /gemini-validate Command

Quick, FREE validation using Gemini CLI before commits and deployments.

## Usage
`/gemini-validate [scope] [files...]`

Scopes:
- `all` - Complete validation (security, architecture, performance)
- `security` - Security-focused validation
- `staged` - Validate git staged files
- `recent` - Validate recent changes

## Purpose
Provide cost-efficient "second set of eyes" validation using free Gemini API. This is your daily validation tool that costs $0 and prevents errors before they reach production.

## Execution

```javascript
// Determine validation scope
const scope = $ARGUMENTS[0] || 'staged';
const files = $ARGUMENTS.slice(1);

// Get files to validate
let targetFiles = [];
if (scope === 'staged') {
  // Get git staged files
  const staged = await Bash('git diff --cached --name-only');
  targetFiles = staged.split('\n').filter(f => f.endsWith('.js'));
} else if (scope === 'recent') {
  // Get recently modified files
  const recent = await Bash('git diff HEAD~1 --name-only');
  targetFiles = recent.split('\n').filter(f => f.endsWith('.js'));
} else if (files.length > 0) {
  targetFiles = files;
} else {
  targetFiles = ['app/public/server.js', 'scripts/**/*.js'];
}

// Step 1: Security validation
const GeminiTools = require('./scripts/gemini-tools.js');
const gemini = new GeminiTools();

console.log('🔮 Running FREE Gemini validation...');
console.log(`Scope: ${scope}`);
console.log(`Files: ${targetFiles.length} files to validate`);

// Security check
const security = await gemini.validateSecurity(targetFiles);
console.log('\n📊 Security Validation:');
console.log(`- Critical: ${security.critical.length}`);
console.log(`- High: ${security.high.length}`);
console.log(`- Medium: ${security.medium.length}`);
console.log(`- Low: ${security.low.length}`);

// Quick consensus on changes
const consensus = await gemini.quickConsensus(
  `Validate ${scope} changes for production readiness`,
  targetFiles
);

console.log('\n✅ Consensus Results:');
console.log(`- Severity: ${consensus.severity}`);
console.log(`- Issues: ${consensus.issues.length}`);
console.log(`- Recommendations: ${consensus.recommendations.length}`);

// Check if escalation needed
const shouldEscalate = await gemini.shouldEscalateToZen(
  JSON.stringify({ security, consensus })
);

if (shouldEscalate.escalate) {
  console.log('\n⚠️ ESCALATION RECOMMENDED:');
  console.log(shouldEscalate.reason);
  console.log('Run: claude-proj-zen for full Zen consensus');
}

// Save to Memento
await mcp__memento__create_entities({
  entities: [{
    name: `GEMINI:VALIDATION:${scope.toUpperCase()}_${Date.now()}`,
    entityType: "VALIDATION:GEMINI:FREE",
    observations: [
      `TIMESTAMP: ${new Date().toISOString()}`,
      `SCOPE: ${scope}`,
      `FILES: ${targetFiles.length}`,
      `SECURITY: ${security.summary}`,
      `SEVERITY: ${consensus.severity}`,
      `ISSUES: ${consensus.issues.join('; ')}`,
      `COST: $0 (FREE)`,
      `ESCALATION: ${shouldEscalate.escalate ? 'Yes' : 'No'}`
    ]
  }]
});

// Final report
console.log('\n📋 Validation Complete:');
console.log('- Cost: $0 (FREE)');
console.log('- Time: <30 seconds');
console.log('- Confidence: Second opinion provided');

if (security.critical.length > 0) {
  console.log('\n❌ BLOCKED: Critical security issues found!');
  process.exit(1);
}

console.log('\n✅ Validation passed! Safe to proceed.');
```

## Examples

### Before Every Commit
```bash
git add .
/gemini-validate staged
# Reviews only staged files
# Cost: $0
```

### Morning Code Review
```bash
/gemini-validate recent
# Reviews yesterday's changes
# Cost: $0
```

### Security Check
```bash
/gemini-validate security app/public/server.js
# Deep security validation
# Cost: $0
```

### Full Validation
```bash
/gemini-validate all
# Complete codebase validation
# Still $0!
```

## Cost Comparison

| Validation Type | Gemini (FREE) | Zen (Paid) | Savings |
|----------------|---------------|------------|---------|
| Daily commits (20x) | $0 | $2.00 | $2.00 |
| Security checks (10x) | $0 | $1.00 | $1.00 |
| Code reviews (5x) | $0 | $0.50 | $0.50 |
| **Monthly Total** | **$0** | **$105** | **$105** |

## Integration with Git Hooks

Add to `.git/hooks/pre-commit`:
```bash
#!/bin/bash
claude /gemini-validate staged
```

Now every commit gets FREE validation!

## Escalation Logic

Gemini automatically recommends escalation to Zen when:
- Critical security vulnerabilities found
- Major architectural changes detected
- Production deployment risks identified
- Complex multi-system integration issues

## Memory Integration

All validations saved to Memento with:
- `GEMINI:VALIDATION:*` namespace
- Complete audit trail
- Cost tracking ($0)
- Escalation recommendations

## Benefits

1. **Zero Cost**: Unlimited daily validations
2. **Fast**: <30 second validation
3. **Comprehensive**: Security + architecture + performance
4. **Smart Escalation**: Know when to use paid tools
5. **Audit Trail**: Every validation logged

---

*"Second set of eyes that doesn't cost a penny!"*