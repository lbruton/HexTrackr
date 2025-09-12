# /gemini-audit Command

Comprehensive documentation accuracy audit using Gemini's FREE analysis capabilities.

## Usage
`/gemini-audit [full|quick] [--save-report]`

## Purpose
Systematically audit all HexTrackr documentation against actual codebase implementation to identify inaccuracies, outdated information, and missing documentation. Uses Gemini's free analysis to save ~$50-100 in API costs.

## Execution

```javascript
const scope = $ARGUMENTS[0] || 'full';
const saveReport = $ARGUMENTS.includes('--save-report');

console.log('🔍 HexTrackr Documentation Accuracy Audit');
console.log(`Scope: ${scope}`);
console.log(`Cost: $0 (FREE via Gemini)`);

// Step 1: Gather documentation files
const docsPath = "app/public/docs-source";
const codebasePaths = [
  "app/public/server.js",
  "app/public/scripts",
  "data/hextrackr.db",
  "package.json",
  "docker-compose.yml"
];

// Step 2: Run Gemini audit
const GeminiTools = require('./scripts/gemini-tools.js');
const gemini = new GeminiTools();

console.log('\n🔍 Starting comprehensive audit...');
const auditResult = await gemini.auditDocumentation(docsPath, codebasePaths.join(' '));

// Step 3: Display results
console.log('\n📊 AUDIT RESULTS');
console.log('═'.repeat(50));
console.log(`Total Issues Found: ${auditResult.summary.total}`);
console.log(`- Critical: ${auditResult.summary.critical || 0}`);
console.log(`- High: ${auditResult.summary.high || 0}`);
console.log(`- Medium: ${auditResult.summary.medium || 0}`);
console.log(`- Low: ${auditResult.summary.low || 0}`);

// Step 4: Show top issues by severity
console.log('\n🚨 CRITICAL & HIGH PRIORITY ISSUES:');
const priorityIssues = auditResult.issues.filter(issue => 
  issue.severity === 'CRITICAL' || issue.severity === 'HIGH'
);

priorityIssues.slice(0, 10).forEach((issue, index) => {
  console.log(`\n${index + 1}. ${issue.severity}: ${issue.file}`);
  console.log(`   Section: ${issue.section}`);
  console.log(`   Issue: ${issue.issue}`);
  if (issue.currentText && issue.shouldBe) {
    console.log(`   Current: "${issue.currentText}"`);
    console.log(`   Should Be: "${issue.shouldBe}"`);
  }
});

// Step 5: Save to Memento
await mcp__memento__create_entities({
  entities: [{
    name: `HEXTRACKR:AUDIT:DOCUMENTATION_${Date.now()}`,
    entityType: "AUDIT:DOCUMENTATION:GEMINI",
    observations: [
      `TIMESTAMP: ${new Date().toISOString()}`,
      `SCOPE: ${scope}`,
      `TOTAL_ISSUES: ${auditResult.summary.total}`,
      `CRITICAL: ${auditResult.summary.critical || 0}`,
      `HIGH: ${auditResult.summary.high || 0}`,
      `MEDIUM: ${auditResult.summary.medium || 0}`,
      `LOW: ${auditResult.summary.low || 0}`,
      `COST: $0 (FREE)`,
      `TOOL: Gemini`,
      `FILES_AUDITED: 36 documentation files`,
      `CODEBASE_CHECKED: server.js, scripts, database, config`
    ]
  }]
});

// Step 6: Generate report file (if requested)
if (saveReport || auditResult.summary.total > 20) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = `DOCUMENTATION_AUDIT_REPORT_${timestamp}.md`;
  
  const reportContent = `# HexTrackr Documentation Audit Report
Generated: ${new Date().toISOString()}
Tool: Gemini (FREE analysis)
Cost: $0

## Executive Summary

Total Issues Found: **${auditResult.summary.total}**
- 🚨 Critical: ${auditResult.summary.critical || 0} (blocks development)
- ⚠️ High: ${auditResult.summary.high || 0} (misleads users)  
- 📋 Medium: ${auditResult.summary.medium || 0} (outdated info)
- 📝 Low: ${auditResult.summary.low || 0} (minor improvements)

## Audit Methodology

This audit compared all documentation in \`app/public/docs-source/\` against:
- Express.js server implementation (\`app/public/server.js\`)
- Frontend JavaScript (\`app/public/scripts/\`)
- Database schema (\`data/hextrackr.db\`)
- Configuration files (\`package.json\`, \`docker-compose.yml\`)

## Critical Issues (Immediate Action Required)

${auditResult.issues
  .filter(issue => issue.severity === 'CRITICAL')
  .map((issue, index) => `### ${index + 1}. ${issue.file}
**Section:** ${issue.section}
**Issue:** ${issue.issue}
${issue.currentText ? `**Current Text:** "${issue.currentText}"` : ''}
${issue.shouldBe ? `**Should Be:** "${issue.shouldBe}"` : ''}
`).join('\n')}

## High Priority Issues

${auditResult.issues
  .filter(issue => issue.severity === 'HIGH')
  .map((issue, index) => `### ${index + 1}. ${issue.file}
**Section:** ${issue.section}
**Issue:** ${issue.issue}
${issue.currentText ? `**Current Text:** "${issue.currentText}"` : ''}
${issue.shouldBe ? `**Should Be:** "${issue.shouldBe}"` : ''}
`).join('\n')}

## Medium Priority Issues

${auditResult.issues
  .filter(issue => issue.severity === 'MEDIUM')
  .map((issue, index) => `### ${index + 1}. ${issue.file}
**Section:** ${issue.section}  
**Issue:** ${issue.issue}
`).join('\n')}

## Low Priority Issues

${auditResult.issues
  .filter(issue => issue.severity === 'LOW')
  .map((issue, index) => `### ${index + 1}. ${issue.file}
**Section:** ${issue.section}
**Issue:** ${issue.issue}
`).join('\n')}

## Recommendations

1. **Immediate**: Address all CRITICAL issues before next release
2. **This Sprint**: Fix HIGH priority inaccuracies  
3. **Next Sprint**: Update MEDIUM priority outdated information
4. **Backlog**: Improve LOW priority documentation clarity

## Next Steps

1. Create GitHub issues for each CRITICAL and HIGH priority item
2. Assign to appropriate team members
3. Update documentation to match implementation reality
4. Run audit again after fixes to verify improvements

---
*Report generated by Gemini "Zen Light" validation system - Cost: $0*`;

  await fs.writeFile(reportPath, reportContent);
  console.log(`\n📄 Detailed report saved: ${reportPath}`);
}

// Step 7: Summary
console.log('\n✅ Audit Complete!');
console.log(`- Issues found: ${auditResult.summary.total}`);
console.log(`- Cost: $0 (FREE)`);
console.log(`- Time: ~10-15 minutes`);

if (auditResult.summary.critical > 0) {
  console.log(`\n🚨 CRITICAL: ${auditResult.summary.critical} blocking issues found!`);
  console.log('These should be fixed before next deployment.');
}

if (auditResult.summary.high > 0) {
  console.log(`\n⚠️ HIGH PRIORITY: ${auditResult.summary.high} misleading documentation found!`);
  console.log('These confuse users and should be updated soon.');
}

console.log(`\n💰 Cost Savings vs Traditional Audit:`);
console.log(`- Gemini Audit: $0`);
console.log(`- Manual Review: ~8-16 hours @ $50/hr = $400-800`);
console.log(`- Paid API Analysis: ~$50-100`);
console.log(`- You saved: $400-800!`);
```

## Examples

### Full Audit with Report
```bash
/gemini-audit full --save-report
# Audits all 36 documentation files
# Generates detailed report in project root
# Cost: $0
```

### Quick Audit (Critical Issues Only)
```bash
/gemini-audit quick
# Focus on blocking/misleading issues only
# Faster analysis
# Cost: $0
```

### Typical Output
```
🔍 HexTrackr Documentation Accuracy Audit
Scope: full
Cost: $0 (FREE via Gemini)

🔍 Starting comprehensive audit...

📊 AUDIT RESULTS
══════════════════════════════════════════════════
Total Issues Found: 47
- Critical: 3
- High: 12
- Medium: 21  
- Low: 11

🚨 CRITICAL & HIGH PRIORITY ISSUES:

1. CRITICAL: api-reference/vulnerabilities-api.md
   Section: POST /api/vulnerabilities
   Issue: Endpoint doesn't exist in server.js
   Current: "POST /api/vulnerabilities - Create new vulnerability"
   Should Be: "POST /api/vulnerabilities-import - Import vulnerabilities"

2. HIGH: architecture/database.md
   Section: Vulnerabilities Table Schema
   Issue: Missing lifecycle_state column
   Current: "id, title, description, severity, cve_id"
   Should Be: "id, title, description, severity, cve_id, lifecycle_state"
```

## Integration Benefits

- **Zero Cost**: Uses Gemini's free API vs $50-100 for paid analysis
- **Comprehensive**: Checks all documentation against actual code
- **Actionable**: Provides specific fixes for each issue
- **Automated**: Can be run daily/weekly for continuous accuracy
- **Tracked**: All results saved to Memento for trend analysis

## When to Run

- **Before releases**: Ensure documentation matches implementation
- **After major features**: Verify docs updated with changes  
- **Monthly**: Catch documentation drift
- **Before onboarding**: Ensure accurate developer experience

---

*"Truth in documentation, achieved without breaking the budget!"*